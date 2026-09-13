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
  Sparkles,
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

const providerBenefits = [
  'Post the real requirements, not just the hours',
  'Review worker fit, credentials, and site familiarity',
  'Track the shift, approve time, and keep the record together',
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-28 h-96 w-96 rounded-full bg-[#53B59F]/10 blur-3xl" />
          <div className="absolute -bottom-44 left-1/4 h-96 w-96 rounded-full bg-white/[0.04] blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-5 sm:px-6 lg:pb-24 lg:pt-6">
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

            <nav className="hidden items-center gap-7 text-sm font-medium text-white/75 md:flex" aria-label="Primary">
              <a href="#how-it-works" className="transition-colors hover:text-white">
                How it works
              </a>
              <a href="#providers" className="transition-colors hover:text-white">
                Providers
              </a>
              <a href="#workers" className="transition-colors hover:text-white">
                Care workers
              </a>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/auth"
                className="hidden min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to={PROVIDER_ENTRY_PATH}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#13334F] shadow-sm transition-transform hover:-translate-y-0.5 sm:px-5"
              >
                Facility access
              </Link>
            </div>
          </header>

          <div className="grid items-center gap-12 pb-2 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pt-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#DCEBE7]">
                <ShieldCheck className="h-4 w-4 text-[#7BD0BD]" aria-hidden />
                Care staffing built around trust
              </div>

              <h1 className="mt-6 text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.65rem]">
                Fill the shift.
                <br />
                Know who&apos;s walking through the door.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-white/78 sm:text-xl">
                Covre helps care providers cover open shifts with qualified professionals — and gives care workers the context they need before they commit.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={PROVIDER_ENTRY_PATH}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#53B59F] px-6 text-base font-semibold text-white shadow-[0_14px_40px_rgba(83,181,159,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#2F8E7A]"
                >
                  Cover a shift
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <Link
                  to={WORKER_ENTRY_PATH}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] px-6 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/[0.11]"
                >
                  Find care shifts
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-white/72 sm:grid-cols-3">
                <TrustPoint icon={<BadgeCheck className="h-4 w-4" />} text="Credential-aware" />
                <TrustPoint icon={<MapPin className="h-4 w-4" />} text="Site-ready context" />
                <TrustPoint icon={<FileCheck2 className="h-4 w-4" />} text="Shift-level record" />
              </div>
            </div>

            <HeroProductPreview />
          </div>
        </div>
      </section>

      <section className="border-b border-[#DDE7E8] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-sm font-medium text-[#607583] sm:px-6 lg:justify-between">
          <span>Built for the places where care actually happens</span>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#314858] lg:justify-end">
            <span>CNAs</span>
            <span>DSPs</span>
            <span>LPNs</span>
            <span>RNs</span>
            <span>Care teams</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#F7FAFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <SectionHeading
            eyebrow="How Covre works"
            title="From “we have a hole” to covered in three clear steps."
            body="The best staffing experience is the one that removes uncertainty. Covre keeps the important context with the shift from post to closeout."
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <ProcessStep
              number="01"
              icon={<Clock3 className="h-5 w-5" />}
              title="Post the real shift"
              body="Role, rate, timing, credential needs, site expectations, contacts, and the details workers usually have to chase down."
            />
            <ProcessStep
              number="02"
              icon={<UsersRound className="h-5 w-5" />}
              title="Match for fit, not volume"
              body="Review qualified workers with the context that matters: readiness, history, credentials, and whether they know the site."
            />
            <ProcessStep
              number="03"
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Close the loop"
              body="Track the work, approve time, and keep the shift record connected so coverage is something your team can see and stand behind."
            />
          </div>
        </div>
      </section>

      <section id="providers" className="scroll-mt-20 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <ProviderProductPreview />

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E8EEF2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#13334F]">
              <Building2 className="h-4 w-4" aria-hidden />
              For providers
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#13334F] sm:text-5xl">
              Coverage without the scramble.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#607583]">
              Your team does not need a flood of random applicants. It needs the right person for the specific site, shift, and level of care.
            </p>

            <div className="mt-8 space-y-4">
              {providerBenefits.map(item => (
                <BenefitRow key={item} text={item} />
              ))}
            </div>

            <Link
              to={PROVIDER_ENTRY_PATH}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A]"
            >
              Preview the provider workspace
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section id="workers" className="scroll-mt-20 border-y border-[#DDE7E8] bg-[#F7FAFA] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F6F2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#257665]">
              <Stethoscope className="h-4 w-4" aria-hidden />
              For care professionals
            </div>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#13334F] sm:text-5xl">
              Know before you go.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#607583]">
              A flexible shift should not mean walking in blind. Covre puts the details, expectations, and trust signals in front of you before you accept.
            </p>

            <div className="mt-8 space-y-4">
              {workerBenefits.map(item => (
                <BenefitRow key={item} text={item} accent />
              ))}
            </div>

            <Link
              to={WORKER_ENTRY_PATH}
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A]"
            >
              Preview the worker experience
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <WorkerProductPreview />
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <SectionHeading
            eyebrow="Built for repeat trust"
            title="Good coverage should get easier the next time."
            body="The strongest part of a staffing network is not endless churn. It is accumulated trust: credentials that carry forward, sites that become familiar, and reliable relationships that compound."
          />

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <TrustCard
              icon={<ShieldCheck className="h-6 w-6" />}
              title="Credential passport"
              body="Keep worker readiness connected to the professional instead of restarting the proof process every shift."
            />
            <TrustCard
              icon={<HeartHandshake className="h-6 w-6" />}
              title="Familiarity that matters"
              body="Surface workers and sites with real history so good relationships can become an operating advantage."
            />
            <TrustCard
              icon={<FileCheck2 className="h-6 w-6" />}
              title="A defensible record"
              body="Make documentation part of the workflow, not a late-night scavenger hunt through texts and screenshots."
            />
          </div>
        </div>
      </section>

      <section className="bg-[#E8EEF2] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#257665]">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Care settings served
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#13334F] sm:text-4xl">
                  One coverage loop, across the settings where care teams need relief.
                </h2>
              </div>
              <Link
                to={PROVIDER_ENTRY_PATH}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] bg-white px-5 text-sm font-semibold text-[#13334F] transition-colors hover:border-[#53B59F]"
              >
                Explore facility access
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {careSettings.map(setting => (
                <span key={setting} className="rounded-full border border-[#DDE7E8] bg-white px-4 py-2 text-sm font-medium text-[#314858]">
                  {setting}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#13334F] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-6">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#DCEBE7]">
            <CheckCircle2 className="h-4 w-4 text-[#7BD0BD]" aria-hidden />
            Care staffing. Covered.
          </div>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Make the next open shift feel less urgent.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Choose the workspace that fits you and see how Covre turns coverage into a visible, accountable workflow.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={PROVIDER_ENTRY_PATH}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#53B59F] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2F8E7A]"
            >
              I manage care coverage
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link
              to={WORKER_ENTRY_PATH}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/[0.06] px-6 text-base font-semibold text-white transition-colors hover:bg-white/[0.11]"
            >
              I&apos;m a care professional
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B243A] py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <img
              src={LANDING_LOGO_SRC}
              alt="Covre"
              width={906}
              height={209}
              loading="lazy"
              decoding="async"
              className={LANDING_LOGO_FOOTER_CLASS}
            />
            <p className="mt-3 text-sm text-[#9AAAB3]">© 2026 Covre. Care staffing. Covered.</p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-white/65">
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
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#7BD0BD]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function HeroProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:mr-0">
      <div className="absolute -left-5 top-10 hidden h-20 w-20 rounded-3xl border border-white/10 bg-white/[0.05] lg:block" />
      <div className="relative rounded-[2rem] border border-white/12 bg-white/[0.08] p-3 shadow-[0_35px_100px_rgba(2,15,27,0.35)] backdrop-blur-sm sm:p-4">
        <div className="rounded-[1.5rem] bg-white p-4 text-[#10283D] sm:p-5">
          <div className="flex items-start justify-between gap-4 border-b border-[#EEF4F5] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">Tonight · 7:00 PM–7:00 AM</p>
              <h3 className="mt-1 text-lg font-semibold text-[#13334F]">CNA · Memory care</h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#607583]">
                <MapPin className="h-4 w-4" aria-hidden />
                Residential care site
              </p>
            </div>
            <span className="rounded-full bg-[#FFF4E0] px-3 py-1 text-xs font-semibold text-[#9B6419]">Urgent</span>
          </div>

          <div className="space-y-3 py-4">
            <div className="rounded-2xl border border-[#DDE7E8] bg-[#F7FAFA] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] text-sm font-bold text-[#257665]">MR</div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#13334F]">Matched care professional</p>
                    <p className="mt-0.5 text-sm text-[#607583]">Credential-ready · site-ready · worked here before</p>
                  </div>
                </div>
                <BadgeCheck className="h-5 w-5 shrink-0 text-[#257665]" aria-hidden />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Credentials" value="Ready" icon={<ShieldCheck className="h-4 w-4" />} />
              <MiniStat label="Site context" value="Reviewed" icon={<FileCheck2 className="h-4 w-4" />} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#E6F6F2] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#257665]">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-[#607583]">Shift status</p>
                <p className="font-semibold text-[#13334F]">Covered</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#257665]">Record connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#DDE7E8] bg-white p-3.5">
      <div className="flex items-center gap-2 text-[#257665]">{icon}<span className="text-xs font-medium text-[#607583]">{label}</span></div>
      <p className="mt-2 text-sm font-semibold text-[#13334F]">{value}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.13em] text-[#2F8E7A]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-[#13334F] sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-[#607583]">{body}</p>
    </div>
  );
}

function ProcessStep({ number, icon, title, body }: { number: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group rounded-[1.5rem] border border-[#DDE7E8] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-[0.12em] text-[#9AAAB3]">{number}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F6F2] text-[#257665]">{icon}</div>
      </div>
      <h3 className="mt-8 text-xl font-semibold text-[#13334F]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#607583]">{body}</p>
    </div>
  );
}

function BenefitRow({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${accent ? 'bg-[#E6F6F2] text-[#257665]' : 'bg-[#E8EEF2] text-[#13334F]'}`}>
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      </div>
      <p className="text-base leading-7 text-[#314858]">{text}</p>
    </div>
  );
}

function ProviderProductPreview() {
  return (
    <div className="rounded-[2rem] border border-[#DDE7E8] bg-[#F7FAFA] p-4 shadow-[0_24px_80px_rgba(19,51,79,0.10)] sm:p-5">
      <div className="rounded-[1.45rem] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">Today&apos;s coverage</p>
            <h3 className="mt-1 text-xl font-semibold text-[#13334F]">Coverage command center</h3>
          </div>
          <div className="rounded-xl bg-[#E6F6F2] p-2.5 text-[#257665]">
            <Building2 className="h-5 w-5" aria-hidden />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <Metric label="Open" value="8" tone="urgent" />
          <Metric label="Covered" value="42" tone="good" />
          <Metric label="On site" value="5" />
        </div>

        <div className="mt-5 space-y-2.5">
          <CoverageRow title="Memory Care · Overnight" subtitle="CNA · 7 PM–7 AM" status="Covered" />
          <CoverageRow title="Group Home · Evening" subtitle="DSP · 3 PM–11 PM" status="Needs match" warning />
          <CoverageRow title="Residential · Day" subtitle="LPN · 7 AM–3 PM" status="Covered" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'urgent' | 'good' }) {
  const toneClass = tone === 'urgent' ? 'text-[#A93636]' : tone === 'good' ? 'text-[#257665]' : 'text-[#13334F]';
  return (
    <div className="rounded-xl border border-[#DDE7E8] bg-[#F7FAFA] p-3">
      <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[11px] font-medium text-[#607583]">{label}</p>
    </div>
  );
}

function CoverageRow({ title, subtitle, status, warning = false }: { title: string; subtitle: string; status: string; warning?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#DDE7E8] px-3.5 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#13334F]">{title}</p>
        <p className="mt-0.5 text-xs text-[#607583]">{subtitle}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${warning ? 'bg-[#FFF4E0] text-[#9B6419]' : 'bg-[#E6F6F2] text-[#257665]'}`}>
        {status}
      </span>
    </div>
  );
}

function WorkerProductPreview() {
  return (
    <div className="rounded-[2rem] border border-[#DDE7E8] bg-white p-4 shadow-[0_24px_80px_rgba(19,51,79,0.10)] sm:p-5">
      <div className="rounded-[1.45rem] bg-[#13334F] p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Shift preview</p>
            <h3 className="mt-1 text-xl font-semibold">Memory care · CNA</h3>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#DCEBE7]">Familiar site</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <DarkStat label="When" value="Tonight · 7 PM" />
          <DarkStat label="Pay" value="Rate shown upfront" />
          <DarkStat label="Credentials" value="Ready" />
          <DarkStat label="Site history" value="Worked here before" />
        </div>
      </div>

      <div className="px-1 pb-1 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#607583]">Know before you go</p>
        <div className="mt-3 space-y-2.5">
          <ReadyRow text="Arrival and parking instructions" />
          <ReadyRow text="Site expectations and contact" />
          <ReadyRow text="Credential and readiness check" />
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-[#E6F6F2] px-4 py-3">
          <div>
            <p className="text-xs text-[#607583]">Your status</p>
            <p className="mt-0.5 text-sm font-semibold text-[#13334F]">Ready to review</p>
          </div>
          <div className="rounded-lg bg-white p-2 text-[#257665]">
            <BadgeCheck className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}

function DarkStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
      <p className="text-[11px] font-medium text-white/55">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ReadyRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#DDE7E8] bg-[#F7FAFA] px-3.5 py-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]">
        <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
      </div>
      <p className="text-sm font-medium text-[#314858]">{text}</p>
    </div>
  );
}

function TrustCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[#DDE7E8] bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F6F2] text-[#257665]">{icon}</div>
      <h3 className="mt-6 text-xl font-semibold text-[#13334F]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-[#607583]">{body}</p>
    </div>
  );
}
