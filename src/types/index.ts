export type ProjectType =
  | 'landing_page'
  | 'institutional'
  | 'professional'
  | 'service_page'
  | 'clinic'
  | 'local_business'
  | 'ecommerce'
  | 'portfolio'
  | 'other';

export type TargetPlatform =
  | 'ai_site_builder'
  | 'code_generator'
  | 'visual_builder'
  | 'other'
  | 'unspecified';

export type HostingTarget =
  | 'hostinger_static'
  | 'hostinger_vps'
  | 'vercel_netlify'
  | 'cloudflare_pages'
  | 'other_static';

export type ProjectStatus = 'draft' | 'analyzed' | 'generated' | 'completed';

export interface VisualIdentityInfo {
  logoAvailable: boolean;
  primaryColors: string;
  aestheticStyle: string;
  references: string[];
}

export interface SocialProofInfo {
  hasRealProof: boolean;
  testimonials: string[];
  credentials: string[];
  cases: string[];
}

export type ImageCategory =
  | 'logo'
  | 'hero'
  | 'team'
  | 'services'
  | 'facility'
  | 'testimonials'
  | 'product'
  | 'other';

export interface ImageAsset {
  id: string;
  name: string;
  category: ImageCategory;
  dataUrl?: string; // Compressed Base64 data URL for browser thumbnail preview
  altText: string;
  sectionTarget: string; // Target section in the site
  isRealClientPhoto: boolean; // True if provided by client, false if placeholder/reference
  fileSizeFormatted?: string;
  dimensions?: string;
  aiPromptSnippet?: string; // Custom prompt for Midjourney / Flux if generating
}

export interface GeneratedPhotoPrompt {
  section: string;
  promptText: string;
  aspectRatio: string;
  suggestedModel: string;
}

export interface PhotographicDirection {
  styleGuidelines: string;
  lightingAndMood: string;
  aspectRatios: string[];
  prohibitedElements: string[];
  recommendedPrompts: GeneratedPhotoPrompt[];
}

export interface ProjectExtractedData {
  clientName: string;
  companyName: string;
  niche: string;
  services: string[];
  targetAudience: string;
  serviceRegion: string;
  hasPhysicalLocation: boolean;
  address: string;
  hasWhatsApp: boolean;
  whatsapp: string;
  phone: string;
  email: string;
  socialLinks: string[];
  businessGoals: string[];
  differentials: string[];
  audiencePainPoints: string[];
  benefitsAndTransformation: string[];
  visualIdentity: VisualIdentityInfo;
  imageAssets?: ImageAsset[];
  photographicDirection?: PhotographicDirection;
  preferencesEsthetic: string;
  references: string[];
  mandatoryContent: string[];
  socialProof: SocialProofInfo;
  technicalRequirements: string[];
  hostingTarget?: HostingTarget;
  preferredFramework?: string;
  missingFields: string[];
  contradictions: string[];
  additionalNotes: string;
}

export type ValidationState = 'confirmed' | 'pending' | 'unverifiable';

export interface QualityCheckItem {
  id: string;
  title: string;
  category: 'identity' | 'technical' | 'content' | 'rules';
  state: ValidationState;
  description: string;
  details?: string;
}

export interface QualityReport {
  score: number;
  totalChecks: number;
  confirmedCount: number;
  pendingCount: number;
  unverifiableCount: number;
  items: QualityCheckItem[];
  generatedAt: string;
}

export interface MasterPromptVersion {
  id: string;
  version: string;
  title: string;
  description: string;
  content: string;
  characterCount: number;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  projectType: ProjectType;
  targetPlatform: TargetPlatform;
  hostingTarget?: HostingTarget;
  preferredFramework?: string;
  rawQuestionnaire: string;
  extractedData: ProjectExtractedData;
  additionalNotes: string;
  masterPromptVersionId: string;
  masterPromptVersionLabel: string;
  finalPrompt: string;
  qualityReport?: QualityReport;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  projectType: ProjectType;
  targetPlatform: TargetPlatform;
  hostingTarget?: HostingTarget;
  preferredFramework?: string;
  questionnaire: string;
  notes: string;
}
