import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Filter,
  ArrowRight,
  Copy,
  Trash2,
  FilePlus2,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
  Download,
  FileJson,
  Upload,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '../types';
import { storageService } from '../services/storageService';
import { exportProjectAndPromptPdf } from '../services/pdfService';
import { copyToClipboard } from '../utils/clipboard';

interface ProjectsListViewProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  onProjectImported?: (project: Project) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onBack?: () => void;
}

export const ProjectsListView: React.FC<ProjectsListViewProps> = ({
  projects,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onNewProject,
  onProjectImported,
  onShowToast,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Filter projects by search term, status and type
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.extractedData?.niche?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
    const matchesType = selectedType === 'all' || p.projectType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  // Handle Copy Project Final Prompt
  const handleCopyPrompt = async (p: Project) => {
    if (!p.finalPrompt) {
      onShowToast('Prompt não gerado', 'Gere o prompt do projeto antes de copiar.', 'warning');
      return;
    }
    const ok = await copyToClipboard(p.finalPrompt);
    if (ok) {
      setCopiedProjectId(p.id);
      setTimeout(() => setCopiedProjectId(null), 2000);
      onShowToast('Prompt Copiado!', `Prompt completo de "${p.name}" copiado para a área de transferência.`, 'success');
    } else {
      onShowToast('Erro ao Copiar', 'Não foi possível copiar para a área de transferência.', 'error');
    }
  };

  // Handle Export Project TXT
  const handleExportTxt = (p: Project) => {
    if (!p.finalPrompt) {
      onShowToast('Prompt não gerado ainda', 'Abra o projeto e gere o prompt antes de exportar.', 'warning');
      return;
    }
    const filename = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_prompt.txt`;
    const blob = new Blob([p.finalPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Arquivo baixado!', `Exportado: ${filename}`, 'info');
  };

  // Handle Export Single Project JSON
  const handleExportJson = (p: Project) => {
    const jsonStr = storageService.exportProjectJson(p);
    const filename = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_data.json`;
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Projeto exportado em JSON!', `Arquivo de backup ${filename} gerado.`, 'success');
  };

  // Handle Export Single Project PDF
  const handleExportPdf = (p: Project) => {
    if (!p.finalPrompt) {
      onShowToast('Prompt pendente', 'Gere o prompt do projeto antes de exportar em PDF.', 'warning');
      return;
    }
    try {
      exportProjectAndPromptPdf(p);
      onShowToast('PDF Gerado!', `Relatório e prompt do projeto "${p.name}" exportados em PDF.`, 'success');
    } catch (err: any) {
      onShowToast('Erro ao exportar PDF', err.message || 'Falha na geração do PDF.', 'error');
    }
  };

  // Handle Import Single Project JSON
  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storageService.importProjectJson(content);
        if (res.success && res.project) {
          onShowToast('Projeto importado com sucesso!', `Projeto "${res.project.name}" adicionado à lista.`, 'success');
          if (onProjectImported) {
            onProjectImported(res.project);
          }
        } else {
          onShowToast('Falha na importação do JSON', res.error || 'Formato de arquivo incompatível.', 'error');
        }
      }
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const confirmDelete = () => {
    if (deleteCandidateId) {
      onDeleteProject(deleteCandidateId);
      setDeleteCandidateId(null);
      onShowToast('Projeto excluído', 'O projeto foi removido do armazenamento local.', 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-cyan-400" />
            <span>Gerenciamento de Projetos</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Histórico completo de projetos salvos com versões do prompt mestre, dados estruturados e backups em JSON.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Import JSON Button */}
          <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Importar Projeto (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportProjectJson}
              className="hidden"
            />
          </label>

          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome do projeto, cliente ou nicho..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-cyan-500"
          >
            <option value="all">Todos os Status</option>
            <option value="draft">Rascunhos</option>
            <option value="analyzed">Analisados</option>
            <option value="generated">Prompts Gerados</option>
            <option value="completed">Concluídos</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-cyan-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="landing_page">Landing Page</option>
            <option value="institutional">Institucional</option>
            <option value="professional">Profissional</option>
            <option value="service_page">Página de Serviço</option>
            <option value="clinic">Clínica</option>
            <option value="local_business">Local</option>
            <option value="ecommerce">E-commerce</option>
            <option value="portfolio">Portfólio</option>
          </select>
        </div>
      </div>

      {/* Projects List Grid */}
      {filteredProjects.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-slate-800 text-center">
          <FolderKanban className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Nenhum projeto encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
              ? 'Nenhum projeto corresponde aos filtros selecionados. Tente ajustar a busca.'
              : 'Você ainda não possui projetos salvos. Crie seu primeiro projeto agora.'}
          </p>
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Criar Projeto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((p) => {
            const statusLabels: Record<ProjectStatus, { label: string; class: string }> = {
              draft: { label: 'Rascunho', class: 'bg-slate-800 text-slate-300 border-slate-700' },
              analyzed: { label: 'Analisado', class: 'bg-amber-950/70 text-amber-300 border-amber-800/40' },
              generated: { label: 'Prompt Gerado', class: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40' },
              completed: { label: 'Concluído', class: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/40' },
            };

            const status = statusLabels[p.status];

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/90 transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${status.class}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Mestre {p.masterPromptVersionLabel || 'v2.0'}
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenProject(p)}
                    className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
                  >
                    {p.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Cliente:{' '}
                    <span className="text-slate-200 font-medium">
                      {p.clientName || 'Não especificado'}
                    </span>{' '}
                    • Nicho: <span className="text-slate-300">{p.extractedData?.niche || 'Geral'}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </span>
                    <span>•</span>
                    <span className="capitalize">{p.projectType.replace('_', ' ')}</span>
                    {p.finalPrompt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">
                          {p.finalPrompt.split(/\s+/).length} palavras
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    {p.finalPrompt && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPrompt(p);
                          }}
                          title="Copiar Prompt Completo"
                          className="p-2 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          {copiedProjectId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPdf(p);
                          }}
                          title="Exportar Relatório e Prompt em PDF"
                          className="p-2 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportTxt(p);
                          }}
                          title="Baixar TXT do prompt"
                          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportJson(p);
                      }}
                      title="Exportar dados do projeto em JSON (Backup)"
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <FileJson className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProject(p.id);
                      }}
                      title="Duplicar projeto (Criar cópia)"
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCandidateId(p.id);
                      }}
                      title="Excluir projeto"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenProject(p)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Abrir Projeto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (Required in Section 9) */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800/50 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">Excluir este projeto?</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Esta ação removerá permanentemente todos os dados, questionário original e o prompt gerado
                deste projeto do armazenamento local.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
