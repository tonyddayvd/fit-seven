import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Dumbbell, Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, usersList } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Pequena simulação de delay para micro-animação de loading
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 600);
  };

  const selectDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('123');
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass">
        <div style={styles.logoContainer}>
          <div style={styles.iconCircle}>
            <Dumbbell className="text-gradient" size={32} />
          </div>
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
                placeholder="nome@academia.com"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha</label>
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
          <span style={styles.dividerText}>Acesso Rápido para Testes</span>
        </div>

        <div style={styles.demoSection}>
          {usersList && usersList.map((u) => (
            <button
              key={u.id}
              onClick={() => selectDemoUser(u.email)}
              style={styles.demoBadge}
              title={`Senha: 123 | Tenant: ${u.tenantId}`}
            >
              <span style={styles.demoBadgeRole}>
                {u.role.toUpperCase()}
              </span>
              <span style={styles.demoBadgeName}>{u.name?.split(' ')[0]}</span>
            </button>
          ))}
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
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
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
    backgroundColor: 'var(--bg-secondary)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    flex: '1 1 calc(33.33% - 8px)',
    maxWidth: '120px',
  },
  demoBadgeRole: {
    fontSize: '0.6rem',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '0.5px',
  },
  demoBadgeName: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '90px',
  }
};

export default Login;
