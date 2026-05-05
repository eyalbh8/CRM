import { useEffect, useMemo, useState } from "react";

type EmployeeColumn = {
  key: string;
  title: string;
  show: boolean;
  orderable: boolean;
  exportable: boolean;
  hide: boolean;
};

type EmployeeRow = Record<string, unknown>;

type EmployeesResponse = {
  columns: EmployeeColumn[];
  data: EmployeeRow[];
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [columns, setColumns] = useState<EmployeeColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmployees() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/employees`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Employees request failed with ${response.status}`);
        }

        const payload = (await response.json()) as EmployeesResponse;
        setColumns(payload.columns);
        setEmployees(payload.data);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to load employees",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEmployees();

    return () => controller.abort();
  }, []);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.show && !column.hide),
    [columns],
  );

  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Employees</p>
        <div>
          <h1>Employees</h1>
          <p>View your employees and account access details.</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Employees table</h2>
            <p>{employees.length} employees found</p>
          </div>
        </div>

        {isLoading ? (
          <div className="state-message">Loading employees...</div>
        ) : error ? (
          <div className="state-message state-message--error">{error}</div>
        ) : employees.length === 0 ? (
          <div className="state-message">No employees yet.</div>
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
                {employees.map((employee) => (
                  <tr key={String(employee.id)}>
                    {visibleColumns.map((column) => (
                      <td key={column.key}>{formatCellValue(employee[column.key])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
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

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value);
}
