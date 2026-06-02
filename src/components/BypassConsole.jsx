import React, { useState } from 'react';
import { useApp, MOCK_TENANTS } from '../context/AppContext';
import { Shield, Sparkles, RefreshCw } from 'lucide-react';

const BypassConsole = () => {
  const { user, applyBypass, bypassRole, bypassTenantId } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Só renderiza se o usuário original logado for master
  if (user?.role !== 'master') return null;

  return (
    <div style={{ ...styles.container, ...(isOpen ? styles.openContainer : {}) }} className="glass">
      <button onClick={() => setIsOpen(!isOpen)} style={styles.trigger} className="btn-primary">
        <Shield size={18} />
        {isOpen ? 'Fechar Painel MASTER' : 'MASTER Bypass'}
      </button>

      {isOpen && (
        <div style={styles.content}>
          <div style={styles.header}>
            <Sparkles size={16} className="text-gradient" />
            <h3 style={styles.title}>Simulador Multi-Tenant</h3>
          </div>
          
          <div style={styles.section}>
            <label style={styles.label}>Simular Ambiente (Rota):</label>
            <select 
              value={bypassRole || ''} 
              onChange={(e) => applyBypass(e.target.value || null, bypassTenantId)}
              style={styles.select}
            >
              <option value="">MASTER (Visualização Padrão)</option>
              <option value="estabelecimento">Estabelecimento (Academia)</option>
              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Simular Academia (Tenant):</label>
            <select 
              value={bypassTenantId || ''} 
              onChange={(e) => applyBypass(bypassRole, e.target.value || null)}
              style={styles.select}
            >
              <option value="">Tenant do Master (Corporate)</option>
              {Object.keys(MOCK_TENANTS).map(key => (
                <option key={MOCK_TENANTS[key].id} value={MOCK_TENANTS[key].id}>
                  {MOCK_TENANTS[key].name} ({MOCK_TENANTS[key].subdomain})
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => applyBypass(null, null)} 
            style={styles.resetBtn}
            className="btn btn-secondary"
          >
            <RefreshCw size={14} />
            Resetar Bypass
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '100px',
    right: '16px',
    zIndex: 9999,
    borderRadius: 'var(--radius-lg)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
    border: '1px solid var(--primary)',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    maxWidth: '300px',
  },
  openContainer: {
    padding: '16px',
    width: '280px',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '10px 16px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    width: '100%',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    animation: 'fadeIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  select: {
    padding: '8px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  },
  resetBtn: {
    padding: '8px',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
  }
};

export default BypassConsole;
