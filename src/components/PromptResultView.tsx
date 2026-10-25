import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  Edit3,
  Save,
  FilePlus2,
  CopyPlus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Eye,
  FileText,
  Sliders,
  Sparkles,
  FileJson,
} from 'lucide-react';
import { Project, QualityReport } from '../types';
import { storageService } from '../services/storageService';
import { exportProjectAndPromptPdf } from '../services/pdfService';
import { copyToClipboard } from '../utils/clipboard';

interface PromptResultViewProps {
  project: Project;
  onSavePrompt: (newPromptText: string) => void;
  onRegenerate: () => void;
  onDuplicate: () => void;
  onNewProject: () => void;
  onBackToAnalysis: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const PromptResultView: React.FC<PromptResultViewProps> = ({
  project,
  onSavePrompt,
  onRegenerate,
  onDuplicate,
  onNewProject,
  onBackToAnalysis,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(project.finalPrompt);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'audit'>('prompt');

  const report: QualityReport | undefined = project.qualityReport;

  // Handle Copy
  const handleCopy = async () => {
    const ok = await copyToClipboard(editedPrompt);
    if (ok) {
      setCopied(true);
      onShowToast('Prompt completo copiado!', 'O texto integral foi copiado para sua área de transferência.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onShowToast('Erro ao copiar', 'Não foi possível copiar para a área de transferência.', 'error');
    }
  };

  // Handle Download TXT
  const handleDownloadTxt = () => {
    const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_prompt.txt`;
    const blob = new Blob([editedPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Arquivo baixado!', `O arquivo ${filename} foi salvo com sucesso.`, 'info');
  };

  // Handle Download Project JSON (Full structured backup)
  const handleDownloadJson = () => {
    const jsonStr = storageService.exportProjectJson({
      ...project,
      finalPrompt: editedPrompt,
    });
    const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_data.json`;
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Projeto exportado em JSON!', `Arquivo de backup ${filename} gerado com sucesso.`, 'success');
  };

  // Handle Download PDF (Executive report + prompt)
  const handleDownloadPdf = () => {
    try {
      exportProjectAndPromptPdf({
        ...project,
        finalPrompt: editedPrompt,
      });
      onShowToast('PDF Gerado com Sucesso!', `O relatório e o prompt do projeto "${project.name}" foram exportados em PDF.`, 'success');
    } catch (err: any) {
      onShowToast('Erro ao Gerar PDF', err.message || 'Falha na geração do arquivo PDF.', 'error');
    }
  };

  // Handle Save Edits
  const handleSaveEdits = () => {
    onSavePrompt(editedPrompt);
    setIsEditing(false);
    onShowToast('Alterações salvas!', 'O texto do prompt editado foi salvo no projeto.', 'success');
  };

  const wordCount = editedPrompt.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editedPrompt.length;
  const estimatedTokens = Math.round(charCount / 3.8);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header bar with primary meta and action shortcuts */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToAnalysis}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Voltar à análise"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Prompt Final Gerado
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 font-medium">
              Pronto para Uso
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 ml-7">
            Projeto: <span className="text-slate-200 font-semibold">{project.name}</span> •
            Mestre: <span className="text-cyan-400 font-mono">{project.masterPromptVersionLabel}</span> •
            {wordCount.toLocaleString()} palavras (~{estimatedTokens.toLocaleString()} tokens)
          </p>
        </div>

        {/* Tab switch between Prompt Text and Quality Audit */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'prompt'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Visualizar Prompt</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auditoria & Qualidade</span>
            {report && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                report.score >= 80 ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
              }`}>
                {report.score}/100
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Primary Action Button Bar (Section 4 requirements) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Copiar prompt completo */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado com Sucesso!' : 'Copiar Prompt Completo'}</span>
          </button>

          {/* 2. Editar prompt / Salvar alterações */}
          {isEditing ? (
            <button
              onClick={handleSaveEdits}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Editar Prompt</span>
            </button>
          )}

          {/* 3. Baixar TXT */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Baixar TXT</span>
          </button>

          {/* 3b. Exportar Projeto JSON (Backup estruturado) */}
          <button
            onClick={handleDownloadJson}
            title="Exportar projeto completo em formato JSON para backup"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-cyan-800/50 transition-all cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar JSON</span>
          </button>

          {/* 3c. Exportar Relatório e Prompt em PDF */}
          <button
            onClick={handleDownloadPdf}
            title="Exportar relatório executivo e prompt formatado em PDF"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-200" />
            <span>Exportar PDF</span>
          </button>

          {/* 4. Gerar novamente */}
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Gerar Novamente</span>
          </button>
        </div>

        {/* Secondary project actions */}
        <div className="flex items-center gap-2">
          {/* 5. Duplicar projeto */}
          <button
            onClick={onDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            <span>Duplicar</span>
          </button>

          {/* 6. Voltar à análise */}
          <button
            onClick={onBackToAnalysis}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rever Análise</span>
          </button>

          {/* 7. Criar novo projeto */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'prompt' ? (
        <div className="space-y-3">
          {isEditing && (
            <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-xs text-cyan-200 flex items-center justify-between">
              <span>
                Modo de Edição Ativo: você pode ajustar qualquer instrução técnica ou copy diretamente.
              </span>
              <button
                onClick={handleSaveEdits}
                className="px-3 py-1 rounded bg-cyan-600 text-white font-semibold text-[11px]"
              >
                Salvar Agora
              </button>
            </div>
          )}

          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-inner overflow-hidden">
            {/* Top Toolbar inside text area */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                {project.name.toUpperCase()} — {charCount.toLocaleString()} caracteres
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500">
                  {isEditing ? 'Editando...' : 'Modo Somente Leitura'}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Prompt Content Display */}
            {isEditing ? (
              <textarea
                rows={28}
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full p-5 bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y selection:bg-cyan-900"
              />
            ) : (
              <pre className="p-5 overflow-x-auto text-slate-200 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text selection:bg-cyan-900 max-h-[750px] overflow-y-auto">
                {editedPrompt}
              </pre>
            )}
          </div>
        </div>
      ) : (
        /* Quality Report & Audit Section (Section 11) */
        <div className="space-y-6">
          {report ? (
            <>
              {/* Score Card */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase font-semibold text-slate-400">
                    Resultado da Validação Automática Pré-Geração
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Conformidade com o Master Prompt 2.0
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                    Auditoria com 15 critérios objetivos de identidade, dados específicos, regras
                    condicionais de mapa e WhatsApp, acessibilidade WCAG e integridade sem dados inventados.
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-extrabold text-cyan-400">
                      {report.score}
                      <span className="text-base text-slate-500 font-normal">/100</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pontuação de Qualidade</p>
                  </div>

                  <div className="space-y-1.5 text-xs border-l border-slate-800 pl-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-slate-300">Confirmados: {report.confirmedCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="text-slate-300">Pendentes: {report.pendingCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span className="text-slate-300">Não Verificáveis: {report.unverifiableCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Detalhamento dos 15 Pontos de Verificação</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.items.map((item) => {
                    const statusConfig = {
                      confirmed: {
                        badge: 'Confirmado',
                        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40',
                        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
                      },
                      pending: {
                        badge: 'Pendente de Informação',
                        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/40',
                        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
                      },
                      unverifiable: {
                        badge: 'Não Verificável Automaticamente',
                        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
                        icon: <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />,
                      },
                    };

                    const cfg = statusConfig[item.state];

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {cfg.icon}
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">{item.title}</h5>
                              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                              cfg.badgeClass
                            }`}
                          >
                            {cfg.badge}
                          </span>
                        </div>

                        {item.details && (
                          <p className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 font-mono">
                            {item.details}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
              Relatório de auditoria não disponível para este projeto. Clique em &quot;Gerar Novamente&quot; para atualizar.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
