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
  -- Animation code written by Claude for this customer, and render progress (0-100)
  animation_html  text,
  stage           text,
  render_progress int not null default 0,
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
