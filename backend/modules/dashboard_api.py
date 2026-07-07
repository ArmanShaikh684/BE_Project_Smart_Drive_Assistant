from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import cv2
import threading

# Import your existing modules
from .dashboard_data import get_dashboard_json
from .camera_manager import latest_frame
from .voice_assistant import speak, stop_music, is_music_active
from .shared_state import set_current_driver

app = Flask(__name__)
CORS(app)  # Allow React to access this API


def generate_frames():
    while True:
        if latest_frame is not None:
            ret, buffer = cv2.imencode('.jpg', latest_frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/status')
def get_status():
    data = get_dashboard_json()
    data["is_music_playing"] = is_music_active()
    return jsonify(data)

# ---> NEW: Route to stop music from the dashboard button
@app.route('/stop_music', methods=['POST'])
def stop_music_route():
    stop_music()
    return jsonify({"status": "success", "message": "Music stopped"})


# ==========================================
# NEW: THE STARTUP / WELCOME ROUTE
# ==========================================
@app.route('/start', methods=['POST'])
def start_system():
    data = request.json
    if data and "driver" in data:
        # 1. Save the driver to the backend state
        set_current_driver(data["driver"])
        driver_name = data["driver"].get("name", "Sir")

        # 2. Trigger the Welcome Audio in a background thread
        intro_text = (
            f"System initialized. Welcome, {driver_name}. I am your Smart Driver Assistant. "
            "All vehicle telemetry and safety protocols are now fully operational. "
            "Ready for departure."
        )
        threading.Thread(target=speak, args=(intro_text,), daemon=True).start()

        return jsonify({"status": "success", "message": "System started."})

    return jsonify({"status": "error", "message": "No driver provided."}), 400


def start_dashboard_server():
    app.run(host='0.0.0.0', port=5001)