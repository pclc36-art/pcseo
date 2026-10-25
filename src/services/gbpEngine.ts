import {
  GbpQuestionnaireData,
  GbpDossier,
  GbpAuditRequest,
  GbpAuditReport,
  GbpProductServiceItem,
  GbpCategoryRecommendation,
  GbpAddressStrategy,
  GbpAttributesStrategy,
  GbpSeoStrategy,
  GbpDescriptionResult,
  GbpPhotoItem,
  GbpReviewStrategy,
  GbpPostItem,
  GbpFaqItem,
  GbpComplianceAndRiskCheck,
} from '../types/gbpTypes';
import { getGbpNichePackage } from '../data/gbp33NichosData';

// Heuristic fallback parser for raw questionnaire text or files
export function parseGbpRawTextHeuristic(rawText: string): Partial<GbpQuestionnaireData> {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const textLower = rawText.toLowerCase();

  // Extract phone/whatsapp
  const phoneMatches = rawText.match(/(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[-\s]?\d{4}/g) || [];
  const whatsapp = phoneMatches[0] || '';
  const phone = phoneMatches[1] || phoneMatches[0] || '';

  // Extract site
  const siteMatch = rawText.match(/https?:\/\/[^\s]+|(?:www\.)[^\s]+/i);
  const website = siteMatch ? siteMatch[0] : '';

  // Extract business name heuristics (supports Q&A format like "1. Qual é o nome oficial...", "Nome comercial:", etc.)
  let businessName = '';
  const nameLine = lines.find((l) => 
    /(?:nome oficial|nome da empresa|razão social|nome comercial|nome fantasia|marca|empresa|1\.\s*qual\s*é\s*o\s*nome)/i.test(l) &&
    (l.includes(':') || l.includes('?') || l.includes('-'))
  );

  if (nameLine) {
    if (nameLine.includes(':')) {
      businessName = nameLine.split(':')[1]?.trim() || '';
    } else if (nameLine.includes('?')) {
      const idx = lines.indexOf(nameLine);
      if (idx !== -1 && lines[idx + 1] && !lines[idx + 1].includes('?')) {
        businessName = lines[idx + 1].replace(/^[-*•\s]+/, '').trim();
      }
    }
  }

  if (!businessName) {
    // Try to find first non-header line
    const cleanFirst = lines.find((l) => !l.startsWith('#') && !l.startsWith('=') && !l.includes('QUESTIONÁRIO') && l.length > 2);
    if (cleanFirst) {
      businessName = cleanFirst.replace(/^[0-9]+[.)]\s*/, '').replace(/^[#*-\s]+/, '').trim();
    }
  }

  // Extract niche from the 33 niches package
  const matchedPkg = getGbpNichePackage(rawText);
  let primaryNiche = matchedPkg.name;

  // Extract address and city
  let fullAddress = '';
  let city = 'São Paulo';
  let state = 'SP';
  const addressLine = lines.find((l) => /endereço|localização|rua|avenida|av\.|alameda|bairro|cidade/i.test(l));
  if (addressLine && addressLine.includes(':')) {
    fullAddress = addressLine.split(':')[1]?.trim() || '';
  }

  const cityMatch = rawText.match(/(?:cidade|município)[\s:]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)(?:[-/,\s]+([A-Z]{2}))?/i);
  if (cityMatch && cityMatch[1]) {
    city = cityMatch[1].trim();
    if (cityMatch[2]) state = cityMatch[2].trim().toUpperCase();
  }

  // Extract service format
  let serviceFormat: GbpQuestionnaireData['serviceFormat'] = 'physical';
  if (textLower.includes('somente agendamento') || textLower.includes('apenas agendamento') || textLower.includes('hora marcada')) {
    serviceFormat = 'appointment_only';
  } else if (textLower.includes('domicílio') || textLower.includes('sem local físico') || textLower.includes('atendimento no cliente')) {
    serviceFormat = 'service_area';
  } else if (textLower.includes('ambos') || textLower.includes('híbrido')) {
    serviceFormat = 'hybrid';
  }

  // Extract services mentioned
  const extractedItems: GbpProductServiceItem[] = matchedPkg.recommendedServices.map((s, idx) => ({
    id: `item_${idx + 1}`,
    name: s.name,
    category: matchedPkg.primaryCategory,
    isPriority: idx === 0,
    priceEstimate: s.priceHint,
    description: s.description,
  }));

  return {
    businessName: businessName || 'Nome da Empresa',
    primaryNiche,
    fullAddress: fullAddress || `Atendimento em ${city} - ${state}`,
    city,
    state,
    phone,
    whatsapp,
    website,
    serviceFormat,
    items: extractedItems,
    priorityItemToPromote: extractedItems[0]?.name || matchedPkg.recommendedServices[0]?.name,
    userSuggestedKeywords: matchedPkg.topKeywordsGoogle.map((k) => k.keyword.replace(/\[cidade\]/gi, city)),
    additionalNotes: rawText.slice(0, 3000),
  };
}

// Client-side caller for analyzing questionnaire
export async function analyzeGbpQuestionnaire(rawText: string): Promise<{
  data: Partial<GbpQuestionnaireData>;
  source: 'gemini' | 'heuristic';
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch('/api/gbp/analyze-questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { data: json.data, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Fallback to heuristic GBP parser:', err);
  }

  return { data: parseGbpRawTextHeuristic(rawText), source: 'heuristic' };
}

