import { buildGbpRankingTemplate } from './helper';
import { QuestionnaireTemplate } from './types';

export const ENTRETENIMENTO_QUESTIONNAIRES: QuestionnaireTemplate[] = [
  // 20. Artista Musical / Banda
  buildGbpRankingTemplate({
    id: 'artista_banda',
    categoryKey: 'entretenimento_musica',
    categoryTitle: 'Entretenimento & Música',
    categoryEmoji: '🎵',
    title: 'Artista Musical / Banda',
    emoji: '🎵',
    subtitle: 'Músicos solo, cantores, bandas de baile, DJs, grupos autorais e cover',
    defaultPrimaryCategory: 'Músico',
    suggestedSecondaryCategories: ['Banda musical', 'DJ para eventos', 'Serviço de entretenimento'],
    sampleBusinessName: 'Banda Vibe Sonora | Música ao Vivo para Casamentos',
    nicheTerminology: 'banda musical e entretenimento ao vivo para eventos',
    sampleKeywords: 'banda para casamento perto de mim, música ao vivo para festa de formatura, contratação de banda corporativa, show de pop rock acústico',
    sampleTopServices: '1. Show Completo de Casamento com Pista Cheia (Banda de 7 Músicos com Metais); 2. Formato Acústico Cerimônia e Coquetel (Voz, Violão, Violino e Percussão); 3. DJ Integrado para Intervalos e Festa Até de Manhã',
    sampleDifferentials: 'Repertório 100% customizável pelos noivos, sistema próprio de som e iluminação profissional com técnico dedicado e mais de 250 casamentos celebrados com pista lotada.',
    sampleHours: 'Atendimento Comercial: Segunda a Sábado: 09:00 às 20:00 | Apresentações conforme agenda de eventos',
    sampleFaq: '1. Podemos escolher músicas específicas para o repertório? R: Sim! Os noivos escolhem as músicas-chave da cerimônia e os ritmos favoritos para a festa. 2. A banda leva som e luz própria? R: Sim, dispomos de estrutura completa de som, iluminação cênica e microfones sem fio. 3. Como funciona o contrato e pagamento? R: Contrato formal com CNPJ e parcelamento facilitado até a semana do evento.',
  }),

  // 21. Casa de Shows / Teatro
  buildGbpRankingTemplate({
    id: 'casa_shows_teatro',
    categoryKey: 'entretenimento_musica',
    categoryTitle: 'Entretenimento & Música',
    categoryEmoji: '🎵',
    title: 'Casa de Shows / Teatro',
    emoji: '🎭',
    subtitle: 'Casas de shows, teatros, centros culturais e espaços para eventos de grande porte',
    defaultPrimaryCategory: 'Casa de espetáculos',
    suggestedSecondaryCategories: ['Teatro', 'Centro cultural', 'Espaço para eventos'],
    sampleBusinessName: 'Teatro Hall Espaço Cultural & Eventos',
    nicheTerminology: 'casa de espetáculos, teatro e locação para eventos',
    sampleKeywords: 'casa de shows perto de mim, teatro com espetáculos infantis, aluguel de teatro para formatura e palestras, ingressos de shows na cidade',
    sampleTopServices: '1. Locação Completa do Espaço Cênico para Produtoras e Empresas; 2. Temporadas de Espetáculos Teatrais e Stand-up Comedy; 3. Eventos Corporativos, Premiações e Convenções com Estrutura Audiovisual de Ponta',
    sampleDifferentials: 'Capacidade homologada para 800 pessoas com conforto térmico, isolamento acústico profissional, gerador próprio de energia e acessibilidade total para cadeirantes.',
    sampleHours: 'Bilheteria: Segunda a Sábado: 10:00 às 19:00 | Dias de Espetáculo: até início da sessão',
    sampleFaq: '1. O espaço tem estacionamento no local? R: Sim, contamos com estacionamento seguro e convênio com garagens no entorno. 2. O local é acessível para pessoas com deficiência? R: Sim, 100% acessível com rampas, elevadores e assentos reservados. 3. Como comprar ingressos online? R: Os ingressos oficiais são vendidos diretamente no link da Sympla integrado ao nosso site e perfil do Google.',
  }),
];
