// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// src/server/api.ts
import { GoogleGenAI } from "@google/genai";
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
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
function checkServerHealth() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return {
    status: "ok",
    hasKey,
    activeModel: "gemini-3.8-flash",
    engine: hasKey ? "Gemini 3.8 Flash + Heur\xEDstico Resiliente" : "Motor Heur\xEDstico Determin\xEDstico (Offline Ready)"
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
- missingFields (array de strings com o que faltou de essencial)
- contradictions (array de strings com poss\xEDveis contradi\xE7\xF5es encontradas)

QUESTION\xC1RIO:
${questionnaire}

OBSERVA\xC7\xD5ES ADICIONAIS:
${additionalNotes || "Nenhuma"}
`;
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`Tentativa com modelo ${modelName} falhou: ${err.message?.slice(0, 80)}. Tentando pr\xF3ximo...`);
    }
  }
  return null;
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
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`[GBP AI] Tentativa com modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }
  return null;
}
async function generateGbpDossierWithGemini(data) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const prompt = `Voc\xEA \xE9 um Consultor Estrat\xE9gico Master em Google Business Profile (Perfil da Empresa no Google).
Gere um dossi\xEA completo, profissional e pronto para implanta\xE7\xE3o com base nos dados do cliente a seguir.
Respeite rigorosamente todas as diretrizes oficiais do Google:
1. NUNCA adicione palavras-chave promocionais ao nome da empresa (evitar suspens\xE3o).
2. A descri\xE7\xE3o oficial DEVE ter NO M\xC1XIMO 750 caracteres e capturar a aten\xE7\xE3o nos primeiros 250 caracteres (sem links, sem "clique aqui", sem superlativos falsos).
3. Recomende 1 Categoria Prim\xE1ria exata da taxonomia oficial do Google e at\xE9 4 categorias secund\xE1rias pertinentes.
4. Defina a estrat\xE9gia de endere\xE7o (F\xEDsico vs \xC1rea de Atendimento / SAB) e como realizar a verifica\xE7\xE3o sem problemas.
5. Desenvolva um cat\xE1logo de servi\xE7os/produtos claros com descri\xE7\xF5es persuasivas.
6. Crie checklist de fotos detalhado com especifica\xE7\xF5es t\xE9cnicas e nomes de arquivo otimizados para SEO Local (ex: nome-do-servico-bairro.jpg).
7. Forne\xE7a estrat\xE9gia \xE9tica de avalia\xE7\xF5es (sem compra de reviews) com 5 templates completos de resposta (5 estrelas, 4 estrelas com feedback, 3 estrelas neutro, 1-2 estrelas cr\xEDtico, e suspeita de fake/injusta).
8. Crie um calend\xE1rio de 30 dias de postagens com 6 a 8 posts detalhados (headline, corpo, bot\xE3o de CTA exato, orienta\xE7\xE3o visual).
9. Elabore FAQ localizado de 5 a 8 perguntas estrat\xE9gicas de alta inten\xE7\xE3o de busca local.
10. Checklist de compliance e plano de a\xE7\xE3o de 90 dias dividido em M\xEAs 1, M\xEAs 2 e M\xEAs 3.

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
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`[GBP Dossier AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }
  return null;
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
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`[GBP Audit AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }
  return null;
}
async function scrapeSiteHtmlPreview(targetUrl) {
  try {
    const fullUrl = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const resp = await fetch(fullUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const html = await resp.text();
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : null;
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']?([^"'>]*)["']?/gi)];
    const images = imgMatches.slice(0, 10).map((m, idx) => ({
      src: m[1],
      alt: m[2] || `Imagem ${idx + 1}`
    })).filter((img) => !img.src.includes("pixel") && !img.src.includes("analytics") && !img.src.endsWith(".svg"));
    const waMatches = html.match(/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)(\d+)/gi);
    const phoneMatches = html.match(/(?:\(?\d{2}\)?\s*)?(?:9\d{4}[-\s]?\d{4}|\d{4}[-\s]?\d{4})/g);
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    const cnpjMatches = html.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g);
    const instaMatches = html.match(/instagram\.com\/([a-zA-Z0-9._-]+)/i);
    const textSample = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3e3);
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
      textSample
    };
  } catch {
    return null;
  }
}
async function auditSiteWithGemini(request) {
  const ai = getGeminiClient();
  if (!ai) return null;
  const liveScrape = await scrapeSiteHtmlPreview(request.url);
  const prompt = `Voc\xEA \xE9 o World-Class Digital Experience Engine e Engenheiro Chefe em Auditoria de Sites e Landing Pages do Master Site Prompt Studio.
