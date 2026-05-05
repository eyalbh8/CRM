export type CommunicationColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const COMMUNICATION_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: false, hide: false },
  { key: "type", title: "Type", show: true, orderable: true, exportable: false, hide: false },
  { key: "title", title: "Title", show: true, orderable: true, exportable: false, hide: false },
  { key: "description", title: "Description", show: true, orderable: false, exportable: false, hide: false },
  { key: "employee", title: "Worker", show: true, orderable: true, exportable: false, hide: false },
  { key: "customer", title: "Trader", show: true, orderable: true, exportable: false, hide: false },
  { key: "campaign", title: "Campaign", show: true, orderable: true, exportable: false, hide: false },
  { key: "created_at", title: "Created At", show: true, orderable: true, exportable: false, hide: false },
  { key: "actions", title: "Action", show: true, orderable: false, exportable: false, hide: false },
] satisfies CommunicationColumn[];
