import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

// Dados mockados de Tenants e Usuários para testes
export const MOCK_TENANTS = {
  'academia-vibe': { id: 't1', name: 'Academia Vibe & Energia', subdomain: 'academia-vibe' },
  'cross-pulse': { id: 't2', name: 'Cross Pulse Studio', subdomain: 'cross-pulse' },
  'fit-seven-master': { id: 'master', name: 'Fit Seven Corporate', subdomain: 'master' }
};

export const MOCK_USERS = [
  { id: 'u1', name: 'Alice Silva (Estabelec.)', email: 'admin@vibe.com', tenantId: 't1', role: 'estabelecimento', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
  { id: 'u2', name: 'Prof. Carlos Santos', email: 'carlos@vibe.com', tenantId: 't1', role: 'professor', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
  { id: 'u3', name: 'Lucas Aluno', email: 'lucas@vibe.com', tenantId: 't1', role: 'aluno', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z', data_ativacao_vip: '2026-06-01T12:00:00.000Z' },
  { id: 'u4', name: 'Mariana Lima (Estabelec.)', email: 'admin@pulse.com', tenantId: 't2', role: 'estabelecimento', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
  { id: 'u5', name: 'Prof. Pedro Souza', email: 'pedro@pulse.com', tenantId: 't2', role: 'professor', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
  { id: 'u6', name: 'Juliana Aluna', email: 'juliana@pulse.com', tenantId: 't2', role: 'aluno', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z', data_ativacao_vip: '2026-06-01T12:00:00.000Z' },
  { id: 'u7', name: 'Suporte Master System', email: 'master@fitseven.com', tenantId: 'master', role: 'master', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
  { id: 'u8', name: 'Tony (MASTER)', email: 'tony@fitseven.com', tenantId: 'master', role: 'master', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' }
];

const DEFAULT_WORKOUTS = [
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

// Dicionário de Exercícios por Categoria da "IA"
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

export const AppProvider = ({ children }) => {
  // 1.1 Rota Virtual
  const [virtualRoute, setVirtualRoute] = useState('app');

  // 1. Controle de Tema
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

  // 2. Controle de Autenticação / Tenant
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fitseven-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [bypassRole, setBypassRole] = useState(() => localStorage.getItem('fitseven-bypass-role') || null);
  const [bypassTenantId, setBypassTenantId] = useState(() => localStorage.getItem('fitseven-bypass-tenant') || null);

  // 3. FLUXO HÍBRIDO - BANCO DE DADOS EM MEMÓRIA
  const [workoutsByStudent, setWorkoutsByStudent] = useState(() => {
    const saved = localStorage.getItem('fitseven-workouts-db');
    return saved ? JSON.parse(saved) : {
      'u3': DEFAULT_WORKOUTS // Lucas Aluno inicia com o treino padrão
    };
  });

  const [pendingEvaluations, setPendingEvaluations] = useState(() => {
    const saved = localStorage.getItem('fitseven-pending-evals');
    return saved ? JSON.parse(saved) : [];
  });

  const saveWorkoutsToStorage = (newDb) => {
    setWorkoutsByStudent(newDb);
    localStorage.setItem('fitseven-workouts-db', JSON.stringify(newDb));
  };

  const savePendingEvalsToStorage = (newEvals) => {
    setPendingEvaluations(newEvals);
    localStorage.setItem('fitseven-pending-evals', JSON.stringify(newEvals));
  };

  // Motor de Inteligência Artificial Mockado
  const mockAIEngine = (evalData) => {
    const goal = evalData.objetivo === 'emagrecimento' ? 'emagrecimento' : 'hipertrofia';
    const frequency = parseInt(evalData.frequenciaSemanal) || 3;
    const pool = AI_EXERCISE_POOL[goal] || AI_EXERCISE_POOL.hipertrofia;

    const workoutSplits = [];
    const splitNames = ['Treino A - Superior Foco Tração', 'Treino B - Membros Inferiores', 'Treino C - Superior Foco Empurrar', 'Treino D - Cardio & Core', 'Treino E - Mobilidade & Funcional'];

    for (let i = 0; i < Math.min(frequency, 5); i++) {
      // Coleta alguns exercícios baseados no loop
      let selectedExs = [];
      if (goal === 'emagrecimento') {
        selectedExs = [
          ...(pool.peito || []),
          ...(pool.costas || []),
          ...(pool.pernas || []),
          ...(pool.cardio || [])
        ].slice(i * 2, (i * 2) + 2);
      } else {
        // Hipertrofia
        if (i % 2 === 0) {
          selectedExs = [...(pool.peito || []), ...(pool.bracos || [])];
        } else {
          selectedExs = [...(pool.costas || []), ...(pool.pernas || [])];
        }
      }

      // Converte para a estrutura final aceita pelo Aluno
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

  // Enviar Avaliação do Aluno para a Fila de Aprovação
  const submitEvaluation = (formData) => {
    const newEval = {
      id: `eval-${Date.now()}`,
      userId: user?.id || 'u3',
      userName: user?.name || 'Aluno Desconhecido',
      tenantId: user?.tenantId || 't1',
      date: new Date().toLocaleDateString('pt-BR'),
      formData: {
        ...formData,
        userId: user?.id || 'u3',
        tenantId: user?.tenantId || 't1'
      },
      // O motor de IA pré-gera a sugestão de treino para análise do Professor/Master
      aiSuggestedWorkout: mockAIEngine(formData)
    };

    const updated = [...pendingEvaluations.filter(ev => ev.userId !== newEval.userId), newEval];
    savePendingEvalsToStorage(updated);

    // Salva a data do último envio no localStorage para persistência da regra de negócio de cooldown
    localStorage.setItem(`fitseven-last-eval-${user?.id || 'u3'}`, new Date().toISOString());
  };

  // Aprovar e Publicar o Treino (MASTER/Professor injeta no BD)
  const approveAndPublishWorkout = (evalId) => {
    const evaluation = pendingEvaluations.find(ev => ev.id === evalId);
    if (!evaluation) return false;

    // Injeta os dados no banco de dados vinculados ao aluno e tenant correspondente.
    // Se for VIP, salva as propriedades adicionais isVip e vipHtml
    const allExercises = [];
    evaluation.aiSuggestedWorkout.forEach((block, bIdx) => {
      const splitLetter = ['A', 'B', 'C', 'D', 'E'][bIdx];
      block.exercises.forEach(ex => {
        allExercises.push({
          ...ex,
          split: splitLetter
        });
      });
    });

    const isVip = arguments[1] === true || (typeof arguments[1] === 'object' && arguments[1]?.isVip === true);
    const vipHtml = typeof arguments[1] === 'object' ? arguments[1]?.vipHtml : arguments[2];

    const updatedWorkouts = {
      ...workoutsByStudent,
      [evaluation.userId]: {
        exercises: allExercises,
        isVip: !!isVip,
        vipHtml: vipHtml || ''
      }
    };

    saveWorkoutsToStorage(updatedWorkouts);

    // Remove da lista de pendentes
    const updatedEvals = pendingEvaluations.filter(ev => ev.id !== evalId);
    savePendingEvalsToStorage(updatedEvals);
    return true;
  };

  const login = (email, password) => {
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (foundUser) {
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
    return { success: false, message: 'Credenciais inválidas' };
  };

  const logout = () => {
    setUser(null);
    setBypassRole(null);
    setBypassTenantId(null);
    localStorage.removeItem('fitseven-user');
    localStorage.removeItem('fitseven-bypass-role');
    localStorage.removeItem('fitseven-bypass-tenant');
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
  const activeTenant = MOCK_TENANTS[Object.keys(MOCK_TENANTS).find(k => MOCK_TENANTS[k].id === activeTenantId)] || { name: 'Fit Seven Platform', subdomain: 'system' };

  // Retorna os exercícios ativos do aluno logado
  const studentData = workoutsByStudent[user?.id];
  const currentStudentExercises = (studentData && Array.isArray(studentData)) 
    ? studentData 
    : (studentData && studentData.exercises) 
      ? studentData.exercises 
      : DEFAULT_WORKOUTS;

  const updateStudentExercises = (newExercises) => {
    if (!user) return;
    const currentData = workoutsByStudent[user.id];
    const updatedWorkouts = {
      ...workoutsByStudent,
      [user.id]: (currentData && typeof currentData === 'object' && !Array.isArray(currentData))
        ? { ...currentData, exercises: newExercises }
        : newExercises
    };
    saveWorkoutsToStorage(updatedWorkouts);
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
      // Novos estados e funções do Fluxo Híbrido
      pendingEvaluations,
      submitEvaluation,
      approveAndPublishWorkout,
      currentStudentExercises,
      updateStudentExercises,
      workoutsByStudent,
      virtualRoute,
      setVirtualRoute
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
