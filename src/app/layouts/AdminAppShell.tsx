import { Link, Outlet } from 'react-router';
import { AdminNav } from '../components/AdminNav';
import { CovreBrandLogo } from '../components/CovreBrandLogo';
import { ADMIN_ENTRY_PATH, PROVIDER_ENTRY_PATH } from '../lib/entryRoutes';
import { useAuth } from '../auth/AuthContext';

export function AdminAppShell() {
  const { name, isAuthenticated } = useAuth();
  const accountLabel = isAuthenticated ? name || 'Covre Ops' : 'Covre Ops';

  return (
    <div className="admin-ui min-h-dvh w-full max-w-full overflow-x-hidden bg-[#F7FAFA] text-[#10283D]">
      <div
        data-route-scroll-root="true"
        data-route-scroll-container="true"
        className="flex min-h-dvh w-full flex-col justify-between overflow-y-auto bg-[#F7FAFA] px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(1.5rem+env(safe-area-inset-top))] lg:hidden"
      >
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <CovreBrandLogo
              surface="light"
              layout="mark"
              width={64}
              className="shrink-0"
              imgClassName="h-14 w-14 object-contain"
              alt="Covre"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2F8E7A]">Admin console</span>
          </div>

          <div className="mt-16 border-t border-[#DDE7E8] pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Desktop workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#13334F]">Run Covre from a larger screen.</h1>
            <p className="mt-4 text-sm leading-6 text-[#607583]">
              Admin is intentionally desktop-first so operational queues, marketplace context, and review work stay clear and readable.
            </p>
            <p className="mt-6 text-sm font-medium text-[#13334F]">Signed in as {accountLabel}</p>
          </div>
        </div>

        <div className="mx-auto mt-12 w-full max-w-md border-t border-[#DDE7E8] pt-6">
          <Link
            to={ADMIN_ENTRY_PATH}
            className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#13334F] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#0B243A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]"
          >
            Switch workspace
          </Link>
          <Link
            to={PROVIDER_ENTRY_PATH}
            className="mt-3 flex min-h-12 w-full items-center justify-center px-5 py-3 text-center text-sm font-semibold text-[#13334F] transition-colors hover:text-[#2F8E7A]"
          >
            Go to provider preview
          </Link>
        </div>
      </div>

      <div className="hidden min-h-dvh w-full lg:flex">
        <AdminNav />
        <main
          data-route-scroll-root="true"
          data-route-scroll-container="true"
          className="min-h-dvh min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#F7FAFA]"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