Sua base normativa OBRIGAT\xD3RIA E SUPREMA \xE9 o MASTER SITE PROMPT 7.0 \u2014 WORLD-CLASS DIGITAL EXPERIENCE ENGINE (Sistema Supremo de Cria\xE7\xE3o de Sites, Landing Pages, Experi\xEAncias Premium, SEO e Convers\xE3o com 56 Diretrizes Inegoci\xE1veis).

O usu\xE1rio forneceu a seguinte URL de site de cliente ou concorrente para auditoria completa e gera\xE7\xE3o de melhorias superiores:
URL: "${request.url}"
Nicho / Segmento: "${request.niche || "Auto-detectar pelo link e conte\xFAdo"}"
Objetivo: "${request.targetObjective || "Convers\xE3o de Leads e Agendamentos"}"

${liveScrape ? `DADOS RASTREADOS DIRETAMENTE DO SITE (AO VIVO):
- T\xEDtulo da P\xE1gina: ${liveScrape.title || "N/A"}
- Meta Descri\xE7\xE3o: ${liveScrape.description || "N/A"}
- Imagem OpenGraph (og:image): ${liveScrape.ogImage || "N/A"}
- Imagens Encontradas no HTML: ${JSON.stringify(liveScrape.images.slice(0, 5))}
- WhatsApp Detectado: ${liveScrape.whatsapp || "N/A"}
- Telefones: ${liveScrape.phones.join(", ") || "N/A"}
- E-mails: ${liveScrape.emails.join(", ") || "N/A"}
- CNPJ: ${liveScrape.cnpj || "N/A"}
- Instagram: ${liveScrape.instagram || "N/A"}
- Trecho de Texto Real da P\xE1gina: ${liveScrape.textSample.slice(0, 1200)}
` : ""}

EXECUTE A AUDITORIA E RETORNE UM JSON V\xC1LIDO contendo:
1. "domain": nome do dom\xEDnio limpo (ex: "clinicaodonto.com.br")
2. "primaryNicheDetected": nicho identificado
3. "overallScore": n\xFAmero de 0 a 100 avaliando a conformidade com o Master Prompt 2.1
4. "scoreLabel": r\xF3tulo do desempenho (ex: "Amador com Perda Cr\xEDtica de Leads", "M\xE9dio com Gargalos Visuais", "Padr\xE3o Ouro")
5. "executiveSummary": resumo executivo de 3-4 frases em tom de autoridade consultiva
6. "ownerInfo": objeto com os dados extra\xEDdos do propriet\xE1rio e empresa:
   {
     "businessName": "Nome da Empresa ou Cl\xEDnica",
     "ownerOrLeaderName": "Nome do Fundador, M\xE9dico, Advogado ou Propriet\xE1rio",
     "roleOrCredential": "Cargo e Registro Profissional (ex: CRM, CRO, OAB, Especialista)",
     "whatsapp": "N\xFAmero com DDD e m\xE1scara (ex: (11) 98765-4321)",
     "phone": "Telefone fixo ou comercial",
     "email": "E-mail de contato corporativo",
     "fullAddress": "Endere\xE7o f\xEDsico completo se houver ou regi\xE3o atendida",
     "cityState": "Cidade / Estado",
     "cnpj": "CNPJ se detectado ou 'Sob consulta'",
     "instagram": "@perfil ou link",
     "facebook": "Link ou N/A",
     "linkedin": "Link ou N/A",
     "bioOrAboutSummary": "Resumo profissional de autoridade sobre o propriet\xE1rio/empresa"
   }
