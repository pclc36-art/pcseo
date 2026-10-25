import { SAUDE_QUESTIONNAIRES } from './saude';
import { SERVICOS_QUESTIONNAIRES } from './servicos';
import { GASTRONOMIA_QUESTIONNAIRES } from './gastronomia';
import { ENTRETENIMENTO_QUESTIONNAIRES } from './entretenimento';
import { VAREJO_QUESTIONNAIRES } from './varejo';
import { OUTROS_QUESTIONNAIRES } from './outros';
import { QuestionnaireCategory, QuestionnaireTemplate } from './types';

export * from './types';

export const ALL_33_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  ...SAUDE_QUESTIONNAIRES,
  ...SERVICOS_QUESTIONNAIRES,
  ...GASTRONOMIA_QUESTIONNAIRES,
  ...ENTRETENIMENTO_QUESTIONNAIRES,
  ...VAREJO_QUESTIONNAIRES,
  ...OUTROS_QUESTIONNAIRES,
];

export const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
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
    description: 'Escritórios corporativos, advocacia, arquitetura, contabilidade e consultorias',
    templateCount: SERVICOS_QUESTIONNAIRES.length,
    templates: SERVICOS_QUESTIONNAIRES,
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

export function getQuestionnaireById(id: string): QuestionnaireTemplate | undefined {
  return ALL_33_QUESTIONNAIRES.find((q) => q.id === id);
}

export function getTotalQuestionCount(): number {
  return ALL_33_QUESTIONNAIRES.reduce((acc, curr) => acc + curr.totalQuestions, 0);
}
