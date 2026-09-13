import { useEffect, useState } from 'react';

export const WORKER_PROFILE_PHOTO_KEY = 'covre.worker.profile-photo';
export const PROVIDER_LOGO_KEY = 'covre.provider.organization-logo';

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
