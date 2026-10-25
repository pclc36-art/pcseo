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
- missingFields (array de strings com o que faltou de essencial)
- contradictions (array de strings com possíveis contradições encontradas)

QUESTIONÁRIO:
${questionnaire}

OBSERVAÇÕES ADICIONAIS:
${additionalNotes || 'Nenhuma'}
`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
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

// GBP PRO: Generate full 13-stage dossier with Gemini
export async function generateGbpDossierWithGemini(
  data: GbpQuestionnaireData
): Promise<Partial<GbpDossier> | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const prompt = `Você é um Consultor Estratégico Master em Google Business Profile (Perfil da Empresa no Google).
Gere um dossiê completo, profissional e pronto para implantação com base nos dados do cliente a seguir.
Respeite rigorosamente todas as diretrizes oficiais do Google:
1. NUNCA adicione palavras-chave promocionais ao nome da empresa (evitar suspensão).
2. A descrição oficial DEVE ter NO MÁXIMO 750 caracteres e capturar a atenção nos primeiros 250 caracteres (sem links, sem "clique aqui", sem superlativos falsos).
3. Recomende 1 Categoria Primária exata da taxonomia oficial do Google e até 4 categorias secundárias pertinentes.
4. Defina a estratégia de endereço (Físico vs Área de Atendimento / SAB) e como realizar a verificação sem problemas.
5. Desenvolva um catálogo de serviços/produtos claros com descrições persuasivas.
6. Crie checklist de fotos detalhado com especificações técnicas e nomes de arquivo otimizados para SEO Local (ex: nome-do-servico-bairro.jpg).
7. Forneça estratégia ética de avaliações (sem compra de reviews) com 5 templates completos de resposta (5 estrelas, 4 estrelas com feedback, 3 estrelas neutro, 1-2 estrelas crítico, e suspeita de fake/injusta).
8. Crie um calendário de 30 dias de postagens com 6 a 8 posts detalhados (headline, corpo, botão de CTA exato, orientação visual).
9. Elabore FAQ localizado de 5 a 8 perguntas estratégicas de alta intenção de busca local.
10. Checklist de compliance e plano de ação de 90 dias dividido em Mês 1, Mês 2 e Mês 3.

DADOS DO CLIENTE:
${JSON.stringify(data, null, 2)}

Retorne um JSON com os campos correspondentes:
- categories: { primaryCategory, primaryJustification, secondaryCategories, categoriesToAvoid, relevanceNotes }
- addressStrategy: { serviceModel, storefrontVisible, serviceRadiusKm, coveredAreas, complianceNotes, verificationAdvice }
- attributes: { accessibility, paymentMethods, amenities, planning, highlights }
- seo: { primaryKeyword, secondaryKeywords, geoModifiers, napStandard: { name, address, phone }, searchIntents }
- description: { fullDescription, first250CharsHook, charCount, complianceChecks: { noLinks, noProhibitedPromotions, noKeywordStuffing, noAllCaps } }
- catalog: Array de itens
- photoChecklist: Array de itens com { id, category, title, recommendedSpec, seoFileName, isCrucialForVerification, description }
- reviewStrategy: { reviewShortlinkTip, qrCodeUsageTip, responseTemplates, ethicalGuidelines }
- editorialCalendar: Array de posts { day, type, topic, headline, body, ctaButton, photoGuidance }
- faq: Array de itens { id, question, answer, strategicGoal }
- complianceChecks: Array de checks { item, status, details, howToFix }
- maintenancePlan90Days: { month1, month2, month3 }
`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
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

// Helper to scrape webpage metadata, images and contacts safely
async function scrapeSiteHtmlPreview(targetUrl: string) {
  try {
    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const resp = await fetch(fullUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const html = await resp.text();

    // Extract og:image
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : null;

    // Extract images
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?([^"'>]*)["']?/gi)];
    const images = imgMatches.slice(0, 10).map((m, idx) => ({
      src: m[1],
      alt: m[2] || `Imagem ${idx + 1}`,
    })).filter(img => !img.src.includes('pixel') && !img.src.includes('analytics') && !img.src.endsWith('.svg'));

    // Contacts
    const waMatches = html.match(/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)(\d+)/gi);
    const phoneMatches = html.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g);
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    const cnpjMatches = html.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g);
    const instaMatches = html.match(/instagram\.com\/([a-zA-Z0-9._-]+)/i);

    // Text sample
    const textSample = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    return {
      title,
      description,
      ogImage,
      images,
      whatsapp: waMatches?.[0] || null,
      phones: phoneMatches?.slice(0, 3) || [],
      emails: emailMatches?.slice(0, 2) || [],
      cnpj: cnpjMatches?.[0] || null,
      instagram: instaMatches?.[1] ? `@${instaMatches[1]}` : null,
      textSample,
    };
  } catch {
    return null;
  }
}

// SITE AUDITOR: Audit Website Link based on MASTER PROMPT 7.0
export async function auditSiteWithGemini(
  request: { url: string; niche?: string; targetObjective?: string }
): Promise<any | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Attempt live scrape preview for real data extraction
  const liveScrape = await scrapeSiteHtmlPreview(request.url);

  const prompt = `Você é o World-Class Digital Experience Engine e Engenheiro Chefe em Auditoria de Sites e Landing Pages do Master Site Prompt Studio.
