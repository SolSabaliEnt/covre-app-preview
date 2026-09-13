import { Link } from 'react-router';
import { ArrowRight, BadgeCheck, MapPin, Repeat2 } from 'lucide-react';
import { CovreBrandLogo } from '../../components/CovreBrandLogo';
import { WORKER_ENTRY_PATH } from '../../lib/entryRoutes';

const promises = [
  {
    icon: MapPin,
    title: 'Know before you go',
    detail: 'See the pay, timing, setting, distance, and what the shift expects before you request it.',
  },
  {
    icon: BadgeCheck,
    title: 'Bring your readiness with you',
    detail: 'Keep your worker profile and credential status together instead of starting over every shift.',
  },
  {
    icon: Repeat2,
    title: 'Build on good shifts',
    detail: 'Covre remembers approved work history so familiar places can become easier to spot and return to.',
  },
];

export default function Welcome() {
  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-2xl flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-8">
        <header className="flex items-center justify-between border-b border-[#DDE7E8] pb-5">
          <CovreBrandLogo surface="light" markSize={42} />
          <Link
            to={WORKER_ENTRY_PATH}
            className="text-sm font-semibold text-[#607583] transition-colors hover:text-[#13334F]"
          >
            Sign in
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8E7A]">For care workers</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.045em] text-[#13334F] sm:text-5xl">
            Take the shift with more of the story.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#607583] sm:text-lg">
            Covre helps you compare real care shifts, understand what you’re walking into, and build on the places where the work goes well.
          </p>

          <section className="mt-9 border-t border-[#BFCED4]" aria-label="What Covre gives care workers">
            {promises.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-[#DDE7E8] py-4">
                <Icon className="mt-0.5 h-5 w-5 text-[#2F8E7A]" aria-hidden />
                <div>
                  <h2 className="font-semibold text-[#13334F]">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-[#607583]">{detail}</p>
                </div>
              </div>
            ))}
          </section>
        </main>

        <div className="border-t border-[#DDE7E8] pt-5">
          <Link
            to="/worker/onboarding"
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A]"
          >
            Build my worker profile
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-3 text-center text-xs leading-5 text-[#9AAAB3]">
            Start with your role and basic profile. Credential readiness comes next.
          </p>
        </div>
      </div>
    </div>
  );
}
