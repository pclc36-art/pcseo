import { SAUDE_QUESTIONNAIRES } from './saude';
import { SERVICOS_QUESTIONNAIRES } from './servicos';
import { GASTRONOMIA_QUESTIONNAIRES } from './gastronomia';
import { ENTRETENIMENTO_QUESTIONNAIRES } from './entretenimento';
import { VAREJO_QUESTIONNAIRES } from './varejo';
import { OUTROS_QUESTIONNAIRES } from './outros';
import {
  GBP_QUESTIONNAIRES,
  GBP_SAUDE_QUESTIONNAIRES,
  GBP_SERVICOS_QUESTIONNAIRES,
  GBP_GASTRONOMIA_QUESTIONNAIRES,
  GBP_ENTRETENIMENTO_QUESTIONNAIRES,
  GBP_VAREJO_QUESTIONNAIRES,
  GBP_OUTROS_QUESTIONNAIRES,
} from './gbpTemplates';
import { QuestionnaireCategory, QuestionnaireTemplate } from './types';

export * from './types';
export { GBP_QUESTIONNAIRES } from './gbpTemplates';

export const SITE_SERVICOS_QUESTIONNAIRES: QuestionnaireTemplate[] = SERVICOS_QUESTIONNAIRES.filter(
  (t) => t.targetTool !== 'gbp_pro'
);

/** 34 questionários exclusivos para criação de Sites e Landing Pages completas */
export const SITE_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  ...SAUDE_QUESTIONNAIRES,
  ...SITE_SERVICOS_QUESTIONNAIRES,
  ...GASTRONOMIA_QUESTIONNAIRES,
  ...ENTRETENIMENTO_QUESTIONNAIRES,
  ...VAREJO_QUESTIONNAIRES,
  ...OUTROS_QUESTIONNAIRES,
];

/** Catálogo completo unificado (34 Sites/LPs + 34 Google Meu Negócio = 68 questionários) */
export const ALL_33_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  ...SITE_QUESTIONNAIRES,
  ...GBP_QUESTIONNAIRES,
];

export const SITE_QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  {
    key: 'saude_bem_estar',
    title: 'Saúde & Bem-estar',
    emoji: '🏥',
    description: 'Clínicas, consultórios e profissionais da área da saúde e bem-estar',
    templateCount: SAUDE_QUESTIONNAIRES.length,
    templates: SAUDE_QUESTIONNAIRES,
  },
  {
    key: 'servicos_profissionais',
    title: 'Serviços Profissionais',
    emoji: '💼',
    description: 'Advogados autônomos, escritórios, arquitetura, contabilidade e consultorias',
    templateCount: SITE_SERVICOS_QUESTIONNAIRES.length,
    templates: SITE_SERVICOS_QUESTIONNAIRES,
  },
  {
    key: 'gastronomia',
    title: 'Gastronomia',
    emoji: '🍽️',
    description: 'Restaurantes, bistrôs, pizzarias, bares, cafeterias e confeitarias',
    templateCount: GASTRONOMIA_QUESTIONNAIRES.length,
    templates: GASTRONOMIA_QUESTIONNAIRES,
  },
  {
    key: 'entretenimento_musica',
    title: 'Entretenimento & Música',
    emoji: '🎵',
    description: 'Bandas musicais, cantores, DJs, casas de shows e teatros',
    templateCount: ENTRETENIMENTO_QUESTIONNAIRES.length,
    templates: ENTRETENIMENTO_QUESTIONNAIRES,
  },
  {
    key: 'varejo_comercio',
    title: 'Varejo & Comércio',
    emoji: '🛍️',
    description: 'Pet shops, agropecuárias, lojas de roupas, joalherias e floriculturas',
    templateCount: VAREJO_QUESTIONNAIRES.length,
    templates: VAREJO_QUESTIONNAIRES,
  },
  {
    key: 'outros_segmentos',
    title: 'Outros Segmentos',
    emoji: '📌',
    description: 'Academias, escolas, hotéis, salões de beleza, igrejas, ONGs e startups',
    templateCount: OUTROS_QUESTIONNAIRES.length,
    templates: OUTROS_QUESTIONNAIRES,
  },
];

export const GBP_QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  {
    key: 'saude_bem_estar',
    title: 'Saúde & Bem-estar',
    emoji: '🏥',
    description: 'Perfis no Google Maps para clínicas, consultórios e especialistas',
    templateCount: GBP_SAUDE_QUESTIONNAIRES.length,
    templates: GBP_SAUDE_QUESTIONNAIRES,
  },
  {
    key: 'servicos_profissionais',
    title: 'Serviços Profissionais',
    emoji: '💼',
    description: 'Perfis no Google Maps para advogados, escritórios, arquitetura e empresas de serviço',
    templateCount: GBP_SERVICOS_QUESTIONNAIRES.length,
    templates: GBP_SERVICOS_QUESTIONNAIRES,
  },
  {
    key: 'gastronomia',
    title: 'Gastronomia',
    emoji: '🍽️',
    description: 'Perfis no Google Maps para restaurantes, pizzarias, bares e cafeterias',
    templateCount: GBP_GASTRONOMIA_QUESTIONNAIRES.length,
    templates: GBP_GASTRONOMIA_QUESTIONNAIRES,
  },
  {
    key: 'entretenimento_musica',
    title: 'Entretenimento & Música',
    emoji: '🎵',
    description: 'Perfis no Google Maps para artistas, bandas, casas de shows e eventos',
    templateCount: GBP_ENTRETENIMENTO_QUESTIONNAIRES.length,
    templates: GBP_ENTRETENIMENTO_QUESTIONNAIRES,
  },
  {
    key: 'varejo_comercio',
    title: 'Varejo & Comércio',
    emoji: '🛍️',
    description: 'Perfis no Google Maps para pet shops, agropecuárias, lojas e comércios locais',
    templateCount: GBP_VAREJO_QUESTIONNAIRES.length,
    templates: GBP_VAREJO_QUESTIONNAIRES,
  },
  {
    key: 'outros_segmentos',
    title: 'Outros Segmentos',
    emoji: '📌',
    description: 'Perfis no Google Maps para academias, escolas, hotéis, salões, igrejas e ONGs',
    templateCount: GBP_OUTROS_QUESTIONNAIRES.length,
    templates: GBP_OUTROS_QUESTIONNAIRES,
  },
];

export const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = SITE_QUESTIONNAIRE_CATEGORIES;

export function getQuestionnaireById(id: string): QuestionnaireTemplate | undefined {
  return ALL_33_QUESTIONNAIRES.find((q) => q.id === id);
}

export function getTotalQuestionCount(): number {
  return ALL_33_QUESTIONNAIRES.reduce((acc, curr) => acc + curr.totalQuestions, 0);
}
