import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Dumbbell, 
  PlusCircle, 
  CheckCircle, 
  List, 
  User, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Brain, 
  Activity, 
  Award, 
  Key,
  Shield,
  ClipboardList
} from 'lucide-react';

const INITIAL_EXERCISES = [
  { id: 'e1', name: 'Supino Reto com Barra', category: 'Peito', reps: '4x10' },
  { id: 'e2', name: 'Agachamento Livre', category: 'Pernas', reps: '4x12' },
  { id: 'e3', name: 'Puxada Alta na Polia', category: 'Costas', reps: '3x12' },
  { id: 'e4', name: 'Rosca Direta Biceps', category: 'Braços', reps: '3x15' },
];

const Professor = () => {
  const { 
    user, 
    usersList, 
    tenants, 
    addUser, 
    updateUser, 
    deleteUser, 
    loginAsUser, 
    activeTenantId, 
    activeTenant,
    pendingEvaluations,
    approveAndPublishWorkout
  } = useApp();

  const [activeTab, setActiveTab] = useState('alunos'); // 'alunos' ou 'prescribe'
  const [successMsg, setSuccessMsg] = useState('');
  
  // Prescrição states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);

  // Alunos CRUD states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '123' });

  // Filtrar apenas alunos do mesmo tenant (seja o ID do professor ou o tenantId do professor se ele estiver em uma academia)
  const myStudents = usersList.filter(u => u.role === 'aluno' && (u.tenantId === user.id || u.tenantId === user.tenantId));

  // Alunos cadastrados especificamente pelo professor sob o seu limite
  const ownStudentsCount = usersList.filter(u => u.role === 'aluno' && u.tenantId === user.id).length;
  const maxLimit = user.limiteAlunos || 10;

  const handleAddExercise = (exercise) => {
    if (selectedExercises.some(e => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter(e => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handlePrescribe = (e) => {
    e.preventDefault();
    if (!selectedStudent || !workoutName || selectedExercises.length === 0) {
      alert('Preencha todos os campos e selecione ao menos um exercício.');
      return;
    }

    const studentName = myStudents.find(s => s.id === selectedStudent)?.name;

    setSuccessMsg(`Treino "${workoutName}" prescrito com sucesso para ${studentName}!`);
    setTimeout(() => {
      setSuccessMsg('');
      setWorkoutName('');
      setSelectedStudent('');
      setSelectedExercises([]);
    }, 4000);
  };

  // CRUD Handlers
  const openAddStudent = () => {
    // Checagem de limite antes de abrir ou cadastrar
    if (ownStudentsCount >= maxLimit) {
      alert('Limite do seu plano atingido. Faça um upgrade para adicionar mais alunos.');
      return;
    }
    setStudentForm({ name: '', email: '', password: '123' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditStudent = (student) => {
    setStudentForm({
      name: student.name,
      email: student.email,
      password: student.password || '123'
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, studentForm);
        alert('Cadastro do aluno atualizado com sucesso!');
        setShowForm(false);
      } else {
        // Tenta cadastrar. addUser já fará o check final de limite
        await addUser({
          ...studentForm,
          role: 'aluno',
          tenantId: user.id // Vinculado diretamente a este professor
        });
        alert('Novo aluno cadastrado com sucesso!');
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar aluno: ' + (err.message || err.details || 'Verifique os dados.'));
    }
  };

  const handleDeleteStudent = (id) => {
    if (confirm('Deseja realmente remover este aluno?')) {
      deleteUser(id);
      alert('Aluno removido.');
    }
  };

  const handleResetPassword = (id) => {
    const newPass = prompt('Digite a nova senha para o aluno:', '123456');
    if (newPass) {
      updateUser(id, { password: newPass });
      alert('Senha resetada com sucesso!');
    }
  };

  const handleStartPrescription = (studentId) => {
    setSelectedStudent(studentId);
    setWorkoutName('Treino Prescrito Personalizado');
    setActiveTab('prescribe');
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Cabeçalho do Painel */}
      <div style={styles.headerCard} className="glass">
        <div style={styles.headerTitleRow}>
          <div>
            <h2 style={styles.title}>Painel do Professor</h2>
            <p style={styles.subtitle}>
              Professor: <strong>{user.name}</strong> • Plano: <span style={styles.planBadge}>{user.plano || 'Básico'}</span>
            </p>
          </div>
          {/* Barra de progresso do limite de alunos */}
          <div style={styles.limitCard}>
            <div style={styles.limitMeta}>
              <span>Alunos do Plano:</span>
              <strong style={{ color: ownStudentsCount >= maxLimit ? 'var(--status-danger)' : 'var(--status-success)' }}>
                {ownStudentsCount} / {maxLimit}
              </strong>
            </div>
            <div style={styles.progressBarBg}>
              <div 
                style={{ 
                  ...styles.progressBarFill, 
                  width: `${Math.min((ownStudentsCount / maxLimit) * 100, 100)}%`,
                  backgroundColor: ownStudentsCount >= maxLimit ? 'var(--status-danger)' : 'var(--primary)'
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={styles.successAlert}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Abas de Navegação do Professor */}
      <div style={styles.tabsContainer}>
        <button 
          onClick={() => { setActiveTab('alunos'); setShowForm(false); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'alunos' ? styles.tabButtonActive : {})
          }}
        >
          <Users size={16} />
          Meus Alunos
        </button>
        <button 
          onClick={() => { setActiveTab('prescribe'); setShowForm(false); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'prescribe' ? styles.tabButtonActive : {})
          }}
        >
          <Dumbbell size={16} />
          Prescrever Treino
        </button>
      </div>

      {/* CONTEÚDO DA ABA DE MEUS ALUNOS */}
      {activeTab === 'alunos' && (
        <div className="animate-fade-in">
          {showForm ? (
            <form onSubmit={handleSaveStudent} style={styles.formCard} className="glass">
              <h3 style={styles.sectionTitle}>
                {editingId ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
              </h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                    style={styles.input}
                    placeholder="Ex: Carlos Daniel"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>E-mail (Login):</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    style={styles.input}
                    placeholder="Ex: carlos@email.com"
                  />
                </div>
                {!editingId && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Senha Inicial:</label>
                    <input
                      type="password"
                      required
                      value={studentForm.password}
                      onChange={(e) => setStudentForm(prev => ({ ...prev, password: e.target.value }))}
                      style={styles.input}
                    />
                  </div>
                )}
              </div>
              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn} className="btn-primary">
                  Salvar Cadastro
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.listCard} className="glass">
              <div style={styles.tableHeader}>
                <h3 style={styles.sectionTitle}>Alunos Ativos</h3>
                <button onClick={openAddStudent} style={styles.addBtn} className="btn-primary">
                  <Plus size={16} /> Cadastrar Novo Aluno
                </button>
              </div>

              {myStudents.length === 0 ? (
                <div style={styles.emptyBox}>
                  <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p>Você não possui alunos cadastrados no momento.</p>
                  <span>Clique no botão acima para adicionar seu primeiro aluno!</span>
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableCellHeader}>Nome</th>
                        <th style={styles.tableCellHeader}>E-mail</th>
                        <th style={styles.tableCellHeader}>Vínculo (Tenant)</th>
                        <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações de Gestão / Fichas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myStudents.map(student => {
                        const isDirectStudent = student.tenantId === user.id;
                        return (
                          <tr key={student.id} style={styles.tableRow}>
                            <td style={styles.tableCell}>
                              <strong>{student.name}</strong>
                              {student.isVip && (
                                <span style={styles.vipBadge}>VIP</span>
                              )}
                            </td>
                            <td style={styles.tableCell}>{student.email}</td>
                            <td style={styles.tableCell}>
                              <span style={styles.tenantBadge}>
                                {isDirectStudent ? 'Direto (Você)' : activeTenant.name}
                              </span>
                            </td>
                            <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                              <div style={styles.actionsGroup}>
                                <button 
                                  onClick={() => loginAsUser(student)} 
                                  style={{ ...styles.actionBtn, color: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.1)' }} 
                                  title="Abrir Avaliação Física / Ver Painel"
                                >
                                  <Activity size={14} style={{ marginRight: '4px' }} /> Avaliação Física
                                </button>
                                <button 
                                  onClick={() => handleStartPrescription(student.id)} 
                                  style={{ ...styles.actionBtn, color: '#a78bfa', backgroundColor: 'rgba(167, 139, 250, 0.1)' }} 
                                  title="Iniciar Sugestão de Treino"
                                >
                                  <Brain size={14} style={{ marginRight: '4px' }} /> Prescrever/IA
                                </button>
                                <button 
                                  onClick={() => openEditStudent(student)} 
                                  style={styles.iconBtn} 
                                  title="Editar Aluno"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button 
                                  onClick={() => handleResetPassword(student.id)} 
                                  style={styles.iconBtn} 
                                  title="Resetar Senha"
                                >
                                  <Key size={13} />
                                </button>
                                {isDirectStudent && (
                                  <button 
                                    onClick={() => handleDeleteStudent(student.id)} 
                                    style={{ ...styles.iconBtn, color: 'var(--status-danger)' }} 
                                    title="Excluir Aluno"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA DE PRESCREVER TREINOS */}
      {activeTab === 'prescribe' && (
        <div style={styles.grid}>
          {/* Formulário de Prescrição */}
          <div style={styles.formCard} className="glass animate-fade-in">
            <h3 style={styles.sectionTitle}>Prescrever Novo Treino</h3>
            <form onSubmit={handlePrescribe} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Selecionar Aluno:</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  style={styles.select}
                  required
                >
                  <option value="">Selecione o Aluno...</option>
                  {myStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nome do Treino:</label>
                <input
                  type="text"
                  placeholder="Ex: Treino A - Hipertrofia Peitoral"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Exercícios Selecionados ({selectedExercises.length}):</label>
                {selectedExercises.length === 0 ? (
                  <p style={styles.hint}>Selecione exercícios na lista ao lado.</p>
                ) : (
                  <div style={styles.badgeContainer}>
                    {selectedExercises.map(e => (
                      <span key={e.id} style={styles.exerciseBadge}>
                        {e.name} ({e.reps})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" style={styles.submitBtn} className="btn-primary">
                Gravar Treino com tenant_id
              </button>
            </form>
          </div>

          {/* Lista de Exercícios Disponíveis */}
          <div style={styles.listCard} className="glass animate-fade-in">
            <h3 style={styles.sectionTitle}>Biblioteca de Exercícios</h3>
            <p style={styles.listSubtitle}>Selecione os exercícios para incluir no treino:</p>
            <div style={styles.exerciseList}>
              {INITIAL_EXERCISES.map(e => {
                const isSelected = selectedExercises.some(se => se.id === e.id);
                return (
                  <div 
                    key={e.id} 
                    onClick={() => handleAddExercise(e)}
                    style={{
                      ...styles.exerciseItem,
                      ...(isSelected ? styles.exerciseItemSelected : {})
                    }}
                  >
                    <div style={styles.exerciseDetails}>
                      <span style={styles.exerciseName}>{e.name}</span>
                      <span style={styles.exerciseCat}>{e.category}</span>
                    </div>
                    <div style={styles.exerciseMeta}>
                      <span style={styles.repsText}>{e.reps}</span>
                      <PlusCircle 
                        size={20} 
                        style={{ 
                          color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                          transform: isSelected ? 'rotate(45deg)' : 'none',
                          transition: 'all var(--transition-fast)'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '40px'
  },
  headerCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  headerTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
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
  planBadge: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: 'var(--primary)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  limitCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '200px'
  },
  limitMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px'
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    background: 'none',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  tabButtonActive: {
    color: 'var(--primary)',
    borderBottomColor: 'var(--primary)'
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  formCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  listCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
  },
  listSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  select: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  input: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  hint: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  exerciseBadge: {
    fontSize: '0.75rem',
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-hover)',
    color: '#ffffff',
    fontWeight: '500',
  },
  submitBtn: {
    padding: '12px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
  exerciseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  exerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  exerciseItemSelected: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  exerciseDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  exerciseName: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  exerciseCat: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  exerciseMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  repsText: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  // Alunos list/CRUD specific
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
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
  tableResponsive: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  tableCellHeader: {
    padding: '12px 8px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s'
  },
  tableCell: {
    padding: '12px 8px',
    verticalAlign: 'middle'
  },
  actionsGroup: {
    display: 'inline-flex',
    gap: '6px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 10px',
    fontSize: '0.75rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  formActions: {
    display: 'flex',
    gap: '10px'
  },
  saveBtn: {
    padding: '10px 20px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-sm)'
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.2s'
  },
  vipBadge: {
    marginLeft: '8px',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    backgroundColor: '#eab308',
    color: '#000000',
    padding: '1px 5px',
    borderRadius: '3px'
  },
  tenantBadge: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)'
  }
};

export default Professor;
