-- Keep one canonical mailing-list row per normalized email, then enforce that
-- invariant for both the public RPC and any legacy direct inserts.
with ranked_subscribers as (
  select
    id,
    row_number() over (
      partition by lower(trim(email))
      order by (status = 'active') desc, updated_at desc, created_at desc, id
    ) as duplicate_rank
  from public.admin_inbox_records
  where kind = 'subscriber'
)
delete from public.admin_inbox_records as records
using ranked_subscribers as ranked
where records.id = ranked.id
  and ranked.duplicate_rank > 1;

update public.admin_inbox_records
set
  email = lower(trim(email)),
  data = coalesce(data, '{}'::jsonb) || jsonb_build_object(
    'email', lower(trim(email)),
    'status', status
  )
where kind = 'subscriber';

create unique index if not exists admin_inbox_subscriber_email_unique
  on public.admin_inbox_records (lower(email))
  where kind = 'subscriber';

create or replace function public.subscribe_public_inbox(subscriber_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(coalesce(subscriber_email, '')));
  created_timestamp timestamptz := now();
  record_id text := 'ML-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  record_data jsonb;
begin
  if normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'A valid email address is required.' using errcode = '22023';
  end if;

  record_data := jsonb_build_object(
    'id', record_id,
    'kind', 'subscriber',
    'status', 'active',
    'createdAt', created_timestamp,
    'name', '',
    'email', normalized_email,
    'phone', '',
    'country', '',
    'role', '',
    'organisation', '',
    'enquiryType', 'Mailing list',
    'subject', 'Website mailing-list subscription',
    'message', 'Subscribed to receive ArLAR updates.',
    'source', 'Website footer',
    'consent', true
  );

  insert into public.admin_inbox_records (id, kind, status, email, created_at, updated_at, data)
  values (record_id, 'subscriber', 'active', normalized_email, created_timestamp, created_timestamp, record_data)
  on conflict (lower(email)) where kind = 'subscriber'
  do update set
    status = 'active',
    updated_at = excluded.updated_at,
    data = coalesce(admin_inbox_records.data, '{}'::jsonb) || jsonb_build_object(
      'email', normalized_email,
      'status', 'active'
    )
  returning data into record_data;

  return record_data;
end;
$$;

revoke all on function public.subscribe_public_inbox(text) from public;
grant execute on function public.subscribe_public_inbox(text) to anon, authenticated;
