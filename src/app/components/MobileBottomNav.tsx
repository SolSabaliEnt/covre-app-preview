import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { resetRouteScrollNow } from '../utils/scrollReset';
import { cn } from './ui/utils';

export type MobileBottomNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  active: boolean;
};

type MobileBottomNavProps = {
  items: MobileBottomNavItem[];
  'aria-label': string;
  className?: string;
};

export function MobileBottomNav({ items, 'aria-label': ariaLabel, className }: MobileBottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[1.65rem] border border-[#DDE7E8] bg-white/94 px-2 py-1.5 shadow-[0_12px_34px_rgba(16,40,61,0.16)] backdrop-blur-xl',
        className,
      )}
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      aria-label={ariaLabel}
    >
      <div className="flex items-center justify-around gap-1">
        {items.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={`${label}-${to}`}
            to={to}
            onClick={() => resetRouteScrollNow()}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            title={label}
            className={cn(
              'relative flex h-12 min-w-12 flex-1 items-center justify-center rounded-[1.15rem] transition-all duration-150',
              active
                ? 'bg-[#E6F6F2] text-[#13334F]'
                : 'text-[#7A8D98] hover:bg-[#F7FAFA] hover:text-[#13334F]',
            )}
          >
            <Icon
              className={cn('h-6 w-6 shrink-0 transition-transform', active && 'scale-[1.04] text-[#2F8E7A]')}
              aria-hidden
              strokeWidth={active ? 2.5 : 2}
            />
            <span className="sr-only">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
