from PIL import Image

from app.detectors.detector_manager import DetectorManager


def predict_image(image: Image.Image, detector_manager: DetectorManager) -> dict:
    detections = detector_manager.detect(image)
    return {
        "success": True,
        "image": {
            "width": image.width,
            "height": image.height,
        },
        "detections": [detection.as_dict() for detection in detections],
    }
