// Types for Google Business Profile Pro (GBP Pro)

export type GbpServiceFormat = 'physical' | 'service_area' | 'hybrid' | 'appointment_only';

export type GbpPrimaryObjective = 
  | 'calls' 
  | 'whatsapp' 
  | 'appointments' 
  | 'store_visits' 
  | 'local_visibility' 
  | 'website_traffic';

export interface GbpProductServiceItem {
  id: string;
  name: string;
  category?: string;
  isPriority: boolean;
  priceEstimate?: string;
  description: string;
}

export interface GbpQuestionnaireData {
  // 1. Identificação da empresa
  businessName: string;
  primaryNiche: string;
  fullAddress: string;
  addressComplement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode?: string;

  // 2. Localização e atendimento
  serviceAreas: string[]; // Cidades, bairros ou regiões atendidas
  phone: string;
  whatsapp: string;
  website: string;
  operatingHours: string; // Ex: Seg a Sex 08h às 18h, Sáb 08h às 12h
  serviceFormat: GbpServiceFormat;

  // 3. Produtos e serviços
  items: GbpProductServiceItem[];
  priorityItemToPromote: string;
  differentials: string[];
  yearsInMarket: string;
  certificationsAndLicenses: string[];

  // 4. Público e estratégia comercial
  targetAudience: string;
  userSuggestedKeywords: string[]; // 3 a 5 palavras do cliente
  primaryObjective: GbpPrimaryObjective;

  // 5. Presença digital e materiais
  socialMediaLinks: string[];
  knownCompetitors: string[];
  availableMaterials: {
    hasLogo: boolean;
    hasFacadePhoto: boolean;
    hasTeamPhotos: boolean;
    hasEnvironmentPhotos: boolean;
    hasProductPhotos: boolean;
    hasWebsite: boolean;
  };
  hasExistingProfile: boolean;
  existingProfileUrl?: string;
  additionalNotes?: string;
}

export interface GbpCategoryRecommendation {
  primaryCategory: string;
  primaryJustification: string;
  secondaryCategories: string[];
  categoriesToAvoid: string[];
  relevanceNotes: string;
}

export interface GbpAddressStrategy {
  serviceModel: GbpServiceFormat;
  storefrontVisible: boolean;
  serviceRadiusKm?: number;
  coveredAreas: string[];
  complianceNotes: string;
  verificationAdvice: string;
}

export interface GbpAttributesStrategy {
  accessibility: string[];
  paymentMethods: string[];
  amenities: string[];
  planning: string[]; // ex: Agendamento obrigatório
  highlights: string[];
}

export interface GbpSeoStrategy {
  primaryKeyword: string;
  secondaryKeywords: string[];
  geoModifiers: string[];
  napStandard: {
    name: string;
    address: string;
    phone: string;
  };
  searchIntents: { intent: string; keywords: string[] }[];
}

export interface GbpDescriptionResult {
  fullDescription: string; // Max 750 chars
  first250CharsHook: string;
  charCount: number;
  complianceChecks: {
    noLinks: boolean;
    noProhibitedPromotions: boolean;
    noKeywordStuffing: boolean;
    noAllCaps: boolean;
  };
}

export interface GbpPhotoItem {
  id: string;
  category: 'fachada' | 'interior' | 'equipe' | 'produtos_servicos' | 'trabalho_em_andamento' | 'identidade_visual';
  title: string;
  recommendedSpec: string; // ex: 1200x900px, JPG sem compressão excessiva
  seoFileName: string; // ex: clinica-odontologica-moema-fachada.jpg
  isCrucialForVerification: boolean;
  description: string;
}

export interface GbpReviewStrategy {
  reviewShortlinkTip: string;
  qrCodeUsageTip: string;
  responseTemplates: {
    fiveStar: string;
    fourStarPositiveWithFeedback: string;
    threeStarNeutral: string;
    oneOrTwoStarCritical: string;
    fakeOrUnfairSuspected: string;
  };
  ethicalGuidelines: string[];
}

export interface GbpPostItem {
  day: number;
  type: 'update' | 'offer' | 'event' | 'photo_spotlight';
  topic: string;
  headline: string;
  body: string;
  ctaButton: 'Ligar agora' | 'Saiba mais' | 'Reservar' | 'Comprar' | 'Pedir online';
  photoGuidance: string;
}

