import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode, SVGProps } from "react";

import {
  DataBrowserGearIcon,
  DataBrowserTable,
} from "../components/data-browser-table";
import { CrmTopBar } from "../dashboard/CrmTopBar";

type TraderColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type TraderRow = Record<string, unknown>;

type TradersResponse = {
  columns: TraderColumn[];
  data: TraderRow[];
};

type Option = {
  label: string;
  value: string;
};

type TraderFormState = {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  desk_id: string;
  campaign_id: string;
  affiliate_id: string;
  broker_id: string;
  trading_server: string;
  comment: string;
};

type TraderCreateFormResponse = {
  campaigns: ApiOption[];
  desks: ApiOption[];
  employees: ApiOption[];
};

type ApiOption = {
  label: string;
  value: number;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const initialFormState: TraderFormState = {
  fname: "",
  lname: "",
  email: "",
  password: "",
  phone: "",
  country: "",
  desk_id: "",
  campaign_id: "",
  affiliate_id: "",
  broker_id: "",
  trading_server: "web_trading_server",
  comment: "",
};

const countryOptions = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Greece",
  "Hong Kong",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Viet Nam",
].map((country) => ({ label: country, value: country }));

const tradingServerOptions = [{ label: "Web Trading Server", value: "web_trading_server" }];

const PAGE_SIZE = 25;

