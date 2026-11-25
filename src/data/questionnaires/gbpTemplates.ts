import { SAUDE_QUESTIONNAIRES } from './saude';
import { SERVICOS_QUESTIONNAIRES } from './servicos';
import { GASTRONOMIA_QUESTIONNAIRES } from './gastronomia';
import { ENTRETENIMENTO_QUESTIONNAIRES } from './entretenimento';
import { VAREJO_QUESTIONNAIRES } from './varejo';
import { OUTROS_QUESTIONNAIRES } from './outros';
import { buildTemplate, getNicheWorkplaceProfile, inPlace, ofPlace } from './helper';
import { QuestionnaireTemplate } from './types';

function pickSample(siteTpl: QuestionnaireTemplate, pattern: RegExp, fallback: string): string {
  const match = siteTpl.questions.find((q) => pattern.test(q.question) || pattern.test(q.section));
  return match?.sampleAnswer?.trim() || fallback;
}

/**
 * Gera um questionário específico de 12 perguntas fáceis para o CLIENTE responder,
 * reunindo exatamente os dados necessários para criar e configurar o perfil no Google Meu Negócio
 * (sem perguntas de criação de site e sem jargões técnicos da agência),
 * respeitando o local real de cada profissão (escritório, consultório, clínica, estúdio, loja, etc.).
 */
