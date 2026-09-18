import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Video, 
  Camera, 
  Upload, 
  Check, 
  Sparkles, 
  Play, 
  Link as LinkIcon, 
  Trash2,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { 
  formatVideoEmbedUrl, 
  getQuickVideoSuggestions, 
  getDefaultOfficialVideo 
} from '../utils/videoService';

export default function ExerciseVideoManagerModal({ exercise, onSave, onClose }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState('sugestoes'); // 'sugestoes', 'gravar', 'link'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (exercise) {
      const existing = exercise.video_oficial_url || exercise.videoUrl || getDefaultOfficialVideo(exercise.name) || '';
      setCurrentUrl(existing);
      setCustomInputUrl(existing);
    }
  }, [exercise]);

  if (!exercise) return null;

  const suggestions = getQuickVideoSuggestions(exercise.name);

  // Selecionar sugestão com 1 toque
  const handleSelectSuggestion = (embedUrl) => {
    setCurrentUrl(embedUrl);
    setCustomInputUrl(embedUrl);
    onSave(embedUrl);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  // Upload ou gravação direta pelo celular
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Se for maior que 25MB, avisa o professor
    if (file.size > 25 * 1024 * 1024) {
      alert('O vídeo gravado é muito grande. Para economizar dados, grave vídeos curtos de 5 a 15 segundos da execução.');
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Video = reader.result;
      setCurrentUrl(base64Video);
      onSave(base64Video);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.onerror = () => {
      alert('Erro ao processar o vídeo gravado.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Salvar link manual
  const handleSaveManualLink = (e) => {
    e.preventDefault();
    if (!customInputUrl.trim()) return;
    const formatted = formatVideoEmbedUrl(customInputUrl);
    setCurrentUrl(formatted);
    onSave(formatted);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  // Limpar vídeo do exercício
  const handleRemoveVideo = () => {
    if (window.confirm('Deseja remover o vídeo deste exercício?')) {
      setCurrentUrl('');
      setCustomInputUrl('');
      onSave('');
    }
  };

  const isDirectVideo = currentUrl.startsWith('data:video') || currentUrl.startsWith('blob:');

  return (
    <div style={styles.overlay} className="animate-fade-in">
      <div style={styles.card} className="glass">
        {/* CABEÇALHO */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.iconBadge}>
              <Video size={20} color="#fff" />
            </div>
            <div>
              <h3 style={styles.title}>Vídeo de Execução Recomendado</h3>
              <span style={styles.subtitle}>Exercício: <strong style={{ color: 'var(--primary)' }}>{exercise.name}</strong></span>
            </div>
          </div>

          <button onClick={onClose} style={styles.closeBtn} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* MENSAGEM DE SUCESSO */}
        {uploadSuccess && (
          <div style={styles.successBanner} className="animate-fade-in">
            <Check size={16} />
            <span>Vídeo salvo com sucesso! O aluno verá esta execução como prioritária.</span>
          </div>
        )}

        {/* PRÉVIA DO VÍDEO ATUAL */}
        <div style={styles.previewSection}>
          <div style={styles.previewHeader}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              📺 Prévia do Vídeo Atual:
            </span>
            {currentUrl && (
              <button onClick={handleRemoveVideo} style={styles.removeBtn} title="Remover vídeo">
                <Trash2 size={14} /> Remover
              </button>
            )}
          </div>

          <div style={styles.videoPlayerContainer}>
            {currentUrl ? (
              isDirectVideo ? (
                <video 
                  src={currentUrl} 
                  controls 
                  style={styles.player} 
                  playsInline 
                />
              ) : (
                <iframe
                  src={currentUrl}
                  title={`Execução - ${exercise.name}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={styles.player}
                />
              )
            ) : (
              <div style={styles.emptyPreview}>
                <Video size={36} style={{ opacity: 0.3, marginBottom: '8px', color: 'var(--primary)' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Nenhum vídeo cadastrado. Escolha uma sugestão com 1 clique abaixo ou filme seu aluno!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SELETOR DE ABAS ULTRA SIMPLES */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setActiveTab('sugestoes')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'sugestoes' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'sugestoes' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Sparkles size={16} />
            <span>Sugestões Prontas (1 Toque)</span>
          </button>

          <button
            onClick={() => setActiveTab('gravar')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'gravar' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'gravar' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Camera size={16} />
            <span>Gravar / Enviar do Celular</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            style={{
              ...styles.tabBtn,
              background: activeTab === 'link' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'link' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <LinkIcon size={16} />
            <span>Colar Link</span>
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div style={styles.tabContent}>
          {/* 1. SUGESTÕES PRONTAS */}
          {activeTab === 'sugestoes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Toque em qualquer vídeo abaixo para defini-lo imediatamente como o vídeo oficial do exercício:
              </p>

              {suggestions.map((sug, idx) => {
                const isSelected = currentUrl === sug.embedUrl;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleSelectSuggestion(sug.embedUrl)}
                    style={{
                      ...styles.suggestionCard,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-secondary)'
                    }}
                  >
                    <img src={sug.thumbUrl} alt={sug.title} style={styles.suggestionThumb} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                        {sug.title}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {sug.author} • {sug.duration}
                      </span>
                    </div>

                    <button 
                      style={{
                        ...styles.selectBtn,
                        background: isSelected ? 'var(--status-success)' : 'var(--primary)',
                      }}
                    >
                      {isSelected ? <Check size={14} /> : <Play size={14} />}
                      <span>{isSelected ? 'Ativo' : 'Escolher'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. GRAVAR DO CELULAR / UPLOAD DIRETO */}
          {activeTab === 'gravar' && (
            <div style={{ textAlign: 'center', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <input
                type="file"
                accept="video/*"
                capture="environment"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <div style={styles.uploadPromptBox}>
                <Smartphone size={40} color="var(--primary)" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Filmar o Aluno Executando
                </h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                  Grave um vídeo curto de 5 a 15 segundos da execução correta diretamente pela câmera do celular!
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={styles.recordBtn}
                  className="btn-primary"
                >
                  <Camera size={18} />
                  <span>{isUploading ? 'Processando vídeo...' : 'Abrir Câmera / Escolher da Galeria'}</span>
                </button>
              </div>

              {/* AVISO EDUCATIVO PARA PROFESSORES E ALUNOS LEIGOS */}
              <div style={{
                backgroundColor: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                textAlign: 'left',
                maxWidth: '440px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.45'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#eab308', fontWeight: 'bold', marginBottom: '6px', fontSize: '0.82rem' }}>
                  <HelpCircle size={15} />
                  <span>Como funciona a gravação no celular (Sem custos de nuvem):</span>
                </div>
                <p style={{ margin: '0 0 6px 0' }}>
                  • Para não gastar com servidores caros de nuvem, o vídeo gravado é guardado <strong>diretamente na memória deste celular</strong> (armazenamento local).
                </p>
                <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                  👉 <strong>Dica importante:</strong> Se você quer que o <strong>aluno</strong> veja esse vídeo no celular dele durante o treino, <strong>faça a gravação usando o aplicativo no celular do próprio aluno</strong>! (Ou use um link do YouTube na aba ao lado, que abre em qualquer celular).
                </p>
              </div>
            </div>
          )}

          {/* 3. COLAR LINK MANUAL */}
          {activeTab === 'link' && (
            <form onSubmit={handleSaveManualLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Cole qualquer link do YouTube, YouTube Shorts ou Google Drive:
              </p>

              <input
                type="url"
                placeholder="Ex: https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                style={styles.input}
              />

              <button type="submit" style={styles.saveLinkBtn} className="btn-primary">
                <Check size={16} />
                <span>Salvar Link como Oficial</span>
              </button>
            </form>
          )}
        </div>

        {/* RODAPÉ */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.closeFooterBtn}>
            Concluir & Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },
  card: {
    background: '#0f172a',
    border: '1px solid rgba(139, 92, 246, 0.35)',
    borderRadius: '16px',
    maxWidth: '540px',
    width: '100%',
    maxHeight: '92vh',
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 25px rgba(139,92,246,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px'
  },
  iconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '800',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  closeBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: 'none',
    color: '#94a3b8',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#4ade80',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '700'
  },
  previewSection: {
    background: 'rgba(0, 0, 0, 0.35)',
    borderRadius: '12px',
    padding: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  removeBtn: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  videoPlayerContainer: {
    width: '100%',
    height: '210px',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  player: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  emptyPreview: {
    textAlign: 'center',
    padding: '20px'
  },
  tabBar: {
    display: 'flex',
    gap: '6px',
    background: 'rgba(0, 0, 0, 0.25)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '8px 10px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  tabContent: {
    minHeight: '140px'
  },
  suggestionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  suggestionThumb: {
    width: '68px',
    height: '46px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  selectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  uploadPromptBox: {
    border: '2px dashed rgba(139, 92, 246, 0.4)',
    borderRadius: '14px',
    padding: '24px 16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  recordBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    color: '#fff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.88rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
    color: '#fff',
    fontSize: '0.85rem'
  },
  saveLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '12px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  closeFooterBtn: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer'
  }
};
