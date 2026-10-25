import React, { useState } from 'react';
import { 
  Link2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Copy, 
  Download, 
  Printer, 
  ArrowRight, 
  ExternalLink, 
  Clock, 
  Eye, 
  FileText, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  HelpCircle,
  Share2,
  SlidersHorizontal,
  BookmarkPlus
} from 'lucide-react';
import { GbpAuditReport, GbpAuditRequest } from '../../types/gbpTypes';
import { auditGbpProfile } from '../../services/gbpEngine';
import { gbpDatabase } from '../../services/gbpDatabase';
import { copyToClipboard as safeCopy } from '../../utils/clipboard';

interface GbpAuditViewProps {
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  savedAudits: GbpAuditReport[];
  onAuditSelected?: (audit: GbpAuditReport) => void;
}

export const GbpAuditView: React.FC<GbpAuditViewProps> = ({
  onNotify,
  savedAudits,
}) => {
  const [profileUrlInput, setProfileUrlInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeReport, setActiveReport] = useState<GbpAuditReport | null>(
    savedAudits.length > 0 ? savedAudits[0] : null
  );
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Optional manual overrides
  const [manualRating, setManualRating] = useState<number>(4.2);
  const [manualReviews, setManualReviews] = useState<number>(18);
  const [manualResponseRate, setManualResponseRate] = useState<number>(40);
  const [manualPhotos, setManualPhotos] = useState<number>(6);
  const [isOptimizedTo100, setIsOptimizedTo100] = useState<boolean>(false);

  // Sample quick links to test immediately
  const sampleLinks = [
    {
      label: 'Clínica OdontoSmile (Moema)',
      url: 'https://maps.google.com/maps/place/OdontoSmile+Clinica+Odontologica+Moema/@-23.6038,-46.6663',
    },
    {
      label: 'Advocacia Silva (Spam no Nome)',
      url: 'https://maps.google.com/maps/place/Advocacia+Silva+-+Advogado+Trabalhista+SP+Barato/@-23.5505,-46.6333',
    },
    {
      label: 'Pousada Chalés Vila das Flores',
      url: 'https://maps.google.com/maps/place/Pousada+Chales+Vila+das+Flores+Gramado/@-29.3789,-50.8732',
    },
    {
      label: 'Studio Lumina Beleza & Visagismo',
      url: 'https://maps.google.com/maps/place/Studio+Lumina+Concept+Beleza+Moema/@-23.6022,-46.6681',
    },
  ];

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setProfileUrlInput(text);
        onNotify('Link Colado', 'URL inserida no campo de auditoria.', 'info');
      }
    } catch {
      onNotify('Permissão', 'Cole o link manualmente no campo com Ctrl+V.', 'info');
    }
  };

  const handleRunAudit = async (urlToUse?: string) => {
    const targetUrl = (urlToUse || profileUrlInput).trim();
    if (!targetUrl) {
      onNotify('Link Obrigatório', 'Por favor, cole o link do perfil do Google Maps para auditar.', 'warning');
      return;
    }

    setIsAuditing(true);
    onNotify(
      'Analisando Perfil',
      'Examinando diretrizes, autoridade local, conformidade de nome e sinais de ranqueamento...',
      'info'
    );

    // Heuristically extract business name from URL if possible
    let extractedName = '';
    try {
      if (targetUrl.includes('/place/')) {
        const parts = targetUrl.split('/place/')[1]?.split(/[/@?]/);
        if (parts && parts[0]) {
          extractedName = decodeURIComponent(parts[0].replace(/\+/g, ' ')).trim();
        }
      } else if (targetUrl.includes('?q=')) {
        const match = targetUrl.match(/[?&]q=([^&]+)/);
        if (match && match[1]) {
          extractedName = decodeURIComponent(match[1].replace(/\+/g, ' ')).trim();
        }
      }
    } catch {}

    const req: GbpAuditRequest = {
      profileUrl: targetUrl,
      businessName: extractedName || targetUrl.replace(/https?:\/\/[^/]+\/?/i, '').slice(0, 50) || 'Perfil Google Maps',
      clientName: extractedName || 'Empresa Auditada',
      currentRating: showAdvancedSettings ? manualRating : 4.2,
      totalReviews: showAdvancedSettings ? manualReviews : 18,
      responseRatePercent: showAdvancedSettings ? manualResponseRate : 40,
      photosCount: showAdvancedSettings ? manualPhotos : 6,
    };

    try {
      const { report, source } = await auditGbpProfile(req);
      // Auto save to persistent DB
      await gbpDatabase.saveAudit(report);
      setActiveReport(report);
      onNotify(
        'Auditoria Concluída!',
        `Nota ${report.overallScore}/100 gerada via ${source === 'gemini' ? 'Gemini 3.8 Flash' : 'Motor Heurístico'}. Lista de modificações e inclusões pronta.`,
        'success'
      );
    } catch (err: any) {
      onNotify('Erro na Auditoria', err.message || 'Falha ao processar link.', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    const ok = await safeCopy(text);
    if (ok) {
      onNotify('Copiado!', `${label} copiado para a área de transferência.`, 'success');
    } else {
      onNotify('Erro ao Copiar', 'Não foi possível acessar a área de transferência.', 'error');
    }
  };

  const handleExportMarkdown = () => {
    if (!activeReport) return;
    const r = activeReport;
    const md = `# RELATÓRIO DE AUDITORIA & OTIMIZAÇÃO GOOGLE BUSINESS PROFILE PRO
**Empresa:** ${r.businessName}
**Link do Perfil:** ${r.profileUrl || 'Não informado'}
**Pontuação de Ranqueamento:** ${r.overallScore}/100 (${r.scoreLevel.toUpperCase()})
**Data da Auditoria:** ${new Date(r.createdAt).toLocaleDateString('pt-BR')}

---

## RESUMO DO DIAGNÓSTICO
${r.summary}

---

## 🚨 O QUE DEVE SER MODIFICADO NO PERFIL (URGENTE)
${r.whatToModify.map((m, i) => `### ${i + 1}. ${m.title} [Prioridade: ${m.priority.toUpperCase()}]
- **Situação Atual:** ${m.currentSituation}
- **Risco de Suspensão / Queda:** ${m.risk}
- **Como Corrigir:** ${m.howToFix}`).join('\n\n')}

---

## 🚀 O QUE DEVE SER INCLUSO NO PERFIL (PARA ALCANÇAR O TOP 3)
${r.whatToInclude.map((inc, i) => `### ${i + 1}. ${inc.title} [Prioridade: ${inc.priority.toUpperCase()}]
- **Benefício no Ranqueamento:** ${inc.benefit}
- **Instruções de Implementação:** ${inc.implementationDetails}`).join('\n\n')}

---

## 📋 CONTEÚDO CORRETIVO PRONTO PARA COPIAR

### 1. Nome Recomendado sem Keyword Stuffing:
\`${r.correctiveCopy.recommendedBusinessName}\`

### 2. Categoria Primária:
${r.correctiveCopy.recommendedPrimaryCategory}

### 3. Categorias Secundárias:
${r.correctiveCopy.recommendedSecondaryCategories.join(', ')}

### 4. Descrição Otimizada (750 Caracteres):
${r.correctiveCopy.recommendedDescription}

### 5. Perguntas e Respostas Frequentes (FAQ):
${(r.correctiveCopy.recommendedFaqs || []).map((f) => `**P: ${f.question}**\nR: ${f.answer}`).join('\n\n')}

### 6. Post Imediato para Publicação:
${r.correctiveCopy.samplePostToPublish}

### 7. Modelo de Resposta a Avaliações:
${r.correctiveCopy.reviewResponseTemplate}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_gbp_${r.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Relatório Exportado', 'Arquivo Markdown baixado com sucesso.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Hero 1-Click Link Input Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auditoria Inteligente Instantânea em 1 Clique</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cole o link do perfil existente e receba o diagnóstico completo
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Sem questionários demorados: nossa IA analisa o link do Google Maps, avalia as diretrizes oficiais anti-suspensão e entrega <strong>o que deve ser modificado</strong> e <strong>o que deve ser incluso</strong> para alcançar o Top 3 no Local Pack.
          </p>

          {/* Single URL Input Form */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunAudit();
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl focus-within:border-cyan-500 transition-all"
            >
              <div className="flex-1 flex items-center gap-2.5 px-3 py-1">
                <Link2 className="w-5 h-5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  required
                  value={profileUrlInput}
                  onChange={(e) => setProfileUrlInput(e.target.value)}
                  placeholder="Cole o link do Google Maps aqui (ex: https://maps.app.goo.gl/... ou link da empresa)..."
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  title="Colar link da área de transferência"
                  className="px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Colar
                </button>

                <button
                  type="submit"
                  disabled={isAuditing}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{isAuditing ? 'Analisando Perfil...' : 'Auditar Perfil Agora'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sample Link Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Ou teste com perfis de exemplo:</span>
            {sampleLinks.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProfileUrlInput(sample.url);
                  handleRunAudit(sample.url);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Collapsible Advanced Settings (Optional) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showAdvancedSettings ? 'Ocultar Ajustes Manuais' : 'Ajustes Manuais Opcionais (Nota, Avaliações, Fotos)'}</span>
              {showAdvancedSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedSettings && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-fadeIn">
                <div>
                  <label className="text-slate-400 block mb-1">Nota Atual (1 a 5):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={manualRating}
                    onChange={(e) => setManualRating(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Total de Avaliações:</label>
                  <input
                    type="number"
                    min="0"
                    value={manualReviews}
                    onChange={(e) => setManualReviews(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Taxa de Resposta (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualResponseRate}
                    onChange={(e) => setManualResponseRate(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Qtd. de Fotos:</label>
                  <input
                    type="number"
                    min="0"
                    value={manualPhotos}
                    onChange={(e) => setManualPhotos(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AUDIT DIAGNOSTIC & RESULTS DISPLAY */}
      {activeReport ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Score Banner with 100/100 Padrão Ouro Optimizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    Resultado da Auditoria
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(activeReport.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  {isOptimizedTo100 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Projeção Padrão Ouro 100/100
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  {activeReport.businessName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                  {isOptimizedTo100
                    ? 'Projeção de excelência máxima: com a aplicação de todas as correções de nome, categorias, fotos, posts e FAQs, o perfil atinge o topo do ranking local no Google Maps.'
                    : activeReport.summary}
                </p>
              </div>

              {/* Score & Actions */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className={`text-4xl font-extrabold ${isOptimizedTo100 ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {isOptimizedTo100 ? '100' : activeReport.overallScore}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">/100 pts</span>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                      isOptimizedTo100 || activeReport.scoreLevel === 'excelente'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : activeReport.scoreLevel === 'bom'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : activeReport.scoreLevel === 'moderado'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isOptimizedTo100 ? 'PADRÃO OURO 100/100' : `Nível ${activeReport.scoreLevel}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportMarkdown}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Baixar Relatório</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 100/100 One-Click Elevation CTA Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              isOptimizedTo100 
                ? 'bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-slate-900 border-amber-500/40 text-amber-200' 
                : 'bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-slate-900 border-cyan-500/40 text-cyan-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border ${
                  isOptimizedTo100 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                    : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                }`}>
                  {isOptimizedTo100 ? '🏆' : '🎯'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {isOptimizedTo100
                      ? 'Parabéns! Pontuação Elevada para 100/100 (Padrão Ouro de Ranqueamento)'
                      : 'Meta de Qualidade Máxima: Alcance 100/100 no Perfil da Empresa'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isOptimizedTo100
                      ? 'Todas as 7 áreas de avaliação (Diretrizes, Taxonomia, NAP, SEO, Avaliações, Fotos e FAQs) atingiram 100% de conformidade.'
                      : 'Veja exatamente como eliminar riscos de suspensão e ativar todos os recursos para cravar 100/100 no Google Maps.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const next = !isOptimizedTo100;
                    setIsOptimizedTo100(next);
                    if (next) {
                      onNotify(
                        'Pontuação 100/100 Ativada!',
                        'Exibindo perfil calibrado no Padrão Ouro com todas as melhorias e correções aplicadas.',
                        'success'
                      );
                    } else {
                      onNotify('Modo Original', 'Retornado ao diagnóstico da URL.', 'info');
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 ${
                    isOptimizedTo100
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isOptimizedTo100 ? '⏪ Ver Diagnóstico Inicial' : '✨ Elevar para 100/100 (Padrão Ouro)'}
                </button>
              </div>
            </div>
          </div>

          {/* TWO MAIN COLUMNS: WHAT TO MODIFY vs WHAT TO INCLUDE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN 1: O QUE DEVE SER MODIFICADO (URGENTE) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>1. O Que Deve Ser Modificado (Urgente)</span>
                </h4>
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                  Risco de Penalização
                </span>
              </div>

              {activeReport.whatToModify && activeReport.whatToModify.length > 0 ? (
                <div className="space-y-3">
                  {activeReport.whatToModify.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.priority === 'crítica'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          Prioridade {item.priority}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Situação Atual:</strong> {item.currentSituation}
                        </p>
                        <p className="text-rose-300/90">
                          <strong>Risco no Google:</strong> {item.risk}
                        </p>
                        <p className="text-cyan-300 font-medium pt-1">
                          <strong>Como Corrigir:</strong> {item.howToFix}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
                  Nenhuma violação crítica de diretrizes detectada no momento.
                </div>
              )}
            </div>

            {/* COLUMN 2: O QUE DEVE SER INCLUSO (PARA ALCANÇAR TOP 3) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>2. O Que Deve Ser Incluso (Top 3 Local Pack)</span>
                </h4>
                <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                  Potencial de Crescimento
                </span>
              </div>

              {activeReport.whatToInclude && activeReport.whatToInclude.length > 0 ? (
                <div className="space-y-3">
                  {activeReport.whatToInclude.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          {item.title}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                          Prioridade {item.priority}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <p className="text-emerald-400">
                          <strong>Benefício Algorítmico:</strong> {item.benefit}
                        </p>
                        <p className="text-slate-300">
                          <strong>Como Implementar:</strong> {item.implementationDetails}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center">
                  Perfil já possui todos os elementos estruturais recomendados.
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: CONTEÚDO CORRETIVO PRONTO PARA COPIAR E COLAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>3. Conteúdo Corretivo Pronto para Copiar e Aplicar</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">1-Clique para Copiar</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Corrected Name */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Nome Oficial Recomendado (Sem Spam)
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activeReport.correctiveCopy.recommendedBusinessName,
                        'Nome Oficial'
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-100">
                  {activeReport.correctiveCopy.recommendedBusinessName}
                </p>
              </div>

              {/* Recommended Categories */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Categorias Recomendadas (Primária & Secundárias)
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Primária: ${activeReport.correctiveCopy.recommendedPrimaryCategory}\nSecundárias: ${activeReport.correctiveCopy.recommendedSecondaryCategories.join(', ')}`,
                        'Categorias'
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </button>
                </div>
                <p className="text-slate-200">
                  <span className="text-cyan-400 font-bold">Primária:</span>{' '}
                  {activeReport.correctiveCopy.recommendedPrimaryCategory}
                </p>
                <p className="text-slate-400 text-[11px]">
                  <span className="text-indigo-400 font-semibold">Secundárias:</span>{' '}
                  {activeReport.correctiveCopy.recommendedSecondaryCategories.join(', ')}
                </p>
              </div>

              {/* Optimized Description (750 chars) */}
              <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Descrição Otimizada (Até 750 Caracteres)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono">
                      {activeReport.correctiveCopy.recommendedDescription.length}/750 chars
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activeReport.correctiveCopy.recommendedDescription,
                        'Descrição Otimizada'
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Descrição</span>
                  </button>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  {activeReport.correctiveCopy.recommendedDescription}
                </p>
              </div>

              {/* Ready FAQs */}
              {activeReport.correctiveCopy.recommendedFaqs && activeReport.correctiveCopy.recommendedFaqs.length > 0 && (
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Perguntas e Respostas Frequentes (FAQ para Inclusão na Aba Comunitária)
                    </span>
                    <button
                      onClick={() => {
                        const faqsText = (activeReport.correctiveCopy.recommendedFaqs || [])
                          .map((f) => `P: ${f.question}\nR: ${f.answer}`)
                          .join('\n\n');
                        copyToClipboard(faqsText, 'Todas as Perguntas do FAQ');
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Todos os FAQs</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeReport.correctiveCopy.recommendedFaqs.map((faq, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                        <p className="font-semibold text-slate-200 text-[11px]">{faq.question}</p>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Immediate Post to Publish */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Post Imediato para Publicação
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activeReport.correctiveCopy.samplePostToPublish,
                        'Post para Publicação'
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Post</span>
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  "{activeReport.correctiveCopy.samplePostToPublish}"
                </p>
              </div>

              {/* Review Response Template */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Template Oficial de Resposta a Avaliações
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        activeReport.correctiveCopy.reviewResponseTemplate,
                        'Template de Avaliação'
                      )
                    }
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Resposta</span>
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  "{activeReport.correctiveCopy.reviewResponseTemplate}"
                </p>
              </div>
            </div>
          </div>

          {/* 7 Pillars Detailed Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Pontuação Detalhada nos 7 Pilares Oficiais do Google Maps</span>
              </h4>
              {isOptimizedTo100 && (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Todos os 7 Pilares com 100% de Aproveitamento
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {Object.values(activeReport.pillars).map((pillar, idx) => {
                const scoreToDisplay = isOptimizedTo100 ? pillar.maxScore : pillar.score;
                const statusToDisplay = isOptimizedTo100 ? 'excellent' : pillar.status;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 transition-all ${
                      isOptimizedTo100 ? 'border-amber-500/30 shadow-md shadow-amber-500/5' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 text-[11px] block truncate">
                        {pillar.name}
                      </span>
                      <span
                        className={`font-bold text-xs ${
                          statusToDisplay === 'excellent'
                            ? 'text-emerald-400'
                            : statusToDisplay === 'good'
                            ? 'text-cyan-400'
                            : statusToDisplay === 'warning'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {scoreToDisplay}/{pillar.maxScore}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Peso no ranking: {pillar.weightPercent}% {isOptimizedTo100 && '• 100% Atingido'}
                    </span>
                    <ul className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                      {isOptimizedTo100 ? (
                        <>
                          <li className="text-emerald-300/90 truncate">• ✅ Otimizado no padrão ouro Google</li>
                          <li className="text-slate-400 truncate">• Diretrizes 100% atendidas</li>
                        </>
                      ) : (
                        pillar.diagnostics.slice(0, 2).map((diag, i) => (
                          <li key={i} className="truncate" title={diag}>
                            • {diag}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
