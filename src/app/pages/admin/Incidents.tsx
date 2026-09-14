import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Shield, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import { listAdminIncidentQueue } from '../../services';
import type { AdminIncidentRow, AdminIncidentSeverity, AdminIncidentStatus } from '../../services/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';

type Filter = 'all' | 'open' | 'critical' | 'escalated' | 'safety';

function severityBadge(severity: AdminIncidentSeverity) {
  if (severity === 'critical' || severity === 'high') return <StatusBadge variant="urgent">{severity}</StatusBadge>;
  if (severity === 'medium') return <StatusBadge variant="pending">medium</StatusBadge>;
  return <StatusBadge variant="new">low</StatusBadge>;
}

function statusBadge(status: AdminIncidentStatus) {
  if (status === 'resolved') return <StatusBadge variant="covered">Resolved</StatusBadge>;
  if (status === 'escalated') return <StatusBadge variant="urgent">Escalated</StatusBadge>;
  if (status === 'under_review') return <StatusBadge variant="pending">Under review</StatusBadge>;
  if (status === 'awaiting_statement') return <StatusBadge variant="pending">Awaiting statement</StatusBadge>;
  return <StatusBadge variant="new">Open</StatusBadge>;
}

function filterRows(rows: AdminIncidentRow[], filter: Filter): AdminIncidentRow[] {
  if (filter === 'all') return rows;
  if (filter === 'open') return rows.filter(row => row.status !== 'resolved');
  if (filter === 'critical') return rows.filter(row => row.severity === 'critical' || row.severity === 'high');
  if (filter === 'escalated') return rows.filter(row => row.status === 'escalated');
  return rows.filter(row => row.source === 'safety_report');
}

export default function Incidents() {
  const [filter, setFilter] = useState<Filter>('open');
  const { data, error, loading, reload } = useAsyncResource(() => listAdminIncidentQueue(), []);
  const rows = useMemo(() => filterRows(data?.rows ?? [], filter), [data?.rows, filter]);

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading incident queue…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: 'open', label: 'Open', count: data?.openCount },
    { id: 'critical', label: 'High risk', count: data?.criticalCount },
    { id: 'escalated', label: 'Escalated', count: data?.escalatedCount },
    { id: 'safety', label: 'Safety reports' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Risk + resolution</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Incident management</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Keep the worker, provider, shift, and severity visible together while reviewing an incident.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="flex flex-wrap gap-6 border-b border-[#DDE7E8]">
          {filters.map(item => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`border-b-2 pb-3 text-sm font-semibold ${filter === item.id ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#607583]'}`}>{item.label}{item.count !== undefined ? ` ${item.count}` : ''}</button>)}
        </div>

        <div className="mt-5 overflow-x-auto border-t border-[#BFCED4]">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Incident</th><th className="p-3">Worker</th><th className="p-3">Provider</th><th className="p-3">Severity</th><th className="p-3">Status</th><th className="p-3">Shift</th><th className="p-3">Action</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={`${row.source}-${row.id}`} className="border-b border-[#DDE7E8]">
                  <td className="p-3"><div className="flex items-start gap-2">{row.source === 'safety_report' ? <Shield className="mt-0.5 h-4 w-4 text-[#D94A4A]" /> : <AlertTriangle className="mt-0.5 h-4 w-4 text-[#9B6419]" />}<div><p className="font-semibold text-[#13334F]">{row.title}</p>{row.summary ? <p className="mt-1 max-w-xs text-xs text-[#607583]">{row.summary}</p> : null}</div></div></td>
                  <td className="p-3">{row.workerLabel ? <div className="flex items-center gap-3"><AdminIdentityAvatar kind="worker" name={row.workerLabel} entityId={row.workerId} size="sm" /><span className="font-medium text-[#13334F]">{row.workerLabel}</span></div> : <span className="text-[#9AAAB3]">—</span>}</td>
                  <td className="p-3">{row.providerLabel ? <div className="flex items-center gap-3"><AdminIdentityAvatar kind="provider" name={row.providerLabel} entityId={row.providerId} size="sm" /><span className="font-medium text-[#13334F]">{row.providerLabel}</span></div> : <span className="text-[#9AAAB3]">—</span>}</td>
                  <td className="p-3">{severityBadge(row.severity)}</td>
                  <td className="p-3">{statusBadge(row.status)}</td>
                  <td className="max-w-[230px] p-3 text-[#607583]">{row.shiftLabel ?? '—'}</td>
                  <td className="p-3"><Link to={`/admin/incidents/${row.id}`} className="text-xs font-semibold text-[#2F8E7A] hover:text-[#257665]">Review record</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="py-8 text-sm text-[#607583]">No incidents in this view.</p> : null}
        </div>
      </main>
    </div>
  );
}
