import { useEffect, useState } from "react";
import { formatClock, IconBell, IconCalendar, IconMoon, IconSearch } from "./dashboardChrome";

export function CrmTopBar() {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(formatClock(new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
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
        <button
          type="button"
          className="dashboard-top-bar__icon-btn dashboard-top-bar__icon-btn--badge"
          aria-label="Notifications"
        >
          <IconBell />
          <span className="dashboard-top-bar__badge">10</span>
        </button>
        <span className="dashboard-top-bar__avatar" aria-hidden>
          TE
        </span>
      </div>
    </header>
  );
}
