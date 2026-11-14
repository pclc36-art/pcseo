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
  /** Promessa principal (Headline H1) da primeira dobra */
  sampleHeroPromise?: string;
  /** Subheadline de apoio + garantia/velocidade */
  sampleHeroSubheadline?: string;
  /** Texto exato do botão principal (CTA) */
  sampleHeroCta?: string;
  /** Perfil do cliente ideal */
  sampleAudiencePain?: string;
  /** Dores, medos e frustrações reais antes de contratar */
  sampleAudienceFears?: string;
  /** Principais serviços, produtos, cardápio ou planos detalhados */
  sampleTopServices: string;
  /** Oferta carro-chefe e porta de entrada */
  sampleFlagshipOffer?: string;
  /** Política de preços, planos, convênios ou formas de pagamento */
  samplePricingPolicy?: string;
  /** Pergunta exclusiva 1 do nicho */
  customQuestion1?: NicheCustomQuestion;
  /** Pergunta exclusiva 2 do nicho */
  customQuestion2?: NicheCustomQuestion;
  /** Pergunta exclusiva 3 do nicho (ou etapa prática específica) */
  customQuestion3?: NicheCustomQuestion;
  /** Passo a passo do atendimento (Passo 1 ao 4) */
  sampleProcessSteps?: string;
  /** História da marca, tempo de mercado e formação da equipe */
  sampleHistory?: string;
  /** Diferenciais reais em relação à concorrência */
  sampleDifferentials: string;
  /** Garantias, certificações ou pós-venda */
  sampleGuarantees?: string;
  /** Endereço completo / área atendida e horários */
  sampleAddressAndHours?: string;
  sampleHours?: string;
  /** Bairros, cidades e palavras-chave de busca no Google */
  sampleTargetGeo?: string;
  /** Provas sociais reais deste nicho */
  sampleSocialProof?: string;
  /** 4 a 5 dúvidas frequentes reais dos clientes deste nicho */
  sampleFaq: string;
  /** Contatos oficiais (WhatsApp, e-mail, Instagram, domínio e campos de formulário) */
  sampleContacts?: string;
  /** Paleta de cores, estilo visual e referências */
  sampleVisualAndAssets?: string;
  /** Logotipo, fotos reais e vídeos disponíveis */
  sampleMediaAssets?: string;
  /** Campo legado mantido por compatibilidade */
  sampleKeywords?: string;
}

/**
 * Construtor dos Questionários Nichados para Sites & Landing Pages.
 * Perguntas 100% simples e diretas para o CLIENTE responder (sem jargões técnicos como
 * "palavras-chave", "SEO", "Headline", "CTA", "Dobra", "Pixel" ou "Tag Manager").
 * Cada resposta traz informações reais para unir com o Prompt Mestre e montar o site completo.
 */
