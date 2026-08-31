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
  ClipboardList,
  Camera,
  Check,
  AlertTriangle,
  TrendingUp,
  FileText
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
    approveAndPublishWorkout,
    workoutsByStudent,
    updateWorkoutByProfessor,
    approvedEvaluations
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
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '123', plano: '' });

  // Custom Plans states
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');

  // Cartão do Aluno state
  const [viewingStudent, setViewingStudent] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('medidas'); // 'medidas', 'fotos', 'treinos', 'dificuldades', 'editor', 'financeiro'
  const [editWorkoutHtml, setEditWorkoutHtml] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Revisão IA state
  const [reviewingStudentId, setReviewingStudentId] = useState(null);
  const [reviewWorkoutData, setReviewWorkoutData] = useState(null);

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
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    const planId = 'cp_' + Date.now();
    const newPlan = { id: planId, name: newPlanName, price: newPlanPrice };
    const currentPlans = user.customPlans || [];
    try {
      await updateUser(user.id, { customPlans: [...currentPlans, newPlan] });
      setNewPlanName('');
      setNewPlanPrice('');
      alert('Plano adicionado com sucesso!');
    } catch (err) {
      alert('Erro ao adicionar plano');
    }
  };

  const handleDeletePlan = async (id) => {
    if (confirm('Deseja deletar este plano?')) {
      const updatedPlans = (user.customPlans || []).filter(p => p.id !== id);
      try {
         await updateUser(user.id, { customPlans: updatedPlans });
      } catch (err) {
         alert('Erro ao deletar plano');
      }
    }
  };

  const calculateMRR = () => {
    let mrr = 0;
    myStudents.forEach(student => {
      if (student.plano) {
        const planObj = (user.customPlans || []).find(p => p.name === student.plano);
        if (planObj && planObj.price) {
          const priceValue = parseFloat(planObj.price.replace(/[^0-9,.-]/g, '').replace(',', '.'));
          if (!isNaN(priceValue)) mrr += priceValue;
        }
      }
    });
    return mrr;
  };

  const handleTogglePayment = async (studentId, currentStatus) => {
    const newStatus = currentStatus === 'Pago' ? 'Pendente' : 'Pago';
    try {
      await updateUser(studentId, { pagamentoStatus: newStatus });
    } catch (e) {
      alert('Erro ao atualizar status financeiro.');
    }
  };

  // CRUD Handlers
  const openAddStudent = () => {
    // Checagem de limite antes de abrir ou cadastrar
    if (ownStudentsCount >= maxLimit) {
      alert('Você atingiu o limite de vagas da sua licença. Entre em contato com a administração do Fit Seven para liberar mais espaço.');
      return;
    }
    setStudentForm({ name: '', email: '', password: '123', plano: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditStudent = (student) => {
    setStudentForm({
      name: student.name,
      email: student.email,
      password: student.password || '123',
      plano: student.plano || ''
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
        <button 
          onClick={() => { setActiveTab('planos'); setShowForm(false); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'planos' ? styles.tabButtonActive : {})
          }}
        >
          <ClipboardList size={16} />
          Meus Planos
        </button>
        <button 
          onClick={() => { setActiveTab('financeiro'); setShowForm(false); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'financeiro' ? styles.tabButtonActive : {})
          }}
        >
          <Award size={16} />
          Financeiro
        </button>
        <button 
          onClick={() => { setActiveTab('revisao'); setShowForm(false); setReviewingStudentId(null); }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'revisao' ? styles.tabButtonActive : {})
          }}
        >
          <Brain size={16} />
          Revisão IA
          {myStudents.filter(s => workoutsByStudent[s.id]?.status === 'draft_professor').length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', marginLeft: '5px' }}>
              {myStudents.filter(s => workoutsByStudent[s.id]?.status === 'draft_professor').length}
            </span>
          )}
        </button>
      </div>

      {/* CONTEÚDO DA ABA DE MEUS ALUNOS */}
      {activeTab === 'alunos' && (
        <div className="animate-fade-in">
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            background: ownStudentsCount >= maxLimit ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
            padding: '15px 20px',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${ownStudentsCount >= maxLimit ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`
          }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color={ownStudentsCount >= maxLimit ? '#ef4444' : 'var(--accent-primary)'} />
                Licença de Alunos (Seats)
              </h3>
              <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Vagas Utilizadas: <strong style={{ color: ownStudentsCount >= maxLimit ? '#ef4444' : 'var(--text-primary)' }}>{ownStudentsCount} de {maxLimit}</strong>
              </p>
            </div>
            {ownStudentsCount >= maxLimit && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold' }}>Limite Atingido</span>
            )}
          </div>
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
                <div style={styles.formGroup}>
                  <label style={styles.label}>Vincular a um Plano:</label>
                  <select
                    value={studentForm.plano || ''}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, plano: e.target.value }))}
                    style={{...styles.input, backgroundColor: 'var(--bg-primary)'}}
                  >
                    <option value="">Nenhum / Básico</option>
                    {(user.customPlans || []).map(p => (
                       <option key={p.id} value={p.name}>{p.name} ({p.price})</option>
                    ))}
                  </select>
                </div>
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
                  <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={styles.table}>
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
                              {student.plano && (
                                <span style={{ ...styles.vipBadge, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', marginLeft: '8px' }}>
                                  {student.plano}
                                </span>
                              )}
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
                                  onClick={() => setViewingStudent(student)} 
                                  style={{ ...styles.actionBtn, color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }} 
                                  title="Ver Cartão do Aluno"
                                >
                                  <User size={14} style={{ marginRight: '4px' }} /> Cartão
                                </button>
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
                                    onClick={() => { setViewingStudent(student); setShowMedidas(false); }}
                                    style={{ ...styles.iconBtn, color: 'var(--primary)' }}
                                    title="Ver CRM do Aluno"
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
                  </table></div>
                </div>
              )}
            </div>
          )}

          {/* Modal Cartão do Aluno (Dossiê) */}
          {viewingStudent && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)', position: 'relative' }}>
                <button onClick={() => { setViewingStudent(null); setActiveModalTab('medidas'); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px' }}>X</button>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} color="var(--primary-color)" /> Dossiê do Aluno
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', marginTop: '20px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                     {(viewingStudent.name || '?').charAt(0).toUpperCase()}
                   </div>
                   <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>{viewingStudent.name || 'Sem Nome'}</h4>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{viewingStudent.email}</p>
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <button 
                    onClick={() => setActiveModalTab('medidas')} 
                    style={{ background: activeModalTab === 'medidas' ? 'var(--primary-color)' : 'transparent', color: activeModalTab === 'medidas' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeModalTab === 'medidas' ? 'bold' : 'normal' }}
                  >
                    📋 Medidas & Anamnese
                  </button>
                  <button 
                    onClick={() => setActiveModalTab('fotos')} 
                    style={{ background: activeModalTab === 'fotos' ? 'var(--primary-color)' : 'transparent', color: activeModalTab === 'fotos' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeModalTab === 'fotos' ? 'bold' : 'normal' }}
                  >
                    📸 Fotos de Evolução
                  </button>
                  <button 
                    onClick={() => setActiveModalTab('treinos')} 
                    style={{ background: activeModalTab === 'treinos' ? 'var(--primary-color)' : 'transparent', color: activeModalTab === 'treinos' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeModalTab === 'treinos' ? 'bold' : 'normal' }}
                  >
                    🏋️ Execuções & Cargas
                  </button>
                  <button 
                    onClick={() => setActiveModalTab('dificuldades')} 
                    style={{ background: activeModalTab === 'dificuldades' ? 'var(--primary-color)' : 'transparent', color: activeModalTab === 'dificuldades' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeModalTab === 'dificuldades' ? 'bold' : 'normal' }}
                  >
                    🚨 Relatório de Falhas
                  </button>
                  <button 
                    onClick={() => {
                      setActiveModalTab('editor');
                      const w = workoutsByStudent[viewingStudent.id];
                      if (w && w.isVip) setEditWorkoutHtml(w.vipHtml || '');
                    }} 
                    style={{ background: activeModalTab === 'editor' ? 'var(--primary-color)' : 'transparent', color: activeModalTab === 'editor' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeModalTab === 'editor' ? 'bold' : 'normal' }}
                  >
                    ✏️ Editar Ficha
                  </button>
                  <button 
                    onClick={() => setActiveModalTab('financeiro')} 
                    style={{ background: activeModalTab === 'financeiro' ? 'var(--primary-color)' : 'transparent', color: activeModalTab === 'financeiro' ? '#fff' : 'var(--text-secondary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeModalTab === 'financeiro' ? 'bold' : 'normal' }}
                  >
                    💳 CRM / Financeiro
                  </button>
                </div>

                {/* ── ABA 1: MEDIDAS & ANAMNESE ── */}
                {activeModalTab === 'medidas' && (
                  <div className="animate-fade-in">
                  {(() => {
                      const allEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])];
                      const latestEval = allEvals.sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return dateB - dateA;
                      }).find(e => e.userId === viewingStudent?.id || e.student_id === viewingStudent?.id);
                      const studentEval = latestEval?.formData;
                      
                      if (!studentEval) return (
                        <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          Nenhuma Avaliação Física enviada ainda por este aluno.
                        </div>
                      );

                      return (
                        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Perfil Completo & Medidas Corporais</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                              Enviado em: {latestEval.created_at ? new Date(latestEval.created_at).toLocaleDateString() : 'Recente'}
                            </span>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '16px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px' }}>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sexo: <strong style={{color: 'var(--text-primary)'}}>{studentEval.sexoBiologico || '-'}</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Idade: <strong style={{color: 'var(--text-primary)'}}>{studentEval.idade || '-'} anos</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Peso: <strong style={{color: 'var(--accent-primary)'}}>{studentEval.peso || '-'} kg</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Altura: <strong style={{color: 'var(--text-primary)'}}>{studentEval.altura || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>BF Est.: <strong style={{color: '#eab308'}}>{studentEval.percentualGordura ? `${studentEval.percentualGordura}%` : '-'}</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Massa Magra: <strong style={{color: '#22c55e'}}>{studentEval.massaMagra ? `${studentEval.massaMagra} kg` : '-'}</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tórax: <strong style={{color: 'var(--text-primary)'}}>{studentEval.torax || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cintura: <strong style={{color: 'var(--text-primary)'}}>{studentEval.cintura || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Abdômen: <strong style={{color: 'var(--text-primary)'}}>{studentEval.abdomen || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Quadril: <strong style={{color: 'var(--text-primary)'}}>{studentEval.quadril || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Bíceps (D/E): <strong style={{color: 'var(--text-primary)'}}>{studentEval.bicepsDir || '-'}/{studentEval.bicepsEsq || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Coxa (D/E): <strong style={{color: 'var(--text-primary)'}}>{studentEval.coxaDir || '-'}/{studentEval.coxaEsq || '-'} cm</strong></p>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Panturrilha (D/E): <strong style={{color: 'var(--text-primary)'}}>{studentEval.panturrilhaDir || '-'}/{studentEval.panturrilhaEsq || '-'} cm</strong></p>
                          </div>
                          
                          <div style={{ marginBottom: '15px' }}>
                            <h5 style={{ margin: '0 0 8px 0', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>🎯 Objetivos e Rotina</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Objetivo: <strong style={{color: 'var(--text-primary)'}}>{studentEval.objetivo || '-'}</strong></p>
                              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Frequência: <strong style={{color: 'var(--text-primary)'}}>{studentEval.frequenciaSemanal || '-'} dias/semana</strong></p>
                              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Tempo por Sessão: <strong style={{color: 'var(--text-primary)'}}>{studentEval.tempoSessao || '-'} min</strong></p>
                              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Nível de Atividade: <strong style={{color: 'var(--text-primary)'}}>{studentEval.nivelAtividade || '-'}</strong></p>
                              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Horário Preferido: <strong style={{color: 'var(--text-primary)'}}>{studentEval.horarioTreino || '-'}</strong></p>
                              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Qualidade do Sono: <strong style={{color: 'var(--text-primary)'}}>{studentEval.qualidadeSono || '-'}</strong></p>
                            </div>
                          </div>

                          {studentEval.lesoes && (
                            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #ef4444' }}>
                              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}><strong>⚠️ Histórico de Lesões / Dores:</strong> {studentEval.lesoes}</p>
                            </div>
                          )}
                          {studentEval.limitacoesMovimento && (
                            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #ef4444' }}>
                              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}><strong>⚠️ Limitações de Movimento:</strong> {studentEval.limitacoesMovimento}</p>
                            </div>
                          )}
                          {studentEval.condicoesMedicas && (
                            <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #ef4444' }}>
                              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.85rem' }}><strong>⚠️ Condições Médicas:</strong> {studentEval.condicoesMedicas}</p>
                            </div>
                          )}
                          {studentEval.medicamentos && (
                            <div style={{ padding: '10px', background: 'rgba(239, 137, 68, 0.1)', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #ef8944' }}>
                              <p style={{ margin: 0, color: '#ef8944', fontSize: '0.85rem' }}><strong>💊 Medicamentos:</strong> {studentEval.medicamentos}</p>
                            </div>
                          )}
                          {studentEval.suplementos && (
                            <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', marginBottom: '8px', borderLeft: '3px solid #22c55e' }}>
                              <p style={{ margin: 0, color: '#22c55e', fontSize: '0.85rem' }}><strong>🥤 Suplementos:</strong> {studentEval.suplementos}</p>
                            </div>
                          )}
                          {studentEval.observacoes && (
                            <div style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}><strong>💡 Observações do Aluno:</strong> {studentEval.observacoes}</p>
                            </div>
                          )}
                        </div>
                      );
                  })()}
                  </div>
                )}

                {/* ── ABA 2: FOTOS DE EVOLUÇÃO (LINHA DO TEMPO + LIGHTBOX) ── */}
                {activeModalTab === 'fotos' && (
                  <div className="animate-fade-in">
                    {(() => {
                      const allEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])];
                      const studentEvals = allEvals
                        .filter(e => e.userId === viewingStudent?.id || e.student_id === viewingStudent?.id)
                        .sort((a, b) => {
                          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                          return dateB - dateA;
                        });

                      if (studentEvals.length === 0) {
                        return (
                          <div style={{ background: 'var(--bg-primary)', padding: '30px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Camera size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
                            <h5 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Nenhuma foto enviada</h5>
                            <p style={{ margin: 0, fontSize: '0.82rem' }}>O aluno ainda não enviou fotos de evolução nas avaliações físicas.</p>
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Clique em qualquer foto para ampliar em tela cheia e analisar a postura e composição corporal do aluno.
                          </p>

                          {studentEvals.map((ev, evIdx) => {
                            const dataEnvio = ev.created_at ? new Date(ev.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : `Avaliação #${studentEvals.length - evIdx}`;
                            const frenteUrl = ev.fotoFrenteBase64 || ev.formData?.fotoFrenteBase64 || null;
                            const costasUrl = ev.fotoCostasBase64 || ev.formData?.fotoCostasBase64 || null;
                            const perfilUrl = ev.fotoPerfilBase64 || ev.formData?.fotoPerfilBase64 || null;
                            const hasAnyPhoto = frenteUrl || costasUrl || perfilUrl;

                            return (
                              <div key={ev.id || evIdx} style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                  <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                    📅 {dataEnvio}
                                  </span>
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    Peso: {ev.formData?.peso ? `${ev.formData.peso} kg` : '-'} | BF: {ev.formData?.percentualGordura ? `${ev.formData.percentualGordura}%` : '-'}
                                  </span>
                                </div>

                                {!hasAnyPhoto ? (
                                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, textAlign: 'center', padding: '12px 0' }}>
                                    Fotos não anexadas nesta avaliação.
                                  </p>
                                ) : (
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                    {frenteUrl && (
                                      <div 
                                        onClick={() => setLightboxPhoto({ url: frenteUrl, label: `${viewingStudent.name} - Frente (${dataEnvio})` })}
                                        style={{ cursor: 'pointer', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}
                                      >
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Frente</span>
                                        <img src={frenteUrl} alt="Frente" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
                                      </div>
                                    )}
                                    {costasUrl && (
                                      <div 
                                        onClick={() => setLightboxPhoto({ url: costasUrl, label: `${viewingStudent.name} - Costas (${dataEnvio})` })}
                                        style={{ cursor: 'pointer', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}
                                      >
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Costas</span>
                                        <img src={costasUrl} alt="Costas" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
                                      </div>
                                    )}
                                    {perfilUrl && (
                                      <div 
                                        onClick={() => setLightboxPhoto({ url: perfilUrl, label: `${viewingStudent.name} - Perfil (${dataEnvio})` })}
                                        style={{ cursor: 'pointer', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}
                                      >
                                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Perfil</span>
                                        <img src={perfilUrl} alt="Perfil" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px' }} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── ABA 3: EXECUÇÕES & CARGAS REAIS (HISTÓRICO) ── */}
                {activeModalTab === 'treinos' && (
                  <div className="animate-fade-in">
                    {/* Acompanhamento Semanal */}
                    <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--accent-primary)' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                        📈 Acompanhamento da Semana
                      </h4>
                      {(() => {
                        const workout = workoutsByStudent[viewingStudent.id];
                        const concluidos = workout?.finishedSplits || [];
                        if (concluidos.length === 0) {
                          return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>O aluno ainda não concluiu splits nesta semana.</p>;
                        }
                        return (
                          <div>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                              Splits concluídos nesta semana: <strong style={{ color: 'var(--accent-primary)' }}>{concluidos.length}</strong>
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {concluidos.map((split, idx) => (
                                <span key={idx} style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '4px 10px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                  ✓ Treino {split} Concluído
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Histórico Detalhado de Exercícios & Cargas */}
                    <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🏋️ Execução de Exercícios & Cargas Registradas</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>Dados em tempo real</span>
                      </h4>

                      {(() => {
                        const workout = workoutsByStudent[viewingStudent.id];
                        const exercisesList = workout?.exercises || [];
                        
                        if (exercisesList.length === 0) {
                          return (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                              Nenhum exercício estruturado registrado ainda para este aluno.
                            </p>
                          );
                        }

                        const splits = ['A', 'B', 'C', 'D', 'E'];
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {splits.map(letter => {
                              const splitExs = exercisesList.filter(e => e.split === letter);
                              if (splitExs.length === 0) return null;

                              return (
                                <div key={letter} style={{ background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Treino {letter}</strong>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                      {splitExs.filter(e => e.status === 'concluido').length} / {splitExs.length} concluídos
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {splitExs.map((ex, idx) => {
                                      const isDone = ex.status === 'concluido';
                                      const isSkipped = ex.status === 'pulado';
                                      const hasFeedback = ex.feedbackDificuldade && ex.feedbackDificuldade.trim().length > 0;

                                      return (
                                        <div key={ex.id || idx} style={{
                                          padding: '10px',
                                          borderRadius: '6px',
                                          background: isDone ? 'rgba(34, 197, 94, 0.05)' : isSkipped ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255,255,255,0.02)',
                                          border: '1px solid ' + (isDone ? 'rgba(34, 197, 94, 0.2)' : isSkipped ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)')
                                        }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                                            <div>
                                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{ex.name}</strong>
                                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                                                Prescrito: {ex.reps}
                                              </span>
                                            </div>
                                            <div>
                                              {isDone ? (
                                                <span style={{ background: ex.metaAtingida100 === false ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: ex.metaAtingida100 === false ? '#eab308' : '#22c55e', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                  {ex.metaAtingida100 === false ? '⚠️ Sub-máximo' : '✓ 100% Batido'}
                                                </span>
                                              ) : isSkipped ? (
                                                <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                  ✕ Pulado
                                                </span>
                                              ) : (
                                                <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                                                  ⏳ Pendente
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {isDone && (
                                            <div style={{ marginTop: '8px', display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                              <span>📊 <strong>Carga Real:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{ex.realLoad || 'Não inf.'}</span></span>
                                              <span>🔁 <strong>Séries Feitas:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{ex.realSets !== undefined ? ex.realSets : '-'}</span></span>
                                              {ex.completedAt && (
                                                <span>🕒 {new Date(ex.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(ex.completedAt).toLocaleDateString()})</span>
                                              )}
                                            </div>
                                          )}

                                          {hasFeedback && (
                                            <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(234, 179, 8, 0.12)', borderRadius: '4px', borderLeft: '3px solid #eab308' }}>
                                              <p style={{ margin: 0, fontSize: '0.78rem', color: '#fef08a' }}>
                                                <strong>💬 Relato do Aluno:</strong> "{ex.feedbackDificuldade}"
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ── ABA 4: RELATÓRIO DE FALHAS & DIFICULDADES (CONSOLIDADO) ── */}
                {activeModalTab === 'dificuldades' && (
                  <div className="animate-fade-in">
                    <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #eab308' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertTriangle size={18} style={{ color: '#eab308' }} /> Relatório de Falhas & Ajustes Clínicos
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Compilação inteligente de todos os exercícios em que o aluno relatou falha prematura, dor ou dificuldade técnica para guiar intervenções.
                      </p>
                    </div>

                    {(() => {
                      const workout = workoutsByStudent[viewingStudent.id];
                      const exercisesList = workout?.exercises || [];
                      const difficultExs = exercisesList.filter(e => 
                        e.metaAtingida100 === false || 
                        (e.feedbackDificuldade && e.feedbackDificuldade.trim().length > 0) ||
                        e.status === 'pulado'
                      );

                      if (difficultExs.length === 0) {
                        return (
                          <div style={{ background: 'var(--bg-primary)', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
                            <Check size={32} style={{ color: 'var(--status-success)', margin: '0 auto 8px auto' }} />
                            <h5 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>Nenhuma falha ou dificuldade registrada</h5>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                              O aluno está conseguindo atingir 100% das metas prescritas sem relatos de desconforto ou falhas mecânicas.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {difficultExs.map((ex, idx) => (
                            <div key={ex.id || idx} style={{
                              background: 'var(--bg-primary)',
                              padding: '14px',
                              borderRadius: '8px',
                              border: '1px solid rgba(234, 179, 8, 0.3)',
                              borderLeft: '4px solid #eab308'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                  Split {ex.split}: {ex.name}
                                </span>
                                <span style={{ background: ex.status === 'pulado' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)', color: ex.status === 'pulado' ? '#ef4444' : '#eab308', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                  {ex.status === 'pulado' ? 'Pulado' : 'Sub-máximo'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', gap: '15px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span>Prescrito: <strong>{ex.reps}</strong></span>
                                <span>Carga Usada: <strong>{ex.realLoad || 'N/I'}</strong></span>
                                <span>Séries Feitas: <strong>{ex.realSets !== undefined ? ex.realSets : '-'}</strong></span>
                              </div>

                              {ex.feedbackDificuldade && (
                                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Relato do Aluno:</span>
                                  <span style={{ fontSize: '0.85rem', color: '#fef08a', fontWeight: '500' }}>"{ex.feedbackDificuldade}"</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* ── ABA 5: EDITAR FICHA (VIP / MANUAL) ── */}
                {activeModalTab === 'editor' && (
                  <div className="animate-fade-in">
                    <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                        Ficha de Treino & Edição Técnica
                      </h4>
                      {(() => {
                        const workout = workoutsByStudent[viewingStudent.id];
                        if (!workout) {
                          return <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nenhum treino definido para este aluno.</p>;
                        }

                        if (workout.isVip) {
                          return (
                            <div>
                              <p style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>
                                Aluno com Plano VIP (Edição Visual Ativada).<br/>
                                <span style={{ color: 'var(--text-secondary)' }}>Clique em qualquer texto abaixo e digite para editar. As alterações serão salvas no PDF do aluno.</span>
                              </p>
                              <div style={{
                                  width: '100%', 
                                  overflowX: 'auto', 
                                  WebkitOverflowScrolling: 'touch',
                                  border: '2px solid var(--primary-color)', 
                                  borderRadius: '6px',
                                  background: '#fff'
                              }}>
                                <iframe
                                  id={`iframe-editor-${viewingStudent.id}`}
                                  srcDoc={workout.vipHtml || ''}
                                  onLoad={(e) => {
                                    const doc = e.target.contentDocument;
                                    if (doc) {
                                      doc.designMode = "on";
                                    }
                                  }}
                                  style={{ 
                                    width: '100%', minWidth: '800px', height: '500px',
                                    border: 'none', display: 'block'
                                  }}
                                />
                              </div>
                              <button 
                                onClick={async () => {
                                  const iframe = document.getElementById(`iframe-editor-${viewingStudent.id}`);
                                  if (iframe && iframe.contentDocument) {
                                    const finalHtml = "<!DOCTYPE html>\n" + iframe.contentDocument.documentElement.outerHTML;
                                    await updateWorkoutByProfessor(viewingStudent.id, { vipHtml: finalHtml });
                                    alert('Treino atualizado! O PDF do aluno foi alterado e o formato mantido.');
                                  }
                                }}
                                style={{ marginTop: '15px', width: '100%', background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                              >
                                Salvar Alterações no PDF
                              </button>
                            </div>
                          );
                        } else {
                          return (
                            <div>
                              <p style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                Aluno com Treino Livre (Manual).
                              </p>
                              {(!workout.exercises || workout.exercises.length === 0) ? (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>A ficha está vazia.</p>
                              ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                  {workout.exercises.map((ex, i) => (
                                    <li key={i} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <strong style={{ color: 'var(--text-primary)' }}>{ex.name}</strong> - {ex.sets}x{ex.reps} (Carga: {ex.weight || ex.realLoad || 'Livre'})
                                      </div>
                                      <button 
                                        onClick={async () => {
                                          const newExs = workout.exercises.filter((_, idx) => idx !== i);
                                          await updateWorkoutByProfessor(viewingStudent.id, { exercises: newExs, isVip: false });
                                        }}
                                        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                      >
                                        Remover
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              
                              {/* Mini Formulário de Adição de Exercício Manual */}
                              <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', fontSize: '0.85rem' }}>+ Adicionar Exercício Manual</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                  <input type="text" id={`new-ex-name-${viewingStudent.id}`} placeholder="Ex: Supino Reto" style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                                  <input type="text" id={`new-ex-reps-${viewingStudent.id}`} placeholder="Ex: 4x10" style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                                </div>
                                <button 
                                  onClick={async () => {
                                    const nameInput = document.getElementById(`new-ex-name-${viewingStudent.id}`);
                                    const repsInput = document.getElementById(`new-ex-reps-${viewingStudent.id}`);
                                    if(nameInput.value && repsInput.value) {
                                      const parts = repsInput.value.toLowerCase().split('x');
                                      const sets = parts[0] || '3';
                                      const reps = parts[1] || '10';
                                      const newEx = {
                                        id: 'manual_' + Date.now(),
                                        name: nameInput.value,
                                        sets,
                                        reps,
                                        weight: 'Livre',
                                        status: 'pendente'
                                      };
                                      const currentExs = workout.exercises || [];
                                      await updateWorkoutByProfessor(viewingStudent.id, { exercises: [...currentExs, newEx], isVip: false });
                                      nameInput.value = '';
                                      repsInput.value = '';
                                    }
                                  }}
                                  style={{ marginTop: '10px', width: '100%', background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                  Adicionar à Ficha
                                </button>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '10px' }}>
                   <button onClick={() => { setViewingStudent(null); loginAsUser(viewingStudent); }} style={{ ...styles.saveBtn, flex: 1, padding: '12px' }} className="btn-primary">
                     <Activity size={16} /> Ver Avaliação
                   </button>
                   <button onClick={() => { setViewingStudent(null); handleStartPrescription(viewingStudent.id); }} style={{ ...styles.saveBtn, flex: 1, background: '#a78bfa', padding: '12px' }} className="btn-primary">
                     <Brain size={16} /> Prescrever
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* CONTEÚDO DA ABA FINANCEIRA */}
      {activeTab === 'financeiro' && (
        <div className="animate-fade-in">
          <div style={styles.card} className="glass">
            <h3 style={styles.sectionTitle}>Resumo Financeiro (MRR)</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', flex: 1, border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Faturamento Recorrente Projetado</span>
                <strong style={{ fontSize: '2rem', color: 'var(--status-success)' }}>
                  R$ {calculateMRR().toFixed(2).replace('.', ',')}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-md)', flex: 1, border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Total de Alunos Vinculados a Planos</span>
                <strong style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
                  {myStudents.filter(s => s.plano).length}
                </strong>
              </div>
            </div>

            <h3 style={styles.sectionTitle}>Controle de Recebimentos</h3>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableCellHeader}>Aluno</th>
                    <th style={styles.tableCellHeader}>Plano</th>
                    <th style={styles.tableCellHeader}>Status (Mês Atual)</th>
                    <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {myStudents.filter(s => s.plano).length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum aluno vinculado a planos personalizados.</td>
                    </tr>
                  ) : (
                    myStudents.filter(s => s.plano).map(student => {
                      const planObj = (user.customPlans || []).find(p => p.name === student.plano);
                      const isPaid = student.pagamentoStatus === 'Pago';
                      return (
                        <tr key={student.id} style={styles.tableRow}>
                          <td style={styles.tableCell}><strong>{student.name}</strong></td>
                          <td style={styles.tableCell}>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{student.plano}</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{planObj ? planObj.price : 'N/D'}</div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={{ ...styles.tenantBadge, background: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: isPaid ? '#22c55e' : '#ef4444' }}>
                              {student.pagamentoStatus || 'Pendente'}
                            </span>
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <button 
                              onClick={() => handleTogglePayment(student.id, student.pagamentoStatus || 'Pendente')}
                              style={{ ...styles.actionBtn, background: isPaid ? 'transparent' : 'var(--status-success)', color: isPaid ? 'var(--text-secondary)' : '#fff', border: isPaid ? '1px solid var(--border-color)' : 'none' }}
                            >
                              {isPaid ? 'Marcar como Pendente' : 'Marcar como Pago'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table></div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA DE MEUS PLANOS */}
      {activeTab === 'planos' && (
        <div className="animate-fade-in">
          <div style={styles.card} className="glass">
            <h3 style={styles.sectionTitle}>Configurar Meus Planos</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              Crie planos personalizados para associar aos seus alunos (ex: "Plano VIP Presencial", "Consultoria Online").
            </p>
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
               <input 
                 type="text" 
                 required 
                 placeholder="Nome do Plano" 
                 value={newPlanName} 
                 onChange={(e) => setNewPlanName(e.target.value)} 
                 style={{...styles.input, flex: 1, minWidth: '200px'}} 
               />
               <input 
                 type="text" 
                 required 
                 placeholder="Valor (ex: R$150)" 
                 value={newPlanPrice} 
                 onChange={(e) => setNewPlanPrice(e.target.value)} 
                 style={{...styles.input, width: '150px'}} 
               />
               <button type="submit" style={{...styles.saveBtn, padding: '10px 20px', margin: 0}} className="btn-primary">
                 Adicionar
               </button>
            </form>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
               {user.customPlans && user.customPlans.length > 0 ? user.customPlans.map(plan => (
                  <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                     <div>
                       <strong style={{ color: 'var(--text-primary)', fontSize: '1.05rem', display: 'block', marginBottom: '4px' }}>{plan.name}</strong>
                       <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{plan.price}</span>
                     </div>
                     <button 
                       onClick={() => handleDeletePlan(plan.id)} 
                       style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                     >
                       <Trash2 size={16} /> Excluir
                     </button>
                  </div>
               )) : (
                 <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                   Você ainda não criou nenhum plano.
                 </div>
               )}
            </div>
          </div>
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

      {/* CONTEÚDO DA ABA DE REVISÃO IA */}
      {activeTab === 'revisao' && (
        <div className="animate-fade-in">
          {reviewingStudentId ? (
            <div style={styles.card} className="glass">
              <h3 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                 <Brain size={24} color="var(--primary)" /> Editar Treino IA: {myStudents.find(s => s.id === reviewingStudentId)?.name}
              </h3>
              
              <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>HTML Base (Ficha Completa em PDF)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Se você quiser alterar algum nome de exercício ou carga que foi gerada na ficha HTML, faça a alteração no texto abaixo (cuidado com as tags HTML!).</p>
                <textarea 
                  value={reviewWorkoutData?.vipHtml || ''} 
                  onChange={(e) => setReviewWorkoutData({...reviewWorkoutData, vipHtml: e.target.value})}
                  style={{ ...styles.input, height: '250px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                />
                
                <h4 style={{ margin: '30px 0 10px 0' }}>Estrutura de Exercícios (JSON - App e Gráficos)</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Altere as configurações JSON para que o aluno veja as cargas e repetições corretamente no app.</p>
                <textarea 
                  value={JSON.stringify(reviewWorkoutData?.exercises || [], null, 2)} 
                  onChange={(e) => {
                    try {
                      setReviewWorkoutData({...reviewWorkoutData, exercises: JSON.parse(e.target.value)});
                    } catch(err) {
                      // ignora erro de parse enquanto digita
                    }
                  }}
                  style={{ ...styles.input, height: '250px', fontFamily: 'monospace', fontSize: '0.85rem' }} 
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={async () => {
                  try {
                    await updateWorkoutByProfessor(reviewingStudentId, { ...reviewWorkoutData, status: 'published' });
                    setReviewingStudentId(null);
                    setSuccessMsg('Treino aprovado e liberado para o aluno com sucesso!');
                    setTimeout(() => setSuccessMsg(''), 4000);
                  } catch(e) { alert('Erro ao aprovar.'); }
                }} style={{ ...styles.saveBtn, flex: 1, padding: '12px' }} className="btn-primary">
                  <CheckCircle size={16} /> Aprovar e Liberar para o Aluno
                </button>
                <button onClick={() => setReviewingStudentId(null)} style={{ ...styles.cancelBtn, flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.card} className="glass">
              <h3 style={styles.sectionTitle}>Treinos Gerados pela IA Pendentes de Revisão</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>O Master gerou os rascunhos de treino para os seus alunos abaixo. Revise, edite se necessário e aprove para liberá-los.</p>
              <div style={styles.tableResponsive}>
                <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableCellHeader}>Aluno</th>
                      <th style={styles.tableCellHeader}>Status</th>
                      <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myStudents.filter(s => workoutsByStudent[s.id]?.status === 'draft_professor').length === 0 ? (
                      <tr>
                        <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Brain size={36} style={{ color: 'var(--border-color)', marginBottom: '8px' }} />
                          <p>Nenhum treino aguardando revisão.</p>
                        </td>
                      </tr>
                    ) : (
                      myStudents.filter(s => workoutsByStudent[s.id]?.status === 'draft_professor').map(student => (
                        <tr key={student.id} style={styles.tableRow}>
                          <td style={styles.tableCell}><strong>{student.name}</strong></td>
                          <td style={styles.tableCell}>
                            <span style={{ ...styles.tenantBadge, background: '#fef08a', color: '#854d0e', borderColor: '#fde047' }}>
                              Aguardando Sua Aprovação
                            </span>
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <button 
                              onClick={() => {
                                setReviewingStudentId(student.id);
                                setReviewWorkoutData(workoutsByStudent[student.id]);
                              }}
                              style={{ ...styles.actionBtn, background: '#a78bfa', color: '#fff', border: 'none' }}
                            >
                              <Edit2 size={14} style={{ marginRight: '5px' }} />
                              Revisar e Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LIGHTBOX DE FOTOS ── */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '20px', cursor: 'zoom-out'
          }}
        >
          <div style={{
            position: 'absolute', top: '16px', right: '20px',
            color: '#fff', fontSize: '1.5rem', cursor: 'pointer',
            fontWeight: '700', lineHeight: 1, opacity: 0.8
          }} onClick={() => setLightboxPhoto(null)}>✕</div>
          <span style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
            marginBottom: '12px', letterSpacing: '0.05em', textTransform: 'uppercase'
          }}>{lightboxPhoto.label}</span>
          <img
            src={lightboxPhoto.url}
            alt={lightboxPhoto.label}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '82vh',
              objectFit: 'contain', borderRadius: '8px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)'
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '12px' }}>Clique fora da foto para fechar</span>
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
    flexWrap: 'wrap',
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
