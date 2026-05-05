export type DeskColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const DESK_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: false, hide: false },
  { key: "desk_name", title: "Name", show: true, orderable: true, exportable: false, hide: false },
  { key: "active", title: "Active", show: true, orderable: true, exportable: false, hide: false },
  { key: "chat_enabled", title: "Chat Status", show: true, orderable: true, exportable: false, hide: false },
  { key: "min_deposit", title: "Minimal Deposit", show: true, orderable: true, exportable: false, hide: false },
  { key: "max_deposit", title: "Maximum Deposit", show: true, orderable: true, exportable: false, hide: false },
  { key: "customers_count", title: "Customers Count", show: true, orderable: true, exportable: false, hide: false },
  { key: "link_trade_platform", title: "Trade Platform Link", show: true, orderable: true, exportable: false, hide: false },
  { key: "link_mt_account", title: "MT Account Link", show: true, orderable: true, exportable: false, hide: false },
  { key: "created_at", title: "Created", show: true, orderable: true, exportable: false, hide: false },
] satisfies DeskColumn[];
