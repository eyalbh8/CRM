import { useState } from "react";
import type { ReactNode } from "react";
import { AssetGroupsPage } from "./asset-groups/AssetGroupsPage";
import { AssetsPage } from "./assets/AssetsPage";
import { useAuth } from "./auth/AuthProvider";
import { CampaignsPage } from "./campaigns/CampaignsPage";
import { CommunicationsPage } from "./communications/CommunicationsPage";
import { CustomerDocumentsPage } from "./customer-documents/CustomerDocumentsPage";
import { Dashboard } from "./dashboard/Dashboard";
import { DesksPage } from "./desks/DesksPage";
import { EmployeesPage } from "./employees/EmployeesPage";
import { SettingsPage } from "./settings/SettingsPage";
import { TradingAccountsPage } from "./trading-accounts/TradingAccountsPage";
import { TransactionsPage } from "./transactions/TransactionsPage";
import { TradersPage } from "./traders/TradersPage";

type Page =
  | "dashboard"
  | "trading-live"
  | "asset-groups"
  | "assets"
  | "employees"
  | "desks"
  | "campaigns"
  | "traders"
  | "trading-accounts"
  | "transactions"
  | "customer-documents"
  | "communications"
  | "tickets"
  | "analytics"
  | "mail-layouts"
  | "chat"
  | "calendar"
  | "trading-server-positions"
  | "settings"
  | "support";

type IconName =
  | "analytics"
  | "assets"
  | "calendar"
  | "campaigns"
  | "chat"
  | "communications"
  | "dashboard"
  | "desks"
  | "documents"
  | "mail"
  | "settings"
  | "support"
  | "tickets"
  | "traders"
  | "tradingAccounts"
  | "tradingGroups"
  | "tradingLive"
  | "transactions"
  | "workers";

type NavItem = {
  page: Page;
  label: string;
  icon: IconName;
  badge?: string;
  badgeTone?: "default" | "warning";
};

