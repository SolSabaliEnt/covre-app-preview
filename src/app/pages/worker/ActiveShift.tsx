import { AlertTriangle, CalendarClock, Clock, Coffee, MapPin, Phone, Play } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  clockInShift,
  clockOutShift,
  endBreak,
  getActiveShift,
  startBreak,
  submitTimesheet,
} from '../../services';
import type { WorkerActiveShiftPhase, WorkerActiveShiftStatus } from '../../services/types';
import { formatTimeLabel } from '../../repositories/workerActiveShiftRepository';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useWorkerAction } from '../../hooks/useWorkerAction';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { acceptedPayRateLabel, displayAcceptedWorkerPay } from '../../lib/workerRateCents';

type ActivePhase = 'not_started' | 'clocked_in' | 'on_break' | 'clocked_out' | 'submitted';

function mapPhaseToUi(phase: WorkerActiveShiftPhase): ActivePhase {
  switch (phase) {
    case 'scheduled': return 'not_started';
    case 'clocked_in': return 'clocked_in';
    case 'on_break': return 'on_break';
    case 'clocked_out': return 'clocked_out';
    case 'submitted': return 'submitted';
    default: return 'not_started';
  }
}

function elapsedSince(clockInAt?: string): string {
  if (!clockInAt) return '—';
  const ms = Date.now() - Date.parse(clockInAt);
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}:${String(m).padStart(2, '0')}`;
}

function afterSuccess(isSupabase: boolean, reload: () => void, setPhase: (p: ActivePhase) => void, next: ActivePhase) {
  if (isSupabase) reload();
  else setPhase(next);
}

function stagedBadgeLabel(status: WorkerActiveShiftStatus): string {
  switch (status) {
    case 'ready': return 'Ready';
    case 'in_progress_staged': return 'In progress';
    case 'completed_staged': return 'Ended';
    case 'scheduled': return 'Scheduled';
    default: return 'Staged';
  }
}

function EmptyActiveState({ message }: { message: string }) {
  return (
    <div className="min-h-[100svh] bg-white px-4 py-12 text-[#10283D]">
      <div className="mx-auto max-w-xl border-y border-[#DDE7E8] py-12 text-center">
        <CalendarClock className="mx-auto h-8 w-8 text-[#53B59F]" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold text-[#13334F]">No active shift right now.</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#607583]">{message}</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/worker/bookings" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white no-underline hover:bg-[#0B243A]">
            View bookings
          </Link>
          <Link to="/worker/shifts" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DDE7E8] px-5 text-sm font-semibold text-[#13334F] no-underline hover:bg-[#F7FAFA]">
            Browse shifts
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ActiveShift() {
  const isSupabase = isSupabaseBackendEnabled();
  const [phase, setPhase] = useState<ActivePhase>('not_started');
  const { run, isPending } = useWorkerAction();
  const { data, error, loading, reload } = useAsyncResource(() => getActiveShift(), []);

  const summary = data?.summary;
  const shift = data?.shift;
  const shiftId = data?.previewShiftId ?? summary?.shiftId ?? '';
  const actionsEnabled = summary?.actionsEnabled ?? !isSupabase;

  if (loading) {
    return <div className="min-h-[100svh] bg-white px-4 py-12 text-center text-sm font-medium text-[#607583]">Loading your active shift…</div>;
  }

  if (error) {
    return (
      <div className="min-h-[100svh] bg-white px-4 py-12 text-center">
        <p className="text-sm text-[#607583]">{error.message}</p>
        <button type="button" onClick={reload} className="mt-4 rounded-xl bg-[#13334F] px-5 py-3 text-sm font-semibold text-white">Try again</button>
      </div>
    );
  }

  if (isSupabase && summary?.status === 'unavailable') return <EmptyActiveState message={summary.message} />;
  if (!shift || !shiftId) return <EmptyActiveState message="Your next confirmed shift will appear here when it is ready to start." />;

  const uiPhase: ActivePhase = isSupabase && summary?.phase ? mapPhaseToUi(summary.phase) : phase;
  const onBreak = uiPhase === 'on_break';
  const showClockIn = actionsEnabled && uiPhase === 'not_started' && (!isSupabase || summary?.canClockIn !== false);
  const showClockedInBlock = actionsEnabled && (uiPhase === 'clocked_in' || uiPhase === 'on_break');
  const showClockOut = actionsEnabled && uiPhase !== 'not_started' && uiPhase !== 'clocked_out' && uiPhase !== 'submitted' && (isSupabase ? summary?.canClockOut : true);
  const showTimesheet = actionsEnabled && (uiPhase === 'clocked_out' || uiPhase === 'submitted') && (!isSupabase || summary?.canSubmitTimesheet !== false || uiPhase === 'submitted');
  const showStagedPrep = isSupabase && !actionsEnabled;
  const breakStartLabel = summary?.events?.filter(e => e.eventType === 'break_start').slice(-1)[0]?.occurredAt;
  const phaseLabel = uiPhase === 'submitted' ? 'Submitted' : showStagedPrep ? stagedBadgeLabel(summary?.status ?? 'scheduled') : uiPhase === 'on_break' ? 'On break' : uiPhase === 'clocked_in' ? 'On shift' : uiPhase === 'clocked_out' ? 'Clocked out' : 'Ready to start';

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Active shift</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">{shift.roleTitle}</h1>
              <p className="mt-1 text-base text-[#466170]">{shift.siteName}</p>
              {shift.dateLabel && shift.timeRange ? <p className="mt-2 text-sm text-[#607583]">{shift.dateLabel} · {shift.timeRange}</p> : null}
            </div>
            <span className="shrink-0 rounded-full bg-[#E6F6F2] px-3 py-1.5 text-xs font-semibold text-[#257665]">{phaseLabel}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-[#EEF3F4] pt-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">{acceptedPayRateLabel(isSupabase, summary?.rateTypeSnapshot ?? shift.rateTypeSnapshot ?? shift.rateType)}</p>
              <p className="mt-1 font-semibold text-[#13334F]">{isSupabase ? summary?.workerPayDisplay ?? displayAcceptedWorkerPay(shift) : shift.hourlyPayDisplay}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">Status</p>
              <p className="mt-1 font-semibold text-[#13334F]">{phaseLabel}</p>
            </div>
          </div>
        </header>

        {showStagedPrep && summary ? (
          <section className="border-b border-[#DDE7E8] py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Shift prep</p>
            <h2 className="mt-2 text-xl font-semibold text-[#13334F]">Your booking is loaded and ready.</h2>
            <p className="mt-2 text-sm leading-6 text-[#607583]">{summary.message}</p>
            <p className="mt-3 text-xs text-[#9AAAB3]">Clock-in, breaks, and timesheets are not connected for this staged booking yet.</p>
          </section>
        ) : null}

        {isSupabase && summary?.actionsEnabled ? (
          <p className="border-b border-[#DDE7E8] py-4 text-sm leading-6 text-[#607583]">{summary.message}</p>
        ) : null}

        {showClockIn && (
          <section className="border-b border-[#BFCED4] py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]"><Play className="h-6 w-6" aria-hidden /></div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#13334F]">You’re here. Start the shift.</h2>
            <p className="mt-2 text-sm text-[#607583]">Clock in once you’ve arrived and are ready to begin work.</p>
            <button
              type="button"
              disabled={isPending(`clock-in-${shiftId}`) || (isSupabase && !summary?.canClockIn)}
              onClick={async () => {
                const r = await run(`clock-in-${shiftId}`, () => clockInShift(shiftId));
                if (r.ok) { toast.success(r.data.message); afterSuccess(isSupabase, reload, setPhase, 'clocked_in'); }
                else toast.error(r.error.message);
              }}
              className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-[#53B59F] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2F8E7A] disabled:opacity-60 sm:max-w-sm"
            >
              {isPending(`clock-in-${shiftId}`) ? 'Clocking in…' : 'Clock in'}
            </button>
          </section>
        )}

        {showClockedInBlock && (
          <section className="border-b border-[#BFCED4] py-7">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]"><Clock className="h-4 w-4" aria-hidden /> Time on shift</div>
              <div className="mt-3 text-6xl font-semibold tracking-[-0.06em] text-[#13334F]">{isSupabase ? elapsedSince(summary?.clockInAt) : '3:24'}</div>
              <p className="mt-2 text-sm text-[#607583]">Scheduled {shift.timeRange}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 border-y border-[#DDE7E8] py-4 text-center">
              <div className="border-r border-[#DDE7E8]">
                <p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Clocked in</p>
                <p className="mt-1 font-semibold text-[#13334F]">{isSupabase ? formatTimeLabel(summary?.clockInAt) ?? '—' : '5:02 PM'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-[#7A8D98]">Expected end</p>
                <p className="mt-1 font-semibold text-[#13334F]">{isSupabase ? formatTimeLabel(summary?.endsAt) ?? '—' : '11:00 PM'}</p>
              </div>
            </div>

            <button
              type="button"
              disabled={onBreak ? isPending(`break-end-${shiftId}`) || (isSupabase && !summary?.canEndBreak) : isPending(`break-start-${shiftId}`) || (isSupabase && !summary?.canStartBreak)}
              onClick={async () => {
                if (onBreak) {
                  const r = await run(`break-end-${shiftId}`, () => endBreak(shiftId));
                  if (r.ok) { toast.success(r.data.message); afterSuccess(isSupabase, reload, setPhase, 'clocked_in'); } else toast.error(r.error.message);
                } else {
                  const r = await run(`break-start-${shiftId}`, () => startBreak(shiftId));
                  if (r.ok) { toast.success(r.data.message); afterSuccess(isSupabase, reload, setPhase, 'on_break'); } else toast.error(r.error.message);
                }
              }}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] px-5 text-sm font-semibold text-[#13334F] hover:bg-[#F7FAFA] disabled:opacity-60"
            >
              <Coffee className="h-4 w-4" aria-hidden />
              {onBreak ? (isPending(`break-end-${shiftId}`) ? 'Ending break…' : 'End break') : (isPending(`break-start-${shiftId}`) ? 'Starting break…' : 'Start break')}
            </button>

            {onBreak && <p className="mt-3 text-center text-sm font-medium text-[#9B6419]">Break started at {isSupabase ? formatTimeLabel(breakStartLabel) ?? '—' : '8:15 PM'}</p>}
          </section>
        )}

        {actionsEnabled && uiPhase === 'clocked_out' && (
          <section className="border-b border-[#DDE7E8] py-7 text-center">
            <h2 className="text-xl font-semibold text-[#13334F]">Shift complete.</h2>
            <p className="mt-2 text-sm text-[#607583]">Submit your timesheet to close out the work.</p>
          </section>
        )}

        {actionsEnabled && uiPhase === 'submitted' && (
          <section className="border-b border-[#DDE7E8] py-7 text-center">
            <h2 className="text-xl font-semibold text-[#13334F]">Timesheet submitted.</h2>
            <p className="mt-2 text-sm text-[#607583]">The facility will review and approve it next.</p>
          </section>
        )}

        <section className="border-b border-[#DDE7E8] py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Where you’re working</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
              <div><p className="font-semibold text-[#13334F]">{shift.siteName}</p><p className="mt-1 text-sm text-[#607583]">{shift.streetAddress}, Portland</p></div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
              <div><p className="font-semibold text-[#13334F]">Supervisor: {shift.supervisorName ?? 'Site lead'}</p><a href={shift.sitePhone ? `tel:${shift.sitePhone.replace(/\D/g, '')}` : 'tel:5035551234'} className="mt-1 block text-sm font-semibold text-[#2F8E7A]">{shift.sitePhone ?? '(503) 555-1234'}</a></div>
            </div>
          </div>
        </section>

        <section className="py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Need help?</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link to="/worker/safety" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#F1CACA] px-5 text-sm font-semibold text-[#A93636] no-underline hover:bg-[#FFF7F7]"><AlertTriangle className="h-4 w-4" aria-hidden /> Report an issue</Link>
            <button type="button" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white hover:bg-[#0B243A]"><Phone className="h-4 w-4" aria-hidden /> Emergency support</button>
          </div>
        </section>

        {showClockOut && (
          <div className="sticky bottom-0 -mx-4 border-t border-[#DDE7E8] bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
            <button
              type="button"
              disabled={isPending(`clock-out-${shiftId}`) || (isSupabase && !summary?.canClockOut)}
              onClick={async () => {
                const r = await run(`clock-out-${shiftId}`, () => clockOutShift(shiftId));
                if (r.ok) { toast.success(r.data.message); afterSuccess(isSupabase, reload, setPhase, 'clocked_out'); } else toast.error(r.error.message);
              }}
              className="w-full rounded-xl bg-[#13334F] px-6 py-4 text-sm font-semibold text-white hover:bg-[#0B243A] disabled:opacity-60"
            >
              {isPending(`clock-out-${shiftId}`) ? 'Clocking out…' : 'Clock out'}
            </button>
          </div>
        )}

        {showTimesheet && (
          <div className="sticky bottom-0 -mx-4 border-t border-[#DDE7E8] bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
            <button
              type="button"
              disabled={uiPhase === 'submitted' || isPending(`timesheet-${shiftId}`) || (isSupabase && !summary?.canSubmitTimesheet)}
              onClick={async () => {
                const r = await run(`timesheet-${shiftId}`, () => submitTimesheet(shiftId));
                if (r.ok) { toast.success(r.data.message); afterSuccess(isSupabase, reload, setPhase, 'submitted'); } else toast.error(r.error.message);
              }}
              className="w-full rounded-xl bg-[#53B59F] px-6 py-4 text-sm font-semibold text-white hover:bg-[#2F8E7A] disabled:opacity-60"
            >
              {uiPhase === 'submitted' ? 'Submitted' : isPending(`timesheet-${shiftId}`) ? 'Submitting…' : 'Submit timesheet'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
