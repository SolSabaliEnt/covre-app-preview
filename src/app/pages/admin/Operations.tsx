import { Link } from 'react-router';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import {
  getAdminContinuityReadiness,
  getAdminContinuitySummary,
  getAdminMarketplaceDashboard,
  getContinuityTelemetrySummary,
  type AdminContinuityReadiness,
  type AdminContinuitySummary,
  type AdminMarketplaceSummary,
  type ContinuityTelemetrySummary,
} from '../../services';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';

function MetricRail({
  items,
}: {
  items: Array<{ label: string; value: string | number; detail: string; to?: string }>;
}) {
  return (
    <div className="grid gap-x-7 gap-y-5 border-y border-[#DDE7E8] py-5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(item => {
        const content = (
          <>
            <p className="text-2xl font-semibold tracking-[-0.03em] text-[#13334F]">{item.value}</p>
            <p className="mt-1 text-sm font-semibold text-[#13334F]">{item.label}</p>
            <p className="mt-1 text-xs leading-5 text-[#607583]">{item.detail}</p>
          </>
        );
        return item.to ? (
          <Link key={item.label} to={item.to} className="block no-underline transition-opacity hover:opacity-75">{content}</Link>
        ) : (
          <div key={item.label}>{content}</div>
        );
      })}
    </div>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold text-[#13334F]">{title}</h2>
      <p className="mt-1 max-w-4xl text-sm leading-6 text-[#607583]">{copy}</p>
    </div>
  );
}

function MarketplaceEngine({ summary }: { summary: AdminMarketplaceSummary }) {
  const people = summary.workerCount + summary.providerCount;
  return (
    <section>
      <SectionIntro eyebrow="Marketplace" title="Is the engine moving?" copy="Follow people entering the marketplace, work getting booked, and completed shifts leaving an approved operational record behind." />
      <MetricRail items={[
        { label: 'People', value: people, detail: `${summary.workerCount} workers · ${summary.providerCount} provider organizations`, to: '/admin/users' },
        { label: 'Open shifts', value: summary.openShiftCount, detail: `${summary.bookedShiftCount} shifts booked or further along`, to: '/admin/marketplace' },
        { label: 'Bookings', value: summary.bookingCount, detail: 'Confirmed worker/provider relationships recorded in Covre', to: '/admin/marketplace' },
        { label: 'Approved work', value: summary.approvedTimesheetCount, detail: `${summary.submittedTimesheetCount} submitted timesheets still awaiting decision`, to: '/admin/payments' },
      ]} />
    </section>
  );
}

function ContinuitySignals({ summary }: { summary: AdminContinuitySummary }) {
  return (
    <section>
      <SectionIntro eyebrow="Continuity" title="Is repeat work becoming an advantage?" copy="Approved work history should make Covre more useful over time: more familiar places, more repeated relationships, and less starting from zero." />
      <div className="grid gap-x-7 gap-y-5 border-y border-[#DDE7E8] py-5 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Workers with history', summary.workersWithHistory, 'At least one approved work event'],
          ['Repeat-site workers', summary.repeatSiteWorkers, 'Returned to at least one care site'],
          ['Familiar site ties', summary.familiarWorkerSiteTies, 'Worker + site relationships with 2+ approved shifts'],
          ['Repeat provider ties', summary.repeatProviderWorkerTies, 'Worker + provider relationships with 2+ approved shifts'],
          ['Returning work share', `${summary.returningWorkSharePct}%`, 'Approved work beyond the first shift in an existing worker/site relationship'],
        ].map(([label, value, detail]) => (
          <div key={label as string}>
            <p className="text-2xl font-semibold tracking-[-0.03em] text-[#13334F]">{value}</p>
            <p className="mt-1 text-sm font-semibold text-[#13334F]">{label}</p>
            <p className="mt-1 text-xs leading-5 text-[#607583]">{detail}</p>
          </div>
        ))}
      </div>
      {summary.sampled ? <p className="mt-2 text-xs text-[#9B6419]">Calculated from the most recent 5,000 approved work records.</p> : null}
    </section>
  );
}

function ContinuityReadinessPanel({ summary }: { summary: AdminContinuityReadiness }) {
  const fullyReady = summary.totalCount > 0 && summary.readyCount === summary.totalCount;
  const missingCount = Math.max(0, summary.totalCount - summary.readyCount);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#DDE7E8] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Infrastructure</p>
          <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Continuity readiness</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#607583]">Checks the database capabilities required by Covre’s continuity workflow—not worker records, provider records, or browser-local experiment data.</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-semibold ${fullyReady ? 'text-[#257665]' : 'text-[#9B6419]'}`}>
            {summary.diagnosticAvailable ? `${summary.readyCount}/${summary.totalCount}` : '—'}
          </p>
          <p className="text-xs text-[#607583]">{summary.diagnosticAvailable ? (fullyReady ? 'capabilities ready' : `${missingCount} missing`) : 'not checked in mock mode'}</p>
        </div>
      </div>

      {!summary.diagnosticAvailable ? (
        <p className="border-b border-[#DDE7E8] py-4 text-sm leading-6 text-[#607583]">Database readiness cannot be verified in mock mode. The diagnostic becomes meaningful when Covre is connected to its own Supabase project and an admin is signed in.</p>
      ) : (
        <div className="border-b border-[#DDE7E8]">
          {summary.items.map(item => (
            <div key={item.key} className="grid gap-3 border-b border-[#EEF3F4] py-4 last:border-b-0 md:grid-cols-[1.3fr_0.7fr_1.5fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                {item.ready ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden /> : <CircleAlert className="h-5 w-5 shrink-0 text-[#9B6419]" aria-hidden />}
                <p className="font-semibold text-[#13334F]">{item.label}</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#607583]">{item.kind}</p>
              <p className="break-all font-mono text-xs text-[#607583]">{item.migration}</p>
              <p className={`text-xs font-semibold ${item.ready ? 'text-[#257665]' : 'text-[#9B6419]'}`}>{item.ready ? 'Available' : 'Missing'}</p>
            </div>
          ))}
        </div>
      )}

      {summary.diagnosticAvailable ? <p className="mt-2 text-xs text-[#9AAAB3]">Checked {new Date(summary.checkedAt).toLocaleString()}. Capability presence only; this does not inspect migration filenames.</p> : null}
    </section>
  );
}

