import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";

import { formatDataCell } from "./formatDataCell";
import { DataBrowserGearIcon, DataBrowserListIcon } from "./icons";
import { PaginationNav } from "./PaginationNav";

export type DataBrowserColumn = {
  key: string;
  title: string;
  show?: boolean;
  hide?: boolean;
  /** Renders inactive sort glyphs in the header (sorting wired later). */
  orderable?: boolean;
};

export type DataBrowserSelectionProps<TRow extends Record<string, unknown>> = {
  selectedKeys: ReadonlySet<string>;
  onSelectionChange: (next: Set<string>) => void;
  getRowKey: (row: TRow) => string;
  /** `aria-label` for the header "select page" checkbox */
  selectAllAriaLabel?: string;
  /** `aria-label` for each row checkbox */
  rowAriaLabel?: (args: { key: string; row: TRow }) => string;
};

export type DataBrowserTableProps<TRow extends Record<string, unknown>> = {
  columns: DataBrowserColumn[];
  rows: TRow[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  loadingMessage?: string;
  /** Full-width card (`table-card--wide`). */
  wideCard?: boolean;
  /** Adds `min-width` for wide API tables (`data-table--wide`). */
  wideTable?: boolean;
  /** Appended to the outer `section` (after `table-card` classes). */
  className?: string;
  resultsLabel?: ReactNode;
  /** Hide the teal results strip (pagination + scroll still rendered when data loads). */
  hideResultsBar?: boolean;
  onResultsGearClick?: () => void;
  resultsGearAriaLabel?: string;
  pagination?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  selection?: DataBrowserSelectionProps<TRow>;
  renderCell?: (args: {
    columnKey: string;
    value: unknown;
    row: TRow;
    defaultRenderer: (value: unknown) => ReactNode;
  }) => ReactNode;
};

function defaultRenderer(value: unknown) {
  return formatDataCell(value);
}

export function DataBrowserTable<TRow extends Record<string, unknown>>({
  columns,
  rows,
  loading = false,
  error = null,
  emptyMessage = "No data yet.",
  loadingMessage = "Loading…",
  wideCard = false,
  wideTable = false,
  className = "",
  resultsLabel = "Results",
  hideResultsBar = false,
  onResultsGearClick,
  resultsGearAriaLabel = "Table settings",
  pagination = false,
  page = 1,
  pageSize = 25,
  onPageChange,
  selection,
  renderCell,
}: DataBrowserTableProps<TRow>) {
  const headerSelectRef = useRef<HTMLInputElement>(null);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show !== false && !column.hide),
    [columns],
  );

  const totalRows = rows.length;
  const usingPagination =
    pagination && typeof page === "number" && typeof pageSize === "number" && !!onPageChange;
  const totalPages = usingPagination
    ? Math.max(1, Math.ceil(totalRows / pageSize))
    : 1;

  const safePage = usingPagination ? Math.min(Math.max(page, 1), totalPages) : 1;

  const pageRows = useMemo(() => {
    if (!usingPagination) {
      return rows;
    }
    const start = (safePage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, usingPagination, safePage, pageSize]);

  useEffect(() => {
    if (!selection) {
      return;
    }

    const pageKeys = pageRows.map((row) => selection.getRowKey(row));
    let selectedOnPage = 0;
    for (const key of pageKeys) {
      if (selection.selectedKeys.has(key)) {
        selectedOnPage += 1;
      }
    }
    const el = headerSelectRef.current;
    if (el) {
      el.checked = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
      el.indeterminate = selectedOnPage > 0 && selectedOnPage < pageKeys.length;
    }
  }, [selection, pageRows, selection?.selectedKeys]);

  const rangeStart =
    totalRows === 0 ? 0 : usingPagination ? (safePage - 1) * pageSize + 1 : 1;
  const rangeEnd = usingPagination ? Math.min(safePage * pageSize, totalRows) : totalRows;

  const sectionClasses = ["table-card", "data-browser-table-card"];
  if (wideCard) {
    sectionClasses.push("table-card--wide");
  }

  function toggleSelectCurrentPage(selectAll: boolean) {
    if (!selection) {
      return;
    }

    const keys = pageRows.map((row) => selection.getRowKey(row));
    const next = new Set(selection.selectedKeys);
    for (const key of keys) {
      if (selectAll) {
        next.add(key);
      } else {
        next.delete(key);
      }
    }
    selection.onSelectionChange(next);
  }

  function toggleRowSelection(rowKey: string, checked: boolean) {
    if (!selection) {
      return;
    }

    const next = new Set(selection.selectedKeys);
    if (checked) {
      next.add(rowKey);
    } else {
      next.delete(rowKey);
    }
    selection.onSelectionChange(next);
  }

  function cellContent(columnKey: string, value: unknown, row: TRow) {
    if (renderCell) {
      return renderCell({
        columnKey,
        value,
        row,
        defaultRenderer,
      });
    }
    return defaultRenderer(value);
  }

  const tableClassNames = ["data-table"];
  if (wideTable) {
    tableClassNames.push("data-table--wide");
  }
  tableClassNames.push("data-browser-table");

  return (
    <section className={`${sectionClasses.join(" ")} ${className}`.trim()}>
      {loading ? (
        <div className="state-message">{loadingMessage}</div>
      ) : error ? (
        <div className="state-message state-message--error">{error}</div>
      ) : rows.length === 0 ? (
        <div className="state-message">{emptyMessage}</div>
      ) : (
        <>
          {!hideResultsBar ? (
            <div className="data-browser-results-bar">
              <div className="data-browser-results-bar__label">
                <DataBrowserListIcon aria-hidden /> {resultsLabel}
              </div>
              <button
                className="data-browser-results-bar__gear"
                type="button"
                aria-label={resultsGearAriaLabel}
                onClick={onResultsGearClick}
              >
                <DataBrowserGearIcon aria-hidden />
              </button>
            </div>
          ) : null}
          {!hideResultsBar && usingPagination ? (
            <div className="data-browser-pagination-summary">
              <p>
                Showing {rangeStart} to {rangeEnd} of {totalRows} entries
              </p>
              <PaginationNav
                page={safePage}
                totalPages={totalPages}
                onChange={(next) => onPageChange?.(next)}
              />
            </div>
          ) : !hideResultsBar && !usingPagination && totalRows > 0 ? (
            <div className="data-browser-pagination-summary">
              <p>
                Showing {rangeStart} to {rangeEnd} of {totalRows} entries
              </p>
            </div>
          ) : null}
          {/* When results bar hidden but pagination requested — still render controls */}
          {hideResultsBar && usingPagination ? (
            <div className="data-browser-pagination-summary data-browser-pagination-summary--solo">
              <p>
                Showing {rangeStart} to {rangeEnd} of {totalRows} entries
              </p>
              <PaginationNav
                page={safePage}
                totalPages={totalPages}
                onChange={(next) => onPageChange?.(next)}
              />
            </div>
          ) : null}

          <div className="table-scroll data-browser-scroll">
            <table className={tableClassNames.join(" ")}>
              <thead>
                <tr>
                  {selection ? (
                    <th className="data-browser-table__check">
                      <input
                        ref={headerSelectRef}
                        aria-label={selection.selectAllAriaLabel ?? "Select all on this page"}
                        type="checkbox"
                        onChange={(event) => toggleSelectCurrentPage(event.target.checked)}
                      />
                    </th>
                  ) : null}
                  {visibleColumns.map((column) => (
                    <th key={column.key}>
                      <span className="data-browser-table__th-inner">
                        <span>{column.title}</span>
                        {column.orderable ? (
                          <span className="data-browser-table__sort-icons" aria-hidden title="Sortable">
                            ⇅
                          </span>
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, rowIndex) => {
                  const rowKeyStable = selection
                    ? selection.getRowKey(row)
                    : String(row.id ?? JSON.stringify(row).slice(0, 80) ?? rowIndex);

                  return (
                    <tr key={rowKeyStable}>
                      {selection ? (
                        <td className="data-browser-table__check">
                          <input
                            aria-label={
                              selection.rowAriaLabel?.({
                                key: selection.getRowKey(row),
                                row,
                              }) ?? `Select row ${selection.getRowKey(row)}`
                            }
                            checked={selection.selectedKeys.has(selection.getRowKey(row))}
                            type="checkbox"
                            onChange={(event) =>
                              toggleRowSelection(selection.getRowKey(row), event.target.checked)
                            }
                          />
                        </td>
                      ) : null}
                      {visibleColumns.map((column) => (
                        <td key={column.key}>
                          {cellContent(column.key, row[column.key], row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
