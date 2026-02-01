# Smart Driver Assistant - Frontend

This is the frontend interface for the Smart Driver Assistant, an AI-powered safety monitoring system designed to enhance driver safety through real-time monitoring and assistance.

## Overview

The application provides a comprehensive dashboard for monitoring driver behavior, including drowsiness detection, distraction alerts, and phone usage detection. It also integrates navigation aids, voice assistance, and emergency protocols.

## Features

*   **Driver Identification**: Face recognition interface for driver authentication.
*   **Real-time Dashboard**:
    *   **Drowsiness Detection**: Monitors Eye Aspect Ratio (EAR) to detect fatigue.
    *   **Distraction Detection**: Tracks head pose (yaw/pitch) to ensure focus on the road.
    *   **Phone Detection**: Alerts when phone usage is detected while driving.
*   **Voice Assistant**:
    *   Message Reader (TTS) for incoming messages.
    *   Voice commands for navigation and vehicle control.
*   **Rest Stop Finder**: Locates nearby rest areas, petrol pumps, and restaurants based on driving time.
*   **Traffic & Weather**: Displays route summary, traffic status, and weather conditions.
*   **Emergency System**:
    *   Automated emergency protocols if the driver is unresponsive.
    *   Quick access to emergency contacts and services.
*   **Audio Monitoring**: Detects anomalies like crashes, horns, or sirens.

## Technologies Used

*   **HTML5**: Structure and layout.
*   **CSS3**: Styling, animations, and responsive design (Dark theme optimized for driving).
*   **JavaScript (Vanilla)**: Logic for UI interactions, state management, and simulation of monitoring systems.

## Project Structure

*   `index.html`: Main entry point containing the structure for all application screens.
*   `styles.css`: Contains all styles, variables, and animations.
*   `script.js`: Handles application logic, navigation between screens, and simulation of sensor data.

## How to Run

1.  Clone the repository or download the source code.
2.  Navigate to the `BE_Project_Frontend` folder.
3.  Open `index.html` in any modern web browser (Chrome, Firefox, Edge).

## Usage

*   **Navigation**: Use the top navigation bar or keyboard shortcuts (1-7) to switch between screens.
*   **Simulation**:
    *   The application runs in a simulation mode by default.
    *   **Press 'D'**: Trigger a demo drowsiness alert.
    *   **Press 'Esc'**: Dismiss active alerts.

## Screens

1.  **Identification**: Webcam preview and driver profile.
2.  **Dashboard**: Main monitoring view with live status indicators.
3.  **Voice Assistant**: Message reader and voice command interface.
4.  **Rest Stops**: Map view and list of nearby amenities.
5.  **Traffic & Weather**: Route details and environmental conditions.
6.  **Emergency**: Critical alert screen with countdown and emergency actions.
7.  **Audio Monitor**: Sound level visualization and anomaly history.

---
*BE Final Year Project*
