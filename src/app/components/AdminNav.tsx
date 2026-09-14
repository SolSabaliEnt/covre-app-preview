import { Link, useLocation, useNavigate } from 'react-router';
import { resetRouteScrollNow } from '../utils/scrollReset';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  CircleDollarSign,
  CreditCard,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  Repeat2,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { APP_NAME, LANDING_LOGO_SIDEBAR_CLASS, LANDING_LOGO_SRC } from '../lib/brand';
import { ADMIN_ENTRY_PATH } from '../lib/entryRoutes';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function navMatch(pathname: string, item: NavItem): boolean {
  return item.isActive(pathname);
}

const navGroups: NavGroup[] = [
  {
    label: 'Control',
    items: [
      {
        to: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isActive: p => p === '/admin',
      },
      {
        to: '/admin/ops',
        label: 'Operations',
        icon: Repeat2,
        isActive: p => p.startsWith('/admin/ops'),
      },
      {
        to: '/admin/full-app',
        label: 'Full App',
        icon: ListTree,
        isActive: p => p.startsWith('/admin/full-app'),
      },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      {
        to: '/admin/credentials',
        label: 'Credentials',
        icon: Shield,
        isActive: p => p.startsWith('/admin/credentials'),
      },
      {
        to: '/admin/marketplace',
        label: 'Marketplace',
        icon: Activity,
        isActive: p => p.startsWith('/admin/marketplace') || p.startsWith('/admin/shifts'),
      },
      {
        to: '/admin/referrals',
        label: 'Referrals',
        icon: Gift,
        isActive: p => p.startsWith('/admin/referrals'),
      },
    ],
  },
  {
    label: 'Risk + money',
    items: [
      {
        to: '/admin/incidents',
        label: 'Incidents',
        icon: AlertTriangle,
        isActive: p => p.startsWith('/admin/incidents'),
      },
      {
        to: '/admin/trust',
        label: 'Trust & Safety',
        icon: ShieldCheck,
        isActive: p => p.startsWith('/admin/trust'),
      },
      {
        to: '/admin/payments',
        label: 'Payments',
        icon: CreditCard,
        isActive: p => p.startsWith('/admin/payments'),
      },
      {
        to: '/admin/worker-rates',
        label: 'Rate Review',
        icon: CircleDollarSign,
        isActive: p => p.startsWith('/admin/worker-rates'),
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        to: '/admin/support',
        label: 'Support',
        icon: LifeBuoy,
        isActive: p => p.startsWith('/admin/support'),
      },
      {
        to: '/admin/users',
        label: 'Users',
        icon: Users,
        isActive: p => p.startsWith('/admin/users'),
      },
    ],
  },
];

export function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { name, logout } = useAuth();

  return (
    <aside className="flex min-h-screen w-[272px] shrink-0 flex-col border-r border-[#173B58] bg-[#0B243A] text-white">
      <div className="px-6 pb-6 pt-7">
        <Link to="/" className="block">
          <img
            src={LANDING_LOGO_SRC}
            alt={APP_NAME}
            width={906}
            height={209}
            loading="eager"
            decoding="async"
            className={LANDING_LOGO_SIDEBAR_CLASS}
          />
        </Link>
        <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#76C9B7]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#53B59F]" />
          Admin console
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="space-y-7">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7890A0]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = navMatch(location.pathname, item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => resetRouteScrollNow()}
                      className={`relative flex min-h-10 items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? 'text-white'
                          : 'text-[#A9BAC4] hover:text-white'
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full transition-colors ${
                          active ? 'bg-[#53B59F]' : 'bg-transparent'
                        }`}
                      />
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-[#76C9B7]' : ''}`} />
                      <span className={active ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-[#244965] px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7890A0]">Signed in</p>
        <p className="mt-1 truncate text-sm font-semibold text-white">{name || 'Covre Ops'}</p>
        <div className="mt-4 flex items-center gap-4 text-xs font-medium">
          <Link to="/auth" className="text-[#A9BAC4] transition-colors hover:text-white">
            Switch workspace
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate(ADMIN_ENTRY_PATH, { replace: true });
            }}
            className="text-[#A9BAC4] transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
