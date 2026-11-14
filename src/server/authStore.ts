import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

export interface ServerAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
  authEpoch: string;
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
}

// Epoch bumped specifically to reset any pre-existing login credentials once,
// while preserving any newly registered credentials across future deploys and devices.
export const CURRENT_AUTH_EPOCH = 'reset_2026_exclusive_v1';

const LEGACY_DATA_DIR = path.resolve(process.cwd(), '.data');
const LEGACY_ADMIN_FILE = path.join(LEGACY_DATA_DIR, 'admin_account.json');

function resolvePersistentDataDir(): string {
  const candidates = [
    path.join(os.homedir(), '.master-site-prompt-studio'),
    LEGACY_DATA_DIR,
  ];

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      // try next candidate
    }
  }

  return LEGACY_DATA_DIR;
}

const DATA_DIR = resolvePersistentDataDir();
const ADMIN_FILE = path.join(DATA_DIR, 'admin_account.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create auth data directory:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [userPart, domainPart] = parts;
  const maskedUser =
    userPart.length > 3
      ? `${userPart[0]}${'*'.repeat(Math.min(userPart.length - 2, 6))}${userPart[userPart.length - 1]}`
      : `${userPart[0] || '*'}***`;
  return `${maskedUser}@${domainPart}`;
}

function safeUnlink(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore cleanup failure
  }
}

function writeAdminFile(admin: ServerAdminUser): void {
  ensureDataDir();
  const tempPath = `${ADMIN_FILE}.tmp.${process.pid}`;
  fs.writeFileSync(tempPath, JSON.stringify(admin, null, 2), 'utf-8');
  fs.renameSync(tempPath, ADMIN_FILE);
}

function readAdminFile(): ServerAdminUser | null {
  ensureDataDir();

  if (LEGACY_ADMIN_FILE !== ADMIN_FILE && fs.existsSync(LEGACY_ADMIN_FILE)) {
    try {
      const legacyRaw = fs.readFileSync(LEGACY_ADMIN_FILE, 'utf-8');
      const legacyParsed: Partial<ServerAdminUser> = JSON.parse(legacyRaw);
      if (legacyParsed.authEpoch !== CURRENT_AUTH_EPOCH) {
        safeUnlink(LEGACY_ADMIN_FILE);
      } else if (!fs.existsSync(ADMIN_FILE)) {
        writeAdminFile(legacyParsed as ServerAdminUser);
        safeUnlink(LEGACY_ADMIN_FILE);
      }
    } catch {
      safeUnlink(LEGACY_ADMIN_FILE);
    }
  }

  if (!fs.existsSync(ADMIN_FILE)) return null;

  try {
    const content = fs.readFileSync(ADMIN_FILE, 'utf-8');
    const data: Partial<ServerAdminUser> = JSON.parse(content);

    if (!data || !data.email || !data.passwordHash || data.authEpoch !== CURRENT_AUTH_EPOCH) {
      safeUnlink(ADMIN_FILE);
      return null;
    }

    return data as ServerAdminUser;
  } catch {
    return null;
  }
}

