import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, CalendarClock, CalendarPlus, CheckCircle2, Heart, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  addShiftToCalendar,
  getWorkerContinuitySummary,
  listWorkerBookings,
  listWorkerSiteReturnPreferences,
  saveWorkerSiteReturnPreference,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useWorkerAction } from '../../hooks/useWorkerAction';
import { WorkerShiftInvitations } from '../../components/WorkerShiftInvitations';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import {
  acceptedPayRateLabel,
  displayAcceptedWorkerPay,
  hasWorkerRateSnapshot,
} from '../../lib/workerRateCents';
import type { Shift } from '../../data/types';
import {
  buildWorkerContinuityRecognition,
  getSiteContinuity,
  type WorkerContinuitySummary,
} from '../../lib/workerContinuity';

const EMPTY_CONTINUITY: WorkerContinuitySummary = {
  totalCompletedShifts: 0,
  familiarSiteCount: 0,
  repeatSiteCount: 0,
  sites: {},
};

function LoadingBlock() {
  return (
    <div className="border-y border-[#DDE7E8] py-12 text-center">
      <p className="text-sm font-medium text-[#607583]">Loading your shifts…</p>
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
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A]"
      >
        Try again
      </button>
    </div>
  );
}

function PayBlock({ shift, supabaseMode }: { shift: Shift; supabaseMode: boolean }) {
  const payLabel = acceptedPayRateLabel(supabaseMode, shift.rateTypeSnapshot ?? shift.rateType);
  const showShiftTotal = hasWorkerRateSnapshot(shift) && shift.estimatedTotalDisplay !== '—';

  return (
    <div className="text-right">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">{payLabel}</p>
      <p className="mt-1 text-lg font-semibold text-[#13334F]">{displayAcceptedWorkerPay(shift)}</p>
      {showShiftTotal ? <p className="mt-1 text-xs text-[#607583]">{shift.estimatedTotalDisplay} shift total</p> : null}
    </div>
  );
}

