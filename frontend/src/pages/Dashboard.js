import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const StatCard = ({ icon, label, value, color, trend, trendLabel }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-card-header">
      <div className={`stat-card-icon ${color}`}>{icon}</div>
      {trend !== undefined && (
        <span className={`stat-card-trend ${trend >= 0 ? "up" : "down"}`}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-label">{label}</div>
    {trendLabel && <div className="text-sm text-muted">{trendLabel}</div>}
  </div>
);

const QuickLink = ({ to, icon, label, desc }) => (
  <Link
    to={to}
    style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 18px",
      borderRadius: "var(--radius)",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      transition: "var(--transition)",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#eff6ff";
      e.currentTarget.style.borderColor = "#2563eb";
      e.currentTarget.style.transform = "translateX(4px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "var(--surface-2)";
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.transform = "none";
    }}
  >
    <span style={{ fontSize: 24 }}>{icon}</span>
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
    </div>
    <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>→</span>
  </Link>
);

const Dashboard = () => {
  const [data, setData] = useState({ containers: [], monthlyFees: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/dashboard");
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const totalContainers = data.containers?.reduce((s, i) => s + (i.count || 0), 0) || 0;
  const totalFees = data.monthlyFees?.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0) || 0;

  return (
    <div>
      {/* Hero banner */}
      <div className="dashboard-header-card">
        <div style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 12, opacity: 0.6, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Port Freight Management System
          </p>
          <h1>Operations Dashboard</h1>
          <p style={{ marginTop: 8 }}>
            Real-time overview of port containers, bookings, customs clearance, and revenue.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6" style={{ marginBottom: 28 }}>
        <StatCard icon="📦" label="Total Containers" value={loading ? "—" : totalContainers} color="blue" />
        <StatCard icon="💰" label="Total Fees Collected" value={loading ? "—" : `₹${totalFees.toLocaleString("en-IN")}`} color="green" />
        <StatCard icon="📋" label="Active Bookings" value={loading ? "—" : (data.containers?.length || 0)} color="amber" />
        <StatCard icon="🛃" label="Pending Clearance" value={loading ? "—" : "—"} color="purple" />
      </div>

      {/* Two column section */}
      <div className="grid-2" style={{ marginBottom: 28 }}>

        {/* Containers Per Shipping Line */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📦 Containers per Line</div>
              <div className="card-subtitle">Distribution by shipping line</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loader-wrap"><div className="spinner" /></div>
            ) : error || !data.containers?.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>No data available</h3>
                <p>Container data will appear once the backend is connected.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Shipping Line</th>
                      <th>Containers</th>
                      <th>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.containers.map((item, i) => {
                      const share = totalContainers > 0 ? ((item.count / totalContainers) * 100).toFixed(0) : 0;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.line}</td>
                          <td>
                            <span className="badge badge-blue">{item.count}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3,
                                overflow: "hidden", minWidth: 60
                              }}>
                                <div style={{
                                  height: "100%", width: `${share}%`,
                                  background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                                  borderRadius: 3
                                }} />
                              </div>
                              <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 30 }}>{share}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Fees */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">💰 Monthly Revenue</div>
              <div className="card-subtitle">Fees collected per month</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div className="loader-wrap"><div className="spinner" /></div>
            ) : error || !data.monthlyFees?.length ? (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No fee data yet</h3>
                <p>Monthly fee data will appear after containers are processed.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.monthlyFees.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.month}</td>
                        <td style={{ color: "var(--success)", fontWeight: 700 }}>
                          ₹{parseFloat(item.amount || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">⚡ Quick Actions</div>
        </div>
        <div className="card-body">
          <div className="grid-3">
            <QuickLink to="/add-container"    icon="📦" label="Add Container"       desc="Register a new container" />
            <QuickLink to="/create-booking"   icon="📋" label="Create Booking"      desc="Schedule a container booking" />
            <QuickLink to="/add-vessel"       icon="🚢" label="Add Vessel"          desc="Register a new vessel" />
            <QuickLink to="/file-declaration" icon="🛃" label="File Declaration"    desc="Submit a customs declaration" />
            <QuickLink to="/create-user"      icon="👤" label="Add User"            desc="Register a system user" />
            <QuickLink to="/fees/1"           icon="💰" label="Calculate Fees"      desc="View fees for a container" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;