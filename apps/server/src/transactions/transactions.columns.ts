export type TransactionColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const TRANSACTION_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: true, hide: false },
  { key: "value", title: "Amount", show: true, orderable: true, exportable: true, hide: false },
  { key: "base_currency_value", title: "Base Currency Amount", show: true, orderable: true, exportable: true, hide: false },
  { key: "type", title: "Type", show: true, orderable: true, exportable: true, hide: false },
  { key: "country", title: "Country", show: true, orderable: true, exportable: true, hide: false },
  { key: "customer", title: "Trader", show: true, orderable: true, exportable: true, hide: false },
  { key: "broker_employee", title: "Current Broker", show: true, orderable: true, exportable: true, hide: false },
  { key: "employee", title: "Assigned Broker", show: true, orderable: true, exportable: true, hide: false },
  { key: "created_by_employee", title: "Created By Employee", show: true, orderable: true, exportable: true, hide: false },
  { key: "created_from", title: "Created From", show: true, orderable: true, exportable: true, hide: false },
  { key: "meta", title: "Comment", show: true, orderable: false, exportable: true, hide: false },
  { key: "trading_account_id", title: "Trading Account Id", show: true, orderable: true, exportable: false, hide: false },
  { key: "balance_before", title: "Balance Before", show: true, orderable: true, exportable: true, hide: false },
  { key: "created_at", title: "Transaction Time", show: true, orderable: true, exportable: true, hide: false },
  { key: "actions", title: "Action", show: true, orderable: true, exportable: false, hide: false },
  { key: "customer_id", title: "Trader Id", show: true, orderable: true, exportable: true, hide: false },
] satisfies TransactionColumn[];
