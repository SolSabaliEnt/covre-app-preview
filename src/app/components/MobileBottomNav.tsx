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
        'fixed inset-x-0 bottom-0 z-50 border-t border-[#DDE7E8] bg-white/96 px-2 pt-1.5 backdrop-blur',
        className,
      )}
      style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
      aria-label={ariaLabel}
    >
      <div className="mx-auto flex max-w-3xl items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, active }) => (
          <Link
            key={`${label}-${to}`}
            to={to}
            onClick={() => resetRouteScrollNow()}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] leading-tight transition-colors sm:text-xs',
              active ? 'font-semibold text-[#13334F]' : 'font-medium text-[#7A8D98] hover:text-[#13334F]',
            )}
          >
            <span
              className={cn(
                'absolute inset-x-4 top-0 h-0.5 rounded-full transition-opacity',
                active ? 'bg-[#53B59F] opacity-100' : 'opacity-0',
              )}
              aria-hidden
            />
            <Icon className={cn('h-5 w-5 shrink-0', active && 'text-[#2F8E7A]')} aria-hidden strokeWidth={active ? 2.3 : 2} />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
