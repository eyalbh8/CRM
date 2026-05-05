import { useState } from "react";
import { AssetGroupsPage } from "./asset-groups/AssetGroupsPage";
import { AssetsPage } from "./assets/AssetsPage";
import { CampaignsPage } from "./campaigns/CampaignsPage";
import { CustomerDocumentsPage } from "./customer-documents/CustomerDocumentsPage";
import { Dashboard } from "./dashboard/Dashboard";
import { DesksPage } from "./desks/DesksPage";
import { EmployeesPage } from "./employees/EmployeesPage";
import { TradingAccountsPage } from "./trading-accounts/TradingAccountsPage";
import { TransactionsPage } from "./transactions/TransactionsPage";
import { TradersPage } from "./traders/TradersPage";

type Page =
  | "dashboard"
  | "asset-groups"
  | "assets"
  | "employees"
  | "desks"
  | "campaigns"
  | "traders"
  | "trading-accounts"
  | "transactions"
  | "customer-documents";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <div>
            <strong>Proline</strong>
            <span>Operations</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <button
            className={activePage === "dashboard" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activePage === "asset-groups" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("asset-groups")}
          >
            Asset Groups
          </button>
          <button
            className={activePage === "assets" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("assets")}
          >
            Assets
          </button>
          <button
            className={activePage === "employees" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("employees")}
          >
            Employees
          </button>
          <button
            className={activePage === "desks" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("desks")}
          >
            Desks
          </button>
          <button
            className={activePage === "campaigns" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("campaigns")}
          >
            Campaigns
          </button>
          <button
            className={activePage === "traders" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("traders")}
          >
            Traders
          </button>
          <button
            className={
              activePage === "trading-accounts" ? "nav-item nav-item--active" : "nav-item"
            }
            type="button"
            onClick={() => setActivePage("trading-accounts")}
          >
            Trading Accounts
          </button>
          <button
            className={activePage === "transactions" ? "nav-item nav-item--active" : "nav-item"}
            type="button"
            onClick={() => setActivePage("transactions")}
          >
            Transactions
          </button>
          <button
            className={
              activePage === "customer-documents" ? "nav-item nav-item--active" : "nav-item"
            }
            type="button"
            onClick={() => setActivePage("customer-documents")}
          >
            Customer Documents
          </button>
        </nav>
      </aside>

      <main className="page-content">
        {activePage === "dashboard" ? (
          <Dashboard />
        ) : activePage === "asset-groups" ? (
          <AssetGroupsPage />
        ) : activePage === "assets" ? (
          <AssetsPage />
        ) : activePage === "employees" ? (
          <EmployeesPage />
        ) : activePage === "desks" ? (
          <DesksPage />
        ) : activePage === "campaigns" ? (
          <CampaignsPage />
        ) : activePage === "traders" ? (
          <TradersPage />
        ) : activePage === "trading-accounts" ? (
          <TradingAccountsPage />
        ) : activePage === "transactions" ? (
          <TransactionsPage />
        ) : (
          <CustomerDocumentsPage />
        )}
      </main>
    </div>
  );
}
