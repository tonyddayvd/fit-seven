import React, { useState } from 'react';
import { useApp, DEFAULT_USERS } from '../context/AppContext';
import { Dumbbell, Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

const Login = () => {
  const { login, usersList } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const displayUsers = (usersList && usersList.length > 0) ? usersList : DEFAULT_USERS;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message || 'Credenciais inválidas. Tente novamente.');
      }
    }, 300);
  };

  const selectDemoUser = (demoEmail, demoPass = '123', autoLogin = false) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    if (autoLogin) {
      setLoading(true);
      setTimeout(() => {
        const res = login(demoEmail, demoPass);
        setLoading(false);
        if (!res.success) {
          setError(res.message || 'Credenciais inválidas');
        }
      }, 200);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'master':
        return { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', color: '#c084fc', label: '👑 MASTER' };
      case 'professor':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa', label: '👨‍🏫 PROF' };
      case 'aluno':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', color: '#4ade80', label: '🏋️ ALUNO' };
      default:
        return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', color: '#fb923c', label: '🏢 ACAD' };
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass">
        <div style={styles.logoContainer}>
          <img 
            src="/fit-seven/assets/logo.jpg" 
            alt="Fit Seven Logo" 
            style={styles.logoImg} 
          />
          <h1 style={styles.title}>Fit Seven</h1>
          <p style={styles.subtitle}>Plataforma Fitness Multi-Tenant B2B2C</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@fitseven.com"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha (Padrão: 123)</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn} className="btn-primary">
            {loading ? 'Entrando...' : 'Acessar Plataforma'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>⚡ Acesso Rápido para Testes (1 Clique)</span>
        </div>

        <div style={styles.demoSection}>
          {displayUsers.map((u) => {
            const roleStyle = getRoleBadgeStyle(u.role);
            return (
              <button
                key={u.id || u.email}
                type="button"
                onClick={() => selectDemoUser(u.email, u.password || '123', true)}
                style={{
                  ...styles.demoBadge,
                  backgroundColor: roleStyle.bg,
                  borderColor: roleStyle.border
                }}
                title={`Clique para entrar como ${u.name} (Senha: ${u.password || '123'})`}
              >
                <span style={{ ...styles.demoBadgeRole, color: roleStyle.color }}>
                  {roleStyle.label}
                </span>
                <span style={styles.demoBadgeName}>{u.name}</span>
                <span style={styles.demoBadgeEmail}>{u.email}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '90vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 32px',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--glass-border)',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
    textAlign: 'center',
  },
  logoImg: {
    width: '120px',
    height: '120px',
    borderRadius: '20px',
    objectFit: 'cover',
    marginBottom: '16px',
    boxShadow: '0 0 25px rgba(139,92,246,0.35), 0 8px 24px rgba(0,0,0,0.4)',
    border: '1px solid rgba(139,92,246,0.3)',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    letterSpacing: '-1px',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  errorAlert: {
    backgroundColor: 'var(--status-danger-bg)',
    color: 'var(--status-danger)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    animation: 'fadeIn 0.2s ease-out',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 42px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: '24px 0 16px 0',
  },
  dividerText: {
    width: '100%',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  demoSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  demoBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flex: '1 1 calc(50% - 8px)',
    maxWidth: '180px',
    textAlign: 'center',
  },
  demoBadgeRole: {
    fontSize: '0.62rem',
    fontWeight: '800',
    letterSpacing: '0.5px',
    marginBottom: '2px'
  },
  demoBadgeName: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '150px',
  },
  demoBadgeEmail: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '150px',
    marginTop: '1px'
  }
};

export default Login;
