export type TargetSolutionType = 'combo_pro' | 'landing_page' | 'institutional_site';

export type ClientCurrentStatus = 
  | 'no_site_no_gmn'
  | 'has_instagram_only'
  | 'has_bad_site'
  | 'has_abandoned_gmn'
  | 'just_starting';

export type PitchTone = 'consultative_high_ticket' | 'direct_urgency' | 'roi_focused';

export interface SalesPitchRequest {
  clientName: string;
  companyName: string;
  niche: string;
  targetSolution: TargetSolutionType;
  cityOrRegion?: string;
  currentStatus?: ClientCurrentStatus;
  tone?: PitchTone;
  extraDetails?: string;
}

export interface DifferentiatorItem {
  id: string;
  title: string;
  headline: string;
  explanation: string;
  whyItMatters: string;
}

export interface PreventiveObjection {
  id: string;
  objection: string;
  trigger: string;
  counterAngle: string;
  scriptSnippet: string;
}

export interface SalesPitchResult {
  clientName: string;
  companyName: string;
  niche: string;
  targetSolution: TargetSolutionType;
  generatedAt: string;
  headline: string;
  summaryExecutive: string;
  pitchWhatsApp: string;
  pitchAudioScript: string;
  pitchEmailOrProposal: string;
  differentiators: DifferentiatorItem[];
  preventiveObjections: PreventiveObjection[];
  whyGmnAndSiteTogether: {
    gmnRole: string;
    siteRole: string;
    theFatalMistake: string;
    theWinningCombo: string;
  };
  seoNota100Explanation: {
    definition: string;
    howWeBuild: string;
    commercialAdvantage: string;
  };
  visualCharmExplanation: {
    definition: string;
    impactOnClient: string;
  };
}

export interface ObjectionSolverRequest {
  clientName?: string;
  companyName?: string;
  niche?: string;
  clientResponse: string;
  targetSolution?: TargetSolutionType;
}

export interface ObjectionSolverResult {
  detectedCategory: string;
  categoryBadge: string;
  psychologyInsight: string;
  whatsappReply: string;
  audioScript: string;
  roiArgument: string;
  urgencyCloser: string;
  followUpPlan: string;
}
