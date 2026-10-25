export interface NicheQuestionItem {
  id: string;
  number: number;
  question: string;
  placeholder: string;
  helperText: string;
  section: string;
  sampleAnswer: string;
}

export interface QuestionnaireTemplate {
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
  questions: NicheQuestionItem[];
}

export interface QuestionnaireCategory {
  key: string;
  title: string;
  emoji: string;
  description: string;
  templateCount: number;
  templates: QuestionnaireTemplate[];
}
