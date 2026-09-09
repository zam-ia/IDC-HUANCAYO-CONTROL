create table if not exists public.social_stream_destinations (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique check (platform in ('youtube', 'facebook', 'instagram', 'tiktok', 'custom')),
  display_name text not null,
  ingest_url_encrypted text not null,
  stream_key_encrypted text not null,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.live_destinations
  add column if not exists mux_simulcast_target_id text;

alter table public.live_destinations
  add column if not exists error_severity text
  check (error_severity is null or error_severity in ('normal', 'fatal'));

create index if not exists live_destinations_mux_target_idx
  on public.live_destinations (mux_simulcast_target_id)
  where mux_simulcast_target_id is not null;

drop trigger if exists social_stream_destinations_set_updated_at
  on public.social_stream_destinations;
create trigger social_stream_destinations_set_updated_at
  before update on public.social_stream_destinations
  for each row execute function public.set_media_updated_at();

alter table public.social_stream_destinations enable row level security;

revoke all on public.social_stream_destinations from anon, authenticated;

comment on table public.social_stream_destinations is
  'Encrypted RTMP/RTMPS destination credentials. Service-role access only; never expose rows to a browser client.';
comment on column public.social_stream_destinations.ingest_url_encrypted is
  'AES-256-GCM encrypted ingest URL. Decrypt only inside trusted server actions.';
comment on column public.social_stream_destinations.stream_key_encrypted is
  'AES-256-GCM encrypted stream key. Never return this value to a browser.';
comment on column public.live_destinations.mux_simulcast_target_id is
  'Mux simulcast target id used to correlate target status webhooks.';
