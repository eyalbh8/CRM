import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

type CommunicationColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type CommunicationRow = Record<string, unknown>;

type CommunicationsResponse = {
  columns: CommunicationColumn[];
  data: CommunicationRow[];
};

export function CommunicationsPage() {
  const [communications, setCommunications] = useState<CommunicationRow[]>([]);
  const [columns, setColumns] = useState<CommunicationColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCommunications() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch("/communications", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Communications request failed with ${response.status}`);
        }

        const payload = (await response.json()) as CommunicationsResponse;
        setColumns(payload.columns);
        setCommunications(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load communications",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCommunications();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Communications</p>
        <div>
          <h1>Communications</h1>
          <p>View worker, trader, campaign, and communication activity.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Communications table</h2>
            <p>{communications.length} communications found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading communications...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : communications.length === 0 ? (
          <div className="state-message">No communications yet.</div>
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
                {communications.map((communication) => (
                  <tr key={String(communication.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(communication[column.key])}</td>
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
