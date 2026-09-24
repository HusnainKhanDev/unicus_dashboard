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