function ExperimentSignals({ summary }: { summary: ContinuityTelemetrySummary }) {
  return (
    <section>
      <SectionIntro eyebrow="Preview experiment" title="Are continuity surfaces changing behavior?" copy="This browser-local seam records small product-event context such as IDs and counts. It is not cross-user production analytics and does not store message contents or sensitive profile data." />
      <MetricRail items={[
        { label: 'Familiar impressions', value: summary.familiarOpportunityImpressions, detail: `${summary.familiarOpportunityOpenRatePct}% opened from a surfaced familiar opportunity` },
        { label: 'Familiar opens', value: summary.familiarOpportunityOpens, detail: `${summary.familiarShiftDetailViews} familiar shift-detail views` },
        { label: 'Familiar applications', value: summary.familiarShiftApplications, detail: `${summary.familiarApplicationRatePct}% of familiar detail views led to an application event` },
        { label: 'Return preferences', value: summary.returnPreferencesSaved, detail: `${summary.providerRebookActions} provider rebook actions · ${summary.providerReturnIntents} return intents` },
      ]} />
      <p className="mt-2 text-xs text-[#9AAAB3]">Events are capped and stored locally until Covre has an approved analytics persistence contract.</p>
    </section>
  );
}

export default function AdminOperations() {
  const supabaseMode = isSupabaseBackendEnabled();
  const marketplace = useAsyncResource(() => getAdminMarketplaceDashboard(), []);
  const continuity = useAsyncResource(() => getAdminContinuitySummary(), []);
  const readiness = useAsyncResource(() => getAdminContinuityReadiness(), []);
  const experiment = getContinuityTelemetrySummary();
  const loading = marketplace.loading || continuity.loading;
  const error = marketplace.error ?? continuity.error;

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Control</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Operations + continuity</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">One control surface for marketplace movement, infrastructure readiness, and the longer-term question: does using Covre make future work easier?</p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link to="/admin" className="text-[#607583] no-underline hover:text-[#13334F]">Overview</Link>
            <Link to="/admin/full-app" className="text-[#2F8E7A] no-underline hover:text-[#257665]">Inspect full app →</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 p-6">
        {!supabaseMode ? <p className="border-b border-[#DDE7E8] pb-4 text-xs leading-5 text-[#607583]"><strong className="font-semibold text-[#9B6419]">Preview mode.</strong> Marketplace values are demo data, readiness is not a live database check, and experiment telemetry reflects this browser only.</p> : null}

        {readiness.loading ? <QueueMessage>Checking continuity infrastructure…</QueueMessage> : readiness.error ? <QueueError message={readiness.error.message} onRetry={readiness.reload} /> : readiness.data ? <ContinuityReadinessPanel summary={readiness.data} /> : null}

        {loading ? (
          <QueueMessage>Loading marketplace and continuity signals…</QueueMessage>
        ) : error ? (
          <section className="border-y border-[#DDE7E8] py-5">
            <p className="font-semibold text-[#13334F]">Some control-center signals could not load.</p>
            <p className="mt-1 text-sm text-[#607583]">{error.message}</p>
            <div className="mt-3 flex gap-4 text-sm font-semibold"><button type="button" onClick={marketplace.reload} className="text-[#2F8E7A]">Retry marketplace</button><button type="button" onClick={continuity.reload} className="text-[#607583]">Retry continuity</button></div>
          </section>
        ) : (
          <>
            {marketplace.data ? <MarketplaceEngine summary={marketplace.data.summary} /> : null}
            {continuity.data ? <ContinuitySignals summary={continuity.data} /> : null}
          </>
        )}

        <ExperimentSignals summary={experiment} />

        <section className="border-y border-[#DDE7E8] py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Retention test</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#13334F]">Is tenure making Covre more valuable?</h2>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-[#607583]">A five-year Covre worker should have more useful history, trust, and familiar places than a five-week worker. Repeat volume alone is not enough.</p>
            </div>
            <Link to="/admin/full-app" className="text-sm font-semibold text-[#2F8E7A] no-underline">Inspect product surfaces →</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function QueueMessage({ children }: { children: ReactNode }) {
  return <div className="border-y border-[#DDE7E8] py-7 text-sm text-[#607583]">{children}</div>;
}

function QueueError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="border-y border-[#DDE7E8] py-6"><p className="font-semibold text-[#13334F]">Continuity readiness could not be checked.</p><p className="mt-1 text-sm text-[#607583]">{message}</p><button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold text-[#2F8E7A]">Retry diagnostic</button></div>;
}
