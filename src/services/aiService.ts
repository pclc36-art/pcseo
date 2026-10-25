import { ProjectExtractedData, ProjectType } from '../types';
import { parseQuestionnaireHeuristic } from './parserService';

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
    });

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
