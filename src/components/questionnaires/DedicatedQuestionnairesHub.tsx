import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Filter,
  Layers,
  FileText,
  SlidersHorizontal,
  Globe,
  ExternalLink,
  Upload,
  MessageSquare,
  FileCode,
  X
} from 'lucide-react';
import {
  ALL_33_QUESTIONNAIRES,
  QUESTIONNAIRE_CATEGORIES,
  QuestionnaireTemplate,
  getQuestionnaireById,
  getTotalQuestionCount,
} from '../../data/questionnaires';
import { NicheQuestionItem } from '../../data/questionnaires/types';
import { GbpQuestionnaireData } from '../../types/gbpTypes';
import { copyToClipboard } from '../../utils/clipboard';
import {
  generateClientQuestionnaireHtml,
  TARGET_WHATSAPP_NUMBER,
  TARGET_WHATSAPP_DISPLAY,
} from '../../services/clientQuestionnaireHtmlService';

interface DedicatedQuestionnairesHubProps {
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onGenerateDossierFromQuestionnaire?: (data: Partial<GbpQuestionnaireData>) => void;
  onBack?: () => void;
}

export const DedicatedQuestionnairesHub: React.FC<DedicatedQuestionnairesHubProps> = ({
  onNotify,
  onGenerateDossierFromQuestionnaire,
  onBack,
}) => {
  // State: selected template (null = view catalog list, or specific template id)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [searchCatalogFilter, setSearchCatalogFilter] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    saude_bem_estar: true,
    servicos_profissionais: true,
    gastronomia: true,
    entretenimento_musica: true,
    varejo_comercio: true,
    outros_segmentos: true,
  });

  // State inside active questionnaire runner
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [searchQuestionFilter, setSearchQuestionFilter] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ all: true });
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Import responses modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTextContent, setImportTextContent] = useState('');

  const activeTemplate: QuestionnaireTemplate | undefined = activeTemplateId
    ? getQuestionnaireById(activeTemplateId)
    : undefined;

  // Toggle category collapse
  const toggleCategoryCollapse = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  // Select a template from catalog
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplateId(templateId);
    setAnswers({});
    setSearchQuestionFilter('');
    setExpandedSections({ all: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to catalog
  const handleBackToCatalog = () => {
    setActiveTemplateId(null);
    setAnswers({});
    setSearchQuestionFilter('');
  };

  // Question Runner: calculations
  const totalQuestions = activeTemplate ? activeTemplate.questions.length : 0;
  const answeredCount = activeTemplate
    ? activeTemplate.questions.filter((q) => {
        const val = answers[q.id];
        return val && val.trim().length > 0;
      }).length
    : 0;
  const percentCompleted = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Question Runner: group questions by section
  const questionsBySection: Record<string, NicheQuestionItem[]> = {};
  if (activeTemplate) {
    activeTemplate.questions.forEach((q) => {
      if (!questionsBySection[q.section]) {
        questionsBySection[q.section] = [];
      }
      if (
        !searchQuestionFilter.trim() ||
        q.question.toLowerCase().includes(searchQuestionFilter.toLowerCase()) ||
        q.helperText.toLowerCase().includes(searchQuestionFilter.toLowerCase()) ||
        q.section.toLowerCase().includes(searchQuestionFilter.toLowerCase())
      ) {
        questionsBySection[q.section].push(q);
      }
    });
  }

  // Answer change
  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // 1-Click Fill Realistic Sample Answers
  const handleFillSampleAnswers = () => {
    if (!activeTemplate) return;
    const sampleMap: Record<string, string> = {};
    activeTemplate.questions.forEach((q) => {
      sampleMap[q.id] = q.sampleAnswer || `Informação qualificada para ${q.question}`;
    });
    setAnswers(sampleMap);
    onNotify(
      'Questionário Preenchido!',
      `Todas as ${totalQuestions} perguntas de "${activeTemplate.title}" foram preenchidas com dados de demonstração.`,
      'success'
    );
  };

  // Clear answers
  const handleClearAnswers = () => {
    setAnswers({});
    onNotify('Respostas Limpas', 'O formulário foi resetado com sucesso.', 'info');
  };

  // Copy All Questions formatted for WhatsApp / Client brief
  // STRICT RULE: No asterisks (*), No pointing hands (👉), No helper prefixes, strictly question and answer
  const handleCopyForWhatsApp = async () => {
    if (!activeTemplate) return;
    let text = `QUESTIONARIO ESTRATEGICO: ${activeTemplate.title.toUpperCase()}\n`;
    text += `${activeTemplate.subtitle}\n`;
    text += `Total de Perguntas: ${totalQuestions}\n\n`;

    Object.entries(questionsBySection).forEach(([sec, list]) => {
      text += `--- ${sec.toUpperCase()} ---\n\n`;
      list.forEach((q) => {
        text += `${q.number}. ${q.question}\n`;
        const ans = answers[q.id];
        if (ans && ans.trim()) {
          text += `${ans.trim()}\n\n`;
        } else {
          text += `\n`;
        }
      });
    });

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2500);
      onNotify(
        'Copiado sem Formatações!',
        `Questionário com ${totalQuestions} perguntas copiado limpo: somente perguntas e respostas (sem asteriscos ou emojis).`,
        'success'
      );
    } else {
      onNotify('Falha ao Copiar', 'Não foi possível copiar para a área de transferência.', 'error');
    }
  };

  // Export as TXT file (Clean, without asterisks or noise)
  const handleExportTxt = () => {
    if (!activeTemplate) return;
    let content = `QUESTIONARIO ESTRATEGICO: ${activeTemplate.title.toUpperCase()}\n`;
    content += `${activeTemplate.subtitle}\n`;
    content += `Categoria: ${activeTemplate.categoryTitle}\n`;
    content += `Total de Perguntas: ${totalQuestions}\n`;
    content += `Respondidas: ${answeredCount}/${totalQuestions} (${percentCompleted}%)\n\n`;

    activeTemplate.questions.forEach((q) => {
      content += `${q.number}. ${q.question}\n`;
      const ans = answers[q.id];
      if (ans && ans.trim()) {
        content += `${ans.trim()}\n\n`;
      } else {
        content += `\n`;
      }
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questionario_${activeTemplate.id}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Download Concluído', 'Questionário exportado em formato TXT limpo.', 'success');
  };

  // Export Standalone Interactive HTML Questionnaire for Client
  const handleExportClientHtml = (tpl: QuestionnaireTemplate = activeTemplate!) => {
    if (!tpl) return;
    const htmlContent = generateClientQuestionnaireHtml(tpl);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questionario_${tpl.id}_cliente.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify(
      'Questionário HTML Baixado!',
      `Arquivo "questionario_${tpl.id}_cliente.html" pronto. Envie para seu cliente responder no celular ou PC com envio direto para seu WhatsApp (${TARGET_WHATSAPP_DISPLAY}).`,
      'success'
    );
  };

  // Open Preview of Standalone Client HTML in new tab
  const handlePreviewClientHtml = () => {
    if (!activeTemplate) return;
    const htmlContent = generateClientQuestionnaireHtml(activeTemplate);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    onNotify('Prévia Aberta', 'Questionário interativo do cliente aberto em nova aba do navegador.', 'info');
  };

  // Parse and Import client answers back into active template
  const handleProcessImportResponses = () => {
    if (!activeTemplate || !importTextContent.trim()) {
      onNotify('Conteúdo Vazio', 'Cole o texto ou JSON com as respostas do cliente.', 'warning');
      return;
    }

    try {
      // 1. Try JSON import first (generated by "Baixar Arquivo" on client HTML)
      if (importTextContent.trim().startsWith('{')) {
        const parsedJson = JSON.parse(importTextContent);
        if (parsedJson.answers && typeof parsedJson.answers === 'object') {
          setAnswers((prev) => ({ ...prev, ...parsedJson.answers }));
          setIsImportModalOpen(false);
          setImportTextContent('');
          onNotify(
            'Respostas Importadas!',
            `Respostas importadas com sucesso do arquivo JSON do cliente.`,
            'success'
          );
          return;
        }
      }
    } catch {
      // Not JSON, continue to text parsing
    }

    // 2. Parse text with question numbers (e.g. "1. Pergunta\nResposta")
    const lines = importTextContent.split('\n');
    const newAnswers: Record<string, string> = { ...answers };
    let currentNumber: number | null = null;
    let currentAnswerLines: string[] = [];

    const flushCurrent = () => {
      if (currentNumber !== null) {
        const questionItem = activeTemplate.questions.find((q) => q.number === currentNumber);
        if (questionItem) {
          const answerText = currentAnswerLines.join('\n').trim();
          if (answerText && answerText !== '[Não respondido]') {
            newAnswers[questionItem.id] = answerText;
          }
        }
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      // Match question number like "1. ", "1 - ", "[1] "
      const numMatch = line.match(/^(\d+)[\.\)\-\]]\s*(.*)$/);
      if (numMatch) {
        flushCurrent();
        currentNumber = parseInt(numMatch[1], 10);
        currentAnswerLines = [];
        // If there was an inline answer or just question text
      } else if (currentNumber !== null) {
        // Exclude section dividers or metadata lines
        if (!line.startsWith('---') && !line.startsWith('QUESTIONARIO') && !line.startsWith('Cliente:') && !line.startsWith('Empresa:') && !line.startsWith('Total:')) {
          currentAnswerLines.push(rawLine);
        }
      }
    }
    flushCurrent();

    const importedCount = Object.keys(newAnswers).length;
    if (importedCount > 0) {
      setAnswers(newAnswers);
      setIsImportModalOpen(false);
      setImportTextContent('');
      onNotify(
        'Respostas Carregadas!',
        `As respostas do questionário do cliente foram vinculadas com sucesso à plataforma.`,
        'success'
      );
    } else {
      onNotify('Formato não reconhecido', 'Não foi possível identificar perguntas numeradas no texto colado.', 'warning');
    }
  };

  // Generate Dossier from current answers
  const handleTriggerDossierGeneration = () => {
    if (!activeTemplate) return;
    const nameAns = answers[`${activeTemplate.id}_1`] || answers[`${activeTemplate.id}_2`];

    const answersText = Object.entries(answers)
      .map(([id, val]) => {
        const item = activeTemplate.questions.find((q) => q.id === id);
        return item ? `${item.number}. ${item.question}\n${val}` : '';
      })
      .filter(Boolean)
      .join('\n\n');

    const mappedData: Partial<GbpQuestionnaireData> = {
      businessName: nameAns || activeTemplate.sampleBusinessName,
      primaryNiche: activeTemplate.title,
      serviceAreas: ['Bairro Central', 'Região Metropolitana'],
      additionalNotes: answersText,
      targetAudience: `Público do segmento ${activeTemplate.title}`,
      differentials: ['Atendimento de excelência', 'Equipe certificada', 'Tecnologia avançada'],
      userSuggestedKeywords: [
        `${activeTemplate.title.toLowerCase()} perto de mim`,
        `${activeTemplate.title.toLowerCase()} em sp`,
        `${activeTemplate.title.toLowerCase()} recomendada`,
      ],
    };

    if (onGenerateDossierFromQuestionnaire) {
      onGenerateDossierFromQuestionnaire(mappedData);
    } else {
      onNotify('Dossier Pronto', 'Respostas estruturadas prontas para o construtor do GBP Pro.', 'info');
    }
  };

  // ==========================================
  // VIEW 1: CATALOG OF ALL 33 QUESTIONNAIRES
  // ==========================================
  if (!activeTemplate) {
    const totalAllQuestions = getTotalQuestionCount();

    // Filter categories and templates based on search and selected tab
    const filteredCategories = QUESTIONNAIRE_CATEGORIES.map((cat) => {
      if (selectedCategoryTab !== 'all' && cat.key !== selectedCategoryTab) {
        return { ...cat, templates: [] };
      }

      const templates = cat.templates.filter((t) => {
        if (!searchCatalogFilter.trim()) return true;
        const q = searchCatalogFilter.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.categoryTitle.toLowerCase().includes(q)
        );
      });

      return { ...cat, templates };
    }).filter((cat) => cat.templates.length > 0);

    return (
      <div className="space-y-8 animate-in fade-in duration-200">
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

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>33 Nichos Especializados • {totalAllQuestions} Perguntas de Alta Conversão</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Super Questionários por Nicho
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Gere questionários interativos em <strong>HTML para enviar aos seus clientes</strong> (com botão direto para seu WhatsApp), 
              copie em texto limpo sem asteriscos ou preencha diretamente para alimentar os Prompts Mestres e Dossiês do Google Meu Negócio.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCatalogFilter}
              onChange={(e) => setSearchCatalogFilter(e.target.value)}
              placeholder="Buscar por nicho ou palavra-chave..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategoryTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos (33)
            </button>
            {QUESTIONNAIRE_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategoryTab(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryTab === c.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Categories and Cards List */}
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.key] !== false;

            return (
              <div key={category.key} className="space-y-4">
                <div
                  onClick={() => toggleCategoryCollapse(category.key)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                      {category.title}
                    </h2>
                    <span className="text-xs text-slate-400 font-normal">
                      ({category.templates.length} nichos)
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all shadow-sm flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                              {tpl.emoji}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                              {tpl.questions.length} perguntas
                            </span>
                          </div>

                          <h3
                            onClick={() => handleSelectTemplate(tpl.id)}
                            className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors cursor-pointer"
                          >
                            {tpl.title}
                          </h3>

                          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {tpl.subtitle}
                          </p>

                          <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800/60">
                            Exemplo: <span className="text-slate-400 font-medium">{tpl.sampleBusinessName}</span>
                          </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-800/40 mt-3">
                          <button
                            type="button"
                            onClick={() => handleExportClientHtml(tpl)}
                            title="Baixar questionário HTML standalone para o cliente preencher"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/70 border border-slate-700 hover:border-cyan-500/40 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>HTML Cliente</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectTemplate(tpl.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                          >
                            <span>Abrir</span>
                            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE QUESTIONNAIRE RUNNER & VIEWER
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Breadcrumb & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToCatalog}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos 33 Questionários</span>
        </button>

        <span className="text-xs text-slate-400 font-medium">
          Categoria: <strong className="text-indigo-400">{activeTemplate.categoryTitle}</strong>
        </span>
      </div>

      {/* Hero Banner for Active Questionnaire */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl p-2.5 bg-slate-950/70 rounded-2xl border border-slate-800">
              {activeTemplate.emoji}
            </span>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Template Especializado • {totalQuestions} Perguntas
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeTemplate.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {activeTemplate.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExportClientHtml(activeTemplate)}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
              title="Gera um arquivo HTML completo e responsivo para enviar ao cliente preencher no celular ou PC"
            >
              <FileCode className="w-4 h-4" />
              Baixar HTML para o Cliente
            </button>

            <button
              onClick={handlePreviewClientHtml}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Abrir prévia do questionário do cliente no navegador"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Importar respostas enviadas pelo cliente"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              Importar Respostas
            </button>

            <button
              onClick={handleFillSampleAnswers}
              className="px-3 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Preenche todas as perguntas do nicho com respostas reais de demonstração"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Preencher com Dados Reais
            </button>

            <button
              onClick={handleCopyForWhatsApp}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Copiar texto limpo sem asteriscos para envio no WhatsApp"
            >
              {copiedWhatsApp ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copiedWhatsApp ? 'Copiado!' : 'Copiar Texto Limpo'}
            </button>

            <button
              onClick={handleExportTxt}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Exportar arquivo TXT"
            >
              <Download className="w-4 h-4 text-slate-400" />
              Exportar TXT
            </button>
          </div>
        </div>

        {/* Progress Bar Row */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
              {percentCompleted}%
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Progresso: {answeredCount} de {totalQuestions} perguntas respondidas
              </div>
              <div className="text-[11px] text-slate-400">
                {answeredCount === totalQuestions
                  ? '✨ 100% preenchido! Perfeito para gerar o Dossiê GBP 100/100 Padrão Ouro.'
                  : 'Responda as perguntas essenciais ou clique em "Preencher com Dados Reais" para testar.'}
              </div>
            </div>
          </div>

          <button
            onClick={handleTriggerDossierGeneration}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            Gerar Dossiê GBP 100/100
          </button>
        </div>
      </div>

      {/* Search & Actions Bar inside Questionnaire */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuestionFilter}
            onChange={(e) => setSearchQuestionFilter(e.target.value)}
            placeholder={`Filtrar perguntas de ${activeTemplate.title}...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {answeredCount > 0 && (
          <button
            onClick={handleClearAnswers}
            className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Respostas
          </button>
        )}
      </div>

      {/* Sections and Questions */}
      <div className="space-y-4">
        {Object.entries(questionsBySection).map(([sectionName, sectionQuestions]) => {
          if (sectionQuestions.length === 0) return null;
          const isSectionOpen = expandedSections[sectionName] !== false;

          return (
            <div
              key={sectionName}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Section Header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [sectionName]: !isSectionOpen,
                  }))
                }
                className="w-full px-5 py-3.5 bg-slate-850/80 hover:bg-slate-800/80 flex items-center justify-between text-left transition-colors border-b border-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="font-bold text-sm text-white">{sectionName}</span>
                  <span className="text-[11px] text-slate-400">
                    ({sectionQuestions.length} perguntas)
                  </span>
                </div>
                {isSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Questions List */}
              {isSectionOpen && (
                <div className="p-5 space-y-5 divide-y divide-slate-800/60">
                  {sectionQuestions.map((q) => {
                    const ansVal = answers[q.id] || '';
                    return (
                      <div key={q.id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <label className="text-xs font-bold text-slate-200 leading-snug flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-500/30">
                              {q.number}
                            </span>
                            <span>{q.question}</span>
                          </label>
                          {ansVal && (
                            <span className="flex-shrink-0 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Respondida
                            </span>
                          )}
                        </div>

                        {q.helperText && (
                          <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                            💡 {q.helperText}
                          </p>
                        )}

                        <div className="pl-7">
                          <textarea
                            rows={2}
                            value={ansVal}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder || 'Digite a resposta do cliente ou da empresa...'}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="sticky bottom-4 z-30 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            {answeredCount}/{totalQuestions}
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {activeTemplate.title} ({percentCompleted}% concluído)
            </div>
            <div className="text-[10px] text-slate-400">
              WhatsApp de recebimento configurado: {TARGET_WHATSAPP_DISPLAY}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleExportClientHtml(activeTemplate)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            HTML Cliente
          </button>

          <button
            onClick={handleCopyForWhatsApp}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            Copiar Texto Limpo
          </button>

          <button
            onClick={handleTriggerDossierGeneration}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            Gerar Dossiê GBP 100/100
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: IMPORT CLIENT RESPONSES                                             */}
      {/* ========================================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <Upload className="w-5 h-5" />
                Importar Respostas do Cliente
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cole abaixo as respostas que o cliente enviou pelo WhatsApp ou o conteúdo do arquivo 
              <strong> .json</strong> baixado no questionário HTML interativo:
            </p>

            <textarea
              rows={8}
              value={importTextContent}
              onChange={(e) => setImportTextContent(e.target.value)}
              placeholder="Cole aqui o texto recebido do cliente ou o JSON exportado..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center justify-between pt-2">
              <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <FileText className="w-3.5 h-3.5" />
                Carregar Arquivo (.json/.txt)
                <input
                  type="file"
                  accept=".json,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const r = new FileReader();
                      r.onload = (evt) => {
                        setImportTextContent((evt.target?.result as string) || '');
                      };
                      r.readAsText(f);
                    }
                  }}
                />
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessImportResponses}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Processar e Preencher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
