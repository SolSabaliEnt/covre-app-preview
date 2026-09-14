import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Calendar,
  ClipboardCheck,
  FileText,
  LifeBuoy,
  Shield,
  Users,
} from 'lucide-react';
import { getAdminMarketplaceDashboard } from '../../services';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { isSupabaseBackendEnabled } from '../../lib/backendMode';
import type { AdminMarketplaceSummary } from '../../services/types';

const mockMetrics = [
  { label: 'GMV', value: '$487,320', change: '+12.3% vs last month' },
  { label: 'Revenue', value: '$73,098', change: '+12.3% vs last month' },
  { label: 'Fill Rate', value: '94.2%', change: '+2.1% vs last month' },
  { label: 'Active Workers', value: '1,247', change: '+43 this week' },
  { label: 'Active Providers', value: '87', change: '+5 this week' },
  { label: 'Open Urgent Shifts', value: '23', change: 'Across 12 facilities' },
];

function summaryRows(summary: AdminMarketplaceSummary) {
  return [
    { label: 'Providers', value: String(summary.providerCount), icon: Building2, to: '/admin/users' },
    { label: 'Workers', value: String(summary.workerCount), icon: Users, to: '/admin/users' },
    { label: 'Open shifts', value: String(summary.openShiftCount), icon: Calendar, to: '/admin/marketplace' },
    { label: 'Booked shifts', value: String(summary.bookedShiftCount), icon: Calendar, to: '/admin/marketplace' },
    { label: 'Bookings', value: String(summary.bookingCount), icon: ClipboardCheck, to: '/admin/marketplace' },
    {
      label: 'Submitted timesheets',
      value: String(summary.submittedTimesheetCount),
      icon: ClipboardCheck,
      to: '/admin/payments',
    },
    {
      label: 'Approved timesheets',
      value: String(summary.approvedTimesheetCount),
      icon: ClipboardCheck,
      to: '/admin/payments',
    },
    { label: 'Draft invoices', value: String(summary.invoiceDraftCount), icon: FileText, to: '/admin/payments' },
    {
      label: 'Compliance packets',
      value: String(summary.compliancePacketCount),
      icon: Shield,
      to: '/admin/credentials',
    },
    { label: 'Support tickets', value: String(summary.supportTicketCount), icon: LifeBuoy, to: '/admin/support' },
    {
      label: 'Credentials to review',
      value: String(summary.credentialReviewCount),
      icon: AlertTriangle,
      to: '/admin/credentials',
      warn: summary.credentialReviewCount > 0,
    },
  ];
}

