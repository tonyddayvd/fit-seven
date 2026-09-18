import React, { useState, useEffect } from 'react';
import { useApp, DEFAULT_WORKOUTS } from '../context/AppContext';
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
  Search,
  Filter,
  Video,
  Play,
  Save,
  RefreshCw,
  Sparkles,
  ExternalLink,
  X,
  ChevronRight,
  MoveRight,
  Layers,
  Check,
  Smartphone,
  HelpCircle,
  AlertTriangle,
  Camera,
  Upload,
  Film
} from 'lucide-react';
import ExerciseVideoManagerModal from '../components/ExerciseVideoManagerModal';
import { 
  EXERCISE_CATALOG, 
  EXERCISE_CATEGORIES, 
  formatVideoEmbedUrl 
} from '../utils/videoService';

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
    approvedEvaluations,
    workoutSessionsHistory
  } = useApp();

  const [activeTab, setActiveTab] = useState('alunos'); // 'alunos', 'prescribe', 'planos', 'financeiro', 'revisao'
  const [successMsg, setSuccessMsg] = useState('');
  
  // Prescrição Studio states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [prescribeSplit, setPrescribeSplit] = useState('A');
  const [availableSplits, setAvailableSplits] = useState(['A', 'B', 'C', 'D', 'E']);
  const [studentExercises, setStudentExercises] = useState([]);
  const [splitToDelete, setSplitToDelete] = useState(null); // Split selecionado para exclusão
  const [searchCatalog, setSearchCatalog] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [customExercise, setCustomExercise] = useState({
    name: '',
    category: 'Peito',
    reps: '4x10-12',
    load: 'Carga Livre',
    video_oficial_url: ''
  });
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Alunos CRUD states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '123', plano: '' });

  // Custom Plans states
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');

  // Cartão do Aluno state
  const [viewingStudent, setViewingStudent] = useState(null);
  const [crmTab, setCrmTab] = useState('geral'); // 'geral', 'medidas', 'treinos'

  // Revisão IA state
  const [reviewingStudentId, setReviewingStudentId] = useState(null);
  const [reviewWorkoutData, setReviewWorkoutData] = useState(null);

  // Modal Inteligente de Gestão / Sugestão / Gravação de Vídeo
  const [editingVideoExercise, setEditingVideoExercise] = useState(null);

  // Adicionar um novo exercício livre diretamente ao split ativo com 1 clique
  const handleAddNewExerciseToSplit = () => {
    const newEx = {
      id: `ex_presc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      split: prescribeSplit,
      name: '',
      category: 'Geral',
      reps: '4x10-12',
      load: 'Carga Livre',
      status: 'pendente',
      video_oficial_url: '',
      video_personalizado_url: ''
    };
    setStudentExercises(prev => [...prev, newEx]);
    setSuccessMsg(`Novo exercício adicionado ao Treino ${prescribeSplit}! Digite o nome e personalize os detalhes abaixo.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Upload ou Gravação Direta com a Câmera do Celular
  const handleDirectVideoUpload = (exerciseId, file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('Aviso: O vídeo é grande (>25MB). Recomendamos gravações curtas de 5 a 15 segundos para melhor desempenho.');
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result;
      handleUpdateExerciseField(exerciseId, 'video_oficial_url', base64Url);
      setSuccessMsg('Vídeo gravado e anexado com sucesso ao exercício!');
      setTimeout(() => setSuccessMsg(''), 3000);
    };
    reader.onerror = () => {
      alert('Erro ao carregar o vídeo. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveExerciseVideo = async (newVideoUrl) => {
    if (!editingVideoExercise) return;

    // Se estiver no Studio de Prescrição
    if (activeTab === 'prescribe') {
      handleUpdateExerciseField(editingVideoExercise.id, 'video_oficial_url', newVideoUrl);
      setEditingVideoExercise(null);
      setSuccessMsg('Vídeo do exercício atualizado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 2500);
      return;
    }

    // Se estiver visualizando o CRM do Aluno
    if (viewingStudent) {
      const currentWorkout = workoutsByStudent[viewingStudent.id] || {};
      
      let exercisesList = (currentWorkout.exercises && currentWorkout.exercises.length > 0)
        ? currentWorkout.exercises
        : DEFAULT_WORKOUTS;
      
      const updatedExs = exercisesList.map(ex => 
        (ex.id === editingVideoExercise.id || ex.name.trim().toLowerCase() === editingVideoExercise.name.trim().toLowerCase())
          ? { ...ex, video_oficial_url: newVideoUrl, videoUrl: newVideoUrl }
          : ex
      );
      
      await updateWorkoutByProfessor(viewingStudent.id, { 
        ...currentWorkout,
        exercises: updatedExs, 
        isVip: currentWorkout.isVip || false 
      });
      setEditingVideoExercise(null);
      setSuccessMsg('Vídeo oficial salvo na ficha do aluno com sucesso!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Filtrar apenas alunos do mesmo tenant (seja o ID do professor ou o tenantId do professor se ele estiver em uma academia)
  const myStudents = usersList.filter(u => u.role === 'aluno' && (u.tenantId === user.id || u.tenantId === user.tenantId));

  // Alunos cadastrados especificamente pelo professor sob o seu limite
  const ownStudentsCount = usersList.filter(u => u.role === 'aluno' && u.tenantId === user.id).length;
  const maxLimit = user.limiteAlunos || 10;

  // Quando o selectedStudent mudar, carrega seus exercícios e calcula as divisões reais
  useEffect(() => {
    if (selectedStudent) {
      const studentWorkout = workoutsByStudent[selectedStudent];
      if (studentWorkout && studentWorkout.exercises && studentWorkout.exercises.length > 0) {
        setStudentExercises(studentWorkout.exercises);
        const splitsFound = Array.from(new Set(studentWorkout.exercises.map(e => e.split || 'A'))).filter(Boolean).sort();
        if (splitsFound.length > 0) {
          setAvailableSplits(splitsFound);
          if (!splitsFound.includes(prescribeSplit)) {
            setPrescribeSplit(splitsFound[0]);
          }
        } else {
          setAvailableSplits(['A', 'B', 'C']);
          setPrescribeSplit('A');
        }
      } else {
        setStudentExercises(DEFAULT_WORKOUTS);
        const defaultSplits = Array.from(new Set(DEFAULT_WORKOUTS.map(e => e.split || 'A'))).filter(Boolean).sort();
        setAvailableSplits(defaultSplits.length > 0 ? defaultSplits : ['A', 'B', 'C']);
        setPrescribeSplit('A');
      }
    }
  }, [selectedStudent, workoutsByStudent]);

  // Se o professor abrir a aba de prescrição e nenhum aluno estiver selecionado, seleciona o primeiro
  useEffect(() => {
    if (activeTab === 'prescribe' && !selectedStudent && myStudents.length > 0) {
      setSelectedStudent(myStudents[0].id);
    }
  }, [activeTab, selectedStudent, myStudents]);

  const handleStartPrescription = (studentId) => {
    setSelectedStudent(studentId);
    setActiveTab('prescribe');
    setViewingStudent(null);
  };

  // Adicionar exercício do catálogo ao split atual
  const handleAddFromCatalog = (catalogItem) => {
    const newEx = {
      id: `ex_presc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      split: prescribeSplit,
      name: catalogItem.name,
      category: catalogItem.category,
      reps: catalogItem.reps,
      load: catalogItem.load,
      status: 'pendente',
      video_oficial_url: catalogItem.video_oficial_url || '',
      video_personalizado_url: ''
    };
    setStudentExercises(prev => [...prev, newEx]);
    setSuccessMsg(`"${catalogItem.name}" adicionado ao Treino ${prescribeSplit}!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Criar exercício personalizado livre
  const handleAddCustomExercise = (e) => {
    e.preventDefault();
    if (!customExercise.name.trim()) {
      alert('Por favor, informe o nome do exercício.');
      return;
    }

    const formattedVideo = formatVideoEmbedUrl(customExercise.video_oficial_url);
    const newEx = {
      id: `ex_cust_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      split: prescribeSplit,
      name: customExercise.name.trim(),
      category: customExercise.category || 'Geral',
      reps: customExercise.reps.trim() || '4x10-12',
      load: customExercise.load.trim() || 'Carga Livre',
      status: 'pendente',
      video_oficial_url: formattedVideo,
      video_personalizado_url: ''
    };

    setStudentExercises(prev => [...prev, newEx]);
    setCustomExercise({
      name: '',
      category: customExercise.category,
      reps: '4x10-12',
      load: 'Carga Livre',
      video_oficial_url: ''
    });

    setSuccessMsg(`Exercício personalizado "${newEx.name}" adicionado ao Treino ${prescribeSplit}!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Alterar campo de um exercício na lista
  const handleUpdateExerciseField = (id, field, value) => {
    setStudentExercises(prev => prev.map(ex => {
      if (ex.id === id) {
        let finalValue = value;
        if (field === 'video_oficial_url') {
          finalValue = formatVideoEmbedUrl(value);
        }
        return { ...ex, [field]: finalValue };
      }
      return ex;
    }));
  };

  // Remover exercício
  const handleRemoveExercise = (id) => {
    setStudentExercises(prev => prev.filter(ex => ex.id !== id));
  };

  // Mover exercício para outro split
  const handleMoveSplit = (id, targetSplit) => {
    setStudentExercises(prev => prev.map(ex => ex.id === id ? { ...ex, split: targetSplit } : ex));
  };

  // Adicionar novo Split livre (ex: A, B, C, D... até Z ou quantos quiser)
  const handleAddNewSplit = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nextLetter = '';
    for (let char of alphabet) {
      if (!availableSplits.includes(char)) {
        nextLetter = char;
        break;
      }
    }
    if (!nextLetter) {
      nextLetter = `Split ${availableSplits.length + 1}`;
    }
    setAvailableSplits(prev => [...prev, nextLetter]);
    setPrescribeSplit(nextLetter);
    setSuccessMsg(`Divisão "Treino ${nextLetter}" adicionada com sucesso!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Solicitar exclusão do split (abre modal de confirmação)
  const handleRequestDeleteSplit = (splitLetter) => {
    setSplitToDelete(splitLetter);
  };

  // Confirmar exclusão do split completo e de todos os seus exercícios
  const handleConfirmDeleteSplit = () => {
    if (!splitToDelete) return;
    const count = studentExercises.filter(e => (e.split || 'A') === splitToDelete).length;
    const remainingExercises = studentExercises.filter(ex => (ex.split || 'A') !== splitToDelete);
    setStudentExercises(remainingExercises);

    const remainingSplits = availableSplits.filter(s => s !== splitToDelete);
    const finalSplits = remainingSplits.length > 0 ? remainingSplits : ['A'];
    setAvailableSplits(finalSplits);

    if (prescribeSplit === splitToDelete) {
      setPrescribeSplit(finalSplits[0]);
    }

    setSuccessMsg(`O Treino ${splitToDelete} (${count} exercício(s)) foi removido com sucesso.`);
    setTimeout(() => setSuccessMsg(''), 3500);
    setSplitToDelete(null);
  };

  // Restaurar Treinos Padrão
  const handleResetToDefault = () => {
    if (confirm('Deseja restaurar a lista padrão de treinos para este aluno? As alterações não salvas serão substituídas.')) {
      setStudentExercises(DEFAULT_WORKOUTS);
      setAvailableSplits(['A', 'B', 'C', 'D', 'E']);
      setPrescribeSplit('A');
    }
  };

  // Limpar todos os exercícios
  const handleClearAllExercises = () => {
    if (confirm('Tem certeza de que deseja limpar todos os exercícios desta ficha? Você poderá adicionar novos.')) {
      setStudentExercises([]);
    }
  };

  // Confirmar e Publicar Treino
  const handleConfirmWorkout = async () => {
    if (!selectedStudent) {
      alert('Selecione um aluno para salvar a prescrição.');
      return;
    }

    if (studentExercises.length === 0) {
      if (!confirm('A ficha está sem exercícios. Deseja salvar mesmo assim?')) {
        return;
      }
    }

    setIsSaving(true);
    const targetStudentObj = myStudents.find(s => s.id === selectedStudent);
    try {
      const currentData = workoutsByStudent[selectedStudent] || {};
      await updateWorkoutByProfessor(selectedStudent, {
        ...currentData,
        exercises: studentExercises,
        isVip: true,
        status: 'published'
      });

      setSuccessMsg(`Treino publicado com sucesso para ${targetStudentObj?.name || 'o aluno'} (${studentExercises.length} exercícios em ${availableSplits.length} divisões)!`);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar treino: ' + (err.message || 'Verifique a conexão'));
    } finally {
      setIsSaving(false);
    }
  };

  // Filtragem da biblioteca
  const filteredCatalog = EXERCISE_CATALOG.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchCatalog.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchCatalog.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  // Exercícios do split selecionado na tela de prescrição
  const splitExercises = studentExercises.filter(ex => (ex.split || 'A') === prescribeSplit);
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

          {/* Modal Cartão do Aluno Completo */}
          {viewingStudent && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <button onClick={() => setViewingStudent(null)} style={styles.modalCloseBtn}>
                  <X size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={styles.avatarLarge}>
                    {(viewingStudent.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>
                      {viewingStudent.name || 'Sem Nome'}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {viewingStudent.email} • {viewingStudent.plano || 'Plano Básico'}
                    </p>
                  </div>
                </div>

                {/* Sub-abas do Cartão */}
                <div style={styles.crmTabsRow}>
                  <button 
                    onClick={() => setCrmTab('geral')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'geral' ? styles.crmTabBtnActive : {}) }}
                  >
                    Contato & Financeiro
                  </button>
                  <button 
                    onClick={() => setCrmTab('medidas')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'medidas' ? styles.crmTabBtnActive : {}) }}
                  >
                    Avaliação Física
                  </button>
                  <button 
                    onClick={() => setCrmTab('treinos')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'treinos' ? styles.crmTabBtnActive : {}) }}
                  >
                    Ficha de Treinos
                  </button>
                </div>

                {/* Conteúdo: Geral */}
                {crmTab === 'geral' && (
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>Contato e Endereço</h4>
                      <p style={styles.crmText}>Telefone: <strong>{viewingStudent.telefone || 'Não informado'}</strong></p>
                      <p style={styles.crmText}>Endereço: <strong>{viewingStudent.endereco || 'Não informado'}</strong></p>
                      <p style={styles.crmText}>Plano: <strong style={{ color: 'var(--accent-primary)' }}>{viewingStudent.plano || 'Nenhum'}</strong></p>
                      <p style={styles.crmText}>Cadastro: <strong>{viewingStudent.data_cadastro ? new Date(viewingStudent.data_cadastro).toLocaleDateString('pt-BR') : 'N/I'}</strong></p>
                    </div>

                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>
                        Histórico Financeiro (Venc. Dia {viewingStudent.dia_vencimento || '?'})
                      </h4>
                      {!viewingStudent.historico_pagamentos || viewingStudent.historico_pagamentos.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Nenhum histórico financeiro gerado.</p>
                      ) : (
                        <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                          {viewingStudent.historico_pagamentos.map(parcela => (
                            <div key={parcela.id} style={styles.paymentRow}>
                              <div>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{parcela.mes}</span>
                                <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: parcela.status === 'Pago' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: parcela.status === 'Pago' ? '#22c55e' : '#ef4444' }}>
                                  {parcela.status}
                                </span>
                              </div>
                              <button 
                                onClick={() => {
                                  const novoStatus = parcela.status === 'Pago' ? 'Pendente' : 'Pago';
                                  const novoHistorico = viewingStudent.historico_pagamentos.map(p => p.id === parcela.id ? { ...p, status: novoStatus } : p);
                                  updateUser(viewingStudent.id, { historico_pagamentos: novoHistorico });
                                  setViewingStudent({ ...viewingStudent, historico_pagamentos: novoHistorico });
                                }}
                                style={styles.paymentToggleBtn}
                              >
                                Marcar como {parcela.status === 'Pago' ? 'Pendente' : 'Pago'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conteúdo: Medidas */}
                {crmTab === 'medidas' && (
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {(() => {
                      const allEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])];
                      const latestEval = allEvals.sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return dateB - dateA;
                      }).find(e => e.userId === viewingStudent?.id || e.student_id === viewingStudent?.id);
                      const studentEval = latestEval?.formData;

                      if (!studentEval) {
                        return (
                          <div style={styles.emptyBox}>
                            <p>Nenhuma Avaliação Física enviada por este aluno ainda.</p>
                          </div>
                        );
                      }

                      return (
                        <div style={styles.crmBox}>
                          <h4 style={styles.crmBoxTitle}>Perfil Fisiológico</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            <p style={styles.crmText}>Sexo: <strong>{studentEval.sexoBiologico || '-'}</strong></p>
                            <p style={styles.crmText}>Idade: <strong>{studentEval.idade || '-'} anos</strong></p>
                            <p style={styles.crmText}>Peso: <strong>{studentEval.peso || '-'} kg</strong></p>
                            <p style={styles.crmText}>Altura: <strong>{studentEval.altura || '-'} cm</strong></p>
                          </div>
                          <h5 style={{ margin: '8px 0 4px 0', color: 'var(--accent-primary)', fontSize: '0.85rem' }}>Objetivos e Rotina</h5>
                          <p style={styles.crmText}>Objetivo: <strong>{studentEval.objetivo || '-'}</strong></p>
                          <p style={styles.crmText}>Frequência: <strong>{studentEval.frequenciaSemanal || '-'} dias/sem</strong></p>
                          <p style={styles.crmText}>Tempo/Sessão: <strong>{studentEval.tempoSessao || '-'} min</strong></p>
                          {studentEval.lesoes && (
                            <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginTop: '8px' }}>
                              <p style={{ margin: 0, color: '#ef4444', fontSize: '0.8rem' }}><strong>⚠️ Histórico/Lesões:</strong> {studentEval.lesoes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Conteúdo: Treinos */}
                {crmTab === 'treinos' && (
                  <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {(() => {
                      const studentWorkout = workoutsByStudent[viewingStudent.id] || { exercises: DEFAULT_WORKOUTS };
                      const exList = studentWorkout.exercises || DEFAULT_WORKOUTS;
                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Total de Exercícios: <strong>{exList.length}</strong>
                            </span>
                            <button 
                              onClick={() => handleStartPrescription(viewingStudent.id)}
                              style={{ ...styles.actionBtn, background: 'var(--primary)', color: '#fff' }}
                            >
                              <Edit2 size={13} style={{ marginRight: '4px' }} /> Editar no Studio
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {exList.map((ex, idx) => (
                              <div key={ex.id || idx} style={styles.crmExerciseItem}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    {ex.name}
                                  </span>
                                  <span style={styles.splitTag}>Treino {ex.split || 'A'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                  <span>{ex.category} • {ex.reps} • {ex.load}</span>
                                  {ex.video_oficial_url && (
                                    <button 
                                      onClick={() => setPreviewVideoUrl(ex.video_oficial_url)}
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: 0 }}
                                    >
                                      <Play size={12} /> Ver Vídeo
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => { setViewingStudent(null); loginAsUser(viewingStudent); }} style={{ ...styles.saveBtn, flex: 1, padding: '10px' }} className="btn-primary">
                    <Activity size={15} /> Ver no Perfil Aluno
                  </button>
                  <button onClick={() => handleStartPrescription(viewingStudent.id)} style={{ ...styles.saveBtn, flex: 1, background: '#a78bfa', padding: '10px' }} className="btn-primary">
                    <Dumbbell size={15} /> Abrir Studio de Prescrição
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA DE PRESCREVER TREINOS (STUDIO COMPLETO) */}
      {activeTab === 'prescribe' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Barra Superior de Seleção de Aluno e Ações Globais */}
          <div style={styles.studioHeaderCard} className="glass">
            <div style={styles.studioHeaderTop}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                <Dumbbell size={28} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    SELECIONE O ALUNO PARA PRESCRIÇÃO:
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    style={styles.studioSelect}
                  >
                    <option value="">Selecione um aluno...</option>
                    {myStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email}) {s.plano ? `• Plano ${s.plano}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botões de Ação Rápida e Publicar */}
              <div style={styles.studioActionButtonsRow}>
                <button 
                  onClick={handleResetToDefault}
                  style={styles.actionBtnOutline}
                  title="Restaurar ficha padrão ABCDE com 10 exercícios completos"
                >
                  <RefreshCw size={14} /> Padrão ABCDE
                </button>
                <button 
                  onClick={handleClearAllExercises}
                  style={{ ...styles.actionBtnOutline, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  title="Limpar todos os exercícios deste treino"
                >
                  <Trash2 size={14} /> Limpar Ficha
                </button>
                <button 
                  onClick={handleConfirmWorkout}
                  disabled={isSaving}
                  style={styles.studioPublishBtn}
                  className="btn-primary"
                >
                  <Save size={18} />
                  {isSaving ? 'Gravando...' : `Confirmar & Publicar Treino (${studentExercises.length})`}
                </button>
              </div>
            </div>

            {/* Abas de Splits (Treino A, Treino B, Treino C...) */}
            <div style={styles.splitsTabBar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', marginRight: '6px' }}>
                  DIVISÕES:
                </span>
                {availableSplits.map(splitLetter => {
                  const count = studentExercises.filter(e => (e.split || 'A') === splitLetter).length;
                  const isActive = prescribeSplit === splitLetter;
                  return (
                    <button
                      key={splitLetter}
                      onClick={() => setPrescribeSplit(splitLetter)}
                      style={{
                        ...styles.splitTabButton,
                        ...(isActive ? styles.splitTabButtonActive : {})
                      }}
                    >
                      <span>Treino {splitLetter}</span>
                      <span style={{
                        ...styles.splitCountPill,
                        backgroundColor: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: isActive ? '#fff' : 'var(--text-secondary)'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
                <button 
                  onClick={handleAddNewSplit}
                  style={styles.addSplitBtn}
                  title="Adicionar mais uma divisão de treino (Split até Z)"
                >
                  <Plus size={14} /> Novo Split
                </button>
              </div>
            </div>
          </div>

          {/* BANNER EDUCATIVO DIDÁTICO: VÍDEO DO YOUTUBE VS GRAVAÇÃO NO CELULAR */}
          <div style={styles.videoInfoBanner} className="glass">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }}>
                <Smartphone size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💡 Dica de Ouro sobre Vídeos de Execução (Para Professores e Alunos):
                  </strong>
                  <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(139,92,246,0.15)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                    ⚡ 100% Gratuito / Sem custo de nuvem
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                      🌐 1. Links do YouTube / Shorts (Recomendado):
                    </strong>
                    Cole o link do YouTube nos exercícios. Abre instantaneamente no celular de qualquer aluno sem ocupar espaço de memória.
                  </div>
                  <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.06)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
                    <strong style={{ color: '#eab308', display: 'block', marginBottom: '2px' }}>
                      📱 2. Gravação Direta com a Câmera:
                    </strong>
                    Para não gastar armazenamento em nuvem, o vídeo fica salvo <strong>na memória do próprio celular onde foi gravado</strong>. Se for filmar o aluno na academia, <strong>grave direto pelo aplicativo no celular do próprio aluno</strong>!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Principal: Esquerda = Exercícios do Treino Atual | Direita = Biblioteca & Criação Livre */}
          <div style={styles.studioGrid}>
            
            {/* COLUNA DA ESQUERDA: EXERCÍCIOS DO SPLIT ATIVO */}
            <div style={styles.studioColumnLeft} className="glass">
              <div style={styles.columnHeader}>
                <div>
                  <h3 style={styles.columnTitle}>
                    Exercícios do Treino {prescribeSplit}
                  </h3>
                  <p style={styles.columnSubtitle}>
                    {splitExercises.length} exercício(s) configurados nesta divisão.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleRequestDeleteSplit(prescribeSplit)}
                    style={styles.deleteSplitBtn}
                    title={`Excluir toda a divisão do Treino ${prescribeSplit} e todos os seus exercícios`}
                  >
                    <Trash2 size={13} /> Excluir Treino {prescribeSplit}
                  </button>
                  <span style={styles.splitBigBadge}>
                    Divisão {prescribeSplit}
                  </span>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL DE ADICIONAR NOVO EXERCÍCIO AO SPLIT ATUAL */}
              <button
                type="button"
                onClick={handleAddNewExerciseToSplit}
                style={styles.addExerciseTopBtn}
                title={`Adicionar novo exercício ao Treino ${prescribeSplit}`}
              >
                <PlusCircle size={18} />
                <span>+ Adicionar Novo Exercício ao Treino {prescribeSplit}</span>
              </button>

              {splitExercises.length === 0 ? (
                <div style={styles.emptySplitBox}>
                  <Dumbbell size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ fontWeight: 'bold', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                    Nenhum exercício no Treino {prescribeSplit} ainda.
                  </p>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '320px', marginBottom: '16px' }}>
                    Adicione exercícios livres pelo botão abaixo, escolha na biblioteca ao lado ou crie um exercício personalizado!
                  </span>
                  <button
                    type="button"
                    onClick={handleAddNewExerciseToSplit}
                    style={{ ...styles.addExerciseTopBtn, marginBottom: 0, width: 'auto', padding: '10px 20px' }}
                  >
                    <Plus size={16} /> Adicionar Primeiro Exercício ao Treino {prescribeSplit}
                  </button>
                </div>
              ) : (
                <div style={styles.exercisesVerticalList}>
                  {splitExercises.map((ex, index) => (
                    <div key={ex.id || index} style={styles.exerciseCardItem}>
                      <div style={styles.exerciseCardTop}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={styles.exerciseIndexPill}>{index + 1}</span>
                          <input 
                            type="text"
                            value={ex.name}
                            onChange={(e) => handleUpdateExerciseField(ex.id, 'name', e.target.value)}
                            style={styles.exerciseNameInput}
                            placeholder="Nome do exercício (ex: Supino Reto)"
                          />
                        </div>
                        <span style={styles.exerciseCategoryBadge}>
                          {ex.category || 'Geral'}
                        </span>
                      </div>

                      {/* Linha de Metas: Séries/Reps e Carga */}
                      <div style={styles.exerciseMetaRow}>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <label style={styles.microLabel}>Séries & Reps:</label>
                          <input 
                            type="text"
                            value={ex.reps || ''}
                            onChange={(e) => handleUpdateExerciseField(ex.id, 'reps', e.target.value)}
                            style={styles.metaInput}
                            placeholder="Ex: 4x10-12"
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <label style={styles.microLabel}>Carga Sugerida:</label>
                          <input 
                            type="text"
                            value={ex.load || ''}
                            onChange={(e) => handleUpdateExerciseField(ex.id, 'load', e.target.value)}
                            style={styles.metaInput}
                            placeholder="Ex: 20kg cada lado"
                          />
                        </div>
                      </div>

                      {/* Linha do Vídeo Oficial Recomendado pelo Professor com Câmera e Galeria Diretas */}
                      <div style={styles.videoConfigRow}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <label style={styles.microLabel}>
                              <Video size={12} style={{ display: 'inline', marginRight: '4px' }} />
                              Vídeo do Exercício (YouTube ou Gravação do Celular):
                            </label>
                            
                            {/* Botões Diretos de Gravação e Galeria */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <label style={styles.quickMediaBtn} title="Gravar execução agora com a câmera do celular">
                                <Camera size={13} color="var(--primary)" />
                                <span>Gravar</span>
                                <input 
                                  type="file" 
                                  accept="video/*" 
                                  capture="environment" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleDirectVideoUpload(ex.id, e.target.files?.[0])}
                                />
                              </label>

                              <label style={styles.quickMediaBtn} title="Escolher vídeo gravado da galeria">
                                <Upload size={13} color="var(--accent-primary)" />
                                <span>Galeria</span>
                                <input 
                                  type="file" 
                                  accept="video/*" 
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleDirectVideoUpload(ex.id, e.target.files?.[0])}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => setEditingVideoExercise(ex)}
                                style={styles.quickMediaBtn}
                                title="Buscar sugestões automáticas ou gerenciar vídeo"
                              >
                                <Sparkles size={13} color="#eab308" />
                                <span>Sugestões</span>
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input 
                              type="text"
                              value={ex.video_oficial_url || ''}
                              onChange={(e) => handleUpdateExerciseField(ex.id, 'video_oficial_url', e.target.value)}
                              style={{ ...styles.metaInput, flex: 1, fontSize: '0.8rem' }}
                              placeholder="Cole o link do YouTube/Shorts ou grave pelo botão acima"
                            />
                            {ex.video_oficial_url && (
                              <button 
                                type="button"
                                onClick={() => setPreviewVideoUrl(ex.video_oficial_url)}
                                style={styles.previewPlayBtn}
                                title="Testar e reproduzir vídeo"
                              >
                                <Play size={14} /> Ver
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Linha de Ações: Mover de Split ou Excluir */}
                      <div style={styles.exerciseCardBottom}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mover:</span>
                          {availableSplits.filter(s => s !== prescribeSplit).map(targetSplit => (
                            <button
                              key={targetSplit}
                              type="button"
                              onClick={() => handleMoveSplit(ex.id, targetSplit)}
                              style={styles.moveSplitPill}
                              title={`Mover para Treino ${targetSplit}`}
                            >
                              {targetSplit}
                            </button>
                          ))}
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          style={styles.deleteExBtn}
                          title="Remover exercício da ficha"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* BOTÃO NO RODAPÉ PARA ADICIONAR MAIS EXERCÍCIOS AO SPLIT */}
                  <button
                    type="button"
                    onClick={handleAddNewExerciseToSplit}
                    style={styles.addExerciseBottomBtn}
                    title={`Adicionar mais um exercício ao Treino ${prescribeSplit}`}
                  >
                    <PlusCircle size={16} />
                    <span>+ Adicionar Mais um Exercício ao Treino {prescribeSplit}</span>
                  </button>
                </div>
              )}
            </div>

            {/* COLUNA DA DIREITA: BIBLIOTECA & CRIAÇÃO LIVRE */}
            <div style={styles.studioColumnRight}>
              
              {/* Card 1: Criar Exercício Personalizado Livre */}
              <div style={styles.studioCardRight} className="glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={18} color="var(--accent-primary)" />
                  <h3 style={styles.columnTitleSmall}>
                    Criar Exercício Personalizado / Livre
                  </h3>
                </div>
                <form onSubmit={handleAddCustomExercise} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={styles.microLabel}>Nome do Exercício:</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Agachamento Búlgaro com Halteres"
                      value={customExercise.name}
                      onChange={(e) => setCustomExercise(prev => ({ ...prev, name: e.target.value }))}
                      style={styles.input}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={styles.microLabel}>Grupo Muscular:</label>
                      <select 
                        value={customExercise.category}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, category: e.target.value }))}
                        style={styles.select}
                      >
                        {EXERCISE_CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={styles.microLabel}>Séries & Reps:</label>
                      <input 
                        type="text"
                        placeholder="Ex: 4x10-12"
                        value={customExercise.reps}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, reps: e.target.value }))}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={styles.microLabel}>Carga Inicial:</label>
                      <input 
                        type="text"
                        placeholder="Ex: 14kg cada halter"
                        value={customExercise.load}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, load: e.target.value }))}
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.microLabel}>Vídeo YouTube (Opcional):</label>
                      <input 
                        type="text"
                        placeholder="Link do YouTube / Shorts"
                        value={customExercise.video_oficial_url}
                        onChange={(e) => setCustomExercise(prev => ({ ...prev, video_oficial_url: e.target.value }))}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    style={styles.addCustomBtn}
                    className="btn-primary"
                  >
                    <Plus size={16} /> Adicionar ao Treino {prescribeSplit}
                  </button>
                </form>
              </div>

              {/* Card 2: Biblioteca Completa Fit Seven */}
              <div style={styles.studioCardRight} className="glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--primary)" />
                    <h3 style={styles.columnTitleSmall}>
                      Biblioteca de Exercícios ({filteredCatalog.length})
                    </h3>
                  </div>
                </div>

                {/* Barra de Busca e Filtros de Categoria */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={styles.searchBox}>
                    <Search size={16} color="var(--text-secondary)" />
                    <input 
                      type="text"
                      value={searchCatalog}
                      onChange={(e) => setSearchCatalog(e.target.value)}
                      placeholder="Buscar por nome ou músculo..."
                      style={styles.searchInput}
                    />
                    {searchCatalog && (
                      <button onClick={() => setSearchCatalog('')} style={styles.clearSearchBtn}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div style={styles.categoryPillsScroll}>
                    {EXERCISE_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          ...styles.categoryFilterPill,
                          ...(selectedCategory === cat ? styles.categoryFilterPillActive : {})
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de Cards da Biblioteca */}
                <div style={styles.catalogScrollList}>
                  {filteredCatalog.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum exercício encontrado com os filtros atuais.
                    </div>
                  ) : (
                    filteredCatalog.map(item => {
                      const alreadyInSplit = splitExercises.some(e => e.name.toLowerCase() === item.name.toLowerCase());
                      return (
                        <div key={item.id} style={styles.catalogItemCard}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                {item.name}
                              </strong>
                              {alreadyInSplit && (
                                <span style={styles.alreadyInSplitBadge}>
                                  <Check size={10} /> No Treino {prescribeSplit}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>{item.reps}</span>
                              <span>•</span>
                              <span>{item.load}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.video_oficial_url && (
                              <button 
                                type="button"
                                onClick={() => setPreviewVideoUrl(item.video_oficial_url)}
                                style={styles.catalogVideoBtn}
                                title="Assistir vídeo de execução"
                              >
                                <Play size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleAddFromCatalog(item)}
                              style={styles.catalogAddBtn}
                              title={`Adicionar ao Treino ${prescribeSplit}`}
                            >
                              <Plus size={14} /> Treino {prescribeSplit}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Modal de Confirmação Segura para Exclusão de Treino Completo (Split) */}
          {splitToDelete && (() => {
            const countToDelete = studentExercises.filter(e => (e.split || 'A') === splitToDelete).length;
            const currentStudentObj = myStudents.find(s => s.id === selectedStudent);
            return (
              <div style={styles.modalOverlay} className="animate-fade-in">
                <div style={{ ...styles.modalCard, maxWidth: '460px' }} className="glass">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '10px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={26} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                        Excluir Treino {splitToDelete} por Completo?
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Aluno: <strong>{currentStudentObj?.name || 'Aluno Selecionado'}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.88rem', color: '#f87171', fontWeight: 'bold' }}>
                      ⚠️ Atenção: Esta ação excluirá toda a divisão do Treino {splitToDelete}.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Todos os <strong>{countToDelete} exercício(s)</strong> cadastrados nesta letra serão removidos da ficha. Se você só queria excluir um exercício individual, utilize a lixeira ao lado daquele exercício.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSplitToDelete(null)}
                      style={styles.cancelBtn}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteSplit}
                      style={styles.confirmDeleteSplitBtn}
                      className="btn-danger"
                    >
                      <Trash2 size={16} /> Sim, Excluir Treino {splitToDelete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
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

      {/* Modal de Preview de Vídeo */}
      {previewVideoUrl && (() => {
        const isDirect = previewVideoUrl.startsWith('data:video') || previewVideoUrl.startsWith('blob:') || previewVideoUrl.endsWith('.mp4');
        return (
          <div style={styles.modalOverlay} onClick={() => setPreviewVideoUrl(null)}>
            <div style={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={18} color="var(--primary)" /> Demonstração da Execução
                </h4>
                <button onClick={() => setPreviewVideoUrl(null)} style={styles.modalCloseBtn}>
                  <X size={20} />
                </button>
              </div>
              <div style={styles.videoWrapper}>
                {isDirect ? (
                  <video
                    src={previewVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#000' }}
                  />
                ) : (
                  <iframe
                    src={previewVideoUrl}
                    title="Preview do Exercício"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', borderRadius: '8px' }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL INTELIGENTE DE GESTÃO / SUGESTÕES / GRAVAÇÃO DE VÍDEO (PROFESSOR) */}
      {editingVideoExercise && (
        <ExerciseVideoManagerModal
          exercise={editingVideoExercise}
          onSave={handleSaveExerciseVideo}
          onClose={() => setEditingVideoExercise(null)}
        />
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
    paddingBottom: '8px',
    overflowX: 'auto'
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
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
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
  // Studio Prescrição Styles
  studioHeaderCard: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  studioHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  studioSelect: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    fontWeight: '600',
    outline: 'none'
  },
  studioActionButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },
  actionBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  studioPublishBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)'
  },
  splitsTabBar: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px'
  },
  splitTabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  splitTabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)'
  },
  splitCountPill: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px'
  },
  addSplitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-color)',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  studioGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)',
    gap: '24px',
    alignItems: 'start'
  },
  studioColumnLeft: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    minHeight: '400px'
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '12px'
  },
  columnTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    margin: 0,
    color: 'var(--text-primary)'
  },
  columnSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    margin: '4px 0 0 0'
  },
  splitBigBadge: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)'
  },
  emptySplitBox: {
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-color)'
  },
  exercisesVerticalList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  exerciseCardItem: {
    padding: '16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s'
  },
  exerciseCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  exerciseIndexPill: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  exerciseNameInput: {
    flex: 1,
    fontWeight: '700',
    fontSize: '0.95rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px dashed rgba(255,255,255,0.2)',
    color: 'var(--text-primary)',
    padding: '4px 0',
    outline: 'none'
  },
  exerciseCategoryBadge: {
    fontSize: '0.75rem',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    fontWeight: '600'
  },
  exerciseMetaRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  microLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    marginBottom: '3px',
    display: 'block'
  },
  metaInput: {
    width: '100%',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none'
  },
  videoConfigRow: {
    padding: '8px 10px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  previewPlayBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  exerciseCardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '8px'
  },
  moveSplitPill: {
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  deleteExBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  studioColumnRight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  studioCardRight: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)'
  },
  columnTitleSmall: {
    fontSize: '1.05rem',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-primary)'
  },
  addCustomBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '6px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    marginBottom: '8px'
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  categoryPillsScroll: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '6px'
  },
  categoryFilterPill: {
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  categoryFilterPillActive: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: '#fff'
  },
  catalogScrollList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '380px',
    overflowY: 'auto'
  },
  catalogItemCard: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },
  alreadyInSplitBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '0.65rem',
    padding: '1px 5px',
    borderRadius: '4px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    fontWeight: 'bold'
  },
  catalogVideoBtn: {
    padding: '6px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  catalogAddBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: 'var(--primary)',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  // Alunos e CRM Modals
  card: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
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
  select: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    gap: '12px'
  },
  saveBtn: {
    padding: '10px 20px',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
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
    cursor: 'pointer',
  },
  tableResponsive: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  tableCellHeader: {
    padding: '12px 16px',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    padding: '14px 16px',
    fontSize: '0.9rem',
  },
  vipBadge: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    color: '#eab308',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px'
  },
  tenantBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  actionsGroup: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  iconBtn: {
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyBox: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    textAlign: 'center'
  },
  // Modal CRM
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },
  modalContent: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '24px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '540px',
    border: '1px solid var(--border-color)',
    position: 'relative'
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  avatarLarge: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#fff'
  },
  crmTabsRow: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    marginBottom: '16px'
  },
  crmTabBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  crmTabBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: 'var(--primary)'
  },
  crmBox: {
    background: 'var(--bg-primary)',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '14px'
  },
  crmBoxTitle: {
    margin: '0 0 10px 0',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
    fontSize: '0.95rem'
  },
  crmText: {
    margin: '0 0 6px 0',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem'
  },
  paymentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  paymentToggleBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem'
  },
  crmExerciseItem: {
    padding: '10px 12px',
    backgroundColor: 'var(--bg-primary)',
    borderRadius: '6px',
    border: '1px solid var(--border-color)'
  },
  splitTag: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    color: 'var(--primary)',
    padding: '2px 6px',
    borderRadius: '4px'
  },
  // Video Modal
  videoModalContent: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '20px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '640px',
    border: '1px solid var(--border-color)',
    position: 'relative'
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '360px',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  videoInfoBanner: {
    padding: '16px 20px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  deleteSplitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  confirmDeleteSplitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  modalCard: {
    backgroundColor: 'var(--bg-secondary)',
    padding: '24px',
    borderRadius: '16px',
    width: '100%',
    border: '1px solid var(--border-color)',
    position: 'relative'
  },
  addExerciseTopBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    border: '1px dashed var(--primary)',
    color: 'var(--primary)',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'all 0.2s ease'
  },
  addExerciseBottomBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px dashed var(--border-color)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.2s ease'
  },
  quickMediaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default Professor;
