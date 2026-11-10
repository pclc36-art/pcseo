import { buildGbpRankingTemplate } from './helper';
import { QuestionnaireTemplate } from './types';

// 27. Academia / Estúdio Fitness
const academiaFitness = buildGbpRankingTemplate({
  id: 'academia_fitness',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Academia / Estúdio Fitness',
  emoji: '💪',
  subtitle: 'Academias completas, estúdios de pilates, crossfit, treinamento funcional e yoga',
  defaultPrimaryCategory: 'Academia',
  suggestedSecondaryCategories: ['Centro de fitness', 'Estúdio de pilates', 'Treinador pessoal', 'Escola de yoga'],
  sampleBusinessName: 'IronFit Academia & Centro de Performance',
  nicheTerminology: 'academia de musculação e estúdio fitness',
  sampleKeywords: 'academia perto de mim aberta agora, musculação com personal, aula de pilates e spinning, academia com planos sem fidelidade',
  sampleTopServices: '1. Musculação Completa com Aparelhos Biomecânicos de Última Geração; 2. Aulas Coletivas Dinâmicas (Spinning, Funcional, Boxe, Dança); 3. Estúdio de Pilates com Aparelhos e Atendimento Personalizado',
  sampleDifferentials: 'Ambiente 100% climatizado com renovação de ar, professores formados pelo CREF em sala para correção de postura, vestiários padrão hotel com chuveiro aquecido e estacionamento gratuito.',
  sampleHours: 'Segunda a Sexta: 05:30 às 23:00 | Sábado: 08:00 às 18:00 | Domingo e Feriados: 09:00 às 14:00',
  sampleFaq: '1. A academia oferece aula experimental gratuita? R: Sim! Você pode agendar sua aula experimental gratuita pelo WhatsApp e conhecer toda a estrutura. 2. Os planos possuem fidelidade ou multa? R: Temos opções com e sem fidelidade, além de planos recorrentes no cartão que não travam o limite. 3. Aceitam Gympass / TotalPass? R: Sim, aceitamos os principais convênios corporativos.',
});

// 28. Escola / Cursos
const escolaCurso = buildGbpRankingTemplate({
  id: 'escola_curso',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Escola / Curso',
  emoji: '📚',
  subtitle: 'Escolas de educação básica, cursos profissionalizantes, preparatórios e escolas de idiomas',
  defaultPrimaryCategory: 'Escola de idiomas',
  suggestedSecondaryCategories: ['Escola técnica', 'Centro de treinamento', 'Escola particular', 'Centro de estudos'],
  sampleBusinessName: 'Apex Idiomas & Cursos Profissionalizantes',
  nicheTerminology: 'escola de idiomas e cursos profissionalizantes',
  sampleKeywords: 'curso de inglês perto de mim, escola de idiomas para adultos, curso técnico rápido com certificado, pré-vestibular e reforço escolar',
  sampleTopServices: '1. Inglês Imersivo para Conversação Rápida e Negócios; 2. Cursos Profissionalizantes de Tecnologia, Gestão e Marketing; 3. Preparatório Intensivo para Exames Internacionais (IELTS, TOEFL, Cambridge)',
  sampleDifferentials: 'Metodologia ativa e comunicativa com foco em conversação desde a 1ª aula, turmas reduzidas a no máximo 8 alunos, professores certificados e certificação internacional.',
  sampleHours: 'Segunda a Quinta: 07:30 às 21:30 | Sexta: 07:30 às 20:00 | Sábado: 08:00 às 15:00',
  sampleFaq: '1. Como saber meu nível de inglês antes de matricular? R: Realizamos teste de nivelamento oral e escrito gratuito online ou presencial. 2. Quanto tempo dura a formação? R: Temos módulos semestrais e intensivos de 12 a 18 meses para fluência prática. 3. O certificado é válido nacionalmente? R: Sim, emitimos certificados oficiais reconhecidos pelo mercado corporativo.',
});

