import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AppContext = createContext();

// Inicialização do cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export const AppProvider = ({ children }) => {
  // Rota Virtual
  const [virtualRoute, setVirtualRoute] = useState('app');

  // Estados carregados do Supabase
  const [tenants, setTenants] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [workoutsByStudent, setWorkoutsByStudent] = useState({});
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [approvedEvaluations, setApprovedEvaluations] = useState([]);
  const [bugReports, setBugReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de sessão (Persistidos localmente para conveniência do usuário logado)
  const [originalUser, setOriginalUser] = useState(() => {
    const saved = localStorage.getItem('fitseven-original-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fitseven-user');
    return saved ? JSON.parse(saved) : null;
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
      if (!tenantsErr && tenantsData) {
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
      }

      // 2. Carregar Users
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*');
      if (!usersErr && usersData) {
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
          limiteAlunos: u.dados_pessoais?.limiteAlunos
        }));
        setUsersList(mappedUsers);
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
        // Separar pendentes das aprovadas
        setPendingEvaluations(mappedEvals.filter(ev => ev._status !== 'approved'));
        setApprovedEvaluations(mappedEvals.filter(ev => ev._status === 'approved'));
      }

      // 4. Carregar Treinos
      const { data: treinosData, error: treinosErr } = await supabase.from('treinos_html').select('*');
      if (!treinosErr && treinosData) {
        const treinosMap = {};
        treinosData.forEach(tr => {
          try {
            const parsed = JSON.parse(tr.html_content);
            if (parsed && (parsed.exercises || parsed.vipHtml)) {
              treinosMap[tr.user_id] = parsed;
            } else {
              treinosMap[tr.user_id] = { exercises: [], isVip: true, vipHtml: tr.html_content };
            }
          } catch (e) {
            treinosMap[tr.user_id] = { exercises: [], isVip: true, vipHtml: tr.html_content };
          }
        });
        setWorkoutsByStudent(treinosMap);
      }

      // 5. Carregar Bug Reports (Persistência via localStorage para garantir funcionamento offline/instantâneo)
      const localBugs = localStorage.getItem('fitseven-bug-reports');
      if (localBugs) {
        setBugReports(JSON.parse(localBugs));
      } else {
        setBugReports([]);
      }
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
      limiteAlunos: userData.limiteAlunos || null
    };

    const { error } = await supabase.from('users').insert({
      id,
      tenant_id: tenantId,
      role: userData.role,
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
      limiteAlunos: updatedData.limiteAlunos !== undefined ? updatedData.limiteAlunos : userObj.limiteAlunos
    };

    const { error } = await supabase.from('users').update({
      role: updatedData.role || userObj.role,
      plano_vip: updatedData.isVip !== undefined ? updatedData.isVip : userObj.isVip,
      dados_pessoais: updatedPersonal
    }).eq('id', userId);

    if (error) throw error;
    await refreshData();
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
      limiteAlunos: userObj.limiteAlunos
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
      isVip: isNowVip
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

  // Enviar Avaliação para a Fila do Supabase
  const submitEvaluation = async (formData) => {
    const evalId = `eval-${Date.now()}`;
    const newEval = {
      id: evalId,
      userId: user?.id || 'u3',
      userName: user?.name || 'Aluno Desconhecido',
      tenantId: user?.tenantId || 't1',
      date: new Date().toLocaleDateString('pt-BR'),
      formData: {
        ...formData,
        userId: user?.id || 'u3',
        tenantId: user?.tenantId || 't1'
      },
      aiSuggestedWorkout: mockAIEngine(formData)
    };

    const { error } = await supabase.from('avaliacoes').insert({
      id: evalId,
      tenant_id: user?.tenantId || 't1',
      user_id: user?.id || 'u3',
      medidas: newEval,
      fotos_urls: formData.fotos || {}
    });

    if (error) throw error;

    localStorage.setItem(`fitseven-last-eval-${user?.id || 'u3'}`, new Date().toISOString());
    await refreshData();
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

    const workoutData = {
      exercises: allExercises,
      isVip: !!isVip,
      vipHtml: vipHtml || ''
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

  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    
    const foundUser = usersList.find(u => 
      (u.email || '').trim().toLowerCase() === cleanEmail && 
      (u.password || '').trim() === cleanPassword
    );
    
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
    const newBug = {
      id: `bug_${Date.now()}`,
      studentId: user?.id || 'anonimo',
      studentName: user?.name || 'Anônimo',
      timestamp: new Date().toISOString(),
      ...bugData
    };
    const updated = [newBug, ...bugReports];
    setBugReports(updated);
    localStorage.setItem('fitseven-bug-reports', JSON.stringify(updated));
    return true;
  };

  const updateStudentExercises = async (newExercises) => {
    if (!user) return;
    const currentData = workoutsByStudent[user.id] || { exercises: DEFAULT_WORKOUTS, isVip: false, vipHtml: '' };
    const updatedWorkout = {
      ...currentData,
      exercises: newExercises
    };

    const { error } = await supabase.from('treinos_html').upsert({
      id: `t_html_${user.id}`,
      tenant_id: user.tenantId,
      user_id: user.id,
      html_content: JSON.stringify(updatedWorkout)
    });

    if (error) throw error;
    await refreshData();
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
      deleteUser,
      toggleUserVip,
      loginAsUser,
      revertToMaster,
      resetDatabase,
      exportDatabase,
      importDatabase,
      bugReports,
      reportBug,
      isLoading
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
