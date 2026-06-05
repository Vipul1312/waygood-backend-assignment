import React from "react";

export default function InfoCard({ label, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "1rem 1.5rem", minWidth: "130px" }}>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", textTransform: "capitalize" }}>{value}</div>
      <div style={{ color: "#888", textTransform: "capitalize" }}>{label}</div>
    </div>
  );
}