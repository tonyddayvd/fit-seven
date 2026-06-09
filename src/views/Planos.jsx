import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, ArrowLeft, ShieldCheck, Crown } from 'lucide-react';

const Planos = () => {
  const { setVirtualRoute } = useApp();

  return (
    <div style={styles.container} className="animate-fade-in">
      <button onClick={() => setVirtualRoute('app')} style={styles.backBtn}>
        <ArrowLeft size={16} /> Voltar ao Painel
      </button>

      <div style={styles.header}>
        <h2 style={styles.title} className="text-gradient">Planos e Valores</h2>
        <p style={styles.subtitle}>Encontre o plano ideal para acelerar os seus resultados e ter suporte exclusivo.</p>
      </div>

      <div style={styles.grid}>
        {/* Plano Simples */}
        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <ShieldCheck size={28} style={{ color: 'var(--text-secondary)' }} />
            <h3 style={styles.planTitle}>Plano Simples</h3>
            <span style={styles.price}>R$ 79,90<small style={styles.period}>/mês</small></span>
          </div>
          <div style={styles.features}>
            <div style={styles.featureItem}>
              <Check size={16} style={styles.checkIcon} />
              <span>Ficha de Treinos Básica</span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={styles.checkIcon} />
              <span>Avaliação Física a cada 90 dias</span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={styles.checkIcon} />
              <span>Acesso ao Painel do Aluno</span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={styles.checkIcon} />
              <span>Suporte via e-mail</span>
            </div>
          </div>
          <button style={styles.selectBtn} onClick={() => alert('Plano Simples - Em breve!')}>Contratar Plano</button>
        </div>

        {/* Plano VIP */}
        <div style={{ ...styles.card, ...styles.vipCard }} className="glass">
          <div style={styles.badge}>MAIS POPULAR</div>
          <div style={styles.cardHeader}>
            <Crown size={32} style={{ color: '#eab308' }} />
            <h3 style={{ ...styles.planTitle, color: '#eab308' }}>Plano VIP</h3>
            <span style={styles.price}>R$ 149,90<small style={styles.period}>/mês</small></span>
          </div>
          <div style={styles.features}>
            <div style={styles.featureItem}>
              <Check size={16} style={{ ...styles.checkIcon, color: '#eab308' }} />
              <span><strong>Fichas de Treino por IA + Master Integrado</strong></span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={{ ...styles.checkIcon, color: '#eab308' }} />
              <span><strong>Avaliação Física sem limite (30 dias cooldown)</strong></span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={{ ...styles.checkIcon, color: '#eab308' }} />
              <span>Visualização de Vídeos Exclusivos</span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={{ ...styles.checkIcon, color: '#eab308' }} />
              <span>Suporte Premium WhatsApp com Treinador</span>
            </div>
            <div style={styles.featureItem}>
              <Check size={16} style={{ ...styles.checkIcon, color: '#eab308' }} />
              <span>Upload Ilimitado de Laudos e Fotos</span>
            </div>
          </div>
          <button style={{ ...styles.selectBtn, ...styles.vipBtn }} onClick={() => alert('Plano VIP - Em breve!')}>Seja VIP Agora</button>
        </div>
      </div>

      <div style={styles.footer}>
        <p>Página de Planos e Valores - Em breve. Dúvidas? Fale com o suporte da sua academia.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '0 20px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '24px',
    transition: 'color 0.2s',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  card: {
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  vipCard: {
    borderColor: '#eab308',
    transform: 'scale(1.03)',
    boxShadow: '0 10px 30px rgba(234, 179, 8, 0.15)',
  },
  badge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: '#eab308',
    color: '#000000',
    fontSize: '0.75rem',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  cardHeader: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '20px',
    marginBottom: '24px',
  },
  planTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginTop: '12px',
    marginBottom: '8px',
  },
  price: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  period: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    fontWeight: '400',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '32px',
    flex: 1,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
  },
  checkIcon: {
    color: 'var(--primary)',
    flexShrink: 0,
  },
  selectBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  vipBtn: {
    backgroundColor: '#eab308',
    color: '#000000',
    border: 'none',
  },
  footer: {
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
  }
};

export default Planos;
