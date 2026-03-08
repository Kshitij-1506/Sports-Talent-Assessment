import sys
import json
import subprocess
import os

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: runner.py <testType> <videoPath>"}))
        sys.exit(1)

    test_type = sys.argv[1]      # "sprint", "squats", "jump"
    video_path = sys.argv[2]

    base_dir = os.path.dirname(os.path.abspath(__file__))

    script_map = {
        "sprint": "sprint.py",
        "squats": "squats.py",
        "jump": "vertical_jump.py",
    }

    if test_type not in script_map:
        print(json.dumps({"error": f"Invalid test type: {test_type}"}))
        sys.exit(1)

    script_path = os.path.join(base_dir, script_map[test_type])

    try:
        # Use same Python interpreter that launched this file
        cmd = ["C:\\Users\\morek\\AppData\\Local\\Programs\\Python\\Python310\\python.exe",script_path,video_path]
        out = subprocess.check_output(cmd, stderr=subprocess.STDOUT)
        # Just print Python script output as-is; Node will parse last JSON line
        print(out.decode("utf-8"))
    except subprocess.CalledProcessError as e:
        print(json.dumps({
            "error": "Model execution failed",
            "details": e.output.decode("utf-8", errors="ignore")
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
