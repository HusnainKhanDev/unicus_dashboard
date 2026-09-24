"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/comprehensive-table", label: "Holdings" },
];

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

// Top navbar: title + nav tabs on the left, Fund + Period dropdowns on the
// right. A soft gradient wash and a colored accent bar give it a bit more
// visual presence than a plain white bar, without going overboard.
export default function Header({
  funds,
  selectedFund,
  onFundChange,
  periods,
  selectedPeriod,
  onPeriodChange,
}) {
  const pathname = usePathname();

  return (
    <header className="relative border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/60">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500" />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Unicus Dashboard</h1>
            <p className="text-xs text-slate-400">SEC filing holdings, Mar 2021 – present</p>
          </div>
          <nav className="flex gap-1 rounded-lg bg-slate-100/80 p-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Fund
            <select
              aria-label="Fund"
              className={selectClass}
              value={selectedFund}
              onChange={(e) => onFundChange(e.target.value)}
            >
              {funds.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            Period
            <select
              aria-label="Period"
              className={selectClass}
              value={selectedPeriod ?? ""}
              onChange={(e) => onPeriodChange(e.target.value)}
            >
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
