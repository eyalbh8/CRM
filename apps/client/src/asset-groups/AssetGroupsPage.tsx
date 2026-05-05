import { useEffect, useMemo, useState } from "react";

type AssetGroupColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type AssetGroupRow = Record<string, unknown>;

type AssetGroupsResponse = {
  columns: AssetGroupColumn[];
  data: AssetGroupRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function AssetGroupsPage() {
  const [assetGroups, setAssetGroups] = useState<AssetGroupRow[]>([]);
  const [columns, setColumns] = useState<AssetGroupColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssetGroups() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/asset-groups`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Asset groups request failed with ${response.status}`);
        }

        const payload = (await response.json()) as AssetGroupsResponse;
        setColumns(payload.columns);
        setAssetGroups(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load asset groups",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAssetGroups();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Asset Groups</p>
        <div>
          <h1>Asset groups</h1>
          <p>View the configured asset group codes and display names.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Asset groups table</h2>
            <p>{assetGroups.length} asset groups found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading asset groups...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : assetGroups.length === 0 ? (
          <div className="state-message">No asset groups yet.</div>
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
                {assetGroups.map((assetGroup) => (
                  <tr key={String(assetGroup.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(assetGroup[column.key])}</td>
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
