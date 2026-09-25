import { NextResponse } from "next/server";
import db from "../../../../../db/conn-db";

export async function GET(request, { params }) {
    const { fund, date } = await params;
    
    let rows = db.prepare(`SELECT portfolio_company, industry, type_of_investment, category, cost, fair_value, maturity_date, reference_rate, reporting_period
                          FROM holdings WHERE fund = @fund AND reporting_period = @date`).all({fund, date});

    const full_data = rows.map(r => ({
        "Portfolio Company": r.portfolio_company,
        "Industry": r.industry,
        "Type of Investment": r.type_of_investment,
        "Category": r.category,
        "Cost": r.cost,
        "Fair Value": r.fair_value,
        "Maturity Date": r.maturity_date,
        "Reference Rate": r.reference_rate,
        "Reporting Period": r.reporting_period
    }));

    return NextResponse.json(full_data);

}