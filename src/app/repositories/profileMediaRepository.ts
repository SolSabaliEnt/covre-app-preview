import type { ApiResult } from '../api/types';
import { getSupabaseClient } from '../lib/supabaseClient';

export type ProfileMediaAsset = {
  path?: string;
  url?: string;
  message: string;
};

const WORKER_BUCKET = 'worker-avatars';
const PROVIDER_BUCKET = 'provider-logos';
const MAX_BYTES = 3_000_000;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail<T = never>(code: string, message: string): ApiResult<T> {
  return { ok: false, error: { code, message } };
}

function validateImage(file: File): ApiResult<never> | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return fail('unsupported_image', 'Use a JPG, PNG, or WebP image.');
  }
  if (file.size > MAX_BYTES) {
    return fail('image_too_large', 'Choose an image smaller than 3 MB.');
  }
  return null;
}

function extensionFor(file: File): string {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

async function signedWorkerUrl(path?: string | null): Promise<string | undefined> {
  if (!path) return undefined;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from(WORKER_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return undefined;
  return data?.signedUrl ?? undefined;
}

export async function getCurrentWorkerAvatarFromSupabase(): Promise<ApiResult<ProfileMediaAsset>> {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return fail('not_authenticated', 'Sign in before loading your profile photo.');

    const { data, error } = await supabase
      .from('worker_profiles')
      .select('avatar_path')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) return fail('avatar_load', error.message);

    const path = (data?.avatar_path as string | null | undefined) ?? undefined;
    return ok({ path, url: await signedWorkerUrl(path), message: path ? 'Profile photo loaded.' : 'No profile photo yet.' });
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to load profile photo.');
  }
}

export async function uploadCurrentWorkerAvatarToSupabase(file: File): Promise<ApiResult<ProfileMediaAsset>> {
  const validation = validateImage(file);
  if (validation) return validation;

  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return fail('not_authenticated', 'Sign in before changing your profile photo.');

    const { data: worker, error: workerError } = await supabase
      .from('worker_profiles')
      .select('id, avatar_path')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (workerError) return fail('worker_profile_load', workerError.message);
    if (!worker?.id) return fail('worker_profile_missing', 'Finish your worker profile before adding a photo.');

    const previousPath = (worker.avatar_path as string | null | undefined) ?? undefined;
    const path = `${worker.id}/avatar-${Date.now()}.${extensionFor(file)}`;
    const { error: uploadError } = await supabase.storage.from(WORKER_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
    if (uploadError) return fail('avatar_upload', uploadError.message);

    const { error: rpcError } = await supabase.rpc('set_current_worker_avatar_path', { p_avatar_path: path });
    if (rpcError) {
      await supabase.storage.from(WORKER_BUCKET).remove([path]);
      return fail('avatar_save', rpcError.message);
    }

    if (previousPath && previousPath !== path) {
      await supabase.storage.from(WORKER_BUCKET).remove([previousPath]);
    }

    return ok({ path, url: await signedWorkerUrl(path), message: 'Profile photo updated.' });
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to update profile photo.');
  }
}

export async function removeCurrentWorkerAvatarFromSupabase(): Promise<ApiResult<ProfileMediaAsset>> {
  try {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return fail('not_authenticated', 'Sign in before changing your profile photo.');

    const { data: worker, error: workerError } = await supabase
      .from('worker_profiles')
      .select('avatar_path')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (workerError) return fail('avatar_load', workerError.message);
    const previousPath = (worker?.avatar_path as string | null | undefined) ?? undefined;

    const { error: rpcError } = await supabase.rpc('set_current_worker_avatar_path', { p_avatar_path: null });
    if (rpcError) return fail('avatar_remove', rpcError.message);
    if (previousPath) await supabase.storage.from(WORKER_BUCKET).remove([previousPath]);

    return ok({ message: 'Profile photo removed.' });
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to remove profile photo.');
  }
}

