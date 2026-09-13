import { Link } from 'react-router';
import { Building2, ChevronRight, Plus, Users } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { listProviderSites } from '../../services';
import type { CareSite } from '../../data/types';
import { useAsyncResource } from '../../hooks/useAsyncResource';

function SiteStatus({ status }: { status: CareSite['operationalStatus'] }) {
  return status === 'active' ? <StatusBadge variant="covered">Active</StatusBadge> : <StatusBadge variant="pending">Needs review</StatusBadge>;
}

export default function Sites() {
  const { data: careSites, error, loading, reload } = useAsyncResource(() => listProviderSites(), []);

  return (
    <div className="min-h-full bg-white text-[#10283D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-5 sm:px-6">
        <header className="border-b border-[#DDE7E8] pb-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2F8E7A]">Operations</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#13334F]">Care sites</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#607583]">Locations, orientation details, preferred workers, and site-specific staffing rules.</p>
            </div>
            <Link to="/provider/sites/new" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-[#2F8E7A]"><Plus className="h-4 w-4" />Add site</Link>
          </div>
        </header>

        {loading && <p className="border-b border-[#DDE7E8] py-10 text-center text-sm text-[#607583]">Loading sites…</p>}
        {error && <div className="border-b border-[#DDE7E8] py-10 text-center"><p className="text-sm text-[#607583]">{error.message}</p><button type="button" onClick={reload} className="mt-4 min-h-11 rounded-xl bg-[#13334F] px-5 text-sm font-semibold text-white">Try again</button></div>}

        {!loading && !error && careSites && careSites.length === 0 && (
          <section className="py-12 text-center"><Building2 className="mx-auto h-8 w-8 text-[#53B59F]" /><p className="mt-3 font-semibold text-[#13334F]">No care sites yet.</p><Link to="/provider/sites/new" className="mt-4 inline-flex text-sm font-semibold text-[#2F8E7A]">Add your first site</Link></section>
        )}

        {!loading && !error && careSites && careSites.length > 0 && (
          <section className="pt-7">
            <div className="border-t border-[#BFCED4]">
              {careSites.map(site => (
                <Link key={site.id} to={`/provider/sites/${site.id}`} className="flex items-center gap-4 border-b border-[#DDE7E8] py-5 no-underline transition-colors hover:bg-[#F7FAFA]">
                  <Building2 className="h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-[#13334F]">{site.name}</h2><SiteStatus status={site.operationalStatus} /></div>
                    <p className="mt-1 text-sm text-[#607583]">{site.facilityType}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#607583]"><span><strong className="text-[#13334F]">{site.residents}</strong> residents</span><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-[#53B59F]" /><strong className="text-[#13334F]">{site.preferredWorkerSlots}</strong> preferred workers</span></div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#B8C6CC]" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
