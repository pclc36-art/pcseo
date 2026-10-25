import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Check,
  Copy,
  HelpCircle,
  Eye,
  EyeOff,
  RotateCcw,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { authService, AdminUser } from '../../services/authService';
import { copyToClipboard } from '../../utils/clipboard';

interface AdminGatekeeperViewProps {
  hasAdmin: boolean;
  onAuthenticated: (user: AdminUser) => void;
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AdminGatekeeperView: React.FC<AdminGatekeeperViewProps> = ({
  hasAdmin: initialHasAdmin,
  onAuthenticated,
  onNotify,
}) => {
  const [hasAdmin, setHasAdmin] = useState(initialHasAdmin);
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form State (Only shown if hasAdmin is false)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login Form State (Shown when hasAdmin is true)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Recovery Modal & State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryTokenInput, setRecoveryTokenInput] = useState('');
  const [generatedTokenPreview, setGeneratedTokenPreview] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Reset Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Login Help / Reminder Modal
  const [isLoginHelpOpen, setIsLoginHelpOpen] = useState(false);
  const [registeredEmailHint, setRegisteredEmailHint] = useState<string | null>(null);

  // Sync state whenever props change or on mount
  useEffect(() => {
    setHasAdmin(initialHasAdmin);
  }, [initialHasAdmin]);

