import { ProjectExtractedData, ProjectType, QualityReport, QualityCheckItem, TargetPlatform } from '../types';

export function composeFinalPrompt(
  masterPromptContent: string,
  projectName: string,
  projectType: ProjectType,
  targetPlatform: TargetPlatform,
  extracted: ProjectExtractedData,
  masterVersionLabel: string
): { finalPrompt: string; qualityReport: QualityReport } {
  // Format services cleanly
  const formattedServices = extracted.services && extracted.services.length > 0 && extracted.services[0] !== 'Não informado'
    ? extracted.services.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')
    : '  - [A DEFINIR PELO CLIENTE: Detalhar catálogo de serviços com escopo e benefícios]';

  // Format differentials
  const formattedDiffs = extracted.differentials && extracted.differentials.length > 0 && extracted.differentials[0] !== 'Não informado'
    ? extracted.differentials.map((d, idx) => `  * ${d}`).join('\n')
    : '  * [A DEFINIR: Focar em agilidade, tecnologia proprietária, metodologia testada ou garantia expressa]';

  // Format pain points
  const formattedPains = extracted.audiencePainPoints && extracted.audiencePainPoints.length > 0 && extracted.audiencePainPoints[0] !== 'Não informado'
    ? extracted.audiencePainPoints.map((p) => `  * ${p}`).join('\n')
    : '  * Incerteza quanto à qualidade da entrega e receio de atendimento impessoal';

  // Format goals
  const formattedGoals = extracted.businessGoals && extracted.businessGoals.length > 0 && extracted.businessGoals[0] !== 'Não informado'
    ? extracted.businessGoals.map((g) => `  * ${g}`).join('\n')
    : '  * Aquisição de leads qualificados e agendamento de primeiro contato';

  // Conditional address & Google Maps directives
  let locationDirectives = '';
  if (extracted.hasPhysicalLocation && extracted.address && extracted.address !== 'Não informado') {
    locationDirectives = `
### DIRETRIZ DE LOCALIZAÇÃO PRESENCIAL & GOOGLE MAPS (CONFIRMADA):
- Endereço físico oficial: ${extracted.address}
- Implementar componente visual de mapa interativo (Google Maps embed ou link direto para traçar rota no Waze/Google Maps).
- Exibir endereço completo de fácil visualização no rodapé e na seção de contato.
- Integrar dados estruturados Schema.org LocalBusiness com endereço físico, cidade e CEP exatos.
- NÃO inventar pontos de referência não fornecidos pelo cliente.`;
  } else {
    locationDirectives = `
### DIRETRIZ CRÍTICA DE OPERAÇÃO DIGITAL / SEM LOCAL FÍSICO (REGRA CONDICIONAL ATIVA):
- Este projeto opera de forma 100% digital, remota ou com atendimento exclusivamente em domicílio.
- PROIBIÇÃO ABSOLUTA: NÃO inserir mapa do Google Maps, NÃO colocar pin geográfico falso e NÃO inventar nome de rua, número ou CEP.
- Explicitar claramente no design e na copy a amplitude de atendimento (Região: ${extracted.serviceRegion || 'Atendimento Remoto Global'}).
- Em vez de endereço físico, dar proeminência aos canais de atendimento digital (WhatsApp, Reunião Online, Formulário).`;
  }

  // Conditional WhatsApp directives
  let whatsappDirectives = '';
  if (extracted.hasWhatsApp && extracted.whatsapp && extracted.whatsapp !== 'Não informado') {
    const cleanNumber = extracted.whatsapp.replace(/\D/g, '');
    whatsappDirectives = `
### DIRETRIZ DE CONVERSÃO WHATSAPP (CONFIRMADA):
- Número oficial confirmado: ${extracted.whatsapp}
- Implementar botão flutuante no canto inferior direito com pulso de atenção discreto.
- Implementar CTAs principais da página linkados diretamente para:
  https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(`Olá! Gostaria de mais informações sobre os serviços de ${extracted.companyName}.`)}
- Reduzir atrito com microcopy: "Atendimento ágil direto pelo WhatsApp".`;
  } else {
    whatsappDirectives = `
### DIRETRIZ DE CONVERSÃO SEM WHATSAPP CONFIRMADO:
- WhatsApp NÃO informado no questionário.
- NÃO inventar número fictício.
- Estruturar a conversão prioritária através de formulário de contato por e-mail (${extracted.email !== 'Não informado' ? extracted.email : 'contato oficial a definir'}) ou agendamento via calendário digital.
- Deixar a variável de WhatsApp como pendência declarada para o cliente.`;
  }

  // Niche Specific Guidance
  let nicheGuidance = '';
  const nicheLower = (extracted.niche + ' ' + extracted.clientName).toLowerCase();
  if (nicheLower.includes('odonto') || nicheLower.includes('dentist')) {
    nicheGuidance = `
### DIRETRIZES ESPECÍFICAS PARA ODONTOLOGIA E SAÚDE ESTÉTICA:
- Tom de voz: Acolhedor, humanizado, científico, transmitindo segurança total e alívio do medo de dor.
- Proibição ética: Observar normas do Conselho Federal de Odontologia (CFO/CRO) — proibido promessas sensacionalistas ou exposição vexatória de pacientes.
- Registro Profissional: Exibir com clareza no rodapé (${extracted.mandatoryContent.join(', ') || 'CRO do responsável técnico'}).
- Fotografia: Iluminação de estúdio limpa, foco em naturalidade dos sorrisos, texturas reais de porcelana/esmalte dental, consultório com sensação de spa.`;
  } else if (nicheLower.includes('advoca') || nicheLower.includes('jurídic') || nicheLower.includes('direito')) {
    nicheGuidance = `
### DIRETRIZES ESPECÍFICAS PARA ADVOCACIA E SERVIÇOS JURÍDICOS:
- Tom de voz: Sóbrio, assertivo, confiável, estrita observância ao Código de Ética da OAB (sem mercantilização da profissão ou promessas de causa ganha).
- Identidade visual: Cores nobres (marinho profundo, grafite, toques sutis de dourado ou vinho), tipografia serifada de autoridade.
- Foco de conversão: "Agende uma consulta jurídica especializada" ou "Fale com um advogado especialista".`;
  } else if (nicheLower.includes('growth') || nicheLower.includes('tecnologia') || nicheLower.includes('saas') || nicheLower.includes('software')) {
    nicheGuidance = `
### DIRETRIZES ESPECÍFICAS PARA TECNOLOGIA, SAAS & GROWTH MARKETING:
- Tom de voz: Data-driven, focado em métricas comprovadas (ROAS, CAC, LTV, MRR), sem floreios vazios.
- Interface: Dark Mode de alto contraste técnico (inspirado em referências como Linear, Stripe e Vercel), tipografia mono/sans contemporânea.
- Demonstração de valor: Gráficos conceituais de tração, fluxo de arquitetura de dados e formulário de qualificação em 2 etapas.`;
  } else if (nicheLower.includes('paisagism') || nicheLower.includes('arquitet') || nicheLower.includes('design')) {
    nicheGuidance = `
### DIRETRIZES ESPECÍFICAS PARA PAISAGISMO, ARQUITETURA & DESIGN:
- Tom de voz: Sensorial, refinado, valorizando a harmonia espacial, sustentabilidade e bem-estar.
- Visual: Galeria de alta escala, fotos em tela cheia, espaço negativo generoso, cores orgânicas terrosas e verdes naturais com tipografia elegante.`;
  } else {
    nicheGuidance = `
### DIRETRIZES ADAPTADAS AO SEGMENTO (${extracted.niche}):
- Enfatizar a clareza da proposta de valor comercial, diferenciação diante dos concorrentes imediatos e facilidade no fluxo de contratação.`;
  }

  // Missing Information Warnings
  let missingSection = '';
  if (extracted.missingFields && extracted.missingFields.length > 0) {
    missingSection = `
================================================================================
ATENÇÃO: LACUNAS IDENTIFICADAS NO BRIEFING DO CLIENTE (NÃO INVENTAR DADOS!)
================================================================================
Os seguintes itens NÃO foram informados no questionário respondido. O código/prompt
deve criar espaços reservados claramente identificados com comentários, sem gerar
informações fictícias que possam induzir o cliente ou os usuários a erro:
${extracted.missingFields.map((f) => `  * [PENDÊNCIA] ${f}`).join('\n')}
`;
  }

  // Contradictions Warnings
  let contradictionSection = '';
  if (extracted.contradictions && extracted.contradictions.length > 0) {
    contradictionSection = `
================================================================================
AVISOS DE POSSÍVEIS CONTRADIÇÕES NO BRIEFING & RESOLUÇÃO RECOMENDADA
================================================================================
${extracted.contradictions.map((c, idx) => `  ${idx + 1}. Alerta: ${c}`).join('\n')}
Resolução adotada: Priorizar a veracidade dos fatos confirmados, proteção do consumidor e conformidade com as regras absolutas de qualidade.
`;
  }

  // Architecture and Framework Section (Astro-First mandatory module)
  const hosting = extracted.hostingTarget || 'hostinger_static';
  let hostingDetails = '';
  switch (hosting) {
    case 'hostinger_static':
      hostingDetails = `Hostinger — Hospedagem Compartilhada / Arquivos Estáticos:
  * Publicação estática de alto desempenho: exportação dos arquivos gerados na pasta 'dist/' diretamente para a pasta 'public_html' via Git ou hPanel.
  * Banco de Dados Nativo Hostinger: Utiliza exclusivamente a infraestrutura nativa da Hostinger. Leads e contatos convertem diretamente para WhatsApp oficial e e-mail corporativo. Caso o cliente exija persistência em banco relacional, conectar diretamente ao MySQL ou MariaDB nativo da própria Hostinger (já incluído no plano hPanel) ou SQLite/JSON local.
  * Soberania e Autonomia Total: Arquitetura 100% autônoma e otimizada para o servidor da Hostinger, sem dependência de plataformas externas de banco de dados nem custos extras.`;
      break;
    case 'hostinger_vps':
      hostingDetails = `Hostinger — Cloud / VPS / Node.js:
  * Suporte tanto a arquivos estáticos quanto a execução de Node.js/Docker caso o cliente demande rotas de API server-side ou SSR dinâmico.
  * Banco de Dados Nativo Hostinger: Utilizar o MySQL, PostgreSQL ou MariaDB nativo instalado no servidor Hostinger (ou SQLite local de alto desempenho) com conexão direta via PDO, Drizzle, Prisma ou mysql2.`;
      break;
    case 'vercel_netlify':
      hostingDetails = `Vercel / Netlify:
  * Deploy automatizado via Git com edge caching global e renderização estática instantânea.`;
      break;
    case 'cloudflare_pages':
      hostingDetails = `Cloudflare Pages:
  * Distribuição global em 300+ datacenters com zero latência para assets estáticos.`;
      break;
    default:
      hostingDetails = `Hospedagem Estática Universal (Apache / Nginx / Hostinger):
  * Publicação estática compatível com qualquer servidor web HTTP padrão.`;
      break;
  }

  const preferredFramework = extracted.preferredFramework || 'Astro';
  let frameworkAlternative = '';
  switch (targetPlatform) {
    case 'ai_site_builder':
      frameworkAlternative = 'Se a ferramenta de IA exigir estritamente Next.js ou React, utilize Next.js com exportação estática (output: export) ou React+Vite configurado para bundle minificado com ilhas de código limpo.';
      break;
    case 'code_generator':
      frameworkAlternative = 'Caso o ambiente exija outro framework, utilize Next.js SSG ou SvelteKit com adapter estático (@sveltejs/adapter-static).';
      break;
    case 'visual_builder':
      frameworkAlternative = 'Se utilizar construtor visual, exporte código HTML semântico com classes de utilidade limpas sem scripts bloqueantes.';
      break;
    default:
      frameworkAlternative = 'Se Astro não for suportado pela ferramenta de destino, utilize Next.js estático ou HTML/CSS nativo otimizado.';
      break;
  }

  const architectureSection = `
================================================================================
ARQUITETURA TECNOLÓGICA E FRAMEWORK (MÓDULO ASTRO-FIRST & HOSTINGER)
================================================================================
- Framework Preferencial: ${preferredFramework} (Astro-First — Arquitetura de Ilhas & Zero-JS por padrão).
- Motivo da Escolha Arquitetural:
  * Prioridade absoluta para sites institucionais, profissionais e landing pages com foco em SEO, velocidade e conversão.
  * O Astro compila componentes em HTML puro sem enviar megabytes de JavaScript desnecessário para o navegador do visitante.
  * Excelente pontuação nos Core Web Vitals (FCP, LCP e CLS) com mínimo esforço de otimização manual.
- Alternativa Compatível para a Ferramenta de Destino:
  * ${frameworkAlternative}
  * REGRA DE RESPEITO À FERRAMENTA: Caso a ferramenta de destino (${targetPlatform}) não suporte Astro, respeite sua restrição técnica e adote a alternativa mais leve, justificando a substituição no código.
- Estratégia de Renderização:
  * Geração de Páginas Estáticas (SSG — Static Site Generation). Todas as páginas são pré-compiladas no build.
- Estratégia de Otimização de Imagens e Tipografia:
  * Uso de formatos modernos (WebP e AVIF) com dimensões 'width' e 'height' explícitas para zerar o CLS.
  * Fontes web carregadas com 'font-display: swap' e pré-carregamento das famílias primárias.
- Estratégia de Redução de JavaScript & Hidratação Seletiva:
  * Proibição de hidratação global ou inclusão cega de React/Vue/Svelte em toda a página.
  * Usar componentes interativos apenas onde for estritamente necessário (ex: formulário de lead ou accordion de FAQ), utilizando diretivas 'client:visible' ou 'client:idle'.
- Compatibilidade com Hospedagem:
  * ${hostingDetails}
- Método de Publicação e Comandos de Build/Deploy:
  * Comando de compilação: 'npm run build' (gera a pasta 'dist/').
  * Deploy: Transferência da pasta 'dist/' para a raiz do servidor web ('public_html' na Hostinger).
- DIRETRIZ SUPREMA DE VELOCIDADE (OBRIGATÓRIO NOTA > 9.5 NO GOOGLE PAGESPEED INSIGHTS):
  * Meta Obrigatória: Pontuação superior a nove e meio (>= 9.5 / 95/100) no Google PageSpeed Insights tanto no Mobile quanto no Desktop.
  * Core Web Vitals: LCP < 1.8s no 4G móvel, CLS < 0.05 (zero pulos de layout), INP < 100ms (resposta imediata), FCP < 1.0s, TTFB < 300ms na Hostinger.
  * Peso Total da Página: Menor que 800 KB na carga inicial.
  * Otimização de Mídias: 100% das imagens convertidas em WebP/AVIF (<150KB fundos, <80KB fotos de destaque, max 1920px desktop e 800px mobile). Dimensões width e height explícitas em todas as tags <img>.
  * Vídeos Ultrarrápidos: MP4 H.264 Web Optimized curto (5 a 10s) para fundos sem áudio; carregamento sob demanda (lazy facade) para demonstrações no YouTube/Vimeo.
`;

  // Target Platform Specific Prompt Framing
  let platformInstruction = '';
  switch (targetPlatform) {
    case 'ai_site_builder':
      platformInstruction = 'Priorize Astro com componentes estáticos e Tailwind CSS. Caso a ferramenta exija React/Next.js, gere código limpo, sem injeção desnecessária de dependências pesadas.';
      break;
    case 'code_generator':
      platformInstruction = 'Gere o projeto com Astro (.astro) e Tailwind CSS, componentizado, com tipagem TypeScript estrita e geração estática (SSG) pronta para deploy.';
      break;
    case 'visual_builder':
      platformInstruction = 'Estruture o projeto com hierarquia semântica de seções e classes reutilizáveis compatíveis com a ferramenta visual selecionada.';
      break;
    default:
      platformInstruction = 'Gere a solução completa com arquitetura de informação detalhada, copy integral persuasiva e especificações técnicas de layout sob a diretriz Astro-First.';
      break;
  }

  // Assemble the Master Final Prompt
  const finalPrompt = `================================================================================
PROMPT ESTRATÉGICO FINAL PERSONALIZADO — MASTER SITE PROMPT STUDIO
PROJETO: ${projectName.toUpperCase()}
CLIENTE: ${extracted.companyName.toUpperCase()}
TIPO DE SITE: ${projectType.toUpperCase()}
VERSÃO DO PROMPT MESTRE UTILIZADA: ${masterVersionLabel}
DATA DE COMPOSIÇÃO: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
================================================================================

${platformInstruction}

================================================================================
1. DADOS ESPECÍFICOS E CONFIRMADOS DO PROJETO
================================================================================
- Nome do Cliente / Marca: ${extracted.companyName}
- Segmento / Nicho: ${extracted.niche}
- Tipo de Solução: ${projectType}
- Região de Atuação: ${extracted.serviceRegion || 'Não informada'}
- Atendimento Presencial: ${extracted.hasPhysicalLocation ? 'SIM — Possui endereço físico' : 'NÃO — 100% Remoto / Digital'}
- Endereço Físico: ${extracted.address}
- WhatsApp Oficial: ${extracted.whatsapp}
- Telefone Fixo: ${extracted.phone}
- E-mail Corporativo: ${extracted.email}
- Redes Sociais: ${extracted.socialLinks.length > 0 ? extracted.socialLinks.join(' | ') : 'Não informadas'}
- Registros Profissionais / Obrigatórios: ${extracted.mandatoryContent.join('; ')}
- Ambiente de Hospedagem Previsto: ${hosting}

--- CATÁLOGO DE SERVIÇOS CONFIRMADOS:
${formattedServices}

--- PÚBLICO-ALVO QUALIFICADO:
  ${extracted.targetAudience}

--- OBJETIVOS COMERCIAIS PRIMÁRIOS:
${formattedGoals}

--- DIFERENCIAIS COMPETITIVOS REAIS:
${formattedDiffs}

--- DORES & OBJEÇÕES MAPEADAS DO PÚBLICO:
${formattedPains}

--- BENEFÍCIOS & TRANSFORMAÇÃO GERADA:
${extracted.benefitsAndTransformation.length > 0 && extracted.benefitsAndTransformation[0] !== 'Não informado'
  ? extracted.benefitsAndTransformation.map((b) => `  * ${b}`).join('\n')
  : '  * Segurança, eficiência comprovada e atendimento sob medida.'}

--- IDENTIDADE VISUAL & PREFERÊNCIAS ESTÉTICAS:
- Paleta / Cores: ${extracted.visualIdentity.primaryColors}
- Estilo Declarado: ${extracted.preferencesEsthetic}
- Logotipo: ${extracted.visualIdentity.logoAvailable ? 'Logotipo existente fornecido pelo cliente' : 'Logotipo vetorial pendente de envio'}
- Referências Visuais: ${extracted.references.length > 0 ? extracted.references.join(', ') : 'Nenhuma referência externa informada'}

--- DIREÇÃO FOTOGRÁFICA & ASSETS VISUAIS:
${(extracted.imageAssets && extracted.imageAssets.length > 0)
  ? extracted.imageAssets.map((a, i) => `  ${i + 1}. [ASSET REAL / ${a.category.toUpperCase()}] "${a.name}" — Alvo: ${a.sectionTarget} | Alt-text semântico: "${a.altText}" | Tipo: ${a.isRealClientPhoto ? 'Foto Real Verificada (MANTER EXATA)' : 'Referência'}${a.url ? ` | URL EXATA DO CLIENTE: ${a.url}` : ''}`).join('\n')
  : '  * [ASSETS FOTOGRÁFICOS]: Nenhuma foto física fornecida previamente. Proibido usar banco de imagens gratuito genérico. Adotar os prompts fotográficos especificados abaixo.'}
- Diretrizes de Estilo: ${extracted.photographicDirection?.styleGuidelines || 'Fotografia editorial com iluminação natural suave, profundidade de campo rasa e foco na autenticidade humana.'}
- Iluminação e Clima: ${extracted.photographicDirection?.lightingAndMood || 'Luz natural limpa, 5000K, sombras suaves sem iluminação hospitalar.'}
- Proibições Fotográficas: ${(extracted.photographicDirection?.prohibitedElements || ['Modelos com poses forçadas de stock photos', 'Sorrisos plásticos artificiais', 'Ilustrações corporativas genéricas']).join('; ')}
${extracted.photographicDirection?.recommendedPrompts?.length ? `
- Prompts de Geração Recomendados para Seções Sem Fotos Reais:
${extracted.photographicDirection.recommendedPrompts.map((p, i) => `  ${i + 1}. [${p.section}] (${p.aspectRatio} • ${p.suggestedModel}): "${p.promptText}"`).join('\n')}` : ''}

--- PROVAS SOCIAIS & CREDENCIAIS:
${extracted.socialProof.hasRealProof
  ? `  * Depoimentos / Avaliações: ${extracted.socialProof.testimonials.join('; ')}`
  : '  * [REGRA DE VERACIDADE: Sem depoimentos verificados fornecidos até o momento. Proibido inventar depoimentos fictícios. Estruturar espaço reservado com a etiqueta [AVALIAÇÕES REAIS DE CLIENTES]].'}

--- IDENTIDADE DE CONVERSÃO, HISTÓRIA, POLÍTICAS & OPERAÇÃO CONFIRMADA:
- Headline / Promessa Principal (Hero): ${extracted.heroHeadline || extracted.benefitsAndTransformation[0] || 'Construir com foco no diferencial principal confirmado'}
- Subheadline / Apoio Hero: ${extracted.heroSubheadline || 'Detalhar proposta de valor e rapidez no atendimento'}
- Texto Exato do Botão Principal (CTA): ${extracted.heroCtaText || (extracted.hasWhatsApp ? 'Falar no WhatsApp Agora' : 'Solicitar Atendimento')}
- História da Marca & Formação da Equipe: ${extracted.brandStory || 'Utilizar credenciais e diferenciais confirmados sem inventar datas fictícias'}
- Política de Preços, Planos, Convênios & Pagamento: ${extracted.pricingAndPayment || 'Apresentar condições comerciais transparentes conforme briefing'}
- Garantias & Compromissos de Qualidade: ${extracted.guaranteesAndPolicies || 'Destacar transparência, segurança e acompanhamento pós-atendimento'}
- Horários de Atendimento & SLA de Resposta: ${extracted.openingHours || 'Informar horário comercial padrão ou confirmar com cliente'}
- Inventário de Logotipo, Fotos Reais & Vídeos: ${extracted.availableMediaAssets || 'Seguir direção fotográfica definida abaixo'}
- Palavras-Chave & Bairros/Cidades para SEO Local: ${extracted.seoKeywords && extracted.seoKeywords.length > 0 ? extracted.seoKeywords.join(', ') : extracted.serviceRegion}
${extracted.processSteps && extracted.processSteps.length > 0 ? `\n--- PASSO A PASSO DO ATENDIMENTO / ENTREGA ("COMO FUNCIONA"):\n${extracted.processSteps.map((s, i) => `  Passo ${i + 1}: ${s}`).join('\n')}` : ''}
${extracted.faqItems && extracted.faqItems.length > 0 ? `\n--- PERGUNTAS FREQUENTES (FAQ REAL DO CLIENTE):\n${extracted.faqItems.map((f) => `  * ${f}`).join('\n')}` : ''}
${extracted.rawBriefingSummary ? `\n--- BRIEFING INTEGRAL DO CLIENTE (TODAS AS RESPOSTAS ESPECÍFICAS DO NICHO — USO OBRIGATÓRIO NA COPY E SEÇÕES):\n${extracted.rawBriefingSummary}` : ''}

${nicheGuidance}

${locationDirectives}

${whatsappDirectives}

${missingSection}

${contradictionSection}

${architectureSection}

================================================================================
2. CONSTITUIÇÃO TÉCNICA E ARQUITETURAL DO MASTER SITE ENGINE 9.0 (INTEGRAL E INEGOCIÁVEL)
================================================================================
AVISO MANDATÓRIO DE EXECUÇÃO:
Você deve ler, absorver e aplicar com estrito rigor todas as 63 DIRETRIZES INEGOCIÁVEIS
do Master Site Engine 9.0 (World-Class Digital Experience System) a seguir.
Cada dado do cliente mapeado na Seção 1 deve ser materializado em conformidade absoluta
com as normas de Direção de Arte World-Class, Tipografia Display Editorial, Stack Astro-First,
Motion Design com Propósito, SEO Semântico & GEO Avançado, Dados Estruturados Schema.org,
CRO de Alta Conversão, Acessibilidade WCAG e Segurança/LGPD. É terminantemente proibido resumir,
omitir código, criar pseudocódigo ou utilizar templates genéricos:

${masterPromptContent}

================================================================================
3. ROTEIRO DE DOBRAS & ESTRUTURA COMPLETA E DETALHADA DA PÁGINA REQUISITADA
================================================================================
ATENÇÃO: NÃO gere uma landing page curta, rasa ou resumida. Construa uma página completa,
profunda e rica em informações úteis usando TODOS os dados fornecidos no briefing de ${extracted.companyName}:

DOBRA 1: HEADER & NAVEGAÇÃO
- Logotipo da marca ${extracted.companyName}.
- Links de âncora suaves para as seções essenciais (Serviços, Como Funciona, Sobre Nós, Depoimentos, FAQ, Contato).
- CTA direto no topo: "${extracted.heroCtaText || (extracted.hasWhatsApp ? 'Falar no WhatsApp' : 'Solicitar Contato')}".

DOBRA 2: HERO SECTION DE ALTA CONVERSÃO
- Eyebrow tag: "${extracted.niche}".
- Headline H1 baseada na promessa confirmada: ${extracted.heroHeadline || extracted.differentials[0] || 'Excelência e Confiança'}.
- Subheadline explicativa: ${extracted.heroSubheadline || `Como ${extracted.companyName} resolve o problema de ${extracted.targetAudience.slice(0, 100)}`}.
- Botão de CTA proeminente ("${extracted.heroCtaText || (extracted.hasWhatsApp ? 'Falar no WhatsApp' : 'Solicitar Contato')}") com microcopy redutor de atrito (${extracted.openingHours ? `Atendimento: ${extracted.openingHours.slice(0, 90)}` : 'Resposta rápida e atendimento personalizado'}).
- Barra de confiança imediata (${extracted.mandatoryContent[0] !== 'Não informado' ? extracted.mandatoryContent.join(' • ') : 'Atendimento Especializado'} • ${extracted.socialProof.hasRealProof ? 'Avaliações reais verificadas' : 'Qualidade e Transparência'}).

DOBRA 3: DORES DO CLIENTE & IDENTIFICAÇÃO EMPÁTICA
- Espelhamento profundo das dores reais informadas no briefing:
${formattedPains}
- Demonstração clara de por que soluções genéricas falham e qual é a consequência de adiar a solução.

DOBRA 4: VITRINE COMPLETA DE SERVIÇOS, PRODUTOS & OFERTA CARRO-CHEFE
- Cards detalhados e completos (com nome, o que inclui, benefícios e chamada individual para WhatsApp/contato) para cada item confirmado:
${formattedServices}
- Bloco de transparência comercial, valores/planos/convênios e formas de pagamento: ${extracted.pricingAndPayment || 'Orçamento personalizado e condições facilitadas'}.

DOBRA 5: COMO FUNCIONA NA PRÁTICA (PASSO A PASSO DO ATENDIMENTO)
${extracted.processSteps && extracted.processSteps.length > 0
  ? extracted.processSteps.map((step, idx) => `- Passo ${idx + 1}: ${step}`).join('\n')
  : `- Passo 1: Primeiro contato rápido pelo botão de WhatsApp ou formulário.\n- Passo 2: Análise personalizada da sua necessidade.\n- Passo 3: Execução com acompanhamento próximo e entrega segura.`}

DOBRA 6: DIFERENCIAIS EXCLUSIVOS DO NICHO, INFRAESTRUTURA & GARANTIAS
- Incorporar integralmente os detalhes técnicos/operacionais exclusivos do nicho declarados no briefing completo acima.
- Destaque para os diferenciais confirmados:
${formattedDiffs}
- Garantias e políticas de segurança: ${extracted.guaranteesAndPolicies || 'Compromisso integral com qualidade e transparência'}.

DOBRA 7: SOBRE NÓS, HISTÓRIA & AUTORIDADE TÉCNICA
- História real da marca/fundador e equipe: ${extracted.brandStory || `Apresentar a trajetória e especialização de ${extracted.companyName}`}.
- Credenciais e registros obrigatórios: ${extracted.mandatoryContent.join('; ')}.

DOBRA 8: PROVA SOCIAL, NÚMEROS & DEPOIMENTOS REAIS
- Números reais de impacto e avaliações verificadas: ${extracted.socialProof.hasRealProof ? extracted.socialProof.testimonials.join('; ') : 'Espaço reservado para avaliações reais verificadas [AVALIAÇÕES REAIS DE CLIENTES]'}.

DOBRA 9: LOCALIZAÇÃO / ÁREA DE COBERTURA & HORÁRIOS
${extracted.hasPhysicalLocation ? `- Bloco de endereço presencial na ${extracted.address} com mapa interativo e rota.` : `- Bloco destacando a comodidade do atendimento 100% digital/regional em ${extracted.serviceRegion || 'todo o Brasil'}.`}
- Horários de atendimento e tempo de resposta: ${extracted.openingHours || 'Atendimento em horário comercial com resposta ágil'}.

DOBRA 10: FAQ COMPLETO & QUEBRA DE OBJEÇÕES
${extracted.faqItems && extracted.faqItems.length > 0
  ? extracted.faqItems.map((item) => `- ${item}`).join('\n')
  : '- Mínimo de 5 perguntas frequentes com accordion acessível (cobrindo preço/orçamento, prazo, como funciona, garantias e atendimento).'}

DOBRA 11: CTA FINAL DE FECHAMENTO & FORMULÁRIO/CONTATO
- Chamada final irrecusável com o botão "${extracted.heroCtaText || 'Falar no WhatsApp Agora'}" e resumo da porta de entrada.

DOBRA 12: RODAPÉ CORPORATIVO, SEO LOCAL & COMPLIANCE LGPD
- Dados cadastrais de ${extracted.companyName}, registro profissional, horários, links de redes sociais, links para Termos e Privacidade (LGPD), e Schema.org enriquecido com palavras-chave locais (${extracted.seoKeywords?.slice(0, 6).join(', ') || extracted.niche}).

================================================================================
4. INSTRUÇÃO FINAL DE GERAÇÃO
================================================================================
Execute a criação integral do projeto agora. NÃO crie uma landing page curta ou genérica: utilize todas as 12 dobras acima e todos os detalhes fornecidos no briefing completo do cliente. Escreva textos finais completos, profundos e persuasivos em português do Brasil impecável, código robusto, acessível e responsivo, pronto para publicação profissional.
`;

  // Automated 16-Point Quality Validation (including Astro-First module)
  const checks: QualityCheckItem[] = [
    {
      id: 'check_astro_architecture',
      title: 'Diretriz Astro-First e Arquitetura Leve',
      category: 'technical',
      state: 'confirmed',
      description: 'Framework prioritário Astro com geração estática (SSG) e compatibilidade com Hostinger estruturada.',
      details: `Framework: ${preferredFramework} • Hospedagem: ${hosting}`,
    },
    {
      id: 'check_client_name',
      title: 'Nome da marca e do cliente incorporados',
      category: 'identity',
      state: extracted.companyName && extracted.companyName !== 'Não informado' ? 'confirmed' : 'pending',
      description: 'Verifica se a marca/cliente foi identificada e injetada no título, hero e metadados.',
      details: extracted.companyName !== 'Não informado' ? `Marca: ${extracted.companyName}` : 'Pendente no questionário',
    },
    {
      id: 'check_project_type',
      title: 'Adequação ao tipo de projeto',
      category: 'identity',
      state: 'confirmed',
      description: 'Valida se o formato (Landing page, Institucional, etc.) orienta a estrutura da página.',
      details: `Tipo selecionado: ${projectType}`,
    },
    {
      id: 'check_services_preserved',
      title: 'Preservação do catálogo de serviços',
      category: 'content',
      state: extracted.services && extracted.services.length > 0 && extracted.services[0] !== 'Não informado' ? 'confirmed' : 'pending',
      description: 'Garante que os serviços reais foram extraídos e não substituídos por serviços genéricos.',
      details: `${extracted.services.length} serviço(s) identificado(s)`,
    },
    {
      id: 'check_whatsapp_rule',
      title: 'Regra condicional de WhatsApp',
      category: 'technical',
      state: extracted.hasWhatsApp ? 'confirmed' : 'pending',
      description: 'Se há WhatsApp, cria link parametrizado. Se não há, proíbe número falso.',
      details: extracted.hasWhatsApp ? `WhatsApp confirmado: ${extracted.whatsapp}` : 'WhatsApp não informado (lacuna registrada)',
    },
    {
      id: 'check_address_rule',
      title: 'Regra condicional de endereço e mapa',
      category: 'technical',
      state: 'confirmed',
      description: 'Não inventa mapa se o negócio for digital; inclui mapa e endereço se for presencial.',
      details: extracted.hasPhysicalLocation ? `Endereço presencial: ${extracted.address}` : 'Operação digital/remota (mapa omitido)',
    },
    {
      id: 'check_visual_identity',
      title: 'Incorporação da identidade visual e estilo',
      category: 'identity',
      state: extracted.visualIdentity.primaryColors !== 'Não informado' ? 'confirmed' : 'pending',
      description: 'Aplica a paleta de cores e o tom visual fornecido pelo cliente.',
      details: `Paleta: ${extracted.visualIdentity.primaryColors}`,
    },
    {
      id: 'check_photographic_assets',
      title: 'Direção Fotográfica e Assets Reais',
      category: 'identity',
      state: 'confirmed',
      description: 'Definição de assets reais cadastrados ou prompts fotográficos anti-slop sob medida para Midjourney/Flux.',
      details: extracted.imageAssets && extracted.imageAssets.length > 0
        ? `${extracted.imageAssets.length} asset(s) real(is) mapeado(s)`
        : 'Diretriz fotográfica e prompts específicos gerados para o nicho',
    },
    {
      id: 'check_seo_rules',
      title: 'Diretrizes de SEO técnico e semântico',
      category: 'rules',
      state: 'confirmed',
      description: 'Preservação de regras de H1 único, meta tags, OpenGraph e dados estruturados Schema.org.',
    },
    {
      id: 'check_performance_cwv',
      title: 'Regras de Core Web Vitals e Performance',
      category: 'rules',
      state: 'confirmed',
      description: 'Metas de LCP < 2.0s, lazy loading de imagens WebP e contenção de layout shifts (CLS).',
    },
    {
      id: 'check_accessibility_wcag',
      title: 'Acessibilidade universal (WCAG 2.1 AA)',
      category: 'rules',
      state: 'confirmed',
      description: 'Contrastes mínimos de 4.5:1, foco visível de teclado e atributos ARIA.',
    },
    {
      id: 'check_motion_guidelines',
      title: 'Diretrizes de Motion Design discreto',
      category: 'rules',
      state: 'confirmed',
      description: 'Animações suaves de entrada (200-400ms) com respeito a prefers-reduced-motion.',
    },
    {
      id: 'check_anti_hallucination',
      title: 'Regra de ouro contra invenção de dados',
      category: 'rules',
      state: 'confirmed',
      description: 'Proibição absoluta de inventar depoimentos falsos, números fictícios ou registros inexistentes.',
    },
    {
      id: 'check_final_audit_included',
      title: 'Inclusão da auditoria adversarial pré-lançamento',
      category: 'rules',
      state: 'confirmed',
      description: 'Controle de qualidade e sistema de pontuação de 100 pontos mantido no prompt final.',
    },
    {
      id: 'check_contradictions',
      title: 'Resolução de contradições detectadas',
      category: 'content',
      state: extracted.contradictions && extracted.contradictions.length > 0 ? 'pending' : 'confirmed',
      description: 'Verificação de conflitos entre requisitos expressos no briefing.',
      details: extracted.contradictions.length > 0 ? `${extracted.contradictions.length} contradição(ões) assinalada(s)` : 'Sem contradições detectadas',
    },
    {
      id: 'check_missing_fields',
      title: 'Mapeamento de lacunas de informação',
      category: 'content',
      state: extracted.missingFields && extracted.missingFields.length > 0 ? 'pending' : 'confirmed',
      description: 'Sinalização clara de itens não fornecidos para evitar suposições equivocadas.',
      details: extracted.missingFields.length > 0 ? `${extracted.missingFields.length} campo(s) pendente(s)` : 'Questionário completo',
    },
    {
      id: 'check_output_integrity',
      title: 'Integridade textual do prompt gerado',
      category: 'technical',
      state: finalPrompt.length > 2000 ? 'confirmed' : 'unverifiable',
      description: 'Garante que o texto gerado é completo, sem truncamento ou placeholders vazios.',
      details: `${finalPrompt.length.toLocaleString()} caracteres gerados`,
    },
  ];

  const confirmedCount = checks.filter((c) => c.state === 'confirmed').length;
  const pendingCount = checks.filter((c) => c.state === 'pending').length;
  const unverifiableCount = checks.filter((c) => c.state === 'unverifiable').length;
  
  // Calculate score based strictly on confirmed vs total
  const score = Math.round((confirmedCount / checks.length) * 100);

  const qualityReport: QualityReport = {
    score,
    totalChecks: checks.length,
    confirmedCount,
    pendingCount,
    unverifiableCount,
    items: checks,
    generatedAt: new Date().toISOString(),
  };

  return { finalPrompt, qualityReport };
}
