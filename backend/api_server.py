"""
Flask REST API Server for Smart Driver Assistant
Auth endpoints + simple state endpoints.
No direct camera access via cv2.imshow — zero UI dependencies at startup.
"""
from modules.db_mysql import validate_login, save_driver_to_db, update_driver_contacts
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import sys, os, uuid, threading, time
import json
import re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.db_mysql import validate_login, save_driver_to_db
from modules.face_login import recognize_driver

app = Flask(__name__)
CORS(app)

# ── Face session stores ────────────────────────────────────────────────
face_scan_sessions         = {}
face_registration_sessions = {}

# ── Global State (Driven by background AI thread) ───────────────────────
_camera_lock    = threading.Lock()
_latest_frame   = None
_state_lock = threading.Lock()
_sys_state = {
    "head_pose": "forward", 
    "drowsy": False,
    "phoneDetected": False,
    "audioAlert": False,
    "ear": 0.31,
    "alertLevel": "SAFE", # SAFE, WARNING, CRITICAL, EMERGENCY
    "message": "System Online",
    "active": False, 
    "error": None
}


def _backend_camera_worker():
    """
    Dedicated background thread for camera capture and AI detection.
    Runs completely headlessly (no cv2.imshow).
    """
    global _latest_frame
    
    print("\U0001f50d Starting background Headless AI camera worker...")

    # Try loading AI modules
    modules_available = True
    try:
        from modules.head_pose import detect_head_pose
        from modules.drowsiness_detection import detect_drowsiness
        from modules.phone_detection import detect_phone
    except Exception as e:
        print(f"\u26a0\ufe0f  AI models unavailable: {e}")
        modules_available = False

    direction_map = {0: "forward", 1: "left", 2: "down"}
    colors = {"forward": (0, 255, 180), "left": (0, 200, 255), "right": (0, 200, 255), "down": (0, 80, 255)}

    while True:
        cap = None
        try:
            # 1. Try to open camera
            cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if not cap or not cap.isOpened():
                cap = cv2.VideoCapture(0)
            
            if not cap or not cap.isOpened():
                with _state_lock:
                    _sys_state["active"] = False
                    _sys_state["error"]  = "Hardware device not found"
                time.sleep(5)  # Wait before retry
                continue

            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)

            with _state_lock:
                _sys_state["active"] = True
                _sys_state["error"]  = None
            
            print("\u2705 AI Camera Connection Established (Headless Mode)")

            fail_count = 0
            while True:
                try:
                    ret, frame = cap.read()
                except Exception:
                    fail_count += 1
                    if fail_count > 10: break
                    time.sleep(0.1)
                    continue

                if not ret or frame is None:
                    fail_count += 1
                    if fail_count > 10: break
                    time.sleep(0.1)
                    continue
                fail_count = 0

                try:
                    frame = cv2.flip(frame, 1)
                except Exception:
                    pass

                # Initialize defaults for this frame
                direction = "forward"
                drowsy_flag = False
                phone_flag = False
                current_ear = 0.31
                alert_level = "SAFE"

                if modules_available:
                    try:
                        # 1. Head Pose
                        _, level = detect_head_pose(frame)
                        direction = direction_map.get(level, "forward")
                        
                        # 2. Drowsiness (Assuming detect_drowsiness returns frame, level)
                        # We will simulate the exact EAR value for UI purposes if the module doesn't return it
                        # For now, rely on level (0=safe, 1=warning, 2=drowsy, 3=critical)
                        _, d_level = detect_drowsiness(frame)
                        if d_level >= 2:
                            drowsy_flag = True
                            current_ear = 0.18
                            alert_level = "CRITICAL"
                        elif d_level == 1:
                            current_ear = 0.25
                            alert_level = "WARNING"
                        
                        # 3. Phone Detection
                        _, p_level = detect_phone(frame)
                        if p_level > 0:
                            phone_flag = True
                            if alert_level != "CRITICAL":
                                alert_level = "WARNING"
                                
                        if direction != "forward" and alert_level != "CRITICAL":
                            alert_level = "WARNING"

                    except Exception as e:
                        pass # Ignore individual frame AI errors
                
                # Update global state dictionary securely
                with _state_lock:
                    _sys_state["head_pose"] = direction
                    _sys_state["drowsy"] = drowsy_flag
                    _sys_state["phoneDetected"] = phone_flag
                    _sys_state["ear"] = current_ear
                    _sys_state["alertLevel"] = alert_level

                # Draw minimal debug info for the MJPEG stream
                try:
                    color = colors.get(direction, (0, 212, 255))
                    cv2.putText(frame, f"SYS: {alert_level}", 
                                (14, frame.shape[0] - 16), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)
                except Exception:
                    pass

                # Encode to JPEG for the web stream
                try:
                    ok, jpeg_buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                    if ok:
                        with _camera_lock:
                            _latest_frame = jpeg_buf.tobytes()
                except Exception:
                    pass

                time.sleep(0.02) # Yield thread

        except Exception as e:
            print(f"\u26a0\ufe0f Camera worker error: {e}")
        finally:
            if cap:
                try: cap.release()
                except Exception: pass
            with _state_lock:
                _sys_state["active"] = False
            
            print("\u26a0\ufe0f Camera worker disconnected. Restarting in 5s...")
            time.sleep(5)


