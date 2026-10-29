set search_path = public, extensions;

create or replace function public.hash_request_ip()
returns text
language plpgsql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_headers jsonb;
  v_ip text;
begin
  v_headers := coalesce(
    nullif(current_setting('request.headers', true), ''),
    '{}'
  )::jsonb;

  v_ip := coalesce(
    nullif(btrim(v_headers->>'x-real-ip'), ''),
    nullif(btrim(split_part(coalesce(v_headers->>'x-forwarded-for', ''), ',', 1)), ''),
    'unknown'
  );

  return encode(
    extensions.digest(v_ip || '|perfectwoman-booking-v1', 'sha256'),
    'hex'
  );
end;
$$;

create or replace function public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if p_key_hash is null or length(btrim(p_key_hash)) = 0 then
    raise exception 'INVALID_RATE_LIMIT_KEY' using errcode = 'PT500';
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'INVALID_RATE_LIMIT_CONFIG' using errcode = 'PT500';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  delete from public.rate_limits
  where window_start < now() - interval '1 day';

  insert into public.rate_limits (key_hash, window_start, count)
  values (p_key_hash, v_window_start, 1)
  on conflict (key_hash, window_start) do update
  set count = public.rate_limits.count + 1
  where public.rate_limits.count < p_limit
  returning count into v_count;

  return v_count is not null;
end;
$$;

revoke all on function public.hash_request_ip() from public;
revoke all on function public.consume_rate_limit(text, integer, integer) from public;
