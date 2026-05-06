import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DataBrowserTable } from "../components/data-browser-table";
import { CrmTopBar } from "../dashboard/CrmTopBar";

type TradingLiveColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type TradingLiveRow = Record<string, unknown>;

type TradingLiveResponse = {
  columns: TradingLiveColumn[];
  data: TradingLiveRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const PAGE_SIZE = 25;

export function TradingLivePage() {
  const [rows, setRows] = useState<TradingLiveRow[]>([]);
  const [columns, setColumns] = useState<TradingLiveColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/trading-live`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Trading Live request failed with ${response.status}`);
        }

        const payload = (await response.json()) as TradingLiveResponse;
        setColumns(payload.columns);
        setRows(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }
        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to load trading live",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return (
    <div className="traders-page">
      <CrmTopBar />

      <section className="traders-page__header">
        <h1 className="traders-page__title">Traders Live</h1>
        <p className="traders-page__subtitle">
          Live overview of trader positions, balances, and margin per account.
        </p>
      </section>

      <div className="traders-toolbar traders-toolbar--simple" aria-label="Trading Live filters">
        <ToolbarChip label="Filters" />
        <ToolbarChip label="Filters Presets" disabled />
        <ToolbarChip label="Display Options" />
        <button className="traders-toolbar__btn" disabled={isLoading} type="button" onClick={() => setPage(1)}>
          Refresh
        </button>
        <button className="traders-toolbar__filters-settings" type="button">
          ⚙ Filters Settings
        </button>
      </div>

      <DataBrowserTable
        columns={columns}
        emptyMessage="No live trading data yet."
        error={error}
        loading={isLoading}
        loadingMessage="Loading trading live data..."
        onPageChange={setPage}
        page={page}
        pageSize={PAGE_SIZE}
        pagination
        renderCell={({ columnKey, value }) => formatLiveCell(columnKey, value)}
        resultsLabel="Results"
        rows={rows}
        wideCard
        wideTable
      />

      <button
        aria-label="Scroll to top"
        className="dashboard-float-btn dashboard-float-btn--scroll"
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
    </div>
  );
}

function ToolbarChip({ label, disabled }: { label: string; disabled?: boolean }) {
  return (
    <button className="traders-toolbar__btn" disabled={disabled} type="button">
      {label}
      {!disabled && <span className="trading-live-toolbar__arrow">▾</span>}
    </button>
  );
}

function formatLiveCell(columnKey: string, value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    if (columnKey === "self_status" || columnKey === "retention_status") {
      return <span className="traders-value-neg traders-value-neg--emphasis">None</span>;
    }
    return <span className="empty-value">—</span>;
  }

  const moneyKeys = ["balance", "equity", "active_margin", "free", "bonus"];
  if (moneyKeys.includes(columnKey)) {
    const n = typeof value === "number" ? value : parseFloat(String(value));
    const safe = Number.isFinite(n) ? n : 0;
    const text = Number.isInteger(safe) ? String(safe) : safe.toFixed(2).replace(/\.?0+$/, "");
    return <span className="traders-money-cell">{text}$</span>;
  }

  if (columnKey === "pnl") {
    const n = typeof value === "number" ? value : parseFloat(String(value));
    const safe = Number.isFinite(n) ? n : 0;
    const text = Number.isInteger(safe) ? String(safe) : safe.toFixed(2).replace(/\.?0+$/, "");
    const cls = safe < 0 ? "traders-value-neg" : safe > 0 ? "trading-live-pnl--pos" : "";
    return <span className={cls}>{text}$</span>;
  }

  if (columnKey === "margin_level") {
    const n = typeof value === "number" ? value : parseFloat(String(value));
    const safe = Number.isFinite(n) ? n : 0;
    const text = safe.toFixed(2).replace(/\.?0+$/, "");
    return <span>{text}%</span>;
  }

  if (columnKey === "id") {
    return <span className="traders-cell-id__hash">#{String(value)}</span>;
  }

  if (columnKey === "email") {
    const email = String(value);
    return (
      <a className="traders-table-link" href={`mailto:${email}`}>
        {email}
      </a>
    );
  }

  return String(value);
}
