import face_recognition
import cv2
import os
import time
import numpy as np

from modules.db_mysql import get_driver_profile

FACES_DIR = "known_faces"

# Default "Guest" Profile (Fallback if face not recognized)
GUEST_PROFILE = {
    "name": "Guest Driver",
    "emergency_contact_name": "Car Owner",
    "emergency_contact_number": "whatsapp:+919356671768",  # CHANGE THIS
    "email_receiver": "armanshaikh5251@gmail.com",
    "trusted_contacts": {}
}


def load_known_faces():
    """Loads all .jpg files from known_faces/ and encodes them."""
    known_encodings = []
    known_ids = []

    if not os.path.exists(FACES_DIR):
        print("⚠️ No known_faces folder found.")
        return [], []

    print("⏳ Loading known drivers...")
    count = 0
    for filename in os.listdir(FACES_DIR):
        if filename.endswith(".jpg") or filename.endswith(".png"):
            path = os.path.join(FACES_DIR, filename)
            driver_id = os.path.splitext(filename)[0]  # arman_shaikh.jpg -> arman_shaikh

            try:
                img = face_recognition.load_image_file(path)
                encodings = face_recognition.face_encodings(img)
                if encodings:
                    known_encodings.append(encodings[0])
                    known_ids.append(driver_id)
                    count += 1
            except Exception as e:
                print(f"Skipping {filename}: {e}")

    print(f"✅ Loaded {count} face(s).")
    return known_encodings, known_ids

# Share the latest frame with the API server so the frontend can see it
latest_scan_frame = None

def recognize_driver():
    """
    Scans camera for 8 seconds. Returns Driver Profile (dict) if matched.
    (Headless version - no cv2.imshow popups to freeze the server)
    """
    global latest_scan_frame
    known_encodings, known_ids = load_known_faces()

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("❌ Could not open camera for face login.")
        return None

    print("\n👀 SCANNING FACE IN BACKGROUND... (Look at the camera)")

    start_time = time.time()
    detected_id = None

    while (time.time() - start_time) < 8:  # Try for 8 seconds
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue
            
        frame = cv2.flip(frame, 1)

        # Resize for faster processing
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        # Detect faces in current frame
        face_locs = face_recognition.face_locations(rgb_small_frame)
        face_encs = face_recognition.face_encodings(rgb_small_frame, face_locs)

        for (top, right, bottom, left) in face_locs:
            # Scale back up for drawing on original frame
            top *= 4
            right *= 4
            bottom *= 4
            left *= 4
            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
            
        latest_scan_frame = frame.copy()

        for face_encoding in face_encs:
            # Compare with known faces
            if not known_encodings:
                break

            matches = face_recognition.compare_faces(known_encodings, face_encoding, tolerance=0.5)
            face_distances = face_recognition.face_distance(known_encodings, face_encoding)

            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    detected_id = known_ids[best_match_index]
                    break

        if detected_id:
            break

    cap.release()

    if detected_id:
        print(f"✅ FACE RECOGNIZED: {detected_id}")
        profile = get_driver_profile(detected_id)
        if profile: return profile
    else:
        print("❌ Face not recognized.")

    # Option: Return None to force exit, or GUEST_PROFILE to allow driving anyway
    return None