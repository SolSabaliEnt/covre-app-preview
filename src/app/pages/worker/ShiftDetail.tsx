import type { CareSite, Shift } from '../../data/types';
import { StatusBadge } from '../../components/StatusBadge';
import { Link, useNavigate, useParams } from 'react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarPlus,
  Car,
  ChevronLeft,
  MapPin,
  MessageCircle,
  Pill,
  Shield,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  addShiftToCalendar,
  askShiftQuestion,
  claimShift,
  getWorkerBookingForShift,
  getWorkerContinuitySummary,
  getWorkerShiftPage,
  listWorkerShiftRequests,
  trackContinuityEvent,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useWorkerAction } from '../../hooks/useWorkerAction';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { displayWorkerPay, workerPayRateLabel } from '../../lib/workerRateCents';
import { getSiteContinuity } from '../../lib/workerContinuity';

function LoadingBlock() {
  return <StateBlock text="Loading shift…" />;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <StateBlock text={message} action="Retry" onAction={onRetry} />;
}

function NotFoundCard({ supabaseMode }: { supabaseMode?: boolean }) {
  return (
    <StateBlock
      text={supabaseMode ? 'This shift is no longer available.' : "This shift isn't in the preview dataset."}
      action="Back to shifts"
      href="/worker/shifts"
    />
  );
}

