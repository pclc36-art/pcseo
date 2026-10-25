import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Server,
  FileText,
  Calendar,
  Building2,
  FolderKanban,
  Check,
  Copy,
  ArrowLeft
} from 'lucide-react';
import { authService, AdminUser } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { gbpDatabase } from '../../services/gbpDatabase';
import { copyToClipboard } from '../../utils/clipboard';

interface AdminAreaViewProps {
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onNavigateToProjects?: () => void;
  onNavigateToGbp?: () => void;
  onBack?: () => void;
}

export const AdminAreaView: React.FC<AdminAreaViewProps> = ({
  onNotify,
  onNavigateToProjects,
  onNavigateToGbp,
  onBack,
}) => {
  const [currentUser, setCurrentUser] = useState<Omit<AdminUser, 'passwordHash'> | null>(null);
  const [hasAdmin, setHasAdmin] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'backups' | 'logs'>('overview');

  // Registration form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Recovery Modal / Flow
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryTokenInput, setRecoveryTokenInput] = useState('');
  const [generatedTokenPreview, setGeneratedTokenPreview] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // Change password in dashboard
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');

  // Stats
  const [stats, setStats] = useState({
    projectsCount: 0,
    gbpDossiersCount: 0,
    gbpAuditsCount: 0,
    customPromptsCount: 0,
  });

  // Copied token state
  const [copiedToken, setCopiedToken] = useState(false);
  const [isResetSystemModalOpen, setIsResetSystemModalOpen] = useState(false);

  useEffect(() => {
    refreshAuthState();
    refreshStats();
  }, []);

  const refreshAuthState = async () => {
    const status = await authService.checkSystemStatus();
    setHasAdmin(status.hasAdmin);
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (!user && status.hasAdmin) {
      const savedAdmin = authService.getAdminAccount();
      if (savedAdmin?.email) {
        setLoginEmail(savedAdmin.email);
      } else if (status.adminEmail) {
        setLoginEmail(status.adminEmail);
      }
    }
  };

  const refreshStats = async () => {
    const projects = storageService.getProjects();
    const dossiers = await gbpDatabase.getDossiers();
    const audits = await gbpDatabase.getAudits();
    const prompts = storageService.getMasterPromptVersions();

    setStats({
      projectsCount: projects.length,
      gbpDossiersCount: dossiers.length,
      gbpAuditsCount: audits.length,
      customPromptsCount: prompts.length,
    });
  };

  // Handle first administrator registration
  const handleRegisterFirstAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      onNotify('Campos Obrigatórios', 'Preencha todos os campos para cadastrar o Administrador.', 'warning');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      onNotify('Senhas Diferentes', 'A confirmação de senha não confere.', 'error');
      return;
    }
    if (regPassword.length < 6) {
      onNotify('Senha Fraca', 'A senha deve conter no mínimo 6 caracteres.', 'warning');
      return;
    }

    const res = await authService.registerFirstAdmin({
      name: regName,
      email: regEmail,
      password: regPassword,
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setHasAdmin(true);
      onNotify(
        'Administrador Cadastrado!',
        `Bem-vindo, ${res.user.name}. Você agora tem privilégios de Super Administrador.`,
        'success'
      );
      refreshStats();
    } else {
      onNotify('Erro no Cadastro', res.message || 'Falha ao registrar.', 'error');
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      onNotify('Preencha os Campos', 'Informe seu e-mail de administrador e senha.', 'warning');
      return;
    }

    const res = await authService.login(loginEmail, loginPassword);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      onNotify('Acesso Autorizado', `Sessão iniciada como Administrador (${res.user.name}).`, 'success');
      refreshStats();
    } else {
      onNotify('Falha na Autenticação', res.message || 'Credenciais inválidas.', 'error');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    onNotify('Sessão Encerrada', 'Você saiu da Área Administrativa.', 'info');
  };

  // Handle Password Recovery - Step 1: Request Token
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      onNotify('E-mail Obrigatório', 'Informe o e-mail do administrador para recuperação.', 'warning');
      return;
    }

    const res = await authService.requestPasswordRecovery(recoveryEmail);
    if (res.success && res.token) {
      setGeneratedTokenPreview(res.token);
      setRecoveryTokenInput(res.token);
      setRecoveryStep(2);
      onNotify(
        'Código Gerado!',
        `Código de recuperação gerado para ${res.registeredEmail}. Utilize o código para redefinir sua senha.`,
        'success'
      );
    } else {
      onNotify('Atenção', res.message, 'error');
    }
  };

  // Handle Password Recovery - Step 2: Reset with Token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryTokenInput.trim() || !newPasswordInput) {
      onNotify('Campos Obrigatórios', 'Digite o código de verificação e a nova senha.', 'warning');
      return;
    }
    if (newPasswordInput !== newPasswordConfirm) {
      onNotify('Senhas Diferentes', 'A confirmação de senha não confere.', 'error');
      return;
    }

    const res = await authService.resetPasswordWithToken(recoveryTokenInput, newPasswordInput);
    if (res.success) {
      setIsRecoveryOpen(false);
      setRecoveryStep(1);
      setRecoveryEmail('');
      setRecoveryTokenInput('');
      setGeneratedTokenPreview(null);
      setNewPasswordInput('');
      setNewPasswordConfirm('');
      await refreshAuthState();
      onNotify('Senha Redefinida!', res.message, 'success');
    } else {
      onNotify('Falha na Redefinição', res.message, 'error');
    }
  };

  // Handle Change Password inside dashboard
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPass || !newPass) {
      onNotify('Campos Obrigatórios', 'Preencha a senha atual e a nova senha.', 'warning');
      return;
    }
    if (newPass !== confirmNewPass) {
      onNotify('Senhas Diferentes', 'A confirmação da nova senha não confere.', 'error');
      return;
    }

    const res = await authService.changePassword(currPass, newPass);
    if (res.success) {
      setCurrPass('');
      setNewPass('');
      setConfirmNewPass('');
      onNotify('Segurança Atualizada', res.message, 'success');
    } else {
      onNotify('Erro', res.message, 'error');
    }
  };

  // Export Complete System Backup
  const handleExportSystemBackup = async () => {
    try {
      const backup = {
        version: '2.5',
        exportedAt: new Date().toISOString(),
        adminUser: authService.getAdminAccount(),
        projects: storageService.getProjects(),
        masterPrompts: storageService.getMasterPromptVersions(),
        gbpDossiers: await gbpDatabase.getDossiers(),
        gbpAudits: await gbpDatabase.getAudits(),
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `backup_master_studio_admin_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      onNotify('Backup Concluído', 'Arquivo JSON de segurança gerado com sucesso.', 'success');
    } catch {
      onNotify('Erro ao Exportar', 'Não foi possível gerar o backup do sistema.', 'error');
    }
  };

  // CASE 1: No admin registered yet -> Show First Administrator Setup
  if (!hasAdmin) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
        {onBack && (
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm group active:scale-95"
              title="Voltar ao Painel Geral"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar ao Painel Geral</span>
            </button>
          </div>
        )}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Primeiro Acesso ao Sistema
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Crie o Administrador do Sistema
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Nenhum administrador está registrado ainda. O primeiro cadastro definirá o 
            <strong className="text-amber-300 font-semibold"> Super Administrador</strong> com 
            acesso irrestrito a configurações, backups, auditorias e gestão da plataforma.
          </p>

          <form onSubmit={handleRegisterFirstAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nome Completo do Administrador
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                E-mail Oficial (Utilizado para Login e Recuperação de Senha)
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Ex: admin@minhaagencia.com.br"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  required
                  value={regPasswordConfirm}
                  onChange={(e) => setRegPasswordConfirm(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                Cadastrar e Definir como Administrador Geral
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // CASE 2: Admin exists, but not currently logged in -> Show Login Screen + Password Recovery
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-4">
        {onBack && (
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm group active:scale-95"
              title="Voltar ao Painel Geral"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Voltar ao Painel Geral</span>
            </button>
          </div>
        )}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4 shadow-lg shadow-indigo-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Área Administrativa</h2>
            <p className="text-xs text-slate-400 mt-1">
              Faça login com a conta de Administrador cadastrada
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                E-mail do Administrador
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(loginEmail);
                    setRecoveryStep(1);
                    setIsRecoveryOpen(true);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              Entrar na Área Administrativa
            </button>
          </form>

          {/* Recovery Modal */}
          {isRecoveryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                    <KeyRound className="w-5 h-5" />
                    Recuperação de Senha do Administrador
                  </div>
                  <button
                    onClick={() => setIsRecoveryOpen(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                {recoveryStep === 1 ? (
                  <form onSubmit={handleRequestRecovery} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Informe o e-mail do administrador cadastrado. O sistema gerará um 
                      <strong className="text-white"> código de verificação seguro</strong> para 
                      redefinição de senha.
                    </p>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        E-mail Cadastrado
                      </label>
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="admin@empresa.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRecoveryOpen(false)}
                        className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Enviar Código de Recuperação
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* Token notification box */}
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 text-xs text-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Código de Segurança Enviado para o E-mail
                      </div>
                      <p className="text-[11px] text-emerald-300/80">
                        Um código de 6 dígitos foi despachado para <strong>{recoveryEmail}</strong>.
                      </p>
                      {generatedTokenPreview && (
                        <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-emerald-500/30">
                          <span className="font-mono text-sm tracking-widest text-emerald-300 font-bold">
                            {generatedTokenPreview}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await copyToClipboard(generatedTokenPreview);
                              if (ok) {
                                setCopiedToken(true);
                                setTimeout(() => setCopiedToken(false), 2000);
                              }
                            }}
                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            {copiedToken ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedToken ? 'Copiado' : 'Copiar'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Código de 6 Dígitos
                      </label>
                      <input
                        type="text"
                        required
                        value={recoveryTokenInput}
                        onChange={(e) => setRecoveryTokenInput(e.target.value)}
                        placeholder="Ex: 849201"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setRecoveryStep(1)}
                        className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Redefinir Senha e Entrar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CASE 3: Authenticated Administrator Dashboard
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Seta de Voltar ao Painel Geral */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm group active:scale-95"
            title="Voltar ao Painel Geral"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar ao Painel Geral</span>
          </button>
        </div>
      )}

      {/* Top Banner Profile */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/10">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold tracking-wide uppercase">
                🛡️ Super Administrador
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sessão Segura Ativa
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{currentUser.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-3 mt-1">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>Cadastrado em: {new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-700/50 text-slate-300 hover:text-rose-200 text-xs font-semibold transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Encerrar Sessão
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-2">
            <span>Dossiês GBP Gerados</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.gbpDossiersCount}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Armazenados localmente</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-2">
            <span>Auditorias de Links</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.gbpAuditsCount}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Relatórios de SEO Local</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-2">
            <span>Projetos de Sites</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.projectsCount}</div>
          <div className="text-[11px] text-indigo-400 mt-1">No Studio Master</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between mb-2">
            <span>Versões de Prompts</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.customPromptsCount}</div>
          <div className="text-[11px] text-amber-400 mt-1">Regras de IA</div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Visão Geral & Recursos
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'security'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Segurança & Senha
        </button>
        <button
          onClick={() => setActiveTab('backups')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'backups'
              ? 'border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Backups & Banco de Dados
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Status dos Módulos da Plataforma
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Módulos ativos e integrados no ambiente local.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    GBP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Google Business Profile Pro</div>
                    <div className="text-[11px] text-slate-400">Auditorias 1-Clique & Dossiês 13 Etapas</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                  Operacional
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    SQ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Super Questionários por Nicho</div>
                    <div className="text-[11px] text-slate-400">6 Nichos (177 perguntas calibradas)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                  100% Calibrado
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    MSP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Master Site Prompt Studio</div>
                    <div className="text-[11px] text-slate-400">Geração de prompts para React, Next e Tailwind</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                  Ativo
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ações Rápidas de Gestão
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Atalhos de produtividade para o Super Administrador.
            </p>

            <div className="space-y-3">
              {onNavigateToGbp && (
                <button
                  onClick={onNavigateToGbp}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <span className="font-semibold text-emerald-400">Ir para GBP Pro & Auditorias</span>
                  <span>→</span>
                </button>
              )}

              {onNavigateToProjects && (
                <button
                  onClick={onNavigateToProjects}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
                >
                  <span className="font-semibold text-indigo-400">Ver Projetos de Sites Cadastrados</span>
                  <span>→</span>
                </button>
              )}

              <button
                onClick={handleExportSystemBackup}
                className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors"
              >
                <span className="font-semibold text-cyan-400">Fazer Download do Backup Completo</span>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            Alteração de Senha do Administrador
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Mantenha sua conta de administrador segura com uma senha forte.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha Atual</label>
              <input
                type="password"
                required
                value={currPass}
                onChange={(e) => setCurrPass(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nova Senha</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Salvar Nova Senha
            </button>
          </form>

          {/* Danger Zone: Reset Administrator Setup */}
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Zona de Exclusividade & Reinício de Cadastro
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Caso deseje transferir a posse exclusiva ou recriar o administrador principal do zero em um novo e-mail,
              você pode reiniciar o registro do sistema.
            </p>
            <button
              type="button"
              onClick={() => setIsResetSystemModalOpen(true)}
              className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Resetar Cadastro de Administrador Geral
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Backups & Database */}
      {activeTab === 'backups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              Backup & Integridade do Banco de Dados
            </h3>
            <p className="text-xs text-slate-400">
              O sistema utiliza IndexedDB + LocalStorage para persistência de alta performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Download className="w-4 h-4 text-cyan-400" />
                Exportar Backup Geral (JSON)
              </div>
              <p className="text-xs text-slate-400">
                Gera um arquivo com todos os dados: projetos, dossiês de perfil, auditorias e configurações.
              </p>
              <button
                onClick={handleExportSystemBackup}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Arquivo JSON de Backup
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                Otimização & Sincronização
              </div>
              <p className="text-xs text-slate-400">
                Verifica consistência de índices no IndexedDB e limpa itens temporários órfãos.
              </p>
              <button
                onClick={async () => {
                  await refreshStats();
                  onNotify('Banco Otimizado', 'Todos os índices do IndexedDB estão operacionais e íntegros.', 'success');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/40 rounded-xl text-xs font-semibold flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Otimizar e Validar Índices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET SYSTEM ADMIN CONFIRMATION */}
      {isResetSystemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Resetar Cadastro de Administrador?</h3>
            <p className="text-xs text-slate-300 text-center leading-relaxed">
              Tem certeza de que deseja resetar o cadastro do Administrador? O sistema liberará a tela para um novo cadastro exclusivo.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetSystemModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await authService.resetSystemAdmin();
                  if (res.success) {
                    onNotify('Administrador Resetado', res.message, 'info');
                    window.location.reload();
                  } else {
                    onNotify('Erro ao Resetar', res.message, 'error');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Sim, Resetar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
