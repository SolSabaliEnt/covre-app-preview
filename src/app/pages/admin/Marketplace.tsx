import { Link } from 'react-router';
import { StatusBadge } from '../../components/StatusBadge';
import { Activity, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { getAdminMarketplaceView } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

const METRIC_STYLES = [
  { Icon: AlertTriangle, tone: 'text-[#A93636]' },
  { Icon: Users, tone: 'text-[#2F8E7A]' },
  { Icon: Activity, tone: 'text-[#13334F]' },
  { Icon: TrendingUp, tone: 'text-[#2F8E7A]' },
] as const;

function LoadingBlock() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="border-y border-[#DDE7E8] py-10 text-sm text-[#607583]">Loading marketplace activity…</div>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="border-y border-[#DDE7E8] py-8">
        <p className="text-sm text-[#607583]">{message}</p>
        <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0B243A]">Retry</button>
      </div>
    </div>
  );
}

export default function AdminMarketplace() {
  const { data, error, loading, reload } = useAsyncResource(() => getAdminMarketplaceView(), []);

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error.message} onRetry={reload} />;
  if (!data) return <LoadingBlock />;

  const { metrics: adminMetrics, urgentShifts, workers } = data;
  const workerAvailability = workers.slice(0, 3);

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Marketplace</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Marketplace command center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">See where coverage can still break, who is available to help, and what needs an operator decision next.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-6">
        <section className="grid gap-5 border-b border-[#DDE7E8] pb-6 md:grid-cols-4">
          {adminMetrics.map((m, i) => {
            const style = METRIC_STYLES[i] ?? METRIC_STYLES[2];
            const Icon = style.Icon;
            return (
              <div key={m.label} className="min-w-0">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">
                  <Icon className={`h-4 w-4 ${style.tone}`} aria-hidden />
                  {m.label}
                </div>
                <div className="text-3xl font-semibold tracking-tight text-[#13334F]">{m.value}</div>
              </div>
            );
          })}
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A93636]">Needs attention</p>
              <h2 className="mt-1 text-xl font-semibold text-[#13334F]">At-risk shifts in the next 24 hours</h2>
            </div>
            <span className="text-sm text-[#607583]">{urgentShifts.length} open</span>
          </div>
          <div className="border-t border-[#BFCED4]">
            {urgentShifts.map(shift => (
              <div key={shift.id} className="grid grid-cols-[1fr_auto] items-center gap-5 border-b border-[#DDE7E8] py-4">
                <Link to={`/admin/shifts/${shift.id}`} className="min-w-0 no-underline">
                  <p className="font-semibold text-[#13334F]">{shift.providerName} — {shift.siteName}</p>
                  <p className="mt-1 text-sm text-[#607583]">{shift.roleTitle} · {shift.dateLabel} {shift.timeRange}</p>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-[#13334F]">{shift.hourlyPayDisplay}</p>
                    <StatusBadge variant="urgent">Urgent</StatusBadge>
                  </div>
                  <button type="button" className="rounded-lg bg-[#53B59F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2F8E7A]">Find match</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Worker availability</p>
            <h2 className="mt-1 text-xl font-semibold text-[#13334F]">High-availability workers</h2>
          </div>
          <div className="border-t border-[#BFCED4]">
            {workerAvailability.map(worker => (
              <div key={worker.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[#DDE7E8] py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F6F2] text-sm font-semibold text-[#257665]">
                  {worker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#13334F]">{worker.name}</p>
                  <p className="mt-1 text-sm text-[#607583]">{worker.primaryRole} · Score {worker.covreScore} · Available {worker.availabilityNote ?? '—'}</p>
                </div>
                <div className="flex items-center gap-5">
                  <p className="text-sm text-[#607583]"><span className="font-semibold text-[#13334F]">{worker.openShiftsWilling ?? 0}</span> shifts open</p>
                  <button type="button" className="text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">Invite</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
