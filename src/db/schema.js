import db from "./conn-db.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fund TEXT NOT NULL,
    reporting_period TEXT NOT NULL,
    portfolio_company TEXT,
    industry TEXT,
    type_of_investment TEXT,
    category TEXT,
    cost REAL,
    fair_value REAL,
    maturity_date TEXT,
    reference_rate TEXT
  )
`);

const existingCols = db.prepare("PRAGMA table_info(holdings)").all().map((c) => c.name);
if (!existingCols.includes("reference_rate")) {
  db.exec("ALTER TABLE holdings ADD COLUMN reference_rate TEXT");
}
if (existingCols.includes("principal")) {
  db.exec("ALTER TABLE holdings DROP COLUMN principal");
}

console.log("holdings table ready");
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_fund_period ON holdings (fund, reporting_period);
`);