function ShiftDetailView({
  shift,
  site,
  shiftId,
  supabaseMode,
}: {
  shift: Shift;
  site: CareSite | undefined;
  shiftId: string;
  supabaseMode: boolean;
}) {
  const navigate = useNavigate();
  const { run, isPending } = useWorkerAction();
  const familiarDetailTracked = useRef(false);
  const { data: requests } = useAsyncResource(
    () =>
      supabaseMode
        ? listWorkerShiftRequests()
        : Promise.resolve({ ok: true as const, data: [] }),
    [supabaseMode],
  );
  const { data: booking } = useAsyncResource(
    () =>
      supabaseMode
        ? getWorkerBookingForShift(shiftId)
        : Promise.resolve({ ok: true as const, data: null }),
    [supabaseMode, shiftId],
  );
  const { data: continuity } = useAsyncResource(() => getWorkerContinuitySummary(), []);
  const siteHistory = continuity ? getSiteContinuity(continuity, shift.siteId) : undefined;

  useEffect(() => {
    if (!siteHistory || familiarDetailTracked.current) return;
    familiarDetailTracked.current = true;
    trackContinuityEvent('worker_familiar_shift_detail_view', {
      actor: 'worker',
      shiftId,
      siteId: shift.siteId,
      source: 'canonical_continuity',
      completedShiftsHere: siteHistory.completedShifts,
    });
  }, [shift.siteId, shiftId, siteHistory]);

  const alreadyApplied = useMemo(
    () =>
      Boolean(
        requests?.some(
          r => r.shiftId === shiftId && (r.status === 'requested' || r.status === 'accepted'),
        ),
      ),
    [requests, shiftId],
  );

  const [claimed, setClaimed] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [showApplicationSent, setShowApplicationSent] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);

  useEffect(() => {
    if (alreadyApplied) setApplied(true);
  }, [alreadyApplied]);

  const addressLine = site?.address ?? shift.streetAddress;
  const isBooked = Boolean(supabaseMode && booking);
  const isApplied = supabaseMode ? applied || isBooked : claimed;

  return (
    <div className="min-h-[100svh] w-full overflow-x-hidden bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[#10283D]">
      <header className="bg-[#13334F] px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] text-white sm:px-6 sm:pb-10">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-7 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/15"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9FCFC4]">Shift opportunity</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">{shift.roleTitle}</h1>
          <p className="mt-2 text-base text-white/68">{shift.facilitySettingLabel} · {shift.dateLabel}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {shift.workerShiftReadiness ? (
              <StatusBadge variant={shift.workerShiftReadiness.isReady ? 'covered' : 'pending'}>
                {shift.workerShiftReadiness.isReady ? 'Ready' : 'Needs credentials'}
              </StatusBadge>
            ) : (
              <StatusBadge variant="covered">
                {shift.workerFeedCardStatus === 'preferred' ? 'Preferred' : 'Ready match'}
              </StatusBadge>
            )}
            {siteHistory ? <StatusBadge variant="preferred">Worked here {siteHistory.completedShifts}×</StatusBadge> : null}
            {isBooked ? <StatusBadge variant="covered">Booked</StatusBadge> : null}
            {!isBooked && isApplied ? <StatusBadge variant="pending">Applied</StatusBadge> : null}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-6">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-white/45">{workerPayRateLabel(shift, supabaseMode)}</p>
              <p className="mt-1 text-3xl font-semibold">{displayWorkerPay(shift)}</p>
              <p className="mt-1 text-sm font-medium text-[#75D3BE]">Est. {shift.estimatedTotalDisplay} total</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-white/45">Shift time</p>
              <p className="mt-1 text-lg font-semibold">{shift.timeRange}</p>
              <p className="mt-1 text-sm text-white/55">8 hours</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 sm:px-6">
        <section className="border-b border-[#DDE7E8] py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Know before you go</p>
          {siteHistory ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-[110px_1fr] sm:items-end">
              <div>
                <p className="text-4xl font-semibold text-[#13334F]">{siteHistory.completedShifts}</p>
                <p className="mt-1 text-xs text-[#607583]">approved {siteHistory.completedShifts === 1 ? 'shift' : 'shifts'} here</p>
              </div>
              <div>
                {siteHistory.lastWorkedLabel ? (
                  <p className="text-sm font-semibold text-[#13334F]">Last approved work {siteHistory.lastWorkedLabel}</p>
                ) : null}
                <p className="mt-1 text-sm leading-6 text-[#607583]">You already know this place. Covre is carrying that familiarity forward.</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#607583]">
              First approved shift here. Review the site details, requirements, and expectations before you apply.
            </p>
          )}
        </section>

        {supabaseMode && booking ? (
          <section className="border-b border-[#DDE7E8] py-6 text-sm text-[#607583]">
            <p className="font-semibold text-[#13334F]">You are booked for this shift.</p>
            <p className="mt-1">Your approved-work continuity updates after the timesheet is approved.</p>
          </section>
        ) : null}

        {supabaseMode && !booking ? (
          <section className="border-b border-[#DDE7E8] py-6 text-sm leading-6 text-[#607583]">
            <p>Applying expresses interest. Provider review and assignment happen after that.</p>
            {shift.workerShiftReadiness ? <p className="mt-2 font-semibold text-[#13334F]">{shift.workerShiftReadiness.statusLabel}</p> : null}
            {!shift.workerShiftReadiness?.isReady && shift.workerShiftReadiness?.missingCredentialNames.length ? (
              <p className="mt-2 text-xs text-[#9B6419]">
                Missing something? Update your{' '}
                <Link to="/worker/credentials" className="font-semibold text-[#2F8E7A] hover:underline">Credential Passport</Link>.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="py-7">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#13334F]">Shift details</h2>
          <div className="mt-5 divide-y divide-[#DDE7E8] border-y border-[#DDE7E8]">
            <DetailRow icon={<MapPin className="h-5 w-5" />} label={`${shift.distanceMiles} away`} text={`${shift.siteName}${addressLine ? ` · ${addressLine}` : ''}`} />
            {shift.soloShiftNote ? <DetailRow icon={<Users className="h-5 w-5" />} label="Solo shift" text={shift.soloShiftNote} /> : null}
            {shift.medicationNote ? <DetailRow icon={<Pill className="h-5 w-5" />} label="Medication pass required" text={shift.medicationNote} /> : null}
            {shift.parkingNote ? <DetailRow icon={<Car className="h-5 w-5" />} label="Parking" text={shift.parkingNote} /> : null}
          </div>
        </section>

        <section className="border-t border-[#DDE7E8] py-7">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#13334F]">Required credentials</h2>
          <div className="mt-4 divide-y divide-[#DDE7E8] border-y border-[#DDE7E8]">
            {shift.requiredCredentialsDisplayed.map(c => (
              <div key={c} className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-sm font-medium text-[#13334F]">{c}</span>
                <Shield className="h-4 w-4 text-[#2F8E7A]" aria-hidden />
              </div>
            ))}
          </div>
        </section>

        {shift.duties.length > 0 ? (
          <section className="border-t border-[#DDE7E8] py-7">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#13334F]">What the shift needs</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#607583]">
              {shift.duties.map(line => <li key={line}>{line}</li>)}
            </ul>
          </section>
        ) : null}

        {shift.cancellationNote ? (
          <section className="border-t border-[#DDE7E8] py-7">
            <div className="flex items-start gap-3 text-[#9B6419]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Cancellation policy</p>
                <p className="mt-1 text-sm leading-6">{shift.cancellationNote}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-t border-[#DDE7E8] py-7">
          {showApplicationSent && supabaseMode ? (
            <p className="mb-4 text-sm font-semibold text-[#257665]">Application sent. Provider review is next.</p>
          ) : null}

          {showClaimSuccess && !supabaseMode ? (
            <div className="mb-5 border-b border-[#DDE7E8] pb-5">
              <p className="text-sm font-semibold text-[#257665]">Your shift is covered.</p>
              <div className="mt-3 flex gap-3">
                <Link to="/worker/bookings" className="text-sm font-semibold text-[#13334F] hover:underline">View bookings</Link>
                <Link to="/worker/active-shift" className="text-sm font-semibold text-[#13334F] hover:underline">Active shift</Link>
              </div>
            </div>
          ) : null}

          {supabaseMode && !isBooked && shift.workerShiftReadiness && !shift.workerShiftReadiness.isReady ? (
            <p className="mb-3 text-xs leading-relaxed text-[#9B6419]">You can apply, but missing credentials may affect eligibility.</p>
          ) : null}

          {!isBooked ? (
            <button
              type="button"
              disabled={isApplied || isPending(`claim-${shiftId}`)}
              onClick={async e => {
                e.stopPropagation();
                const r = await run(`claim-${shiftId}`, () => claimShift(shiftId));
                if (r.ok) {
                  toast.success(r.data.message);
                  if (siteHistory) {
                    trackContinuityEvent('worker_familiar_shift_application', {
                      actor: 'worker',
                      shiftId,
                      siteId: shift.siteId,
                      source: supabaseMode ? 'canonical_application' : 'canonical_claim',
                      completedShiftsHere: siteHistory.completedShifts,
                    });
                  }
                  if (supabaseMode) {
                    setApplied(true);
                    if (r.data.message === 'Application sent') setShowApplicationSent(true);
                  } else {
                    setClaimed(true);
                    setShowClaimSuccess(true);
                  }
                } else toast.error(r.error.message);
              }}
              className="min-h-13 w-full rounded-xl bg-[#53B59F] px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-[#2F8E7A] disabled:opacity-60"
            >
              {supabaseMode ? (isApplied ? 'Applied' : 'Apply for this shift') : claimed ? 'Claimed' : 'Claim shift'}
            </button>
          ) : (
            <Link to="/worker/bookings" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white no-underline">
              View in bookings
            </Link>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={questionSent || isPending(`ask-${shiftId}`)}
              onClick={async e => {
                e.stopPropagation();
                const r = await run(`ask-${shiftId}`, () => askShiftQuestion(shiftId, 'Question from shift detail'));
                if (r.ok) {
                  toast.success(r.data.message);
                  setQuestionSent(true);
                } else toast.error(r.error.message);
              }}
              className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#607583] transition-colors hover:text-[#13334F] disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              {questionSent ? 'Question sent' : 'Ask a question'}
            </button>
            <button
              type="button"
              disabled={calendarAdded || isPending(`cal-${shiftId}`)}
              onClick={async e => {
                e.stopPropagation();
                const r = await run(`cal-${shiftId}`, () => addShiftToCalendar(shiftId));
                if (r.ok) {
                  toast.success(r.data.message);
                  setCalendarAdded(true);
                } else toast.error(r.error.message);
              }}
              className="flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[#607583] transition-colors hover:text-[#13334F] disabled:opacity-50"
            >
              <CalendarPlus className="h-4 w-4" />
              {calendarAdded ? 'Added' : 'Add to calendar'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function DetailRow({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) {
  return (
    <div className="grid grid-cols-[28px_1fr] gap-3 py-4">
      <div className="text-[#607583]">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-[#13334F]">{label}</p>
        <p className="mt-1 text-sm leading-6 text-[#607583]">{text}</p>
      </div>
    </div>
  );
}

function StateBlock({ text, action, onAction, href }: { text: string; action?: string; onAction?: () => void; href?: string }) {
  return (
    <div className="min-h-[100svh] bg-[#F7FAFA] px-5 py-12 text-center sm:px-6">
      <div className="mx-auto max-w-md border-y border-[#DDE7E8] py-10">
        <p className="text-sm font-semibold text-[#13334F]">{text}</p>
        {action && href ? (
          <Link to={href} className="mt-5 inline-flex rounded-xl bg-[#13334F] px-5 py-2.5 text-sm font-semibold text-white no-underline">{action}</Link>
        ) : null}
        {action && onAction ? (
          <button onClick={onAction} className="mt-5 rounded-xl bg-[#13334F] px-5 py-2.5 text-sm font-semibold text-white">{action}</button>
        ) : null}
      </div>
    </div>
  );
}

export default function ShiftDetail() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { id } = useParams();
  const { data, error, loading, reload } = useAsyncResource(
    () => (!id ? Promise.resolve({ ok: true as const, data: null }) : getWorkerShiftPage(id)),
    [id],
  );

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error.message} onRetry={reload} />;
  if (!data || !id) return <NotFoundCard supabaseMode={supabaseMode} />;

  const { shift, site } = data;
  return <ShiftDetailView shift={shift} site={site} shiftId={id} supabaseMode={supabaseMode} />;
}
