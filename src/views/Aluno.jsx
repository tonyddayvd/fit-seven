import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Dumbbell, 
  Ruler, 
  TrendingUp, 
  Target, 
  Timer, 
  QrCode, 
  Droplet, 
  Apple, 
  CreditCard, 
  Bell,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Award,
  Lock,
  Play,
  Tv,
  Volume2,
  VolumeX,
  Pause,
  FastForward,
  Plus,
  HelpCircle,
  Upload,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

const TABS = [
  { id: 'treinos', label: 'Treinos', icon: Dumbbell, desc: 'Ficha de treinos ativa, séries e cronograma de exercícios.' },
  { id: 'medidas', label: 'Medidas', icon: Ruler, desc: 'Histórico de avaliações físicas, dobras cutâneas e circunferências.' },
  { id: 'evolucao', label: 'Evolução', icon: TrendingUp, desc: 'Gráficos de progresso físico, ganho de massa e perda de gordura.' },
  { id: 'metas', label: 'Metas', icon: Target, desc: 'Objetivos pessoais estabelecidos com seu treinador.' },
  { id: 'contador', label: 'Contador', icon: Timer, desc: 'Cronômetro e contador de intervalos para séries de exercícios.' },
  { id: 'checkin', label: 'Check-in', icon: QrCode, desc: 'Código QR para entrada rápida na recepção da academia.' },
  { id: 'hidratacao', label: 'Hidratação', icon: Droplet, desc: 'Registro diário de ingestão de água e metas de consumo.' },
  { id: 'dieta', label: 'Dieta', icon: Apple, desc: 'Plano nutricional, macros diários e receitas recomendadas.' },
  { id: 'financeiro', label: 'Financeiro', icon: CreditCard, desc: 'Histórico de mensalidades, faturas pendentes e métodos de pagamento.' },
  { id: 'feed', label: 'Feed/Avisos', icon: Bell, desc: 'Notícias da academia, comunicados importantes e eventos.' }
];

const INITIAL_WORKOUT_EXERCISES = [
  { 
    id: 'ex1', 
    name: 'Supino Reto com Barra', 
    category: 'Peito', 
    load: '30kg cada lado', 
    reps: '4 séries de 10', 
    status: 'pendente',
    video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
    video_personalizado_url: '' 
  },
  { 
    id: 'ex2', 
    name: 'Puxada Alta na Polia', 
    category: 'Costas', 
    load: '45kg total', 
    reps: '4 séries de 12', 
    status: 'pendente',
    video_oficial_url: 'https://www.youtube.com/embed/H6x4yY9_u2w',
    video_personalizado_url: ''
  },
  { 
    id: 'ex3', 
    name: 'Agachamento Livre', 
    category: 'Pernas', 
    load: '20kg cada lado', 
    reps: '4 séries de 12', 
    status: 'pendente',
    video_oficial_url: 'https://www.youtube.com/embed/Vn83S-A-9yU',
    video_personalizado_url: ''
  },
  { 
    id: 'ex4', 
    name: 'Rosca Direta com Barra W', 
    category: 'Bíceps', 
    load: '10kg cada lado', 
    reps: '3 séries de 12', 
    status: 'pendente',
    video_oficial_url: 'https://www.youtube.com/embed/ly7TepL4pco',
    video_personalizado_url: ''
  }
];

