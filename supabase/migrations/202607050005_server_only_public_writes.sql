-- Public submissions are accepted only by validated, rate-limited server routes.
-- The service_role used by those routes bypasses RLS; browser anon keys cannot insert.

revoke insert on public.itinerary_requests from anon, authenticated;
revoke insert on public.guide_leads from anon, authenticated;
revoke insert on public.volunteer_applications from anon, authenticated;
revoke insert on public.analytics_events from anon, authenticated;

drop policy if exists "Anyone can create itinerary requests" on public.itinerary_requests;
drop policy if exists "Anyone can create guide leads" on public.guide_leads;
drop policy if exists "Anyone can create volunteer applications" on public.volunteer_applications;
drop policy if exists "Anyone can create analytics events" on public.analytics_events;

create index if not exists analytics_events_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);

create index if not exists payment_webhook_events_processing_status_idx
  on public.payment_webhook_events (processing_status, created_at desc);

create index if not exists payment_requests_provider_reference_idx
  on public.payment_requests (provider, provider_reference);
