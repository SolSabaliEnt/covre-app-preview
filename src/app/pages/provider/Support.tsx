import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, CalendarX, Check, CreditCard, MessageSquareText, ShieldAlert, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { listProviderSupportOptions, submitProviderSupportRequest } from '../../services';
import type { ProviderSupportTopicOption } from '../../services/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';

const TOPIC_ICONS: Record<ProviderSupportTopicOption['id'], typeof CalendarX> = {
  shift: CalendarX,
  noshow: AlertTriangle,
  payment: CreditCard,
  credential: ShieldAlert,
  safety: Stethoscope,
};

export default function Support() {
  const { data: options, error, loading, reload } = useAsyncResource(() => listProviderSupportOptions(), []);
  const topics = useMemo(() => (options ?? []).map(option => ({ ...option, icon: TOPIC_ICONS[option.id] ?? MessageSquareText })), [options]);
  const [topicId, setTopicId] = useState<ProviderSupportTopicOption['id'] | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const supabaseMode = isSupabaseBackendEnabled();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!topicId) return toast.error('Choose what you need help with.');
    if (!message.trim()) return toast.error('Tell us what happened.');
    setSubmitting(true);
    const result = await submitProviderSupportRequest({ topicId, message: message.trim() });
    setSubmitting(false);
    if (!result.ok) return toast.error(result.error.message);
    setSubmittedTicketId(result.data.id);
    setSubmitted(true);
    toast.success('Support request submitted');
  };

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Provider support</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Get the right issue to the right place.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Shift problems, worker no-shows, payments, credentials, and safety all stay tied to your workspace.</p>
        </header>

        {loading && <p className="border-b border-[#DDE7E8] py-10 text-center text-sm text-[#607583]">Loading support options…</p>}
        {error && (
          <div className="border-b border-[#DDE7E8] py-10 text-center">
            <p className="text-sm text-[#607583]">{error.message}</p>
            <button type="button" onClick={reload} className="mt-4 min-h-11 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white">Try again</button>
          </div>
        )}

        {!loading && !error && submitted ? (
          <section className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]"><Check className="h-6 w-6" /></div>
            <h2 className="mt-4 text-xl font-semibold text-[#13334F]">Request received</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607583]">{supabaseMode ? 'Your request is queued in Covre and stays attached to this provider workspace.' : 'The Covre team will follow up using your account contact.'}</p>
            {submittedTicketId ? <p className="mt-2 text-xs text-[#9AAAB3]">Reference: {submittedTicketId}</p> : null}
            <button type="button" onClick={() => { setSubmitted(false); setSubmittedTicketId(null); setMessage(''); setTopicId(null); }} className="mt-6 min-h-11 text-sm font-semibold text-[#2F8E7A]">Submit another request</button>
          </section>
        ) : null}

        {!loading && !error && !submitted ? (
          <form onSubmit={handleSubmit}>
            <section className="py-7">
              <p className="pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">What do you need?</p>
              <div className="border-t border-[#BFCED4]">
                {topics.map(({ id, label, hint, icon: Icon }) => {
                  const selected = topicId === id;
                  return (
                    <button key={id} type="button" onClick={() => setTopicId(id)} className="flex min-h-16 w-full items-center gap-4 border-b border-[#DDE7E8] py-4 text-left transition-colors hover:bg-[#F7FAFA]">
                      <Icon className={`h-5 w-5 shrink-0 ${id === 'noshow' ? 'text-[#A93636]' : id === 'credential' ? 'text-[#9B6419]' : 'text-[#2F8E7A]'}`} aria-hidden />
                      <span className="min-w-0 flex-1"><strong className="block text-[#13334F]">{label}</strong><span className="mt-0.5 block text-sm text-[#607583]">{hint}</span></span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full ${selected ? 'bg-[#53B59F] text-white' : 'border border-[#BFCED4] text-transparent'}`}><Check className="h-4 w-4" /></span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-[#DDE7E8] py-7">
              <label htmlFor="support-details" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">What happened?</label>
              <textarea id="support-details" value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Include dates, times, worker names, or ticket numbers if you have them." className="mt-4 w-full resize-y border-b border-[#BFCED4] bg-transparent px-0 py-2 text-base leading-6 text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]" />
              <button type="submit" disabled={submitting} className="mt-5 min-h-12 w-full rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white hover:bg-[#2F8E7A] disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit support request'}</button>
            </section>
          </form>
        ) : null}
      </div>
    </div>
  );
}
