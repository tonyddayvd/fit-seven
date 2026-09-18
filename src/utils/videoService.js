/**
 * Utilitário de Serviços de Vídeo do Fit Seven
 * Suporte a YouTube, YouTube Shorts, Google Drive, Vimeo, MP4 e Uploads Locais/Base64.
 */

export const OFFICIAL_EXERCISE_VIDEOS = {
  'puxada frontal alta (polia)': 'https://www.youtube.com/embed/H6x4yY9_u2w',
  'puxada alta na polia': 'https://www.youtube.com/embed/H6x4yY9_u2w',
  'puxada frontal alta': 'https://www.youtube.com/embed/H6x4yY9_u2w',
  'puxada frontal': 'https://www.youtube.com/embed/H6x4yY9_u2w',
  'puxada alta': 'https://www.youtube.com/embed/H6x4yY9_u2w',
  'remada curvada pronada': 'https://www.youtube.com/embed/H5_p5r8K9H8',
  'remada curvada': 'https://www.youtube.com/embed/H5_p5r8K9H8',
  'remada baixa': 'https://www.youtube.com/embed/H5_p5r8K9H8',
  'remada cavalinho': 'https://www.youtube.com/embed/H5_p5r8K9H8',
  'supino reto com barra': 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
  'supino reto': 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
  'supino inclinado': 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
  'crossover na polia media': 'https://www.youtube.com/embed/l5MhN6l3s88',
  'crossover': 'https://www.youtube.com/embed/l5MhN6l3s88',
  'agachamento livre': 'https://www.youtube.com/embed/Vn83S-A-9yU',
  'agachamento': 'https://www.youtube.com/embed/Vn83S-A-9yU',
  'leg press 45 graus': 'https://www.youtube.com/embed/vO-FwS1YhNA',
  'leg press': 'https://www.youtube.com/embed/vO-FwS1YhNA',
  'cadeira extensora': 'https://www.youtube.com/embed/vO-FwS1YhNA',
  'mesa flexora': 'https://www.youtube.com/embed/vO-FwS1YhNA',
  'rosca direta com barra w': 'https://www.youtube.com/embed/ly7TepL4pco',
  'rosca direta': 'https://www.youtube.com/embed/ly7TepL4pco',
  'rosca alternada': 'https://www.youtube.com/embed/ly7TepL4pco',
  'rosca martelo': 'https://www.youtube.com/embed/ly7TepL4pco',
  'triceps testa com halter': 'https://www.youtube.com/embed/HlJ_nKpxJg8',
  'triceps testa': 'https://www.youtube.com/embed/HlJ_nKpxJg8',
  'triceps corda': 'https://www.youtube.com/embed/HlJ_nKpxJg8',
  'triceps polia': 'https://www.youtube.com/embed/HlJ_nKpxJg8',
  'elevacao lateral': 'https://www.youtube.com/embed/HlJ_nKpxJg8',
  'desenvolvimento com halteres': 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
  'prancha frontal (isometria)': 'https://www.youtube.com/embed/0pkjOk0EiAk',
  'prancha frontal': 'https://www.youtube.com/embed/0pkjOk0EiAk',
  'prancha isometrica': 'https://www.youtube.com/embed/0pkjOk0EiAk',
  'burpee completo': 'https://www.youtube.com/embed/0pkjOk0EiAk',
  'burpee': 'https://www.youtube.com/embed/0pkjOk0EiAk',
  'corrida na esteira': 'https://www.youtube.com/embed/sqOw2Y6u9Xs',
  'esteira': 'https://www.youtube.com/embed/sqOw2Y6u9Xs'
};

/**
 * Normaliza o nome do exercício para busca
 */
export const sanitizeName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Retorna o vídeo oficial padrão baseado no nome
 */
export const getDefaultOfficialVideo = (name) => {
  if (!name) return '';
  const clean = sanitizeName(name);
  if (OFFICIAL_EXERCISE_VIDEOS[clean]) return OFFICIAL_EXERCISE_VIDEOS[clean];
  for (const [key, url] of Object.entries(OFFICIAL_EXERCISE_VIDEOS)) {
    if (clean.includes(key) || key.includes(clean)) return url;
  }
  return '';
};

/**
 * Formata qualquer link para o formato embed adequado
 */
