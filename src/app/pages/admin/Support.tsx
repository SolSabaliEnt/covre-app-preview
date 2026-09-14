import { useMemo, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import { toast } from 'sonner';
import { listAdminSupportTickets, updateAdminSupportTicketStatus } from '../../services';
import type { AdminSupportTicketRow, AdminSupportTicketStatus } from '../../services/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';

type Filter = 'all' | 'open' | 'assigned' | 'resolved' | 'closed' | 'urgent';

function formatWhen(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function Status({ row }: { row: AdminSupportTicketRow }) {
  if (row.status === 'resolved') return <StatusBadge variant="verified">Resolved</StatusBadge>;
  if (row.status === 'closed') return <StatusBadge variant="covered">Closed</StatusBadge>;
  if (row.status === 'assigned') return <StatusBadge variant="new">In progress</StatusBadge>;
  return <StatusBadge variant="pending">Open</StatusBadge>;
}

function Priority({ row }: { row: AdminSupportTicketRow }) {
  return row.priority === 'urgent' || row.priority === 'high'
    ? <StatusBadge variant="urgent">{row.priority === 'urgent' ? 'Urgent' : 'High'}</StatusBadge>
    : <StatusBadge variant="new">{row.priority}</StatusBadge>;
}

export default function Support() {
  const [filter, setFilter] = useState<Filter>('open');
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, error, loading, reload } = useAsyncResource(() => listAdminSupportTickets(), []);

  const rows = useMemo(() => {
    const source = data?.rows ?? [];
    if (filter === 'all') return source;
    if (filter === 'urgent') return source.filter(row => row.priority === 'urgent' || row.priority === 'high');
    return source.filter(row => row.status === filter);
  }, [data?.rows, filter]);

  const updateStatus = async (ticketId: string, next: AdminSupportTicketStatus) => {
    setBusyId(ticketId);
    const result = await updateAdminSupportTicketStatus(ticketId, next);
    setBusyId(null);
    if (!result.ok) return toast.error(result.error.message);
    toast.success(result.data.message);
    reload();
  };

  const filters: { id: Filter; label: string; count?: number }[] = [
    { id: 'open', label: 'Open', count: data?.openCount },
    { id: 'assigned', label: 'In progress', count: data?.assignedCount },
    { id: 'urgent', label: 'Urgent', count: data?.urgentCount },
    { id: 'resolved', label: 'Resolved', count: data?.resolvedCount },
    { id: 'closed', label: 'Closed', count: data?.closedCount },
    { id: 'all', label: 'All' },
  ];

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading support queue…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2 text-sm font-semibold text-white">Retry</button></div>;

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">People + operations</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Support queue</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Keep the requester visible while triaging shift, pay, credential, and safety issues.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="flex flex-wrap gap-6 border-b border-[#DDE7E8]">
          {filters.map(item => <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`border-b-2 pb-3 text-sm font-semibold ${filter === item.id ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#607583]'}`}>{item.label}{item.count !== undefined ? ` ${item.count}` : ''}</button>)}
        </div>

        <div className="mt-5 overflow-x-auto border-t border-[#BFCED4]">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-[#DDE7E8]"><tr><th className="p-3">Requester</th><th className="p-3">Issue</th><th className="p-3">Priority</th><th className="p-3">Related shift / site</th><th className="p-3">Status</th><th className="p-3">Updated</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="border-b border-[#DDE7E8]">
                  <td className="p-3"><div className="flex items-center gap-3"><AdminIdentityAvatar kind={row.requesterType} name={row.requesterLabel} userId={row.requesterUserId} size="md" /><div><p className="font-semibold text-[#13334F]">{row.requesterLabel}</p><p className="text-xs capitalize text-[#607583]">{row.requesterType}</p></div></div></td>
                  <td className="p-3"><p className="font-medium text-[#13334F]">{row.subject ?? row.ticketType ?? 'Support request'}</p><p className="mt-1 font-mono text-[11px] text-[#9AAAB3]">{row.id}</p></td>
                  <td className="p-3"><Priority row={row} /></td>
                  <td className="max-w-[240px] p-3 text-[#607583]">{row.relatedLine ?? '—'}</td>
                  <td className="p-3"><Status row={row} /></td>
                  <td className="p-3 text-[#607583]">{formatWhen(row.updatedAt)}</td>
                  <td className="p-3"><div className="flex flex-wrap gap-3 text-xs font-semibold">{row.status === 'open' ? <button disabled={busyId === row.id} type="button" onClick={() => void updateStatus(row.id, 'assigned')} className="text-[#13334F]">Start</button> : null}{row.status === 'open' || row.status === 'assigned' ? <button disabled={busyId === row.id} type="button" onClick={() => void updateStatus(row.id, 'resolved')} className="text-[#257665]">Resolve</button> : null}{row.status !== 'closed' ? <button disabled={busyId === row.id} type="button" onClick={() => void updateStatus(row.id, 'closed')} className="text-[#607583]">Close</button> : null}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <p className="py-8 text-sm text-[#607583]">No tickets in this view.</p> : null}
        </div>
      </main>
    </div>
  );
}
