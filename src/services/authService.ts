// Authentication & Master Admin Management Service
// Guarantees SINGLE Administrator ownership across all devices and sessions
// Synchronized directly with the central Node.js server store

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  lastLogin?: string;
  recoveryEmail?: string;
}

export interface AuthSession {
  token: string;
  user: AdminUser;
  expiresAt: number;
}

export interface SystemAuthStatus {
  hasAdmin: boolean;
  maskedEmail: string | null;
  adminName: string | null;
  createdAt?: string | null;
  serverConnected: boolean;
  authEpoch?: string;
}

const CURRENT_AUTH_EPOCH = 'reset_2026_exclusive_v1';
const STORAGE_AUTH_EPOCH_KEY = 'master_site_auth_epoch';
const STORAGE_ADMIN_CACHE_KEY = 'master_site_admin_cached_user_v3';
const STORAGE_SESSION_KEY = 'master_site_admin_session_v3';
const STORAGE_SERVER_STATUS_KEY = 'master_site_server_has_admin_v3';
const STORAGE_LAST_EMAIL_KEY = 'master_site_last_admin_email_v4';

function clearAllAuthLocalStorage(): void {
  const keys = [
    STORAGE_ADMIN_CACHE_KEY,
    STORAGE_SESSION_KEY,
    STORAGE_SERVER_STATUS_KEY,
    STORAGE_LAST_EMAIL_KEY,
    'master_site_admin_cached_user_v2',
    'master_site_admin_session_v2',
    'master_site_server_has_admin_v2',
    'master_site_admin_user_v1',
    'master_site_admin_session_v1',
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

function ensureAuthEpochSynced(serverEpoch?: string): void {
  const targetEpoch = serverEpoch || CURRENT_AUTH_EPOCH;
  const savedEpoch = localStorage.getItem(STORAGE_AUTH_EPOCH_KEY);
  if (savedEpoch !== targetEpoch) {
    clearAllAuthLocalStorage();
    localStorage.setItem(STORAGE_AUTH_EPOCH_KEY, targetEpoch);
  }
}

export const authService = {
  // Check cached admin presence (for synchronous UI hints)
  hasAdminAccount(): boolean {
    ensureAuthEpochSynced();
    const rawStatus = localStorage.getItem(STORAGE_SERVER_STATUS_KEY);
    if (rawStatus !== null) {
      return rawStatus === 'true';
    }
    return false;
  },

  // Get current logged in user from localStorage session
  getCurrentUser(): AdminUser | null {
    ensureAuthEpochSynced();
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      return session.user || null;
    } catch {
      return null;
    }
  },

  // Get last logged email saved locally on THIS device only
  getRememberedEmail(): string {
    ensureAuthEpochSynced();
    return localStorage.getItem(STORAGE_LAST_EMAIL_KEY) || '';
  },

  // Get session token
  getSessionToken(): string | null {
    ensureAuthEpochSynced();
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      return session.token || null;
    } catch {
      return null;
    }
  },

  // Get cached administrator metadata
  getAdminAccount(): AdminUser | null {
    ensureAuthEpochSynced();
    const raw = localStorage.getItem(STORAGE_ADMIN_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Sync state with central server: verifies if master admin exists globally
  async checkSystemStatus(): Promise<SystemAuthStatus> {
    ensureAuthEpochSynced();
    try {
      const res = await fetch(`/api/auth/status?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data.authEpoch) {
            ensureAuthEpochSynced(data.authEpoch);
          }
          localStorage.setItem(STORAGE_SERVER_STATUS_KEY, String(Boolean(data.hasAdmin)));

          if (!data.hasAdmin) {
            // Server has no admin registered -> reset local session/cache on ALL devices
            clearAllAuthLocalStorage();
            localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'false');
            return {
              hasAdmin: false,
              maskedEmail: null,
              adminName: null,
              createdAt: null,
              serverConnected: true,
              authEpoch: data.authEpoch || CURRENT_AUTH_EPOCH,
            };
          }

          return {
            hasAdmin: true,
            maskedEmail: data.maskedEmail || null,
            adminName: data.adminName || 'Administrador',
            createdAt: data.createdAt || null,
            serverConnected: true,
            authEpoch: data.authEpoch || CURRENT_AUTH_EPOCH,
          };
        }
      }
    } catch (err) {
      console.warn('Could not contact server auth status:', err);
    }

    return {
      hasAdmin: this.hasAdminAccount(),
      maskedEmail: null,
      adminName: null,
      createdAt: null,
      serverConnected: false,
      authEpoch: CURRENT_AUTH_EPOCH,
    };
  },

  // Verify stored token against central server (keeps all devices synced after password change or reset)
  async verifySessionWithServer(): Promise<AdminUser | null> {
    const token = this.getSessionToken();
    if (!token) return null;

    try {
      const res = await fetch('/api/auth/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        return this.getCurrentUser();
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return this.getCurrentUser();
      }

      const body = await res.json();
      if (body.valid && body.user) {
        const verifiedUser: AdminUser = {
          id: body.user.id,
          name: body.user.name,
          email: body.user.email,
          role: 'super_admin',
          createdAt: body.user.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          recoveryEmail: body.user.email,
        };
        localStorage.setItem(STORAGE_ADMIN_CACHE_KEY, JSON.stringify(verifiedUser));
        localStorage.setItem(STORAGE_LAST_EMAIL_KEY, verifiedUser.email);
        return verifiedUser;
      }

      // Session invalidated on server (password changed or admin reset from another device)
      localStorage.removeItem(STORAGE_SESSION_KEY);
      return null;
    } catch {
      // Transient network hiccup: rely on local session until next check
      return this.getCurrentUser();
    }
  },

  // First-time registration on server: defines the ONLY master administrator across all devices
  async registerFirstAdmin(data: { name: string; email: string; password: string }): Promise<{
    success: boolean;
    user?: AdminUser;
    message?: string;
  }> {
    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPassword = data.password?.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return { success: false, message: 'Todos os campos são obrigatórios.' };
    }

    if (cleanPassword.length < 6) {
      return {
        success: false,
        message: 'A senha de administrador deve conter no mínimo 6 caracteres.',
      };
    }

    try {
      const res = await fetch('/api/auth/register-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password: cleanPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          message: 'Servidor Node.js (/api/auth) indisponível. Verifique se a aplicação Node.js está rodando na Hostinger.',
        };
      }

      const body = await res.json();

      if (res.ok && body.success && body.user) {
        const adminUser: AdminUser = {
          id: body.user.id || `admin_master_${Date.now()}`,
          name: body.user.name,
          email: body.user.email,
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          recoveryEmail: body.user.email,
        };

        localStorage.setItem(STORAGE_AUTH_EPOCH_KEY, CURRENT_AUTH_EPOCH);
        localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'true');
        localStorage.setItem(STORAGE_ADMIN_CACHE_KEY, JSON.stringify(adminUser));
        localStorage.setItem(STORAGE_LAST_EMAIL_KEY, adminUser.email);

        const session: AuthSession = {
          token: body.token,
          user: adminUser,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

        return { success: true, user: adminUser };
      } else {
        return {
          success: false,
          message: body.message || 'Falha ao cadastrar o administrador no servidor.',
        };
      }
    } catch (err: any) {
      return { success: false, message: `Erro de conexão ao cadastrar: ${err.message}` };
    }
  },

  // Log in as administrator from any device with the same server credentials
  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: AdminUser;
    message?: string;
  }> {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPassword = password?.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'E-mail e senha são obrigatórios.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          message: 'Servidor Node.js (/api/auth) indisponível. Verifique o servidor na Hostinger.',
        };
      }

      const body = await res.json();

      if (res.ok && body.success && body.user) {
        const adminUser: AdminUser = {
          id: body.user.id,
          name: body.user.name,
          email: body.user.email,
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          recoveryEmail: body.user.email,
        };

        localStorage.setItem(STORAGE_AUTH_EPOCH_KEY, CURRENT_AUTH_EPOCH);
        localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'true');
        localStorage.setItem(STORAGE_ADMIN_CACHE_KEY, JSON.stringify(adminUser));
        localStorage.setItem(STORAGE_LAST_EMAIL_KEY, adminUser.email);

        const session: AuthSession = {
          token: body.token,
          user: adminUser,
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

        return { success: true, user: adminUser };
      } else {
        return { success: false, message: body.message || 'Credenciais inválidas.' };
      }
    } catch (err: any) {
      return { success: false, message: `Erro de rede ao autenticar: ${err.message}` };
    }
  },

  // Logout from current device
  async logout(): Promise<void> {
    const token = this.getSessionToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },

  // Change password for logged in admin (updates global server password for all devices)
  async changePassword(currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const token = this.getSessionToken();
    if (!token) {
      return { success: false, message: 'Sessão expirada. Faça login novamente.' };
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, currentPassword, newPassword }),
      });

      const body = await res.json();
      return body;
    } catch (err: any) {
      return { success: false, message: `Erro ao alterar senha: ${err.message}` };
    }
  },

  // Protected reset of system admin (requires password confirmation)
  async resetSystemAdmin(params?: { currentPassword?: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    const token = this.getSessionToken();
    try {
      const res = await fetch('/api/auth/reset-system-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          currentPassword: params?.currentPassword,
        }),
      });
      const body = await res.json();

      if (res.ok && body.success) {
        clearAllAuthLocalStorage();
        localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'false');
        localStorage.setItem(STORAGE_AUTH_EPOCH_KEY, CURRENT_AUTH_EPOCH);
      }

      return body;
    } catch (err: any) {
      return { success: false, message: `Erro de conexão ao resetar: ${err.message}` };
    }
  },
};
