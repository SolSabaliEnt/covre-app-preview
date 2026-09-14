import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge, type BadgeVariant } from '../../components/StatusBadge';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import {
  listAdminCredentialReviewQueue,
  rejectAdminWorkerCredential,
  verifyAdminWorkerCredential,
} from '../../services';
import type { AdminCredentialReviewRow, AdminCredentialReviewStatus } from '../../services/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';

type FilterKey = 'all' | 'pending' | 'verified' | 'rejected' | 'expired';

function formatWhen(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatExpires(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function statusBadgeVariant(status: AdminCredentialReviewStatus): BadgeVariant {
  if (status === 'verified') return 'verified';
  if (status === 'pending' || status === 'expiring_soon') return 'pending';
  if (status === 'rejected') return 'urgent';
  return 'expiring';
}

function statusLabel(status: AdminCredentialReviewStatus): string {
  if (status === 'verified') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  if (status === 'expired') return 'Expired';
  if (status === 'expiring_soon') return 'Expiring soon';
  if (status === 'missing') return 'Missing';
  return 'Pending review';
}

function matchesFilter(row: AdminCredentialReviewRow, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return row.status === 'pending' || row.status === 'expiring_soon';
  if (filter === 'expired') return row.status === 'expired' || row.status === 'missing';
  return row.status === filter;
}

export default function Credentials() {
  const [filter, setFilter] = useState<FilterKey>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const { data, error, loading, reload } = useAsyncResource(() => listAdminCredentialReviewQueue(), []);

  const rows = useMemo(() => (data?.rows ?? []).filter(row => matchesFilter(row, filter)), [data?.rows, filter]);

  const verify = async (id: string) => {
    setBusyId(id);
    const result = await verifyAdminWorkerCredential(id);
    setBusyId(null);
    if (!result.ok) return toast.error(result.error.message);
    toast.success(result.data.message);
    reload();
  };

  const reject = async (id: string) => {
    if (!reason.trim()) return toast.error('Add a rejection reason.');
    setBusyId(id);
    const result = await rejectAdminWorkerCredential(id, reason.trim());
    setBusyId(null);
    if (!result.ok) return toast.error(result.error.message);
    setRejectingId(null);
    setReason('');
    toast.success(result.data.message);
    reload();
  };

  const filters: { id: FilterKey; label: string; count?: number }[] = [
    { id: 'pending', label: 'Pending', count: data?.pendingCount },
    { id: 'verified', label: 'Verified', count: data?.verifiedCount },
    { id: 'rejected', label: 'Rejected', count: data?.rejectedCount },
    { id: 'expired', label: 'Expired', count: data?.expiredCount },
    { id: 'all', label: 'All' },
  ];

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading credential queue…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Marketplace identity</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Credential review</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Review the document and the person together. Worker photos stay visible anywhere identity matters.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="flex flex-wrap gap-6 border-b border-[#DDE7E8]">
          {filters.map(item => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`border-b-2 pb-3 text-sm font-semibold ${filter === item.id ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#607583]'}`}>
              {item.label}{item.count !== undefined ? ` ${item.count}` : ''}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto border-t border-[#BFCED4]">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Worker</th><th className="p-3">Credential</th><th className="p-3">Submitted</th><th className="p-3">Expiration</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-[#DDE7E8]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <AdminIdentityAvatar kind="worker" name={row.workerName} entityId={row.workerId} size="md" />
                      <div><p className="font-semibold text-[#13334F]">{row.workerName}</p>{row.workerLocation ? <p className="text-xs text-[#607583]">{row.workerLocation}</p> : null}</div>
                    </div>
                  </td>
                  <td className="p-3 text-[#607583]">{row.credentialName}</td>
                  <td className="p-3 text-[#607583]">{formatWhen(row.submittedAt)}</td>
                  <td className="p-3 text-[#607583]">{formatExpires(row.expiresAt)}</td>
                  <td className="p-3"><StatusBadge variant={statusBadgeVariant(row.status)}>{statusLabel(row.status)}</StatusBadge></td>
                  <td className="p-3">
                    {rejectingId === row.id ? (
                      <div className="min-w-[230px] space-y-2"><textarea rows={2} value={reason} onChange={event => setReason(event.target.value)} placeholder="Reason for rejection" className="w-full border-b border-[#BFCED4] bg-transparent p-1 text-sm outline-none focus:border-[#53B59F]" /><div className="flex gap-3 text-xs font-semibold"><button disabled={busyId === row.id} type="button" onClick={() => void reject(row.id)} className="text-[#A93636]">Confirm reject</button><button type="button" onClick={() => { setRejectingId(null); setReason(''); }} className="text-[#607583]">Cancel</button></div></div>
                    ) : (
                      <div className="flex gap-3">
                        {row.status !== 'verified' ? <button disabled={busyId === row.id} type="button" onClick={() => void verify(row.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#257665]"><CheckCircle2 className="h-4 w-4" /> Verify</button> : null}
                        {row.status !== 'rejected' ? <button disabled={busyId === row.id} type="button" onClick={() => setRejectingId(row.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#A93636]"><XCircle className="h-4 w-4" /> Reject</button> : null}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="py-8 text-sm text-[#607583]">No credentials in this view.</p> : null}
        </div>
      </main>
    </div>
  );
}
