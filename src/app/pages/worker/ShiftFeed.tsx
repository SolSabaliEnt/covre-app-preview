import { useEffect, useMemo, useState } from 'react';
import { WorkerShiftMap } from '../../components/WorkerShiftMap';
import { Link } from 'react-router';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  Heart,
  List,
  Map as MapIcon,
  MapPin,
  Repeat2,
  Settings,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getWorkerContinuitySummary,
  listWorkerShiftRequests,
  listWorkerShifts,
  listWorkerSiteReturnPreferences,
  saveShift,
  trackContinuityEvent,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useWorkerAction } from '../../hooks/useWorkerAction';
import { cn } from '../../components/ui/utils';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { displayWorkerPay } from '../../lib/workerRateCents';
import { WORKER_ENTRY_PATH } from '../../lib/entryRoutes';
import { getSiteContinuity, type WorkerContinuitySummary } from '../../lib/workerContinuity';

const EMPTY_CONTINUITY: WorkerContinuitySummary = {
  totalCompletedShifts: 0,
  familiarSiteCount: 0,
  repeatSiteCount: 0,
  sites: {},
};

type ViewMode = 'list' | 'map';

function LoadingBlock() {
  return (
    <div className="border-y border-[#DDE7E8] py-12 text-center">
      <p className="text-sm font-medium text-[#607583]">Finding shifts that fit your profile…</p>
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyShiftState({ supabaseMode }: { supabaseMode?: boolean }) {
  return (
    <div className="border-y border-[#DDE7E8] py-12 text-center">
      <p className="text-base font-semibold text-[#13334F]">No good-fit shifts are open right now.</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607583]">
        {supabaseMode
          ? 'We’ll show new opportunities here as soon as your pay rate and eligibility line up.'
          : 'Check back after facilities post new coverage needs.'}
      </p>
      {!supabaseMode && (
        <Link to="/worker/onboarding" className="mt-4 inline-flex text-sm font-semibold text-[#2F8E7A] hover:underline">
          Review your profile →
        </Link>
      )}
    </div>
  );
}

export default function ShiftFeed() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { data: shifts, error, loading, reload } = useAsyncResource(() => listWorkerShifts(), []);
  const { data: continuityData } = useAsyncResource(() => getWorkerContinuitySummary(), []);
  const { data: returnPreferenceSites } = useAsyncResource(() => listWorkerSiteReturnPreferences(), []);
  const { data: requests } = useAsyncResource(
    () =>
      supabaseMode
        ? listWorkerShiftRequests()
        : Promise.resolve({ ok: true as const, data: [] }),
    [supabaseMode],
  );

  const continuity = continuityData ?? EMPTY_CONTINUITY;
  const preferredReturnSites = useMemo(() => new Set(returnPreferenceSites ?? []), [returnPreferenceSites]);
  const appliedShiftIds = new Set(
    (requests ?? [])
      .filter(r => r.status === 'requested' || r.status === 'accepted')
      .map(r => r.shiftId),
  );
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedShiftId, setSelectedShiftId] = useState<string | undefined>();
  const [savedByShift, setSavedByShift] = useState<Record<string, boolean>>({});
  const [previouslyWorkedOnly, setPreviouslyWorkedOnly] = useState(false);
  const { run, isPending } = useWorkerAction();

  useEffect(() => {
    setSelectedShiftId(undefined);
  }, [shifts]);

  const familiarOpportunity = useMemo(() => {
    const familiar = (shifts ?? [])
      .map(shift => ({
        shift,
        history: getSiteContinuity(continuity, shift.siteId),
        workerWantsReturn: preferredReturnSites.has(shift.siteId),
      }))
      .filter(
        (row): row is {
          shift: NonNullable<typeof shifts>[number];
          history: NonNullable<typeof row.history>;
          workerWantsReturn: boolean;
        } => Boolean(row.history) && (!row.shift.workerShiftReadiness || row.shift.workerShiftReadiness.isReady),
      );

    familiar.sort((a, b) => {
      if (a.workerWantsReturn !== b.workerWantsReturn) return a.workerWantsReturn ? -1 : 1;
      const historyDifference = b.history.completedShifts - a.history.completedShifts;
      if (historyDifference !== 0) return historyDifference;
      return (a.shift.distanceNumericMiles ?? Number.POSITIVE_INFINITY) -
        (b.shift.distanceNumericMiles ?? Number.POSITIVE_INFINITY);
    });

    return familiar[0];
  }, [shifts, continuity, preferredReturnSites]);

  useEffect(() => {
    if (!familiarOpportunity || viewMode !== 'list' || previouslyWorkedOnly) return;
    trackContinuityEvent('worker_familiar_opportunity_impression', {
      actor: 'worker',
      shiftId: familiarOpportunity.shift.id,
      siteId: familiarOpportunity.shift.siteId,
      source: familiarOpportunity.workerWantsReturn ? 'private_return_preference' : 'work_history',
      completedShiftsHere: familiarOpportunity.history.completedShifts,
    });
  }, [familiarOpportunity?.shift.id, viewMode, previouslyWorkedOnly]);

  const visibleShifts = useMemo(() => {
    const filtered = (shifts ?? []).filter(
      shift => !previouslyWorkedOnly || Boolean(getSiteContinuity(continuity, shift.siteId)),
    );

    if (!familiarOpportunity) return filtered;
    const promotedIndex = filtered.findIndex(shift => shift.id === familiarOpportunity.shift.id);
    if (promotedIndex <= 0) return filtered;

    const promoted = filtered[promotedIndex];
    return [promoted, ...filtered.slice(0, promotedIndex), ...filtered.slice(promotedIndex + 1)];
  }, [shifts, previouslyWorkedOnly, continuity, familiarOpportunity]);

  const featuredShift = useMemo(() => {
    if (!visibleShifts.length) return undefined;
    if (familiarOpportunity) {
      const familiarVisible = visibleShifts.find(shift => shift.id === familiarOpportunity.shift.id);
      if (familiarVisible) return familiarVisible;
    }
    return visibleShifts.find(shift => !shift.workerShiftReadiness || shift.workerShiftReadiness.isReady) ?? visibleShifts[0];
  }, [visibleShifts, familiarOpportunity]);

  const featuredHistory = featuredShift ? getSiteContinuity(continuity, featuredShift.siteId) : undefined;
  const featuredWantsReturn = featuredShift ? preferredReturnSites.has(featuredShift.siteId) : false;
  const remainingShifts = featuredShift ? visibleShifts.filter(shift => shift.id !== featuredShift.id) : visibleShifts;

  const handleSave = async (shiftId: string) => {
    const result = await run(`save-${shiftId}`, () => saveShift(shiftId));
    if (result.ok) {
      toast.success(result.data.message);
      setSavedByShift(prev => ({ ...prev, [shiftId]: true }));
    } else {
      toast.error(result.error.message);
    }
  };

  const trackFamiliarOpen = (shiftId: string, siteId: string) => {
    if (!familiarOpportunity || familiarOpportunity.shift.id !== shiftId) return;
    trackContinuityEvent('worker_familiar_opportunity_open', {
      actor: 'worker',
      shiftId,
      siteId,
      source: familiarOpportunity.workerWantsReturn ? 'private_return_preference' : 'work_history',
      completedShiftsHere: familiarOpportunity.history.completedShifts,
    });
  };

  return (
    <div className="min-h-[100svh] w-full max-w-full overflow-x-hidden bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Care worker</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Find your next shift.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">
                Start with the strongest fit, then compare pay, timing, distance, and places that already know your work.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/worker/credentials"
                className="flex h-10 w-10 items-center justify-center text-[#607583] transition-colors hover:text-[#13334F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]"
                aria-label="Credential passport"
              >
                <Shield className="h-5 w-5" />
              </Link>
              <Link
                to="/worker/account"
                className="flex h-10 w-10 items-center justify-center text-[#607583] transition-colors hover:text-[#13334F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53B59F]"
                aria-label="Account settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {continuity.totalCompletedShifts > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#EEF3F4] pt-4 text-xs text-[#607583]">
              <span><strong className="font-semibold text-[#13334F]">{continuity.totalCompletedShifts}</strong> approved shifts</span>
              <span><strong className="font-semibold text-[#13334F]">{continuity.familiarSiteCount}</strong> familiar places</span>
              <span><strong className="font-semibold text-[#13334F]">{continuity.repeatSiteCount}</strong> repeat sites</span>
              <Link to="/worker/bookings" className="font-semibold text-[#2F8E7A] hover:underline">View history</Link>
            </div>
          )}
        </header>

        <div className="flex flex-col gap-4 border-b border-[#DDE7E8] py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5" role="tablist" aria-label="Shift view mode">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'list'}
              onClick={() => setViewMode('list')}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 border-b-2 px-0 text-sm font-semibold transition-colors',
                viewMode === 'list' ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#7A8D98] hover:text-[#13334F]',
              )}
            >
              <List className="h-4 w-4" aria-hidden /> List
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'map'}
              onClick={() => setViewMode('map')}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 border-b-2 px-0 text-sm font-semibold transition-colors',
                viewMode === 'map' ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#7A8D98] hover:text-[#13334F]',
              )}
            >
              <MapIcon className="h-4 w-4" aria-hidden /> Map
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPreviouslyWorkedOnly(value => !value)}
            className={cn(
              'inline-flex min-h-10 items-center gap-2 self-start rounded-full border px-3.5 text-sm font-semibold transition-colors sm:self-auto',
              previouslyWorkedOnly
                ? 'border-[#53B59F] bg-[#E6F6F2] text-[#257665]'
                : 'border-[#DDE7E8] bg-white text-[#466170] hover:border-[#BFCED4] hover:text-[#13334F]',
            )}
          >
            <Repeat2 className="h-4 w-4" aria-hidden /> Familiar places only
          </button>
        </div>

        {supabaseMode && !loading && !error && (
          <p className="py-3 text-xs text-[#9AAAB3]">Live Covre shifts. Eligibility and readiness stay connected to your profile.</p>
        )}

        {loading && <LoadingBlock />}
        {error && (
          <div className="py-4">
            <ErrorBlock message={error.message} onRetry={reload} />
            {supabaseMode && (
              <Link to={WORKER_ENTRY_PATH} className="mt-3 block text-center text-sm font-semibold text-[#2F8E7A] hover:underline">
                Sign in at /apply
              </Link>
            )}
          </div>
        )}

        {!loading && !error && shifts && visibleShifts.length === 0 && (
          <div className="pt-4">
            {viewMode === 'map' ? (
              <WorkerShiftMap shifts={[]} selectedShiftId={selectedShiftId} onSelectShift={id => setSelectedShiftId(id)} />
            ) : previouslyWorkedOnly ? (
              <div className="border-y border-[#DDE7E8] py-12 text-center">
                <p className="text-base font-semibold text-[#13334F]">Nothing open at a familiar place right now.</p>
                <p className="mt-2 text-sm text-[#607583]">Your approved history stays ready for the next time those sites post.</p>
                <button type="button" onClick={() => setPreviouslyWorkedOnly(false)} className="mt-4 text-sm font-semibold text-[#2F8E7A] hover:underline">
                  Show all shifts
                </button>
              </div>
            ) : (
              <EmptyShiftState supabaseMode={supabaseMode} />
            )}
          </div>
        )}

        {!loading && !error && shifts && visibleShifts.length > 0 && viewMode === 'list' && featuredShift && (
          <>
            <section className="border-b border-[#BFCED4] py-7">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {featuredHistory ? 'Best next shift for you' : 'Strong next option'}
              </div>

              <div className="mt-4 flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#13334F]">{featuredShift.roleTitle}</h2>
                  <p className="mt-1 text-base text-[#466170]">{featuredShift.siteName || featuredShift.facilitySettingLabel}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-semibold text-[#13334F]">{displayWorkerPay(featuredShift)}</p>
                  <p className="mt-1 text-xs text-[#607583]">Est. {featuredShift.estimatedTotalDisplay}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 border-y border-[#DDE7E8] py-4 text-sm sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#2F8E7A]" aria-hidden />
                  <span><strong className="font-semibold text-[#13334F]">{featuredShift.dateLabel}</strong><br /><span className="text-[#607583]">{featuredShift.timeRange}</span></span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2F8E7A]" aria-hidden />
                  <span><strong className="font-semibold text-[#13334F]">{featuredShift.distanceMiles}</strong><br /><span className="text-[#607583]">{featuredShift.facilitySettingLabel}</span></span>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#2F8E7A]" aria-hidden />
                  <span>
                    <strong className="font-semibold text-[#13334F]">
                      {featuredShift.workerShiftReadiness
                        ? featuredShift.workerShiftReadiness.isReady ? 'Ready to request' : 'Needs credentials'
                        : 'Profile ready'}
                    </strong>
                    <br />
                    <span className="text-[#607583]">Readiness checked</span>
                  </span>
                </div>
              </div>

              {featuredHistory && (
                <div className="mt-4 flex items-start gap-3 bg-[#E6F6F2] px-4 py-3">
                  {featuredWantsReturn ? <Heart className="mt-0.5 h-4 w-4 shrink-0 text-[#257665]" aria-hidden /> : <Repeat2 className="mt-0.5 h-4 w-4 shrink-0 text-[#257665]" aria-hidden />}
                  <p className="text-sm leading-5 text-[#466170]">
                    <strong className="font-semibold text-[#257665]">
                      {featuredWantsReturn ? 'You said you’d work here again.' : 'This place already knows your work.'}
                    </strong>{' '}
                    You have {featuredHistory.completedShifts} approved {featuredHistory.completedShifts === 1 ? 'shift' : 'shifts'} here
                    {featuredHistory.lastWorkedLabel ? `, most recently ${featuredHistory.lastWorkedLabel}` : ''}.
                  </p>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to={`/worker/shift/${featuredShift.id}`}
                  onClick={() => trackFamiliarOpen(featuredShift.id, featuredShift.siteId)}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#2F8E7A]"
                >
                  See shift details <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  disabled={savedByShift[featuredShift.id] || isPending(`save-${featuredShift.id}`)}
                  onClick={() => handleSave(featuredShift.id)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] px-5 text-sm font-semibold text-[#13334F] transition-colors hover:border-[#BFCED4] hover:bg-[#F7FAFA] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Bookmark className="h-4 w-4" aria-hidden /> {savedByShift[featuredShift.id] ? 'Saved' : 'Save'}
                </button>
              </div>
              {supabaseMode && appliedShiftIds.has(featuredShift.id) && <p className="mt-3 text-xs font-semibold text-[#2F8E7A]">Already requested</p>}
            </section>

            {remainingShifts.length > 0 && (
              <section className="pt-7">
                <div className="flex items-end justify-between gap-4 pb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Keep comparing</p>
                    <h2 className="mt-1 text-xl font-semibold text-[#13334F]">{remainingShifts.length} more {remainingShifts.length === 1 ? 'shift' : 'shifts'}</h2>
                  </div>
                  <p className="text-xs text-[#9AAAB3]">Pay · timing · fit</p>
                </div>

                <div className="border-t border-[#BFCED4]">
                  {remainingShifts.map(shift => {
                    const siteHistory = getSiteContinuity(continuity, shift.siteId);
                    const workerWantsReturn = preferredReturnSites.has(shift.siteId);
                    const isReady = !shift.workerShiftReadiness || shift.workerShiftReadiness.isReady;
                    return (
                      <article key={shift.id} className="border-b border-[#DDE7E8] py-5">
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="text-lg font-semibold text-[#13334F]">{shift.roleTitle}</h3>
                              {!isReady && <span className="text-xs font-semibold text-[#A46A14]">Needs credentials</span>}
                              {supabaseMode && appliedShiftIds.has(shift.id) && <span className="text-xs font-semibold text-[#2F8E7A]">Requested</span>}
                            </div>
                            <p className="mt-1 text-sm text-[#466170]">{shift.siteName || shift.facilitySettingLabel}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-semibold text-[#13334F]">{displayWorkerPay(shift)}</p>
                            <p className="mt-1 text-xs text-[#607583]">Est. {shift.estimatedTotalDisplay}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#607583]">
                          <span>{shift.dateLabel} · {shift.timeRange}</span>
                          <span>{shift.distanceMiles}</span>
                          <span>{shift.facilitySettingLabel}</span>
                        </div>

                        {siteHistory && (
                          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#257665]">
                            {workerWantsReturn ? <Heart className="h-3.5 w-3.5" aria-hidden /> : <Repeat2 className="h-3.5 w-3.5" aria-hidden />}
                            <span>{workerWantsReturn ? 'You’d return here' : `Worked here ${siteHistory.completedShifts}×`}</span>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <button
                            type="button"
                            disabled={savedByShift[shift.id] || isPending(`save-${shift.id}`)}
                            onClick={() => handleSave(shift.id)}
                            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#607583] transition-colors hover:text-[#13334F] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Bookmark className="h-4 w-4" aria-hidden /> {savedByShift[shift.id] ? 'Saved' : 'Save'}
                          </button>
                          <Link
                            to={`/worker/shift/${shift.id}`}
                            onClick={() => trackFamiliarOpen(shift.id, shift.siteId)}
                            className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A] no-underline hover:text-[#257665]"
                          >
                            View shift <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {!loading && !error && shifts && visibleShifts.length > 0 && viewMode === 'map' && (
          <div className="pt-5">
            <WorkerShiftMap shifts={visibleShifts} selectedShiftId={selectedShiftId} onSelectShift={id => setSelectedShiftId(id)} />
          </div>
        )}
      </div>
    </div>
  );
}
