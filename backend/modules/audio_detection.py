import speech_recognition as sr
import numpy as np
from .voice_assistant import speak
from .emergency import handle_emergency

LOUDNESS_THRESHOLD = 150

def detect_audio_anomaly():
    r = sr.Recognizer()

    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = r.listen(source, timeout=5, phrase_time_limit=2)
        except:
            return False

    raw_data = np.frombuffer(audio.get_raw_data(), dtype=np.int16)
    volume = np.abs(raw_data).mean()
    print("Detected volume:", volume)

    if volume > LOUDNESS_THRESHOLD:
        speak("A loud sound was detected.")
        handle_emergency()   # ONLY emergency module handles logic
        return True

    return False
