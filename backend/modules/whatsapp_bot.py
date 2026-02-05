from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
import requests
from google import genai
from PIL import Image
from io import BytesIO
from flask import send_file
import os
from dotenv import load_dotenv

# --- IMPORT EXISTING MODULES ---
from .voice_assistant import speak
from .api_services import get_user_location
from .camera_manager import save_latest_frame
from .shared_state import get_trusted_contacts  # <--- IMPORTED DYNAMIC CONTACTS

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ----------------- CONFIGURATION -----------------
# 1. PASTE YOUR GEMINI API KEY HERE
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# 2. Initialize Client
client = genai.Client(api_key=GEMINI_API_KEY)

# ----------------- HELPER FUNCTIONS -----------------
def describe_image_with_gemini(url):
    """
    Downloads image and uses your available Gemini models to describe it.
    """
    # Prioritize stable legacy models that are guaranteed to exist
    models_to_try = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]

    image_data = None

    # 1. Download Image
    try:
        resp = requests.get(url, stream=True)
        if resp.status_code != 200:
            return "I could not download the image from WhatsApp."
        image_data = Image.open(BytesIO(resp.content))
    except Exception as e:
        print(f"Download Error: {e}")
        return "I could not open the image file."



    for model_name in models_to_try:
        try:

            response = client.models.generate_content(
                model=model_name,
                contents=[image_data, "You are an AI assistant helping a user who is currently driving. Whenever an image is shared, provide a concise, high-level description that can be easily understood when read aloud."
                                      "Keep the description to 2–3 sentences.State who or what is the main focus immediately.Mention only the most important visual cues like clothing, action, or setting.Avoid describing image quality, file types, or metadata.Do not include distracting or overly dense details."]
            )

            if response.text:
                return response.text.strip()

        except Exception as e:
            print(f"   ⚠️ Failed to read the image with {model_name}: {e}")
            continue

    return "I am unable to analyze images right now."


# ----------------- MAIN WHATSAPP ROUTE -----------------
@app.route("/whatsapp", methods=['POST'])
def whatsapp_reply():
    # 1. Get Sender Info
    sender_number = request.values.get('From', '')
    incoming_msg = request.values.get('Body', '').strip()
    num_media = int(request.values.get('NumMedia', 0))

    # 2. Identify Sender (Using Dynamic List from Shared State)
    trusted_contacts = get_trusted_contacts()
    
    # Debugging: Print the list to see what's loaded
    print(f"🔍 Checking sender {sender_number} against trusted list: {trusted_contacts}")
    
    sender_name = trusted_contacts.get(sender_number, "Unknown Person")

    resp = MessagingResponse()
    msg = resp.message()

    print(f"📩 Message from {sender_name} ({sender_number})")

    if sender_name != "Unknown Person":

        # --- SCENARIO 1: IMAGE RECEIVED ---
        if num_media > 0:
            image_url = request.values.get('MediaUrl0')
            speak(f"Message from {sender_name}. They sent a photo.")

            # Use Gemini to describe it
            description = describe_image_with_gemini(image_url)

            speak(f"{description}")
            msg.body(f"👀 AI Analysis: {description}")

        # --- SCENARIO 2: TEXT MESSAGE ---
        elif incoming_msg:
            if 'location' in incoming_msg.lower():
                city, lat, lon = get_user_location()
                speak(f"Sending location to {sender_name}.")
                msg.body(f"📍 Location: http://maps.google.com/?q={lat},{lon}")

            elif 'status' in incoming_msg.lower():
                msg.body("✅ Smart Driver System: ONLINE")

            else:
                speak(f"Message from {sender_name}: {incoming_msg}")
                msg.body("👍 Driver heard you.")

    else:
        msg.body("🤖 Driver is busy. Emergency contacts only.")

    return str(resp)

# --- NEW: Route to serve the emergency IMAGE ---
@app.route("/emergency_image")
def serve_image():
    # Looks for "driver_last_image.jpg" in the current folder
    image_path = os.path.join(os.getcwd(), "driver_last_image.jpg")
    if os.path.exists(image_path):
        return send_file(image_path, mimetype='image/jpeg')
    else:
        return "No image available."

# --- NEW: Route to serve the emergency video ---
@app.route("/emergency_video")
def serve_video():
    video_path = os.path.join(os.getcwd(), "emergency_clip.mp4")
    if os.path.exists(video_path):
        return send_file(video_path, mimetype='video/mp4')
    else:
        return "No video available."


def start_whatsapp_server():
    app.run(port=5000, host='0.0.0.0')