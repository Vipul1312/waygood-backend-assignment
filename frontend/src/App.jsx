import React, { useState, useEffect } from "react";

const API = "";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const url = isRegister ? "/api/auth/register" : "/api/auth/login";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error?.message || "Something went wrong");
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    onLogin(data.data.user, data.data.token);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "3rem", width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #4361ee, #7209b7)", borderRadius: "16px", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "28px" }}>🎓</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "1.6rem", color: "#1a1a2e", fontWeight: 700 }}>Waygood</h1>
          <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.9rem" }}>{isRegister ? "Create your account" : "Sign in to your account"}</p>
        </div>
        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #feb2b2", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem", color: "#c53030", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
        {isRegister && (
          <input
            style={S.searchInput}
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        )}
        <input
          style={{ ...S.searchInput, marginBottom: "0.75rem" }}
          placeholder="Email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={{ ...S.searchInput, marginBottom: "1.25rem" }}
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "0.9rem", background: "linear-gradient(135deg, #4361ee, #7209b7)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}
        >
          {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.88rem", color: "#888" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{ color: "#4361ee", cursor: "pointer", fontWeight: 600 }}
          >
            {isRegister ? "Sign In" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "#4361ee", icon }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", flex: 1, minWidth: "140px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>{icon}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a2e" }}>{value}</div>
      <div style={{ color: "#888", fontSize: "0.85rem", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function Dashboard({ token }) {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setOverview(d.data));
  }, [token]);

  if (!overview) return <div style={S.loading}>Loading dashboard...</div>;

  const statusColor = { draft: "#718096", submitted: "#4361ee", "under-review": "#f6ad55", "offer-received": "#48bb78", "visa-processing": "#0bc5ea", enrolled: "#38a169", rejected: "#fc8181" };

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard label="Total Students" value={overview.totalStudents} color="#4361ee" icon="👨‍🎓" />
        <StatCard label="Total Programs" value={overview.totalPrograms} color="#7209b7" icon="📚" />
        <StatCard label="Applications" value={overview.totalApplications} color="#f72585" icon="📋" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={S.panel}>
          <h3 style={S.panelTitle}>Application Status</h3>
          {(overview.statusBreakdown || []).map((s) => (
            <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: statusColor[s._id] || "#ccc" }} />
                <span style={{ textTransform: "capitalize", color: "#444" }}>{s._id}</span>
              </div>
              <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{s.count}</span>
            </div>
          ))}
        </div>
        <div style={S.panel}>
          <h3 style={S.panelTitle}>Top Destinations</h3>
          {(overview.topCountries || []).map((c, i) => (
            <div key={c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ background: "#4361ee", color: "#fff", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>{i + 1}</span>
                <span style={{ color: "#444" }}>{c._id}</span>
              </div>
              <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{c.count} apps</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Universities({ token }) {
  const [unis, setUnis] = useState([]);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (country) p.set("country", country);
    fetch(`${API}/api/universities?${p}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setUnis(d.data || []));
  }, [search, country, token]);

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <input style={S.searchInput} placeholder="🔍 Search universities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input style={S.searchInput} placeholder="🌍 Filter by country..." value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <div style={S.grid}>
        {unis.map((u) => (
          <div key={u._id} style={S.card}>
            <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #4361ee22, #7209b722)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "0.75rem" }}>🏫</div>
            <h3 style={{ margin: "0 0 0.25rem", color: "#1a1a2e", fontSize: "1rem", fontWeight: 600 }}>{u.name}</h3>
            <p style={{ margin: 0, color: "#888", fontSize: "0.85rem" }}>{u.city}, {u.country}</p>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {u.qsRanking && <span style={S.badge("#4361ee")}>QS #{u.qsRanking}</span>}
              {u.scholarshipAvailable && <span style={S.badge("#38a169")}>Scholarship</span>}
              {u.partnerType && <span style={S.badge("#7209b7")}>{u.partnerType}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Programs({ token }) {
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState({ country: "", field: "", degreeLevel: "", maxTuition: "" });

  useEffect(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    fetch(`${API}/api/programs?${p}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setPrograms(d.data || []));
  }, [filters, token]);

  const degreeBadgeColor = { bachelor: "#4361ee", master: "#7209b7", phd: "#f72585" };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { key: "country", placeholder: "🌍 Country" },
          { key: "field", placeholder: "📖 Field of Study" },
          { key: "maxTuition", placeholder: "💰 Max Tuition (USD)" },
        ].map(({ key, placeholder }) => (
          <input key={key} style={S.searchInput} placeholder={placeholder} value={filters[key]}
            onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))} />
        ))}
        <select style={S.searchInput} value={filters.degreeLevel}
          onChange={(e) => setFilters((f) => ({ ...f, degreeLevel: e.target.value }))}>
          <option value="">🎓 All Levels</option>
          <option value="bachelor">Bachelor</option>
          <option value="master">Master</option>
          <option value="phd">PhD</option>
        </select>
      </div>
      <div style={S.grid}>
        {programs.map((p) => (
          <div key={p._id} style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
              <h3 style={{ margin: 0, color: "#1a1a2e", fontSize: "0.95rem", fontWeight: 600, flex: 1 }}>{p.title}</h3>
              <span style={{ ...S.badge(degreeBadgeColor[p.degreeLevel] || "#888"), marginLeft: "0.5rem", whiteSpace: "nowrap" }}>{p.degreeLevel}</span>
            </div>
            <p style={{ margin: "0 0 0.25rem", color: "#666", fontSize: "0.85rem" }}>🏫 {p.universityName}</p>
            <p style={{ margin: "0 0 0.75rem", color: "#888", fontSize: "0.82rem" }}>📍 {p.city}, {p.country} · {p.field}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "#4361ee", fontSize: "1.1rem" }}>${p.tuitionFeeUsd?.toLocaleString()}<span style={{ fontSize: "0.75rem", color: "#aaa", fontWeight: 400 }}>/yr</span></span>
              {p.scholarshipAvailable && <span style={S.badge("#38a169")}>Scholarship</span>}
            </div>
            <p style={{ margin: "0.5rem 0 0", color: "#aaa", fontSize: "0.78rem" }}>Intakes: {p.intakes?.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendations({ token, user }) {
  const [recs, setRecs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadRecs() {
    setLoading(true);
    const res = await fetch(`${API}/api/recommendations/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRecs(data.data?.recommendations || []);
    setLoaded(true);
    setLoading(false);
  }

  const matchColor = (score) => score >= 70 ? "#38a169" : score >= 40 ? "#f6ad55" : "#fc8181";

  return (
    <div>
      {!loaded ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🤖</div>
          <h3 style={{ color: "#1a1a2e", marginBottom: "0.5rem" }}>AI-Powered Recommendations</h3>
          <p style={{ color: "#888", marginBottom: "2rem" }}>Get personalized program matches based on your profile, budget, and preferences.</p>
          <button onClick={loadRecs} disabled={loading}
            style={{ background: "linear-gradient(135deg, #4361ee, #7209b7)", color: "#fff", border: "none", padding: "0.9rem 2.5rem", borderRadius: "12px", fontSize: "1rem", fontWeight: 600, cursor: "pointer" }}>
            {loading ? "Analyzing your profile..." : "Get My Recommendations"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: "1.5rem", padding: "1rem 1.25rem", background: "linear-gradient(135deg, #4361ee11, #7209b711)", borderRadius: "12px", border: "1px solid #4361ee33" }}>
            <p style={{ margin: 0, color: "#4361ee", fontWeight: 600 }}>🎯 Found {recs.length} matches for your profile</p>
          </div>
          <div style={S.grid}>
            {recs.map((r) => (
              <div key={r._id} style={{ ...S.card, borderTop: `4px solid ${matchColor(r.matchScore)}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, color: "#1a1a2e", fontSize: "0.95rem", fontWeight: 600, flex: 1 }}>{r.title}</h3>
                  <div style={{ background: matchColor(r.matchScore), color: "#fff", borderRadius: "20px", padding: "0.2rem 0.7rem", fontSize: "0.8rem", fontWeight: 700, marginLeft: "0.5rem" }}>
                    {r.matchScore}%
                  </div>
                </div>
                <p style={{ margin: "0 0 0.25rem", color: "#666", fontSize: "0.85rem" }}>🏫 {r.universityName}</p>
                <p style={{ margin: "0 0 0.75rem", color: "#888", fontSize: "0.82rem" }}>📍 {r.country} · {r.degreeLevel} · {r.field}</p>
                <p style={{ fontWeight: 700, color: "#4361ee", fontSize: "1.05rem", margin: "0 0 0.75rem" }}>${r.tuitionFeeUsd?.toLocaleString()}/yr</p>
                <div>
                  {(r.reasons || []).map((reason) => (
                    <div key={reason} style={{ fontSize: "0.78rem", color: "#38a169", marginBottom: "0.2rem" }}>✓ {reason}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Applications({ token, user }) {
  const [apps, setApps] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ programId: "", intake: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });

  function loadApps() {
    fetch(`${API}/api/applications?studentId=${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setApps(d.data || []));
  }

  useEffect(() => {
    loadApps();
    fetch(`${API}/api/programs`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setPrograms(d.data || []));
  }, [token]);

  async function applyNow() {
    setMsg({ text: "", type: "" });
    const res = await fetch(`${API}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setMsg({ text: data.error?.message || JSON.stringify(data.error?.details) || "Error", type: "error" });
    setMsg({ text: "Application submitted successfully!", type: "success" });
    setForm({ programId: "", intake: "" });
    loadApps();
  }

  async function updateStatus(id, status) {
    await fetch(`${API}/api/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    loadApps();
  }

  const statusConfig = {
    draft: { color: "#718096", bg: "#f7fafc", next: [{ label: "Submit Application", status: "submitted" }] },
    submitted: { color: "#4361ee", bg: "#ebf4ff", next: [{ label: "Mark Under Review", status: "under-review" }] },
    "under-review": { color: "#f6ad55", bg: "#fffaf0", next: [{ label: "Offer Received", status: "offer-received" }, { label: "Rejected", status: "rejected" }] },
    "offer-received": { color: "#48bb78", bg: "#f0fff4", next: [{ label: "Start Visa Processing", status: "visa-processing" }] },
    "visa-processing": { color: "#0bc5ea", bg: "#e6fffa", next: [{ label: "Mark Enrolled", status: "enrolled" }] },
    enrolled: { color: "#38a169", bg: "#f0fff4", next: [] },
    rejected: { color: "#fc8181", bg: "#fff5f5", next: [] },
  };

  return (
    <div>
      <div style={S.panel}>
        <h3 style={{ ...S.panelTitle, marginBottom: "1.25rem" }}>Apply to a Program</h3>
        <select style={S.searchInput} value={form.programId}
          onChange={(e) => setForm({ ...form, programId: e.target.value })}>
          <option value="">Select a program...</option>
          {programs.map((p) => (
            <option key={p._id} value={p._id}>{p.title} — {p.universityName} ({p.country})</option>
          ))}
        </select>
        <input style={{ ...S.searchInput, marginTop: "0.75rem" }} placeholder="Intake (e.g. September, January)"
          value={form.intake} onChange={(e) => setForm({ ...form, intake: e.target.value })} />
        {msg.text && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", marginTop: "0.75rem", background: msg.type === "error" ? "#fff5f5" : "#f0fff4", color: msg.type === "error" ? "#c53030" : "#276749", fontSize: "0.9rem" }}>
            {msg.text}
          </div>
        )}
        <button onClick={applyNow}
          style={{ marginTop: "1rem", background: "linear-gradient(135deg, #4361ee, #7209b7)", color: "#fff", border: "none", padding: "0.8rem 2rem", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "0.95rem" }}>
          Apply Now
        </button>
      </div>

      <h3 style={{ ...S.panelTitle, marginTop: "2rem", marginBottom: "1rem" }}>My Applications ({apps.length})</h3>
      {apps.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📋</div>
          <p>No applications yet. Apply to a program above!</p>
        </div>
      )}
      {apps.map((a) => {
        const cfg = statusConfig[a.status] || { color: "#ccc", bg: "#fafafa", next: [] };
        return (
          <div key={a._id} style={{ background: cfg.bg, border: `1px solid ${cfg.color}33`, borderLeft: `4px solid ${cfg.color}`, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", color: "#1a1a2e", fontSize: "1rem" }}>{a.program?.title}</h3>
                <p style={{ margin: "0 0 0.1rem", color: "#666", fontSize: "0.85rem" }}>🏫 {a.university?.name} — {a.destinationCountry}</p>
                <p style={{ margin: 0, color: "#888", fontSize: "0.82rem" }}>📅 Intake: {a.intake}</p>
              </div>
              <span style={{ background: cfg.color, color: "#fff", borderRadius: "20px", padding: "0.25rem 0.9rem", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                {a.status}
              </span>
            </div>
            {cfg.next.length > 0 && (
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {cfg.next.map((n) => (
                  <button key={n.status} onClick={() => updateStatus(a._id, n.status)}
                    style={{ background: n.status === "rejected" ? "#fc8181" : "#4361ee", color: "#fff", border: "none", padding: "0.45rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.83rem", fontWeight: 500 }}>
                    {n.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const TABS = [
  { id: "Dashboard", icon: "📊" },
  { id: "Universities", icon: "🏫" },
  { id: "Programs", icon: "📚" },
  { id: "Recommendations", icon: "🤖" },
  { id: "Applications", icon: "📋" },
];

export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [tab, setTab] = useState("Dashboard");

  function handleLogin(u, t) { setUser(u); setToken(t); }
  function handleLogout() { localStorage.clear(); setUser(null); setToken(""); }

  if (!user || !token) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f0f2f8" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #4361ee, #7209b7)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🎓</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.15rem" }}>Waygood</span>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? "rgba(67,97,238,0.8)" : "transparent", color: tab === t.id ? "#fff" : "rgba(255,255,255,0.65)", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: tab === t.id ? 600 : 400, transition: "all 0.15s" }}>
              {t.icon} {t.id}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #4361ee, #7209b7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
              {user.fullName?.charAt(0)}
            </div>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.875rem" }}>{user.fullName}</span>
          </div>
          <button onClick={handleLogout}
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "0.4rem 0.9rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem" }}>
            Logout
          </button>
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ margin: 0, color: "#1a1a2e", fontSize: "1.5rem", fontWeight: 700 }}>
            {TABS.find((t) => t.id === tab)?.icon} {tab}
          </h2>
          <p style={{ margin: "0.25rem 0 0", color: "#888", fontSize: "0.875rem" }}>
            {tab === "Dashboard" && "Overview of your study abroad platform"}
            {tab === "Universities" && "Explore partner universities worldwide"}
            {tab === "Programs" && "Discover programs that match your goals"}
            {tab === "Recommendations" && "AI-powered program suggestions for you"}
            {tab === "Applications" && "Track and manage your applications"}
          </p>
        </div>
        {tab === "Dashboard" && <Dashboard token={token} />}
        {tab === "Universities" && <Universities token={token} />}
        {tab === "Programs" && <Programs token={token} />}
        {tab === "Recommendations" && <Recommendations token={token} user={user} />}
        {tab === "Applications" && <Applications token={token} user={user} />}
      </div>
    </div>
  );
}

const S = {
  loading: { padding: "3rem", textAlign: "center", color: "#888" },
  panel: { background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  panelTitle: { margin: "0 0 1rem", color: "#1a1a2e", fontSize: "1rem", fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1rem" },
  card: { background: "#fff", borderRadius: "16px", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "transform 0.15s", cursor: "default" },
  searchInput: { padding: "0.7rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "0.9rem", outline: "none", background: "#fff", flex: 1, minWidth: "160px", boxSizing: "border-box", width: "100%" },
  badge: (color) => ({ display: "inline-block", background: color + "18", color: color, padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600, border: `1px solid ${color}33` }),
};