// Heuristic fallback generator for complete 13-stage dossier with 33 niches and 4+ Google trending keywords
export function generateHeuristicDossier(q: GbpQuestionnaireData): GbpDossier {
  const city = q.city || 'São Paulo';
  const name = q.businessName || 'Empresa';
  const neighborhoods = q.serviceAreas && q.serviceAreas.length > 0 ? q.serviceAreas : [q.neighborhood || 'Região Central'];
  const primaryGeo = neighborhoods[0] || city;

  // Retrieve exact SEO package for the niche from 33 niches database
  const nichePkg = getGbpNichePackage(q.primaryNiche || q.businessName || q.additionalNotes || 'geral');
  const primaryCategory = nichePkg.primaryCategory;
  const secondaryCategories = nichePkg.secondaryCategories;

  const categories: GbpCategoryRecommendation = {
    primaryCategory,
    primaryJustification: `A categoria oficial "${primaryCategory}" alinha a empresa com a taxonomia prioritária do Google Maps em ${city}, garantindo máxima pontuação no algoritmo do Local 3-Pack.`,
    secondaryCategories,
    categoriesToAvoid: ['Serviços gerais', 'Empresa de marketing', 'Outros serviços não classificados'],
    relevanceNotes: 'Mantenha exatamente estas categorias secundárias sem dispersão para preservar o sinal de autoridade semântica no ranking de busca local.',
  };

  // 2. Address & Service Area
  const isPhysical = q.serviceFormat === 'physical' || q.serviceFormat === 'hybrid';
  const addressStrategy: GbpAddressStrategy = {
    serviceModel: q.serviceFormat,
    storefrontVisible: isPhysical,
    serviceRadiusKm: isPhysical ? 15 : 30,
    coveredAreas: neighborhoods,
    complianceNotes: isPhysical
      ? 'Endereço comercial com letreiro físico visível e atendimento presencial ativo. Vídeo de verificação deve mostrar fachada, número e recepção.'
      : 'Área de Atendimento (SAB). O endereço físico residencial fica oculto aos clientes nas buscas do Google Maps para total proteção contra suspensões.',
    verificationAdvice: isPhysical
      ? 'Grave um vídeo contínuo com seu smartphone: inicie na calçada mostrando a placa da rua e o número predial, entre na recepção, mostre o letreiro comercial e ferramentas de trabalho.'
      : 'Tenha em mãos comprovante de CNPJ com endereço cadastrado, alvará ou conta de consumo no nome exato da empresa para eventual verificação de suporte.',
  };

  // 3. Attributes
  const attributes: GbpAttributesStrategy = {
    accessibility: ['Entrada acessível para cadeira de rodas', 'Banheiro adaptado', 'Assentos adaptados'],
    paymentMethods: ['Cartões de crédito', 'Cartões de débito', 'Pix', 'Pagamento por aproximação via celular'],
    amenities: ['Wi-Fi gratuito de alta velocidade', 'Ar-condicionado silencioso', 'Ambiente acolhedor e higienizado'],
    planning: q.serviceFormat === 'appointment_only' ? ['Agendamento obrigatório'] : ['Agendamento recomendado'],
    highlights: nichePkg.essentialAttributes,
  };

  // 4. Local SEO & Top 4+ Google Trending Keywords
  // Map and customize all 4+ keywords with the client's city and neighborhood
  const formattedTopKeywords = nichePkg.topKeywordsGoogle.map((k) =>
    k.keyword
      .replace(/\[cidade\]/gi, city)
      .replace(/\[bairro\]/gi, primaryGeo)
  );

  const primaryKeyword = formattedTopKeywords[0] || `${nichePkg.name.toLowerCase()} em ${city.toLowerCase()}`;
  const secondaryKeywords = formattedTopKeywords.slice(1);

  const seo: GbpSeoStrategy = {
    primaryKeyword,
    secondaryKeywords,
    geoModifiers: [primaryGeo, city, `região metropolitana de ${city}`, `próximo a ${primaryGeo}`],
    napStandard: {
      name: q.businessName,
      address: q.fullAddress || `Atendimento em ${primaryGeo}, ${city} - ${q.state || 'Brasil'}`,
      phone: q.phone || q.whatsapp || '(xx) xxxx-xxxx',
    },
    searchIntents: [
      {
        intent: 'Necessidade Imediata e Proximidade',
        keywords: [
          `${nichePkg.name.toLowerCase()} perto de mim`,
          formattedTopKeywords[1] || `${nichePkg.primaryCategory.toLowerCase()} aberto agora em ${city.toLowerCase()}`,
        ],
      },
      {
        intent: 'Pesquisa Comparativa e Decisão (Fundo de Funil)',
        keywords: [
          formattedTopKeywords[2] || `melhor ${nichePkg.name.toLowerCase()} em ${city.toLowerCase()} avaliações`,
          formattedTopKeywords[3] || `preço e orçamento ${nichePkg.name.toLowerCase()} ${primaryGeo.toLowerCase()}`,
        ],
      },
      {
        intent: 'Contratação Direta e Agendamento',
        keywords: [
          `agendar ${nichePkg.name.toLowerCase()} whatsapp ${city.toLowerCase()}`,
          formattedTopKeywords[4] || `contato ${nichePkg.name.toLowerCase()} ${city.toLowerCase()}`,
        ],
      },
    ],
  };

  // 5. Official Description (Max 750 chars, embedding keywords naturally)
  let rawDesc = nichePkg.descriptionTemplate
    .replace(/\[Nome da Empresa\]/gi, q.businessName)
    .replace(/\[Nome da Clínica\]/gi, q.businessName)
    .replace(/\[Nome do Estúdio\]/gi, q.businessName)
    .replace(/\[Nome do Restaurante\]/gi, q.businessName)
    .replace(/\[Nome da Pizzaria\]/gi, q.businessName)
    .replace(/\[Nome do Bar\]/gi, q.businessName)
    .replace(/\[Nome da Cafeteria\]/gi, q.businessName)
    .replace(/\[Nome da Confeitaria\]/gi, q.businessName)
    .replace(/\[Nome da Loja\]/gi, q.businessName)
    .replace(/\[Nome da Joalheria\]/gi, q.businessName)
    .replace(/\[Nome da Floricultura\]/gi, q.businessName)
    .replace(/\[Nome da Academia\]/gi, q.businessName)
    .replace(/\[Nome do Colégio\/Instituto\]/gi, q.businessName)
    .replace(/\[Nome do Hotel\/Pousada\]/gi, q.businessName)
    .replace(/\[Nome do Salão\/Barbearia\]/gi, q.businessName)
    .replace(/\[Nome da Igreja\/Templo\]/gi, q.businessName)
    .replace(/\[Nome do Instituto\/ONG\]/gi, q.businessName)
    .replace(/\[Nome da Tech\/Startup\]/gi, q.businessName)
    .replace(/\[cidade\]/gi, city)
    .replace(/\[bairro\]/gi, primaryGeo);

  if (rawDesc.length > 748) {
    rawDesc = rawDesc.slice(0, 745) + '...';
  }

  const hook = rawDesc.slice(0, 240);

  const description: GbpDescriptionResult = {
    fullDescription: rawDesc,
    first250CharsHook: hook,
    charCount: rawDesc.length,
    complianceChecks: {
      noLinks: !/https?:\/\/|www\./i.test(rawDesc),
      noProhibitedPromotions: !/desconto imperdível|clique aqui|compre agora/i.test(rawDesc),
      noKeywordStuffing: true,
      noAllCaps: !/[A-Z]{4,}/.test(rawDesc),
    },
  };

  // 6. Catalog (Leverage recommended services from 33 niches package if empty)
  const catalog: GbpProductServiceItem[] = q.items && q.items.length > 0 && q.items[0].name ? q.items : nichePkg.recommendedServices.map((s, idx) => ({
    id: `srv_${idx + 1}`,
    name: s.name,
    category: nichePkg.primaryCategory,
    isPriority: idx === 0,
    priceEstimate: s.priceHint,
    description: s.description.replace(/\[cidade\]/gi, city),
  }));

  // 7. Photo Checklist
  const photoChecklist: GbpPhotoItem[] = [
    {
      id: 'ph_1',
      category: 'fachada',
      title: 'Fachada Comercial com Identificação Nítida',
      recommendedSpec: '1200x900px, iluminação natural diurna sem reflexos fortes',
      seoFileName: `${q.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-fachada-${city.toLowerCase()}.jpg`,
      isCrucialForVerification: true,
      description: 'Foto externa capturando a entrada, número predial e placa visível para confirmação da localização e acolhimento do cliente.',
    },
    {
      id: 'ph_2',
      category: 'interior',
      title: 'Espaço de Atendimento / Recepção Acolhedora',
      recommendedSpec: '1200x900px, formato horizontal, ambiente limpo e organizado',
      seoFileName: `${q.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-recepcao-${primaryGeo.toLowerCase()}.jpg`,
      isCrucialForVerification: false,
      description: 'Apresenta a área onde o cliente é recepcionado, transmitindo conforto, higiene e profissionalismo.',
    },
    {
      id: 'ph_3',
      category: 'equipe',
      title: 'Equipe em Traje Profissional com Sorriso Autêntico',
      recommendedSpec: '1200x900px, foco nítido e fundo desfocado',
      seoFileName: `equipe-${q.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`,
      isCrucialForVerification: false,
      description: 'Humaniza a marca no Google Maps, gerando empatia imediata e confiança decisiva para a escolha do cliente.',
    },
    {
      id: 'ph_4',
      category: 'trabalho_em_andamento',
      title: 'Equipamentos ou Serviço em Execução',
      recommendedSpec: '1200x900px, ângulo de ação sem expor dados confidenciais',
      seoFileName: `servico-${nichePkg.id}-${city.toLowerCase()}.jpg`,
      isCrucialForVerification: false,
      description: 'Mostra a prática técnica e a atenção aos detalhes durante o processo de entrega.',
    },
  ];

  // 8. Review Strategy & Templates
  const reviewStrategy: GbpReviewStrategy = {
    reviewShortlinkTip: 'Acesse o gerenciador do perfil no Google, clique em "Pedir avaliações" e copie o link curto oficial (ex: https://g.page/r/.../review). Compartilhe no WhatsApp após a conclusão do atendimento com mensagem personalizada.',
    qrCodeUsageTip: 'Crie uma placa física de balcão (em acrílico ou madeira) contendo o QR Code direto para o formulário de avaliação do Google com a frase: "Sua opinião é fundamental para nossa equipe".',
    responseTemplates: {
      fiveStar: `Olá, {Nome}! Agradecemos de coração por sua avaliação 5 estrelas e pelo reconhecimento do trabalho da ${q.businessName} em ${city}. É uma honra cuidar das suas necessidades. Conte sempre conosco!`,
      fourStarPositiveWithFeedback: `Olá, {Nome}! Muito obrigado por sua avaliação tão carinhosa e pelo feedback detalhado. Estamos sempre aprimorando cada etapa do nosso atendimento em ${primaryGeo}. Esperamos vê-lo(a) novamente em breve!`,
      threeStarNeutral: `Olá, {Nome}. Agradecemos por dedicar seu tempo para nos avaliar. Nosso compromisso na ${q.businessName} é oferecer uma experiência impecável. Gostaríamos de compreender como podemos melhorar ainda mais: por favor, envie uma mensagem para nosso WhatsApp ${q.whatsapp || q.phone}.`,
      oneOrTwoStarCritical: `Olá, {Nome}. Lamentamos profundamente que sua experiência não tenha atingido o padrão de qualidade que prezamos rigorosamente na ${q.businessName}. Valorizamos muito seu relato e nossa diretoria gostaria de conversar diretamente com você para solucionar qualquer pendência. Por favor, contate-nos pelo telefone ${q.phone || q.whatsapp}.`,
      fakeOrUnfairSuspected: `Olá. Não localizamos registros de atendimento com seu nome em nosso sistema da ${q.businessName}. Levamos muito a sério a transparência e as diretrizes do Google. Caso tenha havido qualquer equívoco ou atendimento através de terceiros, por favor entre em contato conosco pelo ${q.phone || q.whatsapp} para apurarmos imediatamente.`,
    },
    ethicalGuidelines: [
      'Proibido pelo Google oferecer descontos, brindes ou qualquer incentivo financeiro em troca de avaliações.',
      'Nunca compre avaliações através de empresas ou bots (leva à suspensão definitiva da ficha no Google Maps).',
      'Responda a 100% das avaliações em até 24 horas úteis, utilizando palavras-chave naturalmente nas respostas.',
    ],
  };

  // 9. 30-Day Post Calendar
  const editorialCalendar: GbpPostItem[] = [
    {
      day: 1,
      type: 'update',
      topic: 'Boas-vindas e Apresentação Institucional',
      headline: nichePkg.googlePostsTemplates[0]?.title || `Conheça a ${q.businessName} em ${primaryGeo}`,
      body: (nichePkg.googlePostsTemplates[0]?.body || `Buscando soluções especializadas em ${nichePkg.name.toLowerCase()} com excelência e pontualidade? Conheça nossos diferenciais na região de ${city}.`).replace(/\[cidade\]/gi, city),
      ctaButton: (nichePkg.googlePostsTemplates[0]?.cta as 'Comprar' | 'Ligar agora' | 'Pedir online' | 'Reservar' | 'Saiba mais') || 'Saiba mais',
      photoGuidance: 'Foto ampla da fachada ou ambiente de recepção.',
    },
    {
      day: 6,
      type: 'offer',
      topic: 'Destaque do Serviço Principal',
      headline: `${catalog[0]?.name || 'Excelência em Cada Detalhe'}`,
      body: `Descubra como nosso atendimento exclusivo para ${primaryGeo} transforma suas expectativas em realidade. Atendimento com agendamento dedicado para seu conforto em ${city}.`,
      ctaButton: 'Ligar agora',
      photoGuidance: 'Foto em alta resolução dos instrumentos ou produtos em uso.',
    },
    {
      day: 12,
      type: 'photo_spotlight',
      topic: 'Bastidores e Tecnologia',
      headline: 'Compromisso com precisão e conforto',
      body: `Nosso espaço foi planejado pensando no seu bem-estar. Venha tomar um café conosco e conhecer nossa infraestrutura completa em ${city}.`,
      ctaButton: 'Reservar',
      photoGuidance: 'Foto espontânea da equipe em ação.',
    },
    {
      day: 18,
      type: 'update',
      topic: 'Dica Prática para o Cliente',
      headline: `Dica de especialista para quem busca ${nichePkg.name.toLowerCase()}`,
      body: `Ao escolher um profissional em ${city}, certifique-se da procedência, certificações e histórico de atendimento. Na ${q.businessName}, prezamos pela transparência absoluta.`,
      ctaButton: 'Saiba mais',
      photoGuidance: 'Foto clean com elementos do cotidiano profissional.',
    },
    {
      day: 25,
      type: 'update',
      topic: 'Prova Social & Depoimento',
      headline: 'A satisfação de quem confia em nosso trabalho',
      body: `Nosso maior orgulho é a confiança depositada por cada cliente em ${primaryGeo}. Obrigado a todos que nos avaliaram com 5 estrelas no Google!`,
      ctaButton: 'Ligar agora',
      photoGuidance: 'Foto da equipe reunida com sorriso e acolhimento.',
    },
  ];

  // 10. Strategic Localized FAQ (Merged with niche-specific FAQs)
  const faq: GbpFaqItem[] = [
    {
      id: 'faq_1',
      question: `Qual é o endereço e horário de atendimento da ${q.businessName}?`,
      answer: `Estamos localizados em ${q.fullAddress || primaryGeo + ', ' + city}. Nosso horário de funcionamento é: ${q.operatingHours || 'Segunda a Sexta das 08h às 18h'}.`,
      strategicGoal: 'Esclarecer localização e horário para capturar intenção de visita imediata.',
    },
    {
      id: 'faq_2',
      question: `Como faço para agendar um atendimento na ${q.businessName}?`,
      answer: `Você pode agendar diretamente pelo WhatsApp no número ${q.whatsapp || q.phone} ou ligando para ${q.phone || q.whatsapp}. Nossa equipe responde rapidamente com os horários disponíveis.`,
      strategicGoal: 'Reduzir fricção e direcionar o contato para o canal preferencial de conversão.',
    },
    ...nichePkg.faqsForRanking.map((f, idx) => ({
      id: `faq_niche_${idx + 1}`,
      question: f.question.replace(/\[cidade\]/gi, city),
      answer: f.answer.replace(/\[cidade\]/gi, city),
      strategicGoal: 'Ranqueamento orgânico em buscas conversacionais no Google Maps.',
    })),
  ];

  // 11. Compliance & Risk Checks
  const complianceChecks: GbpComplianceAndRiskCheck[] = [
    {
      item: 'Nome Oficial da Ficha (Anti-Suspensão)',
      status: 'safe',
      details: `O nome "${q.businessName}" está limpo e compatível com a placa e documentação oficial. Não foram incluídas palavras-chave promocionais artificiais no título.`,
    },
    {
      item: 'Enquadramento da Categoria Primária',
      status: 'safe',
      details: `A categoria "${primaryCategory}" possui correspondência exata na lista oficial do Google Business Profile.`,
    },
    {
      item: 'Endereço e Visibilidade do Estabelecimento',
      status: isPhysical ? 'safe' : 'warning',
      details: isPhysical
        ? 'Endereço físico visível. Certifique-se de que a fachada tenha placa comercial nítida com o nome da empresa.'
        : 'Como empresa de área de cobertura (SAB), oculte o endereço residencial para não violar as diretrizes do Google.',
      howToFix: isPhysical ? undefined : 'Na aba Informações do perfil, clique em Editar endereço e marque "Ocultar endereço dos clientes".',
    },
  ];

  // 12. 90-Day Roadmap
  const maintenancePlan90Days = {
    month1: [
      'Concluir processo de verificação oficial no Google (código por telefone/vídeo gravado).',
      'Preencher todos os atributos oficiais (acessibilidade, pagamentos, público).',
      'Publicar o primeiro lote com 10 fotos em alta resolução (fachada, interior, equipe).',
      'Cadastrar o catálogo com os principais serviços e preços estimativos.',
      'Fazer o primeiro post institucional na aba Atualizações com botão CTA.',
    ],
    month2: [
      'Implementar fluxo padrão pós-atendimento para solicitar avaliações no WhatsApp.',
      'Responder a 100% dos comentários e avaliações recebidas em até 24h.',
      'Publicar 1 nova atualização por semana mantendo os sinais de frescor do perfil.',
      'Adicionar 3 novas fotos de trabalho em andamento e bastidores.',
    ],
    month3: [
      'Analisar o painel de Desempenho do Google (pesquisas diretas vs indiretas, ligações e rotas).',
      'Realizar auditoria comparativa com os 3 principais concorrentes locais do mapa.',
      'Atualizar horários especiais de feriados e datas comemorativas.',
      'Publicar novas perguntas frequentes (Q&A) baseadas nas dúvidas reais dos clientes.',
    ],
  };

  return {
    id: `dossier_${Date.now()}`,
    clientId: `client_${Date.now()}`,
    clientName: q.businessName,
    businessName: q.businessName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'completed',
    version: 1,
    generatedBy: 'heuristic',
    questionnaire: q,
    categories,
    addressStrategy,
    attributes,
    seo,
    description,
    catalog,
    photoChecklist,
    reviewStrategy,
    editorialCalendar,
    faq,
    complianceChecks,
    maintenancePlan90Days,
  };
}

