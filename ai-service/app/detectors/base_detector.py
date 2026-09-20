from dataclasses import dataclass
from pathlib import Path
from typing import Any

from PIL import Image
from ultralytics import YOLO


@dataclass(frozen=True)
class Detection:
    issue_type: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float
    class_name: str | None = None

    def as_dict(self) -> dict[str, Any]:
        payload = {
            "issue_type": self.issue_type,
            "confidence": round(self.confidence, 4),
            "bounding_box": {
                "x1": round(self.x1, 2),
                "y1": round(self.y1, 2),
                "x2": round(self.x2, 2),
                "y2": round(self.y2, 2),
            },
        }
        if self.class_name is not None:
            payload["class_name"] = self.class_name
        return payload


class BaseDetector:
    def __init__(self, model_path: Path, issue_type: str, confidence_threshold: float):
        if not model_path.is_file():
            raise FileNotFoundError(f"Model file was not found: {model_path}")

        self.issue_type = issue_type
        self.confidence_threshold = confidence_threshold
        self.model = YOLO(str(model_path))

    def detect(self, image: Image.Image) -> list[Detection]:
        results = self.model.predict(
            source=image,
            conf=self.confidence_threshold,
            verbose=False,
        )
        detections: list[Detection] = []

        for result in results:
            if result.boxes is None:
                continue

            boxes = result.boxes.xyxy.cpu().tolist()
            confidences = result.boxes.conf.cpu().tolist()
            class_ids = result.boxes.cls.cpu().tolist() if result.boxes.cls is not None else []
            model_names = getattr(self.model, "names", {}) or {}

            for index, (coordinates, confidence) in enumerate(zip(boxes, confidences)):
                x1, y1, x2, y2 = coordinates
                class_id = None
                if index < len(class_ids):
                    class_id = int(class_ids[index])
                class_name = None
                if class_id is not None:
                    class_name = model_names.get(class_id)
                detections.append(
                    Detection(
                        issue_type=self.issue_type,
                        confidence=float(confidence),
                        x1=float(x1),
                        y1=float(y1),
                        x2=float(x2),
                        y2=float(y2),
                        class_name=class_name,
                    )
                )

        return detections