export interface GbpFaqItem {
  id: string;
  question: string;
  answer: string;
  strategicGoal: string;
}

export interface GbpComplianceAndRiskCheck {
  item: string;
  status: 'safe' | 'warning' | 'critical';
  details: string;
  howToFix?: string;
}

export interface GbpDossier {
  id: string;
  clientId: string;
  clientName: string;
  businessName: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'verified';
  version: number;
  questionnaire: GbpQuestionnaireData;
  categories: GbpCategoryRecommendation;
  addressStrategy: GbpAddressStrategy;
  attributes: GbpAttributesStrategy;
  seo: GbpSeoStrategy;
  description: GbpDescriptionResult;
  catalog: GbpProductServiceItem[];
  photoChecklist: GbpPhotoItem[];
  reviewStrategy: GbpReviewStrategy;
  editorialCalendar: GbpPostItem[]; // 30 dias
  faq: GbpFaqItem[]; // 8-10 itens
  complianceChecks: GbpComplianceAndRiskCheck[];
  maintenancePlan90Days: {
    month1: string[];
    month2: string[];
    month3: string[];
  };
  generatedBy: 'gemini' | 'heuristic' | 'manual';
}

// AUDIT TYPES
export interface GbpAuditRequest {
  id?: string;
  clientName: string;
  businessName: string;
  profileUrl?: string;
  primaryCategory?: string;
  addressOrSAB?: string;
  currentRating?: number;
  totalReviews?: number;
  responseRatePercent?: number;
  photosCount?: number;
  lastPostDate?: string;
  hasDescription?: boolean;
  currentDescription?: string;
  hasCatalog?: boolean;
  hasFaq?: boolean;
  notes?: string;
}

export interface GbpAuditPillarScore {
  name: string;
  score: number;
  maxScore: number;
  weightPercent: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  diagnostics: string[];
}

export interface GbpAuditRecommendation {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  issueFound: string;
  riskIfIgnored: string;
  actionRequired: string;
  suggestedContent?: string;
}

export interface GbpAuditReport {
  id: string;
  clientId?: string;
  clientName: string;
  businessName: string;
  profileUrl?: string;
  createdAt: string;
  overallScore: number; // 0 a 100
  scoreLevel: 'critico' | 'insuficiente' | 'moderado' | 'bom' | 'excelente';
  summary: string;
  pillars: {
    guidelinesAndName: GbpAuditPillarScore; // 20 pts
    categoriesTaxonomy: GbpAuditPillarScore; // 15 pts
    napAndLocation: GbpAuditPillarScore; // 15 pts
    descriptionOptimization: GbpAuditPillarScore; // 10 pts
    reviewsAndReputation: GbpAuditPillarScore; // 15 pts
    visualPresence: GbpAuditPillarScore; // 15 pts
    engagementAndFaq: GbpAuditPillarScore; // 10 pts
  };
  recommendations: GbpAuditRecommendation[];
  whatToModify: {
    title: string;
    currentSituation: string;
    risk: string;
    howToFix: string;
    priority: 'crítica' | 'alta' | 'média';
  }[];
  whatToInclude: {
    title: string;
    benefit: string;
    implementationDetails: string;
    priority: 'alta' | 'média';
  }[];
  correctiveCopy: {
    recommendedBusinessName: string;
    recommendedDescription: string;
    recommendedPrimaryCategory: string;
    recommendedSecondaryCategories: string[];
    reviewResponseTemplate: string;
    samplePostToPublish: string;
    recommendedFaqs?: { question: string; answer: string }[];
    recommendedPosts?: { title: string; body: string; cta: string }[];
    attributesToActivate?: string[];
    photoGuidelines?: string[];
  };
  historySnapshot?: {
    previousScore?: number;
    difference?: number;
  };
}

export interface GbpClient {
  id: string;
  name: string;
  businessName: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  dossierIds: string[];
  auditIds: string[];
}

export interface GbpDatabaseDump {
  version: string;
  exportedAt: string;
  clients: GbpClient[];
  dossiers: GbpDossier[];
  audits: GbpAuditReport[];
  siteProjects?: any[];
}