export default function WorkerBookings() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { data, error, loading, reload } = useAsyncResource(() => listWorkerBookings(), []);
  const { data: continuityData } = useAsyncResource(() => getWorkerContinuitySummary(), []);
  const { data: savedReturnPreferenceSites } = useAsyncResource(() => listWorkerSiteReturnPreferences(), []);
  const { run, isPending } = useWorkerAction();
  const [calendarAddedByShift, setCalendarAddedByShift] = useState<Record<string, boolean>>({});
  const [returnPreferenceBySite, setReturnPreferenceBySite] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!savedReturnPreferenceSites) return;
    setReturnPreferenceBySite(Object.fromEntries(savedReturnPreferenceSites.map(siteId => [siteId, true])));
  }, [savedReturnPreferenceSites]);

  const isEmpty = data && data.upcoming.length === 0 && data.completed.length === 0;
  const continuity = continuityData ?? EMPTY_CONTINUITY;
  const recognition = useMemo(() => buildWorkerContinuityRecognition(continuity), [continuity]);
  const nextBooking = data?.upcoming[0];
  const laterBookings = data?.upcoming.slice(1) ?? [];

  const addCalendar = async (shiftId: string) => {
    const result = await run(`cal-${shiftId}`, () => addShiftToCalendar(shiftId));
    if (result.ok) {
      toast.success(result.data.message);
      setCalendarAddedByShift(prev => ({ ...prev, [shiftId]: true }));
    } else {
      toast.error(result.error.message);
    }
  };

  const saveReturnPreference = async (siteId: string) => {
    const result = await run(`return-${siteId}`, () => saveWorkerSiteReturnPreference(siteId));
    if (result.ok) {
      toast.success(result.data.message);
      setReturnPreferenceBySite(prev => ({ ...prev, [siteId]: true }));
    } else {
      toast.error(result.error.message);
    }
  };

  return (
    <div className="min-h-[100svh] w-full max-w-full overflow-x-hidden bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Your work</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Bookings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">
            Confirmed work first. Invitations, shift details, accepted pay, and your approved history stay connected here.
          </p>
        </header>

        <section className="border-b border-[#DDE7E8] py-5">
          <WorkerShiftInvitations />
        </section>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error.message} onRetry={reload} />}

        {!loading && !error && recognition && (
          <section className="border-b border-[#DDE7E8] py-5">
            <div className="flex items-start gap-3">
              <Repeat2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">{recognition.eyebrow}</p>
                <h2 className="mt-1 text-lg font-semibold text-[#13334F]">{recognition.headline}</h2>
                <p className="mt-1 text-sm leading-6 text-[#607583]">{recognition.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-semibold text-[#13334F]">{recognition.primaryValue}</p>
                <p className="text-xs text-[#607583]">{recognition.primaryLabel}</p>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && isEmpty && (
          <section className="border-b border-[#DDE7E8] py-12 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-[#53B59F]" aria-hidden />
            <p className="mt-3 text-base font-semibold text-[#13334F]">Nothing booked yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607583]">
              Request an open shift or respond to an invitation and your confirmed work will land here.
            </p>
            <Link to="/worker/shifts" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
              Browse open shifts <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        )}

        {!loading && !error && data && !isEmpty && nextBooking && (
          <section className="border-b border-[#BFCED4] py-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">
              <CalendarClock className="h-4 w-4" aria-hidden /> Next up
            </div>

            <div className="mt-4 flex items-start justify-between gap-5">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-[-0.025em] text-[#13334F]">{nextBooking.shift.roleTitle}</h2>
                <p className="mt-1 text-base text-[#466170]">{nextBooking.shift.siteName}</p>
                <p className="mt-2 text-sm font-medium text-[#13334F]">{nextBooking.shift.dateLabel} · {nextBooking.shift.timeRange}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2F8E7A]">{nextBooking.statusDisplay}</p>
              </div>
              <PayBlock shift={nextBooking.shift} supabaseMode={supabaseMode} />
            </div>

            {getSiteContinuity(continuity, nextBooking.shift.siteId)?.completedShifts ? (
              <div className="mt-4 flex items-start gap-2 bg-[#E6F6F2] px-4 py-3 text-sm text-[#466170]">
                <Repeat2 className="mt-0.5 h-4 w-4 shrink-0 text-[#257665]" aria-hidden />
                <span>
                  This site already knows your work · {getSiteContinuity(continuity, nextBooking.shift.siteId)?.completedShifts} approved shifts here
                </span>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/worker/shift/${nextBooking.shift.id}`}
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#0B243A]"
              >
                Know before you go <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              {!supabaseMode && (
                <Link
                  to="/worker/active-shift"
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#2F8E7A]"
                >
                  Open active shift
                </Link>
              )}
              <button
                type="button"
                disabled={!!calendarAddedByShift[nextBooking.shift.id] || isPending(`cal-${nextBooking.shift.id}`)}
                onClick={() => addCalendar(nextBooking.shift.id)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] px-5 text-sm font-semibold text-[#13334F] transition-colors hover:bg-[#F7FAFA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden />
                {calendarAddedByShift[nextBooking.shift.id] ? 'Added' : 'Calendar'}
              </button>
            </div>
          </section>
        )}

        {!loading && !error && laterBookings.length > 0 && (
          <section className="pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Later bookings</p>
            <div className="mt-3 border-t border-[#BFCED4]">
              {laterBookings.map(({ shift, statusDisplay }) => (
                <article key={`${shift.id}-upcoming`} className="border-b border-[#DDE7E8] py-5">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-[#13334F]">{shift.roleTitle}</h3>
                      <p className="mt-1 text-sm text-[#466170]">{shift.siteName}</p>
                      <p className="mt-2 text-sm text-[#607583]">{shift.dateLabel} · {shift.timeRange}</p>
                      <p className="mt-1 text-xs font-semibold text-[#2F8E7A]">{statusDisplay}</p>
                    </div>
                    <PayBlock shift={shift} supabaseMode={supabaseMode} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={!!calendarAddedByShift[shift.id] || isPending(`cal-${shift.id}`)}
                      onClick={() => addCalendar(shift.id)}
                      className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#607583] hover:text-[#13334F] disabled:opacity-60"
                    >
                      <CalendarPlus className="h-4 w-4" aria-hidden /> {calendarAddedByShift[shift.id] ? 'Added' : 'Add to calendar'}
                    </button>
                    <Link to={`/worker/shift/${shift.id}`} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A] no-underline hover:text-[#257665]">
                      View shift <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && data && data.completed.length > 0 && (
          <section className="pt-9">
            <div className="flex items-end justify-between gap-4 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Work history</p>
                <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Completed shifts</h2>
              </div>
              <CheckCircle2 className="h-5 w-5 text-[#53B59F]" aria-hidden />
            </div>

            <div className="border-t border-[#BFCED4]">
              {data.completed.map(({ shift, statusDisplay }) => {
                const workedHereCount = getSiteContinuity(continuity, shift.siteId)?.completedShifts;
                const preferenceSaved = Boolean(returnPreferenceBySite[shift.siteId]);
                return (
                  <article key={`${shift.id}-completed`} className="border-b border-[#DDE7E8] py-5">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-[#13334F]">{shift.roleTitle}</h3>
                        <p className="mt-1 text-sm text-[#466170]">{shift.siteName}</p>
                        <p className="mt-2 text-sm text-[#607583]">{shift.dateLabel} · {shift.timeRange}</p>
                        <p className="mt-1 text-xs font-semibold text-[#2F8E7A]">{statusDisplay}</p>
                      </div>
                      <PayBlock shift={shift} supabaseMode={supabaseMode} />
                    </div>

                    {workedHereCount && workedHereCount > 1 ? (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#257665]">
                        <Repeat2 className="h-3.5 w-3.5" aria-hidden />
                        {workedHereCount >= 5 ? 'One of your regular places' : 'Familiar place'} · {workedHereCount} approved shifts
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 border-t border-[#EEF3F4] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        disabled={preferenceSaved || isPending(`return-${shift.siteId}`)}
                        onClick={() => saveReturnPreference(shift.siteId)}
                        className="inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-[#257665] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Heart className="h-4 w-4" aria-hidden />
                        {preferenceSaved ? 'Saved: I’d work here again' : 'I’d work here again'}
                      </button>
                      <Link to={`/worker/shift/${shift.id}`} className="inline-flex min-h-10 items-center gap-1.5 self-start text-sm font-semibold text-[#2F8E7A] no-underline hover:text-[#257665]">
                        View record <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </div>
                    {!preferenceSaved ? (
                      <p className="mt-2 text-xs leading-5 text-[#9AAAB3]">Private to you. Covre uses this only to remember places you would return to.</p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