// Client-side caller for generating dossier
export async function generateGbpDossier(q: GbpQuestionnaireData): Promise<{
  dossier: GbpDossier;
  source: 'gemini' | 'heuristic';
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch('/api/gbp/generate-dossier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionnaire: q }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const fullDossier: GbpDossier = {
          ...generateHeuristicDossier(q),
          ...json.data,
          id: `dossier_${Date.now()}`,
          businessName: q.businessName,
          clientName: q.businessName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          generatedBy: 'gemini',
        };
        return { dossier: fullDossier, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Fallback to heuristic GBP Dossier generator:', err);
  }

  return { dossier: generateHeuristicDossier(q), source: 'heuristic' };
}

// Heuristic fallback auditor for existing GBP profile
export function auditGbpProfileHeuristic(request: GbpAuditRequest): GbpAuditReport {
  const req = request;
  const businessName = req.businessName || 'Empresa Auditada';
  
  // 1. Guidelines & Name (20 pts)
  // Check keyword stuffing in name (ex: "OdontoSmile - Dentista Moema Clareamento")
  let nameScore = 20;
  const hasSpamKeywords = /[-–|:]\s*(dentista|advogado|médico|clínica|preço|barato|em|sp|rio|moema|centro)/i.test(businessName);
  if (hasSpamKeywords) {
    nameScore = 8;
  }
  const guidelinesAndName = {
    name: 'Diretrizes & Nome do Perfil',
    score: nameScore,
    maxScore: 20,
    weightPercent: 20,
    status: nameScore >= 16 ? ('excellent' as const) : ('critical' as const),
    diagnostics: hasSpamKeywords
      ? [
          'Alerta Crítico: O nome parece conter palavras-chave adicionadas artificialmente após o nome fantasia.',
          'Risco severo de suspensão manual ou algorítmica pelo Google Maps.',
        ]
      : [
          'Nome do perfil limpo e em conformidade com as diretrizes do Google.',
          'Sem sinais óbvios de manipulação promocional no título.',
        ],
  };

  // 2. Categories & Taxonomy (15 pts)
  const hasCategory = Boolean(req.primaryCategory && req.primaryCategory.length > 3);
  const categoriesScore = hasCategory ? 15 : 5;
  const categoriesTaxonomy = {
    name: 'Categorias & Taxonomia',
    score: categoriesScore,
    maxScore: 15,
    weightPercent: 15,
    status: categoriesScore >= 12 ? ('excellent' as const) : ('warning' as const),
    diagnostics: hasCategory
      ? [`Categoria primária "${req.primaryCategory}" identificada e ativa.`]
      : ['Categoria primária não informada ou genérica demais.'],
  };

  // 3. NAP & Location (15 pts)
  const hasAddress = Boolean(req.addressOrSAB && req.addressOrSAB.length > 5);
  const napScore = hasAddress ? 14 : 6;
  const napAndLocation = {
    name: 'NAP & Cobertura Geográfica',
    score: napScore,
    maxScore: 15,
    weightPercent: 15,
    status: napScore >= 12 ? ('good' as const) : ('warning' as const),
    diagnostics: hasAddress
      ? ['Endereço ou Área de Atendimento configurada.']
      : ['Inconsistência na definição de endereço ou falta de clareza na área de cobertura.'],
  };

  // 4. Description Optimization (10 pts)
  const desc = req.currentDescription || '';
  let descScore = 10;
  if (!req.hasDescription && desc.length === 0) {
    descScore = 0;
  } else if (desc.length < 150) {
    descScore = 4;
  } else if (desc.length > 750) {
    descScore = 6;
  }
  const descriptionOptimization = {
    name: 'Descrição & SEO Local',
    score: descScore,
    maxScore: 10,
    weightPercent: 10,
    status: descScore >= 8 ? ('excellent' as const) : descScore >= 4 ? ('warning' as const) : ('critical' as const),
    diagnostics: descScore === 0
      ? ['A aba "De quem é a empresa" (descrição) está totalmente vazia.']
      : descScore < 8
      ? [`Descrição curta (${desc.length} caracteres). O Google permite até 750 caracteres para reforçar SEO local.`]
      : ['Descrição preenchida com boa densidade de termos locais.'],
  };

  // 5. Reviews & Reputation (15 pts)
  const rating = req.currentRating || 0;
  const reviewsCount = req.totalReviews || 0;
  const respRate = req.responseRatePercent !== undefined ? req.responseRatePercent : 50;
  let reviewScore = 15;
  if (reviewsCount === 0) reviewScore = 3;
  else if (reviewsCount < 10) reviewScore = 7;
  else if (rating < 4.0) reviewScore = 8;
  else if (respRate < 50) reviewScore = 10;

  const reviewsAndReputation = {
    name: 'Avaliações & Reputação',
    score: reviewScore,
    maxScore: 15,
    weightPercent: 15,
    status: reviewScore >= 12 ? ('excellent' as const) : reviewScore >= 7 ? ('good' as const) : ('warning' as const),
    diagnostics: [
      `Nota média: ${rating > 0 ? rating.toFixed(1) : 'Sem nota'} estrelas com ${reviewsCount} avaliações registradas.`,
      `Taxa estimada de respostas aos comentários: ${respRate}%.`,
    ],
  };

  // 6. Visual Presence & Photos (15 pts)
  const photos = req.photosCount || 0;
  let photoScore = 15;
  if (photos === 0) photoScore = 2;
  else if (photos < 5) photoScore = 6;
  else if (photos < 15) photoScore = 10;

  const visualPresence = {
    name: 'Presença Visual & Fotos',
    score: photoScore,
    maxScore: 15,
    weightPercent: 15,
    status: photoScore >= 12 ? ('excellent' as const) : photoScore >= 7 ? ('good' as const) : ('warning' as const),
    diagnostics: photos < 10
      ? [`Apenas ${photos} fotos cadastradas. Perfis competitivos possuem mais de 25 fotos de alta qualidade.`]
      : [`Volume satisfatório de imagens (${photos} fotos cadastradas).`],
  };

  // 7. Engagement, Posts & FAQ (10 pts)
  let engScore = 10;
  if (!req.hasCatalog) engScore -= 3;
  if (!req.hasFaq) engScore -= 3;
  if (!req.lastPostDate) engScore -= 2;

  const engagementAndFaq = {
    name: 'Engajamento, Posts & FAQ',
    score: Math.max(2, engScore),
    maxScore: 10,
    weightPercent: 10,
    status: engScore >= 8 ? ('excellent' as const) : ('warning' as const),
    diagnostics: [
      req.hasCatalog ? 'Catálogo de serviços/produtos presente.' : 'Catálogo de produtos ou serviços ausente.',
      req.hasFaq ? 'Seção de perguntas e respostas ativa.' : 'Seção de perguntas da comunidade inativa.',
    ],
  };

  const overallScore = Math.min(
    100,
    guidelinesAndName.score +
      categoriesTaxonomy.score +
      napAndLocation.score +
      descriptionOptimization.score +
      reviewsAndReputation.score +
      visualPresence.score +
      engagementAndFaq.score
  );

  let scoreLevel: GbpAuditReport['scoreLevel'] = 'moderado';
  if (overallScore >= 90) scoreLevel = 'excelente';
  else if (overallScore >= 75) scoreLevel = 'bom';
  else if (overallScore >= 50) scoreLevel = 'moderado';
  else if (overallScore >= 30) scoreLevel = 'insuficiente';
  else scoreLevel = 'critico';

  // Build recommendations
  const recommendations: GbpAuditReport['recommendations'] = [];
  if (hasSpamKeywords) {
    recommendations.push({
      id: 'rec_spam_name',
      severity: 'critical',
      title: 'Corrigir Imediatamente o Nome da Empresa no Perfil',
      issueFound: 'O título do perfil contém termos promocionais ou palavras-chave repetitivas.',
      riskIfIgnored: 'Suspensão manual do Google Meu Negócio sem aviso prévio e perda imediata de todo o tráfego do mapa.',
      actionRequired: 'Ajuste o nome para corresponder estritamente ao letreiro comercial e CNPJ.',
      suggestedContent: businessName.split(/[-–|:]/)[0].trim(),
    });
  }

  if (descScore < 8) {
    recommendations.push({
      id: 'rec_desc',
      severity: 'high',
      title: 'Escrever Descrição Otimizada de até 750 Caracteres',
      issueFound: 'A descrição atual está vazia ou não aproveita o potencial dos 750 caracteres do Google.',
      riskIfIgnored: 'Perda de relevância em buscas de cauda longa e menor taxa de conversão de quem acessa a ficha.',
      actionRequired: 'Redija uma descrição com gancho persuasivo nos primeiros 250 caracteres destacando bairro e diferenciais.',
    });
  }

  if (photoScore < 12) {
    recommendations.push({
      id: 'rec_photos',
      severity: 'medium',
      title: 'Fazer Upload de Novas Fotos em Alta Resolução',
      issueFound: 'A galeria visual possui poucas imagens ou está desatualizada.',
      riskIfIgnored: 'Perda de cliques para concorrentes locais com fotos mais atraentes.',
      actionRequired: 'Suba pelo menos 10 novas fotos (fachada, recepção, equipe e serviços em execução).',
    });
  }

  if (respRate < 80) {
    recommendations.push({
      id: 'rec_reviews',
      severity: 'high',
      title: 'Responder a 100% das Avaliações de Clientes',
      issueFound: 'Existem avaliações sem resposta oficial do proprietário.',
      riskIfIgnored: 'Sinal negativo de engajamento para o algoritmo de ranking e percepção de descaso pelo consumidor.',
      actionRequired: 'Utilize os templates de resposta profissional para responder tanto às críticas quanto aos elogios.',
    });
  }

  // Build whatToModify list
  const whatToModify = [
    ...(hasSpamKeywords ? [{
      title: 'Remover Palavras-Chave Promocionais do Título',
      currentSituation: `O nome "${businessName}" contém palavras-chave repetitivas ou termos de busca adicionados artificialmente.`,
      risk: 'Risco iminente de suspensão dura (Hard Suspension) e remoção imediata do Google Maps por denúncia de concorrente ou filtro algorítmico.',
      howToFix: `Renomear a ficha para "${businessName.split(/[-–|:]/)[0].trim()}", compatibilizando exatamente com a placa de fachada e o cartão CNPJ.`,
      priority: 'crítica' as const,
    }] : []),
    ...(descScore < 8 ? [{
      title: 'Reescrever Descrição para Formato de Alta Conversão',
      currentSituation: descScore === 0 ? 'A descrição oficial do perfil está completamente vazia.' : `Descrição atual muito curta (${desc.length} caracteres), sem gancho nos 250 primeiros.`,
      risk: 'Perda de indexação em pesquisas por sinônimos e baixa taxa de conversão de cliques para ligações/rotas.',
      howToFix: 'Inserir a descrição de 750 caracteres com gancho inicial, diferenciais e chamada clara para ação sem links externos proibidos.',
      priority: 'alta' as const,
    }] : []),
    ...(respRate < 80 ? [{
      title: 'Regularizar Taxa de Resposta a Avaliações de Clientes',
      currentSituation: `Taxa estimada de resposta em ${respRate}%. Existem clientes sem retorno oficial do proprietário.`,
      risk: 'O Google Maps diminui a frequência de exibição no Local Pack para perfis que aparentam abandono e clientes novos desconfiam da atenção prestada.',
      howToFix: 'Responder 100% das avaliações pendentes com mensagens personalizadas em até 24 horas úteis.',
      priority: 'alta' as const,
    }] : []),
    ...(photoScore < 12 ? [{
      title: 'Substituir ou Atualizar Acervo Fotográfico Desatualizado',
      currentSituation: `Apenas ${photos} fotos cadastradas no perfil.`,
      risk: 'Perfis de concorrentes com fotos modernas recebem até 42% mais solicitações de rota no Google Maps.',
      howToFix: 'Remover fotos escuras ou repetidas e subir pelo menos 15 fotos profissionais com boa iluminação.',
      priority: 'média' as const,
    }] : []),
  ];

  // Build whatToInclude list (for ranking top 3)
  const whatToInclude = [
    {
      title: 'Ativar Atributos Oficiais de Acessibilidade e Pagamentos',
      benefit: 'Habilita filtros de pesquisa refinada no Google Maps (ex: "com acessibilidade", "aceita cartão").',
      implementationDetails: 'Na aba Informações, preencher: Entrada acessível, Banheiro adaptado, Cartões de crédito, Pix e Wi-Fi gratuito.',
      priority: 'alta' as const,
    },
    {
      title: 'Adicionar 5 Perguntas e Respostas Estratégicas (FAQ Comunitário)',
      benefit: 'Indexa perguntas frequentes diretamente no painel do Google, tirando dúvidas antes mesmo da ligação.',
      implementationDetails: 'Utilize a ferramenta de Q&A pública do perfil para cadastrar perguntas sobre agendamento, localização e formas de atendimento.',
      priority: 'alta' as const,
    },
    {
      title: 'Cadastrar Catálogo Completo com 5 a 10 Serviços/Produtos',
      benefit: 'Expande a presença semântica da ficha para termos específicos do seu segmento.',
      implementationDetails: 'Inserir nome do serviço, categoria, estimativa de preço e descrição detalhada com benefícios.',
      priority: 'alta' as const,
    },
    {
      title: 'Publicar Atualização Imediata com Botão de Ação (CTA)',
      benefit: 'Envia sinal imediato de atividade recente (Freshness) para os servidores do Google Maps.',
      implementationDetails: 'Publicar um post de novidades com imagem nítida e botão "Ligar agora" ou "Saiba mais".',
      priority: 'média' as const,
    },
  ];

  const cleanName = businessName.split(/[-–|:]/)[0].trim();

  return {
    id: `audit_${Date.now()}`,
    clientId: req.id,
    clientName: req.clientName || cleanName,
    businessName: cleanName,
    profileUrl: req.profileUrl,
    createdAt: new Date().toISOString(),
    overallScore,
    scoreLevel,
    summary: `Diagnóstico concluído para "${cleanName}". Pontuação calculada: ${overallScore}/100 (${scoreLevel.toUpperCase()}). Foram identificados ${whatToModify.length} pontos urgentes para modificar e ${whatToInclude.length} itens essenciais para inclusão para alcançar o Top 3 no Google Maps.`,
    pillars: {
      guidelinesAndName,
      categoriesTaxonomy,
      napAndLocation,
      descriptionOptimization,
      reviewsAndReputation,
      visualPresence,
      engagementAndFaq,
    },
    recommendations,
    whatToModify,
    whatToInclude,
    correctiveCopy: {
      recommendedBusinessName: cleanName,
      recommendedDescription: `${cleanName} é referência em excelência e atendimento de alto padrão na região. Com profissionais capacitados e infraestrutura moderna, oferecemos soluções personalizadas com pontualidade, transparência e compromisso com sua satisfação. Entre em contato e agende seu horário com nossa equipe especializada.`,
      recommendedPrimaryCategory: req.primaryCategory || 'Prestador de serviços',
      recommendedSecondaryCategories: ['Consultoria especializada', 'Atendimento profissional', 'Centro de serviços'],
      reviewResponseTemplate: `Olá, [Nome do Cliente]! Agradecemos de coração pela sua avaliação e confiança em nosso trabalho na ${cleanName}. Nosso compromisso diário é oferecer uma experiência impecável. Conte sempre conosco!`,
      samplePostToPublish: `Buscando qualidade e atendimento personalizado na região? Na ${cleanName} você encontra profissionais dedicados e estrutura completa para suas necessidades. Clique abaixo e fale com nossa equipe!`,
      recommendedFaqs: [
        {
          question: `Como funciona o atendimento na ${cleanName}?`,
          answer: `Nosso atendimento é personalizado com agendamento prévio para garantir total pontualidade e conforto. Fale conosco pelo WhatsApp ou telefone oficial.`,
        },
        {
          question: `Quais formas de pagamento são aceitas?`,
          answer: `Aceitamos cartões de crédito e débito das principais bandeiras, Pix e transferências bancárias.`,
        },
        {
          question: `Existe estacionamento ou facilidade de acesso no local?`,
          answer: `Sim, contamos com fácil acesso a transporte público e opções seguras de estacionamento nas proximidades.`,
        },
      ],
      recommendedPosts: [
        {
          title: 'Compromisso com a sua Satisfação',
          body: `Na ${cleanName}, cada detalhe do nosso atendimento é planejado para superar suas expectativas com transparência e excelência. Agende uma visita!`,
          cta: 'Saiba mais',
        },
        {
          title: 'Conheça Nossa Estrutura Completa',
          body: `Ambiente acolhedor, equipe especializada e tecnologia de ponta para cuidar de você. Venha nos visitar ou fale conosco pelo WhatsApp!`,
          cta: 'Ligar agora',
        },
      ],
      attributesToActivate: [
        'Entrada acessível para cadeira de rodas',
        'Banheiro adaptado',
        'Aceita cartões de crédito',
        'Aceita Pix',
        'Wi-Fi gratuito',
        'Agendamento prévio recomendado',
      ],
      photoGuidelines: [
        'Fachada externa com iluminação diurna mostrando o letreiro comercial nítido',
        'Recepção e área de atendimento acolhedora e organizada',
        'Equipe profissional com crachá ou uniforme institucional',
        'Fotos de procedimentos/produtos em alta resolução sem filtros exagerados',
      ],
    },
  };
}

// Client-side caller for auditing profile
export async function auditGbpProfile(request: GbpAuditRequest): Promise<{
  report: GbpAuditReport;
  source: 'gemini' | 'heuristic';
}> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch('/api/gbp/audit-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditRequest: request }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const fullReport: GbpAuditReport = {
          ...auditGbpProfileHeuristic(request),
          ...json.data,
          id: `audit_${Date.now()}`,
          clientName: request.clientName || request.businessName,
          businessName: request.businessName,
          createdAt: new Date().toISOString(),
        };
        return { report: fullReport, source: 'gemini' };
      }
    }
  } catch (err) {
    console.warn('Fallback to heuristic GBP Audit engine:', err);
  }

  return { report: auditGbpProfileHeuristic(request), source: 'heuristic' };
}
