import { useEffect, useMemo, useState } from "react";

type TraderColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type TraderRow = Record<string, unknown>;

type TradersResponse = {
  columns: TraderColumn[];
  data: TraderRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function TradersPage() {
  const [traders, setTraders] = useState<TraderRow[]>([]);
  const [columns, setColumns] = useState<TraderColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTraders() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/traders`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Traders request failed with ${response.status}`);
        }

        const payload = (await response.json()) as TradersResponse;
        setColumns(payload.columns);
        setTraders(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to load traders",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTraders();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Traders</p>
        <div>
          <h1>Traders</h1>
          <p>View trader registrations, ownership, campaign, and desk details.</p>
        </div>
      </section>

      <section className="table-card table-card--wide">
        <div className="table-toolbar">
          <div>
            <h2>Traders table</h2>
            <p>{traders.length} traders found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading traders...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : traders.length === 0 ? (
          <div className="state-message">No traders yet.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table data-table--wide">
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column.key}>{column.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traders.map((trader) => (
                  <tr key={String(trader.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(trader[column.key])}</td>
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

  if (typeof value === "boolean") {
    return (
      <span className={value ? "status-pill status-pill--yes" : "status-pill"}>
        {value ? "Yes" : "No"}
      </span>
    );
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
