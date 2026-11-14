import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

export interface AdminSessionRecord {
  token: string;
  createdAt: number;
  expiresAt: number;
}

export interface ServerAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
  authEpoch: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  passwordHash: string;
  salt: string;
  recoveryEmail: string;
  activeSessions?: AdminSessionRecord[];
}

interface ResetMarker {
  resetAt: number;
}

// Epoch bumped specifically to reset pre-existing credentials once
export const CURRENT_AUTH_EPOCH = 'reset_2026_exclusive_v1';

// Single authorized exclusive owner email — prevents anyone else from ever registering
export const AUTHORIZED_OWNER_EMAIL = 'pclc36@gmail.com';

const WORKSPACE_DATA_DIR = path.resolve(process.cwd(), '.data');
const WORKSPACE_ADMIN_FILE = path.join(WORKSPACE_DATA_DIR, 'admin_account.json');

const HOME_DATA_DIR = path.join(os.homedir(), '.master-site-prompt-studio');
const HOME_ADMIN_FILE = path.join(HOME_DATA_DIR, 'admin_account.json');

function resolveRuntimeDir(): string {
  try {
    if (!fs.existsSync(HOME_DATA_DIR)) {
      fs.mkdirSync(HOME_DATA_DIR, { recursive: true });
    }
    fs.accessSync(HOME_DATA_DIR, fs.constants.W_OK);
    return HOME_DATA_DIR;
  } catch {
    try {
      if (!fs.existsSync(WORKSPACE_DATA_DIR)) {
        fs.mkdirSync(WORKSPACE_DATA_DIR, { recursive: true });
      }
      return WORKSPACE_DATA_DIR;
    } catch {
      return WORKSPACE_DATA_DIR;
    }
  }
}

const RUNTIME_DIR = resolveRuntimeDir();
const SESSIONS_FILE = path.join(RUNTIME_DIR, 'sessions.json');
const RESET_MARKER_FILE = path.join(RUNTIME_DIR, 'reset_marker.json');

function ensureDir(dir: string): void {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // ignore if read-only
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
    // ignore
  }
}

