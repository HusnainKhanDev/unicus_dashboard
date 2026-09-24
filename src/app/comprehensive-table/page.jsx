"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import HoldingsTable from "@/components/HoldingsTable";

export default function ComprehensiveTablePage() {
  const [funds, setFunds] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedFund, setSelectedFund] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [rows, setRows] = useState([]);

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

  // Get the raw holding rows for the selected fund + period.
  useEffect(() => {
    if (!selectedFund || !selectedPeriod) return;
    fetch(
      `/api/gettable-data/${encodeURIComponent(selectedFund)}/${encodeURIComponent(selectedPeriod)}`
    )
      .then((res) => res.json())
      .then(setRows);
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

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Holdings</h2>
          <p className="text-sm text-slate-400">
            Every position for {selectedFund || "…"} — {selectedPeriod || "…"} — search, filter, and sort
          </p>
        </div>

        <HoldingsTable data={rows} />
      </main>
    </div>
  );
}
