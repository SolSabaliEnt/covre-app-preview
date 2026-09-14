import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import { StatusBadge, type BadgeVariant } from '../../components/StatusBadge';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import {
  listAdminWorkerRateReviewQueue,
  lockAdminShiftRates,
  setAdminShiftWorkerRate,
  unlockAdminShiftRates,
  updateAdminShiftBillRate,
} from '../../services';
import type {
  AdminWorkerRateReviewQueue,
  AdminWorkerRateReviewRow,
  AdminWorkerRateReviewStatus,
} from '../../services/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';

type RateFilter = 'all' | 'missing_worker_rate' | 'missing_bill_rate' | 'rate_ready' | 'locked';
type RateActionKind = 'set_worker' | 'update_bill' | 'lock' | 'unlock';
type ActiveRateAction = { shiftId: string; kind: RateActionKind };

const FILTERS: { id: RateFilter; label: string }[] = [
  { id: 'missing_worker_rate', label: 'Missing worker rate' },
  { id: 'missing_bill_rate', label: 'Missing bill rate' },
  { id: 'rate_ready', label: 'Ready' },
  { id: 'locked', label: 'Locked' },
  { id: 'all', label: 'All' },
];

function formatWhen(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatRateCents(cents?: number): string {
  return cents == null ? '—' : `$${(cents / 100).toFixed(2)}/hr`;
}

function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim().replace(/^\$/, '');
  if (!trimmed || !/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [wholePart, fractionPart = ''] = trimmed.split('.');
  const whole = Number.parseInt(wholePart, 10);
  const fraction = Number.parseInt((fractionPart + '00').slice(0, 2), 10);
  return Number.isFinite(whole) && Number.isFinite(fraction) && whole >= 0 ? whole * 100 + fraction : null;
}

function statusBadgeVariant(status: AdminWorkerRateReviewStatus): BadgeVariant {
  if (status === 'rate_ready') return 'covered';
  if (status === 'locked') return 'verified';
  if (status === 'missing_bill_rate') return 'pending';
  return 'missing';
}

function statusLabel(status: AdminWorkerRateReviewStatus): string {
  if (status === 'missing_worker_rate') return 'Worker rate missing';
  if (status === 'missing_bill_rate') return 'Bill rate missing';
  if (status === 'rate_ready') return 'Ready to lock';
  return 'Locked';
}

function filterRows(rows: AdminWorkerRateReviewRow[], filter: RateFilter): AdminWorkerRateReviewRow[] {
  return filter === 'all' ? rows : rows.filter(row => row.status === filter);
}

function actionLabel(kind: RateActionKind): string {
  if (kind === 'set_worker') return 'Set worker rate';
  if (kind === 'update_bill') return 'Update bill rate';
  if (kind === 'lock') return 'Lock rates';
  return 'Unlock rates';
}

function RateActionForm({
  kind,
  amountDollars,
  reason,
  busy,
  onAmountChange,
  onReasonChange,
  onSubmit,
  onCancel,
}: {
  kind: RateActionKind;
  amountDollars: string;
  reason: string;
  busy: boolean;
  onAmountChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const needsAmount = kind === 'set_worker' || kind === 'update_bill';
  return (
    <div className="min-w-[250px] border-l-2 border-[#53B59F] pl-4">
      <p className="text-sm font-semibold text-[#13334F]">{actionLabel(kind)}</p>
      {needsAmount ? (
        <input
          type="text"
          inputMode="decimal"
          value={amountDollars}
          onChange={event => onAmountChange(event.target.value)}
          placeholder="Rate, e.g. 28.00"
          className="mt-3 w-full border-b border-[#BFCED4] bg-transparent py-2 text-sm text-[#13334F] outline-none placeholder:text-[#9AAAB3] focus:border-[#53B59F]"
        />
      ) : null}
      <textarea
        value={reason}
        onChange={event => onReasonChange(event.target.value)}
        placeholder="Reason required for the audit trail"
        rows={2}
        className="mt-2 w-full resize-none border-b border-[#BFCED4] bg-transparent py-2 text-sm text-[#13334F] outline-none placeholder:text-[#9AAAB3] focus:border-[#53B59F]"
      />
      <div className="mt-3 flex gap-4 text-xs font-semibold">
        <button disabled={busy} type="button" onClick={onSubmit} className="text-[#257665] disabled:opacity-50">{busy ? 'Saving…' : 'Confirm'}</button>
        <button disabled={busy} type="button" onClick={onCancel} className="text-[#607583] disabled:opacity-50">Cancel</button>
      </div>
    </div>
  );
}

function RateActions({
  row,
  enabled,
  busyId,
  activeAction,
  amountDollars,
  reason,
  onStart,
  onAmountChange,
  onReasonChange,
  onSubmit,
  onCancel,
}: {
  row: AdminWorkerRateReviewRow;
  enabled: boolean;
  busyId: string | null;
  activeAction: ActiveRateAction | null;
  amountDollars: string;
  reason: string;
  onStart: (shiftId: string, kind: RateActionKind) => void;
  onAmountChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!enabled) return <span className="text-xs text-[#9AAAB3]">Connect Supabase to edit</span>;

  const active = activeAction?.shiftId === row.shiftId ? activeAction : null;
  if (active) {
    return <RateActionForm kind={active.kind} amountDollars={amountDollars} reason={reason} busy={busyId === row.shiftId} onAmountChange={onAmountChange} onReasonChange={onReasonChange} onSubmit={onSubmit} onCancel={onCancel} />;
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold">
      {row.status === 'missing_worker_rate' ? <button type="button" onClick={() => onStart(row.shiftId, 'set_worker')} className="text-[#257665]">Set worker rate</button> : null}
      {row.status === 'missing_bill_rate' || row.status === 'rate_ready' ? <button type="button" onClick={() => onStart(row.shiftId, 'update_bill')} className="text-[#13334F]">Update bill rate</button> : null}
      {row.status === 'rate_ready' ? <button type="button" onClick={() => onStart(row.shiftId, 'lock')} className="inline-flex items-center gap-1 text-[#13334F]"><LockKeyhole className="h-3.5 w-3.5" /> Lock</button> : null}
      {row.status === 'locked' ? <button type="button" onClick={() => onStart(row.shiftId, 'unlock')} className="inline-flex items-center gap-1 text-[#9B6419]"><UnlockKeyhole className="h-3.5 w-3.5" /> Unlock</button> : null}
    </div>
  );
}

function RateReviewContent({ data, reload, actionsEnabled }: { data: AdminWorkerRateReviewQueue; reload: () => void; actionsEnabled: boolean }) {
  const [filter, setFilter] = useState<RateFilter>('missing_worker_rate');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActiveRateAction | null>(null);
  const [amountDollars, setAmountDollars] = useState('');
  const [reason, setReason] = useState('');
  const filtered = useMemo(() => filterRows(data.rows, filter), [data.rows, filter]);

  const counts: Record<RateFilter, number> = {
    all: data.rows.length,
    missing_worker_rate: data.summary.missingWorkerRate,
    missing_bill_rate: data.summary.missingBillRate,
    rate_ready: data.summary.ready,
    locked: data.summary.locked,
  };

  const clearForm = () => {
    setActiveAction(null);
    setAmountDollars('');
    setReason('');
  };

  const submit = async () => {
    if (!activeAction) return;
    const auditReason = reason.trim();
    if (!auditReason) return toast.error('A reason is required for audited rate changes.');

    let cents: number | null = null;
    if (activeAction.kind === 'set_worker' || activeAction.kind === 'update_bill') {
      cents = parseDollarsToCents(amountDollars);
      if (cents == null) return toast.error('Enter a valid USD hourly rate.');
    }

    setBusyId(activeAction.shiftId);
    const result = activeAction.kind === 'set_worker'
      ? await setAdminShiftWorkerRate({ shiftId: activeAction.shiftId, workerRateCents: cents!, reason: auditReason })
      : activeAction.kind === 'update_bill'
        ? await updateAdminShiftBillRate({ shiftId: activeAction.shiftId, billRateCents: cents!, reason: auditReason })
        : activeAction.kind === 'lock'
          ? await lockAdminShiftRates({ shiftId: activeAction.shiftId, reason: auditReason })
          : await unlockAdminShiftRates({ shiftId: activeAction.shiftId, reason: auditReason });
    setBusyId(null);

    if (!result.ok) return toast.error(result.error.message);
    toast.success(result.data.message);
    clearForm();
    reload();
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-6">
      <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-[#DDE7E8] py-5 lg:grid-cols-4">
        <div><p className="text-2xl font-semibold text-[#A93636]">{data.summary.missingWorkerRate}</p><p className="text-sm text-[#607583]">Missing worker rate</p></div>
        <div><p className="text-2xl font-semibold text-[#9B6419]">{data.summary.missingBillRate}</p><p className="text-sm text-[#607583]">Missing bill rate</p></div>
        <div><p className="text-2xl font-semibold text-[#257665]">{data.summary.ready}</p><p className="text-sm text-[#607583]">Ready to lock</p></div>
        <div><p className="text-2xl font-semibold text-[#13334F]">{data.summary.locked}</p><p className="text-sm text-[#607583]">Locked</p></div>
      </section>

      <section className="border-b border-[#DDE7E8] py-4 text-sm leading-6 text-[#607583]">
        <p><strong className="font-semibold text-[#13334F]">Rate governance:</strong> changes are audited. Worker earnings remain downstream of accepted booking snapshots and approved timesheets.</p>
        {!actionsEnabled ? <p className="mt-1 text-[#9B6419]">Preview mode: review the queue now; edits activate when Covre is connected to its Supabase backend.</p> : null}
        {data.message ? <p className="mt-1 text-xs text-[#9AAAB3]">{data.message}</p> : null}
      </section>

      <div className="mt-6 flex flex-wrap gap-6 border-b border-[#DDE7E8]">
        {FILTERS.map(item => (
          <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`border-b-2 pb-3 text-sm font-semibold ${filter === item.id ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#607583] hover:text-[#13334F]'}`}>
            {item.label} <span className="font-normal text-[#9AAAB3]">{counts[item.id]}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto border-t border-[#BFCED4]">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Shift</th><th className="p-3">Provider / site</th><th className="p-3">Starts</th><th className="p-3">Bill rate</th><th className="p-3">Worker rate</th><th className="p-3">State</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map(row => (
              <tr key={row.id} className="border-b border-[#DDE7E8]">
                <td className="p-3"><p className="font-semibold text-[#13334F]">{row.role}</p><div className="mt-1 flex items-center gap-2 text-xs text-[#607583]"><span className="capitalize">{row.shiftStatus ?? '—'}</span>{row.isUrgent ? <span className="font-semibold text-[#A93636]">Urgent</span> : null}</div><Link to={`/admin/shifts/${row.shiftId}`} className="mt-1 inline-block text-xs font-semibold text-[#2F8E7A]">Open shift</Link></td>
                <td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={row.providerName ?? 'Provider'} entityId={row.providerId} size="sm" /><div><p className="font-medium text-[#13334F]">{row.providerName ?? '—'}</p><p className="text-xs text-[#607583]">{row.siteName ?? '—'}</p></div></div></td>
                <td className="p-3 text-[#607583]">{formatWhen(row.startsAt)}</td>
                <td className="p-3 font-medium text-[#13334F]">{formatRateCents(row.billRateCents)}</td>
                <td className="p-3 font-medium text-[#13334F]">{formatRateCents(row.workerRateCents)}</td>
                <td className="p-3"><StatusBadge variant={statusBadgeVariant(row.status)}>{statusLabel(row.status)}</StatusBadge></td>
                <td className="p-3"><RateActions row={row} enabled={actionsEnabled} busyId={busyId} activeAction={activeAction} amountDollars={amountDollars} reason={reason} onStart={(shiftId, kind) => { setActiveAction({ shiftId, kind }); setAmountDollars(''); setReason(''); }} onAmountChange={setAmountDollars} onReasonChange={setReason} onSubmit={() => void submit()} onCancel={clearForm} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <div className="py-10 text-sm text-[#607583]">No shifts in this view. <button type="button" onClick={reload} className="font-semibold text-[#2F8E7A]">Refresh queue</button></div> : null}
      </div>
    </main>
  );
}

export default function AdminWorkerRates() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { data, error, loading, reload } = useAsyncResource(() => listAdminWorkerRateReviewQueue(), []);
  const actionsEnabled = supabaseMode && (data?.isSupabaseBacked ?? false);

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Money governance</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Rate review</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Resolve missing rates, confirm the provider context, and lock the commercial snapshot before work turns into earnings.</p>
        </div>
      </header>

      {loading ? <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading rate review…</div> : null}
      {error ? <div className="mx-auto max-w-7xl p-6"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 text-sm font-semibold text-[#2F8E7A]">Retry</button></div> : null}
      {data ? <RateReviewContent data={data} reload={reload} actionsEnabled={actionsEnabled} /> : null}
    </div>
  );
}
