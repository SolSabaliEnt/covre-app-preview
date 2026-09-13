import { useState } from 'react';
import { Link } from 'react-router';
import { AlertTriangle, ArrowLeft, Check, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { submitSafetyReport } from '../../services';

const ISSUE_TYPES = [
  'Unsafe conditions',
  'Unexpected duties',
  'Injury',
  'Harassment',
  'Medication concern',
  'Pay issue',
  'Other',
] as const;

export default function SafetyReport() {
  const [issueType, setIssueType] = useState<(typeof ISSUE_TYPES)[number] | null>(null);
  const [details, setDetails] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueType) {
      toast.error('Select an issue type');
      return;
    }
    setSubmitting(true);
    const result = await submitSafetyReport({ issueType: issueType as string, details, urgent });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(result.data.message);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[100svh] bg-white text-[#10283D]">
        <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6">
          <Link to="/worker/active-shift" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to active shift
          </Link>
          <section className="border-b border-[#DDE7E8] py-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E6F6F2] text-[#257665]"><Check className="h-5 w-5" aria-hidden /></div>
            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Report received.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#607583]">Covre recorded your report{urgent ? ' and flagged it for urgent follow-up' : ''}. You can return to your shift while the report stays attached to this work record.</p>
          </section>
          <Link to="/worker/active-shift" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#53B59F] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2F8E7A] sm:w-auto">
            Return to active shift
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 pt-6 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <Link to="/worker/active-shift" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2F8E7A] hover:text-[#257665]">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to active shift
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#A93636]">Safety & support</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Tell us what happened.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Document the issue clearly. Covre keeps the report with the shift record so support and operations have the right context.</p>
        </header>

        <form onSubmit={handleSubmit} className="pb-4">
          <fieldset className="border-b border-[#DDE7E8] py-7">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">What kind of issue?</legend>
            <div className="mt-4 border-t border-[#BFCED4]" role="group" aria-label="Issue type">
              {ISSUE_TYPES.map(type => {
                const selected = issueType === type;
                return (
                  <button key={type} type="button" onClick={() => setIssueType(type)} className="flex min-h-14 w-full items-center justify-between gap-4 border-b border-[#DDE7E8] py-3.5 text-left transition-colors hover:bg-[#F7FAFA]">
                    <span className={selected ? 'font-semibold text-[#13334F]' : 'font-medium text-[#466170]'}>{type}</span>
                    <span className={selected ? 'flex h-6 w-6 items-center justify-center rounded-full bg-[#53B59F] text-white' : 'h-6 w-6 rounded-full border border-[#BFCED4]'} aria-hidden>
                      {selected ? <Check className="h-4 w-4" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <section className="border-b border-[#DDE7E8] py-7">
            <label htmlFor="safety-details" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Details</label>
            <textarea id="safety-details" value={details} onChange={e => setDetails(e.target.value)} rows={6} placeholder="What happened? Include times, people involved, and anything support should know." className="mt-4 w-full resize-y border-b border-[#BFCED4] bg-transparent px-0 py-2 text-sm leading-6 text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]" />
          </section>

          <section className="border-b border-[#DDE7E8] py-7">
            <button type="button" onClick={() => setUrgent(value => !value)} className="flex w-full items-start gap-3 text-left">
              <span className={urgent ? 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D94A4A] text-white' : 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#D8A7A7] text-[#A93636]'}>
                {urgent ? <Check className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <span>
                <span className="block font-semibold text-[#13334F]">I need urgent follow-up.</span>
                <span className="mt-1 block text-sm leading-6 text-[#607583]">Use this when you need Covre support to contact you quickly. If anyone is in immediate danger, contact emergency services first.</span>
              </span>
            </button>
          </section>

          <div className="pt-6">
            <button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#13334F] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0B243A] disabled:opacity-60">
              <ShieldAlert className="h-4 w-4" aria-hidden /> {submitting ? 'Submitting…' : 'Submit report'}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-[#9AAAB3]">Submitting creates a safety record tied to this shift.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
