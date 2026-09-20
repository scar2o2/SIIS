# Phase 1 - AI Road Issue Detection

## Objective

Phase 1 proves the core flow:

```text
Upload image -> FastAPI -> pothole model + road-crack model -> JSON -> React results
```

The frontend communicates directly with FastAPI. No Node.js API layer is used.

## Components

- `frontend/` contains the React and Vite interface.
- `ai-service/` contains the FastAPI application and YOLO inference code.
- `ai-service/models/pothole/best.pt` is the existing pothole model.
- `ai-service/models/road-crack/best.pt` is the existing road-crack model.

The models are loaded once during FastAPI application startup and reused for requests.

## Running locally

### AI service

From `ai-service/`:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

### Frontend

From `frontend/` in a second terminal:

```powershell
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

## API

### `GET /health`

Example response:

```json
{
  "status": "ok",
  "models_loaded": true
}
```

### `POST /predict`

Accepts `multipart/form-data` with an image field named `file`.

Example response:

```json
{
  "success": true,
  "image": {
    "width": 676,
    "height": 453
  },
  "detections": [
    {
      "issue_type": "pothole",
      "confidence": 0.8934,
      "bounding_box": {
        "x1": 332.79,
        "y1": 213.8,
        "x2": 429.46,
        "y2": 245.94
      }
    }
  ]
}
```

The frontend uses the original image width and height from the response to scale
bounding boxes correctly over the displayed image.

## Verification completed

| Test | Result |
| --- | --- |
| Both `.pt` files exist | Passed |
| Both models load at startup | Passed |
| `GET /health` | Passed |
| Blank valid image | Passed; empty detections |
| Invalid upload type | Passed; friendly `415` response |
| Pothole image (`p1 (1).jpeg`) | Passed; pothole detections returned |
| Road-crack image (`p3.jpg`) | Passed; road-crack detection returned |
| Both issues (`p2.jpeg`) | Passed; pothole and road-crack detections returned together |
| Neither issue (`black.jpeg`) | Passed; successful response with empty detections |
| Browser pothole flow | Passed; results and annotated boxes displayed |
| Browser road-crack flow | Passed; result and annotated box displayed |
| Browser combined flow | Passed; both issue types displayed simultaneously |
| Browser no-detection flow | Passed; clear empty-result message displayed |
| Browser responsive overlay | Passed; percentage-based boxes remained aligned |
| AI service unavailable | Passed; user-friendly connection error displayed |
| React lint | Passed |
| React production build | Passed |
| React upload and result display | Passed manually |

The frontend also handles unavailable-service errors, invalid API responses, and
analysis requests that exceed the 60-second timeout.

## Configurable values

Copy `ai-service/.env.example` to `ai-service/.env` when custom settings are
needed. The confidence threshold defaults to `0.25`; this is a starting value,
not a claim that it is optimal.

## Phase 1 limitations

This phase does not include:

- user accounts
- registration or login
- database persistence
- report management
- severity estimation
- duplicate detection
- priority calculation
- repair scheduling
- municipality or worker modules
- waterlogging models (trash detection is supported when the trash model is installed)
- notifications
- cloud deployment
- Android APK packaging
