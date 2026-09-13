import { useCallback, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '../../components/StatusBadge';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { disableProviderMember, inviteProviderMember, listProviderTeamMembers, resendProviderInvite, updateProviderMemberRole } from '../../services';
import type { ProviderMemberRole, ProviderTeamMember } from '../../services';

const INVITE_ROLES: { value: ProviderMemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' }, { value: 'scheduler', label: 'Scheduler' }, { value: 'billing', label: 'Billing' }, { value: 'viewer', label: 'Viewer' },
];
const ALL_ROLES: ProviderMemberRole[] = ['owner', 'admin', 'scheduler', 'billing', 'viewer'];
const ROLE_GUIDE = [
  ['Owner', 'Full access to organization, billing, team, and sites.'],
  ['Admin', 'Manage sites, shifts, team, and most settings.'],
  ['Scheduler', 'Post and manage shifts and worker coverage.'],
  ['Billing', 'Billing, invoices, and timesheet approvals.'],
  ['Viewer', 'Read-only access to dashboards and reports.'],
] as const;

function roleLabel(role: ProviderMemberRole) { return role.charAt(0).toUpperCase() + role.slice(1); }
function statusBadge(member: ProviderTeamMember) {
  if (member.status === 'active') return <StatusBadge variant="covered">Active</StatusBadge>;
  if (member.status === 'invited') return <StatusBadge variant="pending">Invited</StatusBadge>;
  return <StatusBadge variant="missing">Disabled</StatusBadge>;
}
function isValidEmail(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()); }

export default function ProviderTeam() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { data: members, loading, error, reload } = useAsyncResource(() => listProviderTeamMembers(), []);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProviderMemberRole>('scheduler');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);

  const handleInvite = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(inviteEmail)) return toast.error('Enter a valid email address.');
    setInviteBusy(true);
    const res = await inviteProviderMember({ email: inviteEmail.trim(), role: inviteRole, message: inviteMessage.trim() || undefined });
    setInviteBusy(false);
    if (!res.ok) return toast.error(res.error.message);
    toast.success(res.data.message);
    setInviteEmail(''); setInviteMessage(''); setInviteRole('scheduler'); reload();
  };
  const onRoleChange = useCallback(async (memberId: string, role: ProviderMemberRole) => {
    const res = await updateProviderMemberRole(memberId, role); if (!res.ok) toast.error(res.error.message); else toast.success(res.data.message); reload();
  }, [reload]);
  const onDisable = async (memberId: string) => { const res = await disableProviderMember(memberId); if (!res.ok) toast.error(res.error.message); else { toast.success(res.data.message); reload(); } };
  const onResend = async (memberId: string) => { const res = await resendProviderInvite(memberId); if (!res.ok) toast.error(res.error.message); else { toast.success(res.data.message); reload(); } };

  const field = 'min-h-12 w-full border-b border-[#BFCED4] bg-transparent px-0 text-base text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]';

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">People & access</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Team</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Keep the people who schedule, approve, and pay for coverage inside the same workspace.</p>
        </header>

        <section className="border-b border-[#DDE7E8] py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Invite teammate</p>
          <p className="mt-1 text-sm text-[#607583]">{supabaseMode ? 'Invites are queued; email delivery is not connected yet.' : 'Demo mode — no email is sent.'}</p>
          <form onSubmit={handleInvite} className="mt-5 space-y-6">
            <label className="block"><span className="text-sm font-semibold text-[#13334F]">Email</span><input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="name@organization.com" className={field} /></label>
            <label className="block"><span className="text-sm font-semibold text-[#13334F]">Role</span><select value={inviteRole} onChange={e => setInviteRole(e.target.value as ProviderMemberRole)} className={`${field} appearance-none`}>{INVITE_ROLES.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
            <label className="block"><span className="text-sm font-semibold text-[#13334F]">Message <span className="font-normal text-[#9AAAB3]">optional</span></span><textarea rows={3} value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} placeholder="Add context for your teammate…" className="mt-2 w-full resize-y border-b border-[#BFCED4] bg-transparent px-0 py-2 text-base leading-6 text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]" /></label>
            <button type="submit" disabled={inviteBusy} className="min-h-12 w-full rounded-xl bg-[#53B59F] text-sm font-semibold text-white disabled:opacity-60">{inviteBusy ? 'Queuing…' : supabaseMode ? 'Queue invite' : 'Send invite'}</button>
          </form>
        </section>

        <section className="py-7">
          <div className="flex items-end justify-between gap-4 pb-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Workspace access</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">Team members</h2></div>{members ? <p className="text-xs text-[#9AAAB3]">{members.length} total</p> : null}</div>
          {loading && <p className="border-y border-[#DDE7E8] py-8 text-center text-sm text-[#607583]">Loading team…</p>}
          {error && <div className="border-y border-[#DDE7E8] py-8 text-center"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-3 text-sm font-semibold text-[#2F8E7A]">Try again</button></div>}
          {!loading && !error && members && <div className="border-t border-[#BFCED4]">{members.map(member => <div key={member.id} className="border-b border-[#DDE7E8] py-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="font-semibold text-[#13334F]">{member.name}</p><p className="mt-1 break-all text-sm text-[#607583]">{member.email}</p><div className="mt-2">{statusBadge(member)}</div></div><select value={member.role} disabled={member.role === 'owner' || member.status === 'disabled'} onChange={e => void onRoleChange(member.id, e.target.value as ProviderMemberRole)} className="min-h-10 shrink-0 border-b border-[#BFCED4] bg-transparent text-sm font-semibold text-[#13334F] outline-none disabled:opacity-50">{ALL_ROLES.map(role => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></div><div className="mt-4 flex gap-4">{!supabaseMode && member.status === 'invited' ? <button type="button" onClick={() => void onResend(member.id)} className="text-sm font-semibold text-[#2F8E7A]">Resend invite</button> : null}{member.role !== 'owner' && member.status !== 'disabled' ? <button type="button" onClick={() => void onDisable(member.id)} className="text-sm font-semibold text-[#A93636]">{supabaseMode ? 'Disable soon' : 'Disable access'}</button> : null}</div></div>)}</div>}
        </section>

        <section className="border-t border-[#DDE7E8] py-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Role guide</p><div className="mt-3 border-t border-[#BFCED4]">{ROLE_GUIDE.map(([role, text]) => <div key={role} className="border-b border-[#DDE7E8] py-3"><p className="text-sm"><strong className="text-[#13334F]">{role}</strong><span className="text-[#607583]"> · {text}</span></p></div>)}</div></section>
      </div>
    </div>
  );
}
