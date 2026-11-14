import { GoogleGenAI } from '@google/genai';
import { ProjectExtractedData, ProjectType } from '../types/index.ts';
import { GbpQuestionnaireData, GbpDossier, GbpAuditRequest, GbpAuditReport } from '../types/gbpTypes.ts';
import { SalesPitchRequest, SalesPitchResult, ObjectionSolverRequest, ObjectionSolverResult } from '../types/salesTypes.ts';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function checkServerHealth() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return {
    status: 'ok',
    hasKey,
    activeModel: 'gemini-3.8-flash',
    engine: hasKey ? 'Gemini 3.8 Flash + Heurístico Resiliente' : 'Motor Heurístico Determinístico (Offline Ready)',
  };
}

export async function analyzeWithGemini(
  questionnaire: string,
  projectName: string,
  clientName?: string,
  projectType?: ProjectType,
  additionalNotes?: string
): Promise<Partial<ProjectExtractedData> | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é um analista de briefing sênior para agências de web design.
Analise com estrito rigor o questionário fornecido abaixo para o projeto "${projectName}".
Não invente fatos ou dados não mencionados.
Retorne um JSON válido com os seguintes campos:
- clientName (string)
- companyName (string)
- niche (string)
- services (array de strings)
- targetAudience (string)
- serviceRegion (string)
- hasPhysicalLocation (boolean: true se tiver clínica/escritório/loja física confirmado, false se for digital/remoto)
- address (string: endereço exato ou "Não informado")
- hasWhatsApp (boolean)
- whatsapp (string com número ou "Não informado")
- phone (string ou "Não informado")
- email (string ou "Não informado")
- socialLinks (array de strings)
- businessGoals (array de strings)
- differentials (array de strings)
- audiencePainPoints (array de strings)
- benefitsAndTransformation (array de strings)
- preferencesEsthetic (string)
- references (array de strings)
- mandatoryContent (array de strings, ex: CRM, CRO, OAB)
- heroHeadline (string: promessa principal ou título de impacto para o topo)
- heroSubheadline (string: explicação complementar do Hero)
- heroCtaText (string: texto ideal do botão principal de conversão)
- pricingAndPayment (string: política de valores, parcelamento, planos ou orçamento)
- processSteps (array de strings: etapas passo a passo de atendimento até a entrega)
- brandStory (string: história da empresa, tempo de atuação e formação)
- guaranteesAndPolicies (string: garantias, sigilo, políticas ou compromisso técnico)
- openingHours (string: dias e horários de atendimento e tempo médio de resposta)
- faqItems (array de objetos { question: string, answer: string } com dúvidas frequentes reais)
- availableMediaAssets (string: fotos, vídeos, logos ou materiais disponíveis)
- seoKeywords (array de strings: palavras-chave locais e termos de busca)
- missingFields (array de strings com o que faltou de essencial)
- contradictions (array de strings com possíveis contradições encontradas)

QUESTIONÁRIO:
${questionnaire}

