#final squat counter
import sys
import json
import cv2
import mediapipe as mp
import numpy as np
import time

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle
    return angle


#Make detections
if len(sys.argv) > 1:
    # Called from backend with a video file path
    video_path = sys.argv[1]
    cap = cv2.VideoCapture(video_path)
else:
    # Live webcam mode for manual testing
    cap = cv2.VideoCapture(0)


#counter variables
counter = 0
stage = None

# Timer variables
timer_started = False
start_time = 0
TIME_LIMIT = 60  # 1 minute

#Set up mediapipe instance
with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        #Recolor image to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        #Make a detection
        result = pose.process(image)

        #Recolor image to BGR
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        #Extract Landmarks 
        landmarks = None
        if result.pose_landmarks:
            landmarks = result.pose_landmarks.landmark

            # Start timer when pose is first detected
            if not timer_started:
                timer_started = True
                start_time = time.time()

        # Calculate elapsed time
        elapsed_time = 0
        if timer_started:
            elapsed_time = int(time.time() - start_time)

            # If time runs out, exit
            if elapsed_time >= TIME_LIMIT:
                print("Time limit reached. Stopping...")
                break

        try:
            if landmarks:
                #Detect coordinates FOR RIGHT LEG
                right_hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, 
                             landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                right_knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x, 
                              landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
                right_ankle = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x, 
                               landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

                #Detect coordinates FOR LEFT LEG
                left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, 
                            landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
                left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, 
                             landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
                left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, 
                              landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]

                #calculate angles
                angle1 = calculate_angle(right_hip, right_knee, right_ankle)
                angle2 = calculate_angle(left_hip, left_knee, left_ankle)

                #visualize angle
                cv2.putText(image, str(angle1),
                            tuple(np.multiply(right_knee, [640,480]).astype(int)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                        )

                cv2.putText(image, str(angle2),
                            tuple(np.multiply(left_knee, [640,480]).astype(int)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                        )
                
                #counter logic (only if timer has started)
                if timer_started:
                    if (angle1 < 60 and angle2 < 60):
                        stage = "down"
                    if (angle1 > 160 and angle2 > 160 and stage == 'down'):
                        stage = "up"
                        counter += 1
                        print(counter)

        except:
            pass


        #Render curl counter box
        cv2.rectangle(image, (0,0), (250,120), (245, 117, 16), -1)
                    
        #rep label
        cv2.putText(image, "REPS", (10,20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1, cv2.LINE_AA)

        #rep count
        cv2.putText(image, str(counter), (10, 80),
                        cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 2, cv2.LINE_AA
                    )
        
        # Timer display
        cv2.putText(image, f"TIME: {elapsed_time}s",
                    (120,20), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                    (0,0,0), 2, cv2.LINE_AA)

        #Render Detections
        if result.pose_landmarks:
            mp_drawing.draw_landmarks(image, result.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                    mp_drawing.DrawingSpec(color=(245, 116, 66), thickness=2, circle_radius=2),
                                    mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
                                    )

        # Resize the video display window
        scale = 0.4  # 40% of original size — adjust if needed
        frame_resized = cv2.resize(frame, None, fx=scale, fy=scale)
        cv2.imshow("AI Processing", frame_resized)
        cv2.waitKey(1)

        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
# After window closes, output JSON result
output = {
    "reps": int(counter),
    "score": int(counter),  # simple: more reps = better score
    "feedback": "Great squats!" if counter > 20 else "Try to increase your reps."
}

print(json.dumps(output))
