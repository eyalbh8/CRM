export type AssetColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const ASSET_TABLE_COLUMNS = [
  { key: "id", title: "Id", show: true, orderable: true, exportable: false, hide: false },
  { key: "icon", title: "Icon", show: true, orderable: false, exportable: false, hide: false },
  { key: "name", title: "Name", show: true, orderable: true, exportable: false, hide: false },
  { key: "description", title: "Description", show: true, orderable: true, exportable: false, hide: false },
  { key: "group", title: "Group", show: true, orderable: true, exportable: false, hide: false },
  { key: "payout", title: "Payout", show: true, orderable: true, exportable: false, hide: false },
  { key: "leverage", title: "Leverage", show: true, orderable: true, exportable: false, hide: false },
  { key: "size", title: "Size", show: true, orderable: true, exportable: false, hide: false },
  { key: "unit", title: "Unit Name", show: true, orderable: true, exportable: false, hide: false },
  { key: "swap_buy", title: "Swap Buy", show: true, orderable: true, exportable: false, hide: false },
  { key: "swap_sell", title: "Swap Sell", show: true, orderable: true, exportable: false, hide: false },
  { key: "minimum_change", title: "Minimum Change", show: true, orderable: true, exportable: false, hide: false },
  { key: "spread", title: "Spread", show: true, orderable: true, exportable: false, hide: false },
  { key: "commission", title: "Commission", show: true, orderable: true, exportable: false, hide: false },
  { key: "expiration", title: "Expiration", show: true, orderable: true, exportable: false, hide: false },
  { key: "custom", title: "Custom", show: false, orderable: true, exportable: false, hide: false },
  { key: "trading_hours", title: "Trading Hours", show: true, orderable: false, exportable: false, hide: false },
] satisfies AssetColumn[];
