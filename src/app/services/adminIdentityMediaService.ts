import type { ApiResult } from '../api/types';
import { getBackendMode } from '../lib/backendMode';
import {
  getStoredProfileImage,
  PROVIDER_LOGO_KEY,
  WORKER_PROFILE_PHOTO_KEY,
} from '../lib/profileMedia';
import { getSupabaseClient } from '../lib/supabaseClient';
import {
  createProviderLogoPublicUrl,
  createWorkerAvatarSignedUrl,
} from '../repositories/profileMediaRepository';

export type AdminIdentityKind = 'worker' | 'provider' | 'admin';

export type AdminIdentityLookup = {
  kind: AdminIdentityKind;
  entityId?: string;
  userId?: string;
  name?: string;
};

const cache = new Map<string, string | undefined>();

function cacheKey(input: AdminIdentityLookup): string {
  return [input.kind, input.entityId ?? '', input.userId ?? '', input.name?.trim().toLowerCase() ?? ''].join('|');
}

function ok(url?: string): ApiResult<{ url?: string }> {
  return { ok: true, data: { url } };
}

function mockIdentityUrl(input: AdminIdentityLookup): string | undefined {
  const normalized = input.name?.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase() ?? '';

  if (input.kind === 'worker') {
    const isCurrentPreviewWorker = input.entityId === 'worker-001' || normalized === 'maya johnson';
    return isCurrentPreviewWorker ? getStoredProfileImage(WORKER_PROFILE_PHOTO_KEY) ?? undefined : undefined;
  }

  if (input.kind === 'provider') {
    const isCurrentPreviewProvider = normalized.includes('evergreen');
    return isCurrentPreviewProvider ? getStoredProfileImage(PROVIDER_LOGO_KEY) ?? undefined : undefined;
  }

  return undefined;
}

async function resolveWorkerFromSupabase(input: AdminIdentityLookup): Promise<string | undefined> {
  const supabase = getSupabaseClient();
  let query = supabase.from('worker_profiles').select('id, avatar_path').limit(1);

  if (input.entityId) query = query.eq('id', input.entityId);
  else if (input.userId) query = query.eq('user_id', input.userId);
  else return undefined;

  const { data, error } = await query.maybeSingle();
  if (error || !data?.avatar_path) return undefined;
  return createWorkerAvatarSignedUrl(data.avatar_path as string);
}

async function resolveProviderFromSupabase(input: AdminIdentityLookup): Promise<string | undefined> {
  const supabase = getSupabaseClient();
  let providerId = input.entityId;

  if (!providerId && input.userId) {
    const { data: membership, error: membershipError } = await supabase
      .from('provider_members')
      .select('provider_id')
      .eq('user_id', input.userId)
      .limit(1)
      .maybeSingle();
    if (membershipError) return undefined;
    providerId = membership?.provider_id as string | undefined;
  }

  if (!providerId) return undefined;
  const { data, error } = await supabase
    .from('provider_organizations')
    .select('logo_path')
    .eq('id', providerId)
    .maybeSingle();
  if (error || !data?.logo_path) return undefined;
  return createProviderLogoPublicUrl(data.logo_path as string);
}

export async function getAdminIdentityImage(input: AdminIdentityLookup): Promise<ApiResult<{ url?: string }>> {
  const key = cacheKey(input);
  if (cache.has(key)) return ok(cache.get(key));

  try {
    let url: string | undefined;
    if (getBackendMode() === 'supabase') {
      if (input.kind === 'worker') url = await resolveWorkerFromSupabase(input);
      if (input.kind === 'provider') url = await resolveProviderFromSupabase(input);
    } else {
      url = mockIdentityUrl(input);
    }

    cache.set(key, url);
    return ok(url);
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'admin_identity_media',
        message: error instanceof Error ? error.message : 'Unable to load identity image.',
      },
    };
  }
}
