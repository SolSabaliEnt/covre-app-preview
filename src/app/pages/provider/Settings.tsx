import { useState } from 'react';
import { Bell, Building2, CreditCard, FileCheck2, HelpCircle, MapPin, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { SettingsLinkRow, SettingsSection, SettingsToggleRow } from '../../components/SettingsList';
import {
  getProviderPaymentMethodReadiness,
  getProviderSettingsSummary,
  updateProviderBillingSettings,
  updateProviderNotificationSettings,
} from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';

const PREF_KEY = 'covre.provider.settings';

type ProviderPrefs = {
  shiftAlerts: boolean;
  billingUpdates: boolean;
  complianceReminders: boolean;
};

const DEFAULT_PREFS: ProviderPrefs = {
  shiftAlerts: true,
  billingUpdates: true,
  complianceReminders: true,
};

function loadPrefs(): ProviderPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(window.localStorage.getItem(PREF_KEY) || '{}') };
  } catch {
    return DEFAULT_PREFS;
  }
}

function LoadingBlock() {
  return <div className="border-y border-[#DDE7E8] py-12 text-center text-sm text-[#607583]">Loading settings…</div>;
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border-y border-[#DDE7E8] py-10 text-center">
      <p className="text-sm text-[#607583]">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white">Try again</button>
    </div>
  );
}

export default function Settings() {
  const { data: summary, error, loading, reload } = useAsyncResource(() => getProviderSettingsSummary(), []);
  const { data: paymentReadiness } = useAsyncResource(() => getProviderPaymentMethodReadiness(), []);
  const [prefs, setPrefs] = useState<ProviderPrefs>(() => loadPrefs());

  const updatePref = async (key: keyof ProviderPrefs, checked: boolean) => {
    setPrefs(current => {
      const next = { ...current, [key]: checked };
      try {
        window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
      } catch {
        // Keep the in-memory choice when browser storage is unavailable.
      }
      return next;
    });

    const result = key === 'billingUpdates'
      ? await updateProviderBillingSettings()
      : await updateProviderNotificationSettings();
    if (!result.ok) toast.error(result.error.message);
  };

  const paymentLabel = paymentReadiness?.hasActiveMethod
    ? 'Payment method connected'
    : 'Setup needed';

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Settings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Organization, people, notifications, billing, and compliance — all tied back to the same provider workspace.</p>
        </header>

        {loading && <LoadingBlock />}
        {error && <ErrorBlock message={error.message} onRetry={reload} />}

        {!loading && !error && (
          <>
            <section className="border-b border-[#DDE7E8] py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Current workspace</p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-[#13334F]">{summary?.organizationName ?? 'Provider organization'}</p>
                  <p className="mt-1 text-sm text-[#607583]">{summary?.organizationType ?? 'Care provider'} · {summary?.setupStatus === 'complete' ? 'Setup complete' : 'Setup needs attention'}</p>
                </div>
                <p className="shrink-0 text-xs font-semibold capitalize text-[#2F8E7A]">{summary?.memberRole ?? 'member'}</p>
              </div>
            </section>

            <SettingsSection title="Organization">
              <SettingsLinkRow to="/provider/profile" label="Organization profile" detail="Logo, description, identity, and workspace contact." icon={Building2} />
              <SettingsLinkRow to="/provider/sites" label="Care sites & service area" detail="Locations, orientation details, and staffing requirements." icon={MapPin} />
            </SettingsSection>

            <SettingsSection title="People & access">
              <SettingsLinkRow to="/provider/team" label="Team & permissions" detail="Invite schedulers, billing users, admins, and viewers." icon={UsersRound} />
            </SettingsSection>

            <SettingsSection title="Notifications">
              <SettingsToggleRow label="Shift alerts" detail="Coverage gaps, requests, and urgent staffing changes." checked={prefs.shiftAlerts} onChange={checked => void updatePref('shiftAlerts', checked)} />
              <SettingsToggleRow label="Billing & invoicing" detail="Invoice, payment-method, and timesheet updates." checked={prefs.billingUpdates} onChange={checked => void updatePref('billingUpdates', checked)} />
              <SettingsToggleRow label="Compliance reminders" detail="Credential, packet, and documentation reminders." checked={prefs.complianceReminders} onChange={checked => void updatePref('complianceReminders', checked)} />
            </SettingsSection>

            <SettingsSection title="Billing & compliance">
              <SettingsLinkRow to="/provider/billing" label="Billing & payment method" detail="Invoices, readiness, and payment-method setup." icon={CreditCard} trailing={paymentLabel} />
              <SettingsLinkRow to="/provider/timesheets" label="Timesheet approvals" detail="Review submitted time before billing moves forward." icon={FileCheck2} />
              <SettingsLinkRow to="/provider/compliance" label="Compliance packets" detail="Audit-ready shift records and generated snapshots." icon={FileCheck2} />
            </SettingsSection>

            <SettingsSection title="Help">
              <SettingsLinkRow to="/provider/support" label="Support" detail="Get help with shifts, workers, payments, and compliance." icon={HelpCircle} />
              <SettingsLinkRow to="/provider/more" label="Provider workspace" detail="Return to the full operations and account menu." icon={Bell} />
            </SettingsSection>
          </>
        )}
      </div>
    </div>
  );
}