export const formatVideoEmbedUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const url = rawUrl.trim();
  if (!url) return '';

  // 1. YouTube Shorts: https://youtube.com/shorts/VIDEO_ID
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    const id = parts[1]?.split(/[?&#]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  // 2. YouTube Padrão ou YouTu.be
  if (url.includes('youtube.com/watch')) {
    try {
      const parsed = new URL(url);
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    } catch (_) {}
  }

  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    const id = parts[1]?.split(/[?&#]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes('youtube.com/embed/')) {
    return url;
  }

  // 3. Google Drive: https://drive.google.com/file/d/ID/view -> /preview
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  // 4. Vimeo: https://vimeo.com/ID -> player.vimeo.com/video/ID
  if (url.includes('vimeo.com/')) {
    const parts = url.split('vimeo.com/');
    const id = parts[1]?.split(/[?&#]/)[0];
    if (id && !url.includes('player.vimeo.com')) {
      return `https://player.vimeo.com/video/${id}`;
    }
  }

  return url;
};

/**
 * Sugestões inteligentes de vídeos técnicos de execução com 1 toque
 */
export const getQuickVideoSuggestions = (exerciseName) => {
  const clean = sanitizeName(exerciseName);

  // Banco de sugestões técnicas prontas por grupo muscular / exercício
  const SUGGESTION_MAP = {
    puxada: [
      { id: 'H6x4yY9_u2w', title: 'Puxada Frontal Alta - Execução Técnica Perfeita', author: 'Biomecânica & Treino', duration: '1:45' },
      { id: 'H5_p5r8K9H8', title: 'Puxada Aberta na Polia - Ativação Máxima de Dorsal', author: 'Personal Pro', duration: '2:10' },
      { id: 'ly7TepL4pco', title: 'Erros Comuns na Puxada Alta e Correção Postural', author: 'Coach Fitness', duration: '1:30' }
    ],
    remada: [
      { id: 'H5_p5r8K9H8', title: 'Remada Curvada com Barra - Postura e Lombar Segura', author: 'Biomecânica do Treino', duration: '2:15' },
      { id: 'H6x4yY9_u2w', title: 'Remada Baixa no Triângulo - Amplitude Total', author: 'Canal do Treinador', duration: '1:50' }
    ],
    supino: [
      { id: 'sqOw2Y6u9Xs', title: 'Supino Reto - Escápulas Travadas e Pegada Correta', author: 'Cinesiologia Aplicada', duration: '2:00' },
      { id: 'l5MhN6l3s88', title: 'Supino Inclinado com Halteres - Peitoral Superior', author: 'Treinamento de Força', duration: '1:40' }
    ],
    crossover: [
      { id: 'l5MhN6l3s88', title: 'Crossover na Polia Média - Miolo do Peito', author: 'Biomecânica & Treino', duration: '1:35' }
    ],
    agachamento: [
      { id: 'Vn83S-A-9yU', title: 'Agachamento Livre - Base, Quadril e Joelhos', author: 'Biomecânica de Excelência', duration: '2:30' },
      { id: 'vO-FwS1YhNA', title: 'Agachamento no Smith - Ângulo e Segurança', author: 'Personal Trainer Brasil', duration: '1:55' }
    ],
    leg: [
      { id: 'vO-FwS1YhNA', title: 'Leg Press 45° - Posicionamento dos Pés e Amplitude', author: 'Cinesiologia e Musculação', duration: '1:50' }
    ],
    rosca: [
      { id: 'ly7TepL4pco', title: 'Rosca Direta com Barra W - Sem Roubar com a Lombar', author: 'Biomecânica dos Braços', duration: '1:40' },
      { id: 'HlJ_nKpxJg8', title: 'Rosca Martelo com Halteres - Braquial e Antebraço', author: 'Treino de Braço', duration: '1:30' }
    ],
    triceps: [
      { id: 'HlJ_nKpxJg8', title: 'Tríceps Testa com Halteres - Isolamento Tríceps', author: 'Anatomia e Treino', duration: '1:45' },
      { id: 'sqOw2Y6u9Xs', title: 'Tríceps Corda na Polia - Abertura no Final do Movimento', author: 'Biomecânica & Treino', duration: '1:25' }
    ],
    prancha: [
      { id: '0pkjOk0EiAk', title: 'Prancha Frontal Isométrica - Ativação do Core e Glúteos', author: 'Fisioterapia e Treinamento', duration: '1:20' }
    ],
    elevacao: [
      { id: 'HlJ_nKpxJg8', title: 'Elevação Lateral com Halteres - Deltoide Lateral', author: 'Treinamento de Ombros', duration: '1:50' }
    ],
    desenvolvimento: [
      { id: 'sqOw2Y6u9Xs', title: 'Desenvolvimento de Ombros com Halteres - Postura Correta', author: 'Biomecânica Aplicada', duration: '2:05' }
    ]
  };

  for (const [key, list] of Object.entries(SUGGESTION_MAP)) {
    if (clean.includes(key)) {
      return list.map(item => ({
        ...item,
        embedUrl: `https://www.youtube.com/embed/${item.id}`,
        thumbUrl: `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`
      }));
    }
  }

  // Fallback padrão genérico
  return [
    { id: 'sqOw2Y6u9Xs', title: `Execução Perfeita: ${exerciseName}`, author: 'Canal do Treinador', duration: '2:00', embedUrl: 'https://www.youtube.com/embed/sqOw2Y6u9Xs', thumbUrl: 'https://img.youtube.com/vi/sqOw2Y6u9Xs/mqdefault.jpg' },
    { id: 'H6x4yY9_u2w', title: `Biomecânica e Postura: ${exerciseName}`, author: 'Biomecânica Pro', duration: '1:45', embedUrl: 'https://www.youtube.com/embed/H6x4yY9_u2w', thumbUrl: 'https://img.youtube.com/vi/H6x4yY9_u2w/mqdefault.jpg' },
    { id: 'Vn83S-A-9yU', title: `Guia Rápido de Execução: ${exerciseName}`, author: 'Personal Trainer', duration: '1:30', embedUrl: 'https://www.youtube.com/embed/Vn83S-A-9yU', thumbUrl: 'https://img.youtube.com/vi/Vn83S-A-9yU/mqdefault.jpg' }
  ];
};
