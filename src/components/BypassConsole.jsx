import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Shield, Sparkles, RefreshCw, X } from "lucide-react";

const BypassConsole = () => {
  const { user, applyBypass, bypassRole, bypassTenantId, tenants } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (user?.role !== "master") return null;

  const isActive = !!(bypassRole || bypassTenantId);

  return (
    <>
      {isOpen && (
        <div style={styles.panel} className="glass">
          <div style={styles.panelHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={15} style={{ color: "var(--primary-color)" }} />
              <span style={styles.panelTitle}>Simulador Multi-Tenant</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <X size={15} />
            </button>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Simular Ambiente (Rota):</label>
            <select
              value={bypassRole || ""}
              onChange={(e) => applyBypass(e.target.value || null, bypassTenantId)}
              style={styles.select}
            >
              <option value="">MASTER (Padrao)</option>
              <option value="estabelecimento">Academia / Estabelecimento</option>
              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Simular Academia (Tenant):</label>
            <select
              value={bypassTenantId || ""}
              onChange={(e) => applyBypass(bypassRole, e.target.value || null)}
              style={styles.select}
            >
              <option value="">Tenant do Master (Corporate)</option>
              {Object.keys(tenants || {}).map(key => (
                <option key={tenants[key].id} value={tenants[key].id}>
                  {tenants[key].name} ({tenants[key].subdomain})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => { applyBypass(null, null); setIsOpen(false); }}
            style={styles.resetBtn}
          >
            <RefreshCw size={13} />
            Resetar Bypass
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(o => !o)}
        style={{ ...styles.fab, ...(isActive ? styles.fabActive : {}) }}
        title={isOpen ? "Fechar painel Master" : "Master Bypass"}
      >
        <Shield size={17} />
        {isActive && <span style={styles.activeDot} />}
      </button>
    </>
  );
};

const styles = {
  fab: {
    position: "fixed",
    bottom: "100px",
    right: "16px",
    zIndex: 10000,
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid var(--primary-color, #8b5cf6)",
    background: "var(--bg-secondary, #1e293b)",
    color: "var(--primary-color, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
    transition: "all 0.2s ease",
    opacity: 0.75,
  },
  fabActive: {
    background: "var(--primary-color, #8b5cf6)",
    color: "#fff",
    opacity: 1,
  },
  activeDot: {
    position: "absolute",
    top: "3px",
    right: "3px",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    border: "1.5px solid var(--bg-secondary, #1e293b)",
  },
  panel: {
    position: "fixed",
    bottom: "152px",
    right: "16px",
    zIndex: 9999,
    width: "268px",
    borderRadius: "14px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: "8px",
  },
  panelTitle: {
    fontSize: "0.88rem",
    fontWeight: "700",
    color: "var(--text-primary)",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "0.72rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  select: {
    padding: "7px 10px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    fontSize: "0.83rem",
    outline: "none",
    cursor: "pointer",
    width: "100%",
  },
  resetBtn: {
    padding: "7px",
    fontSize: "0.78rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    background: "rgba(239,68,68,0.08)",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: "600",
  }
};

export default BypassConsole;
