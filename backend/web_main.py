"""
Headless Backend Entry Point for Web UI
Runs the Flask APIs and background AI without cv2.imshow popups.
"""
import threading
import time
import cv2
import os
from flask import Flask, jsonify, Response, request
from flask_cors import CORS
from dotenv import load_dotenv

# Import modules
from modules.shared_state import set_current_driver
from modules.dashboard_data import init_trip, update_status, set_ai_message, get_dashboard_json
from modules.camera_manager import update_frame, latest_frame
from modules.drowsiness_detection import detect_drowsiness
from modules.head_pose import detect_head_pose
from modules.phone_detection import detect_phone
from modules.voice_assistant import speak, start_listening_thread, get_latest_command, is_listening, play_local_music, stop_music, check_music_queue
from modules.emergency import handle_emergency
from modules.api_services import start_trip_monitoring, stop_trip_monitoring
from modules.whatsapp_bot import start_whatsapp_server

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- GLOBAL STATE ---
SYSTEM_ACTIVE = False
_camera_lock = threading.Lock()
_latest_jpeg = None
cap = None


def ai_monitoring_loop(profile):
    """The main AI loop that runs silently in the background."""
    global SYSTEM_ACTIVE, cap, _latest_jpeg

    print(f"\n🚀 AI Core Started for {profile['name'].upper()}")
    
    # 1. Setup Env
    os.environ["EMERGENCY_CONTACT_NAME"] = profile.get("emergency_contact_name", "")
    os.environ["EMERGENCY_CONTACT_NUMBER"] = profile.get("emergency_contact_number", "")
    os.environ["EMAIL_RECEIVER"] = profile.get("email_receiver", "")

    set_current_driver(profile)
    init_trip()
    set_ai_message(f"Welcome {profile['name']}. System Active.")
    
    start_trip_monitoring()
    speak(f"Welcome {profile['name']}. Have a safe drive.")

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)

    # Variables for logic
    drowsy_warning_count = 0
    last_drowsy_time = 0
    head_distraction_start = None
    head_warning_count = 0
    last_interaction_time = 0
    waiting_for_music_response = False
    music_prompt_time = 0

    while SYSTEM_ACTIVE:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue

        frame = cv2.flip(frame, 1)
        update_frame(frame) # Save raw frame for emergency

        # --- AI DETECTION ---
        frame, drowsy_level = detect_drowsiness(frame)
        frame, head_pose_level = detect_head_pose(frame)
        frame, phone_detected = detect_phone(frame)

        is_distracted = (head_pose_level >= 1)
        update_status(drowsy_level, is_distracted, phone_detected)
        
        # --- ENCODE FOR WEB STREAM ---
        # We don't use cv2.imshow. We encode to JPEG to send to React.
        try:
            ok, jpeg_buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if ok:
                with _camera_lock:
                    _latest_jpeg = jpeg_buf.tobytes()
        except Exception as e:
            pass

        # --- LOGIC ---
        check_music_queue()
        now = time.time()

        if waiting_for_music_response:
            cmd = get_latest_command()
            if cmd == "yes":
                play_local_music()
                set_ai_message("Playing music to keep you alert.")
                drowsy_warning_count = 0
                last_drowsy_time = now + 30
                waiting_for_music_response = False
                last_interaction_time = now
            elif cmd == "no":
                speak("Okay. Please pull over if you are tired.")
                set_ai_message("Driver refused music.")
                drowsy_warning_count = 0
                last_drowsy_time = now
                waiting_for_music_response = False
                last_interaction_time = now
            elif not is_listening() and cmd is None:
                if now - music_prompt_time > 8:
                    speak("No response. Calling emergency.")
                    handle_emergency(cap)
                    waiting_for_music_response = False
                    drowsy_warning_count = 0
                    last_drowsy_time = now
                    last_interaction_time = now

        if now - last_interaction_time < 10:
            continue

        # Phone
        if phone_detected:
            speak("Do not use phone while driving.")
            set_ai_message("Phone usage detected.")
            last_interaction_time = now

        # Drowsiness
        if drowsy_level >= 2:
            # 1st Attempt
            if drowsy_warning_count == 0 and (now - last_drowsy_time > 10):
                speak("You seem tired. Stay alert.")
                set_ai_message("Drowsiness detected.")
                drowsy_warning_count = 1
                last_drowsy_time = now
                last_interaction_time = now

            # 2nd Attempt
            elif drowsy_warning_count == 1 and (now - last_drowsy_time > 10) and not waiting_for_music_response:
                speak("Would you like a song")
                set_ai_message("Offering music assistance.")
                start_listening_thread(timeout=5)
                waiting_for_music_response = True
                music_prompt_time = now
                last_interaction_time = now

        # Head Pose
        if is_distracted:
            if head_distraction_start is None:
                head_distraction_start = now
            elif now - head_distraction_start > 4:
                if head_warning_count < 2:
                    speak("Keep your eyes on the road.")
                    set_ai_message("Distraction detected.")
                    head_warning_count += 1
                    head_distraction_start = now
                    last_interaction_time = now
                else:
                    handle_emergency(cap)
                    head_distraction_start = None
                    head_warning_count = 0
                    last_interaction_time = now
        else:
            head_distraction_start = None
            head_warning_count = 0

    if cap:
        cap.release()
    print("🛑 AI Core Stopped.")

