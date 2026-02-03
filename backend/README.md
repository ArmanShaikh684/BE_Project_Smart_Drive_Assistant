# Smart Drive Assistant - Backend

## Overview
This is the backend system for the Smart Drive Assistant project. It utilizes computer vision and machine learning techniques to monitor driver behavior in real-time, ensuring safety by detecting drowsiness, distraction, and phone usage.

## Features
- **Drowsiness Detection**: Monitors eye closure (EAR) and yawning (MAR).
- **Gaze Tracking**: Uses MediaPipe to detect if eyes are looking away.
- **Phone Usage Detection**: Identifies if the driver is using a mobile phone.
- **Smart Trip Updates**: Uses Gemini AI to speak concise weather and traffic updates every 7 minutes.
- **Emergency Handling**: Triggers WhatsApp/Email alerts with video evidence in critical situations.
- **WhatsApp Bot**: Allows two-way communication (Status, Location, Image Analysis).

## Prerequisites
- Python 3.x
- Webcam/Camera connected to the system.
- `ngrok` installed and configured.

## Installation
1. Navigate to the project directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
To start the Smart Driver Assistant:

1. Run the start script (if available) or:
   ```bash
   python main.py
   ```

2. Ensure `ngrok` is running if you want WhatsApp features:
   ```bash
   ngrok http 5000 --url=your-static-domain
   ```

**Controls:**
- Press `q` to stop the system and exit safely.

## Project Structure
- `main.py`: Entry point.
- `modules/`: Core logic (Drowsiness, Gaze, API, etc.).
- `models/`: ML models (Dlib, YOLO).
- `requirements.txt`: Python dependencies.
