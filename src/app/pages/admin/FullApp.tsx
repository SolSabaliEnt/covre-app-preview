import { useMemo, useState } from 'react';
import { Link } from 'react-router';

type RouteAudience = 'Public' | 'Worker' | 'Provider' | 'Admin';
type RouteEntry = {
  label: string;
  path: string;
  previewPath?: string;
  note?: string;
  dynamic?: 'shift' | 'worker' | 'site' | 'incident';
};
type RouteSection = { title: string; audience: RouteAudience; routes: RouteEntry[] };

const SECTIONS: RouteSection[] = [
  { title: 'Public + entry', audience: 'Public', routes: [
    { label: 'Landing', path: '/' },
    { label: 'Worker entry', path: '/apply' },
    { label: 'Provider entry', path: '/facillities' },
    { label: 'Facilities alias', path: '/facilities', note: 'Redirects to /facillities.' },
    { label: 'Workspace chooser', path: '/auth' },
    { label: 'Admin sign in', path: '/auth/admin' },
  ]},
  { title: 'Worker app', audience: 'Worker', routes: [
    { label: 'Splash', path: '/worker/splash', previewPath: '/admin/full-app/worker/splash' },
    { label: 'Welcome', path: '/worker/welcome', previewPath: '/admin/full-app/worker/welcome' },
    { label: 'Onboarding', path: '/worker/onboarding', previewPath: '/admin/full-app/worker/onboarding' },
    { label: 'Credentials', path: '/worker/credentials', previewPath: '/admin/full-app/worker/credentials' },
    { label: 'Shift feed + continuity', path: '/worker/shifts', previewPath: '/admin/full-app/worker/shifts' },
    { label: 'Shift detail + site history', path: '/worker/shift/:shiftId', previewPath: '/admin/full-app/worker/shift/:shiftId', dynamic: 'shift' },
    { label: 'Bookings', path: '/worker/bookings', previewPath: '/admin/full-app/worker/bookings' },
    { label: 'Active shift', path: '/worker/active-shift', previewPath: '/admin/full-app/worker/active-shift' },
    { label: 'Pay', path: '/worker/pay', previewPath: '/admin/full-app/worker/pay' },
    { label: 'Messages', path: '/worker/messages', previewPath: '/admin/full-app/worker/messages' },
    { label: 'Reputation', path: '/worker/reputation', previewPath: '/admin/full-app/worker/reputation' },
    { label: 'Safety', path: '/worker/safety', previewPath: '/admin/full-app/worker/safety' },
    { label: 'Referrals', path: '/worker/referrals', previewPath: '/admin/full-app/worker/referrals' },
    { label: 'Account', path: '/worker/account', previewPath: '/admin/full-app/worker/account' },
    { label: 'Profile', path: '/worker/profile', previewPath: '/admin/full-app/worker/profile' },
    { label: 'Settings', path: '/worker/settings', previewPath: '/admin/full-app/worker/settings' },
  ]},
  { title: 'Provider app', audience: 'Provider', routes: [
    { label: 'Dashboard', path: '/provider', previewPath: '/admin/full-app/provider' },
    { label: 'Onboarding', path: '/provider/onboarding', previewPath: '/admin/full-app/provider/onboarding' },
    { label: 'Post shift', path: '/provider/post-shift', previewPath: '/admin/full-app/provider/post-shift' },
    { label: 'Shifts', path: '/provider/shifts', previewPath: '/admin/full-app/provider/shifts' },
    { label: 'Shift detail', path: '/provider/shifts/:shiftId', previewPath: '/admin/full-app/provider/shifts/:shiftId', dynamic: 'shift' },
    { label: 'Worker match', path: '/provider/worker-match/:shiftId', previewPath: '/admin/full-app/provider/worker-match/:shiftId', dynamic: 'shift' },
    { label: 'Workers', path: '/provider/workers', previewPath: '/admin/full-app/provider/workers' },
    { label: 'Worker profile', path: '/provider/workers/:workerId', previewPath: '/admin/full-app/provider/workers/:workerId', dynamic: 'worker' },
    { label: 'Bench', path: '/provider/bench', previewPath: '/admin/full-app/provider/bench' },
    { label: 'Sites', path: '/provider/sites', previewPath: '/admin/full-app/provider/sites' },
    { label: 'New site', path: '/provider/sites/new', previewPath: '/admin/full-app/provider/sites/new' },
    { label: 'Site detail', path: '/provider/sites/:siteId', previewPath: '/admin/full-app/provider/sites/:siteId', dynamic: 'site' },
    { label: 'Timesheets', path: '/provider/timesheets', previewPath: '/admin/full-app/provider/timesheets' },
    { label: 'Billing', path: '/provider/billing', previewPath: '/admin/full-app/provider/billing' },
    { label: 'Compliance', path: '/provider/compliance', previewPath: '/admin/full-app/provider/compliance' },
    { label: 'Team', path: '/provider/team', previewPath: '/admin/full-app/provider/team' },
    { label: 'Referrals', path: '/provider/referrals', previewPath: '/admin/full-app/provider/referrals' },
    { label: 'Support', path: '/provider/support', previewPath: '/admin/full-app/provider/support' },
    { label: 'Profile', path: '/provider/profile', previewPath: '/admin/full-app/provider/profile' },
    { label: 'Settings', path: '/provider/settings', previewPath: '/admin/full-app/provider/settings' },
    { label: 'More', path: '/provider/more', previewPath: '/admin/full-app/provider/more' },
  ]},
  { title: 'Admin', audience: 'Admin', routes: [
    { label: 'Overview', path: '/admin' },
    { label: 'Operations + continuity', path: '/admin/ops' },
    { label: 'Full App', path: '/admin/full-app' },
    { label: 'Credentials', path: '/admin/credentials' },
    { label: 'Marketplace', path: '/admin/marketplace' },
    { label: 'Shift detail', path: '/admin/shifts/:shiftId', dynamic: 'shift' },
    { label: 'Referrals', path: '/admin/referrals' },
    { label: 'Incidents', path: '/admin/incidents' },
    { label: 'Incident detail', path: '/admin/incidents/:incidentId', dynamic: 'incident' },
    { label: 'Trust & Safety', path: '/admin/trust' },
    { label: 'Payments', path: '/admin/payments' },
    { label: 'Rate Review', path: '/admin/worker-rates' },
    { label: 'Support', path: '/admin/support' },
    { label: 'Users', path: '/admin/users' },
  ]},
];

