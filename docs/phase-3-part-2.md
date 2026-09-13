# Phase 3 Part 2 - Issue Intelligence

## Objective

Extend Phase 2 reporting without changing the existing YOLO models or adding
unsupported issue types.

## Implemented

- Multiple detections remain in one report.
- Issue groups preserve repeated reports as evidence.
- Duplicate matching uses issue type, configurable geographic distance, and
  bounding-box shape characteristics.
- Rule-based severity uses issue type, relative box area, detection count, and
  confidence as supporting evidence.
- Rule-based priority is separate from severity and uses severity, recurrence,
  and issue type.
- Report statuses are validated: `SUBMITTED`, `UNDER_REVIEW`, `ACKNOWLEDGED`,
  `RESOLVED`, and `REJECTED`.
- Status changes create `report_history` events.
- Report retrieval includes images, detections, and history.
- Statistics are calculated from Supabase data.
- Server-side SMTP notifications are supported for
  `manojcherukuri202@gmail.com`.
- Notification emails attach a server-generated annotated PNG and include a
  Google Maps destination link.
- Frontend displays severity, priority, detection count, and grouping outcome.
- The saved-report view displays an interactive Leaflet/OpenStreetMap map and
  provides a Google Maps link for navigation.
- A public Common Reports page lists all submitted reports and issue groups.

## Database changes

The schema extends the existing tables with severity and priority fields,
adds `issue_groups`, and adds `report_history`. Existing reports, images, and
detections remain preserved.

Apply [schema.sql](../database/schema.sql) in Supabase before using the new
grouping fields.

## APIs

```text
POST  /api/reports
GET   /api/reports/statistics
GET   /api/reports/:reportId
PATCH /api/reports/:reportId/status
```

## Configuration

Backend configuration is in `backend/.env`:

```text
DUPLICATE_DISTANCE_METERS=50
DUPLICATE_SHAPE_TOLERANCE=0.35
EMAIL_TO=manojcherukuri202@gmail.com
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
```

Email is optional until SMTP values are configured. A notification failure does
not delete a successfully stored report.

## Limitations

Severity and priority are explainable estimates, not physical safety
measurements. Duplicate matching is a practical first version and does not
claim that confidence alone proves two images show the same physical object.
Storage and database operations are coordinated with cleanup logic, but are not
one cross-service transaction.

## Verification

- Backend module and route loading: passed
- Frontend lint: passed
- Frontend production build: passed
- Invalid image, missing image, oversized image, and invalid coordinates:
  passed
- Live backend health: passed
- Live statistics endpoint: passed
- Existing duplicate grouping: verified in Supabase with two reports in one
  issue group

SMTP delivery remains dependent on valid provider credentials being configured
in the server environment.
