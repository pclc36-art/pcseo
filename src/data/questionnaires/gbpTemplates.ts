import { SAUDE_QUESTIONNAIRES } from './saude';
import { SERVICOS_QUESTIONNAIRES } from './servicos';
import { GASTRONOMIA_QUESTIONNAIRES } from './gastronomia';
import { ENTRETENIMENTO_QUESTIONNAIRES } from './entretenimento';
import { VAREJO_QUESTIONNAIRES } from './varejo';
import { OUTROS_QUESTIONNAIRES } from './outros';
import { buildTemplate } from './helper';
import { QuestionnaireTemplate } from './types';

function pickSample(siteTpl: QuestionnaireTemplate, pattern: RegExp, fallback: string): string {
  const match = siteTpl.questions.find((q) => pattern.test(q.question) || pattern.test(q.section));
  return match?.sampleAnswer?.trim() || fallback;
}

function getPlaceTerm(siteTpl: QuestionnaireTemplate): {
  singular: string;
  possessive: string;
  facadeHint: string;
} {
  if (
    ['medico_individual', 'fisioterapeuta', 'psicologo_terapeuta', 'nutricionista'].includes(siteTpl.id)
  ) {
    return {
      singular: 'consultório ou clínica',
      possessive: 'seu consultório ou clínica',
      facadeHint: 'da clínica/consultório ou placa na porta da sala',
    };
  }
  if (['clinica_estetica', 'clinica_medica', 'dentista_odonto'].includes(siteTpl.id)) {
    return {
      singular: 'clínica ou consultório',
      possessive: 'sua clínica',
      facadeHint: 'da fachada da clínica ou placa na porta',
    };
  }
  if (['escritorio_advocacia', 'arquitetura_interiores', 'contabilidade_contabil'].includes(siteTpl.id)) {
    return {
      singular: 'escritório',
      possessive: 'seu escritório',
      facadeHint: 'do prédio e placa do escritório na entrada',
    };
  }
  if (['restaurante', 'pizzaria', 'bar_pub', 'cafeteria', 'confeitaria'].includes(siteTpl.id)) {
    return {
      singular: 'estabelecimento',
      possessive: 'seu estabelecimento',
      facadeHint: 'da fachada do local, salão, mesas e pratos/produtos',
    };
  }
  if (
    ['loja_roupas', 'joalheria_relojoaria', 'floricultura', 'produtos_agricolas', 'petshop_veterinaria'].includes(
      siteTpl.id
    )
  ) {
    return {
      singular: 'loja',
      possessive: 'sua loja',
      facadeHint: 'da fachada da loja, vitrine, interior e produtos',
    };
  }
  if (siteTpl.id === 'igreja_religiosa') {
    return {
      singular: 'igreja ou comunidade',
      possessive: 'sua igreja',
      facadeHint: 'da fachada do templo, nave/auditório e letreiro',
    };
  }
  if (siteTpl.id === 'hotel_pousada') {
    return {
      singular: 'hotel ou pousada',
      possessive: 'seu hotel ou pousada',
      facadeHint: 'da fachada, recepção, quartos e área de lazer',
    };
  }
  if (siteTpl.id === 'salao_beleza') {
    return {
      singular: 'salão ou barbearia',
      possessive: 'seu salão',
      facadeHint: 'da fachada, cadeiras/espaço interno e atendimentos',
    };
  }
  return {
    singular: 'empresa',
    possessive: 'sua empresa',
    facadeHint: 'da fachada, recepção/interior e equipe trabalhando',
  };
}

/**
 * Gera um questionário específico de 12 perguntas fáceis para o CLIENTE responder,
 * reunindo exatamente os dados necessários para criar e configurar o perfil no Google Meu Negócio
 * (sem perguntas de criação de site e sem jargões técnicos da agência).
 */
