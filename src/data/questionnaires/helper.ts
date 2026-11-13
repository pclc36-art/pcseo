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
  targetTool?: 'landing_page' | 'gbp_pro' | 'all';
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
    helperText: q.helperText || 'Dado real do cliente usado diretamente na criação do site ou landing page.',
    sampleAnswer: q.sampleAnswer || 'Informação objetiva fornecida pelo cliente.',
  }));

  return {
    ...config,
    totalQuestions: questions.length,
    questions,
  };
}

export interface NicheCustomQuestion {
  section: string;
  question: string;
  placeholder: string;
  helperText: string;
  sampleAnswer: string;
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
  targetTool?: 'landing_page' | 'gbp_pro' | 'all';
  nicheTerminology: string;
  /** Prompt específico para registro profissional, credencial ou ano de fundação (ex: CRM, OAB, CRECI, CAU) */
  credentialExample?: string;
  /** Pergunta sob medida para o slogan/promessa principal do nicho na Hero */
  sampleHeroPromise?: string;
  /** Perfil do público-alvo e dor real deste nicho */
  sampleAudiencePain?: string;
  /** Principais serviços, produtos, cardápio ou planos */
  sampleTopServices: string;
  /** Política de preços, planos, convênios ou formas de pagamento */
  samplePricingPolicy?: string;
  /** Pergunta exclusiva 1 do nicho (dados que só esse nicho precisa no site) */
  customQuestion1?: NicheCustomQuestion;
  /** Pergunta exclusiva 2 do nicho (dados práticos de conversão para esse nicho) */
  customQuestion2?: NicheCustomQuestion;
  /** História, equipe e diferenciais reais */
  sampleDifferentials: string;
  /** Endereço completo / área atendida e horários */
  sampleAddressAndHours?: string;
  sampleHours?: string;
  /** Provas sociais reais deste nicho */
  sampleSocialProof?: string;
  /** 3 dúvidas frequentes reais dos clientes deste nicho */
  sampleFaq: string;
  /** Contatos oficiais (WhatsApp, e-mail, Instagram, texto do CTA) */
  sampleContacts?: string;
  /** Paleta de cores, estilo visual, logotipo e fotos reais disponíveis */
  sampleVisualAndAssets?: string;
  /** Campo legado mantido por compatibilidade */
  sampleKeywords?: string;
}

/**
 * Construtor dos Questionários Nichados para Criação de Sites e Landing Pages.
 * Cada nicho gera perguntas claras, diretas e fáceis de responder pelo cliente,
 * capturando exatamente os dados, textos, diferenciais, contatos, cores e fotos
 * que o Prompt Mestre precisa para montar um site completo e com a cara do cliente.
 */
