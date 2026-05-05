import { useEffect, useMemo, useState } from "react";

type TradingAccountColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type TradingAccountFilter = {
  key: string;
  type: string;
  label: string;
  values?: Array<{
    value: number;
    label: string;
  }>;
};

type TradingAccountRow = Record<string, unknown>;

type TradingAccountsResponse = {
  columns: TradingAccountColumn[];
  filters: TradingAccountFilter[];
  data: TradingAccountRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function TradingAccountsPage() {
  const [accounts, setAccounts] = useState<TradingAccountRow[]>([]);
  const [columns, setColumns] = useState<TradingAccountColumn[]>([]);
  const [filters, setFilters] = useState<TradingAccountFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTradingAccounts() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/trading-accounts`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Trading accounts request failed with ${response.status}`);
        }

        const payload = (await response.json()) as TradingAccountsResponse;
        setColumns(payload.columns);
        setFilters(payload.filters);
        setAccounts(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load trading accounts",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTradingAccounts();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Trading Accounts</p>
        <div>
          <h1>Trading accounts</h1>
          <p>View account balances, margin, equity, and assigned traders.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Trading accounts table</h2>
            <p>{accounts.length} accounts found</p>
          </div>
        </div>

        {filters.length > 0 ? (
          <div className="filter-summary" aria-label="Available filters">
            {filters.map((filter) => (
              <div className="filter-chip" key={filter.key}>
                <strong>{filter.label}</strong>
                <span>{formatFilterSummary(filter)}</span>
              </div>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <div className="state-message">Loading trading accounts...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="state-message">No trading accounts yet.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column.key}>{column.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={String(account.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(account[column.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function formatFilterSummary(filter: TradingAccountFilter) {
  if (filter.values && filter.values.length > 0) {
    return `${filter.values.length} options`;
  }

  return filter.type;
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return <span className="empty-value">-</span>;
  }

  if (typeof value === "string" && isIsoDate(value)) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? <span className="empty-value">-</span> : value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}
