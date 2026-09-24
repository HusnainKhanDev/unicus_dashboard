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

// Same one-hue sequential ramp as the old React app (light -> dark), and the
// same shade-picking logic — largest bar gets the darkest shade.
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

// `data`: the industry_data array already prepared by the API —
// [{ industry, totalFV }], already sorted descending and capped to 10.
// This component only renders it, no grouping/sorting/slicing here.
export default function IndustryExposure({ data, period }) {
  const chartData = data ?? [];
  const shades = sequentialShades(chartData.length);

  return (
    <ChartCard
      title={`Top ${chartData.length} Industries`}
      subtitle={`Fair Value by industry — ${period ?? "no data"}`}
    >
      {chartData.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No data for this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 4, left: 8 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
            <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              type="category"
              dataKey="industry"
              width={160}
              tick={{ fontSize: 12, fill: "#334155" }}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="totalFV" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {chartData.map((entry, i) => (
                <Cell key={entry.industry} fill={shades[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
