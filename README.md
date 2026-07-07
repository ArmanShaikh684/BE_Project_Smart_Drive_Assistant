# Smart Drive Assistant (SDA)

An AI-powered, full-stack driver safety system designed to prevent accidents caused by fatigue and distraction. This project uses real-time computer vision to monitor the driver and an autonomous telematics system to dispatch emergency alerts.

  <!-- Optional: Add a screenshot URL here -->

---

### **Key Features**

-   **Real-Time Drowsiness & Distraction Detection:** Utilizes **Dlib** and **OpenCV** to track Eye Aspect Ratio (EAR), yawning (MAR), and 3D head pose.
-   **AI Voice Co-Pilot:** A hands-free voice assistant powered by **Google Gemini** for contextual alerts and driver interaction.
-   **Autonomous SOS Protocol:** If the driver is unresponsive, the system automatically records video evidence and dispatches alerts with GPS data via **Twilio (WhatsApp/SMS)** and **SMTP (Email)**.
-   **Object Detection:** Employs **YOLOv8** to detect hazardous in-cabin behavior, such as cell phone usage.
-   **Secure Authentication:** Features both biometric (**Facial Recognition**) and credential-based login.
-   **Live Web Dashboard:** A sleek, real-time dashboard built with **React.js** and **Flask** to visualize all AI telemetry and video feeds.

---

### **System Architecture**

The SDA is built on a decoupled client-server architecture:
-   **Frontend:** A state-driven UI built with **React.js** that polls the backend for real-time data.
-   **Backend:** A multi-threaded **Python Flask** application serving two concurrent APIs:
    1.  **Auth API (Port 5000):** Manages secure login and user registration.
    2.  **AI Core API (Port 5002):** Runs the headless AI engine and streams video/data to the frontend.
-   **Database:** **MySQL** for persistent storage of user profiles and emergency contacts.

---

### **How to Run the System**

#### **Prerequisites**
- Python 3.9+
- Node.js 16+
- MySQL Server
- A webcam

#### **1. Clone the Repository**