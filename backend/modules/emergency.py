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

from .dashboard_data import set_emergency_state, DASHBOARD_STATE
from .voice_assistant import start_listening_thread, get_latest_command


# Load environment variables
load_dotenv()

# ------------------ STATIC CONFIGURATION ------------------
# These are tied to your Twilio/Google accounts, NOT the driver.
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")


# ----------------------------------------------------------

def get_ngrok_url():
    """
    Returns the static Ngrok domain from .env if available.
    Otherwise, tries to auto-detect from local API (fallback).
    """
    static_domain = os.getenv("NGROK_STATIC_DOMAIN")
    if static_domain:
        return static_domain

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
    """Records 5 seconds of video, aborts instantly if trip ends."""
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
                cv2.waitKey(1)
    finally:
        out.release()
        time.sleep(1)
        speak("Video recorded.")

    return filename


def send_email_alert(city, lat, lon):
    """Sends Email with PHOTO and VIDEO."""
    # DYNAMIC FETCH: Get the current driver's email at the exact moment of emergency
    email_receiver = os.getenv("EMAIL_RECEIVER")

    if not email_receiver:
        print("❌ Email Failed: No receiver email found for this driver.")
        return

    try:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        image_path = save_latest_frame("driver_last_image.jpg")
        video_path = os.path.abspath("emergency_clip.mp4")
        maps_link = f"https://www.google.com/maps?q={lat},{lon}"

        msg = EmailMessage()
        msg["Subject"] = f"🚨 EMERGENCY: Driver Alert {now}"
        msg["From"] = EMAIL_SENDER
        msg["To"] = email_receiver
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
    # DYNAMIC FETCH: Get the current driver's phone at the exact moment of emergency
    raw_number = os.getenv("EMERGENCY_CONTACT_NUMBER")

    if not raw_number:
        print("❌ WhatsApp Failed: No emergency number found for this driver.")
        return

    clean_num = ''.join(char for char in raw_number if char.isdigit())

    # 2. If it has the '91' country code already, temporarily remove it
    if clean_num.startswith("91") and len(clean_num) == 12:
        clean_num = clean_num[2:]

    # 3. Apply the strict Twilio prefix and Indian country code (+91)
    if len(clean_num) == 10:
        emergency_contact_number = f"whatsapp:+91{clean_num}"
    else:
        # Fallback just in case it was already perfectly formatted
        emergency_contact_number = raw_number if raw_number.startswith("whatsapp:") else f"whatsapp:{raw_number}"

    try:
        speak("Sending Evidences on WhatsApp...")
        client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

        maps_link = f"https://www.google.com/maps?q={lat},{lon}"

        msg_body = (
            f"🚨 *EMERGENCY ALERT*\n"
            f"Driver Unresponsive at {city}\n"
            f"📍 Map: {maps_link}"
        )

        message_args = {
            'body': msg_body,
            'from_': TWILIO_FROM_NUMBER,
            'to': emergency_contact_number
        }

        if image_url:
            message_args['media_url'] = [image_url]

        client.messages.create(**message_args)

        if video_url:
            time.sleep(2)
            client.messages.create(
                body=f"🎥 *Video Evidence:* {video_url}",
                from_=TWILIO_FROM_NUMBER,
                to=emergency_contact_number
            )
    except Exception as e:
        print(f"❌ WhatsApp Failed: {e}")


def trigger_full_alert(cap):
    record_emergency_video(cap)
    save_latest_frame("driver_last_image.jpg")

    city, lat, lon = get_user_location()
    base_url = get_ngrok_url()

    video_link = f"{base_url}/emergency_video" if base_url else None
    image_link = f"{base_url}/emergency_image" if base_url else None

    send_email_alert(city, lat, lon)
    send_whatsapp_alert(city, lat, lon, video_link, image_link)

    speak("Emergency alerts sent. Uploading data...")
    print("⏳ KEEPING SERVER ALIVE FOR 40 SECONDS...")

    # Replace time.sleep(40) with a loop that checks the Kill Switch every second!
    start_wait = time.time()
    while time.time() - start_wait < 40:
        time.sleep(1)

    print("✅ Done.")


def grace_period_countdown(cap, contact_name):
    """The final 10-second warning before sending data. Can be cancelled by UI or Voice."""
    speak(f"Dispatching emergency protocols to {contact_name} in 10 seconds. Press the screen or say Cancel to abort.")
    set_emergency_state(status="COUNTDOWN", countdown=10)

    # Start listening for voice cancellation in the background
    start_listening_thread(timeout=10)

    for i in range(10, -1, -1):
        # 1. Check if user clicked the Circular React Button
        if DASHBOARD_STATE.get("emergency_status") == "NONE":
            speak("Emergency aborted by driver.")
            return

        # 2. Check if user said "Cancel", "No", or "Stop"
        cmd = get_latest_command()
        if cmd in ["no", "cancel", "stop", "safe"]:
            set_emergency_state("NONE", None)
            speak("Emergency aborted by voice command.")
            return

        # Update the UI timer
        set_emergency_state(status="COUNTDOWN", countdown=i)
        time.sleep(1)

    # 3. If timer hits 0 and wasn't cancelled, send the alerts!
    if DASHBOARD_STATE.get("emergency_status") == "COUNTDOWN":
        set_emergency_state("NONE", None)  # Hide the UI
        trigger_full_alert(cap)



def handle_emergency(cap):
    emergency_contact_name = os.getenv("EMERGENCY_CONTACT_NAME", "your emergency contact")

    set_emergency_state(status="CONVERSATION", countdown=None)

    speak("Are you okay? Please respond.")

    attempts = 0
    max_attempts = 3

    while attempts < max_attempts:
        start_time = time.time()

        while time.time() - start_time < 5:
            response = listen_voice()
            decision = classify_response(response)

            if decision == "yes":
                speak("Okay, you are safe.")
                set_emergency_state("NONE", None)
                return

            elif decision == "no":
                speak("You said you are not well.")
                speak(f"Can I call {emergency_contact_name}? Please say yes or no.")

                confirm_start = time.time()
                while time.time() - confirm_start < 5:
                    confirm_response = listen_voice()
                    confirm_decision = classify_response(confirm_response)

                    if confirm_decision == "yes":
                        speak(f"Calling {emergency_contact_name}.")
                        grace_period_countdown(cap, emergency_contact_name)
                        return

                    elif confirm_decision == "no":
                        speak("Okay, I will not call anyone. Please drive safely.")
                        return

                speak("No confirmation received. Calling emergency contact for safety.")
                grace_period_countdown(cap, emergency_contact_name)
                return

        attempts += 1
        if attempts < max_attempts:
            speak("No response detected. Please respond again.")

    speak(f"No response detected. Calling {emergency_contact_name}.")
    grace_period_countdown(cap, emergency_contact_name)