const Aluno = () => {
  const { activeTenant, user, currentStudentExercises, updateStudentExercises, submitEvaluation } = useApp();
  const [activeTab, setActiveTab] = useState('treinos');
  
  // Estado de exercícios sincronizado com o contexto global (Fluxo Híbrido)
  const [exercises, setExercises] = useState([]);
  const [workoutSessionFinished, setWorkoutSessionFinished] = useState(false);
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    setExercises(currentStudentExercises);
  }, [currentStudentExercises]);

  // Estados dos recursos interativos
  const [activeVideoEx, setActiveVideoEx] = useState(null);
  const [tempCustomUrl, setTempCustomUrl] = useState('');

  // Estados do Assistente em Tempo Real
  const [assistantActive, setAssistantActive] = useState(false);
  const [assistantPhase, setAssistantPhase] = useState('preparacao');
  const [assistantTimer, setAssistantTimer] = useState(0);
  const [assistantRunning, setAssistantRunning] = useState(false);

  // Estados da aba Medidas/Avaliação
  const [activeAccordion, setActiveAccordion] = useState('identificacao');
  const [medidasSubmitted, setMedidasSubmitted] = useState(false);
  
  // Estados do Formulário de Medidas
  const [formData, setFormData] = useState({
    // Seção 1: Identificação/Objetivos
    nome: user?.name || '',
    objetivo: 'hipertrofia',
    historicoAtividade: 'moderado',
    // Seção 2: Composição Básica
    peso: '',
    altura: '',
    // Seção 3: Circunferências
    pescoco: '',
    cintura: '',
    abdomen: '',
    braçoEsq: '',
    braçoDir: '',
    coxaEsq: '',
    coxaDir: '',
    // Seção 4: Logística e Hábitos
    frequenciaSemanal: '3',
    nivelExperiencia: 'intermediario',
    horasSono: '7',
    refeicoesDiarias: '4',
    // Seção 5: Triagem de Saúde (PAR-Q) - Mandatórios
    parqCardiaco: null,
    parqDorPeito: null,
    parqMedicamento: null,
    parqTermo: false,
    // Seção 6: Composição Avançada (Opcionais)
    percentualGordura: '',
    massaMagra: '',
    gorduraVisceral: '',
    fcRepouso: '',
    // Arquivos
    laudoFile: null
  });

  const [activeTooltip, setActiveTooltip] = useState(null);
  const timerRef = useRef(null);

  const currentTabInfo = TABS.find(t => t.id === activeTab) || TABS[0];
  const IconComponent = currentTabInfo.icon;

  // Handlers para o Form de Medidas
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, laudoFile: file.name }));
    }
  };

  const handleMedidasSubmit = (e) => {
    e.preventDefault();

    // Validação da triagem obrigatória PAR-Q
    if (formData.parqCardiaco === null || formData.parqDorPeito === null || formData.parqMedicamento === null) {
      alert('Por favor, responda todas as perguntas de Triagem de Saúde (PAR-Q). Ela é obrigatória por motivos de segurança jurídica.');
      setActiveAccordion('parq');
      return;
    }

    if (!formData.parqTermo) {
      alert('Você deve aceitar o Termo de Responsabilidade para enviar os dados.');
      setActiveAccordion('parq');
      return;
    }

    // Se passou, submete para a fila de aprovação e prossegue com envio
    submitEvaluation(formData);
    setMedidasSubmitted(true);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const playBeep = (frequency = 600, duration = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    if (assistantActive && assistantRunning && assistantTimer > 0) {
      timerRef.current = setInterval(() => {
        setAssistantTimer(prev => {
          const next = prev - 1;
          if (next === 3 || next === 2 || next === 1) {
            playBeep(800, 0.08);
          }
          if (next === 0) {
            playBeep(1200, 0.3);
            handlePhaseTransition();
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [assistantActive, assistantRunning, assistantTimer, assistantPhase]);

  const handlePhaseTransition = () => {
    if (assistantPhase === 'execucao') {
      setAssistantPhase('descanso');
      setAssistantTimer(30);
      speakText('Série concluída! Aproveite para descansar por trinta segundos.');
    } else if (assistantPhase === 'descanso') {
      setAssistantPhase('execucao');
      setAssistantTimer(45);
      speakText('Descanso finalizado. Força, inicie a próxima série agora!');
    }
  };

  const startAssistant = () => {
    setAssistantPhase('execucao');
    setAssistantTimer(45);
    setAssistantRunning(true);
    speakText('Assistente ativado! Prepare-se para começar. Três, dois, um, força!');
  };

  const togglePauseAssistant = () => {
    setAssistantRunning(!assistantRunning);
    speakText(assistantRunning ? 'Assistente pausado.' : 'Assistente retomado.');
  };

  const openVideoModal = (ex) => {
    setActiveVideoEx(ex);
    setTempCustomUrl(ex.video_personalizado_url || '');
  };

  const saveCustomVideoUrl = (e) => {
    e.preventDefault();
    if (!activeVideoEx) return;

    let formattedUrl = tempCustomUrl;
    if (tempCustomUrl.includes('youtube.com/watch?v=')) {
      const vid = tempCustomUrl.split('v=')[1]?.split('&')[0];
      if (vid) formattedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (tempCustomUrl.includes('youtu.be/')) {
      const vid = tempCustomUrl.split('youtu.be/')[1]?.split('?')[0];
      if (vid) formattedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (tempCustomUrl.includes('youtube.com/shorts/')) {
      const vid = tempCustomUrl.split('shorts/')[1]?.split('?')[0];
      if (vid) formattedUrl = `https://www.youtube.com/embed/${vid}`;
    }

    setExercises(prev => prev.map(ex => 
      ex.id === activeVideoEx.id ? { ...ex, video_personalizado_url: formattedUrl } : ex
    ));
    setActiveVideoEx(prev => ({ ...prev, video_personalizado_url: formattedUrl }));
    alert('Link do influenciador favorito salvo com sucesso e priorizado!');
  };

  const handleCompleteExercise = (id) => {
    const updated = exercises.map(ex => ex.id === id ? { ...ex, status: 'concluido' } : ex);
    setExercises(updated);
    updateStudentExercises(updated);
    playBeep(900, 0.1);
    const frases = [
      'Excelente execução! Continue assim.',
      'Muito bem, músculo trabalhado com sucesso!',
      'Perfeito! Você está mandando ver.'
    ];
    speakText(frases[Math.floor(Math.random() * frases.length)]);
  };

  const handleSkipExercise = (id) => {
    const updated = exercises.map(ex => ex.id === id ? { ...ex, status: 'pulado' } : ex);
    setExercises(updated);
    updateStudentExercises(updated);
    playBeep(400, 0.25);
    speakText('Tudo bem, esse exercício foi pulado. Vamos para o próximo!');
  };

  const handleFinishWorkout = () => {
    const pending = exercises.filter(ex => ex.status === 'pendente');
    if (pending.length > 0) {
      alert('Marque todos os exercícios como Concluídos ou Pulados antes de finalizar.');
      return;
    }

    const skipped = exercises.filter(ex => ex.status === 'pulado').map(ex => ex.name);
    const completed = exercises.filter(ex => ex.status === 'concluido').map(ex => ex.name);
    const is100Percent = skipped.length === 0;

    setAuditLog({
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      skipped,
      completed,
      is100Percent,
      tenantId: activeTenant.id
    });

    setWorkoutSessionFinished(true);
    setAssistantRunning(false);
    
    if (is100Percent) {
      speakText('Parabéns! Treino finalizado com cem por cento de aproveitamento. Você é incrível!');
    } else {
      speakText('Treino encerrado. Algumas etapas foram puladas, mas o importante é manter a constância!');
    }
  };

  const handleResetWorkout = () => {
    const reseted = currentStudentExercises.map(ex => ({ ...ex, status: 'pendente' }));
    setExercises(reseted);
    updateStudentExercises(reseted);
    setWorkoutSessionFinished(false);
    setAuditLog([]);
    setAssistantActive(false);
    setAssistantRunning(false);
  };

  const totalExercises = exercises.length;
  const processedExercises = exercises.filter(ex => ex.status !== 'pendente').length;
  const percentDone = Math.round((processedExercises / totalExercises) * 100);

  const toggleAccordion = (name) => {
    setActiveAccordion(prev => prev === name ? '' : name);
  };

  // Tooltips descritivas dos campos avançados
  const TOOLTIP_TEXTS = {
    percentualGordura: 'Indica a proporção de gordura corporal em relação ao peso total. Ideal para monitorar composição magra.',
    massaMagra: 'Peso correspondente a músculos, ossos e órgãos vitais. Crucial para mensurar o ganho de massa muscular.',
    gorduraVisceral: 'Gordura que envolve os órgãos internos no abdômen. Um marcador de saúde cardiovascular importante.',
    fcRepouso: 'Quantidade de batimentos cardíacos por minuto em descanso completo. Um marcador de condicionamento cardiovascular.'
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Área de Conteúdo Principal */}
      <div style={styles.contentArea}>
        <div style={styles.card} className="glass">
          
          {/* Header da Aba */}
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <IconComponent size={24} className="text-gradient" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={styles.title}>{currentTabInfo.label}</h2>
              <span style={styles.tenantText}>{activeTenant.name}</span>
            </div>
          </div>

          <div style={styles.body}>
            {/* 1. ABA DE TREINOS */}
            {activeTab === 'treinos' && (
              <div style={{ width: '100%' }}>
                {workoutSessionFinished ? (
                  /* Tela Conclusão */
                  <div style={styles.resultCard} className="animate-fade-in">
                    {auditLog.is100Percent ? (
                      <div style={styles.successHeader}>
                        <div style={styles.awardCircle}>
                          <Award size={48} style={{ color: '#eab308' }} />
                        </div>
                        <span style={styles.badge100}>🏆 100% Finalizado</span>
                        <h3 style={styles.resultTitle}>Treino Concluído!</h3>
                        <p style={styles.resultDesc}>Você completou todos os exercícios. Sensacional!</p>
                      </div>
                    ) : (
                      <div style={styles.warningHeader}>
                        <div style={styles.warningCircle}>
                          <AlertTriangle size={48} style={{ color: 'var(--status-warning)' }} />
                        </div>
                        <span style={styles.badgePartial}>⚠️ Executado com Ressalvas</span>
                        <h3 style={styles.resultTitle}>Treino Finalizado</h3>
                        <p style={styles.resultDesc}>Sessão encerrada com exercícios pulados.</p>
                      </div>
                    )}

                    <div style={styles.auditLogBox}>
                      <h4 style={styles.auditTitle}>LOG DE AUDITORIA (Enviado ao Banco de Dados)</h4>
                      <div style={styles.auditContent}>
                        <p><strong>tenant_id:</strong> <code style={styles.code}>{activeTenant.id}</code></p>
                        <p><strong>Horário:</strong> {auditLog.timestamp}</p>
                        {auditLog.skipped.length > 0 && (
                          <div style={{ marginTop: '8px' }}>
                            <span style={{ color: 'var(--status-danger)', fontWeight: '700' }}>Exercícios Pulados (Auditados):</span>
                            <ul style={styles.auditList}>
                              {auditLog.skipped.map((n, i) => <li key={i} style={{ color: 'var(--status-danger)' }}>• {n}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <button onClick={handleResetWorkout} className="btn btn-secondary" style={styles.resetBtn}>
                      <RefreshCw size={14} /> Resetar e Simular Novamente
                    </button>
                  </div>
                ) : (
                  /* Tela de Execução */
                  <div style={styles.workoutContainer}>
                    <div style={styles.assistToggleRow} className="glass">
                      <div style={styles.toggleInfo}>
                        <h4 style={styles.toggleTitle}>Assistente em Tempo Real (Timer & Voz)</h4>
                        <p style={styles.toggleDesc}>Ativa áudio, bipes de contagem e instrução motivacional via sintetizador de voz do navegador.</p>
                      </div>
                      <label style={styles.switch}>
                        <input 
                          type="checkbox" 
                          checked={assistantActive} 
                          onChange={(e) => {
                            setAssistantActive(e.target.checked);
                            if (e.target.checked) {
                              startAssistant();
                            } else {
                              setAssistantRunning(false);
                            }
                          }}
                        />
                        <span style={styles.slider} />
                      </label>
                    </div>

                    {assistantActive && (
                      <div style={styles.assistantPanel} className="glass">
                        <div style={styles.panelLeft}>
                          <Volume2 size={24} className="text-gradient" />
                          <div>
                            <span style={styles.phaseLabel}>
                              FASE ATUAL: {assistantPhase === 'execucao' ? 'EXECUÇÃO (FORÇA)' : 'DESCANSO (RECUPERAÇÃO)'}
                            </span>
                            <div style={styles.timerDisplay}>
                              {assistantTimer}s
                            </div>
                          </div>
                        </div>
                        <div style={styles.panelRight}>
                          <button onClick={togglePauseAssistant} style={styles.assistBtn} className="btn-secondary">
                            {assistantRunning ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button onClick={handlePhaseTransition} style={styles.assistBtn} className="btn-secondary">
                            <FastForward size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={styles.progressBox}>
                      <div style={styles.progressTextRow}>
                        <span style={styles.progressLabel}>Progresso da Ficha de Hoje</span>
                        <span style={styles.progressPercent}>{percentDone}%</span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div style={{ ...styles.progressBarFill, width: `${percentDone}%` }} />
                      </div>
                    </div>

                    <div style={styles.exercisesGrid}>
                      {exercises.map((ex) => (
                        <div key={ex.id} style={{ ...styles.exerciseCard, ...(ex.status === 'concluido' ? styles.exConcluido : {}), ...(ex.status === 'pulado' ? styles.exPulado : {}) }} className="glass">
                          <div style={styles.exInfo}>
                            <div style={styles.nameVideoRow}>
                              <span style={styles.exCat}>{ex.category.toUpperCase()}</span>
                              <button onClick={() => openVideoModal(ex)} style={styles.videoLinkBtn}>
                                <Tv size={14} /> Vídeo de Auxílio
                              </button>
                            </div>
                            <h4 style={styles.exName}>{ex.name}</h4>
                            <div style={styles.exMetaRow}>
                              <span style={styles.exMetaItem}>Séries: <strong>{ex.reps}</strong></span>
                              <span style={styles.exMetaItem}>Carga: <strong>{ex.load}</strong></span>
                            </div>
                          </div>

                          <div style={styles.exActions}>
                            {ex.status === 'pendente' ? (
                              <>
                                <button onClick={() => handleCompleteExercise(ex.id)} style={styles.btnDone}>
                                  <Check size={16} /> Concluído
                                </button>
                                <button onClick={() => handleSkipExercise(ex.id)} style={styles.btnSkip}>
                                  <X size={16} /> Pular
                                </button>
                              </>
                            ) : (
                              <div style={styles.statusCompletedRow}>
                                <span style={ex.status === 'concluido' ? styles.statusTextDone : styles.statusTextSkipped}>
                                  {ex.status === 'concluido' ? '✓ Concluído' : '✗ Pulado'}
                                </span>
                                <button onClick={() => setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, status: 'pendente' } : e))} style={styles.btnUndo}>
                                  Desfazer
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.finishContainer}>
                      <button onClick={handleFinishWorkout} disabled={processedExercises < totalExercises} style={{ ...styles.finishWorkoutBtn, ...(processedExercises === totalExercises ? styles.finishWorkoutBtnActive : {}) }}>
                        Finalizar e Enviar Treino
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. ABA DE MEDIDAS/AVALIAÇÃO */}
            {activeTab === 'medidas' && (
              <div style={{ width: '100%' }}>
                {medidasSubmitted ? (
                  /* Sucesso no Envio das Medidas */
                  <div style={styles.resultCard} className="animate-fade-in">
                    <div style={styles.awardCircle}>
                      <Check size={48} style={{ color: 'var(--status-success)' }} />
                    </div>
                    <span style={styles.badge100}>📋 Medidas Salvas</span>
                    <h3 style={styles.resultTitle}>Avaliação Enviada!</h3>
                    <p style={styles.resultDesc}>Seus dados foram catalogados e servirão de base para a inteligência de treinos.</p>

                    <div style={styles.auditLogBox}>
                      <h4 style={styles.auditTitle}>MOCK DO PAYLOAD ENVIADO (API MULTI-TENANT)</h4>
                      <div style={styles.auditContent}>
                        <p><strong>tenant_id:</strong> <code style={styles.code}>{activeTenant.id}</code></p>
                        <p><strong>Peso / Altura:</strong> {formData.peso} kg / {formData.altura} cm</p>
                        <p><strong>Cintura:</strong> {formData.cintura} cm</p>
                        <p><strong>Objetivo:</strong> {formData.objetivo.toUpperCase()}</p>
                        <p><strong>Triagem PAR-Q:</strong> {formData.parqCardiaco === 'sim' ? '⚠️ HISTÓRICO CARDÍACO' : '✅ APTO'}</p>
                        {formData.laudoFile && <p><strong>Laudo Anexado:</strong> {formData.laudoFile}</p>}
                      </div>
                    </div>

                    <button onClick={() => setMedidasSubmitted(false)} className="btn btn-secondary">
                      Editar Respostas
                    </button>
                  </div>
                ) : (
                  /* Formulário de Medidas em Acordeão */
                  <form onSubmit={handleMedidasSubmit} style={styles.medidasForm}>
                    
                    {/* Acordeão 1: Identificação & Objetivos */}
                    <div style={styles.accordionItem} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('identificacao')}>
                        <h4 style={styles.accordionTitle}>1. Identificação & Objetivos</h4>
                        {activeAccordion === 'identificacao' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {activeAccordion === 'identificacao' && (
                        <div style={styles.accordionContent}>
                          <div style={styles.formRow}>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Nome Completo</label>
                              <input 
                                type="text" 
                                value={formData.nome} 
                                onChange={(e) => handleInputChange('nome', e.target.value)} 
                                style={styles.inputField} 
                                required
                              />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Objetivo Principal</label>
                              <select 
                                value={formData.objetivo} 
                                onChange={(e) => handleInputChange('objetivo', e.target.value)} 
                                style={styles.selectField}
                              >
                                <option value="hipertrofia">Hipertrofia (Ganho de Massa)</option>
                                <option value="emagrecimento">Emagrecimento / Queima</option>
                                <option value="condicionamento">Condicionamento Físico</option>
                                <option value="saude">Melhoria de Saúde / Postura</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeão 2: Composição Básica */}
                    <div style={styles.accordionItem} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('composicao')}>
                        <h4 style={styles.accordionTitle}>2. Composição Básica (Peso & Altura)</h4>
                        {activeAccordion === 'composicao' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {activeAccordion === 'composicao' && (
                        <div style={styles.accordionContent}>
                          <div style={styles.formRow}>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Peso (kg)</label>
                              <input 
                                type="number" 
                                step="0.1" 
                                placeholder="Ex: 75.5" 
                                value={formData.peso} 
                                onChange={(e) => handleInputChange('peso', e.target.value)} 
                                style={styles.inputField} 
                                required
                              />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Altura (cm)</label>
                              <input 
                                type="number" 
                                placeholder="Ex: 178" 
                                value={formData.altura} 
                                onChange={(e) => handleInputChange('altura', e.target.value)} 
                                style={styles.inputField} 
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeão 3: Circunferências */}
                    <div style={styles.accordionItem} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('circunferencias')}>
                        <h4 style={styles.accordionTitle}>3. Circunferências (Medidas em cm)</h4>
                        {activeAccordion === 'circunferencias' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {activeAccordion === 'circunferencias' && (
                        <div style={styles.accordionContent}>
                          <div style={styles.gridMedidas}>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Pescoço (cm)</label>
                              <input type="number" placeholder="cm" value={formData.pescoco} onChange={(e) => handleInputChange('pescoco', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Cintura (cm)</label>
                              <input type="number" placeholder="cm" value={formData.cintura} onChange={(e) => handleInputChange('cintura', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Abdômen (cm)</label>
                              <input type="number" placeholder="cm" value={formData.abdomen} onChange={(e) => handleInputChange('abdomen', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Braço Esq. (cm)</label>
                              <input type="number" placeholder="cm" value={formData.braçoEsq} onChange={(e) => handleInputChange('braçoEsq', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Braço Dir. (cm)</label>
                              <input type="number" placeholder="cm" value={formData.braçoDir} onChange={(e) => handleInputChange('braçoDir', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Coxa Esq. (cm)</label>
                              <input type="number" placeholder="cm" value={formData.coxaEsq} onChange={(e) => handleInputChange('coxaEsq', e.target.value)} style={styles.inputField} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeão 4: Logística & Hábitos */}
                    <div style={styles.accordionItem} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('logistica')}>
                        <h4 style={styles.accordionTitle}>4. Logística de Treino & Nutrição</h4>
                        {activeAccordion === 'logistica' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {activeAccordion === 'logistica' && (
                        <div style={styles.accordionContent}>
                          <div style={styles.gridMedidas}>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Frequência Semanal (Dias)</label>
                              <select value={formData.frequenciaSemanal} onChange={(e) => handleInputChange('frequenciaSemanal', e.target.value)} style={styles.selectField}>
                                <option value="2">2 dias/semana</option>
                                <option value="3">3 dias/semana</option>
                                <option value="4">4 dias/semana</option>
                                <option value="5">5+ dias/semana</option>
                              </select>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Nível de Experiência</label>
                              <select value={formData.nivelExperiencia} onChange={(e) => handleInputChange('nivelExperiencia', e.target.value)} style={styles.selectField}>
                                <option value="iniciante">Iniciante (Nunca treinei)</option>
                                <option value="intermediario">Intermediário (Já treino)</option>
                                <option value="avancado">Avançado (Mais de 2 anos)</option>
                              </select>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Horas de Sono / Noite</label>
                              <input type="number" placeholder="Horas" value={formData.horasSono} onChange={(e) => handleInputChange('horasSono', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Refeições ao Dia</label>
                              <input type="number" placeholder="Refeições" value={formData.refeicoesDiarias} onChange={(e) => handleInputChange('refeicoesDiarias', e.target.value)} style={styles.inputField} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeão 5: Triagem de Saúde (PAR-Q) - Obrigatório */}
                    <div style={{ ...styles.accordionItem, border: '1px solid var(--status-danger)' }} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('parq')}>
                        <h4 style={{ ...styles.accordionTitle, color: 'var(--status-danger)' }}>
                          5. Triagem de Saúde Obrigatória (PAR-Q)
                        </h4>
                        {activeAccordion === 'parq' ? <ChevronUp size={18} style={{ color: 'var(--status-danger)' }} /> : <ChevronDown size={18} style={{ color: 'var(--status-danger)' }} />}
                      </div>
                      
                      {activeAccordion === 'parq' && (
                        <div style={styles.accordionContent}>
                          <p style={styles.parqDisclaimer}>
                            Para sua segurança jurídica e física, responda às seguintes perguntas sobre o seu histórico médico:
                          </p>

                          {/* Pergunta 1 */}
                          <div style={styles.parqQuestionRow}>
                            <span style={styles.parqText}>1. Algum médico já disse que você possui algum problema de coração e recomendou apenas atividades sob supervisão?</span>
                            <div style={styles.radioGroup}>
                              <label><input type="radio" name="parqCardiaco" checked={formData.parqCardiaco === 'sim'} onChange={() => handleInputChange('parqCardiaco', 'sim')} /> Sim</label>
                              <label><input type="radio" name="parqCardiaco" checked={formData.parqCardiaco === 'nao'} onChange={() => handleInputChange('parqCardiaco', 'nao')} /> Não</label>
                            </div>
                          </div>

                          {/* Pergunta 2 */}
                          <div style={styles.parqQuestionRow}>
                            <span style={styles.parqText}>2. Você sente dores no peito com frequência quando realiza atividades físicas ou em repouso?</span>
                            <div style={styles.radioGroup}>
                              <label><input type="radio" name="parqDorPeito" checked={formData.parqDorPeito === 'sim'} onChange={() => handleInputChange('parqDorPeito', 'sim')} /> Sim</label>
                              <label><input type="radio" name="parqDorPeito" checked={formData.parqDorPeito === 'nao'} onChange={() => handleInputChange('parqDorPeito', 'nao')} /> Não</label>
                            </div>
                          </div>

                          {/* Pergunta 3 */}
                          <div style={styles.parqQuestionRow}>
                            <span style={styles.parqText}>3. Você usa medicamentos de controle para pressão arterial ou problemas cardíacos?</span>
                            <div style={styles.radioGroup}>
                              <label><input type="radio" name="parqMedicamento" checked={formData.parqMedicamento === 'sim'} onChange={() => handleInputChange('parqMedicamento', 'sim')} /> Sim</label>
                              <label><input type="radio" name="parqMedicamento" checked={formData.parqMedicamento === 'nao'} onChange={() => handleInputChange('parqMedicamento', 'nao')} /> Não</label>
                            </div>
                          </div>

                          {/* Aceite de Termos */}
                          <div style={styles.termRow}>
                            <input 
                              type="checkbox" 
                              id="termCheckbox" 
                              checked={formData.parqTermo} 
                              onChange={(e) => handleInputChange('parqTermo', e.target.checked)} 
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="termCheckbox" style={styles.termLabel}>
                              Declaro que as respostas acima são verdadeiras e estou ciente de que a falsidade das declarações pode acarretar riscos à minha saúde física.
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeão 6: Composição Avançada & Sinais Vitais (Opcionais) */}
                    <div style={styles.accordionItem} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('avancado')}>
                        <h4 style={styles.accordionTitle}>6. Composição Avançada (Opcionais)</h4>
                        {activeAccordion === 'avancado' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {activeAccordion === 'avancado' && (
                        <div style={styles.accordionContent}>
                          <div style={styles.gridMedidas}>
                            
                            <div style={styles.inputGroup}>
                              <div style={styles.labelWithTooltip}>
                                <label style={styles.formLabel}>Gordura Corporal (%)</label>
                                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'percentualGordura' ? null : 'percentualGordura')} style={styles.tooltipBtn}>
                                  <HelpCircle size={14} />
                                </button>
                              </div>
                              <input type="number" placeholder="Opcional" value={formData.percentualGordura} onChange={(e) => handleInputChange('percentualGordura', e.target.value)} style={styles.inputField} />
                              {activeTooltip === 'percentualGordura' && <span style={styles.tooltipText}>{TOOLTIP_TEXTS.percentualGordura}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                              <div style={styles.labelWithTooltip}>
                                <label style={styles.formLabel}>Massa Magra (kg)</label>
                                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'massaMagra' ? null : 'massaMagra')} style={styles.tooltipBtn}>
                                  <HelpCircle size={14} />
                                </button>
                              </div>
                              <input type="number" placeholder="Opcional" value={formData.massaMagra} onChange={(e) => handleInputChange('massaMagra', e.target.value)} style={styles.inputField} />
                              {activeTooltip === 'massaMagra' && <span style={styles.tooltipText}>{TOOLTIP_TEXTS.massaMagra}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                              <div style={styles.labelWithTooltip}>
                                <label style={styles.formLabel}>Gordura Visceral</label>
                                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'gorduraVisceral' ? null : 'gorduraVisceral')} style={styles.tooltipBtn}>
                                  <HelpCircle size={14} />
                                </button>
                              </div>
                              <input type="number" placeholder="Opcional" value={formData.gorduraVisceral} onChange={(e) => handleInputChange('gorduraVisceral', e.target.value)} style={styles.inputField} />
                              {activeTooltip === 'gorduraVisceral' && <span style={styles.tooltipText}>{TOOLTIP_TEXTS.gorduraVisceral}</span>}
                            </div>

                            <div style={styles.inputGroup}>
                              <div style={styles.labelWithTooltip}>
                                <label style={styles.formLabel}>FC Repouso (bpm)</label>
                                <button type="button" onClick={() => setActiveTooltip(activeTooltip === 'fcRepouso' ? null : 'fcRepouso')} style={styles.tooltipBtn}>
                                  <HelpCircle size={14} />
                                </button>
                              </div>
                              <input type="number" placeholder="Opcional" value={formData.fcRepouso} onChange={(e) => handleInputChange('fcRepouso', e.target.value)} style={styles.inputField} />
                              {activeTooltip === 'fcRepouso' && <span style={styles.tooltipText}>{TOOLTIP_TEXTS.fcRepouso}</span>}
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acordeão 7: Upload de Laudos Externos */}
                    <div style={styles.accordionItem} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('laudos')}>
                        <h4 style={styles.accordionTitle}>7. Laudos Externos (Exames / Bioimpedância)</h4>
                        {activeAccordion === 'laudos' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {activeAccordion === 'laudos' && (
                        <div style={styles.accordionContent}>
                          <p style={styles.parqDisclaimer}>
                            Anexe exames médicos, avaliações físicas externas ou laudos de bioimpedância clínica (Formatos aceitos: PDF ou Imagem):
                          </p>

                          <div style={styles.uploadBox}>
                            <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                            <label style={styles.uploadLabel} className="btn-secondary btn">
                              Escolher Arquivo...
                              <input 
                                type="file" 
                                accept=".pdf,image/*" 
                                onChange={handleFileUpload} 
                                style={{ display: 'none' }}
                              />
                            </label>
                            
                            {formData.laudoFile ? (
                              <div style={styles.fileDisplay}>
                                <FileText size={16} />
                                <span>{formData.laudoFile}</span>
                              </div>
                            ) : (
                              <span style={styles.uploadHint}>Nenhum arquivo anexado</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botão de Gravação de Medidas */}
                    <div style={{ marginTop: '20px' }}>
                      <button type="submit" style={styles.submitMedidasBtn} className="btn-primary">
                        Enviar Medidas com tenant_id
                      </button>
                    </div>

                  </form>
                )}
              </div>
            )}

            {/* Outras Abas */}
            {activeTab !== 'treinos' && activeTab !== 'medidas' && (
              <div style={styles.emptyState}>
                <div style={styles.pulseRing}>
                  <IconComponent size={40} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 style={styles.emptyTitle}>Nenhum dado cadastrado</h3>
                <p style={styles.emptyDesc}>
                  A área de <strong>{currentTabInfo.label}</strong> está pronta. {currentTabInfo.desc}
                </p>
                {activeTab === 'checkin' && (
                  <div style={styles.qrMock}>
                    <QrCode size={150} style={{ opacity: 0.8 }} />
                    <span style={styles.qrLabel}>Aproxime da catraca</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Vídeo */}
      {activeVideoEx && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard} className="glass">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Execução do Exercício</h3>
              <button onClick={() => setActiveVideoEx(null)} style={styles.closeModalBtn}>
                <X size={18} />
              </button>
            </div>
            
            <p style={{ ...styles.exName, margin: '4px 0 16px 0' }}>{activeVideoEx.name}</p>

            <div style={styles.videoWrapper}>
              <iframe
                src={activeVideoEx.video_personalizado_url || activeVideoEx.video_oficial_url}
                title={`Instruções de execução`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={styles.iframe}
              />
            </div>

            <div style={styles.dualLinkBox}>
              <span style={styles.dualLinkLabel}>📺 Link Prioritário do Aluno (Seu Influenciador):</span>
              <form onSubmit={saveCustomVideoUrl} style={styles.dualForm}>
                <input
                  type="url"
                  placeholder="Insira link do YouTube..."
                  value={tempCustomUrl}
                  onChange={(e) => setTempCustomUrl(e.target.value)}
                  style={styles.dualInput}
                />
                <button type="submit" style={styles.dualSaveBtn} className="btn-primary">
                  Priorizar Link
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Menu de Navegação Inferior */}
      <nav style={styles.bottomNav} className="glass">
        <div style={styles.scrollWrapper}>
          {TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
                title={tab.label}
              >
                <TabIcon size={20} style={{ 
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)'
                }} />
                <span style={{
                  ...styles.navLabel,
                  ...(isActive ? styles.navLabelActive : {})
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '80vh',
    paddingBottom: '90px',
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
  },
  card: {
    width: '100%',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    lineHeight: '1.2',
  },
  tenantText: {
    fontSize: '0.8rem',
    color: 'var(--secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  readOnlyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '380px',
    animation: 'fadeIn 0.3s ease-out',
  },
  pulseRing: {
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-tertiary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    border: '1px solid var(--border-color)',
  },
  emptyTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  // Form de Medidas & Accordion
  medidasForm: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    textAlign: 'left',
  },
  accordionItem: {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    transition: 'all var(--transition-fast)',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    userSelect: 'none',
  },
  accordionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  accordionContent: {
    padding: '20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    animation: 'fadeIn 0.2s ease-out',
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  gridMedidas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  inputGroup: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    position: 'relative',
  },
  formLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  inputField: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  selectField: {
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  parqDisclaimer: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '10px',
  },
  parqQuestionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
  },
  parqText: {
    fontSize: '0.85rem',
    fontWeight: '500',
    flex: 1,
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  termRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    marginTop: '12px',
  },
  termLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    cursor: 'pointer',
  },
  labelWithTooltip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tooltipBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  tooltipText: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    zIndex: 99,
    width: '240px',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--primary)',
    boxShadow: 'var(--shadow-md)',
    fontSize: '0.75rem',
    lineHeight: '1.4',
    marginBottom: '6px',
  },
  uploadBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '2px dashed var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    textAlign: 'center',
  },
  uploadLabel: {
    padding: '8px 16px',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  uploadHint: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '8px',
  },
  fileDisplay: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginTop: '8px',
  },
  submitMedidasBtn: {
    width: '100%',
    padding: '14px',
    border: 'none',
    fontSize: '0.95rem',
  },
  // Elementos do Treino
  workoutContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  assistToggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
  },
  toggleInfo: {
    flex: 1,
    paddingRight: '16px',
  },
  toggleTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '46px',
    height: '24px',
    flexShrink: 0,
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--border-color)',
    transition: '.3s',
    borderRadius: '34px',
  },
  assistantPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    animation: 'fadeIn 0.3s ease-out',
  },
  panelLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  phaseLabel: {
    fontSize: '0.7rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.5px',
  },
  timerDisplay: {
    fontSize: '1.75rem',
    fontWeight: '800',
    fontFamily: 'monospace',
    color: 'var(--primary)',
  },
  panelRight: {
    display: 'flex',
    gap: '8px',
  },
  assistBtn: {
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-sm)',
    padding: 0,
  },
  progressBox: {
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
  },
  progressTextRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  progressLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  progressPercent: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  progressBarBg: {
    height: '8px',
    backgroundColor: 'var(--border-color)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
    borderRadius: 'var(--radius-full)',
    transition: 'width var(--transition-smooth)',
  },
  exercisesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  exerciseCard: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    transition: 'all var(--transition-fast)',
  },
  exConcluido: {
    borderLeft: '4px solid var(--status-success)',
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
  },
  exPulado: {
    borderLeft: '4px solid var(--status-warning)',
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  exInfo: {
    flex: '1 1 250px',
  },
  nameVideoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  exCat: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    letterSpacing: '0.5px',
  },
  videoLinkBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    textDecoration: 'underline',
  },
  exName: {
    fontSize: '1.05rem',
    fontWeight: '700',
    margin: '4px 0 8px 0',
  },
  exMetaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  exMetaItem: {
    color: 'var(--text-secondary)',
  },
  exActions: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  btnDone: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  btnSkip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: 'var(--status-danger-bg)',
    color: 'var(--status-danger)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  statusCompletedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusTextDone: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--status-success)',
  },
  statusTextSkipped: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--status-warning)',
  },
  btnUndo: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    background: 'none',
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  finishContainer: {
    marginTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  finishWorkoutBtn: {
    padding: '14px 28px',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'not-allowed',
  },
  finishWorkoutBtnActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    borderColor: 'var(--primary)',
    cursor: 'pointer',
  },
  // Estilo Conclusão
  resultCard: {
    width: '100%',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  successHeader: {
    marginBottom: '24px',
  },
  warningHeader: {
    marginBottom: '24px',
  },
  awardCircle: {
    width: '90px',
    height: '90px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    border: '1px solid rgba(234, 179, 8, 0.2)',
  },
  warningCircle: {
    width: '90px',
    height: '90px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--status-warning-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  badge100: {
    fontSize: '0.8rem',
    fontWeight: '800',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    color: '#ca8a04',
    padding: '6px 16px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    textTransform: 'uppercase',
  },
  badgePartial: {
    fontSize: '0.8rem',
    fontWeight: '800',
    backgroundColor: 'var(--status-warning-bg)',
    color: 'var(--status-warning)',
    padding: '6px 16px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    marginTop: '16px',
  },
  resultDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
  },
  auditLogBox: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    textAlign: 'left',
    marginBottom: '24px',
  },
  auditTitle: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px',
    marginBottom: '12px',
    letterSpacing: '0.5px',
  },
  auditContent: {
    fontSize: '0.85rem',
    lineHeight: '1.6',
  },
  code: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: 'var(--primary)',
  },
  auditList: {
    listStyle: 'none',
    paddingLeft: '8px',
    marginTop: '4px',
    fontSize: '0.8rem',
  },
  resetBtn: {
    padding: '10px 20px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  // Modal de Vídeo
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backdropFilter: 'blur(4px)',
  },
  modalCard: {
    width: '100%',
    maxWidth: '560px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%',
    height: 0,
    overflow: 'hidden',
    borderRadius: 'var(--radius-md)',
    backgroundColor: '#000000',
    border: '1px solid var(--border-color)',
    marginBottom: '20px',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  dualLinkBox: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
  },
  dualLinkLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    display: 'block',
    marginBottom: '8px',
  },
  dualForm: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  dualInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  dualSaveBtn: {
    padding: '8px 16px',
    fontSize: '0.8rem',
    border: 'none',
  },
  // Outros Mocks
  qrMock: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-md)',
    color: '#000000',
  },
  qrLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
  },
  // Menu Inferior
  bottomNav: {
    position: 'fixed',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: '800px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    padding: '8px 12px',
    zIndex: 999,
  },
  scrollWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
    padding: '4px 0',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    flexShrink: 0,
    minWidth: '76px',
  },
  navItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  navLabel: {
    fontSize: '0.7rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
  },
  navLabelActive: {
    color: 'var(--primary)',
    fontWeight: '700',
  }
};

const toggleSwitchStyles = `
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .switch input:checked + span {
    background-color: var(--primary);
  }
  .switch input:checked + span:before {
    transform: translateX(22px);
  }
  .switch span:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = toggleSwitchStyles;
  document.head.appendChild(styleSheet);
}

export default Aluno;
