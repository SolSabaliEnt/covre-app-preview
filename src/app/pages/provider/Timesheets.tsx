import { Link } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { approveTimesheet, disputeTimesheet, getProviderTimesheetReadiness } from '../../services';
import type { ProviderTimesheetReadinessRow, ProviderTimesheetReviewRow } from '../../services/types';
import { useProviderAction } from '../../hooks/useProviderAction';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';

type MockRow = {
  id: string;
  workerId: string;
  worker: string;
  site: string;
  role: string;
  date: string;
  scheduled: string;
  clocked: string;
  scheduledHours: number;
  clockedHours: number;
  breaks: number;
  status: 'pending' | 'approved' | 'disputed';
};

const INITIAL_TIMESHEETS: MockRow[] = [
  { id: 'timesheet-001', workerId: 'worker-003', worker: 'Sarah Johnson', site: 'Oak Memory Care', role: 'CNA', date: 'May 13, 2026', scheduled: '6:00 AM - 2:00 PM', clocked: '6:02 AM - 2:05 PM', scheduledHours: 8, clockedHours: 8.05, breaks: 0.5, status: 'pending' },
  { id: 'timesheet-002', workerId: 'worker-002', worker: 'Mike Chen', site: 'Sunrise Group Home', role: 'DSP', date: 'May 13, 2026', scheduled: '3:00 PM - 11:00 PM', clocked: '3:05 PM - 11:02 PM', scheduledHours: 8, clockedHours: 7.95, breaks: 0.5, status: 'pending' },
  { id: 'timesheet-003', workerId: 'worker-004', worker: 'Jessica Martinez', site: 'Cedar Assisted Living', role: 'Med Aide', date: 'May 12, 2026', scheduled: '2:00 PM - 10:00 PM', clocked: '1:58 PM - 10:03 PM', scheduledHours: 8, clockedHours: 8.08, breaks: 0.5, status: 'approved' },
];

function statusBadge(status: string) {
  if (status === 'approved') return <StatusBadge variant="covered">Approved</StatusBadge>;
  if (status === 'disputed') return <StatusBadge variant="urgent">Disputed</StatusBadge>;
  return <StatusBadge variant="pending">Pending approval</StatusBadge>;
}

function ReviewRow({ row, onUpdated }: { row: ProviderTimesheetReviewRow; onUpdated: () => void }) {
  const { run, isPending } = useProviderAction();
  const pending = row.status === 'submitted' || row.status === 'pending_approval';
  return (
    <article className="border-b border-[#DDE7E8] py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0"><Link to={`/provider/workers/${row.workerId}`} className="font-semibold text-[#13334F] hover:text-[#2F8E7A]">{row.workerName}</Link><p className="mt-1 text-sm text-[#607583]">{row.shiftTitle} · {row.siteName}</p><p className="mt-1 text-xs text-[#9AAAB3]">{row.shiftDate}</p></div>
        <div className="shrink-0 text-right"><p className="font-semibold text-[#13334F]">{row.hours}h</p><div className="mt-1">{statusBadge(row.status)}</div></div>
      </div>
      {pending ? <div className="mt-4 flex gap-4"><button type="button" disabled={isPending(`approve-${row.timesheetId}`)} onClick={async () => { const result = await run(`approve-${row.timesheetId}`, () => approveTimesheet(row.timesheetId)); if (result.ok) { toast.success(result.data.message); onUpdated(); } else toast.error(result.error.message); }} className="text-sm font-semibold text-[#2F8E7A] disabled:opacity-50">Approve</button><button type="button" disabled={isPending(`dispute-${row.timesheetId}`)} onClick={async () => { const result = await run(`dispute-${row.timesheetId}`, () => disputeTimesheet(row.timesheetId, 'Hours need review')); if (result.ok) { toast.success(result.data.message); onUpdated(); } else toast.error(result.error.message); }} className="text-sm font-semibold text-[#A93636] disabled:opacity-50">Dispute</button></div> : null}
    </article>
  );
}

function ReadinessRow({ row }: { row: ProviderTimesheetReadinessRow }) {
  return <article className="border-b border-[#DDE7E8] py-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#13334F]">{row.workerName || row.shiftTitle}</p><p className="mt-1 text-sm text-[#607583]">{row.shiftTitle} · {row.siteName}</p><p className="mt-1 text-xs text-[#9AAAB3]">{row.shiftDate}</p>{row.missingItems?.length ? <p className="mt-2 text-xs text-[#9B6419]">Still needed: {row.missingItems.join(' · ')}</p> : null}</div><p className="shrink-0 text-xs font-semibold text-[#9B6419]">{row.statusLabel}</p></div></article>;
}

