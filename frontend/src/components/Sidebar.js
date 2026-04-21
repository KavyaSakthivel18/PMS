import React from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const navSections = [
  {
    label: "Overview",
    links: [
      { to: "/dashboard", icon: "📊", label: "Dashboard" },
    ],
  },
  {
    label: "Operations",
    links: [
      { to: "/containers", icon: "📦", label: "Containers" },
      { to: "/bookings",   icon: "📋", label: "Bookings" },
      { to: "/vessels",    icon: "🚢", label: "Vessels" },
    ],
  },
  {
    label: "Compliance",
    links: [
      { to: "/customs",         icon: "🛃", label: "Customs" },
      { to: "/file-declaration",icon: "📝", label: "File Declaration" },
    ],
  },
  {
    label: "Finance",
    links: [
      { to: "/fees/1",     icon: "💰", label: "Fee Calculator" },
    ],
  },
  {
    label: "Admin",
    links: [
      { to: "/users",       icon: "👥", label: "Users" },
      { to: "/create-user", icon: "➕", label: "Add User" },
      { to: "/add-vessel",  icon: "⚓", label: "Add Vessel" },
    ],
  },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🚢</div>
        <div className="sidebar-logo-title">Port Freight MS</div>
        <div className="sidebar-logo-sub">Management System</div>
      </div>

      {/* Nav Sections */}
      {navSections.map((section) => (
        <div className="sidebar-section" key={section.label}>
          <div className="sidebar-section-label">{section.label}</div>
          {section.links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link${pathname === link.to ? " active" : ""}`}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: 10, fontSize: 12, color: "#64748b" }}>
            Signed in as <span style={{ color: "#94a3b8", fontWeight: 600 }}>{user.name || user.email || "Admin"}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "flex-start", gap: 8, color: "#ef4444", fontSize: 13 }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;