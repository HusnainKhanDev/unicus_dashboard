// Small inline icons per card, monochrome-tinted to match each card's
// accent color. Kept as plain inline SVG so no icon package is needed.
const ICONS = {
  fairValue: (
    <path d="M3 3v18h18M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  cost: (
    <path
      d="M4 6h16v12H4zM4 10h16M8 14h4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  gain: (
    <path d="M4 17l6-6 4 4 6-8M14 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  loss: (
    <path d="M4 7l6 6 4-4 6 8M14 18h6v-6" strokeLinecap="round" strokeLinejoin="round" />
  ),
  lines: (
    <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const ACCENTS = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  slate: { bg: "bg-slate-100", text: "text-slate-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600" },
};

function Icon({ path, accent }) {
  const { bg, text } = ACCENTS[accent];
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${text}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {path}
      </svg>
    </span>
  );
}

// One card's markup — label + value, plus a small colored icon and a hover
// lift for a bit more visual presence than a flat box.
function Card({ label, value, icon, accent }) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3">
        <Icon path={icon} accent={accent} />
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

// The 4 top-line numbers for whatever fund/period is selected.
export default function Cards({ totalFairValue, totalCost, profitLoss, lineCount }) {
  const isLoss = typeof profitLoss === "string" && profitLoss.trim().startsWith("-");

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card label="Total fair value" value={totalFairValue} icon={ICONS.fairValue} accent="blue" />
      <Card label="Total cost" value={totalCost} icon={ICONS.cost} accent="slate" />
      <Card
        label="Profit / loss"
        value={profitLoss}
        icon={isLoss ? ICONS.loss : ICONS.gain}
        accent={isLoss ? "red" : "emerald"}
      />
      <Card label="Number of lines" value={lineCount} icon={ICONS.lines} accent="violet" />
    </div>
  );
}