async function currentProviderContext() {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { supabase, providerId: undefined as string | undefined, role: undefined as string | undefined };
  const { data } = await supabase
    .from('provider_members')
    .select('provider_id, role')
    .eq('user_id', session.user.id)
    .order('role', { ascending: true })
    .limit(1)
    .maybeSingle();
  return { supabase, providerId: data?.provider_id as string | undefined, role: data?.role as string | undefined };
}

function providerPublicUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  const supabase = getSupabaseClient();
  return supabase.storage.from(PROVIDER_BUCKET).getPublicUrl(path).data.publicUrl ?? undefined;
}

export async function getCurrentProviderLogoFromSupabase(): Promise<ApiResult<ProfileMediaAsset>> {
  try {
    const { supabase, providerId } = await currentProviderContext();
    if (!providerId) return fail('provider_required', 'Join or create a provider organization first.');
    const { data, error } = await supabase.from('provider_organizations').select('logo_path').eq('id', providerId).maybeSingle();
    if (error) return fail('logo_load', error.message);
    const path = (data?.logo_path as string | null | undefined) ?? undefined;
    return ok({ path, url: providerPublicUrl(path), message: path ? 'Organization logo loaded.' : 'No organization logo yet.' });
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to load organization logo.');
  }
}

export async function uploadCurrentProviderLogoToSupabase(file: File): Promise<ApiResult<ProfileMediaAsset>> {
  const validation = validateImage(file);
  if (validation) return validation;

  try {
    const { supabase, providerId, role } = await currentProviderContext();
    if (!providerId) return fail('provider_required', 'Join or create a provider organization first.');
    if (role !== 'owner' && role !== 'admin') return fail('forbidden', 'Only organization owners and admins can change the logo.');

    const { data: org, error: orgError } = await supabase.from('provider_organizations').select('logo_path').eq('id', providerId).maybeSingle();
    if (orgError) return fail('logo_load', orgError.message);
    const previousPath = (org?.logo_path as string | null | undefined) ?? undefined;
    const path = `${providerId}/logo-${Date.now()}.${extensionFor(file)}`;

    const { error: uploadError } = await supabase.storage.from(PROVIDER_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
    if (uploadError) return fail('logo_upload', uploadError.message);

    const { error: rpcError } = await supabase.rpc('set_current_provider_logo_path', { p_logo_path: path });
    if (rpcError) {
      await supabase.storage.from(PROVIDER_BUCKET).remove([path]);
      return fail('logo_save', rpcError.message);
    }

    if (previousPath && previousPath !== path) await supabase.storage.from(PROVIDER_BUCKET).remove([previousPath]);
    return ok({ path, url: providerPublicUrl(path), message: 'Organization logo updated.' });
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to update organization logo.');
  }
}

export async function removeCurrentProviderLogoFromSupabase(): Promise<ApiResult<ProfileMediaAsset>> {
  try {
    const { supabase, providerId, role } = await currentProviderContext();
    if (!providerId) return fail('provider_required', 'Join or create a provider organization first.');
    if (role !== 'owner' && role !== 'admin') return fail('forbidden', 'Only organization owners and admins can change the logo.');

    const { data: org, error: orgError } = await supabase.from('provider_organizations').select('logo_path').eq('id', providerId).maybeSingle();
    if (orgError) return fail('logo_load', orgError.message);
    const previousPath = (org?.logo_path as string | null | undefined) ?? undefined;

    const { error: rpcError } = await supabase.rpc('set_current_provider_logo_path', { p_logo_path: null });
    if (rpcError) return fail('logo_remove', rpcError.message);
    if (previousPath) await supabase.storage.from(PROVIDER_BUCKET).remove([previousPath]);
    return ok({ message: 'Organization logo removed.' });
  } catch (error) {
    return fail('unexpected', error instanceof Error ? error.message : 'Unable to remove organization logo.');
  }
}

export async function createWorkerAvatarSignedUrl(path?: string | null): Promise<string | undefined> {
  return signedWorkerUrl(path);
}

export function createProviderLogoPublicUrl(path?: string | null): string | undefined {
  return providerPublicUrl(path);
}
