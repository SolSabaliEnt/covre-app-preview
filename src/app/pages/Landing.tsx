import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  HeartHandshake,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { ADMIN_ENTRY_PATH, PROVIDER_ENTRY_PATH, WORKER_ENTRY_PATH } from '../lib/entryRoutes';
import {
  LANDING_LOGO_FOOTER_CLASS,
  LANDING_LOGO_HERO_CLASS,
  LANDING_LOGO_SRC,
} from '../lib/brand';

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

const coverageFlow = [
  {
    label: 'Shift posted',
    detail: 'Role, rate, timing, credentials, site instructions',
    icon: ClipboardCheck,
  },
  {
    label: 'Worker matched',
    detail: 'Readiness, history, familiarity, availability',
    icon: UserRoundCheck,
  },
  {
    label: 'Work completed',
    detail: 'Arrival, time, support, closeout',
    icon: Stethoscope,
  },
  {
    label: 'Record carried forward',
    detail: 'Approved history becomes useful context next time',
    icon: HeartPulse,
  },
];

const workerPassport = [
  ['Credentials', 'Ready'],
  ['Work history', '12 approved shifts'],
  ['Familiar sites', '3 care settings'],
  ['Availability', 'Updated today'],
];

const providerSignals = [
  ['Credential fit', 'Ready'],
  ['Site familiarity', 'Worked here before'],
  ['Recent reliability', '4 completed shifts'],
  ['Arrival context', 'Parking + entry visible'],
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#10283D]">
      <section className="relative min-h-[730px] overflow-hidden bg-[#13334F] text-white sm:min-h-[770px] lg:min-h-[790px]">
        <video
          src="/covre-header-background-web.mp4"
          poster="/covre-header-poster.jpg"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center lg:object-[62%_center]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="pointer-events-none absolute inset-0 bg-[#0B243A]/48" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,36,58,0.97)_0%,rgba(11,36,58,0.91)_38%,rgba(11,36,58,0.52)_67%,rgba(11,36,58,0.24)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0B243A]/78 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[730px] max-w-7xl flex-col px-5 pb-9 pt-5 sm:min-h-[770px] sm:px-6 lg:min-h-[790px] lg:pb-12 lg:pt-6">
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

            <nav className="hidden items-center gap-8 text-sm font-medium text-white/72 md:flex" aria-label="Primary">
              <a href="#care-loop" className="transition-colors hover:text-white">Care loop</a>
              <a href="#providers" className="transition-colors hover:text-white">Providers</a>
              <a href="#workers" className="transition-colors hover:text-white">Care professionals</a>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link to="/auth" className="hidden min-h-11 items-center justify-center px-4 text-sm font-semibold text-white/90 hover:text-white sm:inline-flex">
                Log in
              </Link>
              <Link to={PROVIDER_ENTRY_PATH} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#13334F] sm:px-5">
                Facility access
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.08fr_0.72fr] lg:gap-16 lg:py-16">
            <div className="max-w-[760px]">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#B7E4DA]">
                <HeartPulse className="h-4 w-4" aria-hidden />
                Care coverage, connected
              </div>

              <h1 className="mt-6 text-[3.15rem] font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5rem]">
                Fill the shift.
                <br />
                Keep the care context.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl">
                Covre connects staffing, credentials, site context, and work history so providers and care professionals can make better decisions before the shift starts.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to={PROVIDER_ENTRY_PATH} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2F8E7A]">
                  Cover a shift <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link to={WORKER_ENTRY_PATH} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/28 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                  Find care shifts <ChevronRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/68">
                <TrustPoint icon={<BadgeCheck className="h-4 w-4" />} text="Credential-aware" />
                <TrustPoint icon={<MapPin className="h-4 w-4" />} text="Site-ready context" />
                <TrustPoint icon={<FileCheck2 className="h-4 w-4" />} text="Connected work history" />
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="ml-auto max-w-[360px] rounded-[28px] border border-white/18 bg-[#F7FAFA]/94 p-5 text-[#10283D] shadow-[0_24px_70px_rgba(0,0,0,0.16)] backdrop-blur-md">
                <div className="flex items-start justify-between gap-4 border-b border-[#DDE7E8] pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Care coverage</p>
                    <p className="mt-1 text-xl font-semibold text-[#13334F]">Tonight · Memory care</p>
                    <p className="mt-1 text-sm text-[#607583]">CNA · 7 PM–7 AM</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F6F2] text-[#257665]"><Stethoscope className="h-5 w-5" /></span>
                </div>
                <div className="py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2F8E7A]">Matched professional</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#13334F] text-sm font-bold text-white">MR</div>
                    <div>
                      <p className="font-semibold text-[#13334F]">CNA · credential ready</p>
                      <p className="mt-0.5 text-xs text-[#607583]">3 shifts at this site</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-5 border-t border-[#DDE7E8] pt-4 text-sm">
                  <MiniSignal label="Credentials" value="Ready" />
                  <MiniSignal label="Site history" value="Familiar" />
                  <MiniSignal label="Arrival" value="Instructions set" />
                  <MiniSignal label="Status" value="Awaiting confirm" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/14 pt-5 text-xs font-medium text-white/58 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-[#7BD0BD]" />
            The shift is temporary. The care record should not be.
          </div>
        </div>
      </section>

      <section className="border-b border-[#DDE7E8] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-5 text-sm text-[#607583] sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
          <span>Built for teams delivering hands-on care</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.09em] text-[#314858]">
            <span>CNAs</span><span>DSPs</span><span>LPNs</span><span>RNs</span><span>Care teams</span>
          </div>
        </div>
      </section>

      <section id="care-loop" className="scroll-mt-20 bg-[#F7FAFA] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">The care loop</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">Care staffing should behave more like a health workflow than a job board.</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#607583]">The useful part is not only finding someone. It is carrying the right information from the open shift through the completed work—and making that history useful the next time.</p>
          </div>

          <div className="relative mt-12 grid gap-0 border-y border-[#BFCED4] md:grid-cols-4">
            {coverageFlow.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className={`relative py-6 md:px-6 ${index > 0 ? 'border-t border-[#DDE7E8] md:border-l md:border-t-0' : ''}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E6F6F2] text-[#257665]"><Icon className="h-5 w-5" /></div>
                  <p className="mt-5 text-xs font-semibold text-[#9AAAB3]">0{index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#13334F]">{step.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#607583]">{step.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workers" className="scroll-mt-20 bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">
              <Stethoscope className="h-4 w-4" aria-hidden /> For care professionals
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">Your professional context should travel with you.</h2>
            <p className="mt-5 text-lg leading-8 text-[#607583]">Covre is designed around a portable care-work profile: your credentials, approved work history, familiar sites, and the shift details you need before saying yes.</p>
            <div className="mt-8 space-y-4">
              <BenefitRow text="Know pay, timing, care setting, arrival details, and expectations before you accept" />
              <BenefitRow text="Keep credentials and approved work history connected to your profile" />
              <BenefitRow text="Build familiarity with providers and sites that already know your work" />
            </div>
            <Link to={WORKER_ENTRY_PATH} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A]">
              Open care professional access <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="rounded-[32px] bg-[#F7FAFA] p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-[#DDE7E8] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13334F] font-bold text-white">MR</div>
                <div>
                  <p className="text-lg font-semibold text-[#13334F]">Professional passport</p>
                  <p className="text-sm text-[#607583]">CNA · profile ready</p>
                </div>
              </div>
              <ShieldCheck className="h-6 w-6 text-[#2F8E7A]" aria-hidden />
            </div>
            <div className="divide-y divide-[#DDE7E8]">
              {workerPassport.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#257665]"><CheckCircle2 className="h-4 w-4" /> Ready to review for matching shifts</div>
          </div>
        </div>
      </section>

      <section id="providers" className="scroll-mt-20 bg-[#E6F6F2] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[1.06fr_0.94fr] lg:items-center lg:gap-20">
          <div className="rounded-[32px] bg-white/76 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-6 border-b border-[#BFDCD5] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#607583]">Coverage decision</p>
                <h3 className="mt-2 text-2xl font-semibold text-[#13334F]">Memory care · Overnight</h3>
                <p className="mt-1 text-sm text-[#607583]">CNA · 7 PM–7 AM · site requirements attached</p>
              </div>
              <Building2 className="h-6 w-6 text-[#2F8E7A]" aria-hidden />
            </div>
            <div className="divide-y divide-[#BFDCD5]">
              {providerSignals.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#BFDCD5] pt-5">
              <div>
                <p className="text-xs text-[#607583]">Matched professional</p>
                <p className="mt-1 font-semibold text-[#13334F]">CNA · returning worker</p>
              </div>
              <span className="text-sm font-semibold text-[#257665]">Review fit</span>
            </div>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#257665]">
              <Building2 className="h-4 w-4" aria-hidden /> For providers
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">See readiness before the person arrives.</h2>
            <p className="mt-5 text-lg leading-8 text-[#466170]">Covre gives the shift more clinical context: credential fit, site familiarity, work history, arrival details, and a connected closeout record.</p>
            <div className="mt-8 space-y-4">
              <BenefitRow text="Post the real care setting, requirements, timing, and site expectations" />
              <BenefitRow text="Review readiness and familiarity instead of sorting a pile of generic applicants" />
              <BenefitRow text="Approve time and keep the completed shift connected to future staffing decisions" />
            </div>
            <Link to={PROVIDER_ENTRY_PATH} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white hover:bg-[#0B243A]">
              Open provider access <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Continuity becomes signal</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">The second good shift should be easier than the first.</h2>
              <p className="mt-5 text-lg leading-8 text-[#607583]">Covre is built to remember the parts of care staffing worth remembering: approved work, familiar sites, trusted relationships, and what made a shift go well.</p>
            </div>

            <div className="border-t border-[#BFCED4]">
              <ContinuityRow icon={<ShieldCheck className="h-5 w-5" />} title="Credential continuity" body="A professional should not have to restart the proof process for every opportunity." />
              <ContinuityRow icon={<HeartHandshake className="h-5 w-5" />} title="Relationship continuity" body="Workers and care sites with real history should be easier to bring back together." />
              <ContinuityRow icon={<Activity className="h-5 w-5" />} title="Operational continuity" body="Approved work should improve the next matching, staffing, and closeout decision." last />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7FAFA] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-col gap-7 border-b border-[#BFCED4] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Care settings</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#13334F] sm:text-4xl">Built for the settings where coverage and continuity both matter.</h2>
            </div>
            <Link to={PROVIDER_ENTRY_PATH} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F8E7A]">Facility access <ChevronRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
            {careSettings.map(setting => <div key={setting} className="border-b border-[#DDE7E8] py-4 text-sm font-medium text-[#314858]">{setting}</div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#13334F] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-6">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#9EDDD0]">
            <HeartPulse className="h-4 w-4" aria-hidden /> Care staffing. Covered.
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">A better staffing decision starts with better care context.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/65">Choose your side of the care loop and enter Covre with the information you need already attached to the work.</p>
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

function MiniSignal({ label, value }: { label: string; value: string }) {
  return <div className="py-2"><p className="text-[11px] uppercase tracking-[0.08em] text-[#9AAAB3]">{label}</p><p className="mt-1 text-xs font-semibold text-[#13334F]">{value}</p></div>;
}

function BenefitRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /></div>
      <p className="text-base leading-7 text-[#314858]">{text}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-5 py-4 text-sm sm:grid-cols-[150px_1fr]">
      <span className="text-[#607583]">{label}</span><span className="font-semibold text-[#13334F]">{value}</span>
    </div>
  );
}

function ContinuityRow({ icon, title, body, last = false }: { icon: React.ReactNode; title: string; body: string; last?: boolean }) {
  return (
    <div className={`grid gap-4 py-6 sm:grid-cols-[34px_1fr] ${last ? '' : 'border-b border-[#DDE7E8]'}`}>
      <span className="text-[#2F8E7A]">{icon}</span>
      <div><h3 className="text-lg font-semibold text-[#13334F]">{title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-[#607583]">{body}</p></div>
    </div>
  );
}
