import {
  SalesPitchRequest,
  SalesPitchResult,
  ObjectionSolverRequest,
  ObjectionSolverResult,
  TargetSolutionType
} from '../types/salesTypes';

function getSolutionLabel(type: TargetSolutionType): string {
  switch (type) {
    case 'combo_pro':
      return 'Combo Ouro (Google Meu Negócio 100/100 + Site / Landing Page de Alta Conversão)';
    case 'landing_page':
      return 'Landing Page Completa de Alta Conversão + SEO Local';
    case 'institutional_site':
      return 'Site Institucional Premium Completo + Google Meu Negócio';
    default:
      return 'Ecossistema Digital Completo (Site + Google Meu Negócio)';
  }
}

/**
 * Heuristic generator for personalized pitch scripts
 */
export function generateHeuristicPitch(request: SalesPitchRequest): SalesPitchResult {
  const client = (request.clientName || 'Prezado(a)').trim();
  const company = (request.companyName || 'seu negócio').trim();
  const niche = (request.niche || 'Geral').trim();
  const region = request.cityOrRegion?.trim() || 'sua região';
  const solutionLabel = getSolutionLabel(request.targetSolution);

  const isCombo = request.targetSolution === 'combo_pro';
  const isLanding = request.targetSolution === 'landing_page';

  // WhatsApp Pitch Message
  const pitchWhatsApp = `Olá, ${client}! Tudo bem? Aqui é o especialista em posicionamento digital e captação de clientes no Google.

Estive analisando o mercado de *${niche}* em *${region}* e notei uma oportunidade gigantesca que a *${company}* pode dominar antes dos concorrentes.

Hoje, quando um potencial cliente busca por *${niche}* no Google com a intenção real de contratar ou comprar, ele não busca para passar o tempo: ele está com o problema na mão e o dinheiro pronto.

Para capturar essa demanda quente todos os dias, eu criei uma engenharia exclusiva que vai muito além de um "site comum":

1️⃣ *SEO Nota 100 no Google*: Desenvolvemos a estrutura técnica semântica para ranquear no topo das pesquisas orgânicas, sem que você fique refém de pagar anúncios o tempo todo para ser visto.
2️⃣ *Design que Encanta e Gera Desejo Imediato*: Não usamos templates amadores de prateleira. A arquitetura visual é construída para que qualquer pessoa que entre no site sinta credibilidade imediata, sofisticação e segurança para fechar com você.
3️⃣ *A Dobradinha Imbatível: Google Meu Negócio + Site Completo*: O Perfil no Google Maps capta quem busca "perto de mim". O Site recebe esse visitante, encanta com sua autoridade e direciona com um clique pro seu WhatsApp comercial já no ponto de compra. Ter um sem o outro é perder mais de 60% dos clientes para o concorrente ao lado!

${client}, preparei um raio-x do que podemos implementar na *${company}* para você virar a referência número 1 do seu nicho.

Você tem 5 minutos hoje ou prefere que eu te envie um vídeo rápido de 2 minutinhos mostrando essa estratégia na prática?`;

  // Audio Script (45-60s)
  const pitchAudioScript = `[Tom amigável, seguro e consultivo - Duração: ~50 segundos]

"Fala ${client}, tudo bem? Aqui é o especialista em Google e projetos web. Cara, eu estava aqui fazendo uma varredura nas buscas de ${niche} em ${region} e bati os olhos na ${company}. 

Eu percebi uma coisa clara: vocês têm um potencial absurdo, mas hoje estão deixando dinheiro na mesa para concorrentes que muitas vezes entregam um serviço inferior ao de vocês, simplesmente porque eles aparecem primeiro no Google.

O que eu desenvolvo não é aquele sitezinho padrão que um amador monta e ninguém acha. Nós criamos projetos com SEO técnico Nota 100, velocidade extrema e um design pensado cirurgicamente pra deixar o seu cliente encantado na hora que bate o olho. E o principal: a gente amarra o Google Meu Negócio nota 100 direto no site, com botão de WhatsApp inteligente. Quem busca no Google cai no seu perfil, entra no seu site, se apaixona pelo seu trabalho e te chama pra fechar.

Queria te mostrar rapidinho como a gente coloca a ${company} no topo do Google. Me dá um alô aqui se posso te mandar uma prévia!"`;

  // Email or Proposal Pitch
  const pitchEmailOrProposal = `Assunto: Estratégia de Captação e Domínio no Google para a ${company} (${niche})

Prezado(a) ${client},

Espero que este e-mail o(a) encontre bem.

Nosso estúdio é especializado em desenvolvimento de ecossistemas digitais de alta conversão, unindo **Otimização Avançada no Google (SEO Nota 100)**, **Design de Alto Impacto** e a integração estratégica com o **Google Meu Negócio**.

Identificamos uma grande janela de oportunidade para a **${company}** no segmento de **${niche}** em **${region}**. A grande maioria das empresas comete um dos dois erros fatais:
1. Possuem apenas redes sociais (onde a atenção do usuário é dispersa e passageira);
2. Têm um site desatualizado, lento e sem SEO, que não aparece no Google quando o cliente mais precisa.

Nossa entrega para a ${company} inclui:
• **Engenharia de SEO Nota 100**: Arquitetura semântica, Schema.org e velocidade mobile máxima (< 1.2s) para ranquear organicamente no topo das buscas do Google.
• **Design Exclusivo que Encanta**: Layout premium, hierarquia visual magnética e copywriting persuasivo desenhados para gerar autoridade imediata e percepção de alto padrão.
• **Sinergia Total com Google Meu Negócio**: O perfil local 100/100 atrai a busca por proximidade no Google Maps e o site converte o lead em contato direto via WhatsApp.

Gostaria de agendar uma breve conversa de 10 minutos para demonstrar o plano de implementação desenhado para o seu negócio.

Qual o melhor dia e horário para conversarmos?

Atenciosamente,
Especialista em Ecossistemas Digitais & SEO`;

  return {
    clientName: client,
    companyName: company,
    niche,
    targetSolution: request.targetSolution,
    generatedAt: new Date().toISOString(),
    headline: `Roteiro de Abordagem & Fechamento de Alto Padrão para ${client} (${company})`,
    summaryExecutive: `Estratégia focada em demonstrar autoridade, expor a perda diária de faturamento para concorrentes do Google e posicionar o Combo SEO 100 + Design Encantador + Google Meu Negócio como ativo de vendas obrigatório.`,
    pitchWhatsApp,
    pitchAudioScript,
    pitchEmailOrProposal,
    differentiators: [
      {
        id: 'seo_100',
        title: 'SEO Técnico Nota 100 no Google',
        headline: 'Ranqueamento orgânico de verdade na 1ª página sem depender de anúncios caros',
        explanation: 'Todo o código é desenvolvido seguindo as diretrizes máximas do Google: marcações estruturadas Schema.org, metatags OpenGraph/Twitter, títulos semânticos h1-h4, sitemap dinâmico e performance 95-100 no Google Lighthouse.',
        whyItMatters: 'Enquanto outros cobram mensalidades eternas de anúncios para aparecer, seu site ganha relevância orgânica sólida e perene no buscador mais usado do mundo.'
      },
      {
        id: 'design_encanta',
        title: 'Design que Encanta e Cativa à Primeira Vista',
        headline: 'Estética magnética que separa você de amadores e eleva o valor percebido',
        explanation: 'Construído sob o rigor do Master Prompt 7.0 World-Class: tipografia precisa, contrastes acessíveis, microinterações fluidas e layout que transmite riqueza, seriedade e confiabilidade instantânea.',
        whyItMatters: 'O cliente decide em 3 segundos se confia ou fecha a aba. Um design encantador valida o seu preço mais alto e faz o cliente sentir que está contratando o melhor da categoria.'
      },
      {
        id: 'dupla_infalivel',
        title: 'A Dobradinha Imbatível: Google Meu Negócio + Site Completo',
        headline: 'A engrenagem perfeita que capta no Maps e converte no WhatsApp',
        explanation: 'O Google Meu Negócio captura quem pesquisa no Maps ou busca "perto de mim". O Site / Landing Page valida os diferenciais, depoimentos, fotos e portfólio. Os dois trabalhando integrados multiplicam as conversões.',
        whyItMatters: 'Ter só o perfil no Maps perde os clientes mais exigentes que pesquisam o site antes de ligar. Ter só o site sem GMN perde toda a busca geolocalizada da sua cidade. Juntos, dominam a busca de ponta a ponta.'
      },
      {
        id: 'conversao_whatsapp',
        title: 'Conversão Cirúrgica para WhatsApp',
        headline: 'Botões inteligentes, gatilhos mentais e rastreamento de leads',
        explanation: 'Chamadas para ação posicionadas no momento exato de maior interesse do leitor, com links diretos que abrem o WhatsApp com mensagem pré-configurada para facilitar a resposta.',
        whyItMatters: 'Menos cliques para o cliente falar com você significa mais orçamentos fechados na semana.'
      },
      {
        id: 'velocidade_brutal',
        title: 'Velocidade Extrema (< 1.2 segundos)',
        headline: 'Carregamento instantâneo em 4G/5G sem travar ou perder visitantes',
        explanation: 'Arquitetura moderna (Vite/Astro/Tailwind), imagens compactadas em WebP de última geração e carregamento assíncrono para garantir pontuação verde no Google Core Web Vitals.',
        whyItMatters: 'A cada 1 segundo a mais que um site demora para abrir, 20% das pessoas desistem e vão direto para o concorrente.'
      }
    ],
    preventiveObjections: [
      {
        id: 'prev_insta',
        objection: 'Já tenho Instagram e posto todo dia',
        trigger: 'O cliente acha que rede social substitui site e Google.',
        counterAngle: 'Intenção vs Distração. No Instagram a pessoa busca entretenimento; no Google ela busca contratar agora.',
        scriptSnippet: 'O Instagram é ótimo para relacionamento, mas quem entra lá está rolando o feed para se distrair. Quando alguém precisa de ${niche} com urgência para pagar, essa pessoa abre o GOOGLE. E se você não estiver no topo com um site que passe credibilidade imediata, ela fecha com quem estiver.'
      },
      {
        id: 'prev_caro',
        objection: 'Achei o investimento alto / Está fora do meu orçamento',
        trigger: 'O cliente olha como custo e não como máquina de novos clientes.',
        counterAngle: 'Quantos novos clientes a mais por mês pagam o site para sempre?',
        scriptSnippet: 'Pensar no valor é super normal, ${client}. Mas me responda com sinceridade: quanto vale um único cliente fechado no seu negócio? Se esse site com SEO 100 e Google Meu Negócio te trouxer apenas UM ou DOIS clientes extras no mês, o projeto já se pagou integralmente. Dali pra frente, é lucro líquido entrando no seu bolso todos os meses.'
      },
      {
        id: 'prev_sobrinho',
        objection: 'Tenho um amigo / sobrinho que faz por R$ 300',
        trigger: 'Comparação de preço com soluções amadoras de Wix ou WordPress quebrado.',
        counterAngle: 'Site amador afasta clientes de alto ticket e é invisível no Google.',
        scriptSnippet: 'Site de 300 reais qualquer um faz no fim de semana, mas sabe qual o custo real dele? É afastar os clientes que pagam bem porque o site parece amador, além de ficar na página 10 do Google onde ninguém nunca vai achar. O que eu entrego é engenharia de faturamento com SEO 100 e design que encanta. É a diferença entre um brinquedo e uma ferramenta de lucro.'
      },
      {
        id: 'prev_gmn_alone',
        objection: 'Meu Google Meu Negócio já está funcionando, preciso mesmo de site?',
        trigger: 'Acredita que o perfil no Maps é autossuficiente.',
        counterAngle: 'Os clientes mais qualificados clicam no botão "Website" para checar autoridade.',
        scriptSnippet: 'Que ótimo que você já tem o perfil! Mas os dados do próprio Google mostram que mais de 65% das pessoas que pesquisam empresas locais clicam no botão do SITE antes de mandar mensagem, justamente para checar se a empresa é séria, ver fotos reais e entender os serviços. Sem o site, você está jogando fora mais da metade das pessoas que já encontraram você!'
      }
    ],
    whyGmnAndSiteTogether: {
      gmnRole: 'O Google Meu Negócio é o ÍMÃ LOCAL: captura as pesquisas de pessoas na sua cidade ou bairro procurando "onde encontrar", "telefone", "horário de funcionamento" e rotas no Google Maps.',
      siteRole: 'O Site / Landing Page é o FECHADOR DE CONTRATOS: apresenta sua autoridade máxima, diferenciais exclusivos, fotos de alta qualidade, depoimentos com prova social e quebra de dúvidas, conduzindo direto ao WhatsApp de vendas.',
      theFatalMistake: 'Ter só o Perfil sem Site passa impressão de negócio pequeno ou amador e perde o cliente qualificado que quer detalhes. Ter só o Site sem Perfil perde o público quente do Google Maps.',
      theWinningCombo: 'A união dos dois cria uma barreira contra a concorrência. Quando o cliente pesquisa no Google, ele vê sua nota no Maps, clica no seu site encantador e te manda mensagem no WhatsApp com 90% da decisão já tomada!'
    },
    seoNota100Explanation: {
      definition: 'SEO Nota 100 significa atender a todos os 4 pilares do algoritmo do Google: Técnico (código limpo e veloz), On-Page (palavras-chave e títulos perfeitos), Semântico (marcações Schema.org e Rich Snippets) e Experiência do Usuário (Core Web Vitals).',
      howWeBuild: 'Nossos projetos são estruturados com meta tags canônicas, microdados locais (LocalBusiness), semântica HTML5 estrita e compressão moderna que garante tempo de carregamento inferior a 1.2 segundos no celular.',
      commercialAdvantage: 'Isso coloca a sua empresa nos primeiros resultados do Google de forma orgânica, trazendo contatos sem a obrigação de gastar fortunas todo santo dia em anúncios.'
    },
    visualCharmExplanation: {
      definition: 'Design que Encanta não é apenas "bonitinho": é neurodesign aplicado. Usa contrastes profissionais, espaços em branco respiráveis, tipografia elegante e hierarquia visual que direciona o olhar do visitante direto para o botão de ação.',
      impactOnClient: 'O cliente sente inconscientemente que a sua empresa é a mais moderna, confiável e profissional da cidade, justificando você cobrar mais caro e fechar com mais facilidade.'
    }
  };
}

