import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

type DeskColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type DeskRow = Record<string, unknown>;

type DesksResponse = {
  columns: DeskColumn[];
  data: DeskRow[];
};

export function DesksPage() {
  const [desks, setDesks] = useState<DeskRow[]>([]);
  const [columns, setColumns] = useState<DeskColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDesks() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch("/desks", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Desks request failed with ${response.status}`);
        }

        const payload = (await response.json()) as DesksResponse;
        setColumns(payload.columns);
        setDesks(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to load desks",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDesks();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Desks</p>
        <div>
          <h1>Desks</h1>
          <p>View your desks and deposit settings.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Desks table</h2>
            <p>{desks.length} desks found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading desks...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : desks.length === 0 ? (
          <div className="state-message">No desks yet.</div>
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
                {desks.map((desk) => (
                  <tr key={String(desk.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(desk[column.key])}</td>
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

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}
