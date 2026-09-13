import { StatusBadge } from '../../components/StatusBadge';
import { Link } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { getProviderDashboard } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

function LoadingBlock() {
  return (
    <div className="min-h-full w-full min-w-0 max-w-full bg-[#F7FAFA] px-4 py-6">
      <div className="mx-auto w-full min-w-0 max-w-full rounded-2xl border border-[#DDE7E8] bg-white p-8 shadow-sm">
        <p className="text-center text-sm font-medium text-[#13334F]">Loading…</p>
      </div>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-full w-full min-w-0 max-w-full bg-[#F7FAFA] px-4 py-6">
      <div className="mx-auto w-full min-w-0 max-w-full rounded-2xl border border-[#DDE7E8] bg-white p-8 shadow-sm">
        <p className="text-center text-sm text-[#607583]">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 w-full rounded-xl bg-[#13334F] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A]"
        >
          Retry
        </button>
      </div>
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
    <div className="min-h-full w-full min-w-0 max-w-full bg-[#F7FAFA] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto w-full min-w-0 max-w-full space-y-5">
        <div className="rounded-[1.6rem] bg-[#13334F] p-5 text-white shadow-[0_18px_60px_rgba(19,51,79,0.16)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#DCEBE7]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#7BD0BD]" aria-hidden />
                Coverage command center
              </div>
              <h1 className="mt-3 break-words text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                Good morning, {prov.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Start with the shifts that can still disrupt today, then close out the work already in motion.
              </p>
            </div>

            <Link
              to="/provider/post-shift"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2F8E7A]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Post shift
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Open shifts" value="8" detail="Needs attention" />
            <HeroMetric label="Covered this week" value="42" detail="Coverage in motion" positive />
            <HeroMetric label="Fill rate" value="94.2%" detail="+2.1% this month" positive />
          </div>
        </div>

        <section className="overflow-hidden rounded-[1.4rem] border border-[#F1CFCF] bg-white shadow-sm">
          <div className="flex items-start gap-3 border-b border-[#FDEAEA] bg-[#FFF8F8] px-4 py-4 sm:px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEAEA] text-[#A93636]">
              <AlertCircle className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#A93636]">Needs attention</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#13334F]">Urgent open shifts</h2>
                </div>
                <Link to="/provider/shifts" className="text-sm font-semibold text-[#607583] hover:text-[#13334F]">
                  View all
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {urgentShifts.map((shift, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-[#FDEAEA] bg-[#FFF8F8] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#13334F]">{shift.site}</div>
                  <div className="mt-1 text-sm text-[#607583]">
                    {shift.shift} • {shift.time}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="font-semibold text-[#13334F]">{shift.pay}</div>
                  <StatusBadge variant="urgent">Urgent</StatusBadge>
                </div>
              </div>
            ))}

            <Link
              to={`/provider/worker-match/${firstUrgentShiftId}`}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#13334F] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A]"
            >
              Find workers for the most urgent shift
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={<DollarSign className="h-5 w-5" />}
            label="This week's spend"
            value="$12,480"
            change="42 shifts"
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Timesheets awaiting review"
            value="3"
            change="Approve or dispute submitted time"
            href="/provider/timesheets"
          />
        </div>

        <section className="rounded-[1.4rem] border border-[#DDE7E8] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#257665]">In motion</p>
              <h2 className="mt-1 text-lg font-semibold text-[#13334F]">Today&apos;s coverage</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F6F2] text-[#257665]">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </div>
          </div>

          <div className="space-y-3">
            {todaysCoverage.map((shift, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-[#E6F6F2] bg-[#F8FCFB] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#257665] shadow-sm">
                    <CheckCircle2 className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#13334F]">{shift.site}</div>
                    <div className="mt-0.5 text-sm text-[#607583]">
                      {shift.shift} • {shift.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <div className="truncate font-medium text-[#13334F]">{shift.worker}</div>
                  <StatusBadge variant="covered">Covered</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.4rem] border border-[#DDE7E8] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">On site now</p>
              <h2 className="mt-1 text-lg font-semibold text-[#13334F]">Workers currently on shift</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EEF2] text-[#13334F]">
              <UsersRound className="h-5 w-5" aria-hidden />
            </div>
          </div>

          <div className="space-y-3">
            {workersOnShift.map((worker, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-[#DDE7E8] bg-[#F7FAFA] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#13334F] font-semibold text-white">
                    {worker.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-[#13334F]">{worker.name}</div>
                    <div className="truncate text-sm text-[#607583]">
                      {worker.role} at {worker.site}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs font-medium uppercase tracking-[0.08em] text-[#9AAAB3]">Clocked in</div>
                  <div className="mt-0.5 font-semibold text-[#13334F]">{worker.clockedIn}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.4rem] border border-[#DDE7E8] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4E0] text-[#9B6419]">
                <Clock className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9B6419]">Close the loop</p>
                <h2 className="mt-1 text-lg font-semibold text-[#13334F]">3 timesheets awaiting approval</h2>
                <p className="mt-1 text-sm text-[#607583]">Review submitted time so completed work can move forward.</p>
              </div>
            </div>
            <Link
              to="/provider/timesheets"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#53B59F] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A]"
            >
              Review timesheets
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  detail,
  positive = false,
}: {
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm font-medium text-white/80">{label}</div>
      <div className={`mt-2 text-xs ${positive ? 'text-[#7BD0BD]' : 'text-white/50'}`}>{detail}</div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-[1.3rem] border border-[#DDE7E8] bg-white p-4 shadow-sm transition-all hover:border-[#BFDCD5] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8EEF2] text-[#13334F]">{icon}</div>
        {href ? <ArrowRight className="h-4 w-4 text-[#9AAAB3]" aria-hidden /> : null}
      </div>
      <div className="mt-5 text-2xl font-semibold text-[#13334F]">{value}</div>
      <div className="mt-1 text-sm font-medium text-[#314858]">{label}</div>
      {change ? <div className="mt-2 text-xs leading-5 text-[#607583]">{change}</div> : null}
    </div>
  );

  return href ? <Link to={href}>{content}</Link> : content;
}
