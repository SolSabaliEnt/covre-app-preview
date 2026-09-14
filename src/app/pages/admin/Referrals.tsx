import { useMemo } from 'react';
import { toast } from 'sonner';
import type { ReferralRecord, ReferralStatus, ReferralTrack } from '../../services/types';
import { approveReferralReward, listAdminReferrals, markReferralIneligible } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { StatusBadge, type BadgeVariant } from '../../components/StatusBadge';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';

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

function trackLabel(track: ReferralTrack): string {
  return track === 'worker_to_provider' ? 'Worker → Provider' : 'Provider → Provider';
}

function formatReward(rec: ReferralRecord): string {
  return rec.rewardType === 'cash' ? `$${rec.rewardAmount.toLocaleString()}` : `${rec.rewardAmount.toLocaleString()} shift credits`;
}

export default function AdminReferrals() {
  const { data: records, error, loading, reload } = useAsyncResource(() => listAdminReferrals(), []);

  const metrics = useMemo(() => {
    const list = records ?? [];
    return {
      invited: list.filter(r => r.status === 'invited').length,
      signedUp: list.filter(r => r.status === 'signed_up' || r.status === 'first_shift_completed').length,
      qualified: list.filter(r => r.status === 'qualified').length,
      paidCredited: list.filter(r => r.status === 'paid' || r.status === 'credited').length,
    };
  }, [records]);

  const runApprove = async (id: string) => {
    const result = await approveReferralReward(id);
    if (!result.ok) return toast.error(result.error.message);
    toast.success(result.data.message);
    reload();
  };

  const runIneligible = async (id: string) => {
    const result = await markReferralIneligible(id);
    if (!result.ok) return toast.error(result.error.message);
    toast.success(result.data.message);
    reload();
  };

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading referral ledger…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  const list = records ?? [];

  return (
    <div className="min-h-full bg-[#F7FAFA] text-[#10283D]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Growth + identity</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Referral ledger</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Follow who referred whom, what organization joined, and whether the reward has actually qualified.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-6">
        <section className="grid grid-cols-2 gap-5 border-y border-[#DDE7E8] py-5 lg:grid-cols-4">
          {[{ label: 'Invited', value: metrics.invited }, { label: 'Signed up', value: metrics.signedUp }, { label: 'Qualified', value: metrics.qualified }, { label: 'Paid / credited', value: metrics.paidCredited }].map(metric => <div key={metric.label}><p className="text-2xl font-semibold text-[#13334F]">{metric.value}</p><p className="text-sm text-[#607583]">{metric.label}</p></div>)}
        </section>

        <section className="overflow-x-auto border-t border-[#BFCED4]">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-[#DDE7E8]"><tr><th className="p-4">Referrer</th><th className="p-4">Referred organization</th><th className="p-4">Facility type</th><th className="p-4">Track</th><th className="p-4">Status</th><th className="p-4">Reward</th><th className="p-4">Created</th><th className="p-4">Actions</th></tr></thead>
            <tbody>
              {list.map(rec => {
                const referrerKind = rec.track === 'worker_to_provider' ? 'worker' : 'provider';
                return (
                  <tr key={rec.id} className="border-b border-[#DDE7E8]">
                    <td className="p-4"><div className="flex items-center gap-3"><AdminIdentityAvatar kind={referrerKind} name={rec.referrerName} entityId={rec.referrerId} size="md" /><span className="font-semibold text-[#13334F]">{rec.referrerName}</span></div></td>
                    <td className="p-4"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={rec.referredOrganization} size="md" /><div><p className="font-medium text-[#13334F]">{rec.referredOrganization}</p><p className="text-xs text-[#607583]">{rec.referredContact}</p></div></div></td>
                    <td className="max-w-[10rem] p-4 text-[#607583]">{rec.facilityType}</td>
                    <td className="p-4 text-[#607583]">{trackLabel(rec.track)}</td>
                    <td className="p-4"><StatusBadge variant={referralStatusVariant(rec.status)}>{formatStatusLabel(rec.status)}</StatusBadge></td>
                    <td className="p-4 font-semibold text-[#2F8E7A]">{formatReward(rec)}</td>
                    <td className="whitespace-nowrap p-4 text-[#607583]">{new Date(rec.createdAt).toLocaleDateString()}</td>
                    <td className="p-4"><div className="flex flex-wrap gap-3 text-xs font-semibold"><button type="button" disabled={rec.status !== 'qualified'} onClick={() => void runApprove(rec.id)} className="text-[#257665] disabled:opacity-40">Approve reward</button><button type="button" disabled={['paid', 'credited', 'ineligible'].includes(rec.status)} onClick={() => void runIneligible(rec.id)} className="text-[#607583] disabled:opacity-40">Mark ineligible</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <p className="text-xs leading-relaxed text-[#607583]">Demo ledger only — no payouts or credit billing are executed from this console.</p>
      </main>
    </div>
  );
}