// 29. Hotel & Pousada
const hotelPousada = buildGbpRankingTemplate({
  id: 'hotel_pousada',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Hotel & Pousada',
  emoji: '🏨',
  subtitle: 'Hotéis executivos, pousadas de charme, resorts urbanos e hospedagens turísticas',
  defaultPrimaryCategory: 'Hotel',
  suggestedSecondaryCategories: ['Pousada', 'Resort', 'Hospedagem com café da manhã'],
  sampleBusinessName: 'Pousada Villa das Águas Charm & Natureza',
  nicheTerminology: 'hotel e pousada de charme com café da manhã artesanal',
  sampleKeywords: 'hotel perto de mim com café da manhã, pousada romântica para casal, hospedagem perto do centro, hotel executivo com wi-fi rápido',
  sampleTopServices: '1. Suítes Master com Hidromassagem, Cama King e Varanda com Vista; 2. Café da Manhã Colonial Artesanal Incluso na Diária com Pães e Bolos Caseiros; 3. Área de Lazer com Piscina Climatizada, Sauna e Espaço Gourmet',
  sampleDifferentials: 'Localização privilegiada com fácil acesso às principais atrações e vias, atendimento acolhedor familiar, isolamento acústico nos quartos e estacionamento privativo incluso.',
  sampleHours: 'Recepção e Check-in 24 Horas',
  sampleFaq: '1. Quais são os horários de check-in e check-out? R: Check-in a partir das 14:00 e check-out até as 12:00, com possibilidade de late check-out sob consulta. 2. O café da manhã e estacionamento estão inclusos? R: Sim, ambos são 100% cortesia para nossos hóspedes. 3. Aceitam animais de estimação? R: Sim, somos pet friendly e temos suítes adaptadas para receber seu pet com carinho.',
});

// 30. Salão de Beleza & Barbearia
const salaoBeleza = buildGbpRankingTemplate({
  id: 'salao_beleza',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Salão de Beleza & Barbearia',
  emoji: '✂️',
  subtitle: 'Salões de beleza completos, especialistas em mechas, barbearias premium e mega hair',
  defaultPrimaryCategory: 'Salão de beleza',
  suggestedSecondaryCategories: ['Barbearia', 'Cabeleireiro', 'Clínica de micropigmentação', 'Centro de estética'],
  sampleBusinessName: 'Studio Glamour Salão de Beleza & Spa Urbano',
  nicheTerminology: 'salão de beleza especializado em mechas, corte e penteados',
  sampleKeywords: 'salão de beleza perto de mim aberto hoje, especialista em loiros e mechas, barbearia com cerveja e sinuca, corte de cabelo feminino e escova',
  sampleTopServices: '1. Especialista em Mechas, Loiros Saudáveis e Morena Iluminada; 2. Cortes Femininos e Masculinos Personalizados com Visagismo; 3. Tratamentos de Reconstrução Capilar e Cronograma de Hidratação; 4. Barba Terapia Tradicional com Toalha Quente e Navalha',
  sampleDifferentials: 'Profissionais especialistas em colorimetria e visagismo, produtos importados de alta gama (Wella, Kérastase, L\'Oréal), ambiente instagramável com café e espumante cortesia.',
  sampleHours: 'Terça a Sábado: 09:00 às 20:00 | Segunda: 13:00 às 19:00',
  sampleFaq: '1. Fazem teste de mecha antes de descolorir? R: Sim, o teste de mecha e diagnóstico capilar são obrigatórios para preservar a integridade dos fios. 2. Precisa agendar horário com antecedência? R: Recomendamos agendamento prévio pelo WhatsApp para evitar filas, mas atendemos encaixes. 3. Quais os métodos de pagamento? R: Aceitamos PIX, cartões de débito e crédito com parcelamento sem juros.',
});

// 31. Igreja & Comunidade Religiosa
const igrejaReligiosa = buildGbpRankingTemplate({
  id: 'igreja_religiosa',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Igreja / Templo Religioso',
  emoji: '⛪',
  subtitle: 'Igrejas, comunidades religiosas, templos de adoração, ministérios e ações sociais',
  defaultPrimaryCategory: 'Igreja',
  suggestedSecondaryCategories: ['Templo religioso', 'Centro comunitário', 'Organização religiosa'],
  sampleBusinessName: 'Comunidade da Fé | Igreja Cristã & Ação Social',
  nicheTerminology: 'igreja cristã e comunidade de fé com cultos presenciais e online',
  sampleKeywords: 'igreja perto de mim horários de culto, culto de domingo com ministério infantil, igreja evangélica acolhedora, grupo de jovens e aconselhamento pastoral',
  sampleTopServices: '1. Cultos de Celebração e Adoração com Transmissão ao Vivo em Alta Resolução; 2. Ministério Infantil Estruturado (Espaço Kids com Monitores Treinados); 3. Aconselhamento Pastoral e Apoio Familiar; 4. Projetos de Ação Social e Distribuição de Cestas',
  sampleDifferentials: 'Ambiente acolhedor e inclusivo para toda a família, berçário e salas climatizadas para crianças de todas as idades, louvor contemporâneo e amplo estacionamento.',
  sampleHours: 'Secretaria: Segunda a Sexta: 08:30 às 17:30 | Cultos: Quarta às 19:30 e Domingo às 10:00 e 18:30',
  sampleFaq: '1. Como funcionam os cultos para famílias com crianças pequenas? R: Temos o espaço kids com salas por faixa etária e berçário acolhedor com monitoras dedicadas. 2. Tem estacionamento no local? R: Sim, contamos com estacionamento seguro gratuito para membros e visitantes. 3. Há transmissão dos cultos pela internet? R: Sim, transmitimos todos os cultos ao vivo pelo YouTube e redes sociais.',
});

