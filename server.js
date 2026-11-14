// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// src/server/api.ts
import { GoogleGenAI } from "@google/genai";
var lastRejectedApiKey = null;
function resolveValidGeminiApiKey() {
  const raw = process.env.GEMINI_API_KEY?.trim();
  if (!raw) return null;
  if (raw === "MY_GEMINI_API_KEY" || raw === "YOUR_API_KEY" || raw.startsWith("MY_") || raw.includes("PLACEHOLDER")) {
    return null;
  }
  if (lastRejectedApiKey && raw === lastRejectedApiKey) {
    return null;
  }
  return raw;
}
function getGeminiClient() {
  const apiKey = resolveValidGeminiApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function isInvalidApiKeyError(err) {
  const msg = String(err?.message || err || "");
  return msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes('"code":401') || err?.status === 401;
}
async function generateJsonWithGemini(prompt, contextLabel) {
  const apiKey = resolveValidGeminiApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  const modelsToTry = ["gemini-4-hydrogen"];
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err) {
      if (isInvalidApiKeyError(err)) {
        lastRejectedApiKey = apiKey;
        return null;
      }
      console.warn(`[${contextLabel}] Modelo ${modelName} indispon\xEDvel: ${err?.message?.slice(0, 80)}`);
    }
  }
  return null;
}
function checkServerHealth() {
  const hasKey = Boolean(resolveValidGeminiApiKey());
  return {
    status: "ok",
    hasKey,
    activeModel: "gemini-4-hydrogen",
    engine: hasKey ? "Gemini 4 Hydrogen + Heur\xEDstico Resiliente" : "Motor Heur\xEDstico Determin\xEDstico (Offline Ready)"
  };
}
async function analyzeWithGemini(questionnaire, projectName, clientName, projectType, additionalNotes) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 um analista de briefing s\xEAnior para ag\xEAncias de web design.
Analise com estrito rigor o question\xE1rio fornecido abaixo para o projeto "${projectName}".
N\xE3o invente fatos ou dados n\xE3o mencionados.
Retorne um JSON v\xE1lido com os seguintes campos:
- clientName (string)
- companyName (string)
- niche (string)
- services (array de strings)
- targetAudience (string)
- serviceRegion (string)
- hasPhysicalLocation (boolean: true se tiver cl\xEDnica/escrit\xF3rio/loja f\xEDsica confirmado, false se for digital/remoto)
- address (string: endere\xE7o exato ou "N\xE3o informado")
- hasWhatsApp (boolean)
- whatsapp (string com n\xFAmero ou "N\xE3o informado")
- phone (string ou "N\xE3o informado")
- email (string ou "N\xE3o informado")
- socialLinks (array de strings)
- businessGoals (array de strings)
- differentials (array de strings)
- audiencePainPoints (array de strings)
- benefitsAndTransformation (array de strings)
- preferencesEsthetic (string)
- references (array de strings)
- mandatoryContent (array de strings, ex: CRM, CRO, OAB)
- heroHeadline (string: promessa principal ou t\xEDtulo de impacto para o topo)
- heroSubheadline (string: explica\xE7\xE3o complementar do Hero)
- heroCtaText (string: texto ideal do bot\xE3o principal de convers\xE3o)
- pricingAndPayment (string: pol\xEDtica de valores, parcelamento, planos ou or\xE7amento)
- processSteps (array de strings: etapas passo a passo de atendimento at\xE9 a entrega)
- brandStory (string: hist\xF3ria da empresa, tempo de atua\xE7\xE3o e forma\xE7\xE3o)
- guaranteesAndPolicies (string: garantias, sigilo, pol\xEDticas ou compromisso t\xE9cnico)
- openingHours (string: dias e hor\xE1rios de atendimento e tempo m\xE9dio de resposta)
- faqItems (array de objetos { question: string, answer: string } com d\xFAvidas frequentes reais)
- availableMediaAssets (string: fotos, v\xEDdeos, logos ou materiais dispon\xEDveis)
- seoKeywords (array de strings: palavras-chave locais e termos de busca)
- missingFields (array de strings com o que faltou de essencial)
- contradictions (array de strings com poss\xEDveis contradi\xE7\xF5es encontradas)

QUESTION\xC1RIO:
${questionnaire}

OBSERVA\xC7\xD5ES ADICIONAIS:
${additionalNotes || "Nenhuma"}
`;
  return generateJsonWithGemini(prompt, "Briefing AI");
}
async function analyzeGbpQuestionnaireWithGemini(rawText) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 o maior especialista em Google Business Profile (Perfil da Empresa no Google) e SEO Local do Brasil.
Interprete o texto abaixo (que pode ser um question\xE1rio respondido, anota\xE7\xF5es de briefing ou documento de cliente).
Extraia fielmente as informa\xE7\xF5es e preencha a estrutura JSON descrita abaixo.
NUNCA invente fatos, endere\xE7os, telefones, hor\xE1rios ou pre\xE7os n\xE3o mencionados. Se um campo n\xE3o estiver no texto, use string vazia "" ou array vazio [].
Separe claramente fatos declarados.

Campos requeridos no JSON:
- businessName: Nome comercial oficial
- primaryNiche: Segmento e atividade principal
- fullAddress: Endere\xE7o completo com rua, n\xFAmero, complemento
- neighborhood: Bairro
- city: Cidade
- state: Estado (UF)
- postalCode: CEP
- serviceAreas: Lista de cidades ou bairros atendidos
- phone: Telefone fixo
- whatsapp: WhatsApp
- website: Site oficial
- operatingHours: Hor\xE1rio de funcionamento (dias, horas, intervalos)
- serviceFormat: "physical" (se tem loja/consult\xF3rio aberto), "service_area" (atende no cliente/remoto sem endere\xE7o p\xFAblico), "hybrid" (ambos), ou "appointment_only" (apenas com agendamento)
- items: Array de objetos com { id, name, category, isPriority, priceEstimate, description } (priorize os principais servi\xE7os/produtos)
- priorityItemToPromote: Principal servi\xE7o a promover
- differentials: Array de diferenciais reais
- yearsInMarket: Tempo de atua\xE7\xE3o
- certificationsAndLicenses: Certifica\xE7\xF5es, licen\xE7as, conselhos de classe (CRM, OAB, etc.)
- targetAudience: Perfil do cliente ideal
- userSuggestedKeywords: Array de palavras-chave sugeridas pelo cliente
- primaryObjective: "calls" | "whatsapp" | "appointments" | "store_visits" | "local_visibility" | "website_traffic"
- socialMediaLinks: Array de URLs de redes sociais
- knownCompetitors: Concorrentes citados
- availableMaterials: { hasLogo, hasFacadePhoto, hasTeamPhotos, hasEnvironmentPhotos, hasProductPhotos, hasWebsite }
- hasExistingProfile: boolean
- existingProfileUrl: string
- additionalNotes: Observa\xE7\xF5es relevantes

TEXTO RECEBIDO:
${rawText}
`;
  return generateJsonWithGemini(prompt, "GBP AI");
}
async function generateGbpDossierWithGemini(data) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 o Maior Consultor Estrat\xE9gico em Google Business Profile (Perfil da Empresa no Google), Local SEO e Otimiza\xE7\xE3o para o Google Local 3-Pack (Top 3 do Google Maps) do Brasil.
Sua miss\xE3o \xE9 processar as respostas estrat\xE9gicas do question\xE1rio do cliente (baseado na matriz oficial dos 33 nichos de mercado da plataforma) e gerar um Dossi\xEA de Autoridade M\xE1xima 100/100, estritamente focado em PERFORMANCE e DOM\xCDNIO DO TOPO NO GOOGLE MAPS.

DIRETRIZES T\xC9CNICAS E FATORES DETERMINANTES DE RANQUEAMENTO (ALGORITMO DO GOOGLE MAPS):
1. CONSIST\xCANCIA NAP & ANTI-SUSPENS\xC3O (Fator de Confian\xE7a):
   - NUNCA adicione palavras-chave promocionais artificiais ao nome comercial oficial da empresa (ex: NUNCA crie "Dr. Jo\xE3o - O Melhor Dentista de S\xE3o Paulo"). Use o nome exato conforme fachada e CNPJ para garantir 0% de risco de suspens\xE3o manual ou algor\xEDtmica.
   - Padronize o formato de telefone com DDD e endere\xE7o para cita\xE7\xF5es locais consistentes.
