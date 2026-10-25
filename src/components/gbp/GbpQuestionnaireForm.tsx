import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Target, 
  Share2, 
  Sparkles, 
  Copy, 
  Trash2, 
  Plus, 
  FileText, 
  Upload, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Flame,
  RotateCcw
} from 'lucide-react';
import { 
  GbpQuestionnaireData, 
  GbpProductServiceItem, 
  GbpServiceFormat, 
  GbpPrimaryObjective 
} from '../../types/gbpTypes';
import { gbpDatabase } from '../../services/gbpDatabase';
import { analyzeGbpQuestionnaire, parseGbpRawTextHeuristic } from '../../services/gbpEngine';
import { ALL_33_QUESTIONNAIRES, QuestionnaireTemplate, QUESTIONNAIRE_CATEGORIES } from '../../data/questionnaires';
import { getGbpNichePackage, GBP_33_NICHOS_SEO_PACKAGES } from '../../data/gbp33NichosData';
import { copyToClipboard } from '../../utils/clipboard';

interface GbpQuestionnaireFormProps {
  onGenerateDossier: (questionnaire: GbpQuestionnaireData) => void;
  isGenerating: boolean;
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const INITIAL_FORM: GbpQuestionnaireData = {
  businessName: '',
  primaryNiche: '',
  fullAddress: '',
  addressComplement: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  serviceAreas: [],
  phone: '',
  whatsapp: '',
  website: '',
  operatingHours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00',
  serviceFormat: 'physical',
  items: [
    {
      id: 'item_1',
      name: '',
      category: '',
      isPriority: true,
      priceEstimate: '',
      description: '',
    },
  ],
  priorityItemToPromote: '',
  differentials: [''],
  yearsInMarket: '',
  certificationsAndLicenses: [],
  targetAudience: '',
  userSuggestedKeywords: [],
  primaryObjective: 'appointments',
  socialMediaLinks: [],
  knownCompetitors: [],
  availableMaterials: {
    hasLogo: true,
    hasFacadePhoto: true,
    hasTeamPhotos: true,
    hasEnvironmentPhotos: true,
    hasProductPhotos: true,
    hasWebsite: true,
  },
  hasExistingProfile: false,
  existingProfileUrl: '',
  additionalNotes: '',
};

export const GbpQuestionnaireForm: React.FC<GbpQuestionnaireFormProps> = ({
  onGenerateDossier,
  isGenerating,
  onNotify,
}) => {
  // Top Active Mode: 'instant_paste' (Default requested by user), 'browse_33_niches', 'manual_form'
  const [activeMode, setActiveMode] = useState<'instant_paste' | 'browse_33_niches' | 'manual_form'>('instant_paste');

  // Instant Paste State
  const [pastedQuestionnaire, setPastedQuestionnaire] = useState('');
  const [selectedNicheId, setSelectedNicheId] = useState<string>('clinica_estetica');
  const [isProcessingPaste, setIsProcessingPaste] = useState(false);

  // Browse 33 Niches State
  const [browseCategoryKey, setBrowseCategoryKey] = useState<string>('all');
  const [activeNicheTemplate, setActiveNicheTemplate] = useState<QuestionnaireTemplate>(ALL_33_QUESTIONNAIRES[0]);
  const [nicheAnswers, setNicheAnswers] = useState<Record<string, string>>({});

  // Manual Form States
  const [formData, setFormData] = useState<GbpQuestionnaireData>(INITIAL_FORM);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Copy status feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
    gbpDatabase.getDraft('active_questionnaire').then((draft) => {
      if (draft && draft.businessName) {
        setFormData((prev) => ({ ...prev, ...draft }));
      }
    });
  }, []);

  // Auto-detect niche when user types or pastes text in instant mode
  useEffect(() => {
    if (pastedQuestionnaire.trim().length > 15) {
      const detectedPkg = getGbpNichePackage(pastedQuestionnaire);
      if (detectedPkg && detectedPkg.id) {
        setSelectedNicheId(detectedPkg.id);
      }
    }
  }, [pastedQuestionnaire]);

  const currentNicheSeo = getGbpNichePackage(selectedNicheId);

  const updateField = <K extends keyof GbpQuestionnaireData>(key: K, value: GbpQuestionnaireData[K]) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      gbpDatabase.saveDraft('active_questionnaire', updated);
      return updated;
    });
  };

  const handleCopyText = async (text: string, key: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      onNotify('Copiado!', `${label} copiado para a área de transferência.`, 'success');
    } else {
      onNotify('Erro ao Copiar', 'Não foi possível acessar a área de transferência.', 'error');
    }
  };

  // Instant Generation from Pasted Client Questionnaire
  const handleGenerateFromPasted = async () => {
    if (!pastedQuestionnaire.trim()) {
      onNotify('Cole o Questionário', 'Por favor, cole as respostas do cliente antes de gerar a estratégia.', 'warning');
      return;
    }

    setIsProcessingPaste(true);
    onNotify('Processando Questionário', 'Extraindo dados e mapeando 4+ palavras-chave em alta no Google...', 'info');

    try {
      // Parse heuristic with full 33-niche support
      const parsed = parseGbpRawTextHeuristic(pastedQuestionnaire);
      const nichePkg = getGbpNichePackage(selectedNicheId || parsed.primaryNiche || 'clinica_estetica');

      const clientCity = parsed.city || 'São Paulo';
      const clientAddress = parsed.fullAddress || `Atendimento em ${clientCity}`;

      // Build complete questionnaire data
      const completeData: GbpQuestionnaireData = {
        businessName: parsed.businessName || 'Empresa em Destaque',
        primaryNiche: nichePkg.name,
        fullAddress: clientAddress,
        city: clientCity,
        state: parsed.state || 'SP',
        serviceAreas: [clientCity, 'Bairros Adjacentes'],
        phone: parsed.phone || '(11) 3456-7890',
        whatsapp: parsed.whatsapp || '(11) 98765-4321',
        website: parsed.website || `https://${(parsed.businessName || 'empresa').toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
        operatingHours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00',
        serviceFormat: parsed.serviceFormat || 'physical',
        items: parsed.items && parsed.items.length > 0 ? parsed.items : nichePkg.recommendedServices.map((s, idx) => ({
          id: `item_${idx + 1}`,
          name: s.name,
          category: nichePkg.primaryCategory,
          isPriority: idx === 0,
          priceEstimate: s.priceHint,
          description: s.description.replace(/\[cidade\]/gi, clientCity),
        })),
        priorityItemToPromote: parsed.priorityItemToPromote || nichePkg.recommendedServices[0]?.name,
        differentials: ['Atendimento com pontualidade', 'Equipe especializada e pós-graduada', 'Infraestrutura moderna e higienizada'],
        yearsInMarket: 'Mais de 8 anos',
        certificationsAndLicenses: [nichePkg.primaryCategory],
        targetAudience: `Clientes de ${clientCity} que buscam excelência e segurança em ${nichePkg.name}.`,
        userSuggestedKeywords: nichePkg.topKeywordsGoogle.map((k) => k.keyword.replace(/\[cidade\]/gi, clientCity)),
        primaryObjective: 'appointments',
        socialMediaLinks: [],
        knownCompetitors: [],
        availableMaterials: {
          hasLogo: true,
          hasFacadePhoto: true,
          hasTeamPhotos: true,
          hasEnvironmentPhotos: true,
          hasProductPhotos: true,
          hasWebsite: true,
        },
        hasExistingProfile: false,
        additionalNotes: pastedQuestionnaire,
      };

      // Save draft and invoke generation
      await gbpDatabase.saveDraft('active_questionnaire', completeData);
      onGenerateDossier(completeData);
    } catch (err: any) {
      onNotify('Erro ao Processar', err.message, 'error');
    } finally {
      setIsProcessingPaste(false);
    }
  };

  // Load realistic demo answers for active template
  const handleLoadDemoForTemplate = () => {
    const demo: Record<string, string> = {};
    activeNicheTemplate.questions.forEach((q) => {
      demo[q.id] = q.sampleAnswer;
    });
    setNicheAnswers(demo);
    onNotify(
      'Respostas de Exemplo Carregadas',
      `Todas as ${activeNicheTemplate.totalQuestions} perguntas de ${activeNicheTemplate.title} foram preenchidas.`,
      'success'
    );
  };

  // Copy full questions to WhatsApp
  const handleCopyNicheForWhatsApp = () => {
    const text = `📋 QUESTIONÁRIO ESTRATÉGICO GOOGLE BUSINESS PROFILE
📌 NICHO: ${activeNicheTemplate.emoji} ${activeNicheTemplate.title.toUpperCase()} (${activeNicheTemplate.totalQuestions} Perguntas)
=====================================================
${activeNicheTemplate.questions
  .map(
    (q) =>
      `[${q.section.toUpperCase()}]
${q.number}. ${q.question}
Resposta: ${nicheAnswers[q.id] || '(A preencher)'}
`
  )
  .join('\n')}`;

    handleCopyText(text, 'whatsapp_questions', `Questionário completo de ${activeNicheTemplate.title}`);
  };

  // Generate directly from the 33-niche interactive form
  const handleGenerateFromNicheRunner = () => {
    const pkg = getGbpNichePackage(activeNicheTemplate.title);
    const bName = nicheAnswers[`${activeNicheTemplate.id}_1`] || activeNicheTemplate.sampleBusinessName;
    const clientCity = 'São Paulo';

    const answersText = Object.entries(nicheAnswers)
      .map(([id, val]) => {
        const item = activeNicheTemplate.questions.find((q) => q.id === id);
        return item ? `${item.number}. ${item.question}\nResposta: ${val}` : '';
      })
      .filter(Boolean)
      .join('\n\n');

    const completeData: GbpQuestionnaireData = {
      businessName: bName,
      primaryNiche: activeNicheTemplate.title,
      fullAddress: `Atendimento em ${clientCity}`,
      city: clientCity,
      state: 'SP',
      serviceAreas: [clientCity, 'Região Central'],
      phone: '(11) 3456-7890',
      whatsapp: '(11) 98765-4321',
      website: `https://${bName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`,
      operatingHours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 12:00',
      serviceFormat: 'physical',
      items: pkg.recommendedServices.map((s, idx) => ({
        id: `item_${idx + 1}`,
        name: s.name,
        category: pkg.primaryCategory,
        isPriority: idx === 0,
        priceEstimate: s.priceHint,
        description: s.description.replace(/\[cidade\]/gi, clientCity),
      })),
      priorityItemToPromote: pkg.recommendedServices[0]?.name,
      differentials: ['Atendimento com hora marcada', 'Profissionais altamente qualificados', 'Garantia de satisfação'],
      yearsInMarket: 'Mais de 10 anos',
      certificationsAndLicenses: [pkg.primaryCategory],
      targetAudience: `Público exigente de ${activeNicheTemplate.title}`,
      userSuggestedKeywords: pkg.topKeywordsGoogle.map((k) => k.keyword.replace(/\[cidade\]/gi, clientCity)),
      primaryObjective: 'appointments',
      socialMediaLinks: [],
      knownCompetitors: [],
      availableMaterials: {
        hasLogo: true,
        hasFacadePhoto: true,
        hasTeamPhotos: true,
        hasEnvironmentPhotos: true,
        hasProductPhotos: true,
        hasWebsite: true,
      },
      hasExistingProfile: false,
      additionalNotes: answersText || `Questionário dos 33 nichos preenchido para ${activeNicheTemplate.title}.`,
    };

    onGenerateDossier(completeData);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-full min-w-0">
      {/* Top Banner / Mode Switcher */}
      <div className="p-3.5 sm:p-6 border-b border-slate-800 bg-slate-950/80 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 shrink-0">
                GOOGLE MEU NEGÓCIO PRO
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 shrink-0">
                PADRÃO OURO 100/100
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight mt-1.5 break-words">
              Construtor de Perfil Estratégico com os 33 Nichos
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl break-words">
              Cole o questionário respondido pelo seu cliente ou selecione um dos 33 nichos. A ferramenta injeta as <strong>4+ palavras-chave em alta no Google</strong> e gera tudo 100% pronto para copiar e colar.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full w-full md:w-auto shrink-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveMode('instant_paste')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-initial ${
                activeMode === 'instant_paste'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Colar Questionário</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('browse_33_niches')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-1 md:flex-initial ${
                activeMode === 'browse_33_niches'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <span>33 Nichos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('manual_form')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-1 md:flex-initial ${
                activeMode === 'manual_form'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Formulário</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: INSTANT PASTE & GENERATE (USER'S TOP REQUIREMENT) */}
      {/* ======================================================== */}
      {activeMode === 'instant_paste' && (
        <div className="p-3.5 sm:p-6 space-y-5 sm:space-y-6 w-full min-w-0">
          {/* Instructions Callout */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-950 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-cyan-200 flex items-center gap-2 break-words">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                Cole Aqui o Questionário Respondido (WhatsApp, E-mail ou Documento)
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed break-words">
                A ferramenta identifica o nicho entre os 33 segmentos, extrai o nome e localização, e monta o perfil perfeito com as palavras-chave mais buscadas no Google.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 self-start sm:self-auto shrink-0">
              100% Pronto para Copiar e Colar
            </span>
          </div>

          {/* Niche Selector Dropdown */}
          <div className="space-y-2 w-full min-w-0">
            <label className="text-xs font-bold text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>Segmento / Nicho do Cliente (Selecione ou deixe auto-detectar):</span>
              <span className="text-[11px] text-cyan-400 font-normal">
                {currentNicheSeo.topKeywordsGoogle.length} palavras-chave de alto volume vinculadas
              </span>
            </label>
            <div className="relative w-full min-w-0">
              <select
                value={selectedNicheId}
                onChange={(e) => setSelectedNicheId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer truncate pr-10"
              >
                {Object.values(GBP_33_NICHOS_SEO_PACKAGES).map((pkg) => (
                  <option key={pkg.id} value={pkg.id} className="bg-slate-900 text-white">
                    {pkg.emoji} {pkg.name} — ({pkg.categoryGroup}) • Cat: {pkg.primaryCategory}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Trending 4+ Google Keywords Live Preview Badge */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full min-w-0">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 break-words">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                Palavras-Chave em Alta no Google para este Nicho ({currentNicheSeo.name}):
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                Injetadas automaticamente na estratégia
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentNicheSeo.topKeywordsGoogle.map((kw, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 min-w-0"
                >
                  <span className="text-amber-400 font-bold shrink-0">#{i + 1}</span>
                  <span className="font-medium text-slate-200 break-words">{kw.keyword}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase shrink-0">
                    {kw.searchVolume}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Paste Textarea */}
          <div className="space-y-2 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <label className="font-bold text-slate-300">
                Texto do Questionário Respondido:
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const sampleNiche = ALL_33_QUESTIONNAIRES.find((n) => n.id === selectedNicheId) || ALL_33_QUESTIONNAIRES[0];
                    const sampleText = sampleNiche.questions
                      .map((q) => `${q.number}. ${q.question}\nResposta: ${q.sampleAnswer}`)
                      .join('\n\n');
                    setPastedQuestionnaire(
                      `Nome da Empresa: ${sampleNiche.sampleBusinessName}\nEndereço: Avenida Paulista, 1000 - Bela Vista, São Paulo - SP\nTelefone/WhatsApp: (11) 98765-4321\nSegmento: ${sampleNiche.title}\n\n${sampleText}`
                    );
                    onNotify('Exemplo Carregado', `Dados completos de exemplo de ${sampleNiche.title} inseridos na caixa de texto.`, 'info');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold underline underline-offset-2"
                >
                  ⚡ Carregar Exemplo Realista
                </button>
                {pastedQuestionnaire && (
                  <button
                    type="button"
                    onClick={() => {
                      setPastedQuestionnaire('');
                      onNotify('Texto Limpo', 'Caixa de texto esvaziada para novo briefing.', 'info');
                    }}
                    className="text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    ✕ Limpar / Novo em Branco
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={pastedQuestionnaire}
              onChange={(e) => setPastedQuestionnaire(e.target.value)}
              rows={10}
              placeholder="Cole aqui o questionário que o cliente respondeu no WhatsApp, e-mail ou documento de texto. Exemplo:&#10;&#10;Nome da Empresa: Clínica Odonto Prime&#10;Cidade: São Paulo - SP&#10;1. Qual é o serviço principal? Implantes dentários e alinhadores transparentes...&#10;2. WhatsApp de atendimento: (11) 99887-6655&#10;3. Diferenciais: Tecnologia 3D sem dor e estacionamento com manobrista..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono leading-relaxed"
            />
          </div>

          {/* Action CTA: Generate Profile Immediately */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 w-full min-w-0">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 min-w-0 flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="break-words">Gera as 13 etapas completas, catálogo, posts, FAQs e avaliações com botão de copiar em cada item.</span>
            </div>

            <button
              type="button"
              disabled={isProcessingPaste || isGenerating || !pastedQuestionnaire.trim()}
              onClick={handleGenerateFromPasted}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-600/25 active:scale-98 transition-all disabled:opacity-40 cursor-pointer w-full sm:w-auto shrink-0 text-center"
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>
                {isProcessingPaste || isGenerating
                  ? 'Montando Perfil Perfeito...'
                  : '🚀 Gerar Perfil Google Meu Negócio'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: BROWSE ALL 33 NICHES QUESTIONNAIRES FOR RANKING */}
      {/* ======================================================== */}
      {activeMode === 'browse_33_niches' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Os 33 Nichos com Perguntas Estratégicas para Ranquear no Google
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Envie o questionário direto para o WhatsApp do cliente ou teste com respostas prontas.
              </p>
            </div>

            {/* Quick Actions for Selected Niche */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyNicheForWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 transition-colors"
              >
                {copiedKey === 'whatsapp_questions' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'whatsapp_questions' ? 'Copiado!' : 'Copiar para WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadDemoForTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Carregar Exemplo</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateFromNicheRunner}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-xs font-bold text-white shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Perfil 100/100</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none w-full max-w-full text-xs">
            <button
              onClick={() => setBrowseCategoryKey('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                browseCategoryKey === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos (33)
            </button>
            {QUESTIONNAIRE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setBrowseCategoryKey(cat.key)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  browseCategoryKey === cat.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.title}</span>
                <span className="text-[10px] opacity-75">({cat.templateCount})</span>
              </button>
            ))}
          </div>

          {/* Horizontal Niche Selector Carousel / Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
            {ALL_33_QUESTIONNAIRES.filter(
              (t) => browseCategoryKey === 'all' || t.categoryKey === browseCategoryKey
            ).map((template) => {
              const isSelected = activeNicheTemplate.id === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setActiveNicheTemplate(template);
                    setSelectedNicheId(template.id);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/80 to-slate-900 border-indigo-500/80 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{template.emoji}</span>
                    <span className="font-bold truncate text-[11px]">{template.title}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {template.totalQuestions} perguntas
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Niche Questions Preview & Runner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activeNicheTemplate.emoji}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {activeNicheTemplate.title} — {activeNicheTemplate.totalQuestions} Perguntas para Ranquear no Google
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Categoria Primária: <strong className="text-cyan-400">{activeNicheTemplate.defaultPrimaryCategory}</strong> • Subtítulo: {activeNicheTemplate.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadDemoForTemplate}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  ⚡ Preencher Exemplo
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {activeNicheTemplate.questions.map((q) => (
                <div key={q.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      {q.number}. {q.question}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono flex-shrink-0">
                      {q.section}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={nicheAnswers[q.id] || ''}
                    onChange={(e) => setNicheAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={`Ex: ${q.sampleAnswer}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 italic">{q.helperText}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Respostas preenchidas: {Object.values(nicheAnswers).filter((v) => v.trim()).length} de {activeNicheTemplate.totalQuestions}
              </span>
              <button
                type="button"
                onClick={handleGenerateFromNicheRunner}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar Perfil Completo para {activeNicheTemplate.title}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: STEP-BY-STEP MANUAL FORM (ORIGINAL FULL FORM) */}
      {/* ======================================================== */}
      {activeMode === 'manual_form' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
              <span>Etapa {activeStep} de 5:</span>
              <span className="text-white">
                {activeStep === 1 && 'Identificação & Dados Comerciais'}
                {activeStep === 2 && 'Localização & Cobertura'}
                {activeStep === 3 && 'Produtos, Serviços & Catálogo'}
                {activeStep === 4 && 'Diferenciais & Posicionamento'}
                {activeStep === 5 && 'Materiais Visuais & Revisão'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  onClick={() => setActiveStep(s as any)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                    activeStep === s
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Form Step 1 */}
          {activeStep === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nome Comercial Oficial (Como na Fachada):</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="Ex: Dra. Mariana Ramos Dermatologia"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Nicho / Segmento:</label>
                  <input
                    type="text"
                    value={formData.primaryNiche}
                    onChange={(e) => updateField('primaryNiche', e.target.value)}
                    placeholder="Ex: Clínica Médica / Dermatologia"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">WhatsApp de Atendimento:</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Step 2 */}
          {activeStep === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Endereço Comercial Completo:</label>
                <input
                  type="text"
                  value={formData.fullAddress}
                  onChange={(e) => updateField('fullAddress', e.target.value)}
                  placeholder="Rua Oscar Freire, 100 - Cerqueira César"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Cidade:</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="São Paulo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Estado (UF):</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="SP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Step 3 */}
          {activeStep === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Serviço / Produto Principal para Destacar:</label>
                <input
                  type="text"
                  value={formData.priorityItemToPromote}
                  onChange={(e) => updateField('priorityItemToPromote', e.target.value)}
                  placeholder="Ex: Consulta Dermatológica e Tratamento de Melasma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Horário de Funcionamento:</label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => updateField('operatingHours', e.target.value)}
                  placeholder="Segunda a Sexta: 08:00 às 18:00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Form Step 4 */}
          {activeStep === 4 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Diferenciais Competitivos:</label>
                <textarea
                  rows={3}
                  value={formData.differentials.join('\n')}
                  onChange={(e) => updateField('differentials', e.target.value.split('\n'))}
                  placeholder="Atendimento humanizado&#10;Equipamentos modernos&#10;Estacionamento próprio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Form Step 5 */}
          {activeStep === 5 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Anotações Adicionais / Briefing Completo:</label>
                <textarea
                  rows={5}
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  placeholder="Insira detalhes adicionais sobre o negócio, histórico, prêmios ou certificações..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Voltar
              </button>
            ) : <div />}

            {activeStep < 5 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => (prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                Próximo Passo →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onGenerateDossier(formData)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-xs font-extrabold shadow-lg shadow-cyan-600/30"
              >
                🚀 Gerar Perfil Google Meu Negócio (100/100)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
