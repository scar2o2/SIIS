from io import BytesIO

from PIL import Image, UnidentifiedImageError


ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG"}


class ImageValidationError(ValueError):
    """Raised when an uploaded file is not a supported image."""


def image_from_bytes(contents: bytes) -> Image.Image:
    try:
        image = Image.open(BytesIO(contents))
        image.verify()
        image = Image.open(BytesIO(contents))
    except (UnidentifiedImageError, OSError) as exc:
        raise ImageValidationError("The uploaded file is not a valid image.") from exc

    if image.format not in ALLOWED_IMAGE_FORMATS:
        raise ImageValidationError("Only JPG, JPEG, and PNG images are supported.")

    return image.convert("RGB")
