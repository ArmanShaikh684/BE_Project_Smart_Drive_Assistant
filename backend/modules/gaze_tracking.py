import cv2
import numpy as np
import time

# Robust Import Logic
MP_AVAILABLE = False
try:
    import mediapipe as mp
    # Crucial Check: Does 'solutions' actually exist?
    if hasattr(mp, 'solutions'):
        MP_AVAILABLE = True
    else:
        print("⚠️ MediaPipe installed but broken (missing 'solutions'). Gaze tracking disabled.")
except ImportError:
    print("⚠️ MediaPipe not found. Gaze tracking disabled.")
except Exception as e:
    print(f"⚠️ MediaPipe Import Error: {e}")

class GazeTracker:
    def __init__(self):
        self.mp_available = MP_AVAILABLE
        
        if not self.mp_available:
            return
            
        try:
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            self.LEFT_IRIS = [474, 475, 476, 477]
            self.LEFT_EYE_LEFT = 362
            self.LEFT_EYE_RIGHT = 263
            
            self.RIGHT_IRIS = [469, 470, 471, 472]
            self.RIGHT_EYE_LEFT = 33
            self.RIGHT_EYE_RIGHT = 133
            
        except AttributeError:
            print("⚠️ MediaPipe 'solutions' attribute missing during init. Disabling.")
            self.mp_available = False
        except Exception as e:
            print(f"⚠️ GazeTracker Init Error: {e}")
            self.mp_available = False

    def get_gaze_direction(self, frame):
        if not self.mp_available:
            return frame, "Unknown"

        try:
            h, w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)

            direction = "Center"

            if results.multi_face_landmarks:
                mesh_points = np.array([np.multiply([p.x, p.y], [w, h]).astype(int) for p in results.multi_face_landmarks[0].landmark])
                
                def get_ratio(eye_left_idx, eye_right_idx, iris_indices):
                    eye_left = mesh_points[eye_left_idx]
                    eye_right = mesh_points[eye_right_idx]
                    iris_pts = mesh_points[iris_indices]
                    iris_center = np.mean(iris_pts, axis=0).astype(int)
                    # cv2.circle(frame, tuple(iris_center), 2, (0, 255, 255), -1) # REMOVED
                    total_width = np.linalg.norm(eye_right - eye_left)
                    dist_to_left = np.linalg.norm(iris_center - eye_left)
                    return dist_to_left / total_width

                ratio_left = get_ratio(self.LEFT_EYE_LEFT, self.LEFT_EYE_RIGHT, self.LEFT_IRIS)
                ratio_right = get_ratio(self.RIGHT_EYE_LEFT, self.RIGHT_EYE_RIGHT, self.RIGHT_IRIS)
                avg_ratio = (ratio_left + ratio_right) / 2.0
                
                if avg_ratio < 0.42: direction = "Right"
                elif avg_ratio > 0.58: direction = "Left"
                else: direction = "Center"
                    
                cv2.putText(frame, f"Gaze: {direction}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

            return frame, direction
            
        except Exception as e:
            # print(f"⚠️ Gaze Runtime Error: {e}") # Optional: Uncomment to debug
            return frame, "Unknown"
