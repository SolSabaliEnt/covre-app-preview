import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Building2, Camera, CheckCircle2, MapPin, Users, X } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { getProviderSettingsSummary } from '../../services';
import type { ProviderSettingsSummary } from '../../services/types';
import {
  PROVIDER_LOGO_KEY,
  PROVIDER_PROFILE_ABOUT_KEY,
  getStoredProfileText,
  imageFileToDataUrl,
  saveStoredProfileImage,
  saveStoredProfileText,
  useStoredProfileImage,
} from '../../lib/profileMedia';

export default function ProviderProfile() {
  const logo = useStoredProfileImage(PROVIDER_LOGO_KEY);
  const [about, setAbout] = useState(() => getStoredProfileText(PROVIDER_PROFILE_ABOUT_KEY));
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ProviderSettingsSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await getProviderSettingsSummary();
      if (cancelled) return;
      if (res.ok) setSummary(res.data);
      else toast.error(res.error.message);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const initials = useMemo(() => {
    const source = summary?.organizationName || 'Provider';
    return source.split(/\s+/).filter(Boolean).map(part => part[0]?.toUpperCase()).join('').slice(0, 2);
  }, [summary?.organizationName]);

  const handleLogo = async (file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await imageFileToDataUrl(file);
      saveStoredProfileImage(PROVIDER_LOGO_KEY, dataUrl);
      toast.success('Organization logo updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not use that logo.');
    }
  };

  const saveAbout = () => {
    saveStoredProfileText(PROVIDER_PROFILE_ABOUT_KEY, about);
    toast.success('Organization profile saved');
  };

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <Link to="/provider/more" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
          <ArrowLeft className="h-4 w-4" aria-hidden /> More
        </Link>

        <header className="mt-3 border-b border-[#DDE7E8] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Provider profile</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Your organization in Covre.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Keep the identity, team context, and operating details workers and your own staff rely on in one place.</p>
        </header>

        <section className="border-b border-[#DDE7E8] py-7">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#DDE7E8] bg-[#F7FAFA]">
              {logo ? <img src={logo} alt="Organization logo" className="h-full w-full object-contain p-2" /> : <span className="text-2xl font-semibold text-[#257665]">{initials}</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[#13334F]">Organization logo</h2>
                <span className="text-xs font-medium text-[#9AAAB3]">Optional</span>
              </div>
              <p className="mt-1 text-sm leading-5 text-[#607583]">Add a logo if you have one. Covre still works cleanly without it.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#13334F] px-4 text-sm font-semibold text-white hover:bg-[#0B243A]">
                  <Camera className="h-4 w-4" aria-hidden /> {logo ? 'Change logo' : 'Add logo'}
                  <input type="file" accept="image/*" className="sr-only" onChange={e => void handleLogo(e.target.files?.[0])} />
                </label>
                {logo ? <button type="button" onClick={() => saveStoredProfileImage(PROVIDER_LOGO_KEY, null)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#A93636]"><X className="h-4 w-4" aria-hidden /> Remove</button> : null}
              </div>
            </div>
          </div>
        </section>

        {loading ? <p className="py-10 text-center text-sm text-[#607583]">Loading organization…</p> : (
          <>
            <section className="border-b border-[#DDE7E8] py-7">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Organization</p>
                  <h2 className="mt-1 text-2xl font-semibold text-[#13334F]">{summary?.organizationName ?? 'Provider organization'}</h2>
                  <p className="mt-1 text-sm text-[#607583]">{summary?.organizationType ?? 'Care provider'}</p>
                  {summary?.organizationStatus ? <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#257665]"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden />{summary.organizationStatus}</p> : null}
                </div>
              </div>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <label htmlFor="provider-about" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">About your organization</label>
              <textarea id="provider-about" value={about} onChange={e => setAbout(e.target.value)} rows={5} maxLength={400} placeholder="A short description of your care setting, values, or the kind of team workers are joining." className="mt-4 w-full resize-y border-b border-[#BFCED4] bg-transparent px-0 py-2 text-base leading-6 text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]" />
              <div className="mt-3 flex items-center justify-between gap-4"><p className="text-xs text-[#9AAAB3]">{about.length}/400 characters</p><button type="button" onClick={saveAbout} className="min-h-11 rounded-xl bg-[#53B59F] px-4 text-sm font-semibold text-white hover:bg-[#2F8E7A]">Save description</button></div>
            </section>

            <section className="border-b border-[#DDE7E8] py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Workspace contact</p>
              <dl className="mt-3 border-t border-[#BFCED4]">
                <div className="flex items-start justify-between gap-5 border-b border-[#DDE7E8] py-4"><dt className="text-sm text-[#607583]">Account</dt><dd className="text-right text-sm font-semibold text-[#13334F]">{summary?.accountName ?? '—'}{summary?.accountEmail ? <span className="block font-normal text-[#607583]">{summary.accountEmail}</span> : null}</dd></div>
                <div className="flex items-center justify-between gap-5 border-b border-[#DDE7E8] py-4"><dt className="text-sm text-[#607583]">Role</dt><dd className="text-sm font-semibold capitalize text-[#13334F]">{summary?.memberRole ?? '—'}</dd></div>
                <div className="flex items-center justify-between gap-5 border-b border-[#DDE7E8] py-4"><dt className="text-sm text-[#607583]">Setup</dt><dd className="text-sm font-semibold text-[#13334F]">{summary?.setupStatus === 'complete' ? 'Complete' : 'Needs attention'}</dd></div>
              </dl>
            </section>

            <section className="py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Manage the profile</p>
              <div className="mt-3 border-t border-[#BFCED4]">
                <Link to="/provider/onboarding" className="flex min-h-14 items-center gap-3 border-b border-[#DDE7E8] no-underline"><Building2 className="h-5 w-5 text-[#2F8E7A]" aria-hidden /><span className="flex-1"><strong className="block text-sm text-[#13334F]">Organization setup</strong><span className="text-xs text-[#607583]">Organization details and operating setup</span></span></Link>
                <Link to="/provider/sites" className="flex min-h-14 items-center gap-3 border-b border-[#DDE7E8] no-underline"><MapPin className="h-5 w-5 text-[#2F8E7A]" aria-hidden /><span className="flex-1"><strong className="block text-sm text-[#13334F]">Care sites</strong><span className="text-xs text-[#607583]">Locations, orientation, and staffing rules</span></span></Link>
                <Link to="/provider/team" className="flex min-h-14 items-center gap-3 border-b border-[#DDE7E8] no-underline"><Users className="h-5 w-5 text-[#2F8E7A]" aria-hidden /><span className="flex-1"><strong className="block text-sm text-[#13334F]">Team & permissions</strong><span className="text-xs text-[#607583]">Schedulers, billing users, and admins</span></span></Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
