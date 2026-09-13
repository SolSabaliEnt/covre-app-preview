import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router';
import { ADMIN_ENTRY_PATH, PROVIDER_ENTRY_PATH, WORKER_ENTRY_PATH } from '../lib/entryRoutes';
import {
  LANDING_LOGO_FOOTER_CLASS,
  LANDING_LOGO_HERO_CLASS,
  LANDING_LOGO_SRC,
} from '../lib/brand';

const workerProfiles = [
  { initials: 'MR', role: 'CNA', detail: 'Memory care · credential ready', history: '3 shifts here' },
  { initials: 'TJ', role: 'DSP', detail: 'Group home · profile complete', history: 'Worked nearby' },
  { initials: 'AL', role: 'LPN', detail: 'Residential care · credential ready', history: 'Returning worker' },
];

const providerBenefits = [
  'Post the real requirements, not just the hours',
  'Review fit, readiness, and site familiarity before you confirm',
  'Track the work, approve time, and keep the record connected',
];

const workerBenefits = [
  'See pay, timing, site context, and expectations before you accept',
  'Carry credentials and work history across opportunities',
  'Build repeat relationships with places that already know your work',
];

const careSettings = [
  'Group homes',
  'Memory care',
  'Assisted living',
  'Skilled nursing',
  'Home care',
  'Residential programs',
  'IDD support',
  'Behavioral health',
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#10283D]">
      <section className="relative overflow-hidden bg-[#13334F] text-white">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_70%_25%,rgba(83,181,159,0.14),transparent_52%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-6 lg:pb-24 lg:pt-6">
          <header className="flex items-center justify-between gap-4">
            <Link to="/" className="block min-w-0 shrink">
              <img
                src={LANDING_LOGO_SRC}
                alt="Covre"
                width={906}
                height={209}
                loading="eager"
                decoding="async"
                className={LANDING_LOGO_HERO_CLASS}
              />
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex" aria-label="Primary">
              <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
              <a href="#providers" className="transition-colors hover:text-white">Providers</a>
              <a href="#workers" className="transition-colors hover:text-white">Care workers</a>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link to="/auth" className="hidden min-h-11 items-center justify-center px-4 text-sm font-semibold text-white/90 hover:text-white sm:inline-flex">
                Log in
              </Link>
              <Link
                to={PROVIDER_ENTRY_PATH}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#13334F] transition-transform hover:-translate-y-0.5 sm:px-5"
              >
                Facility access
              </Link>
            </div>
          </header>

          <div className="grid gap-14 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pt-24">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9EDDD0]">
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Care staffing built around trust
              </div>

              <h1 className="mt-6 text-[3.15rem] font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5rem]">
                Fill the shift.
                <br />
                Know who&apos;s walking through the door.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                Covre helps care providers cover open shifts with qualified professionals — and gives care workers the context they need before they commit.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={PROVIDER_ENTRY_PATH}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2F8E7A]"
                >
                  Cover a shift <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  to={WORKER_ENTRY_PATH}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-base font-semibold text-white transition-colors hover:bg-white/5"
                >
                  Find care shifts <ChevronRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
                <TrustPoint icon={<BadgeCheck className="h-4 w-4" />} text="Credential-aware" />
                <TrustPoint icon={<MapPin className="h-4 w-4" />} text="Site-ready context" />
                <TrustPoint icon={<FileCheck2 className="h-4 w-4" />} text="Shift-level record" />
              </div>
            </div>

            <div className="lg:border-l lg:border-white/14 lg:pl-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">Tonight · 7 PM–7 AM</p>
              <div className="mt-3 flex items-start justify-between gap-5 border-b border-white/14 pb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">CNA · Memory care</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="h-4 w-4" aria-hidden /> Residential care site
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#F6C979]">Urgent</span>
              </div>

              <div className="py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9EDDD0]">Best fit surfaced</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] font-bold text-[#257665]">MR</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">Matched care professional</p>
                    <p className="mt-1 text-sm text-white/55">Credential ready · site-ready · worked here before</p>
                  </div>
                  <BadgeCheck className="h-5 w-5 shrink-0 text-[#7BD0BD]" aria-hidden />
                </div>
              </div>

              <div className="grid grid-cols-3 border-y border-white/14 py-5 text-sm">
                <HeroStat label="Credentials" value="Ready" />
                <HeroStat label="Site context" value="Reviewed" bordered />
                <HeroStat label="Status" value="Covered" bordered />
              </div>

              <p className="mt-5 text-sm text-white/55">The shift context stays connected from post through closeout.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#DDE7E8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-sm text-[#607583] sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>Built for the places where care actually happens</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.09em] text-[#314858]">
            <span>CNAs</span><span>DSPs</span><span>LPNs</span><span>RNs</span><span>Care teams</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">How Covre works</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">
                From “we have a hole” to covered in three clear steps.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#607583]">
                The best staffing experience is the one that removes uncertainty. Covre keeps the important context with the shift from post to closeout.
              </p>
            </div>

            <div className="border-t border-[#BFCED4]">
              <ProcessRow number="01" icon={<Clock3 className="h-5 w-5" />} title="Post the real shift" body="Role, rate, timing, credential needs, site expectations, contacts, and the details workers usually have to chase down." />
              <ProcessRow number="02" icon={<UsersRound className="h-5 w-5" />} title="Match for fit, not volume" body="Review qualified workers with the context that matters: readiness, history, credentials, and whether they know the site." />
              <ProcessRow number="03" icon={<CheckCircle2 className="h-5 w-5" />} title="Close the loop" body="Track the work, approve time, and keep the shift record connected so coverage is something your team can see and stand behind." last />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7FAFA] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Meet the coverage</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">
              See who may be walking into your site before you confirm.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#607583]">
              A name and a rate are not enough. Covre brings readiness, work history, and site familiarity into the decision.
            </p>
          </div>

          <div className="mt-12 border-y border-[#BFCED4]">
            {workerProfiles.map((profile, index) => (
              <div key={profile.initials} className={`grid gap-4 py-6 sm:grid-cols-[72px_1fr_auto] sm:items-center ${index < workerProfiles.length - 1 ? 'border-b border-[#DDE7E8]' : ''}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F6F2] font-bold text-[#257665]">{profile.initials}</div>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold text-[#13334F]">{profile.role}</h3>
                    <span className="text-sm text-[#607583]">{profile.detail}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#607583]">{profile.history}</p>
                </div>
                <Link to={PROVIDER_ENTRY_PATH} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
                  Review fit <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="providers" className="scroll-mt-20 bg-[#13334F] py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start lg:gap-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#9EDDD0]">
              <Building2 className="h-4 w-4" aria-hidden /> For providers
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Coverage without the scramble.</h2>
            <p className="mt-5 text-lg leading-8 text-white/65">
              Your team does not need a flood of random applicants. It needs the right person for the specific site, shift, and level of care.
            </p>

            <div className="mt-8 space-y-4">
              {providerBenefits.map(item => <BenefitRow key={item} text={item} dark />)}
            </div>

            <Link to={PROVIDER_ENTRY_PATH} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A]">
              Open the provider workspace <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="lg:border-l lg:border-white/14 lg:pl-10">
            <div className="flex items-end justify-between gap-6 border-b border-white/14 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">Right now</p>
                <p className="mt-2 text-3xl font-semibold text-white">2 shifts need attention</p>
              </div>
              <Link to={PROVIDER_ENTRY_PATH} className="text-sm font-semibold text-[#9EDDD0]">View coverage</Link>
            </div>
            <OpsRow label="Memory care · Overnight" detail="CNA · 7 PM–7 AM" status="Needs match" urgent />
            <OpsRow label="Group home · Evening" detail="DSP · 3 PM–11 PM" status="2 applicants" />
            <OpsRow label="Residential · Day" detail="LPN · 7 AM–3 PM" status="Covered" success />
            <div className="grid grid-cols-3 border-t border-white/14 pt-6">
              <ProviderMetric value="8" label="Open" />
              <ProviderMetric value="42" label="Covered" bordered />
              <ProviderMetric value="5" label="On site" bordered />
            </div>
          </div>
        </div>
      </section>

      <section id="workers" className="scroll-mt-20 bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <div className="border-y border-[#BFCED4] py-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#607583]">Tonight · 7 PM</p>
                  <h3 className="mt-2 text-2xl font-semibold text-[#13334F]">Memory care · CNA</h3>
                  <p className="mt-2 text-sm text-[#607583]">Familiar site · rate shown upfront</p>
                </div>
                <Stethoscope className="h-6 w-6 text-[#2F8E7A]" aria-hidden />
              </div>
            </div>
            <ShiftDetailRow label="Credentials" value="Ready" />
            <ShiftDetailRow label="Site history" value="Worked here before" />
            <ShiftDetailRow label="Arrival" value="Parking + entry instructions ready" />
            <ShiftDetailRow label="Site contact" value="Available before you accept" last />
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">
              <Stethoscope className="h-4 w-4" aria-hidden /> For care professionals
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">Know before you go.</h2>
            <p className="mt-5 text-lg leading-8 text-[#607583]">
              A flexible shift should not mean walking in blind. Covre puts the details, expectations, and trust signals in front of you before you accept.
            </p>
            <div className="mt-8 space-y-4">
              {workerBenefits.map(item => <BenefitRow key={item} text={item} />)}
            </div>
            <Link to={WORKER_ENTRY_PATH} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A]">
              Find care shifts <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#E6F6F2] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#257665]">Built for repeat trust</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">Good coverage should get easier the next time.</h2>
            </div>
            <div className="grid border-t border-[#9FCFC3] md:grid-cols-3">
              <TrustColumn icon={<ShieldCheck className="h-5 w-5" />} title="Credential passport" body="Keep readiness connected to the professional instead of restarting the proof process every shift." />
              <TrustColumn icon={<HeartHandshake className="h-5 w-5" />} title="Familiarity that matters" body="Surface workers and sites with real history so good relationships can become an operating advantage." bordered />
              <TrustColumn icon={<FileCheck2 className="h-5 w-5" />} title="A defensible record" body="Make documentation part of the workflow, not a scavenger hunt through texts and screenshots." bordered />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-col gap-7 border-b border-[#BFCED4] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Care settings served</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#13334F] sm:text-4xl">One coverage loop, across the settings where care teams need relief.</h2>
            </div>
            <Link to={PROVIDER_ENTRY_PATH} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F8E7A]">Explore facility access <ChevronRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-0 md:grid-cols-4">
            {careSettings.map(setting => <div key={setting} className="border-b border-[#DDE7E8] py-4 text-sm font-medium text-[#314858]">{setting}</div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#13334F] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#9EDDD0]">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Care staffing. Covered.
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">Make the next open shift feel less urgent.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">Choose the workspace that fits you and see how Covre turns coverage into a visible, accountable workflow.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={PROVIDER_ENTRY_PATH} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 text-base font-semibold text-white hover:bg-[#2F8E7A]">I manage care coverage <ArrowRight className="h-5 w-5" aria-hidden /></Link>
            <Link to={WORKER_ENTRY_PATH} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-base font-semibold text-white hover:bg-white/5">I&apos;m a care professional <ChevronRight className="h-5 w-5" aria-hidden /></Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B243A] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <img src={LANDING_LOGO_SRC} alt="Covre" width={906} height={209} loading="lazy" decoding="async" className={LANDING_LOGO_FOOTER_CLASS} />
            <p className="mt-3 text-sm text-[#9AAAB3]">© 2026 Covre. Care staffing. Covered.</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-white/60">
            <Link to={WORKER_ENTRY_PATH} className="hover:text-white">Care worker access</Link>
            <Link to={PROVIDER_ENTRY_PATH} className="hover:text-white">Facility access</Link>
            <Link to="/auth" className="hover:text-white">Log in</Link>
            <Link to={ADMIN_ENTRY_PATH} className="hover:text-white">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TrustPoint({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2"><span className="text-[#7BD0BD]">{icon}</span><span>{text}</span></div>;
}

function HeroStat({ label, value, bordered = false }: { label: string; value: string; bordered?: boolean }) {
  return (
    <div className={bordered ? 'border-l border-white/14 pl-4 sm:pl-5' : ''}>
      <p className="text-[11px] text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function ProcessRow({ number, icon, title, body, last = false }: { number: string; icon: React.ReactNode; title: string; body: string; last?: boolean }) {
  return (
    <div className={`grid gap-4 py-7 sm:grid-cols-[64px_1fr_32px] sm:items-start ${last ? '' : 'border-b border-[#DDE7E8]'}`}>
      <span className="text-sm font-semibold tracking-[0.12em] text-[#9AAAB3]">{number}</span>
      <div><h3 className="text-xl font-semibold text-[#13334F]">{title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#607583]">{body}</p></div>
      <span className="text-[#2F8E7A]">{icon}</span>
    </div>
  );
}

function BenefitRow({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/10 text-[#9EDDD0]' : 'bg-[#E6F6F2] text-[#257665]'}`}><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /></div>
      <p className={`text-base leading-7 ${dark ? 'text-white/72' : 'text-[#314858]'}`}>{text}</p>
    </div>
  );
}

function OpsRow({ label, detail, status, urgent = false, success = false }: { label: string; detail: string; status: string; urgent?: boolean; success?: boolean }) {
  const statusClass = urgent ? 'text-[#F6C979]' : success ? 'text-[#9EDDD0]' : 'text-white/70';
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/14 py-5">
      <div><p className="font-semibold text-white">{label}</p><p className="mt-1 text-sm text-white/50">{detail}</p></div>
      <span className={`shrink-0 text-sm font-semibold ${statusClass}`}>{status}</span>
    </div>
  );
}

function ProviderMetric({ value, label, bordered = false }: { value: string; label: string; bordered?: boolean }) {
  return <div className={bordered ? 'border-l border-white/14 pl-5' : ''}><p className="text-3xl font-semibold text-white">{value}</p><p className="mt-1 text-sm text-white/45">{label}</p></div>;
}

function ShiftDetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`grid grid-cols-[110px_1fr] gap-5 py-4 text-sm sm:grid-cols-[130px_1fr] ${last ? 'border-b border-[#BFCED4]' : 'border-b border-[#DDE7E8]'}`}>
      <span className="text-[#607583]">{label}</span><span className="font-semibold text-[#13334F]">{value}</span>
    </div>
  );
}

function TrustColumn({ icon, title, body, bordered = false }: { icon: React.ReactNode; title: string; body: string; bordered?: boolean }) {
  return (
    <div className={`py-6 md:px-6 ${bordered ? 'md:border-l md:border-[#9FCFC3]' : 'md:pl-0'}`}>
      <div className="text-[#257665]">{icon}</div>
      <h3 className="mt-5 text-lg font-semibold text-[#13334F]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#466170]">{body}</p>
    </div>
  );
}
