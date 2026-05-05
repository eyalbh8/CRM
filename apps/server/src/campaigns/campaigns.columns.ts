export type CampaignColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const CAMPAIGN_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: false, hide: false },
  { key: "name", title: "Name", show: true, orderable: true, exportable: false, hide: false },
  { key: "cost", title: "Cost", show: true, orderable: true, exportable: false, hide: false },
  { key: "calculation_type", title: "Calculation Type", show: true, orderable: true, exportable: false, hide: false },
  { key: "customer_count", title: "Registrations", show: true, orderable: true, exportable: false, hide: false },
  { key: "ftd_count", title: "FTDs Count", show: true, orderable: true, exportable: false, hide: false },
  { key: "redeposit_count", title: "Redeposits Count", show: true, orderable: true, exportable: false, hide: false },
  { key: "creator", title: "Creator", show: true, orderable: true, exportable: false, hide: false },
  { key: "created_at", title: "Created", show: true, orderable: true, exportable: false, hide: false },
] satisfies CampaignColumn[];