7. "extractedImages": array com os principais ativos visuais detectados ou recomendados para o novo site:
   [
     {
       "id": "img_1",
       "url": "URL direta da imagem rastreada ou imagem de alta resolu\xE7\xE3o representativa",
       "alt": "Texto alternativo descritivo e otimizado para SEO",
       "category": "logo" | "hero" | "team" | "services" | "facility" | "other",
       "label": "R\xF3tulo explicativo (ex: 'Logotipo Oficial da Marca', 'Banner Hero da P\xE1gina', 'Foto do Respons\xE1vel T\xE9cnico')",
       "suggestedSection": "Se\xE7\xE3o alvo recomendada (ex: 'Header & Navbar', 'Primeira Dobra (Hero)', 'Sobre o Especialista')",
       "isReal": true
     }
   ]
8. "criticalBottlenecks": array de 4 a 6 frases pontuando os maiores gargalos do site atual
9. "corePillars": objeto com as notas (0-100), status ('critical'|'warning'|'good'|'optimal') e recomenda\xE7\xF5es para:
   - "uvpAndPositioning": Se\xE7\xE3o 3 (UVP em 4s)
   - "luxuryDigitalStandard": Se\xE7\xE3o 4 (Hierarquia 60-30-10)
   - "conversionAndFunnel": Se\xE7\xE3o 13 (CTAs e fluxo)
   - "astroStackAndPerformance": Se\xE7\xE3o 15 e 17 (Astro-First, Core Web Vitals)
   - "persuasiveCopywriting": Se\xE7\xE3o 12 (Prova social e quebra de obje\xE7\xF5es)
   - "accessibilityAndColor": Se\xE7\xE3o 5 (WCAG e contraste)
   - "onPageSeo": Se\xE7\xE3o 18 (SEO on-page)
10. "recommendedImprovements": array de 6 objetos com melhorias concretas e reescritas no padr\xE3o do Master Prompt:
    [
      {
        "id": "imp_1",
        "title": "Reformula\xE7\xE3o da UVP e Hero Section",
        "category": "uvp",
        "impact": "very_high",
        "masterPromptReference": "Se\xE7\xE3o 3 \u2014 Posicionamento Comercial & UVP",
        "currentIssue": "...",
        "improvedProposal": "...",
        "copyableContent": "..."
      }
    ]
