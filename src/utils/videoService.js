// Utilitarios de video e Catalogo Completo de Exercicios Fit Seven

export const formatVideoEmbedUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return 'https://www.youtube.com/embed/' + watchMatch[1];
  }

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return 'https://www.youtube.com/embed/' + shortMatch[1];
  }

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return 'https://www.youtube.com/embed/' + shortsMatch[1];
  }

  return trimmed;
};

export const EXERCISE_CATEGORIES = [
  'Todos',
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Abdômen / Core',
  'Cardio / Funcional'
];

export const EXERCISE_CATALOG = [
  // --- PEITO ---
  {
    id: 'cat_supino_reto',
    name: 'Supino Reto com Barra',
    category: 'Peito',
    reps: '4x10-12',
    load: '20kg cada lado',
    video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs'
  },
  {
    id: 'cat_supino_inclinado_halteres',
    name: 'Supino Inclinado com Halteres',
    category: 'Peito',
    reps: '4x10-12',
    load: '18kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/Z1K3JaoK9dM'
  },
  {
    id: 'cat_crossover_polia',
    name: 'Crossover na Polia Média',
    category: 'Peito',
    reps: '3x12-15',
    load: '15kg cada lado',
    video_oficial_url: 'https://www.youtube.com/embed/l5MhN6l3s88'
  },
  {
    id: 'cat_crucifixo_reto',
    name: 'Crucifixo Reto com Halteres',
    category: 'Peito',
    reps: '3x12',
    load: '12kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs'
  },
  {
    id: 'cat_peck_deck',
    name: 'Peck Deck (Voador Frontal)',
    category: 'Peito',
    reps: '4x12',
    load: '45kg',
    video_oficial_url: 'https://www.youtube.com/embed/l5MhN6l3s88'
  },
  {
    id: 'cat_flexao_solo',
    name: 'Flexão de Braços no Solo',
    category: 'Peito',
    reps: '3x até a falha',
    load: 'Peso Corporal',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  },

  // --- COSTAS ---
  {
    id: 'cat_puxada_alta',
    name: 'Puxada Alta na Polia (Pronada)',
    category: 'Costas',
    reps: '4x10-12',
    load: '45kg',
    video_oficial_url: 'https://www.youtube.com/embed/H6x4yY9_u2w'
  },
  {
    id: 'cat_remada_curvada',
    name: 'Remada Curvada com Barra',
    category: 'Costas',
    reps: '4x8-10',
    load: '20kg cada lado',
    video_oficial_url: 'https://www.youtube.com/embed/H5_p5r8K9H8'
  },
  {
    id: 'cat_remada_baixa_triangulo',
    name: 'Remada Baixa com Triângulo',
    category: 'Costas',
    reps: '4x12',
    load: '40kg',
    video_oficial_url: 'https://www.youtube.com/embed/H6x4yY9_u2w'
  },
  {
    id: 'cat_remada_unilateral_serrote',
    name: 'Remada Unilateral (Serrote com Halter)',
    category: 'Costas',
    reps: '3x12 cada lado',
    load: '20kg halter',
    video_oficial_url: 'https://www.youtube.com/embed/H5_p5r8K9H8'
  },
  {
    id: 'cat_pulldown_corda',
    name: 'Pull-down na Polia Alta com Corda',
    category: 'Costas',
    reps: '3x15',
    load: '25kg',
    video_oficial_url: 'https://www.youtube.com/embed/G6g1gG95wA0'
  },
  {
    id: 'cat_barra_fixa',
    name: 'Barra Fixa (Pull-up)',
    category: 'Costas',
    reps: '4x falha / 8 reps',
    load: 'Peso Corporal',
    video_oficial_url: 'https://www.youtube.com/embed/H6x4yY9_u2w'
  },

  // --- PERNAS ---
  {
    id: 'cat_agachamento_livre',
    name: 'Agachamento Livre com Barra',
    category: 'Pernas',
    reps: '4x10-12',
    load: '25kg cada lado',
    video_oficial_url: 'https://www.youtube.com/embed/Vn83S-A-9yU'
  },
  {
    id: 'cat_leg_press_45',
    name: 'Leg Press 45 Graus',
    category: 'Pernas',
    reps: '4x10-12',
    load: '160kg',
    video_oficial_url: 'https://www.youtube.com/embed/vO-FwS1YhNA'
  },
  {
    id: 'cat_cadeira_extensora',
    name: 'Cadeira Extensora',
    category: 'Pernas',
    reps: '3x15',
    load: '40kg',
    video_oficial_url: 'https://www.youtube.com/embed/U3l0rV3D70w'
  },
  {
    id: 'cat_mesa_flexora',
    name: 'Mesa Flexora (Posterior de Coxa)',
    category: 'Pernas',
    reps: '4x12',
    load: '35kg',
    video_oficial_url: 'https://www.youtube.com/embed/U3l0rV3D70w'
  },
  {
    id: 'cat_stiff_halteres',
    name: 'Stiff com Halteres',
    category: 'Pernas',
    reps: '4x10-12',
    load: '16kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/Vn83S-A-9yU'
  },
  {
    id: 'cat_elevacao_pelvica',
    name: 'Elevação Pélvica com Barra',
    category: 'Pernas',
    reps: '4x12',
    load: '30kg cada lado',
    video_oficial_url: 'https://www.youtube.com/embed/vO-FwS1YhNA'
  },
  {
    id: 'cat_afundo_passada',
    name: 'Passada / Afundo Caminhando',
    category: 'Pernas',
    reps: '3x20 passos',
    load: '10kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/6Tz_kO08_iM'
  },
  {
    id: 'cat_panturrilha_em_pe',
    name: 'Gêmeos / Panturrilha em Pé',
    category: 'Pernas',
    reps: '4x15-20',
    load: '50kg',
    video_oficial_url: 'https://www.youtube.com/embed/U3l0rV3D70w'
  },

  // --- OMBROS ---
  {
    id: 'cat_desenvolvimento_halteres',
    name: 'Desenvolvimento com Halteres',
    category: 'Ombros',
    reps: '4x10-12',
    load: '14kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/Z1K3JaoK9dM'
  },
  {
    id: 'cat_elevacao_lateral',
    name: 'Elevação Lateral com Halteres',
    category: 'Ombros',
    reps: '4x12-15',
    load: '8kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/l5MhN6l3s88'
  },
  {
    id: 'cat_elevacao_frontal_polia',
    name: 'Elevação Frontal na Polia Baixa',
    category: 'Ombros',
    reps: '3x12',
    load: '10kg',
    video_oficial_url: 'https://www.youtube.com/embed/l5MhN6l3s88'
  },
  {
    id: 'cat_crucifixo_inverso',
    name: 'Crucifixo Invertido com Halteres',
    category: 'Ombros',
    reps: '4x15',
    load: '7kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/H5_p5r8K9H8'
  },

  // --- BÍCEPS ---
  {
    id: 'cat_rosca_direta_w',
    name: 'Rosca Direta com Barra W',
    category: 'Bíceps',
    reps: '3x10-12',
    load: '10kg cada lado',
    video_oficial_url: 'https://www.youtube.com/embed/ly7TepL4pco'
  },
  {
    id: 'cat_rosca_martelo',
    name: 'Rosca Martelo Alternada',
    category: 'Bíceps',
    reps: '3x12',
    load: '12kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/HlJ_nKpxJg8'
  },
  {
    id: 'cat_rosca_scott',
    name: 'Rosca Scott na Máquina / Barra W',
    category: 'Bíceps',
    reps: '3x10-12',
    load: '20kg total',
    video_oficial_url: 'https://www.youtube.com/embed/ly7TepL4pco'
  },
  {
    id: 'cat_rosca_inclinada',
    name: 'Rosca Inclinada no Banco 45°',
    category: 'Bíceps',
    reps: '3x12',
    load: '10kg cada halter',
    video_oficial_url: 'https://www.youtube.com/embed/HlJ_nKpxJg8'
  },

  // --- TRÍCEPS ---
  {
    id: 'cat_triceps_corda',
    name: 'Tríceps na Polia com Corda',
    category: 'Tríceps',
    reps: '4x12-15',
    load: '20kg',
    video_oficial_url: 'https://www.youtube.com/embed/G6g1gG95wA0'
  },
  {
    id: 'cat_triceps_testa',
    name: 'Tríceps Testa com Halteres / Barra W',
    category: 'Tríceps',
    reps: '3x12',
    load: '10kg cada',
    video_oficial_url: 'https://www.youtube.com/embed/HlJ_nKpxJg8'
  },
  {
    id: 'cat_triceps_frances',
    name: 'Tríceps Francês Unilateral',
    category: 'Tríceps',
    reps: '3x12 cada braço',
    load: '8kg halter',
    video_oficial_url: 'https://www.youtube.com/embed/HlJ_nKpxJg8'
  },
  {
    id: 'cat_triceps_mergulho',
    name: 'Mergulho no Banco / Paralelas',
    category: 'Tríceps',
    reps: '3x15',
    load: 'Peso Corporal',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  },

  // --- ABDÔMEN / CORE ---
  {
    id: 'cat_abdominal_supra_solo',
    name: 'Abdominal Supra no Solo',
    category: 'Abdômen / Core',
    reps: '4x20',
    load: 'Peso Corporal',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  },
  {
    id: 'cat_prancha_isometrica',
    name: 'Prancha Frontal Isométrica',
    category: 'Abdômen / Core',
    reps: '4x45-60s',
    load: 'Peso Corporal',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  },
  {
    id: 'cat_infra_paralelas',
    name: 'Abdominal Infra nas Paralelas (Elevação de Pernas)',
    category: 'Abdômen / Core',
    reps: '3x15',
    load: 'Peso Corporal',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  },
  {
    id: 'cat_abdominal_polia',
    name: 'Abdominal Crunch na Polia Alta',
    category: 'Abdômen / Core',
    reps: '4x15',
    load: '30kg',
    video_oficial_url: 'https://www.youtube.com/embed/G6g1gG95wA0'
  },

  // --- CARDIO / FUNCIONAL ---
  {
    id: 'cat_corrida_esteira',
    name: 'Corrida Intervalada na Esteira',
    category: 'Cardio / Funcional',
    reps: '15-20 minutos',
    load: 'Velocidade 7 a 11 km/h',
    video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs'
  },
  {
    id: 'cat_burpee_completo',
    name: 'Burpee Completo com Salto',
    category: 'Cardio / Funcional',
    reps: '4x45s',
    load: 'Alta Intensidade',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  },
  {
    id: 'cat_bike_ergometrica',
    name: 'Bicicleta Ergométrica (HIIT)',
    category: 'Cardio / Funcional',
    reps: '15 minutos',
    load: 'Resistência Média/Alta',
    video_oficial_url: 'https://www.youtube.com/embed/sqOw2Y6u9Xs'
  },
  {
    id: 'cat_corda_naval',
    name: 'Corda Naval (Ondulações)',
    category: 'Cardio / Funcional',
    reps: '4x30s',
    load: 'Máxima Intensidade',
    video_oficial_url: 'https://www.youtube.com/embed/0pkjOk0EiAk'
  }
];

