import sys
import json
import cv2
import mediapipe as mp
import numpy as np
import time
from sklearn.linear_model import LinearRegression

# Linear regression model for jump height prediction
X = np.array([[20], [40], [60], [80], [100], [120]]).astype(float)
y = np.array([4, 8, 12, 16, 20, 24]).astype(float)
model = LinearRegression().fit(X, y)

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

TIME_LIMIT = 60
JUMP_THRESHOLD = 25
LANDING_THRESHOLD = 15


def get_hip_height(landmarks, image_h):
    lh = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y * image_h
    rh = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y * image_h
    return (lh + rh) / 2


def detect_jump():
    # --- Load video ---
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
        cap = cv2.VideoCapture(video_path)
    else:
        cap = cv2.VideoCapture(0)

    timer_started = False
    start_time = None

    baseline_hip_y = None
    peak_displacement = 0
    jump_started = False
    jump_peaked = False

    with mp_pose.Pose(min_detection_confidence=0.6,
                      min_tracking_confidence=0.6) as pose:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            h, w, _ = frame.shape

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

            # --- Start timer when person appears ---
            if results.pose_landmarks and not timer_started:
                timer_started = True
                start_time = time.time()

            if timer_started:
                elapsed = int(time.time() - start_time)
                cv2.putText(image, f"TIME: {elapsed}s", (20, 40),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

                if elapsed >= TIME_LIMIT:
                    cap.release()
                    cv2.destroyAllWindows()
                    return 0

            # --- Core jump detection ---
            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark
                hipY = get_hip_height(lm, h)

                if baseline_hip_y is None:
                    baseline_hip_y = hipY

                displacement = baseline_hip_y - hipY

                # Track peak value
                peak_displacement = max(peak_displacement, displacement)

                if displacement > JUMP_THRESHOLD and not jump_started:
                    jump_started = True

                if jump_started and displacement < peak_displacement - 5:
                    jump_peaked = True

                if jump_peaked and hipY > baseline_hip_y - LANDING_THRESHOLD:
                    break

                mp_drawing.draw_landmarks(image, results.pose_landmarks,
                                          mp_pose.POSE_CONNECTIONS)

            # --- Single waitKey call + display RESIZED processed frame ---
            scale = 0.5
            preview = cv2.resize(image, None, fx=scale, fy=scale)
            cv2.imshow("AI Processing", preview)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    # --- Calculate jump height ---
    if peak_displacement >= JUMP_THRESHOLD:
        height_cm = float(model.predict([[peak_displacement]])[0])
        return round(height_cm, 2)

    return 0


if __name__ == "__main__":
    height = detect_jump()
    score = float(height)

    output = {
        "jump_height_cm": height,
        "score": score,
        "feedback": "Excellent jump!" if height > 30 else "Try to jump higher."
    }

    print(json.dumps(output))
