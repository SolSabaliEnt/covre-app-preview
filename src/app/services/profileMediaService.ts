import type { ApiResult } from '../api/types';
import { getBackendMode } from '../lib/backendMode';
import {
  getStoredProfileImage,
  imageFileToDataUrl,
  PROVIDER_LOGO_KEY,
  saveStoredProfileImage,
  WORKER_PROFILE_PHOTO_KEY,
} from '../lib/profileMedia';
import {
  getCurrentProviderLogoFromSupabase,
  getCurrentWorkerAvatarFromSupabase,
  removeCurrentProviderLogoFromSupabase,
  removeCurrentWorkerAvatarFromSupabase,
  uploadCurrentProviderLogoToSupabase,
  uploadCurrentWorkerAvatarToSupabase,
  type ProfileMediaAsset,
} from '../repositories/profileMediaRepository';

function ok(data: ProfileMediaAsset): ApiResult<ProfileMediaAsset> {
  return { ok: true, data };
}

export async function getCurrentWorkerAvatar(): Promise<ApiResult<ProfileMediaAsset>> {
  if (getBackendMode() === 'supabase') return getCurrentWorkerAvatarFromSupabase();
  const url = getStoredProfileImage(WORKER_PROFILE_PHOTO_KEY) ?? undefined;
  return ok({ url, message: url ? 'Profile photo loaded.' : 'No profile photo yet.' });
}

export async function uploadCurrentWorkerAvatar(file: File): Promise<ApiResult<ProfileMediaAsset>> {
  if (getBackendMode() === 'supabase') return uploadCurrentWorkerAvatarToSupabase(file);
  try {
    const url = await imageFileToDataUrl(file);
    saveStoredProfileImage(WORKER_PROFILE_PHOTO_KEY, url);
    return ok({ url, message: 'Profile photo updated.' });
  } catch (error) {
    return { ok: false, error: { code: 'avatar_upload', message: error instanceof Error ? error.message : 'Unable to update profile photo.' } };
  }
}

export async function removeCurrentWorkerAvatar(): Promise<ApiResult<ProfileMediaAsset>> {
  if (getBackendMode() === 'supabase') return removeCurrentWorkerAvatarFromSupabase();
  saveStoredProfileImage(WORKER_PROFILE_PHOTO_KEY, null);
  return ok({ message: 'Profile photo removed.' });
}

export async function getCurrentProviderLogo(): Promise<ApiResult<ProfileMediaAsset>> {
  if (getBackendMode() === 'supabase') return getCurrentProviderLogoFromSupabase();
  const url = getStoredProfileImage(PROVIDER_LOGO_KEY) ?? undefined;
  return ok({ url, message: url ? 'Organization logo loaded.' : 'No organization logo yet.' });
}

export async function uploadCurrentProviderLogo(file: File): Promise<ApiResult<ProfileMediaAsset>> {
  if (getBackendMode() === 'supabase') return uploadCurrentProviderLogoToSupabase(file);
  try {
    const url = await imageFileToDataUrl(file);
    saveStoredProfileImage(PROVIDER_LOGO_KEY, url);
    return ok({ url, message: 'Organization logo updated.' });
  } catch (error) {
    return { ok: false, error: { code: 'logo_upload', message: error instanceof Error ? error.message : 'Unable to update organization logo.' } };
  }
}

export async function removeCurrentProviderLogo(): Promise<ApiResult<ProfileMediaAsset>> {
  if (getBackendMode() === 'supabase') return removeCurrentProviderLogoFromSupabase();
  saveStoredProfileImage(PROVIDER_LOGO_KEY, null);
  return ok({ message: 'Organization logo removed.' });
}
