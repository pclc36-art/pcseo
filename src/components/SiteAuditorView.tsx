import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  ArrowRight, 
  ExternalLink, 
  Zap, 
  ShieldCheck, 
  Flame, 
  Layers, 
  Cpu, 
  FileText, 
  FolderKanban, 
  PlusCircle, 
  Trash2, 
  RefreshCw,
  Search,
  Code2,
  TrendingUp,
  SlidersHorizontal,
  BookmarkPlus,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import { 
  SiteAuditRequest, 
  SiteAuditReport, 
  SiteImprovementAction, 
  SiteOwnerInfo, 
  ExtractedSiteImage 
} from '../types/siteAuditTypes';
import { auditWebsiteWithMasterPrompt, generateHeuristicSiteAudit, extractDomainFromUrl } from '../services/siteAuditorEngine';
import { MasterPromptVersion, ProjectType, TargetPlatform } from '../types';
import { copyToClipboard as safeCopy } from '../utils/clipboard';

interface SiteAuditorViewProps {
  activeMaster: MasterPromptVersion;
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onBack?: () => void;
  onCreateProjectFromAudit?: (siteInfo: {
    name: string;
    clientName: string;
    niche: string;
    url: string;
    notes: string;
    projectType: ProjectType;
    targetPlatform: TargetPlatform;
    overallScore: number;
    suggestedBriefing: string;
    ownerInfo?: SiteOwnerInfo;
    extractedImages?: ExtractedSiteImage[];
  }) => void;
}

const STORAGE_SAVED_SITE_AUDITS = 'master_prompt_site_audits_history';