# --- API ENDPOINTS ---

@app.route('/api/system/start', methods=['POST'])
def start_system():
    global SYSTEM_ACTIVE
    data = request.get_json()
    if not data or 'driver' not in data:
        return jsonify({"success": False, "error": "No driver data provided"}), 400

    if not SYSTEM_ACTIVE:
        SYSTEM_ACTIVE = True
        threading.Thread(target=ai_monitoring_loop, args=(data['driver'],), daemon=True).start()
        # Start WhatsApp Bot
        threading.Thread(target=start_whatsapp_server, daemon=True).start()

    return jsonify({"success": True, "message": "System started"})


@app.route('/api/system/stop', methods=['POST'])
def stop_system():
    global SYSTEM_ACTIVE
    SYSTEM_ACTIVE = False
    stop_trip_monitoring()
    stop_music()
    return jsonify({"success": True})


@app.route('/api/system/emergency/cancel', methods=['POST'])
def cancel_emergency_route():
    from modules.dashboard_data import set_emergency_state
    set_emergency_state("NONE", None) # Instantly aborts the countdown loop!
    return jsonify({"success": True, "message": "Emergency Cancelled"})



@app.route('/api/dashboard/status', methods=['GET'])
def get_dashboard_status():
    """Endpoint for React to poll real-time data."""
    from modules.voice_assistant import is_music_active

    data = get_dashboard_json()
    data["is_music_playing"] = is_music_active()  # Inject the flag!
    return jsonify(data)

@app.route('/api/system/music/toggle', methods=['POST'])
def toggle_music_route():
    from modules.voice_assistant import is_music_active, stop_music, play_local_music
    if is_music_active():
        stop_music()
    else:
        # If stopped, play again
        play_local_music()
    return jsonify({"success": True})

@app.route('/api/system/music/next', methods=['POST'])
def next_music_route():
    from modules.voice_assistant import is_music_active, play_local_music, play_next_song
    if not is_music_active():
        play_local_music() # Ensure it starts if it was paused
    else:
        play_next_song()
    return jsonify({"success": True})
def _generate_mjpeg():
    """Yields JPEG frames for React."""
    while True:
        with _camera_lock:
            frame_data = _latest_jpeg
        
        if frame_data:
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n'
            )
        else:
            time.sleep(0.1)

@app.route('/video-feed')
def video_feed():
    return Response(_generate_mjpeg(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 SDA Headless Core Starting...")
    print("=" * 50)
    # Note: We run on port 5002 to not conflict with api_server.py which handles login.
    # In a real prod setup, these would be combined into one server.
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)