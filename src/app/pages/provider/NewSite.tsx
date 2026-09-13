import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChevronLeft, MapPin } from 'lucide-react';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { createProviderSite, getCurrentProviderOrganization } from '../../services';

const SITE_TYPES = ['Group Home', 'Memory Care', 'Assisted Living', 'Skilled Nursing', 'Residential Care', 'Home Care'] as const;

type FieldErrors = { siteName?: string; siteType?: string };

function validateForm(siteName: string, siteType: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!siteName.trim()) errors.siteName = 'Please add a site name before continuing.';
  if (!siteType.trim()) errors.siteType = 'Please select a site type.';
  return errors;
}

export default function ProviderNewSite() {
  const navigate = useNavigate();
  const siteNameRef = useRef<HTMLInputElement>(null);
  const [siteName, setSiteName] = useState('');
  const [siteType, setSiteType] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [residentCount, setResidentCount] = useState('');
  const [primaryContact, setPrimaryContact] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [orientationNotes, setOrientationNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [orgReady, setOrgReady] = useState<boolean | null>(isSupabaseBackendEnabled() ? null : true);

  useEffect(() => {
    if (!isSupabaseBackendEnabled()) return;
    let cancelled = false;
    void (async () => {
      const res = await getCurrentProviderOrganization();
      if (!cancelled) setOrgReady(res.ok && Boolean(res.data?.providerId));
    })();
    return () => { cancelled = true; };
  }, []);

  const leavePage = useCallback(() => {
    navigate(orgReady === false ? '/provider' : '/provider/sites');
  }, [navigate, orgReady]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const errors = validateForm(siteName, siteType);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      toast.error(errors.siteName ?? errors.siteType);
      if (errors.siteName) siteNameRef.current?.focus();
      return;
    }
    if (orgReady === false) return toast.error('Finish workspace setup before adding a care site.');
    setSaving(true);
    const res = await createProviderSite({ siteName, siteType, address, city, state, residentCount, primaryContact, contactPhone, orientationNotes });
    setSaving(false);
    if (!res.ok) return toast.error(res.error.message);
    toast.success('Care site saved');
    navigate('/provider/sites', { replace: true });
  };

  if (orgReady === null) return <div className="flex min-h-full items-center justify-center bg-white px-4 py-12 text-sm text-[#607583]">Loading workspace…</div>;

  const inputClass = 'min-h-12 w-full border-b border-[#BFCED4] bg-transparent px-0 text-base text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]';

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-32 pt-5 sm:px-6">
        <button type="button" onClick={leavePage} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A]"><ChevronLeft className="h-4 w-4" />Back to sites</button>
        <header className="mt-3 border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Site setup</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Add care site</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Create the location once, then reuse its staffing rules, orientation context, and worker history across shifts.</p>
        </header>

        {orgReady === false ? <div className="border-b border-[#DDE7E8] py-5"><p className="font-semibold text-[#9B6419]">Workspace setup required</p><p className="mt-1 text-sm text-[#607583]">Finish provider setup before adding a care site.</p><Link to="/provider/onboarding" className="mt-3 inline-flex text-sm font-semibold text-[#2F8E7A]">Continue setup</Link></div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <section className="border-b border-[#DDE7E8] py-7">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Site identity</p>
            <div className="space-y-6">
              <label className="block"><span className="text-sm font-semibold text-[#13334F]">Site name</span><input ref={siteNameRef} value={siteName} onChange={e => { setSiteName(e.target.value); setFieldErrors(prev => ({ ...prev, siteName: undefined })); }} className={`${inputClass} ${fieldErrors.siteName ? 'border-[#D94A4A]' : ''}`} />{fieldErrors.siteName ? <p className="mt-1 text-sm text-[#D94A4A]">{fieldErrors.siteName}</p> : null}</label>
              <label className="block"><span className="text-sm font-semibold text-[#13334F]">Site type</span><select value={siteType} onChange={e => { setSiteType(e.target.value); setFieldErrors(prev => ({ ...prev, siteType: undefined })); }} className={`${inputClass} mt-1 appearance-none ${fieldErrors.siteType ? 'border-[#D94A4A]' : ''}`}><option value="">Select type</option>{SITE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}</select>{fieldErrors.siteType ? <p className="mt-1 text-sm text-[#D94A4A]">{fieldErrors.siteType}</p> : null}</label>
            </div>
          </section>

          <section className="border-b border-[#DDE7E8] py-7">
            <div className="mb-5 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#2F8E7A]" /><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Location</p></div>
            <div className="space-y-6"><label className="block"><span className="text-sm font-semibold text-[#13334F]">Address</span><input value={address} onChange={e => setAddress(e.target.value)} className={inputClass} /></label><div className="grid grid-cols-2 gap-5"><label><span className="text-sm font-semibold text-[#13334F]">City</span><input value={city} onChange={e => setCity(e.target.value)} className={inputClass} /></label><label><span className="text-sm font-semibold text-[#13334F]">State</span><input value={state} onChange={e => setState(e.target.value)} maxLength={2} className={inputClass} /></label></div></div>
          </section>

          <section className="border-b border-[#DDE7E8] py-7">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Operating context</p>
            <div className="space-y-6"><label className="block"><span className="text-sm font-semibold text-[#13334F]">Resident count</span><input type="number" min={0} inputMode="numeric" value={residentCount} onChange={e => setResidentCount(e.target.value)} className={inputClass} /></label><label className="block"><span className="text-sm font-semibold text-[#13334F]">Primary contact</span><input value={primaryContact} onChange={e => setPrimaryContact(e.target.value)} className={inputClass} /></label><label className="block"><span className="text-sm font-semibold text-[#13334F]">Contact phone</span><input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className={inputClass} /></label><label className="block"><span className="text-sm font-semibold text-[#13334F]">Orientation notes</span><textarea rows={4} value={orientationNotes} onChange={e => setOrientationNotes(e.target.value)} placeholder="Parking, entry instructions, unit details, handoff expectations…" className="mt-2 w-full resize-y border-b border-[#BFCED4] bg-transparent px-0 py-2 text-base leading-6 text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]" /></label></div>
          </section>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#DDE7E8] bg-white/95 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur"><div className="mx-auto flex max-w-2xl gap-3"><button type="button" onClick={leavePage} disabled={saving} className="min-h-12 flex-1 rounded-xl border border-[#DDE7E8] text-sm font-semibold text-[#13334F]">Cancel</button><button type="button" disabled={saving || orgReady === false} onClick={() => void handleSubmit({ preventDefault() {} } as FormEvent)} className="min-h-12 flex-[1.4] rounded-xl bg-[#53B59F] px-4 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save site'}</button></div></div>
    </div>
  );
}
