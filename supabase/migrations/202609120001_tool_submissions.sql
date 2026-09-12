create table if not exists tool_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  status text not null default 'pending_review' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'needs_changes')),
  tool_name text not null,
  normalized_name text not null,
  official_url text not null,
  normalized_domain text not null,
  tagline text not null,
  category_slug text not null,
  pricing_model text not null,
  platforms text[] not null default '{}',
  submitter_email text not null,
  relationship text,
  duplicate_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tool_submissions_status_created_idx on tool_submissions (status, created_at desc);
create index if not exists tool_submissions_domain_idx on tool_submissions (normalized_domain);
create index if not exists tool_submissions_name_idx on tool_submissions (normalized_name);

alter table tool_submissions enable row level security;

drop policy if exists "Admin reads tool submissions" on tool_submissions;
create policy "Admin reads tool submissions" on tool_submissions for select using ((auth.jwt() ->> 'role') = 'admin');

drop policy if exists "Admin updates tool submissions" on tool_submissions;
create policy "Admin updates tool submissions" on tool_submissions for update using ((auth.jwt() ->> 'role') = 'admin') with check ((auth.jwt() ->> 'role') = 'admin');
