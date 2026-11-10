import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  MessageSquare,
  Zap,
  Copy,
  Check,
  Send,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Globe,
  Building2,
  Mic,
  FileText,
  Download,
  RotateCcw,
  AlertTriangle,
  Award,
  ChevronRight,
  ExternalLink,
  Target,
  ArrowLeft
} from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';
import { salesCloserEngine } from '../../services/salesCloserEngine';
import {
  SalesPitchRequest,
  SalesPitchResult,
  ObjectionSolverRequest,
  ObjectionSolverResult,
  TargetSolutionType,
  ClientCurrentStatus,
  PitchTone
} from '../../types/salesTypes';

interface SalesCloserViewProps {
  onNotify: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onBack?: () => void;
}

export const SalesCloserView: React.FC<SalesCloserViewProps> = ({ onNotify, onBack }) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'objections'>('pitch');

  // Pitch Form State
  const [clientQuestionnaireText, setClientQuestionnaireText] = useState('');
  const [isQuestionnaireParsed, setIsQuestionnaireParsed] = useState(false);
  const [showManualFields, setShowManualFields] = useState(false);

  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [niche, setNiche] = useState('Clínica Médica / Saúde');
  const [targetSolution, setTargetSolution] = useState<TargetSolutionType>('combo_pro');
  const [cityOrRegion, setCityOrRegion] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ClientCurrentStatus>('has_instagram_only');
  const [tone, setTone] = useState<PitchTone>('consultative_high_ticket');
  const [extraDetails, setExtraDetails] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchResult, setPitchResult] = useState<SalesPitchResult | null>(null);
  const [pitchFormatTab, setPitchFormatTab] = useState<'whatsapp' | 'audio' | 'email'>('whatsapp');

  // Objection Solver State
  const [objectionClientName, setObjectionClientName] = useState('');
  const [objectionCompanyName, setObjectionCompanyName] = useState('');
  const [objectionNiche, setObjectionNiche] = useState('');
  const [clientResponse, setClientResponse] = useState('');
  const [isSolvingObjection, setIsSolvingObjection] = useState(false);
  const [objectionResult, setObjectionResult] = useState<ObjectionSolverResult | null>(null);
  const [objectionFormatTab, setObjectionFormatTab] = useState<'whatsapp' | 'audio' | 'roi'>('whatsapp');

  // Copied state indicator
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      onNotify('Copiado com Sucesso!', `${label} pronto para colar no WhatsApp.`, 'success');
      setTimeout(() => setCopiedKey(null), 2500);
    } else {
      onNotify('Erro ao copiar', 'Tente selecionar o texto e copiar manualmente.', 'error');
    }
  };

  const handleOpenWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onNotify('Download Concluído', `Arquivo ${filename} salvo no seu computador.`, 'info');
  };

  // Parser: Auto-extract data from pasted client questionnaire
  const processQuestionnaireText = (rawText: string, notifyUser = false) => {
    if (!rawText.trim()) {
      setIsQuestionnaireParsed(false);
      return;
    }

    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const textLower = rawText.toLowerCase();

    // 1. Client / Prospect Name
    let foundClientName = '';
    const clientNameMatch = rawText.match(/(?:nome do potencial cliente|nome do cliente|nome do prospecto|nome do responsável|contato|dr\.|dra\.|nome)[\s:]+([^\n\r,]+)/i);
    if (clientNameMatch && clientNameMatch[1] && clientNameMatch[1].trim().length > 1 && !clientNameMatch[1].toLowerCase().includes('qual é') && !clientNameMatch[1].toLowerCase().includes('empresa') && !clientNameMatch[1].toLowerCase().includes('oficial')) {
      foundClientName = clientNameMatch[1].replace(/^[-*•\s]+/, '').trim();
    } else {
      const greetingMatch = rawText.match(/(?:prezado\(a\)|olá|me chamo|meu nome é)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s]{3,30})/i);
      if (greetingMatch && greetingMatch[1]) {
        foundClientName = greetingMatch[1].trim();
      }
    }

    // 2. Company Name
    let foundCompanyName = '';
    const companyMatch = rawText.match(/(?:nome comercial oficial|nome da empresa|empresa|clínica|consultório|escritório|razão social|marca|estabelecimento)[\s:]+([^\n\r]+)/i);
    if (companyMatch && companyMatch[1] && companyMatch[1].trim().length > 1 && !companyMatch[1].toLowerCase().includes('oficial')) {
      foundCompanyName = companyMatch[1].replace(/^[-*•\s]+/, '').trim();
    }

    // 3. Niche / Segment
    let foundNiche = '';
    if (textLower.includes('odonto') || textLower.includes('dentista') || textLower.includes('implante') || textLower.includes('alinhador')) {
      foundNiche = 'Odontologia / Dentista';
    } else if (textLower.includes('estétic') || textLower.includes('botox') || textLower.includes('harmonização') || textLower.includes('bioestimulador')) {
      foundNiche = 'Estética & Beleza';
    } else if (textLower.includes('médic') || textLower.includes('cardiolog') || textLower.includes('consultório médico') || textLower.includes('doutor')) {
      foundNiche = 'Clínica Médica / Saúde';
    } else if (textLower.includes('fisioterap') || textLower.includes('reabilitação') || textLower.includes('pilates')) {
      foundNiche = 'Fisioterapia & Saúde';
    } else if (textLower.includes('nutri') || textLower.includes('dieta') || textLower.includes('bioimpedância')) {
      foundNiche = 'Nutrição / Nutricionista';
    } else if (textLower.includes('psicolog') || textLower.includes('terapia') || textLower.includes('saúde mental')) {
      foundNiche = 'Psicologia & Terapia';
    } else if (textLower.includes('advocac') || textLower.includes('advogad') || textLower.includes('jurídic') || textLower.includes('oab')) {
      foundNiche = 'Advocacia & Jurídico';
    } else if (textLower.includes('arquitet') || textLower.includes('interiores') || textLower.includes('design de interiores')) {
      foundNiche = 'Arquitetura & Interiores';
    } else if (textLower.includes('construç') || textLower.includes('engenhar') || textLower.includes('reforma') || textLower.includes('obra')) {
      foundNiche = 'Construção & Reformas';
    } else if (textLower.includes('imobiliár') || textLower.includes('corretor') || textLower.includes('imóve')) {
      foundNiche = 'Imobiliária / Corretores';
    } else if (textLower.includes('contabil') || textLower.includes('contador') || textLower.includes('bpo')) {
      foundNiche = 'Contabilidade / BPO';
    } else if (textLower.includes('restaurante') || textLower.includes('bistrô') || textLower.includes('pizza') || textLower.includes('hambúrguer') || textLower.includes('café') || textLower.includes('gastronom')) {
      foundNiche = 'Gastronomia & Restaurantes';
    } else if (textLower.includes('academia') || textLower.includes('crossfit') || textLower.includes('fitness') || textLower.includes('musculação')) {
      foundNiche = 'Academia / Fitness';
    } else if (textLower.includes('pet shop') || textLower.includes('veterinár') || textLower.includes('banho e tosa')) {
      foundNiche = 'Pet Shop / Veterinária';
    } else if (textLower.includes('escola') || textLower.includes('curso') || textLower.includes('idioma') || textLower.includes('treinamento')) {
      foundNiche = 'Educação / Escolas';
    } else {
      const nicheMatch = rawText.match(/(?:nicho|segmento|especialidade)[\s:]+([^\n\r]+)/i);
      if (nicheMatch && nicheMatch[1]) {
        foundNiche = nicheMatch[1].trim();
      }
    }

    // 4. City / Region
    let foundCity = '';
    const cityMatch = rawText.match(/(?:cidade|região|município|localização|endereço)[\s:]+([A-Za-zÀ-ÖØ-öø-ÿ\s]+)(?:[-/,\s]+([A-Za-z]{2}))?/i);
    if (cityMatch && cityMatch[1] && cityMatch[1].trim().length > 2) {
      foundCity = `${cityMatch[1].trim()}${cityMatch[2] ? ` - ${cityMatch[2].trim().toUpperCase()}` : ''}`;
    }

    // 5. Current Status
    let foundStatus: ClientCurrentStatus = 'has_instagram_only';
    if (textLower.includes('não tem site') || textLower.includes('não possui site') || textLower.includes('sem site')) {
      foundStatus = 'no_site_no_gmn';
    } else if (textLower.includes('site antigo') || textLower.includes('site feio') || textLower.includes('site lento') || textLower.includes('site fraco')) {
      foundStatus = 'has_bad_site';
    } else if (textLower.includes('perfil google') || textLower.includes('já aparece no maps') || textLower.includes('meu negócio')) {
      foundStatus = 'has_abandoned_gmn';
    } else if (textLower.includes('instagram') || textLower.includes('redes sociais') || textLower.includes('insta')) {
      foundStatus = 'has_instagram_only';
    }

    // 6. Extra details (extract key answers)
    const keyLines = lines.filter((l) => /(?:serviço|procedimento|diferencial|produto|horário|whatsapp|preço|avaliaç|elogio|dúvida)/i.test(l));
    const extractedExtra = keyLines.slice(0, 6).join(' \n');

    if (foundClientName) setClientName(foundClientName);
    if (foundCompanyName) setCompanyName(foundCompanyName);
    if (foundNiche) setNiche(foundNiche);
    if (foundCity) setCityOrRegion(foundCity);
    if (foundStatus) setCurrentStatus(foundStatus);
    if (extractedExtra) setExtraDetails(extractedExtra);

    setIsQuestionnaireParsed(true);

    if (notifyUser) {
      onNotify(
        'Questionário Processado!',
        `Reconhecido: ${foundClientName || 'Cliente'} (${foundCompanyName || foundNiche || 'Empresa'}) em ${foundCity || 'sua região'}.`,
        'success'
      );
    }
  };

  const handleLoadSampleQuestionnaire = () => {
    const sample = `📋 QUESTIONÁRIO RESPONDIDO PELO CLIENTE
Nome do Cliente: Dr. Fernando Vasconcelos
Nome da Empresa: Vasconcelos Odontologia Estética & Implantes
Nicho / Segmento: Odontologia / Dentista
Cidade: Campinas - SP
Endereço: Av. Barão de Itapura, 1200 - Guanabara
WhatsApp: (19) 99876-5432
Situação Atual: Hoje só tenho o Instagram com 4 mil seguidores e poucas indicações. Não tenho site e meu Google Meu Negócio está desatualizado.
Serviços Principais:
1. Implantes Dentários Guiados sem corte (R$ 2.500)
2. Lentes de Contato em Porcelana (R$ 1.800 cada)
3. Alinhadores Invisíveis Transparentes
Diferenciais: Mais de 16 anos de formado, sedação consciente com médico anestesista para quem tem medo de dor, raio-X panorâmico no consultório e estacionamento privativo gratuito.
Dúvidas frequentes dos pacientes: Medo de sentir dor na cirurgia de implante e quanto tempo dura o tratamento.`;

    setClientQuestionnaireText(sample);
    processQuestionnaireText(sample, true);
  };

  const handleClearQuestionnaire = () => {
    setClientQuestionnaireText('');
    setIsQuestionnaireParsed(false);
    setClientName('');
    setCompanyName('');
    setExtraDetails('');
    onNotify('Campos Limpos', 'Cole o questionário do cliente para começar.', 'info');
  };

  // Generate Pitch
  const handleGeneratePitch = async () => {
    // If questionnaire text was pasted but clientName/companyName is empty, run auto-extract first
    let activeClient = clientName.trim();
    let activeCompany = companyName.trim();

    if (clientQuestionnaireText.trim() && (!activeClient || !activeCompany)) {
      processQuestionnaireText(clientQuestionnaireText, false);
      activeClient = clientName.trim() || 'Cliente Especial';
      activeCompany = companyName.trim() || 'Sua Empresa';
    }

    if (!activeClient && !activeCompany && !clientQuestionnaireText.trim()) {
      onNotify('Atenção', 'Cole o questionário respondido pelo cliente no espaço indicado para gerar o roteiro.', 'warning');
      return;
    }

    setIsGeneratingPitch(true);
    try {
      const request: SalesPitchRequest = {
        clientName: activeClient || 'Cliente Especial',
        companyName: activeCompany || 'Sua Empresa',
        niche: niche.trim() || 'Serviços Especializados',
        targetSolution,
        cityOrRegion: cityOrRegion.trim(),
        currentStatus,
        tone,
        extraDetails: (extraDetails.trim() || clientQuestionnaireText.slice(0, 1000)).trim()
      };

      const result = await salesCloserEngine.generatePitch(request);
      setPitchResult(result);
      onNotify('Script Gerado com Sucesso!', 'Roteiro de abordagem com SEO 100 e diferenciais pronto para uso.', 'success');
    } catch (err: any) {
      onNotify('Erro ao gerar script', err.message || 'Falha ao processar script.', 'error');
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Solve Objection
  const handleSolveObjection = async (customText?: string) => {
    const responseToUse = customText !== undefined ? customText : clientResponse;
    if (!responseToUse.trim()) {
      onNotify('Atenção', 'Digite ou selecione a resposta/objeção que o cliente deu.', 'warning');
      return;
    }

    setIsSolvingObjection(true);
    try {
      const request: ObjectionSolverRequest = {
        clientName: objectionClientName.trim() || clientName.trim() || 'Cliente',
        companyName: objectionCompanyName.trim() || companyName.trim() || 'sua empresa',
        niche: objectionNiche.trim() || niche.trim(),
        clientResponse: responseToUse.trim(),
        targetSolution
      };

      const result = await salesCloserEngine.solveObjection(request);
      setObjectionResult(result);
      onNotify('Contra-Ataque de Objeção Pronto!', 'A melhor resposta de fechamento foi calculada.', 'success');
    } catch (err: any) {
      onNotify('Erro ao resolver objeção', err.message || 'Falha ao processar resposta.', 'error');
    } finally {
      setIsSolvingObjection(false);
    }
  };

  // Popular niches pre-sets
  const popularNiches = [
    'Clínica Médica / Saúde',
    'Odontologia / Dentista',
    'Advocacia & Jurídico',
    'Imobiliária / Corretores',
    'Estética & Beleza',
    'Gastronomia & Restaurantes',
    'Construção & Reformas',
    'Serviços Locais / Climatização',
    'Consultoria / B2B'
  ];

  // Quick Objections Arsenal
  const quickObjections = [
    { label: 'Está muito caro / Sem verba agora', text: 'Achei o valor muito alto, no momento não tenho esse orçamento para investir.' },
    { label: 'Já tenho Instagram e me atende', text: 'Eu já tenho o meu Instagram e posto todo dia, não sinto necessidade de ter um site.' },
    { label: 'Tenho sobrinho/amigo que faz por R$ 300', text: 'Tenho um conhecido/sobrinho que monta um site pra mim por R$ 300, por que pagaria mais?' },
    { label: 'Vou ver com meu sócio / esposa', text: 'Gostei da proposta, mas preciso falar com meu sócio e minha esposa antes de decidir.' },
    { label: 'Mês que vem a gente conversa / Pensar', text: 'Agora estou muito na correria. Me procure no mês que vem que a gente vê isso com calma.' },
    { label: 'Já fiz site antes e não deu em nada', text: 'Já gastei dinheiro com site antes e não me trouxe nenhum cliente, só tive dor de cabeça.' },
    { label: 'Só o Google Meu Negócio já me basta', text: 'Eu já criei meu perfil no Google Meu Negócio e já apareço no Maps, não preciso de site.' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Seta de Voltar ao Painel Geral */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all cursor-pointer shadow-sm group active:scale-95"
            title="Voltar ao Painel Geral"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar ao Painel Geral</span>
          </button>
        </div>
      )}

      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>ACELERAÇÃO DE VENDAS & FECHAMENTO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Fechador de Vendas & Objeções
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Gere scripts irresistíveis com os diferenciais exclusivos do Master Studio: 
              <span className="text-cyan-300 font-semibold"> SEO Nota 100</span>, 
              <span className="text-indigo-300 font-semibold"> Design que Encanta</span> e a 
              <span className="text-emerald-300 font-semibold"> Dobradinha Imbatível (Google Meu Negócio + Site Completo)</span>. 
              E contra-ataque qualquer hesitação do cliente em segundos!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Gerador de Script & Vantagens</span>
            </button>

            <button
              onClick={() => setActiveTab('objections')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'objections'
                  ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-lg shadow-rose-500/20 border border-rose-400/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-rose-300" />
              <span>Contra-Ataque de Objeções</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: GERADOR DE SCRIPT & VANTAGENS EXCLUSIVAS                */}
      {/* ============================================================== */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Questionário Respondido do Cliente</h2>
                    <p className="text-[11px] text-slate-400">Cole aqui as respostas do briefing ou WhatsApp</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  Extração Inteligente
                </span>
              </div>

              {/* Paste Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <span>Espaço para Colar as Respostas do Cliente:</span>
                    <span className="text-cyan-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSampleQuestionnaire}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      Exemplo
                    </button>
                    {clientQuestionnaireText && (
                      <button
                        type="button"
                        onClick={handleClearQuestionnaire}
                        className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={clientQuestionnaireText}
                  onChange={(e) => {
                    setClientQuestionnaireText(e.target.value);
                    processQuestionnaireText(e.target.value, false);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    setTimeout(() => processQuestionnaireText(pasted, true), 100);
                  }}
                  placeholder="Cole aqui as respostas do questionário que o cliente enviou pelo WhatsApp, e-mail ou briefing...&#10;&#10;Exemplo:&#10;Nome: Dr. Fernando&#10;Empresa: Clínica Vasconcelos&#10;Nicho: Odontologia / Implantes&#10;Cidade: Campinas - SP&#10;Situação: Só tem Instagram e poucas indicações&#10;Diferenciais: Sedação consciente e 16 anos de mercado"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm font-mono leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Não precisa preencher campo por campo. O sistema extrai tudo!</span>
                  {clientQuestionnaireText && (
                    <button
                      type="button"
                      onClick={() => processQuestionnaireText(clientQuestionnaireText, true)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Reanalisar
                    </button>
                  )}
                </div>
              </div>

              {/* Extraction Summary Badge Card */}
              {isQuestionnaireParsed && (clientName || companyName || cityOrRegion) && (
                <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Dados Identificados do Questionário:
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Pronto para o script</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">👤 Prospecto</span>
                      <strong className="text-white truncate block">{clientName || 'Cliente'}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">🏢 Empresa</span>
                      <strong className="text-white truncate block">{companyName || 'Empresa'}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">🏷️ Nicho</span>
                      <strong className="text-cyan-300 truncate block">{niche}</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">📍 Local</span>
                      <strong className="text-white truncate block">{cityOrRegion || 'Região'}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Target Solution Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Solução a Ofertar no Script</label>
                <select
                  value={targetSolution}
                  onChange={(e) => setTargetSolution(e.target.value as TargetSolutionType)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="combo_pro">🏆 Combo Ouro: Google Meu Negócio 100/100 + Site Completo</option>
                  <option value="landing_page">⚡ Landing Page de Alta Conversão + SEO Local</option>
                  <option value="institutional_site">🌐 Site Institucional Premium Completo + Google Meu Negócio</option>
                </select>
              </div>

              {/* Optional Manual Adjustments Accordion */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowManualFields(!showManualFields)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/60 hover:bg-slate-950 text-left flex items-center justify-between text-xs font-semibold text-slate-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <span>✏️ Ajustar Campos Manualmente</span>
                    <span className="text-[10px] text-slate-500">(Opcional)</span>
                  </span>
                  <span className="text-xs text-cyan-400">{showManualFields ? '▲ Ocultar' : '▼ Ver Campos'}</span>
                </button>

                {showManualFields && (
                  <div className="p-4 bg-slate-950/40 space-y-3.5 border-t border-slate-800">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Nome do Prospecto</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex: Dr. Fernando"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Nome da Empresa</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: Clínica Vasconcelos"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Nicho / Segmento</label>
                      <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="Ex: Odontologia / Dentista"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {popularNiches.slice(0, 5).map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setNiche(item)}
                            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                              niche === item
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {item.split(' / ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Cidade / Região</label>
                      <input
                        type="text"
                        value={cityOrRegion}
                        onChange={(e) => setCityOrRegion(e.target.value)}
                        placeholder="Ex: Campinas - SP"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Tom da Abordagem</label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value as PitchTone)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="consultative_high_ticket">Consultivo de Alto Padrão (Autoridade Máxima)</option>
                        <option value="roi_focused">Focado em ROI e Matemática do Negócio</option>
                        <option value="direct_urgency">Direto ao Ponto com Urgência Comercial</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGeneratePitch}
                disabled={isGeneratingPitch}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 bg-size-200 hover:bg-right transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGeneratingPitch ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gerando Scripts com Base nas Respostas...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>Gerar Script de Vendas & Fechamento</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 space-y-6">
              {!pitchResult ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Nenhum Script Gerado Ainda</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Preencha o nome do potencial cliente e nicho ao lado para criar um roteiro completo destacando o 
                    <span className="text-cyan-300 font-medium"> SEO Nota 100</span>, o 
                    <span className="text-indigo-300 font-medium"> Design que Encanta</span> e a 
                    <span className="text-emerald-300 font-medium"> Dobradinha com Google Meu Negócio</span>.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setClientName('Dr. Roberto');
                        setCompanyName('Clínica Odonto Prime');
                        setNiche('Odontologia / Implantes');
                        setCityOrRegion('Teresina - PI');
                        handleGeneratePitch();
                      }}
                      className="text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-medium transition-colors"
                    >
                      Preencher Exemplo de Demonstração
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Script Presentation Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
                          SCRIPT PERSONALIZADO
                        </span>
                        <h3 className="text-lg font-bold text-white">{pitchResult.headline}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Prospecto: <strong className="text-slate-200">{pitchResult.clientName}</strong> ({pitchResult.companyName})
                        </p>
                      </div>

                      {/* Format Switcher */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                        <button
                          onClick={() => setPitchFormatTab('whatsapp')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            pitchFormatTab === 'whatsapp'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setPitchFormatTab('audio')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            pitchFormatTab === 'audio'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Áudio (45s)</span>
                        </button>
                        <button
                          onClick={() => setPitchFormatTab('email')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            pitchFormatTab === 'email'
                              ? 'bg-cyan-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>E-mail / Proposta</span>
                        </button>
                      </div>
                    </div>

                    {/* Script Content Area */}
                    <div className="relative">
                      {pitchFormatTab === 'whatsapp' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 sm:p-5 text-sm text-slate-200 font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
                            {pitchResult.pitchWhatsApp}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleCopy(pitchResult.pitchWhatsApp, 'pitch_wa', 'Script WhatsApp')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
                            >
                              {copiedKey === 'pitch_wa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>Copiar Mensagem WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleOpenWhatsApp(pitchResult.pitchWhatsApp)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-emerald-400" />
                              <span>Abrir no WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleDownloadTxt(`script-whatsapp-${pitchResult.clientName}.txt`, pitchResult.pitchWhatsApp)}
                              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar .TXT</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {pitchFormatTab === 'audio' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 border border-indigo-900/40 rounded-xl p-4 sm:p-5 text-sm text-indigo-100 font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
                            {pitchResult.pitchAudioScript}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(pitchResult.pitchAudioScript, 'pitch_audio', 'Roteiro de Áudio')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
                            >
                              {copiedKey === 'pitch_audio' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>Copiar Roteiro de Áudio</span>
                            </button>
                            <span className="text-[11px] text-slate-400">
                              Dica: Grave com voz natural e pausada. Áudios no WhatsApp convertem até 3x mais que texto frio!
                            </span>
                          </div>
                        </div>
                      )}

                      {pitchFormatTab === 'email' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 border border-cyan-900/40 rounded-xl p-4 sm:p-5 text-sm text-cyan-100 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                            {pitchResult.pitchEmailOrProposal}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(pitchResult.pitchEmailOrProposal, 'pitch_email', 'Proposta Executiva')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-colors"
                            >
                              {copiedKey === 'pitch_email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>Copiar Proposta Completa</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3 Core Pillars: SEO 100 + Design Encanta + Dobradinha GMN & Site */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Por Que Seus Produtos São Únicos e Imbatíveis</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* SEO Nota 100 */}
                      <div className="bg-slate-950/70 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs">
                            100
                          </div>
                          <h5 className="text-xs font-bold text-cyan-300">SEO Nota 100 no Google</h5>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Ranqueamento orgânico real na 1ª página. Código limpo, Schema.org e carregamento instantâneo (&lt;1.2s). O cliente não fica refém de pagar anúncios todo dia para ser achado.
                        </p>
                      </div>

                      {/* Design que Encanta */}
                      <div className="bg-slate-950/70 border border-indigo-500/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <h5 className="text-xs font-bold text-indigo-300">Design que Encanta</h5>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Criado para deixar os clientes fascinados (Master Site Engine 9.0). Hierarquia visual magnética que transmite autoridade imediata e destrói qualquer concorrência amadora.
                        </p>
                      </div>

                      {/* A Dobradinha Imbatível */}
                      <div className="bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                          <h5 className="text-xs font-bold text-emerald-300">GMN + Site Integrados</h5>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          O Google Meu Negócio capta a busca local no Maps. O Site valida credibilidade e fecha no WhatsApp. Ter só um perde mais de 60% das vendas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Why GMN & Site Together Detail Box */}
                  <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <Globe className="w-4 h-4" />
                      <span>A Lógica Irrefutável: Por que ter Perfil no Google Meu Negócio E Site Completo?</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                      <p>
                        <strong className="text-white">O Erro Fatal:</strong> {pitchResult.whyGmnAndSiteTogether.theFatalMistake}
                      </p>
                      <p>
                        <strong className="text-emerald-300">A Combinação Vencedora:</strong> {pitchResult.whyGmnAndSiteTogether.theWinningCombo}
                      </p>
                    </div>
                  </div>

                  {/* Preventive Objection Killers */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Quebra Preventiva de Objeções (Argumentos Prontos)</span>
                    </h4>
                    <div className="space-y-3">
                      {pitchResult.preventiveObjections.map((obj) => (
                        <div key={obj.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">
                              Objeção: &ldquo;{obj.objection}&rdquo;
                            </span>
                            <button
                              onClick={() => handleCopy(obj.scriptSnippet, obj.id, obj.objection)}
                              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar Argumento</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 italic border-l-2 border-cyan-500/50 pl-3">
                            &ldquo;{obj.scriptSnippet}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CONTRA-ATAQUE DE OBJEÇÕES ("O QUE RESPONDER AO CLIENTE") */}
      {/* ============================================================== */}
      {activeTab === 'objections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Column */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-white">O Que o Cliente Falou?</h2>
                </div>
                <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                  Contra-Ataque
                </span>
              </div>

              {/* Context inputs (Optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Nome do Cliente</label>
                  <input
                    type="text"
                    value={objectionClientName}
                    onChange={(e) => setObjectionClientName(e.target.value)}
                    placeholder="Ex: Dr. Marcelo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Nicho / Empresa</label>
                  <input
                    type="text"
                    value={objectionNiche}
                    onChange={(e) => setObjectionNiche(e.target.value)}
                    placeholder="Ex: Odontologia"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Real Client Response Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Cole a Mensagem ou Objeção do Cliente</span>
                  <span className="text-rose-400 text-[11px] font-normal">*O que ele disse?</span>
                </label>
                <textarea
                  rows={4}
                  value={clientResponse}
                  onChange={(e) => setClientResponse(e.target.value)}
                  placeholder="Ex: 'Achei um pouco caro', 'Já tenho Instagram e não vejo motivo pra ter site', 'Vou ver com meu sócio', 'Um amigo faz por 300 reais'..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Quick Preset Objections Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Ou Selecione do Arsenal Rápido:</span>
                  <span className="text-[10px] text-slate-500">1 clique</span>
                </div>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {quickObjections.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setClientResponse(item.text);
                        handleSolveObjection(item.text);
                      }}
                      className="text-left text-xs px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2 font-medium">{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSolveObjection()}
                disabled={isSolvingObjection}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-rose-600 via-indigo-600 to-rose-600 bg-size-200 hover:bg-right transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSolvingObjection ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Calculando a Melhor Resposta de Fechamento...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-rose-200" />
                    <span>Encontrar a Melhor Resposta de Fechamento</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 space-y-6">
              {!objectionResult ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Aguardando Objeção do Cliente</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Cole a mensagem exata que o cliente enviou ou clique em uma das objeções do arsenal ao lado para obter a resposta mais persuasiva e eficaz para fechar o contrato.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Objection Header Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {objectionResult.categoryBadge}
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">
                          {objectionResult.detectedCategory}
                        </h3>
                      </div>

                      {/* Switcher */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                        <button
                          onClick={() => setObjectionFormatTab('whatsapp')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            objectionFormatTab === 'whatsapp'
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => setObjectionFormatTab('audio')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            objectionFormatTab === 'audio'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Áudio (45s)</span>
                        </button>
                        <button
                          onClick={() => setObjectionFormatTab('roi')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            objectionFormatTab === 'roi'
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>ROI & Cálculo</span>
                        </button>
                      </div>
                    </div>

                    {/* Psychology Insight */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-300">Psicologia do Cliente: </strong>
                        <span>{objectionResult.psychologyInsight}</span>
                      </div>
                    </div>

                    {/* Tab Content */}
                    <div>
                      {objectionFormatTab === 'whatsapp' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 sm:p-5 text-sm text-slate-200 font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
                            {objectionResult.whatsappReply}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleCopy(objectionResult.whatsappReply, 'obj_wa', 'Resposta WhatsApp')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-colors"
                            >
                              {copiedKey === 'obj_wa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>Copiar Resposta WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleOpenWhatsApp(objectionResult.whatsappReply)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-emerald-400" />
                              <span>Abrir no WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleDownloadTxt('resposta-objecao-cliente.txt', objectionResult.whatsappReply)}
                              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Baixar .TXT</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {objectionFormatTab === 'audio' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 border border-indigo-900/40 rounded-xl p-4 sm:p-5 text-sm text-indigo-100 font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
                            {objectionResult.audioScript}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(objectionResult.audioScript, 'obj_audio', 'Roteiro de Áudio')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
                            >
                              {copiedKey === 'obj_audio' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>Copiar Roteiro de Áudio</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {objectionFormatTab === 'roi' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-4 sm:p-5 text-xs text-amber-100 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                            {objectionResult.roiArgument}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(objectionResult.roiArgument, 'obj_roi', 'Argumento de ROI')}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-colors"
                            >
                              {copiedKey === 'obj_roi' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              <span>Copiar Argumento de ROI</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Urgency Closer & Follow-up Plan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <Flame className="w-4 h-4" />
                        <span>Gatilho de Urgência & Bônus Imediato</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {objectionResult.urgencyCloser}
                      </p>
                      <button
                        onClick={() => handleCopy(objectionResult.urgencyCloser, 'obj_urg', 'Gatilho de Urgência')}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold pt-1 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar Gatilho</span>
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Plano de Follow-up (Em 24 horas)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {objectionResult.followUpPlan}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
