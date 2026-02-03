import cv2
import dlib
import numpy as np
import os

# ---------------- PATH ----------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREDICTOR_PATH = os.path.join(BASE_DIR, "models", "shape_predictor_68_face_landmarks.dat")

detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(PREDICTOR_PATH)

# ---------------- MODEL ----------------
MODEL_POINTS = np.array([
    (0, 0, 0),          # Nose tip
    (0, -330, -65),     # Chin
    (-225, 170, -135),  # Left eye
    (225, 170, -135),   # Right eye
    (-150, -150, -125), # Left mouth
    (150, -150, -125)   # Right mouth
], dtype=np.float64)

# ---------------- STATE ----------------
CALIBRATION_FRAMES = 30
calib_count = 0
base_yaw = 0
base_pitch = 0

# ---------------- MAIN FUNCTION ----------------
def detect_head_pose(frame):
    global calib_count, base_yaw, base_pitch

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)
    head_pose_level = 0  # 0=forward, 1=side, 2=down

    for face in faces:
        shape = predictor(gray, face)
        coords = np.array([(shape.part(i).x, shape.part(i).y) for i in range(68)], dtype=np.float64)

        image_points = np.array([
            coords[30],  # Nose
            coords[8],   # Chin
            coords[36],  # Left eye
            coords[45],  # Right eye
            coords[48],  # Left mouth
            coords[54]   # Right mouth
        ], dtype=np.float64)

        h, w = frame.shape[:2]
        focal = w
        center = (w / 2, h / 2)

        camera_matrix = np.array([
            [focal, 0, center[0]],
            [0, focal, center[1]],
            [0, 0, 1]
        ], dtype=np.float64)

        dist_coeffs = np.zeros((4, 1))

        success, rvec, _ = cv2.solvePnP(
            MODEL_POINTS, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
        )

        if not success:
            return frame, 0

        rmat, _ = cv2.Rodrigues(rvec)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        pitch = angles[0]
        yaw = angles[1]

        # -------- CALIBRATION --------
        if calib_count < CALIBRATION_FRAMES:
            base_yaw += yaw
            base_pitch += pitch
            calib_count += 1
            cv2.putText(frame, "Calibrating... Look forward",
                        (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
            return frame, 0

        avg_yaw = base_yaw / CALIBRATION_FRAMES
        avg_pitch = base_pitch / CALIBRATION_FRAMES

        rel_yaw = yaw - avg_yaw
        rel_pitch = pitch - avg_pitch

        direction = "Forward"

        if rel_yaw < -20:
            direction = "Left"
            head_pose_level = 1
        elif rel_yaw > 20:
            direction = "Right"
            head_pose_level = 1
        elif rel_pitch > 15:
            direction = "Down"
            head_pose_level = 2

        # -------- DRAW --------
        cv2.putText(frame, f"Head: {direction}", (10, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    return frame, head_pose_level
