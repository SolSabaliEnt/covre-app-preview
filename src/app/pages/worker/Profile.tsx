import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, Check, MapPin, UserRound, X } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  getCurrentWorkerAvatar,
  getCurrentWorkerProfile,
  removeCurrentWorkerAvatar,
  saveCurrentWorkerProfile,
  uploadCurrentWorkerAvatar,
} from '../../services';
import type { WorkerProfileDraft } from '../../services/types';

const roles = ['Caregiver', 'DSP', 'CNA', 'Medication Aide', 'LPN', 'RN', 'Behavioral Health Tech', 'Home Health Aide', 'Personal Care Aide'];
const experienceLevels = ['New to care', '1–2 years', '3–5 years', '5+ years'];

export default function WorkerProfile() {
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>();
  const [mediaBusy, setMediaBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [profileRes, avatarRes] = await Promise.all([
        getCurrentWorkerProfile(),
        getCurrentWorkerAvatar(),
      ]);
      if (cancelled) return;
      if (profileRes.ok) {
        setFullName(profileRes.data.fullName ?? '');
        setPhone(profileRes.data.phone ?? '');
        setCity(profileRes.data.city ?? '');
        setState(profileRes.data.state ?? '');
        setSelectedRoles(profileRes.data.roles ?? []);
        setExperienceLevel(profileRes.data.experienceLevel ?? '');
        setAvailability(profileRes.data.availability ?? '');
      } else {
        toast.error(profileRes.error.message);
      }
      if (avatarRes.ok) setProfilePhoto(avatarRes.data.url);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const initials = useMemo(() => fullName.split(/\s+/).filter(Boolean).map(part => part[0]?.toUpperCase()).join('').slice(0, 2) || 'CW', [fullName]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(item => item !== role) : [...prev, role]);
  };

  const handlePhoto = async (file?: File) => {
    if (!file || mediaBusy) return;
    setMediaBusy(true);
    const result = await uploadCurrentWorkerAvatar(file);
    setMediaBusy(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setProfilePhoto(result.data.url);
    toast.success(result.data.message);
  };

  const handleRemovePhoto = async () => {
    if (mediaBusy) return;
    setMediaBusy(true);
    const result = await removeCurrentWorkerAvatar();
    setMediaBusy(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setProfilePhoto(undefined);
    toast.success(result.data.message);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error('Choose at least one care role.');
      return;
    }

    const payload: WorkerProfileDraft = {
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      roles: selectedRoles,
      experienceLevel: experienceLevel || undefined,
      availability: availability.trim() || undefined,
    };

    setSaving(true);
    const res = await saveCurrentWorkerProfile(payload);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success('Profile saved');
  };

  const inputClass = 'min-h-12 w-full border-b border-[#BFCED4] bg-transparent px-0 text-base text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]';

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
        <Link to="/worker/account" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Account
        </Link>

        <header className="mt-3 border-b border-[#DDE7E8] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Care worker profile</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Your professional profile.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">This is the identity providers see alongside your credentials, reliability, and work history.</p>
        </header>

        <section className="border-b border-[#DDE7E8] py-7">
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#E6F6F2]">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Care worker profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-[#257665]">{initials}</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-[#13334F]">Profile photo</h2>
              <p className="mt-1 text-sm leading-5 text-[#607583]">Use a clear, recent headshot. This helps facilities recognize who is arriving for care.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#13334F] px-4 text-sm font-semibold text-white hover:bg-[#0B243A] ${mediaBusy ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                  <Camera className="h-4 w-4" aria-hidden /> {mediaBusy ? 'Uploading…' : profilePhoto ? 'Change photo' : 'Add photo'}
                  <input disabled={mediaBusy} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => void handlePhoto(e.target.files?.[0])} />
                </label>
                {profilePhoto ? (
                  <button disabled={mediaBusy} type="button" onClick={() => void handleRemovePhoto()} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#A93636] disabled:opacity-60">
                    <X className="h-4 w-4" aria-hidden /> Remove
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-[#9AAAB3]">JPG, PNG, or WebP · 3 MB max</p>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="py-10 text-center text-sm text-[#607583]">Loading your profile…</p>
        ) : (
          <>
            <section className="border-b border-[#DDE7E8] py-7">
              <div className="mb-5 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#2F8E7A]" aria-hidden />
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#607583]">Identity</h2>
              </div>
              <div className="space-y-6">
                <div><label className="text-sm font-semibold text-[#13334F]">Full name</label><input value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} autoComplete="name" /></div>
                <div><label className="text-sm font-semibold text-[#13334F]">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} autoComplete="tel" /></div>
                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#13334F]"><MapPin className="h-4 w-4 text-[#2F8E7A]" aria-hidden />Home area</div>
                  <div className="grid grid-cols-2 gap-5"><input value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={inputClass} /><input value={state} onChange={e => setState(e.target.value)} placeholder="State" className={inputClass} /></div>
                </div>
              </div>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Roles</p>
              <div className="mt-3 border-t border-[#BFCED4]">
                {roles.map(role => {
                  const selected = selectedRoles.includes(role);
                  return (
                    <button key={role} type="button" onClick={() => toggleRole(role)} className="flex min-h-14 w-full items-center justify-between border-b border-[#DDE7E8] text-left">
                      <span className={selected ? 'font-semibold text-[#13334F]' : 'text-[#466170]'}>{role}</span>
                      <span className={selected ? 'flex h-6 w-6 items-center justify-center rounded-full bg-[#53B59F] text-white' : 'h-6 w-6 rounded-full border border-[#BFCED4]'}>{selected ? <Check className="h-4 w-4" aria-hidden /> : null}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="py-7">
              <div className="space-y-6">
                <div><label className="text-sm font-semibold text-[#13334F]">Experience</label><select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={`${inputClass} appearance-none`}><option value="">Choose experience</option>{experienceLevels.map(level => <option key={level} value={level}>{level}</option>)}</select></div>
                <div><label className="text-sm font-semibold text-[#13334F]">Availability</label><input value={availability} onChange={e => setAvailability(e.target.value)} placeholder="Weekdays, evenings, overnights…" className={inputClass} /></div>
              </div>
            </section>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#DDE7E8] bg-white/96 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-2xl">
          <button type="button" disabled={saving || loading} onClick={() => void handleSave()} className="min-h-12 w-full rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A] disabled:opacity-60">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
