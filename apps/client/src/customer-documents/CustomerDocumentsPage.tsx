import { useEffect, useMemo, useState } from "react";

type CustomerDocumentColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type CustomerDocumentRow = Record<string, unknown>;

type CustomerDocumentsResponse = {
  columns: CustomerDocumentColumn[];
  data: CustomerDocumentRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState<CustomerDocumentRow[]>([]);
  const [columns, setColumns] = useState<CustomerDocumentColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCustomerDocuments() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/customer-documents`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Customer documents request failed with ${response.status}`);
        }

        const payload = (await response.json()) as CustomerDocumentsResponse;
        setColumns(payload.columns);
        setDocuments(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load customer documents",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCustomerDocuments();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Customer Documents</p>
        <div>
          <h1>Customer documents</h1>
          <p>View uploaded customer documents, validation status, and file links.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Customer documents table</h2>
            <p>{documents.length} documents found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading customer documents...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : documents.length === 0 ? (
          <div className="state-message">No customer documents yet.</div>
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
                {documents.map((document) => (
                  <tr key={String(document.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>
                        {formatCellValue(document[column.key], column.key)}
                      </td>
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

function formatCellValue(value: unknown, key: string) {
  if (value === null || value === undefined || value === "") {
    return <span className="empty-value">-</span>;
  }

  if (key === "url" && typeof value === "string") {
    return (
      <a href={value} rel="noreferrer" target="_blank">
        Open
      </a>
    );
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
