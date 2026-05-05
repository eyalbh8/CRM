import { useEffect, useMemo, useState } from "react";

type TransactionColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type TransactionRow = Record<string, unknown>;

type TransactionsResponse = {
  columns: TransactionColumn[];
  data: TransactionRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [columns, setColumns] = useState<TransactionColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransactions() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/transactions`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Transactions request failed with ${response.status}`);
        }

        const payload = (await response.json()) as TransactionsResponse;
        setColumns(payload.columns);
        setTransactions(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load transactions",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Transactions</p>
        <div>
          <h1>Transactions</h1>
          <p>View trader deposits, withdrawals, account balances, and broker details.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Transactions table</h2>
            <p>{transactions.length} transactions found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading transactions...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="state-message">No transactions yet.</div>
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
                {transactions.map((transaction) => (
                  <tr key={String(transaction.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(transaction[column.key])}</td>
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
