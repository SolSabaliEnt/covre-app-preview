import { Link, useNavigate } from 'react-router';
import {
  Building2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  CreditCard,
  Gift,
  HelpCircle,
  ListChecks,
  LogOut,
  PlusCircle,
  Settings,
  Shuffle,
  UserPlus,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { PROVIDER_ENTRY_PATH } from '../../lib/entryRoutes';
import { getProviderOnboardingStatus } from '../../services';

const links = [
  { to: '/provider/team', label: 'Team & Invites', description: 'Invite schedulers, billing users, and admins.', icon: UserPlus, status: null },
  { to: '/provider/onboarding', label: 'Provider setup', description: 'Update organization, site, and staffing setup.', icon: ListChecks, status: null },
  { to: '/provider/sites/new', label: 'Add care site', description: 'Register a new facility or home.', icon: PlusCircle, status: null },
  { to: '/provider/referrals', label: 'Referrals', description: 'Share Covre and earn shift credits.', icon: Gift, status: null },
  { to: '/provider/sites', label: 'Sites', description: 'Locations, orientation, and staffing rules.', icon: Building2, status: '3 active' },
  { to: '/provider/compliance', label: 'Compliance packets', description: 'Audit-ready shift records and signatures.', icon: ClipboardCheck, status: '1 needs review' },
  { to: '/provider/timesheets', label: 'Timesheets', description: 'Review and approve completed shifts.', icon: Clock, status: null },
  { to: '/provider/billing', label: 'Billing', description: 'Invoices and payment methods.', icon: CreditCard, status: null },
  { to: '/provider/support', label: 'Support', description: 'Shifts, workers, payments, and compliance.', icon: HelpCircle, status: 'Avg. reply under 24h' },
  { to: '/provider/settings', label: 'Settings', description: 'Organization, users, and notifications.', icon: Settings, status: null },
] as const;

export default function More() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(!isSupabaseBackendEnabled());

  useEffect(() => {
    if (!isSupabaseBackendEnabled()) return;
    let cancelled = false;
    void (async () => {
      const res = await getProviderOnboardingStatus();
      if (!cancelled && res.ok) setOnboardingComplete(res.data.onboardingComplete);
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleLinks = useMemo(() => links.filter(link => !(link.to === '/provider/onboarding' && onboardingComplete)), [onboardingComplete]);

  const signOut = () => {
    logout();
    navigate(PROVIDER_ENTRY_PATH, { replace: true });
  };

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">More</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Everything that supports coverage beyond the daily shift board.</p>
        </header>

        <section className="pt-7">
          <p className="pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Operations & account</p>
          <div className="border-t border-[#BFCED4]">
            {visibleLinks.map(({ to, label, description, icon: Icon, status }) => (
              <Link key={to} to={to} className="flex items-center gap-4 border-b border-[#DDE7E8] py-4 no-underline transition-colors hover:bg-[#F7FAFA]">
                <Icon className="h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#13334F]">{label}</p>
                  <p className="mt-0.5 text-sm leading-5 text-[#607583]">{description}</p>
                  {status ? <p className="mt-1 text-xs font-semibold text-[#257665]">{status}</p> : null}
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#B8C6CC]" aria-hidden />
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 border-t border-[#DDE7E8] pt-4">
          <Link to={PROVIDER_ENTRY_PATH} className="flex min-h-12 items-center justify-between gap-4 text-sm font-semibold text-[#13334F] no-underline">
            <span className="inline-flex items-center gap-3"><Shuffle className="h-5 w-5 text-[#607583]" />Switch workspace</span>
            <ChevronRight className="h-5 w-5 text-[#B8C6CC]" />
          </Link>
          <button type="button" onClick={signOut} className="flex min-h-12 w-full items-center justify-between gap-4 text-left text-sm font-semibold text-[#A93636]">
            <span className="inline-flex items-center gap-3"><LogOut className="h-5 w-5" />Sign out</span>
          </button>
        </section>
      </div>
    </div>
  );
}
