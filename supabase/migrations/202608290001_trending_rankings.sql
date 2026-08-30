create table if not exists trend_events (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  event_type text not null check (event_type in ('search_impression', 'search_click', 'tool_detail_view', 'compare_add', 'outbound_click', 'share')),
  anonymous_session_hash text not null,
  dedupe_key text not null unique,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (anonymous_session_hash <> '')
);

create table if not exists tool_external_mappings (
  tool_id uuid primary key references tools(id) on delete cascade,
  product_hunt_id text,
  github_owner text,
  github_repo text,
  google_trends_term text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists external_trend_snapshots (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  provider text not null,
  signal_name text not null,
  signal_value numeric not null,
  captured_at timestamptz not null default now(),
  raw_payload_reference text,
  created_at timestamptz not null default now()
);

create table if not exists trend_provider_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  score_version text not null default 'v1',
  status text not null check (status in ('success', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists trend_rankings (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  period text not null check (period in ('today', 'week', 'month', 'new', 'updated')),
  category_id uuid references categories(id) on delete cascade,
  score numeric not null,
  rank integer not null,
  previous_rank integer,
  movement_percent numeric,
  score_confidence text not null default 'low' check (score_confidence in ('high', 'medium', 'low')),
  score_version text not null default 'v1',
  calculated_at timestamptz not null default now(),
  source_status jsonb not null default '{}'::jsonb
);

create table if not exists tool_updates (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  update_type text not null,
  title text not null,
  source_url text,
  published_at timestamptz not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists trend_events_tool_id_idx on trend_events(tool_id);
create index if not exists trend_events_occurred_at_idx on trend_events(occurred_at);
create index if not exists trend_events_type_window_idx on trend_events(event_type, occurred_at, tool_id);
create index if not exists tool_external_mappings_product_hunt_idx on tool_external_mappings(product_hunt_id);
create index if not exists tool_external_mappings_github_idx on tool_external_mappings(github_owner, github_repo);
create index if not exists external_trend_snapshots_tool_provider_idx on external_trend_snapshots(tool_id, provider, captured_at desc);
create index if not exists external_trend_snapshots_captured_at_idx on external_trend_snapshots(captured_at);
create index if not exists trend_rankings_period_rank_idx on trend_rankings(period, rank, calculated_at desc);
create index if not exists trend_rankings_category_period_idx on trend_rankings(category_id, period, rank, calculated_at desc);
create unique index if not exists trend_rankings_snapshot_unique_idx on trend_rankings(period, coalesce(category_id, '00000000-0000-0000-0000-000000000000'::uuid), tool_id, score_version, calculated_at);
create index if not exists trend_rankings_tool_id_idx on trend_rankings(tool_id);
create index if not exists trend_rankings_calculated_at_idx on trend_rankings(calculated_at desc);
create index if not exists tool_updates_tool_id_idx on tool_updates(tool_id);
create index if not exists tool_updates_published_at_idx on tool_updates(published_at desc);
create index if not exists tool_updates_verified_idx on tool_updates(verified, published_at desc);

alter table trend_events enable row level security;
alter table tool_external_mappings enable row level security;
alter table external_trend_snapshots enable row level security;
alter table trend_provider_runs enable row level security;
alter table trend_rankings enable row level security;
alter table tool_updates enable row level security;

drop policy if exists "Public insert anonymized trend events" on trend_events;
create policy "Public insert anonymized trend events"
  on trend_events for insert
  with check (anonymous_session_hash <> '' and dedupe_key <> '');

drop policy if exists "Public read verified tool updates" on tool_updates;
create policy "Public read verified tool updates"
  on tool_updates for select
  using (verified = true);

drop policy if exists "Public read trend rankings" on trend_rankings;
create policy "Public read trend rankings"
  on trend_rankings for select
  using (true);

drop policy if exists "Public read verified external mappings" on tool_external_mappings;
create policy "Public read verified external mappings"
  on tool_external_mappings for select
  using (verified_at is not null);

drop policy if exists "Admin writes trend events" on trend_events;
create policy "Admin writes trend events"
  on trend_events for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes external mappings" on tool_external_mappings;
create policy "Admin writes external mappings"
  on tool_external_mappings for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes external snapshots" on external_trend_snapshots;
create policy "Admin writes external snapshots"
  on external_trend_snapshots for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes trend provider runs" on trend_provider_runs;
create policy "Admin writes trend provider runs"
  on trend_provider_runs for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes trend rankings" on trend_rankings;
create policy "Admin writes trend rankings"
  on trend_rankings for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes tool updates" on tool_updates;
create policy "Admin writes tool updates"
  on tool_updates for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');