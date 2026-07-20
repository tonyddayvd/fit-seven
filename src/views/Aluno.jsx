import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FileText,
  Camera,
  ImageOff,
  BarChart2,
  Scale,
  Download
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

const SILHOUETTES = {
  masculino: {
    frente: 'assets/silhouettes/masculino_frente.jpg',
    costas: 'assets/silhouettes/masculino_costas.png',
    perfil: 'assets/silhouettes/masculino_perfil.jpg'
  },
  feminino: {
    frente: 'assets/silhouettes/feminino_frente.jpg',
    costas: 'assets/silhouettes/feminino_costas.png',
    perfil: 'assets/silhouettes/feminino_perfil.jpg'
  }
};

// Abre o HTML VIP em nova aba e dispara impressão automática → usuário salva como PDF
// O HTML já possui @media print configurado pela IA para layout correto de página
const openHtmlAsPdf = (htmlContent, nomeArquivo = 'programa') => {
  // Injeta script de auto-print logo antes do </body>
  const printScript = `
    <script>
      window.addEventListener('load', function() {
        setTimeout(function() {
          document.title = '${nomeArquivo}';
          window.print();
        }, 600);
      });
    <\/script>`;
  const htmlWithPrint = htmlContent.replace(/<\/body>/i, printScript + '</body>');
  const blob = new Blob([htmlWithPrint], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  // Revoga a URL após tempo suficiente para o carregamento
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

const Aluno = () => {
  const { activeTenant, user, currentStudentExercises, updateStudentExercises, submitEvaluation, workoutsByStudent, setVirtualRoute, pendingEvaluations, approvedEvaluations, reportBug } = useApp();
  
  const userDbData = workoutsByStudent && workoutsByStudent[user?.id];
  const isVip = user?.isVip || (userDbData && userDbData.isVip);
  const dataCadastro = user?.data_cadastro || "2026-05-10T12:00:00.000Z";
  const dataAtivacaoVip = user?.data_ativacao_vip || (userDbData && userDbData.data_ativacao_vip) || "2026-06-01T12:00:00.000Z";

  const calculateVipDaysLeft = () => {
    if (!isVip) return 0;
    const activationDate = new Date(dataAtivacaoVip);
    const now = new Date();
    const diffTime = now - activationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - diffDays);
  };

  const vipDaysLeft = calculateVipDaysLeft();

  const [activeTab, setActiveTab] = useState('treinos');
  const [activeSplit, setActiveSplit] = useState('A');
  const [lightboxPhoto, setLightboxPhoto] = useState(null); // { url, label } ou null
  
  // Estado de exercícios sincronizado com o contexto global (Fluxo Híbrido)
  const [exercises, setExercises] = useState([]);
  const [workoutSessionFinished, setWorkoutSessionFinished] = useState(false);
  const [finishedSplits, setFinishedSplits] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [lastEvalDate, setLastEvalDate] = useState(null);

  useEffect(() => {
    const hasWorkout = workoutsByStudent && workoutsByStudent[user?.id];
    const hasPending = pendingEvaluations && pendingEvaluations.some(ev => ev.userId === user?.id);
    
    // Se não tem treino ativo e não tem avaliação pendente, ignora o cooldown simulado
    if (!hasWorkout && !hasPending) {
      setLastEvalDate(null);
      return;
    }

    const saved = localStorage.getItem(`fitseven-last-eval-${user?.id || 'u3'}`);
    if (saved) {
      setLastEvalDate(new Date(saved));
    } else if (user?.id === 'u3') {
      const d = new Date();
      d.setDate(d.getDate() - 20);
      setLastEvalDate(d);
    } else {
      setLastEvalDate(null);
    }
  }, [workoutsByStudent, pendingEvaluations, user?.id]);

  useEffect(() => {
    const studentData = workoutsByStudent?.[user?.id];
    const hasVipHtml = studentData?.isVip && studentData?.vipHtml;

    if (hasVipHtml) {
      try {
        const html = studentData.vipHtml;
        const domParser = new DOMParser();
        const doc = domParser.parseFromString(html, 'text/html');

        // ── ESCOPO: apenas a seção de treino, ignorando nutrição/recuperação ──
        // Tenta achar a div exata com id="treino" para evitar capturar páginas erradas
        const treinoRoot = doc.getElementById('treino') || doc.querySelector('#treino') || doc.body;

        const parsed = [];
        const splitLetters = ['A', 'B', 'C', 'D', 'E'];
        const dayClassMap = { day1: 'A', day2: 'B', day3: 'C', day4: 'D', day5: 'E' };
        const catMap = {
          A: 'Pernas/Quadríceps',
          B: 'Costas/Core',
          C: 'Glúteo/Posterior',
          D: 'Superior/Cardio',
          E: 'Inferiores Completos'
        };

        // ── ESTRATÉGIA 1: div.exercise-main dentro do #treino ────────────────
        // Estrutura: <div class="exercise-main"><strong>Nome</strong><span>4x10</span></div>
        const exerciseMains = treinoRoot.querySelectorAll('.exercise-main');

        exerciseMains.forEach((el, idx) => {
          const name = el.querySelector('strong')?.textContent?.trim() || '';
          const reps = el.querySelector('span')?.textContent?.trim() || '';

          if (!name || name.length < 4) return;

          // Detectar split percorrendo ancestors até achar .day1-.day5
          let split = 'A';
          let node = el.parentElement;
          for (let d = 0; d < 15 && node; d++) {
            let found = false;
            for (const [cls, letter] of Object.entries(dayClassMap)) {
              if (node.classList && node.classList.contains(cls)) {
                split = letter;
                found = true;
                break;
              }
            }
            if (found) break;
            node = node.parentElement;
          }

          // Pegar a nota (.note) do li pai como observação de carga
          const liEl = el.closest ? el.closest('li') : null;
          const note = liEl?.querySelector('.note')?.textContent?.trim() || '';

          // Detectar se é seção de Preparação/Aquecimento
          const sectionTitle = el.closest ? 
            (el.closest('.workout-section')?.querySelector('.section-title')?.textContent?.toLowerCase() || '') : '';
          const isPrep = sectionTitle.includes('prepara') || sectionTitle.includes('aquec');

          parsed.push({
            id: `vip-${split}-${idx}`,
            split,
            name: name.substring(0, 80),
            category: catMap[split] || split,
            load: note || 'Conforme orientação do treino',
            reps: reps || '4 séries de 10',
            isPrep,
            status: 'pendente',
            video_oficial_url: '',
            video_personalizado_url: ''
          });
        });

        // ── ESTRATÉGIA 2: li > strong dentro do #treino (outros formatos de IA) ─
        if (parsed.length === 0) {
          let exCounter = 0;
          treinoRoot.querySelectorAll('li').forEach((item) => {
            const name = item.querySelector('strong')?.textContent?.trim() || '';
            const reps = item.querySelector('span:not(.note)')?.textContent?.trim() || '';
            if (!name || name.length < 4) return;
            // Ignorar itens que parecem dias/avisos, não exercícios
            const lowName = name.toLowerCase();
            if (lowName.startsWith('dia ') || lowName.startsWith('treino ') || lowName.startsWith('protocolo')) return;
            exCounter++;
            parsed.push({
              id: `vip-li-${exCounter}`,
              split: splitLetters[Math.min(Math.floor(exCounter / 6), 4)],
              name: name.substring(0, 80),
              category: 'VIP',
              load: item.querySelector('.note')?.textContent?.trim() || 'Conforme orientação',
              reps: reps || '4 séries de 10',
              status: 'pendente',
              video_oficial_url: '',
              video_personalizado_url: ''
            });
          });
        }

        if (parsed.length > 0) {
          // Reclassificação inteligente de categoria
          const finalParsed = parsed.map(ex => {
            const lowName = ex.name.toLowerCase();
            let finalCategory = ex.category;
            if (lowName.includes('esteira') || lowName.includes('caminhada') || lowName.includes('corrida') || lowName.includes('elíptico') || lowName.includes('bike') || lowName.includes('bicicleta') || lowName.includes('cardio')) {
              finalCategory = 'Cardio';
            } else if (lowName.includes('manguito') || lowName.includes('desenvolvimento') || lowName.includes('elevação lateral') || lowName.includes('ombro')) {
              finalCategory = 'Ombros';
            } else if (lowName.includes('supino') || lowName.includes('peito') || lowName.includes('crucifixo') || lowName.includes('fly')) {
              finalCategory = 'Peitoral';
            } else if (lowName.includes('puxada') || lowName.includes('remada') || lowName.includes('costas')) {
              finalCategory = 'Costas';
            } else if (lowName.includes('agachamento') || lowName.includes('leg press') || lowName.includes('extensora') || lowName.includes('pernas')) {
              finalCategory = 'Pernas';
            }
            return { ...ex, category: finalCategory };
          });

          // Sincroniza também a lista de treinos concluídos
          if (Array.isArray(studentData.finishedSplits)) {
            setFinishedSplits(studentData.finishedSplits);
          }

          // Se o banco de dados já possuir exercises com status/realLoad salvos, mescla para não perder o progresso
          if (studentData?.exercises && studentData.exercises.length > 0) {
            const merged = finalParsed.map(pEx => {
              const savedEx = studentData.exercises.find(se => se.name === pEx.name);
              if (savedEx) {
                return {
                  ...pEx,
                  status: savedEx.status || 'pendente',
                  realSets: savedEx.realSets,
                  realLoad: savedEx.realLoad,
                  video_personalizado_url: localStorage.getItem(`fitseven-custom-video-${user?.id || 'u3'}-${pEx.id}`) || savedEx.video_personalizado_url || pEx.video_personalizado_url,
                  metaAtingida100: savedEx.metaAtingida100,
                  feedbackDificuldade: savedEx.feedbackDificuldade
                };
              }
              // Caso o exercício esteja no localStorage mas ainda não no banco
              const localUrl = localStorage.getItem(`fitseven-custom-video-${user?.id || 'u3'}-${pEx.id}`);
              if (localUrl) {
                return { ...pEx, video_personalizado_url: localUrl };
              }
              return pEx;
            });
            console.log(`[VIP Parser] Mesclado com status do banco. Total: ${merged.length} exercícios.`);
            setExercises(merged);
            return;
          }

          // Se não há exercícios no banco mas há URLs salvas no local
          const finalWithLocal = finalParsed.map(ex => {
            const localUrl = localStorage.getItem(`fitseven-custom-video-${user?.id || 'u3'}-${ex.id}`);
            if (localUrl) {
              return { ...ex, video_personalizado_url: localUrl };
            }
            return ex;
          });

          console.log(`[VIP Parser] OK: ${finalWithLocal.length} exercícios.`);
          setExercises(finalWithLocal);
          return;
        }
        
        // Se falhar o parsing do HTML mas o banco possui exercícios salvos pré-estruturados, usa-os
        if (studentData?.exercises && studentData.exercises.length > 0) {
          if (Array.isArray(studentData.finishedSplits)) {
            setFinishedSplits(studentData.finishedSplits);
          }
          console.log(`[VIP Fallback] Usando ${studentData.exercises.length} exercícios pré-estruturados do banco.`);
          setExercises(studentData.exercises);
          return;
        }
        
        console.warn('[VIP Parser] Nenhum exercício encontrado no escopo do #treino. Usando exercises[] do banco.');
      } catch (err) {
        console.warn('[VIP Parser] Erro:', err);
      }
    }

    // Fallback: exercícios do banco (não-VIP ou parser sem resultado)
    setExercises(currentStudentExercises);
  }, [currentStudentExercises, workoutsByStudent, user?.id]);

  // Estados dos recursos interativos
  const [activeVideoEx, setActiveVideoEx] = useState(null);
  const [tempCustomUrl, setTempCustomUrl] = useState('');

  // Estados do Assistente em Tempo Real (Ativado por Exercício)
  const [activeAssistantExId, setActiveAssistantExId] = useState(null); // armazena o id do exercício ativo
  const [assistantPhase, setAssistantPhase] = useState('preparacao'); // 'execucao' ou 'descanso'
  const [assistantTimer, setAssistantTimer] = useState(0);
  const [assistantRunning, setAssistantRunning] = useState(false);

  // Estados da aba Medidas/Avaliação
  const [activeAccordion, setActiveAccordion] = useState('identificacao');
  const [medidasSubmitted, setMedidasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados do Formulário de Medidas
  const [formData, setFormData] = useState({
    // Seção 1: Identificação/Objetivos
    nome: user?.name || '',
    sexoBiologico: 'masculino', // Novo campo
    idade: '', // Novo campo
    objetivo: 'hipertrofia',
    historicoAtividade: 'moderado',
    descricaoRotina: '', // Campo de texto livre para rotina
    // Seção 2: Composição Básica
    peso: '',
    altura: '',
    // Seção 3: Circunferências
    pescoco: '',
    peitoral: '', // Novo
    cintura: '',
    abdomen: '',
    quadril: '', // Novo
    braçoEsq: '',
    braçoDir: '',
    coxaEsqSuperior: '',
    coxaEsqInferior: '',
    coxaDirSuperior: '',
    coxaDirInferior: '',
    panturrilhaEsq: '', // Novo
    panturrilhaDir: '', // Novo
    // Seção 4: Logística e Hábitos
    frequenciaSemanal: '3',
    nivelExperiencia: 'intermediario',
    horasSono: '7',
    refeicoesDiarias: '4',
    // Novos campos da seção 4
    tempoSessao: '',
    equipamentos: 'completa',
    lesoes: '',
    preferencias: '',
    restricoesAlimentares: '',
    preferenciasAlimentares: '',
    qualidadeSono: '5',
    hidratacaoAtual: '',
    suplementos: '',
    nivelAtividade: 'sentado',
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
    // Arquivos e Fotos (Novos campos)
    laudoFile: null,
    fotoFrente: '',
    fotoCostas: '',
    fotoPerfil: ''
  });

  const [activeTooltip, setActiveTooltip] = useState(null);
  const timerRef = useRef(null);

  // Estados para modais de Reporte de Bug e Confirmação de Repetições
  const [reportModalEx, setReportModalEx] = useState(null); // ex ou null
  const [reportText, setReportText] = useState('');
  const [confirmModalEx, setConfirmModalEx] = useState(null); // { id, currentSetsVal, currentLoadVal } ou null
  const [confirmReached100, setConfirmReached100] = useState(null); // 'yes' | 'no' | null
  const [confirmObs, setConfirmObs] = useState('');

  const currentTabInfo = TABS.find(t => t.id === activeTab) || TABS[0];
  const IconComponent = currentTabInfo.icon;

  // Carrega rascunho temporário digitado ou histórico anterior para autocompletar e evitar redigitar tudo
  useEffect(() => {
    if (!user?.id) return;
    
    // 1. Tentar ler do rascunho temporário (rascunho de digitação atual)
    const draft = localStorage.getItem(`fitseven-draft-eval-${user.id}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
        return;
      } catch (e) {
        console.error('Erro ao ler rascunho de avaliação:', e);
      }
    }

    // 2. Se não houver rascunho ativo, autocompleta com a última avaliação que já está aprovada/cadastrada ou do histórico de evolução
    const savedLastEvalData = localStorage.getItem(`fitseven-last-eval-data-${user.id}`);
    if (savedLastEvalData) {
      try {
        const parsed = JSON.parse(savedLastEvalData);
        // Remove apenas fotos, termos e campos de arquivo para que ele faça upload das fotos novas, mas mantendo todas as medidas e questionários preenchidos
        const autocompleteData = { ...parsed };
        delete autocompleteData.fotoFrente;
        delete autocompleteData.fotoFrenteBase64;
        delete autocompleteData.fotoCostas;
        delete autocompleteData.fotoCostasBase64;
        delete autocompleteData.fotoPerfil;
        delete autocompleteData.fotoPerfilBase64;
        delete autocompleteData.laudoFile;
        delete autocompleteData.laudoFileBase64;
        autocompleteData.parqTermo = false; // Exige novo aceite por segurança jurídica
        
        setFormData(prev => ({ ...prev, ...autocompleteData }));
      } catch (e) {
        console.error('Erro ao carregar autocompletar anterior:', e);
      }
    }
    // 3. Inicializar splits concluídos
    const savedSplits = localStorage.getItem(`fitseven-finished-splits-${user.id}`);
    if (savedSplits) {
      try {
        setFinishedSplits(JSON.parse(savedSplits));
      } catch (e) {
        console.error('Erro ao ler splits concluídos:', e);
      }
    } else {
      setFinishedSplits([]);
    }
  }, [user, user?.id]);

  // Handlers para o Form de Medidas com Auto-Save de Rascunho
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Salva em tempo real no localStorage para não perder a digitação
      localStorage.setItem(`fitseven-draft-eval-${user?.id || 'u3'}`, JSON.stringify(next));
      return next;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          laudoFile: file.name,
          laudoFileBase64: reader.result 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para comprimir imagens em Base64 no navegador via Canvas para evitar estouro de rede
  const compressImageBase64 = (base64Str, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      // Se não for imagem ou não for base64 completo, retorna direto
      if (!base64Str || !base64Str.startsWith('data:image/')) {
        resolve(base64Str);
        return;
      }
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(base64Str); // Fallback caso falhe na leitura
      };
    });
  };

  const handleMedidasSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

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

    setIsSubmitting(true);

    try {
      // Compactar as imagens Base64 antes do envio para evitar estouro de limite do Supabase e timeouts
      const compressedFrente = await compressImageBase64(formData.fotoFrenteBase64);
      const compressedCostas = await compressImageBase64(formData.fotoCostasBase64);
      const compressedPerfil = await compressImageBase64(formData.fotoPerfilBase64);
      
      // Laudo clínico: Se for imagem, comprime. Se for PDF, mantém original (Base64 do PDF não inicia com data:image/)
      const compressedLaudo = await compressImageBase64(formData.laudoFileBase64);

      const finalData = {
        ...formData,
        fotoFrenteBase64: compressedFrente,
        fotoCostasBase64: compressedCostas,
        fotoPerfilBase64: compressedPerfil,
        laudoFileBase64: compressedLaudo
      };

      await submitEvaluation(finalData);
      setLastEvalDate(new Date());
      setMedidasSubmitted(true);
      
      // Salva em localStorage os dados enviados para autocompletar avaliações futuras (mantendo apenas dados leves)
      const lightData = { ...finalData };
      delete lightData.fotoFrenteBase64;
      delete lightData.fotoCostasBase64;
      delete lightData.fotoPerfilBase64;
      delete lightData.laudoFileBase64;
      localStorage.setItem(`fitseven-last-eval-data-${user?.id || 'u3'}`, JSON.stringify(lightData));
      
      // Limpa o rascunho temporário ativo pois o formulário já foi enviado
      localStorage.removeItem(`fitseven-draft-eval-${user?.id || 'u3'}`);
      
      alert('Avaliação física submetida com sucesso! Aguarde a aprovação do seu treinador.');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar avaliação: ' + (err.message || 'Erro de conexão com o banco de dados.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const speakText = (text, onEndCallback) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // Filtra e escolhe uma voz premium ou mais natural em pt-BR
      const voices = window.speechSynthesis.getVoices();
      const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
      
      // Procura por vozes que contenham 'google', 'natural', 'premium', 'microsoft' ou 'neural'
      const premiumVoice = ptVoices.find(v => 
        v.name.toLowerCase().includes('google') || 
        v.name.toLowerCase().includes('natural') || 
        v.name.toLowerCase().includes('premium') || 
        v.name.toLowerCase().includes('neural') ||
        v.name.toLowerCase().includes('microsoft') ||
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('maria')
      );
      
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      } else if (ptVoices.length > 0) {
        utterance.voice = ptVoices[0];
      }
      
      // Ajuste fino de entonação e velocidade para soar mais humano
      utterance.pitch = 1.05; // Levemente mais agudo/natural
      utterance.rate = 1.0;   // Velocidade ideal (sem pressa)
      
      if (onEndCallback) {
        utterance.onend = onEndCallback;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      if (onEndCallback) onEndCallback();
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
    if (activeAssistantExId && assistantRunning && assistantTimer > 0) {
      timerRef.current = setInterval(() => {
        setAssistantTimer(prev => {
          const next = prev - 1;

          // Executa a inteligência apenas se a fase for 'execucao'
          if (assistantPhase === 'execucao') {
            // 1. Contagem regressiva por voz nos últimos 5 segundos
            if (next >= 1 && next <= 5) {
              speakText(`${next}`);
            }

            // 2. Estímulo de Reta Final (Aos 8 segundos restantes, que é ~18% de 45s)
            if (next === 8) {
              speakText('Reta final, dê o seu máximo agora!');
            }

            // 3. Lembrete de Ritmo a cada 15 segundos executados (ex: aos 30s e 15s do timer de 45s)
            if (next === 30 || next === 15) {
              const frasesMotivacionais = [
                'Mantenha o ritmo!',
                'Concentra na execução!',
                'Postura firme e respira!',
                'Não para agora, continua!'
              ];
              const randomMsg = frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];
              speakText(randomMsg);
            }
          }

          // Bipes de aviso finais (3s, 2s, 1s) continuam ocorrendo
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
  }, [activeAssistantExId, assistantRunning, assistantTimer, assistantPhase]);

  // Função auxiliar para obter as repetições e séries padrão de um exercício
  const getExRepsAndSets = (ex) => {
    // Prescrição de reps ex: '4 séries de 10', 'Rosca: 3 séries de 12', '4x10'
    const repsStr = ex.reps || '';
    let repsNum = 10;
    let setsNum = 4;
    
    // Tenta casar padrões como '4 séries de 12' ou '4x12' ou '12 reps'
    const matchSériesDe = repsStr.match(/(\d+)\s*s\u00e9ries?\s*de\s*(\d+|\w+)/i);
    const matchX = repsStr.match(/(\d+)\s*x\s*(\d+|\w+)/i);
    
    if (matchSériesDe) {
      setsNum = parseInt(matchSériesDe[1]) || 4;
      repsNum = parseInt(matchSériesDe[2]) || 10;
    } else if (matchX) {
      setsNum = parseInt(matchX[1]) || 4;
      repsNum = parseInt(matchX[2]) || 10;
    } else {
      // Caso não consiga parsear (ex: '15 minutos' ou 'falha')
      const matchOnlyNum = repsStr.match(/(\d+)/);
      if (matchOnlyNum) {
        repsNum = parseInt(matchOnlyNum[1]) || 10;
      }
    }
    return { reps: repsNum, sets: setsNum };
  };

  // Parser de HTML VIP gerado pela IA externa → exercícios estruturados para a ferramenta interativa
  const parseVipHtmlToExercises = (html) => {
    if (!html) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const exercises = [];
      let exCounter = 0;
      const splitLetters = ['A', 'B', 'C', 'D', 'E'];
      let currentSplit = 'A';
      let splitIdx = 0;
      const dayRegex = /\b(dia\s*\d|treino\s*[a-e1-5]|superior|inferior|core|cardio)\b/i;

      // Estratégia 1: buscar linhas de tabela com células (padrão mais comum em HTML gerado por IA)
      const allRows = doc.querySelectorAll('tr');
      allRows.forEach((row, rowIdx) => {
        const cells = row.querySelectorAll('td, th');
        const rowText = row.textContent.trim();
        if (!rowText || rowText.length < 3) return;

        // Detectar cabeçalho de dia/split para avançar o split
        if (dayRegex.test(rowText) && rowText.length < 100 && cells.length <= 2) {
          if (exCounter > 0 || rowIdx > 0) {
            splitIdx = Math.min(splitIdx + 1, 4);
            currentSplit = splitLetters[splitIdx];
          }
          return;
        }

        if (cells.length >= 2) {
          const nameCell = cells[0]?.textContent?.trim() || '';
          const repsCell = cells[1]?.textContent?.trim() || '';
          const loadCell = cells[2]?.textContent?.trim() || '';

          // Ignorar cabeçalhos de tabela
          const skipWords = ['exercício', 'exercise', 'série', 'repetição', 'carga', 'método', 'obs'];
          if (skipWords.some(w => nameCell.toLowerCase() === w)) return;
          if (!nameCell || nameCell.length < 4 || /^\d+$/.test(nameCell)) return;
          if (nameCell.toLowerCase().startsWith('protocolo') || nameCell.toLowerCase().startsWith('programa')
              || nameCell.toLowerCase().startsWith('cliente') || nameCell.toLowerCase().startsWith('objetivo')
              || nameCell.toLowerCase().startsWith('dia ') || nameCell.toLowerCase().startsWith('treino ')) return;

          exCounter++;
          exercises.push({
            id: `vip-ex-${splitIdx}-${exCounter}`,
            split: currentSplit,
            name: nameCell.replace(/\n/g, ' ').substring(0, 80),
            category: currentSplit,
            load: loadCell || 'Conforme orientação',
            reps: repsCell || '4 séries de 10',
            status: 'pendente',
            video_oficial_url: '',
            video_personalizado_url: ''
          });
        }
      });

      // Estratégia 2: se não encontrou via tabela, tentar listas <li>
      if (exercises.length === 0) {
        doc.querySelectorAll('li').forEach((item, idx) => {
          const text = item.textContent.trim();
          if (text.length < 6 || text.length > 150) return;
          const m = text.match(/^(?:\d+[\.\)]\s*)?(.{5,70})(?:\s*[-:–]\s*(\d+[xX]\d+|\d+\s*séries?))?/);
          if (m && m[1] && !dayRegex.test(m[1])) {
            exCounter++;
            exercises.push({
              id: `vip-li-${exCounter}`,
              split: splitLetters[Math.min(Math.floor(exCounter / 5), 4)],
              name: m[1].trim().substring(0, 80),
              category: 'VIP',
              load: 'Conforme orientação',
              reps: m[2] || '4 séries de 10',
              status: 'pendente',
              video_oficial_url: '',
              video_personalizado_url: ''
            });
          }
        });
      }

      return exercises;
    } catch (err) {
      console.warn('Parser VIP HTML falhou, usando exercises[] base:', err);
      return [];
    }
  };

  const handlePhaseTransition = () => {
    setAssistantRunning(false); // Pausa temporariamente para a fala rodar
    if (assistantPhase === 'execucao') {
      setAssistantPhase('descanso');
      setAssistantTimer(30);
      speakText('Série concluída! Aproveite para descansar por trinta segundos.', () => {
        setAssistantRunning(true);
      });
    } else if (assistantPhase === 'descanso') {
      setAssistantPhase('execucao');
      // Calcula cadência dinâmica baseada no exercício em foco
      const currentEx = exercises.find(ex => ex.id === activeAssistantExId);
      const reps = currentEx ? getExRepsAndSets(currentEx).reps : 10;
      const dynamicExecutionTime = reps * 3;
      
      setAssistantTimer(dynamicExecutionTime);
      speakText(`Descanso finalizado. Força, inicie a próxima série agora!`, () => {
        setAssistantRunning(true);
      });
    }
  };

  const startAssistant = (exId) => {
    const currentEx = exercises.find(ex => ex.id === exId);
    const reps = currentEx ? getExRepsAndSets(currentEx).reps : 10;
    const dynamicExecutionTime = reps * 3;

    setActiveAssistantExId(exId);
    setAssistantPhase('execucao');
    setAssistantTimer(dynamicExecutionTime);
    setAssistantRunning(false); // Mantém pausado até acabar de falar
    speakText('Assistente ativado! Prepare-se para começar. Três, dois, um, força!', () => {
      setAssistantRunning(true);
    });
  };

  const togglePauseAssistant = () => {
    const nextRunning = !assistantRunning;
    setAssistantRunning(nextRunning);
    speakText(nextRunning ? 'Assistente retomado.' : 'Assistente pausado.');
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

    const updated = exercises.map(ex => 
      ex.id === activeVideoEx.id ? { ...ex, video_personalizado_url: formattedUrl } : ex
    );
    setExercises(updated);
    updateStudentExercises(updated);
    setActiveVideoEx(prev => ({ ...prev, video_personalizado_url: formattedUrl }));
    
    // Salva de forma persistente e instantânea localmente para garantir funcionamento
    localStorage.setItem(`fitseven-custom-video-${user?.id || 'u3'}-${activeVideoEx.id}`, formattedUrl);
    alert('Link do influenciador favorito salvo com sucesso e priorizado!');
  };

  const handleCompleteExercise = (id, realSets, realLoad) => {
    const updated = exercises.map(ex => 
      ex.id === id ? { 
        ...ex, 
        status: 'concluido', 
        realSets: realSets, 
        realLoad: realLoad 
      } : ex
    );
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
    const pending = exercisesForActiveSplit.filter(ex => ex.status === 'pendente');
    if (pending.length > 0) {
      alert('Marque todos os exercícios como Concluídos ou Pulados antes de finalizar.');
      return;
    }

    const skipped = exercisesForActiveSplit.filter(ex => ex.status === 'pulado').map(ex => ex.name);
    const completed = exercisesForActiveSplit.filter(ex => ex.status === 'concluido').map(ex => ex.name);
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
    setActiveAssistantExId(null);
    setAssistantRunning(false);
  };

  const exercisesForActiveSplit = exercises.filter(ex => (ex.split || 'A') === activeSplit);
  const totalExercises = exercisesForActiveSplit.length;
  const processedExercises = exercisesForActiveSplit.filter(ex => ex.status !== 'pendente').length;
  const percentDone = totalExercises > 0 ? Math.round((processedExercises / totalExercises) * 100) : 0;

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

      {/* ── LIGHTBOX DE FOTOS ────────────────────────────────────────── */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
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
            {isVip && (
              <div style={{
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid #eab308',
                color: '#eab308',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                👑 Plano VIP (Restam {vipDaysLeft} dias)
              </div>
            )}
          </div>

          <div style={styles.body}>
            {/* 1. ABA DE TREINOS */}
            {activeTab === 'treinos' && (
              <div style={{ width: '100%' }}>
                {/* Banner VIP dourado + botão de download — aparece quando aluno é VIP com HTML salvo */}
                {workoutsByStudent?.[user?.id]?.isVip && workoutsByStudent?.[user?.id]?.vipHtml && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))',
                    border: '1px solid rgba(234,179,8,0.35)'
                  }} className="animate-fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>👑</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#eab308' }}>Programa VIP Homologado & Ativo</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Este treino foi montado sob medida por nossa IA e revisado/autorizado de forma personalizada pela nossa equipe técnica de profissionais de educação física.</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const vipHtmlContent = workoutsByStudent[user.id].vipHtml;
                        const nome = `Programa VIP - ${user.name || 'Aluno'}`;
                        openHtmlAsPdf(vipHtmlContent, nome);
                      }}
                      style={{
                        padding: '8px 14px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        backgroundColor: 'rgba(234,179,8,0.15)',
                        color: '#eab308',
                        border: '1px solid rgba(234,179,8,0.4)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Download size={14} /> Salvar como PDF
                    </button>
                  </div>
                )}
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

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', width: '100%' }}>
                      <button 
                        onClick={() => {
                          setWorkoutSessionFinished(false);
                        }} 
                        className="btn btn-secondary" 
                        style={{ ...styles.resetBtn, flex: 1, margin: 0, padding: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}
                      >
                        ✏️ Editar / Corrigir Informações
                      </button>
                      <button 
                        onClick={async () => {
                          const updatedSplits = [...finishedSplits];
                          if (!updatedSplits.includes(activeSplit)) {
                            updatedSplits.push(activeSplit);
                          }
                          setFinishedSplits(updatedSplits);
                          localStorage.setItem(`fitseven-finished-splits-${user?.id || 'u3'}`, JSON.stringify(updatedSplits));
                          
                          // Persiste em definitivo na nuvem do Supabase
                          try {
                            await updateStudentExercises(exercises, updatedSplits);
                          } catch (err) {
                            console.error('Erro ao persistir encerramento na nuvem:', err);
                          }

                          setWorkoutSessionFinished(false);
                          
                          // Sugere o próximo split se houver
                          const remainingSplits = ['A', 'B', 'C', 'D', 'E'].filter(s => {
                            const count = exercises.filter(ex => (ex.split || 'A') === s).length;
                            return count > 0 && !updatedSplits.includes(s);
                          });
                          if (remainingSplits.length > 0) {
                            setActiveSplit(remainingSplits[0]);
                          }
                          alert('Treino concluído em definitivo! O split foi bloqueado e seu progresso computado.');
                        }} 
                        className="btn btn-primary" 
                        style={{ ...styles.resetBtn, flex: 1, margin: 0, padding: '12px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'var(--status-success)' }}
                      >
                        ✓ Concluir em Definitivo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tela de Execução */
                  <div style={styles.workoutContainer}>
                    <div style={styles.progressBox}>
                      <div style={styles.progressTextRow}>
                        <span style={styles.progressLabel}>Progresso da Ficha de Hoje</span>
                        <span style={styles.progressPercent}>{percentDone}%</span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div style={{ ...styles.progressBarFill, width: `${percentDone}%` }} />
                      </div>
                    </div>

                    {/* Seletor Horizontal de Splits */}
                    <div style={styles.splitSelector}>
                      {['A', 'B', 'C', 'D', 'E'].map(letter => {
                        const count = exercises.filter(ex => (ex.split || 'A') === letter).length;
                        if (count === 0) return null; // Só renderiza splits que possuem exercícios cadastrados
                        const isFinished = finishedSplits.includes(letter);
                        return (
                          <button
                            key={letter}
                            type="button"
                            disabled={isFinished}
                            onClick={() => {
                              setActiveSplit(letter);
                              setWorkoutSessionFinished(false);
                            }}
                            style={{
                              ...styles.splitBtn,
                              ...(activeSplit === letter ? styles.splitBtnActive : {}),
                              ...(isFinished ? { opacity: 0.4, cursor: 'not-allowed', textDecoration: 'line-through', border: '1px dashed var(--border-color)' } : {})
                            }}
                          >
                            {isFinished ? '🔒 Concluído' : `Treino ${letter}`}
                            <span style={{
                              ...styles.splitCountBadge,
                              ...(activeSplit === letter ? styles.splitCountBadgeActive : {}),
                              ...(isFinished ? { backgroundColor: 'var(--text-muted)' } : {})
                            }}>{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={styles.exercisesGrid}>
                      {exercisesForActiveSplit.map((ex) => {
                        const defaultRepsSets = getExRepsAndSets(ex);
                        
                        // Estados locais ou derivados para carga e séries editáveis por card de exercício
                        const realSetsKey = `sets-${ex.id}`;
                        const realLoadKey = `load-${ex.id}`;
                        
                        // Inicializa ou recupera valores do estado do formulário se não preenchidos
                        if (!formData[realSetsKey]) formData[realSetsKey] = defaultRepsSets.sets;
                        if (!formData[realLoadKey]) formData[realLoadKey] = '';

                        const currentSetsVal = formData[realSetsKey];
                        const currentLoadVal = formData[realLoadKey];
                        const repsCount = defaultRepsSets.reps;
                        const dynamicTimeText = `${repsCount * 3}s`;

                        const isSplitFinished = finishedSplits.includes(activeSplit);

                        return (
                          <div key={ex.id} style={{ ...styles.exerciseCard, ...(ex.status === 'concluido' ? styles.exConcluido : {}), ...(ex.status === 'pulado' ? styles.exPulado : {}), ...(isSplitFinished ? { opacity: 0.75, pointerEvents: 'none' } : {}) }} className="glass">
                            <div style={styles.exInfo}>
                              <div style={styles.nameVideoRow}>
                                <span style={styles.exCat}>{ex.category.toUpperCase()}</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <button 
                                    onClick={() => {
                                      setReportModalEx(ex);
                                      setReportText(`[Exercício: ${ex.name}]\n- Split: ${activeSplit}\n- Categoria: ${ex.category}\n- Meta: ${ex.reps}\n\nDescreva o problema aqui:\n`);
                                    }} 
                                    style={{ ...styles.videoLinkBtn, color: 'var(--status-danger)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '4px 8px', fontSize: '0.7rem' }}
                                  >
                                    🚨 Reportar Bug
                                  </button>
                                  <button onClick={() => openVideoModal(ex)} style={styles.videoLinkBtn}>
                                    <Tv size={12} /> Vídeo
                                  </button>
                                </div>
                              </div>
                              <h4 style={styles.exName}>{ex.name}</h4>
                              <div style={styles.exMetaRow}>
                                <span style={styles.exMetaItem}>Meta Prescrita: <strong>{ex.reps}</strong></span>
                                <span style={styles.exMetaItem}>Cadência (3s/rep): <strong>{dynamicTimeText}</strong></span>
                              </div>

                               {/* Inputs interativos de Carga e Séries (Se pendente) */}
                              {ex.status === 'pendente' && (
                                <div style={styles.metricsFormRow}>
                                  <div style={styles.metricField}>
                                    <label style={styles.metricLabel}>
                                      {ex.category === 'Cardio' ? 'Tempo Real (min)' : 'Séries Reais Realizadas'}
                                    </label>
                                    {ex.category === 'Cardio' ? (
                                      <input 
                                        type="number"
                                        placeholder="Ex: 10"
                                        value={currentSetsVal}
                                        onChange={(e) => handleInputChange(realSetsKey, e.target.value)}
                                        style={styles.loadInput}
                                      />
                                    ) : (
                                      <div style={styles.setsCounter}>
                                        <button 
                                          type="button" 
                                          onClick={() => handleInputChange(realSetsKey, Math.max(1, currentSetsVal - 1))}
                                          style={styles.setsBtn}
                                        >-</button>
                                        <span style={styles.setsValue}>{currentSetsVal}</span>
                                        <button 
                                          type="button" 
                                          onClick={() => handleInputChange(realSetsKey, Math.min(defaultRepsSets.sets + 2, currentSetsVal + 1))}
                                          style={styles.setsBtn}
                                        >+</button>
                                      </div>
                                    )}
                                  </div>
                                  <div style={styles.metricField}>
                                    <label style={styles.metricLabel}>
                                      {ex.category === 'Cardio' ? 'Velocidade/Ritmo' : 'Carga Utilizada (kg)'}
                                    </label>
                                    <input 
                                      type={ex.category === 'Cardio' ? 'text' : 'number'}
                                      placeholder={ex.category === 'Cardio' ? 'Ex: 6.5 km/h' : 'Ex: 25'}
                                      value={currentLoadVal}
                                      onChange={(e) => handleInputChange(realLoadKey, e.target.value)}
                                      style={styles.loadInput}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Assistente em Tempo Real Integrado no Card */}
                            {ex.status === 'pendente' && (
                              <div style={styles.cardAssistantBox}>
                                {activeAssistantExId === ex.id ? (
                                  <div style={styles.miniAssistantPanel}>
                                    <div style={styles.miniPanelLeft}>
                                      <Volume2 size={16} className="text-gradient" />
                                      <div>
                                        <span style={styles.miniPhaseLabel}>
                                          {assistantPhase === 'execucao' ? `EXECUÇÃO (${dynamicTimeText})` : 'DESCANSO (30s)'}
                                        </span>
                                        <div style={styles.miniTimerDisplay}>
                                          {assistantTimer}s
                                        </div>
                                      </div>
                                    </div>
                                    <div style={styles.miniPanelRight}>
                                      <button onClick={togglePauseAssistant} style={styles.miniAssistBtn} title="Play/Pause">
                                        {assistantRunning ? <Pause size={12} /> : <Play size={12} />}
                                      </button>
                                      <button onClick={handlePhaseTransition} style={styles.miniAssistBtn} title="Pular Fase">
                                        <FastForward size={12} />
                                      </button>
                                      <button onClick={() => setActiveAssistantExId(null)} style={{ ...styles.miniAssistBtn, color: 'var(--status-danger)' }} title="Desativar">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => startAssistant(ex.id)} 
                                    style={styles.activateAssistBtn}
                                  >
                                    <Timer size={14} /> Ativar Assistente de Série (Voz + Timer)
                                  </button>
                                )}
                              </div>
                            )}

                            <div style={styles.exActions}>
                              {ex.status === 'pendente' ? (
                                <>
                                  <button onClick={() => {
                                    if (activeAssistantExId === ex.id) setActiveAssistantExId(null);
                                    
                                    // Para Cardio, a carga (velocidade) e o tempo real (séries) são textuais ou numéricos sem obrigatoriedade estrita de kg
                                    if (ex.category === 'Cardio') {
                                      if (!currentSetsVal || !currentLoadVal) {
                                        alert('Por favor, preencha o tempo e velocidade antes de concluir.');
                                        return;
                                      }
                                    } else {
                                      // Valida se preencheu a carga antes de completar
                                      if (!currentLoadVal || isNaN(parseFloat(currentLoadVal))) {
                                        alert('Por favor, informe a Carga Utilizada (kg) antes de concluir o exercício.');
                                        return;
                                      }
                                    }
                                    
                                    // Abre o modal de validação passando o exercício e os valores reais preenchidos
                                    setConfirmModalEx({
                                      ...ex,
                                      currentSetsVal,
                                      currentLoadVal: ex.category === 'Cardio' ? currentLoadVal : `${currentLoadVal} kg`
                                    });
                                    setConfirmReached100(null);
                                    setConfirmObs('');
                                  }} style={styles.btnDone}>
                                    <Check size={16} /> Concluído
                                  </button>
                                  <button onClick={() => {
                                    if (activeAssistantExId === ex.id) setActiveAssistantExId(null);
                                    handleSkipExercise(ex.id);
                                  }} style={styles.btnSkip}>
                                    <X size={16} /> Pular
                                  </button>
                                </>
                              ) : (
                                <div style={styles.statusCompletedRow}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={ex.status === 'concluido' ? styles.statusTextDone : styles.statusTextSkipped}>
                                      {ex.status === 'concluido' ? '✓ Concluído' : '✗ Pulado'}
                                    </span>
                                    {ex.status === 'concluido' && (
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Realizado: {ex.realSets} séries x {ex.realLoad}
                                      </span>
                                    )}
                                  </div>
                                  <button onClick={() => setExercises(prev => prev.map(e => e.id === ex.id ? { ...e, status: 'pendente' } : e))} style={styles.btnUndo}>
                                    Desfazer
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Se o split já estiver concluído, exibe um banner explicativo e bloqueia a finalização */}
                    {finishedSplits.includes(activeSplit) ? (
                      <div style={{ ...styles.resultCard, padding: '24px', border: '1px dashed var(--border-color)', margin: '16px 0', textAlign: 'center' }} className="glass">
                        <Lock size={32} style={{ color: '#eab308', marginBottom: '8px' }} />
                        <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#eab308' }}>Treino do Dia Já Realizado!</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Você já concluiu este treino em definitivo. Ele só será liberado para nova execução na próxima semana.</p>
                      </div>
                    ) : (
                      <div style={styles.finishContainer}>
                        <button onClick={handleFinishWorkout} disabled={processedExercises < totalExercises} style={{ ...styles.finishWorkoutBtn, ...(processedExercises === totalExercises ? styles.finishWorkoutBtnActive : {}) }}>
                          Finalizar e Enviar Treino
                        </button>
                      </div>
                    )}
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
                        <p><strong>user_id:</strong> <code style={styles.code}>{user?.id || 'u3'}</code></p>
                        <p><strong>Sexo / Idade:</strong> {formData.sexoBiologico === 'masculino' ? 'Masculino' : 'Feminino'} / {formData.idade} anos</p>
                        <p><strong>Peso / Altura:</strong> {formData.peso} kg / {formData.altura} cm</p>
                        <p><strong>Circunferências (Mandatórias):</strong> Pescoço: {formData.pescoco}cm | Peitoral: {formData.peitoral}cm | Cintura: {formData.cintura}cm | Abdômen: {formData.abdomen}cm | Quadril: {formData.quadril}cm | Coxas Dir. (Sup/Inf): {formData.coxaDirSuperior}cm / {formData.coxaDirInferior}cm | Coxas Esq. (Sup/Inf): {formData.coxaEsqSuperior}cm / {formData.coxaEsqInferior}cm | Braços (D/E): {formData.braçoDir}cm / {formData.braçoEsq}cm | Panturrilhas (D/E): {formData.panturrilhaDir}cm / {formData.panturrilhaEsq}cm</p>
                        <p><strong>Objetivo:</strong> {formData.objetivo.toUpperCase()}</p>
                        <p><strong>Rotina Relatada:</strong> {formData.descricaoRotina || 'Não informada'}</p>
                        <p><strong>Logística e Nutrição:</strong> Tempo: {formData.tempoSessao}min | Sono: {formData.horasSono}h (Nota: {formData.qualidadeSono}/10) | Equipamentos: {formData.equipamentos} | Atividade: {formData.nivelAtividade} | Hidratação: {formData.hidratacaoAtual}L | Suplementos: {formData.suplementos} | Restrições Alim.: {formData.restriçõesAlimentares} | Lesões: {formData.lesoes}</p>
                        <p><strong>Triagem PAR-Q:</strong> {formData.parqCardiaco === 'sim' ? '⚠️ HISTÓRICO CARDÍACO' : '✅ APTO'}</p>
                        <p><strong>Fotos de Evolução:</strong> Frente: {formData.fotoFrente} | Costas: {formData.fotoCostas} | Perfil: {formData.fotoPerfil}</p>
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
                          <div style={{ ...styles.formRow, marginTop: '16px' }}>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Sexo Biológico *</label>
                              <select 
                                value={formData.sexoBiologico} 
                                onChange={(e) => handleInputChange('sexoBiologico', e.target.value)} 
                                style={styles.selectField}
                                required
                              >
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                              </select>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Idade *</label>
                              <input 
                                type="number" 
                                placeholder="Ex: 24" 
                                value={formData.idade} 
                                onChange={(e) => handleInputChange('idade', e.target.value)} 
                                style={styles.inputField} 
                                required
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
                              Quanto maiores forem os detalhes sobre a sua rotina (horários de sono, se trabalha sentado ou em pé, nível de atividade diária, restrições de tempo), mais preciso e bem elaborado será o seu plano de treino e dieta.
                            </div>
                            <label style={styles.formLabel}>Descreva a sua Rotina Diária</label>
                            <textarea
                              placeholder="Ex: Trabalho das 8h às 18h sentado, durmo 7h por noite, tenho 1h livre para treinar..."
                              value={formData.descricaoRotina}
                              onChange={(e) => handleInputChange('descricaoRotina', e.target.value)}
                              style={{
                                ...styles.inputField,
                                minHeight: '80px',
                                resize: 'vertical',
                                width: '100%',
                                padding: '10px',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                              }}
                            />
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
                              <label style={styles.formLabel}>Pescoço (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.pescoco} onChange={(e) => handleInputChange('pescoco', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Peitoral (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.peitoral} onChange={(e) => handleInputChange('peitoral', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Cintura (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.cintura} onChange={(e) => handleInputChange('cintura', e.target.value)} style={styles.inputField} required />
                              <span style={styles.fieldSupportText}>Meça a parte mais estreita do tronco, geralmente 2 a 3 dedos acima do umbigo.</span>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Abdômen (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.abdomen} onChange={(e) => handleInputChange('abdomen', e.target.value)} style={styles.inputField} required />
                              <span style={styles.fieldSupportText}>Meça na região de maior volume, exatamente sobre a linha do umbigo.</span>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Quadril (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.quadril} onChange={(e) => handleInputChange('quadril', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Braço Esq. (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.braçoEsq} onChange={(e) => handleInputChange('braçoEsq', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Braço Dir. (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.braçoDir} onChange={(e) => handleInputChange('braçoDir', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Coxa Esq. Superior (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.coxaEsqSuperior} onChange={(e) => handleInputChange('coxaEsqSuperior', e.target.value)} style={styles.inputField} required />
                              <span style={styles.fieldSupportText}>Meça a região 4 dedos abaixo da virilha.</span>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Coxa Esq. Inferior (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.coxaEsqInferior} onChange={(e) => handleInputChange('coxaEsqInferior', e.target.value)} style={styles.inputField} required />
                              <span style={styles.fieldSupportText}>Meça a região 4 dedos acima do joelho.</span>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Coxa Dir. Superior (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.coxaDirSuperior} onChange={(e) => handleInputChange('coxaDirSuperior', e.target.value)} style={styles.inputField} required />
                              <span style={styles.fieldSupportText}>Meça a região 4 dedos abaixo da virilha.</span>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Coxa Dir. Inferior (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.coxaDirInferior} onChange={(e) => handleInputChange('coxaDirInferior', e.target.value)} style={styles.inputField} required />
                              <span style={styles.fieldSupportText}>Meça a região 4 dedos acima do joelho.</span>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Panturrilha Esq. (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.panturrilhaEsq} onChange={(e) => handleInputChange('panturrilhaEsq', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Panturrilha Dir. (cm) *</label>
                              <input type="number" placeholder="cm" value={formData.panturrilhaDir} onChange={(e) => handleInputChange('panturrilhaDir', e.target.value)} style={styles.inputField} required />
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
                              <label style={styles.formLabel}>Qualidade do Sono (0 a 10) *</label>
                              <input type="number" min="0" max="10" placeholder="0-10" value={formData.qualidadeSono} onChange={(e) => handleInputChange('qualidadeSono', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Refeições ao Dia</label>
                              <input type="number" placeholder="Refeições" value={formData.refeicoesDiarias} onChange={(e) => handleInputChange('refeicoesDiarias', e.target.value)} style={styles.inputField} />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Tempo por Sessão (min) *</label>
                              <input type="number" placeholder="Ex: 60" value={formData.tempoSessao} onChange={(e) => handleInputChange('tempoSessao', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Equipamentos Disponíveis *</label>
                              <select value={formData.equipamentos} onChange={(e) => handleInputChange('equipamentos', e.target.value)} style={styles.selectField} required>
                                <option value="completa">Academia Completa</option>
                                <option value="basica">Academia Básica / Condomínio</option>
                                <option value="calistenia">Halteres / Peso Corporal</option>
                              </select>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Nível de Atividade (Trabalho) *</label>
                              <select value={formData.nivelAtividade} onChange={(e) => handleInputChange('nivelAtividade', e.target.value)} style={styles.selectField} required>
                                <option value="sentado">Sentado a maior parte do tempo</option>
                                <option value="em_pe">Em pé a maior parte do tempo</option>
                                <option value="pesado">Trabalho braçal / Ativo</option>
                              </select>
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Hidratação Atual (Liters/dia) *</label>
                              <input type="number" step="0.1" placeholder="Ex: 2.5" value={formData.hidratacaoAtual} onChange={(e) => handleInputChange('hidratacaoAtual', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Uso de Suplementos *</label>
                              <input type="text" placeholder="Ex: Creatina, Whey..." value={formData.suplementos} onChange={(e) => handleInputChange('suplementos', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Restrições Alimentares *</label>
                              <input type="text" placeholder="Ex: Glúten, Lactose ou Nenhuma" value={formData.restriçõesAlimentares} onChange={(e) => handleInputChange('restriçõesAlimentares', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Preferências Alimentares *</label>
                              <input type="text" placeholder="Ex: Frango, Ovos, Vegetais..." value={formData.preferenciasAlimentares} onChange={(e) => handleInputChange('preferenciasAlimentares', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Lesões ou Limitações *</label>
                              <input type="text" placeholder="Ex: Joelho esquerdo, coluna ou Nenhuma" value={formData.lesoes} onChange={(e) => handleInputChange('lesoes', e.target.value)} style={styles.inputField} required />
                            </div>
                            <div style={styles.inputGroup}>
                              <label style={styles.formLabel}>Preferências de Exercício *</label>
                              <input type="text" placeholder="Ex: Halteres, máquinas ou Nenhuma" value={formData.preferencias} onChange={(e) => handleInputChange('preferencias', e.target.value)} style={styles.inputField} required />
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

                    {/* Acordeão 8: Registro Fotográfico de Evolução */}
                    <div style={{ ...styles.accordionItem, border: '1px solid var(--primary)' }} className="glass">
                      <div style={styles.accordionHeader} onClick={() => toggleAccordion('fotos')}>
                        <h4 style={{ ...styles.accordionTitle, color: 'var(--primary)' }}>8. Registro Fotográfico (Fotos de Evolução) *</h4>
                        {activeAccordion === 'fotos' ? <ChevronUp size={18} style={{ color: 'var(--primary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--primary)' }} />}
                      </div>

                      {activeAccordion === 'fotos' && (
                        <div style={styles.accordionContent}>
                          <p style={{ ...styles.parqDisclaimer, color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '12px' }}>
                            📸 INSTRUÇÕES DE UX: Para garantir o melhor acompanhamento da sua progressão física, tire as fotos de corpo inteiro sob boa iluminação e, preferencialmente, utilizando trajes de banho (sunga/biquíni).
                          </p>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginTop: '16px'
                          }}>
                            {/* Foto Frente */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '16px',
                              border: '1px dashed var(--border-color)',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-tertiary)'
                            }}>
                              <img 
                                src={formData.sexoBiologico === 'feminino' ? SILHOUETTES.feminino.frente : SILHOUETTES.masculino.frente} 
                                alt="Silhueta Frente" 
                                style={{ width: '80px', height: '140px', objectFit: 'contain', marginBottom: '8px', borderRadius: '4px' }} 
                              />
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Frente (Posição ereta) *</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        fotoFrente: file.name,
                                        fotoFrenteBase64: reader.result 
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                required
                              />
                              {formData.fotoFrente && <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginTop: '6px' }}>✓ {formData.fotoFrente}</span>}
                            </div>

                            {/* Foto Costas */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '16px',
                              border: '1px dashed var(--border-color)',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-tertiary)'
                            }}>
                              <img 
                                src={formData.sexoBiologico === 'feminino' ? SILHOUETTES.feminino.costas : SILHOUETTES.masculino.costas} 
                                alt="Silhueta Costas" 
                                style={{ width: '80px', height: '140px', objectFit: 'contain', marginBottom: '8px', borderRadius: '4px' }} 
                              />
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Costas (De costas) *</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        fotoCostas: file.name,
                                        fotoCostasBase64: reader.result 
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                required
                              />
                              {formData.fotoCostas && <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginTop: '6px' }}>✓ {formData.fotoCostas}</span>}
                            </div>

                            {/* Foto Perfil */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              padding: '16px',
                              border: '1px dashed var(--border-color)',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-tertiary)'
                            }}>
                              <img 
                                src={formData.sexoBiologico === 'feminino' ? SILHOUETTES.feminino.perfil : SILHOUETTES.masculino.perfil} 
                                alt="Silhueta Perfil" 
                                style={{ width: '80px', height: '140px', objectFit: 'contain', marginBottom: '8px', borderRadius: '4px' }} 
                              />
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px' }}>Perfil (Braços na altura do peito) *</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFormData(prev => ({ 
                                        ...prev, 
                                        fotoPerfil: file.name,
                                        fotoPerfilBase64: reader.result 
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                required
                              />
                              {formData.fotoPerfil && <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginTop: '6px' }}>✓ {formData.fotoPerfil}</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botão de Gravação de Medidas com Bloqueio de Cooldown */}
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(() => {
                        const isVip = workoutsByStudent && workoutsByStudent[user?.id]?.isVip;
                        const cooldownDays = isVip ? 30 : 90;
                        
                        let isCoolingDown = false;
                        let daysLeft = 0;
                        
                        const hasWorkout = workoutsByStudent && workoutsByStudent[user?.id];
                        const hasPending = pendingEvaluations && pendingEvaluations.some(ev => ev.userId === user?.id);

                        if (lastEvalDate && (hasWorkout || hasPending)) {
                          const timeDiff = new Date().getTime() - lastEvalDate.getTime();
                          const diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
                          daysLeft = cooldownDays - diffDays;
                          isCoolingDown = daysLeft > 0;
                        }

                        return (
                          <>
                            <button 
                              type="submit" 
                              disabled={isCoolingDown || isSubmitting}
                              style={{
                                ...styles.submitMedidasBtn,
                                ...((isCoolingDown || isSubmitting) ? { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)', cursor: 'not-allowed', borderColor: 'var(--border-color)' } : {})
                              }}
                              className={(isCoolingDown || isSubmitting) ? "btn-disabled" : "btn-primary"}
                            >
                              {isSubmitting 
                                ? "Comprimindo Fotos & Enviando..." 
                                : isCoolingDown 
                                  ? `Sua próxima avaliação estará liberada em ${daysLeft} dias` 
                                  : "Enviar Medidas com tenant_id"
                              }
                            </button>
                            {isCoolingDown && (
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '0.8rem', marginTop: '4px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Quer atualizar mais rápido?</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setVirtualRoute('/planos');
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                  }}
                                >
                                  Seja VIP
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                  </form>
                )}
              </div>
            )}

            {/* 3. ABA DE EVOLUÇÃO (HISTÓRICO DO ALUNO) */}
            {activeTab === 'evolucao' && (() => {
              // Filtra avaliações aprovadas deste aluno, ordenadas por data
              const myEvals = (approvedEvaluations || [])
                .filter(ev => ev.userId === user?.id)
                .sort((a, b) => new Date(a._approvedAt || a.date || 0) - new Date(b._approvedAt || b.date || 0));

              const fmtDate = (iso) => iso
                ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : '—';

              // Dados de peso para gráfico
              const weightData = myEvals.map(ev => ({
                label: fmtDate(ev._approvedAt || ev.date),
                value: parseFloat((ev.formData?.peso || ev.peso || '').toString().replace(',', '.')) || null
              })).filter(d => d.value !== null);

              // Medidas para tabela comparativa
              const measureKeys = [
                { key: 'peso', label: 'Peso (kg)' },
                { key: 'cintura', label: 'Cintura (cm)' },
                { key: 'quadril', label: 'Quadril (cm)' },
                { key: 'abdomen', label: 'Abdômen (cm)' },
                { key: 'braçoEsq', label: 'Braço Esq. (cm)' },
                { key: 'coxaEsqSuperior', label: 'Coxa Esq. (cm)' },
                { key: 'peitoral', label: 'Peitoral (cm)' }
              ];

              const getVal = (ev, key) => {
                const raw = ev.formData?.[key] ?? ev[key] ?? null;
                return raw !== '' && raw !== null && raw !== undefined ? parseFloat(String(raw).replace(',', '.')) : null;
              };

              const firstEval = myEvals[0];
              const lastEval = myEvals[myEvals.length - 1];

              // Treinos aprovados para acervo
              const myTreinos = myEvals.filter(ev => ev.vipHtml || workoutsByStudent?.[user?.id]?.vipHtml);

              // SVG Graph helper
              const GraphLine = ({ data, color = 'var(--primary)', height = 100, label }) => {
                if (data.length < 2) return (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <BarChart2 size={28} style={{ opacity: 0.2, display: 'block', margin: '0 auto 8px' }} />
                    Mínimo 2 avaliações necessárias para o gráfico
                  </div>
                );
                const vals = data.map(d => d.value);
                const min = Math.min(...vals) * 0.97;
                const max = Math.max(...vals) * 1.03;
                const W = 320; const H = height;
                const px = (i) => (i / (data.length - 1)) * (W - 32) + 16;
                const py = (v) => H - ((v - min) / (max - min)) * (H - 24) - 12;
                const pts = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ');
                return (
                  <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: `${H}px`, overflow: 'visible' }}>
                    <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={pts} />
                    {data.map((d, i) => (
                      <g key={i}>
                        <circle cx={px(i)} cy={py(d.value)} r={4} fill={color} />
                        <text x={px(i)} y={py(d.value) - 8} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">{d.value}</text>
                        <text x={px(i)} y={H} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.label}</text>
                      </g>
                    ))}
                  </svg>
                );
              };

              return (
                <div style={{ width: '100%' }} className="animate-fade-in">

                  {myEvals.length === 0 ? (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', padding: '48px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center', gap: '12px'
                    }}>
                      <TrendingUp size={48} style={{ opacity: 0.15 }} />
                      <p style={{ fontWeight: '700', fontSize: '1rem' }}>Nenhuma avaliação aprovada ainda</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
                        Preencha sua avaliação física na aba <strong>Medidas</strong> para que o professor aprove e o histórico comece a ser registrado aqui.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* ── SEÇÃO 1: GALERIA FOTOGRÁFICA ──────────────────────────── */}
                      <div style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <Camera size={18} style={{ color: 'var(--primary)' }} />
                          <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Linha do Tempo Fotográfica</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{myEvals.length} avaliação(ões) registrada(s)</span>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                          {myEvals.map((ev, idx) => {
                            const hasFotoFrente = ev.fotoFrenteBase64 || ev.formData?.fotoFrenteBase64;
                            const hasFotoCostas = ev.fotoCostasBase64 || ev.formData?.fotoCostasBase64;
                            const hasFotoPerfil = ev.fotoPerfilBase64 || ev.formData?.fotoPerfilBase64;
                            const frenteUrl = hasFotoFrente || null;
                            const costasUrl = hasFotoCostas || null;
                            const perfilUrl = hasFotoPerfil || null;
                            const anyPhoto = frenteUrl || costasUrl || perfilUrl;
                            const evDate = fmtDate(ev._approvedAt || ev.date);
                            const evObj = ev.formData?.objetivo || ev.objetivo || '—';
                            const evPeso = ev.formData?.peso || ev.peso || '?';
                            const isLatest = idx === myEvals.length - 1;

                            return (
                              <div key={ev.id} style={{
                                minWidth: '220px',
                                border: `1px solid ${isLatest ? 'var(--primary)' : 'var(--border-color)'}`,
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                flexShrink: 0,
                                backgroundColor: 'var(--bg-tertiary)'
                              }}>
                                <div style={{
                                  padding: '8px 12px',
                                  backgroundColor: isLatest ? 'rgba(139,92,246,0.1)' : 'var(--bg-secondary)',
                                  borderBottom: '1px solid var(--border-color)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                  <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isLatest ? 'var(--primary)' : 'var(--text-primary)' }}>
                                      {isLatest ? '✨ Mais Recente' : `Avaliação ${idx + 1}`}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{evDate}</div>
                                  </div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                    <div>{evObj}</div>
                                    <div style={{ fontWeight: '700' }}>{evPeso}kg</div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', padding: '8px' }}>
                                  {anyPhoto ? (
                                    [['Frente', frenteUrl], ['Costas', costasUrl], ['Perfil', perfilUrl]].map(([label, url]) => (
                                      <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '3px' }}>{label}</div>
                                        {url ? (
                                          <img
                                            src={url}
                                            alt={label}
                                            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)', cursor: 'zoom-in' }}
                                            onClick={() => setLightboxPhoto({ url, label: `${evDate} — ${label}` })}
                                          />
                                        ) : (
                                          <div style={{
                                            width: '100%', height: '80px', borderRadius: '4px',
                                            border: '1px dashed var(--border-color)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--text-muted)', opacity: 0.4
                                          }}>
                                            <ImageOff size={18} />
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div style={{
                                      flex: 1, padding: '12px 8px',
                                      display: 'flex', flexDirection: 'column',
                                      alignItems: 'center', justifyContent: 'center',
                                      gap: '6px', textAlign: 'center'
                                    }}>
                                      <ImageOff size={22} style={{ opacity: 0.2 }} />
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                        Fotos não enviadas<br/>nesta avaliação
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {(ev.laudoFileBase64 || ev.formData?.laudoFileBase64) && (
                                  <div style={{ padding: '4px 8px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                    <a
                                      href={ev.laudoFileBase64 || ev.formData?.laudoFileBase64}
                                      download={ev.laudoFile || ev.formData?.laudoFile || 'laudo.pdf'}
                                      style={{ fontSize: '0.65rem', color: 'var(--primary)', textDecoration: 'underline' }}
                                    >Baixar Laudo</a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── SEÇÃO 2: GRÁFICO DE PESO + TABELA COMPARATIVA ─────────── */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '20px',
                        marginBottom: '20px'
                      }}>
                        {/* Gráfico de Peso */}
                        <div style={{
                          padding: '20px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Scale size={16} style={{ color: 'var(--primary)' }} />
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Evolução do Peso (kg)</h4>
                          </div>
                          <GraphLine data={weightData} />
                        </div>

                        {/* Tabela Comparativa de Medidas */}
                        <div style={{
                          padding: '20px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            <Ruler size={16} style={{ color: 'var(--primary)' }} />
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Medidas Comparativas</h4>
                            {myEvals.length >= 2 && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                {fmtDate(firstEval._approvedAt)} → {fmtDate(lastEval._approvedAt)}
                              </span>
                            )}
                          </div>
                          {myEvals.length < 2 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Mínimo 2 avaliações para comparar medidas.</p>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                  <th style={{ padding: '6px 0', textAlign: 'left', fontWeight: '600' }}>Medida</th>
                                  <th style={{ textAlign: 'center', fontWeight: '600' }}>Início</th>
                                  <th style={{ textAlign: 'center', fontWeight: '600' }}>Atual</th>
                                  <th style={{ textAlign: 'right', fontWeight: '600' }}>Δ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {measureKeys.map(({ key, label }) => {
                                  const v1 = getVal(firstEval, key);
                                  const v2 = getVal(lastEval, key);
                                  if (v1 === null && v2 === null) return null;
                                  const diff = (v1 !== null && v2 !== null) ? (v2 - v1).toFixed(1) : null;
                                  const isGood = key === 'peso' ? diff <= 0 : (key.includes('cintura') || key.includes('abdomen') ? diff <= 0 : diff >= 0);
                                  return (
                                    <tr key={key} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                                      <td style={{ padding: '7px 0', color: 'var(--text-secondary)' }}>{label}</td>
                                      <td style={{ textAlign: 'center' }}>{v1 ?? '—'}</td>
                                      <td style={{ textAlign: 'center', fontWeight: '700' }}>{v2 ?? '—'}</td>
                                      <td style={{
                                        textAlign: 'right', fontWeight: '700',
                                        color: diff === null ? 'var(--text-muted)' : (parseFloat(diff) === 0 ? 'var(--text-muted)' : (isGood ? 'var(--status-success)' : 'var(--status-danger)'))
                                      }}>
                                        {diff !== null ? (parseFloat(diff) > 0 ? `+${diff}` : diff) : '—'}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                      {/* ── SEÇÃO 3: ACERVO DE TREINOS APROVADOS ─────────────────── */}
                      <div style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <Dumbbell size={16} style={{ color: 'var(--primary)' }} />
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Histórico de Programas de Treino</h4>
                        </div>

                        {(() => {
                          const treinoAtual = workoutsByStudent?.[user?.id];
                          const hasAtual = treinoAtual?.vipHtml;
                          if (!hasAtual && myEvals.length === 0) return (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>Nenhum programa de treino no histórico.</p>
                          );

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {/* Treino ativo atual */}
                              {hasAtual && (
                                <div style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  flexWrap: 'wrap', gap: '10px',
                                  padding: '12px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid rgba(139,92,246,0.4)',
                                  backgroundColor: 'rgba(139,92,246,0.06)'
                                }}>
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                                      ✨ Programa Atual Ativo
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      Objetivo: {lastEval ? (lastEval.formData?.objetivo || lastEval.objetivo || '—') : '—'}
                                      {lastEval?._approvedAt ? ` · Aprovado em ${fmtDate(lastEval._approvedAt)}` : ''}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const nome = `Programa Atual - ${user?.name || 'Aluno'}`;
                                      openHtmlAsPdf(treinoAtual.vipHtml, nome);
                                    }}
                                    style={{
                                      padding: '7px 14px', fontSize: '0.78rem', fontWeight: '700',
                                      backgroundColor: 'var(--primary)', color: '#fff',
                                      border: 'none', borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                  >
                                    <Download size={13} /> Salvar como PDF
                                  </button>
                                </div>
                              )}

                              {/* Avaliações aprovadas anteriores (só as que não são o atual) */}
                              {myEvals.slice(0, -1).reverse().map((ev, i) => (
                                <div key={ev.id} style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  flexWrap: 'wrap', gap: '10px',
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-tertiary)'
                                }}>
                                  <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                                      Programa #{myEvals.length - 1 - i} — {ev.formData?.objetivo || ev.objetivo || 'Hipertrofia'}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      Aprovado em {fmtDate(ev._approvedAt || ev.date)} · Peso: {ev.formData?.peso || ev.peso || '?'}kg
                                    </div>
                                  </div>
                                  {(ev.vipHtml || ev.formData?.vipHtml) ? (
                                    <button
                                      onClick={() => {
                                        const vHtml = ev.vipHtml || ev.formData?.vipHtml;
                                        const nome = `Programa ${myEvals.length - 1 - i} - ${user?.name || 'Aluno'}`;
                                        openHtmlAsPdf(vHtml, nome);
                                      }}
                                      style={{
                                        padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700',
                                        backgroundColor: 'transparent', color: 'var(--primary)',
                                        border: '1px solid rgba(139,92,246,0.4)',
                                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '5px'
                                      }}
                                    >
                                      <Download size={12} /> Salvar como PDF
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Treino Free (sem HTML)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      {/* ── SEÇÃO 4: METAS MENSAIS INTELIGENTES E AUDITORIA DE PROGRESSO ─────────── */}
                      <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                          <Award size={16} style={{ color: '#eab308' }} />
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Metas e Frequência Mensal</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Meta de Treinos do Mês</span>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>12 Treinos</div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Média ideal de 3 por semana</span>
                          </div>
                          
                          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Frequência Registrada</span>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--status-success)' }}>
                              {finishedSplits.length} treino{finishedSplits.length !== 1 ? 's' : ''}
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Ciclo atual atualizado em tempo real</span>
                          </div>

                          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Aproveitamento de Série</span>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#eab308' }}>
                              {finishedSplits.length > 0 ? '100%' : '0%'}
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Percentual de meta 100% atingida</span>
                          </div>
                        </div>

                        {/* Tabela de Progresso de Peso e Repetições Reais (Exercícios Concluídos) */}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          <h5 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-primary)' }}>📈 Histórico de Cargas & Esforço Registrado</h5>
                          {exercises.filter(ex => ex.status === 'concluido').length === 0 ? (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>Nenhum exercício concluído registrado para este ciclo de treinos ainda.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {exercises.filter(ex => ex.status === 'concluido').map(ex => (
                                <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                                  <div>
                                    <strong style={{ color: 'var(--text-primary)' }}>{ex.name}</strong>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Categoria: {ex.category} · Split {ex.split}</span>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{ex.realLoad}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>{ex.realSets} séries executadas</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })()}

            {/* 4. ABA FINANCEIRO */}
            {activeTab === 'financeiro' && (
              <div style={{ width: '100%', textAlign: 'left' }} className="animate-fade-in">
                <div style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    💳 Detalhes da Assinatura
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Data de Cadastro</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{new Date(dataCadastro).toLocaleDateString('pt-BR')}</strong>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Plano Ativo</span>
                      <strong style={{ fontSize: '1.1rem', color: isVip ? '#eab308' : 'var(--text-primary)' }}>
                        {isVip ? '👑 Plano VIP' : 'Plano Simples'}
                      </strong>
                    </div>
                    {isVip && (
                      <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid #eab308' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ciclo VIP</span>
                        <strong style={{ fontSize: '1.1rem', color: '#eab308' }}>Restam {vipDaysLeft} dias</strong>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>Histórico de Faturas</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifycontent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <span>Mensalidade Junho/2026</span>
                        <span style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>PAGO (R$ {isVip ? '149,90' : '79,90'})</span>
                      </div>
                      <div style={{ display: 'flex', justifycontent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <span>Mensalidade Maio/2026</span>
                        <span style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>PAGO (R$ 79,90)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Outras Abas */}
            {activeTab !== 'treinos' && activeTab !== 'medidas' && activeTab !== 'evolucao' && activeTab !== 'financeiro' && (
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

      {/* Modal de Reportar Bug */}
      {reportModalEx && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '480px' }} className="glass animate-fade-in">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🚨 Reportar Erro / Ajuste Técnico</h3>
              <button onClick={() => setReportModalEx(null)} style={styles.closeModalBtn}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Relate incoerências de grupo muscular, carga ou postura. O report será salvo no sistema para auditoria do administrador.
            </p>
            <textarea
              style={{ ...styles.dualInput, width: '100%', minHeight: '120px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem', padding: '12px' }}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => {
                navigator.clipboard.writeText(reportText);
                alert('Conteúdo copiado!');
              }} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                📋 Copiar
              </button>
              <button onClick={async () => {
                await reportBug({
                  exerciseId: reportModalEx.id,
                  exerciseName: reportModalEx.name,
                  split: activeSplit,
                  details: reportText
                });
                alert('Bug reportado com sucesso no sistema!');
                setReportModalEx(null);
              }} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                Enviar Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Repetições */}
      {confirmModalEx && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '440px' }} className="glass animate-fade-in">
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>🎯 Validação de Repetições</h3>
              <button onClick={() => setConfirmModalEx(null)} style={styles.closeModalBtn}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '8px 0 16px 0', fontWeight: '500' }}>
              Você conseguiu realizar todas as séries e repetições prescritas para este exercício com qualidade técnica?
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setConfirmReached100(true)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (confirmReached100 === true ? 'var(--status-success)' : 'var(--border-color)'),
                  backgroundColor: confirmReached100 === true ? 'rgba(16,185,129,0.1)' : 'transparent',
                  color: confirmReached100 === true ? 'var(--status-success)' : 'var(--text-primary)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ✓ Sim, atingi 100%
              </button>
              <button
                onClick={() => setConfirmReached100(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid ' + (confirmReached100 === false ? 'var(--status-danger)' : 'var(--border-color)'),
                  backgroundColor: confirmReached100 === false ? 'rgba(239,68,68,0.1)' : 'transparent',
                  color: confirmReached100 === false ? 'var(--status-danger)' : 'var(--text-primary)',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ⚠️ Não, foi sub-máximo
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Relato de Dificuldade / Observações (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: Falhei na última série na rep 8"
                value={confirmObs}
                onChange={(e) => setConfirmObs(e.target.value)}
                style={{ ...styles.dualInput, width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConfirmModalEx(null)} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmReached100 === null) {
                    alert('Por favor, selecione uma das opções de desempenho.');
                    return;
                  }
                  // Salva os dados estendidos de execução no exercício
                  const updated = exercises.map(ex => 
                    ex.id === confirmModalEx.id ? { 
                      ...ex, 
                      status: 'concluido', 
                      realSets: confirmModalEx.currentSetsVal, 
                      realLoad: confirmModalEx.currentLoadVal,
                      metaAtingida100: confirmReached100,
                      feedbackDificuldade: confirmObs.trim()
                    } : ex
                  );
                  setExercises(updated);
                  updateStudentExercises(updated);
                  setConfirmModalEx(null);
                  playBeep(900, 0.1);
                  speakText(confirmReached100 ? 'Espetacular! Meta batida com sucesso.' : 'Muito bom relato, o importante é a constância!');
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                Confirmar e Concluir
              </button>
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
    paddingBottom: '160px',
  },
  splitSelector: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
    padding: '4px 0 12px 0',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '16px',
  },
  splitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  splitBtnActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    borderColor: 'var(--primary)',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
  },
  splitCountBadge: {
    fontSize: '0.65rem',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '700',
  },
  splitCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
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
  cardAssistantBox: {
    marginTop: '12px',
    marginBottom: '8px',
    paddingTop: '10px',
    borderTop: '1px dashed var(--border-color)',
  },
  activateAssistBtn: {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    color: 'var(--primary)',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  miniAssistantPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    animation: 'fadeIn 0.2s ease-out',
  },
  miniPanelLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  miniPhaseLabel: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    display: 'block',
  },
  miniTimerDisplay: {
    fontSize: '1.2rem',
    fontWeight: '800',
    fontFamily: 'monospace',
    color: 'var(--primary)',
  },
  miniPanelRight: {
    display: 'flex',
    gap: '6px',
  },
  miniAssistBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: 0,
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
  metricsFormRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '12px',
    width: '100%',
    boxSizing: 'border-box'
  },
  metricField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  setsCounter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  setsBtn: {
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  setsValue: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center'
  },
  loadInput: {
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border-color)',
    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
    padding: '12px 16px',
    zIndex: 999999,
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
  },
  fieldSupportText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
    lineHeight: '1.3',
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
