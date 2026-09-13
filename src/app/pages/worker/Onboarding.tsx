import { Link, useNavigate } from 'react-router';
import { Check, Circle, MapPin, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import {
  completeWorkerProfileOnboarding,
  getCurrentWorkerProfile,
  saveCurrentWorkerProfile,
} from '../../services';
import type { WorkerProfileDraft } from '../../services/types';

const roles = [
  'Caregiver',
  'DSP',
  'CNA',
  'Medication Aide',
  'LPN',
  'RN',
  'Behavioral Health Tech',
  'Home Health Aide',
  'Personal Care Aide',
];

const experienceLevels = ['New to care', '1–2 years', '3–5 years', '5+ years'];

function RoleList({
  selectedRoles,
  toggleRole,
  disabled = false,
}: {
  selectedRoles: string[];
  toggleRole: (role: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="border-t border-[#BFCED4]">
      {roles.map(role => {
        const selected = selectedRoles.includes(role);
        return (
          <button
            key={role}
            type="button"
            disabled={disabled}
            onClick={() => toggleRole(role)}
            className="flex min-h-14 w-full items-center justify-between gap-4 border-b border-[#DDE7E8] py-3.5 text-left transition-colors hover:bg-[#F7FAFA] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className={selected ? 'font-semibold text-[#13334F]' : 'font-medium text-[#466170]'}>{role}</span>
            <span
              className={selected
                ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#53B59F] text-white'
                : 'flex h-6 w-6 shrink-0 items-center justify-center text-[#B5C3CA]'}
              aria-hidden
            >
              {selected ? <Check className="h-4 w-4" /> : <Circle className="h-5 w-5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MockOnboarding() {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const toggleRole = (role: string) => {
    setSelectedRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]));
  };

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-6 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Worker setup · 1 of 6</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">What kind of care work do you do?</h1>
          <p className="mt-2 text-sm leading-6 text-[#607583]">Pick every role that fits. We’ll use this to show relevant shifts first.</p>
        </header>

        <section className="py-7">
          <RoleList selectedRoles={selectedRoles} toggleRole={toggleRole} />
          <p className="mt-3 text-xs text-[#9AAAB3]">You can update this later from your profile.</p>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#DDE7E8] bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/worker/credentials"
            aria-disabled={selectedRoles.length === 0}
            onClick={e => {
              if (selectedRoles.length === 0) e.preventDefault();
            }}
            className={selectedRoles.length > 0
              ? 'flex min-h-12 w-full items-center justify-center rounded-xl bg-[#53B59F] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A]'
              : 'pointer-events-none flex min-h-12 w-full items-center justify-center rounded-xl bg-[#EEF3F4] px-6 text-sm font-semibold text-[#9AAAB3]'}
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

function SupabaseOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await getCurrentWorkerProfile();
      if (cancelled) return;
      if (res.ok) {
        setFullName(res.data.fullName);
        setPhone(res.data.phone ?? '');
        setCity(res.data.city ?? '');
        setState(res.data.state ?? '');
        setSelectedRoles(res.data.roles ?? []);
        setExperienceLevel(res.data.experienceLevel ?? '');
        if (res.data.onboardingComplete) {
          navigate('/worker/shifts', { replace: true });
          return;
        }
      } else if (res.error.code !== 'not_authenticated') {
        toast.error(res.error.message);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => (prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]));
  };

  const buildDraft = (): WorkerProfileDraft => ({
    fullName,
    phone: phone.trim() || undefined,
    city: city.trim() || undefined,
    state: state.trim() || undefined,
    roles: selectedRoles,
    experienceLevel: experienceLevel || undefined,
    availability: availability.trim() || undefined,
  });

  const handleSave = async () => {
    setSubmitting(true);
    const res = await saveCurrentWorkerProfile(buildDraft());
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(res.data.message);
  };

  const handleComplete = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error('Select at least one role you are interested in.');
      return;
    }
    setSubmitting(true);
    const res = await completeWorkerProfileOnboarding(buildDraft());
    setSubmitting(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(res.data.message);
    navigate('/worker/shifts', { replace: true });
  };

  const completionCount = useMemo(() => {
    let count = 0;
    if (fullName.trim()) count += 1;
    if (phone.trim()) count += 1;
    if (city.trim() || state.trim()) count += 1;
    if (selectedRoles.length) count += 1;
    if (experienceLevel) count += 1;
    if (availability.trim()) count += 1;
    return count;
  }, [fullName, phone, city, state, selectedRoles, experienceLevel, availability]);

  if (loading) {
    return <div className="flex min-h-[100svh] items-center justify-center bg-white px-4 text-sm text-[#607583]">Loading profile…</div>;
  }

  const inputClass = 'min-h-12 w-full border-b border-[#BFCED4] bg-transparent px-0 text-[#13334F] outline-none transition-colors placeholder:text-[#A5B3BA] focus:border-[#53B59F]';

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-36 pt-6 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Worker setup</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Build the profile facilities will see.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Enough detail to match you well, without turning setup into paperwork.</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold text-[#13334F]">{completionCount}/6</p>
              <p className="text-xs text-[#607583]">sections filled</p>
            </div>
          </div>
        </header>

        <form
          className="pb-4"
          onSubmit={e => {
            e.preventDefault();
            void handleComplete();
          }}
          noValidate
        >
          <section className="border-b border-[#DDE7E8] py-7">
            <div className="mb-5 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[#2F8E7A]" aria-hidden />
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#607583]">Your basics</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="worker-full-name" className="text-sm font-semibold text-[#13334F]">Full name</label>
                <input id="worker-full-name" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} disabled={submitting} className={inputClass} />
              </div>
              <div>
                <label htmlFor="worker-phone" className="text-sm font-semibold text-[#13334F]">Phone</label>
                <input id="worker-phone" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={submitting} className={inputClass} />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#13334F]"><MapPin className="h-4 w-4 text-[#2F8E7A]" aria-hidden />Home area</div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="worker-city" className="sr-only">City</label>
                    <input id="worker-city" type="text" autoComplete="address-level2" placeholder="City" value={city} onChange={e => setCity(e.target.value)} disabled={submitting} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="worker-state" className="sr-only">State</label>
                    <input id="worker-state" type="text" autoComplete="address-level1" placeholder="State" value={state} onChange={e => setState(e.target.value)} disabled={submitting} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#DDE7E8] py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">What you do</p>
            <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Select every role that fits.</h2>
            <p className="mt-1 text-sm text-[#607583]">These choices shape the shifts Covre surfaces first.</p>
            <div className="mt-5"><RoleList selectedRoles={selectedRoles} toggleRole={toggleRole} disabled={submitting} /></div>
          </section>

          <section className="border-b border-[#DDE7E8] py-7">
            <label htmlFor="worker-experience" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">Experience</label>
            <select id="worker-experience" value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} disabled={submitting} className={`${inputClass} mt-2 appearance-none`}>
              <option value="">Choose your level</option>
              {experienceLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </section>

          <section className="py-7">
            <label htmlFor="worker-availability" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">When you want to work</label>
            <input id="worker-availability" type="text" placeholder="Weekdays, overnights, weekends…" value={availability} onChange={e => setAvailability(e.target.value)} disabled={submitting} className={`${inputClass} mt-2`} />
            <p className="mt-2 text-xs leading-5 text-[#9AAAB3]">Keep this simple for now. Covre will use richer scheduling preferences as they come online.</p>
          </section>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#DDE7E8] bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button type="button" disabled={submitting} onClick={() => void handleSave()} className="min-h-12 flex-1 rounded-xl border border-[#DDE7E8] px-4 text-sm font-semibold text-[#13334F] hover:bg-[#F7FAFA] disabled:opacity-60">Save draft</button>
          <button type="button" disabled={submitting} onClick={() => void handleComplete()} className="min-h-12 flex-[1.4] rounded-xl bg-[#53B59F] px-4 text-sm font-semibold text-white hover:bg-[#2F8E7A] disabled:opacity-60">{submitting ? 'Saving…' : 'Finish profile'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Onboarding() {
  return isSupabaseBackendEnabled() ? <SupabaseOnboarding /> : <MockOnboarding />;
}
