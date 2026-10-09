-- Reference copy of what is applied to the Supabase project "first-bounty" (ref kxyzgfobuhbymujmsgyn, region eu-central-1).
-- It was applied once through the Supabase MCP as the migration "create_waitlist". Kept here so the setup is reproducible.
-- (Not placed in supabase/migrations/ on purpose: the remote migration history already contains it under its own version number.)

-- Waitlist for the First Bounty site.
-- Public (anon) clients may only INSERT a consented signup. Nobody except the project owner can read, change or delete rows.

create table public.waitlist (
  id              uuid        primary key default gen_random_uuid(),
  email           text        not null,
  lang            text        not null default 'en',
  consent         boolean     not null,
  consent_version text        not null,
  source          text        not null default 'site',
  created_at      timestamptz not null default now(),
  constraint waitlist_email_len     check (char_length(email) between 6 and 254),
  constraint waitlist_email_norm    check (email = lower(btrim(email))),
  constraint waitlist_email_format  check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint waitlist_lang_valid    check (lang in ('en', 'gr')),
  constraint waitlist_consent_given check (consent is true),
  constraint waitlist_consent_ver   check (consent_version ~ '^v[0-9]{1,3}$'),
  constraint waitlist_source_valid  check (source ~ '^[a-z0-9_-]{1,40}$')
);

comment on table  public.waitlist                 is 'First Bounty waitlist. Insert-only for anon via RLS; read it from the dashboard / service role.';
comment on column public.waitlist.consent_version is 'Version of the consent wording shown at signup (see docs/privacy.html).';

-- one signup per address (emails are stored lower-cased and trimmed, enforced above)
create unique index waitlist_email_key on public.waitlist (email);

alter table public.waitlist enable row level security;

-- the only policy: anon may insert a row whose consent flag is true. No select/update/delete policies exist.
create policy "public can join the waitlist"
  on public.waitlist
  for insert
  to anon
  with check (consent is true);

-- belt and braces: table privileges, so the API role cannot even attempt anything else
revoke all on table public.waitlist from anon, authenticated;
grant insert (email, lang, consent, consent_version, source) on table public.waitlist to anon;

-- keepalive: a trivial call the daily job can use so a free-plan project is never paused for inactivity
create or replace function public.keepalive()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select pg_catalog.now() $$;

revoke execute on function public.keepalive() from public;
grant  execute on function public.keepalive() to anon;

-- ---------------------------------------------------------------------------
-- Day-to-day (run in the Supabase SQL editor; these run as the project owner, not as anon):
--   select count(*) from public.waitlist;
--   select email, lang, created_at from public.waitlist order by created_at desc;
--   delete from public.waitlist where email = 'person@example.com';   -- erasure request
-- Export everything: Table Editor -> waitlist -> Export -> CSV.
-- ---------------------------------------------------------------------------