export const serverAuthStore = {
  async hasAdmin(): Promise<boolean> {
    return Boolean(readAdminFile());
  },

  async getAdminPublicStatus(): Promise<{
    hasAdmin: boolean;
    maskedEmail: string | null;
    adminName: string | null;
    createdAt: string | null;
    authEpoch: string;
  }> {
    const admin = readAdminFile();
    if (!admin) {
      return {
        hasAdmin: false,
        maskedEmail: null,
        adminName: null,
        createdAt: null,
        authEpoch: CURRENT_AUTH_EPOCH,
      };
    }

    return {
      hasAdmin: true,
      maskedEmail: maskEmail(admin.email),
      adminName: admin.name,
      createdAt: admin.createdAt,
      authEpoch: CURRENT_AUTH_EPOCH,
    };
  },

  async resetAdmin(params?: { token?: string; currentPassword?: string }): Promise<{
    success: boolean;
    message: string;
    unauthorized?: boolean;
  }> {
    const admin = readAdminFile();
    if (!admin) {
      safeUnlink(ADMIN_FILE);
      safeUnlink(LEGACY_ADMIN_FILE);
      return {
        success: true,
        message: 'Sistema pronto para novo cadastro exclusivo.',
      };
    }

    const token = params?.token?.trim();
    const currentPassword = params?.currentPassword?.trim();

    const now = Date.now();
    const hasValidToken = Boolean(
      token && (admin.activeSessions || []).some((s) => s.token === token && s.expiresAt > now)
    );
    const hasValidPassword = Boolean(
      currentPassword && hashPassword(currentPassword, admin.salt) === admin.passwordHash
    );

    if (!hasValidToken || (currentPassword !== undefined && !hasValidPassword)) {
      return {
        success: false,
        unauthorized: true,
        message: 'Autenticação inválida para resetar o administrador. Informe sua senha atual corretamente.',
      };
    }

    try {
      safeUnlink(ADMIN_FILE);
      safeUnlink(LEGACY_ADMIN_FILE);
      return {
        success: true,
        message: 'Cadastro de administrador resetado com sucesso. Você pode cadastrar sua nova senha exclusiva agora.',
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao resetar administrador: ${err.message}` };
    }
  },

  async registerMasterAdmin(data: { name: string; email: string; password: string }): Promise<{
    success: boolean;
    message?: string;
    user?: { id: string; name: string; email: string; role: string };
    token?: string;
  }> {
    if (await this.hasAdmin()) {
      return {
        success: false,
        message: 'O Administrador exclusivo do sistema já está cadastrado. Novos cadastros estão bloqueados por segurança.',
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
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    const admin: ServerAdminUser = {
      id: `admin_master_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'super_admin',
      authEpoch: CURRENT_AUTH_EPOCH,
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
      writeAdminFile(admin);
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

  async login(email: string, password: string): Promise<{
    success: boolean;
    message?: string;
    user?: { id: string; name: string; email: string; role: string };
    token?: string;
  }> {
    const admin = readAdminFile();
    if (!admin) {
      return { success: false, message: 'Nenhum administrador cadastrado no sistema.' };
    }

    try {
      const cleanEmail = email?.trim().toLowerCase();
      if (admin.email.toLowerCase() !== cleanEmail) {
        return { success: false, message: 'E-mail de administrador não confere.' };
      }

      const inputHash = hashPassword(password?.trim() || '', admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: 'Senha incorreta.' };
      }

      const sessionToken = `admin_sess_${crypto.randomBytes(32).toString('hex')}`;
      const now = Date.now();
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

      admin.lastLogin = new Date().toISOString();
      if (!Array.isArray(admin.activeSessions)) {
        admin.activeSessions = [];
      }
      admin.activeSessions = [
        ...admin.activeSessions.filter((s) => s.expiresAt > now),
        { token: sessionToken, createdAt: now, expiresAt },
      ].slice(-25);

      writeAdminFile(admin);

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

  async validateSession(token: string): Promise<{
    valid: boolean;
    user?: { id: string; name: string; email: string; role: string; createdAt: string };
  }> {
    if (!token) return { valid: false };
    const admin = readAdminFile();
    if (!admin) return { valid: false };

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
        createdAt: admin.createdAt,
      },
    };
  },

  async logout(token: string): Promise<void> {
    const admin = readAdminFile();
    if (!admin) return;
    try {
      admin.activeSessions = (admin.activeSessions || []).filter((s) => s.token !== token);
      writeAdminFile(admin);
    } catch {
      // ignore
    }
  },

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const admin = readAdminFile();
    if (!admin) {
      return { success: false, message: 'Administrador não cadastrado.' };
    }

    try {
      const sess = (admin.activeSessions || []).find((s) => s.token === token && s.expiresAt > Date.now());
      if (!sess) {
        return { success: false, message: 'Sessão inválida ou expirada. Faça login novamente.' };
      }

      const inputHash = hashPassword(currentPassword?.trim() || '', admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: 'Senha atual incorreta.' };
      }

      const cleanNew = newPassword?.trim() || '';
      if (cleanNew.length < 6) {
        return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
      }

      const newSalt = crypto.randomBytes(16).toString('hex');
      admin.passwordHash = hashPassword(cleanNew, newSalt);
      admin.salt = newSalt;
      admin.activeSessions = [sess];

      writeAdminFile(admin);
      return {
        success: true,
        message: 'Senha atualizada com sucesso! Todos os novos acessos em qualquer aparelho usarão esta nova senha.',
      };
    } catch (err: any) {
      return { success: false, message: `Falha ao alterar senha: ${err.message}` };
    }
  },
};
