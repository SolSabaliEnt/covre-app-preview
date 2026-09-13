import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router';
import { ArrowRight, Filter, Plus, Search } from 'lucide-react';
import { listProviderShifts } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

function LoadingBlock() {
  return <div className="border-y border-[#DDE7E8] py-12 text-center text-sm text-[#607583]">Loading shifts…</div>;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white">Try again</button>
    </div>
  );
}

export default function ShiftManagement() {
  const { data: shifts, error, loading, reload } = useAsyncResource(() => listProviderShifts(), []);
  const openCount = shifts?.filter(shift => shift.providerBoardStatus !== 'covered').length ?? 0;

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Coverage board</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Shifts</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">See what is open, what is covered, and what needs a worker next.</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold text-[#13334F]">{openCount}</p>
              <p className="text-xs text-[#607583]">open</p>
            </div>
          </div>
          <Link to="/provider/post-shift" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A]">
            <Plus className="h-4 w-4" /> Post shift
          </Link>
        </header>

        <div className="flex items-center gap-3 border-b border-[#DDE7E8] py-4">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8D98]" />
            <input type="search" placeholder="Search shifts" className="min-h-11 w-full border-0 bg-transparent pl-7 pr-2 text-base text-[#13334F] outline-none placeholder:text-[#A5B3BA]" />
          </div>
          <button type="button" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#607583] hover:text-[#13334F]">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error.message} onRetry={reload} />}

        {!loading && !error && shifts && shifts.length === 0 && (
          <section className="border-b border-[#DDE7E8] py-12 text-center">
            <p className="font-semibold text-[#13334F]">No shifts yet.</p>
            <p className="mt-2 text-sm text-[#607583]">Post your first shift to start filling coverage.</p>
            <Link to="/provider/post-shift" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2F8E7A]">Post shift <ArrowRight className="h-4 w-4" /></Link>
          </section>
        )}

        {!loading && !error && shifts && shifts.length > 0 && (
          <section className="pt-3">
            <div className="border-t border-[#BFCED4]">
              {shifts.map(shift => (
                <article key={shift.id} className="border-b border-[#DDE7E8] py-5">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#13334F]">{shift.roleTitle}</h2>
                        <StatusBadge variant={shift.providerBoardStatus}>
                          {shift.providerBoardStatus === 'covered' ? 'Covered' : shift.providerBoardStatus === 'urgent' ? 'Urgent' : 'Pending'}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-sm text-[#466170]">{shift.siteName}</p>
                      <p className="mt-2 text-sm text-[#607583]">{shift.dateLabel} · {shift.timeRange}</p>
                      {shift.assignedWorkerName ? <p className="mt-2 text-xs font-semibold text-[#257665]">Assigned to {shift.assignedWorkerName}</p> : <p className="mt-2 text-xs text-[#9AAAB3]">No worker assigned yet</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <Link to={`/provider/shifts/${shift.id}`} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A]">View shift <ArrowRight className="h-4 w-4" /></Link>
                    {!shift.assignedWorkerId ? (
                      <Link to={`/provider/worker-match/${shift.id}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-[#13334F]">Find worker</Link>
                    ) : (
                      <Link to={`/provider/workers/${shift.assignedWorkerId}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-[#13334F]">View worker</Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