/**
 * Retorna o video oficial padrao com base no nome do exercicio
 */
export const getDefaultOfficialVideo = (exerciseName) => {
  if (!exerciseName) return 'https://www.youtube.com/embed/sqOw2Y6u9Xs';
  const clean = exerciseName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  
  const found = EXERCISE_CATALOG.find(item => {
    const itemClean = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return itemClean.includes(clean) || clean.includes(itemClean);
  });
  
  if (found && found.video_oficial_url) {
    return found.video_oficial_url;
  }
  
  if (clean.includes('supino') || clean.includes('peito')) return 'https://www.youtube.com/embed/sqOw2Y6u9Xs';
  if (clean.includes('remada') || clean.includes('puxada') || clean.includes('costas')) return 'https://www.youtube.com/embed/H6x4yY9_u2w';
  if (clean.includes('agachamento') || clean.includes('leg') || clean.includes('perna')) return 'https://www.youtube.com/embed/Vn83S-A-9yU';
  if (clean.includes('rosca') || clean.includes('biceps')) return 'https://www.youtube.com/embed/ly7TepL4pco';
  if (clean.includes('triceps') || clean.includes('ombro') || clean.includes('desenvolvimento')) return 'https://www.youtube.com/embed/HlJ_nKpxJg8';
  if (clean.includes('abdominal') || clean.includes('prancha') || clean.includes('burpee') || clean.includes('flexao')) return 'https://www.youtube.com/embed/0pkjOk0EiAk';

  return 'https://www.youtube.com/embed/sqOw2Y6u9Xs';
};

