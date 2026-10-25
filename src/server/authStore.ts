import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface ServerAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
  createdAt: string;
  lastLogin?: string;
  passwordHash: string;
  salt: string;
  recoveryEmail: string;
  activeSessions: {
    token: string;
    createdAt: number;
    expiresAt: number;
  }[];
  recoveryRequest?: {
    token: string;
    expiresAt: number;
    requestedAt: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin_account.json');

// Ensure storage directory exists
function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create .data directory:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export const serverAuthStore = {
  // Check if admin is currently registered on the server
  hasAdmin(): boolean {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return false;
    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const data: ServerAdminUser = JSON.parse(content);
      return Boolean(data && data.email && data.passwordHash);
    } catch {
      return false;
    }
  },

  // Read admin data safely (never returns passwordHash or salt)
  getAdminSafe(): { id: string; name: string; email: string; role: string; createdAt: string; lastLogin?: string } | null {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return null;
    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const data: ServerAdminUser = JSON.parse(content);
      if (!data || !data.email) return null;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || 'super_admin',
        createdAt: data.createdAt,
        lastLogin: data.lastLogin,
      };
    } catch {
      return null;
    }
  },

  // Reset admin (wipe admin account so the user can make a brand new registration)
  resetAdmin(): { success: boolean; message: string } {
    ensureDataDir();
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        fs.unlinkSync(ADMIN_FILE);
      }
      return { success: true, message: 'Cadastro de administrador reiniciado com sucesso. O sistema está pronto para seu novo cadastro exclusivo.' };
    } catch (err: any) {
      return { success: false, message: `Erro ao resetar administrador: ${err.message}` };
    }
  },

  // Register the first and ONLY Administrator
  registerMasterAdmin(data: { name: string; email: string; password: string }): {
    success: boolean;
    message?: string;
    user?: { id: string; name: string; email: string; role: string };
    token?: string;
  } {
    ensureDataDir();
    if (this.hasAdmin()) {
      return {
        success: false,
        message: 'O Administrador do sistema já está cadastrado. Novos cadastros estão bloqueados por segurança.',
      };
    }

    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPass = data.password?.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, message: 'Todos os campos são obrigatórios.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, message: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(cleanPass, salt);
    const sessionToken = `admin_sess_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days session

    const admin: ServerAdminUser = {
      id: `admin_master_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'super_admin',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      passwordHash,
      salt,
      recoveryEmail: cleanEmail,
      activeSessions: [
        {
          token: sessionToken,
          createdAt: now,
          expiresAt,
        },
      ],
    };

    try {
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');
      return {
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token: sessionToken,
      };
    } catch (err: any) {
      return { success: false, message: `Falha ao salvar administrador no servidor: ${err.message}` };
    }
  },

  // Log in as master admin
  login(email: string, password: string): {
    success: boolean;
    message?: string;
    user?: { id: string; name: string; email: string; role: string };
    token?: string;
  } {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: 'Nenhum administrador cadastrado no sistema.' };
    }

    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const admin: ServerAdminUser = JSON.parse(content);

      const cleanEmail = email?.trim().toLowerCase();
      if (admin.email.toLowerCase() !== cleanEmail) {
        return { success: false, message: 'E-mail de administrador não confere.' };
      }

      const inputHash = hashPassword(password?.trim() || '', admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: 'Senha incorreta.' };
      }

      // Generate new session
      const sessionToken = `admin_sess_${crypto.randomBytes(32).toString('hex')}`;
      const now = Date.now();
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days

      admin.lastLogin = new Date().toISOString();
      if (!Array.isArray(admin.activeSessions)) {
        admin.activeSessions = [];
      }
      // Keep up to 10 active sessions across devices
      admin.activeSessions = [
        ...admin.activeSessions.filter((s) => s.expiresAt > now),
        { token: sessionToken, createdAt: now, expiresAt },
      ].slice(-10);

      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');

      return {
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token: sessionToken,
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao autenticar: ${err.message}` };
    }
  },

  // Validate session token
  validateSession(token: string): {
    valid: boolean;
    user?: { id: string; name: string; email: string; role: string };
  } {
    if (!token) return { valid: false };
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return { valid: false };

    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const admin: ServerAdminUser = JSON.parse(content);
      const now = Date.now();

      const active = (admin.activeSessions || []).find((s) => s.token === token && s.expiresAt > now);
      if (!active) return { valid: false };

      return {
        valid: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch {
      return { valid: false };
    }
  },

  // Destroy session
  logout(token: string): void {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return;
    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const admin: ServerAdminUser = JSON.parse(content);
      admin.activeSessions = (admin.activeSessions || []).filter((s) => s.token !== token);
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  },

  // Request password recovery
  requestPasswordRecovery(email: string): {
    success: boolean;
    message: string;
    token?: string;
    registeredEmail?: string;
  } {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: 'Nenhum administrador cadastrado no sistema.' };
    }

    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const admin: ServerAdminUser = JSON.parse(content);
      const cleanEmail = email?.trim().toLowerCase();

      if (admin.email.toLowerCase() !== cleanEmail) {
        return {
          success: false,
          message: 'O e-mail digitado não corresponde ao administrador cadastrado no sistema.',
        };
      }

      // Generate 6-digit code
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      admin.recoveryRequest = {
        token,
        requestedAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
      };

      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');

      return {
        success: true,
        message: `Código de recuperação gerado para o e-mail do administrador (${admin.email}).`,
        token,
        registeredEmail: admin.email,
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao processar recuperação: ${err.message}` };
    }
  },

  // Reset password using recovery token
  resetPasswordWithToken(token: string, newPassword: string): {
    success: boolean;
    message: string;
    token?: string;
    user?: { id: string; name: string; email: string; role: string };
  } {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: 'Nenhum administrador cadastrado.' };
    }

    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const admin: ServerAdminUser = JSON.parse(content);

      if (!admin.recoveryRequest) {
        return { success: false, message: 'Nenhuma solicitação de recuperação ativa.' };
      }

      if (Date.now() > admin.recoveryRequest.expiresAt) {
        delete admin.recoveryRequest;
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');
        return { success: false, message: 'O código de recuperação expirou. Solicite um novo.' };
      }

      if (admin.recoveryRequest.token !== token.trim()) {
        return { success: false, message: 'Código de verificação incorreto.' };
      }

      if (!newPassword || newPassword.length < 6) {
        return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
      }

      // Update password with fresh salt
      const salt = crypto.randomBytes(16).toString('hex');
      admin.passwordHash = hashPassword(newPassword.trim(), salt);
      admin.salt = salt;
      delete admin.recoveryRequest;

      // Create new session token
      const sessionToken = `admin_sess_${crypto.randomBytes(32).toString('hex')}`;
      const now = Date.now();
      admin.activeSessions = [
        {
          token: sessionToken,
          createdAt: now,
          expiresAt: now + 30 * 24 * 60 * 60 * 1000,
        },
      ];

      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');

      return {
        success: true,
        message: 'Senha redefinida com sucesso! Você já foi autenticado.',
        token: sessionToken,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao redefinir senha: ${err.message}` };
    }
  },

  // Change password while logged in
  changePassword(token: string, currentPassword: string, newPassword: string): {
    success: boolean;
    message: string;
  } {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: 'Administrador não cadastrado.' };
    }

    try {
      const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
      const admin: ServerAdminUser = JSON.parse(content);

      const sess = (admin.activeSessions || []).find((s) => s.token === token && s.expiresAt > Date.now());
      if (!sess) {
        return { success: false, message: 'Sessão inválida ou expirada. Faça login novamente.' };
      }

      const inputHash = hashPassword(currentPassword, admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: 'Senha atual incorreta.' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      admin.passwordHash = hashPassword(newPassword.trim(), newSalt);
      admin.salt = newSalt;

      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), 'utf-8');
      return { success: true, message: 'Senha de administrador alterada com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Falha ao alterar senha: ${err.message}` };
    }
  },
};
