export interface SiteAuditRequest {
  url: string;
  niche?: string;
  targetObjective?: 'leads' | 'sales' | 'appointments' | 'authority';
  pageType?: 'landing_page' | 'institutional' | 'ecommerce' | 'clinic';
  customNotes?: string;
}

export interface MetricPillarScore {
  name: string;
  score: number; // 0 - 100
  weight?: number; // e.g. 20, 15, 10, 8, 7, 5
  status: 'critical' | 'warning' | 'good' | 'optimal';
  description: string;
  masterPromptRule: string; // e.g., "Diretriz 4 — Design & Identidade Visual (Peso 20%)"
  currentFlaws: string[];
  recommendations: string[];
}

export interface CriticalBlocker {
  id: string;
  title: string;
  evidence: string;
  impact: string;
  correction: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface SiteImprovementAction {
  id: string;
  title: string;
  category: 'uvp' | 'cta' | 'design_system' | 'tech_stack' | 'copywriting' | 'seo' | 'performance';
  impact: 'high' | 'very_high' | 'critical';
  masterPromptReference: string;
  currentIssue: string;
  improvedProposal: string;
  copyableContent: string;
}

export interface SiteOwnerInfo {
  businessName: string;
  ownerOrLeaderName: string; // e.g. "Dr. Lucas Martins", "Dra. Camila Rocha"
  roleOrCredential: string; // e.g. "Médico Responsável Técnico - CRM/SP 189.234", "Advogado - OAB/SP 432.100"
  whatsapp: string; // e.g. "(11) 98765-4321"
  phone: string; // e.g. "(11) 3456-7890"
  email: string; // e.g. "contato@dominio.com.br"
  fullAddress: string; // e.g. "Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
  cityState: string; // e.g. "São Paulo - SP"
  cnpj?: string; // e.g. "12.345.678/0001-90"
  instagram?: string; // e.g. "@clinica.dr.lucas"
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  bioOrAboutSummary: string; // Resumo do perfil/história da empresa ou profissional
}

export interface ExtractedSiteImage {
  id: string;
  url: string;
  alt: string;
  category: 'logo' | 'hero' | 'team' | 'services' | 'facility' | 'other';
  label: string; // e.g. "Logotipo Oficial da Marca", "Banner Hero da Primeira Dobra", "Foto do Responsável Técnico"
  suggestedSection: string; // e.g. "Header & Navbar", "Primeira Dobra (Hero)", "Sobre o Especialista", "Catálogo de Serviços"
  dimensions?: string;
  isReal: boolean;
}

export interface SiteAuditReport {
  id: string;
  url: string;
  domain: string;
  analyzedAt: string;
  masterPromptVersion: string;
  overallScore: number; // 0 - 100
  scoreLabel: string; // "Excelência Internacional", "Excelente", "Muito Bom", "Regular", "Insatisfatório", "Crítico"
  approvalStatus: 'APROVADO' | 'APROVADO COM MELHORIAS' | 'EXIGE CORREÇÕES' | 'REPROVADO';
  hasCriticalBlocker: boolean;
  primaryNicheDetected: string;
  executiveSummary: string;
  ownerInfo: SiteOwnerInfo;
  extractedImages: ExtractedSiteImage[];
  liveScrapedUsed?: boolean;
  preservedClientAssetCount?: number;
  siteTitle?: string;
  metaDescription?: string;
  h1Text?: string;
  extractedHeadings?: string[];
  extractedServices?: string[];
  // 8 Categorias Oficiais do MASTER SITE ENGINE 10.0 com Pesos Oficiais
  categories10: {
    design: MetricPillarScore; // Peso: 20%
    seo: MetricPillarScore; // Peso: 20%
    performance: MetricPillarScore; // Peso: 15%
    conversion: MetricPillarScore; // Peso: 15%
    uxResponsiveness: MetricPillarScore; // Peso: 10%
    accessibility: MetricPillarScore; // Peso: 8%
    securityCompliance: MetricPillarScore; // Peso: 7%
    technicalQuality: MetricPillarScore; // Peso: 5%
  };
  // Compatibilidade com visualizadores anteriores
  corePillars: {
    uvpAndPositioning: MetricPillarScore;
    luxuryDigitalStandard: MetricPillarScore;
    conversionAndFunnel: MetricPillarScore;
    astroStackAndPerformance: MetricPillarScore;
    persuasiveCopywriting: MetricPillarScore;
    accessibilityAndColor: MetricPillarScore;
    onPageSeo: MetricPillarScore;
  };
  criticalBlockers: CriticalBlocker[];
  criticalBottlenecks: string[];
  positiveHighlights: string[];
  recommendedImprovements: SiteImprovementAction[];
  reengineeringMegaPrompt: string; // Mega Prompt Definitivo de Recriação & Reengenharia 10.0
  generatedNewPromptPreview: string;
  fullClientMarkdownReport: string;
  pageSpeedData?: PageSpeedAuditData;
}

export interface PageSpeedMetricItem {
  title: string;
  value: string;
  displayValue: string;
  numericValue: number;
  status: 'good' | 'needs_improvement' | 'poor';
  benchmark: string;
  description: string;
}

export interface PageSpeedOpportunityItem {
  title: string;
  description: string;
  savingsKB?: number;
  savingsMs?: number;
  impact: 'high' | 'medium' | 'low';
}

export interface PageSpeedAuditData {
  url: string;
  strategy: 'mobile' | 'desktop';
  analyzedAt: string;
  score: number; // 0 - 100
  scoreDecimal: number; // e.g. 9.6
  isAbove95: boolean; // >= 95
  gradeLabel: string;
  categories: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    fcp: PageSpeedMetricItem;
    lcp: PageSpeedMetricItem;
    cls: PageSpeedMetricItem;
    inp: PageSpeedMetricItem;
    ttfb: PageSpeedMetricItem;
    speedIndex: PageSpeedMetricItem;
  };
  diagnostics: string[];
  opportunities: PageSpeedOpportunityItem[];
  officialPageSpeedUrl: string;
  source: 'google_api' | 'live_diagnostic_engine';
}