Sua base normativa OBRIGATÓRIA E SUPREMA é o MASTER SITE PROMPT 7.0 — WORLD-CLASS DIGITAL EXPERIENCE ENGINE (Sistema Supremo de Criação de Sites, Landing Pages, Experiências Premium, SEO e Conversão com 56 Diretrizes Inegociáveis).

O usuário forneceu a seguinte URL de site de cliente ou concorrente para auditoria completa e geração de melhorias superiores:
URL: "${request.url}"
Nicho / Segmento: "${request.niche || 'Auto-detectar pelo link e conteúdo'}"
Objetivo: "${request.targetObjective || 'Conversão de Leads e Agendamentos'}"

${liveScrape ? `DADOS RASTREADOS DIRETAMENTE DO SITE (AO VIVO):
- Título da Página: ${liveScrape.title || 'N/A'}
- Meta Descrição: ${liveScrape.description || 'N/A'}
- Imagem OpenGraph (og:image): ${liveScrape.ogImage || 'N/A'}
- Imagens Encontradas no HTML: ${JSON.stringify(liveScrape.images.slice(0, 5))}
- WhatsApp Detectado: ${liveScrape.whatsapp || 'N/A'}
- Telefones: ${liveScrape.phones.join(', ') || 'N/A'}
- E-mails: ${liveScrape.emails.join(', ') || 'N/A'}
- CNPJ: ${liveScrape.cnpj || 'N/A'}
- Instagram: ${liveScrape.instagram || 'N/A'}
- Trecho de Texto Real da Página: ${liveScrape.textSample.slice(0, 1200)}
` : ''}

EXECUTE A AUDITORIA E RETORNE UM JSON VÁLIDO contendo:
1. "domain": nome do domínio limpo (ex: "clinicaodonto.com.br")
2. "primaryNicheDetected": nicho identificado
3. "overallScore": número de 0 a 100 avaliando a conformidade com o Master Prompt 2.1
4. "scoreLabel": rótulo do desempenho (ex: "Amador com Perda Crítica de Leads", "Médio com Gargalos Visuais", "Padrão Ouro")
5. "executiveSummary": resumo executivo de 3-4 frases em tom de autoridade consultiva
6. "ownerInfo": objeto com os dados extraídos do proprietário e empresa:
   {
     "businessName": "Nome da Empresa ou Clínica",
     "ownerOrLeaderName": "Nome do Fundador, Médico, Advogado ou Proprietário",
     "roleOrCredential": "Cargo e Registro Profissional (ex: CRM, CRO, OAB, Especialista)",
     "whatsapp": "Número com DDD e máscara (ex: (11) 98765-4321)",
     "phone": "Telefone fixo ou comercial",
     "email": "E-mail de contato corporativo",
     "fullAddress": "Endereço físico completo se houver ou região atendida",
     "cityState": "Cidade / Estado",
     "cnpj": "CNPJ se detectado ou 'Sob consulta'",
     "instagram": "@perfil ou link",
     "facebook": "Link ou N/A",
     "linkedin": "Link ou N/A",
     "bioOrAboutSummary": "Resumo profissional de autoridade sobre o proprietário/empresa"
   }
7. "extractedImages": array com os principais ativos visuais detectados ou recomendados para o novo site:
   [
     {
       "id": "img_1",
       "url": "URL direta da imagem rastreada ou imagem de alta resolução representativa",
       "alt": "Texto alternativo descritivo e otimizado para SEO",
       "category": "logo" | "hero" | "team" | "services" | "facility" | "other",
       "label": "Rótulo explicativo (ex: 'Logotipo Oficial da Marca', 'Banner Hero da Página', 'Foto do Responsável Técnico')",
       "suggestedSection": "Seção alvo recomendada (ex: 'Header & Navbar', 'Primeira Dobra (Hero)', 'Sobre o Especialista')",
       "isReal": true
     }
   ]
8. "criticalBottlenecks": array de 4 a 6 frases pontuando os maiores gargalos do site atual
9. "corePillars": objeto com as notas (0-100), status ('critical'|'warning'|'good'|'optimal') e recomendações para:
   - "uvpAndPositioning": Seção 3 (UVP em 4s)
   - "luxuryDigitalStandard": Seção 4 (Hierarquia 60-30-10)
   - "conversionAndFunnel": Seção 13 (CTAs e fluxo)
   - "astroStackAndPerformance": Seção 15 e 17 (Astro-First, Core Web Vitals)
   - "persuasiveCopywriting": Seção 12 (Prova social e quebra de objeções)
   - "accessibilityAndColor": Seção 5 (WCAG e contraste)
   - "onPageSeo": Seção 18 (SEO on-page)
10. "recommendedImprovements": array de 6 objetos com melhorias concretas e reescritas no padrão do Master Prompt:
    [
      {
        "id": "imp_1",
        "title": "Reformulação da UVP e Hero Section",
        "category": "uvp",
        "impact": "very_high",
        "masterPromptReference": "Seção 3 — Posicionamento Comercial & UVP",
        "currentIssue": "...",
        "improvedProposal": "...",
        "copyableContent": "..."
      }
    ]
11. "generatedNewPromptPreview": string com a descrição do novo prompt ideal para reconstruir esse site no Studio
`;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
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
2. DESIGN QUE ENCANTA: Projetos desenhados para deixar os clientes fascinados e encantados à primeira vista (Master Prompt 7.0), transmitindo autoridade imediata e distanciando totalmente de amadores.
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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
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
2. Design encantador de alto luxo (Master Prompt 7.0) que passa credibilidade instantânea.
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

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
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