export function buildSiteQuestionnaireTemplate(config: GbpRankingTemplateConfig): QuestionnaireTemplate {
  const defaultHours = config.sampleHours || 'Segunda a Sexta: 08:30 às 18:30 | Sábado: 08:30 às 13:00';
  const defaultAddress =
    config.sampleAddressAndHours ||
    `Atendimento presencial em endereço completo na região central (com fácil acesso e estacionamento próximo).`;

  const actionGoalDefault = config.sampleHeroCta || 'Chamar no WhatsApp para tirar dúvidas e agendar';

  const rawQuestions: Array<{
    section: string;
    question: string;
    placeholder: string;
    helperText: string;
    sampleAnswer: string;
  }> = [
    {
      section: 'Sobre Você e Sua Empresa',
      question: `Qual é o nome da sua empresa ou o seu nome profissional (como deve aparecer no site)${config.credentialExample ? `, há quanto tempo atua e qual é o seu registro profissional (ex: ${config.credentialExample})` : ' e há quanto tempo atua no mercado'}?`,
      placeholder: `Ex: ${config.sampleBusinessName}${config.credentialExample ? ` — ${config.credentialExample}` : ' — Atuando desde 2016'}`,
      helperText: 'Será exibido no topo, na apresentação e no rodapé do site.',
      sampleAnswer: `${config.sampleBusinessName}${config.credentialExample ? ` — ${config.credentialExample}` : ' (atuando desde 2016)'}.`,
    },
    {
      section: 'Sobre Você e Sua Empresa',
      question: `Em uma frase simples, o que você faz de melhor e qual é o principal benefício que o seu cliente ganha ao te contratar?`,
      placeholder: `Ex: ${config.sampleHeroPromise || `Atendimento especializado em ${config.nicheTerminology} com agilidade, segurança e transparência.`}`,
      helperText: 'Ajuda a escrever a apresentação principal logo que o visitante abre o site.',
      sampleAnswer:
        config.sampleHeroPromise ||
        `Soluções especializadas em ${config.nicheTerminology} com qualidade comprovada, agilidade e confiança.`,
    },
    {
      section: 'Público e Principais Dúvidas',
      question: `Quem é o seu cliente ideal hoje (perfil, idade ou tipo de empresa) e em qual momento ele decide te procurar?`,
      placeholder: `Ex: ${config.sampleAudiencePain || `Clientes da região que precisam de ${config.nicheTerminology} com atendimento rápido e confiável.`}`,
      helperText: 'Ajuda a usar a linguagem certa no site para conversar com quem realmente compra de você.',
      sampleAnswer:
        config.sampleAudiencePain ||
        `Pessoas e empresas da região que valorizam atendimento próximo, transparência nos prazos e serviço bem feito.`,
    },
    {
      section: 'Público e Principais Dúvidas',
      question: `Quais são as 3 maiores preocupações, medos ou dificuldades que os seus clientes costumam ter antes de fechar com você?`,
      placeholder: `Ex: ${config.sampleAudienceFears || '1. Medo de demora no atendimento; 2. Receio de surpresas no valor; 3. Medo de contratar e não ter acompanhamento.'}`,
      helperText: 'Mostra no site que você entende exatamente o problema do cliente e sabe resolver com segurança.',
      sampleAnswer:
        config.sampleAudienceFears ||
        '1. Medo de contratar um serviço e receber atendimento impessoal ou apressado; 2. Surpresas no orçamento e prazos não cumpridos; 3. Falta de suporte depois que o serviço começa.',
    },
    {
      section: 'Serviços, Produtos e Condições',
      question: `Liste de 4 a 6 principais serviços, tratamentos ou produtos que você quer mostrar no site (coloque o nome de cada um e explique de forma simples o que inclui).`,
      placeholder: `Ex: ${config.sampleTopServices}`,
      helperText: 'Quanto mais completo você explicar aqui, mais rica ficará a vitrine de serviços do seu site.',
      sampleAnswer: config.sampleTopServices,
    },
    {
      section: 'Serviços, Produtos e Condições',
      question: `Qual é o seu serviço ou produto principal (carro-chefe que mais vende) e existe algum tipo de serviço que você NÃO faz (para evitar mensagens erradas)?`,
      placeholder: `Ex: ${config.sampleFlagshipOffer || `Nosso carro-chefe é ${config.nicheTerminology}. Não atendemos serviços fora dessa especialidade.`}`,
      helperText: 'Destaca o que mais dá resultado para você e ajuda a filtrar contatos indesejados.',
      sampleAnswer:
        config.sampleFlagshipOffer ||
        `Nosso carro-chefe é o atendimento completo em ${config.nicheTerminology}, começando por uma conversa inicial para entender a necessidade do cliente.`,
    },
    {
      section: 'Serviços, Produtos e Condições',
      question: `Como funcionam os preços e formas de pagamento? Você prefere mostrar valores no site ou trabalhar apenas com orçamento personalizado (aceita Pix, cartão, parcelamento ou convênios)?`,
      placeholder: `Ex: ${config.samplePricingPolicy || 'Orçamento transparente após avaliação; aceitamos Pix e parcelamento no cartão de crédito.'}`,
      helperText: 'Deixa claro para o visitante como funciona o pagamento antes mesmo de ele entrar em contato.',
      sampleAnswer:
        config.samplePricingPolicy ||
        'Trabalhamos com orçamento transparente após entender a necessidade do cliente; aceitamos Pix, cartões de crédito parcelados e emitimos nota fiscal.',
    },
  ];

  if (config.customQuestion1) {
    rawQuestions.push(config.customQuestion1);
  }
  if (config.customQuestion2) {
    rawQuestions.push(config.customQuestion2);
  }

  rawQuestions.push(
    config.customQuestion3 || {
      section: 'Como Funciona e Nossa História',
      question: `Como funciona o atendimento na prática, passo a passo, desde quando o cliente entra em contato até a entrega ou conclusão do serviço?`,
      placeholder: `Ex: ${config.sampleProcessSteps || 'Passo 1: Contato pelo WhatsApp; Passo 2: Avaliação e orçamento; Passo 3: Realização do serviço; Passo 4: Entrega e acompanhamento.'}`,
      helperText: 'Monta a seção "Como Funciona Passo a Passo" do site para passar tranquilidade ao novo cliente.',
      sampleAnswer:
        config.sampleProcessSteps ||
        'Passo 1: Contato rápido pelo WhatsApp. Passo 2: Entendemos a necessidade e passamos as opções e valores com clareza. Passo 3: Agendamento ou início imediato. Passo 4: Entrega concluída com acompanhamento após o atendimento.',
    },
    {
      section: 'Como Funciona e Nossa História',
      question: `Conte a história resumida do negócio ou da sua trajetória (como começou, formação, anos de experiência e quem faz parte da equipe) para colocarmos na parte "Sobre Nós".`,
      placeholder: `Ex: ${config.sampleHistory || config.sampleDifferentials}`,
      helperText: 'Gera confiança humana ao mostrar quem está por trás da empresa ou do atendimento.',
      sampleAnswer:
        config.sampleHistory ||
        `${config.sampleBusinessName} nasceu do propósito de oferecer um padrão superior em ${config.nicheTerminology}, unindo experiência prática e atendimento próximo aos clientes.`,
    },
    {
      section: 'Diferenciais, Garantias e Provas',
      question: `Quais são os 3 maiores diferenciais do seu trabalho em comparação aos concorrentes e quais garantias, certificações ou suporte após a entrega você oferece?`,
      placeholder: `Ex: ${config.sampleDifferentials}${config.sampleGuarantees ? ` | Garantias: ${config.sampleGuarantees}` : ''}`,
      helperText: 'Preenche os motivos reais para o visitante escolher você e confiar no seu serviço.',
      sampleAnswer: `${config.sampleDifferentials}${config.sampleGuarantees ? ` Garantias e cuidados: ${config.sampleGuarantees}` : ' Compromisso com cumprimento de prazos, transparência e acompanhamento próximo após a entrega.'}`,
    },
    {
      section: 'Diferenciais, Garantias e Provas',
      question: `Quais números reais ou provas você pode mostrar no site (ex: quantos clientes já atendeu, anos de mercado, prêmios ou depoimentos reais de clientes)?`,
      placeholder: `Ex: ${config.sampleSocialProof || 'Mais de 10 anos de experiência, mais de 1.000 clientes atendidos e elogios reais verificados.'}`,
      helperText: 'Ajuda a mostrar resultados verdadeiros e depoimentos reais na página.',
      sampleAnswer:
        config.sampleSocialProof ||
        'Mais de 10 anos de atuação, centenas de clientes atendidos com satisfação comprovada e recomendações reais.',
    },
    {
      section: 'Dúvidas Comuns dos Clientes',
      question: `Quais são as 4 a 5 perguntas que os clientes sempre fazem no WhatsApp antes de fechar (ex: preço, prazo, como funciona, garantia) e qual a resposta para cada uma?`,
      placeholder: `Ex: ${config.sampleFaq}`,
      helperText: 'Preenche a seção de Perguntas Frequentes do site para tirar as principais dúvidas antes do contato.',
      sampleAnswer: config.sampleFaq,
    },
    {
      section: 'Localização, Horários e Contatos',
      question: `Você atende em endereço físico (informe rua, número, bairro, cidade, CEP e se tem estacionamento/acessibilidade) OU atende apenas online/a domicílio? Quais cidades ou bairros você atende?`,
      placeholder: `Ex: ${defaultAddress}${config.sampleTargetGeo ? ` | Cidades/Bairros atendidos: ${config.sampleTargetGeo}` : ''}`,
      helperText: 'Define o mapa ou a região de atendimento mostrada no rodapé e na seção de localização do site.',
      sampleAnswer: `${defaultAddress}${config.sampleTargetGeo ? ` Regiões e cidades atendidas: ${config.sampleTargetGeo}.` : ''}`,
    },
    {
      section: 'Localização, Horários e Contatos',
      question: `Quais são os dias e horários exatos de atendimento e em quanto tempo você costuma responder quem envia mensagem?`,
      placeholder: `Ex: ${defaultHours} | Retorno médio: até 15 minutos no horário de atendimento.`,
      helperText: 'Mostra seus horários reais no site para o cliente saber quando será atendido.',
      sampleAnswer: `${defaultHours}. Tempo médio de retorno no WhatsApp: até 15 minutos dentro do horário comercial.`,
    },
    {
      section: 'Localização, Horários e Contatos',
      question: `Informe seu WhatsApp oficial com DDD, telefone fixo (se tiver), e-mail, Instagram/redes sociais, endereço de site (se já tiver domínio) e o que você quer que o visitante faça ao clicar nos botões (ex: "${actionGoalDefault}").`,
      placeholder: `Ex: ${config.sampleContacts || `WhatsApp: (11) 98765-4321 | E-mail: contato@empresa.com.br | Instagram: @empresa | Ação principal: ${actionGoalDefault}`}`,
      helperText: 'Configura os botões de WhatsApp, links das redes sociais e formulário de contato do site.',
      sampleAnswer: `${config.sampleContacts || 'WhatsApp: (11) 98765-4321 | E-mail: contato@empresa.com.br | Instagram: @oficialempresa'} | Ação principal desejada no site: ${actionGoalDefault}.`,
    },
    {
      section: 'Visual, Cores e Fotos Reais',
      question: `Quais cores você quer que predominem no site, qual estilo visual prefere (mais clássico/sério, moderno/limpo, acolhedor) e tem algum site que você acha bonito (ou algo que NÃO gosta)?`,
      placeholder: `Ex: ${config.sampleVisualAndAssets || 'Azul marinho, branco e detalhes dourados; visual limpo e elegante.'}`,
      helperText: 'Ajuda a deixar o visual e as cores do site exatamente com a identidade da sua marca.',
      sampleAnswer:
        config.sampleVisualAndAssets ||
        'Visual limpo, moderno e elegante nas cores da marca, fácil de ler no celular.',
    },
    {
      section: 'Visual, Cores e Fotos Reais',
      question: `Você já tem logotipo em boa qualidade e fotos ou vídeos reais seus, da equipe, do espaço ou dos serviços/produtos para colocar no site? (Conte o que já tem pronto).`,
      placeholder: `Ex: ${config.sampleMediaAssets || 'Sim, temos logotipo e fotos reais do espaço, equipe e serviços para enviar.'}`,
      helperText: 'Permite saber quais fotos reais suas já podemos usar no site e o que ainda precisa tirar.',
      sampleAnswer:
        config.sampleMediaAssets ||
        'Temos logotipo pronto e fotos reais da equipe, do espaço de atendimento e dos principais serviços.',
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
    targetTool: config.targetTool || 'landing_page',
    rawQuestions,
  });
}

// Alias mantido por compatibilidade com os imports existentes nos 6 arquivos de nichos
export const buildGbpRankingTemplate = buildSiteQuestionnaireTemplate;

