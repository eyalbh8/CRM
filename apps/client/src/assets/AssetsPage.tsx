import { useEffect, useMemo, useState } from "react";

type AssetColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type AssetRow = Record<string, unknown>;

type AssetsResponse = {
  columns: AssetColumn[];
  data: AssetRow[];
};

type TradingHours = Record<
  string,
  {
    from?: string;
    to?: string;
  }
>;

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AssetsPage() {
  const [assets, setAssets] = useState<AssetRow[]>([]);
  const [columns, setColumns] = useState<AssetColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTradingHours, setSelectedTradingHours] = useState<{
    assetName: string;
    hours: TradingHours;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssets() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/assets`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Assets request failed with ${response.status}`);
        }

        const payload = (await response.json()) as AssetsResponse;
        setColumns(payload.columns);
        setAssets(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Failed to load assets");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssets();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Assets</p>
        <div>
          <h1>Assets</h1>
          <p>View tradable assets, groups, payouts, leverage, and trading hours.</p>
        </div>
      </section>

      <section className="table-card table-card--wide">
        <div className="table-toolbar">
          <div>
            <h2>Assets table</h2>
            <p>{assets.length} assets found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading assets...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : assets.length === 0 ? (
          <div className="state-message">No assets yet.</div>
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
                {assets.map((asset) => (
                  <tr key={String(asset.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>
                        {column.key === "trading_hours"
                          ? formatTradingHoursCell(asset, setSelectedTradingHours)
                          : formatCellValue(asset[column.key], column.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedTradingHours ? (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedTradingHours(null)}
          role="presentation"
        >
          <div
            aria-labelledby="trading-hours-title"
            aria-modal="true"
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Trading Hours</p>
                <h2 id="trading-hours-title">{selectedTradingHours.assetName}</h2>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedTradingHours(null)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="trading-hours-grid">
              {getOrderedTradingHours(selectedTradingHours.hours).map(([day, hours]) => (
                <div className="trading-hours-row" key={day}>
                  <strong>{day}</strong>
                  <span>
                    {hours.from && hours.to ? `${hours.from} - ${hours.to}` : "Closed"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatTradingHoursCell(
  asset: AssetRow,
  setSelectedTradingHours: (selection: { assetName: string; hours: TradingHours }) => void,
) {
  const hours = asset.trading_hours;

  if (!isTradingHours(hours)) {
    return <span className="empty-value">-</span>;
  }

  return (
    <button
      className="table-action-button"
      onClick={() =>
        setSelectedTradingHours({
          assetName: typeof asset.name === "string" ? asset.name : `Asset ${String(asset.id)}`,
          hours,
        })
      }
      type="button"
    >
      View hours
    </button>
  );
}

function formatCellValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === "") {
    return <span className="empty-value">-</span>;
  }

  if (key === "icon") {
    const iconUrl = Array.isArray(value) ? value[0] : value;

    if (typeof iconUrl === "string") {
      return (
        <a className="asset-icon-link" href={iconUrl} rel="noreferrer" target="_blank">
          <img alt="Asset icon" className="asset-icon" src={iconUrl} />
        </a>
      );
    }
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

function isTradingHours(value: unknown): value is TradingHours {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getOrderedTradingHours(hours: TradingHours) {
  const knownDays = dayOrder
    .filter((day) => day in hours)
    .map((day) => [day, hours[day]] as const);
  const extraDays = Object.entries(hours).filter(([day]) => !dayOrder.includes(day));

  return [...knownDays, ...extraDays];
}
