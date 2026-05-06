import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";

type CampaignColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type CampaignRow = Record<string, unknown>;

type CampaignsResponse = {
  columns: CampaignColumn[];
  data: CampaignRow[];
};

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [columns, setColumns] = useState<CampaignColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCampaigns() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch("/campaigns", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Campaigns request failed with ${response.status}`);
        }

        const payload = (await response.json()) as CampaignsResponse;
        setColumns(payload.columns);
        setCampaigns(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load campaigns",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadCampaigns();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Campaigns</p>
        <div>
          <h1>Campaigns</h1>
          <p>View campaign costs, registrations, deposits, and creators.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Campaigns table</h2>
            <p>{campaigns.length} campaigns found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading campaigns...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : campaigns.length === 0 ? (
          <div className="state-message">No campaigns yet.</div>
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
                {campaigns.map((campaign) => (
                  <tr key={String(campaign.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(campaign[column.key])}</td>
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

  return String(value);
}

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}
