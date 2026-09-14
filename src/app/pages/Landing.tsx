import type { ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
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

const careRecord = [
  { label: 'Shift context', detail: 'Role, rate, timing, level of care', icon: ClipboardCheck },
  { label: 'Professional readiness', detail: 'Credentials, history, familiarity', icon: UserRoundCheck },
  { label: 'On-site context', detail: 'Arrival, contacts, expectations', icon: MapPin },
  { label: 'Approved history', detail: 'Time, completion, repeat relationship', icon: FileCheck2 },
];

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#10283D]">
      <section className="relative min-h-[840px] overflow-hidden bg-[#13334F] text-white sm:min-h-[760px] lg:min-h-[790px]">
        <video
          src="/covre-header-background-web.mp4"
          poster="/covre-header-poster.jpg"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-[64%_center]"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="pointer-events-none absolute inset-0 bg-[#0B243A]/24" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,36,58,0.96)_0%,rgba(11,36,58,0.88)_38%,rgba(11,36,58,0.42)_66%,rgba(11,36,58,0.10)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#0B243A]/72 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[840px] max-w-7xl flex-col px-5 pb-7 pt-5 sm:min-h-[760px] sm:px-6 sm:pb-9 lg:min-h-[790px] lg:pb-11 lg:pt-6">
          <header className="flex items-center justify-between gap-4">
            <Link to="/" className="block min-w-0 shrink">
              <img src={LANDING_LOGO_SRC} alt="Covre" width={906} height={209} loading="eager" decoding="async" className={LANDING_LOGO_HERO_CLASS} />
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-white/72 md:flex" aria-label="Primary">
              <a href="#care-record" className="transition-colors hover:text-white">Care record</a>
              <a href="#providers" className="transition-colors hover:text-white">Providers</a>
              <a href="#workers" className="transition-colors hover:text-white">Care professionals</a>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link to="/auth" className="hidden min-h-11 items-center justify-center px-4 text-sm font-semibold text-white/90 hover:text-white sm:inline-flex">Log in</Link>
              <Link to={PROVIDER_ENTRY_PATH} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#13334F] sm:px-5">Facility access</Link>
            </div>
          </header>

          <div className="flex flex-1 items-end pb-3 pt-36 sm:items-center sm:py-20 lg:py-24">
            <div className="w-full max-w-[760px]">
              <div className="flex max-w-[14rem] items-start gap-2 text-[0.7rem] font-semibold uppercase leading-5 tracking-[0.18em] text-[#B7E4DA] sm:max-w-none sm:items-center sm:text-xs">
                <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden />
                <span>Care staffing, with memory</span>
              </div>

              <h1 className="mt-5 max-w-[17rem] text-[3rem] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:mt-6 sm:max-w-[720px] sm:text-6xl lg:text-[5rem]">
                Coverage should feel like part of the care plan.
              </h1>

              <p className="mt-6 max-w-[22rem] text-base leading-7 text-white/82 sm:mt-7 sm:max-w-[650px] sm:text-xl sm:leading-8">
                Covre connects an open shift to the professional, credentials, site knowledge, and approved work history that make the decision safer and more informed.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
                <Link to={PROVIDER_ENTRY_PATH} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2F8E7A]">
                  Cover a shift <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link to={WORKER_ENTRY_PATH} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/28 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                  Find care shifts <ChevronRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden gap-3 border-t border-white/14 pt-5 text-xs text-white/64 sm:grid sm:grid-cols-4 sm:text-sm">
            <TrustPoint icon={<BadgeCheck className="h-4 w-4" />} text="Credential-aware" />
            <TrustPoint icon={<MapPin className="h-4 w-4" />} text="Site familiarity" />
            <TrustPoint icon={<ShieldCheck className="h-4 w-4" />} text="Approved work history" />
            <TrustPoint icon={<Stethoscope className="h-4 w-4" />} text="Arrival context" />
          </div>
        </div>
      </section>

      <section className="border-b border-[#DDE7E8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-sm text-[#607583] sm:px-6 md:flex-row md:items-center md:justify-between">
          <span>Built for teams delivering hands-on care</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[0.09em] text-[#314858]">
            <span>CNAs</span><span>DSPs</span><span>LPNs</span><span>RNs</span><span>Care teams</span>
          </div>
        </div>
      </section>

      <section id="care-record" className="scroll-mt-20 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">The care coverage record</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">The shift ends. The useful context should not.</h2>
              <p className="mt-5 text-lg leading-8 text-[#607583]">Instead of treating every opening like a brand-new transaction, Covre carries forward the details that help providers and professionals make the next decision with more confidence.</p>
            </div>

            <div className="border-t border-[#BFCED4]">
              {careRecord.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="grid gap-4 border-b border-[#DDE7E8] py-6 sm:grid-cols-[42px_1fr_auto] sm:items-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]"><Icon className="h-4.5 w-4.5" /></span>
                    <div>
                      <p className="text-lg font-semibold text-[#13334F]">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[#607583]">{item.detail}</p>
                    </div>
                    <span className="text-xs font-semibold tracking-[0.12em] text-[#9AAAB3]">0{index + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="workers" className="scroll-mt-20 bg-[#F7FAFA] py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">For care professionals</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">Bring your professional history with you.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#607583]">Your credentials, approved work, familiar sites, and current availability should work together as one professional record—not live across texts, screenshots, and repeated forms.</p>

            <div className="mt-10 max-w-2xl border-t border-[#BFCED4]">
              <SignalRow label="Credential passport" value="Ready" detail="Current qualification status stays attached to your profile." />
              <SignalRow label="Approved work history" value="12 shifts" detail="Completed work becomes part of your usable record." />
              <SignalRow label="Familiar care settings" value="3 sites" detail="Return opportunities can recognize real prior experience." />
              <SignalRow label="Availability" value="Updated today" detail="Providers see current readiness instead of guessing." />
            </div>

            <Link to={WORKER_ENTRY_PATH} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A]">
              Open care professional access <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <aside className="border-l-2 border-[#53B59F] pl-6 sm:pl-8 lg:mt-14">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13334F] font-bold text-white">MR</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">Professional record</p>
                <p className="mt-1 text-xl font-semibold text-[#13334F]">CNA · profile ready</p>
              </div>
            </div>
            <p className="mt-6 text-2xl font-semibold leading-8 text-[#13334F]">“I shouldn’t have to prove who I am from scratch every time I pick up a shift.”</p>
            <p className="mt-5 text-sm leading-6 text-[#607583]">Covre is designed so trusted work compounds: credentials stay connected, history becomes visible, and familiar sites can recognize a returning professional.</p>
          </aside>
        </div>
      </section>

      <section id="providers" className="scroll-mt-20 bg-[#E6F6F2] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#257665]">For providers</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">See the care-relevant signals before you confirm.</h2>
              <p className="mt-5 text-lg leading-8 text-[#466170]">Coverage is not just a name against a schedule. Covre is built to bring readiness, familiarity, arrival details, and recent work history into the staffing decision.</p>
              <Link to={PROVIDER_ENTRY_PATH} className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white hover:bg-[#0B243A]">
                Open provider access <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="border-t border-[#9FCFC3]">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#9FCFC3] py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Coverage decision</p>
                  <h3 className="mt-1 text-2xl font-semibold text-[#13334F]">Memory care · Overnight CNA</h3>
                  <p className="mt-1 text-sm text-[#607583]">Tonight · 7 PM–7 AM · site requirements attached</p>
                </div>
                <span className="text-sm font-semibold text-[#257665]">Returning professional</span>
              </div>
              <DecisionRow label="Credential fit" value="Ready" note="Required items active for this shift" />
              <DecisionRow label="Site familiarity" value="Worked here before" note="3 approved shifts at this site" />
              <DecisionRow label="Recent reliability" value="4 completed shifts" note="Approved work history visible" />
              <DecisionRow label="Arrival context" value="Ready" note="Parking, entry, and site contact attached" />
              <div className="flex items-center justify-between gap-4 border-b border-[#9FCFC3] py-5">
                <span className="text-sm text-[#607583]">Decision state</span>
                <span className="text-sm font-semibold text-[#13334F]">Ready to review fit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Continuity compounds</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-5xl">A good shift should make the next one easier.</h2>
            </div>
            <div className="border-t border-[#BFCED4]">
              <ContinuityRow title="Credential continuity" body="A professional does not restart the readiness process for every opportunity." />
              <ContinuityRow title="Relationship continuity" body="Workers and care sites with real approved history are easier to bring back together." />
              <ContinuityRow title="Operational continuity" body="Completed work improves matching, staffing, and closeout decisions the next time." />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F7FAFA] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="flex flex-col gap-7 border-b border-[#BFCED4] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Care settings</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#13334F] sm:text-4xl">Built for settings where staffing context changes the care experience.</h2>
            </div>
            <Link to={PROVIDER_ENTRY_PATH} className="inline-flex items-center gap-1 text-sm font-semibold text-[#2F8E7A]">Facility access <ChevronRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 md:grid-cols-4">
            {careSettings.map(setting => <div key={setting} className="border-b border-[#DDE7E8] py-4 text-sm font-medium text-[#314858]">{setting}</div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-0 overflow-hidden px-5 sm:px-6 lg:grid-cols-2">
          <div className="bg-[#13334F] p-8 text-white sm:p-10 lg:p-12">
            <Building2 className="h-6 w-6 text-[#9EDDD0]" aria-hidden />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-[#9EDDD0]">Provider</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Need coverage with more context attached?</h2>
            <Link to={PROVIDER_ENTRY_PATH} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">Enter provider access <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="bg-[#E6F6F2] p-8 sm:p-10 lg:p-12">
            <Stethoscope className="h-6 w-6 text-[#257665]" aria-hidden />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-[#257665]">Care professional</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.04em] text-[#13334F] sm:text-4xl">Want your professional record to work harder for you?</h2>
            <Link to={WORKER_ENTRY_PATH} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#13334F]">Enter care professional access <ArrowRight className="h-4 w-4" /></Link>
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

function TrustPoint({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-center gap-2"><span className="text-[#7BD0BD]">{icon}</span><span>{text}</span></div>;
}

function SignalRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="grid gap-2 border-b border-[#DDE7E8] py-5 sm:grid-cols-[1fr_auto] sm:items-start">
      <div><p className="font-semibold text-[#13334F]">{label}</p><p className="mt-1 text-sm leading-6 text-[#607583]">{detail}</p></div>
      <span className="text-sm font-semibold text-[#257665]">{value}</span>
    </div>
  );
}

function DecisionRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="grid gap-2 border-b border-[#9FCFC3] py-5 sm:grid-cols-[0.7fr_0.8fr_1.2fr] sm:items-center">
      <span className="text-sm text-[#607583]">{label}</span>
      <span className="text-sm font-semibold text-[#13334F]">{value}</span>
      <span className="text-sm text-[#466170]">{note}</span>
    </div>
  );
}

function ContinuityRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid gap-3 border-b border-[#DDE7E8] py-6 sm:grid-cols-[44px_1fr]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]"><Check className="h-4 w-4" strokeWidth={2.5} /></span>
      <div><h3 className="text-lg font-semibold text-[#13334F]">{title}</h3><p className="mt-1 text-sm leading-6 text-[#607583]">{body}</p></div>
    </div>
  );
}