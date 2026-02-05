from flask import Flask, jsonify, Response
from flask_cors import CORS
import cv2
from .dashboard_data import get_dashboard_json
from .camera_manager import latest_frame

app = Flask(__name__)
CORS(app) # Allow React to access this API

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
    return jsonify(get_dashboard_json())

def start_dashboard_server():
    app.run(host='0.0.0.0', port=5001)
