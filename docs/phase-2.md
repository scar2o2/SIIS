 # Phase 2 - Persistent Reporting Backend

## Current status

Phase 2 currently supports:

```text
React -> Node.js/Express -> FastAPI -> YOLO
                              |
                              v
                         Node.js -> Supabase
```

The existing Phase 1 image-analysis workflow remains available.
The backend uses port `3000` by default; set `PORT` in `backend/.env` to
override it.

## Implemented

- Express backend with configurable port
- `GET /health`
- `POST /api/ai/predict`
- Node-to-FastAPI image forwarding
- Standardized AI response validation
- Request timeout and clean backend errors
- Supabase PostgreSQL schema
- Private `infrastructure-reports` Storage bucket
- `POST /api/reports`
- Image MIME type and 10 MB validation
- Latitude and longitude validation
- Report persistence
- Image metadata persistence
- Multiple detection persistence per report
- React requests routed through Node.js
- Browser geolocation used when saving a report

## Endpoints

### `GET /health`

Returns:

```json
{
  "status": "ok",
  "service": "backend"
}
```

### `POST /api/ai/predict`

Accepts a multipart field named `file` and forwards it to FastAPI.

### `POST /api/reports`

Accepts:

- `image`
- `latitude`
- `longitude`
- optional `description`

The backend obtains AI detections, uploads the image to private Supabase
Storage, and stores the report, image metadata, and detections.

## Security

- Supabase service-role credentials remain in `backend/.env`.
- The service-role key is never sent to React.
- Storage bucket `infrastructure-reports` is private.
- User-provided filenames are sanitized for metadata.
- Storage paths use generated UUIDs.
- Backend validates coordinates rather than trusting browser input.
- Authentication is not implemented yet.

## Verification completed

| Test | Result |
| --- | --- |
| Backend health | Passed |
| Node to FastAPI | Passed |
| React to Node to FastAPI | Passed |
| Supabase connection | Passed |
| Storage bucket creation | Passed |
| Invalid latitude rejection | Passed |
| Browser report save with device location | Passed |
| Report row persistence | Passed |
| Image metadata persistence | Passed |
| Detection persistence | Passed |
| Invalid image type (`415`) | Passed |
| Missing image (`400`) | Passed |
| Oversized image (`413`) | Passed |
| Invalid longitude (`400`) | Passed |
| Frontend lint | Passed |
| Frontend production build | Passed |

## Not implemented

- Authentication
- User registration
- Mobile camera
- Capacitor
- Android APK
- Severity estimation
- Duplicate detection
- Priority calculation
- Repair scheduling
- Waterlogging model
- Trash model
- Notifications
- Predictive maintenance or future-failure prediction