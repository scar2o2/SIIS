-- Run this script once in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  password_hash text,
  role text not null default 'USER'
    check (role in ('USER', 'ADMIN')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_groups (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null check (issue_type in ('POTHOLE', 'ROAD_CRACK', 'broken_bin', 'overflowing_bin', 'trash_on_road')),
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  severity text not null default 'LOW'
    check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  severity_score numeric(8, 4) not null default 0
    check (severity_score >= 0),
  priority text not null default 'LOW'
    check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  priority_score numeric(8, 4) not null default 0
    check (priority_score >= 0),
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'REJECTED')),
  report_count integer not null default 0 check (report_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'REJECTED')),
  description text,
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  severity text not null default 'LOW'
    check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  severity_score numeric(8, 4) not null default 0
    check (severity_score >= 0),
  priority text not null default 'LOW'
    check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  priority_score numeric(8, 4) not null default 0
    check (priority_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png')),
  file_size bigint not null check (file_size > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.detections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  image_id uuid not null references public.images(id) on delete cascade,
  issue_type text not null check (issue_type in ('POTHOLE', 'ROAD_CRACK', 'broken_bin', 'overflowing_bin', 'trash_on_road')),
  confidence numeric(6, 5) not null check (confidence between 0 and 1),
  x1 numeric(12, 2) not null check (x1 >= 0),
  y1 numeric(12, 2) not null check (y1 >= 0),
  x2 numeric(12, 2) not null check (x2 >= x1),
  y2 numeric(12, 2) not null check (y2 >= y1),
  issue_group_id uuid references public.issue_groups(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.report_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  status text not null
    check (status in ('SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'REJECTED')),
  event_type text not null check (event_type in ('CREATED', 'STATUS_CHANGED', 'GROUPED')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- These statements make the script safe for databases created with the
-- original Phase 2 schema.
alter table public.reports drop constraint if exists reports_status_check;
alter table public.reports
  add constraint reports_status_check
  check (status in ('SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED', 'RESOLVED', 'REJECTED'));

alter table public.issue_groups drop constraint if exists issue_groups_issue_type_check;
alter table public.issue_groups
  add constraint issue_groups_issue_type_check
  check (issue_type in ('POTHOLE', 'ROAD_CRACK', 'broken_bin', 'overflowing_bin', 'trash_on_road'));

alter table public.detections drop constraint if exists detections_issue_type_check;
alter table public.detections
  add constraint detections_issue_type_check
  check (issue_type in ('POTHOLE', 'ROAD_CRACK', 'broken_bin', 'overflowing_bin', 'trash_on_road'));

alter table public.users add column if not exists password_hash text;
alter table public.users add column if not exists role text not null default 'USER';
alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('USER', 'ADMIN'));
create unique index if not exists users_email_unique_idx
  on public.users (lower(email));

alter table public.reports add column if not exists severity text not null default 'LOW';
alter table public.reports add column if not exists severity_score numeric(8, 4) not null default 0;
alter table public.reports add column if not exists priority text not null default 'LOW';
alter table public.reports add column if not exists priority_score numeric(8, 4) not null default 0;
alter table public.reports drop constraint if exists reports_severity_check;
alter table public.reports
  add constraint reports_severity_check
  check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
alter table public.reports drop constraint if exists reports_severity_score_check;
alter table public.reports
  add constraint reports_severity_score_check
  check (severity_score >= 0);
alter table public.reports drop constraint if exists reports_priority_check;
alter table public.reports
  add constraint reports_priority_check
  check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'));
alter table public.reports drop constraint if exists reports_priority_score_check;
alter table public.reports
  add constraint reports_priority_score_check
  check (priority_score >= 0);

alter table public.detections add column if not exists issue_group_id uuid;
alter table public.detections
  drop constraint if exists detections_issue_group_id_fkey;
alter table public.detections
  add constraint detections_issue_group_id_fkey
  foreign key (issue_group_id) references public.issue_groups(id) on delete set null;

create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists images_report_id_idx on public.images(report_id);
create index if not exists detections_report_id_idx on public.detections(report_id);
create index if not exists detections_image_id_idx on public.detections(image_id);
create index if not exists issue_groups_location_idx
  on public.issue_groups(latitude, longitude);
create index if not exists issue_groups_issue_type_idx
  on public.issue_groups(issue_type);
create index if not exists detections_issue_group_id_idx
  on public.detections(issue_group_id);
create index if not exists report_history_report_id_idx
  on public.report_history(report_id, created_at desc);

-- Keep the database protected by default. The backend service-role client
-- bypasses RLS for server-side report operations.
alter table public.users enable row level security;
alter table public.issue_groups enable row level security;
alter table public.reports enable row level security;
alter table public.images enable row level security;
alter table public.detections enable row level security;
alter table public.report_history enable row level security;
