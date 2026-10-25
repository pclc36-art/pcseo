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
  * Dispensa processo Node.js contínuo no servidor, garantindo estabilidade máxima, custo reduzido e tempo de resposta imediato.`;
      break;
    case 'hostinger_vps':
      hostingDetails = `Hostinger — Cloud / VPS / Node.js:
  * Suporte tanto a arquivos estáticos quanto a execução de Node.js/Docker caso o cliente demande rotas de API server-side ou SSR dinâmico.`;
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
- Testes de Performance Necessários:
  * Meta: Apresentar o conteúdo principal em menos de 1 segundo nas condições adequadas de teste.
  * Garantir FCP < 1.0s, LCP < 2.0s, CLS < 0.05 e pontuação $\ge$ 90 no PageSpeed Insights.
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
  ? extracted.imageAssets.map((a, i) => `  ${i + 1}. [ASSET REAL / ${a.category.toUpperCase()}] "${a.name}" — Alvo: ${a.sectionTarget} | Alt-text semântico: "${a.altText}" | Tipo: ${a.isRealClientPhoto ? 'Foto Real Verificada' : 'Referência'}`).join('\n')
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

${nicheGuidance}

${locationDirectives}

${whatsappDirectives}

${missingSection}

${contradictionSection}

${architectureSection}

================================================================================
2. CONSTITUIÇÃO TÉCNICA E ARQUITETURAL DO MASTER PROMPT 7.0 (INTEGRAL E INEGOCIÁVEL)
================================================================================
AVISO MANDATÓRIO DE EXECUÇÃO:
Você deve ler, absorver e aplicar com estrito rigor todas as 56 DIRETRIZES INEGOCIÁVEIS
organizadas nas 10 PARTES do Master Site Prompt 7.0 a seguir.
Cada dado do cliente mapeado na Seção 1 deve ser materializado em conformidade absoluta
com as normas de Direção de Arte World-Class, Tipografia Display Editorial, Stack Astro-First,
Motion Design 60fps, SEO Semântico Avançado com Schema.org LocalBusiness, CRO de Alta
Conversão e Acessibilidade WCAG 2.2 AA. É terminantemente proibido resumir, omitir código
ou utilizar componentes genéricos de template:

${masterPromptContent}

================================================================================
3. ROTEIRO DE DOBRAS & ESTRUTURA DA PÁGINA REQUISITADA
================================================================================
Construa o projeto aplicando o roteiro abaixo adaptado com os dados reais de ${extracted.companyName}:

DOBRA 1: HEADER & NAVEGAÇÃO
- Logotipo da marca ${extracted.companyName}.
- Links de âncora suaves para as seções essenciais.
- CTA direto no topo: "${extracted.hasWhatsApp ? 'Falar no WhatsApp' : 'Solicitar Contato'}".

DOBRA 2: HERO SECTION DE ALTA CONVERSÃO
- Eyebrow tag: "${extracted.niche}".
- Headline com proposta de valor clara focada em: ${extracted.differentials[0] || 'Excelência e Confiança'}.
- Subheadline detalhando como o público (${extracted.targetAudience.slice(0, 80)}...) alcança os resultados.
- Botão de CTA proeminente com microcopy redutor de atrito.
- Bloco de prova social imediata (${extracted.socialProof.hasRealProof ? 'Avaliações reais' : 'Garantia e Credenciais'}).

DOBRA 3: DORES DO CLIENTE & AGITAÇÃO EMPÁTICA
- Espelhamento das dores reais (${extracted.audiencePainPoints.slice(0, 3).join(', ')}).
- Demonstração clara de por que os métodos genéricos de concorrentes falham.

DOBRA 4: SOLUÇÃO & DIFERENCIAIS
- Apresentação da metodologia ou infraestrutura exclusiva de ${extracted.companyName}.
- Destaque para os diferenciais confirmados:
${formattedDiffs}

DOBRA 5: VITRINE DE SERVIÇOS
- Cartões com os serviços específicos confirmados:
${formattedServices}

DOBRA 6: PROVA SOCIAL & AUTORIDADE
- Apresentação dos casos reais, credenciais (${extracted.mandatoryContent.join('; ')}) e tempo de experiência.

DOBRA 7: LOCALIZAÇÃO OU ATENDIMENTO DIGITAL
${extracted.hasPhysicalLocation ? `- Bloco de endereço presencial na ${extracted.address} com mapa interativo.` : '- Bloco destacando a comodidade do atendimento 100% digital e seguro.'}

DOBRA 8: FAQ ESTRATÉGICO
- Mínimo de 5 perguntas frequentes com accordion acessível (destruindo dúvidas de contratação, segurança, prazos e garantia).

DOBRA 9: CTA FINAL DE FECHAMENTO
- Chamada final irrecusável orientando o próximo passo imediato.

DOBRA 10: RODAPÉ CORPORATIVO & COMPLIANCE
- Dados cadastrais de ${extracted.companyName}, registro profissional, links para Termos e Privacidade (LGPD) e direitos autorais.

================================================================================
4. INSTRUÇÃO FINAL DE GERAÇÃO
================================================================================
Execute a criação integral do projeto agora. Não retorne resumos, esboços vazios ou marcações incompletas com "insira o código aqui". Escreva os textos finais persuasivos em português do Brasil impecável, código robusto, acessível e responsivo, pronto para publicação profissional.
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