2. TAXONOMIA OFICIAL DE CATEGORIAS (Fator #1 de Relev\xE2ncia Local):
   - Identifique a Categoria Prim\xE1ria EXATA da taxonomia do Google Maps que melhor representa o core business do cliente entre os 33 nichos cadastrados. Ela responde por mais de 60% da relev\xE2ncia do perfil!
   - Sugira at\xE9 4 Categorias Secund\xE1rias oficiais que capturem buscas correlatas de alto volume sem gerar canibaliza\xE7\xE3o.
   - Liste categorias a evitar (que diluem a relev\xE2ncia ou atraem p\xFAblico errado).
3. GEOLOCALIZA\xC7\xC3O & BAIRROS DE MAIOR TICKET (Fator de Proximidade e Alcance):
   - Mapeie o raio de cobertura ideal e liste explicitamente os 5 a 8 bairros de maior poder aquisitivo ou demanda da cidade para cadastrar como \xC1reas de Cobertura (Service Areas).
   - Se for estabelecimento com atendimento local, oriente como manter o endere\xE7o p\xFAblico e seguro para receber rotas no Maps. Se for servi\xE7o a domic\xEDlio/sem letreiro, oriente o modelo SAB (Service Area Business) sem endere\xE7o p\xFAblico.
4. MATRIZ DE PALAVRAS-CHAVE DE ALTA INTEN\xC7\xC3O COMERCIAL:
   - Extraia e defina a Palavra-Chave Principal e 6+ Palavras-Chave Secund\xE1rias com modificadores geogr\xE1ficos reais ("perto de mim", "na minha cidade", "no centro", "[bairro]").
5. DESCRI\xC7\xC3O OFICIAL DE 750 CARACTERES (Otimizada para Convers\xE3o e SEO):
   - M\xC1XIMO DE 750 CARACTERES.
   - OS PRIMEIROS 250 CARACTERES devem conter o gancho magn\xE9tico com a palavra-chave prim\xE1ria, a autoridade do neg\xF3cio (anos de mercado, diferenciais) e a localiza\xE7\xE3o exata, pois \xE9 o trecho vis\xEDvel antes do bot\xE3o "...mais".
   - Restante da descri\xE7\xE3o detalhando servi\xE7os e chamada para a\xE7\xE3o (CTA).
   - PROIBIDO: links externos, n\xFAmeros de telefone soltos, termos em caixa alta exagerada ("GR\xC1TIS", "MELHOR DO MUNDO") ou promo\xE7\xF5es tempor\xE1rias.
6. CAT\xC1LOGO DE SERVI\xC7OS E PRODUTOS DE MAIOR MARGEM:
   - Crie de 4 a 6 itens priorit\xE1rios com t\xEDtulos exatos de busca comercial, pre\xE7os reais/estimados e descri\xE7\xF5es persuasivas ricas em palavras-chave que convencem o cliente a ligar ou agendar.
7. CHECKLIST DE FOTOS GEOLOCALIZADAS (Sinais Visuais de Proemin\xEAncia):
   - 6 a 8 orienta\xE7\xF5es de fotos t\xE9cnicas (fachada com luz diurna, recep\xE7\xE3o, equipe uniformizada, procedimentos com autoriza\xE7\xE3o, equipamentos e certificados).
   - Sugira nomes de arquivos em padr\xE3o SEO para upload (ex: 'implante-dentario-campinas-fachada.jpg').
8. ESTRAT\xC9GIA \xC9TICA DE AVALIA\xC7\xD5ES 5 ESTRELAS & RESPOSTAS COM SEO:
   - Forne\xE7a script de solicita\xE7\xE3o p\xF3s-atendimento com link curto e QR Code.
   - 5 Templates de resposta completos e profissionais (5 estrelas com palavra-chave, 4 estrelas construtivo, 3 estrelas neutro, 1-2 estrelas resolvendo a obje\xE7\xE3o com eleg\xE2ncia, e protocolo para avalia\xE7\xE3o suspeita de concorrente).
   - IMPORTANTE: O Google rastreia os termos nas respostas dos propriet\xE1rios para melhorar o ranking! Insira termos locais nas respostas.
9. CALEND\xC1RIO DE ATUALIZA\xC7\xD5ES (SINAIS DE FRESCOR DE 30 DIAS):
   - 6 a 8 posts semanais com t\xEDtulos chamativos, corpos persuasivos e bot\xE3o de a\xE7\xE3o (CTA) oficial do Google ("Ligar agora", "Saiba mais", "Reservar").
10. FAQ LOCAL DE ALTA CONVERS\xC3O (BUSCA POR VOZ E D\xDAVIDAS CRUCIAIS):
    - 5 a 8 perguntas e respostas estrat\xE9gicas que quebram obje\xE7\xF5es antes do cliente ligar.
11. CHECKLIST DE BLINDAGEM ANTI-SUSPENS\xC3O & VERIFICA\xC7\xC3O POR V\xCDDEO:
    - Orienta\xE7\xF5es cir\xFArgicas para gravar o v\xEDdeo de verifica\xE7\xE3o exigido pelo Google (mostrar placa da rua, destrancar a porta do estabelecimento, mostrar equipamentos de trabalho e documentos comerciais).
12. PLANO DE A\xC7\xC3O DE DOM\xCDNIO DO TOP 3 EM 90 DIAS:
    - M\xEAs 1: Funda\xE7\xE3o, Verifica\xE7\xE3o e Cat\xE1logo.
    - M\xEAs 2: Ativa\xE7\xE3o de Prova Social e Sinais de Frescor.
    - M\xEAs 3: Consolida\xE7\xE3o do Top 3 e Monitoramento de Concorrentes.

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
  return generateJsonWithGemini(prompt, "GBP Dossier AI");
}
async function auditGbpProfileWithGemini(request) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 o maior Auditor e Especialista em Google Business Profile (Perfil da Empresa no Google) e SEO Local do Brasil.
O usu\xE1rio forneceu o link de um perfil existente ou informa\xE7\xF5es de uma empresa para auditoria direta.
SE O USU\xC1RIO FORNECEU APENAS O LINK (URL do Google Maps ou nome no link):
1. Extraia e identifique com precis\xE3o o Nome da Empresa, Nicho/Categoria e Localiza\xE7\xE3o a partir da URL fornecida (ex: extraia o nome contido no path /place/Nome+Empresa/@... ou nos par\xE2metros).
2. Execute o diagn\xF3stico completo e rigoroso das diretrizes do Google Maps (Google Local Pack).
3. Calcule uma pontua\xE7\xE3o de 0 a 100 distribu\xEDda entre os 7 pilares oficiais:
   - guidelinesAndName (max 20 pts)
   - categoriesTaxonomy (max 15 pts)
   - napAndLocation (max 15 pts)
   - descriptionOptimization (max 10 pts)
   - reviewsAndReputation (max 15 pts)
   - visualPresence (max 15 pts)
   - engagementAndFaq (max 10 pts)
4. Separe OBRIGATORIAMENTE em duas listas de alto impacto para o usu\xE1rio:
   A) "whatToModify": Lista do que DEVE SER MODIFICADO (Erros que violam diretrizes, risco de suspens\xE3o, keyword stuffing no nome, hor\xE1rios sem feriados, descri\xE7\xE3o com links proibidos, etc.).
      Cada item com: { title, currentSituation, risk, howToFix, priority: 'cr\xEDtica'|'alta'|'m\xE9dia' }
   B) "whatToInclude": Lista do que DEVE SER INCLUSO para alcan\xE7ar o TOP 3 do Google Maps (Novas categorias secund\xE1rias essenciais, atributos oficiais ocultos, 5 FAQs estrat\xE9gicas, posts de rec\xEAncia, novas fotos de alta convers\xE3o).
      Cada item com: { title, benefit, implementationDetails, priority: 'alta'|'m\xE9dia' }
5. Forne\xE7a o "correctiveCopy" completo e pronto para copiar e colar:
   - recommendedBusinessName (nome limpo sem spam)
   - recommendedDescription (descri\xE7\xE3o persuasiva de at\xE9 750 caracteres com gancho nos primeiros 250)
   - recommendedPrimaryCategory (categoria exata da taxonomia do Google)
   - recommendedSecondaryCategories (at\xE9 4 secund\xE1rias estrat\xE9gicas)
   - reviewResponseTemplate (modelo para responder clientes)
   - samplePostToPublish (post imediato com CTA para sinal de frescor)
   - recommendedFaqs (array de 4 a 5 objetos { question, answer } prontos para cadastrar na aba de perguntas)
   - recommendedPosts (array de 2 a 3 posts com { title, body, cta })
   - attributesToActivate (array de atributos oficiais recomendados para marcar como "Sim")
   - photoGuidelines (array de fotos obrigat\xF3rias com nomes SEO de arquivo)

