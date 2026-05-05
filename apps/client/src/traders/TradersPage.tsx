import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

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

export function TradersPage() {
  const [traders, setTraders] = useState<TraderRow[]>([]);
  const [columns, setColumns] = useState<TraderColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  async function loadTraders(signal?: AbortSignal) {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`${apiUrl}/traders`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(`Traders request failed with ${response.status}`);
    }

    const payload = (await response.json()) as TradersResponse;
    setColumns(payload.columns);
    setTraders(payload.data);
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

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

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

      await loadTraders();
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

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Traders</p>
        <div>
          <h1>Traders</h1>
          <p>View trader registrations, ownership, campaign, and desk details.</p>
        </div>
      </section>

      <section className="table-card table-card--wide">
        <div className="table-toolbar">
          <div>
            <h2>Traders table</h2>
            <p>{traders.length} traders found</p>
          </div>
          <button
            className="primary-action-button"
            disabled={isLoadingCreateForm}
            type="button"
            onClick={handleOpenCreateModal}
          >
            {isLoadingCreateForm ? "Loading Form..." : "Create New Trader"}
          </button>
        </div>

        {isLoading ? (
          <div className="state-message">Loading traders...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : traders.length === 0 ? (
          <div className="state-message">No traders yet.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table data-table--wide">
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column.key}>{column.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traders.map((trader) => (
                  <tr key={String(trader.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(trader[column.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
    </>
  );
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

function formatCellValue(value: unknown) {
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

  if (typeof value === "string" && isIsoDate(value)) {
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

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}
