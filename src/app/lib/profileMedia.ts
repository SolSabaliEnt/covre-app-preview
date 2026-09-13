import { useEffect, useState } from 'react';

export const WORKER_PROFILE_PHOTO_KEY = 'covre.worker.profile-photo';
export const PROVIDER_LOGO_KEY = 'covre.provider.organization-logo';
export const PROVIDER_PROFILE_ABOUT_KEY = 'covre.provider.profile-about';

const PROFILE_MEDIA_EVENT = 'covre-profile-media-updated';

export function getStoredProfileImage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveStoredProfileImage(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent(PROFILE_MEDIA_EVENT, { detail: { key } }));
  } catch {
    // Local preview storage can fail in private browsing or when storage is full.
  }
}

export function getStoredProfileText(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function saveStoredProfileText(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (value.trim()) window.localStorage.setItem(key, value.trim());
    else window.localStorage.removeItem(key);
  } catch {
    // Local preview storage can fail in private browsing or when storage is full.
  }
}

export async function imageFileToDataUrl(file: File, maxBytes = 3_000_000): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > maxBytes) throw new Error('Choose an image smaller than 3 MB.');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read that image.'));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

export function useStoredProfileImage(key: string): string | null {
  const [value, setValue] = useState<string | null>(() => getStoredProfileImage(key));

  useEffect(() => {
    const sync = (event?: Event) => {
      const detailKey = (event as CustomEvent<{ key?: string }> | undefined)?.detail?.key;
      if (detailKey && detailKey !== key) return;
      setValue(getStoredProfileImage(key));
    };

    window.addEventListener(PROFILE_MEDIA_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PROFILE_MEDIA_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);

  return value;
}