function MockDashboardView() {
  return (
    <>
      <section>
        <div className="grid border-y border-[#DDE7E8] sm:grid-cols-2 xl:grid-cols-3">
          {mockMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`py-6 sm:px-6 ${index % 3 !== 0 ? 'xl:border-l xl:border-[#DDE7E8]' : ''} ${
                index >= 3 ? 'border-t border-[#DDE7E8]' : ''
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[#13334F]">{metric.value}</p>
              <p className="mt-2 text-sm text-[#2F8E7A]">{metric.change}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">Needs attention</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#13334F]">Action required</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#607583]">
            Simulated ops queue for preview mode. Use Operations for the fuller control-center view.
          </p>
          <Link
            to="/admin/ops"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#13334F] no-underline"
          >
            Open operations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">System</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#13334F]">Platform health</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#607583]">
            Demo metrics only in mock mode. Supabase-connected admin pages will surface live marketplace state here.
          </p>
        </div>
      </section>
    </>
  );
}

function SupabaseDashboardView() {
  const { data, error, loading, reload } = useAsyncResource(() => getAdminMarketplaceDashboard(), []);

  if (loading) {
    return <p className="py-16 text-sm text-[#607583]">Loading marketplace overview…</p>;
  }

  if (error) {
    return (
      <div className="border-y border-[#F4D39C] py-8">
        <p className="text-sm text-[#607583]">{error.message}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#13334F] px-4 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const rows = summaryRows(data.summary);
  const allZero = Object.values(data.summary).every(v => v === 0);
  const urgentCount = data.summary.credentialReviewCount + data.summary.submittedTimesheetCount + data.summary.supportTicketCount;

  return (
    <>
      <section className="grid gap-8 border-y border-[#DDE7E8] py-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F8E7A]">Live marketplace</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#13334F]">What needs your attention now</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#607583]">
            This admin view is read-only. Sensitive actions stay behind audited RPC and Edge workflows.
          </p>
        </div>
        <div className="lg:text-right">
          <p className="text-4xl font-semibold tracking-tight text-[#13334F]">{urgentCount}</p>
          <p className="mt-1 text-sm text-[#607583]">items across credentials, timesheets, and support</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Marketplace snapshot</p>
            <h2 className="mt-2 text-xl font-semibold text-[#13334F]">Operational counts</h2>
          </div>
          <Link to="/admin/ops" className="text-sm font-semibold text-[#13334F] no-underline">
            Open operations
          </Link>
        </div>

        <div className="border-t border-[#DDE7E8]">
          {rows.map(row => {
            const Icon = row.icon;
            return (
              <Link
                key={row.label}
                to={row.to}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[#DDE7E8] py-4 no-underline"
              >
                <span className={`flex h-9 w-9 items-center justify-center ${row.warn ? 'text-[#9B6419]' : 'text-[#607583]'}`}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-[#13334F]">{row.label}</span>
                  {row.warn ? <span className="mt-0.5 block text-xs font-medium text-[#9B6419]">Review queue has pending items</span> : null}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xl font-semibold text-[#13334F]">{row.value}</span>
                  <ArrowRight className="h-4 w-4 text-[#9AAAB3] transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        {allZero ? (
          <p className="mt-4 text-sm text-[#607583]">
            No marketplace records yet, or admin read policies are not applied on this project.
          </p>
        ) : null}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">Latest movement</p>
          <h2 className="mt-2 text-xl font-semibold text-[#13334F]">Recent activity</h2>
        </div>
        {data.activity.length === 0 ? (
          <p className="border-t border-[#DDE7E8] py-5 text-sm text-[#607583]">
            No recent shifts, bookings, timesheets, or tickets.
          </p>
        ) : (
          <ul className="border-t border-[#DDE7E8]">
            {data.activity.map(row => (
              <li key={`${row.type}-${row.id}`} className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DDE7E8] py-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9AAAB3]">{row.type}</p>
                  <p className="mt-1 font-medium text-[#13334F]">{row.label}</p>
                  <p className="mt-1 text-sm text-[#607583]">
                    {row.status}
                    {row.createdAt ? ` · ${row.createdAt}` : ''}
                  </p>
                </div>
                {row.href ? (
                  <Link to={row.href} className="shrink-0 text-sm font-semibold text-[#13334F] no-underline">
                    View
                  </Link>
                ) : (
                  <span className="text-xs text-[#9AAAB3]">Read-only</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function AdminDashboard() {
  const supabaseMode = isSupabaseBackendEnabled();

  return (
    <div className="min-h-full bg-[#F7FAFA]">
      <header className="border-b border-[#DDE7E8] bg-white px-8 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8E7A]">Covre admin</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-[#13334F]">Keep the marketplace moving.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#607583]">
                {supabaseMode
                  ? 'Read the live marketplace, find friction, and move into the right operational queue.'
                  : 'Preview the operational layer behind shifts, people, money, trust, and continuity.'}
              </p>
            </div>
            <Link
              to="/admin/ops"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#13334F] px-4 text-sm font-semibold text-white no-underline hover:bg-[#0B243A]"
            >
              Open operations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-8 py-8">
        {supabaseMode ? <SupabaseDashboardView /> : <MockDashboardView />}
      </main>
    </div>
  );
}
