export type CustomerDocumentColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

export const CUSTOMER_DOCUMENT_TABLE_COLUMNS = [
  { key: "id", title: "ID", show: true, orderable: true, exportable: false, hide: false },
  { key: "name", title: "Type", show: true, orderable: true, exportable: false, hide: false },
  { key: "file_file_name", title: "Name", show: true, orderable: false, exportable: false, hide: false },
  { key: "object", title: "Object", show: true, orderable: false, exportable: false, hide: false },
  { key: "url", title: "Link", show: true, orderable: false, exportable: false, hide: false },
  { key: "status", title: "Status", show: true, orderable: true, exportable: false, hide: false },
  { key: "validation", title: "Validated", show: true, orderable: true, exportable: false, hide: false },
  { key: "created_at", title: "Created", show: true, orderable: true, exportable: false, hide: false },
] satisfies CustomerDocumentColumn[];