/**
 * Intelligent Objection Solver: Takes what the client said and crafts the most effective counter-attack response
 */
export function solveHeuristicObjection(request: ObjectionSolverRequest): ObjectionSolverResult {
  const client = (request.clientName || 'Cliente').trim();
  const company = (request.companyName || 'sua empresa').trim();
  const raw = (request.clientResponse || '').toLowerCase();

  // Pattern detection
  const isPrice = /caro|preço|preco|custo|dinheiro|grana|orçamento|orcamento|verba|valor|desconto|salgado|barato/i.test(raw);
  const isInstagram = /insta|instagram|rede social|facebook|stories|feed|já tenho/i.test(raw) && !isPrice;
  const isCompetitorOrNephew = /sobrinho|amigo|conhecido|concorrente|300|200|500|mais barato|outro profissional|agência/i.test(raw);
  const isPartnerOrDelay = /sócio|socio|esposa|marido|pensar|depois|semana que vem|mês que vem|mes que vem|ano que vem|vou ver|aviso/i.test(raw);
  const isBadPastExperience = /já fiz|ja fiz|antigo|não deu certo|nao deu|não funcionou|sem resultado|decepcionou/i.test(raw);
  const isNoTime = /tempo|correria|ocupado|sem tempo|não consigo/i.test(raw);
  const isGmnAlone = /só o google|ja tenho google|meu negócio já|meu negocio|maps/i.test(raw);

  if (isPrice) {
    return {
      detectedCategory: 'Objeção de Preço / Custo vs Retorno do Investimento (ROI)',
      categoryBadge: 'PREÇO / ROI',
      psychologyInsight: 'O cliente não está dizendo que não tem dinheiro; ele está dizendo que ainda não enxergou que o retorno gerado pelo site será muito maior do que o valor investido. O foco precisa ser a matemática do negócio dele e o custo invisível de não ter o site.',
      whatsappReply: `Entendo perfeitamente, ${client}. Investir com responsabilidade é o que mantém qualquer negócio saudável.

Mas me tire uma dúvida rápida: no seu segmento, quanto é o ticket médio de um cliente ou serviço que você fecha?

Se esse ecossistema com *SEO Nota 100* e *Google Meu Negócio* te trouxer apenas *1 ou 2 clientes a mais no mês* (clientes que hoje estão indo direto pro concorrente que aparece no topo do Google), esse projeto já não teria se pago totalmente?

A verdade é que você já está pagando por um site hoje, só que está pagando em forma de **clientes que você perde todos os dias** para quem está no Google.

Para te ajudar a viabilizar isso hoje mesmo, consigo facilitar em até 12x no cartão ou com entrada + parcelamento. Podemos fechar e já iniciar a estrutura técnica essa semana?`,
      audioScript: `"Oi ${client}, tudo bem? Compreendo totalmente a sua cautela com o investimento, faz todo o sentido. Mas pensa comigo: quanto vale um único cliente novo na ${company}? Se a gente colocar esse site no ar, com SEO nota 100 e o Google Meu Negócio voando, e ele te trouxer dois clientes novos no mês inteiro... o investimento já voltou pro seu bolso! O resto do ano é lucro puro. O que a gente tá construindo aqui não é gasto, é uma máquina de vendas trabalhando por você 24 horas. Vamos fazer o seguinte: me diz como fica mais confortável pra você em termos de pagamento que eu ajusto aqui e a gente começa já!"`,
      roiArgument: `Cálculo de ROI Rápido:
• Ticket médio estimado do nicho: R$ 500 a R$ 2.500 por cliente.
• 2 novos clientes no mês = R$ 1.000 a R$ 5.000 em faturamento extra.
• Em 12 meses, são de R$ 12.000 a R$ 60.000 a mais entrando no caixa.
• Conclusão: O investimento no site se paga nos primeiros 30 a 60 dias; o restante é ativo que se valoriza.`,
      urgencyCloser: `Bônus de Fechamento Imediato: Fechando até amanhã, incluo a Auditoria Completa e Otimização 100/100 do seu Google Meu Negócio sem custo adicional (economia de R$ 650,00).`,
      followUpPlan: 'Aguardar 4 horas. Se não responder, mandar print de uma busca real no Google mostrando o concorrente local no topo.'
    };
  }

  if (isInstagram) {
    return {
      detectedCategory: 'Ilusão de Suficiência do Instagram (Rede Social vs Mecanismo de Busca)',
      categoryBadge: 'INSTAGRAM VS GOOGLE',
      psychologyInsight: 'O cliente confunde "atenção de lazer" com "intenção de compra". No Instagram as pessoas entram para se entreter; no Google elas entram com o cartão de crédito na mão para resolver uma urgência.',
      whatsappReply: `Com certeza, ${client}! O Instagram é sensacional e você deve continuar postando lá. 

A diferença crucial é a **intenção de quem está usando**:

📱 *No Instagram*: As pessoas estão passando o tempo, vendo memes e amigos. Ninguém acorda e pesquisa no Instagram: *"clínica médica de emergência"* ou *"advogado em minha cidade"*.
🔍 *No Google*: Quando a pessoa pesquisa, ela tem uma **necessidade urgente e dinheiro na mão**. Ela não quer ver dancinha nem story: ela quer ver autoridade, ver se a empresa é séria e clicar no WhatsApp para fechar.

Mais de 70% dos seus clientes em potencial buscam primeiro no Google. Se você tem só o Instagram, você está deixando 100% dessa fatia de clientes pronta para comprar de bandeja para os seus concorrentes.

O site com SEO 100 e Google Meu Negócio vai capturar exatamente quem está no Google pronto para contratar você hoje. Faz sentido pra você?`,
      audioScript: `"Fala ${client}! Cara, excelente você ter um Instagram ativo, isso é ótimo! Mas deixa eu te explicar uma dinâmica que mudou o faturamento dos meus clientes: no Instagram você precisa ficar caçando a atenção das pessoas o dia inteiro. No Google acontece o contrário: o cliente já está com o problema na mão e é ELE quem está procurando desesperadamente por você. Se você só tem Instagram, quando esse cara busca no Google, adivinha quem ele acha? O seu concorrente que tem site e perfil no Maps. O site profissional com SEO 100 não substitui seu Instagram, ele complementa transformando a busca do Google em mensagens no seu WhatsApp!"`,
      roiArgument: `Comparativo de Conversão:
• Taxa de conversão média de leads frios no Instagram: 0,8% a 1,5%
• Taxa de conversão de pesquisa orgânica no Google (fundo de funil com alta intenção): 8,5% a 14%
• Conclusão: O tráfego do Google converte até 8x mais rápido porque o cliente já decidiu que quer comprar.`,
      urgencyCloser: `Bônus Especial: Integrar os seus melhores destaques do Instagram diretamente no novo site para que seus visitantes do Google vejam sua prova social instantaneamente.`,
      followUpPlan: 'Se não responder em 24h, enviar: "Você sabia que mais de 80% dos clientes de ticket mais alto pesquisam o site de uma empresa antes de fechar qualquer contrato pelo Instagram?"'
    };
  }

  if (isCompetitorOrNephew) {
    return {
      detectedCategory: 'Concorrente Barato / "Sobrinho que faz por R$ 300"',
      categoryBadge: 'QUALIDADE VS AMADORISMO',
      psychologyInsight: 'O cliente não conhece a diferença técnica entre um "site cartão de visitas feito em WordPress/Wix amador" e uma "engenharia de conversão com SEO Nota 100 e alta performance". Precisamos mostrar que o barato sai extremamente caro em termos de reputação e clientes perdidos.',
      whatsappReply: `Compreendo, ${client}. De fato existem pessoas que montam páginas por valores bem baixos.

Mas me permita ser muito transparente com você: sabe qual é a diferença real entre esses dois mundos?

1. **O site de 300 reais**: Geralmente é feito em plataformas lentas, com código poluído, sem marcação semântica Schema.org e sem nenhuma estratégia de SEO. Ele fica jogado na página 8 do Google, onde ninguém nunca vai encontrar. E pior: se um cliente entra e vê um visual amador, a sua empresa perde a credibilidade na hora.
2. **O nosso projeto (Padrão Master Studio)**: Criamos uma estrutura com **SEO Técnico Nota 100**, velocidade de abertura instantânea (< 1.2s no celular) e um design que **encanta e passa autoridade de empresa líder**. Além disso, integramos com o **Google Meu Negócio 100/100** para você ser encontrado de verdade no Google Maps.

Um site amador é um gasto que fica esquecido. O nosso projeto é um **ativo comercial gerador de clientes**. 

Qual é a imagem que você deseja que a ${company} transmita para os seus clientes mais exigentes?`,
      audioScript: `"Oi ${client}! Eu super entendo que você tenha encontrado opções mais baratas. Mas deixa eu te falar de amigo para empresário: site barato é o maior prejuízo que um negócio pode ter. Ele demora pra carregar, quebra no celular, o Google joga na última página porque o código é fraco e quando um cliente entra, ele sente que a sua empresa é amadora. O que a gente faz aqui é engenharia de vendas: SEO nota 100, design que faz o olho do cliente brilhar e integração direta com o Google Meu Negócio. Esse projeto não é um custo, é uma ferramenta pra te colocar na liderança do mercado. Vamos fazer um trabalho de excelência que valorize o nome da ${company}?"`,
      roiArgument: `Custo Oculto da Solução Amadora:
• Se o site amador custa R$ 300 mas afasta 3 clientes por mês de R$ 1.000:
• Prejuízo anual da solução barata: R$ 36.000,00 em vendas perdidas!
• Um site profissional com SEO 100 que atrai esses clientes gera retorno líquido exponencial.`,
      urgencyCloser: `Garantia Master Studio: Se em 90 dias após a indexação o seu site não estiver com nota de performance superior a 90 no Google e ranqueando para as principais palavras do seu nicho, nós fazemos otimizações adicionais sem cobrar nada.`,
      followUpPlan: 'Enviar comparativo visual entre um site amador genérico e a prévia do projeto da empresa dele.'
    };
  }

  if (isPartnerOrDelay) {
    return {
      detectedCategory: 'Procrastinação / Decisão com Sócio / Deixar para Depois',
      categoryBadge: 'DECISÃO / URGÊNCIA',
      psychologyInsight: 'O cliente usa o sócio ou a falta de pressa como escudo de conforto. Precisamos criar urgência real: enquanto ele espera "o momento ideal", os concorrentes locais estão se posicionando no Google e ficando com os clientes da cidade.',
      whatsappReply: `Perfeito, ${client}! Alinhar com o sócio/parceiro é fundamental para o sucesso do projeto.

Para facilitar a conversa de vocês, posso te mandar um **resumo executivo em PDF de 1 página** ou gravar um vídeo de 2 minutos explicando exatamente o retorno financeiro que esse projeto vai trazer para a ${company}?

Só tenha em mente um detalhe estratégico: o Google leva algumas semanas para ler, indexar e subir o ranqueamento orgânico das páginas. 

Quanto antes colocarmos a estrutura no ar com o **SEO Nota 100** e o **Google Meu Negócio**, mais rápido vocês começam a receber os contatos que hoje estão caindo direto na concorrência.

Quer que eu te envie o resumo agora para vocês avaliarem juntos hoje à noite?`,
      audioScript: `"Oi ${client}, certíssimo! Conversar com o sócio é o caminho certo. Inclusive, se você quiser, eu posso gravar um áudio ou mandar um videozinho de 2 minutinhos explicando direto os pontos de ROI e como a gente vai botar vocês no topo do Google, assim ele já vê de cara que é investimento e não despesa. E um ponto importante: no Google, quem chega primeiro e crava a autoridade com SEO 100 fica muito difícil de ser derrubado pela concorrência depois. Cada semana que a gente adia é uma semana a mais que os outros estão colhendo os clientes de vocês. Te mando um resuminho pra você apresentar pra ele?"`,
      roiArgument: `Custo da Inação (Custo de Esperar 30 Dias):
• Média de buscas mensais de ${request.niche || 'clientes'} no Google da região: centenas de cliques quentes.
• A cada 30 dias de adiamento, de 5 a 15 potenciais clientes fecham com outros negócios simplesmente porque não encontraram a sua empresa no topo.`,
      urgencyCloser: `Condição de Reserva de Pauta: Estou com apenas 2 vagas na fila de desenvolvimento técnico deste mês para garantir o padrão SEO Nota 100 com acompanhamento dedicado. Posso segurar uma vaga prévia para vocês até amanhã às 18h?`,
      followUpPlan: 'Enviar no dia seguinte: "Conseguiu mostrar o material para o seu sócio, ${client}? Querem fazer uma chamada rápida de 5 minutos comigo para tirar qualquer dúvida técnica?"'
    };
  }

  if (isBadPastExperience) {
    return {
      detectedCategory: 'Ceticismo por Experiência Passada Negativa',
      categoryBadge: 'EXPERIÊNCIA PASSADA RUIM',
      psychologyInsight: 'O cliente já gastou dinheiro antes com alguém que prometeu muito e entregou um site morto que ninguém visitava. Ele tem medo de se frustrar de novo. Precisamos validar a dor dele e mostrar por que o nosso método técnico é o oposto.',
      whatsappReply: `Te entendo perfeitamente, ${client}. Infelizmente o mercado está cheio de pessoas que criam um site no WordPress, jogam na internet e abandonam o cliente sem nenhuma estratégia de SEO ou posicionamento.

O motivo do seu site anterior não ter dado resultado é muito simples: **um site sem SEO Nota 100 e sem integração com Google Meu Negócio é como abrir uma loja de luxo no meio do deserto: é linda, mas ninguém passa na frente.**

Nosso método funciona justamente porque resolve isso na raiz:
1. Nós não fazemos apenas um "layout": fazemos a **engenharia técnica de SEO** para o Google indexar e recomendar a sua página.
2. Integramos com o **Google Meu Negócio Nota 100**, que é de onde vem a maior parte do tráfego local direto pro WhatsApp.
3. O design é desenhado com o **Master Prompt 7.0**, focado 100% em conversão e encantamento.

Dessa vez você não terá um "enfeite digital", mas sim um canal ativo de aquisição de clientes. Vamos fazer diferente e do jeito certo dessa vez?`,
      audioScript: `"Nossa ${client}, você não faz ideia de quantos clientes chegam até mim com essa mesma frustração! O cara pagou por um site, colocou no ar e não tocou o telefone nenhuma vez. E sabe por que isso acontece? Porque a pessoa que fez não entende nada de SEO do Google e nem de jornada de compra. Fazer site bonito qualquer um faz; colocar ele nos primeiros lugares do Google com velocidade de menos de 1 segundo e botão de WhatsApp que converte, isso é engenharia. O que a gente faz é completamente diferente do que você viu no passado. Me dá uma chance de te mostrar uma demonstração técnica pra você ver com seus próprios olhos a diferença?"`,
      roiArgument: `Diagnóstico do Fracasso Anterior vs Nosso Método:
• Site Antigo: Plataforma pesada, sem Schema.org, sem SEO Local, invisível no Google = Zero contatos.
• Novo Projeto Master: SEO Nota 100 + Google Meu Negócio 100/100 + Carregamento em 1.2s = Presença no topo das pesquisas e captação constante.`,
      urgencyCloser: `Cortesia Especial: Faço uma auditoria técnica gratuita do seu site ou presença antiga para te apontar exatamente os 5 erros graves que impediram ele de gerar resultados no passado.`,
      followUpPlan: 'Oferecer chamada de demonstração de 10 minutos para mostrar a auditoria ao vivo.'
    };
  }

  if (isGmnAlone) {
    return {
      detectedCategory: 'Ilusão de que o Google Meu Negócio Sozinho Basta',
      categoryBadge: 'GMN ISOLADO VS COMBO OURO',
      psychologyInsight: 'O cliente acha que só a ficha no Google Maps resolve. Ele não percebe que os clientes mais lucrativos e desconfiados clicam no botão "Website" para checar autoridade antes de decidir ligar.',
      whatsappReply: `Que excelente que você já tem o Perfil no Google, ${client}! Isso já é meio caminho andado.

Mas olhe só o que as estatísticas oficiais do próprio Google revelam:

Mais de **65% dos usuários que encontram uma empresa no Google Maps clicam no botão "Website"** antes de mandar mensagem ou ligar. 

Sabe por que eles fazem isso?
Porque no perfil do Google eles veem apenas informações básicas. Quando vão contratar um serviço sério de *${request.niche || 'alto valor'}*, eles querem:
• Ver a história e os diferenciais reais da empresa;
• Conferir detalhes aprofundados dos serviços e tratamentos;
• Ver se a estrutura é moderna e passa segurança;
• Se encantar com depoimentos e resultados reais.

Se a sua empresa não tem esse site completo, ou tem um site ruim, o cliente volta pro Maps e **clica no concorrente ao lado** que tem o site impecável.

O Google Meu Negócio é a porta de entrada; o Site Completo com SEO 100 é o que fecha o contrato. Ter os dois juntos é o que transforma visualizações em faturamento real!`,
      audioScript: `"Fala ${client}! Cara, parabéns por ter o Google Meu Negócio, isso é essencial! Mas olha que loucura: você sabia que mais de 60% das pessoas que entram na sua ficha do Maps clicam no botão de site antes de mandar WhatsApp? O cliente moderno é desconfiado. Ele quer entrar no site, ver quem você é, ver se a estrutura é top e sentir aquela confiança antes de abrir a carteira. Se você não tem o site ou tem uma página fraca, você atrai o cliente no Maps mas perde ele na hora H pro concorrente. Quando você junta o perfil nota 100 com o site nota 100, ninguém segura o seu faturamento!"`,
      roiArgument: `Efeito Funil Integrado (GMN + Site):
• 1.000 visualizações no Google Maps:
  - Sem Site: ~20 contatos no WhatsApp (conversão de 2%)
  - Com Site Encantador + SEO 100: ~65 contatos no WhatsApp (conversão de 6,5%)
• Triplica a conversão com a mesma quantidade de buscas locais!`,
      urgencyCloser: `Bônus Combo: Ao fechar o site completo, fazemos a sincronização e interligação semântica do seu Google Meu Negócio com o novo site para dobrar o peso de relevância do seu perfil no Maps.`,
      followUpPlan: 'Enviar print de ficha de concorrente forte que já usa site integrado.'
    };
  }

  // Generic / Default Objection Handling
  return {
    detectedCategory: 'Hesitação Geral de Fechamento / Análise de Risco',
    categoryBadge: 'FECHAMENTO ESTRATÉGICO',
    psychologyInsight: 'O cliente está indeciso e precisa de um empurrão de autoridade, segurança e facilidade para dizer sim agora.',
    whatsappReply: `Compreendo perfeitamente o seu ponto de vista, ${client}. 

Nosso objetivo com a *${company}* é muito claro: não estamos falando de ter apenas "um site na internet", mas sim de construir um **canal ativo de aquisição de clientes que trabalhe por você 24 horas por dia**.

Com o **SEO Técnico Nota 100** e o **Google Meu Negócio** rodando juntos:
1. Você para de depender exclusivamente de indicações ou de ficar postando o dia todo no Instagram;
2. Seu negócio passa a atrair clientes qualificados no exato momento em que eles buscam pelo seu serviço no Google;
3. O design encantador valoriza a sua marca e permite que você pratique preços melhores sem clientes reclamando.

O que falta para darmos início ao projeto e garantirmos a sua empresa na 1ª página do Google? Vamos alinhar os detalhes hoje?`,
    audioScript: `"Oi ${client}, entendi perfeitamente! Olha, meu compromisso com você é fazer da ${company} a grande referência no Google no seu segmento. O que a gente vai construir é algo muito sólido: SEO nota 100, visual espetacular que encanta seus clientes e integração total com o Google Meu Negócio. Me diz uma coisa: o que mais tá pegando pra gente fechar? É alguma questão do formato ou condição de pagamento? Me dá esse retorno que eu quero muito colocar esse projeto pra rodar pra você ainda essa semana!"`,
    roiArgument: `Equação de Valor:
• Custo de ficar como está: Perda mensal contínua de clientes para concorrentes do Google.
• Benefício do projeto: Ativo permanente que gera leads orgânicos todos os meses sem custo por clique.`,
    urgencyCloser: `Condição Especial: Fechando hoje, garantimos o cronograma prioritário de entrega com suporte direto e configuração completa de SEO Local.`,
    followUpPlan: 'Fazer contato amigável em 24h perguntando se prefere ver um exemplo prático ao vivo.'
  };
}

/**
 * Service orchestrator calling Gemini API when online with fallback to heuristic
 */
export const salesCloserEngine = {
  async generatePitch(request: SalesPitchRequest): Promise<SalesPitchResult> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const response = await fetch('/api/sales/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Graceful fallback to heuristic engine
    }
    return generateHeuristicPitch(request);
  },

  async solveObjection(request: ObjectionSolverRequest): Promise<ObjectionSolverResult> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const response = await fetch('/api/sales/solve-objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Graceful fallback to heuristic engine
    }
    return solveHeuristicObjection(request);
  }
};
