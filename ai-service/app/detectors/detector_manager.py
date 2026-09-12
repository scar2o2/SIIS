from PIL import Image

from .base_detector import BaseDetector, Detection


class DetectorManager:
    def __init__(self, detectors: list[BaseDetector]):
        self.detectors = detectors

    def detect(self, image: Image.Image) -> list[Detection]:
        detections: list[Detection] = []
        for detector in self.detectors:
            detections.extend(detector.detect(image))
        return detections
