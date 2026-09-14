import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import { StatusBadge } from '../../components/StatusBadge';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { isProviderInvoiceCollectionUiEnabled } from '../../lib/providerInvoiceCollectionEnabled';
import {
  createAdminWorkerPayoutBatch,
  generateAdminWorkerEarningFromTimesheet,
  issueProviderInvoice,
  listAdminEarningGenerationQueue,
  listAdminInvoiceIssueQueue,
  listAdminProviderInvoiceCollectionQueue,
  listAdminWorkerPayoutBatchQueue,
  listPaymentOperations,
  startAdminProviderInvoiceCollection,
} from '../../services';
import type { AdminEarningGenerationRow, AdminProviderInvoiceCollectionRow } from '../../services/types';

function PayStatus({ s }: { s: 'pending' | 'failed' | 'open' | 'paid' | 'hold' }) {
  if (s === 'failed') return <StatusBadge variant="urgent">Failed</StatusBadge>;
  if (s === 'paid') return <StatusBadge variant="covered">Paid</StatusBadge>;
  if (s === 'hold') return <StatusBadge variant="missing">Hold</StatusBadge>;
  return <StatusBadge variant="pending">{s === 'open' ? 'Open' : 'Pending'}</StatusBadge>;
}

function InvoicePaymentStatusBadge({ status }: { status?: string }) {
  if (!status || status === 'not_started') return <StatusBadge variant="pending">Not started</StatusBadge>;
  if (status === 'paid') return <StatusBadge variant="covered">Paid</StatusBadge>;
  if (status === 'failed' || status === 'past_due' || status === 'disputed') return <StatusBadge variant="urgent">{status.replace(/_/g, ' ')}</StatusBadge>;
  return <StatusBadge variant="verified">{status.replace(/_/g, ' ')}</StatusBadge>;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrencyCents(cents: number, currency = 'usd'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function providerSiteLabel(row: AdminEarningGenerationRow): string {
  return [row.providerName, row.siteName].filter(Boolean).join(' · ') || '—';
}

function formatPaymentMethodLabel(row: AdminProviderInvoiceCollectionRow): string {
  if (!row.hasActivePaymentMethod) return 'Not set up';
  const brand = row.methodBrand ? row.methodBrand.toUpperCase() : 'Card';
  return `${brand}${row.methodLast4 ? ` •••• ${row.methodLast4}` : ''}`;
}

function QueueState({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-8 text-sm text-[#607583]">
      <p>{children}</p>
      {onRetry ? <button type="button" onClick={onRetry} className="mt-3 font-semibold text-[#2F8E7A]">Retry</button> : null}
    </div>
  );
}

function SectionHeader({
  stage,
  title,
  description,
  meta,
  action,
}: {
  stage: string;
  title: string;
  description: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">{stage}</p>
        <h2 className="mt-1 text-xl font-semibold text-[#13334F]">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#607583]">{description}</p>
        {meta ? <p className="mt-1 text-xs text-[#9AAAB3]">{meta}</p> : null}
      </div>
      {action}
    </div>
  );
}

function MetricRail({ items }: { items: Array<{ label: string; value: ReactNode; tone?: 'default' | 'warn' | 'danger' | 'good' }> }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[#DDE7E8] py-4 lg:grid-cols-4">
      {items.map(item => (
        <div key={item.label}>
          <p className={`text-xl font-semibold ${item.tone === 'danger' ? 'text-[#A93636]' : item.tone === 'warn' ? 'text-[#9B6419]' : item.tone === 'good' ? 'text-[#257665]' : 'text-[#13334F]'}`}>{item.value}</p>
          <p className="mt-0.5 text-xs text-[#607583]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function EarningGenerationSection({ financeRefreshKey }: { financeRefreshKey: number }) {
  const supabaseMode = isSupabaseBackendEnabled();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { data: queue, error, loading, reload } = useAsyncResource(() => listAdminEarningGenerationQueue(), [financeRefreshKey]);

  if (loading) return <section className="border-t border-[#BFCED4] pt-7"><QueueState>Loading earning generation queue…</QueueState></section>;
  if (error) return <section className="border-t border-[#BFCED4] pt-7"><QueueState onRetry={reload}>{error.message}</QueueState></section>;
  if (!queue) return null;

  const handleGenerate = async (timesheetId: string) => {
    setGeneratingId(timesheetId);
    try {
      const result = await generateAdminWorkerEarningFromTimesheet(timesheetId);
      if (!result.ok) return toast.error(result.error.message);
      toast.success(result.data.message);
      reload();
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <section className="border-t border-[#BFCED4] pt-7">
      <SectionHeader
        stage="01 · Work → earning"
        title="Generate worker earnings"
        description="Approved work becomes a worker earning only after the accepted pay snapshot is present. Generating the ledger record does not send money."
        meta={supabaseMode ? 'Audited Supabase RPC' : queue.message}
      />
      <MetricRail items={[
        { label: 'Approved timesheets', value: queue.summary.approvedTimesheets },
        { label: 'Ready to generate', value: queue.summary.readyToGenerate, tone: 'good' },
        { label: 'Already generated', value: queue.summary.alreadyGenerated },
        { label: 'Missing rate snapshot', value: queue.summary.missingRateSnapshot, tone: queue.summary.missingRateSnapshot ? 'warn' : 'default' },
      ]} />

      <div className="mt-4 overflow-x-auto border-t border-[#DDE7E8]">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Worker</th><th className="p-3">Provider / site</th><th className="p-3">Shift date</th><th className="p-3">Accepted pay</th><th className="p-3">Timesheet</th><th className="p-3">Earning</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {queue.rows.map(row => {
              const busy = generatingId === row.timesheetId;
              return (
                <tr key={row.timesheetId} className="border-b border-[#DDE7E8]">
                  <td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="worker" name={row.workerName ?? 'Worker'} size="sm" /><span className="font-semibold text-[#13334F]">{row.workerName ?? '—'}</span></div></td>
                  <td className="p-3 text-[#607583]">{providerSiteLabel(row)}</td>
                  <td className="p-3 text-[#607583]">{formatDate(row.shiftStartsAt)}</td>
                  <td className="p-3 font-medium text-[#13334F]">{row.workerPayDisplay ?? (row.hasWorkerRateSnapshot ? '—' : 'Snapshot missing')}</td>
                  <td className="p-3"><StatusBadge variant="covered">{row.timesheetStatus}</StatusBadge></td>
                  <td className="p-3">{row.earningStatus ? <StatusBadge variant="verified">{row.earningStatus}</StatusBadge> : <StatusBadge variant="pending">Not generated</StatusBadge>}</td>
                  <td className="p-3">{row.canGenerate ? <button type="button" disabled={busy || !supabaseMode} onClick={() => void handleGenerate(row.timesheetId)} className="text-xs font-semibold text-[#257665] disabled:text-[#9AAAB3]">{busy ? 'Generating…' : supabaseMode ? 'Generate earning' : 'Connect to generate'}</button> : <span className="text-xs text-[#9AAAB3]" title={row.blockerReason}>{row.blockerReason ?? 'Not available'}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {queue.rows.length === 0 ? <p className="py-7 text-sm text-[#607583]">No approved timesheets are waiting for earning generation.</p> : null}
      </div>
    </section>
  );
}

function PayoutBatchingSection({ financeRefreshKey, onBatchCreated }: { financeRefreshKey: number; onBatchCreated: () => void }) {
  const supabaseMode = isSupabaseBackendEnabled();
  const [batchingWorkerId, setBatchingWorkerId] = useState<string | null>(null);
  const [batchingAll, setBatchingAll] = useState(false);
  const { data: queue, error, loading, reload } = useAsyncResource(() => listAdminWorkerPayoutBatchQueue(), [financeRefreshKey]);

  if (loading) return <section className="border-t border-[#BFCED4] pt-7"><QueueState>Loading payout batching queue…</QueueState></section>;
  if (error) return <section className="border-t border-[#BFCED4] pt-7"><QueueState onRetry={reload}>{error.message}</QueueState></section>;
  if (!queue) return null;

  const hasEligible = queue.summary.readyEarnings > 0;
  const batchBusy = batchingAll || batchingWorkerId !== null;

  const handleCreateBatch = async (workerId?: string) => {
    workerId ? setBatchingWorkerId(workerId) : setBatchingAll(true);
    try {
      const result = await createAdminWorkerPayoutBatch(workerId);
      if (!result.ok) return toast.error(result.error.message);
      result.data.payoutCount > 0 ? toast.success('Payout batch created. No money has been sent.') : toast.info(result.data.message);
      reload();
      onBatchCreated();
    } finally {
      setBatchingWorkerId(null);
      setBatchingAll(false);
    }
  };

  return (
    <section className="border-t border-[#BFCED4] pt-7">
      <SectionHeader
        stage="02 · Earnings → payout prep"
        title="Batch approved earnings"
        description="Group approved worker earnings into payout batches. A batch is preparation for processing—it is not proof that money moved."
        meta={supabaseMode ? `${queue.summary.queuedEarnings} earnings already queued; none implied paid.` : queue.message}
        action={supabaseMode && hasEligible ? <button type="button" disabled={batchBusy} onClick={() => void handleCreateBatch()} className="text-sm font-semibold text-[#257665] disabled:opacity-50">{batchingAll ? 'Creating…' : 'Create all eligible batches'}</button> : undefined}
      />
      <MetricRail items={[
        { label: 'Ready earnings', value: queue.summary.readyEarnings, tone: 'good' },
        { label: 'Eligible amount', value: formatCurrencyCents(queue.summary.totalEligibleCents) },
        { label: 'Workers', value: queue.summary.workerCount },
        { label: 'Created batches', value: queue.summary.createdPayouts },
      ]} />

      <div className="mt-4 overflow-x-auto border-t border-[#DDE7E8]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Worker</th><th className="p-3">Earnings</th><th className="p-3">Eligible amount</th><th className="p-3">Currency</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {queue.groupedByWorker.map(group => {
              const busy = batchingWorkerId === group.workerId;
              return (
                <tr key={`${group.workerId}:${group.currency}`} className="border-b border-[#DDE7E8]">
                  <td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="worker" name={group.workerName ?? 'Worker'} entityId={group.workerId} size="sm" /><span className="font-semibold text-[#13334F]">{group.workerName ?? '—'}</span></div></td>
                  <td className="p-3 text-[#607583]">{group.earningCount}</td>
                  <td className="p-3 font-semibold text-[#13334F]">{formatCurrencyCents(group.amountCents, group.currency)}</td>
                  <td className="p-3 text-[#607583]">{group.currency.toUpperCase()}</td>
                  <td className="p-3"><button type="button" disabled={busy || batchBusy || !supabaseMode} onClick={() => void handleCreateBatch(group.workerId)} className="text-xs font-semibold text-[#257665] disabled:text-[#9AAAB3]">{busy ? 'Creating…' : supabaseMode ? 'Create worker batch' : 'Connect to batch'}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {queue.groupedByWorker.length === 0 ? <p className="py-7 text-sm text-[#607583]">No approved earnings are ready for payout batching.</p> : null}
      </div>
    </section>
  );
}

function InvoiceIssuingSection({ financeRefreshKey }: { financeRefreshKey: number }) {
  const supabaseMode = isSupabaseBackendEnabled();
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const { data: queue, error, loading, reload } = useAsyncResource(() => listAdminInvoiceIssueQueue(), [financeRefreshKey]);

  if (loading) return <section className="border-t border-[#BFCED4] pt-7"><QueueState>Loading invoice issue queue…</QueueState></section>;
  if (error) return <section className="border-t border-[#BFCED4] pt-7"><QueueState onRetry={reload}>{error.message}</QueueState></section>;
  if (!queue) return null;

  const handleIssue = async (invoiceId: string) => {
    setIssuingId(invoiceId);
    try {
      const result = await issueProviderInvoice(invoiceId);
      if (!result.ok) return toast.error(result.error.message);
      toast.success(supabaseMode ? 'Invoice issued. No payment has been collected.' : result.data.message);
      reload();
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <section className="border-t border-[#BFCED4] pt-7">
      <SectionHeader
        stage="03 · Provider work → invoice"
        title="Issue provider invoices"
        description="Issue complete draft invoices and lock the amount that will move into collection. Issuing an invoice does not charge the provider."
        meta={supabaseMode ? 'Issuing is an audited admin action.' : queue.message}
      />
      <MetricRail items={[
        { label: 'Draft invoices', value: queue.summary.draftInvoices },
        { label: 'Ready to issue', value: queue.summary.readyToIssue, tone: 'good' },
        { label: 'Blocked', value: queue.summary.blocked, tone: queue.summary.blocked ? 'warn' : 'default' },
        { label: 'Open invoices', value: queue.summary.openInvoices },
      ]} />

      <div className="mt-4 overflow-x-auto border-t border-[#DDE7E8]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Provider</th><th className="p-3">Invoice</th><th className="p-3">Total</th><th className="p-3">Lines</th><th className="p-3">Generated</th><th className="p-3">Due</th><th className="p-3">State</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {queue.rows.map(row => {
              const busy = issuingId === row.invoiceId;
              return (
                <tr key={row.invoiceId} className="border-b border-[#DDE7E8]">
                  <td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={row.providerName ?? 'Provider'} size="sm" /><span className="font-semibold text-[#13334F]">{row.providerName ?? '—'}</span></div></td>
                  <td className="p-3 font-mono text-xs text-[#607583]" title={row.invoiceId}>{row.invoiceNumber ?? row.invoiceId.slice(0, 8)}</td>
                  <td className="p-3 font-semibold text-[#13334F]">{row.totalDisplay}</td>
                  <td className="p-3 text-[#607583]">{row.lineCount}</td>
                  <td className="p-3 text-[#607583]">{formatDate(row.generatedAt)}</td>
                  <td className="p-3 text-[#607583]">{formatDate(row.dueAt)}</td>
                  <td className="p-3"><div className="flex flex-col items-start gap-1"><StatusBadge variant="pending">{row.status}</StatusBadge><InvoicePaymentStatusBadge status={row.paymentStatus} /></div></td>
                  <td className="p-3">{row.canIssue ? <button type="button" disabled={busy} onClick={() => void handleIssue(row.invoiceId)} className="text-xs font-semibold text-[#257665] disabled:opacity-50">{busy ? 'Issuing…' : 'Issue invoice'}</button> : <span className="text-xs text-[#9AAAB3]" title={row.blockerReason}>{row.blockerReason ?? 'Blocked'}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {queue.rows.length === 0 ? <p className="py-7 text-sm text-[#607583]">No generated drafts are waiting to be issued.</p> : null}
      </div>
    </section>
  );
}

function InvoiceCollectionSection({ financeRefreshKey, onCollectionStarted }: { financeRefreshKey: number; onCollectionStarted: () => void }) {
  const supabaseMode = isSupabaseBackendEnabled();
  const collectionFlagEnabled = isProviderInvoiceCollectionUiEnabled();
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const { data: queue, error, loading, reload } = useAsyncResource(() => listAdminProviderInvoiceCollectionQueue(), [financeRefreshKey]);

  if (loading) return <section className="border-t border-[#BFCED4] pt-7"><QueueState>Loading invoice collection queue…</QueueState></section>;
  if (error) return <section className="border-t border-[#BFCED4] pt-7"><QueueState onRetry={reload}>{error.message}</QueueState></section>;
  if (!queue) return null;

  const collectionUiEnabled = queue.collectionUiEnabled && collectionFlagEnabled;

  const handleStartCollection = async (invoiceId: string) => {
    if (!window.confirm('Start Stripe payment processing for this invoice? Paid status will update only after Stripe confirms payment.')) return;
    setCollectingId(invoiceId);
    try {
      const result = await startAdminProviderInvoiceCollection(invoiceId);
      if (!result.ok) return toast.error(result.error.message);
      toast.success(result.data.message);
      reload();
      onCollectionStarted();
    } finally {
      setCollectingId(null);
    }
  };

  const collectionMeta = !collectionUiEnabled
    ? 'Collection controls are staged off until the processor and feature flag are configured.'
    : 'Paid status updates only after Stripe webhook confirmation.';

  return (
    <section className="border-t border-[#BFCED4] pt-7">
      <SectionHeader
        stage="04 · Invoice → collection"
        title="Collect provider invoices"
        description="Start server-side payment processing only when an issued invoice and active payment method are ready. Covre does not mark an invoice paid from the click alone."
        meta={!supabaseMode && queue.message ? queue.message : collectionMeta}
      />
      <MetricRail items={[
        { label: 'Open invoices', value: queue.summary.openInvoices },
        { label: 'Ready to collect', value: queue.summary.readyToCollect, tone: 'good' },
        { label: 'Missing payment method', value: queue.summary.missingPaymentMethod, tone: queue.summary.missingPaymentMethod ? 'warn' : 'default' },
        { label: 'Processing / paid', value: `${queue.summary.processing} / ${queue.summary.paid}` },
      ]} />

      <div className="mt-4 overflow-x-auto border-t border-[#DDE7E8]">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Provider</th><th className="p-3">Invoice</th><th className="p-3">Amount</th><th className="p-3">Payment state</th><th className="p-3">Method</th><th className="p-3">Last attempt</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {queue.rows.map(row => {
              const busy = collectingId === row.invoiceId;
              const canStart = supabaseMode && collectionUiEnabled && row.canCollect && !busy;
              return (
                <tr key={row.invoiceId} className="border-b border-[#DDE7E8]">
                  <td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={row.providerName ?? 'Provider'} entityId={row.providerId} size="sm" /><span className="font-semibold text-[#13334F]">{row.providerName ?? '—'}</span></div></td>
                  <td className="p-3 font-mono text-xs text-[#607583]" title={row.invoiceId}>{row.invoiceNumber ?? row.invoiceId.slice(0, 8)}</td>
                  <td className="p-3 font-semibold text-[#13334F]">{row.totalDisplay}</td>
                  <td className="p-3"><InvoicePaymentStatusBadge status={row.paymentStatus} /></td>
                  <td className="p-3 text-[#607583]">{formatPaymentMethodLabel(row)}</td>
                  <td className="p-3 text-[#607583]">{formatDate(row.lastPaymentAttemptAt)}</td>
                  <td className="p-3">{canStart ? <button type="button" disabled={busy} onClick={() => void handleStartCollection(row.invoiceId)} className="text-xs font-semibold text-[#257665]">{busy ? 'Starting…' : 'Start collection'}</button> : <span className="text-xs text-[#9AAAB3]" title={row.blockerReason}>{row.blockerReason ?? (!collectionUiEnabled ? 'Collection disabled' : 'Not ready')}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {queue.rows.length === 0 ? <p className="py-7 text-sm text-[#607583]">No issued invoices are available for collection.</p> : null}
      </div>
    </section>
  );
}

function DemoFinanceLedger({ paymentMetricCards, workerPayouts, providerInvoices, holds }: { paymentMetricCards: Array<{ label: string; value: string; change?: string; sub?: string; tone?: string }>; workerPayouts: any[]; providerInvoices: any[]; holds: any[] }) {
  return (
    <section className="border-t border-[#BFCED4] pt-7">
      <SectionHeader stage="Preview ledger" title="Demo finance records" description="These rows show how finance history will read once the live Covre database and payment rails are connected. Actions below remain mock-only." />
      <MetricRail items={paymentMetricCards.map(metric => ({ label: metric.label, value: metric.value, tone: metric.tone === 'bad' ? 'danger' : metric.tone === 'warn' ? 'warn' : 'default' }))} />

      <div className="mt-7 grid gap-8 xl:grid-cols-3">
        <div>
          <h3 className="text-sm font-semibold text-[#13334F]">Worker payouts</h3>
          <div className="mt-2 border-t border-[#DDE7E8]">
            {workerPayouts.map(record => <div key={record.id} className="border-b border-[#DDE7E8] py-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="worker" name={record.partyLabel} size="sm" /><div><p className="font-semibold text-[#13334F]">{record.partyLabel}</p><p className="text-xs text-[#607583]">{record.dateLabel} · {record.method}</p></div></div><div className="text-right"><p className="font-semibold text-[#13334F]">{record.amount}</p><PayStatus s={record.status} /></div></div><div className="mt-3 flex gap-4 text-xs font-semibold"><button type="button" onClick={() => toast('Payout release queued (mock)')} className="text-[#257665]">Release</button><button type="button" onClick={() => toast('Retry initiated (mock)')} className="text-[#13334F]">Retry</button><button type="button" onClick={() => toast('Opening payout detail (mock)')} className="text-[#607583]">Details</button></div></div>)}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#13334F]">Provider invoices</h3>
          <div className="mt-2 border-t border-[#DDE7E8]">
            {providerInvoices.map(record => <div key={record.id} className="border-b border-[#DDE7E8] py-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={record.partyLabel} size="sm" /><div><p className="font-semibold text-[#13334F]">{record.partyLabel}</p><p className="text-xs text-[#607583]">{record.dateLabel} · {record.method}</p></div></div><div className="text-right"><p className="font-semibold text-[#13334F]">{record.amount}</p><PayStatus s={record.status === 'open' ? 'open' : 'paid'} /></div></div><button type="button" onClick={() => toast('Invoice detail opened (mock)')} className="mt-3 text-xs font-semibold text-[#2F8E7A]">View details</button></div>)}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#13334F]">Payment holds</h3>
          <div className="mt-2 border-t border-[#DDE7E8]">
            {holds.map(record => <div key={record.id} className="border-b border-[#DDE7E8] py-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#13334F]">{record.subjectLine ?? record.partyLabel}</p><p className="mt-1 text-xs text-[#607583]">{record.dateLabel} · {record.method}</p></div><div className="text-right"><p className="font-semibold text-[#13334F]">{record.amount}</p><PayStatus s={record.status} /></div></div><div className="mt-3 flex gap-4 text-xs font-semibold"><button type="button" onClick={() => toast('Hold review opened (mock)')} className="text-[#257665]">Review hold</button><button type="button" onClick={() => toast('Hold case detail (mock)')} className="text-[#607583]">Details</button></div></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Payments() {
  const supabaseMode = isSupabaseBackendEnabled();
  const [financeRefreshKey, setFinanceRefreshKey] = useState(0);
  const { data, error, loading, reload } = useAsyncResource(() => listPaymentOperations(), []);

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading payment operations…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><QueueState onRetry={reload}>{error.message}</QueueState></div>;
  if (!data) return null;

  const workerPayouts = data.records.filter(record => record.kind === 'worker_payout');
  const providerInvoices = data.records.filter(record => record.kind === 'provider_invoice');
  const holds = data.records.filter(record => record.kind === 'hold');

  return (
    <div className="min-h-full bg-[#F7FAFA] text-[#10283D]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Money movement</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Payment operations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Follow the money in order: approved work becomes an earning, earnings are batched for payout, provider work becomes an invoice, then issued invoices move into collection.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-12 pt-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-[#DDE7E8] pb-6 lg:grid-cols-4">
          {[['01', 'Generate earnings'], ['02', 'Batch payouts'], ['03', 'Issue invoices'], ['04', 'Collect invoices']].map(([step, label]) => <div key={step}><p className="text-xs font-semibold text-[#2F8E7A]">{step}</p><p className="mt-1 text-sm font-semibold text-[#13334F]">{label}</p></div>)}
        </div>

        <div className="space-y-9 pt-8">
          <EarningGenerationSection financeRefreshKey={financeRefreshKey} />
          <PayoutBatchingSection financeRefreshKey={financeRefreshKey} onBatchCreated={() => setFinanceRefreshKey(key => key + 1)} />
          <InvoiceIssuingSection financeRefreshKey={financeRefreshKey} />
          <InvoiceCollectionSection financeRefreshKey={financeRefreshKey} onCollectionStarted={() => setFinanceRefreshKey(key => key + 1)} />
          {!supabaseMode ? <DemoFinanceLedger paymentMetricCards={data.paymentMetricCards} workerPayouts={workerPayouts} providerInvoices={providerInvoices} holds={holds} /> : null}
        </div>
      </main>
    </div>
  );
}