# ══════════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════════
# ... (Keeping existing Auth Routes intact) ...

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data: return jsonify({"success": False, "error": "Invalid request format"}), 400

        # ---> NEW LOGIC: Auto-fill Commercial Driver Contacts <---
        if data.get('driver_type') == 'Commercial':
            if os.path.exists("owner_config.json"):
                with open("owner_config.json", "r") as f:
                    owner_data = json.load(f)
                    # Automatically inject the owner's details into the driver's database profile!
                    data['emergency_contact_name'] = owner_data.get("owner_name", "Fleet Manager")
                    data['emergency_contact_number'] = owner_data.get("owner_phone", "")
                    data['email_receiver'] = owner_data.get("owner_email", "")
                    # Add owner to trusted contacts
                    data['trusted_contacts'] = {data['emergency_contact_number']: data['emergency_contact_name']}
            else:
                return jsonify({"success": False, "error": "System Owner not configured yet."}), 400

        # Now validate the required fields
        required = ['name', 'password', 'emergency_contact_name', 'emergency_contact_number']
        for f in required:
            if not data.get(f): return jsonify({"success": False, "error": f"Missing required field: {f}"}), 400

        driver_ref_id = str(uuid.uuid4())
        data.setdefault('trusted_contacts', {})
        if save_driver_to_db(driver_ref_id, data):
            return jsonify(
                {"success": True, "message": "Driver registered successfully", "driver_id": driver_ref_id}), 201
        return jsonify({"success": False, "error": "Failed to save driver to database"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/driver/update-contacts', methods=['POST'])
def update_contacts():
    try:
        data = request.get_json()
        driver_id = data.get('driver_id')  # <--- Changed from driver_name
        trusted_contacts = data.get('trusted_contacts')

        if not driver_id or trusted_contacts is None:
            return jsonify({"success": False, "error": "Missing data"}), 400

        if update_driver_contacts(driver_id, trusted_contacts):
            return jsonify({"success": True, "message": "Contacts updated successfully"}), 200

        return jsonify({"success": False, "error": "Database update failed"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def _run_face_scan(session_id):
    try:
        face_scan_sessions[session_id].update({"status": "scanning", "message": "Scanning for face..."})
        profile = recognize_driver()
        if profile:
            face_scan_sessions[session_id].update({"status": "success", "driver": profile, "message": f"Welcome, {profile.get('name', 'Driver')}!"})
        else:
            face_scan_sessions[session_id].update({"status": "failed", "message": "Face not recognized. Please try again."})
    except Exception as e:
        face_scan_sessions[session_id].update({"status": "error", "message": f"Error: {e}"})


@app.route('/api/auth/face/start', methods=['POST'])
def start_face_scan():
    try:
        # Prevent React double-firing from crashing OpenCV
        for sid, s in list(face_scan_sessions.items()):
            if s["status"] in ["initializing", "scanning"]:
                return jsonify({"success": True, "session_id": sid, "message": "Scan already in progress"}), 200

        session_id = str(uuid.uuid4())
        face_scan_sessions[session_id] = {
            "status": "initializing",
            "driver": None,
            "message": "Initializing...",
            "timestamp": time.time()
        }
        threading.Thread(target=_run_face_scan, args=(session_id,), daemon=True).start()

        return jsonify({"success": True, "session_id": session_id, "message": "Face scan started"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/face/status/<session_id>', methods=['GET'])
def get_face_scan_status(session_id):
    try:
        now = time.time()
        for sid in [k for k, v in face_scan_sessions.items() if now - v.get("timestamp", 0) > 60]: del face_scan_sessions[sid]
        if session_id not in face_scan_sessions: return jsonify({"success": False, "error": "Session not found or expired"}), 404
        s = face_scan_sessions[session_id]
        return jsonify({"success": True, "status": s["status"], "driver": s.get("driver"), "message": s.get("message", "")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def _run_face_registration(session_id, driver_id):
    import cv2
    try:
        face_registration_sessions[session_id].update({"status": "capturing", "message": "Opening camera..."})
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            face_registration_sessions[session_id].update({"status": "error", "message": "Could not open camera"})
            return
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        save_path = "known_faces"
        os.makedirs(save_path, exist_ok=True)
        full_path = os.path.join(save_path, f"{driver_id}.jpg")
        face_registration_sessions[session_id]["message"] = "Position your face in frame..."
        start, captured = time.time(), False
        while (time.time() - start) < 10 and not captured:
            ret, frame = cap.read()
            if not ret: continue
            gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = cv2.CascadeClassifier.detectMultiScale(face_cascade, gray, 1.1, 4)
            if len(faces) > 0:
                face_registration_sessions[session_id].update({"status": "processing", "message": "Face detected! Processing..."})
                cv2.imwrite(full_path, frame)
                captured = True
                time.sleep(1)
        cap.release()
        if captured: face_registration_sessions[session_id].update({"status": "success", "message": "Face registered successfully!"})
        else: face_registration_sessions[session_id].update({"status": "failed", "message": "No face detected."})
    except Exception as e:
        face_registration_sessions[session_id].update({"status": "error", "message": f"Error: {e}"})

@app.route('/api/face/register', methods=['POST'])
def start_face_registration():
    try:
        data = request.get_json()
        if not data or 'driver_id' not in data: return jsonify({"success": False, "error": "driver_id is required"}), 400
        session_id = str(uuid.uuid4())
        face_registration_sessions[session_id] = {"status": "initializing", "driver_id": data['driver_id'], "message": "Initializing...", "timestamp": time.time()}
        threading.Thread(target=_run_face_registration, args=(session_id, data['driver_id']), daemon=True).start()
        return jsonify({"success": True, "session_id": session_id, "message": "Face registration started"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/face/register/status/<session_id>', methods=['GET'])
def get_face_registration_status(session_id):
    try:
        now = time.time()
        for sid in [k for k, v in face_registration_sessions.items() if now - v.get("timestamp", 0) > 60]: del face_registration_sessions[sid]
        if session_id not in face_registration_sessions: return jsonify({"success": False, "error": "Session not found or expired"}), 404
        s = face_registration_sessions[session_id]
        return jsonify({"success": True, "status": s["status"], "message": s.get("message", "")}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/face/check-registration/<driver_id>', methods=['GET'])
def check_face_registration(driver_id):
    try:
        face_path = os.path.join("known_faces", f"{driver_id}.jpg")
        return jsonify({"success": True, "registered": os.path.exists(face_path)}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/auth/guest', methods=['POST'])
def guest_login():
    # Default fallback values
    owner_name = "Car Owner"
    owner_phone = ""
    owner_email = ""

    # Read the actual owner config for emergency routing
    if os.path.exists("owner_config.json"):
        try:
            with open("owner_config.json", "r") as f:
                data = json.load(f)
                owner_name = data.get("owner_name", "Car Owner")
                owner_phone = data.get("owner_phone", "")
                owner_email = data.get("owner_email", "")
        except Exception as e:
            print(f"Error reading owner config: {e}")

    trusted_contacts = {}
    if owner_phone:
        trusted_contacts[owner_phone] = owner_name

    return jsonify({
        "success": True, "message": "Guest access granted",
        "driver": {
            "name": "Guest User",
            "driver_type": "Guest",
            "emergency_contact_name": owner_name,
            "emergency_contact_number": owner_phone,
            "email_receiver": owner_email,
            "trusted_contacts": trusted_contacts
        }
    }), 200


# ==========================================
# NEW: CAR OWNER SETUP ROUTES (Feature 3)
# ==========================================
@app.route('/api/system/check-owner', methods=['GET'])
def check_owner():
    """Checks if the car has an owner configured yet."""
    exists = os.path.exists("owner_config.json")
    return jsonify({"success": True, "is_configured": exists}), 200



@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        driver_name = data.get('driver_name', '').strip()
        password    = data.get('password', '').strip()
        profile = validate_login(driver_name, password)
        if profile: return jsonify({"success": True, "driver": profile}), 200
        return jsonify({"success": False, "error": "Invalid driver name or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "error": "Server error occurred"}), 500


@app.route('/api/system/setup-owner', methods=['POST'])
def setup_owner():
    """Saves the initial car owner configuration with Twilio formatting."""
    data = request.get_json()
    if not data or not data.get('owner_name') or not data.get('owner_phone'):
        return jsonify({"success": False, "error": "Name and Phone are required."}), 400

    raw_phone = data.get("owner_phone")

    # 1. Clean the input: Keep ONLY digits
    clean_num = ''.join(char for char in raw_phone if char.isdigit())

    # 2. Auto-format for Twilio (Assumes India +91 base)
    if len(clean_num) == 10:
        formatted_phone = f"whatsapp:+91{clean_num}"
    elif len(clean_num) == 12 and clean_num.startswith("91"):
        formatted_phone = f"whatsapp:+{clean_num}"
    else:
        # Fallback if they entered something completely different
        formatted_phone = raw_phone if raw_phone.startswith("whatsapp:") else f"whatsapp:{raw_phone}"

    config = {
        "owner_name": data.get("owner_name"),
        "owner_phone": formatted_phone,  # <--- SAVED IN STRICT TWILIO FORMAT
        "owner_email": data.get("owner_email", ""),
        "system_configured": True
    }

    try:
        with open("owner_config.json", "w") as f:
            json.dump(config, f, indent=4)
        return jsonify({"success": True, "message": "Owner configured successfully!"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500



# ══════════════════════════════════════════════════════════════════════
# NEW: FULL STATE ENDPOINT FOR REACT TO POLL
# ══════════════════════════════════════════════════════════════════════

@app.route('/api/sys_state', methods=['GET'])
def get_sys_state():
    """React polls this twice a second to update its UI"""
    with _state_lock:
        return jsonify(_sys_state), 200


@app.route('/api/head_pose', methods=['GET'])
def get_head_pose():
    """Legacy compatibility just in case"""
    with _state_lock:
        return jsonify({
            "head_pose": _sys_state["head_pose"],
            "active":    _sys_state["active"],
            "error":     _sys_state["error"],
        }), 200

def _generate_mjpeg():
    """Reads latest frame from global buffer populated by background worker."""
    from modules.face_login import latest_scan_frame
    while True:
        frame = latest_scan_frame
        
        if frame is not None:
             try:
                ok, jpeg_buf = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
                if ok:
                    yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + jpeg_buf.tobytes() + b'\r\n')
             except Exception:
                pass
        time.sleep(0.1)

@app.route('/video-feed')
def video_feed():
    # Only stream if we are doing a face scan
    return Response(_generate_mjpeg(), mimetype='multipart/x-mixed-replace; boundary=frame')


# ══════════════════════════════════════════════════════════════════════
# HEALTH
# ══════════════════════════════════════════════════════════════════════

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Smart Driver Assistant API"}), 200


if __name__ == '__main__':
    print("=" * 50)
    print("\U0001f680 Smart Driver Assistant API Server (HEADLESS WEB MODE)")
    print("=" * 50)
    print("  GET  /api/sys_state      \u2190 React polls this for all data")
    print("  GET  /video-feed         \u2190 MJPEG stream")
    print("=" * 50)
    
    # We don't start the background worker here anymore because it conflicts with face login.
    # The background worker will be started by web_main.py after login.

    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)