function readJsonSafe<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJsonAtomic(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

function getTimestamp(admin: Partial<ServerAdminUser>): number {
  const ts = Date.parse(admin.updatedAt || admin.createdAt || '');
  return Number.isFinite(ts) ? ts : 0;
}

function isValidCurrentEpochAdmin(data: Partial<ServerAdminUser> | null): data is ServerAdminUser {
  return Boolean(
    data &&
      data.email &&
      data.passwordHash &&
      data.salt &&
      data.authEpoch === CURRENT_AUTH_EPOCH &&
      data.email.trim().toLowerCase() === AUTHORIZED_OWNER_EMAIL
  );
}

function stripSessions(admin: ServerAdminUser): Omit<ServerAdminUser, 'activeSessions'> {
  const { activeSessions: _ignored, ...rest } = admin;
  return rest;
}

function readSessions(fallbackAdmin?: ServerAdminUser | null): AdminSessionRecord[] {
  const now = Date.now();
  const stored = readJsonSafe<AdminSessionRecord[]>(SESSIONS_FILE);
  if (Array.isArray(stored)) {
    return stored.filter((s) => s && s.token && s.expiresAt > now);
  }
  if (fallbackAdmin && Array.isArray(fallbackAdmin.activeSessions)) {
    const migrated = fallbackAdmin.activeSessions.filter((s) => s && s.token && s.expiresAt > now);
    if (migrated.length > 0) {
      try {
        writeJsonAtomic(SESSIONS_FILE, migrated);
      } catch {
        // ignore
      }
    }
    return migrated;
  }
  return [];
}

function writeSessions(sessions: AdminSessionRecord[]): void {
  const now = Date.now();
  const clean = sessions.filter((s) => s && s.token && s.expiresAt > now).slice(-25);
  writeJsonAtomic(SESSIONS_FILE, clean);
}

function readAdminRecord(): ServerAdminUser | null {
  const resetMarker = readJsonSafe<ResetMarker>(RESET_MARKER_FILE);
  const resetAt = resetMarker?.resetAt || 0;

  const homeRaw = readJsonSafe<Partial<ServerAdminUser>>(HOME_ADMIN_FILE);
  const workspaceRaw = readJsonSafe<Partial<ServerAdminUser>>(WORKSPACE_ADMIN_FILE);

  const homeValid = isValidCurrentEpochAdmin(homeRaw) && getTimestamp(homeRaw) >= resetAt ? homeRaw : null;
  const workspaceValid =
    isValidCurrentEpochAdmin(workspaceRaw) && getTimestamp(workspaceRaw) >= resetAt ? workspaceRaw : null;

  // Clean up any stale pre-reset files
  if (homeRaw && !isValidCurrentEpochAdmin(homeRaw)) {
    safeUnlink(HOME_ADMIN_FILE);
  }
  if (workspaceRaw && !isValidCurrentEpochAdmin(workspaceRaw)) {
    safeUnlink(WORKSPACE_ADMIN_FILE);
  }

  let chosen: ServerAdminUser | null = null;
  if (homeValid && workspaceValid) {
    chosen = getTimestamp(homeValid) >= getTimestamp(workspaceValid) ? homeValid : workspaceValid;
  } else {
    chosen = homeValid || workspaceValid;
  }

  if (!chosen) return null;

  // Keep both locations synchronized without exposing session tokens in workspace file
  const sanitized = stripSessions(chosen);
  try {
    if (!homeValid || getTimestamp(chosen) > getTimestamp(homeValid)) {
      writeJsonAtomic(HOME_ADMIN_FILE, sanitized);
    }
  } catch {
    // ignore if home dir read-only
  }
  try {
    if (!workspaceValid || getTimestamp(chosen) > getTimestamp(workspaceValid)) {
      writeJsonAtomic(WORKSPACE_ADMIN_FILE, sanitized);
    }
  } catch {
    // ignore if workspace dir read-only
  }

  // Ensure legacy inline sessions are migrated to sessions.json
  if (Array.isArray(chosen.activeSessions) && chosen.activeSessions.length > 0) {
    readSessions(chosen);
  }

  return chosen;
}

function writeAdminRecord(admin: ServerAdminUser): void {
  const sanitized = stripSessions({
    ...admin,
    updatedAt: admin.updatedAt || new Date().toISOString(),
  });
  safeUnlink(RESET_MARKER_FILE);

  let wroteAnywhere = false;
  try {
    writeJsonAtomic(HOME_ADMIN_FILE, sanitized);
    wroteAnywhere = true;
  } catch {
    // fallback to workspace
  }
  try {
    writeJsonAtomic(WORKSPACE_ADMIN_FILE, sanitized);
    wroteAnywhere = true;
  } catch {
    // ignore if read-only
  }

  if (!wroteAnywhere) {
    throw new Error('Não foi possível gravar o arquivo de credenciais no servidor.');
  }
}

export const serverAuthStore = {
  async hasAdmin(): Promise<boolean> {
    return Boolean(readAdminRecord());
  },

  async getAdminPublicStatus(): Promise<{
    hasAdmin: boolean;
    maskedEmail: string | null;
    adminName: string | null;
    createdAt: string | null;
    authEpoch: string;
    exclusiveOwnerOnly: boolean;
  }> {
    const admin = readAdminRecord();
    if (!admin) {
      return {
        hasAdmin: false,
        maskedEmail: null,
        adminName: null,
        createdAt: null,
        authEpoch: CURRENT_AUTH_EPOCH,
        exclusiveOwnerOnly: true,
      };
    }

    return {
      hasAdmin: true,
      maskedEmail: maskEmail(admin.email),
      adminName: admin.name,
      createdAt: admin.createdAt,
      authEpoch: CURRENT_AUTH_EPOCH,
      exclusiveOwnerOnly: true,
    };
  },

  async resetAdmin(params?: { token?: string; currentPassword?: string }): Promise<{
    success: boolean;
    message: string;
    unauthorized?: boolean;
  }> {
    const admin = readAdminRecord();
    if (!admin) {
      safeUnlink(HOME_ADMIN_FILE);
      safeUnlink(WORKSPACE_ADMIN_FILE);
      safeUnlink(SESSIONS_FILE);
      return {
        success: true,
        message: 'Sistema pronto para o cadastro exclusivo do proprietário.',
      };
    }

    const token = params?.token?.trim();
    const currentPassword = params?.currentPassword?.trim();

    const sessions = readSessions(admin);
    const hasValidToken = Boolean(token && sessions.some((s) => s.token === token));
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
      safeUnlink(HOME_ADMIN_FILE);
      safeUnlink(WORKSPACE_ADMIN_FILE);
      safeUnlink(SESSIONS_FILE);
      writeJsonAtomic(RESET_MARKER_FILE, { resetAt: Date.now() });
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
        message: 'O Administrador exclusivo já está cadastrado. Novos cadastros estão bloqueados em todos os aparelhos.',
      };
    }

    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPass = data.password?.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, message: 'Todos os campos são obrigatórios.' };
    }

    if (cleanEmail !== AUTHORIZED_OWNER_EMAIL) {
      return {
        success: false,
        message: 'Acesso negado: este aplicativo é de uso exclusivo do proprietário autorizado.',
      };
    }

    if (cleanPass.length < 6) {
      return { success: false, message: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(cleanPass, salt);
    const sessionToken = `admin_sess_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    const admin: ServerAdminUser = {
      id: `admin_master_${now}`,
      name: cleanName,
      email: cleanEmail,
      role: 'super_admin',
      authEpoch: CURRENT_AUTH_EPOCH,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLogin: nowIso,
      passwordHash,
      salt,
      recoveryEmail: cleanEmail,
    };

    try {
      writeAdminRecord(admin);
      writeSessions([{ token: sessionToken, createdAt: now, expiresAt }]);
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
    const admin = readAdminRecord();
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

      const sessions = readSessions(admin);
      writeSessions([...sessions, { token: sessionToken, createdAt: now, expiresAt }]);

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
    const admin = readAdminRecord();
    if (!admin) return { valid: false };

    const sessions = readSessions(admin);
    const active = sessions.find((s) => s.token === token);
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
    const admin = readAdminRecord();
    if (!admin) return;
    try {
      const sessions = readSessions(admin).filter((s) => s.token !== token);
      writeSessions(sessions);
    } catch {
      // ignore
    }
  },

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const admin = readAdminRecord();
    if (!admin) {
      return { success: false, message: 'Administrador não cadastrado.' };
    }

    try {
      const sessions = readSessions(admin);
      const sess = sessions.find((s) => s.token === token);
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
      admin.updatedAt = new Date().toISOString();

      writeAdminRecord(admin);
      writeSessions([sess]);
      return {
        success: true,
        message: 'Senha atualizada com sucesso! Todos os novos acessos em qualquer aparelho usarão esta nova senha.',
      };
    } catch (err: any) {
      return { success: false, message: `Falha ao alterar senha: ${err.message}` };
    }
  },
};
