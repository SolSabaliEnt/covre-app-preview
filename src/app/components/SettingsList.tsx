import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pt-7">
      <p className="pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#607583]">{title}</p>
      <div className="border-t border-[#BFCED4]">{children}</div>
    </section>
  );
}

export function SettingsLinkRow({
  to,
  label,
  detail,
  icon: Icon,
  trailing,
}: {
  to: string;
  label: string;
  detail?: string;
  icon?: LucideIcon;
  trailing?: string;
}) {
  return (
    <Link to={to} className="flex min-h-16 items-center gap-4 border-b border-[#DDE7E8] py-4 no-underline transition-colors hover:bg-[#F7FAFA]">
      {Icon ? <Icon className="h-5 w-5 shrink-0 text-[#2F8E7A]" aria-hidden /> : null}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#13334F]">{label}</p>
        {detail ? <p className="mt-0.5 text-sm leading-5 text-[#607583]">{detail}</p> : null}
      </div>
      {trailing ? <span className="shrink-0 text-xs font-semibold text-[#607583]">{trailing}</span> : null}
      <ChevronRight className="h-5 w-5 shrink-0 text-[#B8C6CC]" aria-hidden />
    </Link>
  );
}

export function SettingsToggleRow({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-16 cursor-pointer items-center gap-4 border-b border-[#DDE7E8] py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#13334F]">{label}</p>
        {detail ? <p className="mt-0.5 text-sm leading-5 text-[#607583]">{detail}</p> : null}
      </div>
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-[#DDE7E8] transition-colors peer-checked:bg-[#53B59F] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#53B59F]">
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </label>
  );
}
