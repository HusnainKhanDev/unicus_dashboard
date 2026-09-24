import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "../ChartCard";

// Same two colors the old React app used for this chart (from its shared
// CHART_COLORS palette, slots 1 and 2).
const FAIR_VALUE_COLOR = "#2a78d6";
const TOTAL_COST_COLOR = "#eb6834";

const CHART_GRID_COLOR = "#e2e8f0"; // tailwind slate-200

function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// `data`: the trend_data array already prepared by the API —
// [{ period, totalFV, totalCost }], already summed per period and sorted
// chronologically ascending. This component only renders it.
export default function PortfolioTrend({ data }) {
  const chartData = data ?? [];
  const latest = chartData[chartData.length - 1];

  return (
    <ChartCard title="Portfolio Trend" subtitle="Total Fair Value vs Cost, by filing period">
      {chartData.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No data for this fund.</p>
      ) : (
        <>
          {latest && (
            <p className="-mt-1 mb-3 text-xs text-slate-500">
              Latest ({latest.period}):{" "}
              <span className="font-semibold" style={{ color: FAIR_VALUE_COLOR }}>
                Fair Value {formatCurrency(latest.totalFV)}
              </span>{" "}
              ·{" "}
              <span className="font-semibold" style={{ color: TOTAL_COST_COLOR }}>
                Cost {formatCurrency(latest.totalCost)}
              </span>
            </p>
          )}
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tickFormatter={formatCurrency} width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="totalFV"
                name="Fair Value"
                stroke={FAIR_VALUE_COLOR}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="totalCost"
                name="Cost"
                stroke={TOTAL_COST_COLOR}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </ChartCard>
  );
}
