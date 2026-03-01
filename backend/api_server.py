"""
Flask REST API Server for Smart Driver Assistant
Auth endpoints + simple head pose state endpoint.
No direct camera access — zero hardware dependencies at startup.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys, os, uuid, threading, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.db_mysql import validate_login, save_driver_to_db
from modules.face_login import recognize_driver

app = Flask(__name__)
CORS(app)

# ── Face session stores ────────────────────────────────────────────────
face_scan_sessions         = {}
face_registration_sessions = {}

# ── Head pose shared state (no camera thread — defaults to forward) ────
_head_pose_lock  = threading.Lock()
_head_pose_state = {"head_pose": "forward", "active": True, "error": None}


# ══════════════════════════════════════════════════════════════════════
# AUTH
# ══════════════════════════════════════════════════════════════════════

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Invalid request format"}), 400
        required = ['name', 'password', 'emergency_contact_name', 'emergency_contact_number']
        for f in required:
            if not data.get(f):
                return jsonify({"success": False, "error": f"Missing required field: {f}"}), 400
        driver_ref_id = str(uuid.uuid4())
        data.setdefault('trusted_contacts', {})
        if save_driver_to_db(driver_ref_id, data):
            return jsonify({"success": True, "message": "Driver registered successfully", "driver_id": driver_ref_id}), 201
        return jsonify({"success": False, "error": "Failed to save driver to database"}), 500
    except Exception as e:
        print(f"❌ Register error: {e}")
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
        session_id = str(uuid.uuid4())
        face_scan_sessions[session_id] = {"status": "initializing", "driver": None, "message": "Initializing...", "timestamp": time.time()}
        threading.Thread(target=_run_face_scan, args=(session_id,), daemon=True).start()
        return jsonify({"success": True, "session_id": session_id, "message": "Face scan started"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/auth/face/status/<session_id>', methods=['GET'])
def get_face_scan_status(session_id):
    try:
        now = time.time()
        for sid in [k for k, v in face_scan_sessions.items() if now - v.get("timestamp", 0) > 60]:
            del face_scan_sessions[sid]
        if session_id not in face_scan_sessions:
            return jsonify({"success": False, "error": "Session not found or expired"}), 404
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
            if not ret:
                continue
            gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = cv2.CascadeClassifier.detectMultiScale(face_cascade, gray, 1.1, 4)
            if len(faces) > 0:
                face_registration_sessions[session_id].update({"status": "processing", "message": "Face detected! Processing..."})
                cv2.imwrite(full_path, frame)
                captured = True
                time.sleep(1)
        cap.release()
        if captured:
            face_registration_sessions[session_id].update({"status": "success", "message": "Face registered successfully!"})
        else:
            face_registration_sessions[session_id].update({"status": "failed", "message": "No face detected. Please try again."})
    except Exception as e:
        face_registration_sessions[session_id].update({"status": "error", "message": f"Error: {e}"})


@app.route('/api/face/register', methods=['POST'])
def start_face_registration():
    try:
        data = request.get_json()
        if not data or 'driver_id' not in data:
            return jsonify({"success": False, "error": "driver_id is required"}), 400
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
        for sid in [k for k, v in face_registration_sessions.items() if now - v.get("timestamp", 0) > 60]:
            del face_registration_sessions[sid]
        if session_id not in face_registration_sessions:
            return jsonify({"success": False, "error": "Session not found or expired"}), 404
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
    try:
        return jsonify({
            "success": True, "message": "Guest access granted",
            "driver": {"name": "Guest User", "driver_type": "Guest", "emergency_contact_name": "Not Set",
                       "emergency_contact_number": "", "email_receiver": "", "trusted_contacts": {}}
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Invalid request format"}), 400
        driver_name = data.get('driver_name', '').strip()
        password    = data.get('password', '').strip()
        if not driver_name or not password:
            return jsonify({"success": False, "error": "Driver name and password are required"}), 400
        profile = validate_login(driver_name, password)
        if profile:
            return jsonify({"success": True, "driver": profile}), 200
        return jsonify({"success": False, "error": "Invalid driver name or password"}), 401
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"success": False, "error": "Server error occurred"}), 500


# ══════════════════════════════════════════════════════════════════════
# HEAD POSE  (no camera — returns shared state, defaults to forward)
# ══════════════════════════════════════════════════════════════════════

@app.route('/api/head_pose', methods=['GET'])
def get_head_pose():
    """
    Returns current head pose direction.
    Defaults to forward/active. Can be updated by a future integration
    that runs detect_head_pose() separately and writes to _head_pose_state.
    """
    with _head_pose_lock:
        return jsonify({
            "head_pose": _head_pose_state["head_pose"],
            "active":    _head_pose_state["active"],
            "error":     _head_pose_state["error"],
        }), 200


# ══════════════════════════════════════════════════════════════════════
# HEALTH
# ══════════════════════════════════════════════════════════════════════

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Smart Driver Assistant API"}), 200


if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Smart Driver Assistant API Server")
    print("=" * 50)
    print("  POST /api/auth/register")
    print("  POST /api/auth/login")
    print("  POST /api/auth/guest")
    print("  POST /api/auth/face/start")
    print("  GET  /api/auth/face/status/<id>")
    print("  POST /api/face/register")
    print("  GET  /api/face/register/status/<id>")
    print("  GET  /api/face/check-registration/<id>")
    print("  GET  /api/head_pose")
    print("  GET  /api/health")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
