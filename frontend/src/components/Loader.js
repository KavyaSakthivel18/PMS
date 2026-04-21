import React from "react";

const Loader = ({ message = "Loading…" }) => (
  <div className="loader-wrap" style={{ flexDirection: "column", gap: 16 }}>
    <div className="spinner" />
    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{message}</span>
  </div>
);

export default Loader;