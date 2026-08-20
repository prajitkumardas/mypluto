create table if not exists tool_imports (
  id uuid primary key default gen_random_uuid(),
  source_filename text not null,
  source_hash text,
  generated_at timestamptz not null default now(),
  worksheet_count integer not null default 0,
  category_sheet_count integer not null default 0,
  canonical_tool_count integer not null default 0,
  import_error_count integer not null default 0,
  summary jsonb not null default '{}'::jsonb
);

create table if not exists import_errors (
  id uuid primary key default gen_random_uuid(),
  import_id uuid references tool_imports(id) on delete cascade,
  sheet_name text,
  row_number integer,
  tool_name text,
  field_name text,
  original_value text,
  error_reason text not null,
  recommended_resolution text,
  created_at timestamptz not null default now()
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  official_url text,
  original_official_url text,
  normalized_domain text,
  short_description text,
  limitations text,
  api_status text,
  api_raw text,
  api_notes text,
  status text,
  media_provenance text default 'lettermark placeholder',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tools_domain_name_idx
  on tools (coalesce(normalized_domain, ''), lower(name));

alter table tools add column if not exists full_description text;
alter table tools add column if not exists category_id uuid;
alter table tools add column if not exists subcategory_id uuid;
alter table tools add column if not exists logo_url text;
alter table tools add column if not exists website_url text;
alter table tools add column if not exists pricing_type text;
alter table tools add column if not exists starting_price numeric;
alter table tools add column if not exists starting_price_raw text;
alter table tools add column if not exists currency text default 'USD';
alter table tools add column if not exists has_free_plan boolean;
alter table tools add column if not exists platforms text[] not null default '{}';
alter table tools add column if not exists api_available boolean;
alter table tools add column if not exists best_for text[] not null default '{}';
alter table tools add column if not exists target_audience text[] not null default '{}';
alter table tools add column if not exists key_features text[] not null default '{}';
alter table tools add column if not exists limitations_list text[] not null default '{}';
alter table tools add column if not exists rating numeric;
alter table tools add column if not exists review_count integer not null default 0;
alter table tools add column if not exists verification_status text not null default 'needs_verification';
alter table tools add column if not exists is_featured boolean not null default false;
alter table tools add column if not exists is_active boolean not null default true;
alter table tools add column if not exists last_verified_at timestamptz;

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  description text,
  workbook_tool_count integer,
  workbook_subcategory_count integer,
  created_at timestamptz not null default now()
);

alter table categories add column if not exists icon text;
alter table categories add column if not exists tool_count integer not null default 0;
alter table categories add column if not exists subcategory_count integer not null default 0;
alter table categories add column if not exists display_order integer not null default 0;
alter table categories add column if not exists is_active boolean not null default true;
alter table categories add column if not exists updated_at timestamptz not null default now();

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  slug text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(category_id, slug)
);

alter table subcategories add column if not exists description text;
alter table subcategories add column if not exists tool_count integer not null default 0;
alter table subcategories add column if not exists is_active boolean not null default true;
alter table subcategories add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tools_category_id_fkey'
  ) then
    alter table tools
      add constraint tools_category_id_fkey
      foreign key (category_id) references categories(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'tools_subcategory_id_fkey'
  ) then
    alter table tools
      add constraint tools_subcategory_id_fkey
      foreign key (subcategory_id) references subcategories(id) on delete set null;
  end if;
end $$;

