
# Smart Drive Assistant

A Final Year BE Project designed to enhance driver safety and convenience using AI and Computer Vision. This system monitors driver fatigue, provides autonomous SOS alerts during emergencies, and features a hands-free voice assistant powered by Gemini GenAI.

## Features

*   **Driver Drowsiness Detection**: Uses AI (Dlib/MediaPipe) to monitor eye aspect ratio and head posture to detect fatigue.
*   **Object Detection**: Utilizes YOLOv8 for real-time road object detection.
*   **Emergency SOS**: Triggers autonomous alerts with GPS coordinates and video snippets via Twilio during emergencies.
*   **Voice Assistant**: Hands-free communication and assistance using Google Gemini GenAI and SpeechRecognition.
*   **Web Interface**: A React-based frontend for monitoring and interaction.

## Tech Stack

### Backend
*   **Language**: Python
*   **Framework**: Flask
*   **AI/CV**: OpenCV, Dlib, MediaPipe, Ultralytics (YOLOv8)
*   **GenAI**: Google Generative AI (Gemini)
*   **Audio**: Pygame, SpeechRecognition, pyttsx3
*   **Communication**: Twilio (SMS/Alerts)

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS

## Installation

### Prerequisites
*   Python 3.x
*   Node.js & npm

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure environment variables (API keys for Gemini, Twilio, etc.).

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

1.  **Start the Backend**:
    ```bash
    cd backend
    python main.py
    ```

2.  **Start the Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
