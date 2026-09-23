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
  Film,
  Ruler,
  Scale,
  FileText,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Phone,
  MessageCircle,
  Copy,
  MapPin,
  CreditCard,
  Briefcase,
  ShieldCheck,
  LogOut,
  Home,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  EXERCISE_CATALOG, 
  EXERCISE_CATEGORIES, 
  formatVideoEmbedUrl 
} from '../utils/videoService';
import { formatCPF, formatPhone, validateCPF } from '../utils/validators';
import ExerciseVideoManagerModal from '../components/ExerciseVideoManagerModal';

const InstagramIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const SILHOUETTES = {
  masculino: {
    frente: '/fit-seven/assets/silhouettes/masculino_frente.jpg',
    costas: '/fit-seven/assets/silhouettes/masculino_costas.png',
    perfil: '/fit-seven/assets/silhouettes/masculino_perfil.jpg'
  },
  feminino: {
    frente: '/fit-seven/assets/silhouettes/feminino_frente.jpg',
    costas: '/fit-seven/assets/silhouettes/feminino_costas.png',
    perfil: '/fit-seven/assets/silhouettes/feminino_perfil.jpg'
  }
};

const INITIAL_EVAL_DATA = {
  nome: '',
  objetivo: 'hipertrofia',
  sexoBiologico: 'masculino',
  idade: '',
  descricaoRotina: '',
  peso: '',
  altura: '',
  pescoco: '',
  peitoral: '',
  cintura: '',
  abdomen: '',
  quadril: '',
  braçoEsq: '',
  braçoDir: '',
  coxaEsqSuperior: '',
  coxaEsqInferior: '',
  coxaDirSuperior: '',
  coxaDirInferior: '',
  panturrilhaEsq: '',
  panturrilhaDir: '',
  frequenciaSemanal: '3',
  nivelExperiencia: 'intermediario',
  horasSono: '7',
  refeicoesDiarias: '4',
  tempoSessao: '60',
  equipamentos: 'completa',
  lesoes: '',
  preferencias: '',
  restricoesAlimentares: '',
  preferenciasAlimentares: '',
  qualidadeSono: '5',
  hidratacaoAtual: '2.5',
  suplementos: '',
  nivelAtividade: 'sentado',
  parqCardiaco: 'nao',
  parqDorPeito: 'nao',
  parqMedicamento: 'nao',
  parqTermo: true,
  percentualGordura: '',
  massaMagra: '',
  gorduraVisceral: '',
  fcRepouso: '',
  laudoFile: null,
  laudoFileBase64: '',
  fotoFrente: '',
  fotoFrenteBase64: '',
  fotoCostas: '',
  fotoCostasBase64: '',
  fotoPerfil: '',
  fotoPerfilBase64: ''
};

