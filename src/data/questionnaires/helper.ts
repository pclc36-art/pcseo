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

export interface NicheWorkplaceProfile {
  /** Termo singular sem artigo: ex. "escritório", "consultório", "clínica", "estúdio", "loja" */
  placeSingular: string;
  /** Com pronome possessivo: ex. "seu escritório", "seu consultório", "sua clínica" */
  placePossessive: string;
  /** Como chamar quem compra/atende: ex. "clientes", "pacientes", "alunos", "hóspedes" */
  clientTerm: string;
  /** O que o negócio oferece (para Q5): ex. "serviços jurídicos", "tratamentos", "pratos e bebidas" */
  offeringTerm: string;
  /** Como perguntar sobre preços/pagamento (para Q7) */
  paymentQuestion: string;
  /** Como perguntar sobre localização física/online (para Q15) */
  addressQuestion: string;
  /** Dica de fotos reais para Sites/LPs (para Q19) */
  photoSiteHint: string;
  /** Dica de fotos da fachada/local para Google Meu Negócio */
  gbpFacadeHint: string;
  /** Exemplos de dúvidas frequentes para Google Meu Negócio */
  gbpFaqExamples: string;
  /** Exemplos de comodidades para Google Meu Negócio */
  gbpAmenitiesExamples: string;
  /** Como perguntar sobre ponto físico no Google Meu Negócio */
  gbpLocationQuestion: string;
}

const DEFAULT_WORKPLACE_PROFILE: NicheWorkplaceProfile = {
  placeSingular: 'empresa',
  placePossessive: 'sua empresa',
  clientTerm: 'clientes',
  offeringTerm: 'serviços ou produtos',
  paymentQuestion:
    'Como funcionam os preços e formas de pagamento? Você prefere mostrar valores no site ou trabalhar com orçamento personalizado (Pix, cartão, parcelamento)?',
  addressQuestion:
    'Você atende em endereço físico (informe rua, número, bairro, cidade, CEP e se tem estacionamento/acessibilidade) OU atende apenas online/a domicílio? Quais cidades ou bairros você atende?',
  photoSiteHint: 'seus, da equipe, do espaço de atendimento ou dos serviços/produtos',
  gbpFacadeHint: 'da fachada, recepção/interior e equipe trabalhando',
  gbpFaqExamples: 'precisa agendar antes, tem estacionamento, quais formas de pagamento aceita',
  gbpAmenitiesExamples: 'estacionamento, acesso para cadeirante, Wi-Fi, ar-condicionado, Pix/cartão',
  gbpLocationQuestion:
    'Vocês têm ponto físico com placa na fachada para receber clientes OU atendem somente em domicílio/online sem local aberto ao público? Informe o endereço completo com CEP.',
};

