/**
 * gbp33NichosData.ts
 * Base completa de dados de SEO Local para os 33 Nichos do Google Business Profile.
 * Cada nicho contém:
 * - Categoria primária oficial do Google
 * - Categorias secundárias recomendadas
 * - 4 ou mais palavras-chave em alta no Google (alto volume e alta intenção de busca local)
 * - Modelo de descrição otimizada (até 750 caracteres com palavras-chave integradas)
 * - Catálogo de serviços recomendados
 * - Postagens prontas para o Google Meu Negócio
 * - Perguntas e Respostas (FAQ) para ranqueamento
 * - Atributos essenciais para ativar
 */

export interface GbpNicheSeoPackage {
  id: string;
  name: string;
  emoji: string;
  categoryGroup: string;
  primaryCategory: string;
  secondaryCategories: string[];
  /** Pelo menos 4 palavras-chave de altíssima busca e conversão no Google */
  topKeywordsGoogle: Array<{
    keyword: string;
    intent: 'transacional' | 'local_direta' | 'descoberta' | 'decisão';
    searchVolume: 'Muito Alto' | 'Alto' | 'Estratégico';
    recommendation: string;
  }>;
  descriptionTemplate: string;
  recommendedServices: Array<{
    name: string;
    description: string;
    priceHint: string;
  }>;
  essentialAttributes: string[];
  googlePostsTemplates: Array<{
    title: string;
    body: string;
    cta: string;
  }>;
  faqsForRanking: Array<{
    question: string;
    answer: string;
  }>;
}

