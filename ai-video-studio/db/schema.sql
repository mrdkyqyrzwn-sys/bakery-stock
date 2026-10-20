-- Run once against your Postgres database: psql "$DATABASE_URL" -f db/schema.sql
create extension if not exists pgcrypto;

create table if not exists projects (
  id              uuid primary key default gen_random_uuid(),
  access_hash     text not null,
  site_url        text not null,
  site_data       jsonb not null,
  brief           jsonb not null,
  concepts        jsonb not null,
  style           text,
  duration_s      int,
  aspect          text,
  price_cents     int,
  currency        text,
  paddle_txn_id   text unique,
  status          text not null default 'draft',
  error           text,
  storyboard      jsonb,
  merge_request_id text,
  video_url       text,
  lease_until     timestamptz,
  error_count     int not null default 0,
  ip_hash         text,
  consent_at      timestamptz not null,
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists projects_status_idx on projects (status);
create index if not exists projects_created_idx on projects (created_at);

create table if not exists clips (
  id              bigserial primary key,
  project_id      uuid not null references projects(id) on delete cascade,
  idx             int not null,
  duration_s      int not null,
  prompt          text not null,
  status          text not null default 'pending',
  fal_request_id  text,
  url             text,
  attempts        int not null default 0,
  unique (project_id, idx)
);

create table if not exists rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        int not null default 0,
  primary key (key, window_start)
);

create table if not exists webhook_events (
  id          text primary key,
  received_at timestamptz not null default now()
);
