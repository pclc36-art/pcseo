import React from 'react';
import {
  FilePlus2,
  FolderKanban,
  Layers,
  SlidersHorizontal,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Upload,
  FileJson,
  Building2,
  Globe,
  Flame,
} from 'lucide-react';
import { Project, MasterPromptVersion, TestScenario } from '../types';
import { TEST_SCENARIOS } from '../data/testScenarios';
import { storageService } from '../services/storageService';
import { ExtendedActiveTab } from './Sidebar';

interface DashboardViewProps {
  projects: Project[];
  activeMaster: MasterPromptVersion;
  activeProject: Project | null;
  setActiveTab: (tab: ExtendedActiveTab) => void;
  onOpenProject: (project: Project) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onLoadScenario: (scenario: TestScenario) => void;
  onOpenSettings: () => void;
  onImportProject?: (project: Project) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activeMaster,
  activeProject,
  setActiveTab,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onLoadScenario,
  onOpenSettings,
  onImportProject,
  onShowToast,
}) => {
  const [deleteCandidateId, setDeleteCandidateId] = React.useState<string | null>(null);

  // Real stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed' || p.status === 'generated').length;
  const analyzedProjects = projects.filter((p) => p.status === 'analyzed').length;
  const draftProjects = projects.filter((p) => p.status === 'draft').length;

  const recentProjects = projects.slice(0, 5);

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
    if (onShowToast) {
      onShowToast('Projeto exportado!', `Arquivo ${filename} salvo com sucesso.`, 'success');
    }
  };

  // Handle Import Project JSON
  const handleImportProjectJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = storageService.importProjectJson(content);
        if (res.success && res.project) {
          if (onShowToast) {
            onShowToast('Projeto importado com sucesso!', `Projeto "${res.project.name}" adicionado ao estúdio.`, 'success');
          }
          if (onImportProject) {
            onImportProject(res.project);
          }
        } else {
          if (onShowToast) {
            onShowToast('Falha na importação', res.error || 'Formato de arquivo incompatível.', 'error');
          }
        }
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engenharia de Prompts para Criação de Sites com IA</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Master Site Prompt Studio
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Transforme questionários e briefings brutos em instruções técnicas completas,
            estratégicas e hiperpersonalizadas para ferramentas como Claude, v0, Bolt, Lovable e Cursor.
          </p>

          {/* Core Action Buttons (Specified in Tela A) */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('new_project')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>

            <button
              onClick={() => setActiveTab('sales_closer')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Fechador de Vendas</span>
              <span className="text-[10px] bg-rose-400/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">CONVERSÃO</span>
            </button>

            <button
              onClick={() => setActiveTab('site_auditor')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 font-semibold text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Auditar Site por Link</span>
              <span className="text-[10px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">NOVO</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
            >
              <FolderKanban className="w-4 h-4 text-slate-400" />
              <span>Meus Projetos</span>
            </button>

            {/* Import JSON Action */}
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-emerald-300 hover:text-emerald-200 font-medium text-sm transition-all cursor-pointer">
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
              onClick={() => setActiveTab('master_prompt')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Prompt Mestre</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fechador de Vendas & Objeções Highlight Banner */}
      <div 
        onClick={() => setActiveTab('sales_closer')}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/70 via-indigo-950/60 to-slate-900 border border-rose-500/40 p-5 sm:p-6 cursor-pointer hover:border-rose-400/80 transition-all shadow-xl group"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform flex-shrink-0">
              <Flame className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-rose-200 transition-colors">
                  Fechador de Vendas & Contra-Ataque de Objeções
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  NOVO MÓDULO
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Crie scripts irresistíveis com o nome do cliente e nicho destacando o <strong className="text-cyan-300">SEO Nota 100</strong>, o <strong className="text-indigo-300">Design que Encanta</strong> e a <strong className="text-emerald-300">Dobradinha Google Meu Negócio + Site</strong>. Cole o que o cliente respondeu e feche o contrato!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 group-hover:translate-x-1 transition-all flex-shrink-0 self-end sm:self-auto">
            <span>Abrir Fechador de Vendas</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* Featured Modules Spotlight: Site Auditor, Questionnaires, GBP Pro, Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Site Auditor by URL */}
        <div 
          onClick={() => setActiveTab('site_auditor')}
          className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🌐</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Prompt Mestre 7.0 World-Class
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            Auditor de Sites por Link
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Cole a URL de qualquer site para diagnóstico baseado nas 56 diretrizes do Prompt Mestre 7.0 com melhorias prontas para copiar.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Auditar Site Agora</span>
            <span>→</span>
          </div>
        </div>

        {/* Module 2: Super Questionnaires */}
        <div 
          onClick={() => setActiveTab('questionnaires')}
          className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📝</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              33 Nichos • 1.048 Perguntas
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
            Super Questionários por Nicho
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            33 questionários completos divididos em Saúde, Serviços, Gastronomia, Entretenimento, Varejo e Outros.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Acessar Questionários</span>
            <span>→</span>
          </div>
        </div>

        {/* Module 3: GBP Pro 100/100 */}
        <div 
          onClick={() => setActiveTab('gbp_pro')}
          className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🏢</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Padrão Ouro 100/100
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
            Google Business Profile Pro
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Auditoria por link do Google Maps com o que modificar, o que incluir e otimização para 100/100.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Abrir Módulo GBP Pro</span>
            <span>→</span>
          </div>
        </div>

        {/* Module 4: Admin Area */}
        <div 
          onClick={() => setActiveTab('admin')}
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🛡️</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Área Restrita
            </span>
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
            Área Administrativa
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Primeiro cadastro de Administrador, login seguro, recuperação de senha e backups completos.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Acessar Painel Admin</span>
            <span>→</span>
          </div>
        </div>
      </div>

      {/* Real Statistics Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total de Projetos</p>
            <p className="text-2xl font-bold text-white mt-1">{totalProjects}</p>
            <p className="text-[11px] text-slate-500 mt-1">Registrados no storage</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Prompts Gerados</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{completedProjects}</p>
            <p className="text-[11px] text-slate-500 mt-1">Prontos para copiar</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Em Análise</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{analyzedProjects}</p>
            <p className="text-[11px] text-slate-500 mt-1">Dados estruturados</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Rascunhos Iniciais</p>
            <p className="text-2xl font-bold text-slate-300 mt-1">{draftProjects}</p>
            <p className="text-[11px] text-slate-500 mt-1">Aguardando análise</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Resume Active Project Shortcut (if exists) */}
      {activeProject && (
        <div className="p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold text-cyan-400">Último Projeto Ativo</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {activeProject.projectType}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{activeProject.name}</h3>
              <p className="text-xs text-slate-400">
                Cliente: <span className="text-slate-200">{activeProject.clientName || 'Não especificado'}</span> •
                Atualizado em {new Date(activeProject.updatedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenProject(activeProject)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Retomar Projeto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Google Business Profile Pro Feature Card */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/30 to-indigo-950/40 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40 shrink-0">
            <Building2 className="w-6 h-6 text-cyan-100" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                NOVO MÓDULO OFICIAL
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Google Business Profile Pro
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Crie perfis do zero com dossiê de 13 etapas para SEO local ou realize auditorias profundas de fichas no Google Maps com pontuação 0–100, verificação de diretrizes anti-suspensão e geração automática de conteúdo corretivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('gbp_pro')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Acessar GBP Pro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Projects & Quick Test Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Projects (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Projetos Recentes</span>
            </h2>
            {totalProjects > 0 && (
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Ver todos ({totalProjects})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {recentProjects.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
              <FilePlus2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">Nenhum projeto cadastrado ainda</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Inicie criando um novo projeto ou carregue um dos três cenários oficiais de teste abaixo.
              </p>
              <button
                onClick={() => setActiveTab('new_project')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>Criar Primeiro Projeto</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentProjects.map((p) => {
                const statusColors = {
                  draft: 'bg-slate-800 text-slate-300 border-slate-700',
                  analyzed: 'bg-amber-950/70 text-amber-300 border-amber-800/40',
                  generated: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40',
                  completed: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/40',
                };
                const statusLabels = {
                  draft: 'Rascunho',
                  analyzed: 'Analisado',
                  generated: 'Gerado',
                  completed: 'Concluído',
                };

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/90 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onOpenProject(p)}>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                          {p.name}
                        </h4>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            statusColors[p.status]
                          }`}
                        >
                          {statusLabels[p.status]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        Cliente: <span className="text-slate-300">{p.clientName || 'Não especificado'}</span> •
                        Nicho: <span className="text-slate-300">{p.extractedData?.niche || 'Geral'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportJson(p);
                        }}
                        title="Exportar dados do projeto em JSON"
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateProject(p.id);
                        }}
                        title="Duplicar projeto"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
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
                      <button
                        onClick={() => onOpenProject(p)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-medium transition-all"
                      >
                        <span>Abrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Master Prompt Status & Test Scenarios Launchpad */}
        <div className="space-y-4">
          {/* Active Master Prompt Info */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Prompt Mestre Ativo</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                {activeMaster.version}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">{activeMaster.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {activeMaster.description}
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>{activeMaster.characterCount.toLocaleString()} caracteres</span>
              <button
                onClick={() => setActiveTab('master_prompt')}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Gerenciar Versões →
              </button>
            </div>
          </div>

          {/* Test Scenarios Quick Loader */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Cenários de Teste Rápidos</span>
              </span>
              <span className="text-[10px] text-slate-500">3 obrigatórios</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Carregue briefings pré-configurados para verificar o comportamento das regras condicionais:
            </p>

            <div className="space-y-2 pt-1">
              {TEST_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  onClick={() => onLoadScenario(sc)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 hover:bg-slate-900 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{sc.name.split(':')[0]}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{sc.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: DELETE PROJECT CONFIRMATION */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Excluir este projeto?</h3>
            <p className="text-xs text-slate-300 text-center leading-relaxed">
              Esta ação removerá permanentemente todos os dados, questionário original e o prompt gerado do armazenamento local.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(deleteCandidateId);
                  setDeleteCandidateId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
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
