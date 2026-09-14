import { StatusBadge } from '../../components/StatusBadge';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import { AlertOctagon, FileWarning, Home, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { listTrustSafetyFlags } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

const TRUST_ICONS = [AlertOctagon, FileWarning, Home, Repeat] as const;

function Sev({ level }: { level: 'high' | 'medium' | 'low' }) {
  if (level === 'high') return <StatusBadge variant="urgent">High</StatusBadge>;
  if (level === 'medium') return <StatusBadge variant="pending">Medium</StatusBadge>;
  return <StatusBadge variant="new">Low</StatusBadge>;
}

function RowActions({ label }: { label: string }) {
  return (
    <div className="flex flex-wrap gap-3 text-xs font-semibold">
      <button type="button" onClick={() => toast(`${label}: review queued`)} className="text-[#13334F] hover:text-[#2F8E7A]">Review</button>
      <button type="button" onClick={() => toast(`${label}: suspension draft saved`)} className="text-[#A93636] hover:text-[#7E2929]">Suspend</button>
      <button type="button" onClick={() => toast(`${label}: flag cleared`)} className="text-[#607583] hover:text-[#13334F]">Clear flag</button>
    </div>
  );
}

export default function TrustSafety() {
  const { data, error, loading, reload } = useAsyncResource(() => listTrustSafetyFlags(), []);

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading trust signals…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;
  if (!data) return null;

  const { metrics: trustMetrics, flaggedWorkers, flaggedProviders, riskSignals } = data;

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Risk + identity</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Trust &amp; Safety</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Review the people and organizations behind each flag, not just the signal attached to them.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-6">
        <section className="grid gap-5 border-y border-[#DDE7E8] py-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustMetrics.map((metric, index) => {
            const Icon = TRUST_ICONS[index] ?? AlertOctagon;
            return <div key={metric.label} className="flex items-start gap-3"><Icon className={`mt-1 h-5 w-5 ${metric.tone === 'danger' ? 'text-[#D94A4A]' : metric.tone === 'warn' ? 'text-[#9B6419]' : 'text-[#607583]'}`} /><div><p className="text-2xl font-semibold text-[#13334F]">{metric.value}</p><p className="text-sm text-[#607583]">{metric.label}</p></div></div>;
          })}
        </section>

        <section>
          <div className="mb-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">People</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Flagged workers</h2></div>
          <div className="overflow-x-auto border-t border-[#BFCED4]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Worker</th><th className="p-3">Role</th><th className="p-3">Issue</th><th className="p-3">Severity</th><th className="p-3">Last activity</th><th className="p-3">Actions</th></tr></thead><tbody>{flaggedWorkers.map(row => <tr key={row.id} className="border-b border-[#DDE7E8]"><td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="worker" name={row.name} entityId={row.id} size="md" /><span className="font-semibold text-[#13334F]">{row.name}</span></div></td><td className="p-3 text-[#607583]">{row.role}</td><td className="max-w-xs p-3 text-[#10283D]">{row.issue}</td><td className="p-3"><Sev level={row.severity} /></td><td className="p-3 text-[#607583]">{row.lastActivity}</td><td className="p-3"><RowActions label={row.name} /></td></tr>)}</tbody></table></div>
        </section>

        <section>
          <div className="mb-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Organizations</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Flagged providers</h2></div>
          <div className="overflow-x-auto border-t border-[#BFCED4]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Provider</th><th className="p-3">Type</th><th className="p-3">Issue</th><th className="p-3">Severity</th><th className="p-3">Last activity</th><th className="p-3">Actions</th></tr></thead><tbody>{flaggedProviders.map(row => <tr key={row.id} className="border-b border-[#DDE7E8]"><td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={row.name} entityId={row.id} size="md" /><span className="font-semibold text-[#13334F]">{row.name}</span></div></td><td className="p-3 text-[#607583]">{row.type}</td><td className="max-w-xs p-3 text-[#10283D]">{row.issue}</td><td className="p-3"><Sev level={row.severity} /></td><td className="p-3 text-[#607583]">{row.lastActivity}</td><td className="p-3"><RowActions label={row.name} /></td></tr>)}</tbody></table></div>
        </section>

        <section>
          <div className="mb-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">System signals</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Risk patterns</h2></div>
          <div className="border-t border-[#BFCED4]">{riskSignals.map(row => <div key={row.id} className="grid gap-3 border-b border-[#DDE7E8] py-4 md:grid-cols-[1.2fr_0.8fr_2fr_auto_auto] md:items-center"><div className="font-semibold text-[#13334F]">{row.name}</div><div className="text-sm text-[#607583]">{row.type}</div><div className="text-sm text-[#10283D]">{row.issue}</div><Sev level={row.severity} /><RowActions label={row.name} /></div>)}</div>
        </section>
      </main>
    </div>
  );
}