DADOS / LINK FORNECIDO:
${JSON.stringify(request, null, 2)}
`;
  return generateJsonWithGemini(prompt, "GBP Audit AI");
}
function decodeHtmlEntities(input) {
  return input.replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&nbsp;/gi, " ").replace(/&#(\d+);/g, (_, num) => {
    const code = Number(num);
    return Number.isFinite(code) ? String.fromCharCode(code) : "";
  });
}
function extractAttr(tag, attrName) {
  const regex = new RegExp(`(?:^|\\s)${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = tag.match(regex);
  const val = match ? match[1] ?? match[2] ?? match[3] ?? "" : "";
  return val ? decodeHtmlEntities(val.trim()) : null;
}
function resolveAbsoluteUrl(raw, baseUrl) {
  if (!raw) return null;
  const cleaned = decodeHtmlEntities(raw).trim().replace(/^['"]|['"]$/g, "");
  if (!cleaned || cleaned.startsWith("data:") || cleaned.startsWith("javascript:") || cleaned.startsWith("#")) {
    return null;
  }
  try {
    const parsed = new URL(cleaned, baseUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}
function isTrackingOrJunkImage(url, alt, classes) {
  const lower = `${url} ${alt} ${classes}`.toLowerCase();
  if (lower.includes("facebook.com/tr") || lower.includes("google-analytics") || lower.includes("googletagmanager") || lower.includes("doubleclick") || lower.includes("/pixel") || lower.includes("1x1") || lower.includes("spacer") || lower.includes("blank.gif") || lower.includes("gravatar.com") || lower.includes("s.w.org/images/core/emoji") || lower.includes("twemoji")) {
    return true;
  }
  if (url.toLowerCase().endsWith(".ico")) return true;
  return false;
}
function classifyScrapedImage(url, alt, contextHint, isLogoCandidate, isHeroCandidate) {
  const signal = `${url} ${alt} ${contextHint}`.toLowerCase();
  if (isLogoCandidate || /\b(logo|logotipo|logomarca|marca|brand)\b/.test(signal)) {
    return {
      category: "logo",
      label: alt && alt.length > 2 ? `Logotipo Oficial \u2014 ${alt.slice(0, 60)}` : "Logotipo Oficial do Cliente",
      suggestedSection: "Header, Navbar & Rodap\xE9"
    };
  }
  if (/\b(dr|dra|doutor|doutora|equipe|team|sobre|about|fundador|founder|soci[oa]|diretor|ceo|advogad|medic|dentist|perfil|profile|autor)\b/.test(signal)) {
    return {
      category: "team",
      label: alt && alt.length > 2 ? alt.slice(0, 70) : "Foto Real do Respons\xE1vel / Equipe",
      suggestedSection: "Se\xE7\xE3o Sobre / Autoridade & Especialista"
    };
  }
  if (isHeroCandidate || /\b(hero|banner|capa|slide|slider|destaque|cover|showcase)\b/.test(signal)) {
    return {
      category: "hero",
      label: alt && alt.length > 2 ? alt.slice(0, 70) : "Imagem Hero / Destaque Principal do Cliente",
      suggestedSection: "Primeira Dobra (Hero Section)"
    };
  }
  if (/\b(clinica|clínica|escritorio|escritório|consultorio|consultório|espaco|espaço|sala|estrutura|ambiente|recepcao|recepção|fachada|loja|office|studio)\b/.test(signal)) {
    return {
      category: "facility",
      label: alt && alt.length > 2 ? alt.slice(0, 70) : "Foto Real das Instala\xE7\xF5es / Espa\xE7o",
      suggestedSection: "Infraestrutura / Sobre o Espa\xE7o"
    };
  }
  if (/\b(serv|tratamento|procedimento|produto|solucao|solução|implant|estetica|estética|portfolio|portfólio|projeto|caso|case)\b/.test(signal)) {
    return {
      category: "services",
      label: alt && alt.length > 2 ? alt.slice(0, 70) : "Imagem Real de Servi\xE7o / Solu\xE7\xE3o",
      suggestedSection: "Vitrine de Servi\xE7os / Solu\xE7\xF5es"
    };
  }
  return {
    category: "other",
    label: alt && alt.length > 2 ? alt.slice(0, 70) : "Imagem Real Extra\xEDda do Site do Cliente",
    suggestedSection: "Conte\xFAdo / Galeria do Site"
  };
}
function formatBrWhatsappOrPhone(rawDigits) {
  const digits = rawDigits.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return rawDigits;
}
async function scrapeSiteHtmlPreview(targetUrl) {
  try {
    const fullUrl = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8e3);
    const resp = await fetch(fullUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
      }
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const finalUrl = resp.url || fullUrl;
    const html = await resp.text();
    if (!html || html.length < 50) return null;
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, " ").trim()) : null;
    let siteName = null;
    let description = null;
    let ogImage = null;
    let ogTitle = null;
    const metaTags = [...html.matchAll(/<meta\b[^>]*>/gi)];
    for (const m of metaTags) {
      const tag = m[0];
      const name = (extractAttr(tag, "name") || "").toLowerCase();
      const prop = (extractAttr(tag, "property") || "").toLowerCase();
      const content = extractAttr(tag, "content");
      if (!content) continue;
      if (name === "description" && !description) description = content;
      if (prop === "og:description" && !description) description = content;
      if (prop === "og:site_name" && !siteName) siteName = content;
      if (prop === "og:title" && !ogTitle) ogTitle = content;
      if ((prop === "og:image" || prop === "og:image:secure_url" || name === "twitter:image") && !ogImage) {
        ogImage = resolveAbsoluteUrl(content, finalUrl);
      }
    }
    let ldBusinessName = null;
    let ldOwnerName = null;
    let ldRole = null;
    let ldLogo = null;
    const ldImages = [];
    const ldPhones = [];
    const ldEmails = [];
    const ldSocials = [];
    let ldAddress = null;
    let ldCityState = null;
    const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const inspectLdNode = (node) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(inspectLdNode);
        return;
      }
      if (Array.isArray(node["@graph"])) {
        inspectLdNode(node["@graph"]);
      }
      const nodeType = Array.isArray(node["@type"]) ? node["@type"].join(" ") : String(node["@type"] || "");
      const isOrg = /Organization|LocalBusiness|Medical|Dentist|Legal|Attorney|Store|Professional|Corporation|Health/i.test(nodeType);
      const isPerson = /Person/i.test(nodeType);
      if (isOrg && typeof node.name === "string" && !ldBusinessName) {
        ldBusinessName = node.name.trim();
      }
      if (isPerson && typeof node.name === "string" && !ldOwnerName) {
        ldOwnerName = node.name.trim();
        if (typeof node.jobTitle === "string" && !ldRole) ldRole = node.jobTitle.trim();
      }
      if (node.founder) {
        const f = Array.isArray(node.founder) ? node.founder[0] : node.founder;
        if (typeof f === "string" && !ldOwnerName) ldOwnerName = f.trim();
        else if (f && typeof f.name === "string" && !ldOwnerName) {
          ldOwnerName = f.name.trim();
          if (typeof f.jobTitle === "string" && !ldRole) ldRole = f.jobTitle.trim();
        }
      }
      if (typeof node.telephone === "string") ldPhones.push(node.telephone.trim());
      if (typeof node.email === "string") ldEmails.push(node.email.trim());
      const extractMediaUrl = (val) => {
        if (!val) return null;
        if (typeof val === "string") return resolveAbsoluteUrl(val, finalUrl);
        if (typeof val === "object" && typeof val.url === "string") return resolveAbsoluteUrl(val.url, finalUrl);
        if (typeof val === "object" && typeof val.contentUrl === "string") return resolveAbsoluteUrl(val.contentUrl, finalUrl);
        return null;
      };
      const maybeLogo = extractMediaUrl(node.logo);
      if (maybeLogo && !ldLogo) ldLogo = maybeLogo;
      if (Array.isArray(node.image)) {
        node.image.forEach((item) => {
          const u = extractMediaUrl(item);
          if (u) ldImages.push(u);
        });
      } else {
        const u = extractMediaUrl(node.image);
        if (u) ldImages.push(u);
      }
      if (node.address && typeof node.address === "object" && !ldAddress) {
        const addr = node.address;
        const parts = [addr.streetAddress, addr.addressLocality, addr.addressRegion, addr.postalCode].filter((x) => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
        if (parts.length > 0) ldAddress = parts.join(", ");
        if (addr.addressLocality) {
          ldCityState = addr.addressRegion ? `${addr.addressLocality.trim()} / ${addr.addressRegion.trim()}` : addr.addressLocality.trim();
        }
      }
      if (Array.isArray(node.sameAs)) {
        node.sameAs.forEach((s) => {
          if (typeof s === "string") ldSocials.push(s);
        });
      }
    };
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1].trim());
        inspectLdNode(parsed);
      } catch {
      }
    }
    let iconLogoUrl = null;
    const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)];
    for (const m of linkTags) {
      const tag = m[0];
      const rel = (extractAttr(tag, "rel") || "").toLowerCase();
      const href = extractAttr(tag, "href");
      if (!href) continue;
      if (rel.includes("apple-touch-icon")) {
        iconLogoUrl = resolveAbsoluteUrl(href, finalUrl);
        break;
      }
      if (rel.includes("icon") && !href.toLowerCase().endsWith(".ico") && !iconLogoUrl) {
        iconLogoUrl = resolveAbsoluteUrl(href, finalUrl);
      }
    }
    const imageMap = /* @__PURE__ */ new Map();
    const pushImage = (rawUrl, alt, contextHint, isLogoCandidate = false, isHeroCandidate = false) => {
      const absUrl = resolveAbsoluteUrl(rawUrl, finalUrl);
      if (!absUrl) return;
      if (isTrackingOrJunkImage(absUrl, alt, contextHint)) return;
      const dedupKey = absUrl.split("#")[0];
      if (imageMap.has(dedupKey)) return;
      const classified = classifyScrapedImage(absUrl, alt, contextHint, isLogoCandidate, isHeroCandidate);
      imageMap.set(dedupKey, {
        id: `real_img_${imageMap.size + 1}`,
        url: absUrl,
        alt: alt || classified.label,
        category: classified.category,
        label: classified.label,
        suggestedSection: classified.suggestedSection,
        isReal: true
      });
    };
    if (ldLogo) {
      pushImage(ldLogo, `${ldBusinessName || siteName || "Marca"} Logotipo`, "logo", true, false);
    }
    const imgTags = [...html.matchAll(/<img\b[^>]*>/gi)];
    let firstLargeNonLogoAssigned = false;
    for (const m of imgTags) {
      const tag = m[0];
      const alt = extractAttr(tag, "alt") || extractAttr(tag, "title") || "";
      const cls = `${extractAttr(tag, "class") || ""} ${extractAttr(tag, "id") || ""}`;
      let src = extractAttr(tag, "data-src") || extractAttr(tag, "data-lazy-src") || extractAttr(tag, "data-original") || extractAttr(tag, "src");
      const srcset = extractAttr(tag, "data-srcset") || extractAttr(tag, "srcset");
      if ((!src || src.startsWith("data:")) && srcset) {
        const firstSrcSet = srcset.split(",")[0]?.trim().split(/\s+/)[0];
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
    const sourceTags = [...html.matchAll(/<source\b[^>]*>/gi)];
    for (const m of sourceTags) {
      const tag = m[0];
      const srcset = extractAttr(tag, "srcset") || extractAttr(tag, "data-srcset");
      if (!srcset) continue;
      const firstUrl = srcset.split(",")[0]?.trim().split(/\s+/)[0];
      if (firstUrl) pushImage(firstUrl, "", extractAttr(tag, "media") || "", false, false);
    }
    const bgMatches = [...html.matchAll(/background(?:-image)?\s*:[^;]*url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)];
    for (const m of bgMatches) {
      const bgUrl = m[2];
      if (bgUrl) {
        const looksHero = /hero|banner|bg|capa|slide/i.test(bgUrl);
        pushImage(bgUrl, "", looksHero ? "hero banner" : "background", false, looksHero);
      }
    }
    for (const u of ldImages) {
      pushImage(u, ldBusinessName || "", "schema json-ld", false, !firstLargeNonLogoAssigned);
    }
    if (ogImage) {
      pushImage(ogImage, ogTitle || title || "Imagem Destaque (OpenGraph)", "og:image hero", false, true);
    }
    const hasDetectedLogo = Array.from(imageMap.values()).some((img) => img.category === "logo");
    if (!hasDetectedLogo && iconLogoUrl) {
      pushImage(iconLogoUrl, `\xCDcone / Logotipo ${ldBusinessName || siteName || ""}`.trim(), "logo icon", true, false);
    }
    const categoryOrder = {
      logo: 0,
      hero: 1,
      team: 2,
      services: 3,
      facility: 4,
      other: 5
    };
    const images = Array.from(imageMap.values()).sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]).slice(0, 18);
    const detectedLogoUrl = images.find((i) => i.category === "logo")?.url || ldLogo || iconLogoUrl || null;
    const stripTags = (s) => decodeHtmlEntities(s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const h1 = h1Match ? stripTags(h1Match[1]) : null;
    const headingMatches = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)];
    const headings = Array.from(
      new Set(
        headingMatches.map((m) => stripTags(m[1])).filter((t) => t.length >= 4 && t.length <= 140)
      )
    ).slice(0, 15);
    const servicesDetected = headings.filter((h) => h !== h1 && h.split(" ").length <= 10).slice(0, 8);
    const textSample = decodeHtmlEntities(
      html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ").replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ").replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    ).slice(0, 3500);
    const waLinks = [
      ...html.matchAll(/(?:wa\.me\/|api\.whatsapp\.com\/send\?[^"']*?phone=|whatsapp\.com\/send\?[^"']*?phone=)(\d{10,15})/gi)
    ];
    const whatsapp = waLinks[0]?.[1] ? formatBrWhatsappOrPhone(waLinks[0][1]) : null;
    const telLinks = [...html.matchAll(/href=["']tel:([^"']+)["']/gi)].map(
      (m) => formatBrWhatsappOrPhone(m[1])
    );
    const bodyPhoneMatches = textSample.match(/(?:\+?55\s*)?\(?\d{2}\)?\s*(?:9\d{4}|\d{4})[-\s]?\d{4}/g) || [];
    const phones = Array.from(
      new Set([...ldPhones, ...telLinks, ...bodyPhoneMatches].map((p) => p.trim()).filter(Boolean))
    ).slice(0, 4);
    const mailtoMatches = [...html.matchAll(/href=["']mailto:([^"'?]+)/gi)].map((m) => m[1].trim());
    const rawEmailMatches = textSample.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const emails = Array.from(
      new Set(
        [...ldEmails, ...mailtoMatches, ...rawEmailMatches].filter(
          (e) => e && !/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(e) && !/@(?:example|sentry|wixpress|domain)\./i.test(e)
        )
      )
    ).slice(0, 3);
    const cnpjMatches = textSample.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g);
    const cnpj = cnpjMatches?.[0] || null;
    const credentialMatch = textSample.match(
      /\b(?:OAB|CRM|CRO|CREA|CRECI|CAU|CRP|CRN|CRBM|CREFITO|COREN)[\/\s\-]*[A-Z]{2}\s*[-:]?\s*[\d.\-]+\b/i
    );
    const credential = credentialMatch ? credentialMatch[0].replace(/\s+/g, " ").trim() : ldRole;
    const allLinksText = `${html} ${ldSocials.join(" ")}`;
    const instaMatch = allLinksText.match(/instagram\.com\/([a-zA-Z0-9._]{2,40})/i);
    const instagram = instaMatch?.[1] && !["p", "reel", "reels", "stories", "explore"].includes(instaMatch[1].toLowerCase()) ? `@${instaMatch[1].replace(/\/$/, "")}` : null;
    const fbMatch = allLinksText.match(/facebook\.com\/(?!sharer|share\.php|plugins|tr\b)([a-zA-Z0-9._\-]{2,60})/i);
    const facebook = fbMatch?.[1] ? `https://facebook.com/${fbMatch[1]}` : null;
    const liMatch = allLinksText.match(/linkedin\.com\/(?:company|in)\/([a-zA-Z0-9._\-]{2,60})/i);
    const linkedin = liMatch?.[0] ? `https://www.${liMatch[0]}` : null;
    const ytMatch = allLinksText.match(/youtube\.com\/(?:@|c\/|channel\/)([a-zA-Z0-9._\-]{2,60})/i);
    const youtube = ytMatch?.[0] ? `https://www.${ytMatch[0]}` : null;
    let address = ldAddress;
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
    let cityState = ldCityState;
    if (!cityState && address) {
      const cityMatch = address.match(/([A-Za-zÀ-ÿ\s]{3,35})\s*[-\/]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/);
      if (cityMatch) cityState = `${cityMatch[1].trim()} / ${cityMatch[2]}`;
    }
    let businessName = ldBusinessName || siteName || null;
    if (!businessName && title) {
      const splitTitle = title.split(/\s*[|—–\-:]\s*/).map((s) => s.trim()).filter(Boolean);
      if (splitTitle.length > 0) {
        businessName = splitTitle[splitTitle.length - 1].length <= 36 && splitTitle.length > 1 ? splitTitle[splitTitle.length - 1] : splitTitle[0];
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
      textSample
    };
  } catch {
    return null;
  }
}
async function auditSiteWithGemini(request, preScrapedData) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const liveScrape = preScrapedData !== void 0 ? preScrapedData : await scrapeSiteHtmlPreview(request.url);
  const prompt = `Voc\xEA \xE9 o Auditor Independente e Engenheiro Chefe de Reengenharia Digital do MASTER SITE ENGINE 10.0 (QUALITY CONTROL, PERFORMANCE AUDIT & REENGINEERING SYSTEM).
Sua base normativa OBRIGAT\xD3RIA E SUPREMA \xE9 o MASTER SITE ENGINE 10.0.

REGRA ABSOLUTA E INEGOCI\xC1VEL DE PRESERVA\xC7\xC3O DO CLIENTE:
Sempre que sugerir melhorias ou gerar o Mega Prompt de Recria\xE7\xE3o para este site auditado:
1. MANTENHA 100% DAS IMAGENS REAIS DO CLIENTE extra\xEDdas do link (mesmas URLs exatas de logotipo, hero, fotos da equipe/profissional, fotos do espa\xE7o e servi\xE7os). \xC9 PROIBIDO substituir fotos reais extra\xEDdas por imagens gen\xE9ricas de bancos de imagem (Unsplash/Pexels) ou inventar URLs fict\xEDcias.
2. MANTENHA 100% DAS INFORMA\xC7\xD5ES REAIS DO CLIENTE encontradas no site (nome da marca/empresa, respons\xE1vel t\xE9cnico, OAB/CRM/CRO/CREA, WhatsApp, telefone, e-mail, endere\xE7o completo, cidade/UF, CNPJ, Instagram/redes sociais, servi\xE7os reais e biografia/hist\xF3ria). Se algum dado n\xE3o foi detectado no HTML, indique claramente "N\xE3o identificado no HTML \u2014 confirmar com cliente" ao inv\xE9s de inventar dados fict\xEDcios.
3. TODAS AS MELHORIAS SUGERIDAS ("recommendedImprovements") devem otimizar estrutura, headline, CTA, convers\xE3o, SEO e velocidade (como converter as fotos atuais para WebP/AVIF mantendo EXATAMENTE as mesmas imagens do cliente e aplicando os contatos e textos reais do cliente).
4. O "reengineeringMegaPrompt" DEVE conter uma se\xE7\xE3o expl\xEDcita listando todas as URLs exatas de imagens do cliente e todos os dados cadastrais reais a preservar integralmente.

URL para auditoria: "${request.url}"
${liveScrape?.finalUrl ? `URL final ap\xF3s redirecionamentos: "${liveScrape.finalUrl}"` : ""}
Nicho / Segmento: "${request.niche || "Auto-detectar pelo link e conte\xFAdo"}"
Objetivo: "${request.targetObjective || "Convers\xE3o de Leads e Agendamentos"}"

${liveScrape ? `DADOS E ATIVOS REAIS RASTREADOS DIRETAMENTE DO SITE (PRESERVAR INTEGRALMENTE):
- Nome da Marca / Empresa Detectado: ${liveScrape.businessName || "N/A"}
- T\xEDtulo da P\xE1gina (<title>): ${liveScrape.title || "N/A"}
- H1 Principal: ${liveScrape.h1 || "N/A"}
- Principais T\xEDtulos / Se\xE7\xF5es Detectadas: ${JSON.stringify(liveScrape.headings)}
- Servi\xE7os / Produtos Identificados: ${JSON.stringify(liveScrape.servicesDetected)}
- Meta Descri\xE7\xE3o: ${liveScrape.description || "N/A"}
- Respons\xE1vel / Fundador Detectado: ${liveScrape.ownerName || "N/A"}
- Registro / Credencial: ${liveScrape.credential || "N/A"}
- WhatsApp Oficial: ${liveScrape.whatsapp || "N/A"}
- Telefones: ${liveScrape.phones.join(", ") || "N/A"}
- E-mails: ${liveScrape.emails.join(", ") || "N/A"}
- Endere\xE7o: ${liveScrape.address || "N/A"}
- Cidade / UF: ${liveScrape.cityState || "N/A"}
- CNPJ: ${liveScrape.cnpj || "N/A"}
- Redes Sociais: Instagram=${liveScrape.instagram || "N/A"}, Facebook=${liveScrape.facebook || "N/A"}, LinkedIn=${liveScrape.linkedin || "N/A"}
- Logotipo Detectado: ${liveScrape.logoUrl || "N/A"}
- Imagem OpenGraph: ${liveScrape.ogImage || "N/A"}
- IMAGENS REAIS DO CLIENTE ENCONTRADAS NO HTML (${liveScrape.images.length} \u2014 PRESERVAR URLs EXATAS):
${JSON.stringify(liveScrape.images.slice(0, 15), null, 2)}
- Conte\xFAdo Textual Real da P\xE1gina:
${liveScrape.textSample.slice(0, 2200)}
` : "Obs: N\xE3o foi poss\xEDvel baixar o HTML ao vivo do servidor alvo (bloqueio/timeout). Assinale claramente quais campos dependem de confirma\xE7\xE3o com o cliente e n\xE3o invente URLs de fotos como se fossem reais."}

EXECUTE A AUDITORIA E RETORNE UM JSON V\xC1LIDO contendo:
1. "domain": nome do dom\xEDnio limpo (ex: "clinicaodonto.com.br")
2. "primaryNicheDetected": nicho identificado com base no conte\xFAdo real
3. "overallScore": n\xFAmero de 0 a 100 calculado pela soma ponderada oficial dos 8 pilares:
   - Design e identidade visual (20%)
   - SEO e posicionamento org\xE2nico (20%)
   - Performance e velocidade (15%)
   - Convers\xE3o e estrat\xE9gia comercial (15%)
   - UX, navega\xE7\xE3o e responsividade (10%)
   - Acessibilidade (8%)
   - Seguran\xE7a e conformidade legal (7%)
   - Qualidade t\xE9cnica e c\xF3digo (5%)
4. "scoreLabel": classifica\xE7\xE3o oficial (95-100: "Excel\xEAncia Internacional", 90-94: "Excelente", 80-89: "Muito Bom", 70-79: "Regular", 50-69: "Insatisfat\xF3rio", 0-49: "Cr\xEDtico")
5. "approvalStatus": "APROVADO" (>=90 e sem bloqueio), "APROVADO COM MELHORIAS" (80-89), "EXIGE CORRE\xC7\xD5ES" (70-79), ou "REPROVADO" (<70 ou com bloqueio P0)
6. "executiveSummary": resumo executivo rigoroso de 3-4 frases em tom de auditor independente mencionando os pontos reais encontrados
7. "ownerInfo": objeto preservando fielmente os dados reais extra\xEDdos { businessName, ownerOrLeaderName, roleOrCredential, whatsapp, phone, email, fullAddress, cityState, cnpj, instagram, facebook, linkedin, youtube, bioOrAboutSummary }
8. "extractedImages": array preservando EXATAMENTE as imagens reais rastreadas acima (cada objeto com { id, url, alt, category, label, suggestedSection, isReal: true }). N\xC3O substitua por URLs de Unsplash/Pexels!
9. "criticalBlockers": array com bloqueadores cr\xEDticos reais encontrados { id, title, evidence, impact, correction, priority: 'P0'|'P1' }
10. "categories10": objeto com as 8 categorias oficiais do Master Site Engine 10.0 contendo { name, score, weight, status, description, masterPromptRule, currentFlaws, recommendations } para:
    - design (peso 20)
    - seo (peso 20)
    - performance (peso 15)
    - conversion (peso 15)
    - uxResponsiveness (peso 10)
    - accessibility (peso 8)
    - securityCompliance (peso 7)
    - technicalQuality (peso 5)
DIRETRIZ SUPREMA DE VELOCIDADE (OBRIGAT\xD3RIO NOTA > 9.5 NO GOOGLE PAGESPEED INSIGHTS):
Todo site e landing page DEVE atingir nota >= 9.5 (95+) no Google PageSpeed Insights (Mobile e Desktop), com LCP < 1.8s, CLS < 0.05, INP < 100ms, FCP < 1.0s, convertendo as imagens REAIS do cliente para WebP/AVIF (<150KB fundos, <80KB destaque) SEM substitu\xED-las.

11. "recommendedImprovements": array de 6 objetos { id, title, category, impact, masterPromptReference, currentIssue, improvedProposal, copyableContent } onde CADA melhoria usa os dados reais do cliente (nome, cidade, WhatsApp, servi\xE7os reais) e referencia a preserva\xE7\xE3o das fotos reais extra\xEDdas.
12. "reengineeringMegaPrompt": string com o MEGA PROMPT DEFINITIVO DE RECRIA\xC7\xC3O & REENGENHARIA 10.0 autossuficiente e completo, contendo se\xE7\xE3o expl\xEDcita com TODAS as URLs exatas das imagens do cliente e TODOS os dados reais do cliente para preserva\xE7\xE3o obrigat\xF3ria, mais meta 9.5+ PageSpeed.
`;
  const parsed = await generateJsonWithGemini(prompt, "Site Audit AI");
  if (parsed) {
    if (liveScrape) {
      if (liveScrape.images.length > 0) {
        const scrapedByUrl = new Map(liveScrape.images.map((img) => [img.url, img]));
        const geminiImgs = Array.isArray(parsed.extractedImages) ? parsed.extractedImages : [];
        const sanitizedGemini = geminiImgs.filter(
          (g) => typeof g?.url === "string" && scrapedByUrl.has(g.url)
        );
        const seenUrls = new Set(sanitizedGemini.map((g) => g.url));
        const mergedImages = [
          ...sanitizedGemini.map((g) => ({ ...g, isReal: true })),
          ...liveScrape.images.filter((s) => !seenUrls.has(s.url))
        ];
        parsed.extractedImages = mergedImages;
      }
      parsed.ownerInfo = {
        ...parsed.ownerInfo || {},
        businessName: parsed.ownerInfo?.businessName || liveScrape.businessName || "",
        ownerOrLeaderName: parsed.ownerInfo?.ownerOrLeaderName || liveScrape.ownerName || "N\xE3o identificado no HTML \u2014 confirmar com cliente",
        roleOrCredential: parsed.ownerInfo?.roleOrCredential || liveScrape.credential || "Confirmar com cliente",
        whatsapp: liveScrape.whatsapp || parsed.ownerInfo?.whatsapp || "N\xE3o identificado no HTML \u2014 confirmar com cliente",
        phone: liveScrape.phones[0] || parsed.ownerInfo?.phone || "N\xE3o identificado no HTML \u2014 confirmar com cliente",
        email: liveScrape.emails[0] || parsed.ownerInfo?.email || "N\xE3o identificado no HTML \u2014 confirmar com cliente",
        fullAddress: liveScrape.address || parsed.ownerInfo?.fullAddress || "N\xE3o identificado no HTML \u2014 confirmar com cliente",
        cityState: liveScrape.cityState || parsed.ownerInfo?.cityState || "Confirmar cidade/UF",
        cnpj: liveScrape.cnpj || parsed.ownerInfo?.cnpj || void 0,
        instagram: liveScrape.instagram || parsed.ownerInfo?.instagram || void 0,
        facebook: liveScrape.facebook || parsed.ownerInfo?.facebook || void 0,
        linkedin: liveScrape.linkedin || parsed.ownerInfo?.linkedin || void 0,
        youtube: liveScrape.youtube || parsed.ownerInfo?.youtube || void 0
      };
      parsed.liveScrapedUsed = true;
      parsed.preservedClientAssetCount = liveScrape.images.length;
      parsed.siteTitle = liveScrape.title || void 0;
      parsed.metaDescription = liveScrape.description || void 0;
      parsed.h1Text = liveScrape.h1 || void 0;
      parsed.extractedHeadings = liveScrape.headings;
      parsed.extractedServices = liveScrape.servicesDetected;
    }
    return parsed;
  }
  return null;
}
async function generatePitchWithGemini(request) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 o maior especialista em copywriting e fechamento de vendas de sites, landing pages e SEO Local (Google Meu Neg\xF3cio) do Brasil.
O usu\xE1rio \xE9 um desenvolvedor/ag\xEAncia de sites de elite que utiliza a plataforma Master Site Prompt Studio.
Seus produtos s\xE3o \xFAnicos e diferenciados:
1. SEO NOTA 100: Criados com arquitetura t\xE9cnica sem\xE2ntica para ranquear no topo da 1\xAA p\xE1gina do Google organicamente (Schema.org, Lighthouse 98-100, Core Web Vitals <1.2s), para o cliente n\xE3o ficar ref\xE9m de pagar an\xFAncios o tempo todo.
2. DESIGN QUE ENCANTA: Projetos desenhados para deixar os clientes fascinados e encantados \xE0 primeira vista (Master Site Engine 9.0), transmitindo autoridade imediata e distanciando totalmente de amadores.
3. A DOBRADINHA IMBAT\xCDVEL (Google Meu Neg\xF3cio + Site Completo): O Google Meu Neg\xF3cio atrai a demanda de busca local no Google Maps ("perto de mim"). O site encanta com autoridade e fecha o contrato com bot\xE3o de WhatsApp. Ter s\xF3 o GMN perde 65% das vendas porque o cliente busca o site para checar credibilidade antes de ligar. Ter s\xF3 o site sem GMN perde toda a busca geolocalizada da cidade. Juntos, dominam tudo!
4. CONVERS\xC3O DIRETA PARA WHATSAPP: Bot\xF5es e CTAs posicionados estrategicamente para transformar visitantes em dinheiro no caixa.

Dados do Prospecto:
- Nome do Cliente: ${request.clientName}
- Empresa: ${request.companyName}
- Nicho: ${request.niche}
- Solu\xE7\xE3o Alvo: ${request.targetSolution}
- Cidade/Regi\xE3o: ${request.cityOrRegion || "N\xE3o informada"}
- Situa\xE7\xE3o Atual: ${request.currentStatus || "Geral"}
- Tom de Voz: ${request.tone || "Consultivo e Persuasivo"}
- Detalhes Extras: ${request.extraDetails || "Nenhum"}

Gere um JSON com o esquema exato:
{
  "clientName": "${request.clientName}",
  "companyName": "${request.companyName}",
  "niche": "${request.niche}",
  "targetSolution": "${request.targetSolution}",
  "generatedAt": "${(/* @__PURE__ */ new Date()).toISOString()}",
  "headline": "Chamada principal impactante",
  "summaryExecutive": "Resumo de 2 a 3 frases da estrat\xE9gia de abordagem",
  "pitchWhatsApp": "Script completo, persuasivo e irresist\xEDvel para enviar no WhatsApp, com emojis adequados e pergunta de fechamento",
  "pitchAudioScript": "Roteiro falado natural para \xE1udio de 45 a 60 segundos no WhatsApp",
  "pitchEmailOrProposal": "Proposta executiva por e-mail com estrutura de alto padr\xE3o",
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
      "title": "A Dobradinha Imbat\xEDvel: Google Meu Neg\xF3cio + Site",
      "headline": "...",
      "explanation": "...",
      "whyItMatters": "..."
    },
    {
      "id": "conversao_whatsapp",
      "title": "Convers\xE3o M\xE1xima para WhatsApp",
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
      "objection": "J\xE1 tenho Instagram",
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
      "objection": "Tenho quem fa\xE7a por R$ 300",
      "trigger": "...",
      "counterAngle": "...",
      "scriptSnippet": "..."
    },
    {
      "id": "prev_4",
      "objection": "O Google Meu Neg\xF3cio j\xE1 me basta",
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
  return generateJsonWithGemini(prompt, "Sales Pitch AI");
}
async function solveObjectionWithGemini(request) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 um mestre em negocia\xE7\xE3o e fechamento de vendas de sites, landing pages e Google Meu Neg\xF3cio.
Um potencial cliente respondeu ao desenvolvedor/vendedor a seguinte obje\xE7\xE3o ou hesita\xE7\xE3o:
"""
${request.clientResponse}
"""

Contexto do cliente:
- Nome: ${request.clientName || "Cliente"}
- Empresa: ${request.companyName || "Empresa"}
- Nicho: ${request.niche || "Geral"}
- Solu\xE7\xE3o Ofertada: ${request.targetSolution || "Combo Site + Google Meu Neg\xF3cio"}

Diferenciais da nossa oferta para usar como argumento:
1. SEO Nota 100 no Google (ranqueamento org\xE2nico real, sem ficar ref\xE9m de pagar an\xFAncios para sempre).
2. Design encantador de alto luxo (Master Site Engine 9.0) que passa credibilidade instant\xE2nea.
3. Sinergia Google Meu Neg\xF3cio + Site: atrai no Maps e fecha no site via WhatsApp.
4. Matem\xE1tica de ROI: 1 ou 2 clientes a mais no m\xEAs pagam 100% do projeto.
5. O custo de n\xE3o fazer: perder clientes todos os dias para os concorrentes que est\xE3o no topo do Google.

Crie a resposta mais eficaz poss\xEDvel para que o cliente feche a compra do site ou landing page.
Retorne um JSON com o esquema:
{
  "detectedCategory": "Nome da obje\xE7\xE3o detectada",
  "categoryBadge": "TAG CURTA (ex: PRE\xC7O / ROI, INSTAGRAM VS GOOGLE, SOBRINHO / AMADOR)",
  "psychologyInsight": "Explica\xE7\xE3o psicol\xF3gica da real trava do cliente e como desarm\xE1-la",
  "whatsappReply": "Texto pronto e perfeito para mandar no WhatsApp, com formata\xE7\xE3o rica e pergunta de fechamento",
  "audioScript": "Roteiro falado natural para enviar como \xE1udio de WhatsApp de 35 a 50 segundos",
  "roiArgument": "Demonstra\xE7\xE3o matem\xE1tica r\xE1pida e irrefut\xE1vel do retorno sobre investimento",
  "urgencyCloser": "Gatilho de urg\xEAncia irresist\xEDvel ou b\xF4nus de a\xE7\xE3o r\xE1pida (ex: otimiza\xE7\xE3o do Google Meu Neg\xF3cio inclusa)",
  "followUpPlan": "O que fazer caso ele n\xE3o responda nas pr\xF3ximas 24 horas"
}
`;
  return generateJsonWithGemini(prompt, "Objection Solver AI");
}

// src/server/authStore.ts
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
var CURRENT_AUTH_EPOCH = "reset_2026_exclusive_v1";
var AUTHORIZED_OWNER_EMAIL = "pclc36@gmail.com";
var WORKSPACE_DATA_DIR = path.resolve(process.cwd(), ".data");
var WORKSPACE_ADMIN_FILE = path.join(WORKSPACE_DATA_DIR, "admin_account.json");
var HOME_DATA_DIR = path.join(os.homedir(), ".master-site-prompt-studio");
var HOME_ADMIN_FILE = path.join(HOME_DATA_DIR, "admin_account.json");
function resolveRuntimeDir() {
  try {
    if (!fs.existsSync(HOME_DATA_DIR)) {
      fs.mkdirSync(HOME_DATA_DIR, { recursive: true });
    }
    fs.accessSync(HOME_DATA_DIR, fs.constants.W_OK);
    return HOME_DATA_DIR;
  } catch {
    try {
      if (!fs.existsSync(WORKSPACE_DATA_DIR)) {
        fs.mkdirSync(WORKSPACE_DATA_DIR, { recursive: true });
      }
      return WORKSPACE_DATA_DIR;
    } catch {
      return WORKSPACE_DATA_DIR;
    }
  }
}
var RUNTIME_DIR = resolveRuntimeDir();
var SESSIONS_FILE = path.join(RUNTIME_DIR, "sessions.json");
var RESET_MARKER_FILE = path.join(RUNTIME_DIR, "reset_marker.json");
function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
  }
}
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
}
function maskEmail(email) {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const [userPart, domainPart] = parts;
  const maskedUser = userPart.length > 3 ? `${userPart[0]}${"*".repeat(Math.min(userPart.length - 2, 6))}${userPart[userPart.length - 1]}` : `${userPart[0] || "*"}***`;
  return `${maskedUser}@${domainPart}`;
}
function safeUnlink(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
  }
}
function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeJsonAtomic(filePath, data) {
  ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp.${process.pid}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempPath, filePath);
}
function getTimestamp(admin) {
  const ts = Date.parse(admin.updatedAt || admin.createdAt || "");
  return Number.isFinite(ts) ? ts : 0;
}
function isValidCurrentEpochAdmin(data) {
  return Boolean(
    data && data.email && data.passwordHash && data.salt && data.authEpoch === CURRENT_AUTH_EPOCH && data.email.trim().toLowerCase() === AUTHORIZED_OWNER_EMAIL
  );
}
function stripSessions(admin) {
  const { activeSessions: _ignored, ...rest } = admin;
  return rest;
}
function readSessions(fallbackAdmin) {
  const now = Date.now();
  const stored = readJsonSafe(SESSIONS_FILE);
  if (Array.isArray(stored)) {
    return stored.filter((s) => s && s.token && s.expiresAt > now);
  }
  if (fallbackAdmin && Array.isArray(fallbackAdmin.activeSessions)) {
    const migrated = fallbackAdmin.activeSessions.filter((s) => s && s.token && s.expiresAt > now);
    if (migrated.length > 0) {
      try {
        writeJsonAtomic(SESSIONS_FILE, migrated);
      } catch {
      }
    }
    return migrated;
  }
  return [];
}
function writeSessions(sessions) {
  const now = Date.now();
  const clean = sessions.filter((s) => s && s.token && s.expiresAt > now).slice(-25);
  writeJsonAtomic(SESSIONS_FILE, clean);
}
function readAdminRecord() {
  const resetMarker = readJsonSafe(RESET_MARKER_FILE);
  const resetAt = resetMarker?.resetAt || 0;
  const homeRaw = readJsonSafe(HOME_ADMIN_FILE);
  const workspaceRaw = readJsonSafe(WORKSPACE_ADMIN_FILE);
  const homeValid = isValidCurrentEpochAdmin(homeRaw) && getTimestamp(homeRaw) >= resetAt ? homeRaw : null;
  const workspaceValid = isValidCurrentEpochAdmin(workspaceRaw) && getTimestamp(workspaceRaw) >= resetAt ? workspaceRaw : null;
  if (homeRaw && !isValidCurrentEpochAdmin(homeRaw)) {
    safeUnlink(HOME_ADMIN_FILE);
  }
  if (workspaceRaw && !isValidCurrentEpochAdmin(workspaceRaw)) {
    safeUnlink(WORKSPACE_ADMIN_FILE);
  }
  let chosen = null;
  if (homeValid && workspaceValid) {
    chosen = getTimestamp(homeValid) >= getTimestamp(workspaceValid) ? homeValid : workspaceValid;
  } else {
    chosen = homeValid || workspaceValid;
  }
  if (!chosen) return null;
  const sanitized = stripSessions(chosen);
  try {
    if (!homeValid || getTimestamp(chosen) > getTimestamp(homeValid)) {
      writeJsonAtomic(HOME_ADMIN_FILE, sanitized);
    }
  } catch {
  }
  try {
    if (!workspaceValid || getTimestamp(chosen) > getTimestamp(workspaceValid)) {
      writeJsonAtomic(WORKSPACE_ADMIN_FILE, sanitized);
    }
  } catch {
  }
  if (Array.isArray(chosen.activeSessions) && chosen.activeSessions.length > 0) {
    readSessions(chosen);
  }
  return chosen;
}
function writeAdminRecord(admin) {
  const sanitized = stripSessions({
    ...admin,
    updatedAt: admin.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
  });
  safeUnlink(RESET_MARKER_FILE);
  let wroteAnywhere = false;
  try {
    writeJsonAtomic(HOME_ADMIN_FILE, sanitized);
    wroteAnywhere = true;
  } catch {
  }
  try {
    writeJsonAtomic(WORKSPACE_ADMIN_FILE, sanitized);
    wroteAnywhere = true;
  } catch {
  }
  if (!wroteAnywhere) {
    throw new Error("N\xE3o foi poss\xEDvel gravar o arquivo de credenciais no servidor.");
  }
}
var serverAuthStore = {
  async hasAdmin() {
    return Boolean(readAdminRecord());
  },
  async getAdminPublicStatus() {
    const admin = readAdminRecord();
    if (!admin) {
      return {
        hasAdmin: false,
        maskedEmail: null,
        adminName: null,
        createdAt: null,
        authEpoch: CURRENT_AUTH_EPOCH,
        exclusiveOwnerOnly: true
      };
    }
    return {
      hasAdmin: true,
      maskedEmail: maskEmail(admin.email),
      adminName: admin.name,
      createdAt: admin.createdAt,
      authEpoch: CURRENT_AUTH_EPOCH,
      exclusiveOwnerOnly: true
    };
  },
  async resetAdmin(params) {
    const admin = readAdminRecord();
    if (!admin) {
      safeUnlink(HOME_ADMIN_FILE);
      safeUnlink(WORKSPACE_ADMIN_FILE);
      safeUnlink(SESSIONS_FILE);
      return {
        success: true,
        message: "Sistema pronto para o cadastro exclusivo do propriet\xE1rio."
      };
    }
    const token = params?.token?.trim();
    const currentPassword = params?.currentPassword?.trim();
    const sessions = readSessions(admin);
    const hasValidToken = Boolean(token && sessions.some((s) => s.token === token));
    const hasValidPassword = Boolean(
      currentPassword && hashPassword(currentPassword, admin.salt) === admin.passwordHash
    );
    if (!hasValidToken || currentPassword !== void 0 && !hasValidPassword) {
      return {
        success: false,
        unauthorized: true,
        message: "Autentica\xE7\xE3o inv\xE1lida para resetar o administrador. Informe sua senha atual corretamente."
      };
    }
    try {
      safeUnlink(HOME_ADMIN_FILE);
      safeUnlink(WORKSPACE_ADMIN_FILE);
      safeUnlink(SESSIONS_FILE);
      writeJsonAtomic(RESET_MARKER_FILE, { resetAt: Date.now() });
      return {
        success: true,
        message: "Cadastro de administrador resetado com sucesso. Voc\xEA pode cadastrar sua nova senha exclusiva agora."
      };
    } catch (err) {
      return { success: false, message: `Erro ao resetar administrador: ${err.message}` };
    }
  },
  async registerMasterAdmin(data) {
    if (await this.hasAdmin()) {
      return {
        success: false,
        message: "O Administrador exclusivo j\xE1 est\xE1 cadastrado. Novos cadastros est\xE3o bloqueados em todos os aparelhos."
      };
    }
    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPass = data.password?.trim();
    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, message: "Todos os campos s\xE3o obrigat\xF3rios." };
    }
    if (cleanEmail !== AUTHORIZED_OWNER_EMAIL) {
      return {
        success: false,
        message: "Acesso negado: este aplicativo \xE9 de uso exclusivo do propriet\xE1rio autorizado."
      };
    }
    if (cleanPass.length < 6) {
      return { success: false, message: "A senha deve conter no m\xEDnimo 6 caracteres." };
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(cleanPass, salt);
    const sessionToken = `admin_sess_${crypto.randomBytes(32).toString("hex")}`;
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1e3;
    const admin = {
      id: `admin_master_${now}`,
      name: cleanName,
      email: cleanEmail,
      role: "super_admin",
      authEpoch: CURRENT_AUTH_EPOCH,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastLogin: nowIso,
      passwordHash,
      salt,
      recoveryEmail: cleanEmail
    };
    try {
      writeAdminRecord(admin);
      writeSessions([{ token: sessionToken, createdAt: now, expiresAt }]);
      return {
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        token: sessionToken
      };
    } catch (err) {
      return { success: false, message: `Falha ao salvar administrador no servidor: ${err.message}` };
    }
  },
  async login(email, password) {
    const admin = readAdminRecord();
    if (!admin) {
      return { success: false, message: "Nenhum administrador cadastrado no sistema." };
    }
    try {
      const cleanEmail = email?.trim().toLowerCase();
      if (admin.email.toLowerCase() !== cleanEmail) {
        return { success: false, message: "E-mail de administrador n\xE3o confere." };
      }
      const inputHash = hashPassword(password?.trim() || "", admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: "Senha incorreta." };
      }
      const sessionToken = `admin_sess_${crypto.randomBytes(32).toString("hex")}`;
      const now = Date.now();
      const expiresAt = now + 30 * 24 * 60 * 60 * 1e3;
      const sessions = readSessions(admin);
      writeSessions([...sessions, { token: sessionToken, createdAt: now, expiresAt }]);
      return {
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        },
        token: sessionToken
      };
    } catch (err) {
      return { success: false, message: `Erro ao autenticar: ${err.message}` };
    }
  },
  async validateSession(token) {
    if (!token) return { valid: false };
    const admin = readAdminRecord();
    if (!admin) return { valid: false };
    const sessions = readSessions(admin);
    const active = sessions.find((s) => s.token === token);
    if (!active) return { valid: false };
    return {
      valid: true,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    };
  },
  async logout(token) {
    const admin = readAdminRecord();
    if (!admin) return;
    try {
      const sessions = readSessions(admin).filter((s) => s.token !== token);
      writeSessions(sessions);
    } catch {
    }
  },
  async changePassword(token, currentPassword, newPassword) {
    const admin = readAdminRecord();
    if (!admin) {
      return { success: false, message: "Administrador n\xE3o cadastrado." };
    }
    try {
      const sessions = readSessions(admin);
      const sess = sessions.find((s) => s.token === token);
      if (!sess) {
        return { success: false, message: "Sess\xE3o inv\xE1lida ou expirada. Fa\xE7a login novamente." };
      }
      const inputHash = hashPassword(currentPassword?.trim() || "", admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: "Senha atual incorreta." };
      }
      const cleanNew = newPassword?.trim() || "";
      if (cleanNew.length < 6) {
        return { success: false, message: "A nova senha deve ter no m\xEDnimo 6 caracteres." };
      }
      const newSalt = crypto.randomBytes(16).toString("hex");
      admin.passwordHash = hashPassword(cleanNew, newSalt);
      admin.salt = newSalt;
      admin.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      writeAdminRecord(admin);
      writeSessions([sess]);
      return {
        success: true,
        message: "Senha atualizada com sucesso! Todos os novos acessos em qualquer aparelho usar\xE3o esta nova senha."
      };
    } catch (err) {
      return { success: false, message: `Falha ao alterar senha: ${err.message}` };
    }
  }
};

// src/server/pageSpeedService.ts
function normalizeUrl(url) {
  let clean = url.trim();
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://${clean}`;
  }
  return clean;
}
async function analyzeWebpageLive(url, strategy) {
  const startTime = Date.now();
  let ttfbMs = 350;
  let html = "";
  let contentLength = 0;
  let isHttps = url.startsWith("https://");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9e3);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": strategy === "mobile" ? "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br"
      }
    });
    clearTimeout(timeout);
    ttfbMs = Date.now() - startTime;
    html = await res.text();
    contentLength = Buffer.byteLength(html, "utf8");
  } catch {
    ttfbMs = 850;
  }
  const hasViewport = /<meta\s+name=["']viewport["']/i.test(html);
  const scriptTags = (html.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi) || []).length;
  const stylesheetTags = (html.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi) || []).length;
  const imageTags = html.match(/<img\b[^>]*>/gi) || [];
  const imagesWithoutDimensions = imageTags.filter((img) => !img.includes("width=") || !img.includes("height=")).length;
  const imagesWithWebp = imageTags.filter((img) => img.includes(".webp") || img.includes(".avif")).length;
  const imagesWithLegacyFormat = imageTags.length - imagesWithWebp;
  const hasLazyLoading = /loading=["']lazy["']/i.test(html);
  const hasPreconnect = /rel=["']preconnect["']/i.test(html);
  const hasGTMorAnalytics = /(gtag|google-analytics|gtm\.js|googletagmanager)/i.test(html);
  let score = 98;
  if (ttfbMs > 1200) score -= 22;
  else if (ttfbMs > 800) score -= 14;
  else if (ttfbMs > 500) score -= 8;
  else if (ttfbMs > 300) score -= 3;
  const htmlKB = Math.round(contentLength / 1024);
  if (htmlKB > 150) score -= 12;
  else if (htmlKB > 80) score -= 6;
  if (scriptTags > 25) score -= 18;
  else if (scriptTags > 15) score -= 10;
  else if (scriptTags > 8) score -= 5;
  if (stylesheetTags > 6) score -= 8;
  if (imagesWithLegacyFormat > 6) score -= 12;
  else if (imagesWithLegacyFormat > 2) score -= 6;
  if (imagesWithoutDimensions > 3) score -= 9;
  if (strategy === "mobile") {
    score -= 6;
    if (!hasViewport) score -= 25;
  }
  if (hasLazyLoading) score += 3;
  if (hasPreconnect) score += 2;
  if (isHttps) score += 2;
  score = Math.max(18, Math.min(99, Math.round(score)));
  const scoreDecimal = Number((score / 10).toFixed(1));
  const isAbove95 = score >= 95;
  const lcpValueSec = Number((0.9 + (100 - score) * 0.04).toFixed(2));
  const fcpValueSec = Number((0.6 + (100 - score) * 0.02).toFixed(2));
  const clsValue = Number((imagesWithoutDimensions > 0 ? 0.01 + imagesWithoutDimensions * 0.03 : 0.02).toFixed(3));
  const inpMs = Math.round(40 + scriptTags * 8 + (strategy === "mobile" ? 30 : 0));
  const speedIndexSec = Number((lcpValueSec * 1.15).toFixed(2));
  const diagnostics = [];
  const opportunities = [];
  if (ttfbMs > 400) {
    diagnostics.push(`Tempo de resposta inicial do servidor (TTFB) de ${ttfbMs}ms. O ideal para nota > 9.5 \xE9 abaixo de 300ms.`);
    opportunities.push({
      title: "Reduzir tempo de resposta inicial do servidor (TTFB)",
      description: "Implementar cache de borda (Cloudflare / Hostinger Caching) ou migrar para arquivos est\xE1ticos pr\xE9-renderizados.",
      savingsMs: ttfbMs - 250,
      impact: "high"
    });
  }
  if (imagesWithLegacyFormat > 0) {
    diagnostics.push(`${imagesWithLegacyFormat} imagem(ns) detectada(s) em formatos legados (JPEG/PNG). Converta para WebP ou AVIF.`);
    opportunities.push({
      title: "Fornecer imagens em formatos modernos (WebP/AVIF)",
      description: "Use o m\xF3dulo Otimizador de M\xEDdia do est\xFAdio para reduzir em at\xE9 85% o peso das imagens mantendo transpar\xEAncia.",
      savingsKB: imagesWithLegacyFormat * 180,
      impact: "high"
    });
  }
  if (imagesWithoutDimensions > 0) {
    diagnostics.push(`${imagesWithoutDimensions} imagem(ns) sem atributos expl\xEDcitos de "width" e "height", causando instabilidade visual (CLS).`);
    opportunities.push({
      title: "Definir dimens\xF5es expl\xEDcitas de largura e altura",
      description: "Definir width e height diretamente nas tags <img> reserva o espa\xE7o antes do carregamento e elimina o CLS.",
      impact: "medium"
    });
  }
  if (scriptTags > 10) {
    diagnostics.push(`${scriptTags} scripts JavaScript encontrados. O excesso de JS bloqueia a renderiza\xE7\xE3o e prejudica a nota no celular.`);
    opportunities.push({
      title: "Eliminar recursos que bloqueiam a renderiza\xE7\xE3o",
      description: 'Adicionar atributos "defer" ou "async" e migrar para arquitetura Astro-First com Zero JS sup\xE9rfluo.',
      savingsMs: scriptTags * 40,
      impact: "high"
    });
  }
  if (!hasLazyLoading && imageTags.length > 3) {
    diagnostics.push('Imagens abaixo da primeira dobra sem carregamento postergado (loading="lazy").');
    opportunities.push({
      title: "Adiar carregamento de imagens fora da tela",
      description: 'Adicionar loading="lazy" nas imagens que n\xE3o est\xE3o vis\xEDveis na primeira dobra.',
      savingsKB: 320,
      impact: "medium"
    });
  }
  return {
    score,
    scoreDecimal,
    isAbove95,
    gradeLabel: score >= 95 ? "Excelente (Acima de 9.5)" : score >= 85 ? "Muito Bom" : score >= 65 ? "Regular (< 9.5)" : "Cr\xEDtico (< 6.5)",
    categories: {
      performance: score,
      accessibility: Math.min(100, score + 4),
      bestPractices: Math.min(100, score + 3),
      seo: Math.min(100, score + 5)
    },
    coreWebVitals: {
      lcp: {
        title: "Largest Contentful Paint (LCP)",
        value: `${lcpValueSec} s`,
        displayValue: `${lcpValueSec} s`,
        numericValue: lcpValueSec,
        status: lcpValueSec <= 1.8 ? "good" : lcpValueSec <= 2.5 ? "needs_improvement" : "poor",
        benchmark: "Meta: < 1.8 s (Nota > 9.5)",
        description: "Mede a velocidade em que o bloco de conte\xFAdo principal da p\xE1gina \xE9 renderizado na tela."
      },
      cls: {
        title: "Cumulative Layout Shift (CLS)",
        value: `${clsValue}`,
        displayValue: `${clsValue}`,
        numericValue: clsValue,
        status: clsValue <= 0.05 ? "good" : clsValue <= 0.1 ? "needs_improvement" : "poor",
        benchmark: "Meta: < 0.05 (Sem pulos de layout)",
        description: "Mede a estabilidade visual de elementos enquanto a p\xE1gina \xE9 carregada."
      },
      inp: {
        title: "Interaction to Next Paint (INP)",
        value: `${inpMs} ms`,
        displayValue: `${inpMs} ms`,
        numericValue: inpMs,
        status: inpMs <= 100 ? "good" : inpMs <= 200 ? "needs_improvement" : "poor",
        benchmark: "Meta: < 100 ms",
        description: "Mede a responsividade da interface quando o usu\xE1rio clica ou interage com bot\xF5es."
      },
      fcp: {
        title: "First Contentful Paint (FCP)",
        value: `${fcpValueSec} s`,
        displayValue: `${fcpValueSec} s`,
        numericValue: fcpValueSec,
        status: fcpValueSec <= 1 ? "good" : fcpValueSec <= 1.8 ? "needs_improvement" : "poor",
        benchmark: "Meta: < 1.0 s",
        description: "Mede o tempo at\xE9 o primeiro texto ou imagem se tornar vis\xEDvel ao visitante."
      },
      ttfb: {
        title: "Time to First Byte (TTFB)",
        value: `${ttfbMs} ms`,
        displayValue: `${ttfbMs} ms`,
        numericValue: ttfbMs,
        status: ttfbMs <= 300 ? "good" : ttfbMs <= 800 ? "needs_improvement" : "poor",
        benchmark: "Meta: < 300 ms na Hostinger",
        description: "Tempo at\xE9 o navegador receber o primeiro byte de dados da hospedagem."
      },
      speedIndex: {
        title: "Speed Index",
        value: `${speedIndexSec} s`,
        displayValue: `${speedIndexSec} s`,
        numericValue: speedIndexSec,
        status: speedIndexSec <= 2 ? "good" : speedIndexSec <= 3.4 ? "needs_improvement" : "poor",
        benchmark: "Meta: < 2.0 s",
        description: "Mede com que rapidez o conte\xFAdo da p\xE1gina \xE9 visualmente preenchido."
      }
    },
    diagnostics,
    opportunities
  };
}
async function runPageSpeedAnalysis(rawUrl, strategy = "mobile") {
  const url = normalizeUrl(rawUrl);
  const officialPageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
  const analyzedAt = (/* @__PURE__ */ new Date()).toISOString();
  const rawKey = (process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  const isPlaceholder = !rawKey || rawKey === "MY_GEMINI_API_KEY" || rawKey === "YOUR_API_KEY" || rawKey.startsWith("MY_") || rawKey.includes("PLACEHOLDER");
  const apiKey = isPlaceholder ? "" : rawKey;
  if (apiKey) {
    try {
      const googleApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(googleApiUrl, {
        headers: { "Accept": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        const lighthouse = data?.lighthouseResult;
        if (lighthouse) {
          const perfScore = Math.round((lighthouse.categories?.performance?.score || 0) * 100);
          const accessScore = Math.round((lighthouse.categories?.accessibility?.score || 0) * 100);
          const bpScore = Math.round((lighthouse.categories?.["best-practices"]?.score || 0) * 100);
          const seoScore = Math.round((lighthouse.categories?.seo?.score || 0) * 100);
          const audits = lighthouse.audits || {};
          const fcpVal = audits["first-contentful-paint"]?.displayValue || "1.1 s";
          const lcpVal = audits["largest-contentful-paint"]?.displayValue || "1.6 s";
          const clsVal = audits["cumulative-layout-shift"]?.displayValue || "0.01";
          const tbtVal = audits["total-blocking-time"]?.displayValue || "40 ms";
          const speedIndexVal = audits["speed-index"]?.displayValue || "1.5 s";
          const ttfbVal = audits["server-response-time"]?.displayValue || "280 ms";
          const scoreDecimal = Number((perfScore / 10).toFixed(1));
          return {
            url,
            strategy,
            analyzedAt,
            score: perfScore,
            scoreDecimal,
            isAbove95: perfScore >= 95,
            gradeLabel: perfScore >= 95 ? "Excelente (Acima de 9.5)" : perfScore >= 85 ? "Muito Bom" : perfScore >= 65 ? "Regular (< 9.5)" : "Cr\xEDtico (< 6.5)",
            categories: {
              performance: perfScore,
              accessibility: accessScore,
              bestPractices: bpScore,
              seo: seoScore
            },
            coreWebVitals: {
              fcp: {
                title: "First Contentful Paint (FCP)",
                value: fcpVal,
                displayValue: fcpVal,
                numericValue: parseFloat(fcpVal) || 1.1,
                status: parseFloat(fcpVal) <= 1 ? "good" : "needs_improvement",
                benchmark: "Meta: < 1.0 s",
                description: "Tempo at\xE9 a primeira renderiza\xE7\xE3o visual."
              },
              lcp: {
                title: "Largest Contentful Paint (LCP)",
                value: lcpVal,
                displayValue: lcpVal,
                numericValue: parseFloat(lcpVal) || 1.6,
                status: parseFloat(lcpVal) <= 1.8 ? "good" : "needs_improvement",
                benchmark: "Meta: < 1.8 s (Nota > 9.5)",
                description: "Carregamento do bloco principal de conte\xFAdo."
              },
              cls: {
                title: "Cumulative Layout Shift (CLS)",
                value: clsVal,
                displayValue: clsVal,
                numericValue: parseFloat(clsVal) || 0.01,
                status: parseFloat(clsVal) <= 0.05 ? "good" : "needs_improvement",
                benchmark: "Meta: < 0.05",
                description: "Estabilidade visual sem pulos de layout."
              },
              inp: {
                title: "Interaction / TBT",
                value: tbtVal,
                displayValue: tbtVal,
                numericValue: parseFloat(tbtVal) || 40,
                status: parseFloat(tbtVal) <= 100 ? "good" : "needs_improvement",
                benchmark: "Meta: < 100 ms",
                description: "Tempo de bloqueio e capacidade de resposta aos cliques."
              },
              ttfb: {
                title: "Time to First Byte (TTFB)",
                value: ttfbVal,
                displayValue: ttfbVal,
                numericValue: parseFloat(ttfbVal) || 280,
                status: parseFloat(ttfbVal) <= 300 ? "good" : "needs_improvement",
                benchmark: "Meta: < 300 ms",
                description: "Resposta do servidor e hospedagem."
              },
              speedIndex: {
                title: "Speed Index",
                value: speedIndexVal,
                displayValue: speedIndexVal,
                numericValue: parseFloat(speedIndexVal) || 1.5,
                status: parseFloat(speedIndexVal) <= 2 ? "good" : "needs_improvement",
                benchmark: "Meta: < 2.0 s",
                description: "Preenchimento visual dos elementos."
              }
            },
            diagnostics: [
              "Dados oficiais obtidos diretamente da API do Google PageSpeed Insights v5.",
              perfScore >= 95 ? "Parab\xE9ns! O site cumpre o padr\xE3o supremo de velocidade (Nota superior a 9.5)." : "Aten\xE7\xE3o: A nota est\xE1 abaixo de 9.5. Otimize imagens em WebP e reduza scripts JS para evitar perda de convers\xF5es."
            ],
            opportunities: [
              {
                title: "Compress\xE3o WebP e remo\xE7\xE3o de JS sup\xE9rfluo",
                description: "Utilize o m\xF3dulo Otimizador de M\xEDdia para garantir pontua\xE7\xE3o 9.5+ permanente.",
                impact: "high"
              }
            ],
            officialPageSpeedUrl,
            source: "google_api"
          };
        }
      }
    } catch (err) {
      console.warn("[PageSpeed Service] Google API direta falhou ou sem cota, usando motor heur\xEDstico ao vivo:", err?.message?.slice(0, 80));
    }
  }
  const liveAnalysis = await analyzeWebpageLive(url, strategy);
  return {
    url,
    strategy,
    analyzedAt,
    score: liveAnalysis.score || 88,
    scoreDecimal: liveAnalysis.scoreDecimal || 8.8,
    isAbove95: liveAnalysis.isAbove95 || false,
    gradeLabel: liveAnalysis.gradeLabel || "Regular",
    categories: liveAnalysis.categories || {
      performance: 88,
      accessibility: 92,
      bestPractices: 90,
      seo: 92
    },
    coreWebVitals: liveAnalysis.coreWebVitals,
    diagnostics: liveAnalysis.diagnostics || [],
    opportunities: liveAnalysis.opportunities || [],
    officialPageSpeedUrl,
    source: "live_diagnostic_engine"
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var port = process.env.PORT || 3e3;
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (req, res) => {
  const health = checkServerHealth();
  res.json(health);
});
app.post("/api/analyze", async (req, res) => {
  try {
    const { questionnaire, projectName, clientName, projectType, additionalNotes } = req.body;
    const geminiResult = await analyzeWithGemini(
      questionnaire,
      projectName,
      clientName,
      projectType,
      additionalNotes
    );
    if (geminiResult) {
      return res.json({ success: true, data: geminiResult, source: "gemini" });
    } else {
      return res.json({ success: false, source: "heuristic", message: "API key not configured or fallback required" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/gbp/analyze-questionnaire", async (req, res) => {
  try {
    const { rawText } = req.body;
    const result = await analyzeGbpQuestionnaireWithGemini(rawText || "");
    if (result) {
      return res.json({ success: true, data: result, source: "gemini" });
    }
    return res.json({ success: false, source: "heuristic", message: "Fallback to heuristic generator" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/gbp/generate-dossier", async (req, res) => {
  try {
    const { questionnaire } = req.body;
    const result = await generateGbpDossierWithGemini(questionnaire);
    if (result) {
      return res.json({ success: true, data: result, source: "gemini" });
    }
    return res.json({ success: false, source: "heuristic", message: "Fallback to heuristic generator" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/gbp/audit-profile", async (req, res) => {
  try {
    const { auditRequest } = req.body;
    const result = await auditGbpProfileWithGemini(auditRequest);
    if (result) {
      return res.json({ success: true, data: result, source: "gemini" });
    }
    return res.json({ success: false, source: "heuristic", message: "Fallback to heuristic auditor" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/audit-site", async (req, res) => {
  try {
    const { url, niche, targetObjective } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL do site \xE9 obrigat\xF3ria." });
    }
    const scrapedData = await scrapeSiteHtmlPreview(url);
    const geminiReport = await auditSiteWithGemini({ url, niche, targetObjective }, scrapedData);
    if (geminiReport) {
      return res.json({ success: true, report: geminiReport, scrapedData, source: "gemini" });
    } else {
      return res.json({
        success: false,
        scrapedData,
        source: "heuristic",
        message: "Fallback to client heuristic engine with live scraped data"
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/pagespeed/analyze", async (req, res) => {
  try {
    const rawUrl = req.query.url || "";
    const strategy = req.query.strategy === "desktop" ? "desktop" : "mobile";
    if (!rawUrl) {
      return res.status(400).json({ success: false, error: "URL \xE9 obrigat\xF3ria para an\xE1lise de PageSpeed." });
    }
    const result = await runPageSpeedAnalysis(rawUrl, strategy);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/pagespeed/analyze", async (req, res) => {
  try {
    const { url, strategy } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL \xE9 obrigat\xF3ria para an\xE1lise de PageSpeed." });
    }
    const strat = strategy === "desktop" ? "desktop" : "mobile";
    const result = await runPageSpeedAnalysis(url, strat);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/sales/generate-pitch", async (req, res) => {
  try {
    const result = await generatePitchWithGemini(req.body);
    if (result) {
      return res.json({ success: true, data: result, source: "gemini" });
    }
    return res.json({ success: false, source: "heuristic", message: "Fallback to heuristic generator" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/sales/solve-objection", async (req, res) => {
  try {
    const result = await solveObjectionWithGemini(req.body);
    if (result) {
      return res.json({ success: true, data: result, source: "gemini" });
    }
    return res.json({ success: false, source: "heuristic", message: "Fallback to heuristic solver" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/auth/status", async (req, res) => {
  try {
    const status = await serverAuthStore.getAdminPublicStatus();
    return res.json(status);
  } catch (err) {
    return res.status(500).json({ hasAdmin: false, error: err.message });
  }
});
app.post("/api/auth/register-master", async (req, res) => {
  try {
    const result = await serverAuthStore.registerMasterAdmin(req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await serverAuthStore.login(email, password);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/verify-session", async (req, res) => {
  try {
    const { token } = req.body;
    const result = await serverAuthStore.validateSession(token);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ valid: false, message: err.message });
  }
});
app.post("/api/auth/logout", async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await serverAuthStore.logout(token);
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;
    const result = await serverAuthStore.changePassword(token, currentPassword, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/reset-system-admin", async (req, res) => {
  try {
    const { token, currentPassword } = req.body || {};
    const result = await serverAuthStore.resetAdmin({ token, currentPassword });
    return res.status(result.unauthorized ? 401 : 200).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
var distPath = path2.join(__dirname, "dist");
if (fs2.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path2.join(distPath, "index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.status(200).send("Master Site Prompt Studio Server is running. Frontend build files are generating...");
  });
}
app.listen(port, () => {
  console.log(`Master Site Prompt Studio server listening on port ${port}`);
});