export function buildGbpRankingTemplate(config: GbpRankingTemplateConfig): QuestionnaireTemplate {
  const defaultHours = config.sampleHours || 'Segunda a Sexta: 08:30 às 18:30 | Sábado: 08:30 às 13:00';
  const defaultAddress =
    config.sampleAddressAndHours ||
    `Atendimento presencial em endereço completo (com estacionamento próximo) e suporte rápido via WhatsApp. Horários: ${defaultHours}.`;

  const rawQuestions: Array<{
    section: string;
    question: string;
    placeholder: string;
    helperText: string;
    sampleAnswer: string;
  }> = [
    {
      section: 'Identidade da Marca & Primeira Dobra (Hero)',
      question: `Qual é o nome exato da marca ou profissional que deve aparecer no topo do site${config.credentialExample ? ` (e registro profissional, se aplicável, ex: ${config.credentialExample})` : ''}?`,
      placeholder: `Ex: ${config.sampleBusinessName}${config.credentialExample ? ` (${config.credentialExample})` : ''}`,
      helperText: 'Define o título da marca no cabeçalho, metadados do Google e rodapé oficial.',
      sampleAnswer: `${config.sampleBusinessName}${config.credentialExample ? ` — ${config.credentialExample}` : ''}.`,
    },
    {
      section: 'Identidade da Marca & Primeira Dobra (Hero)',
      question: `Em uma frase curta e direta, o que você faz de melhor e qual o principal benefício que o cliente encontra ao contratar você?`,
      placeholder: `Ex: ${config.sampleHeroPromise || `Referência em ${config.nicheTerminology} com atendimento ágil, personalizado e seguro.`}`,
      helperText: 'Vira a Headline (título principal) e o subtítulo da primeira tela da Landing Page ou Site.',
      sampleAnswer:
        config.sampleHeroPromise ||
        `Soluções especializadas em ${config.nicheTerminology} para quem busca qualidade, agilidade e confiança.`,
    },
    {
      section: 'Público-Alvo & Oferta Principal',
      question: `Quem é o cliente ideal que você quer atrair e qual é a necessidade ou problema mais urgente que faz ele procurar ${config.nicheTerminology}?`,
      placeholder: `Ex: ${config.sampleAudiencePain || `Clientes da região que buscam ${config.nicheTerminology} com confiança e atendimento rápido.`}`,
      helperText: 'Orienta toda a argumentação persuasiva da página para conectar com a dor real do visitante.',
      sampleAnswer:
        config.sampleAudiencePain ||
        `Pessoas e empresas exigentes que valorizam qualidade, transparência e atendimento humanizado.`,
    },
    {
      section: 'Público-Alvo & Oferta Principal',
      question: `Quais são os 3 a 6 principais serviços, produtos ou soluções que devem ganhar destaque no site (com breve explicação de cada um)?`,
      placeholder: `Ex: ${config.sampleTopServices}`,
      helperText: 'Alimenta os cards da vitrine de serviços ou catálogo principal do site/landing page.',
      sampleAnswer: config.sampleTopServices,
    },
    {
      section: 'Público-Alvo & Oferta Principal',
      question: `Como funcionam os valores, formas de pagamento ou condições comerciais (ex: divulga preços iniciais, faz orçamento gratuito, aceita Pix/parcelamento/convênios)?`,
      placeholder: `Ex: ${config.samplePricingPolicy || 'Orçamento gratuito pelo WhatsApp; aceitamos Pix e parcelamento no cartão de crédito.'}`,
      helperText: 'Deixa clara a etapa comercial no site e evita curiosos ou dúvidas básicas antes do contato.',
      sampleAnswer:
        config.samplePricingPolicy ||
        'Trabalhamos com orçamento transparente pelo WhatsApp, aceitamos Pix, cartões de crédito parcelados e emissão de nota fiscal.',
    },
  ];

  if (config.customQuestion1) {
    rawQuestions.push(config.customQuestion1);
  }
  if (config.customQuestion2) {
    rawQuestions.push(config.customQuestion2);
  }

  rawQuestions.push(
    {
      section: 'Autoridade, Diferenciais & Provas Sociais',
      question: `Qual é a história resumida do negócio (tempo de mercado, formação da equipe/fundador) e quais os 3 maiores diferenciais reais em relação aos concorrentes?`,
      placeholder: `Ex: ${config.sampleDifferentials}`,
      helperText: 'Constrói as seções "Sobre Nós" e "Por Que Nos Escolher" com argumentos concretos.',
      sampleAnswer: config.sampleDifferentials,
    },
    {
      section: 'Autoridade, Diferenciais & Provas Sociais',
      question: `Quais resultados, números ou depoimentos reais você pode mostrar no site (ex: anos de experiência, clientes atendidos, nota no Google ou elogios reais)?`,
      placeholder: `Ex: ${config.sampleSocialProof || 'Nota 4.9 no Google com mais de 180 avaliações verificadas e mais de 1.000 clientes atendidos.'}`,
      helperText: 'Preenche a seção de Prova Social com fatos reais (nunca inventados).',
      sampleAnswer:
        config.sampleSocialProof ||
        'Mais de 10 anos de atuação, nota 4.9 no Google Meu Negócio e dezenas de depoimentos reais de clientes satisfeitos.',
    },
    {
      section: 'Localização, Horários & Canais de Contato',
      question: `Onde o cliente é atendido? Informe endereço físico completo com cidade/bairro (se receber público no local) OU se o atendimento é 100% online/em domicílio, além dos dias e horários de funcionamento.`,
      placeholder: `Ex: ${defaultAddress}`,
      helperText: 'Define se o site terá bloco com Google Maps e rota presencial ou seção de atendimento online/regional.',
      sampleAnswer: defaultAddress,
    },
    {
      section: 'Localização, Horários & Canais de Contato',
      question: `Quais são o WhatsApp oficial, e-mail, Instagram/redes sociais e qual frase você quer nos botões principais do site?`,
      placeholder: `Ex: ${config.sampleContacts || 'WhatsApp: (11) 98765-4321 | E-mail: contato@empresa.com.br | Instagram: @empresa | Botão: "Falar no WhatsApp"'}`,
      helperText: 'Configura o botão flutuante, todos os botões de ação (CTA), links sociais e rodapé.',
      sampleAnswer:
        config.sampleContacts ||
        'WhatsApp: (11) 98765-4321 | E-mail: contato@empresa.com.br | Instagram: @oficialempresa | Texto do botão: "Solicitar Atendimento no WhatsApp".',
    },
    {
      section: 'Dúvidas Frequentes (FAQ)',
      question: `Quais são as 3 dúvidas que os clientes mais perguntam pelo WhatsApp antes de fechar (e suas respostas)?`,
      placeholder: `Ex: ${config.sampleFaq}`,
      helperText: 'Monta a seção de Perguntas Frequentes (FAQ) para quebrar objeções direto na página.',
      sampleAnswer: config.sampleFaq,
    },
    {
      section: 'Identidade Visual, Fotos & Materiais',
      question: `Para o site ficar com a sua cara: quais cores e estilo visual você prefere (ex: moderno e limpo, sofisticado escuro, acolhedor claro), você já tem logotipo, fotos reais ou site de referência?`,
      placeholder: `Ex: ${config.sampleVisualAndAssets || 'Cores azul marinho e branco, visual limpo e profissional; já temos logotipo e fotos reais da equipe e do espaço.'}`,
      helperText: 'Define paleta de cores, tipografia, clima visual e uso das fotos reais no layout gerado.',
      sampleAnswer:
        config.sampleVisualAndAssets ||
        'Visual limpo, moderno e elegante respeitando as cores da marca; logotipo em alta definição já disponível e fotos reais do ambiente e equipe.',
    }
  );

  const sections = Array.from(new Set(rawQuestions.map((q) => q.section)));

  return buildTemplate({
    id: config.id,
    categoryKey: config.categoryKey,
    categoryTitle: config.categoryTitle,
    categoryEmoji: config.categoryEmoji,
    title: config.title,
    emoji: config.emoji,
    subtitle: config.subtitle,
    totalQuestions: rawQuestions.length,
    sections,
    defaultPrimaryCategory: config.defaultPrimaryCategory,
    suggestedSecondaryCategories: config.suggestedSecondaryCategories,
    sampleBusinessName: config.sampleBusinessName,
    targetTool: config.targetTool,
    rawQuestions,
  });
}
