"""Test script to verify all dependencies are installed correctly."""
import sys

print("Python version:", sys.version)
print("\nTesting imports...\n")

dependencies = [
    ("fastapi", "FastAPI"),
    ("uvicorn", "Uvicorn"),
    ("cv2", "OpenCV"),
    ("mediapipe", "MediaPipe"),
    ("deepface", "DeepFace"),
    ("whisper", "Whisper"),
    ("vaderSentiment", "VADER"),
    ("numpy", "NumPy"),
    ("pydantic", "Pydantic"),
]

failed = []
succeeded = []

for module_name, display_name in dependencies:
    try:
        __import__(module_name)
        succeeded.append(display_name)
        print(f"✓ {display_name} - OK")
    except ImportError as e:
        failed.append((display_name, str(e)))
        print(f"✗ {display_name} - FAILED: {e}")

print(f"\n{'='*50}")
print(f"Results: {len(succeeded)}/{len(dependencies)} imports successful")

if failed:
    print(f"\n❌ Failed imports:")
    for name, error in failed:
        print(f"  - {name}")
    print("\nPlease install missing dependencies:")
    print("  pip install -r requirements.txt")
    sys.exit(1)
else:
    print("\n✅ All dependencies installed correctly!")
    print("\nYou can now run the server with:")
    print("  python main.py")
