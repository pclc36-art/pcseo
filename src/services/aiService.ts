import { ProjectExtractedData, ProjectType } from '../types';
import { GbpQuestionnaireData, GbpDossier, GbpAuditRequest, GbpAuditReport } from '../types/gbpTypes';
import { parseQuestionnaireHeuristic } from './parserService';
import { 
  generateHeuristicDossier, 
  auditGbpProfileHeuristic, 
  parseGbpRawTextHeuristic 
} from './gbpEngine';

export interface HealthStatus {
  status: string;
  hasKey: boolean;
  activeModel: string;
  engine: string;
}

export async function checkApiHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      hasKey: false,
      activeModel: 'N/A',
      engine: 'Motor Heurístico Determinístico (Nativo)',
    };
  }
}

export async function analyzeQuestionnaire(
  questionnaire: string,
  projectName: string,
  clientName?: string,
  projectType?: ProjectType,
  additionalNotes?: string
): Promise<{ data: ProjectExtractedData; source: 'gemini' | 'heuristic' }> {
  // Always compute heuristic extraction as a base baseline to ensure 100% reliability
  const heuristicBase = parseQuestionnaireHeuristic(
    questionnaire,
    projectName,
    clientName,
    projectType,
    additionalNotes
  );

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionnaire,
        projectName,
        clientName,
        projectType,
        additionalNotes,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        // Merge heuristic with AI analysis to guarantee complete coverage
        const geminiData = json.data;
        const merged: ProjectExtractedData = {
          ...heuristicBase,
          clientName: geminiData.clientName || heuristicBase.clientName,
          companyName: geminiData.companyName || heuristicBase.companyName,
          niche: geminiData.niche || heuristicBase.niche,
          services: Array.isArray(geminiData.services) && geminiData.services.length > 0 ? geminiData.services : heuristicBase.services,
          targetAudience: geminiData.targetAudience || heuristicBase.targetAudience,
          serviceRegion: geminiData.serviceRegion || heuristicBase.serviceRegion,
          hasPhysicalLocation: typeof geminiData.hasPhysicalLocation === 'boolean' ? geminiData.hasPhysicalLocation : heuristicBase.hasPhysicalLocation,
          address: geminiData.address || heuristicBase.address,
          hasWhatsApp: typeof geminiData.hasWhatsApp === 'boolean' ? geminiData.hasWhatsApp : heuristicBase.hasWhatsApp,
          whatsapp: geminiData.whatsapp || heuristicBase.whatsapp,
          phone: geminiData.phone || heuristicBase.phone,
          email: geminiData.email || heuristicBase.email,
          socialLinks: Array.isArray(geminiData.socialLinks) && geminiData.socialLinks.length > 0 ? geminiData.socialLinks : heuristicBase.socialLinks,
          businessGoals: Array.isArray(geminiData.businessGoals) && geminiData.businessGoals.length > 0 ? geminiData.businessGoals : heuristicBase.businessGoals,
          differentials: Array.isArray(geminiData.differentials) && geminiData.differentials.length > 0 ? geminiData.differentials : heuristicBase.differentials,
          audiencePainPoints: Array.isArray(geminiData.audiencePainPoints) && geminiData.audiencePainPoints.length > 0 ? geminiData.audiencePainPoints : heuristicBase.audiencePainPoints,
          benefitsAndTransformation: Array.isArray(geminiData.benefitsAndTransformation) && geminiData.benefitsAndTransformation.length > 0 ? geminiData.benefitsAndTransformation : heuristicBase.benefitsAndTransformation,
          preferencesEsthetic: geminiData.preferencesEsthetic || heuristicBase.preferencesEsthetic,
          references: Array.isArray(geminiData.references) && geminiData.references.length > 0 ? geminiData.references : heuristicBase.references,
          mandatoryContent: Array.isArray(geminiData.mandatoryContent) && geminiData.mandatoryContent.length > 0 ? geminiData.mandatoryContent : heuristicBase.mandatoryContent,
          heroHeadline: geminiData.heroHeadline || heuristicBase.heroHeadline,
          heroSubheadline: geminiData.heroSubheadline || heuristicBase.heroSubheadline,
          heroCtaText: geminiData.heroCtaText || heuristicBase.heroCtaText,
          pricingAndPayment: geminiData.pricingAndPayment || heuristicBase.pricingAndPayment,
          processSteps: Array.isArray(geminiData.processSteps) && geminiData.processSteps.length > 0 ? geminiData.processSteps : heuristicBase.processSteps,
          brandStory: geminiData.brandStory || heuristicBase.brandStory,
          guaranteesAndPolicies: geminiData.guaranteesAndPolicies || heuristicBase.guaranteesAndPolicies,
          openingHours: geminiData.openingHours || heuristicBase.openingHours,
          faqItems: Array.isArray(geminiData.faqItems) && geminiData.faqItems.length > 0 ? geminiData.faqItems : heuristicBase.faqItems,
          availableMediaAssets: geminiData.availableMediaAssets || heuristicBase.availableMediaAssets,
          seoKeywords: Array.isArray(geminiData.seoKeywords) && geminiData.seoKeywords.length > 0 ? geminiData.seoKeywords : heuristicBase.seoKeywords,
          rawBriefingSummary: heuristicBase.rawBriefingSummary,
          missingFields: Array.isArray(geminiData.missingFields) && geminiData.missingFields.length > 0 ? geminiData.missingFields : heuristicBase.missingFields,
          contradictions: Array.isArray(geminiData.contradictions) && geminiData.contradictions.length > 0 ? geminiData.contradictions : heuristicBase.contradictions,
        };
        return { data: merged, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Falha na chamada da API Gemini, usando motor heurístico local:', err);
  }

  return { data: heuristicBase, source: 'heuristic' };
}

