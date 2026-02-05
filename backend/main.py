import cv2
import time
import threading
import os
from dotenv import load_dotenv

# --- IMPORTS ---
from modules.shared_state import set_current_driver
from modules.dashboard_data import init_trip, update_status, set_ai_message
from modules.dashboard_api import start_dashboard_server # <--- IMPORT API SERVER

# ---------------- SYSTEM START FUNCTION ----------------
def start_monitoring(profile):
    """
    Initializes the monitoring system with the specific driver's settings.
    """
    print(f"\n🚀 WELCOME, {profile['name'].upper()}!")
    print("   Initializing Systems...")

    # 1. Inject Settings into Environment for other modules to read
    os.environ["EMERGENCY_CONTACT_NAME"] = profile["emergency_contact_name"]
    os.environ["EMERGENCY_CONTACT_NUMBER"] = profile["emergency_contact_number"]
    os.environ["EMAIL_RECEIVER"] = profile["email_receiver"]

    # 2. Update Shared State so WhatsApp Bot knows who is driving
    set_current_driver(profile)
    
    # 3. Initialize Dashboard Data
    init_trip()
    set_ai_message(f"Welcome {profile['name']}. System Active.")

    from modules.whatsapp_bot import start_whatsapp_server
    from modules.drowsiness_detection import detect_drowsiness
    from modules.head_pose import detect_head_pose
    from modules.phone_detection import detect_phone
    from modules.voice_assistant import speak, start_listening_thread, get_latest_command, is_listening, play_local_music, stop_music, check_music_queue
    from modules.emergency import handle_emergency
    from modules.api_services import start_trip_monitoring, stop_trip_monitoring
    # from modules.gaze_tracking import GazeTracker # REMOVED

    print("🚗  Your Smart Driver Assistant Started")

    # Start WhatsApp Bot
    whatsapp_thread = threading.Thread(target=start_whatsapp_server, daemon=True)
    whatsapp_thread.start()
    
    # Start Dashboard API (Frontend)
    dashboard_thread = threading.Thread(target=start_dashboard_server, daemon=True)
    dashboard_thread.start()
    print("🌐 Dashboard API running on http://localhost:5001")

    # ---------------- CAMERA ----------------
    cap = cv2.VideoCapture(0)
    time.sleep(1)

    # ---------------- GAZE TRACKER REMOVED ----------------
    # gaze_tracker = GazeTracker()

    last_warning_time = 0
    WARNING_COOLDOWN = 25  # seconds
    emergency_triggered = False

    drowsy_warning_count = 0
    last_drowsy_time = 0

    head_distraction_start = None
    head_warning_count = 0

    # gaze_distraction_start = None # REMOVED

    # New variable to prevent immediate re-triggering after an interaction
    last_interaction_time = 0
    
    # State for async voice command
    waiting_for_music_response = False
    music_prompt_time = 0

    # ---------------- AUTOMATIC START ----------------
    # No questions asked. Just start monitoring.
    print("   - Starting Trip Monitor...")
    start_trip_monitoring()
    speak(f"Welcome {profile['name']}. Have a safe drive.")


    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        from modules.camera_manager import update_frame

        update_frame(frame)

        frame = cv2.resize(frame, (640, 480))
        frame = cv2.flip(frame, 1)

        # ---------------- MODULE CALLS ----------------
        frame, drowsy_level = detect_drowsiness(frame)
        frame, head_pose_level = detect_head_pose(frame)
        frame, phone_detected = detect_phone(frame)
        # frame, gaze_direction = gaze_tracker.get_gaze_direction(frame) # REMOVED

        # ---------------- DASHBOARD UPDATE ----------------
        # Combine Head Pose and Gaze for robust distraction detection
        # is_distracted = (head_pose_level >= 1) or (gaze_direction != "Center" and gaze_direction != "Unknown")
        is_distracted = (head_pose_level >= 1) # Only Head Pose now
        update_status(drowsy_level, is_distracted, phone_detected)

        # ---------------- MUSIC CHECK ----------------
        # Check if song finished to play next one
        check_music_queue()

        # ---------------- DECISION LOGIC ----------------
        now = time.time()
        
        # --- ASYNC VOICE RESPONSE CHECK ---
        if waiting_for_music_response:
            # Check if we got a result
            cmd = get_latest_command()
            
            if cmd == "yes":
                play_local_music()
                set_ai_message("Playing music to keep you alert.")
                drowsy_warning_count = 0 
                last_drowsy_time = now + 30
                waiting_for_music_response = False
                last_interaction_time = now
                
            elif cmd == "no":
                speak("Okay. Please pull over if you are tired.")
                set_ai_message("Driver refused music. Monitoring closely.")
                drowsy_warning_count = 0
                last_drowsy_time = now
                waiting_for_music_response = False
                last_interaction_time = now
                
            elif not is_listening() and cmd is None:
                # Timeout happened (thread finished but no valid command)
                if now - music_prompt_time > 8:
                    speak("No response. Calling emergency contact.")
                    set_ai_message("Driver Unresponsive. Triggering Emergency.")
                    handle_emergency(cap)
                    waiting_for_music_response = False
                    drowsy_warning_count = 0
                    last_drowsy_time = now
                    last_interaction_time = now

        # If we just had an interaction (like asking about music), skip logic for 10 seconds
        if now - last_interaction_time < 10:
            cv2.imshow("Smart Driver Assistant", frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('0'):
                stop_music()
            continue

        # ---------------- PHONE LOGIC ----------------
        if phone_detected:
            speak("Do not use phone while driving.")
            set_ai_message("Phone usage detected. Please focus.")
            last_interaction_time = now # Add small delay so it doesn't spam

        # ---------------- DROWSINESS LOGIC ----------------
        if drowsy_level >= 2:
            if now - last_drowsy_time > 5:  # cooldown between warnings
                speak("You seem tired. Stay alert.")
                set_ai_message("Drowsiness detected. Stay alert.")
                drowsy_warning_count += 1
                last_drowsy_time = now

            if drowsy_warning_count >= 2 and not waiting_for_music_response:
                # Instead of immediate emergency, offer music first
                speak("You seem very tired. Would you like me to play a song for you?")
                set_ai_message("Driver is very tired. Offering music assistance.")
                
                # START ASYNC LISTENING
                start_listening_thread(timeout=5)
                waiting_for_music_response = True
                music_prompt_time = now
                
                # Update interaction time so we don't re-trigger immediately
                last_interaction_time = now
        else:
            pass

        # ---------------- HEAD POSE & GAZE LOGIC ----------------
        if is_distracted:
            if head_distraction_start is None:
                head_distraction_start = now
            elif now - head_distraction_start > 4:  # distracted > 4 sec (stricter than 5)
                if head_warning_count < 2:
                    speak("Keep your eyes on the road.")
                    set_ai_message("Distraction detected. Eyes on road.")
                    head_warning_count += 1
                    head_distraction_start = now
                    last_interaction_time = now
                else:
                    handle_emergency(cap)
                    head_distraction_start = None
                    head_warning_count = 0
                    last_interaction_time = now
        else:
            head_distraction_start = None
            head_warning_count = 0

        # ---------------- DISPLAY ----------------
        cv2.imshow("Smart Driver Assistant", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            print("Received 'q', shutting down...")
            stop_trip_monitoring()
            break
        elif key == ord('0'):
            stop_music()

    cap.release()
    cv2.destroyAllWindows()
    print("✅ System stopped safely.")

# This file is now a module. The main entry point is login_manager.py
if __name__ == "__main__":
    print("This file is not the main entry point anymore.")
    print("Please run 'python login_manager.py' to start the system.")
