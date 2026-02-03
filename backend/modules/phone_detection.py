import cv2
import os
from ultralytics import YOLO

# ---------------- PATH ----------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "yolov8n.pt")

model = YOLO(MODEL_PATH)

# ---------------- CONFIG ----------------
PHONE_LIMIT = 20  # frames (~1 sec at 20fps)

# ---------------- STATE ----------------
phone_counter = 0

# ---------------- MAIN FUNCTION ----------------
def detect_phone(frame):
    global phone_counter

    results = model(frame, stream=True, verbose=False)

    phone_detected = False
    phone_level = 0  # 0=no phone, 1=detected, 2=long usage

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]

            if label == "cell phone":
                phone_detected = True

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, "PHONE", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    if phone_detected:
        phone_counter += 1
    else:
        phone_counter = 0

    if phone_counter > PHONE_LIMIT:
        phone_level = 2
    elif phone_detected:
        phone_level = 1
    else:
        phone_level = 0

    return frame, phone_level

