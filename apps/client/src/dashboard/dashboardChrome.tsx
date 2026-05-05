export function formatClock(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function IconSearch() {
  return (
    <svg className="dashboard-top-bar__icon" viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMoon() {
  return (
    <svg className="dashboard-top-bar__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg className="dashboard-top-bar__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function IconBell() {
  return (
    <svg className="dashboard-top-bar__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M14 20a2 2 0 0 1-4 0M6 8a6 6 0 1 1 12 0c0 5 2 5 4 7H2c2-2 4-2 4-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRefresh() {
  return (
    <svg className="dashboard-widget-refresh__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M21 12a9 9 0 0 1-9 9 4.5 4.5 0 0 1-4.5-4.5V16M3 12a9 9 0 0 1 9-9 4.5 4.5 0 0 1 4.5 4.5V8M3 16v4h4M21 8V4h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWarning() {
  return (
    <svg className="dashboard-banner__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 9v5M12 17h.01M10.3 4.8 2.2 18a1 1 0 0 0 .9 1.2h18.8a1 1 0 0 0 .9-1.2L13.7 4.8a1 1 0 0 0-1.8 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconTrophy() {
  return (
    <svg className="dashboard-summary-tile__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM4 4h3v3a3 3 0 0 0 3 3M20 4h-3v3a3 3 0 0 1-3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSpeech() {
  return (
    <svg className="dashboard-summary-tile__icon" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg className="dashboard-summary-tile__icon" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M5 21a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function DashboardTableToolbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="dashboard-widget-toolbar">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <button type="button" className="dashboard-widget-refresh" aria-label="Refresh widget">
        <IconRefresh />
      </button>
    </div>
  );
}
