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
  const prompt = `Voc\xEA \xE9 o Auditor Independente e Engenheiro Chefe de Reengenharia Digital do MASTER SITE ENGINE 10.0 (QUALITY CONTROL, PERFORMANCE AUDIT & REENGINEERING SYSTEM).
Sua base normativa OBRIGAT\xD3RIA E SUPREMA \xE9 o MASTER SITE ENGINE 10.0.

O usu\xE1rio forneceu a seguinte URL para auditoria completa e gera\xE7\xE3o do MEGA PROMPT DEFINITIVO DE RECRIA\xC7\xC3O:
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
6. "executiveSummary": resumo executivo rigoroso de 3-4 frases em tom de auditor independente
7. "ownerInfo": objeto com dados extra\xEDdos { businessName, ownerOrLeaderName, roleOrCredential, whatsapp, phone, email, fullAddress, cityState, cnpj, instagram, bioOrAboutSummary }
8. "extractedImages": array com os ativos visuais reais detectados ou sugeridos para o novo projeto
9. "criticalBlockers": array com bloqueadores cr\xEDticos encontrados (ex: formul\xE1rio quebrado, lentid\xE3o extrema mobile, aus\xEAncia de UVP, promessas falsas) com { id, title, evidence, impact, correction, priority: 'P0'|'P1' }
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
Todo site e landing page DEVE ser concebido para ser ultrarr\xE1pido e atingir nota m\xEDnima de nove e meio (>= 9.5 / 95pts) no Google PageSpeed Insights tanto no Mobile quanto no Desktop.
- LCP (Largest Contentful Paint) < 1.8s
- CLS (Cumulative Layout Shift) < 0.05
- INP / FID < 100ms
- FCP < 1.0s
- Imagens em WebP/AVIF (<150KB fundos, <80KB destaque, largura m\xE1xima 1920px desktop e 800px mobile)
- V\xEDdeos em loop de 5-10s no servidor ou fachada lazy para YouTube/Vimeo.
Na categoria "performance" e nos bloqueadores, avalie estritamente se o site atende ao crit\xE9rio de velocidade > 9.5.

11. "recommendedImprovements": array de 6 objetos com a\xE7\xF5es de melhoria concretas prontas para copiar
12. "reengineeringMegaPrompt": string com o MEGA PROMPT DEFINITIVO DE RECRIA\xC7\xC3O & REENGENHARIA 10.0 autossuficiente e completo para colar em ferramentas com IA (Lovable, Bolt, Cursor ou Studio), garantindo a meta inegoci\xE1vel de 9.5+ no PageSpeed Insights.
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
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const googleApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${apiKey}`;
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