export function getNicheWorkplaceProfile(templateId: string): NicheWorkplaceProfile {
  const baseId = templateId.replace(/^gbp_/, '');

  switch (baseId) {
    // ====================================================
    // SAÚDE & BEM-ESTAR — CONSULTÓRIOS E CLÍNICAS
    // ====================================================
    case 'clinica_estetica':
      return {
        placeSingular: 'clínica de estética',
        placePossessive: 'sua clínica',
        clientTerm: 'pacientes e clientes',
        offeringTerm: 'procedimentos e tratamentos estéticos',
        paymentQuestion:
          'Como funcionam os valores e formas de pagamento (avaliação, pacotes, Pix, cartão e parcelamento)? Você prefere mostrar valores no site ou passar após avaliação?',
        addressQuestion:
          'Informe o endereço completo da clínica (rua, número, bairro, cidade, CEP e se tem estacionamento/acessibilidade) e quais bairros ou cidades mais atende.',
        photoSiteHint: 'da fachada, recepção, salas de atendimento, aparelhos e equipe da clínica',
        gbpFacadeHint: 'da fachada da clínica, placa na entrada, recepção e salas de procedimento',
        gbpFaqExamples: 'como funciona a avaliação, tem estacionamento, quais formas de pagamento aceita',
        gbpAmenitiesExamples: 'estacionamento, entrada acessível, banheiro adaptado, Wi-Fi, ar-condicionado, atende com hora marcada, Pix/cartão',
        gbpLocationQuestion:
          'A clínica possui endereço físico com placa na fachada ou na porta para receber pacientes? Informe o endereço completo com CEP.',
      };

    case 'clinica_medica':
      return {
        placeSingular: 'clínica médica',
        placePossessive: 'sua clínica',
        clientTerm: 'pacientes',
        offeringTerm: 'especialidades médicas, consultas e exames',
        paymentQuestion:
          'Como funcionam as consultas e pagamentos? Atendem particular, emitem nota para reembolso e aceitam convênios/planos de saúde (Pix, cartão, parcelamento)?',
        addressQuestion:
          'Informe o endereço completo da clínica (rua, número, bairro, cidade, CEP, estacionamento e acessibilidade) e se também realizam teleconsultas. Quais bairros ou cidades atendem?',
        photoSiteHint: 'da fachada da clínica, recepção, consultórios, salas de exames e corpo médico',
        gbpFacadeHint: 'da fachada da clínica, placa na entrada, recepção e consultórios',
        gbpFaqExamples: 'quais convênios aceita, precisa agendar antes, tem estacionamento, faz exames no local',
        gbpAmenitiesExamples: 'estacionamento, rampa/elevador para cadeirante, banheiro adaptado, Wi-Fi, ar-condicionado, convênios, Pix/cartão',
        gbpLocationQuestion:
          'A clínica possui sede física com placa na fachada para receber pacientes? Informe o endereço completo com CEP.',
      };

    case 'medico_individual':
      return {
        placeSingular: 'consultório médico',
        placePossessive: 'seu consultório',
        clientTerm: 'pacientes',
        offeringTerm: 'consultas, exames e tratamentos médicos',
        paymentQuestion:
          'Como funcionam os valores das consultas e formas de pagamento (particular, nota para reembolso, convênios, Pix ou cartão)? Prefere mostrar valores ou informar no agendamento?',
        addressQuestion:
          'Informe o endereço completo do seu consultório (rua, número, sala, bairro, cidade, CEP, estacionamento e acessibilidade) e se também atende por telemedicina. Quais regiões atende?',
        photoSiteHint: 'retrato profissional seu no consultório, recepção e sala de atendimento',
        gbpFacadeHint: 'do prédio, placa na porta do consultório, recepção e sala de atendimento',
        gbpFaqExamples: 'aceita convênio ou emite recibo para reembolso, precisa agendar, atende por telemedicina, tem estacionamento',
        gbpAmenitiesExamples: 'atende com hora marcada, telemedicina, elevador/acessibilidade, estacionamento no prédio, Pix/cartão',
        gbpLocationQuestion:
          'Você atende em consultório físico com placa identificando seu nome na porta (ou dentro de uma clínica)? Informe o endereço completo com CEP.',
      };

    case 'fisioterapeuta':
      return {
        placeSingular: 'consultório ou estúdio de fisioterapia',
        placePossessive: 'seu consultório',
        clientTerm: 'pacientes',
        offeringTerm: 'tratamentos, sessões de fisioterapia e reabilitação',
        paymentQuestion:
          'Como funcionam os valores das sessões e formas de pagamento (sessão avulsa, pacotes, Pix, cartão ou recibo CREFITO para reembolso de plano)?',
        addressQuestion:
          'Você atende em consultório/estúdio físico (informe rua, número, bairro, cidade, CEP e estacionamento/acessibilidade) OU também atende a domicílio? Quais bairros e cidades atende?',
        photoSiteHint: 'suas realizando atendimentos, do consultório/estúdio e equipamentos',
        gbpFacadeHint: 'da fachada/prédio, placa na porta do consultório e sala de fisioterapia',
        gbpFaqExamples: 'precisa de encaminhamento médico, atende particular ou reembolso de convênio, faz atendimento a domicílio',
        gbpAmenitiesExamples: 'atende com hora marcada, atendimento domiciliar, acessibilidade, estacionamento, Pix/cartão',
        gbpLocationQuestion:
          'Você possui consultório/estúdio físico com placa na porta para receber pacientes OU atende somente a domicílio? Informe o endereço completo com CEP.',
      };

    case 'dentista_odonto':
      return {
        placeSingular: 'consultório odontológico',
        placePossessive: 'seu consultório ou clínica',
        clientTerm: 'pacientes',
        offeringTerm: 'tratamentos odontológicos e procedimentos',
        paymentQuestion:
          'Como funcionam os valores e formas de pagamento (avaliação, parcelamento no cartão/boleto, Pix ou convênios odontológicos)? Prefere mostrar valores ou passar após avaliação?',
        addressQuestion:
          'Informe o endereço completo do consultório/clínica odontológica (rua, número, bairro, cidade, CEP, estacionamento e acessibilidade) e quais bairros ou cidades atende.',
        photoSiteHint: 'da fachada, recepção, consultório odontológico, equipamentos e equipe de dentistas',
        gbpFacadeHint: 'da fachada ou placa na porta do consultório odontológico, recepção e cadeira/equipamentos',
        gbpFaqExamples: 'aceita convênio odontológico, atende urgência no mesmo dia, tem estacionamento, parcela o tratamento',
        gbpAmenitiesExamples: 'atende urgências, estacionamento, acessibilidade, ar-condicionado, Wi-Fi, Pix e parcelamento no cartão',
        gbpLocationQuestion:
          'O consultório ou clínica odontológica possui ponto físico com placa na fachada/porta para receber pacientes? Informe o endereço completo com CEP.',
      };

    case 'psicologo_terapeuta':
      return {
        placeSingular: 'consultório de psicologia',
        placePossessive: 'seu consultório',
        clientTerm: 'pacientes',
        offeringTerm: 'tipos de atendimento psicológico e terapias',
        paymentQuestion:
          'Como funcionam os valores das sessões e formas de pagamento (particular, pacotes mensais, Pix, cartão ou recibo para reembolso de plano de saúde)?',
        addressQuestion:
          'Você atende presencialmente em consultório físico (informe endereço completo com CEP e estacionamento/acessibilidade), somente online por vídeo, ou nos dois formatos? Quais regiões atende?',
        photoSiteHint: 'retrato profissional seu e fotos do consultório acolhedor (se atender presencialmente)',
        gbpFacadeHint: 'do prédio, placa na porta do consultório e sala de atendimento acolhedora',
        gbpFaqExamples: 'faz terapia online, emite recibo para reembolso do plano, qual a duração da sessão, como agendar',
        gbpAmenitiesExamples: 'atendimento somente com hora marcada, sessões online por vídeo, acessibilidade, ambiente sigiloso, Pix/cartão',
        gbpLocationQuestion:
          'Você possui consultório físico com placa na porta para receber pacientes OU atende somente online? Informe o endereço completo com CEP.',
      };

    case 'nutricionista':
      return {
        placeSingular: 'consultório de nutrição',
        placePossessive: 'seu consultório',
        clientTerm: 'pacientes',
        offeringTerm: 'consultas, planos e acompanhamentos nutricionais',
        paymentQuestion:
          'Como funcionam os valores das consultas/pacotes e formas de pagamento (Pix, cartão, parcelamento ou recibo para reembolso no convênio)?',
        addressQuestion:
          'Você atende presencialmente em consultório físico (informe endereço completo com CEP e estacionamento/acessibilidade), apenas online por vídeo, ou nos dois formatos? Quais cidades/bairros atende?',
        photoSiteHint: 'retrato profissional seu, do consultório e equipamentos de avaliação (como bioimpedância)',
        gbpFacadeHint: 'do prédio, placa na porta do consultório e sala de atendimento nutricional',
        gbpFaqExamples: 'a consulta inclui retorno, faz atendimento online, tem exame de bioimpedância, emite recibo para convênio',
        gbpAmenitiesExamples: 'atendimento com hora marcada, consulta online, estacionamento, acessibilidade, Pix/cartão',
        gbpLocationQuestion:
          'Você possui consultório físico com placa na porta para receber pacientes OU atende somente online? Informe o endereço completo com CEP.',
      };

    // ====================================================
    // SERVIÇOS PROFISSIONAIS — ESCRITÓRIOS & ESTÚDIO (NUNCA CONSULTÓRIO!)
    // ====================================================
    case 'advogado_individual_lp':
    case 'advogado_individual_gbp':
      return {
        placeSingular: 'escritório',
        placePossessive: 'seu escritório',
        clientTerm: 'clientes',
        offeringTerm: 'causas e serviços jurídicos',
        paymentQuestion:
          'Como você explica consulta avaliativa e honorários respeitando a ética da OAB (contrato formal, tabela da OAB, Pix, cartão ou parcelamento)?',
        addressQuestion:
          'Você atende presencialmente em escritório físico (informe rua, número, sala, bairro, cidade, CEP e estacionamento/acessibilidade), apenas online ou nos dois formatos? Quais cidades/estados atende?',
        photoSiteHint: 'retratos profissionais seus, fotos do escritório/sala de reuniões e logotipo/monograma',
        gbpFacadeHint: 'da fachada do prédio, placa com seu nome na porta do escritório e sala de reuniões',
        gbpFaqExamples: 'precisa agendar horário antes de ir, faz atendimento online por vídeo, tem estacionamento no prédio',
        gbpAmenitiesExamples: 'atende somente com hora marcada, atendimento online por vídeo, elevador acessível, estacionamento, Pix/cartão',
        gbpLocationQuestion:
          'Você possui escritório ou sala física com placa identificando seu nome na porta para receber clientes OU atende somente online/com hora marcada? Informe o endereço completo com CEP.',
      };

    case 'escritorio_advocacia':
      return {
        placeSingular: 'escritório de advocacia',
        placePossessive: 'seu escritório',
        clientTerm: 'clientes',
        offeringTerm: 'áreas do Direito e serviços jurídicos',
        paymentQuestion:
          'Como funcionam a consulta inicial e os honorários do escritório respeitando o Código de Ética da OAB (consulta avaliativa, contrato formal, Pix, cartão ou parcelamento)?',
        addressQuestion:
          'O escritório atende presencialmente em sede física (informe rua, número, sala/andar, bairro, cidade, CEP e estacionamento/acessibilidade) e/ou online em todo o Brasil? Quais cidades ou regiões atende?',
        photoSiteHint: 'da fachada/recepção do escritório, salas de reunião e retratos dos sócios e equipe jurídica',
        gbpFacadeHint: 'do prédio, placa do escritório de advocacia na entrada, recepção e sala de reuniões',
        gbpFaqExamples: 'precisa agendar reunião antes, atende online por videoconferência, tem estacionamento, atende empresas e pessoas físicas',
        gbpAmenitiesExamples: 'atendimento com hora marcada, reuniões online por vídeo, acessibilidade, estacionamento, salas privativas, Pix/cartão',
        gbpLocationQuestion:
          'O escritório possui sede física com placa na fachada/porta para receber clientes OU atua somente de forma digital? Informe o endereço completo com CEP.',
      };

    case 'arquitetura_interiores':
      return {
        placeSingular: 'escritório de arquitetura',
        placePossessive: 'seu escritório',
        clientTerm: 'clientes',
        offeringTerm: 'tipos de projetos arquitetônicos, interiores e acompanhamento de obra',
        paymentQuestion:
          'Como funcionam os orçamentos e formas de pagamento do escritório (valor por metragem/etapa entregue, Pix, cartão ou parcelamento)?',
        addressQuestion:
          'O escritório atende presencialmente em endereço físico (informe rua, número, bairro, cidade, CEP e estacionamento) e/ou faz projetos online? Quais cidades e regiões atende?',
        photoSiteHint: 'do escritório, retratos dos arquitetos e fotos reais de projetos entregues ou imagens 3D',
        gbpFacadeHint: 'do prédio, placa do escritório de arquitetura na entrada, equipe e projetos executados',
        gbpFaqExamples: 'faz projetos online para outras cidades, acompanha a obra, precisa agendar visita ao escritório',
        gbpAmenitiesExamples: 'atendimento com hora marcada, reuniões presenciais e online, estacionamento, acessibilidade, Pix/parcelamento',
        gbpLocationQuestion:
          'O escritório possui endereço físico com placa para receber clientes OU atende no local da obra/online? Informe o endereço completo com CEP.',
      };

    case 'construtora_eng':
      return {
        placeSingular: 'escritório de engenharia / construtora',
        placePossessive: 'sua construtora ou escritório',
        clientTerm: 'clientes',
        offeringTerm: 'tipos de obras, reformas e serviços de engenharia',
        paymentQuestion:
          'Como funcionam os orçamentos e pagamentos (orçamento fechado por etapa/medição, financiamento bancário, Pix ou boleto)?',
        addressQuestion:
          'Informe o endereço físico do escritório da construtora (rua, número, bairro, cidade, CEP e estacionamento) e quais cidades, bairros ou condomínios vocês atendem em obras.',
        photoSiteHint: 'do escritório, dos engenheiros e principalmente fotos reais de obras concluídas e em andamento',
        gbpFacadeHint: 'da fachada do escritório da construtora, placa, equipe técnica e obras entregues',
        gbpFaqExamples: 'quais regiões e condomínios atendem, executam obra com material incluso, aceitam financiamento de construção',
        gbpAmenitiesExamples: 'visita técnica agendada, estacionamento no escritório, acessibilidade, emissão de ART e nota fiscal',
        gbpLocationQuestion:
          'A construtora/escritório possui sede física com placa para receber clientes OU atende apenas com visitas técnicas nas obras? Informe o endereço completo com CEP.',
      };

    case 'consultoria_coaching':
      return {
        placeSingular: 'escritório de consultoria',
        placePossessive: 'seu escritório ou consultoria',
        clientTerm: 'clientes e empresas',
        offeringTerm: 'serviços de consultoria, mentorias e treinamentos',
        paymentQuestion:
          'Como funcionam as propostas e pagamentos (reunião diagnóstica, projetos fechados, planos mensais, Pix, cartão ou faturamento para empresas)?',
        addressQuestion:
          'Você atende presencialmente em escritório físico (informe endereço completo com CEP e estacionamento), na empresa do cliente ou 100% online? Quais regiões ou estados atende?',
        photoSiteHint: 'retratos dos consultores, fotos do escritório, reuniões corporativas ou treinamentos',
        gbpFacadeHint: 'do prédio/placa do escritório de consultoria, sala de reuniões e equipe em atendimento',
        gbpFaqExamples: 'atende empresas de outras cidades online, como funciona a primeira reunião, emite nota fiscal PJ',
        gbpAmenitiesExamples: 'atendimento com hora marcada, reuniões presenciais e online, estacionamento, acessibilidade, faturamento PJ/Pix',
        gbpLocationQuestion:
          'Você possui escritório físico com placa na porta para receber clientes OU atende na empresa do cliente/online? Informe o endereço completo com CEP.',
      };

    case 'imobiliaria_corretor':
      return {
        placeSingular: 'imobiliária / escritório',
        placePossessive: 'sua imobiliária ou escritório',
        clientTerm: 'clientes',
        offeringTerm: 'serviços imobiliários (compra, venda, lançamentos, locação e avaliação)',
        paymentQuestion:
          'Quais facilidades vocês oferecem na negociação (simulação de financiamento bancário, uso de FGTS, consórcio, aluguel sem fiador ou seguro fiança)?',
        addressQuestion:
          'Informe o endereço físico da imobiliária/escritório (rua, número, bairro, cidade, CEP e estacionamento) e em quais bairros e cidades vocês trabalham com imóveis.',
        photoSiteHint: 'da fachada da imobiliária/escritório, equipe de corretores e fotos reais dos principais imóveis',
        gbpFacadeHint: 'da fachada da imobiliária ou placa do escritório, recepção e equipe de corretores',
        gbpFaqExamples: 'alugam sem fiador, ajudam no financiamento bancário, como anunciar meu imóvel, atendem aos sábados',
        gbpAmenitiesExamples: 'estacionamento para clientes, acessibilidade, Wi-Fi, ar-condicionado, visitas agendadas e atendimento online',
        gbpLocationQuestion:
          'A imobiliária/escritório possui ponto físico com placa na fachada para receber clientes OU atua apenas como corretor(a) com visitas agendadas? Informe o endereço completo com CEP.',
      };

    case 'contabilidade_contabil':
      return {
        placeSingular: 'escritório de contabilidade',
        placePossessive: 'seu escritório',
        clientTerm: 'clientes e empresas',
        offeringTerm: 'serviços contábeis, abertura de empresas, folha e planejamento tributário',
        paymentQuestion:
          'Como funcionam os planos mensais e formas de pagamento (mensalidade por porte/regime, abertura de CNPJ, Pix, boleto ou cartão)? Prefere mostrar faixas de preço ou passar sob consulta?',
        addressQuestion:
          'O escritório atende presencialmente em endereço físico (informe rua, número, sala, bairro, cidade, CEP e estacionamento) e/ou atende empresas de todo o Brasil no formato digital? Quais regiões atende?',
        photoSiteHint: 'da fachada/recepção do escritório contábil, equipe de contadores e ambiente de reuniões',
        gbpFacadeHint: 'do prédio, placa do escritório de contabilidade na entrada e equipe',
        gbpFaqExamples: 'é difícil trocar de contador, quanto tempo leva para abrir CNPJ, atendem MEI e Simples Nacional, atendem online',
        gbpAmenitiesExamples: 'atendimento presencial e 100% digital, estacionamento, acessibilidade, boleto/Pix/cartão',
        gbpLocationQuestion:
          'O escritório de contabilidade possui sede física com placa na fachada/porta para receber clientes OU funciona 100% digital? Informe o endereço completo com CEP.',
      };

    case 'fotografo_estudio':
      return {
        placeSingular: 'estúdio fotográfico',
        placePossessive: 'seu estúdio',
        clientTerm: 'clientes',
        offeringTerm: 'tipos de ensaios, coberturas de eventos e pacotes fotográficos',
        paymentQuestion:
          'Como funcionam os pacotes e formas de pagamento (valor inicial ou orçamento sob medida, sinal na reserva, Pix, cartão e parcelamento)?',
        addressQuestion:
          'Você atende em estúdio físico próprio (informe rua, número, bairro, cidade, CEP e estacionamento) e/ou faz ensaios externos e eventos? Quais cidades e regiões atende?',
        photoSiteHint: 'do estúdio, bastidores e uma seleção das suas melhores fotografias reais de portfólio',
        gbpFacadeHint: 'da fachada/entrada do estúdio, cenário interno iluminado e bastidores de ensaio',
        gbpFaqExamples: 'precisa agendar horário, faz ensaio externo no local do cliente, qual o prazo de entrega das fotos',
        gbpAmenitiesExamples: 'estúdio climatizado, camarim, estacionamento, atende com hora marcada, Pix e cartão parcelado',
        gbpLocationQuestion:
          'Você possui estúdio físico com identificação para receber clientes OU atende somente em locações externas e eventos? Informe o endereço completo com CEP.',
      };

    // ====================================================
    // GASTRONOMIA — ESTABELECIMENTOS
    // ====================================================
    case 'restaurante':
    case 'pizzaria':
    case 'bar_pub':
    case 'cafeteria':
    case 'confeitaria': {
      const labelMap: Record<string, { s: string; p: string; o: string; f: string }> = {
        restaurante: {
          s: 'restaurante',
          p: 'seu restaurante',
          o: 'pratos principais, entradas, bebidas e combos',
          f: 'da fachada do restaurante, salão, mesas montadas e pratos reais',
        },
        pizzaria: {
          s: 'pizzaria',
          p: 'sua pizzaria',
          o: 'sabores de pizzas, bordas, combos e bebidas',
          f: 'da fachada da pizzaria, forno, salão e pizzas prontas',
        },
        bar_pub: {
          s: 'bar / pub',
          p: 'seu bar ou pub',
          o: 'drinques, chopes, porções e petiscos',
          f: 'da fachada do bar, ambiente interno, palco/mesas, drinques e porções',
        },
        cafeteria: {
          s: 'cafeteria',
          p: 'sua cafeteria',
          o: 'cafés especiais, brunches, salgados e doces',
          f: 'da fachada da cafeteria, balcão, mesas, cafés e quitutes',
        },
        confeitaria: {
          s: 'confeitaria',
          p: 'sua confeitaria',
          o: 'bolos, tortas, doces e kits para festas',
          f: 'da fachada/vitrine (se tiver loja física), bolos, doces e embalagens',
        },
      };
      const item = labelMap[baseId];
      const prepDe = item.p.startsWith('sua ') ? `da ${item.p}` : `do ${item.p}`;
      return {
        placeSingular: item.s,
        placePossessive: item.p,
        clientTerm: 'clientes',
        offeringTerm: item.o,
        paymentQuestion:
          'Como funcionam os preços e formas de pagamento (cardápio com valores, Pix, cartão, vale-refeição VR/VA ou pagamento na entrega)?',
        addressQuestion:
          `Informe o endereço completo ${prepDe} (rua, número, bairro, cidade, CEP e estacionamento/acessibilidade) OU se trabalha apenas com delivery/encomendas. Quais bairros atende na entrega?`,
        photoSiteHint: `${item.f} e logotipo em boa qualidade`,
        gbpFacadeHint: item.f,
        gbpFaqExamples: 'precisa reservar mesa, faz delivery, aceita vale-refeição (VR/VA), tem estacionamento ou área kids/pet friendly',
        gbpAmenitiesExamples: 'estacionamento/valet, acessibilidade, Wi-Fi, ar-condicionado, delivery, área externa/pet friendly, Pix, cartão e VR/VA',
        gbpLocationQuestion:
          `Vocês têm ${item.s} físico aberto ao público com placa na fachada OU trabalham apenas com delivery/retirada? Informe o endereço completo com CEP.`,
      };
    }

    // ====================================================
    // ENTRETENIMENTO & MÚSICA
    // ====================================================
    case 'artista_banda':
      return {
        placeSingular: 'escritório de produção / base da banda',
        placePossessive: 'sua banda ou projeto musical',
        clientTerm: 'contratantes e noivos',
        offeringTerm: 'formatos de show, apresentações e pacotes musicais',
        paymentQuestion:
          'Como funcionam os orçamentos e pagamentos (sinal na reserva da data, parcelamento até o evento, Pix, cartão ou nota fiscal com CNPJ)?',
        addressQuestion:
          'Qual é a cidade-base da banda/artista e para quais cidades, regiões ou estados vocês viajam para fazer shows e eventos?',
        photoSiteHint: 'fotos reais em palco iluminado, pista animada, formação da banda e links de vídeos ao vivo',
        gbpFacadeHint: 'de apresentações ao vivo, palco, banda completa e logotipo oficial',
        gbpFaqExamples: 'quais estilos musicais tocam, levam som e iluminação próprios, viajam para outras cidades, emitem nota fiscal',
        gbpAmenitiesExamples: 'orçamento rápido pelo WhatsApp, contrato formal com CNPJ, atendimento para casamentos e eventos corporativos, Pix/cartão',
        gbpLocationQuestion:
          'Vocês possuem escritório/estúdio físico aberto a visitas OU atendem contratantes por região/cidade do evento? Informe sua cidade-base e endereço (se público).',
      };

    case 'casa_shows_teatro':
      return {
        placeSingular: 'casa de shows / teatro',
        placePossessive: 'seu espaço',
        clientTerm: 'público e produtores',
        offeringTerm: 'programação de espetáculos e formatos de locação do espaço',
        paymentQuestion:
          'Como funcionam ingressos e locação (bilheteria online, meia-entrada, Pix, cartão e orçamento para locação de eventos)?',
        addressQuestion:
          'Informe o endereço completo da casa de shows/teatro (rua, número, bairro, cidade, CEP, estacionamento e acessibilidade para cadeirantes).',
        photoSiteHint: 'da fachada, plateia, palco iluminado, foyer e camarins',
        gbpFacadeHint: 'da fachada iluminada, letreiro, plateia, palco e foyer',
        gbpFaqExamples: 'como comprar ingressos, tem meia-entrada, tem estacionamento, tem acesso para cadeirantes, como alugar para eventos',
        gbpAmenitiesExamples: 'estacionamento/valet, acessibilidade PCD, ar-condicionado, bar/lanchonete, bilheteria online, Pix/cartão',
        gbpLocationQuestion:
          'Informe o endereço completo com CEP da casa de shows/teatro onde o público e os eventos acontecem.',
      };

    // ====================================================
    // VAREJO & COMÉRCIO
    // ====================================================
    case 'petshop_veterinaria':
      return {
        placeSingular: 'pet shop / clínica veterinária',
        placePossessive: 'seu pet shop ou clínica veterinária',
        clientTerm: 'tutores e pets',
        offeringTerm: 'serviços (banho, tosa, consultas veterinárias, vacinas) e linhas de produtos',
        paymentQuestion:
          'Como funcionam os valores e formas de pagamento (banho/tosa, pacotes mensais, consultas, Pix, cartão, parcelamento ou plano de saúde pet)?',
        addressQuestion:
          'Informe o endereço completo do pet shop/clínica veterinária (rua, número, bairro, cidade, CEP e estacionamento) e em quais bairros vocês oferecem Táxi Pet ou entrega.',
        photoSiteHint: 'da fachada, loja, área de banho e tosa, consultório veterinário e equipe com os pets',
        gbpFacadeHint: 'da fachada, loja, área de banho e tosa e consultório veterinário',
        gbpFaqExamples: 'precisa agendar banho e tosa, tem táxi pet, atende emergências veterinárias, aceita plano de saúde pet',
        gbpAmenitiesExamples: 'estacionamento na porta, acessibilidade, táxi pet, sala exclusiva para gatos, ar-condicionado, Pix/cartão',
        gbpLocationQuestion:
          'O pet shop/clínica veterinária possui ponto físico com placa na fachada para receber tutores e pets? Informe o endereço completo com CEP.',
      };

    case 'produtos_agricolas':
    case 'loja_roupas':
    case 'joalheria_relojoaria':
    case 'floricultura': {
      const storeMap: Record<string, { s: string; p: string; o: string; faq: string }> = {
        produtos_agricolas: {
          s: 'loja agropecuária',
          p: 'sua loja agropecuária',
          o: 'linhas de produtos, insumos, rações, ferramentas e assistência técnica',
          faq: 'fazem entrega na fazenda/sítio, têm agrônomo ou veterinário na loja, quais formas de pagamento aceitam',
        },
        loja_roupas: {
          s: 'loja',
          p: 'sua loja',
          o: 'categorias de roupas, coleções, tamanhos e acessórios',
          faq: 'qual a grade de tamanhos, como funciona troca, enviam para outras cidades ou fazem mala delivery',
        },
        joalheria_relojoaria: {
          s: 'joalheria / loja',
          p: 'sua joalheria',
          o: 'joias, alianças, relógios e serviços (sob medida, ajustes, gravação)',
          faq: 'tem certificado de garantia do ouro/pedras, faz joia ou aliança sob medida, aceita ouro antigo ou parcelamento',
        },
        floricultura: {
          s: 'floricultura / loja',
          p: 'sua floricultura',
          o: 'buquês, arranjos, cestas, plantas e presentes',
          faq: 'entrega no mesmo dia em quanto tempo, manda foto antes de enviar, inclui cartão grátis, aceita Pix',
        },
      };
      const item = storeMap[baseId];
      const prepDe = item.p.startsWith('sua ') ? `da ${item.p}` : `do ${item.p}`;
      return {
        placeSingular: item.s,
        placePossessive: item.p,
        clientTerm: 'clientes',
        offeringTerm: item.o,
        paymentQuestion:
          'Como funcionam os preços e formas de pagamento (mostrar valores no site ou catálogo sob consulta, Pix, cartão, parcelamento)?',
        addressQuestion:
          `Informe o endereço físico ${prepDe} (rua, número, bairro, cidade, CEP e estacionamento/acessibilidade) OU se vende apenas online/WhatsApp. Quais bairros ou cidades vocês entregam?`,
        photoSiteHint: `da fachada, vitrine, interior ${prepDe}, produtos reais e equipe`,
        gbpFacadeHint: `da fachada ${prepDe}, vitrine, interior e produtos reais`,
        gbpFaqExamples: item.faq,
        gbpAmenitiesExamples: 'estacionamento, acessibilidade, ar-condicionado, retirada na loja, entrega/envio, Pix e cartão parcelado',
        gbpLocationQuestion:
          `Vocês têm ${item.s} física com placa na fachada para receber clientes OU vendem apenas online/entrega? Informe o endereço completo com CEP.`,
      };
    }

    // ====================================================
    // OUTROS SEGMENTOS
    // ====================================================
    case 'academia_fitness':
      return {
        placeSingular: 'academia / estúdio fitness',
        placePossessive: 'sua academia ou estúdio',
        clientTerm: 'alunos',
        offeringTerm: 'modalidades, aulas e planos de treino',
        paymentQuestion:
          'Como funcionam os planos e formas de pagamento (mensal, semestral, anual, Pix, cartão, Wellhub/Gympass ou TotalPass)? Prefere mostrar os valores no site?',
        addressQuestion:
          'Informe o endereço completo da academia/estúdio (rua, número, bairro, cidade, CEP, estacionamento e vestiários) e quais bairros vizinhos mais atende.',
        photoSiteHint: 'da fachada, salão de equipamentos, salas de aula, vestiários e professores',
        gbpFacadeHint: 'da fachada da academia, equipamentos, salas de aula e recepção',
        gbpFaqExamples: 'tem aula experimental grátis, aceita Wellhub (Gympass) ou TotalPass, tem estacionamento, abre aos domingos',
        gbpAmenitiesExamples: 'ar-condicionado, estacionamento, vestiários com armário, Wi-Fi, Wellhub/TotalPass, Pix e cartão',
        gbpLocationQuestion:
          'Informe o endereço completo com CEP da academia/estúdio onde os alunos treinam.',
      };

    case 'escola_curso':
      return {
        placeSingular: 'escola / curso',
        placePossessive: 'sua escola ou curso',
        clientTerm: 'alunos e pais',
        offeringTerm: 'cursos, turmas e programas de ensino',
        paymentQuestion:
          'Como funcionam matrícula, mensalidades e formas de pagamento (valores no site ou sob consulta, Pix, boleto, cartão ou bolsas/descontos)?',
        addressQuestion:
          'A escola/curso tem unidade física (informe rua, número, bairro, cidade, CEP e estacionamento/acessibilidade), é 100% online ou oferece os dois formatos? Quais regiões atende?',
        photoSiteHint: 'da fachada da escola, salas de aula, laboratórios/estrutura e professores',
        gbpFacadeHint: 'da fachada da escola, placa, recepção e salas de aula',
        gbpFaqExamples: 'tem aula experimental ou nivelamento grátis, entrega certificado, tem turmas online e presenciais, qual a faixa etária',
        gbpAmenitiesExamples: 'salas climatizadas, Wi-Fi, acessibilidade, estacionamento, aulas presenciais e online, Pix/boleto/cartão',
        gbpLocationQuestion:
          'A escola/curso possui sede física com placa na fachada para receber alunos OU funciona somente online? Informe o endereço completo com CEP.',
      };

    case 'hotel_pousada':
      return {
        placeSingular: 'hotel / pousada',
        placePossessive: 'seu hotel ou pousada',
        clientTerm: 'hóspedes',
        offeringTerm: 'categorias de quartos/suítes, café da manhã, lazer e pacotes',
        paymentQuestion:
          'Como funcionam as diárias e formas de pagamento (tarifa direta no WhatsApp/site, Pix, cartão, parcelamento e política de reserva)?',
        addressQuestion:
          'Informe o endereço completo do hotel/pousada (rua/estrada, número, bairro, cidade, CEP, estacionamento e acessibilidade) e a distância para o centro ou atrações principais.',
        photoSiteHint: 'da fachada, recepção, todas as categorias de quartos/suítes, área de lazer e café da manhã',
        gbpFacadeHint: 'da fachada, recepção, quartos, piscina/lazer e café da manhã',
        gbpFaqExamples: 'café da manhã e estacionamento estão inclusos, aceita pets, quais horários de check-in/check-out, tem desconto reservando direto',
        gbpAmenitiesExamples: 'café da manhã incluso, estacionamento gratuito, Wi-Fi, ar-condicionado, piscina, pet friendly, acessibilidade, Pix/cartão',
        gbpLocationQuestion:
          'Informe o endereço completo com CEP do hotel ou pousada para o pino exato no Google Maps.',
      };

    case 'salao_beleza':
      return {
        placeSingular: 'salão / barbearia',
        placePossessive: 'seu salão ou barbearia',
        clientTerm: 'clientes',
        offeringTerm: 'serviços de cabelo, barba, beleza e pacotes',
        paymentQuestion:
          'Como funcionam os preços e formas de pagamento (tabela no site ou orçamento no WhatsApp, Pix, cartão, parcelamento ou planos mensais)?',
        addressQuestion:
          'Informe o endereço completo do salão/barbearia (rua, número, bairro, cidade, CEP e estacionamento/acessibilidade) e quais bairros mais atende.',
        photoSiteHint: 'da fachada, espaço interno, cadeiras/lavatório, equipe e resultados reais de cabelos/barbas',
        gbpFacadeHint: 'da fachada, espaço interno, cadeiras e trabalhos realizados',
        gbpFaqExamples: 'precisa agendar antes, faz teste de mecha, tem estacionamento, atende sem hora marcada',
        gbpAmenitiesExamples: 'ar-condicionado, Wi-Fi, estacionamento, café/bebida cortesia, agendamento online/WhatsApp, Pix e cartão',
        gbpLocationQuestion:
          'O salão/barbearia possui ponto físico com placa na fachada para receber clientes? Informe o endereço completo com CEP.',
      };

    case 'igreja_religiosa':
      return {
        placeSingular: 'igreja / templo',
        placePossessive: 'sua igreja',
        clientTerm: 'visitantes e membros',
        offeringTerm: 'cultos, ministérios (Kids, Jovens, Casais), grupos nos lares e ações sociais',
        paymentQuestion:
          'Todas as celebrações têm entrada aberta e gratuita? Caso queiram incluir uma seção discreta de contribuição/dízimos voluntários (chave Pix CNPJ), informe aqui (ou deixe em branco se não quiser).',
        addressQuestion:
          'Informe o endereço completo do templo/igreja (rua, número, bairro, cidade, CEP, estacionamento gratuito e acessibilidade/Libras) e os bairros onde há grupos pequenos/células.',
        photoSiteHint: 'da fachada do templo, cultos, louvor, Espaço Kids, pastores e equipe de recepção',
        gbpFacadeHint: 'da fachada do templo, letreiro, auditório/nave e espaço de recepção',
        gbpFaqExamples: 'quais dias e horários dos cultos, tem Espaço Kids/berçário, tem estacionamento gratuito, tem acessibilidade ou Libras',
        gbpAmenitiesExamples: 'estacionamento gratuito, entrada acessível para cadeirantes, banheiro adaptado, fraldário/Espaço Kids, ar-condicionado',
        gbpLocationQuestion:
          'Informe o endereço completo com CEP do templo/igreja onde acontecem os cultos presenciais.',
      };

    case 'ong_instituto':
      return {
        placeSingular: 'ONG / instituto',
        placePossessive: 'sua ONG ou instituto',
        clientTerm: 'doadores, voluntários e famílias atendidas',
        offeringTerm: 'projetos sociais, oficinas, atendimentos gratuitos e formas de apoiar',
        paymentQuestion:
          'Como as pessoas e empresas podem contribuir (chave Pix CNPJ oficial, apadrinhamento mensal, doação de itens ou patrocínio empresarial)?',
        addressQuestion:
          'Informe o endereço completo da sede da ONG/instituto (rua, número, bairro, cidade, CEP e acessibilidade) e em quais comunidades ou regiões vocês atuam.',
        photoSiteHint: 'da sede, oficinas, voluntários, ações comunitárias (com autorização) e logotipo oficial',
        gbpFacadeHint: 'da fachada da sede da ONG/instituto, placa institucional e ações sociais',
        gbpFaqExamples: 'como doar com segurança, como ser voluntário, posso visitar a sede, aceitam doação de alimentos ou roupas',
        gbpAmenitiesExamples: 'sede aberta a visitas agendadas, acessibilidade, emissão de recibo institucional, chave Pix CNPJ oficial',
        gbpLocationQuestion:
          'A ONG/instituto possui sede física identificada para visitas e recebimento de doações? Informe o endereço completo com CEP.',
      };

    case 'startup_tech':
      return {
        placeSingular: 'empresa / escritório',
        placePossessive: 'sua empresa',
        clientTerm: 'clientes e empresas',
        offeringTerm: 'recursos da plataforma, planos e serviços de tecnologia',
        paymentQuestion:
          'Como funcionam os planos e formas de pagamento (planos mensais/anuais, teste grátis, Pix, boleto, cartão ou faturamento PJ)? Prefere exibir tabela de preços no site?',
        addressQuestion:
          'A empresa atua 100% online/remota para todo o Brasil ou possui escritório físico para reuniões (informe endereço completo com CEP, se quiser exibir)?',
        photoSiteHint: 'logotipo em boa qualidade, telas reais do sistema/produto, equipe e escritório (se houver)',
        gbpFacadeHint: 'do escritório (se aberto a visitas), equipe e identidade visual da marca',
        gbpFaqExamples: 'precisa instalar no computador, quanto tempo leva a implantação, tem teste grátis, tem fidelidade ou multa',
        gbpAmenitiesExamples: 'atendimento online para todo o Brasil, reuniões agendadas, suporte humano no WhatsApp, faturamento PJ/Pix/cartão',
        gbpLocationQuestion:
          'A empresa possui escritório físico aberto para receber clientes com placa na entrada OU opera 100% digital/remota? Informe o endereço ou região de atendimento.',
      };

    default:
      return DEFAULT_WORKPLACE_PROFILE;
  }
}