11. "generatedNewPromptPreview": string com a descri\xE7\xE3o do novo prompt ideal para reconstruir esse site no Studio
`;
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`[Site Audit AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
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
2. DESIGN QUE ENCANTA: Projetos desenhados para deixar os clientes fascinados e encantados \xE0 primeira vista (Master Prompt 7.0), transmitindo autoridade imediata e distanciando totalmente de amadores.
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
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`[Sales Pitch AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }
  return null;
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
2. Design encantador de alto luxo (Master Prompt 7.0) que passa credibilidade instant\xE2nea.
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
  const modelsToTry = ["gemini-3.8-flash"];
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
      console.warn(`[Objection Solver AI] Modelo ${modelName} falhou: ${err.message?.slice(0, 80)}`);
    }
  }
  return null;
}

// src/server/authStore.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
var DATA_DIR = path.resolve(process.cwd(), ".data");
var ADMIN_FILE = path.join(DATA_DIR, "admin_account.json");
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Failed to create .data directory:", err);
  }
}
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
}
var serverAuthStore = {
  // Check if admin is currently registered on the server
  hasAdmin() {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return false;
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const data = JSON.parse(content);
      return Boolean(data && data.email && data.passwordHash);
    } catch {
      return false;
    }
  },
  // Read admin data safely (never returns passwordHash or salt)
  getAdminSafe() {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return null;
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const data = JSON.parse(content);
      if (!data || !data.email) return null;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || "super_admin",
        createdAt: data.createdAt,
        lastLogin: data.lastLogin
      };
    } catch {
      return null;
    }
  },
  // Reset admin (wipe admin account so the user can make a brand new registration)
  resetAdmin() {
    ensureDataDir();
    try {
      if (fs.existsSync(ADMIN_FILE)) {
        fs.unlinkSync(ADMIN_FILE);
      }
      return { success: true, message: "Cadastro de administrador reiniciado com sucesso. O sistema est\xE1 pronto para seu novo cadastro exclusivo." };
    } catch (err) {
      return { success: false, message: `Erro ao resetar administrador: ${err.message}` };
    }
  },
  // Register the first and ONLY Administrator
  registerMasterAdmin(data) {
    ensureDataDir();
    if (this.hasAdmin()) {
      return {
        success: false,
        message: "O Administrador do sistema j\xE1 est\xE1 cadastrado. Novos cadastros est\xE3o bloqueados por seguran\xE7a."
      };
    }
    const cleanName = data.name?.trim();
    const cleanEmail = data.email?.trim().toLowerCase();
    const cleanPass = data.password?.trim();
    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, message: "Todos os campos s\xE3o obrigat\xF3rios." };
    }
    if (cleanPass.length < 6) {
      return { success: false, message: "A senha deve conter no m\xEDnimo 6 caracteres." };
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(cleanPass, salt);
    const sessionToken = `admin_sess_${crypto.randomBytes(32).toString("hex")}`;
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1e3;
    const admin = {
      id: `admin_master_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: "super_admin",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
      passwordHash,
      salt,
      recoveryEmail: cleanEmail,
      activeSessions: [
        {
          token: sessionToken,
          createdAt: now,
          expiresAt
        }
      ]
    };
    try {
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
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
  // Log in as master admin
  login(email, password) {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: "Nenhum administrador cadastrado no sistema." };
    }
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const admin = JSON.parse(content);
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
      admin.lastLogin = (/* @__PURE__ */ new Date()).toISOString();
      if (!Array.isArray(admin.activeSessions)) {
        admin.activeSessions = [];
      }
      admin.activeSessions = [
        ...admin.activeSessions.filter((s) => s.expiresAt > now),
        { token: sessionToken, createdAt: now, expiresAt }
      ].slice(-10);
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
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
  // Validate session token
  validateSession(token) {
    if (!token) return { valid: false };
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return { valid: false };
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const admin = JSON.parse(content);
      const now = Date.now();
      const active = (admin.activeSessions || []).find((s) => s.token === token && s.expiresAt > now);
      if (!active) return { valid: false };
      return {
        valid: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      };
    } catch {
      return { valid: false };
    }
  },
  // Destroy session
  logout(token) {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) return;
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const admin = JSON.parse(content);
      admin.activeSessions = (admin.activeSessions || []).filter((s) => s.token !== token);
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
    } catch {
    }
  },
  // Request password recovery
  requestPasswordRecovery(email) {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: "Nenhum administrador cadastrado no sistema." };
    }
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const admin = JSON.parse(content);
      const cleanEmail = email?.trim().toLowerCase();
      if (admin.email.toLowerCase() !== cleanEmail) {
        return {
          success: false,
          message: "O e-mail digitado n\xE3o corresponde ao administrador cadastrado no sistema."
        };
      }
      const token = Math.floor(1e5 + Math.random() * 9e5).toString();
      admin.recoveryRequest = {
        token,
        requestedAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1e3
        // 15 mins
      };
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
      return {
        success: true,
        message: `C\xF3digo de recupera\xE7\xE3o gerado para o e-mail do administrador (${admin.email}).`,
        token,
        registeredEmail: admin.email
      };
    } catch (err) {
      return { success: false, message: `Erro ao processar recupera\xE7\xE3o: ${err.message}` };
    }
  },
  // Reset password using recovery token
  resetPasswordWithToken(token, newPassword) {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: "Nenhum administrador cadastrado." };
    }
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const admin = JSON.parse(content);
      if (!admin.recoveryRequest) {
        return { success: false, message: "Nenhuma solicita\xE7\xE3o de recupera\xE7\xE3o ativa." };
      }
      if (Date.now() > admin.recoveryRequest.expiresAt) {
        delete admin.recoveryRequest;
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
        return { success: false, message: "O c\xF3digo de recupera\xE7\xE3o expirou. Solicite um novo." };
      }
      if (admin.recoveryRequest.token !== token.trim()) {
        return { success: false, message: "C\xF3digo de verifica\xE7\xE3o incorreto." };
      }
      if (!newPassword || newPassword.length < 6) {
        return { success: false, message: "A nova senha deve ter no m\xEDnimo 6 caracteres." };
      }
      const salt = crypto.randomBytes(16).toString("hex");
      admin.passwordHash = hashPassword(newPassword.trim(), salt);
      admin.salt = salt;
      delete admin.recoveryRequest;
      const sessionToken = `admin_sess_${crypto.randomBytes(32).toString("hex")}`;
      const now = Date.now();
      admin.activeSessions = [
        {
          token: sessionToken,
          createdAt: now,
          expiresAt: now + 30 * 24 * 60 * 60 * 1e3
        }
      ];
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
      return {
        success: true,
        message: "Senha redefinida com sucesso! Voc\xEA j\xE1 foi autenticado.",
        token: sessionToken,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      };
    } catch (err) {
      return { success: false, message: `Erro ao redefinir senha: ${err.message}` };
    }
  },
  // Change password while logged in
  changePassword(token, currentPassword, newPassword) {
    ensureDataDir();
    if (!fs.existsSync(ADMIN_FILE)) {
      return { success: false, message: "Administrador n\xE3o cadastrado." };
    }
    try {
      const content = fs.readFileSync(ADMIN_FILE, "utf-8");
      const admin = JSON.parse(content);
      const sess = (admin.activeSessions || []).find((s) => s.token === token && s.expiresAt > Date.now());
      if (!sess) {
        return { success: false, message: "Sess\xE3o inv\xE1lida ou expirada. Fa\xE7a login novamente." };
      }
      const inputHash = hashPassword(currentPassword, admin.salt);
      if (inputHash !== admin.passwordHash) {
        return { success: false, message: "Senha atual incorreta." };
      }
      if (newPassword.length < 6) {
        return { success: false, message: "A nova senha deve ter no m\xEDnimo 6 caracteres." };
      }
      const newSalt = crypto.randomBytes(16).toString("hex");
      admin.passwordHash = hashPassword(newPassword.trim(), newSalt);
      admin.salt = newSalt;
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
      return { success: true, message: "Senha de administrador alterada com sucesso!" };
    } catch (err) {
      return { success: false, message: `Falha ao alterar senha: ${err.message}` };
    }
  }
};

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
    const geminiReport = await auditSiteWithGemini({ url, niche, targetObjective });
    if (geminiReport) {
      return res.json({ success: true, report: geminiReport, source: "gemini" });
    } else {
      return res.json({ success: false, source: "heuristic", message: "Fallback to client heuristic engine" });
    }
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
app.get("/api/auth/status", (req, res) => {
  const hasAdmin = serverAuthStore.hasAdmin();
  const adminInfo = serverAuthStore.getAdminSafe();
  return res.json({
    hasAdmin,
    adminEmail: adminInfo?.email || null,
    adminName: adminInfo?.name || null,
    createdAt: adminInfo?.createdAt || null
  });
});
app.post("/api/auth/register-master", (req, res) => {
  try {
    const result = serverAuthStore.registerMasterAdmin(req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const result = serverAuthStore.login(email, password);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/verify-session", (req, res) => {
  try {
    const { token } = req.body;
    const result = serverAuthStore.validateSession(token);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ valid: false, message: err.message });
  }
});
app.post("/api/auth/logout", (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      serverAuthStore.logout(token);
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});
app.post("/api/auth/recovery/request", (req, res) => {
  try {
    const { email } = req.body;
    const result = serverAuthStore.requestPasswordRecovery(email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/recovery/reset", (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = serverAuthStore.resetPasswordWithToken(token, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/change-password", (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;
    const result = serverAuthStore.changePassword(token, currentPassword, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
app.post("/api/auth/reset-system-admin", (req, res) => {
  try {
    const result = serverAuthStore.resetAdmin();
    return res.json(result);
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
