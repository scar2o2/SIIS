from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.config import MAX_UPLOAD_SIZE_BYTES
from app.services.prediction_service import predict_image
from app.utils.image_utils import ImageValidationError, image_from_bytes


router = APIRouter()


@router.post("/predict")
async def predict(request: Request, file: UploadFile = File(...)) -> dict:
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(
            status_code=415,
            detail="Only JPG, JPEG, and PNG images are supported.",
        )

    contents = await file.read(MAX_UPLOAD_SIZE_BYTES + 1)
    if len(contents) > MAX_UPLOAD_SIZE_BYTES:
        limit_mb = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"The image must be {limit_mb:g} MB or smaller.",
        )

    try:
        image = image_from_bytes(contents)
    except ImageValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return predict_image(image, request.app.state.detector_manager)
