import { Link, useNavigate } from 'react-router';
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Gift,
  LogOut,
  ShieldAlert,
  Star,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';
import { WORKER_ENTRY_PATH } from '../../lib/entryRoutes';
import { getWorkerAccount } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { WORKER_PROFILE_PHOTO_KEY, useStoredProfileImage } from '../../lib/profileMedia';

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white hover:bg-[#0B243A]">
        Try again
      </button>
    </div>
  );
}

export default function WorkerAccount() {
  const navigate = useNavigate();
  const { name, logout, isAuthenticated } = useAuth();
  const profilePhoto = useStoredProfileImage(WORKER_PROFILE_PHOTO_KEY);
  const { data: accountStub, error, loading, reload } = useAsyncResource(() => getWorkerAccount(), []);

  const displayName = loading
    ? 'Loading…'
    : (isAuthenticated && name?.trim() ? name : (accountStub?.displayName ?? 'Care worker'));
  const roleLabel = loading ? 'Fetching summary…' : (accountStub?.primaryRoleLabel ?? 'Care worker');
  const showOnboardingCta = isSupabaseBackendEnabled() && accountStub?.needsOnboarding && !loading && !error;

  const handleSignOut = () => {
    logout();
    toast.success('Signed out');
    navigate(WORKER_ENTRY_PATH, { replace: true });
  };

  const rows = [
    { to: '/worker/profile' as const, label: 'Professional profile', sub: 'Photo, roles, location, and availability.', icon: User },
    { to: '/worker/credentials' as const, label: 'Credential Passport', sub: 'Keep your readiness portable.', icon: BadgeCheck },
    { to: '/worker/reputation' as const, label: 'Covre Score', sub: 'See the work history behind your standing.', icon: Star },
    { to: '/worker/pay' as const, label: 'Earnings & payouts', sub: 'Track approved work and payout readiness.', icon: CreditCard },
    { to: '/worker/referrals' as const, label: 'Referrals', sub: 'Refer care sites and track rewards.', icon: Gift },
    { to: '/worker/safety' as const, label: 'Safety reports', sub: 'Document concerns securely.', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Your Covre</p>
          <div className="mt-3 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E6F6F2] text-[#257665]">
              {profilePhoto ? <img src={profilePhoto} alt="Care worker profile" className="h-full w-full object-cover" /> : <User className="h-6 w-6" aria-hidden />}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#13334F]">{displayName}</h1>
              <p className="mt-1 text-sm text-[#466170]">{roleLabel}</p>
              {(accountStub?.location || accountStub?.phone) && !loading ? (
                <p className="mt-2 text-xs text-[#9AAAB3]">{[accountStub?.location, accountStub?.phone].filter(Boolean).join(' · ')}</p>
              ) : null}
            </div>
            <Link to="/worker/profile" className="shrink-0 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">Edit profile</Link>
          </div>
        </header>

        {showOnboardingCta && (
          <section className="border-b border-[#DDE7E8] py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">Finish setup</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="max-w-lg text-sm leading-6 text-[#466170]">Complete your worker profile so Covre can match your roles, location, and readiness to shifts.</p>
              <Link to="/worker/onboarding" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">Continue <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          </section>
        )}

        {error && !loading && <ErrorBlock message={error.message} onRetry={reload} />}

        <section className="py-7">
          <div className="border-t border-[#BFCED4]" role="navigation" aria-label="Account shortcuts">
            {rows.map(({ to, label, sub, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-4 border-b border-[#DDE7E8] py-4 no-underline transition-colors hover:bg-[#F7FAFA]">
                <Icon className="h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#13334F]">{label}</p>
                  <p className="mt-0.5 text-sm text-[#607583]">{sub}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#B8C6CC]" aria-hidden />
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-[#DDE7E8] pt-5">
          <Link to={WORKER_ENTRY_PATH} className="flex min-h-11 items-center justify-between text-sm font-semibold text-[#13334F] no-underline">
            <span>Switch workspace</span>
            <ArrowRight className="h-4 w-4 text-[#2F8E7A]" aria-hidden />
          </Link>
          <button type="button" onClick={handleSignOut} className="mt-1 flex min-h-11 w-full items-center justify-between text-left text-sm font-semibold text-[#A93636]">
            <span>Sign out</span>
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </section>
      </div>
    </div>
  );
}
