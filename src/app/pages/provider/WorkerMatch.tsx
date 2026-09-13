import { Link, useParams } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';
import { ArrowLeft, CheckCircle2, MapPin, Repeat2, Shield, Star, TrendingUp } from 'lucide-react';
import {
  addWorkerToBench,
  bookWorkerForShift,
  getProviderWorkerMatchPage,
  getProviderWorkerProfile,
  listCurrentProviderWorkerSiteContinuity,
  trackContinuityEvent,
} from '../../services';
import { useProviderAction } from '../../hooks/useProviderAction';
import { useAsyncResource } from '../../hooks/useAsyncResource';

export default function WorkerMatch() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const { run, isPending } = useProviderAction();
  const [bookedByWorker, setBookedByWorker] = useState<Record<string, boolean>>({});
  const [benchByWorker, setBenchByWorker] = useState<Record<string, boolean>>({});

  const { data: page, error, loading, reload } = useAsyncResource(
    () =>
      !shiftId
        ? Promise.resolve({ ok: false as const, error: { code: 'validation', message: 'Shift ID is required.' } })
        : getProviderWorkerMatchPage(shiftId),
    [shiftId],
  );

  const { data: siteHistoryByWorker } = useAsyncResource(async () => {
    if (!page) return { ok: true as const, data: {} as Record<string, number> };

    if (page.source === 'supabase_shift_mock_candidates') {
      const result = await listCurrentProviderWorkerSiteContinuity(page.shift.siteId);
      if (!result.ok) return result;
      return {
        ok: true as const,
        data: Object.fromEntries(result.data.map(row => [row.workerId, row.approvedShiftCount])) as Record<string, number>,
      };
    }

    const entries = await Promise.all(
      page.candidates.map(async worker => {
        const result = await getProviderWorkerProfile(worker.id);
        if (!result.ok || !result.data) return [worker.id, 0] as const;
        const siteHistory = result.data.siteFamiliarity.find(site => site.siteId === page.shift.siteId);
        return [worker.id, siteHistory?.shiftCount ?? 0] as const;
      }),
    );
    return { ok: true as const, data: Object.fromEntries(entries) as Record<string, number> };
  }, [page?.shift.id, page?.source]);

  if (loading) return <StateBlock title="Finding the strongest matches…" />;
  if (error) return <StateBlock title={error.message} actionLabel="Retry" onAction={reload} />;
  if (!page || !shiftId) return <StateBlock title="Shift not found" />;

  const { shift, candidates } = page;
  const isSupabaseSimulated = page.source === 'supabase_shift_mock_candidates';

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-white text-[#10283D]">
      <div className="bg-[#13334F] px-5 py-8 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            to={`/provider/shifts/${shift.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/65 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Shift details
          </Link>
          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9FCFC4]">Worker shortlist</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Choose for fit, not volume.</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">
                {shift.roleTitle} · {shift.siteName} · {shift.dateLabel}, {shift.timeRange}
              </p>
            </div>
            <div className="border-t border-white/15 pt-4 text-left lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 lg:text-right">
              <p className="text-xs uppercase tracking-[0.12em] text-white/45">Bill rate</p>
              <p className="mt-1 text-2xl font-semibold">{shift.hourlyPayDisplay}</p>
              {shift.isUrgent ? <p className="mt-1 text-xs font-semibold text-[#F6C87D]">Urgent coverage</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        {isSupabaseSimulated ? (
          <div className="mb-8 border-y border-[#DDE7E8] py-4 text-sm leading-6 text-[#607583]">
            Preview candidates are shown for layout review only. Production booking actions stay disabled on synthetic worker IDs.
          </div>
        ) : null}

        <div className="mb-4 flex items-end justify-between gap-4 border-b border-[#DDE7E8] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">Qualified workers</p>
            <p className="mt-1 text-sm text-[#607583]">Credential fit, reliability, and site familiarity are shown together.</p>
          </div>
          <p className="text-3xl font-semibold text-[#13334F]">{candidates.length}</p>
        </div>

        <div className="divide-y divide-[#DDE7E8] border-b border-[#DDE7E8]">
          {candidates.map(worker => {
            const priorShiftsHere = siteHistoryByWorker?.[worker.id] ?? 0;
            const isFamiliarHere = priorShiftsHere > 0;
            return (
              <article key={worker.id} className="py-7 sm:py-8">
                <div className="grid gap-6 lg:grid-cols-[1fr_250px] lg:gap-10">
                  <div className="min-w-0">
                    <div className="flex items-start gap-4">
                      <Link
                        to={`/provider/workers/${worker.id}`}
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] text-lg font-semibold text-[#257665] no-underline"
                      >
                        {worker.name.split(' ').map(n => n[0]).join('')}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/provider/workers/${worker.id}`} className="text-xl font-semibold text-[#13334F] no-underline hover:text-[#2F8E7A]">
                            {worker.name}
                          </Link>
                          {worker.status === 'preferred' ? <StatusBadge variant="preferred">Preferred</StatusBadge> : null}
                          {isFamiliarHere ? <StatusBadge variant="verified">Worked here</StatusBadge> : null}
                        </div>
                        <p className="mt-1 text-sm text-[#607583]">{worker.role}</p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#607583]">
                          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-[#2F8E7A]" /> {worker.score} Covre Score</span>
                          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {worker.distance}</span>
                          <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> {worker.onTime}% on time</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 border-y border-[#DDE7E8] py-4 sm:grid-cols-3">
                      <Metric label="Match" value={`${worker.score}`} />
                      <Metric label="Approved here" value={`${priorShiftsHere}×`} />
                      <Metric label="Credentials" value={`${worker.credentials.length}`} />
                    </div>

                    <div className="mt-5 flex items-start gap-2 text-sm leading-6 text-[#607583]">
                      <Repeat2 className={`mt-0.5 h-4 w-4 shrink-0 ${isFamiliarHere ? 'text-[#2F8E7A]' : 'text-[#9AAAB3]'}`} aria-hidden />
                      <p>
                        {isFamiliarHere
                          ? `${worker.name} already has ${priorShiftsHere} approved ${priorShiftsHere === 1 ? 'shift' : 'shifts'} at ${shift.siteName}. This is a real return relationship.`
                          : `No approved work history together at ${shift.siteName} yet.`}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-[#257665]">
                      {worker.credentials.map(cred => (
                        <span key={cred} className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" aria-hidden />
                          {cred}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#DDE7E8] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">
                      {isFamiliarHere ? 'Continue the relationship' : 'Start the relationship'}
                    </p>
                    <div className="mt-4 space-y-2.5">
                      {isSupabaseSimulated ? (
                        <Link
                          to={`/provider/shifts/${shift.id}`}
                          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#53B59F] px-4 text-sm font-semibold text-white no-underline"
                        >
                          Review real applicants
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled={bookedByWorker[worker.id] || isPending(`book-${worker.id}`)}
                          onClick={async e => {
                            e.stopPropagation();
                            const r = await run(`book-${worker.id}`, () => bookWorkerForShift(worker.id, shift.id));
                            if (r.ok) {
                              toast.success(r.data.message);
                              setBookedByWorker(prev => ({ ...prev, [worker.id]: true }));
                              if (isFamiliarHere) {
                                trackContinuityEvent('provider_rebook_action', {
                                  actor: 'provider', workerId: worker.id, siteId: shift.siteId, shiftId: shift.id,
                                  source: 'worker_match_book_again', completedShiftsHere: priorShiftsHere,
                                });
                              }
                            } else toast.error(r.error.message);
                          }}
                          className="min-h-11 w-full rounded-xl bg-[#53B59F] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A] disabled:opacity-60"
                        >
                          {bookedByWorker[worker.id] ? 'Booked' : isFamiliarHere ? 'Book again' : 'Book worker'}
                        </button>
                      )}

                      <Link
                        to={`/provider/workers/${worker.id}`}
                        className="flex min-h-11 w-full items-center justify-center rounded-xl border border-[#DDE7E8] bg-white px-4 text-sm font-semibold text-[#13334F] no-underline hover:bg-[#F7FAFA]"
                      >
                        {isFamiliarHere ? 'View shared history' : 'View profile'}
                      </Link>

                      <button
                        type="button"
                        disabled={isSupabaseSimulated || benchByWorker[worker.id] || isPending(`bench-${worker.id}`)}
                        onClick={async e => {
                          e.stopPropagation();
                          if (isSupabaseSimulated) return;
                          const r = await run(`bench-${worker.id}`, () => addWorkerToBench(worker.id));
                          if (r.ok) {
                            toast.success(r.data.message);
                            setBenchByWorker(prev => ({ ...prev, [worker.id]: true }));
                          } else toast.error(r.error.message);
                        }}
                        className="min-h-11 w-full px-3 text-sm font-semibold text-[#607583] transition-colors hover:text-[#13334F] disabled:opacity-50"
                      >
                        {isSupabaseSimulated ? 'Real worker required' : benchByWorker[worker.id] ? 'Added to bench' : 'Add to bench'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.1em] text-[#9AAAB3]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#13334F]">{value}</p>
    </div>
  );
}

function StateBlock({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="min-h-full bg-[#F7FAFA] px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-xl border-y border-[#DDE7E8] py-10 text-center">
        <p className="text-sm font-semibold text-[#13334F]">{title}</p>
        {actionLabel && onAction ? (
          <button onClick={onAction} className="mt-5 rounded-xl bg-[#13334F] px-5 py-2.5 text-sm font-semibold text-white">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
