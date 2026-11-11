import { MasterPromptVersion, Project } from '../types';
import { SiteAuditReport } from '../types/siteAuditTypes';
import { 
  DEFAULT_MASTER_PROMPT_CONTENT, 
  DEFAULT_MASTER_PROMPT_VERSION,
  DEFAULT_MASTER_PROMPT_TITLE 
} from '../data/defaultMasterPrompt';

const STORAGE_KEYS = {
  MASTER_PROMPTS: 'master_site_prompt_versions_v1',
  ACTIVE_MASTER_ID: 'master_site_prompt_active_id_v1',
  PROJECTS: 'master_site_projects_v1',
  SETTINGS: 'master_site_settings_v1',
  ACTIVE_PROJECT_ID: 'master_site_active_project_id_v1',
};

// Initial default master prompt
const initialDefaultMasterVersion: MasterPromptVersion = {
  id: 'master-v11-0-default',
  version: DEFAULT_MASTER_PROMPT_VERSION,
  title: DEFAULT_MASTER_PROMPT_TITLE,
  description: 'Sistema Supremo com Psicologia das Cores, Identidade Visual Adaptativa, 63 Diretrizes Inegociáveis e Personalização por Nicho.',
  content: DEFAULT_MASTER_PROMPT_CONTENT,
  characterCount: DEFAULT_MASTER_PROMPT_CONTENT.length,
  createdAt: '2026-11-09T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  isDefault: true,
};

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // ==========================================
  // MASTER PROMPT VERSIONS
  // ==========================================
  getMasterPromptVersions(): MasterPromptVersion[] {
    if (!this.isBrowser()) return [initialDefaultMasterVersion];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MASTER_PROMPTS);
      if (!raw) {
        // Initialize with default v11.0
        const initial = [initialDefaultMasterVersion];
        localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(initial));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MASTER_ID, initialDefaultMasterVersion.id);
        return initial;
      }
      let parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [initialDefaultMasterVersion];
      }
      // If v11.0 is not in the list, inject and activate v11.0 as default
      const hasV11 = parsed.some((v: MasterPromptVersion) => v.version === 'v11.0' || v.id === 'master-v11-0-default');
      if (!hasV11) {
        parsed = [initialDefaultMasterVersion, ...parsed.map((v: MasterPromptVersion) => ({ ...v, isDefault: false }))];
        localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(parsed));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MASTER_ID, initialDefaultMasterVersion.id);
      } else {
        // Keep master synchronized with latest DEFAULT_MASTER_PROMPT_CONTENT
        const vIndex = parsed.findIndex((v: MasterPromptVersion) => v.id === 'master-v11-0-default' || v.version === 'v11.0' || v.id === 'master-v9-0-default' || v.version === 'v9.0');
        if (vIndex >= 0 && parsed[vIndex].content !== DEFAULT_MASTER_PROMPT_CONTENT) {
          parsed[vIndex].id = initialDefaultMasterVersion.id;
          parsed[vIndex].version = initialDefaultMasterVersion.version;
          parsed[vIndex].content = DEFAULT_MASTER_PROMPT_CONTENT;
          parsed[vIndex].title = initialDefaultMasterVersion.title;
          parsed[vIndex].description = initialDefaultMasterVersion.description;
          parsed[vIndex].characterCount = DEFAULT_MASTER_PROMPT_CONTENT.length;
          parsed[vIndex].updatedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(parsed));
        }
      }
      return parsed;
    } catch (e) {
      console.warn('Erro ao ler versões do Master Prompt do localStorage, retornando padrão:', e);
      return [initialDefaultMasterVersion];
    }
  }

  getActiveMasterPrompt(): MasterPromptVersion {
    const versions = this.getMasterPromptVersions();
    if (!this.isBrowser()) return versions[0];
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MASTER_ID);
    const found = versions.find((v) => v.id === activeId);
    return found || versions[0];
  }

  setActiveMasterPrompt(id: string): boolean {
    if (!this.isBrowser()) return false;
    const versions = this.getMasterPromptVersions();
    const exists = versions.some((v) => v.id === id);
    if (!exists) return false;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MASTER_ID, id);
    return true;
  }

  saveMasterPromptVersion(newVersion: Omit<MasterPromptVersion, 'id' | 'createdAt' | 'updatedAt' | 'characterCount'>): MasterPromptVersion {
    const versions = this.getMasterPromptVersions();
    const id = `version_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    
    const versionObj: MasterPromptVersion = {
      ...newVersion,
      id,
      characterCount: newVersion.content.length,
      createdAt: now,
      updatedAt: now,
      isDefault: false,
    };

    const updated = [versionObj, ...versions];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MASTER_ID, id);
    }
    return versionObj;
  }

  updateMasterPromptVersion(id: string, updates: Partial<MasterPromptVersion>): MasterPromptVersion | null {
    const versions = this.getMasterPromptVersions();
    const index = versions.findIndex((v) => v.id === id);
    if (index === -1) return null;

    const current = versions[index];
    const updatedObj: MasterPromptVersion = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      characterCount: updates.content ? updates.content.length : current.characterCount,
    };

    versions[index] = updatedObj;
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(versions));
    }
    return updatedObj;
  }

  resetToDefaultMasterPrompt(): MasterPromptVersion {
    const defaultCopy: MasterPromptVersion = {
      ...initialDefaultMasterVersion,
      id: `default_${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    const versions = this.getMasterPromptVersions();
    const updated = [defaultCopy, ...versions.filter((v) => !v.isDefault)];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MASTER_ID, defaultCopy.id);
    }
    return defaultCopy;
  }

  deleteMasterPromptVersion(id: string): boolean {
    const versions = this.getMasterPromptVersions();
    if (versions.length <= 1) return false; // Cannot delete last remaining version
    const filtered = versions.filter((v) => v.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(filtered));
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MASTER_ID);
      if (activeId === id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MASTER_ID, filtered[0].id);
      }
    }
    return true;
  }

  // ==========================================
  // PROJECTS CRUD
  // ==========================================
  getProjects(): Project[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Sort newest first
      return parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.warn('Erro ao ler projetos:', e);
      return [];
    }
  }

  getProjectById(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  getActiveProjectId(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
  }

  setActiveProjectId(id: string | null) {
    if (!this.isBrowser()) return;
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    }
  }

  saveProject(project: Project): Project {
    const projects = this.getProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    const now = new Date().toISOString();
    
    let updatedProjects: Project[];
    if (existingIndex >= 0) {
      const updated: Project = {
        ...project,
        updatedAt: now,
      };
      projects[existingIndex] = updated;
      updatedProjects = [...projects];
    } else {
      const newProj: Project = {
        ...project,
        createdAt: project.createdAt || now,
        updatedAt: now,
      };
      updatedProjects = [newProj, ...projects];
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      this.setActiveProjectId(project.id);
    }
    return project;
  }

  duplicateProject(id: string): Project | null {
    const target = this.getProjectById(id);
    if (!target) return null;

    const now = new Date().toISOString();
    const duplicate: Project = {
      ...JSON.parse(JSON.stringify(target)),
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${target.name} (Cópia)`,
      createdAt: now,
      updatedAt: now,
    };

    return this.saveProject(duplicate);
  }

  deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
      const active = this.getActiveProjectId();
      if (active === id) {
        this.setActiveProjectId(null);
      }
    }
    return true;
  }

  // ==========================================
  // SINGLE PROJECT EXPORT & IMPORT (JSON BACKUP)
  // ==========================================
  exportProjectJson(project: Project): string {
    const payload = {
      format: 'master_site_prompt_studio_project',
      schemaVersion: '1.1',
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        projectType: project.projectType,
        targetPlatform: project.targetPlatform,
        hostingTarget: project.hostingTarget || 'hostinger_static',
        preferredFramework: project.preferredFramework || 'Astro (Astro-First)',
        rawQuestionnaire: project.rawQuestionnaire,
        extractedData: project.extractedData,
        additionalNotes: project.additionalNotes,
        masterPromptVersionId: project.masterPromptVersionId,
        masterPromptVersionLabel: project.masterPromptVersionLabel,
        finalPrompt: project.finalPrompt,
        qualityReport: project.qualityReport,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    };
    return JSON.stringify(payload, null, 2);
  }

  importProjectJson(jsonContent: string): { success: boolean; project?: Project; error?: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Arquivo JSON inválido.');
      }

      // Check if it's the wrapped export or raw project
      const rawProject: any = parsed.project || parsed;
      if (!rawProject || !rawProject.name || !rawProject.projectType) {
        throw new Error('Estrutura de dados incompatível: campos "name" ou "projectType" ausentes.');
      }

      const existingProjects = this.getProjects();
      const now = new Date().toISOString();

      // Check ID collisions; if collision, assign new unique ID
      let finalId = rawProject.id;
      if (!finalId || existingProjects.some((p) => p.id === finalId)) {
        finalId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      }

      const projectToSave: Project = {
        id: finalId,
        name: rawProject.name,
        clientName: rawProject.clientName || '',
        projectType: rawProject.projectType,
        targetPlatform: rawProject.targetPlatform || 'ai_site_builder',
        hostingTarget: rawProject.hostingTarget || 'hostinger_static',
        preferredFramework: rawProject.preferredFramework || 'Astro (Astro-First)',
        rawQuestionnaire: rawProject.rawQuestionnaire || '',
        extractedData: rawProject.extractedData || {
          clientName: rawProject.clientName || '',
          companyName: rawProject.name,
          niche: 'Geral',
          services: [],
          targetAudience: 'Não informado',
          serviceRegion: 'Não informado',
          hasPhysicalLocation: false,
          address: 'Não informado',
          hasWhatsApp: false,
          whatsapp: 'Não informado',
          phone: 'Não informado',
          email: 'Não informado',
          socialLinks: [],
          businessGoals: [],
          differentials: [],
          audiencePainPoints: [],
          benefitsAndTransformation: [],
          visualIdentity: { logoAvailable: false, primaryColors: 'Não informado', aestheticStyle: 'Não informado', references: [] },
          preferencesEsthetic: 'Não informado',
          references: [],
          mandatoryContent: [],
          socialProof: { hasRealProof: false, testimonials: [], credentials: [], cases: [] },
          technicalRequirements: [],
          missingFields: [],
          contradictions: [],
          additionalNotes: '',
        },
        additionalNotes: rawProject.additionalNotes || '',
        masterPromptVersionId: rawProject.masterPromptVersionId || 'master-v2-1-default',
        masterPromptVersionLabel: rawProject.masterPromptVersionLabel || 'v2.1',
        finalPrompt: rawProject.finalPrompt || '',
        qualityReport: rawProject.qualityReport,
        status: rawProject.status || (rawProject.finalPrompt ? 'generated' : 'analyzed'),
        createdAt: rawProject.createdAt || now,
        updatedAt: now,
      };

      this.saveProject(projectToSave);
      return { success: true, project: projectToSave };
    } catch (err: any) {
      return { success: false, error: err.message || 'Falha ao importar projeto JSON.' };
    }
  }

  // ==========================================
  // FULL BACKUP & RESTORE
  // ==========================================
  exportFullBackup(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      masterPromptVersions: this.getMasterPromptVersions(),
      activeMasterId: this.isBrowser() ? localStorage.getItem(STORAGE_KEYS.ACTIVE_MASTER_ID) : null,
    };
    return JSON.stringify(data, null, 2);
  }

  importFullBackup(jsonContent: string): { success: boolean; projectsImported: number; versionsImported: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Arquivo de backup inválido');
      }

      let projectsImported = 0;
      let versionsImported = 0;

      if (Array.isArray(parsed.projects)) {
        const existing = this.getProjects();
        // Merge without duplicate IDs
        const existingIds = new Set(existing.map((p) => p.id));
        const merged = [...existing];

        for (const proj of parsed.projects) {
          if (proj && proj.id && proj.name) {
            if (existingIds.has(proj.id)) {
              proj.id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
            merged.push(proj);
            projectsImported++;
          }
        }
        if (this.isBrowser()) {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(merged));
        }
      }

      if (Array.isArray(parsed.masterPromptVersions)) {
        const currentVersions = this.getMasterPromptVersions();
        const currentIds = new Set(currentVersions.map((v) => v.id));
        const mergedVersions = [...currentVersions];

        for (const v of parsed.masterPromptVersions) {
          if (v && v.title && v.content) {
            if (currentIds.has(v.id)) {
              v.id = `version_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            }
            mergedVersions.push(v);
            versionsImported++;
          }
        }
        if (this.isBrowser()) {
          localStorage.setItem(STORAGE_KEYS.MASTER_PROMPTS, JSON.stringify(mergedVersions));
        }
      }

      return { success: true, projectsImported, versionsImported };
    } catch (e: any) {
      return { success: false, projectsImported: 0, versionsImported: 0, error: e.message || 'Falha ao importar backup' };
    }
  }

  getStorageStats(): { projectCount: number; versionCount: number; bytesUsed: number; formattedSize: string } {
    const projects = this.getProjects();
    const versions = this.getMasterPromptVersions();
    let bytes = 0;
    if (this.isBrowser()) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('master_site_')) {
            const val = localStorage.getItem(key) || '';
            bytes += key.length + val.length * 2; // approximation
          }
        }
      } catch (e) {
        bytes = 0;
      }
    }
    const kb = (bytes / 1024).toFixed(1);
    return {
      projectCount: projects.length,
      versionCount: versions.length,
      bytesUsed: bytes,
      formattedSize: `${kb} KB`,
    };
  }

  // ==========================================
  // SITE AUDITS & PAGESPEED METRICS CONSOLIDATION
  // ==========================================
  getSavedSiteAudits(): SiteAuditReport[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem('master_prompt_site_audits_history');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  getPageSpeedMetrics(): {
    totalAudits: number;
    averageScoreDecimal: number;
    averageScore100: number;
    isAverageAbove95: boolean;
    above95Count: number;
    above95Percent: number;
    averageLcpSec: number | null;
    averageCls: number | null;
    averageTtfbMs: number | null;
    latestAudit: SiteAuditReport | null;
    scoreDistribution: {
      elite: number;
      good: number;
      regular: number;
      critical: number;
    };
  } {
    const audits = this.getSavedSiteAudits();
    if (audits.length === 0) {
      return {
        totalAudits: 0,
        averageScoreDecimal: 0,
        averageScore100: 0,
        isAverageAbove95: false,
        above95Count: 0,
        above95Percent: 0,
        averageLcpSec: null,
        averageCls: null,
        averageTtfbMs: null,
        latestAudit: null,
        scoreDistribution: { elite: 0, good: 0, regular: 0, critical: 0 },
      };
    }

    let sumDecimal = 0;
    let above95 = 0;
    let sumLcp = 0;
    let lcpCount = 0;
    let sumCls = 0;
    let clsCount = 0;
    let sumTtfb = 0;
    let ttfbCount = 0;

    const distribution = {
      elite: 0, // >= 9.5
      good: 0, // 8.0 - 9.4
      regular: 0, // 6.0 - 7.9
      critical: 0, // < 6.0
    };

    audits.forEach((audit) => {
      let scoreDec = 0;
      if (audit.pageSpeedData?.scoreDecimal !== undefined) {
        scoreDec = audit.pageSpeedData.scoreDecimal;
      } else if (audit.pageSpeedData?.score !== undefined) {
        scoreDec = Math.round(audit.pageSpeedData.score) / 10;
      } else if (audit.categories10?.performance?.score !== undefined) {
        scoreDec = Math.round(audit.categories10.performance.score) / 10;
      } else {
        scoreDec = Math.round(audit.overallScore) / 10;
      }

      sumDecimal += scoreDec;

      if (scoreDec >= 9.5) {
        above95++;
        distribution.elite++;
      } else if (scoreDec >= 8.0) {
        distribution.good++;
      } else if (scoreDec >= 6.0) {
        distribution.regular++;
      } else {
        distribution.critical++;
      }

      // Web Vitals stats if present
      if (audit.pageSpeedData?.coreWebVitals) {
        const { lcp, cls, ttfb } = audit.pageSpeedData.coreWebVitals;
        if (lcp?.numericValue) {
          sumLcp += lcp.numericValue;
          lcpCount++;
        }
        if (cls?.numericValue !== undefined) {
          sumCls += cls.numericValue;
          clsCount++;
        }
        if (ttfb?.numericValue) {
          sumTtfb += ttfb.numericValue;
          ttfbCount++;
        }
      }
    });

    const avgDecimal = Number((sumDecimal / audits.length).toFixed(1));
    const avgScore100 = Math.round(avgDecimal * 10);
    const above95Percent = Math.round((above95 / audits.length) * 100);

    return {
      totalAudits: audits.length,
      averageScoreDecimal: avgDecimal,
      averageScore100: avgScore100,
      isAverageAbove95: avgDecimal >= 9.5,
      above95Count: above95,
      above95Percent,
      averageLcpSec: lcpCount > 0 ? Number((sumLcp / lcpCount / 1000).toFixed(2)) : null,
      averageCls: clsCount > 0 ? Number((sumCls / clsCount).toFixed(3)) : null,
      averageTtfbMs: ttfbCount > 0 ? Math.round(sumTtfb / ttfbCount) : null,
      latestAudit: audits[0] || null,
      scoreDistribution: distribution,
    };
  }
}

export const storageService = new StorageService();
