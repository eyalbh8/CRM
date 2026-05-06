export type TradingLiveColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const TRADING_LIVE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: true, hide: false },
  { key: "name", title: "Name", show: true, orderable: true, exportable: true, hide: false },
  { key: "self_status", title: "Sale Status", show: true, orderable: true, exportable: true, hide: false },
  { key: "retention_status", title: "Retention Status", show: true, orderable: true, exportable: true, hide: false },
  { key: "email", title: "Email", show: true, orderable: true, exportable: true, hide: false },
  { key: "phone", title: "Phone", show: true, orderable: true, exportable: true, hide: false },
  { key: "active_positions_count", title: "Active Positions Count", show: true, orderable: true, exportable: true, hide: false },
  { key: "all_positions_count", title: "All Positions Count", show: true, orderable: true, exportable: true, hide: false },
  { key: "bonus", title: "Bonus", show: true, orderable: true, exportable: true, hide: false },
  { key: "balance", title: "Balance", show: true, orderable: true, exportable: true, hide: false },
  { key: "active_margin", title: "Active Margin", show: true, orderable: true, exportable: true, hide: false },
  { key: "pnl", title: "PNL", show: true, orderable: true, exportable: true, hide: false },
  { key: "free", title: "Free", show: true, orderable: true, exportable: true, hide: false },
  { key: "equity", title: "Equity", show: true, orderable: true, exportable: true, hide: false },
  { key: "margin_level", title: "Margin Level", show: true, orderable: true, exportable: true, hide: false },
] satisfies TradingLiveColumn[];
