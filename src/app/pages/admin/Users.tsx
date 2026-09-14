import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { AdminIdentityAvatar } from '../../components/AdminIdentityAvatar';
import { toast } from 'sonner';
import { listUsersAndProviders } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

type Tab = 'workers' | 'providers' | 'admins';

type UserRow = {
  id: string;
  name: string;
  accountType: string;
  status: 'active' | 'suspended' | 'review';
  role: string;
  location: string;
  lastActive: string;
};

function AccStatus({ s }: { s: 'active' | 'suspended' | 'review' }) {
  if (s === 'active') return <StatusBadge variant="covered">Active</StatusBadge>;
  if (s === 'review') return <StatusBadge variant="pending">Review</StatusBadge>;
  return <StatusBadge variant="missing">Suspended</StatusBadge>;
}

function UserTable({ rows, tab }: { rows: UserRow[]; tab: Tab }) {
  const kind = tab === 'workers' ? 'worker' : tab === 'providers' ? 'provider' : 'admin';

  return (
    <div className="overflow-x-auto border-t border-[#BFCED4]">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="border-b border-[#DDE7E8]">
          <tr>
            <th className="p-3">Name</th><th className="p-3">Account type</th><th className="p-3">Status</th><th className="p-3">Role</th><th className="p-3">Location / site</th><th className="p-3">Last active</th><th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-[#DDE7E8]">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <AdminIdentityAvatar kind={kind} name={row.name} entityId={row.id} size="sm" />
                  <span className="font-semibold text-[#13334F]">{row.name}</span>
                </div>
              </td>
              <td className="p-3 text-[#607583]">{row.accountType}</td>
              <td className="p-3"><AccStatus s={row.status} /></td>
              <td className="p-3 text-[#607583]">{row.role}</td>
              <td className="p-3 text-[#607583]">{row.location}</td>
              <td className="p-3 text-[#607583]">{row.lastActive}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  <button type="button" onClick={() => toast(`Profile: ${row.name}`)} className="text-[#13334F] hover:text-[#2F8E7A]">View</button>
                  <button type="button" onClick={() => toast(`Deactivate flow: ${row.name}`)} className="text-[#A93636] hover:text-[#7E2929]">Deactivate</button>
                  <button type="button" onClick={() => toast.success(`Invite sent (mock): ${row.name}`)} className="text-[#2F8E7A] hover:text-[#257665]">Send invite</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'workers', label: 'Workers' },
  { id: 'providers', label: 'Providers' },
  { id: 'admins', label: 'Admins' },
];

export default function Users() {
  const [tab, setTab] = useState<Tab>('workers');
  const { data, error, loading, reload } = useAsyncResource(() => listUsersAndProviders(), []);

  if (loading) return <div className="mx-auto max-w-7xl p-6 text-sm text-[#607583]">Loading users…</div>;
  if (error) return <div className="mx-auto max-w-7xl p-6"><div className="border-y border-[#DDE7E8] py-8"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 rounded-lg bg-[#13334F] px-4 py-2.5 text-sm font-semibold text-white">Retry</button></div></div>;
  if (!data) return null;

  const { workers, providers, admins } = data;
  const rows = tab === 'workers' ? workers : tab === 'providers' ? providers : admins;

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">People</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Users + organizations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Review worker accounts, provider organizations, workspace admins, and account state without losing sight of who each record represents.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <div className="flex flex-wrap gap-6 border-b border-[#DDE7E8]">
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`border-b-2 pb-3 text-sm font-semibold ${tab === t.id ? 'border-[#53B59F] text-[#13334F]' : 'border-transparent text-[#607583] hover:text-[#13334F]'}`}>{t.label}</button>
          ))}
        </div>
        <div className="pt-5">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Current view</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">{tabs.find(item => item.id === tab)?.label}</h2></div>
            <span className="text-sm text-[#607583]">{rows.length} records</span>
          </div>
          <UserTable rows={rows} tab={tab} />
        </div>
      </main>
    </div>
  );
}
