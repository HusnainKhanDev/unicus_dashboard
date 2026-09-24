"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Cards from "@/components/Cards";
import IndustryExposure from "@/components/charts/IndustryExposure";
import PortfolioTrend from "@/components/charts/PortfolioTrend";
import AssetClassBreakdown from "@/components/charts/AssetClassBreakdown";
import FundExposure from "@/components/charts/FundExposure";

// Pure display formatting only — no summing/filtering/deriving here.
// All of that now happens in the API (getfund-data/[fund]/[date]).
function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const [funds, setFunds] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [summary, setSummary] = useState(null);

  // Get the funds + periods lists once, straight from the API, for the dropdowns.
  useEffect(() => {
    fetch("/api/getfunds")
      .then((res) => res.json())
      .then((data) => {
        setFunds(data.funds);
        setPeriods(data.periods);
        setSelectedFund((current) => current || data.funds[0] || "");
        setSelectedPeriod((current) => current || data.periods[0] || "");
      });
  }, []);

  // Get the already-computed summary for the selected fund + period.
  useEffect(() => {
    if (!selectedFund || !selectedPeriod) return;
    fetch(
      `/api/getfund-data/${encodeURIComponent(selectedFund)}/${encodeURIComponent(selectedPeriod)}`
    )
      .then((res) => res.json())
      .then(setSummary);
  }, [selectedFund, selectedPeriod]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        funds={funds}
        selectedFund={selectedFund}
        onFundChange={setSelectedFund}
        periods={periods}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Portfolio Overview</h2>
          <p className="text-sm text-slate-400">Snapshot as of the selected filing period</p>
        </div>

        <Cards
          totalFairValue={formatCurrency(summary?.totalFv)}
          totalCost={formatCurrency(summary?.totalCost)}
          profitLoss={formatCurrency(summary?.P_L)}
          lineCount={summary?.number_of_rows?.toLocaleString() ?? "—"}
        />

        <AssetClassBreakdown data={summary?.type_of_investment} period={selectedPeriod} />

        <IndustryExposure data={summary?.industry_data} period={selectedPeriod} />

        <PortfolioTrend data={summary?.trend_data} />

        <FundExposure data={summary?.fund_fv_data} period={selectedPeriod} />
      </main>
    </div>
  );
}
