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

export interface GbpRankingTemplateConfig {
  id: string;
  categoryKey: string;
  categoryTitle: string;
  categoryEmoji: string;
  title: string;
  emoji: string;
  subtitle: string;
  defaultPrimaryCategory: string;
  suggestedSecondaryCategories: string[];
  sampleBusinessName: string;
  nicheTerminology: string;
  sampleKeywords: string;
  sampleTopServices: string;
  sampleDifferentials: string;
  sampleHours?: string;
  sampleFaq: string;
}

export function buildGbpRankingTemplate(config: GbpRankingTemplateConfig): QuestionnaireTemplate {
  const defaultHours = config.sampleHours || 'Segunda a Sexta: 08:00 às 18:30 | Sábado: 08:00 às 13:00';
  
  const rawQuestions = [
    {
      section: 'Identidade & Categoria Google',
      question: `Qual é o nome comercial oficial da sua empresa (exatamente como deve constar no letreiro, fachada e registro)?`,
      placeholder: `Ex: ${config.sampleBusinessName}`,
      helperText: 'Fator NAP (Name, Address, Phone): O Google exige consistência exata do nome para validar relevância e evitar suspensões por spam de palavras-chave.',
      sampleAnswer: config.sampleBusinessName,
    },
    {
      section: 'Identidade & Categoria Google',
      question: `Qual é a especialidade ou serviço principal que define sua atividade central no Google Maps em ${config.nicheTerminology}?`,
      placeholder: `Ex: ${config.defaultPrimaryCategory} (Secundárias: ${config.suggestedSecondaryCategories.slice(0, 2).join(', ')})`,
      helperText: 'A Categoria Primária é o maior fator isolado de ranqueamento no algoritmo de busca local do Google (pesa mais de 60% na relevância).',
      sampleAnswer: `${config.defaultPrimaryCategory} especializada em ${config.nicheTerminology}.`,
    },
    {
      section: 'Geolocalização & Bairros de Maior Ticket',
      question: `Qual é o endereço físico completo e quais são os 3 a 5 bairros ou cidades vizinhas de maior ticket que você deseja atrair nas buscas?`,
      placeholder: 'Ex: Av. Principal, 1500 - Centro. Bairros prioritários: Jardins, Vila Nova, Bairro Nobre e Centro.',
      helperText: 'Alimenta o raio de geolocalização e as Áreas de Cobertura (Service Areas) no Google Maps para que seu perfil apareça em múltiplas regiões.',
      sampleAnswer: 'Endereço centralizado com atendimento prioritário aos bairros nobres e região metropolitana.',
    },
    {
      section: 'Palavras-Chave de Busca Local em Alta',
      question: `Quais são as principais palavras ou termos exatos que seu cliente digita no Google Maps quando está pronto para contratar ou comprar?`,
      placeholder: `Ex: ${config.sampleKeywords}`,
      helperText: 'Termos de alta intenção comercial que serão integrados organicamente na descrição oficial de 750 caracteres, produtos e postagens semanais.',
      sampleAnswer: config.sampleKeywords,
    },
    {
      section: 'Catálogo de Serviços & Margem',
      question: `Quais são os seus 3 a 5 serviços ou produtos prioritários (os mais lucrativos e procurados), com preços ou faixa de valor?`,
      placeholder: `Ex: ${config.sampleTopServices}`,
      helperText: 'Serão cadastrados individualmente com fotos e descrições ricas em SEO na aba de Serviços e Produtos do Google Meu Negócio.',
      sampleAnswer: config.sampleTopServices,
    },
    {
      section: 'Diferenciais & Quebra de Objeções',
      question: `Quais diferenciais únicos, tecnologias exclusivas, anos de mercado ou certificados fazem o cliente escolher você em vez do concorrente no Google Maps?`,
      placeholder: `Ex: ${config.sampleDifferentials}`,
      helperText: 'Fator decisivo para o cliente que está comparando os 3 perfis do topo do Google decidir ligar ou agendar com você.',
      sampleAnswer: config.sampleDifferentials,
    },
    {
      section: 'Horários & Formatos de Atendimento',
      question: `Qual é o horário exato de funcionamento durante a semana e você atende aos sábados, domingos ou plantão de emergência?`,
      placeholder: `Ex: ${defaultHours}`,
      helperText: 'Garante que o perfil seja exibido com a tag verde "Aberto Agora" quando potenciais clientes buscam fora do horário convencional.',
      sampleAnswer: defaultHours,
    },
    {
      section: 'Conversão Direta & Contatos',
      question: `Quais são o WhatsApp oficial com DDD, telefone comercial e link do site ou agendamento online?`,
      placeholder: 'Ex: WhatsApp: (11) 98765-4321 | Fixo: (11) 3456-7890 | Site: www.suaempresa.com.br',
      helperText: 'Configura os botões de ação rápida "Ligar", "Site" e "Mensagem" que convertem visualizações em contatos imediatos.',
      sampleAnswer: 'WhatsApp comercial ativo para atendimento rápido e direcionamento de novos agendamentos.',
    },
    {
      section: 'Atributos de Confiança do Perfil',
      question: `O local possui estacionamento próprio/gratuito, acessibilidade para cadeirantes, ambiente climatizado, Wi-Fi e quais formas de pagamento aceita?`,
      placeholder: 'Ex: Estacionamento gratuito com manobrista, acessibilidade total com rampa, Wi-Fi liberado, aceita PIX e parcelamento no cartão.',
      helperText: 'Atributos oficiais verificados pelo Google que ativam os filtros de busca avançada dos usuários no Maps.',
      sampleAnswer: 'Estacionamento próprio, acessibilidade completa, ambiente totalmente climatizado e diversas opções de pagamento.',
    },
    {
      section: 'Prova Social & Reputação 5 Estrelas',
      question: `A empresa já possui avaliações no Google Maps? Qual a nota atual, quantidade aproximada e quais são os maiores elogios dos clientes?`,
      placeholder: 'Ex: Nota 4.9 com mais de 80 avaliações. Clientes elogiam a pontualidade, atendimento acolhedor e resultado perfeito.',
      helperText: 'Usado para estruturar a estratégia de captação de novas avaliações e templates de respostas com palavras-chave que aumentam o ranking.',
      sampleAnswer: 'Avaliações de excelência com forte recomendação pela qualidade do atendimento e pontualidade.',
    },
    {
      section: 'FAQ Local do Google',
      question: `Quais são as 3 dúvidas ou medos mais comuns que os clientes perguntam antes de fechar e qual é a resposta ideal?`,
      placeholder: `Ex: ${config.sampleFaq}`,
      helperText: 'Alimenta a seção oficial de Perguntas e Respostas do perfil do Google Maps para quebrar objeções 24 horas por dia.',
      sampleAnswer: config.sampleFaq,
    },
  ];

  return buildTemplate({
    id: config.id,
    categoryKey: config.categoryKey,
    categoryTitle: config.categoryTitle,
    categoryEmoji: config.categoryEmoji,
    title: config.title,
    emoji: config.emoji,
    subtitle: config.subtitle,
    totalQuestions: rawQuestions.length,
    sections: [
      'Identidade & Categoria Google',
      'Geolocalização & Bairros de Maior Ticket',
      'Palavras-Chave de Busca Local em Alta',
      'Catálogo de Serviços & Margem',
      'Diferenciais & Quebra de Objeções',
      'Horários & Formatos de Atendimento',
      'Conversão Direta & Contatos',
      'Atributos de Confiança do Perfil',
      'Prova Social & Reputação 5 Estrelas',
      'FAQ Local do Google',
    ],
    defaultPrimaryCategory: config.defaultPrimaryCategory,
    suggestedSecondaryCategories: config.suggestedSecondaryCategories,
    sampleBusinessName: config.sampleBusinessName,
    rawQuestions,
  });
}
