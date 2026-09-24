import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';
import { normalizePeriod, cleanedNumber, cleanIndustry, readCSVFile} from "@/utils/helperfunctions.js";


const DEBT_KEYWORDS = ["debt", "loan", "lien", "note", "bond", "revolver", "unitranche", "subordinated", "credit facility", "draw"];
const EQUITY_KEYWORDS = ["equity", "stock", "warrant", "unit", "partnership", "preferred", "common", "membership", "shares", "interest", "member", "participation"];

function classifyCategory(typeOfInvestment) {
    const t = (typeOfInvestment || "").toLowerCase();
    if (DEBT_KEYWORDS.some((keyword) => t.includes(keyword))) return "Debt";
    if (EQUITY_KEYWORDS.some((keyword) => t.includes(keyword))) return "Equity";
    return "Other";
}

export async function GET(request, { params }) {
    const { fund, date } = await params;
    let full_data = [];
    const parsedData = await readCSVFile(fund);
    let data = parsedData.data;
    data = data.filter(obj => normalizePeriod(obj["Reporting Period"]) === date);

    for (const obj of data) {
        full_data.push({
            "Portfolio Company": obj["Portfolio Company"],
            "Industry": cleanIndustry(obj["Industry"]),              // ← clean it, same as the Industry chart does
            "Type of Investment": obj["Type of Investment"],          // ← add: the specific instrument (e.g. "First Lien Term Loan")
            "Category": classifyCategory(obj["Type of Investment"]), // ← Debt / Equity / Other, per row
            "Cost": cleanedNumber(obj["Cost"]),
            "Fair Value": cleanedNumber(obj["Fair Value"]),
            "Maturity Date": obj["Maturity Date"],                    // ← add: when the loan matures
            "Reporting Period": normalizePeriod(obj["Reporting Period"])
        }
        );
    }
    return NextResponse.json(full_data);
}