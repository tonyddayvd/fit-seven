import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  Dumbbell, 
  Plus, 
  Phone, 
  Mail, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  FileText, 
  Shield, 
  Edit2, 
  Trash2, 
  Key 
} from 'lucide-react';
import { formatCPF, formatPhone, validateCPF, formatCNPJ, validateDoc } from '../utils/validators';

const Estabelecimento = () => {
  const { 
    user, 
    activeTenantId, 
    activeTenant, 
    usersList, 
    preRegisterUser, 
    updateUser, 
    deleteUser, 
    approveStudentLink, 
    rejectStudentLink, 
    generateWhatsAppInvite 
  } = useApp();

  const [activeTab, setActiveTab] = useState('alunos'); // 'alunos', 'professores', 'solicitacoes'
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('aluno'); // 'aluno' ou 'professor'
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '',
    cref: '',
    plano: '',
    dia_vencimento: '10'
  });

  const [createdInviteModal, setCreatedInviteModal] = useState(null);
  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  // Filtragem dos usuários pertencentes a este tenant
  const tenantId = user?.tenantId || activeTenantId || activeTenant?.id || 't1';
  const tenantLimit = activeTenant?.limiteAlunos || user?.limiteAlunos || 100;

  const staff = (usersList || []).filter(u => u.tenantId === tenantId && u.role === 'professor');
  const students = (usersList || []).filter(u => u.tenantId === tenantId && u.role === 'aluno' && u.statusVinculo !== 'pendente_aprovacao' && u.statusVinculo !== 'recusado');
  const pendingRequests = (usersList || []).filter(u => u.tenantId === tenantId && u.role === 'aluno' && u.statusVinculo === 'pendente_aprovacao');

  const handleOpenAdd = (type = 'aluno') => {
    setAddType(type);
    setForm({
      name: '',
      email: '',
      whatsapp: '',
      cpf: '',
      cref: '',
      plano: '',
      dia_vencimento: '10'
    });
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim()) {
      setErrorMsg('O nome é obrigatório.');
      return;
    }

    if (addType === 'aluno' && students.length >= tenantLimit) {
      setErrorMsg('Limite de alunos do plano da academia atingido. Faça um upgrade para adicionar mais vagas.');
      return;
    }

    try {
      const newUser = await preRegisterUser({
        name: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        telefone: form.whatsapp,
        cpf: form.cpf,
        cref: form.cref,
        plano: form.plano,
        dia_vencimento: form.dia_vencimento,
        role: addType,
        tenantId: tenantId
      }, user || { name: activeTenant?.name || 'Academia' });

      const whatsAppUrl = generateWhatsAppInvite(newUser, user || { name: activeTenant?.name || 'Academia' });
      const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://tonyddayvd.github.io/fit-seven/';
      const inviteUrl = baseUrl + '?invite=true&userId=' + newUser.id + '&profName=' + encodeURIComponent(activeTenant?.name || user?.name || 'Academia');

      setCreatedInviteModal({
        targetUser: newUser,
        whatsAppUrl,
        inviteUrl,
        type: addType
      });

      setSuccessMsg((addType === 'aluno' ? 'Aluno(a) ' : 'Professor(a) ') + newUser.name + ' pré-cadastrado(a) com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3500);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao realizar pré-cadastro.');
    }
  };

  const handleApprove = async (studentId) => {
    try {
      await approveStudentLink(studentId, tenantId);
      setSuccessMsg('Vínculo do aluno aprovado com sucesso! Acesso aos treinos liberado.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      alert(err.message || 'Erro ao aprovar aluno.');
    }
  };

  const handleReject = async (studentId) => {
    if (confirm('Deseja realmente recusar a solicitação de vínculo deste aluno?')) {
      try {
        await rejectStudentLink(studentId);
        setSuccessMsg('Solicitação de vínculo recusada.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err) {
        alert(err.message || 'Erro ao recusar aluno.');
      }
    }
  };

  const handleSendInviteAgain = (targetUser) => {
    const whatsAppUrl = generateWhatsAppInvite(targetUser, user || { name: activeTenant?.name || 'Academia' });
    const baseUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : 'https://tonyddayvd.github.io/fit-seven/';
    const inviteUrl = baseUrl + '?invite=true&userId=' + targetUser.id + '&profName=' + encodeURIComponent(activeTenant?.name || user?.name || 'Academia');

    setCreatedInviteModal({
      targetUser,
      whatsAppUrl,
      inviteUrl,
      type: targetUser.role
    });
  };

  const handleDelete = (id, name) => {
    if (confirm('Deseja realmente remover ' + name + '?')) {
      deleteUser(id);
      setSuccessMsg('Usuário removido.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      
      {/* Cabeçalho */}
      <div style={styles.welcomeCard} className="glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={styles.title}>🏢 Painel de Gestão: {activeTenant?.name || user?.name || 'Academia'}</h2>
            <p style={styles.subtitle}>
              Plano Ativo: <strong>{activeTenant?.plano || 'Plano Pro'}</strong> • Capacidade: <strong>{students.length} de {tenantLimit} alunos</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleOpenAdd('aluno')}
              style={styles.addBtnPrimary}
              className="btn-primary"
            >
              <Plus size={16} /> Pré-Cadastrar Aluno
            </button>
            <button
              onClick={() => handleOpenAdd('professor')}
              style={styles.addBtnSecondary}
            >
              <Plus size={16} /> Pré-Cadastrar Professor
            </button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div style={styles.successAlert} className="animate-fade-in">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPIs */}
      <div style={styles.grid}>
        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <Users size={24} color="#4ade80" />
            <span style={styles.cardTitle}>Total de Alunos</span>
          </div>
          <span style={styles.kpiValue}>{students.length}</span>
          <span style={styles.kpiSub}>Ativos neste Estabelecimento</span>
        </div>

        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <UserCheck size={24} color="#60a5fa" />
            <span style={styles.cardTitle}>Professores</span>
          </div>
          <span style={styles.kpiValue}>{staff.length}</span>
          <span style={styles.kpiSub}>Profissionais no Quadro</span>
        </div>

        <div style={styles.card} className="glass">
          <div style={styles.cardHeader}>
            <AlertCircle size={24} color={pendingRequests.length > 0 ? '#c084fc' : '#94a3b8'} />
            <span style={styles.cardTitle}>Solicitações Pendentes</span>
          </div>
          <span style={styles.kpiValue}>{pendingRequests.length}</span>
          <span style={styles.kpiSub}>Aguardando Aprovação</span>
        </div>
      </div>

      {/* Abas de Navegação */}
      <div style={styles.tabRow}>
        <button
          onClick={() => setActiveTab('alunos')}
          style={{ ...styles.tabBtn, ...(activeTab === 'alunos' ? styles.tabBtnActive : {}) }}
        >
          <Users size={16} />
          <span>Alunos Matriculados ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('professores')}
          style={{ ...styles.tabBtn, ...(activeTab === 'professores' ? styles.tabBtnActive : {}) }}
        >
          <Dumbbell size={16} />
          <span>Corpo Docente / Professores ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('solicitacoes')}
          style={{ ...styles.tabBtn, ...(activeTab === 'solicitacoes' ? styles.tabBtnActive : {}) }}
        >
          <AlertCircle size={16} />
          <span>Solicitações de Vínculo ({pendingRequests.length})</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA ALUNOS */}
      {activeTab === 'alunos' && (
        <div style={styles.listCard} className="glass animate-fade-in">
          <div style={styles.tableHeader}>
            <h3 style={styles.sectionTitle}>Quadro de Alunos</h3>
            <button onClick={() => handleOpenAdd('aluno')} style={styles.tableAddBtn} className="btn-primary">
              <Plus size={14} /> Novo Aluno
            </button>
          </div>

          {students.length === 0 ? (
            <p style={styles.emptyText}>Nenhum aluno matriculado para este estabelecimento.</p>
          ) : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableCellHeader}>Nome</th>
                    <th style={styles.tableCellHeader}>Contato / WhatsApp</th>
                    <th style={styles.tableCellHeader}>E-mail</th>
                    <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(a => (
                    <tr key={a.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <strong>{a.name}</strong>
                        {a.preCadastro && (
                          <span style={styles.preCadBadge}>Pré-Cadastro</span>
                        )}
                        {a.plano && <span style={styles.planBadge}>{a.plano}</span>}
                      </td>
                      <td style={styles.tableCell}>{a.whatsapp || a.telefone || '—'}</td>
                      <td style={styles.tableCell}>{a.email}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSendInviteAgain(a)}
                            style={styles.whatsInviteBtn}
                            title="Enviar / Reenviar Link de Convite no WhatsApp"
                          >
                            <Phone size={13} /> WhatsApp
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.name)}
                            style={styles.deleteBtn}
                            title="Remover Aluno"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA PROFESSORES */}
      {activeTab === 'professores' && (
        <div style={styles.listCard} className="glass animate-fade-in">
          <div style={styles.tableHeader}>
            <h3 style={styles.sectionTitle}>Corpo Docente (Professores)</h3>
            <button onClick={() => handleOpenAdd('professor')} style={styles.tableAddBtn} className="btn-primary">
              <Plus size={14} /> Novo Professor
            </button>
          </div>

          {staff.length === 0 ? (
            <p style={styles.emptyText}>Nenhum professor cadastrado para este estabelecimento.</p>
          ) : (
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableCellHeader}>Professor</th>
                    <th style={styles.tableCellHeader}>CREF / Registro</th>
                    <th style={styles.tableCellHeader}>WhatsApp</th>
                    <th style={styles.tableCellHeader}>E-mail</th>
                    <th style={{ ...styles.tableCellHeader, textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(p => (
                    <tr key={p.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <strong>{p.name}</strong>
                        {p.preCadastro && (
                          <span style={styles.preCadBadge}>Pré-Cadastro</span>
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.crefBadge}>{p.cref || 'CREF Ativo'}</span>
                      </td>
                      <td style={styles.tableCell}>{p.whatsapp || p.telefone || '—'}</td>
                      <td style={styles.tableCell}>{p.email}</td>
                      <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSendInviteAgain(p)}
                            style={styles.whatsInviteBtn}
                            title="Enviar / Reenviar Link de Convite no WhatsApp"
                          >
                            <Phone size={13} /> WhatsApp
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            style={styles.deleteBtn}
                            title="Remover Professor"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA SOLICITAÇÕES */}
      {activeTab === 'solicitacoes' && (
        <div style={styles.listCard} className="glass animate-fade-in">
          <h3 style={styles.sectionTitle}>Solicitações de Vínculo de Alunos</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-6px', marginBottom: '16px' }}>
            Alunos que se cadastraram no Fit Seven e selecionaram a sua academia. Ao aprovar, o aluno ocupará 1 vaga do seu plano.
          </p>

          {pendingRequests.length === 0 ? (
            <p style={styles.emptyText}>Não há solicitações de vínculo pendentes no momento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingRequests.map(pReq => (
                <div key={pReq.id} style={styles.pendingItem}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{pReq.name}</strong>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span>✉️ {pReq.email}</span>
                      {pReq.whatsapp && <span>📱 {pReq.whatsapp}</span>}
                      {pReq.cpf && <span>🪪 CPF: {pReq.cpf}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleApprove(pReq.id)}
                      style={styles.approveBtn}
                    >
                      <Check size={14} /> Aprovar Vínculo
                    </button>
                    <button
                      onClick={() => handleReject(pReq.id)}
                      style={styles.rejectBtn}
                    >
                      <X size={14} /> Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE ADICIONAR (PRÉ-CADASTRO) */}
      {showAddModal && (
        <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} className="glass" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {addType === 'aluno' ? 'Pré-Cadastrar Novo Aluno' : 'Pré-Cadastrar Novo Professor'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div style={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdd} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={addType === 'aluno' ? 'Ex: Mariana Souza' : 'Ex: Prof. Roberto Lima'}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp / Celular com DDD:</label>
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: formatPhone(e.target.value) })}
                  placeholder="(11) 99999-8888"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>E-mail:</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemplo.com (opcional no pré-cadastro)"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>CPF:</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  style={styles.input}
                />
              </div>

              {addType === 'professor' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>CREF (Registro Profissional):</label>
                  <input
                    type="text"
                    value={form.cref}
                    onChange={(e) => setForm({ ...form, cref: e.target.value })}
                    placeholder="Ex: 098765-G/SP"
                    style={styles.input}
                  />
                </div>
              )}

              {addType === 'aluno' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Plano / Modalidade:</label>
                  <input
                    type="text"
                    value={form.plano}
                    onChange={(e) => setForm({ ...form, plano: e.target.value })}
                    placeholder="Ex: Musculação Completa"
                    style={styles.input}
                  />
                </div>
              )}

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn} className="btn-primary">
                  Concluir Pré-Cadastro & Gerar Convite
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONVITE WHATSAPP GERADO */}
      {createdInviteModal && (
        <div style={styles.modalOverlay} className="animate-fade-in" onClick={() => setCreatedInviteModal(null)}>
          <div style={styles.modalContent} className="glass" onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} color="#22c55e" />
                </div>
                <h3 style={styles.modalTitle}>Pré-Cadastro Realizado! 🎉</h3>
              </div>
              <button onClick={() => setCreatedInviteModal(null)} style={styles.modalCloseBtn}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '16px' }}>
              <strong>{createdInviteModal.targetUser.name}</strong> foi cadastrado(a) como {createdInviteModal.type === 'aluno' ? 'aluno(a)' : 'professor(a)'}. Envie o convite abaixo para que ele(a) defina sua senha e comece a utilizar o app!
            </p>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '18px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Link de Convite Seguro:</span>
              <input
                type="text"
                readOnly
                value={createdInviteModal.inviteUrl}
                style={{ ...styles.input, fontSize: '0.8rem', padding: '8px 10px', backgroundColor: 'var(--bg-secondary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={createdInviteModal.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.whatsAppActionBtn}
              >
                <Phone size={18} /> Enviar Convite no WhatsApp Agora
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdInviteModal.inviteUrl);
                  setCopiedInviteLink(true);
                  setTimeout(() => setCopiedInviteLink(false), 2500);
                }}
                style={styles.copyActionBtn}
              >
                {copiedInviteLink ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                {copiedInviteLink ? 'Link Copiado para a Área de Transferência!' : 'Copiar Link de Convite'}
              </button>
            </div>
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
    gap: '20px',
  },
  welcomeCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    margin: 0
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
    margin: 0
  },
  addBtnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: 'none'
  },
  addBtnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)'
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#4ade80',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '0.88rem'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    marginBottom: '14px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  kpiValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  kpiSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  tabRow: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    flexWrap: 'wrap'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer'
  },
  tabBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'var(--accent-primary)',
    color: '#c084fc'
  },
  listCard: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0
  },
  tableAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer',
    border: 'none'
  },
  emptyText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    padding: '20px 0',
    textAlign: 'center'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.88rem'
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  tableCellHeader: {
    padding: '10px 12px',
    color: 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '0.8rem'
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  tableCell: {
    padding: '12px',
    color: 'var(--text-primary)'
  },
  preCadBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    color: '#eab308',
    marginLeft: '6px'
  },
  planBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    marginLeft: '6px'
  },
  crefBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    color: '#60a5fa'
  },
  whatsInviteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  deleteBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#f87171',
    cursor: 'pointer'
  },
  pendingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 18px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#22c55e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  rejectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modalContent: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    padding: '24px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  modalTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    outline: 'none'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none'
  },
  cancelBtn: {
    padding: '12px 18px',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)'
  },
  whatsAppActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#22c55e',
    color: '#fff',
    padding: '14px',
    borderRadius: '12px',
    fontWeight: '800',
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
  },
  copyActionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '12px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer'
  }
};

export default Estabelecimento;
