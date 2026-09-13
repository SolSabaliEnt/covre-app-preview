import { Outlet, useLocation } from 'react-router';
import { Clock3, DollarSign, MessageSquareText, CalendarCheck2, UserRound } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { MobileBottomNav } from '../components/MobileBottomNav';

const workerNavTabs = [
  { to: '/worker/shifts', label: 'Shifts', Icon: Clock3 },
  { to: '/worker/bookings', label: 'Bookings', Icon: CalendarCheck2 },
  { to: '/worker/messages', label: 'Messages', Icon: MessageSquareText },
  { to: '/worker/pay', label: 'Earnings', Icon: DollarSign },
  { to: '/worker/account', label: 'Account', Icon: UserRound },
] as const;

function showWorkerBottomNav(pathname: string): boolean {
  return (
    pathname === '/worker/shifts' ||
    pathname === '/worker/bookings' ||
    pathname === '/worker/messages' ||
    pathname === '/worker/pay' ||
    pathname === '/worker/account' ||
    pathname === '/worker/settings' ||
    pathname === '/worker/profile' ||
    pathname === '/worker/credentials' ||
    pathname === '/worker/reputation' ||
    pathname === '/worker/referrals' ||
    pathname === '/worker/safety'
  );
}

function isWorkerTabActive(tab: (typeof workerNavTabs)[number]['to'], pathname: string): boolean {
  if (tab === '/worker/account') {
    return [
      '/worker/account',
      '/worker/settings',
      '/worker/profile',
      '/worker/credentials',
      '/worker/reputation',
      '/worker/referrals',
      '/worker/safety',
    ].includes(pathname);
  }
  return pathname === tab;
}

export function WorkerAppShell() {
  const { pathname } = useLocation();
  const navVisible = showWorkerBottomNav(pathname);

  const bottomItems = workerNavTabs.map(({ to, label, Icon }) => ({
    to,
    label,
    icon: Icon,
    active: isWorkerTabActive(to, pathname),
  }));

  return (
    <div className="worker-ui flex h-[100dvh] max-h-[100svh] w-full max-w-full flex-col overflow-hidden bg-white text-[#10283D]">
      <main
        data-route-scroll-root="true"
        data-route-scroll-container="true"
        className={cn(
          'min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-white',
          navVisible && 'pb-24 sm:pb-20',
        )}
      >
        <Outlet />
      </main>

      {navVisible && <MobileBottomNav aria-label="Worker navigation" items={bottomItems} />}
    </div>
  );
}
