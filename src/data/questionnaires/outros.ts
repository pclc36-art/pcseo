import { buildTemplate } from './helper';
import { QuestionnaireTemplate } from './types';
import { NICHE_SUPER_QUESTIONNAIRES } from '../gbpNicheQuestionnaires';

// 27. Academia / Estúdio Fitness (30 perguntas)
const academiaFitness = buildTemplate({
  id: 'academia_fitness',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Academia / Estúdio Fitness',
  emoji: '💪',
  subtitle: 'Academias completas, estúdios de pilates, crossfit, treinamento funcional e yoga',
  totalQuestions: 30,
  sections: ['Identidade & Modalidades', 'Aparelhos & Estrutura Física', 'Corpo Técnico & Metodologia', 'Planos & Mensalidades', 'SEO Local & Aulas Experimentais'],
  defaultPrimaryCategory: 'Academia',
  suggestedSecondaryCategories: ['Centro de fitness', 'Estúdio de pilates', 'Treinador pessoal', 'Escola de yoga'],
  sampleBusinessName: 'IronFit Academia & Centro de Performance',
  rawQuestions: [
    { section: 'Identidade & Modalidades', question: 'Qual é o nome comercial oficial da academia ou estúdio fitness?' },
    { section: 'Identidade & Modalidades', question: 'Qual é a proposta da academia (musculação tradicional, estúdio boutique, box de crossfit, funcional)?' },
    { section: 'Identidade & Modalidades', question: 'Há quantos anos atua incentivando saúde e bem-estar na região?' },
    { section: 'Identidade & Modalidades', question: 'Qual é o endereço físico completo (com fácil acesso e pontos de referência)?' },
    { section: 'Identidade & Modalidades', question: 'Quais bairros e regiões do entorno compõem a maioria dos alunos matriculados?' },
    { section: 'Identidade & Modalidades', question: 'Quais são o WhatsApp oficial para informações de planos, telefone e site?' },
    { section: 'Identidade & Modalidades', question: 'Qual é a grade de horários de funcionamento durante a semana, sábados, domingos e feriados?' },
    { section: 'Aparelhos & Estrutura Física', question: 'Quais são as modalidades de aulas coletivas oferecidas (spinning, dança, luta, pilates, GAP, yoga)?' },
    { section: 'Aparelhos & Estrutura Física', question: 'Qual é a marca e padrão dos aparelhos de musculação (Hammer Strength, Matrix, Movement, biomecânica moderna)?' },
    { section: 'Aparelhos & Estrutura Física', question: 'O ambiente é 100% climatizado com sistema de som motivador e iluminação moderna?' },
    { section: 'Aparelhos & Estrutura Física', question: 'Como são os vestiários (chuveiros aquecidos, armários com chave, secadores de cabelo, higiene constante)?' },
    { section: 'Aparelhos & Estrutura Física', question: 'Possui estacionamento próprio gratuito ou vagas reservadas para alunos?' },
    { section: 'Aparelhos & Estrutura Física', question: 'A academia possui espaço de convivência, lanchonete saudável ou loja de suplementos?' },
    { section: 'Corpo Técnico & Metodologia', question: 'Os professores de sala são formados e registrados no CREF?' },
    { section: 'Corpo Técnico & Metodologia', question: 'A academia realiza avaliação física completa com bioimpedância e teste de mobilidade?' },
    { section: 'Corpo Técnico & Metodologia', question: 'O aluno tem treino digital no aplicativo para acompanhar séries, cargas e evolução?' },
    { section: 'Corpo Técnico & Metodologia', question: 'Como os instrutores auxiliam alunos iniciantes para evitar lesões e manter a motivação?' },
    { section: 'Corpo Técnico & Metodologia', question: 'A academia aceita personal trainers externos com regras claras de credenciamento?' },
    { section: 'Planos & Mensalidades', question: 'Quais são os planos oferecidos (mensal sem fidelidade, semestral, anual recorrente no cartão sem travar o limite)?' },
    { section: 'Planos & Mensalidades', question: 'A academia aceita Gympass / Wellhub e TotalPass?' },
    { section: 'Planos & Mensalidades', question: 'Existe taxa de matrícula ou anuidade de manutenção?' },
    { section: 'Planos & Mensalidades', question: 'A academia oferece aula experimental gratuita para novos visitantes conhecerem o espaço?' },
    { section: 'Planos & Mensalidades', question: 'Possui planos familiares ou descontos para estudantes e empresas conveniadas?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'Quais palavras-chave um morador do bairro pesquisa no Google Maps ao procurar academia perto de mim?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'A ficha no Google Perfil da Empresa está com fotos dos aparelhos modernos, vestiários e horários de pico?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'Qual é a nota média de avaliação e o que os alunos mais elogiam sobre a limpeza e energia do lugar?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'Possui fotos profissionais em alta resolução com alunos treinando e instrutores sorridentes?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'Quais são as 3 academias concorrentes mais próximas na mesma região?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'Qual é a frase de motivação da academia (ex: Mais do que treino, seu estilo de vida saudável)?' },
    { section: 'SEO Local & Aulas Experimentais', question: 'Qual chamada para ação (CTA) principal: "Agendar Aula Experimental Gratuita no WhatsApp"?' },
  ],
});

// Adapter function to convert from NICHE_SUPER_QUESTIONNAIRES
function adaptFromSuperQuestionnaires(key: string, categoryInfo: { key: string; title: string; emoji: string }): QuestionnaireTemplate {
  const item = NICHE_SUPER_QUESTIONNAIRES[key];
  if (!item) {
    throw new Error(`Questionnaire key ${key} not found in NICHE_SUPER_QUESTIONNAIRES`);
  }

  return {
    id: item.id,
    categoryKey: categoryInfo.key,
    categoryTitle: categoryInfo.title,
    categoryEmoji: categoryInfo.emoji,
    title: item.title,
    emoji: item.emoji,
    subtitle: item.subtitle,
    totalQuestions: item.questions.length,
    sections: item.sections,
    defaultPrimaryCategory: item.defaultPrimaryCategory,
    suggestedSecondaryCategories: item.suggestedSecondaryCategories,
    sampleBusinessName: item.sampleBusinessName,
    questions: item.questions,
  };
}

export const OUTROS_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  academiaFitness,
  adaptFromSuperQuestionnaires('escola_curso', { key: 'outros_segmentos', title: 'Outros Segmentos', emoji: '📌' }),
  adaptFromSuperQuestionnaires('hotel_pousada', { key: 'outros_segmentos', title: 'Outros Segmentos', emoji: '📌' }),
  adaptFromSuperQuestionnaires('salao_beleza', { key: 'outros_segmentos', title: 'Outros Segmentos', emoji: '📌' }),
  adaptFromSuperQuestionnaires('igreja_religiosa', { key: 'outros_segmentos', title: 'Outros Segmentos', emoji: '📌' }),
  adaptFromSuperQuestionnaires('ong_instituto', { key: 'outros_segmentos', title: 'Outros Segmentos', emoji: '📌' }),
  adaptFromSuperQuestionnaires('startup_tech', { key: 'outros_segmentos', title: 'Outros Segmentos', emoji: '📌' }),
];
