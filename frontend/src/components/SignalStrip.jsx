import React from "react";

export default function SignalStrip({ signals }) {
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      {signals.map((s) => (
        <div key={s.label} style={{ background: "#f0f4ff", borderRadius: "8px", padding: "1rem 2rem", minWidth: "150px" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{s.value}</div>
          <div style={{ color: "#555" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}