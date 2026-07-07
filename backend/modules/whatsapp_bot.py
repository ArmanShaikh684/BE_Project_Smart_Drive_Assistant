import os
import time
import requests
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from dotenv import load_dotenv
import google.generativeai as genai

from .voice_assistant import speak

load_dotenv()

# --- CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Use a stable, recommended model
VISION_MODEL_NAME = "gemini-1.5-flash-latest"


def analyze_image_with_gemini(image_url: str, max_retries: int = 2, delay: int = 5) -> str:
    """
    Analyzes an image from a URL using the Gemini Vision model with retry logic.

    Args:
        image_url: The public URL of the image to analyze.
        max_retries: The maximum number of times to retry on failure.
        delay: The delay in seconds between retries.

    Returns:
        A string description of the image or an error message.
    """
    if not GEMINI_API_KEY:
        return "Cannot analyze image: Gemini API key is not configured."

    try:
        # Download the image data from the URL
        image_response = requests.get(image_url)
        image_response.raise_for_status()  # Ensure the request was successful
        image_data = image_response.content
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Failed to download image from URL: {e}")
        return "I was unable to download the image sent."

    # Prepare the image part for the Gemini API
    image_part = {
        "mime_type": "image/jpeg",  # Assuming JPEG, Twilio often converts to this
        "data": image_data
    }

    model = genai.GenerativeModel(VISION_MODEL_NAME)
    prompt = "Describe this image in one short sentence for a driver."

    # --- Retry Logic ---
    for attempt in range(max_retries + 1):
        try:
            response = model.generate_content([prompt, image_part])
            return response.text.strip()
        except Exception as e:
            error_message = str(e)
            print(f"⚠️ Gemini API Error (Attempt {attempt + 1}/{max_retries + 1}): {error_message}")

            # Check for specific, non-retriable errors
            if "404" in error_message or "API key not valid" in error_message:
                return "Cannot analyze image due to a configuration error."

            # If it's the last attempt, give up
            if attempt >= max_retries:
                return "I am unable to analyze images right now, sir."

            # Wait before trying again
            print(f"   Retrying in {delay} seconds...")
            time.sleep(delay)

    return "I am unable to analyze images right now, sir."


def handle_whatsapp_message():
    """
    Processes incoming WhatsApp messages via Twilio webhook.
    This is the main logic for the /whatsapp endpoint.
    """
    incoming_msg = request.values.get('Body', '').lower()
    from_number = request.values.get('From', '')
    profile_name = request.values.get('ProfileName', 'the sender')
    num_media = int(request.values.get('NumMedia', 0))

    print(f"📩 Message from {profile_name} ({from_number})")

    # --- Image Handling ---
    if num_media > 0:
        media_url = request.values.get('MediaUrl0')
        media_type = request.values.get('MediaContentType0')

        if media_type and 'image' in media_type:
            speak(f"Message from {profile_name}. They sent a photo.")
            # This call now has built-in retry and error handling
            description = analyze_image_with_gemini(media_url)
            speak(description)
        else:
            speak(f"Message from {profile_name}. They sent a media file I can't read.")

    # --- Text Message Handling ---
    elif incoming_msg:
        speak(f"Message from {profile_name}. They said: {incoming_msg}")

    # Twilio requires a response, even if it's empty
    return str(MessagingResponse())


def start_whatsapp_server():
    """
    Starts a separate Flask server on port 5003 to handle WhatsApp webhooks.
    This runs in a separate thread from the main application.
    """
    bot_app = Flask(__name__)

    @bot_app.route("/whatsapp", methods=['POST'])
    def whatsapp_webhook():
        return handle_whatsapp_message()

    print("📞 WhatsApp Bot Server listening on port 5003")
    # Note: Using 'werkzeug' reloader is not suitable for threaded production use.
    # This is fine for this project's structure.
    bot_app.run(port=5003, debug=False)