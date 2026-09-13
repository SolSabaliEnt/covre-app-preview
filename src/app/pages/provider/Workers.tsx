import { Link } from 'react-router';
import { ArrowRight, Calendar, Heart, History, Repeat2, Users } from 'lucide-react';
import {
  getProviderBench,
  listCurrentProviderWorkerContinuity,
  listProviderShifts,
  trackContinuityEvent,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import type { ProviderBenchWorker } from '../../services/types';
import type { ProviderWorkerContinuity } from '../../services/continuityService';
import { ProviderWorkerAvatar } from '../../components/ProviderWorkerAvatar';

function relationshipCount(worker: ProviderBenchWorker): number {
  return worker.completedShiftCount ?? worker.shifts ?? 0;
}

function buildKnownWorkers(sections: { workers: ProviderBenchWorker[] }[]): ProviderBenchWorker[] {
  const byId = new Map<string, ProviderBenchWorker>();
  for (const section of sections) {
    for (const worker of section.workers) {
      const existing = byId.get(worker.id);
      if (!existing || relationshipCount(worker) > relationshipCount(existing)) byId.set(worker.id, worker);
    }
  }
  return [...byId.values()].filter(worker => relationshipCount(worker) > 0).sort((a, b) => relationshipCount(b) - relationshipCount(a));
}

function mergeCanonicalContinuity(workers: ProviderBenchWorker[], continuity: ProviderWorkerContinuity[] | undefined, useCanonical: boolean): ProviderBenchWorker[] {
  if (!useCanonical) return workers;
  const byWorker = new Map((continuity ?? []).map(row => [row.workerId, row]));
  return workers
    .map(worker => {
      const row = byWorker.get(worker.id);
      return { ...worker, completedShiftCount: row?.approvedShiftCount ?? 0, lastWorkedAt: row?.lastWorkedLabel };
    })
    .filter(worker => (worker.completedShiftCount ?? 0) > 0)
    .sort((a, b) => (b.completedShiftCount ?? 0) - (a.completedShiftCount ?? 0));
}

export default function ProviderWorkers() {
  const { data: shifts, loading: shiftsLoading } = useAsyncResource(() => listProviderShifts(), []);
  const { data: bench, loading: benchLoading } = useAsyncResource(() => getProviderBench(), []);
  const { data: canonicalContinuity, loading: continuityLoading } = useAsyncResource(() => listCurrentProviderWorkerContinuity(), []);

  const openShifts = shifts?.filter(s => s.providerBoardStatus === 'urgent' || s.providerBoardStatus === 'pending') ?? [];
  const matchTargets = openShifts.slice(0, 5);
  const isSupabase = Boolean(bench?.isSupabaseBacked);
  const knownWorkers = mergeCanonicalContinuity(buildKnownWorkers(bench?.sections ?? []), canonicalContinuity, isSupabase).slice(0, 8);
  const repeatWorkers = knownWorkers.filter(worker => relationshipCount(worker) > 1);
  const historyLoading = benchLoading || (isSupabase && continuityLoading);

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Provider continuity</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div><h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Workers</h1><p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">See who your organization already knows, then use that history when coverage opens again.</p></div>
            <div className="shrink-0 text-right"><p className="text-2xl font-semibold text-[#13334F]">{historyLoading ? '—' : repeatWorkers.length}</p><p className="text-xs text-[#607583]">repeat</p></div>
          </div>
        </header>

        <section className="border-b border-[#DDE7E8] py-5">
          <div className="flex items-start gap-3"><Repeat2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" /><div><p className="font-semibold text-[#13334F]">Working history stays visible.</p><p className="mt-1 text-sm leading-6 text-[#607583]">{historyLoading ? 'Loading the workers your organization already knows…' : repeatWorkers.length > 0 ? `${repeatWorkers.length} ${repeatWorkers.length === 1 ? 'worker has' : 'workers have'} more than one approved shift with your organization.` : knownWorkers.length > 0 ? 'Approved history is already building. Repeat relationships will surface as you work together again.' : 'Once approved work exists, Covre will remember the relationship instead of treating every shift like a first meeting.'}</p></div></div>
        </section>

        {knownWorkers.length > 0 ? (
          <section className="pt-7">
            <div className="flex items-end justify-between gap-4 pb-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">People you know</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Repeat-worker memory</h2></div><Link to="/provider/bench" className="text-sm font-semibold text-[#2F8E7A]">Bench</Link></div>
            <div className="border-t border-[#BFCED4]">
              {knownWorkers.map(worker => {
                const count = relationshipCount(worker);
                const repeat = count > 1;
                const regular = count >= 5;
                return (
                  <article key={worker.id} className="border-b border-[#DDE7E8] py-5">
                    <div className="flex items-start gap-4">
                      <ProviderWorkerAvatar workerId={worker.id} name={worker.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/provider/workers/${worker.id}`} onClick={() => repeat && trackContinuityEvent('provider_repeat_worker_open', { actor: 'provider', workerId: worker.id, source: 'workers_workspace_name', completedShiftsHere: count })} className="font-semibold text-[#13334F] no-underline hover:text-[#2F8E7A]">{worker.name}</Link>
                          {repeat ? <span className="text-xs font-semibold text-[#257665]">{regular ? 'Regular with you' : 'Worked together before'}</span> : null}
                        </div>
                        <p className="mt-1 text-sm text-[#607583]">{worker.roleLabel ?? 'Care worker'}</p>
                        {worker.lastWorkedAt ? <p className="mt-1 text-xs text-[#9AAAB3]">Last approved work {worker.lastWorkedAt}</p> : null}
                      </div>
                      <div className="shrink-0 text-right"><p className="text-2xl font-semibold text-[#13334F]">{count}</p><p className="text-xs text-[#607583]">approved shifts</p></div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 pl-[3.75rem]">
                      <Link to={`/provider/workers/${worker.id}`} onClick={() => repeat && trackContinuityEvent('provider_repeat_worker_open', { actor: 'provider', workerId: worker.id, source: 'workers_workspace_shared_history', completedShiftsHere: count })} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2F8E7A]"><History className="h-4 w-4" /> {repeat ? 'View shared history' : 'View profile'}</Link>
                      <Link to="/provider/shifts" onClick={() => repeat && trackContinuityEvent('provider_return_intent', { actor: 'provider', workerId: worker.id, source: 'workers_workspace_work_together_again', completedShiftsHere: count })} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#13334F]"><Calendar className="h-4 w-4" /> {repeat ? 'Work together again' : 'Find a shift'}</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="pt-8">
          <div className="flex items-start gap-3 pb-3"><Users className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" /><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Need coverage now?</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Match workers to an open shift</h2></div></div>
          <div className="border-t border-[#BFCED4]">{shiftsLoading ? <p className="py-5 text-sm text-[#607583]">Loading open shifts…</p> : matchTargets.length === 0 ? <p className="py-5 text-sm text-[#607583]">No open shifts right now.</p> : matchTargets.map(shift => <Link key={shift.id} to={`/provider/worker-match/${shift.id}`} className="flex min-h-14 items-center justify-between gap-4 border-b border-[#DDE7E8] py-3 no-underline"><div className="min-w-0"><p className="font-semibold text-[#13334F]">{shift.roleTitle}</p><p className="mt-0.5 text-sm text-[#607583]">{shift.siteName}</p></div><ArrowRight className="h-5 w-5 shrink-0 text-[#2F8E7A]" /></Link>)}</div>
        </section>

        <div className="mt-8 flex gap-5 border-t border-[#DDE7E8] pt-5 text-sm font-semibold"><Link to="/provider/shifts" className="inline-flex items-center gap-2 text-[#13334F]"><Calendar className="h-4 w-4" />All shifts</Link><Link to="/provider/bench" className="inline-flex items-center gap-2 text-[#2F8E7A]"><Heart className="h-4 w-4" />Covre Bench</Link></div>
      </div>
    </div>
  );
}