export function buildClientGbpTemplate(siteTpl: QuestionnaireTemplate): QuestionnaireTemplate {
  const place = getPlaceTerm(siteTpl);
  const gbpId = `gbp_${siteTpl.id}`;

  const sampleNameAndReg = pickSample(
    siteTpl,
    /nome da sua empresa|nome profissional|nome completo/i,
    siteTpl.sampleBusinessName
  );
  const sampleServices = pickSample(
    siteTpl,
    /principais serviços|tratamentos|produtos|cardápio/i,
    `Principais serviços de ${siteTpl.title}.`
  );
  const sampleHistory = pickSample(
    siteTpl,
    /história resumida|trajetória/i,
    `${siteTpl.sampleBusinessName} atua com foco em atendimento de qualidade e confiança.`
  );
  const sampleDifferentials = pickSample(
    siteTpl,
    /maiores diferenciais/i,
    'Atendimento personalizado, pontualidade e equipe experiente.'
  );
  const sampleAddressAndAreas = pickSample(
    siteTpl,
    /endereço físico|onde o cliente|atende em endereço/i,
    'Rua Central, 500 — Centro (atendimento presencial e na região).'
  );
  const sampleHours = pickSample(
    siteTpl,
    /dias e horários exatos/i,
    'Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30.'
  );
  const sampleContacts = pickSample(
    siteTpl,
    /WhatsApp oficial/i,
    'Telefone/WhatsApp: (11) 98765-4321 | Site e Instagram oficiais da marca.'
  )
    .replace(/\|\s*Ação principal[^.]*\.?/i, '')
    .trim();
  const samplePricing = pickSample(
    siteTpl,
    /formas de pagamento|preços/i,
    'Aceitamos Pix, cartões de crédito e débito.'
  );
  const sampleFaq = pickSample(
    siteTpl,
    /perguntas que os clientes sempre fazem|dúvidas/i,
    '1. Precisa agendar antes? Sim, pelo WhatsApp. 2. Quais formas de pagamento aceitam? Pix e cartão.'
  );
  const samplePhotos = pickSample(
    siteTpl,
    /fotos ou vídeos reais|logotipo em boa qualidade/i,
    'Sim, temos fotos da fachada, ambiente interno e logotipo em boa qualidade.'
  );

  const secondaryPreview = siteTpl.suggestedSecondaryCategories.slice(0, 3).join(', ');

  return buildTemplate({
    id: gbpId,
    categoryKey: siteTpl.categoryKey,
    categoryTitle: siteTpl.categoryTitle,
    categoryEmoji: siteTpl.categoryEmoji,
    title: `${siteTpl.title} (Google Meu Negócio)`,
    emoji: siteTpl.emoji,
    subtitle: `Questionário simples com 12 perguntas reais para criar e configurar o perfil de ${siteTpl.title} no Google Meu Negócio e Google Maps`,
    totalQuestions: 12,
    sections: [
      'Identificação Oficial e Atuação',
      'Perfil Existente, Endereço e Regiões Atendidas',
      'Contatos, Horários e Facilidades do Local',
      'Serviços, Fotos Reais, Dúvidas e Avaliações',
    ],
    defaultPrimaryCategory: siteTpl.defaultPrimaryCategory,
    suggestedSecondaryCategories: siteTpl.suggestedSecondaryCategories,
    sampleBusinessName: siteTpl.sampleBusinessName,
    targetTool: 'gbp_pro',
    rawQuestions: [
      {
        section: 'Identificação Oficial e Atuação',
        question: `Qual é o nome exato de ${place.possessive} como aparece na fachada ou placa da porta (sem inventar palavras extras) e há quanto tempo vocês atuam (ou número do registro/CNPJ)?`,
        placeholder: `Ex: ${siteTpl.sampleBusinessName} (atuando desde 2016)`,
        helperText: 'O Google exige que o nome do perfil seja igual ao da placa ou documento oficial para evitar bloqueios.',
        sampleAnswer: sampleNameAndReg,
      },
      {
        section: 'Identificação Oficial e Atuação',
        question: `Qual é a atividade principal de ${place.possessive} (ex: ${siteTpl.defaultPrimaryCategory}) e quais outras áreas ou especialidades secundárias vocês também atendem?`,
        placeholder: `Ex: Principal: ${siteTpl.defaultPrimaryCategory} | Outras: ${secondaryPreview}`,
        helperText: 'Essas informações definem a categoria principal e as categorias extras dentro do perfil no Google.',
        sampleAnswer: `Atividade principal: ${siteTpl.defaultPrimaryCategory}. Outras especialidades atendidas: ${siteTpl.suggestedSecondaryCategories.join(', ')}.`,
      },
      {
        section: 'Perfil Existente, Endereço e Regiões Atendidas',
        question: `Vocês já têm uma ficha criada hoje no Google Meu Negócio / Google Maps? Se sim, mande o link dela e confirme qual conta Gmail administra o perfil.`,
        placeholder: 'Ex: Ainda não temos ficha criada (ou: já temos ficha, segue o link do Maps e acesso pelo Gmail).',
        helperText: 'Saberemos se vamos cadastrar o perfil do zero ou recuperar e atualizar uma ficha que já existe.',
        sampleAnswer: 'Ainda não temos ficha otimizada; queremos criar e verificar do zero usando nosso Gmail oficial.',
      },
      {
        section: 'Perfil Existente, Endereço e Regiões Atendidas',
        question: `Vocês têm ponto físico com placa na fachada para receber clientes OU atendem somente em domicílio/online sem local aberto ao público? Informe o endereço completo com CEP.`,
        placeholder: 'Ex: Rua das Flores, 240, Sala 3 — Centro, Cidade/UF, CEP 01234-000 (com placa na frente).',
        helperText: 'Define se o pino com endereço aparecerá aberto no mapa ou se configuraremos apenas a área de atendimento.',
        sampleAnswer: sampleAddressAndAreas,
      },
      {
        section: 'Perfil Existente, Endereço e Regiões Atendidas',
        question: `Quais bairros e cidades vizinhas ${place.possessive} atende presencialmente ou recebe clientes com mais frequência?`,
        placeholder: 'Ex: Centro, Vila Nova, Jardim Paulista e cidades vizinhas até 30 km.',
        helperText: 'Preenche as regiões de atendimento cadastradas dentro do seu perfil no Google Maps.',
        sampleAnswer: 'Bairros centrais, zonas comerciais e cidades vizinhas da região metropolitana.',
      },
      {
        section: 'Contatos, Horários e Facilidades do Local',
        question: `Informe o telefone e WhatsApp oficiais de atendimento, e-mail, Instagram e endereço do site (se já tiver) para colocarmos no perfil.`,
        placeholder: 'Ex: WhatsApp (11) 98765-4321 | Telefone fixo | Site | @instagram',
        helperText: 'Serão os botões de Ligar, Site e contato oficial exibidos para quem encontrar vocês no Google.',
        sampleAnswer: sampleContacts,
      },
      {
        section: 'Contatos, Horários e Facilidades do Local',
        question: `Quais são os dias e horários exatos de funcionamento (inclua se abre aos sábados, domingos, feriados ou se fecha no almoço)?`,
        placeholder: 'Ex: Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30 | Domingo: Fechado.',
        helperText: 'Mantém o aviso de "Aberto agora" sempre certo no Google Maps para ninguém dar viagem perdida.',
        sampleAnswer: sampleHours,
      },
      {
        section: 'Contatos, Horários e Facilidades do Local',
        question: `Quais comodidades e formas de pagamento existem no local (ex: estacionamento próprio ou convênio, acesso para cadeirante, banheiro adaptado, Wi-Fi, ar-condicionado, atende só com hora marcada, Pix/cartão)?`,
        placeholder: 'Ex: Estacionamento gratuito, entrada acessível para cadeirante, Wi-Fi, ar-condicionado, aceita Pix e cartões.',
        helperText: 'Preenche todos os selos e atributos oficiais que os clientes olham antes de ir até o local.',
        sampleAnswer: `Estrutura com ar-condicionado, Wi-Fi gratuito, acessibilidade e fácil acesso; ${samplePricing}`,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Liste de 5 a 8 principais serviços ou produtos que vocês fazem (com breve explicação e faixa de preço, se puder divulgar) e resuma a história e os diferenciais de ${place.possessive}.`,
        placeholder: 'Ex: Lista dos serviços principais + anos de experiência e diferenciais no atendimento.',
        helperText: 'Preenche a aba inteira de Serviços/Produtos e a descrição oficial do perfil no Google.',
        sampleAnswer: `Serviços principais: ${sampleServices}\n\nSobre e diferenciais: ${sampleHistory} Diferenciais: ${sampleDifferentials}`,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Quais fotos reais vocês já têm hoje (${place.facadeHint}) e, se o Google pedir um vídeo curto mostrando a fachada, a placa e a parte interna para confirmar o endereço, conseguem gravar pelo celular?`,
        placeholder: 'Ex: Temos fotos da fachada, placa e equipe; sim, conseguimos gravar o vídeo curto pelo celular.',
        helperText: 'Fotos reais aumentam muito os cliques no perfil e o vídeo costuma ser pedido pelo Google na verificação.',
        sampleAnswer: `${samplePhotos} Sim, conseguimos gravar um vídeo curto da rua, fachada/placa e interior caso o Google solicite na verificação.`,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Quais são as 3 a 5 dúvidas que os clientes mais perguntam antes de visitar ou ligar (ex: precisa agendar antes, tem estacionamento, aceita plano/cartão, entrega em domicílio)?`,
        placeholder: 'Ex: 1. Precisa agendar? 2. Tem estacionamento? 3. Quais formas de pagamento aceitam?',
        helperText: 'Vamos deixar essas perguntas já respondidas na aba de Perguntas e Respostas do Google Meu Negócio.',
        sampleAnswer: sampleFaq,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Quantas avaliações vocês já têm hoje no Google (se já tiverem perfil) e como costumam pedir avaliação aos clientes satisfeitos ao terminar o atendimento?`,
        placeholder: 'Ex: Ainda não temos perfil/avaliações (ou: temos 28 avaliações 4.9 estrelas e enviamos o link no WhatsApp).',
        helperText: 'Ajuda a organizar as respostas das avaliações atuais e orientar como receber novas notas 5 estrelas.',
        sampleAnswer: 'Já recebemos ótimos elogios dos clientes no WhatsApp e vamos padronizar o envio do link oficial de avaliação após cada atendimento.',
      },
    ],
  });
}

