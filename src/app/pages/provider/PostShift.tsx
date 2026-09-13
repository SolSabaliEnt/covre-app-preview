import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { createProviderShift, listProviderSites } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

const ROLES = ['CNA', 'DSP', 'LPN', 'RN', 'Medication Aide', 'Behavioral Health Tech'] as const;

/** Maps PostShift labels to seeded `credentials` ids (see supabase/seed.sql). */
const CREDENTIAL_OPTIONS = [
  { label: 'CNA License', credentialId: '10000000-0000-4000-8000-000000000003' },
  { label: 'CPR/BLS', credentialId: '10000000-0000-4000-8000-000000000001' },
  { label: 'Background Check', credentialId: '10000000-0000-4000-8000-000000000002' },
  { label: 'TB Test', credentialId: '10000000-0000-4000-8000-000000000005' },
  { label: 'Medication Training', credentialId: '10000000-0000-4000-8000-000000000004' },
] as const;

function combineDateAndTime(date: string, time: string): string | null {
  if (!date.trim() || !time.trim()) return null;
  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export default function PostShift() {
  const navigate = useNavigate();
  const { data: careSites, loading, error } = useAsyncResource(() => listProviderSites(), []);

  const [siteId, setSiteId] = useState('');
  const [role, setRole] = useState<string>(ROLES[0]);
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedCredentials, setSelectedCredentials] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    if (careSites && careSites.length > 0 && !siteId) {
      setSiteId(careSites[0].id);
    }
  }, [careSites, siteId]);

  const hasSites = Boolean(careSites && careSites.length > 0);
  const selectedSite = careSites?.find(site => site.id === siteId);
  const selectedCredentialLabels = CREDENTIAL_OPTIONS.filter(option =>
    selectedCredentials.has(option.credentialId),
  ).map(option => option.label);

  const toggleCredential = (credentialId: string) => {
    setSelectedCredentials(prev => {
      const next = new Set(prev);
      if (next.has(credentialId)) next.delete(credentialId);
      else next.add(credentialId);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!hasSites || !siteId) {
      toast.error('Add a care site before posting a shift.');
      return;
    }
    if (!role.trim()) {
      toast.error('Select a role for this shift.');
      return;
    }

    const startsAt = combineDateAndTime(shiftDate, startTime);
    const endsAt = combineDateAndTime(shiftDate, endTime);
    if (!startsAt || !endsAt) {
      toast.error('Enter a valid date and start/end times.');
      return;
    }

    const rate = Number.parseFloat(hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error('Enter a valid provider bill rate.');
      return;
    }

    setSaving(true);
    const res = await createProviderShift({
      siteId,
      title: `${role} shift`,
      role,
      startsAt,
      endsAt,
      hourlyRate: rate,
      requiredCredentialIds:
        selectedCredentials.size > 0 ? [...selectedCredentials] : undefined,
      notes: notes.trim() || undefined,
    });
    setSaving(false);

    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }

    toast.success(res.data.message);
    setPosted(true);
  };

  if (posted) {
    return (
      <div className="min-h-full w-full overflow-x-hidden bg-white text-[#10283D]">
        <div className="bg-[#13334F] px-5 py-12 text-white sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#53B59F]">
              <CheckCircle2 className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#9FCFC4]">Shift posted</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Coverage is now open.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              Covre can now surface qualified workers against the site, role, timing, and credential requirements you entered.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
          <div className="divide-y divide-[#DDE7E8] border-y border-[#DDE7E8]">
            <SummaryLine label="Site" value={selectedSite?.name || 'Care site'} />
            <SummaryLine label="Role" value={role} />
            <SummaryLine label="When" value={[shiftDate, startTime && endTime ? `${startTime}–${endTime}` : ''].filter(Boolean).join(' · ')} />
            <SummaryLine label="Bill rate" value={hourlyRate ? `$${hourlyRate}/hr` : 'Set'} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/provider/shifts"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#0B243A]"
            >
              Review coverage
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => {
                setPosted(false);
                setShiftDate('');
                setStartTime('');
                setEndTime('');
                setHourlyRate('');
                setSelectedCredentials(new Set());
                setNotes('');
              }}
              className="min-h-12 flex-1 rounded-xl border border-[#DDE7E8] bg-white px-5 text-sm font-semibold text-[#13334F] transition-colors hover:bg-[#F7FAFA]"
            >
              Post another shift
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full overflow-x-hidden bg-white text-[#10283D]">
      <div className="border-b border-[#244965] bg-[#13334F] px-5 py-8 text-white sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => navigate('/provider')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Dashboard
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9FCFC4]">New coverage request</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">What needs coverage?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/68">
            Put the real shift details in once. Covre uses them to show workers what they need to know before they apply.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-0 px-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <main className="py-8 sm:py-10">
          {!loading && !error && careSites && careSites.length === 0 ? (
            <div className="border-y border-[#DDE7E8] py-10">
              <p className="text-sm font-semibold text-[#13334F]">Add a care site first</p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#607583]">
                Every Covre shift stays connected to a specific site so workers can see the setting, expectations, and location context.
              </p>
              <Link
                to="/provider/sites/new"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#2F8E7A]"
              >
                Add care site
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FormSection number="01" title="Place and role" description="Start with where the work happens and who the shift needs.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Care site" icon={<Building2 className="h-4 w-4" />}>
                    <select
                      id="post-shift-site"
                      required
                      disabled={loading || saving || !hasSites}
                      value={siteId}
                      onChange={e => setSiteId(e.target.value)}
                      className={inputClass}
                    >
                      {loading ? (
                        <option value="">Loading sites…</option>
                      ) : error ? (
                        <option value="">Unable to load sites</option>
                      ) : (
                        careSites?.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="mt-2 text-xs text-[#607583]">
                      Missing a site?{' '}
                      <Link to="/provider/sites/new" className="font-semibold text-[#2F8E7A] hover:underline">
                        Add it here
                      </Link>
                      .
                    </p>
                    {error ? <p className="mt-2 text-xs text-[#C45C4A]">{error.message}</p> : null}
                  </Field>

                  <Field label="Role">
                    <select
                      id="post-shift-role"
                      required
                      disabled={saving}
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className={inputClass}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </FormSection>

              <FormSection number="02" title="When" description="Give workers the full timing before they decide.">
                <div className="grid gap-5 sm:grid-cols-[1fr_1.25fr]">
                  <Field label="Date" icon={<Calendar className="h-4 w-4" />}>
                    <input
                      id="post-shift-date"
                      type="date"
                      required
                      disabled={saving}
                      value={shiftDate}
                      onChange={e => setShiftDate(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Start and end time">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        required
                        disabled={saving}
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        aria-label="Start time"
                        className={inputClass}
                      />
                      <input
                        type="time"
                        required
                        disabled={saving}
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        aria-label="End time"
                        className={inputClass}
                      />
                    </div>
                  </Field>
                </div>
              </FormSection>

              <FormSection number="03" title="Rate" description="Set the facility bill rate for this shift.">
                <div className="max-w-sm">
                  <Field label="Provider bill rate (per hour)" icon={<DollarSign className="h-4 w-4" />}>
                    <input
                      id="post-shift-rate"
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      disabled={saving}
                      value={hourlyRate}
                      onChange={e => setHourlyRate(e.target.value)}
                      placeholder="28.00"
                      className={inputClass}
                    />
                  </Field>
                  <p className="mt-2 text-xs leading-5 text-[#607583]">
                    Worker pay is controlled separately before earnings are generated.
                  </p>
                </div>
              </FormSection>

              <FormSection number="04" title="Readiness" description="Only ask for the credentials this shift actually requires.">
                <div className="divide-y divide-[#DDE7E8] border-y border-[#DDE7E8]">
                  {CREDENTIAL_OPTIONS.map(({ label, credentialId }) => {
                    const checked = selectedCredentials.has(credentialId);
                    return (
                      <label key={credentialId} className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
                        <span className="flex items-center gap-3 text-sm font-medium text-[#13334F]">
                          <Shield className={`h-4 w-4 ${checked ? 'text-[#2F8E7A]' : 'text-[#9AAAB3]'}`} aria-hidden />
                          {label}
                        </span>
                        <input
                          type="checkbox"
                          disabled={saving}
                          checked={checked}
                          onChange={() => toggleCredential(credentialId)}
                          className="h-5 w-5 shrink-0 accent-[#53B59F]"
                        />
                      </label>
                    );
                  })}
                </div>
              </FormSection>

              <FormSection number="05" title="What should they know?" description="Use this for the responsibilities and site context that make a worker arrive ready.">
                <textarea
                  id="post-shift-notes"
                  rows={5}
                  disabled={saving}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Medication pass, resident needs, handoff expectations, arrival notes…"
                  className="w-full resize-none border-0 border-b border-[#BFCED5] bg-transparent px-0 py-3 text-base text-[#13334F] outline-none transition-colors placeholder:text-[#9AAAB3] focus:border-[#53B59F]"
                />
              </FormSection>

              <div className="flex flex-col gap-3 border-t border-[#DDE7E8] py-8 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => navigate('/provider')}
                  className="min-h-12 px-2 text-sm font-semibold text-[#607583] transition-colors hover:text-[#13334F] disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || loading || !hasSites}
                  className="min-h-12 rounded-xl bg-[#53B59F] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A] disabled:opacity-70"
                >
                  {saving ? 'Posting…' : 'Open coverage'}
                </button>
              </div>
            </form>
          )}
        </main>

        <aside className="border-t border-[#DDE7E8] py-8 lg:sticky lg:top-0 lg:h-fit lg:border-l lg:border-t-0 lg:py-10 lg:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Coverage brief</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-[#13334F]">
            {role || 'Role'}
          </h2>
          <p className="mt-1 text-sm text-[#607583]">{selectedSite?.name || 'Choose a care site'}</p>

          <div className="mt-7 divide-y divide-[#DDE7E8] border-y border-[#DDE7E8]">
            <SummaryLine label="Date" value={shiftDate || 'Not set'} compact />
            <SummaryLine label="Time" value={startTime && endTime ? `${startTime}–${endTime}` : 'Not set'} compact />
            <SummaryLine label="Bill rate" value={hourlyRate ? `$${hourlyRate}/hr` : 'Not set'} compact />
            <SummaryLine label="Credentials" value={selectedCredentialLabels.length ? `${selectedCredentialLabels.length} required` : 'None selected'} compact />
          </div>

          <div className="mt-7">
            <p className="text-sm font-semibold text-[#13334F]">Before this goes live</p>
            <div className="mt-3 space-y-3 text-sm text-[#607583]">
              <ReadinessLine ready={Boolean(siteId)} text="Care site selected" />
              <ReadinessLine ready={Boolean(shiftDate && startTime && endTime)} text="Timing is clear" />
              <ReadinessLine ready={Boolean(hourlyRate)} text="Bill rate is set" />
              <ReadinessLine ready={Boolean(notes.trim())} text="Shift context added" optional />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputClass =
  'min-h-12 w-full border-0 border-b border-[#BFCED5] bg-transparent px-0 py-3 text-base text-[#13334F] outline-none transition-colors focus:border-[#53B59F] disabled:opacity-70';

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-t border-[#DDE7E8] py-7 first:border-t-0 first:pt-0 sm:grid-cols-[120px_1fr] sm:gap-8 sm:py-9">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-[#9AAAB3]">{number}</p>
        <h2 className="mt-2 text-lg font-semibold text-[#13334F]">{title}</h2>
      </div>
      <div>
        <p className="mb-5 max-w-xl text-sm leading-6 text-[#607583]">{description}</p>
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#607583]">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryLine({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${compact ? 'py-3.5' : 'py-4'}`}>
      <span className="text-sm text-[#607583]">{label}</span>
      <span className="max-w-[62%] text-right text-sm font-semibold text-[#13334F]">{value || '—'}</span>
    </div>
  );
}

function ReadinessLine({ ready, text, optional = false }: { ready: boolean; text: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`h-2 w-2 rounded-full ${ready ? 'bg-[#53B59F]' : 'bg-[#DDE7E8]'}`} />
      <span>{text}</span>
      {optional ? <span className="text-xs text-[#9AAAB3]">optional</span> : null}
    </div>
  );
}
