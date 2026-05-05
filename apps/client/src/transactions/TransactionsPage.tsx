import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type TransactionColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type TransactionRow = Record<string, unknown>;

type TransactionFilter = {
  key: string;
  type: "select";
  label: string;
  values: ApiOption[];
};

type TransactionsResponse = {
  columns: TransactionColumn[];
  filters: TransactionFilter[];
  data: TransactionRow[];
};

type ApiOption = {
  label: string;
  value: number | string;
};

type SelectOption = {
  label: string;
  value: string;
};

type TradingAccountOption = ApiOption & {
  balance: string;
  traderId: number;
};

type TransactionCreateFormResponse = {
  employees: ApiOption[];
  tradingAccounts: TradingAccountOption[];
  transactionTypes: ApiOption[];
};

type TransactionFormState = {
  trading_account_id: string;
  value: string;
  type: string;
  employee_id: string;
  created_by_employee_id: string;
  created_from: string;
  comment: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const initialFormState: TransactionFormState = {
  trading_account_id: "",
  value: "",
  type: "Deposit",
  employee_id: "",
  created_by_employee_id: "",
  created_from: "UI",
  comment: "",
};

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [columns, setColumns] = useState<TransactionColumn[]>([]);
  const [filters, setFilters] = useState<TransactionFilter[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formState, setFormState] = useState<TransactionFormState>(initialFormState);
  const [formOptions, setFormOptions] = useState({
    employees: [] as SelectOption[],
    tradingAccounts: [] as TradingAccountOption[],
    transactionTypes: [] as SelectOption[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoadingCreateForm, setIsLoadingCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTransactions(signal?: AbortSignal) {
    setIsLoading(true);
    setError(null);

    const response = await fetch(`${apiUrl}/transactions`, {
      signal,
    });

    if (!response.ok) {
      throw new Error(`Transactions request failed with ${response.status}`);
    }

    const payload = (await response.json()) as TransactionsResponse;
    setColumns(payload.columns);
    setFilters(payload.filters);
    setTransactions(payload.data);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialData() {
      try {
        await loadTransactions(controller.signal);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load transactions",
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

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        filters.every((filter) => {
          const selectedValue = activeFilters[filter.key];

          if (!selectedValue) {
            return true;
          }

          return String(transaction[filter.key] ?? "") === selectedValue;
        }),
      ),
    [activeFilters, filters, transactions],
  );

  const selectedTradingAccount = formOptions.tradingAccounts.find(
    (account) => String(account.value) === formState.trading_account_id,
  );

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setFormState((currentState) => ({ ...currentState, [name]: value }));
  }

  function handleFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;
    setActiveFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  }

  function handleClearFilters() {
    setActiveFilters({});
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
          : "Failed to load create transaction options",
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
      const response = await fetch(`${apiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error(`Create transaction request failed with ${response.status}`);
      }

      await loadTransactions();
      setFormState(initialFormState);
      setIsCreateOpen(false);
    } catch (caughtError) {
      setFormError(
        caughtError instanceof Error ? caughtError.message : "Failed to create transaction",
      );
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Transactions</p>
        <div>
          <h1>Transactions</h1>
          <p>View trader deposits, withdrawals, account balances, and broker details.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Transactions table</h2>
            <p>
              {filteredTransactions.length} of {transactions.length} transactions found
            </p>
          </div>
          <button
            className="primary-action-button"
            disabled={isLoadingCreateForm}
            type="button"
            onClick={handleOpenCreateModal}
          >
            {isLoadingCreateForm ? "Loading Form..." : "Add Transaction"}
          </button>
        </div>

        {filters.length > 0 ? (
          <div className="table-filters" aria-label="Transaction filters">
            {filters.map((filter) => (
              <label className="table-filter-field" key={filter.key}>
                <span>{filter.label}</span>
                <select
                  name={filter.key}
                  onChange={handleFilterChange}
                  value={activeFilters[filter.key] ?? ""}
                >
                  <option value="">All</option>
                  {filter.values.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <button className="secondary-action-button" type="button" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="state-message">Loading transactions...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="state-message">No transactions yet.</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="state-message">No transactions match the selected filters.</div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={column.key}>{column.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={String(transaction.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(transaction[column.key])}</td>
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
          <section className="modal-card modal-card--large" aria-label="Add Transaction">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Transactions</p>
                <h2>Add Transaction</h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="create-transaction-form" onSubmit={handleSubmit}>
              <FormSelect
                label="Trading Account"
                name="trading_account_id"
                onChange={handleInputChange}
                options={formOptions.tradingAccounts.map((account) => ({
                  label: account.label,
                  value: String(account.value),
                }))}
                placeholder="Choose trading account"
                value={formState.trading_account_id}
              />
              <FormSelect
                label="Transaction Type"
                name="type"
                onChange={handleInputChange}
                options={formOptions.transactionTypes}
                placeholder="Choose type"
                value={formState.type}
              />
              <FormInput
                label="Amount"
                name="value"
                onChange={handleInputChange}
                placeholder="Example: 250.00 or -50.00"
                type="number"
                value={formState.value}
              />
              <FormInput
                label="Created From"
                name="created_from"
                onChange={handleInputChange}
                placeholder="UI"
                value={formState.created_from}
              />
              <FormSelect
                label="Assigned Employee"
                name="employee_id"
                onChange={handleInputChange}
                options={formOptions.employees}
                placeholder="Choose employee"
                value={formState.employee_id}
              />
              <FormSelect
                label="Created By Employee"
                name="created_by_employee_id"
                onChange={handleInputChange}
                options={formOptions.employees}
                placeholder="Choose creator"
                value={formState.created_by_employee_id}
              />
              <label className="form-field form-field--full">
                <span>Comment</span>
                <textarea
                  name="comment"
                  onChange={handleInputChange}
                  placeholder="Transaction note"
                  value={formState.comment}
                />
              </label>

              {selectedTradingAccount ? (
                <div className="form-message form-message--info">
                  Balance before will be taken from account: {selectedTradingAccount.balance}
                </div>
              ) : null}

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
                  {isSubmitting ? "Adding..." : "Add Transaction"}
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
  name: keyof TransactionFormState;
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
        step={type === "number" ? "0.01" : undefined}
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
  name: keyof TransactionFormState;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
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
  const response = await fetch(`${apiUrl}/transactions/create-form`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Create transaction form request failed with ${response.status}`);
  }

  const payload = (await response.json()) as TransactionCreateFormResponse;

  return {
    employees: toSelectOptions(payload.employees),
    tradingAccounts: payload.tradingAccounts,
    transactionTypes: toSelectOptions(payload.transactionTypes),
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
