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
  status: 'critical' | 'warning' | 'good' | 'optimal';
  description: string;
  masterPromptRule: string; // e.g., "Seção 3 — Posicionamento Comercial & UVP"
  currentFlaws: string[];
  recommendations: string[];
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
  scoreLabel: string; // "Amador", "Médio", "Padrão Ouro"
  primaryNicheDetected: string;
  executiveSummary: string;
  ownerInfo: SiteOwnerInfo;
  extractedImages: ExtractedSiteImage[];
  corePillars: {
    uvpAndPositioning: MetricPillarScore;
    luxuryDigitalStandard: MetricPillarScore;
    conversionAndFunnel: MetricPillarScore;
    astroStackAndPerformance: MetricPillarScore;
    persuasiveCopywriting: MetricPillarScore;
    accessibilityAndColor: MetricPillarScore;
    onPageSeo: MetricPillarScore;
  };
  criticalBottlenecks: string[];
  recommendedImprovements: SiteImprovementAction[];
  generatedNewPromptPreview: string;
  fullClientMarkdownReport: string;
}
