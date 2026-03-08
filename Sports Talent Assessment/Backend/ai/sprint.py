# final 30m run - Option E (simple time-based model without calibration)
import sys
import json
import cv2
import numpy as np
import mediapipe as mp
import time

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

DISTANCE_M = 30.0          # We assume the video covers full 30m
TIME_LIMIT = 20            # Max 20 seconds for a sprint clip
START_DISPLACEMENT = 0.01  # Normalized x-movement to consider "start running"
END_DISPLACEMENT = 0.25    # Normalized x-movement from start to consider "finished"

def calculate_angle(a, b, c):
    a, b, c = np.array(a), np.array(b), np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    return 360 - angle if angle > 180.0 else angle


def main():
    # 1) Open video (from backend) or webcam (manual testing)
    if len(sys.argv) > 1:
        video_path = sys.argv[1]
        cap = cv2.VideoCapture(video_path)
    else:
        cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print(json.dumps({
            "distance_m": DISTANCE_M,
            "time_taken_s": 0.0,
            "avg_speed_mps": 0.0,
            "avg_knee_angle": 0.0,
            "avg_torso_lean": 0.0,
            "avg_arm_angle": 0.0,
            "score": 0,
            "feedback": "Could not open video source."
        }))
        return

    start_clock = None
    end_clock = None
    hip_start_x = None

    knee_angles, torso_leans, arm_angles = [], [], []

    overall_start_time = time.time()

    with mp_pose.Pose(min_detection_confidence=0.7,
                      min_tracking_confidence=0.7) as pose:

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Global timeout (video too long / stuck)
            if time.time() - overall_start_time > TIME_LIMIT + 5:
                break

            h, w, _ = frame.shape

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)
            image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark

                # Get hip midpoint in normalized coordinates (0–1)
                lh = lm[mp_pose.PoseLandmark.LEFT_HIP.value]
                rh = lm[mp_pose.PoseLandmark.RIGHT_HIP.value]
                mid_hip_x = (lh.x + rh.x) / 2.0

                # Initialize baseline hip x on first detection
                if hip_start_x is None:
                    hip_start_x = mid_hip_x

                displacement_norm = abs(mid_hip_x - hip_start_x)

                # Detect sprint start: when displacement crosses small threshold
                if start_clock is None and displacement_norm > START_DISPLACEMENT:
                    start_clock = time.time()

                # Detect sprint end: when displacement passes END_DISPLACEMENT
                if start_clock is not None and end_clock is None and displacement_norm > END_DISPLACEMENT:
                    end_clock = time.time()
                    # We can break here, since we consider 30m done
                    # break  # uncomment if you want to stop immediately

                # ---- Form metrics (just approximate, not critical) ----
                l_knee = [lm[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                          lm[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                l_ankle = [lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                           lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                l_hip = [lm[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                         lm[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                r_shoulder = [lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                              lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                l_shoulder = [lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                              lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
                r_elbow = [lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                           lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
                r_wrist = [lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                           lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

                knee_angle = calculate_angle(l_hip, l_knee, l_ankle)
                torso_lean = calculate_angle(l_shoulder, l_hip, l_ankle)
                arm_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)

                knee_angles.append(knee_angle)
                torso_leans.append(torso_lean)
                arm_angles.append(arm_angle)

                # Overlay basic info (helpful for debugging)
                if start_clock is not None and end_clock is None:
                    elapsed = time.time() - start_clock
                    cv2.putText(image, f"RUNNING... {elapsed:.1f}s",
                                (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                                (0, 0, 255), 2)

                cv2.putText(image, f"Disp: {displacement_norm:.2f}",
                            (30, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7,
                            (0, 255, 255), 2)

                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Resize and show (optional; backend doesn't depend on this)
            scale = 0.5
            preview = cv2.resize(image, None, fx=scale, fy=scale)
            cv2.imshow("30m Sprint Analyzer", preview)

            # Single waitKey call
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            # Overall time limit after runner started
            if start_clock is not None and (time.time() - start_clock > TIME_LIMIT):
                break

        cap.release()
        cv2.destroyAllWindows()

    # ---- Compute final metrics ----
    if start_clock is not None and end_clock is not None:
        total_time = end_clock - start_clock
        avg_speed = DISTANCE_M / total_time if total_time > 0 else 0.0
    else:
        # If we never detected a full run, try using time since runner start or 0
        if start_clock is not None:
            total_time = min(TIME_LIMIT, time.time() - start_clock)
            avg_speed = DISTANCE_M / total_time if total_time > 0 else 0.0
        else:
            total_time = 0.0
            avg_speed = 0.0

    mean_knee = float(np.mean(knee_angles)) if knee_angles else 0.0
    mean_torso = float(np.mean(torso_leans)) if torso_leans else 0.0
    mean_arm = float(np.mean(arm_angles)) if arm_angles else 0.0

    # Example scoring: speed * 10, clamped to 0–100
    if avg_speed > 0:
        raw_score = avg_speed * 10.0
        score = max(0, min(100, int(raw_score)))
    else:
        score = 0

    if total_time <= 0:
        feedback = "Could not detect a complete sprint. Please ensure the full 30m is recorded."
    elif score > 70:
        feedback = "Good sprint! Strong speed and form."
    else:
        feedback = "Try to improve your acceleration and running technique."

    output = {
        "distance_m": DISTANCE_M,
        "time_taken_s": float(f"{total_time:.2f}"),
        "avg_speed_mps": float(f"{avg_speed:.2f}"),
        "avg_knee_angle": float(f"{mean_knee:.1f}"),
        "avg_torso_lean": float(f"{mean_torso:.1f}"),
        "avg_arm_angle": float(f"{mean_arm:.1f}"),
        "score": int(score),
        "feedback": feedback,
    }

    # Final JSON printed for the Node.js backend to parse
    print(json.dumps(output))


if __name__ == "__main__":
    main()
