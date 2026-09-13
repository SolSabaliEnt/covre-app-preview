import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { AlertCircle, ArrowRight, CheckCircle2, Clock, FileText, Shield, Upload } from 'lucide-react';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import { WORKER_ENTRY_PATH } from '../../lib/entryRoutes';
import {
  getCurrentWorkerProfile,
  listWorkerCredentialReadiness,
  selfAttestWorkerCredential,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

const mockCredentials = [
  { name: 'Government ID', status: 'verified' as const },
  { name: 'Background Check', status: 'verified' as const },
  { name: 'CNA Registry', status: 'verified' as const },
  { name: 'CPR/BLS', status: 'expiring' as const, note: 'Expires in 45 days' },
  { name: 'Medication Training', status: 'pending' as const },
  { name: 'TB Test', status: 'verified' as const },
  { name: 'Work Authorization', status: 'verified' as const },
  { name: 'References', status: 'missing' as const },
];

type VisualStatus = 'verified' | 'pending' | 'expiring' | 'missing' | 'self_attested' | 'expired';

function statusCopy(status: VisualStatus) {
  if (status === 'verified') return { label: 'Verified', tone: 'text-[#257665]', icon: CheckCircle2 };
  if (status === 'pending' || status === 'self_attested') return { label: 'In review', tone: 'text-[#9B6419]', icon: Clock };
  if (status === 'expiring' || status === 'expired') return { label: 'Needs attention', tone: 'text-[#9B6419]', icon: AlertCircle };
  return { label: 'Missing', tone: 'text-[#A93636]', icon: AlertCircle };
}

function CredentialRow({
  name,
  status,
  note,
  actionLabel,
  actionDisabled,
  onAction,
}: {
  name: string;
  status: VisualStatus;
  note?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
}) {
  const statusMeta = statusCopy(status);
  const StatusIcon = statusMeta.icon;

  return (
    <div className="border-b border-[#DDE7E8] py-5 last:border-b-0">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#7A8D98]" aria-hidden />
            <h3 className="font-semibold text-[#13334F]">{name}</h3>
          </div>
          {note ? <p className="mt-2 pl-6 text-xs text-[#607583]">{note}</p> : null}
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold ${statusMeta.tone}`}>
          <StatusIcon className="h-3.5 w-3.5" aria-hidden /> {statusMeta.label}
        </span>
      </div>
      {actionLabel ? (
        <button
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
          className="mt-3 inline-flex min-h-10 items-center gap-2 pl-6 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-4 w-4" aria-hidden /> {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function PassportHeader({ verified, pending, missing }: { verified: number; pending: number; missing: number }) {
  return (
    <header className="border-b border-[#DDE7E8] pb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Credential passport</p>
      <div className="mt-2 flex items-start gap-3">
        <Shield className="mt-1 h-6 w-6 shrink-0 text-[#53B59F]" aria-hidden />
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Ready once. Reuse everywhere.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">
            Keep the credentials facilities need in one place so you spend less time proving the same things for every shift.
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 border-t border-[#EEF3F4] pt-4 text-center sm:max-w-md">
        <div>
          <p className="text-2xl font-semibold text-[#13334F]">{verified}</p>
          <p className="text-xs text-[#607583]">Verified</p>
        </div>
        <div className="border-x border-[#DDE7E8]">
          <p className="text-2xl font-semibold text-[#9B6419]">{pending}</p>
          <p className="text-xs text-[#607583]">In review</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-[#A93636]">{missing}</p>
          <p className="text-xs text-[#607583]">Need action</p>
        </div>
      </div>
    </header>
  );
}

function MockCredentials() {
  const verified = mockCredentials.filter(c => c.status === 'verified').length;
  const pending = mockCredentials.filter(c => c.status === 'pending').length;
  const missing = mockCredentials.filter(c => c.status === 'missing' || c.status === 'expiring').length;

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <Link to="/worker/account" className="mb-5 inline-flex text-sm font-semibold text-[#607583] hover:text-[#13334F]">← Account</Link>
        <PassportHeader verified={verified} pending={pending} missing={missing} />

        <section className="py-7">
          <div className="flex items-end justify-between gap-4 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Your readiness</p>
              <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Credentials</h2>
            </div>
            <p className="text-xs text-[#9AAAB3]">Upload once · keep current</p>
          </div>
          <div className="border-t border-[#BFCED4]">
            {mockCredentials.map(credential => (
              <CredentialRow
                key={credential.name}
                name={credential.name}
                status={credential.status}
                note={credential.note}
                actionLabel={credential.status === 'missing' ? 'Add document' : undefined}
              />
            ))}
          </div>
        </section>

        <div className="sticky bottom-0 -mx-4 border-t border-[#DDE7E8] bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link to="/worker/shifts" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 text-sm font-semibold text-white no-underline hover:bg-[#2F8E7A]">
            See shifts you’re ready for <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

function SupabaseCredentials() {
  const [addingId, setAddingId] = useState<string | null>(null);
  const { data: rows, error, loading, reload } = useAsyncResource(() => listWorkerCredentialReadiness(), []);
  const { data: profile } = useAsyncResource(() => getCurrentWorkerProfile(), []);

  const verified = rows?.filter(r => r.status === 'verified').length ?? 0;
  const pending = rows?.filter(r => r.status === 'pending' || r.status === 'self_attested').length ?? 0;
  const missing = rows?.filter(r => r.status === 'missing' || r.status === 'expired').length ?? 0;

  const handleAdd = async (credentialId: string) => {
    setAddingId(credentialId);
    const res = await selfAttestWorkerCredential(credentialId);
    setAddingId(null);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(res.data.message);
    reload();
  };

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <Link to="/worker/account" className="mb-5 inline-flex text-sm font-semibold text-[#607583] hover:text-[#13334F]">← Account</Link>
        <PassportHeader verified={verified} pending={pending} missing={missing} />

        {profile && !profile.onboardingComplete ? (
          <section className="border-b border-[#DDE7E8] py-5">
            <p className="text-sm font-semibold text-[#13334F]">Finish your profile before adding credentials.</p>
            <p className="mt-1 text-sm text-[#607583]">We need the basics first so each credential stays attached to the right worker record.</p>
            <Link to="/worker/onboarding" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
              Finish onboarding <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        ) : null}

        {error && !loading ? (
          <section className="border-b border-[#DDE7E8] py-8 text-center">
            <p className="text-sm text-[#607583]">{error.message}</p>
            {error.code === 'not_authenticated' ? (
              <Link to={WORKER_ENTRY_PATH} className="mt-3 block text-sm font-semibold text-[#2F8E7A] hover:underline">Sign in at /apply</Link>
            ) : null}
            <button type="button" onClick={reload} className="mt-4 rounded-xl bg-[#13334F] px-5 py-3 text-sm font-semibold text-white">Try again</button>
          </section>
        ) : null}

        {loading ? <p className="py-10 text-center text-sm text-[#607583]">Loading your credential passport…</p> : null}

        {!loading && !error && rows ? (
          <section className="py-7">
            <div className="flex items-end justify-between gap-4 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Your readiness</p>
                <h2 className="mt-1 text-xl font-semibold text-[#13334F]">Credentials</h2>
              </div>
              <p className="text-xs text-[#9AAAB3]">Readiness updates here</p>
            </div>
            <p className="mb-3 text-xs leading-5 text-[#9AAAB3]">Document upload and formal verification are still being connected. “Add for review” records the credential in your passport now.</p>
            <div className="border-t border-[#BFCED4]">
              {rows.map(row => (
                <CredentialRow
                  key={row.credentialId}
                  name={row.name}
                  status={row.status}
                  note={row.category || undefined}
                  actionLabel={row.status === 'missing' || row.status === 'expired' ? (addingId === row.credentialId ? 'Adding…' : 'Add for review') : undefined}
                  actionDisabled={addingId === row.credentialId || !profile?.workerId}
                  onAction={() => void handleAdd(row.credentialId)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-[#DDE7E8] bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link to="/worker/shifts" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#53B59F] px-6 text-sm font-semibold text-white no-underline hover:bg-[#2F8E7A]">
            See shifts you’re ready for <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Credentials() {
  return isSupabaseBackendEnabled() ? <SupabaseCredentials /> : <MockCredentials />;
}
