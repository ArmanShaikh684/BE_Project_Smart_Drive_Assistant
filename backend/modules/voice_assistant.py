import pygame
import pytesseract
import cv2
import win32com.client
import speech_recognition as sr
import threading
import webbrowser
import time
import os
import random

speak_lock = threading.Lock()
mic_lock = threading.Lock() # To prevent collision between background listener and system alerts

# Initialize Pygame Mixer for Music
try:
    pygame.mixer.init()
except Exception as e:
    print(f"Warning: Audio mixer could not start. {e}")

# Global Music State
MUSIC_PLAYING = False
SONG_QUEUE = []

# Global Voice Command State (Async)
LATEST_VOICE_COMMAND = None
IS_LISTENING = False

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
        if word in text:
            return "yes"

    # Check for NO words
    for word in NO_WORDS:
        if word in text:
            return "no"

    return "unknown"


def listen_voice(timeout=5):
    """
    Listens to the microphone (Blocking). 
    """
    with mic_lock:
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.pause_threshold = 0.8

        with sr.Microphone() as source:
            print("Listening...")
            try:
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

# ---------------- ASYNC LISTENING ----------------

def start_listening_thread(timeout=5):
    """
    Starts a background thread to listen for voice input.
    Does NOT block the main program.
    """
    global IS_LISTENING, LATEST_VOICE_COMMAND
    
    if IS_LISTENING:
        return # Already listening

    LATEST_VOICE_COMMAND = None # Reset previous command
    IS_LISTENING = True
    
    def worker():
        global IS_LISTENING, LATEST_VOICE_COMMAND
        response = listen_voice(timeout)
        LATEST_VOICE_COMMAND = classify_response(response)
        IS_LISTENING = False
        print(f"🎤 Async Listener Finished. Result: {LATEST_VOICE_COMMAND}")

    t = threading.Thread(target=worker, daemon=True)
    t.start()

def get_latest_command():
    """
    Returns the result of the async listener.
    Returns None if still listening or no command yet.
    """
    global LATEST_VOICE_COMMAND
    if LATEST_VOICE_COMMAND:
        cmd = LATEST_VOICE_COMMAND
        LATEST_VOICE_COMMAND = None # Consume it
        return cmd
    return None

def is_listening():
    return IS_LISTENING

# ---------------- MUSIC FUNCTIONS ----------------

def load_songs():
    global SONG_QUEUE
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    songs_dir = os.path.join(base_dir, "songs")
    
    if os.path.exists(songs_dir):
        SONG_QUEUE = [os.path.join(songs_dir, f) for f in os.listdir(songs_dir) if f.lower().endswith(('.mp3', '.wav', '.mpeg'))]
        random.shuffle(SONG_QUEUE)

def play_local_music():
    """
    Starts playing music from the backend/songs directory using Pygame.
    """
    global MUSIC_PLAYING
    
    if not SONG_QUEUE:
        load_songs()
    
    if not SONG_QUEUE:
        speak("I did not find any songs in the songs folder.")
        return

    MUSIC_PLAYING = True
    speak("Playing music.")
    play_next_song()

def play_next_song():
    """
    Internal function to play the next song in the queue.
    """
    global MUSIC_PLAYING, SONG_QUEUE
    
    if not MUSIC_PLAYING:
        return

    if not SONG_QUEUE:
        load_songs()
        if not SONG_QUEUE: 
            return

    # Get first song and rotate queue
    song_path = SONG_QUEUE.pop(0)
    SONG_QUEUE.append(song_path) # Add back to end so it loops

    try:
        pygame.mixer.music.load(song_path)
        pygame.mixer.music.play()
    except Exception as e:
        print(f"Error playing music: {e}")

def stop_music():
    """
    Stops the music playback.
    """
    global MUSIC_PLAYING
    if MUSIC_PLAYING:
        MUSIC_PLAYING = False
        pygame.mixer.music.stop()
        speak("Music stopped.")

def check_music_queue():
    """
    Called periodically to check if the current song has finished.
    If finished, plays the next one.
    """
    global MUSIC_PLAYING
    if MUSIC_PLAYING:
        # get_busy() returns True if music is playing
        if not pygame.mixer.music.get_busy():
            play_next_song()

def play_spotify(query=""):
    """
    Legacy function kept for compatibility.
    """
    play_local_music()

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
