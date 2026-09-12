from pathlib import Path

from .base_detector import BaseDetector


class PotholeDetector(BaseDetector):
    def __init__(self, model_path: Path, confidence_threshold: float):
        super().__init__(model_path, "pothole", confidence_threshold)
