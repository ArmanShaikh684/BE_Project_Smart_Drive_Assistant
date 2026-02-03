from datetime import datetime
import os
import time
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

import cv2
import requests
from twilio.rest import Client

from .voice_assistant import speak, listen_voice, classify_response
from .api_services import get_user_location
from .camera_manager import save_latest_frame

# Load environment variables
load_dotenv()

# ------------------ CONFIGURATION ------------------
# 1. TWILIO (For WhatsApp)
EMERGENCY_CONTACT = os.getenv("EMERGENCY_CONTACT_NAME", "Arman Shaikh")
EMERGENCY_CONTACT_NUMBER = os.getenv("EMERGENCY_CONTACT_NUMBER")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

# 2. EMAIL CONFIG
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")


# ---------------------------------------------------

def get_ngrok_url():
    """
    Returns the static Ngrok domain from .env if available.
    Otherwise, tries to auto-detect from local API (fallback).
    """
    # 1. Try Static Domain from .env first
    static_domain = os.getenv("NGROK_STATIC_DOMAIN")
    if static_domain:
        return static_domain

    # 2. Fallback: Auto-detect from local Ngrok API
    try:
        response = requests.get("http://127.0.0.1:4040/api/tunnels", timeout=2)
        data = response.json()
        public_url = data['tunnels'][0]['public_url']
        if public_url.startswith("http://"):
            public_url = public_url.replace("http://", "https://")
        return public_url
    except Exception as e:
        print(f"⚠️ Could not detect Ngrok URL: {e}")
        return None


def record_emergency_video(cap):
    """Records 5 seconds of video."""
    speak("Recording evidence.")

    filename = os.path.abspath("emergency_clip.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filename, fourcc, 20.0, (640, 480))
    
    try:
        start = time.time()
        while (time.time() - start) < 5:
            ret, frame = cap.read()
            if ret:
                frame = cv2.resize(frame, (640, 480))
                out.write(frame)
                # cv2.waitKey(1) is generally for GUI updates, minimal impact here but kept for safety
                cv2.waitKey(1)
    finally:
        out.release()
        time.sleep(1)
        speak("Video recorded.")
        
    return filename


def send_email_alert(city, lat, lon):
    """Sends Email with PHOTO and VIDEO."""
    try:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        image_path = save_latest_frame("driver_last_image.jpg")
        video_path = os.path.abspath("emergency_clip.mp4")
        maps_link = f"https://www.google.com/maps?q={lat},{lon}"

        msg = EmailMessage()
        msg["Subject"] = f"🚨 EMERGENCY: Driver Alert {now}"
        msg["From"] = EMAIL_SENDER
        msg["To"] = EMAIL_RECEIVER
        msg.set_content(f"Driver Unresponsive.\nLocation: {city}\nMap: {maps_link}\n\nSee attached evidence.")

        if image_path and os.path.exists(image_path):
            with open(image_path, "rb") as f:
                msg.add_attachment(f.read(), maintype="image", subtype="jpeg", filename="alert.jpg")

        if os.path.exists(video_path):
            with open(video_path, "rb") as f:
                msg.add_attachment(f.read(), maintype="video", subtype="mp4", filename="evidence.mp4")

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
        speak("Email Sent.")
    except Exception as e:
        print(f"❌ Email Failed: {e}")


def send_whatsapp_alert(city, lat, lon, video_url=None, image_url=None):
    """Sends WhatsApp with PHOTO and VIDEO LINK."""
    try:
        speak("Sending Evidences on WhatsApp...")
        client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

        maps_link = f"https://www.google.com/maps?q={lat},{lon}"

        # MESSAGE 1: The Main Alert + PHOTO
        msg_body = (
            f"🚨 *EMERGENCY ALERT*\n"
            f"Driver Unresponsive at {city}\n"
            f"📍 Map: {maps_link}"
        )

        message_args = {
            'body': msg_body,
            'from_': TWILIO_FROM_NUMBER,
            'to': EMERGENCY_CONTACT_NUMBER
        }

        # Attach Photo URL if available
        if image_url:
            message_args['media_url'] = [image_url]

        client.messages.create(**message_args)


        # MESSAGE 2: The Video Link (Sent separately to be safe)
        if video_url:
            time.sleep(2)  # Wait a bit
            client.messages.create(
                body=f"🎥 *Video Evidence:* {video_url}",
                from_=TWILIO_FROM_NUMBER,
                to=EMERGENCY_CONTACT_NUMBER
            )

    except Exception as e:
        print(f"❌ WhatsApp Failed: {e}")


def trigger_full_alert(cap):
    # 1. Record Video & Save Image
    record_emergency_video(cap)
    save_latest_frame("driver_last_image.jpg")  # Ensure fresh photo exists

    # 2. Get Data & Links
    city, lat, lon = get_user_location()
    base_url = get_ngrok_url()

    video_link = None
    image_link = None

    if base_url:
        video_link = f"{base_url}/emergency_video"
        image_link = f"{base_url}/emergency_image"


    # 3. Send Email
    send_email_alert(city, lat, lon)

    # 4. Send WhatsApp (Now passes Image Link too!)
    send_whatsapp_alert(city, lat, lon, video_link, image_link)

    # 5. KEEP SERVER ALIVE
    speak("Emergency alerts sent. Uploading data...")
    # WARNING: This sleep blocks the main thread. Ensure this is acceptable for the application flow.
    print("⏳ KEEPING SERVER ALIVE FOR 60 SECONDS...")
    time.sleep(40)
    print("✅ Done.")

def handle_emergency(cap):
    speak("Are you okay? Please respond.")

    attempts = 0
    max_attempts = 3

    while attempts < max_attempts:
        start_time = time.time()

        # wait up to 7 seconds per attempt
        while time.time() - start_time < 7:
            response = listen_voice()
            decision = classify_response(response)

            if decision == "yes":
                speak("Okay, you are safe.")
                return

            elif decision == "no":
                speak("You said you are not well.")
                speak(f"Can I call your emergency contact {EMERGENCY_CONTACT}? Please say yes or no.")

                confirm_start = time.time()
                while time.time() - confirm_start < 8:
                    confirm_response = listen_voice()
                    confirm_decision = classify_response(confirm_response)

                    if confirm_decision == "yes":
                        speak(f"Calling your emergency contact {EMERGENCY_CONTACT}.")
                        trigger_full_alert(cap)  # Call the helper function
                        return

                    elif confirm_decision == "no":
                        speak("Okay, I will not call anyone. Please drive safely.")
                        return

                speak("No confirmation received. Calling emergency contact for safety.")
                trigger_full_alert(cap)
                return

            attempts += 1
        if attempts < max_attempts:
            speak("No response detected. Please respond again.")

    speak(f"No response detected. Calling your emergency contact {EMERGENCY_CONTACT}.")
    trigger_full_alert(cap)