OBSERVAÇÕES ADICIONAIS:
${additionalNotes || 'Nenhuma'}
`;

  const modelsToTry = ['gemini-3.8-flash'];

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`Tentativa com modelo ${modelName} falhou: ${err.message?.slice(0, 80)}. Tentando próximo...`);
    }
  }

  return null;
}

// GBP PRO: Parse raw text/file questionnaire into structured GBP questionnaire
export async function analyzeGbpQuestionnaireWithGemini(
  rawText: string
): Promise<Partial<GbpQuestionnaireData> | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é o maior especialista em Google Business Profile (Perfil da Empresa no Google) e SEO Local do Brasil.
Interprete o texto abaixo (que pode ser um questionário respondido, anotações de briefing ou documento de cliente).
Extraia fielmente as informações e preencha a estrutura JSON descrita abaixo.
NUNCA invente fatos, endereços, telefones, horários ou preços não mencionados. Se um campo não estiver no texto, use string vazia "" ou array vazio [].
Separe claramente fatos declarados.

Campos requeridos no JSON:
- businessName: Nome comercial oficial
- primaryNiche: Segmento e atividade principal
- fullAddress: Endereço completo com rua, número, complemento
- neighborhood: Bairro
- city: Cidade
- state: Estado (UF)
- postalCode: CEP
- serviceAreas: Lista de cidades ou bairros atendidos
- phone: Telefone fixo
- whatsapp: WhatsApp
- website: Site oficial
- operatingHours: Horário de funcionamento (dias, horas, intervalos)
- serviceFormat: "physical" (se tem loja/consultório aberto), "service_area" (atende no cliente/remoto sem endereço público), "hybrid" (ambos), ou "appointment_only" (apenas com agendamento)
- items: Array de objetos com { id, name, category, isPriority, priceEstimate, description } (priorize os principais serviços/produtos)
- priorityItemToPromote: Principal serviço a promover
- differentials: Array de diferenciais reais
- yearsInMarket: Tempo de atuação
- certificationsAndLicenses: Certificações, licenças, conselhos de classe (CRM, OAB, etc.)
- targetAudience: Perfil do cliente ideal
- userSuggestedKeywords: Array de palavras-chave sugeridas pelo cliente
- primaryObjective: "calls" | "whatsapp" | "appointments" | "store_visits" | "local_visibility" | "website_traffic"
- socialMediaLinks: Array de URLs de redes sociais
- knownCompetitors: Concorrentes citados
- availableMaterials: { hasLogo, hasFacadePhoto, hasTeamPhotos, hasEnvironmentPhotos, hasProductPhotos, hasWebsite }
- hasExistingProfile: boolean
- existingProfileUrl: string
- additionalNotes: Observações relevantes

TEXTO RECEBIDO:
${rawText}
`;

  const modelsToTry = ['gemini-3.8-flash'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`[GBP AI] Tentativa com modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }

  return null;
}

// GBP PRO: Generate full 13-stage dossier with Gemini focused on Google Maps ranking performance
export async function generateGbpDossierWithGemini(
  data: GbpQuestionnaireData
): Promise<Partial<GbpDossier> | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é o Maior Consultor Estratégico em Google Business Profile (Perfil da Empresa no Google), Local SEO e Otimização para o Google Local 3-Pack (Top 3 do Google Maps) do Brasil.
Sua missão é processar as respostas estratégicas do questionário do cliente (baseado na matriz oficial dos 33 nichos de mercado da plataforma) e gerar um Dossiê de Autoridade Máxima 100/100, estritamente focado em PERFORMANCE e DOMÍNIO DO TOPO NO GOOGLE MAPS.

DIRETRIZES TÉCNICAS E FATORES DETERMINANTES DE RANQUEAMENTO (ALGORITMO DO GOOGLE MAPS):
1. CONSISTÊNCIA NAP & ANTI-SUSPENSÃO (Fator de Confiança):
   - NUNCA adicione palavras-chave promocionais artificiais ao nome comercial oficial da empresa (ex: NUNCA crie "Dr. João - O Melhor Dentista de São Paulo"). Use o nome exato conforme fachada e CNPJ para garantir 0% de risco de suspensão manual ou algorítmica.
   - Padronize o formato de telefone com DDD e endereço para citações locais consistentes.
2. TAXONOMIA OFICIAL DE CATEGORIAS (Fator #1 de Relevância Local):
   - Identifique a Categoria Primária EXATA da taxonomia do Google Maps que melhor representa o core business do cliente entre os 33 nichos cadastrados. Ela responde por mais de 60% da relevância do perfil!
   - Sugira até 4 Categorias Secundárias oficiais que capturem buscas correlatas de alto volume sem gerar canibalização.
   - Liste categorias a evitar (que diluem a relevância ou atraem público errado).
3. GEOLOCALIZAÇÃO & BAIRROS DE MAIOR TICKET (Fator de Proximidade e Alcance):
   - Mapeie o raio de cobertura ideal e liste explicitamente os 5 a 8 bairros de maior poder aquisitivo ou demanda da cidade para cadastrar como Áreas de Cobertura (Service Areas).
   - Se for estabelecimento com atendimento local, oriente como manter o endereço público e seguro para receber rotas no Maps. Se for serviço a domicílio/sem letreiro, oriente o modelo SAB (Service Area Business) sem endereço público.
4. MATRIZ DE PALAVRAS-CHAVE DE ALTA INTENÇÃO COMERCIAL:
   - Extraia e defina a Palavra-Chave Principal e 6+ Palavras-Chave Secundárias com modificadores geográficos reais ("perto de mim", "na minha cidade", "no centro", "[bairro]").
5. DESCRIÇÃO OFICIAL DE 750 CARACTERES (Otimizada para Conversão e SEO):
   - MÁXIMO DE 750 CARACTERES.
   - OS PRIMEIROS 250 CARACTERES devem conter o gancho magnético com a palavra-chave primária, a autoridade do negócio (anos de mercado, diferenciais) e a localização exata, pois é o trecho visível antes do botão "...mais".
   - Restante da descrição detalhando serviços e chamada para ação (CTA).
   - PROIBIDO: links externos, números de telefone soltos, termos em caixa alta exagerada ("GRÁTIS", "MELHOR DO MUNDO") ou promoções temporárias.
6. CATÁLOGO DE SERVIÇOS E PRODUTOS DE MAIOR MARGEM:
   - Crie de 4 a 6 itens prioritários com títulos exatos de busca comercial, preços reais/estimados e descrições persuasivas ricas em palavras-chave que convencem o cliente a ligar ou agendar.
7. CHECKLIST DE FOTOS GEOLOCALIZADAS (Sinais Visuais de Proeminência):
   - 6 a 8 orientações de fotos técnicas (fachada com luz diurna, recepção, equipe uniformizada, procedimentos com autorização, equipamentos e certificados).
   - Sugira nomes de arquivos em padrão SEO para upload (ex: 'implante-dentario-campinas-fachada.jpg').
8. ESTRATÉGIA ÉTICA DE AVALIAÇÕES 5 ESTRELAS & RESPOSTAS COM SEO:
   - Forneça script de solicitação pós-atendimento com link curto e QR Code.
   - 5 Templates de resposta completos e profissionais (5 estrelas com palavra-chave, 4 estrelas construtivo, 3 estrelas neutro, 1-2 estrelas resolvendo a objeção com elegância, e protocolo para avaliação suspeita de concorrente).
   - IMPORTANTE: O Google rastreia os termos nas respostas dos proprietários para melhorar o ranking! Insira termos locais nas respostas.
9. CALENDÁRIO DE ATUALIZAÇÕES (SINAIS DE FRESCOR DE 30 DIAS):
   - 6 a 8 posts semanais com títulos chamativos, corpos persuasivos e botão de ação (CTA) oficial do Google ("Ligar agora", "Saiba mais", "Reservar").
10. FAQ LOCAL DE ALTA CONVERSÃO (BUSCA POR VOZ E DÚVIDAS CRUCIAIS):
    - 5 a 8 perguntas e respostas estratégicas que quebram objeções antes do cliente ligar.
11. CHECKLIST DE BLINDAGEM ANTI-SUSPENSÃO & VERIFICAÇÃO POR VÍDEO:
    - Orientações cirúrgicas para gravar o vídeo de verificação exigido pelo Google (mostrar placa da rua, destrancar a porta do estabelecimento, mostrar equipamentos de trabalho e documentos comerciais).
12. PLANO DE AÇÃO DE DOMÍNIO DO TOP 3 EM 90 DIAS:
    - Mês 1: Fundação, Verificação e Catálogo.
    - Mês 2: Ativação de Prova Social e Sinais de Frescor.
    - Mês 3: Consolidação do Top 3 e Monitoramento de Concorrentes.

DADOS RECEBIDOS DO CLIENTE:
${JSON.stringify(data, null, 2)}

Retorne OBRIGATORIAMENTE um JSON estruturado com os seguintes campos:
- categories: { primaryCategory, primaryJustification, secondaryCategories, categoriesToAvoid, relevanceNotes }
- addressStrategy: { serviceModel, storefrontVisible, serviceRadiusKm, coveredAreas, complianceNotes, verificationAdvice }
- attributes: { accessibility, paymentMethods, amenities, planning, highlights }
- seo: { primaryKeyword, secondaryKeywords, geoModifiers, napStandard: { name, address, phone }, searchIntents }
- description: { fullDescription, first250CharsHook, charCount, complianceChecks: { noLinks, noProhibitedPromotions, noKeywordStuffing, noAllCaps } }
- catalog: Array de itens { id, name, category, priceEstimate, isPriority, description }
- photoChecklist: Array de itens com { id, category, title, recommendedSpec, seoFileName, isCrucialForVerification, description }
- reviewStrategy: { reviewShortlinkTip, qrCodeUsageTip, responseTemplates, ethicalGuidelines }
- editorialCalendar: Array de posts { day, type, topic, headline, body, ctaButton, photoGuidance }
- faq: Array de itens { id, question, answer, strategicGoal }
- complianceChecks: Array de checks { item, status, details, howToFix }
- maintenancePlan90Days: { month1, month2, month3 }
`;

  const modelsToTry = ['gemini-3.8-flash'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`[GBP Dossier AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }

  return null;
}

// GBP PRO: Audit Profile (by URL or full data)
export async function auditGbpProfileWithGemini(
  request: GbpAuditRequest
): Promise<Partial<GbpAuditReport> | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é o maior Auditor e Especialista em Google Business Profile (Perfil da Empresa no Google) e SEO Local do Brasil.
O usuário forneceu o link de um perfil existente ou informações de uma empresa para auditoria direta.
SE O USUÁRIO FORNECEU APENAS O LINK (URL do Google Maps ou nome no link):
1. Extraia e identifique com precisão o Nome da Empresa, Nicho/Categoria e Localização a partir da URL fornecida (ex: extraia o nome contido no path /place/Nome+Empresa/@... ou nos parâmetros).
2. Execute o diagnóstico completo e rigoroso das diretrizes do Google Maps (Google Local Pack).
3. Calcule uma pontuação de 0 a 100 distribuída entre os 7 pilares oficiais:
   - guidelinesAndName (max 20 pts)
   - categoriesTaxonomy (max 15 pts)
   - napAndLocation (max 15 pts)
   - descriptionOptimization (max 10 pts)
   - reviewsAndReputation (max 15 pts)
   - visualPresence (max 15 pts)
   - engagementAndFaq (max 10 pts)
4. Separe OBRIGATORIAMENTE em duas listas de alto impacto para o usuário:
   A) "whatToModify": Lista do que DEVE SER MODIFICADO (Erros que violam diretrizes, risco de suspensão, keyword stuffing no nome, horários sem feriados, descrição com links proibidos, etc.).
      Cada item com: { title, currentSituation, risk, howToFix, priority: 'crítica'|'alta'|'média' }
   B) "whatToInclude": Lista do que DEVE SER INCLUSO para alcançar o TOP 3 do Google Maps (Novas categorias secundárias essenciais, atributos oficiais ocultos, 5 FAQs estratégicas, posts de recência, novas fotos de alta conversão).
      Cada item com: { title, benefit, implementationDetails, priority: 'alta'|'média' }
5. Forneça o "correctiveCopy" completo e pronto para copiar e colar:
   - recommendedBusinessName (nome limpo sem spam)
   - recommendedDescription (descrição persuasiva de até 750 caracteres com gancho nos primeiros 250)
   - recommendedPrimaryCategory (categoria exata da taxonomia do Google)
   - recommendedSecondaryCategories (até 4 secundárias estratégicas)
   - reviewResponseTemplate (modelo para responder clientes)
   - samplePostToPublish (post imediato com CTA para sinal de frescor)
   - recommendedFaqs (array de 4 a 5 objetos { question, answer } prontos para cadastrar na aba de perguntas)
   - recommendedPosts (array de 2 a 3 posts com { title, body, cta })
   - attributesToActivate (array de atributos oficiais recomendados para marcar como "Sim")
   - photoGuidelines (array de fotos obrigatórias com nomes SEO de arquivo)

DADOS / LINK FORNECIDO:
${JSON.stringify(request, null, 2)}
`;

  const modelsToTry = ['gemini-3.8-flash'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`[GBP Audit AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }

  return null;
}

export interface ScrapedSiteImage {
  id: string;
  url: string;
  alt: string;
  category: 'logo' | 'hero' | 'team' | 'services' | 'facility' | 'other';
  label: string;
  suggestedSection: string;
  isReal: boolean;
}

export interface ScrapedSiteData {
  finalUrl: string;
  title: string | null;
  siteName: string | null;
  description: string | null;
  h1: string | null;
  headings: string[];
  ogImage: string | null;
  logoUrl: string | null;
  images: ScrapedSiteImage[];
  businessName: string | null;
  ownerName: string | null;
  credential: string | null;
  whatsapp: string | null;
  phones: string[];
  emails: string[];
  address: string | null;
  cityState: string | null;
  cnpj: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  youtube: string | null;
  servicesDetected: string[];
  textSample: string;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, num) => {
      const code = Number(num);
      return Number.isFinite(code) ? String.fromCharCode(code) : '';
    });
}

function extractAttr(tag: string, attrName: string): string | null {
  const regex = new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(regex);
  const val = match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
  return val ? decodeHtmlEntities(val.trim()) : null;
}

function resolveAbsoluteUrl(raw: string | null | undefined, baseUrl: string): string | null {
  if (!raw) return null;
  const cleaned = decodeHtmlEntities(raw).trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned || cleaned.startsWith('data:') || cleaned.startsWith('javascript:') || cleaned.startsWith('#')) {
    return null;
  }
  try {
    const parsed = new URL(cleaned, baseUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function isTrackingOrJunkImage(url: string, alt: string, classes: string): boolean {
  const lower = `${url} ${alt} ${classes}`.toLowerCase();
  if (
    lower.includes('facebook.com/tr') ||
    lower.includes('google-analytics') ||
    lower.includes('googletagmanager') ||
    lower.includes('doubleclick') ||
    lower.includes('/pixel') ||
    lower.includes('1x1') ||
    lower.includes('spacer') ||
    lower.includes('blank.gif') ||
    lower.includes('gravatar.com') ||
    lower.includes('s.w.org/images/core/emoji') ||
    lower.includes('twemoji')
  ) {
    return true;
  }
  // Ignore non-logo tiny icons/sprites unless marked as logo/brand/apple-touch-icon
  if (url.toLowerCase().endsWith('.ico')) return true;
  return false;
}

function classifyScrapedImage(
  url: string,
  alt: string,
  contextHint: string,
  isLogoCandidate: boolean,
  isHeroCandidate: boolean
): { category: ScrapedSiteImage['category']; label: string; suggestedSection: string } {
  const signal = `${url} ${alt} ${contextHint}`.toLowerCase();
  if (
    isLogoCandidate ||
    /\b(logo|logotipo|logomarca|marca|brand)\b/.test(signal)
  ) {
    return {
      category: 'logo',
      label: alt && alt.length > 2 ? `Logotipo Oficial — ${alt.slice(0, 60)}` : 'Logotipo Oficial do Cliente',
      suggestedSection: 'Header, Navbar & Rodapé',
    };
  }
  if (
    /\b(dr|dra|doutor|doutora|equipe|team|sobre|about|fundador|founder|soci[oa]|diretor|ceo|advogad|medic|dentist|perfil|profile|autor)\b/.test(signal)
  ) {
    return {
      category: 'team',
      label: alt && alt.length > 2 ? alt.slice(0, 70) : 'Foto Real do Responsável / Equipe',
      suggestedSection: 'Seção Sobre / Autoridade & Especialista',
    };
  }
  if (
    isHeroCandidate ||
    /\b(hero|banner|capa|slide|slider|destaque|cover|showcase)\b/.test(signal)
  ) {
    return {
      category: 'hero',
      label: alt && alt.length > 2 ? alt.slice(0, 70) : 'Imagem Hero / Destaque Principal do Cliente',
      suggestedSection: 'Primeira Dobra (Hero Section)',
    };
  }
  if (
    /\b(clinica|clínica|escritorio|escritório|consultorio|consultório|espaco|espaço|sala|estrutura|ambiente|recepcao|recepção|fachada|loja|office|studio)\b/.test(signal)
  ) {
    return {
      category: 'facility',
      label: alt && alt.length > 2 ? alt.slice(0, 70) : 'Foto Real das Instalações / Espaço',
      suggestedSection: 'Infraestrutura / Sobre o Espaço',
    };
  }
  if (
    /\b(serv|tratamento|procedimento|produto|solucao|solução|implant|estetica|estética|portfolio|portfólio|projeto|caso|case)\b/.test(signal)
  ) {
    return {
      category: 'services',
      label: alt && alt.length > 2 ? alt.slice(0, 70) : 'Imagem Real de Serviço / Solução',
      suggestedSection: 'Vitrine de Serviços / Soluções',
    };
  }
  return {
    category: 'other',
    label: alt && alt.length > 2 ? alt.slice(0, 70) : 'Imagem Real Extraída do Site do Cliente',
    suggestedSection: 'Conteúdo / Galeria do Site',
  };
}

function formatBrWhatsappOrPhone(rawDigits: string): string {
  const digits = rawDigits.replace(/\D/g, '');
  const local = digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return rawDigits;
}

// Helper to scrape webpage metadata, real images and client contacts safely
export async function scrapeSiteHtmlPreview(targetUrl: string): Promise<ScrapedSiteData | null> {
  try {
    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(fullUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;

    const finalUrl = resp.url || fullUrl;
    const html = await resp.text();
    if (!html || html.length < 50) return null;

    // 1. Title, Meta Tags, OpenGraph
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, ' ').trim()) : null;

    let siteName: string | null = null;
    let description: string | null = null;
    let ogImage: string | null = null;
    let ogTitle: string | null = null;

    const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)];
    for (const m of metaTags) {
      const tag = m[0];
      const name = (extractAttr(tag, 'name') || '').toLowerCase();
      const prop = (extractAttr(tag, 'property') || '').toLowerCase();
      const content = extractAttr(tag, 'content');
      if (!content) continue;
      if (name === 'description' && !description) description = content;
      if (prop === 'og:description' && !description) description = content;
      if (prop === 'og:site_name' && !siteName) siteName = content;
      if (prop === 'og:title' && !ogTitle) ogTitle = content;
      if ((prop === 'og:image' || prop === 'og:image:secure_url' || name === 'twitter:image') && !ogImage) {
        ogImage = resolveAbsoluteUrl(content, finalUrl);
      }
    }

    // 2. JSON-LD Structured Data extraction
    let ldBusinessName: string | null = null;
    let ldOwnerName: string | null = null;
    let ldRole: string | null = null;
    let ldLogo: string | null = null;
    const ldImages: string[] = [];
    const ldPhones: string[] = [];
    const ldEmails: string[] = [];
    const ldSocials: string[] = [];
    let ldAddress: string | null = null;
    let ldCityState: string | null = null;

    const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const inspectLdNode = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(inspectLdNode);
        return;
      }
      if (Array.isArray(node['@graph'])) {
        inspectLdNode(node['@graph']);
      }
      const nodeType = Array.isArray(node['@type']) ? node['@type'].join(' ') : String(node['@type'] || '');
      const isOrg = /Organization|LocalBusiness|Medical|Dentist|Legal|Attorney|Store|Professional|Corporation|Health/i.test(nodeType);
      const isPerson = /Person/i.test(nodeType);

      if (isOrg && typeof node.name === 'string' && !ldBusinessName) {
        ldBusinessName = node.name.trim();
      }
      if (isPerson && typeof node.name === 'string' && !ldOwnerName) {
        ldOwnerName = node.name.trim();
        if (typeof node.jobTitle === 'string' && !ldRole) ldRole = node.jobTitle.trim();
      }
      if (node.founder) {
        const f = Array.isArray(node.founder) ? node.founder[0] : node.founder;
        if (typeof f === 'string' && !ldOwnerName) ldOwnerName = f.trim();
        else if (f && typeof f.name === 'string' && !ldOwnerName) {
          ldOwnerName = f.name.trim();
          if (typeof f.jobTitle === 'string' && !ldRole) ldRole = f.jobTitle.trim();
        }
      }
      if (typeof node.telephone === 'string') ldPhones.push(node.telephone.trim());
      if (typeof node.email === 'string') ldEmails.push(node.email.trim());

      const extractMediaUrl = (val: any): string | null => {
        if (!val) return null;
        if (typeof val === 'string') return resolveAbsoluteUrl(val, finalUrl);
        if (typeof val === 'object' && typeof val.url === 'string') return resolveAbsoluteUrl(val.url, finalUrl);
        if (typeof val === 'object' && typeof val.contentUrl === 'string') return resolveAbsoluteUrl(val.contentUrl, finalUrl);
        return null;
      };

      const maybeLogo = extractMediaUrl(node.logo);
      if (maybeLogo && !ldLogo) ldLogo = maybeLogo;

      if (Array.isArray(node.image)) {
        node.image.forEach((item: any) => {
          const u = extractMediaUrl(item);
          if (u) ldImages.push(u);
        });
      } else {
        const u = extractMediaUrl(node.image);
        if (u) ldImages.push(u);
      }

      if (node.address && typeof node.address === 'object' && !ldAddress) {
        const addr = node.address;
        const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode]
          .filter((x) => typeof x === 'string' && x.trim().length > 0)
          .map((x) => x.trim());
        if (parts.length > 0) ldAddress = parts.join(', ');
        if (addr.addressLocality) {
          ldCityState = addr.addressRegion
            ? `${addr.addressLocality.trim()} / ${addr.addressRegion.trim()}`
            : addr.addressLocality.trim();
        }
      }

      if (Array.isArray(node.sameAs)) {
        node.sameAs.forEach((s: any) => {
          if (typeof s === 'string') ldSocials.push(s);
        });
      }
    };

    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        inspectLdNode(parsed);
      } catch {
        // Ignore malformed JSON-LD blocks
      }
    }

    // 3. Icon / Apple-touch-icon as logo fallback
    let iconLogoUrl: string | null = null;
    const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)];
    for (const m of linkTags) {
      const tag = m[0];
      const rel = (extractAttr(tag, 'rel') || '').toLowerCase();
      const href = extractAttr(tag, 'href');
      if (!href) continue;
      if (rel.includes('apple-touch-icon')) {
        iconLogoUrl = resolveAbsoluteUrl(href, finalUrl);
        break;
      }
      if (rel.includes('icon') && !href.toLowerCase().endsWith('.ico') && !iconLogoUrl) {
        iconLogoUrl = resolveAbsoluteUrl(href, finalUrl);
      }
    }

    // 4. Real Image Extraction (<img ...>, <picture><source ...>, CSS background-image, og:image, JSON-LD)
    const imageMap = new Map<string, ScrapedSiteImage>();
    const pushImage = (
      rawUrl: string | null | undefined,
      alt: string,
      contextHint: string,
      isLogoCandidate = false,
      isHeroCandidate = false
    ) => {
      const absUrl = resolveAbsoluteUrl(rawUrl, finalUrl);
      if (!absUrl) return;
      if (isTrackingOrJunkImage(absUrl, alt, contextHint)) return;
      // Normalize dedup key without tracking query noise where obvious, but keep exact absUrl
      const dedupKey = absUrl.split('#')[0];
      if (imageMap.has(dedupKey)) return;

      const classified = classifyScrapedImage(absUrl, alt, contextHint, isLogoCandidate, isHeroCandidate);
      imageMap.set(dedupKey, {
        id: `real_img_${imageMap.size + 1}`,
        url: absUrl,
        alt: alt || classified.label,
        category: classified.category,
        label: classified.label,
        suggestedSection: classified.suggestedSection,
        isReal: true,
      });
    };

    if (ldLogo) {
      pushImage(ldLogo, `${ldBusinessName || siteName || 'Marca'} Logotipo`, 'logo', true, false);
    }

    // Parse all <img> tags regardless of attribute order
    const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];
    let firstLargeNonLogoAssigned = false;
    for (const m of imgTags) {
      const tag = m[0];
      const alt = extractAttr(tag, 'alt') || extractAttr(tag, 'title') || '';
      const cls = `${extractAttr(tag, 'class') || ''} ${extractAttr(tag, 'id') || ''}`;
      let src =
        extractAttr(tag, 'data-src') ||
        extractAttr(tag, 'data-lazy-src') ||
        extractAttr(tag, 'data-original') ||
        extractAttr(tag, 'src');

      // Prefer srcset image if src is missing or looks like a lazy placeholder
      const srcset = extractAttr(tag, 'data-srcset') || extractAttr(tag, 'srcset');
      if ((!src || src.startsWith('data:')) && srcset) {
        const firstSrcSet = srcset.split(',')[0]?.trim().split(/\s+/)[0];
        if (firstSrcSet) src = firstSrcSet;
      }

      if (!src) continue;
      const abs = resolveAbsoluteUrl(src, finalUrl);
      if (!abs) continue;
      if (isTrackingOrJunkImage(abs, alt, cls)) continue;

      const looksLikeLogo = /\b(logo|logotipo|marca|brand)\b/i.test(`${abs} ${alt} ${cls}`);
      const isHero = !looksLikeLogo && !firstLargeNonLogoAssigned && !/icon|avatar|flag|badge|selo/i.test(`${abs} ${cls}`);
      if (isHero) firstLargeNonLogoAssigned = true;

      pushImage(abs, alt, cls, looksLikeLogo, isHero);
    }

    // Parse <source srcset="..."> inside <picture>
    const sourceTags = [...html.matchAll(/<source\b[^>]*>/gi)];
    for (const m of sourceTags) {
      const tag = m[0];
      const srcset = extractAttr(tag, 'srcset') || extractAttr(tag, 'data-srcset');
      if (!srcset) continue;
      const firstUrl = srcset.split(',')[0]?.trim().split(/\s+/)[0];
      if (firstUrl) pushImage(firstUrl, '', extractAttr(tag, 'media') || '', false, false);
    }

    // Parse CSS inline background-image: url(...)
    const bgMatches = [...html.matchAll(/background(?:-image)?\s*:[^;]*url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)];
    for (const m of bgMatches) {
      const bgUrl = m[2];
      if (bgUrl) {
        const looksHero = /hero|banner|bg|capa|slide/i.test(bgUrl);
        pushImage(bgUrl, '', looksHero ? 'hero banner' : 'background', false, looksHero);
      }
    }

    // Include JSON-LD images and og:image
    for (const u of ldImages) {
      pushImage(u, ldBusinessName || '', 'schema json-ld', false, !firstLargeNonLogoAssigned);
    }
    if (ogImage) {
      pushImage(ogImage, ogTitle || title || 'Imagem Destaque (OpenGraph)', 'og:image hero', false, true);
    }
    // Include apple-touch-icon only if no logo was detected yet
    const hasDetectedLogo = Array.from(imageMap.values()).some((img) => img.category === 'logo');
    if (!hasDetectedLogo && iconLogoUrl) {
      pushImage(iconLogoUrl, `Ícone / Logotipo ${ldBusinessName || siteName || ''}`.trim(), 'logo icon', true, false);
    }

    // Sort images so logo & hero & team appear first, limit to 18 real assets
    const categoryOrder: Record<ScrapedSiteImage['category'], number> = {
      logo: 0,
      hero: 1,
      team: 2,
      services: 3,
      facility: 4,
      other: 5,
    };
    const images = Array.from(imageMap.values())
      .sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category])
      .slice(0, 18);

    const detectedLogoUrl = images.find((i) => i.category === 'logo')?.url || ldLogo || iconLogoUrl || null;

    // 5. Headings & Services extraction
    const stripTags = (s: string) =>
      decodeHtmlEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? stripTags(h1Match[1]) : null;

    const headingMatches = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
    const headings = Array.from(
      new Set(
        headingMatches
          .map((m) => stripTags(m[1]))
          .filter((t) => t.length >= 4 && t.length <= 140)
      )
    ).slice(0, 15);

    const servicesDetected = headings
      .filter((h) => h !== h1 && h.split(' ').length <= 10)
      .slice(0, 8);

    // 6. Clean body text
    const textSample = decodeHtmlEntities(
      html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
        .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    ).slice(0, 3500);

    // 7. Contacts, Credentials, Address, Social Links
    const waLinks = [
      ...html.matchAll(/(?:wa\.me\/|api\.whatsapp\.com\/send\?[^"']*?phone=|whatsapp\.com\/send\?[^"']*?phone=)(\d{10,15})/gi),
    ];
    const whatsapp = waLinks[0]?.[1] ? formatBrWhatsappOrPhone(waLinks[0][1]) : null;

    const telLinks = [...html.matchAll(/href=["']tel:([^"']+)["']/gi)].map((m) =>
      formatBrWhatsappOrPhone(m[1])
    );
    const bodyPhoneMatches =
      textSample.match(/(?:\+?55\s*)?\(?\d{2}\)?\s*(?:9\d{4}|\d{4})[-\s]?\d{4}/g) || [];
    const phones = Array.from(
      new Set([...ldPhones, ...telLinks, ...bodyPhoneMatches].map((p) => p.trim()).filter(Boolean))
    ).slice(0, 4);

    const mailtoMatches = [...html.matchAll(/href=["']mailto:([^"'?]+)/gi)].map((m) => m[1].trim());
    const rawEmailMatches = textSample.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const emails = Array.from(
      new Set(
        [...ldEmails, ...mailtoMatches, ...rawEmailMatches].filter(
          (e) =>
            e &&
            !/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(e) &&
            !/@(?:example|sentry|wixpress|domain)\./i.test(e)
        )
      )
    ).slice(0, 3);

    const cnpjMatches = textSample.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g);
    const cnpj = cnpjMatches?.[0] || null;

    const credentialMatch = textSample.match(
      /\b(?:OAB|CRM|CRO|CREA|CRECI|CAU|CRP|CRN|CRBM|CREFITO|COREN)[\/\s\-]*[A-Z]{2}\s*[-:]?\s*[\d.\-]+\b/i
    );
    const credential = credentialMatch ? credentialMatch[0].replace(/\s+/g, ' ').trim() : ldRole;

    const allLinksText = `${html} ${ldSocials.join(' ')}`;
    const instaMatch = allLinksText.match(/instagram\.com\/([a-zA-Z0-9._]{2,40})/i);
    const instagram =
      instaMatch?.[1] && !['p', 'reel', 'reels', 'stories', 'explore'].includes(instaMatch[1].toLowerCase())
        ? `@${instaMatch[1].replace(/\/$/, '')}`
        : null;

    const fbMatch = allLinksText.match(/facebook\.com\/(?!sharer|share\.php|plugins|tr\b)([a-zA-Z0-9._\-]{2,60})/i);
    const facebook = fbMatch?.[1] ? `https://facebook.com/${fbMatch[1]}` : null;

    const liMatch = allLinksText.match(/linkedin\.com\/(?:company|in)\/([a-zA-Z0-9._\-]{2,60})/i);
    const linkedin = liMatch?.[0] ? `https://www.${liMatch[0]}` : null;

    const ytMatch = allLinksText.match(/youtube\.com\/(?:@|c\/|channel\/)([a-zA-Z0-9._\-]{2,60})/i);
    const youtube = ytMatch?.[0] ? `https://www.${ytMatch[0]}` : null;

    let address: string | null = ldAddress;
    if (!address) {
      const addrTagMatch = html.match(/<address[^>]*>([\s\S]*?)<\/address>/i);
      if (addrTagMatch) {
        const cleanedAddr = stripTags(addrTagMatch[1]);
        if (cleanedAddr.length >= 8 && cleanedAddr.length <= 220) address = cleanedAddr;
      }
    }
    if (!address) {
      const brStreetMatch = textSample.match(
        /(?:Rua|Av\.?|Avenida|Alameda|Travessa|Praça|Rodovia|Estrada)\s+[^•|\n]{6,95}?(?:CEP\s*:?\s*\d{5}-?\d{3}|\b[A-Z]{2}\b)/i
      );
      if (brStreetMatch) address = brStreetMatch[0].trim();
    }

    let cityState: string | null = ldCityState;
    if (!cityState && address) {
      const cityMatch = address.match(/([A-Za-zÀ-ÿ\s]{3,35})\s*[-\/]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/);
      if (cityMatch) cityState = `${cityMatch[1].trim()} / ${cityMatch[2]}`;
    }

    // Guess cleanest businessName from JSON-LD, og:site_name or <title>
    let businessName = ldBusinessName || siteName || null;
    if (!businessName && title) {
      const splitTitle = title.split(/\s*[|—–\-:]\s*/).map((s) => s.trim()).filter(Boolean);
      if (splitTitle.length > 0) {
        // Shortest brand-like segment or first segment
        businessName = splitTitle[splitTitle.length - 1].length <= 36 && splitTitle.length > 1
          ? splitTitle[splitTitle.length - 1]
          : splitTitle[0];
      }
    }

    return {
      finalUrl,
      title,
      siteName,
      description,
      h1,
      headings,
      ogImage,
      logoUrl: detectedLogoUrl,
      images,
      businessName,
      ownerName: ldOwnerName,
      credential,
      whatsapp,
      phones,
      emails,
      address,
      cityState,
      cnpj,
      instagram,
      facebook,
      linkedin,
      youtube,
      servicesDetected,
      textSample,
    };
  } catch {
    return null;
  }
}

// SITE AUDITOR: Audit Website Link based on MASTER SITE ENGINE 10.0
export async function auditSiteWithGemini(
  request: { url: string; niche?: string; targetObjective?: string },
  preScrapedData?: ScrapedSiteData | null
): Promise<any | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Use pre-scraped data when available so /api/audit-site scrapes only once
  const liveScrape = preScrapedData !== undefined ? preScrapedData : await scrapeSiteHtmlPreview(request.url);

  const prompt = `Você é o Auditor Independente e Engenheiro Chefe de Reengenharia Digital do MASTER SITE ENGINE 10.0 (QUALITY CONTROL, PERFORMANCE AUDIT & REENGINEERING SYSTEM).
Sua base normativa OBRIGATÓRIA E SUPREMA é o MASTER SITE ENGINE 10.0.

REGRA ABSOLUTA E INEGOCIÁVEL DE PRESERVAÇÃO DO CLIENTE:
Sempre que sugerir melhorias ou gerar o Mega Prompt de Recriação para este site auditado:
1. MANTENHA 100% DAS IMAGENS REAIS DO CLIENTE extraídas do link (mesmas URLs exatas de logotipo, hero, fotos da equipe/profissional, fotos do espaço e serviços). É PROIBIDO substituir fotos reais extraídas por imagens genéricas de bancos de imagem (Unsplash/Pexels) ou inventar URLs fictícias.
2. MANTENHA 100% DAS INFORMAÇÕES REAIS DO CLIENTE encontradas no site (nome da marca/empresa, responsável técnico, OAB/CRM/CRO/CREA, WhatsApp, telefone, e-mail, endereço completo, cidade/UF, CNPJ, Instagram/redes sociais, serviços reais e biografia/história). Se algum dado não foi detectado no HTML, indique claramente "Não identificado no HTML — confirmar com cliente" ao invés de inventar dados fictícios.
3. TODAS AS MELHORIAS SUGERIDAS ("recommendedImprovements") devem otimizar estrutura, headline, CTA, conversão, SEO e velocidade (como converter as fotos atuais para WebP/AVIF mantendo EXATAMENTE as mesmas imagens do cliente e aplicando os contatos e textos reais do cliente).
4. O "reengineeringMegaPrompt" DEVE conter uma seção explícita listando todas as URLs exatas de imagens do cliente e todos os dados cadastrais reais a preservar integralmente.

URL para auditoria: "${request.url}"
${liveScrape?.finalUrl ? `URL final após redirecionamentos: "${liveScrape.finalUrl}"` : ''}
Nicho / Segmento: "${request.niche || 'Auto-detectar pelo link e conteúdo'}"
Objetivo: "${request.targetObjective || 'Conversão de Leads e Agendamentos'}"

${liveScrape ? `DADOS E ATIVOS REAIS RASTREADOS DIRETAMENTE DO SITE (PRESERVAR INTEGRALMENTE):
- Nome da Marca / Empresa Detectado: ${liveScrape.businessName || 'N/A'}
- Título da Página (<title>): ${liveScrape.title || 'N/A'}
- H1 Principal: ${liveScrape.h1 || 'N/A'}
- Principais Títulos / Seções Detectadas: ${JSON.stringify(liveScrape.headings)}
- Serviços / Produtos Identificados: ${JSON.stringify(liveScrape.servicesDetected)}
- Meta Descrição: ${liveScrape.description || 'N/A'}
- Responsável / Fundador Detectado: ${liveScrape.ownerName || 'N/A'}
- Registro / Credencial: ${liveScrape.credential || 'N/A'}
- WhatsApp Oficial: ${liveScrape.whatsapp || 'N/A'}
- Telefones: ${liveScrape.phones.join(', ') || 'N/A'}
- E-mails: ${liveScrape.emails.join(', ') || 'N/A'}
- Endereço: ${liveScrape.address || 'N/A'}
- Cidade / UF: ${liveScrape.cityState || 'N/A'}
- CNPJ: ${liveScrape.cnpj || 'N/A'}
- Redes Sociais: Instagram=${liveScrape.instagram || 'N/A'}, Facebook=${liveScrape.facebook || 'N/A'}, LinkedIn=${liveScrape.linkedin || 'N/A'}
- Logotipo Detectado: ${liveScrape.logoUrl || 'N/A'}
- Imagem OpenGraph: ${liveScrape.ogImage || 'N/A'}
- IMAGENS REAIS DO CLIENTE ENCONTRADAS NO HTML (${liveScrape.images.length} — PRESERVAR URLs EXATAS):
${JSON.stringify(liveScrape.images.slice(0, 15), null, 2)}
- Conteúdo Textual Real da Página:
${liveScrape.textSample.slice(0, 2200)}
` : 'Obs: Não foi possível baixar o HTML ao vivo do servidor alvo (bloqueio/timeout). Assinale claramente quais campos dependem de confirmação com o cliente e não invente URLs de fotos como se fossem reais.'}

EXECUTE A AUDITORIA E RETORNE UM JSON VÁLIDO contendo:
1. "domain": nome do domínio limpo (ex: "clinicaodonto.com.br")
2. "primaryNicheDetected": nicho identificado com base no conteúdo real
3. "overallScore": número de 0 a 100 calculado pela soma ponderada oficial dos 8 pilares:
   - Design e identidade visual (20%)
   - SEO e posicionamento orgânico (20%)
   - Performance e velocidade (15%)
   - Conversão e estratégia comercial (15%)
   - UX, navegação e responsividade (10%)
   - Acessibilidade (8%)
   - Segurança e conformidade legal (7%)
   - Qualidade técnica e código (5%)
4. "scoreLabel": classificação oficial (95-100: "Excelência Internacional", 90-94: "Excelente", 80-89: "Muito Bom", 70-79: "Regular", 50-69: "Insatisfatório", 0-49: "Crítico")
5. "approvalStatus": "APROVADO" (>=90 e sem bloqueio), "APROVADO COM MELHORIAS" (80-89), "EXIGE CORREÇÕES" (70-79), ou "REPROVADO" (<70 ou com bloqueio P0)
6. "executiveSummary": resumo executivo rigoroso de 3-4 frases em tom de auditor independente mencionando os pontos reais encontrados
7. "ownerInfo": objeto preservando fielmente os dados reais extraídos { businessName, ownerOrLeaderName, roleOrCredential, whatsapp, phone, email, fullAddress, cityState, cnpj, instagram, facebook, linkedin, youtube, bioOrAboutSummary }
8. "extractedImages": array preservando EXATAMENTE as imagens reais rastreadas acima (cada objeto com { id, url, alt, category, label, suggestedSection, isReal: true }). NÃO substitua por URLs de Unsplash/Pexels!
9. "criticalBlockers": array com bloqueadores críticos reais encontrados { id, title, evidence, impact, correction, priority: 'P0'|'P1' }
10. "categories10": objeto com as 8 categorias oficiais do Master Site Engine 10.0 contendo { name, score, weight, status, description, masterPromptRule, currentFlaws, recommendations } para:
    - design (peso 20)
    - seo (peso 20)
    - performance (peso 15)
    - conversion (peso 15)
    - uxResponsiveness (peso 10)
    - accessibility (peso 8)
    - securityCompliance (peso 7)
    - technicalQuality (peso 5)
DIRETRIZ SUPREMA DE VELOCIDADE (OBRIGATÓRIO NOTA > 9.5 NO GOOGLE PAGESPEED INSIGHTS):
Todo site e landing page DEVE atingir nota >= 9.5 (95+) no Google PageSpeed Insights (Mobile e Desktop), com LCP < 1.8s, CLS < 0.05, INP < 100ms, FCP < 1.0s, convertendo as imagens REAIS do cliente para WebP/AVIF (<150KB fundos, <80KB destaque) SEM substituí-las.

11. "recommendedImprovements": array de 6 objetos { id, title, category, impact, masterPromptReference, currentIssue, improvedProposal, copyableContent } onde CADA melhoria usa os dados reais do cliente (nome, cidade, WhatsApp, serviços reais) e referencia a preservação das fotos reais extraídas.
12. "reengineeringMegaPrompt": string com o MEGA PROMPT DEFINITIVO DE RECRIAÇÃO & REENGENHARIA 10.0 autossuficiente e completo, contendo seção explícita com TODAS as URLs exatas das imagens do cliente e TODOS os dados reais do cliente para preservação obrigatória, mais meta 9.5+ PageSpeed.
`;

  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.8-flash'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        // Server-side safeguard: never lose real scraped images or real scraped contacts
        if (liveScrape) {
          if (liveScrape.images.length > 0) {
            const scrapedByUrl = new Map(liveScrape.images.map((img) => [img.url, img]));
            const geminiImgs: any[] = Array.isArray(parsed.extractedImages) ? parsed.extractedImages : [];
            const sanitizedGemini = geminiImgs.filter(
              (g) => typeof g?.url === 'string' && scrapedByUrl.has(g.url)
            );
            const seenUrls = new Set(sanitizedGemini.map((g) => g.url));
            const mergedImages = [
              ...sanitizedGemini.map((g) => ({ ...g, isReal: true })),
              ...liveScrape.images.filter((s) => !seenUrls.has(s.url)),
            ];
            parsed.extractedImages = mergedImages;
          }
          parsed.ownerInfo = {
            ...(parsed.ownerInfo || {}),
            businessName: parsed.ownerInfo?.businessName || liveScrape.businessName || '',
            ownerOrLeaderName: parsed.ownerInfo?.ownerOrLeaderName || liveScrape.ownerName || 'Não identificado no HTML — confirmar com cliente',
            roleOrCredential: parsed.ownerInfo?.roleOrCredential || liveScrape.credential || 'Confirmar com cliente',
            whatsapp: liveScrape.whatsapp || parsed.ownerInfo?.whatsapp || 'Não identificado no HTML — confirmar com cliente',
            phone: liveScrape.phones[0] || parsed.ownerInfo?.phone || 'Não identificado no HTML — confirmar com cliente',
            email: liveScrape.emails[0] || parsed.ownerInfo?.email || 'Não identificado no HTML — confirmar com cliente',
            fullAddress: liveScrape.address || parsed.ownerInfo?.fullAddress || 'Não identificado no HTML — confirmar com cliente',
            cityState: liveScrape.cityState || parsed.ownerInfo?.cityState || 'Confirmar cidade/UF',
            cnpj: liveScrape.cnpj || parsed.ownerInfo?.cnpj || undefined,
            instagram: liveScrape.instagram || parsed.ownerInfo?.instagram || undefined,
            facebook: liveScrape.facebook || parsed.ownerInfo?.facebook || undefined,
            linkedin: liveScrape.linkedin || parsed.ownerInfo?.linkedin || undefined,
            youtube: liveScrape.youtube || parsed.ownerInfo?.youtube || undefined,
          };
          parsed.liveScrapedUsed = true;
          parsed.preservedClientAssetCount = liveScrape.images.length;
          parsed.siteTitle = liveScrape.title || undefined;
          parsed.metaDescription = liveScrape.description || undefined;
          parsed.h1Text = liveScrape.h1 || undefined;
          parsed.extractedHeadings = liveScrape.headings;
          parsed.extractedServices = liveScrape.servicesDetected;
        }
        return parsed;
      }
    } catch (err: any) {
      console.warn(`[Site Audit AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }

  return null;
}

export async function generatePitchWithGemini(
  request: SalesPitchRequest
): Promise<SalesPitchResult | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é o maior especialista em copywriting e fechamento de vendas de sites, landing pages e SEO Local (Google Meu Negócio) do Brasil.
O usuário é um desenvolvedor/agência de sites de elite que utiliza a plataforma Master Site Prompt Studio.
Seus produtos são únicos e diferenciados:
1. SEO NOTA 100: Criados com arquitetura técnica semântica para ranquear no topo da 1ª página do Google organicamente (Schema.org, Lighthouse 98-100, Core Web Vitals <1.2s), para o cliente não ficar refém de pagar anúncios o tempo todo.
2. DESIGN QUE ENCANTA: Projetos desenhados para deixar os clientes fascinados e encantados à primeira vista (Master Site Engine 9.0), transmitindo autoridade imediata e distanciando totalmente de amadores.
3. A DOBRADINHA IMBATÍVEL (Google Meu Negócio + Site Completo): O Google Meu Negócio atrai a demanda de busca local no Google Maps ("perto de mim"). O site encanta com autoridade e fecha o contrato com botão de WhatsApp. Ter só o GMN perde 65% das vendas porque o cliente busca o site para checar credibilidade antes de ligar. Ter só o site sem GMN perde toda a busca geolocalizada da cidade. Juntos, dominam tudo!
4. CONVERSÃO DIRETA PARA WHATSAPP: Botões e CTAs posicionados estrategicamente para transformar visitantes em dinheiro no caixa.

Dados do Prospecto:
- Nome do Cliente: ${request.clientName}
- Empresa: ${request.companyName}
- Nicho: ${request.niche}
- Solução Alvo: ${request.targetSolution}
- Cidade/Região: ${request.cityOrRegion || 'Não informada'}
- Situação Atual: ${request.currentStatus || 'Geral'}
- Tom de Voz: ${request.tone || 'Consultivo e Persuasivo'}
- Detalhes Extras: ${request.extraDetails || 'Nenhum'}

Gere um JSON com o esquema exato:
{
  "clientName": "${request.clientName}",
  "companyName": "${request.companyName}",
  "niche": "${request.niche}",
  "targetSolution": "${request.targetSolution}",
  "generatedAt": "${new Date().toISOString()}",
  "headline": "Chamada principal impactante",
  "summaryExecutive": "Resumo de 2 a 3 frases da estratégia de abordagem",
  "pitchWhatsApp": "Script completo, persuasivo e irresistível para enviar no WhatsApp, com emojis adequados e pergunta de fechamento",
  "pitchAudioScript": "Roteiro falado natural para áudio de 45 a 60 segundos no WhatsApp",
  "pitchEmailOrProposal": "Proposta executiva por e-mail com estrutura de alto padrão",
  "differentiators": [
    {
      "id": "seo_100",
      "title": "SEO Nota 100 no Google",
      "headline": "...",
      "explanation": "...",
      "whyItMatters": "..."
    },
    {
      "id": "design_encanta",
      "title": "Design que Encanta e Gera Desejo",
      "headline": "...",
      "explanation": "...",
      "whyItMatters": "..."
    },
    {
      "id": "dupla_infalivel",
      "title": "A Dobradinha Imbatível: Google Meu Negócio + Site",
      "headline": "...",
      "explanation": "...",
      "whyItMatters": "..."
    },
    {
      "id": "conversao_whatsapp",
      "title": "Conversão Máxima para WhatsApp",
      "headline": "...",
      "explanation": "...",
      "whyItMatters": "..."
    },
    {
      "id": "velocidade_extrema",
      "title": "Velocidade Extrema (< 1.2s)",
      "headline": "...",
      "explanation": "...",
      "whyItMatters": "..."
    }
  ],
  "preventiveObjections": [
    {
      "id": "prev_1",
      "objection": "Já tenho Instagram",
      "trigger": "...",
      "counterAngle": "...",
      "scriptSnippet": "..."
    },
    {
      "id": "prev_2",
      "objection": "Achei caro",
      "trigger": "...",
      "counterAngle": "...",
      "scriptSnippet": "..."
    },
    {
      "id": "prev_3",
      "objection": "Tenho quem faça por R$ 300",
      "trigger": "...",
      "counterAngle": "...",
      "scriptSnippet": "..."
    },
    {
      "id": "prev_4",
      "objection": "O Google Meu Negócio já me basta",
      "trigger": "...",
      "counterAngle": "...",
      "scriptSnippet": "..."
    }
  ],
  "whyGmnAndSiteTogether": {
    "gmnRole": "...",
    "siteRole": "...",
    "theFatalMistake": "...",
    "theWinningCombo": "..."
  },
  "seoNota100Explanation": {
    "definition": "...",
    "howWeBuild": "...",
    "commercialAdvantage": "..."
  },
  "visualCharmExplanation": {
    "definition": "...",
    "impactOnClient": "..."
  }
}
`;

  const modelsToTry = ['gemini-3.8-flash'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`[Sales Pitch AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }

  return null;
}

export async function solveObjectionWithGemini(
  request: ObjectionSolverRequest
): Promise<ObjectionSolverResult | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é um mestre em negociação e fechamento de vendas de sites, landing pages e Google Meu Negócio.
Um potencial cliente respondeu ao desenvolvedor/vendedor a seguinte objeção ou hesitação:
"""
${request.clientResponse}
"""

Contexto do cliente:
- Nome: ${request.clientName || 'Cliente'}
- Empresa: ${request.companyName || 'Empresa'}
- Nicho: ${request.niche || 'Geral'}
- Solução Ofertada: ${request.targetSolution || 'Combo Site + Google Meu Negócio'}

Diferenciais da nossa oferta para usar como argumento:
1. SEO Nota 100 no Google (ranqueamento orgânico real, sem ficar refém de pagar anúncios para sempre).
2. Design encantador de alto luxo (Master Site Engine 9.0) que passa credibilidade instantânea.
3. Sinergia Google Meu Negócio + Site: atrai no Maps e fecha no site via WhatsApp.
4. Matemática de ROI: 1 ou 2 clientes a mais no mês pagam 100% do projeto.
5. O custo de não fazer: perder clientes todos os dias para os concorrentes que estão no topo do Google.

Crie a resposta mais eficaz possível para que o cliente feche a compra do site ou landing page.
Retorne um JSON com o esquema:
{
  "detectedCategory": "Nome da objeção detectada",
  "categoryBadge": "TAG CURTA (ex: PREÇO / ROI, INSTAGRAM VS GOOGLE, SOBRINHO / AMADOR)",
  "psychologyInsight": "Explicação psicológica da real trava do cliente e como desarmá-la",
  "whatsappReply": "Texto pronto e perfeito para mandar no WhatsApp, com formatação rica e pergunta de fechamento",
  "audioScript": "Roteiro falado natural para enviar como áudio de WhatsApp de 35 a 50 segundos",
  "roiArgument": "Demonstração matemática rápida e irrefutável do retorno sobre investimento",
  "urgencyCloser": "Gatilho de urgência irresistível ou bônus de ação rápida (ex: otimização do Google Meu Negócio inclusa)",
  "followUpPlan": "O que fazer caso ele não responda nas próximas 24 horas"
}
`;

  const modelsToTry = ['gemini-3.8-flash'];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(`[Objection Solver AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }

  return null;
}

