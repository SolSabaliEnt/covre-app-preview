import { Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Heart,
  MoreHorizontal,
} from 'lucide-react';
import { CovreBrandLogo } from '../components/CovreBrandLogo';
import { APP_NAME } from '../lib/brand';
import { useAuth } from '../auth/AuthContext';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { useAsyncResource } from '../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../lib/backendMode';
import { getCurrentProviderLogo, getCurrentProviderOrganization } from '../services';

const MORE_HREF = '/provider/more';
const WORKERS_HREF = '/provider/workers';

function isDashboardActive(pathname: string) {
  return pathname === '/provider';
}

function isShiftsActive(pathname: string) {
  return (
    pathname === '/provider/shifts' ||
    pathname.startsWith('/provider/shifts/') ||
    pathname === '/provider/post-shift'
  );
}

function isWorkersActive(pathname: string) {
  return (
    pathname === WORKERS_HREF ||
    pathname.startsWith('/provider/workers/') ||
    pathname.startsWith('/provider/worker-match')
  );
}

function isBenchActive(pathname: string) {
  return pathname === '/provider/bench';
}

function isMoreActive(pathname: string) {
  return (
    pathname === '/provider/more' ||
    pathname === '/provider/profile' ||
    pathname === '/provider/onboarding' ||
    pathname === '/provider/team' ||
    pathname === '/provider/referrals' ||
    pathname.startsWith('/provider/sites') ||
    pathname === '/provider/compliance' ||
    pathname.startsWith('/provider/compliance/') ||
    pathname === '/provider/timesheets' ||
    pathname.startsWith('/provider/timesheets/') ||
    pathname === '/provider/billing' ||
    pathname.startsWith('/provider/billing/') ||
    pathname === '/provider/support' ||
    pathname.startsWith('/provider/support/') ||
    pathname === '/provider/settings' ||
    pathname.startsWith('/provider/settings/')
  );
}

function providerHeaderSubtitle(pathname: string, organizationName?: string | null) {
  if (pathname.startsWith('/provider/onboarding')) return 'Workspace setup';
  if (pathname === '/provider/profile') return 'Organization profile';
  if (pathname === '/provider/sites/new') return 'Add care site';
  const name = organizationName?.trim();
  return name || 'Provider workspace';
}

function hideProviderBottomNav(pathname: string) {
  return pathname.startsWith('/provider/onboarding') || pathname === '/provider/sites/new';
}

export function ProviderAppShell() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: providerOrg, loading: orgLoading } = useAsyncResource(
    () =>
      isAuthenticated && isSupabaseBackendEnabled()
        ? getCurrentProviderOrganization()
        : Promise.resolve({ ok: true as const, data: null }),
    [pathname, isAuthenticated],
  );
  const { data: logoAsset } = useAsyncResource(
    () => isAuthenticated ? getCurrentProviderLogo() : Promise.resolve({ ok: true as const, data: { url: undefined, message: '' } }),
    [pathname, isAuthenticated],
  );

  const organizationLogo = logoAsset?.url;
  const organizationName = !orgLoading && providerOrg?.organizationName ? providerOrg.organizationName : null;
  const headerSubtitle = providerHeaderSubtitle(pathname, organizationName);
  const hideNav = hideProviderBottomNav(pathname);
  const mainBottomPaddingClass = hideNav
    ? 'pb-[calc(1rem+env(safe-area-inset-bottom))]'
    : 'pb-24 sm:pb-20';

  const bottomItems = [
    { to: '/provider', label: 'Dashboard', icon: LayoutDashboard, active: isDashboardActive(pathname) },
    { to: '/provider/shifts', label: 'Shifts', icon: Calendar, active: isShiftsActive(pathname) },
    { to: WORKERS_HREF, label: 'Workers', icon: Users, active: isWorkersActive(pathname) },
    { to: '/provider/bench', label: 'Bench', icon: Heart, active: isBenchActive(pathname) },
    { to: MORE_HREF, label: 'More', icon: MoreHorizontal, active: isMoreActive(pathname) },
  ];

  return (
    <div className="provider-ui flex h-[100dvh] max-h-[100svh] min-h-dvh w-full max-w-full flex-col overflow-hidden bg-white text-[#10283D]">
      <header className="sticky top-0 z-40 shrink-0 border-b border-[#DDE7E8] bg-white/96 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pb-3 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-6">
          {organizationLogo ? (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#DDE7E8] bg-white">
              <img src={organizationLogo} alt="Organization logo" className="h-full w-full object-contain p-1" />
            </div>
          ) : (
            <CovreBrandLogo
              surface="light"
              layout="mark"
              width={36}
              className="shrink-0"
              imgClassName="h-9 w-9 max-h-9 object-contain"
              alt={APP_NAME}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[#13334F]">{organizationName || APP_NAME}</div>
            <div className="truncate text-xs font-medium text-[#2F8E7A]">{headerSubtitle}</div>
          </div>
        </div>
      </header>

      <main
        data-route-scroll-root="true"
        data-route-scroll-container="true"
        className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-white ${mainBottomPaddingClass}`}
      >
        <Outlet />
      </main>

      {!hideNav ? <MobileBottomNav aria-label="Provider navigation" items={bottomItems} /> : null}
    </div>
  );
}
