# 🚗 Smart Drive Assistant - Backend

## Overview
The **Smart Drive Assistant** is an AI-powered co-pilot designed to enhance driver safety. It uses computer vision to monitor driver behavior in real-time, detecting drowsiness, distraction, and phone usage. It also features a voice assistant, smart trip updates, and an emergency alert system.

## ✨ Features
- **Drowsiness Detection**: Monitors eye closure (EAR) and yawning (MAR).
- **Distraction Detection**: Tracks head pose to ensure eyes are on the road.
- **Phone Usage Detection**: Uses YOLOv8 to detect mobile phone usage.
- **Smart Voice Assistant**: Speaks weather/traffic updates and plays music when tired.
- **Emergency Protocol**: Automatically records video, captures photos, and sends WhatsApp/Email alerts with location if the driver is unresponsive.
- **Multi-User System**: Face Recognition login for different drivers (Private & Commercial modes).
- **Dashboard API**: Real-time data stream for a frontend dashboard.

---

## 🛠️ Prerequisites

### Hardware
- **Laptop/PC** with a Webcam.
- **Internet Connection** (for API calls).
- **Microphone** (for voice commands).

### Software
- **Python 3.10+**
- **MySQL Server** (for user database).
- **Tesseract OCR** (installed on system for reading text from images).
  - Download: [Tesseract at UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki)
  - Default Path: `C:\Program Files\Tesseract-OCR\tesseract.exe`

---

## 🚀 Installation Guide

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd backend
```

### 2. Set Up Virtual Environment (Recommended)
```bash
python -m venv .venv
# Activate:
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```
*Note: If you face issues with `dlib`, you may need to install CMake and Visual Studio Build Tools first.*

### 4. Database Setup (MySQL)
1. Open your MySQL Workbench or Command Line.
2. Create the database:
   ```sql
   CREATE DATABASE smart_drive_db;
   USE smart_drive_db;
   ```
3. Create the drivers table:
   ```sql
   CREATE TABLE drivers (
       driver_ref_id VARCHAR(50) PRIMARY KEY,
       full_name VARCHAR(100),
       emergency_name VARCHAR(100),
       emergency_number VARCHAR(50),
       email_receiver VARCHAR(100),
       trusted_contacts JSON,
       driver_type VARCHAR(20) DEFAULT 'Private',
       password VARCHAR(255) DEFAULT '1234'
   );
   ```

---

## 🔑 External Services Setup

### 1. Twilio (WhatsApp Alerts)
1. Sign up at [Twilio](https://www.twilio.com/).
2. Go to **Messaging > Try it out > Send a WhatsApp message**.
3. You will see a sandbox number (e.g., `+14155238886`) and a code (e.g., `join paper-crane`).
4. **CRITICAL:** Send that code from your personal WhatsApp to the sandbox number. This authorizes Twilio to send you messages.
5. Copy your `Account SID` and `Auth Token` to `.env`.

### 2. Gmail (Email Alerts)
1. Use a Gmail account to send alerts.
2. Go to **Google Account > Security > 2-Step Verification**.
3. Scroll to the bottom and select **App Passwords**.
4. Create a new app password (name it "Smart Drive").
5. Copy the 16-character code into `.env` as `EMAIL_APP_PASSWORD`.
   - *Do NOT use your regular Gmail password.*

### 3. Ngrok (Public URL for Media)
*Required if you want WhatsApp to display the emergency video/image.*
1. Download [Ngrok](https://ngrok.com/).
2. Run: `ngrok http 5000`
3. Copy the `https` URL (e.g., `https://a1b2c3d4.ngrok.io`).
4. Paste it into `.env` as `NGROK_STATIC_DOMAIN`.

---

## 🏁 Running the System

### First Time Setup
Run the Login Manager. It will detect that the system is not configured and launch the **Setup Wizard**.
```bash
python login_manager.py
```
1. Enter the **Car Owner's** details (Name, Phone, Email).
2. This creates an `owner_config.json` file.

### Registering a Driver
If your face is not recognized, select **"Register New Driver"** from the menu.
- **Private Driver**: You choose your own emergency contacts.
- **Commercial Driver**: Emergency alerts are locked to the Car Owner.

### Daily Usage
Just run the script (or double-click `Run_Project.bat`):
```bash
python login_manager.py
```
- The system will scan your face.
- If recognized, it starts monitoring immediately.
- If not, use the fallback menu to login via Password or Guest Mode.

---

## 🎮 Controls
- **`q`**: Quit the system safely.
- **`0`**: Stop music playback.
- **Voice Commands**:
  - When asked *"Do you want music?"*, say **"Yes"** or **"No"**.

---

## 📂 Project Structure
- `login_manager.py`: **Entry Point**. Handles auth and startup.
- `main.py`: **Core Logic**. Runs the monitoring loop.
- `register_driver.py`: Script to onboard new users.
- `setup_wizard.py`: Initial system configuration.
- `modules/`: Contains all logic (Camera, Database, AI, etc.).
- `known_faces/`: Stores face data for login.
- `songs/`: Place your `.mp3` files here for the music player.

---

## ⚠️ Troubleshooting
- **"ModuleNotFoundError"**: Run `pip install -r requirements.txt` again.
- **"Twilio Error"**: Ensure you have joined the Twilio Sandbox from your phone.
- **"Camera not opening"**: Check if another app (Zoom/Teams) is using it.