export function buildClientGbpTemplate(siteTpl: QuestionnaireTemplate): QuestionnaireTemplate {
  const profile = getNicheWorkplaceProfile(siteTpl.id);
  const doLocal = ofPlace(profile);
  const noLocal = inPlace(profile);
  const gbpId = `gbp_${siteTpl.id}`;

  const sampleNameAndReg = pickSample(
    siteTpl,
    /nome d[eoas] |nome profissional|nome completo/i,
    siteTpl.sampleBusinessName
  );
  const sampleServices = pickSample(
    siteTpl,
    /liste de 4 a 6|serviços, produtos e condições/i,
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
    /endereço completo|endereço físico|atende presencialmente|cidade-base|localização/i,
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
    /formas de pagamento|pagamentos|preços|honorários|mensalidades|diárias|negociação|orçamentos e pagamentos|propostas e pagamentos|ingressos e locação|contribuir|dízimos/i,
    'Aceitamos Pix, cartões de crédito e débito.'
  );
  const sampleFaq = pickSample(
    siteTpl,
    /perguntas que seus|perguntas que os clientes|dúvidas comuns/i,
    '1. Precisa agendar antes? Sim, pelo WhatsApp. 2. Quais formas de pagamento aceitam? Pix e cartão.'
  );
  const samplePhotos = pickSample(
    siteTpl,
    /fotos ou vídeos reais|logotipo em boa qualidade/i,
    'Sim, temos fotos da fachada, ambiente interno e logotipo em boa qualidade.'
  );

  const secondaryPreview = siteTpl.suggestedSecondaryCategories.slice(0, 3).join(', ');

  const cleanBaseTitle = siteTpl.title
    .replace(/\s*\(Landing Page Pessoal\)\s*/i, '')
    .replace(/\s*\(Landing Page\)\s*/i, '')
    .trim();

  return buildTemplate({
    id: gbpId,
    categoryKey: siteTpl.categoryKey,
    categoryTitle: siteTpl.categoryTitle,
    categoryEmoji: siteTpl.categoryEmoji,
    title: `${cleanBaseTitle} (Google Meu Negócio)`,
    emoji: siteTpl.emoji,
    subtitle: `Questionário simples com 12 perguntas reais para criar e configurar o perfil de ${cleanBaseTitle} no Google Meu Negócio e Google Maps`,
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
        question: `Qual é o nome exato ${doLocal} como aparece na fachada ou placa da porta (sem inventar palavras extras) e há quanto tempo vocês atuam (ou número do registro/CNPJ)?`,
        placeholder: `Ex: ${siteTpl.sampleBusinessName} (atuando desde 2016)`,
        helperText: 'O Google exige que o nome do perfil seja igual ao da placa ou documento oficial para evitar bloqueios.',
        sampleAnswer: sampleNameAndReg,
      },
      {
        section: 'Identificação Oficial e Atuação',
        question: `Qual é a atividade principal ${doLocal} (ex: ${siteTpl.defaultPrimaryCategory}) e quais outras áreas ou especialidades secundárias vocês também atendem?`,
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
        question: profile.gbpLocationQuestion,
        placeholder: 'Ex: Rua das Flores, 240, Sala 3 — Centro, Cidade/UF, CEP 01234-000 (com placa na frente).',
        helperText: 'Define se o pino com endereço aparecerá aberto no mapa ou se configuraremos apenas a área de atendimento.',
        sampleAnswer: sampleAddressAndAreas,
      },
      {
        section: 'Perfil Existente, Endereço e Regiões Atendidas',
        question: `Quais bairros e cidades vizinhas ${profile.placePossessive} atende presencialmente ou recebe ${profile.clientTerm} com mais frequência?`,
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
        question: `Quais são os dias e horários exatos de funcionamento ${doLocal} (inclua se abre aos sábados, domingos, feriados ou se fecha no almoço)?`,
        placeholder: 'Ex: Segunda a Sexta: 08:30 às 18:00 | Sábado: 08:30 às 12:30 | Domingo: Fechado.',
        helperText: 'Mantém o aviso de "Aberto agora" sempre certo no Google Maps para ninguém dar viagem perdida.',
        sampleAnswer: sampleHours,
      },
      {
        section: 'Contatos, Horários e Facilidades do Local',
        question: `Quais comodidades e formas de pagamento existem ${noLocal} (ex: ${profile.gbpAmenitiesExamples})?`,
        placeholder: `Ex: ${profile.gbpAmenitiesExamples}.`,
        helperText: 'Preenche todos os selos e atributos oficiais que as pessoas olham antes de visitar ou entrar em contato.',
        sampleAnswer: `Estrutura preparada com ${profile.gbpAmenitiesExamples}; ${samplePricing}`,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Liste de 5 a 8 principais ${profile.offeringTerm} ${doLocal} (com breve explicação) e resuma a história e os diferenciais para a descrição oficial do perfil.`,
        placeholder: `Ex: Lista dos principais ${profile.offeringTerm} + anos de experiência e diferenciais no atendimento.`,
        helperText: 'Preenche a aba inteira de Serviços/Produtos e a descrição oficial do perfil no Google.',
        sampleAnswer: `Principais itens: ${sampleServices}\n\nSobre e diferenciais: ${sampleHistory} Diferenciais: ${sampleDifferentials}`,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Quais fotos reais vocês já têm hoje (${profile.gbpFacadeHint}) e, se o Google pedir um vídeo curto mostrando a fachada, a placa e a parte interna para confirmar o endereço, conseguem gravar pelo celular?`,
        placeholder: 'Ex: Temos fotos da fachada, placa e equipe; sim, conseguimos gravar o vídeo curto pelo celular.',
        helperText: 'Fotos reais aumentam muito os cliques no perfil e o vídeo costuma ser pedido pelo Google na verificação.',
        sampleAnswer: `${samplePhotos} Sim, conseguimos gravar um vídeo curto da rua, fachada/placa e interior caso o Google solicite na verificação.`,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Quais são as 3 a 5 dúvidas que seus ${profile.clientTerm} mais perguntam antes de visitar ou ligar (ex: ${profile.gbpFaqExamples})?`,
        placeholder: `Ex: ${profile.gbpFaqExamples}.`,
        helperText: 'Vamos deixar essas perguntas já respondidas na aba de Perguntas e Respostas do Google Meu Negócio.',
        sampleAnswer: sampleFaq,
      },
      {
        section: 'Serviços, Fotos Reais, Dúvidas e Avaliações',
        question: `Quantas avaliações vocês já têm hoje no Google (se já tiverem perfil) e como costumam pedir avaliação aos ${profile.clientTerm} satisfeitos ao terminar o atendimento?`,
        placeholder: 'Ex: Ainda não temos perfil/avaliações (ou: temos 28 avaliações 4.9 estrelas e enviamos o link no WhatsApp).',
        helperText: 'Ajuda a organizar as respostas das avaliações atuais e orientar como receber novas notas 5 estrelas.',
        sampleAnswer: 'Já recebemos ótimos elogios no WhatsApp e vamos padronizar o envio do link oficial de avaliação após cada atendimento.',
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