// 32. ONG & Instituto Social
const ongInstituto = buildGbpRankingTemplate({
  id: 'ong_instituto',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'ONG / Instituto Social',
  emoji: '🤝',
  subtitle: 'Organizações não governamentais, institutos sociais, causas humanitárias e voluntariado',
  defaultPrimaryCategory: 'Associação de caridade',
  suggestedSecondaryCategories: ['Organização sem fins lucrativos', 'Centro de voluntariado', 'Centro comunitário'],
  sampleBusinessName: 'Instituto Esperança & Vida | Transformação Social',
  nicheTerminology: 'ONG e organização social sem fins lucrativos',
  sampleKeywords: 'ong perto de mim para voluntariado, onde doar roupas e alimentos, projetos sociais de capacitação jovem, instituição beneficente credenciada',
  sampleTopServices: '1. Cursos de Capacitação Profissional Gratuita para Jovens e Famílias em Vulnerabilidade; 2. Atendimento Multidisciplinar (Reforço Escolar, Psicologia e Assistência Social); 3. Campanhas Periódicas de Arrecadação e Doação de Alimentos e Roupas',
  sampleDifferentials: '100% de transparência com relatórios auditados e prestação de contas pública, certificação de utilidade pública e impacto social mensurado com mais de 1.500 vidas transformadas anualmente.',
  sampleHours: 'Segunda a Sexta: 08:00 às 17:30 | Ações voluntárias aos sábados',
  sampleFaq: '1. Como posso ser voluntário na ONG? R: Você pode se cadastrar diretamente no nosso site ou WhatsApp para participar das ações semanais. 2. Como doar com segurança? R: Recebemos doações via PIX oficial do CNPJ, boleto ou doações físicas em nossa sede. 3. A instituição é transparente com as verbas? R: Publicamos mensalmente todos os balancetes e relatórios de aplicação de recursos.',
});

// 33. Startup & Tecnologia
const startupTech = buildGbpRankingTemplate({
  id: 'startup_tech',
  categoryKey: 'outros_segmentos',
  categoryTitle: 'Outros Segmentos',
  categoryEmoji: '📌',
  title: 'Startup & Tecnologia',
  emoji: '🚀',
  subtitle: 'Startups de tecnologia, empresas SaaS, desenvolvimento de software e soluções digitais',
  defaultPrimaryCategory: 'Empresa de software',
  suggestedSecondaryCategories: ['Consultoria de TI', 'Desenvolvedor de software', 'Agência de soluções digitais'],
  sampleBusinessName: 'CloudScale Tecnologia & Soluções SaaS',
  nicheTerminology: 'empresa de tecnologia, software house e soluções digitais em nuvem',
  sampleKeywords: 'empresa de desenvolvimento de software perto de mim, sistema de gestão saas para empresas, consultoria de inteligência artificial e nuvem, desenvolvimento de aplicativos mobile',
  sampleTopServices: '1. Plataformas SaaS de Automação de Processos e Gestão Empresarial; 2. Desenvolvimento de Softwares e Aplicativos Sob Medida para Empresas; 3. Consultoria de Integração com IA, APIs e Computação em Nuvem',
  sampleDifferentials: 'Arquitetura moderna escalável em nuvem com alta disponibilidade (99.9% uptime), segurança de dados em conformidade com a LGPD e suporte técnico ágil especializado.',
  sampleHours: 'Segunda a Sexta: 08:30 às 18:30 (Suporte operacional 24/7 para sistemas críticos)',
  sampleFaq: '1. Como funciona a demonstração do software? R: Agendamos uma demonstração guiada online de 20 minutos com um de nossos especialistas. 2. A plataforma se integra com outros sistemas da empresa? R: Sim, nossas soluções possuem APIs abertas para integração com ERPs, CRMs e meios de pagamento. 3. Há período de teste gratuito? R: Oferecemos 14 dias de teste sem compromisso para você validar na prática os ganhos de produtividade.',
});

export const OUTROS_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  academiaFitness,
  escolaCurso,
  hotelPousada,
  salaoBeleza,
  igrejaReligiosa,
  ongInstituto,
  startupTech,
];
