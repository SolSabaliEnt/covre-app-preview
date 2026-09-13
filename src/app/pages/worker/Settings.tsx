import { useState } from 'react';
import { Bell, CreditCard, HelpCircle, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { SettingsLinkRow, SettingsSection, SettingsToggleRow } from '../../components/SettingsList';

const PREF_KEY = 'covre.worker.settings';

type WorkerPrefs = {
  newShiftAlerts: boolean;
  bookingUpdates: boolean;
  payoutUpdates: boolean;
  credentialReminders: boolean;
};

const DEFAULT_PREFS: WorkerPrefs = {
  newShiftAlerts: true,
  bookingUpdates: true,
  payoutUpdates: true,
  credentialReminders: true,
};

function loadPrefs(): WorkerPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(window.localStorage.getItem(PREF_KEY) || '{}') };
  } catch {
    return DEFAULT_PREFS;
  }
}

export default function WorkerSettings() {
  const [prefs, setPrefs] = useState<WorkerPrefs>(() => loadPrefs());

  const update = (key: keyof WorkerPrefs, checked: boolean) => {
    setPrefs(current => {
      const next = { ...current, [key]: checked };
      try {
        window.localStorage.setItem(PREF_KEY, JSON.stringify(next));
      } catch {
        // Keep the in-memory setting if browser storage is unavailable.
      }
      return next;
    });
  };

  return (
    <div className="min-h-[100svh] bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Settings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Control how Covre reaches you and keep your profile, readiness, and money settings connected.</p>
        </header>

        <SettingsSection title="Profile & readiness">
          <SettingsLinkRow to="/worker/profile" label="Professional profile" detail="Photo, roles, location, experience, and availability." icon={UserRound} />
          <SettingsLinkRow to="/worker/credentials" label="Credential passport" detail="Licenses, certifications, and readiness status." icon={ShieldCheck} />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsToggleRow label="New shift alerts" detail="Tell me when a relevant shift opens." checked={prefs.newShiftAlerts} onChange={checked => update('newShiftAlerts', checked)} />
          <SettingsToggleRow label="Booking updates" detail="Requests, acceptances, reminders, and shift changes." checked={prefs.bookingUpdates} onChange={checked => update('bookingUpdates', checked)} />
          <SettingsToggleRow label="Payout updates" detail="Earning approval and payout-readiness changes." checked={prefs.payoutUpdates} onChange={checked => update('payoutUpdates', checked)} />
          <SettingsToggleRow label="Credential reminders" detail="Expiration and missing-document reminders." checked={prefs.credentialReminders} onChange={checked => update('credentialReminders', checked)} />
        </SettingsSection>

        <SettingsSection title="Money & safety">
          <SettingsLinkRow to="/worker/pay" label="Earnings & payouts" detail="Approved work, payout readiness, and history." icon={CreditCard} />
          <SettingsLinkRow to="/worker/safety" label="Safety reports" detail="Document workplace concerns securely." icon={LockKeyhole} />
        </SettingsSection>

        <SettingsSection title="Help">
          <SettingsLinkRow to="/worker/account" label="Account overview" detail="Return to your worker account hub." icon={Bell} />
          <SettingsLinkRow to="/apply" label="Sign-in & access help" detail="Return to the worker entry point if you need access support." icon={HelpCircle} />
        </SettingsSection>
      </div>
    </div>
  );
}
