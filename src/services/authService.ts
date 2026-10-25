// Authentication & Master Admin Management Service
// Guarantees SINGLE Administrator ownership across all devices and sessions
// Dual persistence: Server backend + resilient client localStorage

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

const STORAGE_ADMIN_CACHE_KEY = 'master_site_admin_cached_user_v3';
const STORAGE_SESSION_KEY = 'master_site_admin_session_v3';
const STORAGE_SERVER_STATUS_KEY = 'master_site_server_has_admin_v3';

export const authService = {
  // Check cached or quick admin presence
  hasAdminAccount(): boolean {
    const rawStatus = localStorage.getItem(STORAGE_SERVER_STATUS_KEY);
    if (rawStatus !== null) {
      return rawStatus === 'true';
    }
    const rawCache = localStorage.getItem(STORAGE_ADMIN_CACHE_KEY);
    if (rawCache) {
      try {
        const u = JSON.parse(rawCache);
        if (u && u.email) return true;
      } catch {
        // ignore
      }
    }
    return false;
  },

  // Get current logged in user from localStorage session
  getCurrentUser(): AdminUser | null {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    try {
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session.user;
    } catch {
      return null;
    }
  },

  // Get session token
  getSessionToken(): string | null {
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
    const raw = localStorage.getItem(STORAGE_ADMIN_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Sync state with server: verifies if master admin exists globally
  async checkSystemStatus(): Promise<{
    hasAdmin: boolean;
    adminEmail: string | null;
    adminName: string | null;
    createdAt?: string | null;
  }> {
    try {
      const res = await fetch(`/api/auth/status?t=${Date.now()}`, {
        headers: { credentials: 'omit' },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          localStorage.setItem(STORAGE_SERVER_STATUS_KEY, String(data.hasAdmin));

          if (!data.hasAdmin) {
            // Server has no admin registered -> reset local cached admin and session
            localStorage.removeItem(STORAGE_ADMIN_CACHE_KEY);
            localStorage.removeItem(STORAGE_SESSION_KEY);
            localStorage.removeItem('master_site_admin_cached_user_v2');
            localStorage.removeItem('master_site_admin_session_v2');
            localStorage.removeItem('master_site_server_has_admin_v2');
            return {
              hasAdmin: false,
              adminEmail: null,
              adminName: null,
            };
          } else if (data.adminEmail) {
            const current = this.getAdminAccount();
            if (!current || current.email !== data.adminEmail) {
              const updatedAdmin: AdminUser = {
                id: 'admin_master',
                name: data.adminName || 'Super Administrador',
                email: data.adminEmail,
                role: 'super_admin',
                createdAt: data.createdAt || new Date().toISOString(),
                recoveryEmail: data.adminEmail,
              };
              localStorage.setItem(STORAGE_ADMIN_CACHE_KEY, JSON.stringify(updatedAdmin));
            }
          }
          return data;
        }
      }
    } catch (err) {
      console.warn('Could not contact server auth status, falling back to local cache', err);
    }

    // Fallback: check local storage
    const localAdmin = this.getAdminAccount();
    const hasAdmin = Boolean(localAdmin && localAdmin.email);
    return {
      hasAdmin,
      adminEmail: localAdmin?.email || null,
      adminName: localAdmin?.name || null,
      createdAt: localAdmin?.createdAt || null,
    };
  },

  // First-time registration on server: defines the ONLY master administrator
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

        // Cache admin info and session permanently
        localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'true');
        localStorage.setItem(STORAGE_ADMIN_CACHE_KEY, JSON.stringify(adminUser));

        const session: AuthSession = {
          token: body.token || `sess_${Date.now()}`,
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

  // Log in as administrator across any device
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

        localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'true');
        localStorage.setItem(STORAGE_ADMIN_CACHE_KEY, JSON.stringify(adminUser));

        const session: AuthSession = {
          token: body.token || `sess_${Date.now()}`,
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

  // Password Recovery Request
  async requestPasswordRecovery(email: string): Promise<{
    success: boolean;
    message: string;
    token?: string;
    registeredEmail?: string;
  }> {
    try {
      const res = await fetch('/api/auth/recovery/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const body = await res.json();
      return body;
    } catch (err: any) {
      return {
        success: false,
        message: `Falha ao solicitar recuperação: ${err.message}`,
      };
    }
  },

  // Reset password using recovery token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
    user?: AdminUser;
  }> {
    try {
      const res = await fetch('/api/auth/recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });

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

        if (body.token) {
          const session: AuthSession = {
            token: body.token,
            user: adminUser,
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          };
          localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
        }

        return { success: true, message: body.message, user: adminUser };
      }

      return { success: false, message: body.message || 'Código inválido ou expirado.' };
    } catch (err: any) {
      return { success: false, message: `Erro ao redefinir senha: ${err.message}` };
    }
  },

  // Change password for logged in admin
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

  // Reset entire system admin (per user's request)
  async resetSystemAdmin(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/reset-system-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json();

      // Clear client storage completely
      localStorage.removeItem(STORAGE_ADMIN_CACHE_KEY);
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'false');
      localStorage.removeItem('master_site_admin_cached_user_v2');
      localStorage.removeItem('master_site_admin_session_v2');
      localStorage.removeItem('master_site_server_has_admin_v2');
      localStorage.removeItem('master_site_admin_user_v1');
      localStorage.removeItem('master_site_admin_session_v1');

      return body;
    } catch (err: any) {
      // Local fallback reset
      localStorage.removeItem(STORAGE_ADMIN_CACHE_KEY);
      localStorage.removeItem(STORAGE_SESSION_KEY);
      localStorage.setItem(STORAGE_SERVER_STATUS_KEY, 'false');
      return { success: true, message: 'Cadastro local resetado com sucesso.' };
    }
  },
};
