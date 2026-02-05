import time

# Global State Dictionary
DASHBOARD_STATE = {
    "trip_start_time": None,
    "driver_status": "FOCUSED", # FOCUSED, DISTRACTED, DROWSY
    "ai_message": "System Initialized. Drive Safely.",
    "weather_info": "Unknown",
    "traffic_info": "Unknown",
    "location": "Unknown"
}

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

def get_dashboard_json():
    """Returns the full state for the Frontend API"""
    return {
        "trip_time": get_trip_duration(),
        "status": DASHBOARD_STATE["driver_status"],
        "message": DASHBOARD_STATE["ai_message"],
        "weather": DASHBOARD_STATE["weather_info"],
        "traffic": DASHBOARD_STATE["traffic_info"],
        "location": DASHBOARD_STATE["location"]
    }
