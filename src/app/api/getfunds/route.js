import { NextResponse } from "next/server";
import fs from 'fs/promises';
import path from 'path';
import papa from 'papaparse';
import { normalizePeriod } from "@/utils/helperfunctions.js";

async function GetUniquePeriods(dirpath, filenames) {
  let UniquePeriods = new Set();

  for(let fn of filenames) {
    const filePath = path.join(dirpath, fn);
    const fileContent = await fs.readFile(filePath, "utf8");
    const parsedData = papa.parse(fileContent, { header: true, skipEmptyLines: true });
    let rows = parsedData.data;
    for(let r of rows){
      UniquePeriods.add(normalizePeriod(r["Reporting Period"]));
    }
  }

  const sortedPeriods = [...UniquePeriods].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return sortedPeriods;
}

export async function GET() {
  const filesPath = path.join(process.cwd(), "src/Data");
  const files = await fs.readdir(filesPath);
  
  let funds = files.map((f) => {
    return f.split(".")[0];
  })

  let dates = await GetUniquePeriods(filesPath, files)

  return NextResponse.json(
    {
      funds: funds,
      periods: [...dates],
    },
    { status: 200 }
  );
}