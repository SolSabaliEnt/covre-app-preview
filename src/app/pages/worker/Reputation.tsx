import { Link } from 'react-router';
import { ArrowLeft, Award, Building2, CheckCircle2, Clock, Star, TrendingUp } from 'lucide-react';
import { getWorkerReputation } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

export default function Reputation() {
  const { data: worker, error, loading, reload } = useAsyncResource(
    () => getWorkerReputation('worker-001'),
    [],
  );

  const score = worker?.covreScore ?? 94;
  const completed = worker?.completedShifts ?? 87;
  const onTime = worker?.onTimeRatePct ?? 98;
  const repeat = worker?.repeatRequests ?? 42;
  const preferred = worker?.preferredByFacilities ?? 14;

  if (loading) {
    return <div className="flex min-h-[100svh] items-center justify-center bg-white px-4 text-sm text-[#607583]">Loading your standing…</div>;
  }

  if (error) {
    return (
      <div className="min-h-[100svh] bg-white px-4 py-8 text-[#10283D]">
        <div className="mx-auto max-w-2xl">
          <Link to="/worker/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F8E7A]"><ArrowLeft className="h-4 w-4" />Account</Link>
          <div className="mt-8 border-y border-[#DDE7E8] py-10 text-center">
            <p className="text-sm text-[#607583]">{error.message}</p>
            <button type="button" onClick={reload} className="mt-4 rounded-xl bg-[#13334F] px-5 py-3 text-sm font-semibold text-white">Try again</button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: 'Completed shifts', value: completed, icon: CheckCircle2 },
    { label: 'On-time rate', value: `${onTime}%`, icon: Clock },
    { label: 'Repeat requests', value: repeat, icon: TrendingUp },
    { label: 'Preferred by facilities', value: preferred, icon: Star },
  ];

  const achievements = [
    { title: 'Credential Master', detail: 'All credentials verified and current', icon: Award },
    { title: 'Facility Familiar', detail: 'Worked at 8+ different facilities', icon: Building2 },
    { title: 'Reliable Pro', detail: '50+ completed shifts with 0 no-shows', icon: CheckCircle2 },
    { title: 'Preferred Worker', detail: 'Added to 14 facility benches', icon: Star },
  ];

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6">
        <Link to="/worker/account" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]"><ArrowLeft className="h-4 w-4" />Account</Link>

        <header className="mt-5 border-b border-[#DDE7E8] pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Your standing</p>
          <div className="mt-3 flex items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Covre Score</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#607583]">A simple view of the reliability and repeat-work signals building behind your profile.</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-6xl font-semibold tracking-[-0.05em] text-[#13334F]">{score}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2F8E7A]">Excellent standing</p>
            </div>
          </div>
        </header>

        <section className="border-b border-[#DDE7E8] py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">What’s driving it</p>
          <div className="mt-3 border-t border-[#BFCED4]">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 border-b border-[#DDE7E8] py-4">
                <Icon className="h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
                <span className="flex-1 text-sm font-medium text-[#466170]">{label}</span>
                <span className="text-lg font-semibold text-[#13334F]">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Recognition</p>
          <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Signals your work has earned</h2>
          <div className="mt-4 border-t border-[#BFCED4]">
            {achievements.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="flex items-start gap-3 border-b border-[#DDE7E8] py-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
                <div>
                  <h3 className="font-semibold text-[#13334F]">{title}</h3>
                  <p className="mt-1 text-sm text-[#607583]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#9AAAB3]">Covre Score is a summary of work-history signals. It is not a public star rating.</p>
        </section>
      </div>
    </div>
  );
}
