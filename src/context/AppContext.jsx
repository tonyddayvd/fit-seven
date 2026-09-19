import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { cleanDigits, validateCPF, validateCNPJ, validateDoc } from '../utils/validators';

const AppContext = createContext();

// Inicialização do cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_TENANTS = {
  matrix: { id: 't1', name: 'Academia Matrix', subdomain: 'matrix', plano: 'Plano Black', limiteAlunos: 500 },
  iron: { id: 't2', name: 'Iron Gym', subdomain: 'iron', plano: 'Plano Pro', limiteAlunos: 250 },
  fitclub: { id: 't3', name: 'Fit Club', subdomain: 'fitclub', plano: 'Plano Starter', limiteAlunos: 100 }
};

export const DEFAULT_USERS = [
  { 
    id: 'u8', 
    name: 'Tony (MASTER)', 
    email: 'tony@fitseven.com', 
    role: 'master', 
    tenantId: 'master', 
    password: '123', 
    cpf: '069.977.434-98',
    dataNascimento: '1986-12-19'
  },
  { 
    id: 'u1784223991987', 
    name: 'Tony Dayvd', 
    email: 'tonyddayvd@gmail.com', 
    role: 'aluno', 
    tenantId: 'master', 
    nomeProfessorVinculado: '',
    statusVinculo: 'aprovado',
    password: '123', 
    isVip: true,
    telefone: '11999998888',
    whatsapp: '11999998888',
    cpf: '069.977.434-98',
    dataNascimento: '1986-12-19',
    endereco: 'São Paulo - SP',
    cidade: 'São Paulo - SP',
    chavePix: '06997743498',
    tipoChavePix: 'CPF',
    plano: 'VIP Black',
    dia_vencimento: '10'
  },
  { 
    id: 'u7', 
    name: 'Suporte Master System', 
    email: 'master@fitseven.com', 
    role: 'master', 
    tenantId: 'master', 
    password: '123'
  },
  { 
    id: 'u2', 
    name: 'Prof. Carlos Santos', 
    email: 'carlos@vibe.com', 
    role: 'professor', 
    tenantId: 't1', 
    password: '123',
    cref: '012345-G/SP',
    bio: 'Especialista em Fisiologia do Exercício, Hipertrofia e Emagrecimento Consciente há mais de 10 anos. Foco em biomecânica segura e resultados consistentes.',
    especialidades: 'Hipertrofia, Emagrecimento, Biomecânica, Treinamento Funcional',
    whatsapp: '11998765432',
    instagram: '@profcarlossantos',
    chavePix: 'carlos.santos@matrix.com',
    bancoPix: 'Nubank (260)',
    titularPix: 'Carlos Eduardo Santos',
    videoApresentacaoUrl: 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
    videoIncentivoUrl: 'https://www.youtube.com/embed/0pkjOk0EiAk',
    fotoPerfil: ''
  },
  { 
    id: 'u3', 
    name: 'Lucas Aluno', 
    email: 'lucas@vibe.com', 
    role: 'aluno', 
    tenantId: 't1', 
    password: '123', 
    isVip: true,
    cpf: '123.456.789-00'
  },
  { 
    id: 'u1', 
    name: 'Alice Silva (Estabelec.)', 
    email: 'admin@vibe.com', 
    role: 'estabelecimento', 
    tenantId: 't1', 
    password: '123' 
  },
  { 
    id: 'u4', 
    name: 'Gestor Matrix', 
    email: 'gestor@matrix.com', 
    role: 'academia', 
    tenantId: 't1', 
    password: '123' 
  },
  { 
    id: 'u5', 
    name: 'Roberto Lima (Professor)', 
    email: 'roberto@iron.com', 
    role: 'professor', 
    tenantId: 't2', 
    password: '123',
    cref: '098765-G/RJ',
    bio: 'Preparador físico de atletas e consultor de alta performance.',
    especialidades: 'Powerlifting, Força Pura, Condicionamento Atlético',
    whatsapp: '21987654321',
    instagram: '@coachrobertolima',
    chavePix: 'roberto@iron.com',
    bancoPix: 'Inter (077)',
    titularPix: 'Roberto Lima',
    videoApresentacaoUrl: 'https://www.youtube.com/embed/H6x4yY9_u2w',
    videoIncentivoUrl: 'https://www.youtube.com/embed/Vn83S-A-9yU',
    fotoPerfil: ''
  },
  { 
    id: 'u6', 
    name: 'Mariana Souza (Aluna)', 
    email: 'mariana@iron.com', 
    role: 'aluno', 
    tenantId: 't2', 
    password: '123', 
    isVip: true,
    telefone: '21999998888',
    whatsapp: '21999998888',
    cpf: '456.789.123-44',
    dataNascimento: '2000-11-10',
    endereco: 'Rua Copacabana, 50',
    cidade: 'Rio de Janeiro - RJ',
    chavePix: '21999998888',
    tipoChavePix: 'Celular',
    plano: 'Plano Pro',
    dia_vencimento: '15'
  }
];

