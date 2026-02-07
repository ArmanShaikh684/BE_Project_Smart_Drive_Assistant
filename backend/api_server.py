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
import uuid
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

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
    print("  - POST /api/auth/login")
    print("  - GET  /api/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