function substituteDynamic(path: string, kind: RouteEntry['dynamic'], ids: { shift: string; worker: string; site: string; incident: string }) {
  if (!kind) return path;
  const value = ids[kind].trim();
  if (!value) return null;
  if (kind === 'shift') return path.replace(':shiftId', value);
  if (kind === 'worker') return path.replace(':workerId', value);
  if (kind === 'site') return path.replace(':siteId', value);
  return path.replace(':incidentId', value);
}

function audienceNote(audience: RouteAudience) {
  if (audience === 'Worker' || audience === 'Provider') return 'Read-only admin preview';
  if (audience === 'Admin') return 'Admin session';
  return 'Public';
}

export default function AdminFullApp() {
  const [shiftId, setShiftId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const routeCount = useMemo(() => SECTIONS.reduce((total, section) => total + section.routes.length, 0), []);
  const ids = { shift: shiftId, worker: workerId, site: siteId, incident: incidentId };

  return (
    <div className="min-h-full bg-[#F7FAFA] text-[#10283D]">
      <header className="border-b border-[#DDE7E8] bg-white px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Control</p>
            <h1 className="mt-1 text-3xl font-semibold text-[#13334F]">Full app inventory</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#607583]">Move through every documented Covre surface from one place. Worker and provider previews stay read-only and do not change the authenticated admin role.</p>
          </div>
          <div className="flex gap-5 text-sm font-semibold">
            <Link to="/admin/ops" className="text-[#2F8E7A] no-underline hover:text-[#257665]">Operations</Link>
            <Link to="/admin" className="text-[#607583] no-underline hover:text-[#13334F]">Overview</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-12 pt-6">
        <section className="grid gap-6 border-b border-[#DDE7E8] pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Route coverage</p>
            <p className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-[#13334F]">{routeCount}</p>
            <p className="mt-1 text-sm text-[#607583]">documented paths across public, worker, provider, and admin surfaces</p>
          </div>
          <p className="max-w-xl text-xs leading-5 text-[#9AAAB3]">In Supabase mode, previews still respect ownership and RLS. Cross-user live data requires dedicated admin read models; this inventory does not bypass them.</p>
        </section>

        <section className="border-b border-[#DDE7E8] py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">Dynamic route context</p>
          <p className="mt-1 text-sm text-[#607583]">Add an ID only when you want to open a detail route.</p>
          <div className="mt-4 grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Shift ID', shiftId, setShiftId, 'shift detail or matching'],
              ['Worker ID', workerId, setWorkerId, 'provider worker profile'],
              ['Site ID', siteId, setSiteId, 'provider site detail'],
              ['Incident ID', incidentId, setIncidentId, 'admin incident detail'],
            ].map(([label, value, setter, helper]) => (
              <label key={label as string} className="text-xs font-semibold text-[#607583]">
                {label as string}
                <input
                  value={value as string}
                  onChange={event => (setter as (value: string) => void)(event.target.value)}
                  placeholder={helper as string}
                  className="mt-1 w-full border-b border-[#BFCED4] bg-transparent py-2 text-sm font-normal text-[#13334F] outline-none placeholder:text-[#A5B3BA] focus:border-[#53B59F]"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="divide-y divide-[#BFCED4]">
          {SECTIONS.map(section => (
            <section key={section.title} className="py-8">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">{section.audience}</p>
                  <h2 className="mt-1 text-xl font-semibold text-[#13334F]">{section.title}</h2>
                </div>
                <p className="text-xs font-medium text-[#607583]">{audienceNote(section.audience)} · {section.routes.length} routes</p>
              </div>

              <div className="border-t border-[#DDE7E8]">
                {section.routes.map(route => {
                  const target = route.previewPath ?? route.path;
                  const resolvedPath = substituteDynamic(target, route.dynamic, ids);
                  return (
                    <div key={`${section.title}-${route.path}`} className="grid gap-3 border-b border-[#DDE7E8] py-4 md:grid-cols-[1.1fr_1.5fr_auto] md:items-center">
                      <div>
                        <p className="font-semibold text-[#13334F]">{route.label}</p>
                        {route.note ? <p className="mt-1 text-xs text-[#9AAAB3]">{route.note}</p> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="break-all font-mono text-xs text-[#607583]">{route.path}</p>
                        {route.previewPath ? <p className="mt-1 break-all text-xs text-[#2F8E7A]">Preview: {route.previewPath}</p> : null}
                      </div>
                      <div className="md:text-right">
                        {resolvedPath ? (
                          <Link to={resolvedPath} className="text-sm font-semibold text-[#2F8E7A] no-underline hover:text-[#257665]">{route.previewPath ? 'Open preview →' : 'Open route →'}</Link>
                        ) : (
                          <span className="text-xs font-medium text-[#9AAAB3]">Add {route.dynamic} ID above</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
