import React from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const pageTitles = {
  "/dashboard":       { title: "Dashboard",        sub: "System overview & analytics" },
  "/containers":      { title: "Containers",        sub: "Track and manage containers" },
  "/add-container":   { title: "Add Container",     sub: "Register a new container" },
  "/bookings":        { title: "Bookings",           sub: "View and manage bookings" },
  "/create-booking":  { title: "Create Booking",    sub: "Schedule a new booking" },
  "/vessels":         { title: "Vessels",            sub: "Fleet management" },
  "/add-vessel":      { title: "Add Vessel",         sub: "Register a new vessel" },
  "/customs":         { title: "Customs Declarations", sub: "Clearance and compliance" },
  "/file-declaration":{ title: "File Declaration",  sub: "Submit a customs declaration" },
  "/users":           { title: "Users",              sub: "Manage system users" },
  "/create-user":     { title: "Add User",           sub: "Register a new user" },
};

const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const pathKey = Object.keys(pageTitles).find(
    (k) => pathname === k || pathname.startsWith(k + "/")
  );
  const page = pathKey ? pageTitles[pathKey] : { title: "Port Freight MS", sub: "" };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div>
          <div className="navbar-title">{page.title}</div>
          {page.sub && <div className="navbar-breadcrumb">{page.sub}</div>}
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-badge">
          🕐 {timeStr} &nbsp;·&nbsp; {dateStr}
        </div>

        <div className="navbar-badge">
          🟢 <span>System Online</span>
        </div>

        <div className="navbar-avatar" title={user?.name || "Admin"}>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Navbar;