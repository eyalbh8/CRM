import type { ReactNode } from "react";

export function isIsoDateLike(value: string) {
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}

/** Default formatter for CRM data tables — booleans, dates, arrays, objects, placeholders. */
export function formatDataCell(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="empty-value">-</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span className={value ? "status-pill status-pill--yes" : "status-pill"}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "string" && isIsoDateLike(value)) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? <span className="empty-value">-</span> : value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
