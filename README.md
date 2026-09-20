# Smart Infrastructure Intelligence System

This repository contains the Smart Infrastructure Intelligence System (SIIS)
project. Phase 1 detection and the core Phase 2/3 reporting workflow are
implemented: authentication, user-owned reports, admin review, report filtering,
duplicate issue grouping, and nearby map search.

## Phase 1 goal

The system will let a user upload a road image, send it to an AI service, run pothole and road-crack detection models, and display the results in a simple web interface.

## Architecture

- Frontend: React + Vite
- AI service: Python + FastAPI + Ultralytics YOLO
- Model flow: upload image -> pothole model -> crack model -> combine results -> display in browser

## Project structure

- `frontend/` — React web interface
- `ai-service/` — Python FastAPI service and model logic
- `docs/` — project documentation
- `backend/` — Node.js and Express application backend
- `database/` — Supabase PostgreSQL schema and setup instructions
- `datasets/`, `tests/` — project support folders

## Model placement

Use the existing trained YOLO model files in these locations:

- `ai-service/models/pothole/best.pt`
- `ai-service/models/road-crack/best.pt`

Do not retrain or replace the original model files.

## Current scope

The web app includes:

- registration and JWT login/logout
- `USER` and `ADMIN` role separation
- profile and My Reports pages
- public report/group browsing with filters
- admin dashboard and report status controls
- nearby issue-group search with configurable radius

The current scope does not include:

- waterlogging models (trash detection is supported when the trash model is installed)
- repair scheduling
- Android APK generation

## Starting the AI service

From the project root, activate the existing virtual environment and start FastAPI:

```powershell
cd "ai-service"
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The service exposes:

- `GET http://localhost:8000/health`
- `POST http://localhost:8000/predict` with a multipart field named `file`

Models are loaded once during FastAPI startup. The current model metadata is:

- Pothole model: segmentation model with `Manhole`, `Pothole`, and `Unmarked Bump` classes
- Road-crack model: segmentation model with `crack` and `damage` classes
- Both models use their returned bounding boxes; the configured confidence threshold defaults to `0.25`

The threshold is configurable through `ai-service/.env`. Copy [ai-service/.env.example](ai-service/.env.example) to `ai-service/.env` to customize model paths, threshold, upload size, or the frontend origin.

## Current status

Phase 1 detection remains available through the Phase 2 request path:

1. FastAPI loads both existing YOLO models at startup.
2. `POST /predict` accepts an image and runs both models.
3. Node.js forwards `POST /api/ai/predict` requests to FastAPI.
4. The frontend displays confidence values and scaled bounding boxes.

See [docs/phase-1.md](docs/phase-1.md) for setup commands, API details, and
verification results.

Phase 2 progress is documented in [docs/phase-2.md](docs/phase-2.md).

## Starting the backend

From the project root, start the Node.js backend after configuring
`backend/.env`:

```powershell
cd "backend"
npm install
npm start
```

The backend listens on `http://localhost:3000` by default and exposes the
reporting APIs documented in [docs/phase-2.md](docs/phase-2.md).

Key routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/reports`
- `GET /api/reports`
- `GET /api/reports/mine`
- `GET /api/reports/nearby`
- `GET /api/reports/admin`
- `GET /api/reports/statistics`
- `PATCH /api/reports/:reportId/status`

User-owned and admin routes require `Authorization: Bearer <token>`.

## Phase 2 database setup

The Supabase schema is documented in [database/README.md](database/README.md).
Run [database/schema.sql](database/schema.sql) in the Supabase SQL Editor before
implementing report persistence.

New accounts are created with the `USER` role. To promote an administrator, run
an update like this in Supabase after that user registers:

```sql
update public.users
set role = 'ADMIN'
where lower(email) = lower('admin@example.com');
```
