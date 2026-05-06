import { useCallback, useEffect, useMemo, useState } from "react";
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

type TraderTextDialogState =
  | null
  | {
      kind: "comment" | "note" | "memo";
      traderId: number;
      title: string;
      initialValue: string;
    };

type TraderTableActions = {
  openCommentModal: (row: TraderRow) => void;
  noteOpenModal: (row: TraderRow) => void;
  memoOpenModal: (row: TraderRow) => void;
  noteCardChecked: (traderId: number) => boolean;
  noteToggleCard: (traderId: number, checked: boolean) => void;
  memoCardChecked: (traderId: number) => boolean;
  memoToggleCard: (traderId: number, checked: boolean) => void;
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
  const [textDialog, setTextDialog] = useState<TraderTextDialogState>(null);
  const [textDialogDraft, setTextDialogDraft] = useState("");
  const [textDialogError, setTextDialogError] = useState<string | null>(null);
  const [isSavingTextDialog, setIsSavingTextDialog] = useState(false);
  const [noteCardChecks, setNoteCardChecks] = useState<Record<string, boolean>>({});
  const [memoCardChecks, setMemoCardChecks] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (!textDialog) {
      return;
    }
    setTextDialogDraft(textDialog.initialValue);
    setTextDialogError(null);
  }, [textDialog]);

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

  const closeTextDialog = useCallback(() => {
    setTextDialog(null);
    setTextDialogError(null);
  }, []);

  async function handleSaveTextDialog() {
    if (!textDialog) {
      return;
    }

    setIsSavingTextDialog(true);
    setTextDialogError(null);
    const tid = textDialog.traderId;
    const trimmed = textDialogDraft.trim();

    const payload =
      textDialog.kind === "comment"
        ? { last_communication: trimmed }
        : textDialog.kind === "note"
          ? { note: trimmed }
          : { memo: trimmed };

    try {
      const response = await fetch(`${apiUrl}/traders/${tid}`, {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Save failed with ${response.status}`);
      }

      const updated = (await response.json()) as TraderRow;

      setTraders((previous) =>
        previous.map((row) => (Number(row.id) === tid ? updated : row)),
      );
      setTextDialog(null);
    } catch (caughtError) {
      setTextDialogError(caughtError instanceof Error ? caughtError.message : "Save failed");
    } finally {
      setIsSavingTextDialog(false);
    }
  }

  const traderActions = useMemo(
    (): TraderTableActions => ({
      memoCardChecked: (traderId) => Boolean(memoCardChecks[String(traderId)]),
      memoOpenModal: (row: TraderRow) => {
        setTextDialog({
          initialValue: typeof row.memo === "string" ? row.memo : "",
          kind: "memo",
          title: "Memo",
          traderId: Number(row.id),
        });
      },
      memoToggleCard: (traderId, checked) =>
        setMemoCardChecks((prev) => ({
          ...prev,
          [String(traderId)]: checked,
        })),
      noteCardChecked: (traderId) => Boolean(noteCardChecks[String(traderId)]),
      noteOpenModal: (row: TraderRow) => {
        setTextDialog({
          initialValue: typeof row.note === "string" ? row.note : "",
          kind: "note",
          title: "Note",
          traderId: Number(row.id),
        });
      },
      noteToggleCard: (traderId, checked) =>
        setNoteCardChecks((prev) => ({
          ...prev,
          [String(traderId)]: checked,
        })),
      openCommentModal: (row: TraderRow) => {
        setTextDialog({
          initialValue:
            typeof row.last_communication === "string" ? row.last_communication : "",
          kind: "comment",
          title: "Last comment",
          traderId: Number(row.id),
        });
      },
    }),
    [memoCardChecks, noteCardChecks],
  );

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
        <h1 className="traders-page__title">All platform traders</h1>
        <p className="traders-page__subtitle">
          View trader registrations, ownership, campaign, and desk details.
        </p>
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
          formatTraderCell(columnKey, value, row as TraderRow, defaultRenderer, traderActions)
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

      {textDialog ? (
        <div className="modal-backdrop">
          <section
            aria-labelledby="trader-text-dialog-title"
            aria-modal
            className="modal-card modal-card--medium"
            role="dialog"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Traders</p>
                <h2 id="trader-text-dialog-title">{textDialog.title}</h2>
              </div>
              <button
                aria-label="Close"
                className="modal-close"
                disabled={isSavingTextDialog}
                type="button"
                onClick={closeTextDialog}
              >
                Close
              </button>
            </div>

            <label className="form-field form-field--full">
              <span>
                {textDialog.kind === "comment"
                  ? "Comment"
                  : textDialog.kind === "note"
                    ? "Note"
                    : "Memo"}
              </span>
              <textarea
                className="traders-text-dialog__textarea"
                onChange={(event) => setTextDialogDraft(event.target.value)}
                rows={8}
                value={textDialogDraft}
              />
            </label>

            {textDialogError ? (
              <div className="form-message form-message--error">{textDialogError}</div>
            ) : null}

            <div className="form-actions">
              <button
                className="secondary-action-button"
                disabled={isSavingTextDialog}
                type="button"
                onClick={closeTextDialog}
              >
                Cancel
              </button>
              <button
                className="primary-action-button"
                disabled={isSavingTextDialog}
                type="button"
                onClick={() => void handleSaveTextDialog()}
              >
                {isSavingTextDialog ? "Saving..." : "Save"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {isCreateOpen ? (
        <div className="modal-backdrop">
          <section
            aria-label="Create New Trader"
            className="modal-card modal-card--create-trader"
          >
            <div className="modal-header modal-header--create-trader">
              <h2 className="modal-header__title">Create New Trader</h2>
              <button
                aria-label="Close"
                className="modal-close-x"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>

            <form className="create-trader-form create-trader-form--single" onSubmit={handleSubmit}>
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

              <div className="form-actions form-actions--create-trader">
                <button
                  className="create-trader-btn create-trader-btn--cancel"
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Close
                </button>
                <button
                  className="create-trader-btn create-trader-btn--save"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Saving..." : "Save"}
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

/** WhatsApp logo path from Simple Icons (CC0). Brand color: #25D366. */
function IconWhatsAppMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="#25D366"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

function NoteMemoCard({
  checked,
  onOpenView,
  onToggle,
  variant,
  value,
}: {
  variant: "Note" | "Memo";
  value: unknown;
  checked: boolean;
  onToggle: (next: boolean) => void;
  onOpenView: () => void;
}) {
  const text = typeof value === "string" ? value.trim() : value != null ? String(value) : "";
  const hasContent = text.length > 0;

  return (
    <div className={`traders-note-card traders-note-card--${variant === "Note" ? "note" : "memo"}`}>
      <div className="traders-note-card__head">
        <input
          aria-label={`${variant} flagged for bulk action`}
          checked={checked}
          className="traders-note-card__check"
          type="checkbox"
          onChange={(event) => onToggle(event.target.checked)}
          onClick={(event) => event.stopPropagation()}
        />
        <span>{variant}</span>
      </div>
      <div className="traders-note-card__body">
        {hasContent ? (
          <span className="traders-note-card__preview">{text}</span>
        ) : (
          <span className="traders-note-card__empty">No content yet</span>
        )}
        <button
          aria-label={`View or edit ${variant.toLowerCase()}`}
          className="traders-icon-btn traders-icon-btn--link"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenView();
          }}
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
  actions: TraderTableActions,
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
        </div>
        {wa.length >= 8 ? (
          <a
            aria-label={`WhatsApp chat with ${phone}`}
            className="traders-whatsapp-chip"
            href={`https://wa.me/${wa}`}
            rel="noreferrer"
            target="_blank"
          >
            <IconWhatsAppMark aria-hidden className="traders-whatsapp-chip__icon" />
            <span className="traders-whatsapp-chip__label">WhatsApp</span>
          </a>
        ) : null}
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
      return (
        <div className="traders-last-comment-cell">
          <p className="traders-last-comment-cell__preview">{text}</p>
          <button
            aria-label="Edit last comment"
            className="traders-last-comment-cell__edit"
            type="button"
            onClick={() => actions.openCommentModal(row)}
          >
            Edit comment
          </button>
        </div>
      );
    }
    return (
      <button
        className="traders-add-comment-btn"
        type="button"
        onClick={() => actions.openCommentModal(row)}
      >
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
    const traderId = Number(row.id);
    return (
      <NoteMemoCard
        checked={actions.noteCardChecked(traderId)}
        value={value}
        variant="Note"
        onOpenView={() => actions.noteOpenModal(row)}
        onToggle={(checked) => actions.noteToggleCard(traderId, checked)}
      />
    );
  }

  if (columnKey === "memo") {
    const traderId = Number(row.id);
    return (
      <NoteMemoCard
        checked={actions.memoCardChecked(traderId)}
        value={value}
        variant="Memo"
        onOpenView={() => actions.memoOpenModal(row)}
        onToggle={(checked) => actions.memoToggleCard(traderId, checked)}
      />
    );
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

