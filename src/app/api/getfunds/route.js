import { NextResponse } from "next/server";
import db from "@/db/conn-db.js";

export async function GET() {
  const fundRows = db.prepare("SELECT DISTINCT fund FROM holdings").all();
  const periodRows = db.prepare("SELECT DISTINCT reporting_period FROM holdings").all();
  console.log("fundRows", fundRows);
  
  let funds = fundRows.map((r) => r.fund);

  funds.reverse();

  const periods = periodRows
    .map((r) => r.reporting_period)
    .sort((a, b) => new Date(b) - new Date(a));

  return NextResponse.json(
    {
      funds,
      periods,
    },
    { status: 200 }
  );
}