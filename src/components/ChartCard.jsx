// Consistent card chrome for every chart: title, subtitle, and a content
// slot. Same subtle hover lift as the stat cards, so every card on the
// dashboard feels part of one system.
export default function ChartCard({ title, subtitle, className = "", children }) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
