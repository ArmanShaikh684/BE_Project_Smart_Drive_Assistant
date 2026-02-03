import cv2
import time
import threading

from modules.whatsapp_bot import start_whatsapp_server
from modules.drowsiness_detection import detect_drowsiness
from modules.head_pose import detect_head_pose
from modules.phone_detection import detect_phone
from modules.voice_assistant import speak, listen_voice, classify_response, play_spotify
from modules.emergency import handle_emergency
from modules.api_services import start_trip_monitoring, stop_trip_monitoring
from modules.gaze_tracking import GazeTracker





print("🚗  Your Smart Driver Assistant Started")
print("🚗  Your Smart Driver Assistant Started")
print("🚗  Your Smart Driver Assistant Started")
print("🚗  Your Smart Driver Assistant Started")

whatsapp_thread = threading.Thread(target=start_whatsapp_server, daemon=True)
whatsapp_thread.start()

# ---------------- CAMERA ----------------
cap = cv2.VideoCapture(0)
time.sleep(1)

# ---------------- GAZE TRACKER ----------------
gaze_tracker = GazeTracker()

last_warning_time = 0
WARNING_COOLDOWN = 25  # seconds
emergency_triggered = False

drowsy_warning_count = 0
last_drowsy_time = 0

head_distraction_start = None
head_warning_count = 0

gaze_distraction_start = None

# New variable to prevent immediate re-triggering after an interaction
last_interaction_time = 0 

# ---------------- AUTOMATIC START ----------------
# No questions asked. Just start monitoring.
start_trip_monitoring()
speak("Trip Monitoring Started.Safe travels.")


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
    frame, gaze_direction = gaze_tracker.get_gaze_direction(frame)

    # ---------------- DECISION LOGIC ----------------
    now = time.time()
    
    # If we just had an interaction (like asking about music), skip logic for 10 seconds
    if now - last_interaction_time < 10:
        cv2.imshow("Smart Driver Assistant", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
        continue

    # ---------------- PHONE LOGIC ----------------
    if phone_detected:
        speak("Do not use phone while driving.")
        last_interaction_time = now # Add small delay so it doesn't spam

    # ---------------- DROWSINESS LOGIC ----------------
    if drowsy_level >= 2:
        if now - last_drowsy_time > 5:  # cooldown between warnings
            speak("You seem tired. Stay alert.")
            drowsy_warning_count += 1
            last_drowsy_time = now

        if drowsy_warning_count >= 2:
            # Instead of immediate emergency, offer music first
            speak("You seem very tired. Would you like me to play a song for you?")
            
            # Update interaction time so we don't re-trigger immediately
            last_interaction_time = time.time()
            
            # Quick listen check
            response = listen_voice(timeout=4)
            decision = classify_response(response)
            
            if decision == "yes":
                play_spotify("playlist")
                drowsy_warning_count = 0 
                last_drowsy_time = time.time() + 30 # Give 30s grace period after music starts
            else:
                # If they say no or don't respond, escalate to emergency
                handle_emergency(cap)
                drowsy_warning_count = 0
                last_drowsy_time = time.time() # Reset timer
                last_interaction_time = time.time()
    else:
        pass

    # ---------------- HEAD POSE & GAZE LOGIC ----------------
    # Combine Head Pose and Gaze for robust distraction detection
    is_distracted = False
    
    if head_pose_level >= 1:
        is_distracted = True
    elif gaze_direction != "Center" and gaze_direction != "Unknown":
        # If head is straight but eyes are looking away for too long
        is_distracted = True
        
    if is_distracted:
        if head_distraction_start is None:
            head_distraction_start = now
        elif now - head_distraction_start > 4:  # distracted > 4 sec (stricter than 5)
            if head_warning_count < 2:
                speak("Keep your eyes on the road.")
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

cap.release()
cv2.destroyAllWindows()
print("✅ System stopped safely.")
