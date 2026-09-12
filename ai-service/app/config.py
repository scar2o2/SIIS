from pathlib import Path
import os

from dotenv import load_dotenv


SERVICE_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(SERVICE_ROOT / ".env")


def resolve_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else SERVICE_ROOT / path


POTHOLE_MODEL_PATH = resolve_path(
    os.getenv("POTHOLE_MODEL_PATH", "models/pothole/best.pt")
)
ROAD_CRACK_MODEL_PATH = resolve_path(
    os.getenv("ROAD_CRACK_MODEL_PATH", "models/road-crack/best.pt")
)
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
MAX_UPLOAD_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024)))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