function MockTimesheets() {
  const [rows, setRows] = useState(INITIAL_TIMESHEETS);
  const { run, isPending } = useProviderAction();
  const pendingCount = rows.filter(row => row.status === 'pending').length;
  return (
    <>
      <section className="border-b border-[#DDE7E8] py-5"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#9B6419]" /><div><p className="font-semibold text-[#13334F]">{pendingCount} awaiting approval</p><p className="mt-1 text-sm text-[#607583]">Approved time is what moves billing and compliance forward.</p></div></div></section>
      <section className="pt-7"><p className="pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Timesheets</p><div className="border-t border-[#BFCED4]">{rows.map(row => <article key={row.id} className="border-b border-[#DDE7E8] py-5"><div className="flex items-start justify-between gap-4"><div><Link to={`/provider/workers/${row.workerId}`} className="font-semibold text-[#13334F]">{row.worker}</Link><p className="mt-1 text-sm text-[#607583]">{row.role} · {row.site}</p><p className="mt-1 text-xs text-[#9AAAB3]">{row.date}</p></div>{statusBadge(row.status)}</div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Scheduled</p><p className="mt-1 font-semibold text-[#13334F]">{row.scheduled}</p><p className="mt-1 text-[#607583]">{row.scheduledHours}h</p></div><div><p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Clocked</p><p className="mt-1 font-semibold text-[#13334F]">{row.clocked}</p><p className="mt-1 text-[#607583]">{row.clockedHours}h incl. {row.breaks}h break</p></div></div>{row.status === 'pending' ? <div className="mt-4 flex gap-4"><button type="button" disabled={isPending(`approve-${row.id}`)} onClick={async () => { const result = await run(`approve-${row.id}`, () => approveTimesheet(row.id)); if (result.ok) { toast.success(result.data.message); setRows(current => current.map(item => item.id === row.id ? { ...item, status: 'approved' } : item)); } else toast.error(result.error.message); }} className="text-sm font-semibold text-[#2F8E7A]">Approve</button><button type="button" disabled={isPending(`dispute-${row.id}`)} onClick={async () => { const result = await run(`dispute-${row.id}`, () => disputeTimesheet(row.id, 'Hours need review')); if (result.ok) { toast.success(result.data.message); setRows(current => current.map(item => item.id === row.id ? { ...item, status: 'disputed' } : item)); } else toast.error(result.error.message); }} className="text-sm font-semibold text-[#A93636]">Dispute</button></div> : null}</article>)}</div></section>
    </>
  );
}

function SupabaseTimesheets() {
  const { data: summary, error, loading, reload } = useAsyncResource(() => getProviderTimesheetReadiness(), []);
  if (loading) return <p className="border-b border-[#DDE7E8] py-10 text-center text-sm text-[#607583]">Loading timesheets…</p>;
  if (error) return <div className="border-b border-[#DDE7E8] py-10 text-center"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-3 text-sm font-semibold text-[#2F8E7A]">Try again</button></div>;
  if (!summary) return null;
  const reviewRows = [...summary.submittedRows, ...summary.approvedRows, ...summary.disputedRows];
  return (
    <>
      <section className="border-b border-[#DDE7E8] py-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" /><div><p className="font-semibold text-[#13334F]">{summary.submittedRows.length} submitted for review</p><p className="mt-1 text-sm text-[#607583]">{summary.pendingCount} booking{summary.pendingCount === 1 ? '' : 's'} still need clock events or worker submission.</p></div></div></section>
      {reviewRows.length ? <section className="pt-7"><p className="pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Review history</p><div className="border-t border-[#BFCED4]">{reviewRows.map(row => <ReviewRow key={row.timesheetId} row={row} onUpdated={reload} />)}</div></section> : null}
      {summary.rows.length ? <section className="pt-9"><p className="pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Not ready yet</p><div className="border-t border-[#BFCED4]">{summary.rows.map(row => <ReadinessRow key={row.id} row={row} />)}</div></section> : null}
      {!reviewRows.length && !summary.rows.length ? <section className="py-12 text-center"><Clock3 className="mx-auto h-8 w-8 text-[#53B59F]" /><p className="mt-3 font-semibold text-[#13334F]">No timesheets yet.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607583]">Timesheets appear after a booked worker clocks out and submits time.</p></section> : null}
    </>
  );
}

export default function Timesheets() {
  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Close the loop</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Timesheets</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Compare submitted time to the shift, resolve anything off, then move approved work into billing and compliance.</p></header>
        {isSupabaseBackendEnabled() ? <SupabaseTimesheets /> : <MockTimesheets />}
      </div>
    </div>
  );
}
