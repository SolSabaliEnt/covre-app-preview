import type { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Clock3, DollarSign, FileText } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { getWorkerPayReadiness } from '../../services';
import type {
  WorkerEarningRow,
  WorkerEarningStatus,
  WorkerPayReadiness,
  WorkerPayoutMethodReadiness,
  WorkerPayoutMethodReadinessUiStatus,
  WorkerPayoutRow,
  WorkerPayoutStatus,
} from '../../services/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';

const mockPaymentHistory = [
  { date: 'May 13', facility: 'Sunrise Group Home', role: 'DSP', hours: 8, amount: '$224', status: 'paid' },
  { date: 'May 12', facility: 'Oak Memory Care', role: 'CNA', hours: 8, amount: '$208', status: 'paid' },
  { date: 'May 10', facility: 'Cedar Assisted Living', role: 'Med Aide', hours: 8, amount: '$256', status: 'processing' },
  { date: 'May 8', facility: 'Maple Residential', role: 'DSP', hours: 12, amount: '$336', status: 'paid' },
];

function formatUsdFromCents(cents: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDateLabel(iso?: string): string | undefined {
  if (!iso) return undefined;
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return undefined;
  return new Date(parsed).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function earningStatusLabel(status: WorkerEarningStatus): string {
  if (status === 'pending') return 'Pending';
  if (status === 'approved') return 'Approved';
  if (status === 'held') return 'Held';
  if (status === 'queued') return 'Queued';
  if (status === 'paid') return 'Paid';
  if (status === 'failed') return 'Failed';
  if (status === 'cancelled') return 'Cancelled';
  return status;
}

function earningStatusVariant(status: WorkerEarningStatus): 'covered' | 'pending' | 'missing' | 'urgent' {
  if (status === 'paid' || status === 'approved') return 'covered';
  if (status === 'failed' || status === 'cancelled') return 'missing';
  if (status === 'held') return 'urgent';
  return 'pending';
}

function payoutStatusLabel(status: WorkerPayoutStatus): string {
  if (status === 'created') return 'Prepared';
  if (status === 'processing') return 'Processing';
  if (status === 'paid') return 'Paid';
  if (status === 'failed') return 'Failed';
  if (status === 'cancelled') return 'Cancelled';
  return status;
}

function payoutStatusVariant(status: WorkerPayoutStatus): 'covered' | 'pending' | 'missing' | 'urgent' {
  if (status === 'paid') return 'covered';
  if (status === 'failed' || status === 'cancelled') return 'missing';
  return 'pending';
}

function payoutMethodBadgeLabel(status: WorkerPayoutMethodReadinessUiStatus): string {
  if (status === 'setup_not_connected' || status === 'no_method') return 'Not connected';
  if (status === 'pending') return 'Pending';
  if (status === 'active') return 'Active';
  if (status === 'failed') return 'Needs attention';
  if (status === 'inactive') return 'Inactive';
  return 'Unknown';
}

function payoutMethodBadgeVariant(status: WorkerPayoutMethodReadinessUiStatus): 'covered' | 'pending' | 'missing' | 'urgent' {
  if (status === 'active') return 'covered';
  if (status === 'failed') return 'urgent';
  return 'pending';
}

function LoadingBlock() {
  return (
    <div className="border-y border-[#DDE7E8] py-12 text-center">
      <p className="text-sm font-medium text-[#607583]">Loading earnings…</p>
    </div>
  );
}

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

function EarningRow({ row }: { row: WorkerEarningRow }) {
  const subtitle = [row.providerName, row.shiftRole].filter(Boolean).join(' · ');
  const dateLabel = row.approvedAt
    ? `Approved ${formatDateLabel(row.approvedAt)}`
    : row.createdAt
      ? `Recorded ${formatDateLabel(row.createdAt)}`
      : undefined;

  return (
    <article className="border-b border-[#DDE7E8] py-4">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="font-semibold text-[#13334F]">{subtitle || 'Shift earning'}</p>
          {dateLabel && <p className="mt-1 text-xs text-[#607583]">{dateLabel}</p>}
          {row.availableForPayoutAt && <p className="mt-1 text-xs text-[#9AAAB3]">Payout eligible {formatDateLabel(row.availableForPayoutAt)}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold text-[#13334F]">{formatUsdFromCents(row.netEarningsCents, row.currency)}</p>
          <div className="mt-1"><StatusBadge variant={earningStatusVariant(row.status)}>{earningStatusLabel(row.status)}</StatusBadge></div>
        </div>
      </div>
    </article>
  );
}

function PayoutRow({ row, title = 'Payout batch' }: { row: WorkerPayoutRow; title?: string }) {
  return (
    <article className="border-b border-[#DDE7E8] py-4">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="font-semibold text-[#13334F]">{title}</p>
          <p className="mt-1 text-xs text-[#607583]">
            {row.lineCount != null && row.lineCount > 0 ? `${row.lineCount} earning${row.lineCount === 1 ? '' : 's'}` : 'Payout record'}
            {row.createdAt ? ` · ${formatDateLabel(row.createdAt)}` : ''}
          </p>
          {row.paidAt && row.status === 'paid' && <p className="mt-1 text-xs text-[#257665]">Paid {formatDateLabel(row.paidAt)}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-semibold text-[#13334F]">{formatUsdFromCents(row.amountCents, row.currency)}</p>
          <div className="mt-1"><StatusBadge variant={payoutStatusVariant(row.status)}>{payoutStatusLabel(row.status)}</StatusBadge></div>
        </div>
      </div>
    </article>
  );
}

function TotalsStrip({ readiness }: { readiness: WorkerPayReadiness }) {
  const items = [
    { label: 'Pending', cents: readiness.totals.pendingCents },
    { label: 'Approved', cents: readiness.totals.approvedCents },
    { label: 'Queued', cents: readiness.totals.queuedCents },
    { label: 'Paid', cents: readiness.totals.paidCents },
    { label: 'Held', cents: readiness.totals.heldCents },
  ].filter(item => item.cents > 0);

  if (items.length === 0) return null;

  return (
    <div className="flex gap-6 overflow-x-auto border-y border-[#DDE7E8] py-4">
      {items.map(item => (
        <div key={item.label} className="min-w-[7rem] shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-[#13334F]">{formatUsdFromCents(item.cents)}</p>
        </div>
      ))}
    </div>
  );
}

function PayoutReadiness({ readiness }: { readiness: WorkerPayoutMethodReadiness }) {
  const setupButtonLabel =
    readiness.status === 'setup_not_connected' || readiness.status === 'no_method'
      ? 'Payout setup coming soon'
      : (readiness.actionLabel ?? 'Payout setup coming soon');

  return (
    <section className="border-b border-[#DDE7E8] py-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Payout readiness</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#466170]">{readiness.message}</p>
          <p className="mt-1 text-xs text-[#9AAAB3]">Prepared batches can appear here before money movement is live.</p>
          {readiness.processor && <p className="mt-1 text-xs text-[#9AAAB3]">Processor: {readiness.processor}</p>}
        </div>
        <StatusBadge variant={payoutMethodBadgeVariant(readiness.status)}>{payoutMethodBadgeLabel(readiness.status)}</StatusBadge>
      </div>
      <button type="button" disabled aria-disabled="true" className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#607583] disabled:cursor-not-allowed disabled:opacity-60">
        {setupButtonLabel} <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}

function PaySection({ title, description, emptyCopy, isEmpty, children }: { title: string; description: string; emptyCopy?: string; isEmpty: boolean; children: ReactNode }) {
  return (
    <section className="pt-7">
      <div className="pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#607583]">{description}</p>
      </div>
      {isEmpty && emptyCopy ? <p className="border-y border-[#DDE7E8] py-5 text-sm text-[#607583]">{emptyCopy}</p> : <div className="border-t border-[#BFCED4]">{children}</div>}
    </section>
  );
}

function SupabasePayView() {
  const { data: readiness, error, loading, reload } = useAsyncResource(() => getWorkerPayReadiness(), []);

  const approved = readiness?.earningsByStatus.approved ?? [];
  const queuedEarnings = readiness?.earningsByStatus.queued ?? [];
  const held = readiness?.earningsByStatus.held ?? [];
  const pending = readiness?.earningsByStatus.pending ?? [];
  const paidEarnings = readiness?.earningsByStatus.paid ?? [];
  const preparedPayouts = readiness?.payoutsByStatus.prepared ?? [];
  const processingPayouts = readiness?.payoutsByStatus.processing ?? [];
  const paidPayouts = readiness?.payoutsByStatus.paid ?? [];
  const failedPayouts = readiness?.payoutsByStatus.failed ?? [];
  const cancelledPayouts = readiness?.payoutsByStatus.cancelled ?? [];
  const failedEarnings = readiness?.earningsByStatus.failed ?? [];
  const cancelledEarnings = readiness?.earningsByStatus.cancelled ?? [];

  const hasPaidHistory = paidEarnings.length > 0 || paidPayouts.length > 0;
  const hasAnyRows = Boolean(readiness && (readiness.earnings.length > 0 || readiness.payouts.length > 0 || readiness.totals.pendingCents > 0 || readiness.totals.approvedCents > 0 || readiness.totals.queuedCents > 0 || readiness.totals.paidCents > 0 || readiness.totals.heldCents > 0));

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Money</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Earnings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">See what your approved work is worth, what is moving toward payout, and what has already been paid.</p>
        </header>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error.message} onRetry={reload} />}

        {!loading && !error && readiness && (
          <>
            <section className="py-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#607583]"><DollarSign className="h-4 w-4" aria-hidden /> Ledger summary</div>
                  <p className="mt-1 text-xs text-[#9AAAB3]">These are ledger totals, not a spendable cash balance.</p>
                </div>
                <p className="text-xs font-semibold text-[#9B6419]">Payout processing not live yet</p>
              </div>
              <div className="mt-4"><TotalsStrip readiness={readiness} /></div>
            </section>

            <PayoutReadiness readiness={readiness.payoutMethodReadiness} />

            {!hasAnyRows && (
              <section className="border-b border-[#DDE7E8] py-12 text-center">
                <Clock3 className="mx-auto h-7 w-7 text-[#53B59F]" aria-hidden />
                <p className="mt-3 font-semibold text-[#13334F]">No earnings yet.</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607583]">Approved timesheets will appear here once earnings are generated for your account.</p>
              </section>
            )}

            {hasAnyRows && (
              <>
                <PaySection title="Approved" description="Approved earnings are ready for payout batching." emptyCopy="No approved earnings waiting for a payout batch." isEmpty={approved.length === 0}>
                  {approved.map(row => <EarningRow key={row.id} row={row} />)}
                </PaySection>

                <PaySection title="Queued for payout" description="Prepared and processing payout records. Money has not necessarily been sent yet." emptyCopy="No payout batches have been prepared yet." isEmpty={preparedPayouts.length === 0 && processingPayouts.length === 0 && queuedEarnings.length === 0}>
                  {preparedPayouts.map(row => <PayoutRow key={row.id} row={row} title="Queued payout batch" />)}
                  {processingPayouts.map(row => <PayoutRow key={row.id} row={row} title="Payout in progress" />)}
                  {queuedEarnings.map(row => <EarningRow key={row.id} row={row} />)}
                </PaySection>

                {hasPaidHistory && (
                  <PaySection title="Paid" description="Confirmed paid records from the ledger." isEmpty={false}>
                    {paidPayouts.map(row => <PayoutRow key={row.id} row={row} title="Paid payout" />)}
                    {paidEarnings.map(row => <EarningRow key={row.id} row={row} />)}
                  </PaySection>
                )}

                {held.length > 0 && <PaySection title="Held" description="Blocked from payout batching until released by operations." isEmpty={false}>{held.map(row => <EarningRow key={row.id} row={row} />)}</PaySection>}
                {pending.length > 0 && <PaySection title="Pending" description="Not yet approved for payout." isEmpty={false}>{pending.map(row => <EarningRow key={row.id} row={row} />)}</PaySection>}

                {(failedPayouts.length > 0 || cancelledPayouts.length > 0 || failedEarnings.length > 0 || cancelledEarnings.length > 0) && (
                  <PaySection title="Needs attention" description="Failed or cancelled records that did not complete payout processing." isEmpty={false}>
                    {failedPayouts.map(row => <PayoutRow key={row.id} row={row} />)}
                    {cancelledPayouts.map(row => <PayoutRow key={row.id} row={row} />)}
                    {failedEarnings.map(row => <EarningRow key={row.id} row={row} />)}
                    {cancelledEarnings.map(row => <EarningRow key={row.id} row={row} />)}
                  </PaySection>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MockPayView() {
  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Money</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Earnings</h1>
          <p className="mt-2 text-sm leading-6 text-[#607583]">Track what you earned and when each shift was paid.</p>
        </header>

        <section className="border-b border-[#BFCED4] py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Available balance</p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#13334F]">$688.00</p>
          <div className="mt-5 flex flex-wrap gap-5 text-sm">
            <span><strong className="font-semibold text-[#13334F]">$688</strong> this week</span>
            <span><strong className="font-semibold text-[#13334F]">$2,456</strong> this month</span>
            <span><strong className="font-semibold text-[#13334F]">12</strong> shifts</span>
          </div>
        </section>

        <section className="pt-7">
          <div className="flex items-end justify-between gap-4 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">History</p>
              <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Recent earnings</h2>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#53B59F]" aria-hidden />
          </div>
          <div className="border-t border-[#BFCED4]">
            {mockPaymentHistory.map((payment, index) => (
              <article key={index} className="border-b border-[#DDE7E8] py-4">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-semibold text-[#13334F]">{payment.facility}</p>
                    <p className="mt-1 text-sm text-[#607583]">{payment.role} · {payment.hours} hours</p>
                    <p className="mt-1 text-xs text-[#9AAAB3]">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#13334F]">{payment.amount}</p>
                    <p className={`mt-1 text-xs font-semibold ${payment.status === 'paid' ? 'text-[#257665]' : 'text-[#9B6419]'}`}>{payment.status === 'paid' ? 'Paid' : 'Processing'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
            <FileText className="h-4 w-4" aria-hidden /> View tax documents <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </section>
      </div>
    </div>
  );
}

export default function Pay() {
  return isSupabaseBackendEnabled() ? <SupabasePayView /> : <MockPayView />;
}
