import requests
import os
import time
import threading
from dotenv import load_dotenv
from google import genai
from .voice_assistant import speak, listen_voice, play_spotify

# Load environment variables
load_dotenv()

WEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
TRAFFIC_API_KEY = os.getenv("TOMTOM_TRAFFIC_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

# Global variables for trip monitoring
TRIP_ACTIVE = False
DESTINATION = None
MONITOR_THREAD = None

def get_user_location():
    """
    Fetches current location using IP-API.
    Returns: city, lat, lon
    """
    try:
        r = requests.get("http://ip-api.com/json/", timeout=5)
        data = r.json()
        city = data.get("city", "Unknown")
        lat = data.get("lat", 0.0)
        lon = data.get("lon", 0.0)
        return city, lat, lon
    except:
        return "Unknown", 0.0, 0.0

def get_weather_data(lat, lon):
    """
    Fetches raw weather data (dict) based on coordinates.
    """
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
        r = requests.get(url, timeout=5)
        data = r.json()

        if data.get("cod") != 200:
            return None

        return {
            "temp": data["main"]["temp"],
            "condition": data["weather"][0]["description"],
            "wind": data["wind"]["speed"]
        }
    except Exception as e:
        print(f"Weather API Error: {e}")
        return None

def get_traffic_data(lat, lon):
    """
    Fetches raw traffic data (dict) at the current location.
    """
    try:
        url = (
            f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
            f"?point={lat},{lon}&key={TRAFFIC_API_KEY}"
        )

        r = requests.get(url, timeout=5)
        data = r.json()

        current_speed = data["flowSegmentData"]["currentSpeed"]
        free_flow_speed = data["flowSegmentData"]["freeFlowSpeed"]
        
        if free_flow_speed == 0: 
            return None

        ratio = current_speed / free_flow_speed
        
        status = "Clear"
        if ratio < 0.5: status = "Heavy Congestion"
        elif ratio < 0.8: status = "Moderate Traffic"

        return {
            "status": status,
            "current_speed": current_speed,
            "free_flow_speed": free_flow_speed
        }
            
    except Exception as e:
        print(f"Traffic API Error: {e}")
        return None

def generate_smart_update(city, weather, traffic):
    """
    Uses Gemini to generate a concise, 2-sentence update for the driver.
    """
    if not weather and not traffic:
        return "I am unable to fetch weather or traffic data right now."

    prompt = (
        f"You are a smart driving assistant. The driver is currently in {city}. "
        f"Weather data: {weather}. "
        f"Traffic data: {traffic}. "
        "Generate a very concise, natural-sounding update for the driver. "


    )

    # Reverting to your preferred model list
    models_to_try = [
        "gemini-2.5-flash", 
        "gemini-2.0-flash",
        "gemini-1.5-flash"
    ]

    for model in models_to_try:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            if response.text:
                return response.text.strip()
        except Exception as e:
            print(f"⚠️ Gemini API Error ({model}): {e}")
            continue 

    # Fallback
    print("⚠️ AI model failed. Using fallback logic.")
    weather_text = f"Weather is {weather.get('condition', 'unknown')}." if weather else ""
    traffic_text = f"Traffic is {traffic.get('status', 'unknown')}." if traffic else ""
    return f"{weather_text} {traffic_text} Drive safely."

def trip_monitor_loop():
    """
    Background loop that runs every 7 minutes (420 seconds).
    Fetches data -> Sends to Gemini -> Speaks result.
    """
    global TRIP_ACTIVE

    while TRIP_ACTIVE:
            # 1. Get Location
        city, lat, lon = get_user_location()
        
        if lat == 0.0 and lon == 0.0:
            print("⚠️ Trip Monitor: Could not fetch location.")
        else:
            # 2. Fetch Raw Data
            weather_data = get_weather_data(lat, lon)
            traffic_data = get_traffic_data(lat, lon)
            
            # 3. Generate Smart Update via Gemini
            smart_message = generate_smart_update(city, weather_data, traffic_data)

            speak(smart_message)

        # Wait for 7 minutes (420 seconds)
        for _ in range(420):
            if not TRIP_ACTIVE:
                break
            time.sleep(1)
            
    print("🛑 Trip Monitor: Stopped.")

def start_trip_monitoring(destination=None):
    """
    Starts the background thread for trip monitoring.
    """
    global TRIP_ACTIVE, DESTINATION, MONITOR_THREAD
    
    if TRIP_ACTIVE:
        return

    TRIP_ACTIVE = True
    DESTINATION = destination
    
    MONITOR_THREAD = threading.Thread(target=trip_monitor_loop, daemon=True)
    MONITOR_THREAD.start()

def stop_trip_monitoring():
    """
    Stops the background threads.
    """
    global TRIP_ACTIVE
    if TRIP_ACTIVE:
        TRIP_ACTIVE = False
        speak("Trip monitoring stopped.")

def co_pilot_update(city):
    """
    Legacy function kept for compatibility.
    """
    # Trigger a manual update
    city, lat, lon = get_user_location()
    w = get_weather_data(lat, lon)
    t = get_traffic_data(lat, lon)
    msg = generate_smart_update(city, w, t)
    speak(msg)
    return msg, ""
