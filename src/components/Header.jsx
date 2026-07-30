import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, LogOut, Dumbbell, ShieldAlert } from 'lucide-react';

const Header = () => {
  const { theme, toggleTheme, user, activeRole, activeTenant, logout, bypassRole } = useApp();

  return (
    <header className="glass header-container" style={styles.header}>
      <div style={styles.logoSection}>
        <img 
          src="/fit-seven/assets/logo.jpg" 
          alt="Fit Seven" 
          style={styles.logoImg} 
        />
        <div>
          <h1 style={styles.title}>Fit Seven</h1>
          <span style={styles.tenantBadge}>
            {activeTenant.name}
          </span>
        </div>
      </div>

      <div style={styles.rightSection}>
        {user?.role === 'master' && (
          <div style={styles.masterBypassBadge}>
            <ShieldAlert size={16} />
            <span>MODO MASTER {bypassRole ? `(SIMULANDO: ${bypassRole.toUpperCase()})` : '(ORIGINAL)'}</span>
          </div>
        )}

        <button 
          onClick={toggleTheme} 
          style={styles.iconBtn} 
          title={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
          className="btn-secondary"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name}</span>
          <span style={styles.userRole}>
            {activeRole === 'master' ? 'Master Admin' : activeRole === 'estabelecimento' ? 'Academia' : activeRole === 'professor' ? 'Professor' : 'Aluno'}
          </span>
        </div>

        <button 
          onClick={logout} 
          style={{ ...styles.iconBtn, ...styles.logoutBtn }} 
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
    animation: 'fadeIn 0.5s ease-out',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoImg: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: '1px solid rgba(139,92,246,0.3)',
    objectFit: 'cover',
    boxShadow: '0 0 10px rgba(139,92,246,0.2)',
    animation: 'pulse-slow 3s infinite ease-in-out',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    lineHeight: '1.1',
  },
  tenantBadge: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'var(--secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  rightSection: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px',
  },
  masterBypassBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  logoutBtn: {
    color: 'var(--status-danger)',
    backgroundColor: 'var(--status-danger-bg)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  }
};

export default Header;
