export type AssetGroupColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const ASSET_GROUP_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: true, hide: false },
  { key: "name", title: "Name", show: true, orderable: true, exportable: true, hide: false },
  { key: "created_at", title: "Created", show: true, orderable: true, exportable: false, hide: false },
] satisfies AssetGroupColumn[];
