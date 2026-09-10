-- Keep the automatic RLS event trigger internal to Postgres. It never needs to
-- be exposed through the REST API as an RPC endpoint.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Cover foreign keys used by the media control panel so deletes, joins and
-- operator-facing status queries remain fast as the history grows.
create index if not exists live_events_created_by_idx
  on public.live_events (created_by);
create index if not exists live_session_logs_destination_idx
  on public.live_session_logs (destination_id);
create index if not exists radio_schedule_program_idx
  on public.radio_schedule (program_id);
create index if not exists radio_recordings_program_idx
  on public.radio_recordings (program_id);
create index if not exists radio_recordings_media_asset_idx
  on public.radio_recordings (media_asset_id);
create index if not exists audit_logs_actor_idx
  on public.audit_logs (actor_user_id);
create index if not exists social_stream_destinations_created_by_idx
  on public.social_stream_destinations (created_by);

-- Evaluate the JWT once per statement rather than once per row.
alter policy "admins manage live events" on public.live_events
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin'))
  with check (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin'));
alter policy "admins manage destinations" on public.live_destinations
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin'))
  with check (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin'));
alter policy "admins read live logs" on public.live_session_logs
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin'));
alter policy "admins manage media" on public.media_assets
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'editor'))
  with check (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'editor'));
alter policy "radio staff manage programs" on public.radio_programs
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'radio_dj'))
  with check (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'radio_dj'));
alter policy "radio staff manage schedule" on public.radio_schedule
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'radio_dj'))
  with check (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'radio_dj'));
alter policy "radio staff manage recordings" on public.radio_recordings
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'radio_dj'))
  with check (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin', 'radio_dj'));
alter policy "admins read audit logs" on public.audit_logs
  using (((select auth.jwt()) ->> 'role') in ('admin', 'superadmin'));
