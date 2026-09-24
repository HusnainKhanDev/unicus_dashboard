import ChartCard from "../ChartCard";

// Same categorical palette the old React app used (CHART_COLORS), just the
// first 3 slots since there are only 3 buckets here.
const COLORS = ["#2a78d6", "#eb6834", "#1baf7a"]; // blue, orange, aqua

function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// `data`: the type_of_investment array already prepared by the API —
// [{ type, fairValue }] for Debt / Equity / Other. This component only
// renders it (percentages here are just for drawing bar widths, same as
// the old app did client-side, not a business computation).
export default function AssetClassBreakdown({ data, period }) {
  const chartData = (data ?? []).filter((d) => d.fairValue > 0);
  const total = chartData.reduce((sum, d) => sum + d.fairValue, 0);

  return (
    <ChartCard
      title="Debt vs Equity"
      subtitle={`Fair Value split by type of investment — ${period ?? "no data"}`}
    >
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No data for this period.</p>
      ) : (
        <>
          <div className="flex h-7 w-full gap-0.75">
            {chartData.map((d, i) => {
              const pct = (d.fairValue / total) * 100;
              return (
                <div
                  key={d.type}
                  title={`${d.type}: ${formatCurrency(d.fairValue)} (${pct.toFixed(1)}%)`}
                  className={`flex items-center justify-center text-xs font-medium text-white ${
                    i === 0 ? "rounded-l-full" : ""
                  } ${i === chartData.length - 1 ? "rounded-r-full" : ""}`}
                  style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                >
                  {pct >= 12 ? `${pct.toFixed(0)}%` : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {chartData.map((d, i) => (
              <div key={d.type} className="flex items-start gap-2">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <div>
                  <p className="text-xs text-slate-500">{d.type}</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatCurrency(d.fairValue)}{" "}
                    <span className="font-normal text-slate-400">
                      ({((d.fairValue / total) * 100).toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  );
}