/**
 * Retorna sugestoes rapidas de videos para o exercicio
 */
export const getQuickVideoSuggestions = (exerciseName) => {
  const defaultVideo = getDefaultOfficialVideo(exerciseName);
  const videoId = (defaultVideo && defaultVideo.includes('/embed/')) ? defaultVideo.split('/embed/')[1] : 'sqOw2Y6u9Xs';
  
  return [
    { 
      id: 'sug_1', 
      title: `Execução Correta: ${exerciseName || 'Exercício'}`, 
      author: 'Treinador Fit Seven', 
      duration: '1:45', 
      embedUrl: defaultVideo, 
      thumbUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` 
    },
    { 
      id: 'sug_2', 
      title: `Biomecânica e Postura: ${exerciseName || 'Exercício'}`, 
      author: 'Biomecânica Pro', 
      duration: '2:10', 
      embedUrl: 'https://www.youtube.com/embed/H6x4yY9_u2w', 
      thumbUrl: 'https://img.youtube.com/vi/H6x4yY9_u2w/mqdefault.jpg' 
    },
    { 
      id: 'sug_3', 
      title: `Guia Rápido de Execução: ${exerciseName || 'Exercício'}`, 
      author: 'Personal Trainer Oficial', 
      duration: '1:15', 
      embedUrl: 'https://www.youtube.com/embed/Vn83S-A-9yU', 
      thumbUrl: 'https://img.youtube.com/vi/Vn83S-A-9yU/mqdefault.jpg' 
    }
  ];
};


