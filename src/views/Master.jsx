import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Database, 
  Server, 
  ShieldCheck, 
  Award, 
  UserCheck, 
  Cpu, 
  ThumbsUp, 
  Clock, 
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Key,
  Star,
  Eye,
  Building,
  Users,
  Check
} from 'lucide-react';

const TABLES_SCHEMA = [
  { 
    name: 'tenants', 
    desc: 'Tabela global de estabelecimentos/academias parceiras.',
    columns: ['id (PK)', 'name', 'subdomain', 'plano', 'limite_alunos', 'status', 'created_at'],
    hasTenantId: false,
    isGlobal: true 
  },
  { 
    name: 'users', 
    desc: 'Usuários do sistema (Administradores, Professores e Alunos).',
    columns: ['id (PK)', 'tenant_id (FK)', 'name', 'email', 'password_hash', 'role', 'plano', 'limite_alunos', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'alunos', 
    desc: 'Perfis detalhados dos alunos matriculados.',
    columns: ['id (PK)', 'tenant_id (FK)', 'user_id (FK)', 'phone', 'birth_date', 'status', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'professores', 
    desc: 'Perfis detalhados de instrutores e personal trainers.',
    columns: ['id (PK)', 'tenant_id (FK)', 'user_id (FK)', 'specialization', 'cref', 'status', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'exercicios', 
    desc: 'Catálogo de exercícios cadastrados (global ou customizado por academia).',
    columns: ['id (PK)', 'tenant_id (FK)', 'name', 'category', 'description', 'video_url', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'treinos', 
    desc: 'Fichas de treinos prescritas aos alunos.',
    columns: ['id (PK)', 'tenant_id (FK)', 'aluno_id (FK)', 'professor_id (FK)', 'name', 'description', 'status', 'created_at'],
    hasTenantId: true 
  },
  { 
    name: 'treino_exercicios', 
    desc: 'Vínculo e configurações específicas de cada exercício contido em um treino.',
    columns: ['id (PK)', 'tenant_id (FK)', 'treino_id (FK)', 'exercicio_id (FK)', 'series', 'repeticoes', 'carga', 'descanso', 'ordem'],
    hasTenantId: true 
  },
  { 
    name: 'pagamentos', 
    desc: 'Controle de mensalidades e transações financeiras dos alunos.',
    columns: ['id (PK)', 'tenant_id (FK)', 'aluno_id (FK)', 'amount', 'due_date', 'payment_date', 'status', 'payment_method', 'created_at'],
    hasTenantId: true 
  }
];

const PLANOS_DISPONIVEIS = ['Básico', 'Start', 'Grow', 'Scale'];

const Master = () => {
  const { 
    activeTenant, 
    pendingEvaluations, 
    approvedEvaluations,
    approveAndPublishWorkout,
    requeueEvaluation,
    tenants,
    usersList,
    addTenant,
    updateTenant,
    deleteTenant,
    addUser,
    updateUser,
    deleteUser,
    toggleUserVip,
    loginAsUser,
    resetDatabase,
    exportDatabase,
    importDatabase,
    user
  } = useApp();

  const [activeTab, setActiveTab] = useState('kpis_crud'); // 'kpis_crud', 'pending_approvals', 'db_auditor'
  const [activeSubTab, setActiveSubTab] = useState('tenants'); // 'tenants', 'professores', 'alunos'
  const [selectedEval, setSelectedEval] = useState(null);
  const [selectedTable, setSelectedTable] = useState(TABLES_SCHEMA[1]); // Inicia em 'users'
  const [backupJson, setBackupJson] = useState('');

  // Estados dos formulários CRUD
  const [showForm, setShowForm] = useState(null); // 'tenant', 'user', null
  const [editingId, setEditingId] = useState(null); // ID do objeto sendo editado
  
  // Campos dos formulários
  const [tenantForm, setTenantForm] = useState({ name: '', subdomain: '', plano: 'Básico', limiteAlunos: 10 });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '123', tenantId: '', role: 'aluno', plano: 'Básico', limiteAlunos: 10 });

  React.useEffect(() => {
    if (selectedEval) {
      const stillPending = pendingEvaluations.find(ev => ev.id === selectedEval.id);
      if (!stillPending) {
        setSelectedEval(null);
      } else {
        setSelectedEval(stillPending);
        // Buscar se o aluno é VIP na lista de usuários cadastrados
        const studentUser = usersList.find(u => u.id === stillPending.userId);
        if (studentUser) {
          setIsVip(!!studentUser.isVip);
        }
      }
    }
  }, [pendingEvaluations, selectedEval, usersList]);

  const [isVip, setIsVip] = useState(false);
  const [vipHtml, setVipHtml] = useState('');

  const handleApprove = async (id) => {
    // Validação de aluno VIP
    if (isVip && (!vipHtml || !vipHtml.trim())) {
      alert('⚠️ Atenção: Este aluno possui plano VIP ativado. Para prosseguir com a aprovação VIP, você precisa colar o HTML do programa de treino personalizado gerado pela IA no campo indicado. Se você deseja apenas entregar o plano simples gerado pelo motor interno, altere o Tipo de Entrega para "Plano Simples" antes de prosseguir.');
      return;
    }

    try {
      const success = await approveAndPublishWorkout(id, { isVip, vipHtml });
      if (success) {
        alert(isVip ? 'Treino VIP (HTML) aprovado e publicado com sucesso!' : 'Treino gerado por IA aprovado, publicado e injetado no BD com sucesso!');
        setSelectedEval(null);
        setIsVip(false);
        setVipHtml('');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao aprovar treino: ' + (err.message || 'Verifique sua conexão.'));
    }
  };

  // Handlers CRUD Tenants
  const openAddTenant = () => {
    setTenantForm({ name: '', subdomain: '', plano: 'Básico', limiteAlunos: 10 });
    setEditingId(null);
    setShowForm('tenant');
  };

  const openEditTenant = (subdomain, tenant) => {
    setTenantForm({ 
      name: tenant.name, 
      subdomain: tenant.subdomain, 
      plano: tenant.plano || 'Básico', 
      limiteAlunos: tenant.limiteAlunos || 10 
    });
    setEditingId(subdomain);
    setShowForm('tenant');
  };

  const handleSaveTenant = (e) => {
    e.preventDefault();
    if (editingId) {
      updateTenant(editingId, tenantForm);
      alert('Academia atualizada com sucesso!');
    } else {
      addTenant(tenantForm);
      alert('Nova academia cadastrada com sucesso!');
    }
    setShowForm(null);
  };

  const handleDeleteTenant = (subdomain) => {
    if (confirm('Tem certeza que deseja remover este estabelecimento?')) {
      deleteTenant(subdomain);
      alert('Estabelecimento removido.');
    }
  };

  // Handlers CRUD Users
  const openAddUser = (role) => {
    setUserForm({ name: '', email: '', password: '123', tenantId: '', role, plano: 'Básico', limiteAlunos: 10 });
    setEditingId(null);
    setShowForm('user');
  };

  const openEditUser = (userObj) => {
    setUserForm({ 
      name: userObj.name, 
      email: userObj.email, 
      password: userObj.password || '123', 
      tenantId: userObj.tenantId, 
      role: userObj.role,
      plano: userObj.plano || 'Básico',
      limiteAlunos: userObj.limiteAlunos || 10
    });
    setEditingId(userObj.id);
    setShowForm('user');
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateUser(editingId, userForm);
        alert('Usuário atualizado com sucesso!');
      } else {
        await addUser(userForm);
        alert('Novo usuário cadastrado com sucesso!');
      }
      setShowForm(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar usuário: ' + (err.message || err.details || 'Verifique os dados.'));
    }
  };

  const handleDeleteUser = (id) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      deleteUser(id);
      alert('Usuário removido.');
    }
  };

  const handleResetPassword = (id) => {
    const newPass = prompt('Digite a nova senha para o usuário:', '123456');
    if (newPass) {
      updateUser(id, { password: newPass });
      alert('Senha resetada com sucesso!');
    }
  };

  // Contadores KPIs
  const kpis = {
    totalTenants: Object.keys(tenants).length,
    totalProfessores: usersList.filter(u => u.role === 'professor').length,
    totalAlunos: usersList.filter(u => u.role === 'aluno').length,
    totalVips: usersList.filter(u => u.role === 'aluno' && u.isVip).length
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      
      {/* Welcome banner */}
      <div style={styles.welcomeCard} className="glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={styles.cardHeader}>
            <ShieldAlert size={28} className="text-gradient" />
            <div>
              <h2 style={styles.title}>Centro de Comando MASTER</h2>
              <p style={styles.subtitle}>Gestão de estabelecimentos, limites de planos, acessos e fila de aprovações de IA</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (confirm('Deseja realmente resetar todas as alterações e recarregar os dados de demonstração originais? Isso limpará a fila de aprovação e trará os professores de volta.')) {
                resetDatabase();
              }
            }} 
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--status-danger)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.2s' 
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          >
            🔄 Resetar Base de Dados Local
          </button>
        </div>
      </div>

      {/* Abas Globais */}
      <div style={styles.tabsContainer}>
        <button 
          onClick={() => setActiveTab('kpis_crud')} 
          style={{ ...styles.globalTab, ...(activeTab === 'kpis_crud' ? styles.globalTabActive : {}) }}
        >
          <Building size={16} /> Centro de Comando
        </button>
        <button 
          onClick={() => setActiveTab('pending_approvals')} 
          style={{ ...styles.globalTab, ...(activeTab === 'pending_approvals' ? styles.globalTabActive : {}) }}
        >
          <Cpu size={16} /> Fila de Aprovações ({pendingEvaluations.length})
        </button>
        <button 
          onClick={() => setActiveTab('eval_history')} 
          style={{ ...styles.globalTab, ...(activeTab === 'eval_history' ? styles.globalTabActive : {}), position: 'relative' }}
        >
          <Clock size={16} /> Histórico de Avaliações
          {approvedEvaluations.length > 0 && (
            <span style={{ marginLeft: '4px', background: 'var(--primary)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {approvedEvaluations.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('db_auditor')} 
          style={{ ...styles.globalTab, ...(activeTab === 'db_auditor' ? styles.globalTabActive : {}) }}
        >
          <Database size={16} /> Inspetor de Banco de Dados
        </button>
        <button 
          onClick={() => setActiveTab('bug_reports')} 
          style={{ ...styles.globalTab, ...(activeTab === 'bug_reports' ? styles.globalTabActive : {}), color: 'var(--status-danger)' }}
        >
          🚨 Bugs Relatados
        </button>
      </div>

      {/* CONTEÚDO DA ABA CENTRO DE COMANDO (KPIs + CRUDs) */}
      {activeTab === 'kpis_crud' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dashboard de KPIs */}
          <div style={styles.kpiGrid}>
            <div style={styles.kpiCard} className="glass">
              <Building size={24} style={{ color: 'var(--primary)' }} />
              <div>
                <span style={styles.kpiValue}>{kpis.totalTenants}</span>
                <span style={styles.kpiLabel}>Academias Cadastradas</span>
              </div>
            </div>
            <div style={styles.kpiCard} className="glass">
              <Users size={24} style={{ color: 'var(--secondary)' }} />
              <div>
                <span style={styles.kpiValue}>{kpis.totalProfessores}</span>
                <span style={styles.kpiLabel}>Professores Ativos</span>
              </div>
            </div>
            <div style={styles.kpiCard} className="glass">
              <UserCheck size={24} style={{ color: 'var(--status-success)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={styles.kpiValue}>{kpis.totalAlunos}</span>
                  <span style={{ fontSize: '0.85rem', color: '#eab308', fontWeight: 'bold' }}>({kpis.totalVips} VIPs)</span>
                </div>
                <span style={styles.kpiLabel}>Alunos na Plataforma</span>
              </div>
            </div>
          </div>

          {/* Sub-tabs CRUD */}
          <div style={styles.panelCard} className="glass">
            <div style={styles.crudTabs}>
              <button 
                onClick={() => { setActiveSubTab('tenants'); setShowForm(null); }} 
                style={{ ...styles.crudTab, ...(activeSubTab === 'tenants' ? styles.crudTabActive : {}) }}
              >
                Academias / Tenants
              </button>
              <button 
                onClick={() => { setActiveSubTab('professores'); setShowForm(null); }} 
                style={{ ...styles.crudTab, ...(activeSubTab === 'professores' ? styles.crudTabActive : {}) }}
              >
                Professores
              </button>
              <button 
                onClick={() => { setActiveSubTab('alunos'); setShowForm(null); }} 
                style={{ ...styles.crudTab, ...(activeSubTab === 'alunos' ? styles.crudTabActive : {}) }}
              >
                Alunos
              </button>
              <button 
                onClick={() => { setActiveSubTab('masters'); setShowForm(null); }} 
                style={{ ...styles.crudTab, ...(activeSubTab === 'masters' ? styles.crudTabActive : {}) }}
              >
                Administradores (Master)
              </button>
            </div>

            {/* FORMULÁRIO DE ACADEMIAS */}
            {showForm === 'tenant' && (
              <form onSubmit={handleSaveTenant} style={styles.crudForm} className="animate-fade-in">
                <h4 style={styles.formTitle}>{editingId ? 'Editar Academia' : 'Cadastrar Nova Academia'}</h4>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Nome da Academia</label>
                    <input 
                      type="text" 
                      required 
                      value={tenantForm.name} 
                      onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: Arena Fitness"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Subdomain (tenant_id)</label>
                    <input 
                      type="text" 
                      required 
                      disabled={!!editingId}
                      value={tenantForm.subdomain} 
                      onChange={(e) => setTenantForm(prev => ({ ...prev, subdomain: e.target.value }))}
                      style={styles.inputField}
                      placeholder="Ex: arena-fitness"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Plano Contratado</label>
                    <select 
                      value={tenantForm.plano} 
                      onChange={(e) => setTenantForm(prev => ({ ...prev, plano: e.target.value }))}
                      style={styles.selectField}
                    >
                      {PLANOS_DISPONIVEIS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Limite de Alunos</label>
                    <input 
                      type="number" 
                      required 
                      value={tenantForm.limiteAlunos} 
                      onChange={(e) => setTenantForm(prev => ({ ...prev, limiteAlunos: e.target.value }))}
                      style={styles.inputField}
                      min="1"
                    />
                  </div>
                </div>
                <div style={styles.formActions}>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Salvar Academia
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(null)}>Cancelar</button>
                </div>
              </form>
            )}

            {/* FORMULÁRIO DE USUÁRIOS (PROFESSOR / ALUNO) */}
            {showForm === 'user' && (
              <form onSubmit={handleSaveUser} style={styles.crudForm} className="animate-fade-in">
                <h4 style={styles.formTitle}>
                  {editingId ? 'Editar Cadastro' : userForm.role === 'professor' ? 'Cadastrar Novo Professor' : 'Cadastrar Novo Aluno'}
                </h4>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Nome Completo</label>
                    <input 
                      type="text" 
                      required 
                      value={userForm.name} 
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      style={styles.inputField}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>E-mail (Login)</label>
                    <input 
                      type="email" 
                      required 
                      value={userForm.email} 
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      style={styles.inputField}
                    />
                  </div>
                  {!editingId && (
                    <div style={styles.inputGroup}>
                      <label style={styles.formLabel}>Senha Inicial</label>
                      <input 
                        type="password" 
                        required 
                        value={userForm.password} 
                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                        style={styles.inputField}
                      />
                    </div>
                  )}
                  <div style={styles.inputGroup}>
                    <label style={styles.formLabel}>Vincular à Academia ou Professor (Tenant)</label>
                    <select 
                      value={userForm.tenantId} 
                      onChange={(e) => setUserForm(prev => ({ ...prev, tenantId: e.target.value }))}
                      style={styles.selectField}
                    >
                      <option value="">Sem Vínculo (Aluno Avulso - Acompanhamento IA)</option>
                      <optgroup label="Academias">
                        {Object.keys(tenants).map(k => {
                          const t = tenants[k];
                          return <option key={t.id} value={t.id}>{t.name} ({t.subdomain})</option>;
                        })}
                      </optgroup>
                      {userForm.role === 'aluno' && (
                        <optgroup label="Professores Independentes">
                          {usersList.filter(u => u.role === 'professor').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  {userForm.role === 'professor' && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Plano do Professor</label>
                        <select 
                          value={userForm.plano} 
                          onChange={(e) => setUserForm(prev => ({ ...prev, plano: e.target.value }))}
                          style={styles.selectField}
                        >
                          {PLANOS_DISPONIVEIS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.formLabel}>Limite de Alunos</label>
                        <input 
                          type="number" 
                          required 
                          value={userForm.limiteAlunos} 
                          onChange={(e) => setUserForm(prev => ({ ...prev, limiteAlunos: e.target.value }))}
                          style={styles.inputField}
                          min="1"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div style={styles.formActions}>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Salvar Usuário
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(null)}>Cancelar</button>
                </div>
              </form>
            )}

            {/* TABELA DE ACADEMIAS */}
            {activeSubTab === 'tenants' && !showForm && (
              <div className="animate-fade-in">
                <div style={styles.tableActions}>
                  <button onClick={openAddTenant} style={styles.addButton} className="btn-primary">
                    <Plus size={16} /> Cadastrar Academia
                  </button>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableCellHeader}>Nome</th>
                      <th style={styles.tableCellHeader}>tenant_id</th>
                      <th style={styles.tableCellHeader}>Plano</th>
                      <th style={styles.tableCellHeader}>Limite de Alunos</th>
                      <th style={styles.tableCellHeader}>Alunos Atuais</th>
                      <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(tenants).map(key => {
                      const t = tenants[key];
                      const currentAlunos = usersList.filter(u => u.role === 'aluno' && u.tenantId === t.id).length;
                      return (
                        <tr key={t.id} style={styles.tableRow}>
                          <td style={styles.tableCell}><strong>{t.name}</strong></td>
                          <td style={styles.tableCell}><code>{t.id} ({t.subdomain})</code></td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusTag,
                              backgroundColor: 'rgba(6, 182, 212, 0.15)',
                              color: 'var(--secondary)',
                              fontWeight: 'bold'
                            }}>{t.plano || 'Básico'}</span>
                          </td>
                          <td style={styles.tableCell}>{t.limiteAlunos || 10} alunos</td>
                          <td style={styles.tableCell}>
                            <span style={{ 
                              color: currentAlunos >= (t.limiteAlunos || 10) ? 'var(--status-danger)' : 'var(--status-success)', 
                              fontWeight: 'bold' 
                            }}>
                              {currentAlunos} / {t.limiteAlunos || 10}
                            </span>
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsGroup}>
                              <button onClick={() => openEditTenant(key, t)} style={styles.iconBtn} title="Editar"><Edit2 size={14} /></button>
                              {t.id !== 'master' && (
                                <button onClick={() => handleDeleteTenant(key)} style={{ ...styles.iconBtn, color: 'var(--status-danger)' }} title="Deletar"><Trash2 size={14} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABELA DE PROFESSORES */}
            {activeSubTab === 'professores' && !showForm && (
              <div className="animate-fade-in">
                <div style={styles.tableActions}>
                  <button onClick={() => openAddUser('professor')} style={styles.addButton} className="btn-primary">
                    <Plus size={16} /> Cadastrar Professor
                  </button>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableCellHeader}>Nome</th>
                      <th style={styles.tableCellHeader}>E-mail</th>
                      <th style={styles.tableCellHeader}>Academia (Tenant)</th>
                      <th style={styles.tableCellHeader}>Plano</th>
                      <th style={styles.tableCellHeader}>Limite Alunos</th>
                      <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.role === 'professor').map(p => {
                      const acad = Object.values(tenants).find(t => t.id === p.tenantId) || { name: 'Desconhecida' };
                      return (
                        <tr key={p.id} style={styles.tableRow}>
                          <td style={styles.tableCell}><strong>{p.name}</strong></td>
                          <td style={styles.tableCell}>{p.email}</td>
                          <td style={styles.tableCell}>{acad.name}</td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusTag,
                              backgroundColor: 'rgba(139, 92, 246, 0.15)',
                              color: 'var(--primary)',
                              fontWeight: 'bold'
                            }}>{p.plano || 'Básico'}</span>
                          </td>
                          <td style={styles.tableCell}>{p.limiteAlunos || 10} alunos</td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsGroup}>
                              <button onClick={() => loginAsUser(p)} style={{ ...styles.iconBtn, color: '#eab308' }} title="Acessar como..."><Eye size={14} /></button>
                              <button onClick={() => openEditUser(p)} style={styles.iconBtn} title="Editar"><Edit2 size={14} /></button>
                              <button onClick={() => handleResetPassword(p.id)} style={styles.iconBtn} title="Resetar Senha"><Key size={14} /></button>
                              <button onClick={() => handleDeleteUser(p.id)} style={{ ...styles.iconBtn, color: 'var(--status-danger)' }} title="Deletar"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABELA DE ALUNOS */}
            {activeSubTab === 'alunos' && !showForm && (
              <div className="animate-fade-in">
                <div style={styles.tableActions}>
                  <button onClick={() => openAddUser('aluno')} style={styles.addButton} className="btn-primary">
                    <Plus size={16} /> Cadastrar Aluno
                  </button>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableCellHeader}>Nome</th>
                      <th style={styles.tableCellHeader}>E-mail</th>
                      <th style={styles.tableCellHeader}>Vínculo (Academia/Prof.)</th>
                      <th style={styles.tableCellHeader}>Status VIP</th>
                      <th style={styles.tableCellHeader}>Data Cadastro</th>
                      <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.role === 'aluno').map(a => {
                      const acad = Object.values(tenants).find(t => t.id === a.tenantId) || usersList.find(u => u.id === a.tenantId && u.role === 'professor') || { name: 'Desconhecido' };
                      return (
                        <tr key={a.id} style={styles.tableRow}>
                          <td style={styles.tableCell}><strong>{a.name}</strong></td>
                          <td style={styles.tableCell}>{a.email}</td>
                          <td style={styles.tableCell}>{acad.name}</td>
                          <td style={styles.tableCell}>
                            {a.isVip ? (
                              <span style={{ color: '#eab308', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Award size={14} /> VIP
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>Simples</span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {a.data_cadastro ? new Date(a.data_cadastro).toLocaleDateString('pt-BR') : 'N/I'}
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsGroup}>
                              <button onClick={() => toggleUserVip(a.id)} style={{ ...styles.iconBtn, color: '#eab308' }} title={a.isVip ? "Remover VIP" : "Conceder VIP"}>
                                <Star size={14} fill={a.isVip ? '#eab308' : 'none'} />
                              </button>
                              <button onClick={() => loginAsUser(a)} style={{ ...styles.iconBtn, color: '#06b6d4' }} title="Acessar como..."><Eye size={14} /></button>
                              <button onClick={() => openEditUser(a)} style={styles.iconBtn} title="Editar"><Edit2 size={14} /></button>
                              <button onClick={() => handleResetPassword(a.id)} style={styles.iconBtn} title="Resetar Senha"><Key size={14} /></button>
                              <button onClick={() => handleDeleteUser(a.id)} style={{ ...styles.iconBtn, color: 'var(--status-danger)' }} title="Deletar"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABELA DE ADMINISTRADORES (MASTER) */}
            {activeSubTab === 'masters' && !showForm && (
              <div className="animate-fade-in">
                <div style={styles.tableActions}>
                  <button onClick={() => openAddUser('master')} style={styles.addButton} className="btn-primary">
                    <Plus size={16} /> Cadastrar Administrador
                  </button>
                </div>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableCellHeader}>Nome</th>
                      <th style={styles.tableCellHeader}>E-mail</th>
                      <th style={styles.tableCellHeader}>Senha Atual</th>
                      <th style={styles.tableCellHeader}>Papel</th>
                      <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.filter(u => u.role === 'master').map(m => {
                      return (
                        <tr key={m.id} style={styles.tableRow}>
                          <td style={styles.tableCell}><strong>{m.name} {m.id === user.id ? '(Você)' : ''}</strong></td>
                          <td style={styles.tableCell}>{m.email}</td>
                          <td style={styles.tableCell}><code>{m.password || '123'}</code></td>
                          <td style={styles.tableCell}>
                            <span style={{
                              ...styles.statusTag,
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              color: 'var(--status-danger)',
                              fontWeight: 'bold'
                            }}>MASTER</span>
                          </td>
                          <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                            <div style={styles.actionsGroup}>
                              <button onClick={() => openEditUser(m)} style={styles.iconBtn} title="Editar"><Edit2 size={14} /></button>
                              <button onClick={() => handleResetPassword(m.id)} style={styles.iconBtn} title="Resetar Senha"><Key size={14} /></button>
                              {m.id !== user.id && (
                                <button onClick={() => handleDeleteUser(m.id)} style={{ ...styles.iconBtn, color: 'var(--status-danger)' }} title="Deletar"><Trash2 size={14} /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA DE APROVAÇÕES DE TREINO IA */}
      {activeTab === 'pending_approvals' && (
        <div style={styles.mainGrid} className="animate-fade-in">
          {/* Lado Esquerdo: Aprovações Pendentes */}
          <div style={{ ...styles.panelCard, flex: '1 1 500px' }} className="glass">
            <div style={styles.panelHeader}>
              <Cpu size={20} className="text-gradient" />
              <h3 style={styles.panelTitle}>Aprovações Pendentes (Fluxo Híbrido IA)</h3>
            </div>
            
            {pendingEvaluations.length === 0 ? (
              <div style={styles.emptyBox}>
                <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p>Nenhuma avaliação pendente de análise ou aprovação no momento.</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Envie uma avaliação física na aba <strong>Medidas</strong> do Aluno para preencher esta fila.
                </span>
              </div>
            ) : (
              <div style={styles.evalQueue}>
                {pendingEvaluations.map(ev => {
                  const isSelected = selectedEval?.id === ev.id;
                  return (
                    <div 
                      key={ev.id} 
                      style={{
                        ...styles.evalCard,
                        ...(isSelected ? styles.evalCardActive : {})
                      }}
                      onClick={() => setSelectedEval(ev)}
                    >
                      <div style={styles.evalCardLeft}>
                        <span style={styles.evalStudentName}>{ev.userName}</span>
                        <span style={styles.evalMeta}>Submetido em: {ev.date} • Tenant: <strong>{ev.tenantId}</strong></span>
                      </div>
                      <span style={styles.pendingBadge}>Pendente</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Painel de Análise da IA se houver uma avaliação selecionada */}
          {selectedEval && (
            <div style={{ ...styles.panelCard, flex: '1 1 500px' }} className="glass animate-fade-in">
              <div style={styles.aiReviewHeader}>
                <h4 style={styles.reviewTitle}>Análise e Sugestão de Treino - {selectedEval.userName}</h4>
                <button onClick={() => setSelectedEval(null)} style={styles.closeBtn}>Fechar</button>
              </div>

              {/* Informações Fisiológicas da Avaliação */}
              <div style={styles.evalDetailsBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={styles.detailsBoxTitle}>Fisiologia & Objetivos Coletados:</h5>
                  <button 
                    type="button" 
                    onClick={() => {
                      const data = selectedEval.formData;
                      const prompt = `Você é um Personal Trainer e Nutricionista VIP. Elabore um programa completo de treinamento e dieta para o seguinte perfil:
Nome: ${selectedEval.userName}
Sexo Biológico: ${data.sexoBiologico}
Idade: ${data.idade} anos
Peso: ${data.peso} kg
Altura: ${data.altura} cm
Objetivo: ${data.objetivo}
Circunferências: Pescoço: ${data.pescoco}cm | Peitoral: ${data.peitoral}cm | Cintura: ${data.cintura}cm | Abdômen: ${data.abdomen}cm | Quadril: ${data.quadril}cm | Braço Esq/Dir: ${data.braçoEsq}cm / ${data.braçoDir}cm | Coxa Esq (Sup/Inf): ${data.coxaEsqSuperior}cm / ${data.coxaEsqInferior}cm | Coxa Dir (Sup/Inf): ${data.coxaDirSuperior}cm / ${data.coxaDirInferior}cm | Panturrilha Esq/Dir: ${data.panturrilhaEsq}cm / ${data.panturrilhaDir}cm
Nível de Experiência: ${data.nivelExperiencia}
Frequência Semanal: ${data.frequenciaSemanal} dias
Tempo por Sessão: ${data.tempoSessao} minutos
Equipamentos: ${data.equipamentos}
Trabalho (Nível de atividade): ${data.nivelAtividade}
Qualidade de Sono: ${data.qualidadeSono}/10 (Média de horas: ${data.horasSono}h)
Hidratação atual: ${data.hidratacaoAtual}L/dia
Suplementos em uso: ${data.suplementos}
Lesões ou Limitações: ${data.lesoes}
Preferências de exercício: ${data.preferencias}
Restrições Alimentares: ${data.restriçõesAlimentares}
Preferências Alimentares: ${data.preferenciasAlimentares}
Descrição da Rotina Diária: ${data.descricaoRotina}

[ANEXOS E EXAMES DO ALUNO]:
- Nome do Laudo/Bioimpedância enviado: ${data.laudoFile || 'Nenhum arquivo anexado'}
- Anexo de Bioimpedância Clínica (Base64): ${data.laudoFileBase64 ? 'Sim, verifique visualmente na tela do sistema as informações e simetria corporais do laudo e gráficos de bioimpedância.' : 'Não enviado'}
- Fotos de evolução enviadas pelo aluno:
  * Foto Frente: ${data.fotoFrente ? 'Anexada' : 'Não anexada'}
  * Foto Costas: ${data.fotoCostas ? 'Anexada' : 'Não anexada'}
  * Foto Perfil: ${data.fotoPerfil ? 'Anexada' : 'Não anexada'}
  *(Analise a postura, assimetria muscular e acúmulos de gordura localizados nas fotos de evolução exibidas na tela do painel antes de formular as correções no treino).*

Gere o programa formatado estritamente como um HTML rico usando variáveis e estilos CSS compatíveis com o gabarito "Treino Lisiane". Não use blocos de código externos ou markdown extra.`;
                      navigator.clipboard.writeText(prompt);
                      alert('Script VIP copiado para a área de transferência! (Inclui exames e imagens anexadas)');
                    }} 
                    style={styles.copyScriptBtn}
                  >
                    📋 Copiar Script VIP
                  </button>
                </div>
                <div style={styles.detailsGrid}>
                  <span><strong>Objetivo:</strong> {selectedEval.formData.objetivo.toUpperCase()}</span>
                  <span><strong>Frequência:</strong> {selectedEval.formData.frequenciaSemanal}x/semana</span>
                  <span><strong>Peso/Altura:</strong> {selectedEval.formData.peso}kg / {selectedEval.formData.altura}cm</span>
                  <span><strong>Idade:</strong> {selectedEval.formData.idade || 'N/I'} anos</span>
                  <span><strong>Sexo Biológico:</strong> {selectedEval.formData.sexoBiologico === 'masculino' ? 'Masculino' : 'Feminino'}</span>
                  <span><strong>Nível:</strong> {selectedEval.formData.nivelExperiencia}</span>
                </div>
                {selectedEval.formData.parqCardiaco === 'sim' && (
                  <div style={styles.warningAlertRow}>
                    <AlertCircle size={16} />
                    <span>Atenção: Aluno reportou histórico cardíaco no PAR-Q!</span>
                  </div>
                )}

                {/* Visualização das Fotos de Evolução e Laudos de Exames Clínicos/Bioimpedância */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>📸 Fotos de Evolução e Laudos de Bioimpedância:</h6>
                  
                  {/* Grid de Fotos de Evolução */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Frente</span>
                      {selectedEval.formData.fotoFrenteBase64 ? (
                        <>
                          <img src={selectedEval.formData.fotoFrenteBase64} alt="Frente" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '2px' }} />
                          <a 
                            href={selectedEval.formData.fotoFrenteBase64} 
                            download={`frente_${selectedEval.userName.replace(/\s+/g, '_')}_${selectedEval.id}.jpg`}
                            style={{ display: 'block', fontSize: '0.65rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold', marginTop: '6px' }}
                          >
                            📥 Baixar Foto
                          </a>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sem foto</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Costas</span>
                      {selectedEval.formData.fotoCostasBase64 ? (
                        <>
                          <img src={selectedEval.formData.fotoCostasBase64} alt="Costas" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '2px' }} />
                          <a 
                            href={selectedEval.formData.fotoCostasBase64} 
                            download={`costas_${selectedEval.userName.replace(/\s+/g, '_')}_${selectedEval.id}.jpg`}
                            style={{ display: 'block', fontSize: '0.65rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold', marginTop: '6px' }}
                          >
                            📥 Baixar Foto
                          </a>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sem foto</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Perfil</span>
                      {selectedEval.formData.fotoPerfilBase64 ? (
                        <>
                          <img src={selectedEval.formData.fotoPerfilBase64} alt="Perfil" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '2px' }} />
                          <a 
                            href={selectedEval.formData.fotoPerfilBase64} 
                            download={`perfil_${selectedEval.userName.replace(/\s+/g, '_')}_${selectedEval.id}.jpg`}
                            style={{ display: 'block', fontSize: '0.65rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold', marginTop: '6px' }}
                          >
                            📥 Baixar Foto
                          </a>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sem foto</span>
                      )}
                    </div>
                  </div>

                  {/* Laudo de Bioimpedância / Exames */}
                  {selectedEval.formData.laudoFileBase64 ? (
                    <div style={{ padding: '10px', border: '1px solid #10b981', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>📄 Bioimpedância/Exames Anexados:</span>
                      <span style={{ fontSize: '0.75rem' }}>{selectedEval.formData.laudoFile}</span>
                      {selectedEval.formData.laudoFileBase64.startsWith('data:image/') ? (
                        <img src={selectedEval.formData.laudoFileBase64} alt="Laudo" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginTop: '4px', borderRadius: '2px' }} />
                      ) : (
                        <a href={selectedEval.formData.laudoFileBase64} download={selectedEval.formData.laudoFile} style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>
                          📥 Baixar PDF do Exame / Bioimpedância
                        </a>
                      )}
                    </div>
                  ) : (
                    <div style={{ padding: '8px', border: '1px dashed var(--border-color)', borderRadius: '4px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Nenhum laudo clínico ou bioimpedância foi anexado nesta avaliação.
                    </div>
                  )}
                </div>
              </div>

              {/* Divisão sugerida de Treino pela IA */}
              <div style={styles.suggestedWorkoutsList}>
                <h5 style={styles.detailsBoxTitle}>Divisão Gerada pelo Motor de IA:</h5>
                {selectedEval.aiSuggestedWorkout.map((block, idx) => (
                  <div key={idx} style={styles.workoutBlock}>
                    <div style={styles.blockHeader}>
                      <span style={styles.blockTitle}>{block.title}</span>
                      <span style={styles.blockCount}>{block.exercises.length} Exs</span>
                    </div>
                    <div style={styles.blockExercises}>
                      {block.exercises.map((ex, exIdx) => (
                        <div key={exIdx} style={styles.blockExerciseItem}>
                          <span>• {ex.name} ({ex.reps})</span>
                          <span style={styles.blockLoad}>{ex.load}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ação de Publicar */}
              <div style={styles.publishBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Tipo de Entrega:</span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" name="vipToggle" checked={!isVip} onChange={() => setIsVip(false)} />
                    Plano Simples
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" name="vipToggle" checked={isVip} onChange={() => setIsVip(true)} />
                    Plano VIP (Personalizado)
                  </label>
                </div>

                {isVip && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary)' }}>Cole o HTML do Programa VIP aqui</label>
                    <textarea 
                      placeholder="Coloque a estrutura HTML completa aqui..." 
                      value={vipHtml}
                      onChange={(e) => setVipHtml(e.target.value)}
                      style={styles.htmlTextArea}
                    />
                  </div>
                )}

                <button 
                  onClick={() => handleApprove(selectedEval.id)} 
                  style={styles.approveBtn} 
                  className="btn-primary"
                >
                  <ThumbsUp size={16} />
                  [Aprovar e Publicar no Banco]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA DO INSPETOR DO BANCO DE DADOS */}
      {activeTab === 'db_auditor' && (
        <div style={styles.mainGrid} className="animate-fade-in">
          {/* Lado Esquerdo: Auditoria de Tabelas */}
          <div style={{ ...styles.panelCard, flex: '1 1 500px' }} className="glass">
            <div style={styles.panelHeader}>
              <Database size={20} style={{ color: 'var(--secondary)' }} />
              <h3 style={styles.panelTitle}>Auditoria de Isolamento B2B2C</h3>
            </div>
            
            <div style={styles.tableSelectorContainer}>
              {TABLES_SCHEMA.map(tbl => (
                <button 
                  key={tbl.name} 
                  onClick={() => setSelectedTable(tbl)}
                  style={{
                    ...styles.tableTab,
                    ...(selectedTable.name === tbl.name ? styles.tableTabActive : {})
                  }}
                >
                  {tbl.name}
                  {tbl.hasTenantId ? (
                    <ShieldCheck size={12} style={{ color: 'var(--status-success)', marginLeft: '4px' }} />
                  ) : null}
                </button>
              ))}
            </div>

            {selectedTable && (
              <div style={styles.schemaViewer}>
                <div style={styles.schemaHeader}>
                  <h4 style={styles.schemaTitle}>Tabela: {selectedTable.name}</h4>
                  {selectedTable.hasTenantId ? (
                    <span style={styles.secureBadge}>Isolamento Ativo (tenant_id)</span>
                  ) : (
                    <span style={styles.globalBadge}>Global</span>
                  )}
                </div>
                <p style={styles.schemaDesc}>{selectedTable.desc}</p>
                <div style={styles.columnsGrid}>
                  {selectedTable.columns.map(col => {
                    const isTenantId = col.includes('tenant_id');
                    return (
                      <span 
                        key={col} 
                        style={{
                          ...styles.columnItem,
                          ...(isTenantId ? styles.columnItemTenant : {})
                        }}
                      >
                        {col}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Lado Direito: Gestão de Backup */}
          <div style={{ ...styles.panelCard, flex: '1 1 400px' }} className="glass">
            <div style={styles.panelHeader}>
              <Server size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={styles.panelTitle}>Backup & Sincronização Local</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Exporte seus dados locais em formato JSON para criar backups ou sincronizar/transferir seus perfis de teste e treinos para outros aparelhos (como o seu celular).
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.formLabel}>Código JSON de Backup</label>
                <textarea 
                  placeholder="Seu JSON de backup aparecerá aqui ou cole o JSON do seu celular para restaurar..."
                  value={backupJson}
                  onChange={(e) => setBackupJson(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    minHeight: '150px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => {
                    const json = exportDatabase();
                    setBackupJson(json);
                    navigator.clipboard.writeText(json);
                    alert('Backup JSON exportado e copiado para a área de transferência com sucesso!');
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  📥 Exportar & Copiar
                </button>
                <button 
                  onClick={() => {
                    if (!backupJson.trim()) {
                      alert('Cole o JSON de backup antes de importar.');
                      return;
                    }
                    if (confirm('Importar este JSON irá sobrescrever todos os dados do navegador atual. Continuar?')) {
                      importDatabase(backupJson);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  📤 Importar / Restaurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA HISTÓRICO DE AVALIAÇÕES APROVADAS */}
      {activeTab === 'eval_history' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.panelCard} className="glass">
            <div style={styles.panelHeader}>
              <Clock size={20} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={styles.panelTitle}>Histórico de Avaliações Aprovadas</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Clique em <strong>Reavaliar</strong> para devolver uma avaliação para a fila sem que a aluna precise preencher tudo novamente. O treino ativo só muda após uma nova aprovação.
                </p>
              </div>
            </div>

            {approvedEvaluations.length === 0 ? (
              <div style={styles.emptyBox}>
                <Clock size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                <p>Nenhuma avaliação aprovada ainda.</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>As avaliações aparecerão aqui após serem aprovadas na fila.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...approvedEvaluations].reverse().map(ev => {
                  const studentUser = usersList.find(u => u.id === ev.userId);
                  const approvedDate = ev._approvedAt 
                    ? new Date(ev._approvedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : ev.date || '—';
                  return (
                    <div key={ev.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          color: '#fff',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {(ev.userName || ev.nome || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                            {ev.userName || ev.nome || 'Aluno desconhecido'}
                            {studentUser?.isVip && (
                              <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#eab308', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '10px', padding: '1px 7px' }}>
                                👑 VIP
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Aprovada em: {approvedDate} · Objetivo: {ev.formData?.objetivo || ev.objetivo || '—'} · Peso: {ev.formData?.peso || ev.peso || '?'}kg
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm(`Deseja reavaliar ${ev.userName || ev.nome}? A avaliação voltará para a fila de aprovações e você poderá ajustar o treino. O treino atual da aluna ficará ativo até que você aprove novamente.`)) return;
                          try {
                            await requeueEvaluation(ev.id);
                            alert('Avaliação enviada de volta para a fila! Acesse "Fila de Aprovações" para aprovar com o novo treino.');
                            setActiveTab('pending_approvals');
                          } catch (err) {
                            alert('Erro ao reavaliar: ' + (err.message || 'Tente novamente.'));
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          backgroundColor: 'rgba(139,92,246,0.1)',
                          color: 'var(--primary)',
                          border: '1px solid rgba(139,92,246,0.3)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.2)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(139,92,246,0.1)'}
                      >
                        🔄 Reavaliar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA DE RELATÓRIOS DE BUGS (Visualizador para o Administrador) */}
      {activeTab === 'bug_reports' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={styles.panelCard} className="glass">
            <div style={styles.panelHeader}>
              <ShieldAlert size={20} style={{ color: 'var(--status-danger)' }} />
              <div>
                <h3 style={styles.panelTitle}>Bugs e Ajustes Relatados pelos Alunos</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Abaixo constam as incoerências de grupo muscular, carga ou postura enviadas pelos alunos de teste. Use a cópia rápida para nos encaminhar as correções.
                </p>
              </div>
            </div>

            {(!bugReports || bugReports.length === 0) ? (
              <div style={styles.emptyBox}>
                <ThumbsUp size={40} style={{ opacity: 0.2, marginBottom: '12px', color: 'var(--status-success)' }} />
                <p>Nenhum bug ou incoerência relatada por enquanto!</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Os reports enviados pelos alunos de teste aparecerão aqui em tempo real.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bugReports.map(bug => (
                  <div key={bug.id} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    backgroundColor: 'rgba(239, 68, 68, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        👤 Aluno: {bug.studentName} ({bug.studentId})
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(bug.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      padding: '12px',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {bug.details}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bug.details);
                          alert('Texto do bug copiado com sucesso!');
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      >
                        📋 Copiar Texto
                      </button>
                      <button
                        onClick={() => {
                          const updated = bugReports.filter(b => b.id !== bug.id);
                          localStorage.setItem('fitseven-bug-reports', JSON.stringify(updated));
                          window.location.reload(); // Recarrega para sincronizar estado local
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: 'var(--status-success)' }}
                      >
                        ✓ Resolvido / Limpar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '60px'
  },
  welcomeCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px'
  },
  globalTab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    border: 'none',
    background: 'none',
    color: 'var(--text-secondary)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.9rem',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  globalTabActive: {
    color: 'var(--primary)',
    borderBottomColor: 'var(--primary)'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  kpiCard: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  kpiValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    display: 'block',
    lineHeight: '1.2'
  },
  kpiLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  panelCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
  },
  crudTabs: {
    display: 'flex',
    gap: '16px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
    paddingBottom: '8px'
  },
  crudTab: {
    padding: '6px 12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  },
  crudTabActive: {
    color: 'var(--primary)',
    borderBottomColor: 'var(--primary)',
    fontWeight: '700'
  },
  tableActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '16px'
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
    textAlign: 'left'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  tableCellHeader: {
    padding: '12px 8px',
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color 0.2s'
  },
  tableCell: {
    padding: '12px 8px',
    verticalAlign: 'middle'
  },
  actionsGroup: {
    display: 'inline-flex',
    gap: '6px',
    justifyContent: 'flex-end'
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  // Formulários CRUD
  crudForm: {
    backgroundColor: 'var(--bg-tertiary)',
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    marginBottom: '20px'
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  inputField: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none'
  },
  selectField: {
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer'
  },
  formActions: {
    display: 'flex',
    gap: '10px'
  },
  // Outros estilos herdados
  mainGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  evalQueue: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  evalCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  },
  evalCardActive: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  evalCardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  evalStudentName: {
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  evalMeta: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  pendingBadge: {
    fontSize: '0.7rem',
    fontWeight: '800',
    backgroundColor: 'var(--status-warning-bg)',
    color: 'var(--status-warning)',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  aiReviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  reviewTitle: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  evalDetailsBox: {
    padding: '14px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    marginBottom: '16px'
  },
  copyScriptBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--primary)',
    border: '1px solid var(--primary)',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  detailsBoxTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '8px',
    fontSize: '0.8rem',
  },
  warningAlertRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--status-danger)',
    backgroundColor: 'var(--status-danger-bg)',
    padding: '8px',
    borderRadius: '4px',
    marginTop: '10px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  suggestedWorkoutsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  workoutBlock: {
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    padding: '12px',
  },
  blockHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '4px',
  },
  blockTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
  blockCount: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  blockExercises: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  blockExerciseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  blockLoad: {
    color: 'var(--text-secondary)',
  },
  publishBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.04)',
    border: '1px solid var(--secondary)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  htmlTextArea: {
    width: '100%',
    minHeight: '120px',
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    boxSizing: 'border-box',
    resize: 'vertical'
  },
  approveBtn: {
    width: '100%',
    padding: '12px',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  tableSelectorContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '16px',
  },
  tableTab: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tableTabActive: {
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    borderColor: 'var(--primary)',
  },
  schemaViewer: {
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
  },
  schemaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  schemaTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  secureBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--status-success)',
    backgroundColor: 'var(--status-success-bg)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  globalBadge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  schemaDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
  },
  columnsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  columnItem: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
  },
  columnItemTenant: {
    backgroundColor: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    borderColor: 'rgba(52, 211, 153, 0.3)',
    fontWeight: '700',
  },
  statusTag: {
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '3px 6px',
    borderRadius: 'var(--radius-full)',
  }
};

export default Master;
