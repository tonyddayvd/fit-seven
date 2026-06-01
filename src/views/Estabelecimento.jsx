import React from 'react';
import { useApp, MOCK_USERS } from '../context/AppContext';
import { Users, UserCheck, TrendingUp, DollarSign, Dumbbell } from 'lucide-react';

const Estabelecimento = () => {
  const { activeTenantId, activeTenant } = useApp();

  // Filtrar dados baseados no activeTenantId para demonstrar o isolamento de dados
  const activeStaff = MOCK_USERS.filter(u => u.tenantId === activeTenantId && u.role === 'professor');
  const activeStudents = MOCK_USERS.filter(u => u.tenantId === activeTenantId && u.role === 'aluno');

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.welcomeCard} className="glass">
        <h2 style={styles.title}>Painel de Gestão: {activeTenant.name}</h2>
        <p style={styles.subtitle}>ID do Tenant (Isolado): <code style={styles.code}>{activeTenantId}</code></p>
      </div>

      <div style={styles.grid}>
        {/* KPI 1 */}
        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <Users size={24} className="text-gradient" />
            <span style={styles.cardTitle}>Total Alunos</span>
          </div>
          <span style={styles.kpiValue}>{activeStudents.length}</span>
          <span style={styles.kpiSub}>Ativos neste Tenant</span>
        </div>

        {/* KPI 2 */}
        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <UserCheck size={24} style={{ color: 'var(--secondary)' }} />
            <span style={styles.cardTitle}>Professores</span>
          </div>
          <span style={styles.kpiValue}>{activeStaff.length}</span>
          <span style={styles.kpiSub}>Profissionais vinculados</span>
        </div>

        {/* KPI 3 */}
        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <TrendingUp size={24} style={{ color: 'var(--status-success)' }} />
            <span style={styles.cardTitle}>Faturamento Estimado</span>
          </div>
          <span style={styles.kpiValue}>R$ {(activeStudents.length * 119.90).toFixed(2)}</span>
          <span style={styles.kpiSub}>Mensalidade base R$ 119,90</span>
        </div>
      </div>

      <div style={styles.sectionGrid}>
        <div style={styles.listCard} className="glass">
          <h3 style={styles.sectionTitle}>Corpo Docente (Professores)</h3>
          {activeStaff.length === 0 ? (
            <p style={styles.emptyText}>Nenhum professor cadastrado para este estabelecimento.</p>
          ) : (
            <ul style={styles.list}>
              {activeStaff.map(p => (
                <li key={p.id} style={styles.listItem}>
                  <div>
                    <span style={styles.itemName}>{p.name}</span>
                    <span style={styles.itemEmail}>{p.email}</span>
                  </div>
                  <span style={styles.badge}>CREF Ativo</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={styles.listCard} className="glass">
          <h3 style={styles.sectionTitle}>Quadro de Alunos</h3>
          {activeStudents.length === 0 ? (
            <p style={styles.emptyText}>Nenhum aluno matriculado para este estabelecimento.</p>
          ) : (
            <ul style={styles.list}>
              {activeStudents.map(a => (
                <li key={a.id} style={styles.listItem}>
                  <div>
                    <span style={styles.itemName}>{a.name}</span>
                    <span style={styles.itemEmail}>{a.email}</span>
                  </div>
                  <span style={{ ...styles.badge, ...styles.badgeGreen }}>Matriculado</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  welcomeCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  code: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  card: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: '1.2',
  },
  kpiSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px',
  },
  listCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '20px 0',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
  },
  itemName: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  itemEmail: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    backgroundColor: 'var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
  },
  badgeGreen: {
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
  }
};

export default Estabelecimento;