const Professor = () => {
  const { 
    user, 
    usersList, 
    tenants, 
    addUser, 
    updateUser, 
    updateUserProfile,
    deleteUser,
    loginAsUser, 
    logout,
    activeTenantId, 
    activeTenant,
    pendingEvaluations,
    approveAndPublishWorkout,
    workoutsByStudent,
    updateWorkoutByProfessor,
    approvedEvaluations,
    workoutSessionsHistory,
    submitEvaluation,
    preRegisterUser,
    approveStudentLink,
    rejectStudentLink,
    generateWhatsAppInvite
  } = useApp();

  const [activeTab, setActiveTab] = useState('alunos'); // 'alunos', 'prescribe', 'anamnese', 'planos', 'financeiro', 'perfil'
  const [successMsg, setSuccessMsg] = useState('');
  
  // Histórico de Navegação e Prevenção de Saída
  const [navHistory, setNavHistory] = useState(['alunos']);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

  // Perfil do Professor (Estado editável)
  const [profProfileForm, setProfProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cref: user?.cref || '',
    bio: user?.bio || '',
    especialidades: user?.especialidades || '',
    whatsapp: user?.whatsapp || '',
    instagram: user?.instagram || '',
    chavePix: user?.chavePix || '',
    bancoPix: user?.bancoPix || '',
    titularPix: user?.titularPix || '',
    videoApresentacaoUrl: user?.videoApresentacaoUrl || '',
    videoIncentivoUrl: user?.videoIncentivoUrl || '',
    fotoPerfil: user?.fotoPerfil || ''
  });
  const [isSavingProfProfile, setIsSavingProfProfile] = useState(false);
  const [copiedPixProf, setCopiedPixProf] = useState(false);

  // Sincroniza profProfileForm quando user mudar
  useEffect(() => {
    if (user) {
      setProfProfileForm({
        name: user.name || '',
        email: user.email || '',
        cref: user.cref || '',
        bio: user.bio || '',
        especialidades: user.especialidades || '',
        whatsapp: user.whatsapp || '',
        instagram: user.instagram || '',
        chavePix: user.chavePix || '',
        bancoPix: user.bancoPix || '',
        titularPix: user.titularPix || '',
        videoApresentacaoUrl: user.videoApresentacaoUrl || '',
        videoIncentivoUrl: user.videoIncentivoUrl || '',
        fotoPerfil: user.fotoPerfil || ''
      });
    }
  }, [user]);

  // Alunos vinculados e solicitações pendentes de aprovação
  const pendingStudentLinks = (usersList || []).filter(u => u.role === 'aluno' && (u.tenantId === user?.id || u.tenantId === user?.tenantId) && u.statusVinculo === 'pendente_aprovacao');
  const myStudents = (usersList || []).filter(u => u.role === 'aluno' && (u.tenantId === user?.id || u.tenantId === user?.tenantId) && u.statusVinculo !== 'pendente_aprovacao' && u.statusVinculo !== 'recusado');
  const ownStudentsCount = myStudents.filter(u => u.tenantId === user?.id).length;
  const maxLimit = user?.limiteAlunos || 10;

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
  const [editingVideoExercise, setEditingVideoExercise] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Alunos CRUD & Modal de Convite WhatsApp
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', whatsapp: '', cpf: '', password: '123', plano: '', dia_vencimento: '10' });
  const [createdInviteModal, setCreatedInviteModal] = useState(null);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  // Custom Plans states
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');

  // Cartão do Aluno CRM Super Completo
  const [viewingStudent, setViewingStudent] = useState(null);
  const [crmTab, setCrmTab] = useState('contato'); // 'contato', 'financeiro', 'medidas', 'treinos', 'anotacoes'
  const [editingStudentProfile, setEditingStudentProfile] = useState(null);
  const [isSavingStudentCRM, setIsSavingStudentCRM] = useState(false);
  const [copiedPixStudent, setCopiedPixStudent] = useState(false);

  // Sincroniza editingStudentProfile quando viewingStudent mudar
  useEffect(() => {
    if (viewingStudent) {
      setEditingStudentProfile({
        ...viewingStudent,
        telefone: viewingStudent.telefone || '',
        whatsapp: viewingStudent.whatsapp || viewingStudent.telefone || '',
        cpf: viewingStudent.cpf || '',
        dataNascimento: viewingStudent.dataNascimento || '',
        endereco: viewingStudent.endereco || '',
        cidade: viewingStudent.cidade || '',
        chavePix: viewingStudent.chavePix || '',
        tipoChavePix: viewingStudent.tipoChavePix || 'CPF',
        contatoEmergenciaNome: viewingStudent.contatoEmergenciaNome || '',
        contatoEmergenciaTel: viewingStudent.contatoEmergenciaTel || '',
        anotacoesProfessor: viewingStudent.anotacoesProfessor || '',
        fotoPerfil: viewingStudent.fotoPerfil || ''
      });
    } else {
      setEditingStudentProfile(null);
    }
  }, [viewingStudent]);

  // Anamnese & Avaliação Física states (Professor)
  const [selectedStudentForEval, setSelectedStudentForEval] = useState('');
  const [evalViewMode, setEvalViewMode] = useState('form'); // 'form' ou 'history'
  const [evalFormData, setEvalFormData] = useState(INITIAL_EVAL_DATA);
  const [activeAccordion, setActiveAccordion] = useState('identificacao');
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evalZoomPhoto, setEvalZoomPhoto] = useState(null);

  // Revisão IA state
  const [reviewingStudentId, setReviewingStudentId] = useState(null);
  const [reviewWorkoutData, setReviewWorkoutData] = useState(null);

  // Interceptação do botão Voltar do Celular / Navegador para prevenir saída acidental
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);

      const handlePopState = () => {
        if (evalZoomPhoto) {
          setEvalZoomPhoto(null);
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        if (previewVideoUrl) {
          setPreviewVideoUrl(null);
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        if (splitToDelete) {
          setSplitToDelete(null);
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        if (editingVideoExercise) {
          setEditingVideoExercise(null);
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        if (viewingStudent) {
          setViewingStudent(null);
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        if (showForm) {
          setShowForm(false);
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        if (activeTab !== 'alunos') {
          setActiveTab('alunos');
          window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
          return;
        }
        // Se estiver na tela raiz (aba alunos), abre o modal de confirmação de saída
        setShowExitConfirmModal(true);
        window.history.pushState({ app: 'fitseven_prof' }, '', window.location.href);
      };

      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Deseja realmente sair da aplicação Fit Seven?';
        return 'Deseja realmente sair da aplicação Fit Seven?';
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [evalZoomPhoto, previewVideoUrl, splitToDelete, editingVideoExercise, viewingStudent, showForm, activeTab]);

  // Função de navegação com registro de histórico
  const navigateToTab = (tabId) => {
    if (tabId !== activeTab) {
      setNavHistory(prev => [...prev, tabId]);
      setActiveTab(tabId);
      setShowForm(false);
    }
  };

  const handleGoBack = () => {
    if (viewingStudent) {
      setViewingStudent(null);
      return;
    }
    if (showForm) {
      setShowForm(false);
      return;
    }
    if (evalViewMode === 'history' && activeTab === 'anamnese') {
      setEvalViewMode('form');
      return;
    }
    if (navHistory.length > 1) {
      const newHistory = [...navHistory];
      newHistory.pop();
      const previousTab = newHistory[newHistory.length - 1];
      setNavHistory(newHistory);
      setActiveTab(previousTab);
    } else if (activeTab !== 'alunos') {
      setActiveTab('alunos');
      setNavHistory(['alunos']);
    } else {
      setShowExitConfirmModal(true);
    }
  };

  // Sincronizar aluno selecionado para avaliação física
  useEffect(() => {
    if (!selectedStudentForEval && myStudents.length > 0) {
      setSelectedStudentForEval(myStudents[0].id);
    }
  }, [myStudents, selectedStudentForEval]);

  useEffect(() => {
    if (selectedStudentForEval) {
      const studentObj = myStudents.find(s => s.id === selectedStudentForEval);
      const allEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])];
      const latestEval = allEvals.find(e => e.userId === selectedStudentForEval || e.student_id === selectedStudentForEval);
      
      if (latestEval?.formData) {
        const prevData = { ...latestEval.formData };
        delete prevData.fotoFrente;
        delete prevData.fotoFrenteBase64;
        delete prevData.fotoCostas;
        delete prevData.fotoCostasBase64;
        delete prevData.fotoPerfil;
        delete prevData.fotoPerfilBase64;
        delete prevData.laudoFile;
        delete prevData.laudoFileBase64;
        setEvalFormData({
          ...INITIAL_EVAL_DATA,
          ...prevData,
          nome: studentObj?.name || prevData.nome || '',
          parqTermo: true
        });
      } else if (studentObj) {
        setEvalFormData({
          ...INITIAL_EVAL_DATA,
          nome: studentObj.name || ''
        });
      }
    }
  }, [selectedStudentForEval, approvedEvaluations, pendingEvaluations]);

  const handleEvalInputChange = (field, value) => {
    setEvalFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEvalPhotoUpload = (photoType, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEvalFormData(prev => ({
        ...prev,
        [`foto${photoType}`]: file.name,
        [`foto${photoType}Base64`]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEvaluation = async (actionType = 'save_only') => {
    if (!selectedStudentForEval) {
      alert('Por favor, selecione um aluno para registrar a avaliação.');
      return;
    }
    const studentObj = myStudents.find(s => s.id === selectedStudentForEval);
    if (!studentObj) return;

    if (!evalFormData.peso || !evalFormData.altura) {
      alert('Por favor, preencha ao menos o Peso (kg) e a Altura (cm) do aluno.');
      return;
    }

    setIsSubmittingEval(true);
    try {
      const savedEval = await submitEvaluation(evalFormData, studentObj);

      if (actionType === 'save_and_ai') {
        if (savedEval?.id) {
          await approveAndPublishWorkout(savedEval.id, { isVip: true });
        }
        setSuccessMsg(`Avaliação salva e treino gerado pela Inteligência Artificial para ${studentObj.name}!`);
        setTimeout(() => setSuccessMsg(''), 4500);
        setSelectedStudent(studentObj.id);
        setActiveTab('prescribe');
      } else if (actionType === 'save_and_studio') {
        setSuccessMsg(`Avaliação de ${studentObj.name} salva! Abrindo o Studio de Prescrição...`);
        setTimeout(() => setSuccessMsg(''), 3500);
        setSelectedStudent(studentObj.id);
        setActiveTab('prescribe');
      } else {
        setSuccessMsg(`Avaliação física de ${studentObj.name} registrada com sucesso!`);
        setTimeout(() => setSuccessMsg(''), 3500);
        setEvalViewMode('history');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao registrar avaliação física: ' + (err.message || 'Verifique sua conexão'));
    } finally {
      setIsSubmittingEval(false);
    }
  };

  const handleStartAnamneseForStudent = (studentId) => {
    setSelectedStudentForEval(studentId);
    setEvalViewMode('form');
    setActiveTab('anamnese');
    setViewingStudent(null);
  };

  // Handlers do Perfil do Professor
  const handleProfPhotoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfProfileForm(prev => ({ ...prev, fotoPerfil: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfVideoUpload = (videoType, file) => {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      alert('Aviso: O vídeo é grande (>30MB). Recomendamos vídeos de até 15 segundos.');
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfProfileForm(prev => ({ 
        ...prev, 
        [videoType === 'incentivo' ? 'videoIncentivoUrl' : 'videoApresentacaoUrl']: reader.result 
      }));
      setSuccessMsg('Vídeo carregado com sucesso! Clique em "Salvar Meu Perfil" para publicar.');
      setTimeout(() => setSuccessMsg(''), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSavingProfProfile(true);
    try {
      await updateUserProfile(user.id, {
        ...profProfileForm,
        videoApresentacaoUrl: formatVideoEmbedUrl(profProfileForm.videoApresentacaoUrl),
        videoIncentivoUrl: formatVideoEmbedUrl(profProfileForm.videoIncentivoUrl)
      });
      setSuccessMsg('Seu perfil profissional e cartão de apresentação foram salvos com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar perfil: ' + (err.message || 'Verifique sua conexão.'));
    } finally {
      setIsSavingProfProfile(false);
    }
  };

  // Handlers do CRM do Aluno
  const handleStudentCRMPhotoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditingStudentProfile(prev => ({ ...prev, fotoPerfil: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStudentCRM = async (e) => {
    if (e) e.preventDefault();
    if (!viewingStudent || !editingStudentProfile) return;
    setIsSavingStudentCRM(true);
    try {
      const updated = await updateUserProfile(viewingStudent.id, editingStudentProfile);
      setViewingStudent(updated || editingStudentProfile);
      setSuccessMsg(`Dados cadastrais de ${editingStudentProfile.name} atualizados com sucesso!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar aluno: ' + (err.message || 'Tente novamente.'));
    } finally {
      setIsSavingStudentCRM(false);
    }
  };

  const handleCopyPix = (pixKey, isProf = true) => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    if (isProf) {
      setCopiedPixProf(true);
      setTimeout(() => setCopiedPixProf(false), 2500);
    } else {
      setCopiedPixStudent(true);
      setTimeout(() => setCopiedPixStudent(false), 2500);
    }
  };

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

  // CRUD & Convite Handlers
  const openAddStudent = () => {
    if (ownStudentsCount >= maxLimit) {
      alert(`Você atingiu o limite de ${maxLimit} vagas do seu plano. Faça um upgrade de plano ou libere vagas para adicionar novos alunos.`);
      return;
    }
    setStudentForm({ name: '', email: '', whatsapp: '', cpf: '', password: '123', plano: '', dia_vencimento: '10' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditStudent = (student) => {
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      whatsapp: student.whatsapp || student.telefone || '',
      cpf: student.cpf || '',
      password: student.password || '123',
      plano: student.plano || '',
      dia_vencimento: student.dia_vencimento || '10'
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, studentForm);
        setSuccessMsg('Cadastro do aluno atualizado com sucesso!');
        setTimeout(() => setSuccessMsg(''), 3500);
        setShowForm(false);
      } else {
        const newStudent = await preRegisterUser({
          ...studentForm,
          role: 'aluno',
          tenantId: user.id
        }, user);

        const whatsAppUrl = generateWhatsAppInvite(newStudent, user);
        const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://tonyddayvd.github.io/fit-seven/';
        const inviteUrl = `${baseUrl}?invite=true&userId=${newStudent.id}&profName=${encodeURIComponent(user.name)}`;

        setCreatedInviteModal({
          student: newStudent,
          whatsAppUrl,
          inviteUrl
        });

        setSuccessMsg(`Aluno ${newStudent.name} pré-cadastrado com sucesso!`);
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar aluno: ' + (err.message || 'Verifique os dados.'));
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      await approveStudentLink(studentId, user.id);
      setSuccessMsg('Vínculo do aluno aprovado com sucesso! Acesso aos treinos liberado.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Erro ao aprovar aluno.');
    }
  };

  const handleRejectStudent = async (studentId) => {
    if (confirm('Deseja realmente recusar a solicitação de vínculo deste aluno?')) {
      try {
        await rejectStudentLink(studentId);
        setSuccessMsg('Solicitação de vínculo recusada.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        alert(err.message || 'Erro ao recusar aluno.');
      }
    }
  };

  const handleSendExistingStudentInvite = (student) => {
    const whatsAppUrl = generateWhatsAppInvite(student, user);
    const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://tonyddayvd.github.io/fit-seven/';
    const inviteUrl = `${baseUrl}?invite=true&userId=${student.id}&profName=${encodeURIComponent(user.name)}`;

    setCreatedInviteModal({
      student,
      whatsAppUrl,
      inviteUrl
    });
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
      {/* Barra de Navegação Interna & Proteção de Saída */}
      <div style={styles.navBarTop} className="glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleGoBack}
            style={styles.navBackBtn}
            title="Voltar à tela anterior"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
          
          <div style={styles.navBreadcrumb}>
            <span style={{ color: 'var(--text-muted)' }}>Painel</span>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
              {activeTab === 'alunos' && (viewingStudent ? `Ficha de ${viewingStudent.name}` : 'Meus Alunos')}
              {activeTab === 'anamnese' && 'Anamnese & Avaliações Físicas'}
              {activeTab === 'prescribe' && `Prescrição Studio (Treino ${prescribeSplit})`}
              {activeTab === 'planos' && 'Configuração de Planos'}
              {activeTab === 'financeiro' && 'Gestão Financeira & MRR'}
              {activeTab === 'revisao' && 'Revisão de Treinos por IA'}
              {activeTab === 'perfil' && 'Meu Perfil & Apresentação Profissional'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeTab !== 'alunos' && (
            <button 
              onClick={() => navigateToTab('alunos')} 
              style={styles.quickHomeBtn}
              title="Voltar para a Lista de Alunos"
            >
              <Users size={14} />
              <span>Lista de Alunos</span>
            </button>
          )}
          <button 
            onClick={() => setShowExitConfirmModal(true)}
            style={styles.exitAppBtn}
            title="Sair do aplicativo com segurança"
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Cabeçalho do Painel */}
      <div style={styles.headerCard} className="glass">
        <div style={styles.headerTitleRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={styles.profHeaderAvatar}>
              {user?.fotoPerfil ? (
                <img src={user.fotoPerfil} alt={user.name} style={styles.profHeaderAvatarImg} />
              ) : (
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {(user?.name || 'P').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ ...styles.title, margin: 0 }}>{user?.name || 'Professor'}</h2>
                {user?.cref && (
                  <span style={styles.crefBadge}>
                    <ShieldCheck size={12} /> CREF: {user.cref}
                  </span>
                )}
                <span style={styles.planBadge}>{user?.plano || 'Básico'}</span>
              </div>
              <p style={{ ...styles.subtitle, margin: '4px 0 0 0' }}>
                Painel Profissional de Gestão de Alunos, Prescrições e Avaliações Físicas
              </p>
            </div>
          </div>

          {/* Barra de progresso do limite de alunos */}
          <div style={styles.limitCard}>
            <div style={styles.limitMeta}>
              <span>Vagas Utilizadas:</span>
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
          onClick={() => navigateToTab('alunos')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'alunos' ? styles.tabButtonActive : {})
          }}
        >
          <Users size={16} />
          Meus Alunos ({myStudents.length})
        </button>
        <button 
          onClick={() => navigateToTab('anamnese')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'anamnese' ? styles.tabButtonActive : {})
          }}
        >
          <Ruler size={16} />
          Anamnese & Avaliações
        </button>
        <button 
          onClick={() => navigateToTab('prescribe')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'prescribe' ? styles.tabButtonActive : {})
          }}
        >
          <Dumbbell size={16} />
          Prescrever Treino
        </button>
        <button 
          onClick={() => navigateToTab('perfil')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'perfil' ? styles.tabButtonActive : {})
          }}
        >
          <User size={16} />
          Meu Perfil & Apresentação
        </button>
        <button 
          onClick={() => navigateToTab('planos')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'planos' ? styles.tabButtonActive : {})
          }}
        >
          <ClipboardList size={16} />
          Meus Planos
        </button>
        <button 
          onClick={() => navigateToTab('financeiro')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'financeiro' ? styles.tabButtonActive : {})
          }}
        >
          <Award size={16} />
          Financeiro
        </button>
        <button 
          onClick={() => { navigateToTab('revisao'); setReviewingStudentId(null); }}
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
          
          {/* Card de Licença & Vagas */}
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

          {/* Card de Solicitações de Vínculo Pendentes (Se houver) */}
          {pendingStudentLinks.length > 0 && (
            <div style={{
              backgroundColor: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '16px',
              padding: '18px 20px',
              marginBottom: '20px'
            }} className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(168, 85, 247, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle size={18} color="#c084fc" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Novas Solicitações de Alunos ({pendingStudentLinks.length})
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Estes alunos se cadastraram e solicitaram entrar na sua consultoria. Cada aprovação ocupará 1 vaga do seu plano.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingStudentLinks.map(pStudent => (
                  <div key={pStudent.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{pStudent.name}</strong>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px', flexWrap: 'wrap' }}>
                        <span>✉️ {pStudent.email}</span>
                        {pStudent.whatsapp && <span>📱 {pStudent.whatsapp}</span>}
                        {pStudent.cpf && <span>🪪 CPF: {pStudent.cpf}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApproveStudent(pStudent.id)}
                        style={{
                          backgroundColor: '#22c55e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Check size={14} /> Aprovar Aluno (1 Vaga)
                      </button>
                      <button
                        onClick={() => handleRejectStudent(pStudent.id)}
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} /> Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showForm ? (
            <form onSubmit={handleSaveStudent} style={styles.formCard} className="glass">
              <h3 style={styles.sectionTitle}>
                {editingId ? 'Editar Aluno' : 'Pré-Cadastrar Novo Aluno'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '16px' }}>
                {editingId 
                  ? 'Atualize os dados cadastrais do aluno.' 
                  : 'Ao salvar, você poderá enviar o link de convite instantâneo diretamente pelo WhatsApp do aluno para ele definir a senha e acessar!'}
              </p>

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
                  <label style={styles.label}>WhatsApp / Celular com DDD:</label>
                  <input
                    type="text"
                    value={studentForm.whatsapp}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, whatsapp: formatPhone(e.target.value) }))}
                    style={styles.input}
                    placeholder="(11) 98888-7777"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>E-mail (Login):</label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    style={styles.input}
                    placeholder="Ex: carlos@email.com (opcional no pré-cadastro)"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>CPF do Aluno:</label>
                  <input
                    type="text"
                    value={studentForm.cpf}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                    style={styles.input}
                    placeholder="000.000.000-00 (pode ser preenchido pelo aluno)"
                    maxLength={14}
                  />
                </div>

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

                <div style={styles.formGroup}>
                  <label style={styles.label}>Dia do Vencimento da Mensalidade:</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={studentForm.dia_vencimento || '10'}
                    onChange={(e) => setStudentForm(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                    style={styles.input}
                    placeholder="Dia (1 a 31)"
                  />
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn} className="btn-primary">
                  {editingId ? 'Atualizar Dados' : 'Concluir Pré-Cadastro & Gerar Convite WhatsApp'}
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
                  <Plus size={16} /> Pré-Cadastrar Novo Aluno
                </button>
              </div>

              {myStudents.length === 0 ? (
                <div style={styles.emptyBox}>
                  <Users size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p>Você não possui alunos cadastrados no momento.</p>
                  <span>Clique no botão acima para pré-cadastrar e enviar o convite de acesso!</span>
                </div>
              ) : (
                <div style={styles.tableResponsive}>
                  <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}><table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.tableCellHeader}>Nome</th>
                        <th style={styles.tableCellHeader}>Contato / E-mail</th>
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
                              {student.preCadastro && (
                                <span style={{ ...styles.vipBadge, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', marginLeft: '6px' }}>
                                  Pré-Cadastro
                                </span>
                              )}
                              {student.plano && (
                                <span style={{ ...styles.vipBadge, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', marginLeft: '6px' }}>
                                  {student.plano}
                                </span>
                              )}
                              {student.isVip && (
                                <span style={styles.vipBadge}>VIP</span>
                              )}
                            </td>
                            <td style={styles.tableCell}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span>{student.email}</span>
                                {student.whatsapp && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📱 {student.whatsapp}</span>}
                              </div>
                            </td>
                            <td style={styles.tableCell}>
                              <span style={styles.tenantBadge}>
                                {isDirectStudent ? 'Direto (Você)' : activeTenant.name}
                              </span>
                            </td>
                            <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                              <div style={styles.actionsGroup}>
                                <button 
                                  onClick={() => handleSendExistingStudentInvite(student)}
                                  style={{ ...styles.actionBtn, color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.12)' }}
                                  title="Enviar / Reenviar Link de Convite via WhatsApp"
                                >
                                  <Phone size={14} style={{ marginRight: '4px' }} /> Convite WhatsApp
                                </button>
                                <button 
                                  onClick={() => setViewingStudent(student)} 
                                  style={{ ...styles.actionBtn, color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }} 
                                  title="Ver Cartão do Aluno"
                                >
                                  <User size={14} style={{ marginRight: '4px' }} /> Cartão
                                </button>
                                <button 
                                  onClick={() => handleStartAnamneseForStudent(student.id)} 
                                  style={{ ...styles.actionBtn, color: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.1)' }} 
                                  title="Fazer Anamnese & Avaliação Física do Aluno"
                                >
                                  <Ruler size={14} style={{ marginRight: '4px' }} /> Avaliação / Anamnese
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
                                    title="Remover Aluno"
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

          {/* Modal Super Cartão do Aluno CRM Completo */}
          {viewingStudent && editingStudentProfile && (
            <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setViewingStudent(null)}>
              <div style={{ ...styles.modalContent, maxWidth: '780px' }} className="glass" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setViewingStudent(null)} style={styles.modalCloseBtn}>
                  <X size={20} />
                </button>

                {/* Topo do Cartão do Aluno com Foto, Nome, WhatsApp Rápido e Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <div style={styles.studentAvatarBox}>
                    {editingStudentProfile.fotoPerfil ? (
                      <img src={editingStudentProfile.fotoPerfil} alt={editingStudentProfile.name} style={styles.studentAvatarImg} />
                    ) : (
                      <div style={styles.avatarLarge}>
                        {(editingStudentProfile.name || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label style={styles.studentPhotoBadge} title="Alterar Foto de Perfil do Aluno">
                      <Camera size={12} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={(e) => handleStudentCRMPhotoUpload(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '800' }}>
                        {editingStudentProfile.name || 'Sem Nome'}
                      </h3>
                      {editingStudentProfile.isVip && (
                        <span style={styles.vipBadge}>VIP</span>
                      )}
                      {editingStudentProfile.plano && (
                        <span style={{ ...styles.vipBadge, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                          {editingStudentProfile.plano}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {editingStudentProfile.email} {editingStudentProfile.cidade ? `• ${editingStudentProfile.cidade}` : ''}
                    </p>
                  </div>

                  {/* Ação Rápida WhatsApp */}
                  {editingStudentProfile.whatsapp && (
                    <a
                      href={`https://wa.me/55${editingStudentProfile.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.whatsAppBtn}
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle size={15} />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                {/* Sub-abas do Cartão CRM */}
                <div style={styles.crmTabsRow}>
                  <button 
                    type="button"
                    onClick={() => setCrmTab('contato')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'contato' ? styles.crmTabBtnActive : {}) }}
                  >
                    <User size={14} style={{ marginRight: '5px' }} /> Cadastro & Contato
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCrmTab('financeiro')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'financeiro' ? styles.crmTabBtnActive : {}) }}
                  >
                    <CreditCard size={14} style={{ marginRight: '5px' }} /> Financeiro & PIX
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCrmTab('medidas')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'medidas' ? styles.crmTabBtnActive : {}) }}
                  >
                    <Ruler size={14} style={{ marginRight: '5px' }} /> Avaliação Física
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCrmTab('treinos')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'treinos' ? styles.crmTabBtnActive : {}) }}
                  >
                    <Dumbbell size={14} style={{ marginRight: '5px' }} /> Ficha Treino
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCrmTab('anotacoes')}
                    style={{ ...styles.crmTabBtn, ...(crmTab === 'anotacoes' ? styles.crmTabBtnActive : {}) }}
                  >
                    <FileText size={14} style={{ marginRight: '5px' }} /> Anotações ({editingStudentProfile.anotacoesProfessor ? '1' : '0'})
                  </button>
                </div>

                {/* CONTEÚDO 1: CADASTRO E CONTATO COMPLETO */}
                {crmTab === 'contato' && (
                  <form onSubmit={handleSaveStudentCRM} style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>Dados de Contato & Localização</h4>
                      <div style={styles.formRow}>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Nome Completo</label>
                          <input 
                            type="text" 
                            value={editingStudentProfile.name || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, name: e.target.value }))}
                            style={styles.inputField}
                            required
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>E-mail de Acesso</label>
                          <input 
                            type="email" 
                            value={editingStudentProfile.email || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, email: e.target.value }))}
                            style={styles.inputField}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ ...styles.formRow, marginTop: '10px' }}>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>WhatsApp / Celular</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 11998765432"
                            value={editingStudentProfile.whatsapp || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, whatsapp: e.target.value, telefone: e.target.value }))}
                            style={styles.inputField}
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>CPF / Documento</label>
                          <input 
                            type="text" 
                            placeholder="000.000.000-00"
                            value={editingStudentProfile.cpf || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, cpf: e.target.value }))}
                            style={styles.inputField}
                          />
                        </div>
                      </div>

                      <div style={{ ...styles.formRow, marginTop: '10px' }}>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Data de Nascimento</label>
                          <input 
                            type="date" 
                            value={editingStudentProfile.dataNascimento || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, dataNascimento: e.target.value }))}
                            style={styles.inputField}
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Cidade / Estado</label>
                          <input 
                            type="text" 
                            placeholder="Ex: São Paulo - SP"
                            value={editingStudentProfile.cidade || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, cidade: e.target.value }))}
                            style={styles.inputField}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <label style={styles.formLabel}>Endereço Completo</label>
                        <input 
                          type="text" 
                          placeholder="Rua, Número, Bairro, CEP"
                          value={editingStudentProfile.endereco || ''} 
                          onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, endereco: e.target.value }))}
                          style={styles.inputField}
                        />
                      </div>
                    </div>

                    {/* Contato de Emergência */}
                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>🚨 Contato de Emergência</h4>
                      <div style={styles.formRow}>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Nome do Contato de Emergência</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Maria Silva (Mãe/Esposa)"
                            value={editingStudentProfile.contatoEmergenciaNome || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, contatoEmergenciaNome: e.target.value }))}
                            style={styles.inputField}
                          />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Telefone de Emergência</label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input 
                              type="text" 
                              placeholder="Ex: 11988887777"
                              value={editingStudentProfile.contatoEmergenciaTel || ''} 
                              onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, contatoEmergenciaTel: e.target.value }))}
                              style={{ ...styles.inputField, flex: 1 }}
                            />
                            {editingStudentProfile.contatoEmergenciaTel && (
                              <a 
                                href={`tel:${editingStudentProfile.contatoEmergenciaTel}`} 
                                style={styles.phoneCallBtn}
                                title="Ligar para contato de emergência"
                              >
                                <Phone size={15} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                      <button 
                        type="submit" 
                        disabled={isSavingStudentCRM}
                        style={{ ...styles.saveBtn, padding: '10px 20px', margin: 0 }}
                        className="btn-primary"
                      >
                        <Save size={15} />
                        {isSavingStudentCRM ? 'Salvando...' : 'Salvar Alterações Cadastrais'}
                      </button>
                    </div>
                  </form>
                )}

                {/* CONTEÚDO 2: FINANCEIRO & PIX */}
                {crmTab === 'financeiro' && (
                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>Dados de Pagamento & Chave PIX do Aluno</h4>
                      <div style={styles.formRow}>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Chave PIX do Aluno</label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input 
                              type="text" 
                              placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                              value={editingStudentProfile.chavePix || ''} 
                              onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, chavePix: e.target.value }))}
                              style={{ ...styles.inputField, flex: 1 }}
                            />
                            {editingStudentProfile.chavePix && (
                              <button 
                                type="button"
                                onClick={() => handleCopyPix(editingStudentProfile.chavePix, false)}
                                style={styles.copyPixBtn}
                                title="Copiar Chave PIX"
                              >
                                {copiedPixStudent ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Tipo de Chave PIX</label>
                          <select 
                            value={editingStudentProfile.tipoChavePix || 'CPF'} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, tipoChavePix: e.target.value }))}
                            style={styles.selectField}
                          >
                            <option value="CPF">CPF</option>
                            <option value="E-mail">E-mail</option>
                            <option value="Celular">Celular</option>
                            <option value="Aleatória">Chave Aleatória (EVP)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ ...styles.formRow, marginTop: '10px' }}>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Plano Vinculado</label>
                          <select 
                            value={editingStudentProfile.plano || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, plano: e.target.value }))}
                            style={styles.selectField}
                          >
                            <option value="">Nenhum / Básico</option>
                            {(user.customPlans || []).map(p => (
                              <option key={p.id} value={p.name}>{p.name} ({p.price})</option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.formLabel}>Dia do Vencimento</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 10" 
                            min="1" 
                            max="31"
                            value={editingStudentProfile.dia_vencimento || ''} 
                            onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, dia_vencimento: e.target.value }))}
                            style={styles.inputField}
                          />
                        </div>
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          type="button" 
                          onClick={handleSaveStudentCRM}
                          style={{ ...styles.saveBtn, padding: '8px 16px', margin: 0, fontSize: '0.85rem' }}
                          className="btn-primary"
                        >
                          <Save size={14} /> Salvar Dados Financeiros
                        </button>
                      </div>
                    </div>

                    {/* Histórico de Mensalidades */}
                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>
                        Histórico de Mensalidades (Vencimento Dia {editingStudentProfile.dia_vencimento || '?'})
                      </h4>
                      {!editingStudentProfile.historico_pagamentos || editingStudentProfile.historico_pagamentos.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Nenhum histórico financeiro gerado para este ano.</p>
                      ) : (
                        <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                          {editingStudentProfile.historico_pagamentos.map(parcela => (
                            <div key={parcela.id} style={styles.paymentRow}>
                              <div>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{parcela.mes}</span>
                                <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: parcela.status === 'Pago' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: parcela.status === 'Pago' ? '#22c55e' : '#ef4444' }}>
                                  {parcela.status}
                                </span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  const novoStatus = parcela.status === 'Pago' ? 'Pendente' : 'Pago';
                                  const novoHistorico = editingStudentProfile.historico_pagamentos.map(p => p.id === parcela.id ? { ...p, status: novoStatus } : p);
                                  updateUserProfile(editingStudentProfile.id, { historico_pagamentos: novoHistorico });
                                  setEditingStudentProfile(prev => ({ ...prev, historico_pagamentos: novoHistorico }));
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

                {/* CONTEÚDO 3: MEDIDAS & AVALIAÇÃO FÍSICA */}
                {crmTab === 'medidas' && (
                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Avaliações Antropométricas do Aluno
                      </span>
                      <button 
                        onClick={() => handleStartAnamneseForStudent(viewingStudent.id)}
                        style={{ ...styles.actionBtn, background: 'var(--primary)', color: '#fff', padding: '6px 12px' }}
                      >
                        <Plus size={13} style={{ marginRight: '4px' }} /> Nova Anamnese
                      </button>
                    </div>

                    {(() => {
                      const allEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])];
                      const studentEvals = allEvals.filter(e => e.userId === viewingStudent?.id || e.student_id === viewingStudent?.id).sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return dateB - dateA;
                      });
                      const latestEval = studentEvals[0];
                      const studentEval = latestEval?.formData;

                      if (!studentEval) {
                        return (
                          <div style={styles.emptyBox}>
                            <Ruler size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                            <p style={{ margin: '0 0 8px 0' }}>Nenhuma Avaliação Física cadastrada para este aluno ainda.</p>
                            <button 
                              onClick={() => handleStartAnamneseForStudent(viewingStudent.id)}
                              style={{ ...styles.saveBtn, padding: '8px 16px', fontSize: '0.8rem', width: 'auto' }}
                              className="btn-primary"
                            >
                              <Plus size={14} style={{ marginRight: '4px' }} /> Fazer Primeira Avaliação
                            </button>
                          </div>
                        );
                      }

                      const evalDate = latestEval.date || (latestEval.created_at ? new Date(latestEval.created_at).toLocaleDateString('pt-BR') : 'Recente');

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={styles.crmBox}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                                Última Avaliação ({evalDate})
                              </h4>
                              <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                Por: {latestEval.evaluatedBy || 'Aluno'}
                              </span>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>
                              <p style={styles.crmText}>Sexo: <strong>{studentEval.sexoBiologico || '-'}</strong></p>
                              <p style={styles.crmText}>Idade: <strong>{studentEval.idade || '-'} anos</strong></p>
                              <p style={styles.crmText}>Peso: <strong>{studentEval.peso || '-'} kg</strong></p>
                              <p style={styles.crmText}>Altura: <strong>{studentEval.altura || '-'} cm</strong></p>
                              <p style={styles.crmText}>Cintura: <strong>{studentEval.cintura || '-'} cm</strong></p>
                              <p style={styles.crmText}>Abdômen: <strong>{studentEval.abdomen || '-'} cm</strong></p>
                              <p style={styles.crmText}>Braço D/E: <strong>{studentEval.braçoDir || '-'}/{studentEval.braçoEsq || '-'} cm</strong></p>
                              <p style={styles.crmText}>Gordura: <strong>{studentEval.percentualGordura ? `${studentEval.percentualGordura}%` : '-'}</strong></p>
                            </div>

                            {/* Fotos comparativas */}
                            {(studentEval.fotoFrenteBase64 || studentEval.fotoCostasBase64 || studentEval.fotoPerfilBase64) && (
                              <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                                  Fotos de Evolução (Data: {evalDate}):
                                </span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                                  {studentEval.fotoFrenteBase64 && (
                                    <img 
                                      src={studentEval.fotoFrenteBase64} 
                                      alt="Frente" 
                                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                      onClick={() => setEvalZoomPhoto({ url: studentEval.fotoFrenteBase64, title: `Frente - ${evalDate}` })}
                                    />
                                  )}
                                  {studentEval.fotoCostasBase64 && (
                                    <img 
                                      src={studentEval.fotoCostasBase64} 
                                      alt="Costas" 
                                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                      onClick={() => setEvalZoomPhoto({ url: studentEval.fotoCostasBase64, title: `Costas - ${evalDate}` })}
                                    />
                                  )}
                                  {studentEval.fotoPerfilBase64 && (
                                    <img 
                                      src={studentEval.fotoPerfilBase64} 
                                      alt="Perfil" 
                                      style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                                      onClick={() => setEvalZoomPhoto({ url: studentEval.fotoPerfilBase64, title: `Perfil - ${evalDate}` })}
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {studentEval.lesoes && (
                              <div style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', marginTop: '8px' }}>
                                <p style={{ margin: 0, color: '#ef4444', fontSize: '0.8rem' }}><strong>⚠️ Limitações/Lesões:</strong> {studentEval.lesoes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* CONTEÚDO 4: TREINOS ATIVOS */}
                {crmTab === 'treinos' && (
                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
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

                {/* CONTEÚDO 5: ANOTAÇÕES PRIVADAS DO PROFESSOR */}
                {crmTab === 'anotacoes' && (
                  <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <div style={styles.crmBox}>
                      <h4 style={styles.crmBoxTitle}>📝 Anotações & Observações Confidenciais</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Estas notas são 100% privadas e visíveis apenas para você e a administração. Use para anotar evolução clínica, comportamento, feedbacks e ajustes estratégicos.
                      </p>
                      <textarea
                        value={editingStudentProfile.anotacoesProfessor || ''}
                        onChange={(e) => setEditingStudentProfile(prev => ({ ...prev, anotacoesProfessor: e.target.value }))}
                        placeholder="Ex: Aluno relatou cansaço no ombro ao realizar supino inclinado. Diminuir volume na semana 3..."
                        style={{ ...styles.inputField, minHeight: '130px', width: '100%', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={handleSaveStudentCRM}
                          style={{ ...styles.saveBtn, padding: '8px 16px', margin: 0, fontSize: '0.85rem' }}
                          className="btn-primary"
                        >
                          <Save size={14} /> Salvar Anotações
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rodapé de Ações do Cartão */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button onClick={() => { setViewingStudent(null); loginAsUser(viewingStudent); }} style={{ ...styles.saveBtn, flex: 1, padding: '10px', minWidth: '160px' }} className="btn-primary">
                    <Activity size={15} /> Ver no Perfil Aluno
                  </button>
                  <button onClick={() => handleStartPrescription(viewingStudent.id)} style={{ ...styles.saveBtn, flex: 1, background: '#a78bfa', padding: '10px', minWidth: '160px' }} className="btn-primary">
                    <Dumbbell size={15} /> Abrir Studio de Prescrição
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA DE ANAMNESE & AVALIAÇÃO FÍSICA (PROFESSOR) */}
      {activeTab === 'anamnese' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header de Seleção do Aluno e Modos (Preencher / Histórico) */}
          <div style={styles.studioHeaderCard} className="glass">
            <div style={styles.studioHeaderTop}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
                <Ruler size={28} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                    SELECIONE O ALUNO PARA ANAMNESE / AVALIAÇÃO FÍSICA:
                  </label>
                  <select
                    value={selectedStudentForEval}
                    onChange={(e) => setSelectedStudentForEval(e.target.value)}
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

              {/* Botões de alternância: Preencher Formulário vs Histórico de Fotos */}
              {(() => {
                const studentEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])]
                  .filter(e => e.userId === selectedStudentForEval || e.student_id === selectedStudentForEval);
                return (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setEvalViewMode('form')}
                      style={{
                        ...styles.actionBtn,
                        padding: '10px 16px',
                        background: evalViewMode === 'form' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        color: evalViewMode === 'form' ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        fontWeight: '700'
                      }}
                    >
                      <Edit2 size={14} style={{ marginRight: '6px' }} /> Preencher Avaliação
                    </button>
                    <button
                      type="button"
                      onClick={() => setEvalViewMode('history')}
                      style={{
                        ...styles.actionBtn,
                        padding: '10px 16px',
                        background: evalViewMode === 'history' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                        color: evalViewMode === 'history' ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        fontWeight: '700'
                      }}
                    >
                      <Camera size={14} style={{ marginRight: '6px' }} /> Histórico & Fotos ({studentEvals.length})
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Banner Didático para o Professor */}
          <div style={styles.videoInfoBanner} className="glass">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'block', marginBottom: '2px' }}>
                  🎯 Anamnese Profissional & Avaliação Antropométrica
                </strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Preencha as medidas corporais e registre as fotos de evolução do aluno. Após preencher, você pode escolher se a <strong>Inteligência Artificial monta a ficha automaticamente</strong> ou se você mesmo <strong>prescreve os exercícios no Studio</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* MODO FORMULÁRIO DE ANAMNESE */}
          {evalViewMode === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Acordeão 1: Identificação & Objetivos */}
              <div style={styles.accordionItem} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'identificacao' ? null : 'identificacao')}>
                  <h4 style={styles.accordionTitle}>1. Identificação & Objetivos</h4>
                  {activeAccordion === 'identificacao' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeAccordion === 'identificacao' && (
                  <div style={styles.accordionContent}>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Nome do Aluno</label>
                        <input 
                          type="text" 
                          value={evalFormData.nome} 
                          onChange={(e) => handleEvalInputChange('nome', e.target.value)} 
                          style={styles.inputField} 
                          required
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Objetivo Principal</label>
                        <select 
                          value={evalFormData.objetivo} 
                          onChange={(e) => handleEvalInputChange('objetivo', e.target.value)} 
                          style={styles.selectField}
                        >
                          <option value="hipertrofia">Hipertrofia (Ganho de Massa)</option>
                          <option value="emagrecimento">Emagrecimento / Definição</option>
                          <option value="condicionamento">Condicionamento Físico</option>
                          <option value="saude">Saúde / Postura / Reabilitação</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ ...styles.formRow, marginTop: '12px' }}>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Sexo Biológico *</label>
                        <select 
                          value={evalFormData.sexoBiologico} 
                          onChange={(e) => handleEvalInputChange('sexoBiologico', e.target.value)} 
                          style={styles.selectField}
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Idade (anos) *</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 28" 
                          value={evalFormData.idade} 
                          onChange={(e) => handleEvalInputChange('idade', e.target.value)} 
                          style={styles.inputField} 
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{
                        padding: '12px',
                        backgroundColor: 'rgba(139, 92, 246, 0.08)',
                        borderLeft: '4px solid var(--primary)',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        marginBottom: '8px',
                        color: 'var(--text-primary)'
                      }}>
                        Quanto maiores forem os detalhes sobre a rotina (horários de sono, se trabalha sentado ou em pé, nível de atividade diária, restrições de tempo), melhor! É fundamental também descrever detalhadamente o objetivo principal, dificuldades e focos específicos do aluno (ex: foco no aumento de glúteos/bumbum, pernas, braços, definição abdominal, etc.), pois quanto mais detalhes, mais preciso e personalizado será o treino montado por você e pela IA.
                      </div>
                      <label style={styles.formLabel}>Rotina, Histórico, Objetivos & Focos do Aluno</label>
                      <textarea
                        placeholder="Ex: Trabalha em escritório, relata pouco tempo disponível, treina 4x na semana. Foco prioritário em glúteos e pernas, dificuldade em ombros/braços..."
                        value={evalFormData.descricaoRotina}
                        onChange={(e) => handleEvalInputChange('descricaoRotina', e.target.value)}
                        style={{ ...styles.inputField, minHeight: '85px', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeão 2: Composição Básica */}
              <div style={styles.accordionItem} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'composicao' ? null : 'composicao')}>
                  <h4 style={styles.accordionTitle}>2. Composição Básica (Peso & Altura)</h4>
                  {activeAccordion === 'composicao' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeAccordion === 'composicao' && (
                  <div style={styles.accordionContent}>
                    <div style={styles.formRow}>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Peso Atual (kg) *</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          placeholder="Ex: 78.5" 
                          value={evalFormData.peso} 
                          onChange={(e) => handleEvalInputChange('peso', e.target.value)} 
                          style={styles.inputField} 
                          required
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Altura (cm) *</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 178" 
                          value={evalFormData.altura} 
                          onChange={(e) => handleEvalInputChange('altura', e.target.value)} 
                          style={styles.inputField} 
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeão 3: Circunferências Corporais */}
              <div style={styles.accordionItem} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'circunferencias' ? null : 'circunferencias')}>
                  <h4 style={styles.accordionTitle}>3. Circunferências Corporais (Medidas em cm)</h4>
                  {activeAccordion === 'circunferencias' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeAccordion === 'circunferencias' && (
                  <div style={styles.accordionContent}>

                    {/* ── ALERTA TÉCNICO: MEDIR OS DOIS LADOS (ASSIMETRIA) ── */}
                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: 'rgba(234, 179, 8, 0.09)',
                      borderLeft: '4px solid #eab308',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '0.83rem',
                      lineHeight: '1.45',
                      color: 'var(--text-primary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#eab308', marginBottom: '4px' }}>
                        <AlertTriangle size={16} /> Atenção à Assimetria: Meça os dois lados separadamente!
                      </div>
                      Lembre-se de registrar a medida real de cada lado (braço, coxa superior/inferior, panturrilha). Dificilmente as circunferências do lado direito e esquerdo são idênticas. A precisão nessas medidas bilaterais é fundamental para calibrar correções de assimetria muscular no treino e na IA.
                    </div>

                    <div style={styles.gridMedidas}>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Pescoço (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.pescoco} onChange={(e) => handleEvalInputChange('pescoco', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Peitoral (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.peitoral} onChange={(e) => handleEvalInputChange('peitoral', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Cintura (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.cintura} onChange={(e) => handleEvalInputChange('cintura', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Abdômen (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.abdomen} onChange={(e) => handleEvalInputChange('abdomen', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Quadril (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.quadril} onChange={(e) => handleEvalInputChange('quadril', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Braço Esq. (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.braçoEsq} onChange={(e) => handleEvalInputChange('braçoEsq', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Braço Dir. (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.braçoDir} onChange={(e) => handleEvalInputChange('braçoDir', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Coxa Esq. Superior (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.coxaEsqSuperior} onChange={(e) => handleEvalInputChange('coxaEsqSuperior', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Coxa Esq. Inferior (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.coxaEsqInferior} onChange={(e) => handleEvalInputChange('coxaEsqInferior', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Coxa Dir. Superior (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.coxaDirSuperior} onChange={(e) => handleEvalInputChange('coxaDirSuperior', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Coxa Dir. Inferior (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.coxaDirInferior} onChange={(e) => handleEvalInputChange('coxaDirInferior', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Panturrilha Esq. (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.panturrilhaEsq} onChange={(e) => handleEvalInputChange('panturrilhaEsq', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Panturrilha Dir. (cm)</label>
                        <input type="number" step="0.1" placeholder="cm" value={evalFormData.panturrilhaDir} onChange={(e) => handleEvalInputChange('panturrilhaDir', e.target.value)} style={styles.inputField} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeão 4: Logística, Hábitos & Lesões */}
              <div style={styles.accordionItem} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'logistica' ? null : 'logistica')}>
                  <h4 style={styles.accordionTitle}>4. Logística, Hábitos & Restrições Físicas</h4>
                  {activeAccordion === 'logistica' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeAccordion === 'logistica' && (
                  <div style={styles.accordionContent}>
                    <div style={styles.gridMedidas}>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Frequência Semanal</label>
                        <select value={evalFormData.frequenciaSemanal} onChange={(e) => handleEvalInputChange('frequenciaSemanal', e.target.value)} style={styles.selectField}>
                          <option value="2">2 dias/semana</option>
                          <option value="3">3 dias/semana</option>
                          <option value="4">4 dias/semana</option>
                          <option value="5">5+ dias/semana</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Nível de Experiência</label>
                        <select value={evalFormData.nivelExperiencia} onChange={(e) => handleEvalInputChange('nivelExperiencia', e.target.value)} style={styles.selectField}>
                          <option value="iniciante">Iniciante</option>
                          <option value="intermediario">Intermediário</option>
                          <option value="avancado">Avançado</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Tempo por Sessão (min)</label>
                        <input type="number" placeholder="Ex: 60" value={evalFormData.tempoSessao} onChange={(e) => handleEvalInputChange('tempoSessao', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Equipamentos Disponíveis</label>
                        <select value={evalFormData.equipamentos} onChange={(e) => handleEvalInputChange('equipamentos', e.target.value)} style={styles.selectField}>
                          <option value="completa">Academia Completa</option>
                          <option value="basica">Academia Básica / Condomínio</option>
                          <option value="calistenia">Halteres / Peso Corporal</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Lesões ou Limitações *</label>
                        <input type="text" placeholder="Ex: Joelho esquerdo, hérnia de disco..." value={evalFormData.lesoes} onChange={(e) => handleEvalInputChange('lesoes', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Preferências de Treino</label>
                        <input type="text" placeholder="Ex: Gosta de halteres, evita máquinas..." value={evalFormData.preferencias} onChange={(e) => handleEvalInputChange('preferencias', e.target.value)} style={styles.inputField} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeão 5: Triagem PAR-Q */}
              <div style={styles.accordionItem} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'parq' ? null : 'parq')}>
                  <h4 style={styles.accordionTitle}>5. Triagem de Saúde (PAR-Q)</h4>
                  {activeAccordion === 'parq' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeAccordion === 'parq' && (
                  <div style={styles.accordionContent}>
                    <div style={styles.parqQuestionRow}>
                      <span style={styles.parqText}>1. O aluno possui histórico de problemas cardíacos ou dores no peito?</span>
                      <div style={styles.radioGroup}>
                        <label><input type="radio" name="profParqCardiaco" checked={evalFormData.parqCardiaco === 'sim'} onChange={() => handleEvalInputChange('parqCardiaco', 'sim')} /> Sim</label>
                        <label><input type="radio" name="profParqCardiaco" checked={evalFormData.parqCardiaco === 'nao'} onChange={() => handleEvalInputChange('parqCardiaco', 'nao')} /> Não</label>
                      </div>
                    </div>
                    <div style={styles.parqQuestionRow}>
                      <span style={styles.parqText}>2. Faz uso de medicamentos contínuos para pressão arterial?</span>
                      <div style={styles.radioGroup}>
                        <label><input type="radio" name="profParqMed" checked={evalFormData.parqMedicamento === 'sim'} onChange={() => handleEvalInputChange('parqMedicamento', 'sim')} /> Sim</label>
                        <label><input type="radio" name="profParqMed" checked={evalFormData.parqMedicamento === 'nao'} onChange={() => handleEvalInputChange('parqMedicamento', 'nao')} /> Não</label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeão 6: Composição Avançada & Bioimpedância */}
              <div style={styles.accordionItem} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'avancado' ? null : 'avancado')}>
                  <h4 style={styles.accordionTitle}>6. Composição Avançada / Bioimpedância (Opcionais)</h4>
                  {activeAccordion === 'avancado' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {activeAccordion === 'avancado' && (
                  <div style={styles.accordionContent}>
                    <div style={styles.gridMedidas}>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Gordura Corporal (%)</label>
                        <input type="number" step="0.1" placeholder="Ex: 14.5" value={evalFormData.percentualGordura} onChange={(e) => handleEvalInputChange('percentualGordura', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Massa Magra (kg)</label>
                        <input type="number" step="0.1" placeholder="Ex: 65.2" value={evalFormData.massaMagra} onChange={(e) => handleEvalInputChange('massaMagra', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Gordura Visceral</label>
                        <input type="number" placeholder="Ex: 4" value={evalFormData.gorduraVisceral} onChange={(e) => handleEvalInputChange('gorduraVisceral', e.target.value)} style={styles.inputField} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>FC Repouso (bpm)</label>
                        <input type="number" placeholder="Ex: 62" value={evalFormData.fcRepouso} onChange={(e) => handleEvalInputChange('fcRepouso', e.target.value)} style={styles.inputField} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Acordeão 7: REGISTRO FOTOGRÁFICO DE COMPARAÇÃO & EVOLUÇÃO */}
              <div style={{ ...styles.accordionItem, border: '1px solid var(--primary)' }} className="glass">
                <div style={styles.accordionHeader} onClick={() => setActiveAccordion(activeAccordion === 'fotos' ? null : 'fotos')}>
                  <h4 style={{ ...styles.accordionTitle, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera size={18} /> 7. Registro Fotográfico do Aluno (Frente, Costas e Perfil)
                  </h4>
                  {activeAccordion === 'fotos' ? <ChevronUp size={18} style={{ color: 'var(--primary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--primary)' }} />}
                </div>
                {activeAccordion === 'fotos' && (
                  <div style={styles.accordionContent}>
                    <p style={{ ...styles.parqDisclaimer, color: 'var(--text-primary)', marginBottom: '14px' }}>
                      📸 <strong>Tire a foto diretamente com a câmera do celular</strong> ou selecione imagens da galeria. As fotos ficam salvas no histórico com a data da avaliação para acompanhamento comparativo visual.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      {/* Foto Frente */}
                      <div style={styles.photoUploadCard}>
                        {evalFormData.fotoFrenteBase64 ? (
                          <div style={styles.photoPreviewWrapper}>
                            <img src={evalFormData.fotoFrenteBase64} alt="Foto Frente" style={styles.photoImg} />
                            <span style={styles.photoDateTag}>Frente • {new Date().toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <img 
                            src={evalFormData.sexoBiologico === 'feminino' ? SILHOUETTES.feminino.frente : SILHOUETTES.masculino.frente} 
                            alt="Silhueta Frente" 
                            style={{ width: '80px', height: '140px', objectFit: 'contain', marginBottom: '8px' }} 
                          />
                        )}
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '6px 0' }}>1. Foto de Frente</span>
                        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                          <label style={styles.photoUploadBtnPrimary}>
                            <Camera size={13} />
                            <span>Câmera</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleEvalPhotoUpload('Frente', e.target.files?.[0])}
                            />
                          </label>
                          <label style={styles.photoUploadBtnSecondary}>
                            <Upload size={13} />
                            <span>Galeria</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleEvalPhotoUpload('Frente', e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Foto Costas */}
                      <div style={styles.photoUploadCard}>
                        {evalFormData.fotoCostasBase64 ? (
                          <div style={styles.photoPreviewWrapper}>
                            <img src={evalFormData.fotoCostasBase64} alt="Foto Costas" style={styles.photoImg} />
                            <span style={styles.photoDateTag}>Costas • {new Date().toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <img 
                            src={evalFormData.sexoBiologico === 'feminino' ? SILHOUETTES.feminino.costas : SILHOUETTES.masculino.costas} 
                            alt="Silhueta Costas" 
                            style={{ width: '80px', height: '140px', objectFit: 'contain', marginBottom: '8px' }} 
                          />
                        )}
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '6px 0' }}>2. Foto de Costas</span>
                        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                          <label style={styles.photoUploadBtnPrimary}>
                            <Camera size={13} />
                            <span>Câmera</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleEvalPhotoUpload('Costas', e.target.files?.[0])}
                            />
                          </label>
                          <label style={styles.photoUploadBtnSecondary}>
                            <Upload size={13} />
                            <span>Galeria</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleEvalPhotoUpload('Costas', e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Foto Perfil */}
                      <div style={styles.photoUploadCard}>
                        {evalFormData.fotoPerfilBase64 ? (
                          <div style={styles.photoPreviewWrapper}>
                            <img src={evalFormData.fotoPerfilBase64} alt="Foto Perfil" style={styles.photoImg} />
                            <span style={styles.photoDateTag}>Perfil • {new Date().toLocaleDateString('pt-BR')}</span>
                          </div>
                        ) : (
                          <img 
                            src={evalFormData.sexoBiologico === 'feminino' ? SILHOUETTES.feminino.perfil : SILHOUETTES.masculino.perfil} 
                            alt="Silhueta Perfil" 
                            style={{ width: '80px', height: '140px', objectFit: 'contain', marginBottom: '8px' }} 
                          />
                        )}
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', margin: '6px 0' }}>3. Foto de Perfil</span>
                        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                          <label style={styles.photoUploadBtnPrimary}>
                            <Camera size={13} />
                            <span>Câmera</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleEvalPhotoUpload('Perfil', e.target.files?.[0])}
                            />
                          </label>
                          <label style={styles.photoUploadBtnSecondary}>
                            <Upload size={13} />
                            <span>Galeria</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleEvalPhotoUpload('Perfil', e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BARRA DE AÇÕES DO PROFESSOR AO FINAL DA AVALIAÇÃO */}
              <div style={{ ...styles.card, marginTop: '8px' }} className="glass">
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  🚀 O que deseja fazer com esta Avaliação Física?
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <button
                    type="button"
                    disabled={isSubmittingEval}
                    onClick={() => handleSaveEvaluation('save_and_ai')}
                    style={{ ...styles.saveBtn, padding: '14px', background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    className="btn-primary"
                  >
                    <Sparkles size={18} />
                    <span>{isSubmittingEval ? 'Processando...' : 'Salvar & Gerar Treino por IA'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingEval}
                    onClick={() => handleSaveEvaluation('save_and_studio')}
                    style={{ ...styles.saveBtn, padding: '14px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    className="btn-primary"
                  >
                    <Dumbbell size={18} />
                    <span>Salvar & Montar no Studio</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingEval}
                    onClick={() => handleSaveEvaluation('save_only')}
                    style={{ ...styles.saveBtn, padding: '14px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save size={18} />
                    <span>Salvar Apenas Avaliação</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* MODO HISTÓRICO & FOTOS COMPARATIVAS */}
          {evalViewMode === 'history' && (() => {
            const studentEvals = [...(approvedEvaluations || []), ...(pendingEvaluations || [])]
              .filter(e => e.userId === selectedStudentForEval || e.student_id === selectedStudentForEval)
              .sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
              });

            if (studentEvals.length === 0) {
              return (
                <div style={styles.emptyBox} className="glass">
                  <Ruler size={44} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Nenhuma avaliação física cadastrada para este aluno.</h4>
                  <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Clique no botão abaixo para preencher a primeira anamnese e registrar as fotos de avaliação!
                  </p>
                  <button
                    type="button"
                    onClick={() => setEvalViewMode('form')}
                    style={{ ...styles.actionBtn, background: 'var(--primary)', color: '#fff', padding: '10px 20px', fontWeight: 'bold' }}
                  >
                    <Plus size={16} style={{ marginRight: '6px' }} /> Preencher Primeira Avaliação
                  </button>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {studentEvals.map((ev, evIdx) => {
                  const data = ev.formData || {};
                  const evalDate = ev.date || (ev.created_at ? new Date(ev.created_at).toLocaleDateString('pt-BR') : 'Data não informada');
                  const evaluator = ev.evaluatedBy || 'Aluno';
                  return (
                    <div key={ev.id || evIdx} style={styles.card} className="glass">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} color="var(--primary)" /> Avaliação de {evalDate}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Realizada por: <strong>{evaluator}</strong> • Objetivo: <strong>{data.objetivo || 'Geral'}</strong>
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={styles.splitTag}>
                            {data.peso ? `${data.peso} kg` : '-'} • {data.altura ? `${data.altura} cm` : '-'}
                          </span>
                        </div>
                      </div>

                      {/* Resumo Antropométrico */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '8px' }}>
                        <div><span style={styles.microLabel}>Pescoço:</span> <strong>{data.pescoco || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Peitoral:</span> <strong>{data.peitoral || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Cintura:</span> <strong>{data.cintura || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Abdômen:</span> <strong>{data.abdomen || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Quadril:</span> <strong>{data.quadril || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Braço D / E:</span> <strong>{data.braçoDir || '-'}/{data.braçoEsq || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Coxa D / E:</span> <strong>{data.coxaDirSuperior || '-'}/{data.coxaEsqSuperior || '-'} cm</strong></div>
                        <div><span style={styles.microLabel}>Gordura (%):</span> <strong>{data.percentualGordura ? `${data.percentualGordura}%` : '-'}</strong></div>
                      </div>

                      {/* Galeria de Fotos Comparativas com Data Visível */}
                      <div>
                        <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Camera size={14} color="var(--accent-primary)" /> Registro Fotográfico Comparativo (Data: {evalDate}):
                        </h5>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                          {/* Foto Frente */}
                          <div style={styles.historyPhotoBox}>
                            <span style={styles.historyPhotoLabel}>Frente</span>
                            {data.fotoFrenteBase64 ? (
                              <img 
                                src={data.fotoFrenteBase64} 
                                alt={`Frente ${evalDate}`} 
                                style={styles.historyPhotoImg} 
                                onClick={() => setEvalZoomPhoto({ url: data.fotoFrenteBase64, title: `Foto de Frente - ${evalDate}` })}
                              />
                            ) : (
                              <div style={styles.noPhotoPlaceholder}>
                                <ImageOff size={24} style={{ opacity: 0.3 }} />
                                <span>Sem foto</span>
                              </div>
                            )}
                            <span style={styles.historyPhotoDate}>{evalDate}</span>
                          </div>

                          {/* Foto Costas */}
                          <div style={styles.historyPhotoBox}>
                            <span style={styles.historyPhotoLabel}>Costas</span>
                            {data.fotoCostasBase64 ? (
                              <img 
                                src={data.fotoCostasBase64} 
                                alt={`Costas ${evalDate}`} 
                                style={styles.historyPhotoImg} 
                                onClick={() => setEvalZoomPhoto({ url: data.fotoCostasBase64, title: `Foto de Costas - ${evalDate}` })}
                              />
                            ) : (
                              <div style={styles.noPhotoPlaceholder}>
                                <ImageOff size={24} style={{ opacity: 0.3 }} />
                                <span>Sem foto</span>
                              </div>
                            )}
                            <span style={styles.historyPhotoDate}>{evalDate}</span>
                          </div>

                          {/* Foto Perfil */}
                          <div style={styles.historyPhotoBox}>
                            <span style={styles.historyPhotoLabel}>Perfil</span>
                            {data.fotoPerfilBase64 ? (
                              <img 
                                src={data.fotoPerfilBase64} 
                                alt={`Perfil ${evalDate}`} 
                                style={styles.historyPhotoImg} 
                                onClick={() => setEvalZoomPhoto({ url: data.fotoPerfilBase64, title: `Foto de Perfil - ${evalDate}` })}
                              />
                            ) : (
                              <div style={styles.noPhotoPlaceholder}>
                                <ImageOff size={24} style={{ opacity: 0.3 }} />
                                <span>Sem foto</span>
                              </div>
                            )}
                            <span style={styles.historyPhotoDate}>{evalDate}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}

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
                        <select
                          value={ex.category || 'Peito'}
                          onChange={(e) => handleUpdateExerciseField(ex.id, 'category', e.target.value)}
                          style={styles.exerciseCategorySelect}
                          title="Selecione o Grupo Muscular deste exercício"
                        >
                          {EXERCISE_CATEGORIES.filter(c => c !== 'Todos').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
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

      {/* CONTEÚDO DA ABA DE MEU PERFIL & APRESENTAÇÃO */}
      {activeTab === 'perfil' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card Principal: Formulário e Preview */}
          <div style={styles.profProfileGrid}>
            
            {/* Coluna 1: Formulário de Edição do Professor */}
            <div style={styles.card} className="glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Briefcase size={20} color="var(--primary)" /> Perfil & Apresentação Profissional
                </h3>
                <span style={styles.crefBadge}>
                  <ShieldCheck size={14} /> {profProfileForm.cref ? `CREF: ${profProfileForm.cref}` : 'CREF Não Informado'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '18px' }}>
                Configure seus dados, vídeos de apresentação e chave PIX. Este cartão é exatamente o que seus alunos verão no aplicativo deles!
              </p>

              <form onSubmit={handleSaveProfProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Foto de Perfil do Professor */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={styles.profHeaderAvatar}>
                    {profProfileForm.fotoPerfil ? (
                      <img src={profProfileForm.fotoPerfil} alt={profProfileForm.name} style={styles.profHeaderAvatarImg} />
                    ) : (
                      <User size={28} color="var(--text-secondary)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Sua Foto de Perfil</h5>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Foto profissional para gerar autoridade perante seus alunos.</p>
                  </div>
                  <label style={styles.photoUploadBtnPrimary}>
                    <Camera size={14} /> Trocar Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleProfPhotoUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>

                {/* Dados Pessoais & CREF */}
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Nome Completo / Como prefere ser chamado</label>
                    <input 
                      type="text" 
                      required
                      value={profProfileForm.name} 
                      onChange={(e) => setProfProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: Prof. Carlos Eduardo"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Registro Profissional (CREF)</label>
                    <input 
                      type="text" 
                      value={profProfileForm.cref} 
                      onChange={(e) => setProfProfileForm(prev => ({ ...prev, cref: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: 012345-G/SP"
                    />
                  </div>
                </div>

                {/* Especialidades e Bio */}
                <div style={styles.inputGroup}>
                  <label style={styles.formLabel}>Especialidades (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    value={profProfileForm.especialidades} 
                    onChange={(e) => setProfProfileForm(prev => ({ ...prev, especialidades: e.target.value }))}
                    style={styles.inputField}
                    placeholder="Ex: Hipertrofia, Emagrecimento, Treinamento Funcional, Reabilitação"
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.formLabel}>Biografia & Metodologia de Trabalho</label>
                  <textarea 
                    rows={3}
                    value={profProfileForm.bio} 
                    onChange={(e) => setProfProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    style={{ ...styles.inputField, resize: 'vertical' }}
                    placeholder="Conte sua trajetória, formação e compromisso com os resultados dos seus alunos..."
                  />
                </div>

                {/* Redes e Contato */}
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>WhatsApp para Alunos (com DDD)</label>
                    <input 
                      type="text" 
                      value={profProfileForm.whatsapp} 
                      onChange={(e) => setProfProfileForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: 11998765432"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Instagram Profissional</label>
                    <input 
                      type="text" 
                      value={profProfileForm.instagram} 
                      onChange={(e) => setProfProfileForm(prev => ({ ...prev, instagram: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: @profcarlos.personal"
                    />
                  </div>
                </div>

                {/* Dados Financeiros / Chave PIX */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="var(--primary)" /> Dados para Pagamentos via PIX
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    O aluno poderá copiar sua chave PIX com 1 clique diretamente na tela dele para renovar a consultoria!
                  </p>
                  
                  <div style={styles.formRow}>
                    <div style={styles.inputGroup}>
                      <label style={styles.formLabel}>Chave PIX (E-mail, CPF, Telefone ou Aleatória)</label>
                      <input 
                        type="text" 
                        value={profProfileForm.chavePix} 
                        onChange={(e) => setProfProfileForm(prev => ({ ...prev, chavePix: e.target.value }))}
                        style={styles.inputField}
                        placeholder="Ex: 11998765432 ou contato@personal.com"
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.formLabel}>Banco / Instituição</label>
                      <input 
                        type="text" 
                        value={profProfileForm.bancoPix} 
                        onChange={(e) => setProfProfileForm(prev => ({ ...prev, bancoPix: e.target.value }))}
                        style={styles.inputField}
                        placeholder="Ex: Nubank / Itaú / Inter"
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Nome do Titular da Conta PIX</label>
                    <input 
                      type="text" 
                      value={profProfileForm.titularPix} 
                      onChange={(e) => setProfProfileForm(prev => ({ ...prev, titularPix: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: Carlos Eduardo de Souza"
                    />
                  </div>
                </div>

                {/* Mídia & Vídeos */}
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Video size={18} color="var(--primary)" /> Vídeos de Apresentação e Boas-Vindas
                  </h4>
                  
                  {/* Vídeo 1: Apresentação */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={styles.formLabel}>1. Vídeo de Apresentação Profissional (Link YouTube, TikTok ou Upload/Câmera)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={profProfileForm.videoApresentacaoUrl} 
                        onChange={(e) => setProfProfileForm(prev => ({ ...prev, videoApresentacaoUrl: e.target.value }))}
                        style={{ ...styles.inputField, flex: 1 }}
                        placeholder="Ex: https://tiktok.com/@perfil/video/... ou https://youtube.com/watch?v=..."
                      />
                      <label style={styles.photoUploadBtnSecondary} title="Gravar com Câmera ou Enviar Vídeo">
                        <Camera size={14} /> Gravar/Upload
                        <input 
                          type="file" 
                          accept="video/*" 
                          style={{ display: 'none' }}
                          onChange={(e) => handleProfVideoUpload('apresentacao', e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Vídeo 2: Boas-vindas / Incentivo */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={styles.formLabel}>2. Vídeo de Incentivo & Foco para os Alunos (Link YouTube, TikTok ou Upload)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={profProfileForm.videoIncentivoUrl} 
                        onChange={(e) => setProfProfileForm(prev => ({ ...prev, videoIncentivoUrl: e.target.value }))}
                        style={{ ...styles.inputField, flex: 1 }}
                        placeholder="Ex: Mensagem motivacional no TikTok/YouTube para seus alunos..."
                      />
                      <label style={styles.photoUploadBtnSecondary} title="Gravar com Câmera ou Enviar Vídeo">
                        <Camera size={14} /> Gravar/Upload
                        <input 
                          type="file" 
                          accept="video/*" 
                          style={{ display: 'none' }}
                          onChange={(e) => handleProfVideoUpload('incentivo', e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSavingProfProfile} 
                  style={{ ...styles.saveBtn, padding: '14px', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  className="btn-primary"
                >
                  <Save size={18} />
                  {isSavingProfProfile ? 'Salvando Perfil...' : 'Salvar Meu Perfil & Notificar Alunos'}
                </button>
              </form>
            </div>

            {/* Coluna 2: Preview do Cartão Público (Visão do Aluno) */}
            <div style={styles.card} className="glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ ...styles.sectionTitle, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Eye size={20} color="#3b82f6" /> Prévia: Visão do Aluno
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Atualização ao vivo</span>
              </div>

              {/* Cartão Estilo Modal do Aluno */}
              <div style={styles.profPreviewCard}>
                {/* Topo do Cartão com Avatar e Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={styles.profPreviewAvatar}>
                    {profProfileForm.fotoPerfil ? (
                      <img src={profProfileForm.fotoPerfil} alt={profProfileForm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={32} color="var(--text-secondary)" />
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                      {profProfileForm.name || 'Seu Nome'}
                    </h4>
                    <span style={styles.crefBadge}>
                      <ShieldCheck size={12} /> {profProfileForm.cref ? `CREF: ${profProfileForm.cref}` : 'CREF Pendente'}
                    </span>
                    {profProfileForm.especialidades && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>
                        {profProfileForm.especialidades}
                      </p>
                    )}
                  </div>
                </div>

                {/* Biografia */}
                {profProfileForm.bio && (
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    "{profProfileForm.bio}"
                  </div>
                )}

                {/* Botões de Ação Rápida WhatsApp e Instagram */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {profProfileForm.whatsapp && (
                    <a
                      href={`https://wa.me/55${profProfileForm.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...styles.whatsAppBtn, flex: 1, justifyContent: 'center' }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  )}
                  {profProfileForm.instagram && (
                    <a
                      href={`https://instagram.com/${profProfileForm.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...styles.phoneCallBtn, flex: 1, justifyContent: 'center', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.3)' }}
                    >
                      <InstagramIcon size={15} /> Instagram
                    </a>
                  )}
                </div>

                {/* Vídeo de Apresentação Player (Preview) */}
                {profProfileForm.videoApresentacaoUrl ? (() => {
                  const isDirect = profProfileForm.videoApresentacaoUrl.startsWith('data:video') || profProfileForm.videoApresentacaoUrl.startsWith('blob:') || profProfileForm.videoApresentacaoUrl.endsWith('.mp4');
                  const isTikTok = profProfileForm.videoApresentacaoUrl.includes('tiktok.com');
                  const embedUrl = formatVideoEmbedUrl(profProfileForm.videoApresentacaoUrl);
                  return (
                    <div style={{ marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Video size={14} color="var(--primary)" /> Vídeo de Apresentação {isTikTok ? '(TikTok)' : ''}:
                      </span>
                      <div style={{ width: '100%', height: isTikTok ? '320px' : '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                        {isDirect ? (
                          <video src={profProfileForm.videoApresentacaoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <iframe 
                            src={embedUrl} 
                            title="Vídeo de Apresentação" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen 
                            style={{ width: '100%', height: '100%', border: 'none' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })() : null}

                {/* Box de Chave PIX com Cópia em 1 Clique */}
                {profProfileForm.chavePix && (
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={14} /> Chave PIX para Pagamento
                      </span>
                      {profProfileForm.bancoPix && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{profProfileForm.bancoPix}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={profProfileForm.chavePix} 
                        style={{ ...styles.inputField, flex: 1, padding: '6px 8px', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleCopyPix(profProfileForm.chavePix, true)}
                        style={styles.copyPixBtn}
                      >
                        {copiedPixProf ? <Check size={14} /> : <Copy size={14} />}
                        {copiedPixProf ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    {profProfileForm.titularPix && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        Titular: {profProfileForm.titularPix}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
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

      {/* MODAL DE CONFIRMAÇÃO DE SAÍDA DO APLICATIVO */}
      {showExitConfirmModal && (
        <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setShowExitConfirmModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '420px', textAlign: 'center', padding: '28px 24px' }} className="glass" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#ef4444' }}>
              <LogOut size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '800' }}>
              Deseja realmente sair?
            </h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              Você está na tela inicial do painel do professor. Ao sair, sua sessão será encerrada com segurança.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowExitConfirmModal(false)}
                style={{ ...styles.cancelBtn, flex: 1, padding: '12px', fontWeight: 'bold' }}
              >
                Continuar no App
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowExitConfirmModal(false);
                  logout();
                }}
                style={{ ...styles.exitConfirmBtn, flex: 1 }}
              >
                <LogOut size={16} /> Sair Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTELIGENTE DE GESTÃO / SUGESTÕES / GRAVAÇÃO DE VÍDEO (PROFESSOR) */}
      {editingVideoExercise && (
        <ExerciseVideoManagerModal
          exercise={editingVideoExercise}
          onSave={handleSaveExerciseVideo}
          onClose={() => setEditingVideoExercise(null)}
        />
      )}

      {/* MODAL DE ZOOM DE FOTOS DE AVALIAÇÃO FÍSICA */}
      {evalZoomPhoto && (
        <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setEvalZoomPhoto(null)}>
          <div style={{ ...styles.videoModalContent, maxWidth: '600px', padding: '16px' }} className="glass" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <Camera size={18} color="var(--primary)" /> {evalZoomPhoto.title || 'Foto de Avaliação'}
              </h4>
              <button onClick={() => setEvalZoomPhoto(null)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={{ width: '100%', maxHeight: '75vh', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={evalZoomPhoto.url} 
                alt={evalZoomPhoto.title || 'Foto de Avaliação'} 
                style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONVITE GERADO COM BOTÃO WHATSAPP */}
      {createdInviteModal && (
        <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setCreatedInviteModal(null)}>
          <div style={{ ...styles.videoModalContent, maxWidth: '500px', padding: '24px' }} className="glass" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={22} color="#22c55e" />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Aluno Pré-Cadastrado! 🎉
                </h3>
              </div>
              <button onClick={() => setCreatedInviteModal(null)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>
              O aluno <strong>{createdInviteModal.student.name}</strong> foi adicionado à sua lista. Envie o convite abaixo para que ele defina sua senha e comece a treinar!
            </p>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Link de Convite Seguro:</span>
              <input
                type="text"
                readOnly
                value={createdInviteModal.inviteUrl}
                style={{ ...styles.input, fontSize: '0.8rem', padding: '8px 10px', backgroundColor: 'var(--bg-secondary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={createdInviteModal.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                }}
              >
                <Phone size={18} /> Enviar Convite no WhatsApp Agora
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdInviteModal.inviteUrl);
                  setCopiedInviteLink(true);
                  setTimeout(() => setCopiedInviteLink(false), 2500);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {copiedInviteLink ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                {copiedInviteLink ? 'Link Copiado para a Área de Transferência!' : 'Copiar Link de Convite'}
              </button>
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
  exerciseCategorySelect: {
    fontSize: '0.75rem',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.35)',
    color: '#60a5fa',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
    maxWidth: '160px'
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
  },
  // Anamnese & Avaliação Física Styles
  accordionItem: {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-secondary)',
    marginBottom: '8px'
  },
  accordionHeader: {
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.02)'
  },
  accordionTitle: {
    margin: 0,
    fontSize: '0.98rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  accordionContent: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px'
  },
  gridMedidas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  formLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  inputField: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none'
  },
  selectField: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none'
  },
  parqDisclaimer: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    margin: '0 0 12px 0'
  },
  parqQuestionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    gap: '16px',
    flexWrap: 'wrap'
  },
  parqText: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    flex: 1
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)'
  },
  photoUploadCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    textAlign: 'center'
  },
  photoPreviewWrapper: {
    position: 'relative',
    width: '100%',
    height: '160px',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '8px',
    backgroundColor: '#000'
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  photoDateTag: {
    position: 'absolute',
    bottom: '4px',
    left: '4px',
    right: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    fontSize: '0.68rem',
    fontWeight: 'bold',
    padding: '2px 4px',
    borderRadius: '4px',
    textAlign: 'center'
  },
  photoUploadBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s'
  },
  photoUploadBtnSecondary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    transition: 'all 0.2s'
  },
  historyPhotoBox: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  historyPhotoLabel: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: 'var(--text-secondary)',
    marginBottom: '6px'
  },
  historyPhotoImg: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    backgroundColor: '#000'
  },
  historyPhotoDate: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '6px'
  },
  noPhotoPlaceholder: {
    width: '100%',
    height: '140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
    color: 'var(--text-muted)',
    fontSize: '0.75rem'
  },
  // Estilos de Navegação Superior
  navBarTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    marginBottom: '-8px'
  },
  navBackBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  navBreadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  quickHomeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '6px',
    border: 'none',
    background: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '600'
  },
  exitAppBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    color: '#ef4444',
    fontWeight: '700',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  exitConfirmBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer'
  },
  // Estilos de Perfil e Avatar do Professor
  profHeaderAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-tertiary)',
    border: '2px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  profHeaderAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  crefBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    color: 'var(--primary)',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(139, 92, 246, 0.3)'
  },
  profProfileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '20px',
    alignItems: 'start'
  },
  profPreviewCard: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column'
  },
  profPreviewAvatar: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-tertiary)',
    border: '2px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  // Estilos do Avatar e CRM do Aluno
  studentAvatarBox: {
    position: 'relative',
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    flexShrink: 0
  },
  studentAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
    border: '2px solid var(--primary)'
  },
  studentPhotoBadge: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px solid var(--bg-primary)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
  },
  whatsAppBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#22c55e',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  phoneCallBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.85rem'
  },
  copyPixBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--status-success)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  }
};

export default Professor;
