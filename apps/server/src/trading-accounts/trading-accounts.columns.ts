export type TradingAccountColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export type TradingAccountFilter = {
  key: string;
  type: "select" | "search" | "tags";
  label: string;
  query: Record<string, unknown>;
  associated_column_key: string | null;
  order: number;
  multiple?: boolean;
  values?: Array<{
    value: number;
    label: string;
  }>;
};

export const TRADING_ACCOUNT_TABLE_COLUMNS = [
  { key: "id", title: "Id", show: true, orderable: true, exportable: false, hide: false },
  { key: "login", title: "Login", show: true, orderable: false, exportable: false, hide: false },
  { key: "customer", title: "Trader", show: true, orderable: true, exportable: false, hide: false },
  { key: "currency", title: "Currency", show: true, orderable: true, exportable: false, hide: false },
  { key: "group", title: "Group", show: true, orderable: false, exportable: false, hide: false },
  { key: "balance", title: "Balance", show: true, orderable: true, exportable: false, hide: false },
  { key: "equity", title: "Equity", show: true, orderable: false, exportable: false, hide: false },
  { key: "volume", title: "Volume", show: true, orderable: false, exportable: false, hide: false },
  { key: "margin", title: "Margin", show: true, orderable: false, exportable: false, hide: false },
  { key: "margin_free", title: "Margin Free", show: true, orderable: false, exportable: false, hide: false },
  { key: "margin_level", title: "Margin Level", show: true, orderable: false, exportable: false, hide: false },
  { key: "created_at", title: "Executed At", show: true, orderable: true, exportable: false, hide: false },
  { key: "actions", title: "Action", show: true, orderable: false, exportable: false, hide: false },
] satisfies TradingAccountColumn[];
