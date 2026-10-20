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
  -- Photos the customer uploaded: [{ "url": "..." }]
  uploads         jsonb not null default '[]'::jsonb,
  -- Production plan and generated media (images, narration, music) so a retry can resume
  plan            jsonb,
  media           jsonb,
  -- Animation code written by Claude for this customer, and render progress (0-100)
  animation_html  text,
  -- Customer revisions after delivery: pending request, how many were used, and history
  revision_request jsonb,
  revision_count  int not null default 0,
  revisions       jsonb not null default '[]'::jsonb,
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

-- Coupon codes. percent = 100 means free: the order skips Paddle and goes straight to production.
-- max_uses limits how many orders can use a code (null = unlimited). Codes are stored upper-case.
create table if not exists coupons (
  code        text primary key,
  percent     int not null check (percent between 1 and 100),
  max_uses    int,
  uses        int not null default 0,
  expires_at  timestamptz,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
alter table projects add column if not exists coupon_code text references coupons (code);

-- The owner's free code. Change max_uses, or set active = false, to limit or turn it off.
insert into coupons (code, percent, max_uses) values ('MORDECHAI10', 100, 50) on conflict (code) do nothing;
