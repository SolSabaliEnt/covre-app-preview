-- Covre profile media: cloud-persisted worker avatars + provider organization logos.
--
-- IMPORTANT: apply this only to the Covre marketplace database. The repository deliberately
-- keeps this migration separate from any other product Supabase project.

begin;

alter table public.worker_profiles
  add column if not exists avatar_path text;

alter table public.provider_organizations
  add column if not exists logo_path text;

comment on column public.worker_profiles.avatar_path is
  'Private Supabase Storage object path in worker-avatars. The database stores a path, never a signed URL.';

comment on column public.provider_organizations.logo_path is
  'Supabase Storage object path in provider-logos. Provider logos are optional organization branding.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'worker-avatars',
    'worker-avatars',
    false,
    3000000,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'provider-logos',
    'provider-logos',
    true,
    3000000,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Workers own the write namespace under their worker profile id. Provider members may read worker
-- avatars through authenticated app surfaces; worker-profile RLS still controls whether the path is
-- surfaced by the application.
drop policy if exists "covre worker reads own avatar" on storage.objects;
drop policy if exists "covre provider members read worker avatars" on storage.objects;
drop policy if exists "covre worker uploads own avatar" on storage.objects;
drop policy if exists "covre worker updates own avatar" on storage.objects;
drop policy if exists "covre worker deletes own avatar" on storage.objects;

create policy "covre worker reads own avatar"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'worker-avatars'
  and exists (
    select 1
    from public.worker_profiles wp
    where wp.id::text = (storage.foldername(name))[1]
      and wp.user_id = auth.uid()
  )
);

create policy "covre provider members read worker avatars"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'worker-avatars'
  and exists (
    select 1
    from public.provider_members pm
    where pm.user_id = auth.uid()
  )
);

create policy "covre worker uploads own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'worker-avatars'
  and exists (
    select 1
    from public.worker_profiles wp
    where wp.id::text = (storage.foldername(name))[1]
      and wp.user_id = auth.uid()
  )
);

create policy "covre worker updates own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'worker-avatars'
  and exists (
    select 1
    from public.worker_profiles wp
    where wp.id::text = (storage.foldername(name))[1]
      and wp.user_id = auth.uid()
  )
)
with check (
  bucket_id = 'worker-avatars'
  and exists (
    select 1
    from public.worker_profiles wp
    where wp.id::text = (storage.foldername(name))[1]
      and wp.user_id = auth.uid()
  )
);

create policy "covre worker deletes own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'worker-avatars'
  and exists (
    select 1
    from public.worker_profiles wp
    where wp.id::text = (storage.foldername(name))[1]
      and wp.user_id = auth.uid()
  )
);

-- Provider logos are public-read branding, but only organization owners/admins can mutate them.
drop policy if exists "covre provider admins upload organization logo" on storage.objects;
drop policy if exists "covre provider admins update organization logo" on storage.objects;
drop policy if exists "covre provider admins delete organization logo" on storage.objects;

create policy "covre provider admins upload organization logo"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'provider-logos'
  and exists (
    select 1
    from public.provider_members pm
    where pm.provider_id::text = (storage.foldername(name))[1]
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'admin')
  )
);

create policy "covre provider admins update organization logo"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'provider-logos'
  and exists (
    select 1
    from public.provider_members pm
    where pm.provider_id::text = (storage.foldername(name))[1]
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'admin')
  )
)
with check (
  bucket_id = 'provider-logos'
  and exists (
    select 1
    from public.provider_members pm
    where pm.provider_id::text = (storage.foldername(name))[1]
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'admin')
  )
);

create policy "covre provider admins delete organization logo"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'provider-logos'
  and exists (
    select 1
    from public.provider_members pm
    where pm.provider_id::text = (storage.foldername(name))[1]
      and pm.user_id = auth.uid()
      and pm.role in ('owner', 'admin')
  )
);

-- Narrow RPCs let the client update only the profile-media path without broadening table UPDATE
-- permissions. Object paths must stay inside the caller's own deterministic folder namespace.
create or replace function public.set_current_worker_avatar_path(p_avatar_path text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_worker_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select wp.id
    into v_worker_id
  from public.worker_profiles wp
  where wp.user_id = auth.uid()
  limit 1;

  if v_worker_id is null then
    raise exception 'Worker profile not found.';
  end if;

  if p_avatar_path is not null
     and p_avatar_path !~ ('^' || v_worker_id::text || '/[A-Za-z0-9._-]+$') then
    raise exception 'Avatar path is outside the current worker namespace.';
  end if;

  update public.worker_profiles
  set avatar_path = p_avatar_path
  where id = v_worker_id;

  return p_avatar_path;
end;
$$;

revoke all on function public.set_current_worker_avatar_path(text) from public, anon;
grant execute on function public.set_current_worker_avatar_path(text) to authenticated;

create or replace function public.set_current_provider_logo_path(p_logo_path text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_provider_id uuid;
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  select pm.provider_id, pm.role
    into v_provider_id, v_role
  from public.provider_members pm
  where pm.user_id = auth.uid()
  order by case pm.role when 'owner' then 0 when 'admin' then 1 else 2 end
  limit 1;

  if v_provider_id is null then
    raise exception 'Provider organization not found.';
  end if;

  if v_role not in ('owner', 'admin') then
    raise exception 'Only organization owners and admins can change the logo.';
  end if;

  if p_logo_path is not null
     and p_logo_path !~ ('^' || v_provider_id::text || '/[A-Za-z0-9._-]+$') then
    raise exception 'Logo path is outside the current provider namespace.';
  end if;

  update public.provider_organizations
  set logo_path = p_logo_path
  where id = v_provider_id;

  return p_logo_path;
end;
$$;

revoke all on function public.set_current_provider_logo_path(text) from public, anon;
grant execute on function public.set_current_provider_logo_path(text) to authenticated;

commit;