export const DEFAULT_WORKOUTS = [
  // Treino A (Peito)
  { id: 'ex1', split: 'A', name: 'Supino Reto com Barra', category: 'Peito', load: '30kg cada lado', reps: '4 séries de 10', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs', video_personalizado_url: '' },
  { id: 'ex2', split: 'A', name: 'Crossover na Polia Média', category: 'Peito', load: '15kg cada lado', reps: '3 séries de 12', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/l5MhN6l3s88', video_personalizado_url: '' },
  
  // Treino B (Costas)
  { id: 'ex3', split: 'B', name: 'Puxada Alta na Polia', category: 'Costas', load: '45kg total', reps: '4 séries de 12', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/H6x4yY9_u2w', video_personalizado_url: '' },
  { id: 'ex4', split: 'B', name: 'Remada Curvada Pronada', category: 'Costas', load: '20kg cada lado', reps: '4 séries de 8', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/H5_p5r8K9H8', video_personalizado_url: '' },
  
  // Treino C (Pernas)
  { id: 'ex5', split: 'C', name: 'Agachamento Livre', category: 'Pernas', load: '20kg cada lado', reps: '4 séries de 12', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/Vn83S-A-9yU', video_personalizado_url: '' },
  { id: 'ex6', split: 'C', name: 'Leg Press 45 Graus', category: 'Pernas', load: '160kg', reps: '4 séries de 10', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/vO-FwS1YhNA', video_personalizado_url: '' },
  
  // Treino D (Braços)
  { id: 'ex7', split: 'D', name: 'Rosca Direta com Barra W', category: 'Bíceps', load: '10kg cada lado', reps: '3 séries de 12', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/ly7TepL4pco', video_personalizado_url: '' },
  { id: 'ex8', split: 'D', name: 'Tríceps Testa com Halter', category: 'Tríceps', load: '12kg cada', reps: '3 séries de 12', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/HlJ_nKpxJg8', video_personalizado_url: '' },
  
  // Treino E (Cardio / Core)
  { id: 'ex9', split: 'E', name: 'Corrida na Esteira', category: 'Cardio', load: 'Velocidade 7/11', reps: '15 minutos', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs', video_personalizado_url: '' },
  { id: 'ex10', split: 'E', name: 'Burpee Completo', category: 'Cardio', load: 'Peso Corporal', reps: '4 séries de 45s', status: 'pendente', video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk', video_personalizado_url: '' }
];

const AI_EXERCISE_POOL = {
  hipertrofia: {
    peito: [
      { name: 'Supino Inclinado com Halteres', reps: '4x10', load: '22kg cada', video: 'https://www.youtube.com/embed/Z1K3JaoK9dM' },
      { name: 'Crossover na Polia Média', reps: '3x12', load: '15kg cada', video: 'https://www.youtube.com/embed/l5MhN6l3s88' }
    ],
    costas: [
      { name: 'Remada Curvada Pronada', reps: '4x8', load: '20kg cada lado', video: 'https://www.youtube.com/embed/H5_p5r8K9H8' },
      { name: 'Pull-down com Corda', reps: '3x12', load: '25kg', video: 'https://www.youtube.com/embed/G6g1gG95wA0' }
    ],
    pernas: [
      { name: 'Leg Press 45 Graus', reps: '4x10', load: '160kg', video: 'https://www.youtube.com/embed/vO-FwS1YhNA' },
      { name: 'Cadeira Extensora', reps: '3x15', load: '40kg', video: 'https://www.youtube.com/embed/U3l0rV3D70w' }
    ],
    bracos: [
      { name: 'Tríceps Testa com Halter', reps: '3x12', load: '12kg cada', video: 'https://www.youtube.com/embed/HlJ_nKpxJg8' },
      { name: 'Rosca Martelo Alternada', reps: '3x10', load: '14kg cada', video: 'https://www.youtube.com/embed/HlJ_nKpxJg8' }
    ]
  },
  emagrecimento: {
    peito: [
      { name: 'Flexão de Braços no Solo', reps: '3x falha', load: 'Peso Corporal', video: 'https://www.youtube.com/embed/0pkjOk0EiAk' }
    ],
    costas: [
      { name: 'Remada Baixa Triângulo', reps: '4x15', load: '30kg', video: 'https://www.youtube.com/embed/H6x4yY9_u2w' }
    ],
    pernas: [
      { name: 'Passada/Afundo Caminhando', reps: '3x20 passos', load: 'Halteres de 10kg', video: 'https://www.youtube.com/embed/6Tz_kO08_iM' }
    ],
    cardio: [
      { name: 'Burpee Completo', reps: '4x45s', load: 'Alta Intensidade', video: 'https://www.youtube.com/embed/0pkjOk0EiAk' },
      { name: 'Corrida Intervalada na Esteira', reps: '15 minutos', load: 'Velocidade 7/11', video: 'https://www.youtube.com/embed/sqOw2Y6u9Xs' }
    ]
  }
};

const getCurrentWeekId = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.getTime());
  sunday.setDate(diff);
  sunday.setHours(0,0,0,0);
  return sunday.toISOString();
};

const gerarHistoricoPagamentos = (diaVencimento, historicoAtual = []) => {
  if (!diaVencimento) return historicoAtual;
  
  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth(); // 0 a 11
  
  const novoHistorico = [...historicoAtual];
  
  // Gera parcelas do mês atual até Dezembro do ano corrente
  for (let m = mesAtual; m < 12; m++) {
    const mesStr = (m + 1).toString().padStart(2, '0');
    const chaveMes = `${mesStr}/${anoAtual}`; // ex: 08/2026
    
    // Se a parcela já existe, não sobrecrevemos
    if (!novoHistorico.find(p => p.mes === chaveMes)) {
      novoHistorico.push({
        id: `p_${chaveMes.replace('/', '')}_${Date.now()}`,
        mes: chaveMes,
        diaVencimento: parseInt(diaVencimento),
        status: 'Pendente' // Pago, Pendente, Vencido (calculado na view)
      });
    }
  }
  return novoHistorico;
};

export const AppProvider = ({ children }) => {
  // Rota Virtual
  const [virtualRoute, setVirtualRoute] = useState('app');

  // Estados carregados do Supabase com fallback garantido
  const [tenants, setTenants] = useState(() => {
    const saved = localStorage.getItem('fitseven-tenants');
    return saved ? JSON.parse(saved) : DEFAULT_TENANTS;
  });

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('fitseven-users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(u => u.id !== 'u_master_aluno').map(u => {
            if (u.id === 'u8' || u.id === 'u7') return { ...u, cpf: '069.977.434-98', dataNascimento: '1986-12-19' };
            if (u.id === 'u1784223991987') return { ...u, name: 'Tony Dayvd', cpf: '069.977.434-98', dataNascimento: '1986-12-19', tenantId: 'master', nomeProfessorVinculado: '', statusVinculo: 'aprovado', isVip: true };
            return u;
          });
        }
      } catch (e) {}
    }
    return DEFAULT_USERS;
  });

  const [workoutsByStudent, setWorkoutsByStudent] = useState(() => {
    const saved = localStorage.getItem('fitseven-workouts');
    const defaultMap = {
      'u1784223991987': { exercises: DEFAULT_WORKOUTS, isVip: true, vipHtml: '', finishedSplits: [], weekId: getCurrentWeekId(), status: 'published' },
      'u3': { exercises: DEFAULT_WORKOUTS, isVip: true, vipHtml: '', finishedSplits: [], weekId: getCurrentWeekId(), status: 'published' },
      'u6': { exercises: DEFAULT_WORKOUTS, isVip: true, vipHtml: '', finishedSplits: [], weekId: getCurrentWeekId(), status: 'published' }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultMap, ...parsed };
      } catch (e) {}
    }
    return defaultMap;
  });
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [approvedEvaluations, setApprovedEvaluations] = useState([]);
  const [workoutSessionsHistory, setWorkoutSessionsHistory] = useState(() => {
    const saved = localStorage.getItem('fitseven-workout-sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [bugReports, setBugReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sistema de Notificações Inteligentes
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('fitseven-notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'notif_welcome',
        type: 'sistema',
        title: '👋 Bem-vindo ao Fit Seven!',
        message: 'Acompanhe seus treinos, medidas e vídeos de incentivo do seu treinador.',
        timestamp: new Date().toISOString(),
        readBy: []
      }
    ];
  });

  // Estados de sessão (Persistidos localmente para conveniência do usuário logado)
  const [originalUser, setOriginalUser] = useState(() => {
    const saved = localStorage.getItem('fitseven-original-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fitseven-user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id === 'u_master_aluno' || parsed.id === 'u3')) {
          const uStudentDef = DEFAULT_USERS.find(u => u.id === 'u1784223991987');
          return uStudentDef || null;
        }
        return parsed;
      } catch (e) {}
    }
    return null;
  });

  // Tema
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('fitseven-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('fitseven-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [bypassRole, setBypassRole] = useState(() => localStorage.getItem('fitseven-bypass-role') || null);
  const [bypassTenantId, setBypassTenantId] = useState(() => localStorage.getItem('fitseven-bypass-tenant') || null);

  // Função para sincronizar dados com o Supabase
  const refreshData = async () => {
    try {
      // 1. Carregar Tenants
      const { data: tenantsData, error: tenantsErr } = await supabase.from('tenants').select('*');
      if (!tenantsErr && tenantsData && tenantsData.length > 0) {
        const tenantMap = {};
        tenantsData.forEach(t => {
          tenantMap[t.subdomain] = {
            id: t.id,
            name: t.nome,
            subdomain: t.subdomain,
            plano: t.plano,
            limiteAlunos: t.limite_alunos
          };
        });
        setTenants(tenantMap);
        localStorage.setItem('fitseven-tenants', JSON.stringify(tenantMap));
      }

      // 2. Carregar Users
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*');
      if (!usersErr && usersData && usersData.length > 0) {
        const mappedUsers = usersData.map(u => ({
          id: u.id,
          tenantId: u.tenant_id,
          role: u.role,
          isVip: u.plano_vip,
          name: u.dados_pessoais?.name,
          email: u.dados_pessoais?.email,
          password: u.dados_pessoais?.password,
          data_cadastro: u.dados_pessoais?.data_cadastro,
          data_ativacao_vip: u.dados_pessoais?.data_ativacao_vip,
          plano: u.dados_pessoais?.plano,
          limiteAlunos: u.dados_pessoais?.limiteAlunos,
          customPlans: u.dados_pessoais?.customPlans || [],
          pagamentoStatus: u.dados_pessoais?.pagamentoStatus || 'Pendente',
          telefone: u.dados_pessoais?.telefone || '',
          whatsapp: u.dados_pessoais?.whatsapp || u.dados_pessoais?.telefone || '',
          cpf: u.dados_pessoais?.cpf || '',
          dataNascimento: u.dados_pessoais?.dataNascimento || '',
          endereco: u.dados_pessoais?.endereco || '',
          cidade: u.dados_pessoais?.cidade || '',
          chavePix: u.dados_pessoais?.chavePix || '',
          tipoChavePix: u.dados_pessoais?.tipoChavePix || 'CPF',
          bancoPix: u.dados_pessoais?.bancoPix || '',
          titularPix: u.dados_pessoais?.titularPix || '',
          contatoEmergenciaNome: u.dados_pessoais?.contatoEmergenciaNome || '',
          contatoEmergenciaTel: u.dados_pessoais?.contatoEmergenciaTel || '',
          anotacoesProfessor: u.dados_pessoais?.anotacoesProfessor || '',
          fotoPerfil: u.dados_pessoais?.fotoPerfil || '',
          cref: u.dados_pessoais?.cref || '',
          bio: u.dados_pessoais?.bio || '',
          especialidades: u.dados_pessoais?.especialidades || '',
          instagram: u.dados_pessoais?.instagram || '',
          videoApresentacaoUrl: u.dados_pessoais?.videoApresentacaoUrl || '',
          videoIncentivoUrl: u.dados_pessoais?.videoIncentivoUrl || '',
          dia_vencimento: u.dados_pessoais?.dia_vencimento || '',
          statusVinculo: u.dados_pessoais?.statusVinculo || (u.role === 'aluno' ? 'aprovado' : undefined),
          primeiroAcesso: u.dados_pessoais?.primeiroAcesso !== undefined ? u.dados_pessoais.primeiroAcesso : (u.dados_pessoais?.password === '123'),
          preCadastro: u.dados_pessoais?.preCadastro || false,
          solicitadoEm: u.dados_pessoais?.solicitadoEm || null,
          nomeProfessorVinculado: u.dados_pessoais?.nomeProfessorVinculado || '',
          cnpj: u.dados_pessoais?.cnpj || '',
          responsavel: u.dados_pessoais?.responsavel || '',
          historico_pagamentos: u.dados_pessoais?.historico_pagamentos || []
        }));

        // Mescla garantindo que os usuários essenciais de teste existam
        const mergedUsers = [...DEFAULT_USERS];
        mappedUsers.forEach(mu => {
          const idx = mergedUsers.findIndex(u => (u.id === mu.id) || (u.email && mu.email && u.email.toLowerCase() === mu.email.toLowerCase()));
          if (idx >= 0) {
            const defUser = mergedUsers[idx];
            mergedUsers[idx] = { 
              ...defUser, 
              ...mu,
              // Preserva CPF e data de nascimento essenciais
              cpf: mu.cpf || defUser.cpf,
              dataNascimento: mu.dataNascimento || defUser.dataNascimento,
              name: (mu.id === 'u3' && (!mu.name || mu.name.includes('Ana Silva'))) ? defUser.name : (mu.name || defUser.name),
              email: (mu.id === 'u3' && (!mu.email || mu.email.includes('ana@'))) ? defUser.email : (mu.email || defUser.email),
              tenantId: (mu.id === 'u3' && defUser.tenantId === '') ? '' : (mu.tenantId !== undefined ? mu.tenantId : defUser.tenantId),
              nomeProfessorVinculado: (mu.id === 'u3' && defUser.nomeProfessorVinculado === '') ? '' : (mu.nomeProfessorVinculado || defUser.nomeProfessorVinculado)
            };
          } else {
            mergedUsers.push(mu);
          }
        });

        setUsersList(mergedUsers);
        localStorage.setItem('fitseven-users', JSON.stringify(mergedUsers));
      }

      // 3. Carregar Avaliacoes com Parsing Robusto do campo JSONB medidas
      const { data: evalsData, error: evalsErr } = await supabase.from('avaliacoes').select('*');
      if (!evalsErr && evalsData) {
        const mappedEvals = evalsData.map(ev => {
          let parsedMedidas = {};
          if (ev.medidas) {
            if (typeof ev.medidas === 'string') {
              try {
                parsedMedidas = JSON.parse(ev.medidas);
              } catch (e) {
                console.error('Erro ao fazer parse de medidas:', e);
              }
            } else {
              parsedMedidas = ev.medidas;
            }
          }
          return {
            ...parsedMedidas,
            id: ev.id,
            userId: ev.user_id,
            tenantId: ev.tenant_id,
            // Status vive dentro do campo medidas (JSONB) para não precisar de DDL
            _status: parsedMedidas._status || 'pending',
            _approvedAt: parsedMedidas._approvedAt || null
          };
        });
        // Filtra apenas avaliações reais (ignorando bugs e marcações de treino concluído)
        const validEvals = mappedEvals.filter(ev => 
          (ev.userName || ev.nome) && 
          ev._type !== 'bug_report' && 
          !ev.formData?.workoutCompleted
        );
        // Separar pendentes das aprovadas
        setPendingEvaluations(validEvals.filter(ev => ev._status !== 'approved'));
        setApprovedEvaluations(validEvals.filter(ev => ev._status === 'approved'));

        // Sessões históricas de treino concluído
        const sessions = mappedEvals.filter(ev => ev.formData?.workoutCompleted || ev._type === 'workout_completed');
        if (sessions.length > 0) {
          setWorkoutSessionsHistory(sessions);
          localStorage.setItem('fitseven-workout-sessions', JSON.stringify(sessions));
        }
      }

      // 4. Carregar Treinos
      const { data: treinosData, error: treinosErr } = await supabase.from('treinos_html').select('*');
      if (!treinosErr && treinosData) {
        const treinosMap = {};
        treinosData.forEach(tr => {
          try {
            const parsed = JSON.parse(tr.html_content);
            if (parsed && (parsed.exercises || parsed.vipHtml)) {
              let loadedExercises = parsed.exercises || [];
              let loadedSplits = parsed.finishedSplits || [];
              const currentWeekId = getCurrentWeekId();
              
              if (parsed.weekId && parsed.weekId !== currentWeekId) {
                 loadedExercises = loadedExercises.map(ex => ({...ex, status: 'pendente'}));
                 loadedSplits = [];
              }

              treinosMap[tr.user_id] = {
                exercises: loadedExercises,
                finishedSplits: loadedSplits,
                isVip: parsed.isVip !== undefined ? parsed.isVip : true,
                vipHtml: parsed.vipHtml || tr.html_content,
                weekId: parsed.weekId && parsed.weekId === currentWeekId ? parsed.weekId : currentWeekId,
                status: parsed.status || 'published'
              };
            } else {
              treinosMap[tr.user_id] = { exercises: [], finishedSplits: [], isVip: true, vipHtml: tr.html_content, weekId: getCurrentWeekId(), status: 'published' };
            }
          } catch (e) {
            treinosMap[tr.user_id] = { exercises: [], finishedSplits: [], isVip: true, vipHtml: tr.html_content, weekId: getCurrentWeekId() };
          }
        });
        setWorkoutsByStudent(treinosMap);
      }

      // 5. Carregar Bug Reports (Mesclando Nuvem e LocalStorage)
      const localBugs = localStorage.getItem('fitseven-bug-reports');
      let parsedLocalBugs = [];
      if (localBugs) {
        try { parsedLocalBugs = JSON.parse(localBugs); } catch(e) {}
      }
      
      const { data: cloudBugsData } = await supabase
        .from('avaliacoes')
        .select('medidas')
        .contains('medidas', { _type: 'bug_report' });

      let cloudBugs = [];
      if (cloudBugsData) {
        cloudBugs = cloudBugsData.map(d => d.medidas);
      }

      // Mescla removendo duplicatas pelo ID (priorizando a nuvem)
      const allBugsMap = new Map();
      parsedLocalBugs.forEach(b => allBugsMap.set(b.id, b));
      cloudBugs.forEach(b => allBugsMap.set(b.id, b));
      
      const mergedBugs = Array.from(allBugsMap.values()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setBugReports(mergedBugs);
      localStorage.setItem('fitseven-bug-reports', JSON.stringify(mergedBugs));

    } catch (err) {
      console.error('Erro ao sincronizar com o Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // CRUD functions no Supabase
  const addTenant = async (tenant) => {
    const id = `t${Date.now()}`;
    const { error } = await supabase.from('tenants').insert({
      id,
      nome: tenant.name,
      limite_alunos: parseInt(tenant.limiteAlunos) || 10,
      plano: tenant.plano || 'Básico',
      subdomain: tenant.subdomain
    });
    if (error) throw error;
    await refreshData();
    return id;
  };

  const updateTenant = async (subdomain, updatedData) => {
    const { error } = await supabase.from('tenants').update({
      nome: updatedData.name,
      limite_alunos: parseInt(updatedData.limiteAlunos),
      plano: updatedData.plano
    }).eq('subdomain', subdomain);
    if (error) throw error;
    await refreshData();
  };

  const deleteTenant = async (subdomain) => {
    const { error } = await supabase.from('tenants').delete().eq('subdomain', subdomain);
    if (error) throw error;
    await refreshData();
  };

  const addUser = async (userData) => {
    const tenantId = userData.tenantId || 'master';
    if (userData.role === 'aluno') {
      if (tenantId) {
        let limit = 100;
        let isProfessorTenant = false;
        
        const tenant = Object.values(tenants).find(t => t.id === tenantId);
        if (tenant) {
          limit = parseInt(tenant.limiteAlunos) || 10;
        } else {
          const prof = usersList.find(u => u.id === tenantId && u.role === 'professor');
          if (prof) {
            limit = parseInt(prof.limiteAlunos) || 10;
            isProfessorTenant = true;
          }
        }
        
        const currentAlunosCount = usersList.filter(u => u.role === 'aluno' && u.tenantId === tenantId).length;
        if (currentAlunosCount >= limit) {
          const errMsg = isProfessorTenant 
            ? 'Limite do seu plano atingido. Faça um upgrade para adicionar mais alunos.' 
            : 'Limite de alunos do plano atingido. Entre em contato com o suporte para upgrade.';
          alert(errMsg);
          throw new Error(errMsg);
        }
      }
    }

    const id = `u${Date.now()}`;
    const dadosPessoais = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      data_cadastro: new Date().toISOString(),
      data_ativacao_vip: null,
      plano: userData.plano || null,
      limiteAlunos: userData.limiteAlunos || null,
      customPlans: userData.customPlans || [],
      pagamentoStatus: 'Pendente',
      telefone: userData.telefone || '',
      whatsapp: userData.whatsapp || userData.telefone || '',
      cpf: userData.cpf || '',
      dataNascimento: userData.dataNascimento || '',
      endereco: userData.endereco || '',
      cidade: userData.cidade || '',
      chavePix: userData.chavePix || '',
      tipoChavePix: userData.tipoChavePix || 'CPF',
      bancoPix: userData.bancoPix || '',
      titularPix: userData.titularPix || '',
      contatoEmergenciaNome: userData.contatoEmergenciaNome || '',
      contatoEmergenciaTel: userData.contatoEmergenciaTel || '',
      anotacoesProfessor: userData.anotacoesProfessor || '',
      fotoPerfil: userData.fotoPerfil || '',
      cref: userData.cref || '',
      bio: userData.bio || '',
      especialidades: userData.especialidades || '',
      instagram: userData.instagram || '',
      videoApresentacaoUrl: userData.videoApresentacaoUrl || '',
      videoIncentivoUrl: userData.videoIncentivoUrl || '',
      dia_vencimento: userData.dia_vencimento || '',
      statusVinculo: userData.statusVinculo || (userData.role === 'aluno' ? 'aprovado' : undefined),
      primeiroAcesso: userData.primeiroAcesso !== undefined ? userData.primeiroAcesso : (userData.password === '123'),
      preCadastro: userData.preCadastro || false,
      solicitadoEm: userData.solicitadoEm || null,
      nomeProfessorVinculado: userData.nomeProfessorVinculado || '',
      cnpj: userData.cnpj || '',
      responsavel: userData.responsavel || '',
      historico_pagamentos: gerarHistoricoPagamentos(userData.dia_vencimento, [])
    };

    // Professores e academias não pertencem a um tenant (evita violação de FK)
    // Apenas alunos têm tenant_id preenchido (apontando para o tenant real no banco)
    const roleFinal = userData.role || 'aluno';
    const dbTenantId = (roleFinal === 'professor' || roleFinal === 'estabelecimento' || roleFinal === 'academia')
      ? null
      : (tenantId || null);

    const { error } = await supabase.from('users').insert({
      id,
      tenant_id: dbTenantId,
      role: roleFinal,
      plano_vip: false,
      dados_pessoais: dadosPessoais
    });
    
    if (error) throw error;
    await refreshData();
    
    return { id, ...userData };
  };

  const updateUser = async (userId, updatedData) => {
    const userObj = usersList.find(u => u.id === userId);
    if (!userObj) return;

    const updatedPersonal = {
      name: updatedData.name !== undefined ? updatedData.name : userObj.name,
      email: updatedData.email !== undefined ? updatedData.email : userObj.email,
      password: updatedData.password !== undefined ? updatedData.password : userObj.password,
      data_cadastro: userObj.data_cadastro,
      data_ativacao_vip: updatedData.data_ativacao_vip !== undefined ? updatedData.data_ativacao_vip : userObj.data_ativacao_vip,
      plano: updatedData.plano !== undefined ? updatedData.plano : userObj.plano,
      limiteAlunos: updatedData.limiteAlunos !== undefined ? updatedData.limiteAlunos : userObj.limiteAlunos,
      customPlans: updatedData.customPlans !== undefined ? updatedData.customPlans : (userObj.customPlans || []),
      pagamentoStatus: updatedData.pagamentoStatus !== undefined ? updatedData.pagamentoStatus : (userObj.pagamentoStatus || 'Pendente'),
      telefone: updatedData.telefone !== undefined ? updatedData.telefone : (userObj.telefone || ''),
      whatsapp: updatedData.whatsapp !== undefined ? updatedData.whatsapp : (userObj.whatsapp || userObj.telefone || ''),
      cpf: updatedData.cpf !== undefined ? updatedData.cpf : (userObj.cpf || ''),
      dataNascimento: updatedData.dataNascimento !== undefined ? updatedData.dataNascimento : (userObj.dataNascimento || ''),
      endereco: updatedData.endereco !== undefined ? updatedData.endereco : (userObj.endereco || ''),
      cidade: updatedData.cidade !== undefined ? updatedData.cidade : (userObj.cidade || ''),
      chavePix: updatedData.chavePix !== undefined ? updatedData.chavePix : (userObj.chavePix || ''),
      tipoChavePix: updatedData.tipoChavePix !== undefined ? updatedData.tipoChavePix : (userObj.tipoChavePix || 'CPF'),
      bancoPix: updatedData.bancoPix !== undefined ? updatedData.bancoPix : (userObj.bancoPix || ''),
      titularPix: updatedData.titularPix !== undefined ? updatedData.titularPix : (userObj.titularPix || ''),
      contatoEmergenciaNome: updatedData.contatoEmergenciaNome !== undefined ? updatedData.contatoEmergenciaNome : (userObj.contatoEmergenciaNome || ''),
      contatoEmergenciaTel: updatedData.contatoEmergenciaTel !== undefined ? updatedData.contatoEmergenciaTel : (userObj.contatoEmergenciaTel || ''),
      anotacoesProfessor: updatedData.anotacoesProfessor !== undefined ? updatedData.anotacoesProfessor : (userObj.anotacoesProfessor || ''),
      fotoPerfil: updatedData.fotoPerfil !== undefined ? updatedData.fotoPerfil : (userObj.fotoPerfil || ''),
      cref: updatedData.cref !== undefined ? updatedData.cref : (userObj.cref || ''),
      bio: updatedData.bio !== undefined ? updatedData.bio : (userObj.bio || ''),
      especialidades: updatedData.especialidades !== undefined ? updatedData.especialidades : (userObj.especialidades || ''),
      instagram: updatedData.instagram !== undefined ? updatedData.instagram : (userObj.instagram || ''),
      videoApresentacaoUrl: updatedData.videoApresentacaoUrl !== undefined ? updatedData.videoApresentacaoUrl : (userObj.videoApresentacaoUrl || ''),
      videoIncentivoUrl: updatedData.videoIncentivoUrl !== undefined ? updatedData.videoIncentivoUrl : (userObj.videoIncentivoUrl || ''),
      dia_vencimento: updatedData.dia_vencimento !== undefined ? updatedData.dia_vencimento : (userObj.dia_vencimento || ''),
      statusVinculo: updatedData.statusVinculo !== undefined ? updatedData.statusVinculo : (userObj.statusVinculo || (userObj.role === 'aluno' ? 'aprovado' : undefined)),
      primeiroAcesso: updatedData.primeiroAcesso !== undefined ? updatedData.primeiroAcesso : (userObj.primeiroAcesso || false),
      preCadastro: updatedData.preCadastro !== undefined ? updatedData.preCadastro : (userObj.preCadastro || false),
      solicitadoEm: updatedData.solicitadoEm !== undefined ? updatedData.solicitadoEm : (userObj.solicitadoEm || null),
      nomeProfessorVinculado: updatedData.nomeProfessorVinculado !== undefined ? updatedData.nomeProfessorVinculado : (userObj.nomeProfessorVinculado || ''),
      cnpj: updatedData.cnpj !== undefined ? updatedData.cnpj : (userObj.cnpj || ''),
      responsavel: updatedData.responsavel !== undefined ? updatedData.responsavel : (userObj.responsavel || ''),
      historico_pagamentos: updatedData.historico_pagamentos !== undefined ? updatedData.historico_pagamentos : (
        updatedData.dia_vencimento !== undefined && updatedData.dia_vencimento !== userObj.dia_vencimento 
          ? gerarHistoricoPagamentos(updatedData.dia_vencimento, userObj.historico_pagamentos || [])
          : (userObj.historico_pagamentos || [])
      )
    };

    const targetTenantId = updatedData.tenantId !== undefined ? updatedData.tenantId : userObj.tenantId;

    const { error } = await supabase.from('users').update({
      role: updatedData.role || userObj.role,
      tenant_id: targetTenantId,
      plano_vip: updatedData.isVip !== undefined ? updatedData.isVip : userObj.isVip,
      dados_pessoais: updatedPersonal
    }).eq('id', userId);

    if (error) throw error;
    
    // Atualização otimista no estado local
    const mergedUser = {
      ...userObj,
      ...updatedData,
      tenantId: targetTenantId,
      ...updatedPersonal
    };
    const newUsersList = usersList.map(u => u.id === userId ? mergedUser : u);
    setUsersList(newUsersList);
    localStorage.setItem('fitseven-users', JSON.stringify(newUsersList));
    
    if (user && user.id === userId) {
      setUser(mergedUser);
      localStorage.setItem('fitseven-user', JSON.stringify(mergedUser));
    }

    await refreshData();
  };

  // Métodos de Notificações
  const createNotification = (notifData) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      readBy: [],
      ...notifData
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem('fitseven-notifications', JSON.stringify(updated));
      return updated;
    });
    return newNotif;
  };

  const markNotificationAsRead = (notifId, targetUserId) => {
    if (!notifId || !targetUserId) return;
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (n.id === notifId) {
          const currentRead = n.readBy || [];
          if (!currentRead.includes(targetUserId)) {
            return { ...n, readBy: [...currentRead, targetUserId] };
          }
        }
        return n;
      });
      localStorage.setItem('fitseven-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const getNotificationsForUser = (targetUserId, targetTenantId) => {
    return notifications.filter(n => {
      // Notificação global do sistema
      if (!n.targetUserId && !n.targetTenantId) return true;
      // Notificação direta para o usuário
      if (n.targetUserId && n.targetUserId === targetUserId) return true;
      // Notificação para o tenant do usuário
      if (n.targetTenantId && n.targetTenantId === targetTenantId) return true;
      return false;
    });
  };

  const getUnreadNotificationsForUser = (targetUserId, targetTenantId) => {
    const userNotifs = getNotificationsForUser(targetUserId, targetTenantId);
    return userNotifs.filter(n => !(n.readBy || []).includes(targetUserId));
  };

  const updateUserProfile = async (userId, updatedData) => {
    const userObj = usersList.find(u => u.id === userId);
    if (!userObj) return;

    const merged = {
      ...userObj,
      ...updatedData
    };

    // Atualiza estado local usersList
    const newUsersList = usersList.map(u => u.id === userId ? merged : u);
    setUsersList(newUsersList);
    localStorage.setItem('fitseven-users', JSON.stringify(newUsersList));

    // Se o usuário logado for o próprio
    if (user && user.id === userId) {
      setUser(merged);
      localStorage.setItem('fitseven-user', JSON.stringify(merged));
    }

    // Se o professor atualizou vídeo motivacional ou apresentação, dispara notificação para os alunos
    if (userObj.role === 'professor') {
      const hasNewIncentivo = updatedData.videoIncentivoUrl && updatedData.videoIncentivoUrl !== userObj.videoIncentivoUrl;
      const hasNewApresentacao = updatedData.videoApresentacaoUrl && updatedData.videoApresentacaoUrl !== userObj.videoApresentacaoUrl;

      if (hasNewIncentivo) {
        createNotification({
          type: 'video_incentivo',
          title: '🔥 Novo Vídeo Motivacional!',
          message: `${userObj.name} acabou de postar um novo vídeo de incentivo para te motivar nos treinos!`,
          senderId: userId,
          senderName: userObj.name,
          senderAvatar: updatedData.fotoPerfil || userObj.fotoPerfil || '',
          targetTenantId: userObj.tenantId,
          mediaUrl: updatedData.videoIncentivoUrl,
          actionType: 'open_professor_modal'
        });
      } else if (hasNewApresentacao) {
        createNotification({
          type: 'video_apresentacao',
          title: '🎬 Vídeo de Apresentação Atualizado!',
          message: `${userObj.name} atualizou o vídeo de apresentação profissional com novas dicas e orientações!`,
          senderId: userId,
          senderName: userObj.name,
          senderAvatar: updatedData.fotoPerfil || userObj.fotoPerfil || '',
          targetTenantId: userObj.tenantId,
          mediaUrl: updatedData.videoApresentacaoUrl,
          actionType: 'open_professor_modal'
        });
      }
    }

    // Persiste no Supabase
    try {
      await updateUser(userId, merged);
    } catch (e) {
      console.warn('Persistido localmente no updateUserProfile:', e);
    }
    return merged;
  };

  const deleteUser = async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    await refreshData();
  };

  const toggleUserVip = async (userId) => {
    const userObj = usersList.find(u => u.id === userId);
    if (!userObj) return;

    const isNowVip = !userObj.isVip;
    const updatedPersonal = {
      name: userObj.name,
      email: userObj.email,
      password: userObj.password,
      data_cadastro: userObj.data_cadastro,
      data_ativacao_vip: isNowVip ? new Date().toISOString() : null,
      plano: userObj.plano,
      limiteAlunos: userObj.limiteAlunos,
      customPlans: userObj.customPlans || [],
      pagamentoStatus: userObj.pagamentoStatus || 'Pendente'
    };

    const { error: userErr } = await supabase.from('users').update({
      plano_vip: isNowVip,
      dados_pessoais: updatedPersonal
    }).eq('id', userId);

    if (userErr) throw userErr;

    // Sincronizar com os treinos na tabela treinos_html
    const currentWorkoutData = workoutsByStudent[userId] || { exercises: DEFAULT_WORKOUTS, isVip: false, vipHtml: '' };
    const updatedWorkout = {
      ...currentWorkoutData,
      isVip: isNowVip,
      weekId: currentWorkoutData.weekId || getCurrentWeekId()
    };

    const { error: workoutErr } = await supabase.from('treinos_html').upsert({
      id: `t_html_${userId}`,
      tenant_id: userObj.tenantId,
      user_id: userId,
      html_content: JSON.stringify(updatedWorkout)
    });

    if (workoutErr) throw workoutErr;
    await refreshData();
  };

  const loginAsUser = (targetUser) => {
    if (!originalUser) {
      setOriginalUser(user);
      localStorage.setItem('fitseven-original-user', JSON.stringify(user));
    }
    setUser(targetUser);
    localStorage.setItem('fitseven-user', JSON.stringify(targetUser));
    setBypassRole(null);
    setBypassTenantId(null);
    localStorage.removeItem('fitseven-bypass-role');
    localStorage.removeItem('fitseven-bypass-tenant');
  };

  const revertToMaster = () => {
    if (originalUser) {
      setUser(originalUser);
      localStorage.setItem('fitseven-user', JSON.stringify(originalUser));
      setOriginalUser(null);
      localStorage.removeItem('fitseven-original-user');
    }
  };

  // 1. Cadastro Público de Usuários (Aluno, Professor, Estabelecimento)
  const registerUser = async (userData) => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('E-mail é obrigatório.');

    const emailExists = usersList.some(u => (u.email || '').trim().toLowerCase() === cleanEmail);
    if (emailExists) throw new Error('Este e-mail já está cadastrado na plataforma.');

    const cleanCpf = cleanDigits(userData.cpf);
    const cleanCnpj = cleanDigits(userData.cnpj);

    if (userData.role === 'aluno' || userData.role === 'professor') {
      if (!cleanCpf) throw new Error('CPF é obrigatório.');
      if (!validateCPF(cleanCpf)) throw new Error('CPF inválido. Verifique os números digitados.');
      
      const cpfExists = usersList.some(u => cleanDigits(u.cpf) === cleanCpf);
      if (cpfExists) throw new Error('Este CPF já está cadastrado no Fit Seven.');
    } else if (userData.role === 'estabelecimento') {
      const doc = cleanCnpj || cleanCpf;
      if (!doc) throw new Error('CNPJ ou CPF é obrigatório para estabelecimentos.');
      if (!validateDoc(doc)) throw new Error('CNPJ/CPF inválido. Verifique os números digitados.');
      
      const docExists = usersList.some(u => cleanDigits(u.cnpj) === doc || cleanDigits(u.cpf) === doc);
      if (docExists) throw new Error('Este documento já está cadastrado no Fit Seven.');
    }

    let tenantId = userData.tenantId || 't1';
    let statusVinculo = 'aprovado';
    let nomeProfVinculado = '';

    if (userData.role === 'aluno') {
      if (userData.professorTargetId) {
        tenantId = userData.professorTargetId;
        statusVinculo = 'pendente_aprovacao';
        const targetProf = usersList.find(u => u.id === userData.professorTargetId) || Object.values(tenants).find(t => t.id === userData.professorTargetId);
        nomeProfVinculado = targetProf?.name || '';
      }
    }

    const newUser = await addUser({
      ...userData,
      email: cleanEmail,
      cpf: cleanCpf || '',
      cnpj: cleanCnpj || '',
      statusVinculo,
      nomeProfessorVinculado: nomeProfVinculado,
      primeiroAcesso: false,
      preCadastro: false,
      solicitadoEm: statusVinculo === 'pendente_aprovacao' ? new Date().toISOString() : null,
      limiteAlunos: userData.role === 'professor' ? 10 : (userData.role === 'estabelecimento' ? 50 : undefined)
    });

    if (statusVinculo === 'pendente_aprovacao' && userData.professorTargetId) {
      createNotification({
        type: 'solicitacao_vinculo',
        title: '🔔 Nova Solicitação de Aluno!',
        message: `${userData.name} solicitou entrar na sua consultoria/academia. Aprove para ativar o aluno.`,
        senderId: newUser.id,
        senderName: userData.name,
        targetUserId: userData.professorTargetId,
        targetTenantId: userData.professorTargetId,
        actionType: 'open_students_tab'
      });
    }

    return newUser;
  };

  // 2. Recuperação de Senha Segura e Sem Custos por CPF + Confirmação Secundária
  const resetPasswordByCpf = async (cpf, confirmValue, newPassword) => {
    const cleanCpf = cleanDigits(cpf);
    if (!cleanCpf) throw new Error('Informe o CPF cadastrado.');
    if (!validateCPF(cleanCpf)) throw new Error('CPF com formato inválido.');
    if (!newPassword || newPassword.length < 3) throw new Error('A nova senha deve ter no mínimo 3 caracteres.');

    const cleanConfirm = (confirmValue || '').trim().toLowerCase();
    const cleanConfirmDigits = cleanDigits(confirmValue);

    const matchedUsers = usersList.filter(u => cleanDigits(u.cpf) === cleanCpf || cleanDigits(u.cnpj) === cleanCpf);
    if (matchedUsers.length === 0) {
      throw new Error('Nenhum usuário encontrado com este CPF/CNPJ.');
    }

    const validUser = matchedUsers.find(targetUser => {
      const emailMatch = (targetUser.email || '').trim().toLowerCase() === cleanConfirm;
      
      const userBirthDigits = cleanDigits(targetUser.dataNascimento || '');
      const confirmBirthDigits = cleanDigits(cleanConfirm);
      const birthDigitsMatch = userBirthDigits && confirmBirthDigits && (
        userBirthDigits === confirmBirthDigits ||
        (userBirthDigits.slice(0, 4) === confirmBirthDigits.slice(4, 8) && userBirthDigits.slice(4, 6) === confirmBirthDigits.slice(2, 4) && userBirthDigits.slice(6, 8) === confirmBirthDigits.slice(0, 2)) ||
        (userBirthDigits.slice(4, 8) === confirmBirthDigits.slice(0, 4) && userBirthDigits.slice(2, 4) === confirmBirthDigits.slice(4, 6) && userBirthDigits.slice(0, 2) === confirmBirthDigits.slice(6, 8))
      );
      const birthDirectMatch = (targetUser.dataNascimento || '').trim() === cleanConfirm;

      const phoneMatch = cleanConfirmDigits && cleanConfirmDigits.length >= 8 && cleanDigits(targetUser.whatsapp || targetUser.telefone || '').includes(cleanConfirmDigits);

      return emailMatch || birthDigitsMatch || birthDirectMatch || phoneMatch;
    });

    if (!validUser) {
      throw new Error('Dado de confirmação (E-mail, Data de Nascimento ou WhatsApp) incorreto.');
    }

    // Atualiza a senha das contas vinculadas a este CPF
    for (const u of matchedUsers) {
      await updateUser(u.id, {
        password: newPassword,
        primeiroAcesso: false
      });
    }

    return { success: true, message: 'Senha atualizada com sucesso! Você já pode fazer login.' };
  };

  // 3. Troca de Senha (Primeiro Acesso ou Configurações de Perfil)
  const changePassword = async (userId, newPassword) => {
    if (!newPassword || newPassword.length < 3) throw new Error('A senha deve ter no mínimo 3 caracteres.');
    
    const userObj = usersList.find(u => u.id === userId);
    const cleanUserCpf = cleanDigits(userObj?.cpf);
    
    // Se o usuário possui CPF, busca todas as contas associadas ao mesmo CPF
    const targetUsers = (cleanUserCpf && cleanUserCpf.length === 11)
      ? usersList.filter(u => cleanDigits(u.cpf) === cleanUserCpf || u.id === userId)
      : (userObj ? [userObj] : [{ id: userId }]);

    for (const u of targetUsers) {
      await updateUser(u.id, {
        password: newPassword,
        primeiroAcesso: false
      });
    }

    // Se o usuário ativo for um dos atualizados, atualiza o estado local imediatamente
    if (user && targetUsers.some(tu => tu.id === user.id)) {
      const updatedLoggedUser = { ...user, password: newPassword, primeiroAcesso: false };
      setUser(updatedLoggedUser);
      localStorage.setItem('fitseven-user', JSON.stringify(updatedLoggedUser));
    }

    return true;
  };

  // 4. Transferência / Alteração Livre de Vínculo de Aluno (Exclusivo Master)
  const transferStudentLink = async (studentId, targetTenantId, customProfName = null) => {
    let targetName = customProfName;
    if (!targetName) {
      const targetProf = usersList.find(u => u.id === targetTenantId);
      const targetGym = Object.values(tenants).find(t => t.id === targetTenantId);
      targetName = targetProf?.name || targetGym?.name || 'Academia/Professor Central';
    }

    await updateUser(studentId, {
      tenantId: targetTenantId,
      nomeProfessorVinculado: targetName,
      statusVinculo: 'aprovado',
      preCadastro: false
    });

    createNotification({
      type: 'vinculo_transferido',
      title: '🔄 Vínculo Atualizado!',
      message: `Seu vínculo foi transferido para ${targetName} pela administração central.`,
      targetUserId: studentId,
      actionType: 'open_workouts'
    });

    return true;
  };

  // 4. Aprovação de Vínculo de Aluno com Controle Estrito de Vagas do Plano
  const approveStudentLink = async (studentId, targetId = null) => {
    const activeProfId = targetId || user?.id;
    const profObj = usersList.find(u => u.id === activeProfId) || Object.values(tenants).find(t => t.id === activeProfId);
    const limit = profObj?.limiteAlunos || user?.limiteAlunos || 10;

    const approvedCount = usersList.filter(u => 
      u.role === 'aluno' && 
      (u.tenantId === activeProfId || u.tenantId === user?.tenantId) && 
      u.statusVinculo !== 'pendente_aprovacao'
    ).length;

    if (approvedCount >= limit) {
      const errMsg = `Limite de ${limit} vagas do seu plano foi atingido. Faça upgrade para aprovar mais alunos.`;
      throw new Error(errMsg);
    }

    await updateUser(studentId, {
      statusVinculo: 'aprovado',
      tenantId: activeProfId,
      preCadastro: false
    });

    createNotification({
      type: 'vinculo_aprovado',
      title: '🎉 Vínculo Aprovado!',
      message: `Seu professor ${user?.name || 'Personal'} aprovou seu acesso! Seus treinos já estão liberados.`,
      senderId: user?.id,
      senderName: user?.name,
      targetUserId: studentId,
      actionType: 'open_workouts'
    });

    return true;
  };

  // 5. Recusa de Vínculo de Aluno
  const rejectStudentLink = async (studentId) => {
    await updateUser(studentId, {
      statusVinculo: 'recusado'
    });
    return true;
  };

  // 6. Pré-Cadastro de Aluno, Professor ou Academia
  const preRegisterUser = async (userData, inviter = null) => {
    const inviterObj = inviter || user;
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const finalEmail = cleanEmail || `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}@fitseven.app`;
    
    const cleanCpf = cleanDigits(userData.cpf);
    if (cleanCpf && !validateCPF(cleanCpf)) {
      throw new Error('CPF inválido. Verifique os números digitados.');
    }

    const role = userData.role || 'aluno';

    // Alunos ficam vinculados ao prof/academia que os cadastrou (tenantId = id do inviter)
    // Professores e academias ficam com tenantId null para não violar a FK da tabela tenants
    const tenantId = (role === 'professor' || role === 'estabelecimento' || role === 'academia')
      ? null
      : (userData.tenantId || inviterObj?.id || null);

    const nomeVinculado = (role === 'aluno')
      ? (inviterObj?.name || '')
      : '';

    const newUser = await addUser({
      ...userData,
      email: finalEmail,
      cpf: cleanCpf || '',
      role,
      tenantId,
      password: userData.password || '123',
      statusVinculo: 'aprovado',
      preCadastro: true,
      primeiroAcesso: true,
      nomeProfessorVinculado: nomeVinculado
    });

    return newUser;
  };

  // 7. Gerador de Links de Convite Personalizado (Individual por Usuário Pré-Cadastrado)
  const getDirectInviteUrl = (targetUser, inviterUser = null) => {
    const inviter = inviterUser || user;
    const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://tonyddayvd.github.io/fit-seven/';
    return `${baseUrl}?invite=true&userId=${targetUser.id}&role=${targetUser.role || 'aluno'}&profName=${encodeURIComponent(inviter?.name || 'Administração Fit Seven')}`;
  };

  const generateWhatsAppInvite = (targetUser, inviterUser = null) => {
    const inviter = inviterUser || user;
    const inviteUrl = getDirectInviteUrl(targetUser, inviter);
    
    let roleLabel = 'aluno(a)';
    let roleMsg = 'Seus treinos personalizados e evolução física já estão sendo preparados.';
    if (targetUser.role === 'professor') {
      roleLabel = 'professor(a) / treinador(a)';
      roleMsg = 'Seu painel de gestão de alunos, prescrição e avaliações já está disponível.';
    } else if (targetUser.role === 'estabelecimento' || targetUser.role === 'academia') {
      roleLabel = 'gestor(a) de academia / estabelecimento';
      roleMsg = 'Seu ambiente multi-tenant exclusivo e gestão de professores/alunos já estão ativos.';
    }

    const text = `Olá, *${targetUser.name}*! 👋\n\n` +
      `Seu pré-cadastro como *${roleLabel}* na plataforma *Fit Seven* foi realizado por *${inviter?.name || 'Administração Fit Seven'}*.\n\n` +
      `${roleMsg}\n\n` +
      `📲 *Clique no link direto e seguro abaixo para definir sua senha pessoal e ativar seu acesso:*\n` +
      `${inviteUrl}\n\n` +
      `Seja bem-vindo(a) ao Fit Seven! 🚀🏋️`;

    const cleanPhone = cleanDigits(targetUser.whatsapp || targetUser.telefone);
    const phoneParam = cleanPhone ? `&phone=55${cleanPhone}` : '';
    
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}${phoneParam}`;
  };

  // 8. Concluir Cadastro de Convite (Aluno, Professor ou Academia pré-cadastrado define CPF/CNPJ e senha)
  const completeInviteRegistration = async (userId, docNumber, newPassword, extraData = {}) => {
    const cleanDoc = cleanDigits(docNumber);
    if (!cleanDoc) {
      throw new Error('Documento (CPF ou CNPJ) é obrigatório.');
    }
    
    const userObj = usersList.find(u => u.id === userId);
    const isGym = userObj?.role === 'estabelecimento' || userObj?.role === 'academia' || extraData.role === 'estabelecimento';

    if (isGym) {
      if (!validateDoc(cleanDoc)) {
        throw new Error('CNPJ ou CPF com formato inválido.');
      }
    } else {
      if (!validateCPF(cleanDoc)) {
        throw new Error('CPF inválido. Verifique os dígitos informados.');
      }
    }

    if (!newPassword || newPassword.length < 3) {
      throw new Error('Defina uma senha com no mínimo 3 caracteres.');
    }

    const docField = (isGym && cleanDoc.length === 14) ? { cnpj: cleanDoc, cpf: extraData.cpf || '' } : { cpf: cleanDoc };

    const updated = await updateUser(userId, {
      ...extraData,
      ...docField,
      password: newPassword,
      preCadastro: false,
      primeiroAcesso: false,
      statusVinculo: 'aprovado'
    });

    if (userObj) {
      const merged = { 
        ...userObj, 
        ...extraData, 
        ...docField, 
        password: newPassword, 
        preCadastro: false, 
        primeiroAcesso: false, 
        statusVinculo: 'aprovado' 
      };
      setUser(merged);
      localStorage.setItem('fitseven-user', JSON.stringify(merged));
    }
    return updated;
  };

  // Motor de Inteligência Artificial Mockado
  const mockAIEngine = (evalData) => {
    const goal = evalData.objetivo === 'emagrecimento' ? 'emagrecimento' : 'hipertrofia';
    const frequency = parseInt(evalData.frequenciaSemanal) || 3;
    const pool = AI_EXERCISE_POOL[goal] || AI_EXERCISE_POOL.hipertrofia;

    const workoutSplits = [];
    const splitNames = ['Treino A - Superior Foco Tração', 'Treino B - Membros Inferiores', 'Treino C - Superior Foco Empurrar', 'Treino D - Cardio & Core', 'Treino E - Mobilidade & Funcional'];

    for (let i = 0; i < Math.min(frequency, 5); i++) {
      let selectedExs = [];
      if (goal === 'emagrecimento') {
        selectedExs = [
          ...(pool.peito || []),
          ...(pool.costas || []),
          ...(pool.pernas || []),
          ...(pool.cardio || [])
        ].slice(i * 2, (i * 2) + 2);
      } else {
        if (i % 2 === 0) {
          selectedExs = [...(pool.peito || []), ...(pool.bracos || [])];
        } else {
          selectedExs = [...(pool.costas || []), ...(pool.pernas || [])];
        }
      }

      const splitLetter = ['A', 'B', 'C', 'D', 'E'][i];
      const mappedExs = selectedExs.map((e, idx) => ({
        id: `ai-ex-${i}-${idx}-${Date.now()}`,
        split: splitLetter,
        name: e.name,
        category: i % 2 === 0 ? 'Superior' : 'Inferior/Cardio',
        load: e.load,
        reps: e.reps,
        status: 'pendente',
        video_oficial_url: e.video,
        video_personalizado_url: ''
      }));

      workoutSplits.push({
        title: splitNames[i] || `Treino Complementar ${splitLetter}`,
        exercises: mappedExs
      });
    }

    return workoutSplits;
  };

  // Enviar Avaliação para a Fila do Supabase (Pelo Aluno ou Pelo Professor)
  const submitEvaluation = async (formData, targetStudent = null) => {
    const targetUserId = targetStudent?.id || formData.userId || user?.id || 'u1784223991987';
    const targetUserName = targetStudent?.name || formData.nome || user?.name || 'Aluno';
    const targetTenantId = targetStudent?.tenantId || user?.tenantId || 'master';

    const evalId = `eval-${Date.now()}`;
    const newEval = {
      id: evalId,
      userId: targetUserId,
      userName: targetUserName,
      tenantId: targetTenantId,
      evaluatedBy: user?.role === 'professor' ? `Prof. ${user?.name}` : 'Aluno',
      date: new Date().toLocaleDateString('pt-BR'),
      formData: {
        ...formData,
        userId: targetUserId,
        tenantId: targetTenantId,
        nome: targetUserName
      },
      aiSuggestedWorkout: mockAIEngine(formData),
      ...(formData.workoutCompleted ? { _approvedAt: new Date().toISOString(), _approvedBy: user?.role === 'professor' ? user.name : 'Auto' } : {})
    };

    try {
      const { error } = await supabase.from('avaliacoes').insert({
        id: evalId,
        tenant_id: targetTenantId,
        user_id: targetUserId,
        medidas: newEval,
        fotos_urls: formData.fotos || {}
      });

      if (error) {
        console.warn('Erro ao inserir avaliação no Supabase, salvando local:', error);
      }
    } catch (err) {
      console.warn('Exceção ao inserir avaliação:', err);
    }

    localStorage.setItem(`fitseven-last-eval-${targetUserId}`, new Date().toISOString());
    localStorage.setItem(`fitseven-last-eval-data-${targetUserId}`, JSON.stringify(formData));
    await refreshData();
    return newEval;
  };

  const approveAndPublishWorkout = async (evalId, vipOptions = {}) => {
    const evaluation = pendingEvaluations.find(ev => ev.id === evalId);
    if (!evaluation) return false;

    const allExercises = [];
    (evaluation.aiSuggestedWorkout || []).forEach((block, bIdx) => {
      const splitLetter = ['A', 'B', 'C', 'D', 'E'][bIdx];
      (block.exercises || []).forEach(ex => {
        allExercises.push({ ...ex, split: splitLetter });
      });
    });

    const isVip = vipOptions === true || (typeof vipOptions === 'object' && vipOptions?.isVip === true);
    const vipHtml = typeof vipOptions === 'object' ? vipOptions?.vipHtml : '';
    
    // Check if the student belongs to a professor
    const studentObj = usersList.find(u => u.id === evaluation.userId);
    // If the student's tenant is different from the logged-in user's ID, it means the student belongs to a professor
    // and the Master is generating this.
    const isDirectStudent = studentObj && studentObj.tenantId === user?.id;
    const workoutStatus = isDirectStudent ? 'published' : 'draft_professor';

    const workoutData = {
      exercises: allExercises,
      isVip: !!isVip,
      vipHtml: vipHtml || '',
      status: workoutStatus
    };

    // Upsert nos treinos
    const { error: workoutErr } = await supabase.from('treinos_html').upsert({
      id: `t_html_${evaluation.userId}`,
      tenant_id: evaluation.tenantId,
      user_id: evaluation.userId,
      html_content: JSON.stringify(workoutData)
    });
    if (workoutErr) throw workoutErr;

    // Em vez de deletar, marcar como 'approved' dentro do campo medidas
    const approvedMedidas = {
      ...evaluation,
      _status: 'approved',
      _approvedAt: new Date().toISOString()
    };
    // Remover campos que não devem ir para o banco duplicados
    delete approvedMedidas.id;
    delete approvedMedidas.userId;
    delete approvedMedidas.tenantId;

    const { error: evalErr } = await supabase
      .from('avaliacoes')
      .update({ medidas: approvedMedidas })
      .eq('id', evalId);
    if (evalErr) throw evalErr;

    await refreshData();
    return true;
  };

  // Reenvia uma avaliação aprovada de volta para a fila de pendentes
  const requeueEvaluation = async (evalId) => {
    const evaluation = approvedEvaluations.find(ev => ev.id === evalId);
    if (!evaluation) return false;

    const requeuedMedidas = {
      ...evaluation,
      _status: 'pending',
      _approvedAt: null
    };
    delete requeuedMedidas.id;
    delete requeuedMedidas.userId;
    delete requeuedMedidas.tenantId;

    const { error } = await supabase
      .from('avaliacoes')
      .update({ medidas: requeuedMedidas })
      .eq('id', evalId);
    if (error) throw error;

    await refreshData();
    return true;
  };

  const login = (identifier, password, selectedUserId = null) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanDigitsId = cleanDigits(identifier);
    const cleanPassword = (password || '').trim();

    // Se o usuário selecionou uma conta específica (quando há mais de uma com mesmo CPF)
    if (selectedUserId) {
      const target = usersList.find(u => u.id === selectedUserId && (u.password || '').trim() === cleanPassword);
      if (target) {
        setUser(target);
        localStorage.setItem('fitseven-user', JSON.stringify(target));
        if (target.role === 'master') {
          setBypassRole(null);
          setBypassTenantId(null);
          localStorage.removeItem('fitseven-bypass-role');
          localStorage.removeItem('fitseven-bypass-tenant');
        }
        return { success: true };
      }
      return { success: false, message: 'Senha incorreta para o perfil selecionado.' };
    }

    // Busca usuários por e-mail ou por CPF/CNPJ
    const matchedUsers = usersList.filter(u => {
      const emailMatch = (u.email || '').trim().toLowerCase() === cleanId;
      const cpfMatch = cleanDigitsId && cleanDigitsId.length === 11 && cleanDigits(u.cpf) === cleanDigitsId;
      const cnpjMatch = cleanDigitsId && cleanDigitsId.length === 14 && cleanDigits(u.cnpj) === cleanDigitsId;
      const passwordMatch = (u.password || '').trim() === cleanPassword;
      return (emailMatch || cpfMatch || cnpjMatch) && passwordMatch;
    });

    if (matchedUsers.length === 1) {
      const foundUser = matchedUsers[0];
      setUser(foundUser);
      localStorage.setItem('fitseven-user', JSON.stringify(foundUser));
      if (foundUser.role === 'master') {
        setBypassRole(null);
        setBypassTenantId(null);
        localStorage.removeItem('fitseven-bypass-role');
        localStorage.removeItem('fitseven-bypass-tenant');
      }
      return { success: true };
    }

    if (matchedUsers.length > 1) {
      const uniqueRolesMap = new Map();
      const filteredAccounts = [];
      for (const acc of matchedUsers) {
        if (acc.role === 'master') {
          if (!uniqueRolesMap.has('master')) {
            uniqueRolesMap.set('master', true);
            const bestMaster = matchedUsers.find(u => u.id === 'u8') || acc;
            filteredAccounts.push(bestMaster);
          }
        } else {
          filteredAccounts.push(acc);
        }
      }

      if (filteredAccounts.length === 1) {
        const foundUser = filteredAccounts[0];
        setUser(foundUser);
        localStorage.setItem('fitseven-user', JSON.stringify(foundUser));
        if (foundUser.role === 'master') {
          setBypassRole(null);
          setBypassTenantId(null);
          localStorage.removeItem('fitseven-bypass-role');
          localStorage.removeItem('fitseven-bypass-tenant');
        }
        return { success: true };
      }

      return { 
        success: false, 
        multipleAccounts: true, 
        accounts: filteredAccounts, 
        message: 'Múltiplos perfis encontrados com este CPF. Escolha qual deseja acessar:' 
      };
    }

    return { success: false, message: 'E-mail/CPF ou senha incorretos. Tente novamente.' };
  };

  const logout = () => {
    setUser(null);
    setBypassRole(null);
    setBypassTenantId(null);
    setOriginalUser(null);
    localStorage.removeItem('fitseven-user');
    localStorage.removeItem('fitseven-bypass-role');
    localStorage.removeItem('fitseven-bypass-tenant');
    localStorage.removeItem('fitseven-original-user');
  };

  const applyBypass = (role, tenantId) => {
    if (user?.role !== 'master') return;
    setBypassRole(role);
    setBypassTenantId(tenantId);
    if (role) {
      localStorage.setItem('fitseven-bypass-role', role);
    } else {
      localStorage.removeItem('fitseven-bypass-role');
    }
    if (tenantId) {
      localStorage.setItem('fitseven-bypass-tenant', tenantId);
    } else {
      localStorage.removeItem('fitseven-bypass-tenant');
    }
  };

  const activeRole = (user?.role === 'master' && bypassRole) ? bypassRole : user?.role;
  const activeTenantId = (user?.role === 'master' && bypassTenantId) ? bypassTenantId : user?.tenantId;
  const activeTenant = tenants[Object.keys(tenants).find(k => tenants[k].id === activeTenantId)] || { name: 'Fit Seven Platform', subdomain: 'system' };

  const studentData = workoutsByStudent[user?.id];
  const currentStudentExercises = (studentData && Array.isArray(studentData)) 
    ? studentData 
    : (studentData && studentData.exercises) 
      ? studentData.exercises 
      : DEFAULT_WORKOUTS;

  const reportBug = async (bugData) => {
    const bugId = `bug_${Date.now()}`;
    const newBug = {
      id: bugId,
      studentId: user?.id || 'anonimo',
      studentName: user?.name || 'Anônimo',
      timestamp: new Date().toISOString(),
      ...bugData
    };
    
    // Salva no Supabase como uma avaliação do tipo "bug_report"
    if (user && user.id !== 'anonimo') {
      try {
        await supabase.from('avaliacoes').insert({
          id: bugId,
          tenant_id: user.tenantId || 'master',
          user_id: user.id,
          medidas: {
            _type: 'bug_report',
            ...newBug
          }
        });
      } catch (err) {
        console.error('Erro ao salvar bug no Supabase:', err);
      }
    }

    const updated = [newBug, ...bugReports];
    setBugReports(updated);
    localStorage.setItem('fitseven-bug-reports', JSON.stringify(updated));
    return true;
  };

  const deleteBug = async (bugId) => {
    try {
      await supabase.from('avaliacoes').delete().eq('id', bugId);
    } catch (err) {
      console.error('Erro ao deletar bug do Supabase:', err);
    }
    const updated = bugReports.filter(b => b.id !== bugId);
    setBugReports(updated);
    localStorage.setItem('fitseven-bug-reports', JSON.stringify(updated));
  };

  const updateStudentExercises = async (newExercises, finishedSplitsArray = null) => {
    if (!user) return;
    const currentData = workoutsByStudent[user.id] || { exercises: DEFAULT_WORKOUTS, isVip: false, vipHtml: '', finishedSplits: [] };
    const updatedWorkout = {
      ...currentData,
      exercises: newExercises,
      finishedSplits: (finishedSplitsArray !== null && finishedSplitsArray !== undefined) ? finishedSplitsArray : (currentData.finishedSplits || []),
      weekId: getCurrentWeekId()
    };

    // Atualiza localmente de forma otimista para evitar lags de renderização
    setWorkoutsByStudent(prev => ({
      ...prev,
      [user.id]: updatedWorkout
    }));

    const { error } = await supabase.from('treinos_html').upsert({
      id: `t_html_${user.id}`,
      tenant_id: user.tenantId,
      user_id: user.id,
      html_content: JSON.stringify(updatedWorkout)
    });

    if (error) throw error;
    await refreshData();
  };

  const updateWorkoutByProfessor = async (studentId, updatedWorkoutObj) => {
    const student = usersList.find(u => u.id === studentId);
    if (!student) return;

    const currentWeekId = getCurrentWeekId();
    const finalWorkoutObj = {
      exercises: updatedWorkoutObj.exercises || DEFAULT_WORKOUTS,
      finishedSplits: updatedWorkoutObj.finishedSplits || [],
      isVip: updatedWorkoutObj.isVip !== undefined ? updatedWorkoutObj.isVip : true,
      vipHtml: updatedWorkoutObj.vipHtml || '',
      weekId: updatedWorkoutObj.weekId || currentWeekId,
      status: updatedWorkoutObj.status || 'published',
      updatedAt: new Date().toISOString()
    };

    // Atualização otimista imediata no estado local e localStorage
    setWorkoutsByStudent(prev => ({
      ...prev,
      [studentId]: finalWorkoutObj
    }));
    try {
      localStorage.setItem(`fitseven-workout-${studentId}`, JSON.stringify(finalWorkoutObj));
    } catch (e) {
      console.warn('Falha ao salvar treino no localStorage:', e);
    }

    // Dispara notificação para o aluno avisando que o treino foi atualizado
    try {
      createNotification({
        type: 'novo_treino',
        title: '🏋️ Ficha de Treino Atualizada!',
        message: `Seu treinador atualizou sua ficha de treinos. Acesse a aba Treinos para conferir!`,
        senderId: user?.id || 'prof',
        senderName: user?.name || 'Treinador',
        senderAvatar: user?.fotoPerfil || '',
        targetUserId: studentId,
        actionType: 'open_treinos'
      });
    } catch (e) {}

    // Persistência assíncrona no Supabase
    try {
      const { error } = await supabase.from('treinos_html').upsert({
        id: `t_html_${student.id}`,
        tenant_id: student.tenantId,
        user_id: student.id,
        html_content: JSON.stringify(finalWorkoutObj)
      });

      if (error) {
        console.error('Erro ao sincronizar treino com Supabase:', error);
      } else {
        await refreshData();
      }
    } catch (err) {
      console.warn('Erro ao sincronizar treino:', err);
    }
  };

  const resetDatabase = async () => {
    // Para conveniência do teste, podemos esvaziar tabelas ou recarregar
    await supabase.from('treinos_html').delete().neq('id', '');
    await supabase.from('avaliacoes').delete().neq('id', '');
    await refreshData();
  };

  const exportDatabase = () => {
    return JSON.stringify({
      tenants,
      usersList,
      workoutsByStudent,
      pendingEvaluations
    }, null, 2);
  };

  const importDatabase = async (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      // Implementação básica de importação
      alert('Banco de dados importado!');
      return true;
    } catch (e) {
      alert('Erro ao importar: ' + e.message);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      user,
      activeRole,
      activeTenantId,
      activeTenant,
      login,
      logout,
      applyBypass,
      bypassRole,
      bypassTenantId,
      pendingEvaluations,
      approvedEvaluations,
      submitEvaluation,
      approveAndPublishWorkout,
      requeueEvaluation,
      currentStudentExercises,
      updateStudentExercises,
      updateWorkoutByProfessor,
      workoutsByStudent,
      virtualRoute,
      setVirtualRoute,
      tenants,
      usersList,
      originalUser,
      addTenant,
      updateTenant,
      deleteTenant,
      addUser,
      updateUser,
      updateUserProfile,
      deleteUser,
      toggleUserVip,
      loginAsUser,
      revertToMaster,
      resetDatabase,
      exportDatabase,
      importDatabase,
      bugReports,
      reportBug,
      deleteBug,
      workoutSessionsHistory,
      isLoading,
      registerUser,
      resetPasswordByCpf,
      changePassword,
      transferStudentLink,
      approveStudentLink,
      rejectStudentLink,
      preRegisterUser,
      generateWhatsAppInvite,
      getDirectInviteUrl,
      completeInviteRegistration,
      notifications,
      createNotification,
      markNotificationAsRead,
      getNotificationsForUser,
      getUnreadNotificationsForUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
};
