import { getProviderWorkerAvatarUrl } from '../services';
import { useAsyncResource } from '../hooks/useAsyncResource';

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'CW';
}

export function ProviderWorkerAvatar({
  workerId,
  name,
  size = 'md',
}: {
  workerId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { data: avatarUrl } = useAsyncResource(() => getProviderWorkerAvatarUrl(workerId), [workerId]);
  const sizeClass = size === 'sm' ? 'h-10 w-10 text-sm' : size === 'lg' ? 'h-16 w-16 text-xl' : 'h-11 w-11 text-base';

  return (
    <div className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6F6F2] font-semibold text-[#257665]`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${name} profile`} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initialsFromName(name)}</span>
      )}
    </div>
  );
}
