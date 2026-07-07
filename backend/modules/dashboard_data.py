import time

# Global State Dictionary
DASHBOARD_STATE = {
    "trip_start_time": None,
    "driver_status": "FOCUSED",  # FOCUSED, DISTRACTED, DROWSY
    "ai_message": "System Initialized. Drive Safely.",
    "weather_info": "Unknown",
    "traffic_info": "Unknown",
    "location": "Unknown",
    "is_speaking": False,  # <--- NEW: Flag for the dancing bars
    "emergency_status": "NONE",
    "emergency_countdown": None,
    "whatsapp_sender": None,  # <--- NEW
    "whatsapp_time": 0
}

def set_emergency_state(status="NONE", countdown=None):
    DASHBOARD_STATE["emergency_status"] = status
    DASHBOARD_STATE["emergency_countdown"] = countdown

def init_trip():
    """Call this when monitoring starts"""
    DASHBOARD_STATE["trip_start_time"] = time.time()


def get_trip_duration():
    """Returns formatted string HH:MM:SS"""
    if not DASHBOARD_STATE["trip_start_time"]:
        return "00:00:00"

    elapsed = int(time.time() - DASHBOARD_STATE["trip_start_time"])
    hours = elapsed // 3600
    minutes = (elapsed % 3600) // 60
    seconds = elapsed % 60
    return f"{hours:02}:{minutes:02}:{seconds:02}"


def update_status(drowsy_level, is_distracted, phone_detected):
    """Determines the overall driver status"""
    if drowsy_level >= 2:
        DASHBOARD_STATE["driver_status"] = "DROWSY"
    elif is_distracted or phone_detected:
        DASHBOARD_STATE["driver_status"] = "DISTRACTED"
    else:
        DASHBOARD_STATE["driver_status"] = "FOCUSED"


def set_ai_message(msg):
    """Updates the Co-Pilot message box"""
    DASHBOARD_STATE["ai_message"] = msg


def set_speaking_state(is_speaking):
    """Turns the dashboard visualizer on and off"""
    DASHBOARD_STATE["is_speaking"] = is_speaking


def set_weather_data(weather_text):
    DASHBOARD_STATE["weather_info"] = weather_text

# ---> NEW: Setter for Traffic Data
def set_traffic_data(traffic_text):
    DASHBOARD_STATE["traffic_info"] = traffic_text

# ---> NEW: Trigger the WhatsApp UI Toast
def set_whatsapp_notification(sender_name):
    DASHBOARD_STATE["whatsapp_sender"] = sender_name
    DASHBOARD_STATE["whatsapp_time"] = time.time()



def get_dashboard_json():
    """Returns the full state for the Frontend API"""

    if DASHBOARD_STATE["whatsapp_sender"] and (time.time() - DASHBOARD_STATE["whatsapp_time"] > 5):
        DASHBOARD_STATE["whatsapp_sender"] = None

    return {
        "trip_time": get_trip_duration(),
        "status": DASHBOARD_STATE["driver_status"],
        "message": DASHBOARD_STATE["ai_message"],
        "weather": DASHBOARD_STATE["weather_info"],
        "traffic": DASHBOARD_STATE["traffic_info"],
        "location": DASHBOARD_STATE["location"],
        "is_speaking": DASHBOARD_STATE["is_speaking"] , # <--- NEW: Send flag to React
        "emergency_status": DASHBOARD_STATE["emergency_status"],
        "emergency_countdown": DASHBOARD_STATE["emergency_countdown"],
        "whatsapp_sender": DASHBOARD_STATE["whatsapp_sender"]
    }

def set_weather_data(weather_text):
    DASHBOARD_STATE["weather_info"] = weather_text