export function ofPlace(profile: NicheWorkplaceProfile): string {
  return profile.placePossessive.startsWith('sua ')
    ? `da ${profile.placePossessive}`
    : `do ${profile.placePossessive}`;
}

export function inPlace(profile: NicheWorkplaceProfile): string {
  return profile.placePossessive.startsWith('sua ')
    ? `na ${profile.placePossessive}`
    : `no ${profile.placePossessive}`;
}

/**
 * Construtor dos Questionários Nichados para Sites & Landing Pages.
 * Perguntas 100% simples e diretas para o CLIENTE responder (sem jargões técnicos como
 * "palavras-chave", "SEO", "Headline", "CTA", "Dobra", "Pixel" ou "Tag Manager"),
 * respeitando fielmente o local de atendimento real de cada profissão
 * (ex: escritório para advogados/arquitetos/contadores; consultório/clínica para saúde).
 */
export function buildSiteQuestionnaireTemplate(config: GbpRankingTemplateConfig): QuestionnaireTemplate {
  const profile = getNicheWorkplaceProfile(config.id);
  const doLocal = ofPlace(profile);
  const noLocal = inPlace(profile);
  const defaultHours = config.sampleHours || 'Segunda a Sexta: 08:30 às 18:30 | Sábado: 08:30 às 13:00';
  const defaultAddress =
    config.sampleAddressAndHours ||
    `Atendimento presencial em ${profile.placeSingular} na região central (com fácil acesso e estacionamento próximo).`;

  const actionGoalDefault = config.sampleHeroCta || 'Chamar no WhatsApp para tirar dúvidas e agendar';

  const rawQuestions: Array<{
    section: string;
    question: string;
    placeholder: string;
    helperText: string;
    sampleAnswer: string;
  }> = [
    {
      section: 'Sobre Você e Seu Negócio',
      question: `Qual é o nome ${doLocal} ou o seu nome profissional (como deve aparecer no site)${config.credentialExample ? `, há quanto tempo atua e qual é o seu registro profissional (ex: ${config.credentialExample})` : ' e há quanto tempo atua no mercado'}?`,
      placeholder: `Ex: ${config.sampleBusinessName}${config.credentialExample ? ` — ${config.credentialExample}` : ' — Atuando desde 2016'}`,
      helperText: 'Será exibido no topo, na apresentação e no rodapé do site.',
      sampleAnswer: `${config.sampleBusinessName}${config.credentialExample ? ` — ${config.credentialExample}` : ' (atuando desde 2016)'}.`,
    },
    {
      section: 'Sobre Você e Seu Negócio',
      question: `Em uma frase simples, o que você faz de melhor e qual é o principal benefício que seus ${profile.clientTerm} ganham ao escolher ${profile.placePossessive}?`,
      placeholder: `Ex: ${config.sampleHeroPromise || `Atendimento especializado em ${config.nicheTerminology} com agilidade, segurança e transparência.`}`,
      helperText: 'Ajuda a escrever a apresentação principal logo que o visitante abre o site.',
      sampleAnswer:
        config.sampleHeroPromise ||
        `Soluções especializadas em ${config.nicheTerminology} com qualidade comprovada, agilidade e confiança.`,
    },
    {
      section: 'Público e Principais Dúvidas',
      question: `Para quem é o seu trabalho (tipo de pessoa ou empresa que você mais atende) e qual problema ou necessidade faz essa pessoa procurar ${profile.placePossessive}?`,
      placeholder: `Ex: ${config.sampleAudiencePain || `Pessoas da região que precisam de ${config.nicheTerminology} com atendimento rápido e confiável.`}`,
      helperText: 'Ajuda a usar a linguagem certa no site para conversar com quem realmente procura o seu trabalho.',
      sampleAnswer:
        config.sampleAudiencePain ||
        `Pessoas e empresas da região que valorizam atendimento próximo, transparência nos prazos e serviço bem feito.`,
    },
    {
      section: 'Público e Principais Dúvidas',
      question: `Quais são as 3 maiores preocupações, medos ou dificuldades que seus ${profile.clientTerm} costumam ter antes de fechar com você?`,
      placeholder: `Ex: ${config.sampleAudienceFears || '1. Medo de demora no atendimento; 2. Receio de surpresas no valor; 3. Medo de contratar e não ter acompanhamento.'}`,
      helperText: 'Mostra no site que você entende exatamente o problema de quem chega e sabe resolver com segurança.',
      sampleAnswer:
        config.sampleAudienceFears ||
        '1. Medo de contratar um serviço e receber atendimento impessoal ou apressado; 2. Surpresas no orçamento e prazos não cumpridos; 3. Falta de suporte depois que o serviço começa.',
    },
    {
      section: 'Serviços, Produtos e Condições',
      question: `Liste de 4 a 6 principais ${profile.offeringTerm} que você quer mostrar no site (coloque o nome de cada um e explique de forma simples o que inclui).`,
      placeholder: `Ex: ${config.sampleTopServices}`,
      helperText: 'Quanto mais completo você explicar aqui, mais rica ficará a vitrine do seu site.',
      sampleAnswer: config.sampleTopServices,
    },
    {
      section: 'Serviços, Produtos e Condições',
      question: `Qual é o carro-chefe ${doLocal} (o que mais gera procura) e existe algum tipo de serviço ou pedido que você NÃO atende (para evitar mensagens erradas)?`,
      placeholder: `Ex: ${config.sampleFlagshipOffer || `Nosso carro-chefe é ${config.nicheTerminology}. Não atendemos serviços fora dessa especialidade.`}`,
      helperText: 'Destaca o que mais traz resultado para você e ajuda a filtrar contatos indesejados.',
      sampleAnswer:
        config.sampleFlagshipOffer ||
        `Nosso carro-chefe é o atendimento completo em ${config.nicheTerminology}, começando por uma conversa inicial para entender a necessidade real.`,
    },
    {
      section: 'Serviços, Produtos e Condições',
      question: profile.paymentQuestion,
      placeholder: `Ex: ${config.samplePricingPolicy || 'Orçamento transparente após avaliação; aceitamos Pix e parcelamento no cartão de crédito.'}`,
      helperText: 'Deixa claro para o visitante como funcionam as condições antes mesmo de ele entrar em contato.',
      sampleAnswer:
        config.samplePricingPolicy ||
        'Trabalhamos com orçamento transparente após entender a necessidade real; aceitamos Pix, cartões de crédito parcelados e emitimos nota fiscal.',
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
      question: `Como funciona o atendimento ${noLocal} na prática, passo a passo, desde o primeiro contato até a conclusão?`,
      placeholder: `Ex: ${config.sampleProcessSteps || 'Passo 1: Contato pelo WhatsApp; Passo 2: Avaliação e orçamento; Passo 3: Realização do serviço; Passo 4: Entrega e acompanhamento.'}`,
      helperText: 'Monta a seção "Como Funciona Passo a Passo" do site para passar tranquilidade a quem chega pela primeira vez.',
      sampleAnswer:
        config.sampleProcessSteps ||
        'Passo 1: Contato rápido pelo WhatsApp. Passo 2: Entendemos a necessidade e passamos as opções e valores com clareza. Passo 3: Agendamento ou início imediato. Passo 4: Entrega concluída com acompanhamento após o atendimento.',
    },
    {
      section: 'Como Funciona e Nossa História',
      question: `Conte a história resumida ${doLocal} ou da sua trajetória (como começou, formação, anos de experiência e quem faz parte da equipe) para colocarmos na parte "Sobre Nós".`,
      placeholder: `Ex: ${config.sampleHistory || config.sampleDifferentials}`,
      helperText: 'Gera confiança humana ao mostrar quem está por trás do trabalho e do atendimento.',
      sampleAnswer:
        config.sampleHistory ||
        `${config.sampleBusinessName} nasceu do propósito de oferecer um padrão superior em ${config.nicheTerminology}, unindo experiência prática e atendimento próximo.`,
    },
    {
      section: 'Diferenciais, Garantias e Provas',
      question: `Quais são os 3 maiores diferenciais ${doLocal} em comparação aos concorrentes e quais garantias, certificações ou cuidados após o atendimento você oferece?`,
      placeholder: `Ex: ${config.sampleDifferentials}${config.sampleGuarantees ? ` | Garantias: ${config.sampleGuarantees}` : ''}`,
      helperText: 'Preenche os motivos reais para o visitante escolher você e confiar no seu trabalho.',
      sampleAnswer: `${config.sampleDifferentials}${config.sampleGuarantees ? ` Garantias e cuidados: ${config.sampleGuarantees}` : ' Compromisso com cumprimento de prazos, transparência e acompanhamento próximo.'}`,
    },
    {
      section: 'Diferenciais, Garantias e Provas',
      question: `Quais números reais ou provas você pode mostrar no site (ex: quantos ${profile.clientTerm} já atendeu, anos de atuação, prêmios ou depoimentos reais)?`,
      placeholder: `Ex: ${config.sampleSocialProof || 'Mais de 10 anos de experiência, centenas de atendimentos e elogios reais verificados.'}`,
      helperText: 'Ajuda a mostrar resultados verdadeiros e depoimentos reais na página.',
      sampleAnswer:
        config.sampleSocialProof ||
        'Mais de 10 anos de atuação, centenas de atendimentos realizados com satisfação comprovada e recomendações reais.',
    },
    {
      section: 'Dúvidas Comuns',
      question: `Quais são as 4 a 5 perguntas que seus ${profile.clientTerm} sempre fazem no WhatsApp antes de fechar e qual é a resposta certa para cada uma?`,
      placeholder: `Ex: ${config.sampleFaq}`,
      helperText: 'Preenche a seção de Perguntas Frequentes do site para tirar as principais dúvidas antes do contato.',
      sampleAnswer: config.sampleFaq,
    },
    {
      section: 'Localização, Horários e Contatos',
      question: profile.addressQuestion,
      placeholder: `Ex: ${defaultAddress}${config.sampleTargetGeo ? ` | Regiões atendidas: ${config.sampleTargetGeo}` : ''}`,
      helperText: 'Define o mapa ou a região de atendimento mostrada no rodapé e na seção de localização do site.',
      sampleAnswer: `${defaultAddress}${config.sampleTargetGeo ? ` Regiões e cidades atendidas: ${config.sampleTargetGeo}.` : ''}`,
    },
    {
      section: 'Localização, Horários e Contatos',
      question: `Quais são os dias e horários exatos de atendimento ${doLocal} e em quanto tempo você costuma responder quem envia mensagem?`,
      placeholder: `Ex: ${defaultHours} | Retorno médio: até 15 minutos no horário de atendimento.`,
      helperText: 'Mostra seus horários reais no site para o visitante saber quando será atendido.',
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
      question: `Você já tem logotipo em boa qualidade e fotos ou vídeos reais (${profile.photoSiteHint}) para colocar no site? (Conte o que já tem pronto).`,
      placeholder: `Ex: ${config.sampleMediaAssets || 'Sim, temos logotipo e fotos reais prontas para enviar.'}`,
      helperText: 'Permite saber quais fotos reais suas já podemos usar no site e o que ainda precisa tirar.',
      sampleAnswer:
        config.sampleMediaAssets ||
        'Temos logotipo pronto e fotos reais da equipe, do ambiente de atendimento e dos principais serviços.',
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


