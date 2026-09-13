import { useState } from 'react';
import { CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';
import {
  generateProviderInvoiceFromApprovedTimesheets,
  getProviderBillingReadiness,
  getProviderPaymentMethodReadiness,
  listProviderInvoices,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useProviderAction } from '../../hooks/useProviderAction';
import { isProviderPaymentMethodSetupUiEnabled } from '../../lib/providerPaymentSetupEnabled';
import { startProviderPaymentMethodSetup } from '../../lib/providerPaymentMethodSetup';

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export default function Billing() {
  const { run, isPending } = useProviderAction();
  const setupUiEnabled = isProviderPaymentMethodSetupUiEnabled();
  const [setupLoading, setSetupLoading] = useState(false);
  const { data: summary, error, loading, reload } = useAsyncResource(() => getProviderBillingReadiness(), []);
  const { data: invoices, error: invoiceError, reload: reloadInvoices } = useAsyncResource(() => listProviderInvoices(), []);
  const { data: payment } = useAsyncResource(() => getProviderPaymentMethodReadiness(), []);

  const reloadAll = () => { reload(); reloadInvoices(); };
  const activeMethod = payment?.defaultMethod ?? payment?.methods.find(method => method.status === 'active');

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Money</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Billing</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Follow approved work from timesheet to invoice readiness without treating estimates like collected money.</p>
        </header>

        {loading && <p className="border-b border-[#DDE7E8] py-10 text-center text-sm text-[#607583]">Loading billing readiness…</p>}
        {(error || invoiceError) && <div className="border-b border-[#DDE7E8] py-10 text-center"><p className="text-sm text-[#607583]">{error?.message ?? invoiceError?.message}</p><button type="button" onClick={reloadAll} className="mt-3 text-sm font-semibold text-[#2F8E7A]">Try again</button></div>}

        {!loading && !error && summary ? (
          <>
            <section className="border-b border-[#BFCED4] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Open billing pipeline</p>
              <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#13334F]">{formatUsd(summary.estimatedOpenValue)}</p>
              <p className="mt-2 text-xs leading-5 text-[#9AAAB3]">Estimated pipeline, not a collected balance.</p>
              <div className="mt-5 grid grid-cols-2 gap-4"><div><p className="text-xs text-[#607583]">Ready to invoice</p><p className="mt-1 text-xl font-semibold text-[#13334F]">{formatUsd(summary.readyToInvoiceValue)}</p></div><div><p className="text-xs text-[#607583]">Prep / simulated</p><p className="mt-1 text-xl font-semibold text-[#13334F]">{formatUsd(summary.simulatedInvoiceValue)}</p></div></div>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <div className="flex items-start gap-3"><CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" /><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Payment method</p>{payment?.hasActiveMethod ? <><p className="mt-2 font-semibold text-[#13334F]">{[activeMethod?.brand, activeMethod?.last4 ? `•••• ${activeMethod.last4}` : undefined].filter(Boolean).join(' ') || 'Method on file'}</p><p className="mt-1 text-sm text-[#607583]">Saved for future collection. Automatic charging is still gated by server-side payment rails.</p></> : <><p className="mt-2 font-semibold text-[#13334F]">No active method on file</p><p className="mt-1 text-sm text-[#607583]">Draft invoices can still be reviewed before collection is enabled.</p>{setupUiEnabled ? <button type="button" disabled={setupLoading} onClick={() => { setSetupLoading(true); void startProviderPaymentMethodSetup('/provider/billing').finally(() => setSetupLoading(false)); }} className="mt-3 min-h-11 text-sm font-semibold text-[#2F8E7A]">{setupLoading ? 'Starting setup…' : 'Set up payment method'}</button> : null}</>}</div></div>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Invoices</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Generated drafts</h2></div><button type="button" disabled={isPending('generate-invoice')} onClick={async () => { const result = await run('generate-invoice', () => generateProviderInvoiceFromApprovedTimesheets()); if (result.ok) { toast.success(result.data.message); reloadAll(); } else toast.error(result.error.message); }} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2F8E7A] disabled:opacity-50"><FileText className="h-4 w-4" />Generate draft</button></div>
              <div className="mt-4 border-t border-[#BFCED4]">{!invoices?.length ? <p className="border-b border-[#DDE7E8] py-5 text-sm text-[#607583]">No generated invoice drafts yet.</p> : invoices.map(invoice => <article key={invoice.invoiceId} className="border-b border-[#DDE7E8] py-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#13334F]">{invoice.lineCount} line{invoice.lineCount === 1 ? '' : 's'} · {formatUsd(invoice.totalAmount)}</p><p className="mt-1 text-xs text-[#607583]">{invoice.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString() : 'Draft record'}</p></div><StatusBadge variant={invoice.status === 'generated' ? 'covered' : invoice.status === 'void' ? 'missing' : 'pending'}>{invoice.status === 'generated' ? 'Generated' : invoice.status === 'void' ? 'Void' : 'Draft'}</StatusBadge></div></article>)}</div>
            </section>

            <section className="py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Readiness by shift</p>
              <div className="mt-3 border-t border-[#BFCED4]">{summary.rows.length === 0 ? <p className="border-b border-[#DDE7E8] py-5 text-sm text-[#607583]">No shifts are in the billing pipeline yet.</p> : summary.rows.map(row => <article key={row.id} className="border-b border-[#DDE7E8] py-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#13334F]">{row.shiftTitle}</p><p className="mt-1 text-sm text-[#607583]">{row.siteName} · {row.shiftDate}</p>{row.missingItems?.length ? <p className="mt-2 text-xs text-[#9B6419]">Still needed: {row.missingItems.join(' · ')}</p> : null}</div><div className="shrink-0 text-right"><p className="font-semibold text-[#13334F]">{formatUsd(row.estimatedAmount)}</p><p className={`mt-1 text-xs font-semibold ${row.status === 'ready' ? 'text-[#257665]' : 'text-[#9B6419]'}`}>{row.statusLabel}</p></div></div></article>)}</div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
