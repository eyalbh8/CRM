import { useEffect, useState } from "react";
import {
  DashboardTableToolbar,
  formatClock,
  IconBell,
  IconCalendar,
  IconMoon,
  IconSearch,
  IconSpeech,
  IconTrophy,
  IconUser,
  IconWarning,
} from "./dashboardChrome";

const trafficPeriods = [
  "Today",
  "Yesterday",
  "Last week",
  "This month",
  "Last month",
] as const;

const zeroTrafficRow = {
  deposits: 0,
  withdrawal: 0,
  netDeposit: 0,
  netFtd: 0,
  conv: 0,
  leads: 0,
};

export function Dashboard() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-top-bar">
        <div className="dashboard-top-bar__search">
          <IconSearch />
          <input type="search" placeholder="Search" aria-label="Search" readOnly />
        </div>
        <div className="dashboard-top-bar__actions">
          <span className="dashboard-top-bar__clock" aria-live="polite">
            {clock}
          </span>
          <button type="button" className="dashboard-top-bar__icon-btn" aria-label="Toggle theme">
            <IconMoon />
          </button>
          <button type="button" className="dashboard-top-bar__icon-btn" aria-label="Calendar">
            <IconCalendar />
          </button>
          <button type="button" className="dashboard-top-bar__icon-btn dashboard-top-bar__icon-btn--badge" aria-label="Notifications">
            <IconBell />
            <span className="dashboard-top-bar__badge">10</span>
          </button>
          <span className="dashboard-top-bar__avatar" aria-hidden>
            TE
          </span>
        </div>
      </header>

      <div className="dashboard-banner" role="status">
        <IconWarning />
        <div className="dashboard-banner__text">
          <strong>Additional Security Step Is Not Configured.</strong>
          <p>Two-factor authentication is not activated on this account.</p>
        </div>
        <button type="button" className="dashboard-banner__cta">
          Create 2FA
        </button>
      </div>

      <section className="dashboard-summary-grid" aria-label="Income summary">
        <article className="dashboard-summary-tile dashboard-summary-tile--hero">
          <span>Monthly Deposit Income</span>
          <strong>0$</strong>
        </article>
        <div className="dashboard-summary-subgrid">
          <article className="dashboard-summary-tile">
            <IconTrophy />
            <span>Today&apos;s Income</span>
            <strong>0$</strong>
          </article>
          <article className="dashboard-summary-tile">
            <IconSpeech />
            <span>Today&apos;s Comments</span>
            <strong>0</strong>
          </article>
          <article className="dashboard-summary-tile dashboard-summary-tile--dark">
            <IconUser />
            <span>Today&apos;s Users New</span>
            <strong>0</strong>
            <span className="dashboard-summary-tile__sub">Today&apos;s Users Total 0</span>
          </article>
          <article className="dashboard-summary-tile">
            <IconUser />
            <span>Total Assigned</span>
            <strong>6</strong>
          </article>
        </div>
      </section>

      <p className="dashboard-section-title">Leads section</p>

      <div className="dashboard-row-grid">
        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="New Leads" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dashboard-table-empty-cell" colSpan={2}>
                    <div className="state-message">No data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="Leads Traffic" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th />
                  <th>Deposits</th>
                  <th>Withdrawal</th>
                  <th>Net deposit</th>
                  <th>Net FTD</th>
                  <th>Conv %</th>
                  <th>Leads</th>
                </tr>
              </thead>
              <tbody>
                {trafficPeriods.map((period) => (
                  <tr key={period}>
                    <td>{period}</td>
                    <td>{zeroTrafficRow.deposits}</td>
                    <td>{zeroTrafficRow.withdrawal}</td>
                    <td>{zeroTrafficRow.netDeposit}</td>
                    <td>{zeroTrafficRow.netFtd}</td>
                    <td>{zeroTrafficRow.conv}</td>
                    <td>{zeroTrafficRow.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="table-card dashboard-table-card">
        <DashboardTableToolbar title="Productivity Tracker" />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th />
                <th>Deposits count</th>
                <th>Deposits</th>
                <th>Leads</th>
                <th>Conv %</th>
              </tr>
            </thead>
            <tbody>
              {trafficPeriods.map((period) => (
                <tr key={period}>
                  <td>{period}</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="dashboard-section-title">Deposits section</p>

      <div className="dashboard-row-grid">
        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="New Deposit Opening Attempts" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Customer</th>
                  <th>Opened</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dashboard-table-empty-cell" colSpan={4}>
                    <div className="state-message">No data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="Registration Countries" />
          <div className="state-message">No data available</div>
        </section>
      </div>

      <div className="dashboard-row-grid">
        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="Bonuses" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Customer</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dashboard-table-empty-cell" colSpan={4}>
                    <div className="state-message">No data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="Deposits" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Customer</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dashboard-table-empty-cell" colSpan={4}>
                    <div className="state-message">No data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="dashboard-section-title">Tickets section</p>

      <div className="dashboard-row-grid">
        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="Recent Failed Deposits" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Broker</th>
                  <th>Trader</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dashboard-table-empty-cell" colSpan={5}>
                    <div className="state-message">No data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="table-card dashboard-table-card">
          <DashboardTableToolbar title="Recent Tickets" />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Trader</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="dashboard-table-empty-cell" colSpan={5}>
                    <div className="state-message">No data available</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <button type="button" className="dashboard-float-btn dashboard-float-btn--side" aria-label="Settings">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path
            d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="m19.4 15 .6 2.2-2 1.2-1.7-1.5a7 7 0 0 1-2.1.9L13.7 20h-2.4l-.5-2.2a7 7 0 0 1-2.1-.9L7 18.4l-2-1.2.6-2.2a7 7 0 0 1-1.1-1.9L2.5 12l2-1.1a7 7 0 0 1 1.1-1.9L5 6.8l2-1.2 1.7 1.5c.7-.4 1.4-.7 2.1-.9L11.3 4h2.4l.5 2.2c.7.2 1.4.5 2.1.9L18 5.6l2 1.2-.6 2.2c.5.6.8 1.2 1.1 1.9l2 1.1-2 1.1c-.3.7-.6 1.3-1.1 1.9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
      <button
        type="button"
        className="dashboard-float-btn dashboard-float-btn--scroll"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path
            d="M6 14l6-6 6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
