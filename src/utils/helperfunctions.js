import papa from 'papaparse';
import fs from 'fs/promises';
import path from 'path';

export function normalizePeriod(value) {
  const d = new Date(value);
  if (isNaN(d)) return value;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function cleanedNumber(num) {
    return Number(num.replace(/[\$,]/g, ''));
}

export function cleanIndustry(industry) {
    const check_split = industry.split("—")
    if (check_split.length > 1) {
        return check_split[0].trim();
    }
    return industry.trim();
}

export async function readCSVFile(fund) {
    const filePath = path.join(process.cwd(), "src/Data", `${fund}.csv`);
    const fileContent = await fs.readFile(filePath, "utf8");
    const parsedData = papa.parse(fileContent, { header: true, skipEmptyLines: true });
    return parsedData;
}

export async function getallfunds(){
    const filesPath = path.join(process.cwd(), "src/Data");
    const files = await fs.readdir(filesPath);
    
    let funds = files.map((f) => {
        return f.split(".")[0];
    })

    return funds;
}

export function classifyCategory(typeOfInvestment) {
    const DEBT_KEYWORDS = ["debt", "loan", "lien", "note", "bond", "revolver", "unitranche", "subordinated", "credit facility", "draw"];
    const EQUITY_KEYWORDS = ["equity", "stock", "warrant", "unit", "partnership", "preferred", "common", "membership", "shares", "interest", "member", "participation"];

    const t = (typeOfInvestment || "").toLowerCase();
    if (DEBT_KEYWORDS.some((k) => t.includes(k))) return "Debt";
    if (EQUITY_KEYWORDS.some((k) => t.includes(k))) return "Equity";
    return "Other";
}