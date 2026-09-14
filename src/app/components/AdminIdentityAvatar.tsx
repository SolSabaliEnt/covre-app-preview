import { Building2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getAdminIdentityImage, type AdminIdentityKind } from '../services/adminIdentityMediaService';

type AdminIdentityAvatarProps = {
  kind: AdminIdentityKind;
  name: string;
  entityId?: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
} as const;

function initialsFor(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || '—';
}

export function AdminIdentityAvatar({
  kind,
  name,
  entityId,
  userId,
  size = 'sm',
  className = '',
}: AdminIdentityAvatarProps) {
  const [url, setUrl] = useState<string | undefined>();
  const initials = useMemo(() => initialsFor(name), [name]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await getAdminIdentityImage({ kind, name, entityId, userId });
      if (!cancelled && result.ok) setUrl(result.data.url);
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, name, entityId, userId]);

  const shape = kind === 'provider' ? 'rounded-lg' : 'rounded-full';
  const base = `${sizeClasses[size]} ${shape} shrink-0 overflow-hidden border border-[#DDE7E8] bg-[#F7FAFA] ${className}`;

  if (url) {
    return (
      <span className={base} aria-hidden>
        <img
          src={url}
          alt=""
          className={kind === 'provider' ? 'h-full w-full object-contain p-1' : 'h-full w-full object-cover'}
        />
      </span>
    );
  }

  if (kind === 'provider') {
    return (
      <span className={`${base} flex items-center justify-center text-[#2F8E7A]`} aria-hidden>
        <Building2 className={size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} />
      </span>
    );
  }

  return (
    <span className={`${base} flex items-center justify-center bg-[#E6F6F2] font-semibold text-[#257665]`} aria-hidden>
      {initials}
    </span>
  );
}