export const SiteAuditorView: React.FC<SiteAuditorViewProps> = ({
  activeMaster,
  onNotify,
  onBack,
  onCreateProjectFromAudit,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [nicheInput, setNicheInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState<'leads' | 'sales' | 'appointments' | 'authority'>('leads');
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeReport, setActiveReport] = useState<SiteAuditReport | null>(null);
  const [savedReports, setSavedReports] = useState<SiteAuditReport[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'audit_now' | 'saved_history'>('audit_now');
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_SITE_AUDITS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedReports(parsed);
          if (!activeReport) {
            setActiveReport(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico de auditorias:', e);
    }
  }, []);

  // Save reports to localStorage
  const persistSavedReports = (list: SiteAuditReport[]) => {
    setSavedReports(list);
    try {
      localStorage.setItem(STORAGE_SAVED_SITE_AUDITS, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar auditorias:', e);
    }
  };

  // Copy helper with robust fallback
  const copyToClipboard = async (text: string, key: string, label: string) => {
    const ok = await safeCopy(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((curr) => (curr === key ? null : curr)), 2000);
      onNotify('Copiado com Sucesso!', `${label} copiado para a área de transferência.`, 'success');
    } else {
      onNotify('Erro ao Copiar', 'Não foi possível acessar a área de transferência.', 'error');
    }
  };

  const isCopied = (key: string) => copiedKey === key;

  // Safe delete handler without window.confirm (works in iframes)
  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setReportToDelete(id);
  };

  const confirmDeleteReport = () => {
    if (!reportToDelete) return;
    const updated = savedReports.filter((r) => r.id !== reportToDelete);
    persistSavedReports(updated);
    if (activeReport?.id === reportToDelete) {
      setActiveReport(updated.length > 0 ? updated[0] : null);
    }
    setReportToDelete(null);
    onNotify('Auditoria Removida', 'Registro excluído do histórico.', 'info');
  };

  const confirmClearAllReports = () => {
    persistSavedReports([]);
    setActiveReport(null);
    setIsConfirmClearAll(false);
    onNotify('Histórico Limpo', 'Todas as auditorias foram removidas.', 'info');
  };

  // Run audit
  const handleRunAudit = async (urlToTest?: string) => {
    const targetUrl = (urlToTest || urlInput).trim();
    if (!targetUrl) {
      onNotify('URL Obrigatória', 'Por favor, digite ou cole o link do site a ser auditado.', 'warning');
      return;
    }

    setIsAuditing(true);
    onNotify('Iniciando Auditoria pelo Prompt Mestre', `Analisando ${targetUrl} contra as 20 diretrizes do Master Prompt...`, 'info');

    try {
      const report = await auditWebsiteWithMasterPrompt({
        url: targetUrl,
        niche: nicheInput || undefined,
        targetObjective: objectiveInput,
      });

      setActiveReport(report);

      // Save to history (avoid duplicates at the top)
      const filtered = savedReports.filter((r) => r.url !== report.url);
      const updated = [report, ...filtered].slice(0, 25);
      persistSavedReports(updated);

      onNotify(
        'Auditoria Concluída!',
        `Site avaliado com nota ${report.overallScore}/100. Melhorias geradas prontas para copiar.`,
        'success'
      );
    } catch (err: any) {
      onNotify('Erro na Auditoria', err.message || 'Falha ao processar o link.', 'error');
    } finally {
      setIsAuditing(false);
    }
  };


  // Export Markdown
  const handleExportMarkdown = () => {
    if (!activeReport) return;
    const blob = new Blob([activeReport.fullClientMarkdownReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_prompt_mestre_${activeReport.domain.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Relatório Exportado', 'Arquivo Markdown baixado com sucesso.', 'success');
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!activeReport) return;
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${activeReport.domain.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('JSON Exportado', 'Dados técnicos exportados.', 'success');
  };

  // Quick test examples
  const sampleLinks = [
    { label: 'Clínica Odonto Prime', url: 'https://clinicaodontoprime.com.br', niche: 'Odontologia / Implantes' },
    { label: 'Advocacia Silva & Associados', url: 'https://silvaadvocacia.com.br', niche: 'Advocacia Empresarial' },
    { label: 'Harmonize Estética VIP', url: 'https://harmonizeestetica.com.br', niche: 'Estética & Harmonização Facial' },
    { label: 'EcoSun Energia Solar', url: 'https://ecosunsolar.com.br', niche: 'Energia Solar & Engenharia' },
    { label: 'Imóveis Nobres SP', url: 'https://imoveisnobres.com.br', niche: 'Imobiliária de Alto Padrão' },
  ];

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
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

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
              <Globe className="w-6 h-6 text-cyan-100" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                  Auditor de Sites pelo Prompt Mestre
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 shrink-0">
                  {activeMaster.version || 'v7.0'} WORLD-CLASS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/40 shrink-0">
                  56 DIRETRIZES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 break-words">
                Cole o link de qualquer site ou landing page para diagnosticar seu desempenho real contra as 56 diretrizes do seu <strong>Master Prompt 7.0 (World-Class Digital Experience Engine)</strong> e receber melhorias estratégicas prontas para copiar.
              </p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTabSection('audit_now')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-1 md:flex-initial ${
                activeTabSection === 'audit_now'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auditar Link</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('saved_history')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all flex-1 md:flex-initial ${
                activeTabSection === 'saved_history'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Histórico ({savedReports.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: URL INPUT & AUDIT TRIGGER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Cole aqui o link do site do seu cliente ou concorrente:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1 min-w-0">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAudit();
                }}
                placeholder="Exemplo: https://meucliente.com.br ou www.clinicaexemplo.com.br"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-900"
                >
                  Limpar
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={isAuditing || !urlInput.trim()}
              onClick={() => handleRunAudit()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-blue-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-600/25 active:scale-98 transition-all disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Zap className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditando Desempenho...' : '🚀 Auditar Desempenho pelo Prompt Mestre'}</span>
            </button>
          </div>
        </div>

        {/* Quick Test Links */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Ou teste imediatamente com um link de exemplo:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleLinks.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(sample.url);
                  setNicheInput(sample.niche);
                  handleRunAudit(sample.url);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Secondary options (Niche & Objective) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Segmento / Nicho do Site (Opcional - detecta automaticamente se vazio):
            </label>
            <input
              type="text"
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              placeholder="Ex: Clínica Odontológica, Advocacia, Estética, E-commerce..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">
              Meta Principal do Site:
            </label>
            <select
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="leads">Captação de Leads Qualificados e WhatsApp</option>
              <option value="appointments">Agendamento de Consultas e Reuniões VIP</option>
              <option value="sales">Venda Direta / E-commerce</option>
              <option value="authority">Consolidação de Autoridade e Branding de Luxo</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 2: AUDIT REPORT & IMPROVEMENTS */}
      {activeReport ? (
        <div className="space-y-6 w-full min-w-0">
          {/* Executive Score Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    {activeReport.primaryNicheDetected}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    URL: {activeReport.url}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight break-words">
                  Diagnóstico de Desempenho: {activeReport.domain}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed break-words">
                  {activeReport.executiveSummary}
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 self-start md:self-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-850 flex flex-col items-center justify-center border border-slate-700">
                  <span className={`text-xl font-extrabold tracking-tight ${
                    activeReport.overallScore >= 75 ? 'text-emerald-400' : activeReport.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {activeReport.overallScore}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">de 100</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Conformidade Prompt Mestre</span>
                  <span className={`text-[11px] font-semibold block ${
                    activeReport.overallScore >= 75 ? 'text-emerald-400' : activeReport.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {activeReport.scoreLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              {/* Copy Full Report */}
              <button
                type="button"
                onClick={() => copyToClipboard(activeReport.fullClientMarkdownReport, 'full_report', 'Relatório Completo de Auditoria')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isCopied('full_report')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-emerald-500/20'
                }`}
              >
                {isCopied('full_report') ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                <span>{isCopied('full_report') ? '✓ Relatório Copiado!' : '📋 Copiar Relatório para o Cliente'}</span>
              </button>

              {/* Transform into New Project */}
              {onCreateProjectFromAudit && (
                <button
                  type="button"
                  onClick={() => onCreateProjectFromAudit({
                    name: `Reconstrução ${activeReport.ownerInfo?.businessName || activeReport.domain}`,
                    clientName: activeReport.ownerInfo?.ownerOrLeaderName
                      ? `${activeReport.ownerInfo.ownerOrLeaderName} (${activeReport.ownerInfo.businessName || activeReport.domain})`
                      : (activeReport.ownerInfo?.businessName || activeReport.domain),
                    niche: activeReport.primaryNicheDetected,
                    url: activeReport.url,
                    projectType: 'landing_page',
                    targetPlatform: 'code_generator',
                    overallScore: activeReport.overallScore,
                    suggestedBriefing: `Site diagnosticado: ${activeReport.url}
Empresa / Razão: ${activeReport.ownerInfo?.businessName || activeReport.domain}
Proprietário / Líder: ${activeReport.ownerInfo?.ownerOrLeaderName || 'A confirmar'} (${activeReport.ownerInfo?.roleOrCredential || 'Responsável'})
WhatsApp Oficial: ${activeReport.ownerInfo?.whatsapp || 'A confirmar'}
Telefone: ${activeReport.ownerInfo?.phone || 'A confirmar'}
E-mail: ${activeReport.ownerInfo?.email || 'A confirmar'}
Endereço: ${activeReport.ownerInfo?.fullAddress || 'Atendimento digital'}
CNPJ: ${activeReport.ownerInfo?.cnpj || 'Não informado'}
Instagram / Redes: ${activeReport.ownerInfo?.instagram || 'Não informado'}
Bio / Sobre: ${activeReport.ownerInfo?.bioOrAboutSummary || 'Atuação de alto padrão'}

Ativos de Imagens do Site:
${(activeReport.extractedImages || []).map(img => `- [${img.category.toUpperCase()}] ${img.label}: ${img.url}`).join('\n')}

Pontuação Geral Atual: ${activeReport.overallScore}/100
Gargalos Críticos Identificados:
${activeReport.criticalBottlenecks.map((b: string) => `- ${b}`).join('\n')}

Melhorias Estratégicas Recomendadas (Prompt Mestre 2.1):
${activeReport.recommendedImprovements.map((imp: SiteImprovementAction) => `[${imp.category.toUpperCase()}] ${imp.title}\n${imp.improvedProposal}\nConteúdo:\n${imp.copyableContent}`).join('\n\n')}`,
                    notes: `Site atual obteve nota ${activeReport.overallScore}/100. Diagnosticado com base no Master Prompt 2.1. Proprietário: ${activeReport.ownerInfo?.ownerOrLeaderName || 'Confirmar'}.`,
                    ownerInfo: activeReport.ownerInfo,
                    extractedImages: activeReport.extractedImages,
                  })}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>🚀 Criar Novo Projeto a partir deste Site</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportMarkdown}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Baixar MD</span>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>

          {/* SECTION: OWNER & BUSINESS INFO */}
          {activeReport.ownerInfo && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      Informações do Proprietário & Contatos Identificados
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dados aproveitados do site para cabeçalho, rodapé, canais de conversão e contrato.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const infoText = `EMPRESA: ${activeReport.ownerInfo.businessName}
PROPRIETÁRIO / LÍDER: ${activeReport.ownerInfo.ownerOrLeaderName} (${activeReport.ownerInfo.roleOrCredential})
WHATSAPP: ${activeReport.ownerInfo.whatsapp}
TELEFONE: ${activeReport.ownerInfo.phone}
E-MAIL: ${activeReport.ownerInfo.email}
ENDEREÇO: ${activeReport.ownerInfo.fullAddress}
CIDADE/UF: ${activeReport.ownerInfo.cityState}
CNPJ: ${activeReport.ownerInfo.cnpj || 'Não informado'}
INSTAGRAM: ${activeReport.ownerInfo.instagram || 'Não informado'}
BIO: ${activeReport.ownerInfo.bioOrAboutSummary}`;
                    copyToClipboard(infoText, 'all_owner_data', 'Todos os dados do proprietário');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto shrink-0 ${
                    isCopied('all_owner_data')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40'
                  }`}
                >
                  {isCopied('all_owner_data') ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied('all_owner_data') ? '✓ Dados Copiados!' : 'Copiar Todos os Contatos'}</span>
                </button>
              </div>

              {/* Owner Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
                {/* Business Name */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Empresa / Marca
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white truncate" title={activeReport.ownerInfo.businessName}>
                      {activeReport.ownerInfo.businessName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeReport.ownerInfo.businessName, 'owner_business', 'Nome da Empresa')}
                    className="self-end flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    {isCopied('owner_business') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied('owner_business') ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Owner Name & Role */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Proprietário / Especialista
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white truncate" title={activeReport.ownerInfo.ownerOrLeaderName}>
                      {activeReport.ownerInfo.ownerOrLeaderName}
                    </p>
                    <p className="text-[10px] text-indigo-300 truncate" title={activeReport.ownerInfo.roleOrCredential}>
                      {activeReport.ownerInfo.roleOrCredential}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${activeReport.ownerInfo.ownerOrLeaderName} — ${activeReport.ownerInfo.roleOrCredential}`, 'owner_name', 'Nome e Registro')}
                    className="self-end flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    {isCopied('owner_name') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied('owner_name') ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      WhatsApp Oficial
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-emerald-200">
                      {activeReport.ownerInfo.whatsapp}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/55${activeReport.ownerInfo.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Abrir</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeReport.ownerInfo.whatsapp, 'owner_wa', 'WhatsApp')}
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                    >
                      {isCopied('owner_wa') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied('owner_wa') ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Telefone Fixo / Comercial
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-200">
                      {activeReport.ownerInfo.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activeReport.ownerInfo.phone, 'owner_phone', 'Telefone')}
                    className="self-end flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    {isCopied('owner_phone') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied('owner_phone') ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      E-mail Corporativo
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-200 truncate" title={activeReport.ownerInfo.email}>
                      {activeReport.ownerInfo.email}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`mailto:${activeReport.ownerInfo.email}`}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mensagem</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeReport.ownerInfo.email, 'owner_email', 'E-mail')}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      {isCopied('owner_email') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied('owner_email') ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Endereço & Localização
                    </span>
                    <p className="text-xs text-slate-200 line-clamp-2" title={activeReport.ownerInfo.fullAddress}>
                      {activeReport.ownerInfo.fullAddress}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeReport.ownerInfo.fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Mapa</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeReport.ownerInfo.fullAddress, 'owner_address', 'Endereço')}
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      {isCopied('owner_address') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied('owner_address') ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* CNPJ & Social */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-2 min-w-0 sm:col-span-2 lg:col-span-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-slate-300">
                          <strong>CNPJ:</strong> {activeReport.ownerInfo.cnpj || 'Não informado'}
                        </span>
                        {activeReport.ownerInfo.instagram && (
                          <span className="text-xs text-indigo-300">
                            <strong>Instagram:</strong> {activeReport.ownerInfo.instagram}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 italic">
                        "{activeReport.ownerInfo.bioOrAboutSummary}"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(activeReport.ownerInfo.bioOrAboutSummary, 'owner_bio', 'Biografia/Sobre')}
                      className="self-end sm:self-center flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold shrink-0 cursor-pointer"
                    >
                      {isCopied('owner_bio') ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied('owner_bio') ? 'Bio Copiada' : 'Copiar Biografia'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: EXTRACTED SITE IMAGES & VISUAL ASSETS */}
          {activeReport.extractedImages && activeReport.extractedImages.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <ImageIcon className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      Imagens Principais & Ativos Visuais Extraídos ({activeReport.extractedImages.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Fotos do proprietário, logotipo, hero banner e vitrines prontas para reaproveitar no design Astro-First.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const mdImages = activeReport.extractedImages.map(img => `### ${img.label} (${img.category.toUpperCase()})
• Seção Recomendada: ${img.suggestedSection}
• Alt-Text: "${img.alt}"
• Link Direto: ${img.url}`).join('\n\n');
                    copyToClipboard(mdImages, 'all_images_links', 'Lista de Imagens em Markdown');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto shrink-0 ${
                    isCopied('all_images_links')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40'
                  }`}
                >
                  {isCopied('all_images_links') ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied('all_images_links') ? '✓ Links Copiados!' : 'Copiar Todos os Links de Imagens'}</span>
                </button>
              </div>

              {/* Images Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full min-w-0">
                {activeReport.extractedImages.map((img) => (
                  <div
                    key={img.id}
                    className="group rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 transition-all min-w-0"
                  >
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.alt}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30 uppercase">
                        {img.category}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate" title={img.label}>
                          {img.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1" title={img.alt}>
                          Alt: "{img.alt}"
                        </p>
                        <span className="inline-block text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/40 truncate max-w-full">
                          📍 {img.suggestedSection}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-900">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ver</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(img.url, `img_${img.id}`, img.label)}
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                          {isCopied(`img_${img.id}`) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied(`img_${img.id}`) ? 'Link Copiado' : 'Copiar URL'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pillars Scores Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  Avaliação dos 7 Pilares Técnicos do Master Prompt 7.0 (World-Class Engine)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Cada pilar reflete os critérios das 56 diretrizes do seu Master Prompt 7.0 para sites e landing pages de padrão internacional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
              {Object.entries(activeReport.corePillars).map(([key, pilar]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-3 min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {pilar.masterPromptRule.split('—')[0]}
                      </span>
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                        pilar.score >= 70
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : pilar.score >= 50
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {pilar.score}/100
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white break-words">
                      {pilar.name}
                    </h4>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          pilar.score >= 70 ? 'bg-emerald-400' : pilar.score >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${pilar.score}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1 break-words">
                      {pilar.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-1 text-[11px]">
                    <span className="text-rose-400 font-bold block">Gargalo detectado:</span>
                    <p className="text-slate-300 italic leading-snug break-words">
                      "{pilar.currentFlaws[0]}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Bottlenecks Section */}
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3 w-full min-w-0">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">
                  Gargalos Críticos Detectados no Site Atual
                </h3>
                <p className="text-[11px] text-slate-400">
                  Fatores que estão afastando clientes e reduzindo o retorno sobre o tráfego investido.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
              {activeReport.criticalBottlenecks.map((bot, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-rose-400 font-bold shrink-0">#{i + 1}</span>
                  <span className="text-slate-200 leading-relaxed break-words">{bot}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION: MELHORIAS MUITO MELHORES BASEADAS NO PROMPT MESTRE */}
          {/* ======================================================== */}
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-5 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 w-full min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Melhorias Muito Melhores Sugeridas pelo Prompt Mestre ({activeReport.recommendedImprovements.length} Ações Prontas)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Cada melhoria traz a solução reescrita no padrão Master Prompt 2.1 com botão individual de copiar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const allImp = activeReport.recommendedImprovements
                    .map((imp, idx) => `MELHORIA #${idx + 1}: ${imp.title}\nDIRETRIZ: ${imp.masterPromptReference}\nPROBLEMA: ${imp.currentIssue}\nSOLUÇÃO:\n${imp.copyableContent}`)
                    .join('\n\n====================\n\n');
                  copyToClipboard(allImp, 'all_improvements', 'Todas as Melhorias');
                }}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 w-full sm:w-auto shrink-0 cursor-pointer"
              >
                {isCopied('all_improvements') ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied('all_improvements') ? 'Copiado!' : 'Copiar Todas as Melhorias'}</span>
              </button>
            </div>

            {/* Improvement Cards */}
            <div className="space-y-4 w-full min-w-0">
              {activeReport.recommendedImprovements.map((imp, idx) => (
                <div
                  key={imp.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-colors space-y-3 w-full min-w-0 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2 w-full min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 shrink-0">
                          {imp.masterPromptReference}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.2 rounded shrink-0 ${
                          imp.impact === 'critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          Impacto: {imp.impact}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-white mt-1 break-words">
                        #{idx + 1} {imp.title}
                      </h4>
                    </div>

                    {/* Copy Button for this specific improvement */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(imp.copyableContent, `imp_${idx}`, imp.title)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer w-full sm:w-auto ${
                        isCopied(`imp_${idx}`)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50'
                      }`}
                    >
                      {isCopied(`imp_${idx}`) ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied(`imp_${idx}`) ? 'Copiado!' : 'Copiar Esta Melhoria'}</span>
                    </button>
                  </div>

                  {/* Diagnosis */}
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-xs space-y-1">
                    <span className="text-rose-400 font-bold block text-[11px]">Como está hoje no site:</span>
                    <p className="text-slate-300 leading-relaxed break-words">{imp.currentIssue}</p>
                  </div>

                  {/* Improved Content Box ready to copy */}
                  <div className="space-y-1.5">
                    <span className="text-emerald-400 font-bold block text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Proposta de Melhoria Padrão Ouro (Pronta para Usar):
                    </span>
                    <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-cyan-800/40 text-slate-200 text-xs font-mono leading-relaxed select-all overflow-x-auto whitespace-pre-wrap break-words shadow-inner">
                      {imp.copyableContent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* SECTION 3: SAVED AUDITS HISTORY TAB */}
      {activeTabSection === 'saved_history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              Histórico de Sites Auditados ({savedReports.length})
            </h3>
            {savedReports.length > 0 && (
              <button
                type="button"
                onClick={() => setIsConfirmClearAll(true)}
                className="text-xs text-slate-400 hover:text-rose-400 cursor-pointer"
              >
                Limpar Histórico
              </button>
            )}
          </div>

          {savedReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => {
                    setActiveReport(rep);
                    setActiveTabSection('audit_now');
                    onNotify('Auditoria Aberta', `Carregando diagnóstico de ${rep.domain}`, 'info');
                  }}
                  className={`p-4 rounded-2xl bg-slate-950 border transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                    activeReport?.id === rep.id ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider truncate">
                        {rep.primaryNicheDetected}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        rep.overallScore >= 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {rep.overallScore}/100
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {rep.domain}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {rep.url}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      {new Date(rep.analyzedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteReport(rep.id, e)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900"
                      title="Excluir do Histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500 space-y-2">
              <Globe className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Nenhuma auditoria realizada ainda.</p>
              <button
                type="button"
                onClick={() => setActiveTabSection('audit_now')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Auditar seu primeiro site agora
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Remover Auditoria?</h3>
            <p className="text-xs text-slate-300 text-center">
              Tem certeza de que deseja excluir este relatório de auditoria do seu histórico?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteReport}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLEAR ALL CONFIRMATION */}
      {isConfirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Limpar Todo o Histórico?</h3>
            <p className="text-xs text-slate-300 text-center">
              Todas as auditorias salvas serão removidas permanentemente.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmClearAll(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmClearAllReports}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