export const GBP_33_NICHOS_SEO_PACKAGES: Record<string, GbpNicheSeoPackage> = {
  // ================= 1. SAÚDE & BEM-ESTAR (7 nichos) =================
  clinica_estetica: {
    id: 'clinica_estetica',
    name: 'Clínica de Estética',
    emoji: '✨',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Clínica de estética',
    secondaryCategories: ['Centro de estética', 'Clínica de cuidados com a pele', 'Salão de beleza', 'Massoterapeuta'],
    topKeywordsGoogle: [
      { keyword: 'clínica de estética em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Usar nos primeiros 150 caracteres da descrição e em posts semanais.' },
      { keyword: 'harmonização facial e botox perto de mim', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Cadastrar como serviço prioritário no Catálogo do Google.' },
      { keyword: 'limpeza de pele profunda e peeling [bairro]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Incluir no texto de perguntas frequentes (Q&A).' },
      { keyword: 'melhor clínica de estética [cidade] avaliações', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Incentivar clientes a citar tratamentos nas avaliações 5 estrelas.' },
      { keyword: 'drenagem linfática e estética corporal [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Usar no catálogo de produtos e serviços do perfil.' },
    ],
    descriptionTemplate:
      'Referência em estética avançada, facial e corporal em [cidade]. Na [Nome da Empresa], unimos tecnologia de ponta, protocolos personalizados e profissionais pós-graduados para realçar sua beleza natural com total segurança. Tratamentos especializados: harmonização facial, toxina botulínica (botox), preenchimento com ácido hialurônico, bioestimuladores de colágeno, limpeza de pele profunda, tratamentos para manchas (melasma) e rejuvenescimento. Ambiente moderno, higienizado e acolhedor no bairro [bairro]. Agende sua avaliação personalizada pelo WhatsApp!',
    recommendedServices: [
      { name: 'Harmonização Facial e Botox', description: 'Aplicação de toxina botulínica e bioestimuladores para rejuvenescimento natural e linhas de expressão.', priceHint: 'Sob avaliação' },
      { name: 'Limpeza de Pele Profunda com Hidratação', description: 'Remoção de impurezas, cravos e renovação celular com tecnologia e dermocosméticos de alta performance.', priceHint: 'A partir de R$ 180' },
      { name: 'Bioestimulador de Colágeno (Radiesse/Sculptra)', description: 'Recuperação da firmeza e contorno facial e corporal com estímulo biológico.', priceHint: 'Sob consulta' },
      { name: 'Drenagem Linfática e Modeladora', description: 'Redução de retenção líquida, inchaço e contorno corporal.', priceHint: 'Pacotes disponíveis' },
    ],
    essentialAttributes: ['Banheiro com acessibilidade', 'Wi-Fi gratuito', 'Aceita cartões de crédito e débito', 'Aceita Pix', 'Agendamento prévio necessário'],
    googlePostsTemplates: [
      {
        title: 'Renove Sua Pele com Protocolos de Alta Performance',
        body: 'Descubra tratamentos estéticos que valorizam sua autenticidade com segurança médica e conforto absoluto em [cidade]. Toque no botão e converse com nossas especialistas no WhatsApp!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Quais os tratamentos estéticos mais procurados na clínica?',
        answer: 'Oferecemos harmonização facial, aplicação de botox, bioestimuladores de colágeno, limpeza de pele profunda, peelings químicos e tratamentos para flacidez corporal em [cidade].',
      },
      {
        question: 'Como agendar uma avaliação estética personalizada?',
        answer: 'Você pode agendar diretamente pelo nosso WhatsApp oficial ou telefone. Realizamos análise prévia minuciosa para indicar o protocolo ideal para sua pele.',
      },
    ],
  },

  clinica_medica: {
    id: 'clinica_medica',
    name: 'Clínica Médica',
    emoji: '🏥',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Clínica médica',
    secondaryCategories: ['Centro médico', 'Clínica de especialidades', 'Médico de clínica geral', 'Laboratório de análises clínicas'],
    topKeywordsGoogle: [
      { keyword: 'clínica médica em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo central de taxonomia local.' },
      { keyword: 'consulta médica particular com especialistas [bairro]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Inserir na descrição e em serviços.' },
      { keyword: 'médico perto de mim com agendamento rápido', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Destacar agendamento ágil no botão do perfil.' },
      { keyword: 'exames e consultas médicas em [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Mencionar check-ups e exames laboratoriais integrados.' },
    ],
    descriptionTemplate:
      'A [Nome da Empresa] é um centro médico integrado em [cidade] focado em saúde humanizada, diagnósticos precisos e atendimento acolhedor. Contamos com corpo clínico multidisciplinar em diversas especialidades médicas, além de exames laboratoriais e preventivos no mesmo local. Estrutura moderna com total acessibilidade, pontualidade nas consultas e convênio com os principais planos ou condições facilitadas no particular. Cuide da saúde da sua família com quem é referência em cuidado ético e resolutivo.',
    recommendedServices: [
      { name: 'Consulta Médica Especializada', description: 'Atendimento humanizado com diagnóstico detalhado e acompanhamento contínuo.', priceHint: 'Particular e Convênios' },
      { name: 'Check-up Preventivo Geral', description: 'Bateria integrada de exames e consultas para diagnóstico precoce e longevidade.', priceHint: 'Sob consulta' },
      { name: 'Exames Laboratoriais e Diagnósticos', description: 'Coleta de sangue, urina e exames diagnósticos com laudos rápidos.', priceHint: 'Tabela de exames' },
    ],
    essentialAttributes: ['Entrada acessível para cadeira de rodas', 'Estacionamento acessível', 'Banheiro adaptado', 'Aceita convênios médicos', 'Wi-Fi gratuito'],
    googlePostsTemplates: [
      {
        title: 'Sua Saúde em Dia: Agendamento Rápido de Consultas',
        body: 'Não adie seus exames de rotina. Nossa equipe de especialistas está pronta para acolher você e sua família em [cidade] com conforto e precisão diagnóstica.',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Quais especialidades médicas atendem na clínica?',
        answer: 'Dispomos de clínica geral, cardiologia, ginecologia, dermatologia, ortopedia, endocrinologia e pediatria em [cidade].',
      },
    ],
  },

  medico_landing: {
    id: 'medico_landing',
    name: 'Médico (Landing Page Pessoal)',
    emoji: '👨‍⚕️',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Médico',
    secondaryCategories: ['Cirurgião', 'Especialista em saúde', 'Consultório médico'],
    topKeywordsGoogle: [
      { keyword: 'médico [especialidade] em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Palavra-chave principal de autoridade no Google.' },
      { keyword: 'melhor especialista em [especialidade] [cidade] avaliações', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Crucial para conversão via avaliações.' },
      { keyword: 'consulta com Dr. [Nome] [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Fortalecer buscas de marca pessoal.' },
      { keyword: 'tratamento de [patologia/condição] [cidade]', intent: 'descoberta', searchVolume: 'Muito Alto', recommendation: 'Criar posts informativos no perfil do Google.' },
    ],
    descriptionTemplate:
      'Consultório do Dr(a). [Nome do Médico], médico especialista em [Especialidade] com CRM [Número] e RQE [Número] em [cidade]. Dedicado(a) ao diagnóstico preciso, prevenção e tratamento avançado de [Condições Tratadas], com abordagem empática e rigor científico. Atendimento presencial e telemedicina conforme normas do CFM. Consultório privativo, confortável e com estacionamento no local. Agende sua consulta para um cuidado de excelência e atenção dedicada à sua saúde.',
    recommendedServices: [
      { name: 'Primeira Consulta e Diagnóstico Clínico', description: 'Análise minuciosa do histórico clínico, solicitação de exames e plano terapêutico individualizado.', priceHint: 'Sob consulta' },
      { name: 'Acompanhamento e Retorno', description: 'Monitoramento da evolução do tratamento e ajuste terapêutico.', priceHint: 'Incluso no protocolo' },
    ],
    essentialAttributes: ['Identifica-se como empresa de profissional de saúde', 'Acesso para cadeirantes', 'Consulta presencial e online'],
    googlePostsTemplates: [
      {
        title: 'Cuidado Médico de Excelência em [cidade]',
        body: 'Prevenção e tratamento especializado com atenção personalizada para suas necessidades de saúde. Agende sua consulta.',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'O Dr(a). atende convênios ou somente particular?',
        answer: 'Realizamos atendimentos particulares com emissão de recibo detalhado para solicitação de reembolso junto ao seu plano de saúde.',
      },
    ],
  },

  fisioterapeuta: {
    id: 'fisioterapeuta',
    name: 'Fisioterapeuta (Landing Page Pessoal)',
    emoji: '💪',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Fisioterapeuta',
    secondaryCategories: ['Clínica de fisioterapia', 'Centro de reabilitação', 'Instrutor de pilates'],
    topKeywordsGoogle: [
      { keyword: 'fisioterapeuta em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Palavra-chave central para o ranking local.' },
      { keyword: 'tratamento de dor na coluna e hérnia de disco [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço de alta demanda e busca imediata.' },
      { keyword: 'reabilitação ortopédica e pós-operatório [bairro]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Cadastrar nas áreas de atendimento do perfil.' },
      { keyword: 'fisioterapia esportiva perto de mim', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Usar em produtos/serviços e postagens.' },
    ],
    descriptionTemplate:
      'Dr(a). [Nome do Profissional], fisioterapeuta especialista em reabilitação ortopédica, alívio de dores crônicas e fisioterapia esportiva em [cidade] (CREFITO: [Número]). Protocolos modernos e individualizados para tratamento de dores na coluna, hérnia de disco, tendinites, recuperação pós-cirúrgica e retorno seguro às atividades físicas. Consultório equipado com eletroterapia, terapia manual e exercícios funcionais. Recupere sua mobilidade e qualidade de vida sem dor. Agende sua avaliação!',
    recommendedServices: [
      { name: 'Avaliação Biomecânica e Postural', description: 'Diagnóstico cinesiológico funcional completo para identificar a causa raiz da dor.', priceHint: 'Sob consulta' },
      { name: 'Sessão de Fisioterapia Ortopédica / Terapia Manual', description: 'Técnicas manuais e recursos modernos para alívio imediato da dor e restauração da mobilidade.', priceHint: 'A partir de R$ 150' },
      { name: 'Reabilitação Pós-Operatória Ortopédica', description: 'Protocolos seguros para recuperação de cirurgias de joelho, ombro, quadril e coluna.', priceHint: 'Planos mensais' },
    ],
    essentialAttributes: ['Acessível para cadeirantes', 'Agendamento prévio', 'Atendimento individualizado'],
    googlePostsTemplates: [
      {
        title: 'Livre-se das Dores na Coluna com Fisioterapia Baseada em Evidências',
        body: 'Descubra como nosso método de reabilitação ajuda você a voltar a se mover com liberdade e sem dor em [cidade].',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Quantas sessões de fisioterapia são necessárias para aliviar a dor?',
        answer: 'Na maioria dos casos de dor aguda, os pacientes relatam alívio perceptível já nas primeiras 3 a 5 sessões, variando conforme a avaliação individual.',
      },
    ],
  },

  dentista: {
    id: 'dentista',
    name: 'Dentista / Clínica Odontológica',
    emoji: '🦷',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Clínica odontológica',
    secondaryCategories: ['Dentista', 'Ortodontista', 'Cirurgião dentista', 'Clínica de clareamento dental'],
    topKeywordsGoogle: [
      { keyword: 'dentista em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo de maior volume de busca no Google Maps.' },
      { keyword: 'implantes dentários e próteses [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço de maior ticket e alta conversão.' },
      { keyword: 'aparelho invisível e alinhadores transparentes [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Promover com fotos antes/depois no perfil.' },
      { keyword: 'urgência odontológica e clareamento dental [bairro]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar em Q&A e horários estendidos.' },
      { keyword: 'melhor clínica odontológica em [cidade] avaliações', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Pedir avaliações mencionando higiene e conforto.' },
    ],
    descriptionTemplate:
      'Sua referência em odontologia moderna, implantes e estética do sorriso em [cidade]. A [Nome da Clínica] oferece atendimento odontológico completo, acolhedor e sem dor para toda a família. Especialidades: implantes dentários com carga rápida, alinhadores transparentes invisíveis, clareamento dental a laser, facetas e lentes de contato dental, próteses, tratamento de canal e profilaxia preventiva. Tecnologia digital, raio-X no local e equipe multidisciplinar. Conquiste o sorriso que você merece. Agende sua avaliação!',
    recommendedServices: [
      { name: 'Implantes Dentários de Alta Tecnologia', description: 'Recuperação funcional e estética com materiais premium de osseointegração rápida.', priceHint: 'Sob avaliação' },
      { name: 'Alinhadores Transparentes e Ortodontia Digital', description: 'Correção ortodôntica discreta, confortável e rápida sem fios metálicos.', priceHint: 'Planejamento 3D' },
      { name: 'Clareamento Dental Profissional a Laser', description: 'Sorriso mais branco e luminoso em sessões seguras e supervisionadas.', priceHint: 'A partir de R$ 500' },
      { name: 'Lentes de Contato e Facetas em Resina/Porcelana', description: 'Transformação estética do formato, cor e alinhamento do sorriso.', priceHint: 'Sob medida' },
    ],
    essentialAttributes: ['Atendimento com hora marcada', 'Raio-X odontológico no local', 'Acesso para cadeirantes', 'Cartões de crédito em até 12x', 'Pix'],
    googlePostsTemplates: [
      {
        title: 'Transforme seu Sorriso com Alinhadores Invisíveis e Implantes',
        body: 'Tecnologia digital sem dor e equipe especializada em [cidade]. Agende sua avaliação odontológica pelo WhatsApp hoje mesmo!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Colocar implante dentário dói?',
        answer: 'Não. O procedimento é realizado sob anestesia local moderna, sendo totalmente indolor e com recuperação rápida e orientada.',
      },
      {
        question: 'Vocês realizam atendimento odontológico aos sábados?',
        answer: 'Sim, atendemos com horários especiais aos sábados para sua conveniência mediante agendamento prévio.',
      },
    ],
  },

  psicologo: {
    id: 'psicologo',
    name: 'Psicólogo / Terapeuta',
    emoji: '🧠',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Psicólogo',
    secondaryCategories: ['Psicoterapeuta', 'Clínica de psicologia', 'Conselheiro'],
    topKeywordsGoogle: [
      { keyword: 'psicólogo em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo raiz mais pesquisado no Google.' },
      { keyword: 'terapia para ansiedade e depressão [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Maior motivo de busca por psicoterapia.' },
      { keyword: 'psicólogo online e presencial perto de mim', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Informar modalidades de atendimento.' },
      { keyword: 'terapia de casal e familiar em [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Cadastrar como serviço secundário no perfil.' },
    ],
    descriptionTemplate:
      'Psicólogo(a) [Nome do Profissional] (CRP: [Número]) em [cidade]. Atendimento clínico acolhedor e confidencial com base na Terapia Cognitivo-Comportamental (TCC) e abordagens humanistas para adolescentes, adultos e casais. Foco terapêutico no manejo da ansiedade, depressão, estresse, autoconhecimento, transições de carreira e conflitos nos relacionamentos. Atendimento presencial em consultório confortável e sigiloso ou por telepsicologia com plataforma segura autorizada pelo CFP. Dê o primeiro passo em direção ao seu bem-estar emocional.',
    recommendedServices: [
      { name: 'Psicoterapia Individual para Adultos', description: 'Sessões semanais focadas em saúde mental, manejo de estresse e inteligência emocional.', priceHint: 'Sob consulta' },
      { name: 'Terapia para Ansiedade e Síndrome do Pânico', description: 'Intervenções científicas estruturadas para recuperação do controle e tranquilidade.', priceHint: 'Sessão 50min' },
      { name: 'Terapia de Casal', description: 'Mediação de conflitos, fortalecimento do vínculo afetivo e comunicação assertiva.', priceHint: 'Sessão estruturada' },
    ],
    essentialAttributes: ['Ambiente acolhedor e silencioso', 'Atendimento presencial e online', 'Horários flexíveis'],
    googlePostsTemplates: [
      {
        title: 'Cuidar da Sua Saúde Mental é um Ato de Coragem',
        body: 'Espaço seguro, sigiloso e acolhedor para você superar a ansiedade e construir uma vida com mais significado em [cidade].',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'Como funciona a primeira sessão de psicoterapia?',
        answer: 'A primeira consulta é uma conversa inicial acolhedora para compreender suas queixas, histórico e objetivos terapêuticos de forma empática e sem julgamentos.',
      },
    ],
  },

  nutricionista: {
    id: 'nutricionista',
    name: 'Nutricionista',
    emoji: '🥗',
    categoryGroup: 'Saúde & Bem-estar',
    primaryCategory: 'Nutricionista',
    secondaryCategories: ['Consultoria de nutrição', 'Centro de saúde e bem-estar', 'Clínica de emagrecimento'],
    topKeywordsGoogle: [
      { keyword: 'nutricionista em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo central de busca local.' },
      { keyword: 'nutricionista esportivo e emagrecimento [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Maior conversão para consultas particulares.' },
      { keyword: 'consulta com nutricionista com bioimpedância [bairro]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Destacar o exame de bioimpedância no perfil.' },
      { keyword: 'melhor nutricionista em [cidade] avaliações', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Incentivar fotos de planos e resultados reais.' },
    ],
    descriptionTemplate:
      'Nutricionista [Nome do Profissional] (CRN: [Número]) em [cidade]. Especialista em emagrecimento saudável, nutrição esportiva e reeducação alimentar sem dietas restritivas ou sofrimento. Atendimento personalizado com avaliação por exame de bioimpedância inbody, cálculo de plano alimentar individualizado no seu celular e acompanhamento contínuo por aplicativo. Estratégias realistas adaptadas à sua rotina e preferências para alcançar resultados sustentáveis e duradouros. Agende sua consulta presencial ou online!',
    recommendedServices: [
      { name: 'Consulta Nutricional com Bioimpedância', description: 'Mapeamento de gordura corporal, massa muscular, taxa metabólica basal e plano sob medida.', priceHint: 'Com retorno incluso' },
      { name: 'Nutrição Esportiva para Performance e Hipertrofia', description: 'Periodização de macronutrientes e suplementação inteligente para atletas e praticantes de atividade física.', priceHint: 'Acompanhamento trimestral' },
    ],
    essentialAttributes: ['Exame de bioimpedância no local', 'Plano entregue via aplicativo', 'Atendimento online e presencial'],
    googlePostsTemplates: [
      {
        title: 'Alcance Seus Objetivos de Saúde Sem Dietas Malucas',
        body: 'Nutrição personalizada, prática e alinhada à sua rotina em [cidade]. Descubra como emagrecer comendo o que você gosta.',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'O plano alimentar é entregue na hora da consulta?',
        answer: 'Sim, discutimos e estruturamos o cardápio juntos durante o atendimento, disponibilizando acesso imediato no aplicativo do paciente.',
      },
    ],
  },

  // ================= 2. SERVIÇOS PROFISSIONAIS (7 nichos) =================
  advocacia: {
    id: 'advocacia',
    name: 'Escritório de Advocacia',
    emoji: '⚖️',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Escritório de advocacia',
    secondaryCategories: ['Advogado', 'Advogado trabalhista', 'Advogado de família', 'Consultor jurídico'],
    topKeywordsGoogle: [
      { keyword: 'advogado em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo central de busca de urgência jurídica.' },
      { keyword: 'escritório de advocacia trabalhista e previdenciário [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Áreas de maior busca de assistência legal.' },
      { keyword: 'advogado especialista em direito de família e divórcio [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar como serviço prioritário no catálogo.' },
      { keyword: 'consulta com advogado em [cidade] whatsapp', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Configurar botão de WhatsApp direto no perfil.' },
      { keyword: 'melhores advogados em [cidade] avaliações', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Focar em avaliações com menção à pontualidade e clareza.' },
    ],
    descriptionTemplate:
      'A [Nome da Sociedade de Advogados] (OAB: [Número]) é uma banca de advocacia sediada em [cidade], reconhecida pela excelência técnica, ética e agilidade na defesa dos interesses de pessoas físicas e empresas. Áreas de atuação: Direito Trabalhista, Previdenciário (aposentadorias e revisões INSS), Direito de Família e Sucessões (divórcios, pensão e inventários), Direito do Consumidor e Direito Empresarial. Atendimento humanizado, transparente e estratégico, com acompanhamento processual digital. Conte com assessoria jurídica sólida para defender seus direitos.',
    recommendedServices: [
      { name: 'Assessoria em Direito Trabalhista', description: 'Defesa e reivindicação de direitos trabalhistas, rescisões, horas extras e acidentes de trabalho.', priceHint: 'Sob análise de viabilidade' },
      { name: 'Direito de Família, Inventários e Divórcios', description: 'Condução ágil e consensual ou litigiosa de partilha de bens, divórcio e guarda.', priceHint: 'Tabela OAB e sob consulta' },
      { name: 'Planejamento Previdenciário e Aposentadoria', description: 'Cálculo minucioso para garantir o melhor benefício financeiro no INSS.', priceHint: 'Estudo detalhado' },
    ],
    essentialAttributes: ['Estacionamento privativo', 'Atendimento com hora marcada', 'Reuniões presenciais e por videoconferência'],
    googlePostsTemplates: [
      {
        title: 'Proteja Seus Direitos com Assessoria Jurídica Especializada',
        body: 'Segurança jurídica, clareza e dedicação em cada processo em [cidade]. Fale com nossos advogados especialistas pelo WhatsApp.',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Como funciona o atendimento inicial com o advogado?',
        answer: 'Realizamos uma consulta inicial para analisar a documentação, avaliar os riscos e apresentar o plano jurídico mais seguro e eficiente para o seu caso.',
      },
    ],
  },

  arquitetura: {
    id: 'arquitetura',
    name: 'Arquitetura / Design de Interiores',
    emoji: '🏛️',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Escritório de arquitetura',
    secondaryCategories: ['Arquiteto', 'Designer de interiores', 'Consultoria de design'],
    topKeywordsGoogle: [
      { keyword: 'arquiteto em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo chave de pesquisa local.' },
      { keyword: 'projeto de arquitetura residencial e comercial [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Cadastrar no catálogo de serviços com portfólio visual.' },
      { keyword: 'design de interiores e reforma de apartamento [bairro]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Segmentar nos bairros nobres atendidos.' },
      { keyword: 'quanto custa projeto de arquitetura em [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Abordar na seção de Q&A do Google.' },
    ],
    descriptionTemplate:
      'Transformamos espaços em experiências de bem-estar, sofisticação e funcionalidade em [cidade]. O escritório [Nome do Estúdio] (CAU: [Número]) é especializado em projetos de arquitetura residencial de alto padrão, design de interiores contemporâneo e espaços comerciais que geram negócios. Da concepção conceitual em 3D fotorealista à gestão executiva e acompanhamento de obra, cuidamos de cada detalhe com rigor técnico e respeito ao seu orçamento. Realize o sonho da sua casa perfeita conosco.',
    recommendedServices: [
      { name: 'Projeto Arquitetônico Residencial Completo', description: 'Plantas executivas, aprovação em prefeitura e condomínios, e maquete eletrônica 3D.', priceHint: 'Sob medida por m²' },
      { name: 'Design de Interiores e Marcenaria', description: 'Detalhamento de iluminação, escolha de revestimentos, mobiliário e decoração sob medida.', priceHint: 'Projetos personalizados' },
      { name: 'Gerenciamento e Acompanhamento de Obra', description: 'Fiscalização de prazos, qualidade de fornecedores e controle financeiro da execução.', priceHint: 'Sob consulta' },
    ],
    essentialAttributes: ['Projetos 3D e realidade virtual', 'Atendimento presencial no estúdio', 'Projetos sustentáveis'],
    googlePostsTemplates: [
      {
        title: 'Inspire-se com Nossos Projetos de Arquitetura e Interiores',
        body: 'Design inteligente que valoriza seu imóvel e reflete sua identidade em [cidade]. Conheça nosso portfólio e agende um café!',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'O escritório atende condomínios fechados na região?',
        answer: 'Sim, possuímos vasta experiência em projetos e aprovações nos principais condomínios fechados de [cidade] e região metropolitana.',
      },
    ],
  },

  construtora: {
    id: 'construtora',
    name: 'Construtora / Incorporadora',
    emoji: '🏗️',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Construtora',
    secondaryCategories: ['Empresa de engenharia civil', 'Incorporadora imobiliária', 'Empreiteiro'],
    topKeywordsGoogle: [
      { keyword: 'construtora em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Palavra-chave primordial de negócios.' },
      { keyword: 'construção de casas em condomínio fechado [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço de altíssimo ticket e rentabilidade.' },
      { keyword: 'empresa de reformas corporativas e engenharia [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Ideal para atração de clientes B2B.' },
      { keyword: 'melhor construtora para construir em [cidade]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Destacar pontualidade na entrega e certificações.' },
    ],
    descriptionTemplate:
      'Solidez, pontualidade e engenharia de precisão em [cidade]. A [Nome da Construtora] (CREA: [Número]) é especializada em construção civil residencial de médio e alto padrão, reformas comerciais corporativas e incorporações. Contamos com engenheiros residentes, controle rigoroso de qualidade, cumprimento milimétrico de cronogramas e gestão transparente de suprimentos. Construa com segurança jurídica, excelência estrutural e garantia contratual. Solicite um orçamento técnico para sua obra.',
    recommendedServices: [
      { name: 'Construção Residencial Chave na Mão (Turnkey)', description: 'Da fundação ao acabamento final com acompanhamento de engenharia e relatórios semanais.', priceHint: 'Orçamento personalizado' },
      { name: 'Reformas Comerciais e Retrofit', description: 'Execução ágil para lojas, escritórios e clínicas com mínimo impacto operacional.', priceHint: 'Sob projeto' },
    ],
    essentialAttributes: ['Engenheiros com CREA ativo', 'Garantia estrutural de 5 anos', 'Visitas técnicas à obra'],
    googlePostsTemplates: [
      {
        title: 'Construa sua Casa dos Sonhos com Pontualidade Garantida',
        body: 'Do alicerce às chaves na mão em [cidade]. Fale com nossos engenheiros e receba uma estimativa de custos sem compromisso.',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'A construtora fornece garantia após a entrega da obra?',
        answer: 'Sim, fornecemos garantia estrutural de 5 anos com termo oficial e assistência técnica pós-obra conforme a legislação brasileira.',
      },
    ],
  },

  consultoria: {
    id: 'consultoria',
    name: 'Consultoria / Coaching',
    emoji: '💼',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Empresa de consultoria de gestão',
    secondaryCategories: ['Consultor de negócios', 'Centro de treinamento', 'Consultoria financeira'],
    topKeywordsGoogle: [
      { keyword: 'consultoria empresarial em [cidade]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Busca direta de empresários locais.' },
      { keyword: 'consultoria financeira e gestão de processos para pmes [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Destacar resultados mensuráveis de ROI.' },
      { keyword: 'coaching executivo e desenvolvimento de líderes [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar no catálogo de serviços corporativos.' },
      { keyword: 'mentoria para empresários e aumento de vendas [cidade]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Publicar estudos de caso nos posts do perfil.' },
    ],
    descriptionTemplate:
      'Impulsionamos o crescimento sustentável, a lucratividade e a liderança de empresas em [cidade]. A [Nome da Consultoria] oferece consultoria empresarial prática, reestruturação financeira, otimização de processos operacionais e coaching executivo para diretores e gestores. Métodos validados que eliminam gargalos, aumentam margens de lucro e preparam negócios para escala. Mais de [X] empresas transformadas. Agende uma sessão diagnóstica com nossos especialistas.',
    recommendedServices: [
      { name: 'Diagnóstico Empresarial Estratégico', description: 'Mapeamento de 360° da operação, gargalos financeiros e plano de ação imediato.', priceHint: 'Sessão inicial' },
      { name: 'Consultoria de Gestão Financeira e Precificação', description: 'Organização de fluxo de caixa, DRE gerencial e margem de contribuição.', priceHint: 'Projetos de 3 a 6 meses' },
    ],
    essentialAttributes: ['Atendimento presencial e online', 'Consultores seniores certificados', 'Diagnóstico inicial'],
    googlePostsTemplates: [
      {
        title: 'Aumente a Lucratividade da Sua Empresa em [cidade]',
        body: 'Identifique os pontos cegos que estão drenando o seu caixa. Agende uma análise diagnóstica com nossa equipe.',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'A consultoria atende pequenas e médias empresas (PMEs)?',
        answer: 'Sim, nossos programas são especialmente desenhados para a realidade de PMEs que precisam de processos claros e resultados rápidos.',
      },
    ],
  },

  imobiliaria: {
    id: 'imobiliaria',
    name: 'Imobiliária / Corretor',
    emoji: '🏡',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Imobiliária',
    secondaryCategories: ['Corretor de imóveis', 'Avaliador imobiliário', 'Administradora de imóveis'],
    topKeywordsGoogle: [
      { keyword: 'imobiliária em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo com maior tráfego local no Google Maps.' },
      { keyword: 'casas e apartamentos para comprar em [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Cadastrar imóveis no catálogo de produtos do Google.' },
      { keyword: 'imóveis para alugar em [bairro] [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Incluir bairros principais na descrição.' },
      { keyword: 'avaliação de imóveis e corretor de imóveis em [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Mencionar registro no CRECI.' },
    ],
    descriptionTemplate:
      'Sua melhor experiência imobiliária em [cidade] e região. A [Nome da Imobiliária] (CRECI: [Número]) é especialista em intermediação de compra, venda e locação de imóveis residenciais, comerciais e condomínios de alto padrão. Assessoria jurídica completa, avaliação imobiliária precisa, fotos profissionais dos imóveis e atendimento transparente para proteger seu patrimônio em cada etapa do negócio. Encontre o imóvel perfeito para morar ou investir.',
    recommendedServices: [
      { name: 'Venda de Imóveis Residenciais e Comerciais', description: 'Divulgação multicanal com tour virtual, fotos em alta resolução e assessoria até a escritura.', priceHint: 'Comissão padrão CRECI' },
      { name: 'Locação com Garantia e Administração Segura', description: 'Análise cadastral ágil, seguro fiança e repasse pontual aos proprietários.', priceHint: 'Taxa de administração competitiva' },
    ],
    essentialAttributes: ['Estacionamento para clientes', 'Corretores com CRECI ativo', 'Atendimento via WhatsApp e plantão'],
    googlePostsTemplates: [
      {
        title: 'Encontre o Imóvel dos Seus Sonhos em [cidade]',
        body: 'Oportunidades exclusivas nos melhores bairros com assessoria jurídica completa. Fale com um corretor agora!',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Como faço para anunciar meu imóvel com vocês?',
        answer: 'Basta entrar em contato pelo WhatsApp. Nossa equipe agenda uma visita para fotos profissionais e avaliação de mercado gratuita.',
      },
    ],
  },

  contabilidade: {
    id: 'contabilidade',
    name: 'Contabilidade / Escritório Contábil',
    emoji: '📊',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Escritório de contabilidade',
    secondaryCategories: ['Contador', 'Consultor financeiro', 'Serviço de preparação de impostos'],
    topKeywordsGoogle: [
      { keyword: 'escritório de contabilidade em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo central de busca de empresas locais.' },
      { keyword: 'abrir empresa e contabilidade para médicos e prestadores [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Nicho com alto valor e fidelidade.' },
      { keyword: 'planejamento tributário e redução de impostos [cidade]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Destacar economia de impostos legal no perfil.' },
      { keyword: 'contabilidade consultiva e bpo financeiro perto de mim', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar como produto com preço recorrente.' },
    ],
    descriptionTemplate:
      'Soluções contábeis inteligentes para sua empresa lucrar mais e pagar menos impostos dentro da lei em [cidade]. A [Nome da Contabilidade] (CRC: [Número]) oferece contabilidade consultiva, abertura rápida de empresas, planejamento tributário estratégico, folha de pagamento e BPO financeiro. Especialistas no Simples Nacional, Lucro Presumido e contabilidade para profissionais liberais, médicos, advogados e comércio. Atendimento próximo, sem burocracia e com tecnologia digital integrada.',
    recommendedServices: [
      { name: 'Abertura Grátis e Regularização de Empresas', description: 'Processo ágil em órgãos públicos, escolha do CNAE ideal e enquadramento tributário.', priceHint: 'Condição especial' },
      { name: 'Assessoria Contábil e Fiscal Mensal', description: 'Emissão de guias, escrituração digital, obrigações acessórias e suporte consultivo.', priceHint: 'Mensalidades transparentes' },
      { name: 'BPO Financeiro e Gestão de Contas', description: 'Terceirização do contas a pagar, receber, conciliação bancária e relatórios semanais.', priceHint: 'Planos sob medida' },
    ],
    essentialAttributes: ['Contabilidade 100% digital e presencial', 'Contadores certificados no CRC', 'Suporte ágil via WhatsApp'],
    googlePostsTemplates: [
      {
        title: 'Abra sua Empresa em [cidade] Sem Burocracia',
        body: 'Economize impostos desde o primeiro dia com planejamento tributário certo. Fale com nossos contadores agora!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Quanto tempo leva para abrir uma empresa na minha cidade?',
        answer: 'Com nosso processo digital integrado, abrimos seu CNPJ em média entre 3 a 7 dias úteis após a aprovação da documentação.',
      },
    ],
  },

  fotografo: {
    id: 'fotografo',
    name: 'Fotógrafo / Estúdio de Fotografia',
    emoji: '📷',
    categoryGroup: 'Serviços Profissionais',
    primaryCategory: 'Fotógrafo',
    secondaryCategories: ['Estúdio de fotografia', 'Fotógrafo de casamentos', 'Fotógrafo comercial'],
    topKeywordsGoogle: [
      { keyword: 'fotógrafo em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Palavra-chave principal de captação.' },
      { keyword: 'ensaio fotográfico profissional e corporativo [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Alta demanda para LinkedIn e perfis profissionais.' },
      { keyword: 'fotógrafo de casamento e festas em [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Ticket elevado; expor fotos premiadas.' },
      { keyword: 'ensaio gestante e família em estúdio [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Cadastrar no catálogo de produtos do Google.' },
    ],
    descriptionTemplate:
      'Eternizamos momentos únicos com sensibilidade, técnica e iluminação artística em [cidade]. O estúdio [Nome do Fotógrafo] é referência em ensaios fotográficos corporativos para posicionamento de marca, fotografia de casamentos, ensaios de gestante, família e produtos comerciais. Estúdio climatizado com cenários versáteis ou cobertura externa com equipamentos de cinema. Imagens com pós-produção refinada que contam sua história com emoção e impacto visual.',
    recommendedServices: [
      { name: 'Ensaio Corporativo de Posicionamento de Imagem', description: 'Fotos profissionais para redes sociais, LinkedIn, site e imprensa com consultoria de poses.', priceHint: 'A partir de R$ 350' },
      { name: 'Cobertura Completa de Casamentos e Eventos', description: 'Registro documental emocionante com dois fotógrafos, pré-wedding e álbum impresso de luxo.', priceHint: 'Pacotes personalizados' },
    ],
    essentialAttributes: ['Estúdio fotográfico climatizado', 'Fotos entregues em galeria online protegida', 'Atendimento com horário agendado'],
    googlePostsTemplates: [
      {
        title: 'Sua Imagem Profissional em Outro Nível',
        body: 'Fotos corporativas de alto impacto que geram autoridade e confiança imediata. Agende seu ensaio no estúdio em [cidade].',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Em quanto tempo recebo as fotos do ensaio?',
        answer: 'Entregamos a prévia para seleção em até 48 horas e as fotos finais tratadas em alta resolução em até 7 dias úteis.',
      },
    ],
  },

  // ================= 3. GASTRONOMIA (5 nichos) =================
  restaurante: {
    id: 'restaurante',
    name: 'Restaurante',
    emoji: '🍽️',
    categoryGroup: 'Gastronomia',
    primaryCategory: 'Restaurante',
    secondaryCategories: ['Restaurante de comida caseira', 'Restaurante familiar', 'Serviço de entrega de refeições'],
    topKeywordsGoogle: [
      { keyword: 'restaurante em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo de maior volume no Google Maps para alimentação.' },
      { keyword: 'onde almoçar e jantar bem em [cidade]', intent: 'descoberta', searchVolume: 'Muito Alto', recommendation: 'Promover fotos de pratos com iluminação natural apetitosa.' },
      { keyword: 'melhores restaurantes em [cidade] avaliações', intent: 'decisão', searchVolume: 'Muito Alto', recommendation: 'Incentivar avaliações citando pratos específicos do cardápio.' },
      { keyword: 'restaurante com música ao vivo e espaço kids [bairro]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Ativar atributos de comodidade no perfil.' },
    ],
    descriptionTemplate:
      'Uma experiência gastronômica inesquecível com sabor autêntico, ingredientes frescos e hospitalidade acolhedora em [cidade]. O [Nome do Restaurante] convida você a saborear nosso cardápio variado com pratos à la carte, buffet executivo de almoço, opções vegetarianas, sobremesas artesanais e drinks exclusivos. Ambiente charmoso, climatizado, perfeito para almoços de negócios, encontros familiares ou jantares a dois. Atendimento no salão e delivery rápido pelo WhatsApp ou cardápio digital.',
    recommendedServices: [
      { name: 'Almoço Executivo / Buffet Especial', description: 'Pratos completos preparados no dia com ingredientes selecionados e sabor caseiro impecável.', priceHint: 'Segunda a Sexta' },
      { name: 'Jantar Especial à La Carte e Carta de Vinhos', description: 'Carnes nobres, massas artesanais, peixes frescos e harmonização de vinhos.', priceHint: 'Opções a partir de R$ 45' },
    ],
    essentialAttributes: ['Refeição no local', 'Entrega sem contato', 'Para viagem', 'Espaço kids', 'Música ao vivo', 'Acessível para cadeirantes'],
    googlePostsTemplates: [
      {
        title: 'Sabor que Reúne Momentos Especiais',
        body: 'Venha saborear os melhores pratos da nossa cozinha hoje em [cidade]. Reserve sua mesa ou peça pelo delivery!',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'É necessário fazer reserva para o jantar?',
        answer: 'Trabalhamos com reservas antecipadas pelo WhatsApp e também com atendimento por ordem de chegada no salão.',
      },
    ],
  },

  pizzaria: {
    id: 'pizzaria',
    name: 'Pizzaria',
    emoji: '🍕',
    categoryGroup: 'Gastronomia',
    primaryCategory: 'Pizzaria',
    secondaryCategories: ['Restaurante italiano', 'Serviço de entrega de pizzas', 'Restaurante de comida para viagem'],
    topKeywordsGoogle: [
      { keyword: 'pizzaria em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo disparado de maior volume à noite e fins de semana.' },
      { keyword: 'melhor pizza de fermentação natural em [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Destacar farinha italiana e massa de longa fermentação.' },
      { keyword: 'delivery de pizza quentinha [bairro] [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Cadastrar link do cardápio digital oficial.' },
      { keyword: 'rodízio de pizza ou borda recheada [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Promover nas atualizações semanais do perfil.' },
    ],
    descriptionTemplate:
      'A verdadeira pizza artesanal com massa de fermentação lenta, ingredientes nobres e muito recheio em [cidade]. Na [Nome da Pizzaria], cada pizza é aberta à mão e assada em forno de alta temperatura, garantindo bordas crocantes e textura inigualável. Mais de [X] sabores tradicionais, especiais e doces com chocolate belga, além de opções veganas e bordas recheadas de catupiry original. Salão aconchegante para reunir a família e os amigos, e delivery ágil que chega quentinho na sua casa.',
    recommendedServices: [
      { name: 'Pizzas Tradicionais e Especiais Grandes (8 pedaços)', description: 'Ingredientes de primeira linha com queijo derretido e molho de tomate pelado italiano.', priceHint: 'A partir de R$ 55' },
      { name: 'Pizzas Doces Gourmet', description: 'Combinações com morango, banana nevada, Nutella e chocolate artesanal.', priceHint: 'Opções a partir de R$ 38' },
    ],
    essentialAttributes: ['Consumo no local', 'Delivery e retirada no balcão', 'Estacionamento facilitado', 'Ambiente familiar'],
    googlePostsTemplates: [
      {
        title: 'Hoje Pede Pizza Quentinha e Crocante!',
        body: 'Confira nossas promoções do dia e peça pelo WhatsApp com entrega rápida no seu bairro em [cidade].',
        cta: 'Fazer pedido',
      },
    ],
    faqsForRanking: [
      {
        question: 'Qual o tempo médio de entrega da pizza?',
        answer: 'Nosso tempo médio de entrega fica entre 35 e 50 minutos, com bolsas térmicas que mantêm a pizza estalando de quente.',
      },
    ],
  },

  bar_pub: {
    id: 'bar_pub',
    name: 'Bar / Pub',
    emoji: '🍺',
    categoryGroup: 'Gastronomia',
    primaryCategory: 'Bar',
    secondaryCategories: ['Pub', 'Choperia', 'Restaurante com bar', 'Bar de coquetéis'],
    topKeywordsGoogle: [
      { keyword: 'bar em [cidade] com música ao vivo', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Pesquisa central para saídas noturnas.' },
      { keyword: 'happy hour e chopp gelado perto de mim [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Destacar promoções de happy hour na descrição.' },
      { keyword: 'melhores bares em [cidade] para comemorar aniversário', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Oferecer condições especiais para aniversariantes no perfil.' },
      { keyword: 'petiscos de boteco e drinks artesanais [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Publicar fotos atraentes de coquetéis.' },
    ],
    descriptionTemplate:
      'O ponto de encontro perfeito para celebrar a vida com chopp trincando de gelado, drinks autorais e petiscos irresistíveis em [cidade]. O [Nome do Bar] oferece um ambiente descontraído, carta de cervejas artesanais, porções generosas de boteco premiado e programação com música ao vivo nos fins de semana. O melhor happy hour da região com promoções especiais para quem vem com a galera ou quer comemorar aniversário com benefícios exclusivos.',
    recommendedServices: [
      { name: 'Chopp Artesanal e Cervejas Especiais', description: 'Torneiras com chopp pilsen, IPA e rótulos selecionados na temperatura ideal.', priceHint: 'Happy hour com dose dupla' },
      { name: 'Porções e Petiscos de Boteco', description: 'Bolinhos artesanais, torresmo crocante, batatas rústicas e carnes na tábua.', priceHint: 'A partir de R$ 35' },
    ],
    essentialAttributes: ['Música ao vivo', 'Mesas ao ar livre', 'Aceita reservas', 'Área de fumantes', 'Wi-Fi gratuito'],
    googlePostsTemplates: [
      {
        title: 'Happy Hour com Chopp Gelado e Música Boa',
        body: 'Reúna os amigos e venha curtir o melhor clima da cidade hoje no [Nome do Bar] em [cidade]!',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Como funciona a reserva para aniversário?',
        answer: 'Aniversariantes que reservam para grupos acima de 10 pessoas ganham drinks de cortesia e mesa reservada prioritária.',
      },
    ],
  },

  cafeteria: {
    id: 'cafeteria',
    name: 'Cafeteria / Coffee Shop',
    emoji: '☕',
    categoryGroup: 'Gastronomia',
    primaryCategory: 'Cafeteria',
    secondaryCategories: ['Casa de café', 'Bistrô', 'Padaria e confeitaria'],
    topKeywordsGoogle: [
      { keyword: 'cafeteria em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo mais comum no Google Maps durante a manhã e tarde.' },
      { keyword: 'café especial e brunch em [cidade]', intent: 'descoberta', searchVolume: 'Muito Alto', recommendation: 'Público apaixonado por grãos selecionados.' },
      { keyword: 'cafeteria para trabalhar com wi-fi rápido [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Ativar atributo de Wi-Fi e tomadas disponíveis.' },
      { keyword: 'melhor café com pão de queijo e bolo [bairro]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Adicionar fotos de produtos frescos.' },
    ],
    descriptionTemplate:
      'Seu refúgio para desacelerar e apreciar cafés especiais de origem controlada, grãos 100% arábica moídos na hora e métodos manuais de extração em [cidade]. A [Nome da Cafeteria] combina um ambiente aconchegante, iluminação suave, Wi-Fi de alta velocidade e tomadas em todas as mesas para momentos de coworking ou pausas gostosas. Cardápio com pães de fermentação natural, tortas artesanais, opções veganas e bebidas quentes e geladas irresistíveis.',
    recommendedServices: [
      { name: 'Cafés Especiais Filtrados (V60, Chemex, Aeropress)', description: 'Extrações manuais que valorizam notas sensoriais frutadas e achocolatadas dos grãos.', priceHint: 'A partir de R$ 12' },
      { name: 'Combo Brunch Completo', description: 'Café, torrada na ciabatta com ovos mexidos, geleia artesanal e suco natural.', priceHint: 'A partir de R$ 28' },
    ],
    essentialAttributes: ['Wi-Fi gratuito de alta velocidade', 'Tomadas disponíveis', 'Ambiente pet friendly', 'Opções vegetarianas'],
    googlePostsTemplates: [
      {
        title: 'Pausa para um Café Especial que Transforma seu Dia',
        body: 'Grãos selecionados, doces artesanais e clima perfeito para trabalhar ou conversar em [cidade]. Venha nos visitar!',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'A cafeteria aceita animais de estimação (pet friendly)?',
        answer: 'Sim, somos 100% pet friendly na nossa área externa e interna com água fresca para o seu pet.',
      },
    ],
  },

  confeitaria: {
    id: 'confeitaria',
    name: 'Confeitaria / Patisserie',
    emoji: '🧁',
    categoryGroup: 'Gastronomia',
    primaryCategory: 'Confeitaria',
    secondaryCategories: ['Padaria e confeitaria', 'Loja de bolos', 'Doceria'],
    topKeywordsGoogle: [
      { keyword: 'confeitaria em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca rápida por doces e cafés da tarde.' },
      { keyword: 'bolos de aniversário personalizados e encomendar doces [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço de maior faturamento do negócio.' },
      { keyword: 'doces finos para casamento e festas [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Expor fotos de mesas decoradas no perfil.' },
      { keyword: 'melhor bolo vulcão e tortas artesanais [bairro]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Cadastrar no catálogo com preços.' },
    ],
    descriptionTemplate:
      'Doces que encantam os olhos e conquistam o paladar em [cidade]. A [Nome da Confeitaria] produz bolos artísticos personalizados para aniversários e casamentos, tortas clássicas, doces finos, brownies artesanais e sobremesas que celebram os momentos mais doces da vida. Ingredientes nobres como chocolate belga, frutas frescas e baunilha natural. Atendimento carinhoso no nosso espaço de chá e encomendas rápidas pelo WhatsApp com entrega cuidadosa.',
    recommendedServices: [
      { name: 'Bolos Personalizados para Festas e Aniversários', description: 'Massas fofinhas com recheios fartos e acabamento artístico em buttercream ou pasta.', priceHint: 'Por quilo sob encomenda' },
      { name: 'Doces Finos e Brigadeiros Gourmet para Eventos', description: 'Caixas com seleções de brigadeiros belgas, camafeus e mini tortinhas.', priceHint: 'Cento sob consulta' },
    ],
    essentialAttributes: ['Consumo no local e encomendas', 'Embalagens seguras para presente', 'Aceita encomendas pelo WhatsApp'],
    googlePostsTemplates: [
      {
        title: 'Celebre com Bolos Artísticos e Doces Inesquecíveis',
        body: 'Planejando seu aniversário ou festa em [cidade]? Reserve sua encomenda e surpreenda seus convidados.',
        cta: 'Fazer pedido',
      },
    ],
    faqsForRanking: [
      {
        question: 'Com quanta antecedência devo encomendar um bolo de aniversário?',
        answer: 'Recomendamos antecedência mínima de 48 a 72 horas para bolos personalizados, garantindo frescor absoluto.',
      },
    ],
  },

  // ================= 4. ENTRETENIMENTO & MÚSICA (2 nichos) =================
  artista: {
    id: 'artista',
    name: 'Artista Musical / Banda',
    emoji: '🎵',
    categoryGroup: 'Entretenimento & Música',
    primaryCategory: 'Músico',
    secondaryCategories: ['Banda musical', 'Serviço de entretenimento', 'Organizador de eventos'],
    topKeywordsGoogle: [
      { keyword: 'banda para casamento e eventos em [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Contratação corporativa e casamentos.' },
      { keyword: 'músico para cerimônia e recepção de festa [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Expor vídeos no perfil do Google.' },
      { keyword: 'contratar show de banda ao vivo [cidade]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Inserir link de WhatsApp para orçamentos.' },
      { keyword: 'melhor banda acústica para bar e restaurante [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Repertório variado em MPB, Pop e Rock.' },
    ],
    descriptionTemplate:
      'Música ao vivo de alta energia, carisma e sofisticação para casamentos, formaturas, eventos corporativos e casas de shows em [cidade] e região. A banda [Nome do Artista/Banda] traz um repertório versátil e personalizado que transita com elegância entre Pop, Rock, MPB e hits dançantes que não deixam ninguém parado. Estrutura completa de som e iluminação profissional, pontualidade britânica e conexão emocionante com o público para transformar seu evento em uma celebração inesquecível.',
    recommendedServices: [
      { name: 'Show Completo para Casamento (Cerimônia + Festa)', description: 'Músicas personalizadas para a entrada dos noivos e show animado para a pista de dança.', priceHint: 'Sob consulta com rider' },
      { name: 'Apresentação Corporativa e Confraternizações', description: 'Show adaptado ao perfil da empresa para premiações e eventos de fim de ano.', priceHint: 'Orçamento sob medida' },
    ],
    essentialAttributes: ['Atendimento com agenda aberta para eventos', 'Repertório personalizado', 'Deslocamento regional'],
    googlePostsTemplates: [
      {
        title: 'Transforme seu Evento em um Show Inesquecível',
        body: 'Repertório vibrante para casamentos e confraternizações em [cidade]. Garanta sua data antes que a agenda feche!',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'A banda fornece equipamento próprio de som e iluminação?',
        answer: 'Sim, dispomos de equipamento completo profissional ou adaptamos nossa apresentação à estrutura contratada pelo evento.',
      },
    ],
  },

  casa_shows: {
    id: 'casa_shows',
    name: 'Casa de Shows / Teatro',
    emoji: '🎭',
    categoryGroup: 'Entretenimento & Música',
    primaryCategory: 'Casa de espetáculos',
    secondaryCategories: ['Teatro', 'Centro cultural', 'Espaço para eventos'],
    topKeywordsGoogle: [
      { keyword: 'casa de shows e espetáculos em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Palavra-chave principal de cultura e lazer.' },
      { keyword: 'programação de shows e ingressos [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Colocar link da bilheteria oficial no perfil.' },
      { keyword: 'teatro com peças e comédia stand-up perto de mim', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Atualizar semanalmente com novos eventos.' },
      { keyword: 'aluguel de espaço para eventos corporativos e shows [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar locação no catálogo.' },
    ],
    descriptionTemplate:
      'O principal polo de cultura, música e espetáculos ao vivo de [cidade]. O [Nome do Espaço] conta com acústica impecável, rider técnico de última geração, visão privilegiada de todos os setores e climatização total para até [X] pessoas. Palco dos maiores artistas nacionais, peças teatrais emocionantes, shows de humor stand-up e eventos corporativos de grande porte. Estacionamento amplo com segurança, bares integrados e acessibilidade completa.',
    recommendedServices: [
      { name: 'Ingressos para Shows e Apresentações Teatrais', description: 'Entradas para pista, camarote e setor VIP com compra online segura.', priceHint: 'Conforme atração' },
      { name: 'Locação do Espaço para Eventos Privados', description: 'Estrutura completa com técnicos de som, luz, camarins e seguranças inclusos.', priceHint: 'Sob proposta' },
    ],
    essentialAttributes: ['Acessibilidade completa para cadeirantes', 'Bar e alimentação interna', 'Estacionamento próprio com manobrista'],
    googlePostsTemplates: [
      {
        title: 'Confira a Programação Deste Mês no [Nome do Espaço]',
        body: 'Grandes nomes da música e do teatro sobem ao nosso palco em [cidade]. Garanta seus ingressos antecipados com desconto!',
        cta: 'Comprar ingressos',
      },
    ],
    faqsForRanking: [
      {
        question: 'O local possui estacionamento e segurança?',
        answer: 'Sim, contamos com amplo estacionamento interno com segurança monitorada e equipe de apoio durante todo o evento.',
      },
    ],
  },

  // ================= 5. VAREJO & COMÉRCIO (5 nichos) =================
  petshop: {
    id: 'petshop',
    name: 'Pet Shop / Clínica Veterinária',
    emoji: '🐾',
    categoryGroup: 'Varejo & Comércio',
    primaryCategory: 'Pet shop',
    secondaryCategories: ['Clínica veterinária', 'Banho e tosa', 'Farmácia veterinária'],
    topKeywordsGoogle: [
      { keyword: 'pet shop em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo disparado de maior volume para pets.' },
      { keyword: 'banho e tosa com leva e traz [bairro] [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço mais rentável e recorrente.' },
      { keyword: 'veterinário com consulta e vacina em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Crucial para cuidados preventivos.' },
      { keyword: 'ração premium e remédios para cachorro e gato [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Cadastrar produtos no feed do Google.' },
    ],
    descriptionTemplate:
      'Todo o cuidado, carinho e saúde que seu melhor amigo merece em um só lugar em [cidade]. A [Nome do Pet Shop] oferece centro de estética animal com banho e tosa humanizado sem estresse, tosa bebê e higiênica, além de consultório veterinário completo para consultas, vacinas importadas e exames. Grande variedade de rações super premium, petiscos naturais, brinquedos educativos, acessórios e farmácia veterinária completa. Serviço de táxi dog leva e traz com segurança e amor pelos animais.',
    recommendedServices: [
      { name: 'Banho e Tosa Completo com Hidratação', description: 'Higienização com produtos hipoalergênicos, corte de unhas, limpeza de ouvidos e carinho.', priceHint: 'A partir de R$ 60' },
      { name: 'Consulta Veterinária e Vacinação Preventiva', description: 'Atendimento clínico com médico veterinário dedicado e aplicação de vacinas éticas.', priceHint: 'Sob consulta' },
    ],
    essentialAttributes: ['Serviço de leva e traz (táxi dog)', 'Produtos hipoalergênicos', 'Climatização especial para os pets'],
    googlePostsTemplates: [
      {
        title: 'Seu Pet Cheiroso, Saudável e Feliz!',
        body: 'Agende o banho e tosa com nossa equipe especializada em [cidade]. Buscamos e levamos na sua porta!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Vocês atendem animais idosos ou com necessidades especiais no banho?',
        answer: 'Sim! Nossos tosadores são treinados em manejo gentil e respeitam o tempo e a postura de cães e gatos idosos ou estressados.',
      },
    ],
  },

  agro: {
    id: 'agro',
    name: 'Casa de Produtos Agrícolas',
    emoji: '🌾',
    categoryGroup: 'Varejo & Comércio',
    primaryCategory: 'Loja de artigos para agricultura',
    secondaryCategories: ['Loja de rações', 'Loja de ferramentas', 'Artigos de jardinagem'],
    topKeywordsGoogle: [
      { keyword: 'produtos agrícolas e agropecuária em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca regional de produtores e sitiantes.' },
      { keyword: 'rações para gado, cavalo e aves no atacado [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Cadastrar sacarias no catálogo com peso.' },
      { keyword: 'adubos, sementes e defensivos agrícolas [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Destacar assistência técnica agronômica.' },
      { keyword: 'ferramentas e equipamentos para jardim e campo [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Termo de compras frequentes.' },
    ],
    descriptionTemplate:
      'A parceira de confiança do produtor rural, chácaras e criadores em [cidade] e região. A [Nome da Agropecuária] disponibiliza um mix completo de rações para bovinos, equinos, suínos e aves, sementes de alta germinação, fertilizantes foliares e adubos químicos e orgânicos. Também contamos com medicamentos veterinários para animais de grande porte, arames, cercamentos, pulverizadores e ferramentas para o campo. Orientação técnica especializada e entrega na sua propriedade.',
    recommendedServices: [
      { name: 'Venda de Rações e Nutrição Animal no Atacado e Varejo', description: 'Marcas líderes do mercado para engorda, lactação e manutenção.', priceHint: 'Preços por saca com desconto' },
      { name: 'Defensivos, Fertilizantes e Orientação Agronômica', description: 'Produtos registrados para controle de pragas com orientação técnica de aplicação.', priceHint: 'Sob consulta técnica' },
    ],
    essentialAttributes: ['Entrega na fazenda ou sítio', 'Venda no atacado e faturamento para CNPJ/Produtor', 'Estacionamento para caminhonetes'],
    googlePostsTemplates: [
      {
        title: 'Nutrição Animal de Alto Rendimento para sua Propriedade',
        body: 'Preços especiais em sacarias de rações e sementes selecionadas em [cidade]. Faça sua cotação pelo WhatsApp!',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Vocês realizam entrega em áreas rurais e chácaras da região?',
        answer: 'Sim, realizamos entregas programadas diretamente na sua porteira em toda a zona rural de [cidade] e municípios vizinhos.',
      },
    ],
  },

  moda: {
    id: 'moda',
    name: 'Loja de Roupas / Moda',
    emoji: '👗',
    categoryGroup: 'Varejo & Comércio',
    primaryCategory: 'Loja de roupas',
    secondaryCategories: ['Loja de roupas femininas', 'Boutique', 'Loja de moda masculina'],
    topKeywordsGoogle: [
      { keyword: 'loja de roupas em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca constante por compras no shopping ou rua.' },
      { keyword: 'moda feminina elegante e vestidos para festa [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Postar fotos semanais com looks montados.' },
      { keyword: 'roupas de qualidade com ótimos preços em [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Ativar catálogo de produtos do Google.' },
      { keyword: 'melhor boutique de moda e tendências [bairro]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Incentivar avaliações com fotos de clientes vestindo.' },
    ],
    descriptionTemplate:
      'Tendências irresistíveis, caimento perfeito e peças que valorizam o seu estilo com elegância em [cidade]. A [Nome da Loja] é sua parada obrigatória de moda com coleções atualizadas semanalmente: vestidos fluidos, alfaiataria moderna, jeans de alta qualidade, blusas sofisticadas e acessórios que transformam qualquer look. Atendimento consultivo que te ajuda a montar combinações perfeitas para o trabalho ou ocasiões especiais. Provadores espaçosos, café delicioso e entrega expressa por motoboy na cidade.',
    recommendedServices: [
      { name: 'Atendimento Personalizado e Consultoria de Estilo', description: 'Sugestões de looks adaptados à sua silhueta e ocasiões de uso.', priceHint: 'Cortesia da loja' },
      { name: 'Moda Festa e Casual Chic', description: 'Vestidos longos e curtos, conjuntos e macacões com acabamentos nobres.', priceHint: 'A partir de R$ 120' },
    ],
    essentialAttributes: ['Provadores climatizados e confortáveis', 'Entrega expressa por motoboy na cidade', 'Troca fácil sem complicação'],
    googlePostsTemplates: [
      {
        title: 'Coleção Nova Chegando com Peças Apaixonantes!',
        body: 'Venha conferir as tendências da estação e renove o seu guarda-roupa em [cidade]. Esperamos você com um cafezinho!',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'Vocês enviam peças para experimentar em casa (malinha condicional)?',
        answer: 'Sim, oferecemos o serviço de mala delivery em [cidade] para você experimentar as peças no conforto da sua casa.',
      },
    ],
  },

  joalheria: {
    id: 'joalheria',
    name: 'Joalheria / Relojoaria',
    emoji: '💍',
    categoryGroup: 'Varejo & Comércio',
    primaryCategory: 'Joalheria',
    secondaryCategories: ['Relojoaria', 'Ourives', 'Loja de presentes'],
    topKeywordsGoogle: [
      { keyword: 'joalheria em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca de momentos marcantes e presentes valiosos.' },
      { keyword: 'alianças de casamento em ouro 18k [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Produto de maior procura e ticket alto.' },
      { keyword: 'conserto de joias, relógios e ajuste de aliança [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Serviço rápido que gera clientes fiéis.' },
      { keyword: 'anéis solitários de noivado e diamantes [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Postar fotos em close com certificado de autenticidade.' },
    ],
    descriptionTemplate:
      'Tradição, alta joalheria e peças eternas que celebram os momentos mais marcantes da sua vida em [cidade]. A [Nome da Joalheria] confecciona e comercializa alianças de casamento e noivado em ouro 18k legítimo, anéis solitários com diamantes certificados, correntes, pulseiras, brincos e relógios de marcas prestigiadas. Dispomos de oficina própria com ourives especializado para ajustes de tamanho, gravação a laser personalizada, polimento e restauração de relógios automáticos com garantia.',
    recommendedServices: [
      { name: 'Alianças de Casamento e Noivado em Ouro 18k', description: 'Mais de 100 modelos com gravação dos nomes e estojo de veludo de cortesia.', priceHint: 'Sob medida e gramatura' },
      { name: 'Oficina de Ourivesaria e Manutenção de Relógios', description: 'Ajuste de garras, troca de bateria blindada, polimento e restauração de peças.', priceHint: 'Orçamento na hora' },
    ],
    essentialAttributes: ['Certificado de garantia perpétua do ouro 18k', 'Ambiente com segurança monitorada', 'Gravação a laser personalizada'],
    googlePostsTemplates: [
      {
        title: 'O Amor Merece o Brilho do Ouro 18k Legítimo',
        body: 'Conheça nossos modelos de alianças e solitários para pedidos inesquecíveis em [cidade]. Gravação gratuita inclusa!',
        cta: 'Ligar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'As joias acompanham certificado de garantia de autenticidade?',
        answer: 'Sim, todas as nossas joias em ouro 18k (750) e pedras preciosas acompanham certificado vitalício de autenticidade do metal.',
      },
    ],
  },

  floricultura: {
    id: 'floricultura',
    name: 'Floricultura',
    emoji: '🌹',
    categoryGroup: 'Varejo & Comércio',
    primaryCategory: 'Floricultura',
    secondaryCategories: ['Loja de plantas', 'Loja de presentes', 'Decoração de festas'],
    topKeywordsGoogle: [
      { keyword: 'floricultura em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo com picos gigantes em datas comemorativas.' },
      { keyword: 'entrega de flores e buquê de rosas hoje [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Compra por impulso com entrega rápida.' },
      { keyword: 'cesta de café da manhã com flores para presente [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar modelos no catálogo do Google.' },
      { keyword: 'orquídeas e plantas ornamentais para casa [bairro]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Promover fotos de plantas saudáveis.' },
    ],
    descriptionTemplate:
      'Flores frescas que emocionam, transmitem afeto e enchem qualquer ambiente de perfume e vida em [cidade]. A [Nome da Floricultura] cria buquês exuberantes de rosas colombianas, arranjos modernos de flores nobres, orquídeas raras, plantas para interiores e cestas de café da manhã e presentes inesquecíveis. Entrega rápida no mesmo dia em todos os bairros da cidade com cartão personalizado escrito à mão. Surpreenda quem você ama com a beleza da natureza.',
    recommendedServices: [
      { name: 'Buquês de Rosas e Flores Mistas Nobres', description: 'Arranjos florais feitos com flores do dia e embalagem de alta elegância.', priceHint: 'A partir de R$ 80' },
      { name: 'Cestas de Café da Manhã e Chocoflores', description: 'Itens gourmet, pães artesanais, chocolates finos e arranjo de flores combinados.', priceHint: 'A partir de R$ 150' },
    ],
    essentialAttributes: ['Entrega expressa no mesmo dia', 'Flores selecionadas e frescas', 'Aceita pedidos urgentes pelo WhatsApp'],
    googlePostsTemplates: [
      {
        title: 'Surpreenda Hoje com Buquês Frescos e Perfumados',
        body: 'Entregamos em qualquer bairro de [cidade] em até 2 horas. Envie seu carinho agora mesmo pelo WhatsApp!',
        cta: 'Fazer pedido',
      },
    ],
    faqsForRanking: [
      {
        question: 'Consigo enviar flores ainda hoje para alguém especial?',
        answer: 'Sim, realizamos entregas expressas no mesmo dia para pedidos efetuados pelo WhatsApp com cartãozinho personalizado incluso.',
      },
    ],
  },

  // ================= 6. OUTROS SEGMENTOS (7 nichos) =================
  academia: {
    id: 'academia',
    name: 'Academia / Fitness',
    emoji: '🏋️',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Academia de ginástica',
    secondaryCategories: ['Centro de fitness', 'Estúdio de pilates', 'Personal trainer'],
    topKeywordsGoogle: [
      { keyword: 'academia em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca massiva de moradores do bairro.' },
      { keyword: 'musculação com personal e professores atenciosos [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Principal diferencial buscado por novos alunos.' },
      { keyword: 'melhor academia com ar-condicionado e estacionamento [bairro]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Ativar atributos de infraestrutura.' },
      { keyword: 'plano de musculação sem taxa de matrícula [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Promover na postagem de boas-vindas.' },
    ],
    descriptionTemplate:
      'Mais saúde, disposição e resultados reais para o seu corpo em [cidade]. A [Nome da Academia] conta com amplo parque de aparelhos modernos de biomecânica precisa, professores formados sempre presentes na sala para orientar seus treinos, ambiente 100% climatizado e vestiários impecáveis. Modalidades: musculação, cross training, spinning, pilates solo e danças. Planos flexíveis sem fidelidade abusiva. Venha treinar no lugar onde sua evolução é levada a sério. Ganhe um passe livre para conhecer!',
    recommendedServices: [
      { name: 'Plano Musculação Livre e Aulas Coletivas', description: 'Acesso total a todos os aparelhos e modalidades com treino montado no aplicativo.', priceHint: 'Planos a partir de R$ 99/mês' },
      { name: 'Acompanhamento com Personal Trainer Exclusivo', description: 'Treinos focados nas suas metas com acompanhamento individualizado e correção postural.', priceHint: 'Sob consulta' },
    ],
    essentialAttributes: ['Ambiente climatizado', 'Vestiários com duchas quentes', 'Estacionamento privativo gratuito', 'Avaliação física inclusa'],
    googlePostsTemplates: [
      {
        title: 'Comece Hoje a Cuidar da Sua Melhor Versão',
        body: 'Estrutura completa, esteiras modernas e professores atenciosos te esperando em [cidade]. Agende sua aula experimental gratuita!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'A academia oferece aula experimental gratuita para novos alunos?',
        answer: 'Sim! Você pode agendar um treino experimental completo pelo nosso WhatsApp para conhecer nossos aparelhos e metodologia.',
      },
    ],
  },

  escola: {
    id: 'escola',
    name: 'Escola / Curso',
    emoji: '📚',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Escola particular',
    secondaryCategories: ['Escola de ensino fundamental', 'Escola de idiomas', 'Centro educacional'],
    topKeywordsGoogle: [
      { keyword: 'escola particular em [cidade] infantil e fundamental', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca prioritária de famílias na matrícula.' },
      { keyword: 'melhor colégio com ensino bilíngue e período integral [cidade]', intent: 'decisão', searchVolume: 'Muito Alto', recommendation: 'Destacar metodologia pedagógica moderna.' },
      { keyword: 'curso profissionalizante e idiomas com certificado [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar cursos no catálogo de serviços.' },
      { keyword: 'matrículas abertas para escola em [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Manter fixo em posts durante campanhas de matrícula.' },
    ],
    descriptionTemplate:
      'Educação humanizada, excelência acadêmica e preparação para os desafios do futuro em [cidade]. O [Nome do Colégio/Instituto] atende da Educação Infantil ao Ensino Médio, combinando pedagogia socioemocional, projeto bilíngue, tecnologia educacional, laboratórios práticos e amplo espaço de convivência seguro e arborizado. Corpo docente qualificado, período integral acolhedor e parceria próxima com as famílias para formar cidadãos éticos e confiantes. Agende uma visita guiada!',
    recommendedServices: [
      { name: 'Matrícula Educação Infantil e Ensino Fundamental', description: 'Desenvolvimento cognitivo, atividades lúdicas e alfabetização prazerosa.', priceHint: 'Consulte mensalidades' },
      { name: 'Programa Bilíngue e Período Integral', description: 'Aulas imersivas em inglês, oficinas esportivas, alimentação balanceada e tarefas dirigidas.', priceHint: 'Opções meio período e integral' },
    ],
    essentialAttributes: ['Câmeras de segurança e portaria monitorada', 'Refeitório com nutricionista', 'Quadra poliesportiva coberta'],
    googlePostsTemplates: [
      {
        title: 'Matrículas Abertas: O Futuro do Seu Filho Começa Aqui',
        body: 'Conheça nossa proposta pedagógica acolhedora e estrutura de ponta em [cidade]. Venha tomar um café e conversar com a coordenação!',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'Como agendar uma visita para conhecer a escola?',
        answer: 'As visitas são agendadas diretamente com nossa secretaria pedagógica pelo WhatsApp ou telefone, com horários flexíveis para os pais.',
      },
    ],
  },

  hotel: {
    id: 'hotel',
    name: 'Hotel / Pousada',
    emoji: '🏨',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Hotel',
    secondaryCategories: ['Pousada', 'Resort', 'Hospedagem com café da manhã'],
    topKeywordsGoogle: [
      { keyword: 'hotel em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo líder de ocupação hoteleira.' },
      { keyword: 'pousada com café da manhã e piscina [cidade]', intent: 'descoberta', searchVolume: 'Muito Alto', recommendation: 'Fotos atraentes de lazer no perfil.' },
      { keyword: 'hotel para viagens a trabalho e eventos [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Destacar Wi-Fi veloz e nota fiscal para empresas.' },
      { keyword: 'melhor hotel em [cidade] com ótimas avaliações', intent: 'decisão', searchVolume: 'Muito Alto', recommendation: 'Estimular hóspedes satisfeitos a avaliar o café.' },
    ],
    descriptionTemplate:
      'Conforto, tranquilidade e hospitalidade genuína no melhor ponto de [cidade]. O [Nome do Hotel/Pousada] oferece acomodações equipadas com camas box premium, ar-condicionado silencioso, Smart TV, frigobar, cofre e chuveiros a gás com pressão revigorante. Comece o dia com nosso farto café da manhã colonial com pães quentinhos, bolos caseiros e frutas frescas. Wi-Fi de alta velocidade em todas as áreas, estacionamento privativo e recepção 24 horas pronta para te receber.',
    recommendedServices: [
      { name: 'Diária Quarto Casal Luxo com Café da Manhã', description: 'Cama queen size, enxoval 300 fios, varanda e amenities especiais.', priceHint: 'Tarifas a partir de R$ 190' },
      { name: 'Hospedagem Corporativa com Tarifas Especiais', description: 'Condições especiais para empresas, faturamento facilitado e espaço para reuniões.', priceHint: 'Sob convênio corporativo' },
    ],
    essentialAttributes: ['Café da manhã incluso', 'Wi-Fi gratuito de alta velocidade', 'Estacionamento privativo gratuito', 'Recepção 24h'],
    googlePostsTemplates: [
      {
        title: 'Sua Melhor Estadia com Café da Manhã Colonial em [cidade]',
        body: 'Quartos confortáveis e acolhimento incomparável para viagens de lazer ou negócios. Reserve com a melhor tarifa direto no WhatsApp!',
        cta: 'Reservar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'O hotel aceita animais de estimação (pet friendly)?',
        answer: 'Sim, aceitamos pets de pequeno porte em apartamentos específicos mediante aviso prévio na reserva.',
      },
    ],
  },

  salao_beleza: {
    id: 'salao_beleza',
    name: 'Salão de Beleza',
    emoji: '💇',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Salão de beleza',
    secondaryCategories: ['Barbearia', 'Cabeleireiro', 'Clínica de manicure e pedicure', 'Centro de depilação'],
    topKeywordsGoogle: [
      { keyword: 'salão de beleza em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Termo central de busca de serviços capilares.' },
      { keyword: 'mechas loiras e corte de cabelo feminino [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço de alta autoridade e ticket.' },
      { keyword: 'manicure, pedicure e unhas em gel [bairro]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Serviço semanal de grande fidelidade.' },
      { keyword: 'melhor cabeleireiro e maquiagem para festas [cidade]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Expor fotos com iluminação de estúdio no perfil.' },
      { keyword: 'barbearia moderna com corte e barba na navalha [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Segmentar para o público masculino.' },
    ],
    descriptionTemplate:
      'Realce sua beleza e autoestima com os melhores cabeleireiros e especialistas em estética de [cidade]. No [Nome do Salão/Barbearia], oferecemos serviços de corte de cabelo personalizado, mechas e coloração de alta definição, tratamentos capilares profundos (cronograma e botox capilar), manicure com unhas de fibra e gel, design de sobrancelhas e maquiagem profissional para noivas e formandas. Produtos originais das marcas mais renomadas do mundo e ambiente relaxante com café expresso.',
    recommendedServices: [
      { name: 'Mechas Criativas, Morena Iluminada e Loiras', description: 'Técnicas modernas sem quebra com produtos que preservam a integridade dos fios.', priceHint: 'A partir de R$ 300' },
      { name: 'Corte de Cabelo e Escova Modelada', description: 'Visagismo aplicado para valorizar o formato do seu rosto com acabamento brilhante.', priceHint: 'A partir de R$ 80' },
      { name: 'Alongamento de Unhas em Fibra de Vidro', description: 'Unhas perfeitas com aspecto natural, alta durabilidade e cutilagem russa.', priceHint: 'A partir de R$ 130' },
    ],
    essentialAttributes: ['Ambiente climatizado e aconchegante', 'Café especial e espumante de cortesia', 'Agendamento fácil pelo WhatsApp'],
    googlePostsTemplates: [
      {
        title: 'Ilumine Seu Visual com Nossos Especialistas em Cor e Corte',
        body: 'Venha viver um dia de cuidado e transformação no salão mais querido de [cidade]. Garanta seu horário!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'Vocês realizam teste de mecha antes da descoloração?',
        answer: 'Sim, a segurança da sua fibra capilar é nossa prioridade absoluta. Realizamos teste de mecha prévio e gratuito.',
      },
    ],
  },

  igreja: {
    id: 'igreja',
    name: 'Igreja / Organização Religiosa',
    emoji: '⛪',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Igreja',
    secondaryCategories: ['Templo religioso', 'Centro comunitário', 'Organização de caridade'],
    topKeywordsGoogle: [
      { keyword: 'igreja em [cidade] perto de mim', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca por celebrações comunitárias.' },
      { keyword: 'horários de cultos e missas em [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Crucial: preencher horários com exatidão no perfil.' },
      { keyword: 'igreja com escola bíblica infantil e ministério de jovens [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Mencionar atividades para toda a família.' },
      { keyword: 'ações sociais e aconselhamento pastoral [cidade]', intent: 'local_direta', searchVolume: 'Alto', recommendation: 'Cadastrar no campo de serviços e acolhimento.' },
    ],
    descriptionTemplate:
      'Um lugar de acolhimento, fé, comunhão e esperança para toda a sua família em [cidade]. A [Nome da Igreja/Templo] abre suas portas para celebrar a presença de Deus por meio de cultos inspiradores, mensagens que edificam o coração, louvores vibrantes e ministérios dedicados para crianças, jovens e casais. Desenvolvemos projetos sociais de amparo aos necessitados e aconselhamento pastoral fraterno. Seja qual for sua história, você e sua família são muito bem-vindos em nossa casa.',
    recommendedServices: [
      { name: 'Celebrações e Cultos da Família', description: 'Momentos de fé, louvor contemporâneo e palavra transformadora aos domingos e quartas.', priceHint: 'Entrada franca' },
      { name: 'Ministério Infantil com Espaço Seguro para Crianças', description: 'Ensino lúdico dos princípios cristãos com monitores dedicados e preparados.', priceHint: 'Durante todos os cultos' },
    ],
    essentialAttributes: ['Acesso para cadeirantes', 'Estacionamento no local', 'Ambiente climatizado e acolhedor'],
    googlePostsTemplates: [
      {
        title: 'Você e Sua Família São Nossos Convidados Especiais',
        body: 'Venha renovar suas forças e viver momentos de paz e adoração neste domingo em [cidade]. Esperamos por você!',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'Quais os dias e horários das reuniões e celebrações?',
        answer: 'Nossos cultos principais ocorrem aos domingos às 10h e 18h, e às quartas-feiras às 19h30, abertos a toda a comunidade.',
      },
    ],
  },

  ong: {
    id: 'ong',
    name: 'ONG / Instituto',
    emoji: '🤝',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Organização sem fins lucrativos',
    secondaryCategories: ['Instituição de caridade', 'Centro comunitário', 'Serviço social'],
    topKeywordsGoogle: [
      { keyword: 'ong em [cidade] como doar e apoiar', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Captar voluntários e doadores locais.' },
      { keyword: 'projetos sociais para crianças e comunidades [cidade]', intent: 'descoberta', searchVolume: 'Muito Alto', recommendation: 'Expor fotos reais de impacto social.' },
      { keyword: 'instituição de caridade idônea em [cidade]', intent: 'decisão', searchVolume: 'Alto', recommendation: 'Destacar transparência e prestação de contas.' },
      { keyword: 'como ser voluntário em ong em [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar canal de contato de voluntários.' },
    ],
    descriptionTemplate:
      'Transformando vidas e construindo um futuro com mais dignidade, oportunidade e esperança em [cidade]. O [Nome do Instituto/ONG] atua sem fins lucrativos no desenvolvimento social, amparo a famílias em vulnerabilidade, oficinas educativas para jovens e capacitação profissional. Prestação de contas transparente, equipe dedicada e projetos que geram impacto real na comunidade local. Sua solidariedade salva vidas. Descubra como ser um doador mensal ou voluntário.',
    recommendedServices: [
      { name: 'Programa de Apadrinhamento e Doações Mensais', description: 'Apoio contínuo para manter refeições, materiais escolares e oficinas profissionalizantes.', priceHint: 'Contribuição voluntária' },
      { name: 'Cadastramento e Treinamento de Voluntários', description: 'Capacitação para quem deseja doar tempo e habilidades em benefício do próximo.', priceHint: 'Inscrições abertas' },
    ],
    essentialAttributes: ['Entidade legalmente registrada (CNPJ ativo)', 'Prestação de contas pública', 'Aberto para visitas com hora marcada'],
    googlePostsTemplates: [
      {
        title: 'Juntos Podemos Fazer a Diferença em [cidade]',
        body: 'Cada doação se transforma em sorrisos e oportunidades para quem mais precisa. Seja parte dessa corrente do bem!',
        cta: 'Saiba mais',
      },
    ],
    faqsForRanking: [
      {
        question: 'Como posso fazer doações seguras via Pix?',
        answer: 'Você pode doar via nossa chave Pix oficial CNPJ diretamente ou pelo site com recibo oficial de doação.',
      },
    ],
  },

  startup: {
    id: 'startup',
    name: 'Startup / Tech Company',
    emoji: '🚀',
    categoryGroup: 'Outros Segmentos',
    primaryCategory: 'Empresa de software',
    secondaryCategories: ['Empresa de tecnologia', 'Consultoria de informática', 'Desenvolvedor de sites e aplicativos'],
    topKeywordsGoogle: [
      { keyword: 'empresa de software e tecnologia em [cidade]', intent: 'local_direta', searchVolume: 'Muito Alto', recommendation: 'Busca B2B por soluções corporativas.' },
      { keyword: 'desenvolvimento de aplicativos e sistemas saas [cidade]', intent: 'transacional', searchVolume: 'Muito Alto', recommendation: 'Serviço de alta demanda e ticket empresarial.' },
      { keyword: 'startup de inteligência artificial e automação [cidade]', intent: 'descoberta', searchVolume: 'Alto', recommendation: 'Posicionamento de inovação na região.' },
      { keyword: 'consultoria em transformação digital para empresas [cidade]', intent: 'transacional', searchVolume: 'Alto', recommendation: 'Cadastrar no catálogo de produtos e serviços.' },
    ],
    descriptionTemplate:
      'Inovação, engenharia de software de alta performance e inteligência artificial para acelerar negócios em [cidade] e no mundo. A [Nome da Tech/Startup] desenvolve plataformas SaaS intuitivas, aplicativos móveis robustos (iOS e Android), automações inteligentes de processos e soluções sob medida para empresas que buscam liderar seu mercado. Metodologias ágeis, segurança cibernética avançada e arquitetura em nuvem escalável. Agende uma demonstração com nossos especialistas de produto.',
    recommendedServices: [
      { name: 'Desenvolvimento de Softwares SaaS e Web Apps', description: 'Aplicações modernas, rápidas e seguras construídas para escalar milhares de usuários.', priceHint: 'Sob escopo e sprint' },
      { name: 'Criação de Aplicativos Mobile (iOS e Android)', description: 'Experiência do usuário (UX/UI) impecável com integração a APIs e inteligência artificial.', priceHint: 'Projetos sob medida' },
      { name: 'Automação de Processos e Inteligência Artificial', description: 'Eliminação de tarefas manuais repetitivas com modelos de IA e fluxos automatizados.', priceHint: 'Consultoria técnica' },
    ],
    essentialAttributes: ['Atendimento presencial no hub de inovação e online', 'Projetos com acordo de confidencialidade (NDA)', 'Demonstração gratuita'],
    googlePostsTemplates: [
      {
        title: 'Acelere a Transformação Digital da Sua Empresa com IA',
        body: 'Conheça nossos cases de tecnologia e descubra como automatizar sua operação em [cidade]. Agende uma demonstração gratuita!',
        cta: 'Agendar agora',
      },
    ],
    faqsForRanking: [
      {
        question: 'A empresa assina termo de confidencialidade (NDA) antes de analisar o projeto?',
        answer: 'Sim, garantimos sigilo total da sua propriedade intelectual e modelo de negócio por meio de contrato formal de confidencialidade.',
      },
    ],
  },
};

/**
 * Retorna o pacote de SEO para o nicho informado, ou gera um pacote inteligente caso não seja encontrado.
 */
export function getGbpNichePackage(nicheKeyOrTitle: string): GbpNicheSeoPackage {
  const normalized = nicheKeyOrTitle.toLowerCase().trim();

  // Busca por id exato
  if (GBP_33_NICHOS_SEO_PACKAGES[normalized]) {
    return GBP_33_NICHOS_SEO_PACKAGES[normalized];
  }

  // Busca por correspondência no nome ou categoria
  const foundKey = Object.keys(GBP_33_NICHOS_SEO_PACKAGES).find((k) => {
    const pkg = GBP_33_NICHOS_SEO_PACKAGES[k];
    return (
      pkg.name.toLowerCase().includes(normalized) ||
      pkg.primaryCategory.toLowerCase().includes(normalized) ||
      normalized.includes(k)
    );
  });

  if (foundKey) {
    return GBP_33_NICHOS_SEO_PACKAGES[foundKey];
  }

  // Heurística de correspondência por palavras-chave
  if (normalized.includes('estét') || normalized.includes('beleza')) return GBP_33_NICHOS_SEO_PACKAGES.clinica_estetica;
  if (normalized.includes('odonto') || normalized.includes('dent')) return GBP_33_NICHOS_SEO_PACKAGES.dentista;
  if (normalized.includes('médic') || normalized.includes('saúde')) return GBP_33_NICHOS_SEO_PACKAGES.clinica_medica;
  if (normalized.includes('advoc') || normalized.includes('juríd') || normalized.includes('direito')) return GBP_33_NICHOS_SEO_PACKAGES.advocacia;
  if (normalized.includes('arquit') || normalized.includes('interiores')) return GBP_33_NICHOS_SEO_PACKAGES.arquitetura;
  if (normalized.includes('construt') || normalized.includes('obra')) return GBP_33_NICHOS_SEO_PACKAGES.construtora;
  if (normalized.includes('contab') || normalized.includes('fiscal')) return GBP_33_NICHOS_SEO_PACKAGES.contabilidade;
  if (normalized.includes('imob') || normalized.includes('corretor')) return GBP_33_NICHOS_SEO_PACKAGES.imobiliaria;
  if (normalized.includes('pizza')) return GBP_33_NICHOS_SEO_PACKAGES.pizzaria;
  if (normalized.includes('restaurante') || normalized.includes('comida')) return GBP_33_NICHOS_SEO_PACKAGES.restaurante;
  if (normalized.includes('pet') || normalized.includes('veterin')) return GBP_33_NICHOS_SEO_PACKAGES.petshop;
  if (normalized.includes('academia') || normalized.includes('fitness')) return GBP_33_NICHOS_SEO_PACKAGES.academia;
  if (normalized.includes('escola') || normalized.includes('curso')) return GBP_33_NICHOS_SEO_PACKAGES.escola;
  if (normalized.includes('hotel') || normalized.includes('pousada')) return GBP_33_NICHOS_SEO_PACKAGES.hotel;
  if (normalized.includes('salão') || normalized.includes('cabelo')) return GBP_33_NICHOS_SEO_PACKAGES.salao_beleza;
  if (normalized.includes('igreja') || normalized.includes('religi')) return GBP_33_NICHOS_SEO_PACKAGES.igreja;
  if (normalized.includes('ong') || normalized.includes('instituto')) return GBP_33_NICHOS_SEO_PACKAGES.ong;
  if (normalized.includes('tech') || normalized.includes('startup') || normalized.includes('software')) return GBP_33_NICHOS_SEO_PACKAGES.startup;

  // Fallback padrão seguro de alta qualidade
  return GBP_33_NICHOS_SEO_PACKAGES.clinica_estetica;
}