const ALL_RAW_SITE_TEMPLATES: QuestionnaireTemplate[] = [
  ...SAUDE_QUESTIONNAIRES,
  ...SERVICOS_QUESTIONNAIRES.filter((t) => t.targetTool !== 'gbp_pro'),
  ...GASTRONOMIA_QUESTIONNAIRES,
  ...ENTRETENIMENTO_QUESTIONNAIRES,
  ...VAREJO_QUESTIONNAIRES,
  ...OUTROS_QUESTIONNAIRES,
];

const bespokeAdvogadoGbp = SERVICOS_QUESTIONNAIRES.find((t) => t.id === 'advogado_individual_gbp');

const GENERATED_GBP_TEMPLATES: QuestionnaireTemplate[] = ALL_RAW_SITE_TEMPLATES
  .filter((t) => t.id !== 'advogado_individual_lp')
  .map((t) => buildClientGbpTemplate(t));

export const GBP_SAUDE_QUESTIONNAIRES = GENERATED_GBP_TEMPLATES.filter((t) => t.categoryKey === 'saude_bem_estar');
export const GBP_SERVICOS_QUESTIONNAIRES = [
  ...(bespokeAdvogadoGbp ? [bespokeAdvogadoGbp] : []),
  ...GENERATED_GBP_TEMPLATES.filter((t) => t.categoryKey === 'servicos_profissionais'),
];
export const GBP_GASTRONOMIA_QUESTIONNAIRES = GENERATED_GBP_TEMPLATES.filter((t) => t.categoryKey === 'gastronomia');
export const GBP_ENTRETENIMENTO_QUESTIONNAIRES = GENERATED_GBP_TEMPLATES.filter((t) => t.categoryKey === 'entretenimento_musica');
export const GBP_VAREJO_QUESTIONNAIRES = GENERATED_GBP_TEMPLATES.filter((t) => t.categoryKey === 'varejo_comercio');
export const GBP_OUTROS_QUESTIONNAIRES = GENERATED_GBP_TEMPLATES.filter((t) => t.categoryKey === 'outros_segmentos');

export const GBP_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  ...GBP_SAUDE_QUESTIONNAIRES,
  ...GBP_SERVICOS_QUESTIONNAIRES,
  ...GBP_GASTRONOMIA_QUESTIONNAIRES,
  ...GBP_ENTRETENIMENTO_QUESTIONNAIRES,
  ...GBP_VAREJO_QUESTIONNAIRES,
  ...GBP_OUTROS_QUESTIONNAIRES,
];
