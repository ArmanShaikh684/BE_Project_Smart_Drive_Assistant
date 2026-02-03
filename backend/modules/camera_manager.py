import cv2

latest_frame = None

def update_frame(frame):
    global latest_frame
    latest_frame = frame.copy()

def save_latest_frame(filename="driver.jpg"):
    if latest_frame is None:
        print("⚠️ No frame available to save.")
        return None

    cv2.imwrite(filename, latest_frame)
    return filename
