import {NextResponse} from "next/server";
import fs from 'fs/promises';
import path from 'path';
import papa from 'papaparse';
import { normalizePeriod, cleanedNumber, cleanIndustry, readCSVFile} from "@/utils/helperfunctions.js";


function sumCost_FV(data, date) {
    data = data.filter(obj => normalizePeriod(obj["Reporting Period"]) == date);
    let number_of_rows = data.length;
    let totalCost = data.reduce((sum, obj) => {
        return sum + (cleanedNumber(obj["Cost"]) || 0);
    }, 0)

    let totalFv = data.reduce((sum, obj) => {
        return sum + (cleanedNumber(obj["Fair Value"]) || 0);
    }, 0)

    return { totalCost, totalFv, number_of_rows };
}


function getIndustryData(data, date) {
    const industry_set = new Set();
    const ind_obj = [];

    data = data.filter(obj => normalizePeriod(obj["Reporting Period"]) === date);
    for (const obj of data) {
        if (obj["Industry"].trim() !== "" && obj["Industry"].trim() !== obj["Portfolio Company"]) {
            industry_set.add(cleanIndustry(obj["Industry"]));
        }
    }

    for (const ind of industry_set) {
        const sum = data.reduce((sum, obj) => {
            if (cleanIndustry(obj["Industry"]) === ind) {
                return sum + (cleanedNumber(obj["Fair Value"]) || 0);
            }

            return sum;
        }, 0);
        
        ind_obj.push({ industry: ind, totalFV: sum });
    }
    const sortedData = ind_obj.toSorted((a, b) => b.totalFV - a.totalFV);

    return sortedData.slice(0, 10);
}


function getTrend_OverPeriod(data) {
    const period_set = new Set();
    const per_obj = [];

    for (const obj of data) {
        period_set.add(normalizePeriod(obj["Reporting Period"]));
    }

    for (const per of period_set) {
        const totals = data.reduce((acc, obj) => {
            if (normalizePeriod(obj["Reporting Period"]) === per) {
                acc.totalFV += cleanedNumber(obj["Fair Value"]) || 0;
                acc.totalCost += cleanedNumber(obj["Cost"]) || 0;
            }
            return acc;
        },
            { totalFV: 0, totalCost: 0 }
        );

        per_obj.push({
            period: per,
            totalFV: totals.totalFV,
            totalCost: totals.totalCost
        });
    }

    per_obj.sort((a, b) => new Date(a.period) - new Date(b.period));

    return per_obj;
}


function Type_of_Investment(data, date) {
    const debt_keyword = ["debt", "loan", "lien", "note", "bond", "revolver", "unitranche", "subordinated", "credit facility", "draw"];
    const equity_keyword = ["equity", "stock", "warrant", "unit", "partnership", "preferred", "common", "membership", "shares", "interest", "member", "participation"];

    data = data.filter(obj => normalizePeriod(obj["Reporting Period"]) === date);

    const per_obj = { Debt: 0, Equity: 0, Other: 0 };

    for (const obj of data) {
        const investment_type = (obj["Type of Investment"] || "").toLowerCase();
        const fairValue = cleanedNumber(obj["Fair Value"]) || 0;

        if (debt_keyword.some(keyword => investment_type.includes(keyword))) {
            per_obj.Debt += fairValue;
        } else if (equity_keyword.some(keyword => investment_type.includes(keyword))) {
            per_obj.Equity += fairValue;
        } else {
            per_obj.Other += fairValue;
        }
    }

    return [
        { type: "Debt", fairValue: per_obj.Debt },
        { type: "Equity", fairValue: per_obj.Equity },
        { type: "Other", fairValue: per_obj.Other }
    ];
}


async function fund_fv_data(date) {
    let calculatedData = [];
    const filesPath = path.join(process.cwd(), "src/Data");
    const files = await fs.readdir(filesPath);
    let funds = files.map((f) => {
        return f.split(".")[0];
    })

    for (let fund of funds) {
        let sumfv = 0; 
        const parsedData = await readCSVFile(fund);
        let data = parsedData.data;
        data = data.filter(obj => normalizePeriod(obj["Reporting Period"]) === date);

        for (const obj of data) {
            sumfv += cleanedNumber(obj["Fair Value"]) || 0;
        }

        calculatedData.push({ fund, sumfv });
    }
    return calculatedData.sort((a, b) => b.sumfv - a.sumfv);

    
}


export async function GET(request, {params}) {
    const {fund, date} = await params;

    const parsedData = await readCSVFile(fund);
    const sum_cost_fv = sumCost_FV(parsedData.data, date);
    const industry_data = getIndustryData(parsedData.data, date);
    const trend_data = getTrend_OverPeriod(parsedData.data);
    const type_of_investment = Type_of_Investment(parsedData.data, date);   
    let P_L = sum_cost_fv.totalFv - sum_cost_fv.totalCost;
    let fund_fv = await fund_fv_data(date);

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
        // parsedData.data,
        final_obj,
        { status: 200 }
    )
}