import { useEffect, useState } from "react";

import { DataBrowserTable } from "../components/data-browser-table";

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

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Asset Groups</p>
        <div>
          <h1>Asset groups</h1>
          <p>
            View the configured asset group codes and display names.{" "}
            {!isLoading && !error ? <span>{assetGroups.length} asset groups found.</span> : null}
          </p>
        </div>
      </section>

      <DataBrowserTable
        columns={columns}
        emptyMessage="No asset groups yet."
        error={error}
        hideResultsBar
        loading={isLoading}
        loadingMessage="Loading asset groups..."
        rows={assetGroups}
      />
    </>
  );
}
