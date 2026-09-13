import { useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { ClipboardList, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateProviderCompliancePacketFromApprovedTimesheet, listCompliancePackets, type CompliancePacketRow } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useProviderAction } from '../../hooks/useProviderAction';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';

function PacketBadge({ packet }: { packet: CompliancePacketRow }) {
  if (packet.isSimulated) return <StatusBadge variant="pending">{packet.statusLabel ?? 'Pending booking'}</StatusBadge>;
  if (packet.hasGeneratedSnapshot) return <StatusBadge variant="covered">Snapshot generated</StatusBadge>;
  if (packet.canGenerateSnapshot) return <StatusBadge variant="pending">Ready for packet</StatusBadge>;
  if (packet.packetStatus === 'ready') return <StatusBadge variant="covered">Ready</StatusBadge>;
  if (packet.packetStatus === 'review') return <StatusBadge variant="pending">Needs review</StatusBadge>;
  return <StatusBadge variant="missing">Missing signature</StatusBadge>;
}

function PacketRow({ packet, onGenerate, busy, mockQueued }: { packet: CompliancePacketRow; onGenerate: () => void; busy: boolean; mockQueued?: boolean }) {
  return (
    <article className="border-b border-[#DDE7E8] py-5">
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><h2 className="font-semibold text-[#13334F]">{packet.shiftRoleTitle} — {packet.siteName}</h2><p className="mt-1 text-sm text-[#607583]">{packet.shiftWhen}</p></div>
            <PacketBadge packet={packet} />
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">Worker</dt><dd className="mt-1 text-[#13334F]">{packet.workerName}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">Clock in / out</dt><dd className="mt-1 text-[#13334F]">{packet.clockSummary}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">Credentials at shift time</dt><dd className="mt-1 text-[#13334F]">{packet.credentialsAtShift}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#7A8D98]">Approval</dt><dd className="mt-1 text-[#13334F]">{packet.approvalLine}</dd></div>
          </dl>

          {packet.incidentNotes ? <p className="mt-3 text-sm text-[#607583]"><strong className="font-semibold text-[#13334F]">Incident notes:</strong> {packet.incidentNotes}</p> : null}
          {packet.missingItems?.length ? <p className="mt-3 text-sm text-[#9B6419]">Still needed: {packet.missingItems.join(' · ')}</p> : null}

          {(packet.canGenerateSnapshot || packet.isSimulated || packet.packetStatus === 'ready') ? (
            <button type="button" onClick={onGenerate} disabled={busy || mockQueued} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2F8E7A] disabled:opacity-50"><Download className="h-4 w-4" />{busy ? 'Working…' : mockQueued ? 'Queued' : packet.canGenerateSnapshot ? 'Generate packet snapshot' : packet.isSimulated ? 'Queue packet' : 'Download packet'}</button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Compliance() {
  const supabaseMode = isSupabaseBackendEnabled();
  const { run, isPending } = useProviderAction();
  const { data: packets, error, loading, reload } = useAsyncResource(() => listCompliancePackets(), []);
  const [queuedIds, setQueuedIds] = useState<Set<string>>(() => new Set());

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Close the loop</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Compliance packets</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">One place for the worker, credentials, time record, approval, and incident context behind a completed shift.</p>
        </header>

        {supabaseMode ? <p className="border-b border-[#DDE7E8] py-4 text-xs leading-5 text-[#9AAAB3]">Generated snapshots are readiness records today; PDF/file delivery is not connected yet.</p> : null}
        {loading && <p className="border-b border-[#DDE7E8] py-10 text-center text-sm text-[#607583]">Loading compliance history…</p>}
        {error && <div className="border-b border-[#DDE7E8] py-10 text-center"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-3 text-sm font-semibold text-[#2F8E7A]">Try again</button></div>}
        {!loading && !error && packets?.length === 0 ? <section className="py-12 text-center"><ClipboardList className="mx-auto h-8 w-8 text-[#53B59F]" /><p className="mt-3 font-semibold text-[#13334F]">No packet-ready shifts yet.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607583]">Packets appear after booking, clock events, worker submission, and provider approval create a complete shift record.</p></section> : null}

        {!loading && !error && packets?.length ? (
          <section className="pt-7"><div className="flex items-end justify-between gap-4 pb-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Shift records</p><h2 className="mt-1 text-xl font-semibold text-[#13334F]">{packets.length} packet {packets.length === 1 ? 'record' : 'records'}</h2></div></div><div className="border-t border-[#BFCED4]">{packets.map(packet => <PacketRow key={packet.id} packet={packet} busy={Boolean(packet.timesheetId && isPending(`packet-${packet.timesheetId}`))} mockQueued={queuedIds.has(packet.id)} onGenerate={async () => {
            if (supabaseMode && packet.canGenerateSnapshot && packet.timesheetId) {
              const result = await run(`packet-${packet.timesheetId}`, () => generateProviderCompliancePacketFromApprovedTimesheet(packet.timesheetId!));
              if (result.ok) { toast.success(result.data.message); reload(); } else toast.error(result.error.message);
              return;
            }
            if (packet.isSimulated) toast.message('Packet generation will connect after booking, credentials, and timesheets are fully wired.'); else toast.success('Compliance packet download queued');
            setQueuedIds(previous => new Set(previous).add(packet.id));
          }} />)}</div></section>
        ) : null}
      </div>
    </div>
  );
}
