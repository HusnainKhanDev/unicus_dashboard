# Unicus Dashboard

A Next.js dashboard for exploring BDC (Business Development Company) SEC filing
data — pick a fund and a filing period, and see fair value/cost totals, a
Debt vs Equity split, top industries, a portfolio trend over time, a
fund-vs-fund comparison, and a searchable table of every underlying holding.

Rebuilt from an earlier plain React + Vite version of the same dashboard.

## Tech stack

- **Next.js 16** (App Router) — frontend pages + backend API routes in one project
- **React 19**
- **Tailwind CSS 4**
- **Recharts** — charts
- **@tanstack/react-table** — the holdings table (search, sort, filter, pagination)
- **PapaParse** — CSV parsing
- Data source: static CSV files in `src/Data/` (no database yet)


## Pages

| Route | What it shows |
|---|---|
| `/dashboard` | Fund/period picker, summary cards, and all 4 charts |
| `/comprehensive-table` | Fund/period picker + a searchable, sortable table of every holding |

## Data

Three funds, one CSV each, in `src/Data/`:

| File | Fund |
|---|---|
| `CCLFX.csv` | Cliffwater Corporate Lending Fund |
| `OSCF.csv` | Oaktree Strategic Credit Fund |
| `TCPC.csv` | BlackRock TCP Capital Corp |

Each file is a series of quarterly filing snapshots — the same holding
reappears every quarter it was held, so any total must be scoped to a single
`Reporting Period`, never summed across periods.

All three files use a consistent `Type of Investment` column (the specific
instrument, e.g. "First Lien Term Loan") — this was originally named
differently per fund (`Investment Type` / `Type of Investment` / `Instrument`)
and was renamed in each CSV's header for consistency. Everything else
(`Cost`, `Fair Value`, `Industry`, `Reporting Period`) already matched across
funds without changes.

## Architecture

The API routes do all the aggregation/classification; the frontend only
renders whatever comes back — no summing, grouping, or sorting happens in
the browser.

### `GET /api/getfunds`

Returns the list of funds (from filenames in `src/Data/`) and every distinct
filing period across all of them, normalized to one date format and sorted.

```json
{ "funds": ["CCLFX", "OSCF", "TCPC"], "periods": ["March 31, 2021", "...", "March 31, 2026"] }
```

### `GET /api/getfund-data/[fund]/[date]`

The summary + chart data for one fund, scoped to one period.

```json
{
  "fund": "CCLFX",
  "totalCost": 39978772068,
  "totalFv": 39962131663,
  "P_L": -16640405,
  "number_of_rows": 3506,
  "industry_data": [{ "industry": "Technology", "totalFV": 8152533443 }, "... top 10, sorted desc"],
  "type_of_investment": [{ "type": "Debt", "fairValue": 27041300605 }, "Equity", "Other"],
  "trend_data": [{ "period": "June 30, 2021", "totalFV": 2774658533, "totalCost": 0 }, "... every period, sorted ascending"],
  "fund_fv_data": [{ "fund": "CCLFX", "sumfv": 39962131663 }, "... all funds, sorted desc, same for this date regardless of which fund's URL you hit"]
}
```

### `GET /api/gettable-data/[fund]/[date]`

The raw per-holding rows for the holdings table, scoped to one fund + period.

```json
[
  {
    "Portfolio Company": "ALKU Intermediate Holdings, LLC",
    "Industry": "Business Services",
    "Type of Investment": "First Lien Term Loan",
    "Category": "Debt",
    "Cost": 21939022,
    "Fair Value": 22244001,
    "Maturity Date": "5/23/2029",
    "Reporting Period": "March 31, 2024"
  }
]
```

`Category` (Debt / Equity / Other) is classified from `Type of Investment`
text via keyword matching — the same lists and check order (Debt keywords
checked first) as the Debt vs Equity chart's own classifier, just applied
per row instead of summed into totals.

## Known issues

- **`getfund-data` is slow, especially for CCLFX** (its file has 20,675 rows
  across 11 periods) — a single request can take 20–60+ seconds. The cause:
  several of its aggregation functions re-scan the *entire* dataset once per
  period instead of grouping in a single pass, and `fund_fv_data` re-reads
  all 3 CSV files from disk on every request rather than reusing what's
  already loaded. Needs a rewrite to normalize each row's period once and
  aggregate in one pass.
- **Default period on first load can be wrong for the default fund.**
  `getfunds` returns one merged period list across all 3 funds; the
  earliest period in that list may not exist for whichever fund is selected
  by default, showing $0/"no data" until the user manually picks a valid
  period.
- No database yet — data lives in static CSVs. A future iteration may move
  fund data into Postgres, with the API routes reading from there instead of
  `src/Data/`.
