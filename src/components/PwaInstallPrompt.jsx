import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  X, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const STORAGE_DISMISSED_KEY = 'fitseven_pwa_dismissed_time';
const DISMISS_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 horas

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Registro Automático do Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const swUrl = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}sw.js` : '/fit-seven/sw.js';
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log('[PWA] Service Worker registrado com sucesso. Escopo:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Falha ao registrar Service Worker:', err);
        });
    }

    // 2. Detecção de modo Standalone / Já instalado
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();
    if (standalone) return;

    // 3. Detecção de Plataforma (iOS / Mobile)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    setIsIos(isIosDevice);
    setIsMobile(isMobileDevice);

    // 4. Verifica se o usuário dispensou o banner nas últimas 24h
    const lastDismissed = localStorage.getItem(STORAGE_DISMISSED_KEY);
    const isDismissActive = lastDismissed && (Date.now() - parseInt(lastDismissed, 10) < DISMISS_TIMEOUT_MS);

    // 5. Captura do Evento Nativo beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissActive) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Escuta evento customizado disparado pelo botão da Navbar
    const handleTriggerPwa = () => {
      setShowBanner(true);
      setShowGuideModal(true);
    };
    window.addEventListener('fitseven-open-pwa-install', handleTriggerPwa);

    // No iOS ou dispositivos móveis, exibe sugestão de instalação se não dispensado
    if (!isDismissActive && (isIosDevice || isMobileDevice)) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Listener para quando o app for instalado com sucesso
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setShowGuideModal(false);
      setDeferredPrompt(null);
      console.log('[PWA] Fit Seven foi instalado com sucesso!');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('fitseven-open-pwa-install', handleTriggerPwa);
    };
  }, []);

  // Se já estiver em modo standalone ou já instalado com sucesso, não renderiza
  if (isStandalone || isInstalled) {
    return null;
  }

  // Ação ao clicar em Instalar
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowBanner(false);
          setDeferredPrompt(null);
          return;
        } else {
          setShowGuideModal(true);
        }
      } catch (err) {
        console.warn('[PWA] Erro ao invocar prompt nativo:', err);
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // Fechar banner temporariamente (24h)
  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(STORAGE_DISMISSED_KEY, Date.now().toString());
  };

  return (
    <>
      {/* ── CARD FLUTUANTE DE INSTALAÇÃO (BANNER INFERIOR) ── */}
      {showBanner && !showGuideModal && (
        <div style={styles.floatingBanner} className="animate-fade-in">
          <div style={styles.bannerContent}>
            <div style={styles.appIconWrapper}>
              <img 
                src="/fit-seven/icons/icon-192.png" 
                alt="Fit Seven" 
                style={styles.appIcon}
                onError={(e) => { e.target.src = '/fit-seven/assets/logo-sm.jpg'; }}
              />
              <div style={styles.sparkleBadge}>
                <Sparkles size={11} color="#fff" />
              </div>
            </div>

            <div style={styles.textContent}>
              <div style={styles.titleRow}>
                <h4 style={styles.title}>Instalar Fit Seven App</h4>
                <span style={styles.freeBadge}>PWA</span>
              </div>
              <p style={styles.subtitle}>
                {isIos 
                  ? 'Adicione à tela de início para acesso instantâneo em tela cheia!' 
                  : 'Acesse seus treinos e avaliações com 1 clique direto da sua tela inicial!'}
              </p>
            </div>

            <button 
              onClick={handleDismiss} 
              style={styles.closeBtn} 
              title="Fechar por 24 horas"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div style={styles.actionRow}>
            <button 
              onClick={handleInstallClick} 
              style={styles.installBtn}
              className="btn-primary"
            >
              <Download size={18} />
              <span>Instalar como Atalho / App</span>
            </button>

            <button 
              onClick={handleDismiss} 
              style={styles.laterBtn}
            >
              Depois
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL DIDÁTICO PASSO A PASSO (QUANDO NÃO HÁ PROMPT NATIVO OU NO IOS) ── */}
      {showGuideModal && (
        <div style={styles.modalOverlay} className="animate-fade-in">
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="/fit-seven/icons/icon-192.png" 
                  alt="Fit Seven" 
                  style={{ width: '42px', height: '42px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
                  onError={(e) => { e.target.src = '/fit-seven/assets/logo-sm.jpg'; }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: '800' }}>
                    {isIos ? 'Adicionar ao iPhone / iPad' : isMobile ? 'Instalar no Celular' : 'Instalar no Computador'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Siga o passo a passo abaixo para fixar o Fit Seven:
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowGuideModal(false)} 
                style={styles.modalCloseBtn}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.stepsContainer}>
              {isIos ? (
                /* ── PASSOS PARA IOS (SAFARI) ── */
                <>
                  <div style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>1</div>
                    <div style={styles.stepBody}>
                      <div style={styles.stepTitleRow}>
                        <strong>Toque no botão Compartilhar</strong>
                        <div style={styles.iconHighlightIos}>
                          <Share size={18} color="#38bdf8" />
                        </div>
                      </div>
                      <p style={styles.stepDesc}>
                        No rodapé da barra do Safari (ou topo no iPad), toque no ícone de <strong>Compartilhar</strong> (quadrado com seta apontando para cima).
                      </p>
                    </div>
                  </div>

                  <div style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>2</div>
                    <div style={styles.stepBody}>
                      <div style={styles.stepTitleRow}>
                        <strong>Selecione "Adicionar à Tela de Início"</strong>
                        <div style={styles.iconHighlightIos}>
                          <PlusSquare size={18} color="#a855f7" />
                        </div>
                      </div>
                      <p style={styles.stepDesc}>
                        Role a lista de opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> (ícone com sinal de mais +).
                      </p>
                    </div>
                  </div>

                  <div style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>3</div>
                    <div style={styles.stepBody}>
                      <div style={styles.stepTitleRow}>
                        <strong>Confirme em "Adicionar"</strong>
                        <div style={styles.iconHighlightIos}>
                          <CheckCircle2 size={18} color="#22c55e" />
                        </div>
                      </div>
                      <p style={styles.stepDesc}>
                        Toque no botão <strong>"Adicionar"</strong> no canto superior direito. Pronto! O app Fit Seven aparecerá na sua tela inicial.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* ── PASSOS PARA ANDROID / CHROME / COMPUTADOR ── */
                <>
                  <div style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>1</div>
                    <div style={styles.stepBody}>
                      <div style={styles.stepTitleRow}>
                        <strong>Abra o Menu do Navegador</strong>
                        <div style={styles.iconHighlightAndroid}>
                          <MoreVertical size={18} color="#c084fc" />
                        </div>
                      </div>
                      <p style={styles.stepDesc}>
                        Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito do seu navegador Chrome ou Edge.
                      </p>
                    </div>
                  </div>

                  <div style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>2</div>
                    <div style={styles.stepBody}>
                      <div style={styles.stepTitleRow}>
                        <strong>Selecione "Instalar aplicativo"</strong>
                        <div style={styles.iconHighlightAndroid}>
                          <Smartphone size={18} color="#38bdf8" />
                        </div>
                      </div>
                      <p style={styles.stepDesc}>
                        Procure por <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong> no menu aberto.
                      </p>
                    </div>
                  </div>

                  <div style={styles.stepItem}>
                    <div style={styles.stepNumberBadge}>3</div>
                    <div style={styles.stepBody}>
                      <div style={styles.stepTitleRow}>
                        <strong>Confirme a Instalação</strong>
                        <div style={styles.iconHighlightAndroid}>
                          <CheckCircle2 size={18} color="#22c55e" />
                        </div>
                      </div>
                      <p style={styles.stepDesc}>
                        Toque no botão <strong>"Instalar"</strong> na janela de confirmação. O ícone oficial será adicionado à sua tela inicial!
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button 
                onClick={() => setShowGuideModal(false)} 
                style={styles.modalConfirmBtn}
              >
                <span>Entendi, vou adicionar agora</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  floatingBanner: {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    maxWidth: '460px',
    margin: '0 auto',
    zIndex: 999999,
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.98))',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(139, 92, 246, 0.35)',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(139, 92, 246, 0.25)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  bannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
  },
  appIconWrapper: {
    position: 'relative',
    flexShrink: 0,
  },
  appIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  sparkleBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  textContent: {
    flex: 1,
    paddingRight: '20px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  title: {
    margin: 0,
    fontSize: '0.98rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.2px',
  },
  freeBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#4ade80',
    padding: '1px 6px',
    borderRadius: '6px',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.78rem',
    color: '#94a3b8',
    lineHeight: '1.3',
  },
  closeBtn: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    color: '#94a3b8',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  installBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '11px 16px',
    borderRadius: '10px',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
    transition: 'all 0.2s ease',
  },
  laterBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '11px 14px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modalCard: {
    background: '#0f172a',
    border: '1px solid rgba(139, 92, 246, 0.4)',
    borderRadius: '20px',
    maxWidth: '480px',
    width: '100%',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '16px',
  },
  modalCloseBtn: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: 'none',
    color: '#94a3b8',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '12px 14px',
  },
  stepNumberBadge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
  },
  stepBody: {
    flex: 1,
  },
  stepTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#f8fafc',
    fontSize: '0.9rem',
    marginBottom: '4px',
  },
  iconHighlightIos: {
    background: 'rgba(56, 189, 248, 0.15)',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHighlightAndroid: {
    background: 'rgba(168, 85, 247, 0.15)',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDesc: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  modalFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '16px',
  },
  modalConfirmBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 18px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.92rem',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
  }
};