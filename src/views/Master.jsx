import React, { useState } from 'react';
import { useApp, MOCK_TENANTS } from '../context/AppContext';
import { 
  ShieldAlert, 
  Database, 
  Server, 
  Key, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  Cpu, 
  ThumbsUp, 
  Activity, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const TABLES_SCHEMA = [
  { 
    name: 'tenants', 
    desc: 'Tabela global de estabelecimentos/academias parceiras.',
    columns: ['id (PK)', 'name', 'subdomain', 'status', 'created_at'],
    hasTenantId: false,
    isGlobal: true 
  },
  { 
    name: 'users', 
    desc: 'Usuários do sistema (Administradores, Professores e Alunos).',
    columns: ['id (PK)', 'tenant_id (FK)', 'name', 'email', 'password_hash', 'role', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'alunos', 
    desc: 'Perfis detalhados dos alunos matriculados.',
    columns: ['id (PK)', 'tenant_id (FK)', 'user_id (FK)', 'phone', 'birth_date', 'status', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'professores', 
    desc: 'Perfis detalhados de instrutores e personal trainers.',
    columns: ['id (PK)', 'tenant_id (FK)', 'user_id (FK)', 'specialization', 'cref', 'status', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'exercicios', 
    desc: 'Catálogo de exercícios cadastrados (global ou customizado por academia).',
    columns: ['id (PK)', 'tenant_id (FK)', 'name', 'category', 'description', 'video_url', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'treinos', 
    desc: 'Fichas de treinos prescritas aos alunos.',
    columns: ['id (PK)', 'tenant_id (FK)', 'aluno_id (FK)', 'professor_id (FK)', 'name', 'description', 'status', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'treino_exercicios', 
    desc: 'Vínculo e configurações específicas de cada exercício contido em um treino.',
    columns: ['id (PK)', 'tenant_id (FK)', 'treino_id (FK)', 'exercicio_id (FK)', 'series', 'repeticoes', 'carga', 'descanso', 'ordem'],
    hasTenantId: true 
  },
  { 
    name: 'pagamentos', 
    desc: 'Controle de mensalidades e transações financeiras dos alunos.',
    columns: ['id (PK)', 'tenant_id (FK)', 'aluno_id (FK)', 'amount', 'due_date', 'payment_date', 'status', 'payment_method', 'created_at'],
    hasTenantId: true 
  }
];

const Master = () => {
  const { activeTenant, pendingEvaluations, approveAndPublishWorkout } = useApp();
  const [selectedTable, setSelectedTable] = useState(TABLES_SCHEMA[1]); // Inicia em 'users'
  const [selectedEval, setSelectedEval] = useState(null);

  // Monitora alterações nas avaliações pendentes em tempo real (simulação de polling/busca ativa no BD)
  React.useEffect(() => {
    if (selectedEval) {
      const stillPending = pendingEvaluations.find(ev => ev.id === selectedEval.id);
      if (!stillPending) {
        setSelectedEval(null);
      } else {
        setSelectedEval(stillPending);
      }
    }
  }, [pendingEvaluations, selectedEval]);

  const handleApprove = (id) => {
    const success = approveAndPublishWorkout(id);
    if (success) {
      alert('Treino gerado por IA aprovado, publicado e injetado no BD com sucesso!');
      setSelectedEval(null);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      
      {/* Welcome banner */}
      <div style={styles.welcomeCard} className="glass">
        <div style={styles.cardHeader}>
          <ShieldAlert size={28} className="text-gradient" />
          <div>
            <h2 style={styles.title}>Painel MASTER / Professor</h2>
            <p style={styles.subtitle}>Gestão de estabelecimentos, auditoria e aprovação de treinos baseados em IA</p>
          </div>
        </div>
      </div>

      {/* Grid Principal de Conteúdo */}
      <div style={styles.mainGrid}>
        
        {/* Lado Esquerdo: Aprovações Pendentes do Fluxo Híbrido */}
        <div style={{ ...styles.panelCard, flex: '1 1 500px' }} className="glass">
          <div style={styles.panelHeader}>
            <Cpu size={20} className="text-gradient" />
            <h3 style={styles.panelTitle}>Aprovações Pendentes (Fluxo Híbrido IA)</h3>
          </div>
          
          {pendingEvaluations.length === 0 ? (
            <div style={styles.emptyBox}>
              <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
              <p>Nenhuma avaliação pendente de análise ou aprovação no momento.</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Envie uma avaliação física na aba <strong>Medidas</strong> do Aluno para preencher esta fila.
              </span>
            </div>
          ) : (
            <div style={styles.evalQueue}>
              {pendingEvaluations.map(ev => {
                const isSelected = selectedEval?.id === ev.id;
                return (
                  <div 
                    key={ev.id} 
                    style={{
                      ...styles.evalCard,
                      ...(isSelected ? styles.evalCardActive : {})
                    }}
                    onClick={() => setSelectedEval(ev)}
                  >
                    <div style={styles.evalCardLeft}>
                      <span style={styles.evalStudentName}>{ev.userName}</span>
                      <span style={styles.evalMeta}>Submetido em: {ev.date} • Tenant: <strong>{ev.tenantId}</strong></span>
                    </div>
                    <span style={styles.pendingBadge}>Pendente</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Painel de Análise da IA se houver uma avaliação selecionada */}
          {selectedEval && (
            <div style={styles.aiReviewContainer} className="animate-fade-in">
              <div style={styles.aiReviewHeader}>
                <h4 style={styles.reviewTitle}>Análise e Sugestão de Treino - {selectedEval.userName}</h4>
                <button onClick={() => setSelectedEval(null)} style={styles.closeBtn}>Fechar</button>
              </div>

              {/* Informações Fisiológicas da Avaliação */}
              <div style={styles.evalDetailsBox}>
                <h5 style={styles.detailsBoxTitle}>Fisiologia & Objetivos Coletados:</h5>
                <div style={styles.detailsGrid}>
                  <span><strong>Objetivo:</strong> {selectedEval.formData.objetivo.toUpperCase()}</span>
                  <span><strong>Frequência:</strong> {selectedEval.formData.frequenciaSemanal}x/semana</span>
                  <span><strong>Peso/Altura:</strong> {selectedEval.formData.peso}kg / {selectedEval.formData.altura}cm</span>
                  <span><strong>Idade:</strong> {selectedEval.formData.idade || 'N/I'} anos</span>
                  <span><strong>Sexo Biológico:</strong> {selectedEval.formData.sexoBiologico === 'masculino' ? 'Masculino' : 'Feminino'}</span>
                  <span><strong>Nível:</strong> {selectedEval.formData.nivelExperiencia}</span>
                </div>
                {selectedEval.formData.parqCardiaco === 'sim' && (
                  <div style={styles.warningAlertRow}>
                    <AlertCircle size={16} />
                    <span>Atenção: Aluno reportou histórico cardíaco no PAR-Q!</span>
                  </div>
                )}
              </div>

              {/* Divisão sugerida de Treino pela IA */}
              <div style={styles.suggestedWorkoutsList}>
                <h5 style={styles.detailsBoxTitle}>Divisão Gerada pelo Motor de IA:</h5>
                
                {selectedEval.aiSuggestedWorkout.map((block, idx) => (
                  <div key={idx} style={styles.workoutBlock}>
                    <div style={styles.blockHeader}>
                      <span style={styles.blockTitle}>{block.title}</span>
                      <span style={styles.blockCount}>{block.exercises.length} Exs</span>
                    </div>
                    <div style={styles.blockExercises}>
                      {block.exercises.map((ex, exIdx) => (
                        <div key={exIdx} style={styles.blockExerciseItem}>
                          <span>• {ex.name} ({ex.reps})</span>
                          <span style={styles.blockLoad}>{ex.load}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ação de Publicar */}
              <div style={styles.publishBox}>
                <button 
                  onClick={() => handleApprove(selectedEval.id)} 
                  style={styles.approveBtn} 
                  className="btn-primary"
                >
                  <ThumbsUp size={16} />
                  [Aprovar e Publicar no Banco]
                </button>
                <span style={styles.publishHint}>
                  A aprovação injetará essa rotina diretamente no tenant_id e user_id do aluno, tornando-a visível no ambiente dele instantaneamente.
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Lado Direito: Tabelas do BD & Tenants */}
        <div style={{ ...styles.panelCard, flex: '1 1 400px' }} className="glass">
          
          {/* Lista de Tenants */}
          <div style={{ marginBottom: '24px' }}>
            <div style={styles.panelHeader}>
              <Server size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitle}>Academias (Tenants)</h3>
            </div>
            <div style={styles.tenantList}>
              {Object.keys(MOCK_TENANTS).map(key => {
                const t = MOCK_TENANTS[key];
                return (
                  <div key={t.id} style={styles.tenantItem}>
                    <div>
                      <span style={styles.tenantName}>{t.name}</span>
                      <span style={styles.tenantSubdomain}>subdomain: <strong>{t.subdomain}</strong></span>
                    </div>
                    <span style={{ 
                      ...styles.statusTag, 
                      backgroundColor: t.id === 'master' ? 'rgba(139, 92, 246, 0.15)' : 'var(--status-success-bg)',
                      color: t.id === 'master' ? 'var(--primary)' : 'var(--status-success)'
                    }}>
                      {t.id === 'master' ? 'System Root' : 'Active Tenant'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspetor de Banco de Dados */}
          <div>
            <div style={styles.panelHeader}>
              <Database size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={styles.panelTitle}>Auditoria de Isolamento</h3>
            </div>
            
            <div style={styles.tableSelectorContainer}>
              {TABLES_SCHEMA.map(tbl => (
                <button 
                  key={tbl.name} 
                  onClick={() => setSelectedTable(tbl)}
                  style={{
                    ...styles.tableTab,
                    ...(selectedTable.name === tbl.name ? styles.tableTabActive : {})
                  }}
                >
                  {tbl.name}
                  {tbl.hasTenantId ? (
                    <ShieldCheck size={12} style={{ color: 'var(--status-success)', marginLeft: '4px' }} />
                  ) : null}
                </button>
              ))}
            </div>

            {selectedTable && (
              <div style={styles.schemaViewer}>
                <div style={styles.schemaHeader}>
                  <h4 style={styles.schemaTitle}>Tabela: {selectedTable.name}</h4>
                  {selectedTable.hasTenantId ? (
                    <span style={styles.secureBadge}>Isolamento Ativo</span>
                  ) : (
                    <span style={styles.globalBadge}>Global</span>
                  )}
                </div>
                <p style={styles.schemaDesc}>{selectedTable.desc}</p>
                <div style={styles.columnsGrid}>
                  {selectedTable.columns.map(col => {
                    const isTenantId = col.includes('tenant_id');
                    return (
                      <span 
                        key={col} 
                        style={{
                          ...styles.columnItem,
                          ...(isTenantId ? styles.columnItemTenant : {})
                        }}
                      >
                        {col}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
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
  mainGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
  },
  panelCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  evalQueue: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  evalCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  evalCardActive: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  evalCardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  evalStudentName: {
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  evalMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  pendingBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'var(--status-warning-bg)',
    color: 'var(--status-warning)',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  aiReviewContainer: {
    marginTop: '20px',
    borderTop: '2px dashed var(--border-color)',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  aiReviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewTitle: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  evalDetailsBox: {
    padding: '14px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  detailsBoxTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '8px',
    fontSize: '0.8rem',
  },
  warningAlertRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--status-danger)',
    backgroundColor: 'var(--status-danger-bg)',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  suggestedWorkoutsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  workoutBlock: {
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    padding: '12px',
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '4px',
  },
  blockTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  blockCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  blockExercises: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  blockExerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  blockLoad: {
    color: 'var(--text-secondary)',
  },
  publishBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid var(--secondary)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  approveBtn: {
    width: '100%',
    padding: '12px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  publishHint: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  // Lado Direito - BD & Tenants
  tenantList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tenantItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
  },
  tenantName: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  tenantSubdomain: {
    display: 'block',
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
  },
  statusTag: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '3px 6px',
    borderRadius: 'var(--radius-full)',
  },
  tableSelectorContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
  },
  tableTab: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableTabActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    borderColor: 'var(--primary)',
  },
  schemaViewer: {
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
  },
  schemaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  schemaTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  secureBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--status-success)',
    backgroundColor: 'var(--status-success-bg)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  globalBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  schemaDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  columnsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  columnItem: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  columnItemTenant: {
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    fontWeight: '700',
  }
};

export default Master;
