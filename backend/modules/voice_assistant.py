import pygame
import pytesseract
import cv2
import win32com.client
import speech_recognition as sr
import threading
import webbrowser
import time

speak_lock = threading.Lock()
mic_lock = threading.Lock() # To prevent collision between background listener and system alerts

# Stop pygame audio so it doesn't block speaker
try:
    pygame.mixer.stop()
    pygame.mixer.quit()
except:
    pass

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Windows native voice engine
speaker = win32com.client.Dispatch("SAPI.SpVoice")

def speak(text):
    with speak_lock:
        print("Assistant:", text)
        try:
            speaker.Speak(text)
        except Exception as e:
            print("Voice error:", e)

YES_WORDS = [
    "yes", "yeah", "yep", "yup", "ok", "okay", "sure", "alright",
    "read", "read it", "please read", "go ahead", "do it", "continue",
    "start", "begin", "tell me", "speak", "say it", "open", "play",
    "i am okay", "i am fine", "i am good", "i'm okay", "i'm fine",
    "no problem", "everything is fine", "safe", "all good", "can"
]

NO_WORDS = [
    "no", "nope", "nah", "never", "don't", "do not", "skip", "cancel",
    "ignore", "later", "not now", "stop", "leave it", "no thanks",
    "not well", "i am not well", "i'm not well", "i feel bad", "i feel sick",
    "help", "emergency", "problem", "bad", "not good", "danger",
    "call", "call help", "call emergency", "accident", "hurt",
    "i am in trouble", "i need help"
]

def classify_response(text):
    if not text or text == "unknown":
        return "unknown"

    text = text.lower().strip()

    # Check for YES words
    for word in YES_WORDS:
        # Check if the word exists as a standalone word or part of the phrase
        # Simple 'in' check is usually enough for phrases like "i am okay"
        if word in text:
            return "yes"

    # Check for NO words
    for word in NO_WORDS:
        if word in text:
            return "no"

    return "unknown"


def listen_voice(timeout=5):
    """
    Listens to the microphone. 
    Uses a lock to ensure only one thread listens at a time.
    """
    with mic_lock:
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.pause_threshold = 0.8

        with sr.Microphone() as source:
            print("Listening...")
            try:
                # Adjust for ambient noise briefly
                r.adjust_for_ambient_noise(source, duration=0.5)
                audio = r.listen(source, timeout=timeout, phrase_time_limit=5)
            except sr.WaitTimeoutError:
                return "unknown"

        try:
            text = r.recognize_google(audio).lower()
            print("You said:", text)
            if text == "":
                return "unknown"
            return text
        except sr.UnknownValueError:
            return "unknown"
        except sr.RequestError:
            return "unknown"

def play_spotify(query=""):
    """
    Opens Spotify. If a query is provided, tries to search/play it.
    """
    speak(f"Opening Spotify for {query}")
    
    # If specific playlist mentioned (simple mapping for demo)
    if "myplaylist1" in query.replace(" ", "").lower():
        # Example: Open a specific playlist URL (replace with real one if needed)
        # For now, we just search for it
        webbrowser.open("https://open.spotify.com/search/myplaylist1")
    elif query:
        webbrowser.open(f"https://open.spotify.com/search/{query}")
    else:
        webbrowser.open("spotify:")

def read_message_from_image(image_path, sender="Arman"):
    speak(f"{sender} sent you a message with an image. Would you like me to read it?")

    attempts = 0
    decision = "unknown"

    while attempts < 3 and decision == "unknown":
        response = listen_voice()
        decision = classify_response(response)

        if decision == "unknown":
            speak("Sorry, I did not hear you.")
            attempts += 1

    # If still unknown after 3 tries, fallback to keyboard
    if decision == "unknown":
        speak("Please type yes or no.")
        # Note: input() might block the GUI thread if not careful, 
        # but this function is usually called in a separate thread context in this app.
        try:
            response = input("Type yes or no: ").lower()
            decision = classify_response(response)
        except:
            pass

    if decision == "yes":
        speak("Reading the message.")

        img = cv2.imread(image_path)
        if img is None:
            speak("Sorry, I could not open the image file.")
            return

        text = pytesseract.image_to_string(img)

        if text.strip() == "":
            speak("Sorry, I could not detect any text in the image.")
        else:
            clean_text = text.replace("\n", " ").strip()
            if clean_text:
                speak(clean_text)
            else:
                speak("Sorry, I could not detect readable text.")

    elif decision == "no":
        speak("Okay, I will not read it.")

    else:
        speak("No valid response received. Skipping the message.")
