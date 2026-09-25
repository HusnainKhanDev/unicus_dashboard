import db from "./conn-db.js";
import { readCSVFile, getallfunds, cleanedNumber, classifyCategory, cleanIndustry, normalizePeriod } from "../utils/helperfunctions.js";


const insert = db.prepare(`
  INSERT INTO holdings (fund, reporting_period, portfolio_company, industry, type_of_investment, category, cost, fair_value, maturity_date, reference_rate)
  VALUES (@fund, @reporting_period, @portfolio_company, @industry, @type_of_investment, @category, @cost, @fair_value, @maturity_date, @reference_rate)
`);


async function insertData() {
    let funds = await getallfunds();

    for (let fund of funds) {
        let final_data = [];

        let data = await readCSVFile(fund);

        for (let row of data.data) {
            let obj = {
                "fund": fund,
                "reporting_period": normalizePeriod(row["Reporting Period"]),
                "portfolio_company": row["Portfolio Company"],
                "industry": cleanIndustry(row["Industry"]),
                "type_of_investment": row["Type of Investment"],
                "category": classifyCategory(row["Type of Investment"]),
                "cost": cleanedNumber(row["Cost"]),
                "fair_value": cleanedNumber(row["Fair Value"]),
                "maturity_date": row["Maturity Date"],
                "reference_rate": row["Reference Rate"] ?? null
            }

            final_data.push(obj);
        }

        const insertMany = db.transaction((rows) => {
            for (const row of rows) insert.run(row);
        });

        insertMany(final_data);

    }
}

insertData();