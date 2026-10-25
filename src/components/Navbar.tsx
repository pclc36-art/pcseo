import React from 'react';
import { Sparkles, Layers, FileCode2, SlidersHorizontal, FolderKanban, HardDrive, ShieldCheck, Building2, Globe } from 'lucide-react';
import { MasterPromptVersion } from '../types';

export type ActiveTab = 'dashboard' | 'gbp_pro' | 'site_auditor' | 'new_project' | 'analysis' | 'prompt_result' | 'projects' | 'master_prompt' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeMaster: MasterPromptVersion;
  projectCount: number;
  aiStatus: { hasKey: boolean; activeModel: string };
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeMaster,
  projectCount,
  aiStatus,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/10 border border-cyan-400/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-base tracking-tight group-hover:text-cyan-400 transition-colors">
                  Master Site Prompt Studio
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                  {activeMaster.version || 'v2.0'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Gerador Estratégico de Prompts para Sites & LPs
              </p>
            </div>
          </button>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Painel
          </button>

          <button
            onClick={() => setActiveTab('site_auditor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'site_auditor'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auditor de Sites</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/50">
              NOVO
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gbp_pro')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'gbp_pro'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Business</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'projects'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Meus Projetos</span>
            {projectCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">
                {projectCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('master_prompt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'master_prompt'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Prompt Mestre</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Configurações</span>
          </button>
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Persistence badge */}
          <div
            onClick={onOpenSettings}
            title="Armazenamento seguro ativo no dispositivo/navegador"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs cursor-pointer hover:border-slate-700 transition-colors"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">Local Seguro</span>
          </div>

          {/* AI Engine badge */}
          <div
            onClick={onOpenSettings}
            title={aiStatus.hasKey ? 'Gemini 3.8 Flash conectado' : 'Motor heurístico determinístico nativo'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs cursor-pointer hover:border-slate-700 transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                aiStatus.hasKey ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
            />
            <span className="text-[11px] font-medium text-slate-300">
              {aiStatus.hasKey ? 'Gemini AI' : 'Motor Nativo'}
            </span>
          </div>

          {/* New Project CTA */}
          <button
            onClick={() => setActiveTab('new_project')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <FileCode2 className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Mobile Submenu */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 bg-slate-950 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 rounded-lg font-medium ${
            activeTab === 'dashboard' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          Painel
        </button>
        <button
          onClick={() => setActiveTab('gbp_pro')}
          className={`px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${
            activeTab === 'gbp_pro' ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/40' : 'text-slate-400'
          }`}
        >
          <span>GBP Pro</span>
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-2 py-1 rounded-lg font-medium ${
            activeTab === 'projects' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          Projetos ({projectCount})
        </button>
        <button
          onClick={() => setActiveTab('master_prompt')}
          className={`px-2 py-1 rounded-lg font-medium ${
            activeTab === 'master_prompt' ? 'text-cyan-400 bg-slate-900' : 'text-slate-400'
          }`}
        >
          Mestre
        </button>
        <button
          onClick={onOpenSettings}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-400"
        >
          Configurações
        </button>
      </div>
    </header>
  );
};
