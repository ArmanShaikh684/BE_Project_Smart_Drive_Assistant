"""
Flask REST API Server for Smart Driver Assistant
Provides authentication endpoints for the frontend application
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.db_mysql import validate_login, save_driver_to_db
from modules.face_login import recognize_driver
import uuid
import json
import threading
import time
import cv2
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Face scan session storage
# Format: { session_id: { "status": "scanning|success|failed|error", "driver": {...}, "message": "...", "timestamp": ... } }
face_scan_sessions = {}

# Face registration session storage
# Format: { session_id: { "status": "capturing|processing|success|failed|error", "message": "...", "timestamp": ..., "driver_id": "..." } }
face_registration_sessions = {}

@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Driver registration endpoint
    
    Request JSON:
    {
        "name": "Driver Name",
        "password": "secret_password",
        "emergency_contact_name": "Emergency Name",
        "emergency_contact_number": "1234567890",
        "email_receiver": "email@example.com",
        "trusted_contacts": { ... }
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Invalid request format"}), 400
            
        # Basic validation
        required_fields = ['name', 'password', 'emergency_contact_name', 'emergency_contact_number']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
                
        # Generate unique driver ID
        driver_ref_id = str(uuid.uuid4())
        
        # Prepare data for DB
        # Ensure trusted_contacts is a dict
        if 'trusted_contacts' not in data:
            data['trusted_contacts'] = {}
            
        # Save to DB
        if save_driver_to_db(driver_ref_id, data):
            return jsonify({
                "success": True, 
                "message": "Driver registered successfully",
                "driver_id": driver_ref_id
            }), 201
        else:
            return jsonify({"success": False, "error": "Failed to save driver to database"}), 500
            
    except Exception as e:
        print(f"❌ Register API Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

def run_face_scan(session_id):
    """
    Background thread function to run face recognition
    Updates the session status when complete
    """
    try:
        face_scan_sessions[session_id]["status"] = "scanning"
        face_scan_sessions[session_id]["message"] = "Scanning for face..."
        
        # Run face recognition (blocking, takes ~8 seconds)
        profile = recognize_driver()
        
        if profile:
            face_scan_sessions[session_id]["status"] = "success"
            face_scan_sessions[session_id]["driver"] = profile
            face_scan_sessions[session_id]["message"] = f"Welcome, {profile.get('name', 'Driver')}!"
        else:
            face_scan_sessions[session_id]["status"] = "failed"
            face_scan_sessions[session_id]["message"] = "Face not recognized. Please try again."
            
    except Exception as e:
        print(f"❌ Face Scan Error: {e}")
        face_scan_sessions[session_id]["status"] = "error"
        face_scan_sessions[session_id]["message"] = f"Error: {str(e)}"

@app.route('/api/auth/face/start', methods=['POST'])
def start_face_scan():
    """
    Initiates face scanning in background thread
    Returns session ID for polling
    """
    try:
        session_id = str(uuid.uuid4())
        
        # Initialize session
        face_scan_sessions[session_id] = {
            "status": "initializing",
            "driver": None,
            "message": "Initializing camera...",
            "timestamp": time.time()
        }
        
        # Start face scan in background thread
        scan_thread = threading.Thread(target=run_face_scan, args=(session_id,))
        scan_thread.daemon = True
        scan_thread.start()
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Face scan started"
        }), 200
        
    except Exception as e:
        print(f"❌ Start Face Scan Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/face/status/<session_id>', methods=['GET'])
def get_face_scan_status(session_id):
    """
    Polls the status of a face scan session
    """
    try:
        # Clean up old sessions (older than 60 seconds)
        current_time = time.time()
        expired_sessions = [sid for sid, data in face_scan_sessions.items() 
                          if current_time - data.get("timestamp", 0) > 60]
        for sid in expired_sessions:
            del face_scan_sessions[sid]
        
        # Check if session exists
        if session_id not in face_scan_sessions:
            return jsonify({
                "success": False,
                "error": "Session not found or expired"
            }), 404
        
        session_data = face_scan_sessions[session_id]
        
        return jsonify({
            "success": True,
            "status": session_data["status"],
            "driver": session_data.get("driver"),
            "message": session_data.get("message", "")
        }), 200
        
    except Exception as e:
        print(f"❌ Get Face Scan Status Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

def run_face_registration(session_id, driver_id):
    """
    Background thread function to capture face for registration
    Simplified version that auto-captures after detecting face
    """
    try:
        face_registration_sessions[session_id]["status"] = "capturing"
        face_registration_sessions[session_id]["message"] = "Opening camera..."
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            face_registration_sessions[session_id]["status"] = "error"
            face_registration_sessions[session_id]["message"] = "Could not open camera"
            return
        
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        save_path = "known_faces"
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        
        filename = f"{driver_id}.jpg"
        full_path = os.path.join(save_path, filename)
        
        face_registration_sessions[session_id]["message"] = "Position your face in frame..."
        
        # Try to capture for up to 10 seconds
        start_time = time.time()
        captured = False
        
        while (time.time() - start_time) < 10 and not captured:
            ret, frame = cap.read()
            if not ret:
                continue
            
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Face detected, capture it
                face_registration_sessions[session_id]["status"] = "processing"
                face_registration_sessions[session_id]["message"] = "Face detected! Processing..."
                
                cv2.imwrite(full_path, frame)
                captured = True
                time.sleep(1)  # Brief pause to show processing message
                break
        
        cap.release()
        
        if captured:
            face_registration_sessions[session_id]["status"] = "success"
            face_registration_sessions[session_id]["message"] = "Face registered successfully!"
        else:
            face_registration_sessions[session_id]["status"] = "failed"
            face_registration_sessions[session_id]["message"] = "No face detected. Please try again."
            
    except Exception as e:
        print(f"❌ Face Registration Error: {e}")
        face_registration_sessions[session_id]["status"] = "error"
        face_registration_sessions[session_id]["message"] = f"Error: {str(e)}"

@app.route('/api/face/register', methods=['POST'])
def start_face_registration():
    """
    Initiates face registration/capture in background thread
    Returns session ID for polling
    """
    try:
        data = request.get_json()
        if not data or 'driver_id' not in data:
            return jsonify({"success": False, "error": "driver_id is required"}), 400
        
        driver_id = data['driver_id']
        session_id = str(uuid.uuid4())
        
        # Initialize session
        face_registration_sessions[session_id] = {
            "status": "initializing",
            "driver_id": driver_id,
            "message": "Initializing camera...",
            "timestamp": time.time()
        }
        
        # Start face registration in background thread
        registration_thread = threading.Thread(target=run_face_registration, args=(session_id, driver_id))
        registration_thread.daemon = True
        registration_thread.start()
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Face registration started"
        }), 200
        
    except Exception as e:
        print(f"❌ Start Face Registration Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/face/register/status/<session_id>', methods=['GET'])
def get_face_registration_status(session_id):
    """
    Polls the status of a face registration session
    """
    try:
        # Clean up old sessions (older than 60 seconds)
        current_time = time.time()
        expired_sessions = [sid for sid, data in face_registration_sessions.items() 
                          if current_time - data.get("timestamp", 0) > 60]
        for sid in expired_sessions:
            del face_registration_sessions[sid]
        
        # Check if session exists
        if session_id not in face_registration_sessions:
            return jsonify({
                "success": False,
                "error": "Session not found or expired"
            }), 404
        
        session_data = face_registration_sessions[session_id]
        
        return jsonify({
            "success": True,
            "status": session_data["status"],
            "message": session_data.get("message", "")
        }), 200
        
    except Exception as e:
        print(f"❌ Get Face Registration Status Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/face/check-registration/<driver_id>', methods=['GET'])
def check_face_registration(driver_id):
    """
    Checks if a driver has registered their face
    """
    try:
        face_path = os.path.join("known_faces", f"{driver_id}.jpg")
        registered = os.path.exists(face_path)
        
        return jsonify({
            "success": True,
            "registered": registered
        }), 200
        
    except Exception as e:
        print(f"❌ Check Face Registration Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/guest', methods=['POST'])
def guest_login():
    """
    Guest login endpoint
    Returns a temporary guest profile
    """
    try:
        # Create a temporary guest profile
        guest_profile = {
            "name": "Guest User",
            "driver_type": "Guest",
            "emergency_contact_name": "Not Set",
            "emergency_contact_number": "",
            "email_receiver": "",
            "trusted_contacts": {}
        }
        
        return jsonify({
            "success": True,
            "message": "Guest access granted",
            "driver": guest_profile
        }), 200
            
    except Exception as e:
        print(f"❌ Guest Login Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Password-based authentication endpoint
    
    Request JSON:
    {
        "driver_name": "John Doe",
        "password": "mypassword"
    }
    
    Success Response (200):
    {
        "success": true,
        "driver": {
            "name": "John Doe",
            "emergency_contact_name": "Jane Doe",
            "emergency_contact_number": "+1234567890",
            "email_receiver": "john@example.com",
            "trusted_contacts": {},
            "driver_type": "Private"
        }
    }
    
    Error Response (401):
    {
        "success": false,
        "error": "Invalid driver name or password"
    }
    
    Error Response (500):
    {
        "success": false,
        "error": "Database connection failed"
    }
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid request format"
            }), 400
        
        driver_name = data.get('driver_name', '').strip()
        password = data.get('password', '').strip()
        
        # Validate input
        if not driver_name or not password:
            return jsonify({
                "success": False,
                "error": "Driver name and password are required"
            }), 400
        
        # Attempt authentication
        profile = validate_login(driver_name, password)
        
        if profile:
            # Success - return driver profile
            return jsonify({
                "success": True,
                "driver": profile
            }), 200
        else:
            # Authentication failed
            return jsonify({
                "success": False,
                "error": "Invalid driver name or password"
            }), 401
            
    except Exception as e:
        # Server error
        print(f"❌ Login API Error: {e}")
        return jsonify({
            "success": False,
            "error": "Server error occurred"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Smart Driver Assistant API"
    }), 200

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Smart Driver Assistant API Server")
    print("=" * 50)
    print("Starting server on http://localhost:5000")
    print("API Endpoints:")
    print("  - POST /api/auth/register")
    print("  - POST /api/auth/login")
    print("  - POST /api/auth/guest")
    print("  - POST /api/auth/face/start")
    print("  - GET  /api/auth/face/status/:session_id")
    print("  - POST /api/face/register")
    print("  - GET  /api/face/register/status/:session_id")
    print("  - GET  /api/face/check-registration/:driver_id")
    print("  - GET  /api/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
