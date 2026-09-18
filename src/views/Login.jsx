import React, { useState, useEffect } from 'react';
import { useApp, DEFAULT_USERS } from '../context/AppContext';
import { 
  Dumbbell, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  FileText, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  KeyRound, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  ShieldCheck,
  Calendar,
  X
} from 'lucide-react';
import { 
  validateCPF, 
  validateCNPJ, 
  validateDoc, 
  formatCPF, 
  formatCNPJ, 
  formatDoc, 
  formatPhone, 
  cleanDigits 
} from '../utils/validators';

const Login = () => {
  const { 
    login, 
    usersList, 
    tenants, 
    registerUser, 
    resetPasswordByCpf, 
    completeInviteRegistration 
  } = useApp();

  // Estados principais
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot_password', 'invite'
  const [identifier, setIdentifier] = useState(''); // Email ou CPF
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [multipleAccounts, setMultipleAccounts] = useState(null); // Perfis múltiplos para o mesmo CPF

  // Estados do Cadastro Multi-Perfil
  const [regRole, setRegRole] = useState('aluno'); // 'aluno', 'professor', 'estabelecimento'
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    cpf: '',
    cnpj: '',
    responsavel: '',
    cref: '',
    especialidades: '',
    dataNascimento: '',
    subdomain: '',
    hasProfessor: false,
    professorTargetId: '',
    password: '',
    confirmPassword: ''
  });

  // Estados da Recuperação de Senha por CPF
  const [forgotForm, setForgotForm] = useState({
    cpf: '',
    confirmValue: '', // email, data de nascimento ou whatsapp
    newPassword: '',
    confirmNewPassword: ''
  });

  // Estados do Fluxo de Convite via URL
  const [inviteData, setInviteData] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    cpf: '',
    password: '',
    confirmPassword: ''
  });

  // Detecta parâmetro de convite na URL (?invite=true&userId=...&profName=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isInvite = params.get('invite');
      const userId = params.get('userId');
      const profName = params.get('profName');

      if (isInvite && userId) {
        const found = (usersList || []).find(u => u.id === userId);
        setInviteData({
          userId,
          studentName: found?.name || 'Aluno Convidado',
          email: found?.email || '',
          profName: profName || found?.nomeProfessorVinculado || 'Seu Professor/Academia',
          foundUser: found
        });
        setAuthMode('invite');
      }
    }
  }, [usersList]);

  // Lista de Professores e Academias disponíveis para vínculo do Aluno
  const availableProfessors = (usersList || []).filter(u => u.role === 'professor');
  const availableGyms = Object.values(tenants || {});

  // Handler de Digitação de Identificador (Formata se for numérico/CPF)
  const handleIdentifierChange = (val) => {
    const digitsOnly = cleanDigits(val);
    // Se o usuário digitou apenas números ou caracteres de CPF e não tem @
    if (!val.includes('@') && digitsOnly.length > 0 && digitsOnly.length <= 11 && /^[0-9.\-_ ]+$/.test(val)) {
      setIdentifier(formatCPF(val));
    } else {
      setIdentifier(val);
    }
  };

  // Handler de Login Direto
  const handleLoginSubmit = (e, selectedUserId = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = login(identifier, password, selectedUserId);
      setLoading(false);
      if (res.multipleAccounts) {
        setMultipleAccounts(res.accounts);
      } else if (!res.success) {
        setError(res.message || 'E-mail/CPF ou senha incorretos. Tente novamente.');
      }
    }, 200);
  };

  // Handler de Cadastro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regForm.password !== regForm.confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (regForm.password.length < 3) {
      setError('A senha deve conter no mínimo 3 caracteres.');
      return;
    }

    // Validação de documento
    if (regRole === 'aluno' || regRole === 'professor') {
      if (!validateCPF(regForm.cpf)) {
        setError('O CPF informado é inválido. Digite um CPF válido.');
        return;
      }
    } else if (regRole === 'estabelecimento') {
      const doc = regForm.cnpj || regForm.cpf;
      if (!validateDoc(doc)) {
        setError('O CNPJ/CPF da academia é inválido.');
        return;
      }
    }

    setLoading(true);
    try {
      await registerUser({
        name: regForm.name,
        email: regForm.email,
        whatsapp: regForm.whatsapp,
        telefone: regForm.whatsapp,
        cpf: regForm.cpf,
        cnpj: regForm.cnpj,
        responsavel: regForm.responsavel,
        cref: regForm.cref,
        especialidades: regForm.especialidades,
        dataNascimento: regForm.dataNascimento,
        role: regRole,
        password: regForm.password,
        professorTargetId: regForm.hasProfessor ? regForm.professorTargetId : null
      });

      setSuccessMsg('Conta criada com sucesso! Faça login para começar.');
      setIdentifier(regForm.email);
      setPassword(regForm.password);
      setAuthMode('login');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  // Handler de Recuperação de Senha por CPF
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateCPF(forgotForm.cpf)) {
      setError('CPF inválido. Digite um CPF válido com 11 dígitos.');
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }

    if (forgotForm.newPassword.length < 3) {
      setError('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordByCpf(
        forgotForm.cpf,
        forgotForm.confirmValue,
        forgotForm.newPassword
      );
      setSuccessMsg(res.message || 'Senha redefinida com sucesso!');
      setPassword(forgotForm.newPassword);
      setAuthMode('login');
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  // Handler de Concluir Cadastro de Convite
  const handleCompleteInviteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validateCPF(inviteForm.cpf)) {
      setError('Por favor, informe um CPF válido.');
      return;
    }

    if (inviteForm.password !== inviteForm.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (inviteForm.password.length < 3) {
      setError('A senha deve ter no mínimo 3 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await completeInviteRegistration(
        inviteData.userId,
        inviteForm.cpf,
        inviteForm.password
      );
      setSuccessMsg('Cadastro ativado com sucesso! Bem-vindo ao Fit Seven.');
      // Remove params da URL
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      setError(err.message || 'Erro ao ativar convite.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'master':
        return { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', color: '#c084fc', label: '👑 MASTER' };
      case 'professor':
        return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa', label: '👨‍🏫 PROFESSOR' };
      case 'aluno':
        return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', color: '#4ade80', label: '🏋️ ALUNO' };
      default:
        return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', color: '#fb923c', label: '🏢 ACADEMIA' };
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.card} className="glass">
        
        {/* Topo / Logotipo */}
        <div style={styles.logoContainer}>
          <img 
            src="/fit-seven/assets/logo.jpg" 
            alt="Fit Seven Logo" 
            style={styles.logoImg} 
          />
          <h1 style={styles.title}>Fit Seven</h1>
          <p style={styles.subtitle}>Plataforma Fitness Inteligente & Multi-Tenant</p>
        </div>

        {/* Alertas de Erro ou Sucesso */}
        {error && (
          <div style={styles.errorAlert} className="animate-fade-in">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={styles.successAlert} className="animate-fade-in">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 1: LOGIN DIRETO (E-mail ou CPF)                                      */}
        {/* ========================================================================= */}
        {authMode === 'login' && !multipleAccounts && (
          <div className="animate-fade-in">
            <form onSubmit={(e) => handleLoginSubmit(e)} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>E-mail ou CPF</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    placeholder="seu.email@fitseven.com ou 000.000.000-00"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>Senha</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMsg(''); setAuthMode('forgot_password'); }}
                    style={styles.forgotPassBtn}
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    style={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    aria-label="Alternar visibilidade da senha"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={styles.submitBtn} 
                className="btn-primary"
              >
                {loading ? 'Acessando...' : 'Acessar Plataforma'}
              </button>
            </form>

            <div style={styles.registerCtaContainer}>
              <p style={styles.registerCtaText}>Não tem uma conta?</p>
              <button 
                type="button"
                onClick={() => { setError(''); setSuccessMsg(''); setAuthMode('register'); }}
                style={styles.registerCtaBtn}
              >
                Criar Nova Conta Gratuitamente
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SELETOR DE PERFIL QUANDO O MESMO CPF POSSUI MÚLTIPLAS CONTAS (Ex: Master) */}
        {/* ========================================================================= */}
        {authMode === 'login' && multipleAccounts && (
          <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Selecione seu Perfil
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Identificamos múltiplos perfis vinculados ao CPF <strong>{identifier}</strong>. Escolha como deseja acessar:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {multipleAccounts.map(account => {
                const badgeStyle = getRoleBadgeStyle(account.role);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleLoginSubmit(null, account.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: `1px solid ${badgeStyle.border}`,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '800', 
                          padding: '2px 8px', 
                          borderRadius: '6px', 
                          backgroundColor: badgeStyle.bg, 
                          color: badgeStyle.color 
                        }}>
                          {badgeStyle.label}
                        </span>
                        <strong style={{ fontSize: '0.95rem' }}>{account.name}</strong>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{account.email}</span>
                    </div>
                    <ArrowRight size={18} color={badgeStyle.color} />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => { setMultipleAccounts(null); setError(''); }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Voltar / Digitar outro login
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 2: CADASTRO MULTI-PERFIL (ALUNO, PROFESSOR, ACADEMIA)                */}
        {/* ========================================================================= */}
        {authMode === 'register' && (
          <div className="animate-fade-in">
            <div style={styles.headerBackRow}>
              <h2 style={styles.formSectionTitle}>Criar Minha Conta</h2>
              <button 
                type="button" 
                onClick={() => { setError(''); setSuccessMsg(''); setAuthMode('login'); }}
                style={styles.backToLoginBtn}
              >
                Já tenho conta
              </button>
            </div>

            {/* Seletor de Perfil */}
            <div style={styles.roleSelectorGrid}>
              <button
                type="button"
                onClick={() => setRegRole('aluno')}
                style={{
                  ...styles.roleTabBtn,
                  ...(regRole === 'aluno' ? styles.roleTabBtnActive : {})
                }}
              >
                <User size={16} />
                <span>Aluno</span>
              </button>

              <button
                type="button"
                onClick={() => setRegRole('professor')}
                style={{
                  ...styles.roleTabBtn,
                  ...(regRole === 'professor' ? styles.roleTabBtnActive : {})
                }}
              >
                <Dumbbell size={16} />
                <span>Professor</span>
              </button>

              <button
                type="button"
                onClick={() => setRegRole('estabelecimento')}
                style={{
                  ...styles.roleTabBtn,
                  ...(regRole === 'estabelecimento' ? styles.roleTabBtnActive : {})
                }}
              >
                <Building2 size={16} />
                <span>Academia</span>
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={styles.form}>
              
              {/* Nome / Razão Social */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  {regRole === 'estabelecimento' ? 'Nome da Academia / Razão Social' : 'Nome Completo'}
                </label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder={regRole === 'estabelecimento' ? 'Ex: Matrix Fitness Club' : 'Ex: João Carlos Silva'}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Responsável (se Academia) */}
              {regRole === 'estabelecimento' && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome do Responsável / Gestor</label>
                  <div style={styles.inputWrapper}>
                    <UserCheck size={18} style={styles.inputIcon} />
                    <input
                      type="text"
                      value={regForm.responsavel}
                      onChange={(e) => setRegForm({ ...regForm, responsavel: e.target.value })}
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              )}

              {/* E-mail */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>E-mail</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="seu.email@exemplo.com"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>WhatsApp / Celular com DDD</label>
                <div style={styles.inputWrapper}>
                  <Phone size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={regForm.whatsapp}
                    onChange={(e) => setRegForm({ ...regForm, whatsapp: formatPhone(e.target.value) })}
                    placeholder="(11) 98888-7777"
                    maxLength={15}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* CPF ou CNPJ com Validação Rigorosa */}
              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>
                    {regRole === 'estabelecimento' ? 'CNPJ ou CPF do Responsável' : 'CPF (Obrigatório)'}
                  </label>
                  {regForm.cpf && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      color: (regRole === 'estabelecimento' ? validateDoc(regForm.cpf) : validateCPF(regForm.cpf)) ? '#4ade80' : '#f87171' 
                    }}>
                      {(regRole === 'estabelecimento' ? validateDoc(regForm.cpf) : validateCPF(regForm.cpf)) ? '✓ Válido' : '✗ Inválido'}
                    </span>
                  )}
                </div>
                <div style={styles.inputWrapper}>
                  <FileText size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={regForm.cpf}
                    onChange={(e) => setRegForm({ 
                      ...regForm, 
                      cpf: regRole === 'estabelecimento' ? formatDoc(e.target.value) : formatCPF(e.target.value) 
                    })}
                    placeholder={regRole === 'estabelecimento' ? '00.000.000/0001-00 ou CPF' : '000.000.000-00'}
                    maxLength={regRole === 'estabelecimento' ? 18 : 14}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              {/* Campos específicos de Professor: CREF & Especialidades */}
              {regRole === 'professor' && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>CREF (Registro Profissional)</label>
                    <div style={styles.inputWrapper}>
                      <ShieldCheck size={18} style={styles.inputIcon} />
                      <input
                        type="text"
                        value={regForm.cref}
                        onChange={(e) => setRegForm({ ...regForm, cref: e.target.value })}
                        placeholder="Ex: 012345-G/SP"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Especialidades / Foco de Atuação</label>
                    <div style={styles.inputWrapper}>
                      <Sparkles size={18} style={styles.inputIcon} />
                      <input
                        type="text"
                        value={regForm.especialidades}
                        onChange={(e) => setRegForm({ ...regForm, especialidades: e.target.value })}
                        placeholder="Ex: Hipertrofia, Emagrecimento, Biomecânica"
                        style={styles.input}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Campos específicos de Aluno: Data de Nascimento & Escolha de Vínculo */}
              {regRole === 'aluno' && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Data de Nascimento</label>
                    <div style={styles.inputWrapper}>
                      <Calendar size={18} style={styles.inputIcon} />
                      <input
                        type="date"
                        value={regForm.dataNascimento}
                        onChange={(e) => setRegForm({ ...regForm, dataNascimento: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  {/* Seleção de Vínculo com Professor / Academia */}
                  <div style={styles.linkChoiceCard}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="linkChoice"
                        checked={!regForm.hasProfessor}
                        onChange={() => setRegForm({ ...regForm, hasProfessor: false, professorTargetId: '' })}
                      />
                      <div>
                        <strong>Treinar de Forma Independente</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Treinos montados automaticamente pela Inteligência Artificial Fit Seven.
                        </p>
                      </div>
                    </label>

                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="linkChoice"
                        checked={regForm.hasProfessor}
                        onChange={() => setRegForm({ ...regForm, hasProfessor: true })}
                      />
                      <div>
                        <strong>Vincular a um Professor / Academia</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Treinos prescritos diretamente pelo seu Personal ou Academia.
                        </p>
                      </div>
                    </label>

                    {regForm.hasProfessor && (
                      <div style={{ marginTop: '12px' }} className="animate-fade-in">
                        <label style={styles.label}>Selecione seu Professor ou Academia</label>
                        <select
                          value={regForm.professorTargetId}
                          onChange={(e) => setRegForm({ ...regForm, professorTargetId: e.target.value })}
                          style={styles.select}
                          required={regForm.hasProfessor}
                        >
                          <option value="">-- Escolha na lista --</option>
                          <optgroup label="Professores / Personais">
                            {availableProfessors.map(p => (
                              <option key={p.id} value={p.id}>
                                {'👨‍🏫 ' + p.name + (p.cref ? ' (CREF: ' + p.cref + ')' : '')}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Academias / Studios">
                            {availableGyms.map(g => (
                              <option key={g.id} value={g.id}>
                                🏢 {g.name}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '6px' }}>
                          ℹ️ A vinculação passará por aprovação do professor para liberação dos seus treinos.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Senha e Confirmação */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Criar Senha</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Mínimo 3 caracteres"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar Senha</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Repita sua senha"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={styles.submitBtn} 
                className="btn-primary"
              >
                {loading ? 'Cadastrando...' : ('Finalizar Cadastro como ' + regRole.toUpperCase())}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 3: RECUPERAÇÃO DE SENHA POR CPF (SEM CUSTO DE E-MAIL)                */}
        {/* ========================================================================= */}
        {authMode === 'forgot_password' && (
          <div className="animate-fade-in">
            <div style={styles.headerBackRow}>
              <h2 style={styles.formSectionTitle}>Recuperação de Senha</h2>
              <button 
                type="button" 
                onClick={() => { setError(''); setSuccessMsg(''); setAuthMode('login'); }}
                style={styles.backToLoginBtn}
              >
                Voltar ao Login
              </button>
            </div>

            <p style={styles.helpText}>
              Por segurança e sem depender de e-mails, confirme seu <strong>CPF</strong> e um dado de segurança para redefinir sua senha imediatamente.
            </p>

            <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>CPF Cadastrado</label>
                <div style={styles.inputWrapper}>
                  <FileText size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={forgotForm.cpf}
                    onChange={(e) => setForgotForm({ ...forgotForm, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmação de Segurança (Data de Nascimento, E-mail ou WhatsApp)</label>
                <div style={styles.inputWrapper}>
                  <ShieldCheck size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={forgotForm.confirmValue}
                    onChange={(e) => setForgotForm({ ...forgotForm, confirmValue: e.target.value })}
                    placeholder="Ex: 19/12/1986, seu.email@fitseven.com ou (11) 99999-8888"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Nova Senha</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                    placeholder="Digite a nova senha"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar Nova Senha</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    value={forgotForm.confirmNewPassword}
                    onChange={(e) => setForgotForm({ ...forgotForm, confirmNewPassword: e.target.value })}
                    placeholder="Repita a nova senha"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={styles.submitBtn} 
                className="btn-primary"
              >
                {loading ? 'Validando...' : 'Redefinir Minha Senha'}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODO 4: FINALIZAR CADASTRO DE CONVITE VIA WHATSAPP                        */}
        {/* ========================================================================= */}
        {authMode === 'invite' && inviteData && (
          <div className="animate-fade-in">
            <div style={styles.inviteWelcomeBox}>
              <div style={styles.inviteIconCircle}>
                <Sparkles size={28} color="#a855f7" />
              </div>
              <h2 style={styles.inviteTitle}>Olá, {inviteData.studentName}! 🎉</h2>
              <p style={styles.inviteSubtitle}>
                Seu cadastro no Fit Seven foi preparado por <strong>{inviteData.profName}</strong>.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Complete seu CPF e crie sua senha pessoal para acessar seus treinos personalizados:
              </p>
            </div>

            <form onSubmit={handleCompleteInviteSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirme seu CPF</label>
                <div style={styles.inputWrapper}>
                  <FileText size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    value={inviteForm.cpf}
                    onChange={(e) => setInviteForm({ ...inviteForm, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Criar Senha Pessoal</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    value={inviteForm.password}
                    onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                    placeholder="Digite sua nova senha"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirmar Senha</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type="password"
                    value={inviteForm.confirmPassword}
                    onChange={(e) => setInviteForm({ ...inviteForm, confirmPassword: e.target.value })}
                    placeholder="Repita sua senha"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                style={styles.submitBtn} 
                className="btn-primary"
              >
                {loading ? 'Ativando Conta...' : 'Ativar Meu Acesso e Entrar'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
    background: 'radial-gradient(circle at top center, rgba(168, 85, 247, 0.15) 0%, rgba(15, 23, 42, 0) 70%), var(--bg-primary)'
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '24px',
    padding: '28px 24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    border: '1px solid var(--border-color)'
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  logoImg: {
    width: '68px',
    height: '68px',
    borderRadius: '18px',
    objectFit: 'cover',
    boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)',
    marginBottom: '12px'
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    margin: '0 0 4px 0',
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    margin: 0
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#f87171',
    padding: '12px 14px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginBottom: '16px'
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#4ade80',
    padding: '12px 14px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)'
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  select: {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  forgotPassBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-primary)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    padding: 0,
    fontWeight: '600'
  },
  submitBtn: {
    marginTop: '6px',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  registerCtaContainer: {
    textAlign: 'center',
    marginTop: '18px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border-color)'
  },
  registerCtaText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    margin: '0 0 6px 0'
  },
  registerCtaBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-primary)',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '4px'
  },
  headerBackRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  formSectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
    color: 'var(--text-primary)'
  },
  backToLoginBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: '600'
  },
  roleSelectorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '16px'
  },
  roleTabBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 6px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  roleTabBtnActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'var(--accent-primary)',
    color: '#c084fc'
  },
  linkChoiceCard: {
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  helpText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '16px'
  },
  inviteWelcomeBox: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '16px',
    marginBottom: '16px'
  },
  inviteIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px auto'
  },
  inviteTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0 0 6px 0'
  },
  inviteSubtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    margin: '0 0 8px 0'
  },
  demoAccordionContainer: {
    marginTop: '20px',
    borderTop: '1px dashed var(--border-color)',
    paddingTop: '14px'
  },
  demoAccordionBtn: {
    width: '100%',
    background: 'none',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '6px 0'
  },
  demoSection: {
    marginTop: '12px'
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '8px'
  },
  demoBadge: {
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    cursor: 'pointer',
    transition: 'transform 0.15s, opacity 0.15s'
  },
  demoBadgeRole: {
    fontSize: '0.65rem',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  demoBadgeName: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  demoBadgeEmail: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
};

export default Login;
