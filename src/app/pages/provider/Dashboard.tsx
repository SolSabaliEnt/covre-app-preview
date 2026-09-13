import { Link } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { getProviderDashboard } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

function LoadingBlock() {
  return <div className="border-y border-[#DDE7E8] py-12 text-center text-sm text-[#607583]">Loading dashboard…</div>;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white">Try again</button>
    </div>
  );
}

export default function ProviderDashboard() {
  const { data, error, loading, reload } = useAsyncResource(() => getProviderDashboard(), []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error.message} onRetry={reload} />;
  if (!data) return <LoadingBlock />;

  const { prov, todaysCoverage, urgentShifts, workersOnShift, firstUrgentShiftId } = data;

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Coverage command center</p>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#13334F]">Good morning, {prov.name}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Start with the shifts that can still disrupt today, then close out the work already in motion.</p>
            </div>
            <Link to="/provider/post-shift" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A]">
              <Plus className="h-4 w-4" /> Post shift
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 border-y border-[#DDE7E8] py-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-[#13334F]">8</p>
              <p className="mt-1 text-xs text-[#607583]">Open shifts</p>
            </div>
            <div className="border-x border-[#DDE7E8]">
              <p className="text-2xl font-semibold text-[#13334F]">42</p>
              <p className="mt-1 text-xs text-[#607583]">Covered this week</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-[#13334F]">94.2%</p>
              <p className="mt-1 text-xs text-[#607583]">Fill rate</p>
            </div>
          </div>
        </header>

        <section className="border-b border-[#DDE7E8] py-7">
          <div className="flex items-end justify-between gap-4 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A93636]">Needs attention</p>
              <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Urgent open shifts</h2>
            </div>
            <Link to="/provider/shifts" className="text-sm font-semibold text-[#2F8E7A]">View all</Link>
          </div>

          <div className="border-t border-[#BFCED4]">
            {urgentShifts.map((shift, index) => (
              <article key={index} className="border-b border-[#DDE7E8] py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#13334F]">{shift.site}</p>
                    <p className="mt-1 text-sm text-[#607583]">{shift.shift} · {shift.time}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-[#13334F]">{shift.pay}</p>
                    <div className="mt-1"><StatusBadge variant="urgent">Urgent</StatusBadge></div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Link to={`/provider/worker-match/${firstUrgentShiftId}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2F8E7A]">
            Find workers for the most urgent shift <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="grid border-b border-[#DDE7E8] py-6 sm:grid-cols-2 sm:divide-x sm:divide-[#DDE7E8]">
          <div className="pb-5 sm:pb-0 sm:pr-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]"><DollarSign className="h-4 w-4" />This week's spend</div>
            <p className="mt-2 text-2xl font-semibold text-[#13334F]">$12,480</p>
            <p className="mt-1 text-sm text-[#607583]">42 shifts</p>
          </div>
          <Link to="/provider/timesheets" className="border-t border-[#DDE7E8] pt-5 no-underline sm:border-t-0 sm:pl-6 sm:pt-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]"><Clock className="h-4 w-4" />Timesheets awaiting review</div>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-[#13334F]">3</p>
                <p className="mt-1 text-sm text-[#607583]">Approve or dispute submitted time</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#2F8E7A]" />
            </div>
          </Link>
        </section>

        <section className="pt-7">
          <div className="flex items-end justify-between gap-4 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#257665]">In motion</p>
              <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Today’s coverage</h2>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#53B59F]" />
          </div>
          <div className="border-t border-[#BFCED4]">
            {todaysCoverage.map((shift, index) => (
              <article key={index} className="border-b border-[#DDE7E8] py-4">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#13334F]">{shift.site}</p>
                    <p className="mt-1 text-sm text-[#607583]">{shift.shift} · {shift.time}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-[#13334F]">{shift.worker}</p>
                    <div className="mt-1"><StatusBadge variant="covered">Covered</StatusBadge></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pt-8">
          <div className="flex items-end justify-between gap-4 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">On site now</p>
              <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Workers currently on shift</h2>
            </div>
            <UsersRound className="h-5 w-5 text-[#2F8E7A]" />
          </div>
          <div className="border-t border-[#BFCED4]">
            {workersOnShift.map((worker, index) => (
              <article key={index} className="flex items-center gap-4 border-b border-[#DDE7E8] py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] font-semibold text-[#257665]">{worker.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#13334F]">{worker.name}</p>
                  <p className="mt-0.5 text-sm text-[#607583]">{worker.role} at {worker.site}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-[#9AAAB3]">Clocked in</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#13334F]">{worker.clockedIn}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 border-t border-[#DDE7E8] pt-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 text-[#9B6419]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9B6419]">Close the loop</p>
              <h2 className="mt-1 text-lg font-semibold text-[#13334F]">3 timesheets awaiting approval</h2>
              <p className="mt-1 text-sm leading-6 text-[#607583]">Review submitted time so completed work can move forward.</p>
              <Link to="/provider/timesheets" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A]">Review timesheets <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