create table if not exists tool_categories (
  tool_id uuid not null references tools(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (tool_id, category_id)
);

create table if not exists tool_subcategories (
  tool_id uuid not null references tools(id) on delete cascade,
  subcategory_id uuid not null references subcategories(id) on delete cascade,
  primary key (tool_id, subcategory_id)
);

create table if not exists features (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  raw_name text not null
);

create table if not exists tool_features (
  tool_id uuid not null references tools(id) on delete cascade,
  feature_id uuid not null references features(id) on delete cascade,
  raw_value text,
  primary key (tool_id, feature_id)
);

create table if not exists platforms (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  raw_name text not null
);

create table if not exists tool_platforms (
  tool_id uuid not null references tools(id) on delete cascade,
  platform_id uuid not null references platforms(id) on delete cascade,
  raw_value text,
  primary key (tool_id, platform_id)
);

create table if not exists use_cases (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  raw_name text not null
);

create table if not exists tool_use_cases (
  tool_id uuid not null references tools(id) on delete cascade,
  use_case_id uuid not null references use_cases(id) on delete cascade,
  raw_value text,
  primary key (tool_id, use_case_id)
);

create table if not exists target_audiences (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null unique,
  raw_name text not null
);

create table if not exists tool_target_audiences (
  tool_id uuid not null references tools(id) on delete cascade,
  target_audience_id uuid not null references target_audiences(id) on delete cascade,
  raw_value text,
  primary key (tool_id, target_audience_id)
);

create table if not exists pricing_records (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  pricing_model text,
  pricing_model_raw text,
  free_plan_status text,
  free_plan_raw text,
  starting_price_raw text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists verification_records (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  verification_status text not null,
  last_verified_raw text,
  verified_at date,
  source_raw text,
  fields_needing_verification text[],
  created_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  raw_source text not null unique
);

create table if not exists tool_sources (
  tool_id uuid not null references tools(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  primary key (tool_id, source_id)
);

create table if not exists similar_tool_scores (
  tool_id uuid not null references tools(id) on delete cascade,
  similar_tool_id uuid not null references tools(id) on delete cascade,
  score numeric not null,
  explanation text,
  primary key (tool_id, similar_tool_id)
);

create table if not exists tool_events (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'tool_view',
      'website_click',
      'bookmark',
      'compare',
      'share',
      'search_click'
    )
  ),
  anonymous_session_id text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists tool_events_dedupe_idx
  on tool_events (tool_id, event_type, anonymous_session_id);

create table if not exists tool_bookmarks (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references tools(id) on delete cascade,
  user_id uuid,
  anonymous_session_id text,
  created_at timestamptz not null default now(),
  check (user_id is not null or anonymous_session_id is not null)
);

create table if not exists tool_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  anonymous_session_id text,
  tool_ids uuid[] not null,
  created_at timestamptz not null default now(),
  check (array_length(tool_ids, 1) between 2 and 4)
);

create index if not exists categories_slug_idx on categories(slug);
create index if not exists categories_active_order_idx on categories(is_active, display_order, name);
create index if not exists subcategories_category_id_idx on subcategories(category_id);
create index if not exists subcategories_slug_idx on subcategories(slug);
create index if not exists tools_slug_idx on tools(slug);
create index if not exists tools_category_id_idx on tools(category_id);
create index if not exists tools_subcategory_id_idx on tools(subcategory_id);
create index if not exists tools_verification_status_idx on tools(verification_status);
create index if not exists tools_has_free_plan_idx on tools(has_free_plan);
create index if not exists tools_api_available_idx on tools(api_available);
create index if not exists tools_created_at_idx on tools(created_at);
create index if not exists tool_events_tool_id_idx on tool_events(tool_id);
create index if not exists tool_events_created_at_idx on tool_events(created_at);

alter table categories enable row level security;
alter table subcategories enable row level security;
alter table tools enable row level security;
alter table tool_categories enable row level security;
alter table tool_subcategories enable row level security;
alter table tool_events enable row level security;
alter table tool_bookmarks enable row level security;
alter table tool_comparisons enable row level security;

drop policy if exists "Public read active categories" on categories;
create policy "Public read active categories"
  on categories for select
  using (is_active = true);

drop policy if exists "Public read active subcategories" on subcategories;
create policy "Public read active subcategories"
  on subcategories for select
  using (is_active = true);

drop policy if exists "Public read active tools" on tools;
create policy "Public read active tools"
  on tools for select
  using (is_active = true);

drop policy if exists "Public read tool categories" on tool_categories;
create policy "Public read tool categories"
  on tool_categories for select
  using (true);

drop policy if exists "Public read tool subcategories" on tool_subcategories;
create policy "Public read tool subcategories"
  on tool_subcategories for select
  using (true);

drop policy if exists "Public insert analytics events" on tool_events;
create policy "Public insert analytics events"
  on tool_events for insert
  with check (anonymous_session_id <> '');

drop policy if exists "Admin writes categories" on categories;
create policy "Admin writes categories"
  on categories for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes subcategories" on subcategories;
create policy "Admin writes subcategories"
  on subcategories for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin writes tools" on tools;
create policy "Admin writes tools"
  on tools for all
  using ((auth.jwt() ->> 'role') = 'admin')
  with check ((auth.jwt() ->> 'role') = 'admin');