/**
 * Generate a complete 13-stage Google Business Profile Dossier focused on Google Maps ranking performance
 */
export async function generateGbpDossier(
  questionnaire: GbpQuestionnaireData
): Promise<{ dossier: GbpDossier; source: 'gemini' | 'heuristic' }> {
  const heuristicFallback = generateHeuristicDossier(questionnaire);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);
    const res = await fetch('/api/gbp/generate-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionnaire }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const mergedDossier: GbpDossier = {
          ...heuristicFallback,
          ...json.data,
          id: `dossier_${Date.now()}`,
          businessName: questionnaire.businessName || heuristicFallback.businessName,
          clientName: questionnaire.businessName || heuristicFallback.clientName,
          updatedAt: new Date().toISOString(),
          generatedBy: 'gemini',
        };
        return { dossier: mergedDossier, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('[apiService] Falha na API Gemini para Dossiê GBP, usando motor heurístico local:', err);
  }

  return { dossier: heuristicFallback, source: 'heuristic' };
}

/**
 * Parse raw questionnaire text using Gemini AI with heuristic fallback
 */
export async function analyzeGbpQuestionnaire(
  rawText: string
): Promise<{ data: Partial<GbpQuestionnaireData>; source: 'gemini' | 'heuristic' }> {
  const heuristicBase = parseGbpRawTextHeuristic(rawText);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('/api/gbp/analyze-questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { data: { ...heuristicBase, ...json.data }, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('[apiService] Falha ao analisar questionário com Gemini, usando heurística:', err);
  }

  return { data: heuristicBase, source: 'heuristic' };
}

/**
 * Audit existing GBP profile or URL for Google Maps ranking compliance
 */
export async function auditGbpProfile(
  request: GbpAuditRequest
): Promise<{ report: GbpAuditReport; source: 'gemini' | 'heuristic' }> {
  const heuristicReport = auditGbpProfileHeuristic(request);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);
    const res = await fetch('/api/gbp/audit-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditRequest: request }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const fullReport: GbpAuditReport = {
          ...heuristicReport,
          ...json.data,
          id: `audit_${Date.now()}`,
          clientName: request.clientName || request.businessName,
          businessName: request.businessName,
          createdAt: new Date().toISOString(),
        };
        return { report: fullReport, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('[apiService] Falha na auditoria de perfil via Gemini, usando heurística:', err);
  }

  return { report: heuristicReport, source: 'heuristic' };
}

// Unified apiService instance
export const apiService = {
  checkApiHealth,
  analyzeQuestionnaire,
  generateGbpDossier,
  analyzeGbpQuestionnaire,
  auditGbpProfile,
};
