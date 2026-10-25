import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  FileQuestion,
  FolderKanban,
  FileCode2,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Lock,
  Menu,
  X,
  Globe,
  Flame
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { authService } from '../services/authService';

export type ExtendedActiveTab = ActiveTab | 'questionnaires' | 'admin' | 'site_auditor' | 'sales_closer';

interface SidebarProps {
  activeTab: ExtendedActiveTab;
  setActiveTab: (tab: ExtendedActiveTab) => void;
  projectCount: number;
  aiStatus: { hasKey: boolean; activeModel: string };
  onOpenSettings: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  projectCount,
  aiStatus,
  onOpenSettings,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const currentUser = authService.getCurrentUser();
  const hasAdmin = authService.hasAdminAccount();

  const handleNavClick = (tab: ExtendedActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navItems = [
    {
      tab: 'dashboard' as ExtendedActiveTab,
      label: 'Painel Geral',
      icon: LayoutDashboard,
      badge: null,
      section: 'PRINCIPAL',
    },
    {
      tab: 'sales_closer' as ExtendedActiveTab,
      label: 'Fechador de Vendas',
      subtitle: 'Scripts, SEO 100 & Objeções',
      icon: Flame,
      badge: 'VENDAS',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      section: 'PRINCIPAL',
    },
    {
      tab: 'site_auditor' as ExtendedActiveTab,
      label: 'Auditor de Sites',
      subtitle: 'Prompt Mestre 7.0 World-Class',
      icon: Globe,
      badge: 'NOVO',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      section: 'PRINCIPAL',
    },
    {
      tab: 'questionnaires' as ExtendedActiveTab,
      label: 'Super Questionários',
      subtitle: '33 Nichos • 1.048 Perguntas',
      icon: FileQuestion,
      badge: '33 Nichos',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      section: 'PRINCIPAL',
    },
    {
      tab: 'gbp_pro' as ExtendedActiveTab,
      label: 'Google Business Profile',
      subtitle: 'Auditoria Link & Dossiê 100/100',
      icon: Building2,
      badge: 'PRO',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      section: 'PRINCIPAL',
    },
    {
      tab: 'projects' as ExtendedActiveTab,
      label: 'Meus Projetos de Sites',
      icon: FolderKanban,
      badge: projectCount > 0 ? String(projectCount) : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      section: 'ESTÚDIO DE SITES',
    },
    {
      tab: 'master_prompt' as ExtendedActiveTab,
      label: 'Prompt Mestre',
      subtitle: 'Estruturador & Regras de IA',
      icon: FileCode2,
      badge: null,
      section: 'ESTÚDIO DE SITES',
    },
    {
      tab: 'admin' as ExtendedActiveTab,
      label: 'Área Administrativa',
      subtitle: currentUser ? 'Sessão Super Admin' : hasAdmin ? 'Login Requerido' : 'Primeiro Cadastro',
      icon: ShieldCheck,
      badge: currentUser ? 'ADMIN' : hasAdmin ? 'Restrito' : 'Criar',
      badgeColor: currentUser
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        : 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      section: 'SISTEMA',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-cyan-200" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm tracking-tight">Master Studio</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                    PRO
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">SEO Local & Prompts</div>
              </div>
            )}
          </div>

          {/* Collapse button on desktop/tablet */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {['PRINCIPAL', 'ESTÚDIO DE SITES', 'SISTEMA'].map((sec) => {
            const items = navItems.filter((i) => i.section === sec);
            if (items.length === 0) return null;

            return (
              <div key={sec} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {sec}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;

                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleNavClick(item.tab)}
                      title={isCollapsed ? `${item.label} ${item.subtitle ? `— ${item.subtitle}` : ''}` : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 text-white border border-cyan-500/40 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-cyan-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />

                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs truncate">{item.label}</span>
                            {item.badge && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                  item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.subtitle && (
                            <div className="text-[10px] text-slate-400 truncate font-normal">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Settings & Status */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Configurações & Chave API"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            {!isCollapsed && <span className="text-xs font-medium">Configurações</span>}
          </button>

          {/* Admin User Status Snippet */}
          {!isCollapsed && (
            <div
              onClick={() => handleNavClick('admin')}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Área Admin
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    currentUser
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {currentUser ? 'Conectado' : 'Acessar'}
                </span>
              </div>
              <div className="text-xs font-semibold text-white truncate">
                {currentUser ? currentUser.name : 'Administrador do Sistema'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser ? currentUser.email : 'Clique para gerenciar'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
