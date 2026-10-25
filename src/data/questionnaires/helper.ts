import { NicheQuestionItem, QuestionnaireTemplate } from './types';

export function buildTemplate(config: {
  id: string;
  categoryKey: string;
  categoryTitle: string;
  categoryEmoji: string;
  title: string;
  emoji: string;
  subtitle: string;
  totalQuestions: number;
  sections: string[];
  defaultPrimaryCategory: string;
  suggestedSecondaryCategories: string[];
  sampleBusinessName: string;
  rawQuestions: Array<{
    section: string;
    question: string;
    placeholder?: string;
    helperText?: string;
    sampleAnswer?: string;
  }>;
}): QuestionnaireTemplate {
  const questions: NicheQuestionItem[] = config.rawQuestions.map((q, idx) => ({
    id: `${config.id}_${idx + 1}`,
    number: idx + 1,
    section: q.section,
    question: q.question,
    placeholder: q.placeholder || `Ex: Informações detalhadas sobre ${q.question.toLowerCase()}`,
    helperText: q.helperText || 'Informação indispensável para estruturar a identidade e ranqueamento local.',
    sampleAnswer: q.sampleAnswer || `Resposta padrão orientada a conversão e conformidade com diretrizes.`,
  }));

  return {
    ...config,
    totalQuestions: questions.length,
    questions,
  };
}
