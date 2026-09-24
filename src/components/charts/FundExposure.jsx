import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "../ChartCard";

// Same one-hue sequential ramp as Industry Exposure (light -> dark),
// largest bar gets the darkest shade.
const SEQUENTIAL_BLUE = [
  "#cde2fb",
  "#9ec5f4",
  "#6da7ec",
  "#3987e5",
  "#256abf",
  "#184f95",
  "#0d366b",
];

function sequentialShades(count) {
  if (count <= 1) return [SEQUENTIAL_BLUE[SEQUENTIAL_BLUE.length - 1]];
  const steps = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    steps.push(SEQUENTIAL_BLUE[Math.round(t * (SEQUENTIAL_BLUE.length - 1))]);
  }
  return steps.reverse();
}

const CHART_GRID_COLOR = "#e2e8f0"; // tailwind slate-200

function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// `data`: the fund_fv_data array already prepared by the API —
// [{ fund, sumfv }], already summed per fund for this period and sorted
// descending. Always compares ALL funds, independent of which fund is
// selected in the dropdown -- that's the whole point of this chart.
export default function FundExposure({ data, period }) {
  const chartData = data ?? [];
  const shades = sequentialShades(chartData.length);

  return (
    <ChartCard title="Fund Exposure" subtitle={`Fair Value by fund — ${period ?? "no data"}`}>
      {chartData.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No data for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
            <XAxis dataKey="fund" tick={{ fontSize: 12, fill: "#334155" }} />
            <YAxis tickFormatter={formatCurrency} width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="sumfv" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, i) => (
                <Cell key={entry.fund} fill={shades[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
