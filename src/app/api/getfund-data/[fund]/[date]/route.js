import {NextResponse} from "next/server";
import db from "@/db/conn-db.js";


function sumCost_FV(fund, date) {
    const row = db.prepare(`
        SELECT COUNT(*) as number_of_rows, SUM(cost) as totalCost, SUM(fair_value) as totalFv
        FROM holdings WHERE fund = ? AND reporting_period = ?
    `).get(fund, date);

    return {
        totalCost: row.totalCost || 0,
        totalFv: row.totalFv || 0,
        number_of_rows: row.number_of_rows || 0
    };
}


function getIndustryData(fund, date) {
    const rows = db.prepare(`
        SELECT industry, SUM(fair_value) as totalFV
        FROM holdings
        WHERE fund = ? AND reporting_period = ?
          AND TRIM(industry) != ''
          AND TRIM(industry) != TRIM(portfolio_company)
        GROUP BY industry
        ORDER BY totalFV DESC
        LIMIT 10
    `).all(fund, date);

    return rows.map((r) => ({ industry: r.industry, totalFV: r.totalFV || 0 }));
}

function getTrend_OverPeriod(fund) {
    const rows = db.prepare(`
        SELECT reporting_period, SUM(fair_value) as totalFV, SUM(cost) as totalCost
        FROM holdings
        WHERE fund = ?
        GROUP BY reporting_period
    `).all(fund);

    const per_obj = rows.map((r) => ({
        period: r.reporting_period,
        totalFV: r.totalFV || 0,
        totalCost: r.totalCost || 0
    }));

    per_obj.sort((a, b) => new Date(a.period) - new Date(b.period));

    return per_obj;
}


function Type_of_Investment(fund, date) {
    const rows = db.prepare(`
        SELECT category, SUM(fair_value) as fairValue
        FROM holdings
        WHERE fund = ? AND reporting_period = ?
        GROUP BY category
    `).all(fund, date);

    const totals = { Debt: 0, Equity: 0, Other: 0 };
    
    for (const r of rows) {
        if (r.category in totals) {
            totals[r.category] = r.fairValue || 0;
        }
    }

    return [
        { type: "Debt", fairValue: totals.Debt },
        { type: "Equity", fairValue: totals.Equity },
        { type: "Other", fairValue: totals.Other }
    ];
}


function fund_fv_data(date) {
    const rows = db.prepare(`
        SELECT fund, SUM(fair_value) as sumfv
        FROM holdings
        WHERE reporting_period = ?
        GROUP BY fund
        ORDER BY sumfv DESC
    `).all(date);

    return rows.map((r) => ({ fund: r.fund, sumfv: r.sumfv || 0 }));
}


export async function GET(request, {params}) {
    const {fund, date} = await params;

    const sum_cost_fv = sumCost_FV(fund, date);
    const industry_data = getIndustryData(fund, date);
    const trend_data = getTrend_OverPeriod(fund);
    const type_of_investment = Type_of_Investment(fund, date);
    let P_L = sum_cost_fv.totalFv - sum_cost_fv.totalCost;
    let fund_fv = fund_fv_data(date);

    let final_obj = {
        fund: fund,
        totalCost: sum_cost_fv.totalCost,
        totalFv: sum_cost_fv.totalFv,
        P_L: P_L,
        industry_data: industry_data,
        type_of_investment: type_of_investment,
        trend_data: trend_data,
        fund_fv_data: fund_fv,
        number_of_rows: sum_cost_fv.number_of_rows
    }

    return NextResponse.json(
        final_obj,
        { status: 200 }
    )
}