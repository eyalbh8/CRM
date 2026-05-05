const dashboardMetrics = [
  { label: "Revenue", value: "$84.2K", change: "+12.5%" },
  { label: "New customers", value: "1,284", change: "+8.2%" },
  { label: "Open tasks", value: "46", change: "-4.1%" },
];

const revenueBars = [42, 58, 49, 72, 64, 88, 76];

const activitySegments = [
  { label: "Calls", value: 42 },
  { label: "Emails", value: 31 },
  { label: "Meetings", value: 18 },
];

export function Dashboard() {
  return (
    <>
      <section className="page-header">
        <p className="eyebrow">Dashboard</p>
        <div>
          <h1>Business overview</h1>
          <p>Mock charts for a quick snapshot of activity and growth.</p>
        </div>
      </section>

      <section className="metric-grid">
        {dashboardMetrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.change} vs last month</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="chart-card chart-card--wide">
          <div className="card-heading">
            <div>
              <h2>Revenue trend</h2>
              <p>Last 7 months</p>
            </div>
            <strong>$84.2K</strong>
          </div>
          <div className="bar-chart" aria-label="Mock revenue bar chart">
            {revenueBars.map((height, index) => (
              <span
                className="bar-chart__bar"
                key={index}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </article>

        <article className="chart-card">
          <div className="card-heading">
            <div>
              <h2>Activity mix</h2>
              <p>Mock channel split</p>
            </div>
          </div>
          <div className="activity-list">
            {activitySegments.map((segment) => (
              <div className="activity-row" key={segment.label}>
                <div>
                  <span>{segment.label}</span>
                  <strong>{segment.value}%</strong>
                </div>
                <progress max="100" value={segment.value} />
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
