import cv2
import os
import time
import dlib
import numpy as np
from scipy.spatial import distance as dist
from collections import deque

# ---------------- PATH ----------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHAPE_PREDICTOR_FILE = os.path.join(BASE_DIR, "models", "shape_predictor_68_face_landmarks.dat")

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(SHAPE_PREDICTOR_FILE)

(lStart, lEnd) = (42, 48)
(rStart, rEnd) = (36, 42)
(mStart, mEnd) = (48, 60)

# ---------------- THRESHOLDS ----------------
EYE_AR_THRESH = 0.21
MOUTH_AR_THRESH = 0.40

EYE_CLOSED_TIME = 2.0      # seconds (microsleep)
YAWN_TIME = 1.5            # seconds

# ---------------- STATE ----------------
eye_closed_start = None
yawn_start = None
fatigue_score = 0

ear_buffer = deque(maxlen=5)  # smoothing window

# ---------------- HELPERS ----------------
def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    return (A + B) / (2.0 * C)

def mouth_aspect_ratio(mouth):
    A = dist.euclidean(mouth[2], mouth[10])
    B = dist.euclidean(mouth[3], mouth[9])
    C = dist.euclidean(mouth[4], mouth[8])
    D = dist.euclidean(mouth[0], mouth[6])
    return (A + B + C) / (3.0 * D)

def enhance_image(frame):
    """
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization)
    to improve face detection in low light or high contrast scenes.
    """
    # Convert to LAB color space
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    # Apply CLAHE to L-channel (Lightness)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)

    # Merge channels back
    limg = cv2.merge((cl, a, b))
    enhanced_frame = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    return enhanced_frame

# ---------------- MAIN FUNCTION ----------------
def detect_drowsiness(frame):
    global eye_closed_start, yawn_start, fatigue_score

    # 1. Enhance image for better detection in varying light
    enhanced_frame = enhance_image(frame)
    
    gray = cv2.cvtColor(enhanced_frame, cv2.COLOR_BGR2GRAY)
    rects = detector(gray)

    drowsy_level = 0
    now = time.time()

    for rect in rects:
        shape = predictor(gray, rect)
        coords = np.array([(shape.part(i).x, shape.part(i).y) for i in range(68)])

        leftEye = coords[lStart:lEnd]
        rightEye = coords[rStart:rEnd]
        mouth = coords[mStart:mEnd]

        ear = (eye_aspect_ratio(leftEye) + eye_aspect_ratio(rightEye)) / 2.0
        mar = mouth_aspect_ratio(mouth)

        # ---------- SMOOTH EAR ----------
        ear_buffer.append(ear)
        ear_avg = sum(ear_buffer) / len(ear_buffer)

        # ---------- EYE CLOSURE (TIME BASED) ----------
        if ear_avg < EYE_AR_THRESH:
            if eye_closed_start is None:
                eye_closed_start = now
            elif now - eye_closed_start >= EYE_CLOSED_TIME:
                fatigue_score += 2
                eye_closed_start = now  # reset
        else:
            eye_closed_start = None

        # ---------- YAWNING (TIME BASED) ----------
        if mar > MOUTH_AR_THRESH:
            if yawn_start is None:
                yawn_start = now
            elif now - yawn_start >= YAWN_TIME:
                fatigue_score += 1
                yawn_start = now
        else:
            yawn_start = None

        # ---------- RECOVERY ----------
        if ear_avg > EYE_AR_THRESH and mar < MOUTH_AR_THRESH:
            fatigue_score = max(0, fatigue_score - 1)

        # ---------- LEVEL ----------
        if fatigue_score >= 5:
            drowsy_level = 3
        elif fatigue_score >= 3:
            drowsy_level = 2
        elif fatigue_score >= 1:
            drowsy_level = 1
        else:
            drowsy_level = 0

        # ---------- DRAW (REMOVED) ----------
        # cv2.drawContours(frame, [cv2.convexHull(leftEye)], -1, (0, 255, 0), 1)
        # cv2.drawContours(frame, [cv2.convexHull(rightEye)], -1, (0, 255, 0), 1)
        # cv2.drawContours(frame, [cv2.convexHull(mouth)], -1, (0, 255, 255), 1)

        cv2.putText(frame, f"Fatigue: {fatigue_score}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    return frame, drowsy_level
