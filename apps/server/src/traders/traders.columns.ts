export type TraderColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const TRADER_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: true, hide: false },
  { key: "mt5_login", title: "MT5 Login", show: true, orderable: false, exportable: false, hide: false },
  { key: "promo_code", title: "Promo Code", show: true, orderable: true, exportable: false, hide: false },
  { key: "fname", title: "First Name", show: true, orderable: true, exportable: true, hide: false },
  { key: "self_status", title: "Sale Status", show: true, orderable: true, exportable: true, hide: false },
  { key: "email", title: "Email", show: true, orderable: true, exportable: true, hide: false },
  { key: "phone", title: "Phone", show: true, orderable: true, exportable: true, hide: false },
  { key: "campaign", title: "Campaign", show: true, orderable: true, exportable: true, hide: false },
  { key: "broker_employee", title: "Broker", show: true, orderable: true, exportable: true, hide: false },
  { key: "finance_employee", title: "Finance Broker", show: true, orderable: true, exportable: true, hide: false },
  { key: "desk", title: "Desk", show: true, orderable: true, exportable: true, hide: false },
  { key: "country", title: "Country", show: true, orderable: true, exportable: true, hide: false },
  { key: "city", title: "City", show: true, orderable: true, exportable: true, hide: false },
  { key: "trading_server", title: "Trading Server", show: true, orderable: true, exportable: false, hide: false },
  { key: "balance", title: "Balance", show: true, orderable: true, exportable: true, hide: false },
  { key: "currency", title: "Currency", show: true, orderable: true, exportable: true, hide: false },
  { key: "total_deposits", title: "Total Deposits", show: true, orderable: true, exportable: true, hide: false },
  { key: "total_withdrawals", title: "Total Withdrawals", show: true, orderable: true, exportable: true, hide: false },
  { key: "total_bonuses", title: "Total Bonuses", show: true, orderable: true, exportable: true, hide: false },
  { key: "validation_status", title: "Validation Status", show: true, orderable: true, exportable: true, hide: false },
  { key: "retention_status", title: "Retention Status", show: true, orderable: true, exportable: true, hide: false },
  { key: "potential_status", title: "Potential Status", show: true, orderable: true, exportable: true, hide: false },
  { key: "forced_strategy", title: "Strategy", show: true, orderable: true, exportable: true, hide: false },
  { key: "active", title: "Active", show: true, orderable: true, exportable: true, hide: false },
  { key: "active_trading", title: "Active Trading", show: true, orderable: true, exportable: false, hide: false },
  { key: "active_deposit", title: "Active Deposit", show: true, orderable: true, exportable: false, hide: false },
  { key: "last_login", title: "Last Login", show: true, orderable: true, exportable: true, hide: false },
  { key: "last_communication", title: "Last Comment", show: true, orderable: false, exportable: true, hide: false },
  { key: "last_reminder_start_at", title: "Last Reminder Date", show: true, orderable: true, exportable: true, hide: false },
  { key: "note", title: "Note", show: true, orderable: false, exportable: true, hide: false },
  { key: "memo", title: "Memo", show: true, orderable: false, exportable: true, hide: false },
  { key: "last_communication_date", title: "Last Comment Date", show: true, orderable: true, exportable: true, hide: false },
  { key: "import_a_aid", title: "A_AID", show: true, orderable: true, exportable: true, hide: false },
  { key: "import_a_bid", title: "B_BID", show: true, orderable: true, exportable: true, hide: false },
  { key: "import_a_cid", title: "C_CID", show: true, orderable: true, exportable: true, hide: false },
  { key: "created_at", title: "Registered At", show: true, orderable: true, exportable: true, hide: false },
  { key: "ftd_date", title: "Mark Ftd Date", show: true, orderable: true, exportable: true, hide: false },
  { key: "last_change_broker_date", title: "Last Change Broker Date", show: true, orderable: true, exportable: true, hide: false },
  { key: "last_change_desk_date", title: "Last Change Desk Date", show: true, orderable: true, exportable: true, hide: false },
  { key: "last_ip", title: "Last IP", show: true, orderable: false, exportable: true, hide: false },
  { key: "last_open_date_trade", title: "Last Date Open Trade", show: true, orderable: true, exportable: true, hide: false },
  { key: "re_deposit_date", title: "Redeposit Date", show: true, orderable: true, exportable: true, hide: false },
  { key: "resident", title: "Resident", show: true, orderable: true, exportable: true, hide: false },
  { key: "mark_ftd_employee", title: "Mark FTD Broker", show: true, orderable: true, exportable: true, hide: false },
  { key: "registration_city", title: "Registration City", show: true, orderable: false, exportable: true, hide: false },
  { key: "registration_ip", title: "Registration IP", show: true, orderable: false, exportable: true, hide: false },
] satisfies TraderColumn[];
