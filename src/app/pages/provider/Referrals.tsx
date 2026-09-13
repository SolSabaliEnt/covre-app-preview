import { useCallback } from 'react';
import { Link } from 'react-router';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ReferralStatus } from '../../services/types';
import { copyReferralLink, getProviderReferralDashboard } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { StatusBadge, type BadgeVariant } from '../../components/StatusBadge';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';

function referralStatusVariant(status: ReferralStatus): BadgeVariant {
  if (status === 'qualified') return 'verified';
  if (status === 'paid' || status === 'credited') return 'covered';
  if (status === 'ineligible') return 'missing';
  if (status === 'signed_up' || status === 'first_shift_completed') return 'pending';
  return 'new';
}
function formatStatusLabel(status: ReferralStatus) { return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
function formatCredits(value: number) { return `${value.toLocaleString()} shift credits`; }

export default function ProviderReferrals() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { data, error, loading, reload } = useAsyncResource(() => getProviderReferralDashboard(), []);

  const onCopy = useCallback(async () => {
    if (!data?.referralLink) return toast.error('Complete facility setup to get your referral link.');
    try { await navigator.clipboard.writeText(data.referralLink); toast.success('Referral link copied'); }
    catch {
      const result = await copyReferralLink(data.providerId ?? 'provider-001', 'provider_to_provider');
      result.ok ? toast.success(result.data.message) : toast.error(result.error.message);
    }
  }, [data]);

  const onShare = useCallback(() => {
    if (supabaseMode && data?.isSimulated) toast.message('Sharing is ready; reward qualification remains simulated in this preview.');
    else toast.success('Referral invite ready');
  }, [data?.isSimulated, supabaseMode]);

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Growth</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Refer providers</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Share Covre with another care operator. Reward progress stays tied to your provider workspace.</p>
        </header>

        {loading && <p className="border-b border-[#DDE7E8] py-10 text-center text-sm text-[#607583]">Loading referral program…</p>}
        {error && <div className="border-b border-[#DDE7E8] py-10 text-center"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-3 text-sm font-semibold text-[#2F8E7A]">Try again</button></div>}

        {!loading && !error && data ? (
          <>
            {data.setupStatus === 'incomplete' ? <section className="border-b border-[#DDE7E8] py-5"><p className="font-semibold text-[#9B6419]">Finish provider setup first.</p><p className="mt-1 text-sm text-[#607583]">Your referral link becomes useful once the organization is connected.</p><Link to="/provider/onboarding" className="mt-3 inline-flex text-sm font-semibold text-[#2F8E7A]">Continue setup</Link></section> : null}

            <section className="border-b border-[#DDE7E8] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Your referral link</p>
              <p className="mt-3 break-all font-mono text-sm text-[#13334F]">{data.referralLink || '—'}</p>
              <div className="mt-5 flex gap-3"><button type="button" onClick={onCopy} disabled={!data.referralLink} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-4 text-sm font-semibold text-white disabled:opacity-50"><Copy className="h-4 w-4" />Copy link</button><button type="button" onClick={onShare} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] px-4 text-sm font-semibold text-[#13334F]"><Share2 className="h-4 w-4" />Share</button></div>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Credit summary</p>
              <div className="mt-4 grid grid-cols-3 gap-3"><div><p className="text-xs text-[#607583]">Pending</p><p className="mt-1 text-lg font-semibold text-[#13334F]">{data.totalPending}</p></div><div><p className="text-xs text-[#607583]">Qualified</p><p className="mt-1 text-lg font-semibold text-[#13334F]">{data.totalQualified}</p></div><div><p className="text-xs text-[#607583]">Credited</p><p className="mt-1 text-lg font-semibold text-[#257665]">{data.totalPaidOrCredited}</p></div></div>
              <p className="mt-3 text-xs text-[#9AAAB3]">Values are shift credits.</p>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Reward tiers</p>
              <div className="mt-3 border-t border-[#BFCED4]">{data.tiers.map(tier => <div key={tier.id} className="flex items-start justify-between gap-4 border-b border-[#DDE7E8] py-4"><div><p className="font-semibold text-[#13334F]">{tier.facilityType}</p><p className="mt-1 text-sm text-[#607583]">{tier.description}</p></div><p className="shrink-0 text-sm font-semibold text-[#2F8E7A]">{formatCredits(tier.rewardAmount)}</p></div>)}</div>
            </section>

            <section className="py-7"><div className="flex items-end justify-between gap-4 pb-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Tracker</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Referral progress</h2></div>{data.organizationName ? <p className="text-xs text-[#9AAAB3]">{data.organizationName}</p> : null}</div><div className="border-t border-[#BFCED4]">{data.records.length === 0 ? <p className="border-b border-[#DDE7E8] py-6 text-sm text-[#607583]">No referral activity yet.</p> : data.records.map(record => <div key={record.id} className="flex items-start justify-between gap-4 border-b border-[#DDE7E8] py-4"><div><p className="font-semibold text-[#13334F]">{record.referredOrganization}</p><p className="mt-1 text-xs text-[#9AAAB3]">Started {new Date(record.createdAt).toLocaleDateString()}</p><p className="mt-2 text-sm font-semibold text-[#2F8E7A]">{formatCredits(record.rewardAmount)}</p></div><StatusBadge variant={referralStatusVariant(record.status)}>{formatStatusLabel(record.status)}</StatusBadge></div>)}</div></section>
          </>
        ) : null}
      </div>
    </div>
  );
}