export function TradersPage() {
  const [traders, setTraders] = useState<TraderRow[]>([]);
  const [columns, setColumns] = useState<TraderColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formState, setFormState] = useState<TraderFormState>(initialFormState);
  const [formOptions, setFormOptions] = useState({
    desks: [] as Option[],
    campaigns: [] as Option[],
    employees: [] as Option[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingCreateForm, setIsLoadingCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTraders(signal?: AbortSignal, options?: { soft?: boolean }) {
    if (!options?.soft) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/traders`, {
        signal,
      });

      if (!response.ok) {
        throw new Error(`Traders request failed with ${response.status}`);
      }

      const payload = (await response.json()) as TradersResponse;
      setColumns(payload.columns);
      setTraders(payload.data);
    } finally {
      if (!options?.soft) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialData() {
      try {
        await loadTraders(controller.signal);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error ? caughtError.message : "Failed to load traders",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => controller.abort();
  }, []);

  const totalRows = traders.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  async function handleRefreshTable() {
    try {
      await loadTraders(undefined, { soft: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to refresh traders");
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  }

  async function handleOpenCreateModal() {
    setIsLoadingCreateForm(true);
    setError(null);
    setFormError(null);

    try {
      const options = await loadFormOptions();
      setFormOptions(options);
      setFormState(initialFormState);
      setIsCreateOpen(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load create trader options",
      );
    } finally {
      setIsLoadingCreateForm(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch(`${apiUrl}/traders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error(`Create trader request failed with ${response.status}`);
      }

      await loadTraders(undefined);
      setFormState(initialFormState);
      setIsCreateOpen(false);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error ? caughtError.message : "Failed to create trader",
      );
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }

  const selectedCount = selectedIds.size;

  return (
    <div className="traders-page">
      <CrmTopBar />

      <section className="traders-page__header">
        <p className="eyebrow">Traders</p>
        <div>
          <h1 className="traders-page__title">All platform traders</h1>
          <p className="traders-page__subtitle">
            View trader registrations, ownership, campaign, and desk details.
          </p>
        </div>
      </section>

      <div className="traders-toolbar" aria-label="Traders filters and actions">
        <button
          className="traders-toolbar__new-link"
          disabled={isLoadingCreateForm || isLoading}
          type="button"
          onClick={handleOpenCreateModal}
        >
          {isLoadingCreateForm ? "Loading…" : "+ New Trader"}
        </button>
        <ToolbarSelect label="Select Filters" placeholder="Select Filters" />
        <ToolbarSelect label="Other Filters" placeholder="Other Filters" />
        <ToolbarSelect label="Filters presets" placeholder="Filters Presets" />
        <ToolbarSelect label="Display options" placeholder="Display Options" />
        <span className="traders-toolbar__selection-pill">{selectedCount} Items Selected</span>
        <button className="traders-toolbar__btn" disabled type="button">
          Lead Splitter
        </button>
        <button className="traders-toolbar__btn" disabled={isLoading} type="button" onClick={handleRefreshTable}>
          Refresh
        </button>
        <button className="traders-toolbar__btn" disabled type="button">
          Export
        </button>
        <button className="traders-toolbar__btn" disabled type="button">
          Import
        </button>
        <button className="traders-toolbar__btn" disabled type="button">
          Mass Actions
        </button>
        <button className="traders-toolbar__filters-settings" type="button">
          <DataBrowserGearIcon aria-hidden /> Filters Settings
        </button>
      </div>

      <DataBrowserTable
        columns={columns}
        emptyMessage="No traders yet."
        error={error}
        loading={isLoading}
        loadingMessage="Loading traders..."
        onPageChange={setPage}
        pagination
        page={page}
        pageSize={PAGE_SIZE}
        renderCell={({ columnKey, value, row, defaultRenderer }) =>
          formatTraderCell(columnKey, value, row as TraderRow, defaultRenderer)
        }
        rows={traders}
        selection={{
          getRowKey: (row) => String(row.id),
          onSelectionChange: setSelectedIds,
          selectedKeys: selectedIds,
          selectAllAriaLabel: "Select all on this page",
          rowAriaLabel: ({ key }) => `Select trader ${key}`,
        }}
        wideCard
        wideTable
      />

      <button className="dashboard-float-btn dashboard-float-btn--side" type="button" aria-label="Page settings">
        <DataBrowserGearIcon aria-hidden />
      </button>
      <button
        className="dashboard-float-btn dashboard-float-btn--scroll"
        type="button"
        aria-label="Scroll to top"
        onClick={scrollToTop}
      >
        ↑
      </button>

      {isCreateOpen ? (
        <div className="modal-backdrop">
          <section className="modal-card modal-card--large" aria-label="Create New Trader">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Traders</p>
                <h2>Create New Trader</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="create-trader-form" onSubmit={handleSubmit}>
              <FormInput
                label="Enter customer first name"
                name="fname"
                onChange={handleInputChange}
                placeholder="Customer first name"
                value={formState.fname}
              />
              <FormInput
                label="Enter customer last name"
                name="lname"
                onChange={handleInputChange}
                placeholder="Customer last name"
                value={formState.lname}
              />
              <FormInput
                label="Enter customer email"
                name="email"
                onChange={handleInputChange}
                placeholder="Customer email"
                value={formState.email}
              />
              <FormInput
                label="Enter customer password"
                name="password"
                onChange={handleInputChange}
                placeholder="Customer password"
                type="password"
                value={formState.password}
              />
              <FormInput
                label="Enter Customer Phone"
                name="phone"
                onChange={handleInputChange}
                placeholder="Customer phone"
                value={formState.phone}
              />
              <FormSelect
                label="Choose Country From List"
                name="country"
                onChange={handleInputChange}
                options={countryOptions}
                placeholder="Customer country"
                value={formState.country}
              />
              <FormSelect
                label="Choose Desk From List"
                name="desk_id"
                onChange={handleInputChange}
                options={formOptions.desks}
                placeholder="Customer desk"
                value={formState.desk_id}
              />
              <FormSelect
                label="Choose Campaign From List"
                name="campaign_id"
                onChange={handleInputChange}
                options={formOptions.campaigns}
                placeholder="Customer campaign"
                value={formState.campaign_id}
              />
              <FormSelect
                label="Choose Affiliate"
                name="affiliate_id"
                onChange={handleInputChange}
                options={formOptions.employees}
                placeholder="Customer affiliate"
                value={formState.affiliate_id}
              />
              <FormSelect
                label="Choose Broker"
                name="broker_id"
                onChange={handleInputChange}
                options={formOptions.employees}
                placeholder="Customer broker"
                value={formState.broker_id}
              />
              <FormSelect
                label="Trading Server"
                name="trading_server"
                onChange={handleInputChange}
                options={tradingServerOptions}
                placeholder="Trading Server"
                value={formState.trading_server}
              />
              <label className="form-field form-field--full">
                <span>Enter Customer Comment</span>
                <textarea
                  name="comment"
                  onChange={handleInputChange}
                  placeholder="Customer comment"
                  value={formState.comment}
                />
              </label>

              {formError ? (
                <div className="form-message form-message--error">{formError}</div>
              ) : null}

              <div className="form-actions">
                <button
                  className="secondary-action-button"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button className="primary-action-button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Creating..." : "Create Trader"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function ToolbarSelect({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="traders-toolbar__select-wrap">
      <span className="visually-hidden">{label}</span>
      <select aria-label={label} className="traders-toolbar__select" disabled>
        <option value="">{placeholder}</option>
      </select>
    </label>
  );
}

function IconEye(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <circle cx={12} cy={12} r={3} />
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCopy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path d="M8 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M13 21h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function IconBellRow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path d="M14 20a2 2 0 0 1-4 0M6 8a6 6 0 1 1 12 0c0 5 2 5 4 7H2c2-2 4-2 4-7Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconPencil(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path
        d="M17 3a2.828 2.828 0 1 1 4 4L9 19l-4 1 1-4 12.5-12.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function employeeDisplayName(value: unknown) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const nameField = (value as { name?: unknown }).name;
    if (typeof nameField === "string") {
      const trimmed = nameField.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Local CRM-style timestamps (YYYY-MM-DD HH:mm:ss). */
function formatCrmDateTimeDisplay(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function isEmptyDisplayValue(value: unknown) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  return false;
}

function formatMoneyUsdStyle(value: unknown, row: TraderRow) {
  const raw = typeof value === "number" ? value : parseFloat(String(value ?? "0"));
  const safe = Number.isFinite(raw) ? raw : 0;
  const text = Number.isInteger(safe) ? String(safe) : safe.toFixed(2).replace(/\.?0+$/, "");
  const cur = typeof row.currency === "string" && row.currency.trim() !== "" ? row.currency : "USD";

  if (cur === "USD") {
    return <span className="traders-money-cell">{`${text}$`}</span>;
  }

  return (
    <span className="traders-money-cell">
      {text} {cur}
    </span>
  );
}

function renderNeverDanger() {
  return <span className="traders-value-neg">Never</span>;
}

function renderNoneDanger() {
  return <span className="traders-value-neg traders-value-neg--emphasis">None</span>;
}

function renderNotAssigned() {
  return <span className="traders-value-neg traders-value-neg--emphasis">Not Assigned</span>;
}

function renderEmptyDanger() {
  return <span className="traders-value-neg traders-value-neg--emphasis">Empty</span>;
}

function IconChatBubble(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" {...props}>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoteMemoCard({
  variant,
  value,
}: {
  variant: "Note" | "Memo";
  value: unknown;
}) {
  const text = typeof value === "string" ? value.trim() : value != null ? String(value) : "";
  const hasContent = text.length > 0;

  return (
    <div className={`traders-note-card traders-note-card--${variant === "Note" ? "note" : "memo"}`}>
      <div className="traders-note-card__head">
        <input aria-label={`${variant} selected`} className="traders-note-card__check" type="checkbox" />
        <span>{variant}</span>
      </div>
      <div className="traders-note-card__body">
        {hasContent ? <span className="traders-note-card__preview">{text}</span> : null}
        <button
          aria-label={`View ${variant.toLowerCase()}`}
          className="traders-icon-btn traders-icon-btn--link"
          type="button"
        >
          <IconEye className="traders-inline-icon" />
        </button>
      </div>
    </div>
  );
}

function renderMt5Login(value: unknown, defaultRenderer: (v: unknown) => ReactNode) {
  if (value === null || value === undefined) {
    return renderNoneDanger();
  }
  if (typeof value === "string") {
    if (!value.trim()) {
      return renderNoneDanger();
    }
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const j = JSON.stringify(value);
    if (j === "{}" || j === "[]" || j === "null") {
      return renderNoneDanger();
    }
    const o = value as Record<string, unknown>;
    if (typeof o.login === "string" && o.login.trim()) {
      return o.login.trim();
    }
    if (typeof o.mt5_login === "string" && o.mt5_login.trim()) {
      return o.mt5_login.trim();
    }
    return (
      <span className="traders-mt5-json" title={j}>
        {j.length > 48 ? `${j.slice(0, 45)}…` : j}
      </span>
    );
  }
  return defaultRenderer(value);
}

function BooleanActiveDisplay({ value }: { value: unknown }) {
  return value === true ? (
    <span className="traders-bool-yes">Yes</span>
  ) : (
    <span className="traders-bool-no">No</span>
  );
}

function formatTraderCell(
  columnKey: string,
  value: unknown,
  row: TraderRow,
  defaultRenderer: (cellValue: unknown) => ReactNode,
): ReactNode {
  if (columnKey === "id") {
    const id = typeof value === "number" ? value : Number(value);
    return (
      <div className="traders-cell-id">
        <span className="traders-cell-id__hash">#{id}</span>
        <span className="traders-cell-id__actions">
          <button
            aria-label="View trader (coming soon)"
            className="traders-icon-btn traders-icon-btn--quiet"
            type="button"
          >
            <IconEye className="traders-inline-icon" />
          </button>
          <button
            aria-label="Copy trader ID"
            className="traders-icon-btn traders-icon-btn--quiet"
            type="button"
            onClick={() => void navigator.clipboard.writeText(String(id))}
          >
            <IconCopy className="traders-inline-icon" />
          </button>
          <button
            aria-label="Notifications (coming soon)"
            className="traders-icon-btn traders-icon-btn--quiet"
            type="button"
          >
            <IconBellRow className="traders-inline-icon" />
          </button>
        </span>
      </div>
    );
  }

  if (columnKey === "email") {
    if (isEmptyDisplayValue(value)) {
      return renderNoneDanger();
    }
    const email = String(value);
    return (
      <a className="traders-table-link" href={`mailto:${email}`}>
        {email}
      </a>
    );
  }

  if (columnKey === "phone") {
    if (isEmptyDisplayValue(value)) {
      return renderNoneDanger();
    }
    const phone = String(value);
    const wa = phone.replace(/\D/g, "");
    return (
      <div className="traders-cell-phone">
        <a className="traders-table-link" href={`tel:${phone.replace(/\s/g, "")}`}>
          {phone}
        </a>
        <div className="traders-cell-phone__row">
          <button
            aria-label={`Copy phone ${phone}`}
            className="traders-icon-btn traders-icon-btn--link"
            type="button"
            onClick={() => void navigator.clipboard.writeText(phone)}
          >
            <IconCopy className="traders-inline-icon" />
          </button>
          {wa.length >= 8 ? (
            <a
              className="traders-whatsapp-link"
              href={`https://wa.me/${wa}`}
              rel="noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  if (columnKey === "mt5_login") {
    return renderMt5Login(value, defaultRenderer);
  }

  if (columnKey === "promo_code") {
    if (isEmptyDisplayValue(value)) {
      return <span className="traders-value-plain-none">None</span>;
    }
    return String(value);
  }

  if (
    columnKey === "finance_employee" ||
    columnKey === "broker_employee" ||
    columnKey === "mark_ftd_employee"
  ) {
    const name = employeeDisplayName(value);
    if (!name) {
      return renderNotAssigned();
    }
    return name;
  }

  if (columnKey === "self_status") {
    const text =
      value === null || value === undefined || value === "" ? (
        <span className="empty-value">—</span>
      ) : (
        String(value)
      );
    return (
      <span className="traders-sale-status-cell">
        {text}{" "}
        <button
          aria-label="Edit sale status (coming soon)"
          className="traders-icon-btn traders-icon-btn--link"
          type="button"
        >
          <IconPencil className="traders-inline-icon" />
        </button>
      </span>
    );
  }

  if (columnKey === "retention_status") {
    const inner = isEmptyDisplayValue(value)
      ? renderNoneDanger()
      : <span>{String(value)}</span>;
    return (
      <span className="traders-sale-status-cell">
        {inner}{" "}
        <button
          aria-label="Edit retention status (coming soon)"
          className="traders-icon-btn traders-icon-btn--link"
          type="button"
        >
          <IconPencil className="traders-inline-icon" />
        </button>
      </span>
    );
  }

  const moneyKeys = ["balance", "total_deposits", "total_withdrawals", "total_bonuses"];
  if (moneyKeys.includes(columnKey)) {
    return formatMoneyUsdStyle(value, row);
  }

  const plainDashKeys = [
    "campaign",
    "desk",
    "country",
    "city",
    "trading_server",
    "currency",
    "registration_city",
    "import_a_aid",
  ];
  if (plainDashKeys.includes(columnKey)) {
    if (isEmptyDisplayValue(value)) {
      return <span className="empty-value">—</span>;
    }
    return String(value);
  }

  if (columnKey === "validation_status" || columnKey === "potential_status") {
    if (isEmptyDisplayValue(value)) {
      return renderNoneDanger();
    }
    return String(value);
  }

  if (columnKey === "forced_strategy") {
    if (isEmptyDisplayValue(value)) {
      return renderEmptyDanger();
    }
    return String(value);
  }

  const boolKeys = ["active", "active_trading", "active_deposit"];
  if (boolKeys.includes(columnKey)) {
    return <BooleanActiveDisplay value={Boolean(value)} />;
  }

  if (columnKey === "last_login" || columnKey === "last_reminder_start_at") {
    if (isEmptyDisplayValue(value)) {
      return renderNeverDanger();
    }
    const s =
      typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value)
        ? formatCrmDateTimeDisplay(value)
        : String(value);
    return s ?? String(value);
  }

  if (columnKey === "last_communication") {
    const text = typeof value === "string" ? value.trim() : "";
    if (text) {
      return <span>{text}</span>;
    }
    return (
      <button className="traders-add-comment-btn" type="button">
        <IconChatBubble className="traders-add-comment-btn__icon" />
        Add comment
      </button>
    );
  }

  if (columnKey === "last_communication_date") {
    if (isEmptyDisplayValue(value)) {
      return renderNeverDanger();
    }
    const s =
      typeof value === "string" && /\d{4}-\d{2}-\d{2}/.test(value)
        ? formatCrmDateTimeDisplay(value)
        : String(value);
    return s ?? String(value);
  }

  if (columnKey === "note") {
    return <NoteMemoCard variant="Note" value={value} />;
  }

  if (columnKey === "memo") {
    return <NoteMemoCard variant="Memo" value={value} />;
  }

  if (columnKey === "import_a_bid" || columnKey === "import_a_cid") {
    if (isEmptyDisplayValue(value)) {
      return renderNoneDanger();
    }
    return String(value);
  }

  if (columnKey === "created_at") {
    if (isEmptyDisplayValue(value)) {
      return <span className="empty-value">—</span>;
    }
    return formatCrmDateTimeDisplay(value) ?? String(value);
  }

  const optionalDashDateKeys = [
    "ftd_date",
    "last_change_broker_date",
    "last_change_desk_date",
    "re_deposit_date",
  ];
  if (optionalDashDateKeys.includes(columnKey)) {
    if (isEmptyDisplayValue(value)) {
      return <span className="empty-value">—</span>;
    }
    return formatCrmDateTimeDisplay(value) ?? String(value);
  }

  if (columnKey === "last_ip" || columnKey === "registration_ip") {
    if (isEmptyDisplayValue(value)) {
      return renderNoneDanger();
    }
    return <span className="traders-ip-cell">{String(value)}</span>;
  }

  if (columnKey === "last_open_date_trade") {
    if (isEmptyDisplayValue(value)) {
      return renderNoneDanger();
    }
    return formatCrmDateTimeDisplay(value) ?? String(value);
  }

  if (columnKey === "resident") {
    if (isEmptyDisplayValue(value)) {
      return <span className="empty-value">—</span>;
    }
    return String(value);
  }

  if (columnKey === "fname") {
    const text =
      value === null || value === undefined || value === "" ? (
        <span className="empty-value">—</span>
      ) : (
        String(value)
      );
    return (
      <span className="traders-fname-cell">
        <span>{text}</span> <span className="traders-status-dot" title="Lead status" />
      </span>
    );
  }

  return defaultRenderer(value);
}

function FormInput({
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  name: keyof TraderFormState;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        autoComplete="on"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function FormSelect({
  label,
  name,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  name: keyof TraderFormState;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder: string;
  value: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select name={name} onChange={onChange} value={value}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

async function loadFormOptions(signal?: AbortSignal) {
  const response = await fetch(`${apiUrl}/traders/create-form`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Create trader form request failed with ${response.status}`);
  }

  const payload = (await response.json()) as TraderCreateFormResponse;

  return {
    campaigns: toSelectOptions(payload.campaigns),
    desks: toSelectOptions(payload.desks),
    employees: toSelectOptions(payload.employees),
  };
}

function toSelectOptions(options: ApiOption[]) {
  return options.map((option) => ({
    label: option.label,
    value: String(option.value),
  }));
}