const navItems: NavItem[] = [
  { page: "dashboard", label: "Dashboard", icon: "dashboard" },
  { page: "traders", label: "Traders", icon: "traders" },
  { page: "trading-live", label: "Trading Live", icon: "tradingLive" },
  { page: "trading-accounts", label: "Trading Accounts", icon: "tradingAccounts" },
  { page: "desks", label: "Desks", icon: "desks" },
  { page: "asset-groups", label: "Trading Groups", icon: "tradingGroups" },
  { page: "transactions", label: "Transactions", icon: "transactions" },
  { page: "tickets", label: "Tickets", icon: "tickets", badge: "0" },
  { page: "employees", label: "Workers", icon: "workers" },
  { page: "campaigns", label: "Campaigns", icon: "campaigns" },
  { page: "analytics", label: "Analytics", icon: "analytics" },
  { page: "customer-documents", label: "Documents", icon: "documents" },
  { page: "mail-layouts", label: "Mail Layouts", icon: "mail" },
  { page: "chat", label: "Chat", icon: "chat", badge: "0" },
  { page: "calendar", label: "Calendar", icon: "calendar", badge: "TODAY 0", badgeTone: "warning" },
  { page: "communications", label: "Communications", icon: "communications" },
  {
    page: "trading-server-positions",
    label: "Trading Server Positions",
    icon: "analytics",
  },
  { page: "assets", label: "Assets", icon: "assets" },
  { page: "settings", label: "Settings", icon: "settings" },
  { page: "support", label: "Support", icon: "support" },
];

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const { employee, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong className="brand-logo">ET</strong>
          <span>Smart CRM Solutions</span>
          <small>v1.6</small>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              className={activePage === item.page ? "nav-item nav-item--active" : "nav-item"}
              key={item.page}
              type="button"
              onClick={() => setActivePage(item.page)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? (
                <span
                  className={
                    item.badgeTone === "warning" ? "nav-badge nav-badge--warning" : "nav-badge"
                  }
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-session">
          <span>{employee?.fname ?? employee?.login}</span>
          <button type="button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </aside>

      <main className="page-content">
        {activePage === "dashboard" ? (
          <Dashboard />
        ) : activePage === "asset-groups" ? (
          <AssetGroupsPage />
        ) : activePage === "assets" ? (
          <AssetsPage />
        ) : activePage === "trading-live" ? (
          <PlaceholderPage title="Trading Live" />
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
        ) : activePage === "communications" ? (
          <CommunicationsPage />
        ) : activePage === "tickets" ? (
          <PlaceholderPage title="Tickets" />
        ) : activePage === "analytics" ? (
          <PlaceholderPage title="Analytics" />
        ) : activePage === "mail-layouts" ? (
          <PlaceholderPage title="Mail Layouts" />
        ) : activePage === "chat" ? (
          <PlaceholderPage title="Chat" />
        ) : activePage === "calendar" ? (
          <PlaceholderPage title="Calendar" />
        ) : activePage === "trading-server-positions" ? (
          <PlaceholderPage title="Trading Server Positions" />
        ) : activePage === "settings" ? (
          <SettingsPage />
        ) : activePage === "support" ? (
          <PlaceholderPage title="Support" />
        ) : (
          <CustomerDocumentsPage />
        )}
      </main>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="page-header">
      <p className="eyebrow">{title}</p>
      <div>
        <h1>{title}</h1>
        <p>This section is ready in the navigation and can be connected next.</p>
      </div>
    </section>
  );
}

function Icon({ name }: { name: IconName }) {
  const commonProps = {
    className: "nav-icon",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  };

  const paths: Record<IconName, ReactNode> = {
    analytics: (
      <>
        <path d="M4 19 10 13l4 4 6-8" />
        <path d="M14 9h6v6" />
      </>
    ),
    assets: (
      <>
        <path d="M6 6h12v12H6z" />
        <path d="M8 12h8" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v4M17 3v4M4 9h16" />
        <path d="M5 5h14v16H5z" />
      </>
    ),
    campaigns: (
      <>
        <path d="M5 5v14" />
        <path d="M5 5h12l-2 4 2 4H5" />
      </>
    ),
    chat: (
      <>
        <path d="M21 11.5a8.5 8.5 0 0 1-9 8.48 8.6 8.6 0 0 1-3-.7L3 21l1.72-5.42A8.5 8.5 0 1 1 21 11.5Z" />
      </>
    ),
    communications: (
      <>
        <path d="M4 8h16v10H4z" />
        <path d="m4 9 8 5 8-5" />
      </>
    ),
    dashboard: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    desks: (
      <>
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      </>
    ),
    documents: (
      <>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v6h5M9 14h6M9 18h6" />
      </>
    ),
    mail: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    settings: (
      <>
        <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
        <path d="m19.4 15 .6 2.2-2 1.2-1.7-1.5a7 7 0 0 1-2.1.9L13.7 20h-2.4l-.5-2.2a7 7 0 0 1-2.1-.9L7 18.4l-2-1.2.6-2.2a7 7 0 0 1-1.1-1.9L2.5 12l2-1.1a7 7 0 0 1 1.1-1.9L5 6.8l2-1.2 1.7 1.5c.7-.4 1.4-.7 2.1-.9L11.3 4h2.4l.5 2.2c.7.2 1.4.5 2.1.9L18 5.6l2 1.2-.6 2.2c.5.6.8 1.2 1.1 1.9l2 1.1-2 1.1c-.3.7-.6 1.3-1.1 1.9Z" />
      </>
    ),
    support: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12a4 4 0 0 1 8 0M9 16h6M12 8v8" />
      </>
    ),
    tickets: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="M8 7a2 2 0 0 1-2 2v6a2 2 0 0 1 2 2M16 7a2 2 0 0 0 2 2v6a2 2 0 0 0-2 2" />
      </>
    ),
    traders: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M18 8h3M19.5 6.5v3" />
      </>
    ),
    tradingAccounts: (
      <>
        <path d="M4 12h16" />
        <path d="M6 16V8M12 18V6M18 15V9" />
      </>
    ),
    tradingGroups: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M7 6v.01M7 12v.01M7 18v.01" />
      </>
    ),
    tradingLive: (
      <>
        <path d="M6 18V9M12 18V5M18 18v-7" />
      </>
    ),
    transactions: (
      <>
        <path d="M4 7h16v10H4z" />
        <path d="M4 11h16" />
      </>
    ),
    workers: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </>
    ),
  };

  return <svg {...commonProps}>{paths[name]}</svg>;
}
