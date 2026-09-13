import { Link } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Bookmark, Calendar, History, Shield, Star, Users } from 'lucide-react';
import { getProviderBench, inviteWorkerToShift } from '../../services';
import { useProviderAction } from '../../hooks/useProviderAction';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import type { ProviderBenchWorker } from '../../services/types';
import { ProviderWorkerAvatar } from '../../components/ProviderWorkerAvatar';

function LoadingBlock() {
  return <div className="border-y border-[#DDE7E8] py-12 text-center text-sm text-[#607583]">Loading bench…</div>;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white">Try again</button>
    </div>
  );
}

function BenchEmptyState({ message }: { message?: string }) {
  return (
    <section className="border-b border-[#DDE7E8] py-10 text-center">
      <h2 className="text-lg font-semibold text-[#13334F]">No bench relationships yet.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607583]">{message ?? 'Workers you deliberately save will appear here. Approved work history remains separate.'}</p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/provider/workers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white"><Users className="h-4 w-4" />View workers</Link>
        <Link to="/provider/shifts" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE7E8] px-5 text-sm font-semibold text-[#13334F]"><Calendar className="h-4 w-4" />Open shifts</Link>
      </div>
    </section>
  );
}

function WorkerRow({ worker, isSupabase, isSaved, sectionTitle, invited, isPending, onInvite }: {
  worker: ProviderBenchWorker;
  isSupabase: boolean;
  isSaved: boolean;
  sectionTitle: string;
  invited: boolean;
  isPending: (key: string) => boolean;
  onInvite: (worker: ProviderBenchWorker, sectionTitle: string) => void;
}) {
  const role = worker.roleLabel ?? 'Care worker';
  const approvedCount = worker.completedShiftCount ?? worker.shifts ?? 0;
  const score = worker.score ?? 0;

  return (
    <article className="border-b border-[#DDE7E8] py-5">
      <div className="flex items-start gap-4">
        <ProviderWorkerAvatar workerId={worker.id} name={worker.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link to={`/provider/workers/${worker.id}`} className="font-semibold text-[#13334F] no-underline hover:text-[#2F8E7A]">{worker.name}</Link>
            {isSupabase && isSaved ? <span className="text-xs font-semibold text-[#257665]">Saved to bench</span> : null}
          </div>
          <p className="mt-1 text-sm text-[#607583]">{role}</p>
          {isSupabase ? (
            <p className="mt-2 text-xs leading-5 text-[#9AAAB3]">{approvedCount > 0 ? `${approvedCount} approved ${approvedCount === 1 ? 'shift' : 'shifts'} together${worker.lastWorkedAt ? ` · Last ${worker.lastWorkedAt}` : ''}` : 'Saved intentionally · no approved work together yet'}</p>
          ) : (
            <div className="mt-3 flex gap-5 text-sm text-[#607583]">
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4" /> <strong className="text-[#13334F]">{score}</strong> score</span>
              <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4" /> <strong className="text-[#13334F]">{approvedCount}</strong> shifts</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 pl-15">
        <Link to={`/provider/workers/${worker.id}`} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A] no-underline">{approvedCount > 0 ? 'View shared history' : 'View profile'} <ArrowRight className="h-4 w-4" /></Link>
        {!isSupabase ? <button type="button" disabled={invited || isPending(`bench-invite-${sectionTitle}-${worker.id}`)} onClick={() => onInvite(worker, sectionTitle)} className="min-h-10 text-sm font-semibold text-[#13334F] disabled:opacity-50">{invited ? 'Invited' : 'Invite to shift'}</button> : null}
      </div>
    </article>
  );
}

export default function Bench() {
  const { run, isPending } = useProviderAction();
  const { data, error, loading, reload } = useAsyncResource(() => getProviderBench(), []);
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const handleMockInvite = async (worker: ProviderBenchWorker, sectionTitle: string) => {
    const r = await run(`bench-invite-${sectionTitle}-${worker.id}`, () => inviteWorkerToShift(worker.id));
    if (r.ok) { toast.success(r.data.message); setInvited(prev => ({ ...prev, [worker.id]: true })); }
    else toast.error(r.error.message);
  };

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error?.message ?? 'Unable to load bench.'} onRetry={reload} />;

  const isSupabase = data.isSupabaseBacked;
  const hasWorkers = data.sections.some(s => s.workers.length > 0);
  const totalWorkers = data.sections.reduce((sum, section) => sum + section.workers.length, 0);

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Preferred people</p>
          <div className="mt-2 flex items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Covre Bench</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Keep trusted workers close without confusing preference with work history.</p></div><div className="shrink-0 text-right"><p className="text-2xl font-semibold text-[#13334F]">{totalWorkers}</p><p className="text-xs text-[#607583]">workers</p></div></div>
        </header>
        {isSupabase ? <section className="border-b border-[#DDE7E8] py-5"><div className="flex items-start gap-3"><Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" /><div><p className="font-semibold text-[#13334F]">Bench = deliberate provider preference.</p><p className="mt-1 text-sm leading-6 text-[#607583]">Approved work can make someone familiar without saving them here. Worker return preferences stay private.</p></div></div></section> : null}
        {isSupabase && !hasWorkers ? <BenchEmptyState message={data.message} /> : null}
        {data.sections.map(section => section.workers.length === 0 ? null : (
          <section key={section.title} className="pt-7">
            <div className="flex items-end justify-between gap-4 pb-3"><div><div className="flex items-center gap-2">{isSupabase && section.title === 'Saved to your Bench' ? <Bookmark className="h-4 w-4 text-[#2F8E7A]" /> : isSupabase ? <History className="h-4 w-4 text-[#607583]" /> : null}<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">{section.title}</p></div>{isSupabase ? <p className="mt-1 text-sm text-[#607583]">{section.title === 'Saved to your Bench' ? 'Explicitly saved by your organization.' : 'Known through approved work, not yet saved.'}</p> : null}</div><span className="text-xs font-semibold text-[#7A8D98]">{section.workers.length}</span></div>
            <div className="border-t border-[#BFCED4]">{section.workers.map(worker => <WorkerRow key={`${section.title}-${worker.id}`} worker={worker} isSupabase={isSupabase} isSaved={section.title === 'Saved to your Bench'} sectionTitle={section.title} invited={Boolean(invited[worker.id])} isPending={isPending} onInvite={handleMockInvite} />)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
