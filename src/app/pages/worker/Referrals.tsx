import { useCallback } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ReferralStatus } from '../../services/types';
import { copyReferralLink, getWorkerReferralDashboard } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { StatusBadge, type BadgeVariant } from '../../components/StatusBadge';

function referralStatusVariant(status: ReferralStatus): BadgeVariant {
  switch (status) {
    case 'invited': return 'new';
    case 'signed_up':
    case 'first_shift_completed': return 'pending';
    case 'qualified': return 'verified';
    case 'paid':
    case 'credited': return 'covered';
    case 'ineligible': return 'missing';
    default: return 'new';
  }
}

function formatStatusLabel(status: ReferralStatus): string {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatCash(n: number) {
  return `$${n.toLocaleString()}`;
}

function LoadingBlock() {
  return <div className="border-y border-[#DDE7E8] py-12 text-center text-sm font-medium text-[#607583]">Loading referrals…</div>;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white hover:bg-[#0B243A]">Try again</button>
    </div>
  );
}

export default function WorkerReferrals() {
  const { data, error, loading, reload } = useAsyncResource(() => getWorkerReferralDashboard(), []);

  const onCopy = useCallback(async () => {
    const r = await copyReferralLink('worker-001', 'worker_to_provider');
    if (r.ok) toast.success(r.data.message);
    else toast.error(r.error.message);
  }, []);

  const onShare = useCallback(() => {
    toast.success('Referral invite ready');
  }, []);

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <Link to="/worker/account" className="text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">← Account</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Referrals</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Bring good care sites into Covre.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Share your referral link with facilities that need coverage. Track the path from invite to qualifying first shift.</p>
        </header>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error.message} onRetry={reload} />}

        {!loading && !error && data && (
          <>
            <section className="border-b border-[#BFCED4] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Your referral link</p>
              <p className="mt-3 break-all font-mono text-sm text-[#13334F]">{data.referralLink}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onCopy} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white hover:bg-[#0B243A]">
                  <Copy className="h-4 w-4" aria-hidden /> Copy link
                </button>
                <button type="button" onClick={onShare} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] px-5 text-sm font-semibold text-[#13334F] hover:bg-[#F7FAFA]">
                  <Share2 className="h-4 w-4" aria-hidden /> Share referral
                </button>
              </div>
              <div className="mt-6 flex gap-7 overflow-x-auto border-t border-[#DDE7E8] pt-4">
                <div className="min-w-[7rem] shrink-0"><p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Pending</p><p className="mt-1 text-xl font-semibold text-[#13334F]">{formatCash(data.totalPending)}</p></div>
                <div className="min-w-[7rem] shrink-0"><p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Qualified</p><p className="mt-1 text-xl font-semibold text-[#13334F]">{formatCash(data.totalQualified)}</p></div>
                <div className="min-w-[7rem] shrink-0"><p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Paid</p><p className="mt-1 text-xl font-semibold text-[#257665]">{formatCash(data.totalPaidOrCredited)}</p></div>
              </div>
            </section>

            <section className="pt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Reward tiers</p>
              <div className="mt-3 border-t border-[#BFCED4]">
                {data.tiers.map(tier => (
                  <div key={tier.id} className="flex items-start justify-between gap-5 border-b border-[#DDE7E8] py-4">
                    <div>
                      <p className="font-semibold text-[#13334F]">{tier.facilityType}</p>
                      <p className="mt-1 text-sm leading-6 text-[#607583]">{tier.description}</p>
                    </div>
                    <p className="shrink-0 text-lg font-semibold text-[#2F8E7A]">{formatCash(tier.rewardAmount)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-9">
              <div className="flex items-end justify-between gap-4 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Tracker</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Referral progress</h2>
                </div>
                <p className="text-xs text-[#9AAAB3]">Invite → qualify → reward</p>
              </div>
              <div className="border-t border-[#BFCED4]">
                {data.records.map(rec => (
                  <article key={rec.id} className="border-b border-[#DDE7E8] py-5">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#13334F]">{rec.referredOrganization}</p>
                        <p className="mt-1 text-sm text-[#607583]">{rec.facilityType}</p>
                        <p className="mt-2 text-xs text-[#9AAAB3]">Started {new Date(rec.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StatusBadge variant={referralStatusVariant(rec.status)}>{formatStatusLabel(rec.status)}</StatusBadge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-[#2F8E7A]">Potential reward: {formatCash(rec.rewardAmount)}</span>
                      <ArrowRight className="h-4 w-4 text-[#B5C3CA]" aria-hidden />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <p className="mt-7 border-t border-[#DDE7E8] pt-4 text-xs leading-5 text-[#607583]">Rewards are reviewed after eligibility is confirmed. The referred provider must complete a qualifying first covered shift.</p>
          </>
        )}
      </div>
    </div>
  );
}
