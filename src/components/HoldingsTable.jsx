"use client";

import { useMemo, useState } from "react";
import {
  useTable,
  tableFeatures,
  createColumnHelper,
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  filterFn_includesString,
  filterFn_equalsString,
  sortFn_alphanumeric,
  sortFn_basic,
} from "@tanstack/react-table";

// Register only the behavior this table uses: column + global filtering,
// sorting, and client-side pagination. Same setup as the old React app's
// HoldingsTable — the rows here are already scoped to one fund + period by
// the API, so there's no Fund/Period column/filter (that's the page-level
// dropdowns' job), just the per-holding detail columns.
const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    equalsString: filterFn_equalsString,
  },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const helper = createColumnHelper();

const formatMoney = (value) =>
  value === null || value === undefined
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);

const CATEGORY_BADGE = {
  Debt: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  Equity: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  Other: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15",
};

const columns = helper.columns([
  helper.accessor("Portfolio Company", {
    header: "Company",
    filterFn: "includesString",
    sortFn: "alphanumeric",
  }),
  helper.accessor("Industry", {
    header: "Industry",
    filterFn: "equalsString",
    sortFn: "alphanumeric",
    cell: (info) => info.getValue() || "—",
  }),
  helper.accessor("Category", {
    header: "Category",
    filterFn: "equalsString",
    sortFn: "alphanumeric",
    cell: (info) => {
      const value = info.getValue();
      return (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            CATEGORY_BADGE[value] ?? CATEGORY_BADGE.Other
          }`}
        >
          {value}
        </span>
      );
    },
  }),
  helper.accessor("Type of Investment", {
    header: "Type",
    filterFn: "includesString",
    sortFn: "alphanumeric",
    cell: (info) => info.getValue() || "—",
  }),
  helper.accessor("Reference Rate", {
    header: "Reference Rate",
    filterFn: "includesString",
    sortFn: "alphanumeric",
    cell: (info) => info.getValue() || "—",
  }),
  helper.accessor("Fair Value", {
    header: "Fair Value",
    sortFn: "basic",
    cell: (info) => formatMoney(info.getValue()),
  }),
  helper.accessor("Cost", {
    header: "Cost",
    sortFn: "basic",
    cell: (info) => formatMoney(info.getValue()),
  }),
  helper.accessor("Maturity Date", {
    header: "Maturity",
    sortFn: "alphanumeric",
    cell: (info) => info.getValue() || "—",
  }),
]);

const EMPTY_DATA = [];
const PAGE_SIZES = [10, 25, 50, 100];

// A <select> filter bound to one column's filter value, options drawn from
// every distinct value present in the (unfiltered) dataset.
function ColumnSelectFilter({ table, columnId, label, options }) {
  const column = table.getColumn(columnId);
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <select
        aria-label={label}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        value={column.getFilterValue() ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function HoldingsTable({ data }) {
  const rows = data ?? EMPTY_DATA;
  const [globalFilter, setGlobalFilter] = useState("");

  const filterOptions = useMemo(
    () => ({
      Category: [...new Set(rows.map((r) => r.Category))].filter(Boolean).sort(),
      Industry: [...new Set(rows.map((r) => r.Industry))].filter(Boolean).sort(),
    }),
    [rows]
  );

  const table = useTable({
    features,
    columns,
    data: rows,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    // Only match the Company column — otherwise the default eligibility
    // (every string/number column) makes the "search company" box also
    // match on Industry, Category, Type, etc., which is confusing.
    getColumnCanGlobalFilter: (column) => column.id === "Portfolio Company",
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const pagination = table.state.pagination;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
          Search company
          <input
            type="text"
            placeholder="Search…"
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </label>
        <ColumnSelectFilter
          table={table}
          columnId="Category"
          label="Category"
          options={filterOptions.Category}
        />
        <ColumnSelectFilter
          table={table}
          columnId="Industry"
          label="Industry"
          options={filterOptions.Industry}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="bg-slate-50">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="cursor-pointer select-none whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-700"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <span className="inline-flex items-center gap-1">
                          <table.FlexRender header={header} />
                          {sorted === "asc" && "▲"}
                          {sorted === "desc" && "▼"}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
            {filteredCount === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-sm text-slate-400"
                >
                  No holdings match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>{filteredCount.toLocaleString()} holdings</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-300 px-2.5 py-1 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </button>
          <span>
            Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <button
            className="rounded-lg border border-slate-300 px-2.5 py-1 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <select
            className="rounded-lg border border-slate-300 px-2.5 py-1"
            value={pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
