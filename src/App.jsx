import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import BypassConsole from './components/BypassConsole';
import Login from './views/Login';
import Estabelecimento from './views/Estabelecimento';
import Professor from './views/Professor';
import Aluno from './views/Aluno';
import Master from './views/Master';

import Planos from './views/Planos';

function App() {
  const { user, activeRole, virtualRoute, originalUser, revertToMaster } = useApp();

  // Se não estiver autenticado, exibe a tela de login
  if (!user) {
    return (
      <main style={styles.loginContainer}>
        <Login />
      </main>
    );
  }

  // Roteamento de acordo com o papel ativo (com suporte a bypass do Master)
  const renderView = () => {
    if (virtualRoute === '/planos') {
      return <Planos />;
    }
    switch (activeRole) {
      case 'estabelecimento':
        return <Estabelecimento />;
      case 'professor':
        return <Professor />;
      case 'aluno':
        return <Aluno />;
      case 'master':
        return <Master />;
      default:
        return (
          <div style={styles.errorState}>
            <h2>Erro de Roteamento</h2>
            <p>Perfil "{activeRole}" não reconhecido.</p>
          </div>
        );
    }
  };

  return (
    <div style={styles.layout}>
      {originalUser && (
        <div style={styles.bypassBanner}>
          <span>🕵️ MODO VISUALIZAÇÃO: Você está acessando como <strong>{user?.name}</strong> ({user?.role?.toUpperCase()}).</span>
          <button onClick={revertToMaster} style={styles.revertBtn}>Voltar ao meu Painel</button>
        </div>
      )}
      <div style={styles.container}>
        <Header />
        
        <main style={styles.mainContent}>
          {renderView()}
        </main>
      </div>

      {/* Console de bypass flutuante do perfil MASTER */}
      <BypassConsole />
    </div>
  );
}

const styles = {
  bypassBanner: {
    backgroundColor: '#eab308',
    color: '#000000',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
    fontWeight: '700',
    boxShadow: 'var(--shadow-md)',
    zIndex: 9999999,
  },
  revertBtn: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '700',
    transition: 'opacity 0.2s',
  },
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 40%)',
  },
  layout: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.05) 0%, transparent 35%), radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.05) 0%, transparent 35%)',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    padding: '8px 16px 100px 16px',
    flex: 1,
  },
  errorState: {
    padding: '40px',
    textAlign: 'center',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
  }
};

export default App;
