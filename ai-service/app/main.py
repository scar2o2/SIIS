from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import (
    CONFIDENCE_THRESHOLD,
    FRONTEND_ORIGIN,
    POTHOLE_MODEL_PATH,
    ROAD_CRACK_MODEL_PATH,
)
from app.detectors.crack_detector import CrackDetector
from app.detectors.detector_manager import DetectorManager
from app.detectors.pothole_detector import PotholeDetector
from app.routes.prediction import router as prediction_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.detector_manager = DetectorManager(
        [
            PotholeDetector(POTHOLE_MODEL_PATH, CONFIDENCE_THRESHOLD),
            CrackDetector(ROAD_CRACK_MODEL_PATH, CONFIDENCE_THRESHOLD),
        ]
    )
    yield


app = FastAPI(
    title="Smart Infrastructure Intelligence System AI Service",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(prediction_router)


@app.get("/health")
def health() -> dict[str, object]:
    return {"status": "ok", "models_loaded": hasattr(app.state, "detector_manager")}
