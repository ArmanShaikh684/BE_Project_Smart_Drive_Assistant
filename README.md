# Smart Drive Assistant (SDA)

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white" alt="Python Version">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=61DAFB" alt="React Version">
  <img src="https://img.shields.io/badge/Flask-2.3-black?logo=flask&logoColor=white" alt="Flask Version">
  <img src="https://img.shields.io/badge/OpenCV-4.8-green?logo=opencv&logoColor=white" alt="OpenCV Version">
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql&logoColor=white" alt="MySQL Version">
</p>

An AI-powered, full-stack driver safety system designed to prevent accidents caused by fatigue and distraction. This project uses real-time computer vision to monitor the driver and an autonomous telematics system to dispatch emergency alerts.

<!-- 
  RECOMMENDATION: Record a 30-second GIF of your dashboard in action and place it here.
  It makes a huge difference!
  <p align="center">
    <img src="link_to_your_demo.gif" width="80%">
  </p>
-->

---

## 🚀 Key Features

The Smart Drive Assistant is more than just a detection script; it's an end-to-end application with a robust set of features:

-   👁️ **Real-Time Drowsiness & Distraction Detection:** Utilizes **Dlib** and **OpenCV** to track Eye Aspect Ratio (EAR) for microsleeps, Mouth Aspect Ratio (MAR) for yawning, and 3D head pose estimation to detect when the driver's gaze deviates from the road.

-   📱 **Hazardous Object Detection:** Employs a pre-trained **YOLOv8** model to identify hazardous in-cabin behavior, specifically detecting when the driver is holding a cell phone.

-   🤖 **AI Voice Co-Pilot:** A hands-free, interactive voice assistant powered by **Google Gemini**. It delivers contextual audio alerts (e.g., "Heavy traffic detected ahead") and can process driver queries and even describe images sent via WhatsApp.

-   🆘 **Autonomous SOS Protocol:** If the driver becomes unresponsive, the system automatically:
    1.  Records a 5-second video clip as evidence.
    2.  Fetches the vehicle's current GPS coordinates.
    3.  Dispatches multi-channel alerts to emergency contacts via **Twilio (WhatsApp/SMS)** and **SMTP (Email)**, complete with a Google Maps link and the video evidence.

-   🔐 **Secure, Multimodal Authentication:** Features a robust login system with:
    -   **Biometric Login:** High-speed facial recognition.
    -   **Credential Login:** Standard password-based authentication.
    -   **Guest Mode:** A sandboxed session for temporary drivers.

-   📊 **Live Web Dashboard:** A sleek, real-time dashboard built with **React.js** and **Flask**. It visualizes all AI telemetry, renders the live camera feed via an MJPEG stream, and provides a clean interface for managing driver profiles.

---

## 🛠️ System Architecture

The SDA is built on a decoupled, multi-threaded client-server architecture to ensure high performance and reliability.

-   **Frontend (Client):** A state-driven UI built with **React.js** that polls the backend for real-time data and renders a live MJPEG video stream.

-   **Backend (Server):** A multi-threaded **Python Flask** application serving two concurrent APIs:
    1.  **Auth API (Port 5000):** Manages secure login, user registration, and the initial face scan sequence.
    2.  **AI Core API (Port 5002):** Runs the headless AI engine and streams real-time monitoring data and video to the frontend dashboard.

-   **Database:** **MySQL** is used for the persistent storage of user profiles and emergency contacts.

-   **AI & CV Engine:** The core AI logic runs on a background thread within the AI Core API. It uses Dlib, OpenCV, and YOLOv8 for real-time inference on the edge device.

---

## ⚙️ How to Run the System

#### Prerequisites

-   Python 3.9+
-   Node.js 16+
-   MySQL Server (with a database named `smart_drive_db` created)
-   A webcam
-   Git

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/BE_Project_Smart_Drive_Assistant.git
cd BE_Project_Smart_Drive_Assistant
```

#### 2. Configure the Backend

1.  Navigate to the `backend/` directory.
2.  Create a database in your MySQL server named `smart_drive_db`.
3.  Create a `.env` file by copying the `env.example` file.
4.  Open the `.env` file and fill in your actual credentials for:
    -   MySQL Database (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`)
    -   Twilio API (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, etc.)
    -   Google Gemini API (`GEMINI_API_KEY`)
    -   Email Dispatch (`EMAIL_SENDER`, `EMAIL_APP_PASSWORD`)
5.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```

#### 3. Configure the Frontend

1.  Navigate to the `frontend/` directory.
2.  Install Node.js dependencies:
    ```bash
    npm install
    ```

#### 4. Launch the Application

The easiest way to launch all services is to use the provided batch script from the project's **root directory**.

```bash
# From the root folder (BE_Project_Smart_Drive_Assistant)
Start_Web_Server.bat
```

This script will automatically:
1.  Launch the **Auth API Server** (on Port 5000).
2.  Launch the **Headless AI Core Server** (on Port 5002).
3.  Launch the **React Frontend** and open it in your browser.

Navigate to **`http://localhost:5173`** to use the application.

---

## 📂 Project Structure

```
.
├── backend/
│   ├── modules/         # Core Python logic (AI, emergency, voice)
│   ├── models/          # AI model files (.dat, .pt)
│   ├── known_faces/     # Stores registered driver face images
│   ├── api_server.py    # Flask server for authentication
│   ├── web_main.py      # Flask server for the headless AI core
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── contexts/    # Global state management
│   │   ├── pages/       # Main application pages
│   │   └── services/    # API communication layer
│   └── package.json
│
├── .gitignore           # Specifies files to be ignored by Git
├── README.md            # This file
└── Start_Web_Server.bat # Automation script to run the project
```
