# Supabase database setup

The current schema is in [schema.sql](schema.sql).

## Apply the schema

1. Open the Supabase project dashboard.
2. Open **SQL Editor**.
3. Create a new query.
4. Paste the complete contents of `database/schema.sql`.
5. Run the query.

The script creates:

- `users`
- `issue_groups`
- `reports`
- `images`
- `detections`
- `report_history`

Relationships:

```text
users -> reports -> images -> detections
              |                  |
              v                  v
         report_history     issue_groups
```

Images are represented by metadata in PostgreSQL. The actual image binary will
be stored in the private `infrastructure-reports` Supabase Storage bucket.

## Create the Storage bucket

From `backend/`, with the Supabase values configured in `.env`, run:

```powershell
npm run setup:storage
```

The command is safe to run again. It checks whether the private bucket already
exists before creating it. Only the backend service-role client can manage this
bucket; its key must never be exposed to the frontend.

The schema stores the fields required for rule-based severity and priority,
issue grouping, duplicate-report evidence, validated report statuses, and
report history. The grouping and scoring behavior is implemented by the
backend in a later step.

The schema includes the account fields required by backend authentication:
password hashes and `USER`/`ADMIN` roles. Passwords are hashed by the backend;
the service-role key and password hashes must never be exposed to the frontend.
Scheduling, waterlogging, trash, and predictive-maintenance features are not
included.

New accounts are assigned the `USER` role. Promote trusted admins manually in
Supabase:

```sql
update public.users
set role = 'ADMIN'
where lower(email) = lower('admin@example.com');
```