  useEffect(() => {
    async function checkCurrentStatus() {
      try {
        const status = await authService.checkSystemStatus();
        setHasAdmin(status.hasAdmin);
        if (status.adminEmail) {
          setLoginEmail(status.adminEmail);
        }
      } catch (err) {
        console.warn('Status check warning:', err);
      }
    }
    checkCurrentStatus();
  }, []);

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
      onNotify('Senha Fraca', 'A senha de administrador deve conter no mínimo 6 caracteres.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.registerFirstAdmin({
        name: regName,
        email: regEmail,
        password: regPassword,
      });

      if (res.success && res.user) {
        setHasAdmin(true);
        onNotify(
          'Administrador Cadastrado!',
          `Bem-vindo, ${res.user.name}. Sua conta de Administrador Único foi gravada com sucesso.`,
          'success'
        );
        onAuthenticated(res.user);
      } else {
        onNotify('Erro no Cadastro', res.message || 'Falha ao registrar.', 'error');
      }
    } catch (err: any) {
      onNotify('Erro de Conexão', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      onNotify('Preencha os Campos', 'Informe seu e-mail de administrador e senha.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(loginEmail, loginPassword);
      if (res.success && res.user) {
        onNotify('Acesso Autorizado', `Bem-vindo de volta, ${res.user.name}!`, 'success');
        onAuthenticated(res.user);
      } else {
        onNotify('Falha na Autenticação', res.message || 'Credenciais inválidas.', 'error');
      }
    } catch (err: any) {
      onNotify('Erro de Conexão', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Recovery - Step 1: Request Token
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      onNotify('E-mail Obrigatório', 'Informe o e-mail do administrador para recuperação.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.requestPasswordRecovery(recoveryEmail);
      if (res.success && res.token) {
        setGeneratedTokenPreview(res.token);
        setRecoveryTokenInput(res.token);
        setRecoveryStep(2);
        onNotify(
          'Código Gerado!',
          `Código de segurança gerado para ${res.registeredEmail}. Utilize-o para redefinir sua senha.`,
          'success'
        );
      } else {
        onNotify('Atenção', res.message, 'error');
      }
    } catch (err: any) {
      onNotify('Erro', err.message, 'error');
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      const res = await authService.resetPasswordWithToken(recoveryTokenInput, newPasswordInput);
      if (res.success && res.user) {
        setIsRecoveryOpen(false);
        setRecoveryStep(1);
        setRecoveryEmail('');
        setRecoveryTokenInput('');
        setGeneratedTokenPreview(null);
        setNewPasswordInput('');
        setNewPasswordConfirm('');
        onNotify('Senha Redefinida!', res.message, 'success');
        onAuthenticated(res.user);
      } else {
        onNotify('Falha na Redefinição', res.message, 'error');
      }
    } catch (err: any) {
      onNotify('Erro', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Complete Admin Reset (Allows user to start fresh)
  const handlePerformAdminReset = async () => {
    setIsLoading(true);
    try {
      await authService.resetSystemAdmin();
      setHasAdmin(false);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegPasswordConfirm('');
      setLoginEmail('');
      setLoginPassword('');
      setIsResetConfirmOpen(false);
      onNotify(
        'Sistema Reiniciado',
        'O cadastro anterior foi resetado. Você pode cadastrar seu Administrador Único agora.',
        'info'
      );
    } catch (err: any) {
      onNotify('Erro ao resetar', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reveal Masked Email for Login Reminder
  const handleCheckLoginEmail = async () => {
    try {
      const status = await authService.checkSystemStatus();
      if (status.adminEmail) {
        const parts = status.adminEmail.split('@');
        const userPart = parts[0];
        const domainPart = parts[1] || '';
        const maskedUser =
          userPart.length > 3
            ? `${userPart[0]}${'*'.repeat(userPart.length - 2)}${userPart[userPart.length - 1]}`
            : `${userPart[0]}***`;
        setRegisteredEmailHint(`${maskedUser}@${domainPart}`);
        setLoginEmail(status.adminEmail);
        setIsLoginHelpOpen(true);
      } else {
        onNotify('Atenção', 'Nenhum administrador identificado.', 'warning');
      }
    } catch {
      onNotify('Erro', 'Não foi possível consultar os dados de login.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10 transition-all">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 shadow-xl shadow-indigo-500/20 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
              <ShieldCheck className="w-9 h-9 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Master Site Prompt Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-sm">
            {hasAdmin
              ? 'Acesso Exclusivo do Administrador Geral'
              : 'Configuração do Administrador Único do Sistema'}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STATE 1: NO ADMIN REGISTERED -> FIRST-TIME EXCLUSIVE SETUP                */}
        {/* ========================================================================= */}
        {!hasAdmin ? (
          <div>
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Cadastro Único e Permanente
              </div>
              <p>
                Este aplicativo é de seu uso privativo. Cadastre abaixo seu nome, e-mail oficial e senha de acesso.
              </p>
              <p className="text-[11px] text-amber-300/80">
                Após este cadastro, o sistema guardará seu acesso exclusivo. Ao abrir em outro aparelho, bastará informar seu e-mail e senha.
              </p>
            </div>

            <form onSubmit={handleRegisterFirstAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Seu Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Paulo César"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Seu E-mail Oficial (Login e Recuperação)
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Ex: pclc36@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      Senha de Acesso
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="text-slate-400 hover:text-slate-300 text-[10px]"
                    >
                      {showRegPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Confirmar Senha
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Cadastrando...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Finalizar Cadastro & Ativar Meu Acesso Único
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* STATE 2: ADMIN IS REGISTERED -> LOGIN SCREEN FOR ANY DEVICE               */
          /* ========================================================================= */
          <div>
            <div className="mb-6 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-white">Administrador Registrado</div>
                  <div className="text-slate-400 text-[11px]">
                    Digite seu e-mail e senha de administrador para entrar.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                title="Resetar cadastro e criar nova conta de administrador"
                className="text-[11px] text-slate-400 hover:text-rose-400 hover:underline flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-rose-950/30"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar Acesso
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    E-mail do Administrador
                  </span>
                  <button
                    type="button"
                    onClick={handleCheckLoginEmail}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Lembrar meu e-mail
                  </button>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seuemail@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    Senha de Acesso
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
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Verificando...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar no Master Site Prompt Studio
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center text-[11px] text-slate-500 space-y-2">
          <p>
            Autenticação Segura • Acesso exclusivo com sincronização persistente entre dispositivos
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: RESET CONFIRMATION                                                 */}
      {/* ========================================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Resetar cadastro do Administrador?</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Esta ação apagará o administrador atual e permitirá que você cadastre novamente seu nome, e-mail e senha a partir do zero.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handlePerformAdminReset}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sim, Resetar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PASSWORD RECOVERY (2-STEP VERIFICATION CODE)                      */}
      {/* ========================================================================= */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <KeyRound className="w-5 h-5" />
                Recuperação de Senha do Administrador
              </div>
              <button
                onClick={() => setIsRecoveryOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleRequestRecovery} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Digite seu e-mail cadastrado como administrador. O sistema gerará um{' '}
                  <strong className="text-white">código de verificação seguro de 6 dígitos</strong>{' '}
                  para redefinição imediata da sua senha.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="seuemail@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryOpen(false)}
                    className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    Gerar Código de Recuperação
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-xs text-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Código de Segurança para {recoveryEmail}
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    Utilize o código de segurança abaixo para definir sua nova senha com segurança:
                  </p>
                  {generatedTokenPreview && (
                    <div className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-xl border border-emerald-500/30">
                      <span className="font-mono text-base tracking-widest text-emerald-300 font-bold">
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
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código de Verificação de 6 Dígitos
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryTokenInput}
                    onChange={(e) => setRecoveryTokenInput(e.target.value)}
                    placeholder="Ex: 582910"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Mínimo 6 dígitos"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar Nova Senha e Entrar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LOGIN REMINDER / EMAIL HINT MODAL                                */}
      {/* ========================================================================= */}
      {isLoginHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Seu E-mail Cadastrado</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              O Administrador Geral está registrado sob o endereço:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-cyan-300 font-mono text-sm mb-4">
              {registeredEmailHint}
            </div>
            <button
              onClick={() => setIsLoginHelpOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Compreendido, Prosseguir com Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
