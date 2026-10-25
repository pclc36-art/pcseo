import React, { useState, useEffect } from 'react';
import { Sidebar, ExtendedActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { NewProjectView } from './components/NewProjectView';
import { AnalysisView } from './components/AnalysisView';
import { PromptResultView } from './components/PromptResultView';
import { ProjectsListView } from './components/ProjectsListView';
import { MasterPromptManager } from './components/MasterPromptManager';
import { SettingsModal } from './components/SettingsModal';
import { GbpProHub } from './components/gbp/GbpProHub';
import { DedicatedQuestionnairesHub } from './components/questionnaires/DedicatedQuestionnairesHub';
import { AdminAreaView } from './components/admin/AdminAreaView';
import { AdminGatekeeperView } from './components/admin/AdminGatekeeperView';
import { SiteAuditorView } from './components/SiteAuditorView';
import { SalesCloserView } from './components/sales/SalesCloserView';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { storageService } from './services/storageService';
import { authService, AdminUser } from './services/authService';
import { analyzeQuestionnaire, checkApiHealth, HealthStatus } from './services/aiService';
import { composeFinalPrompt } from './services/composerEngine';
import { Project, ProjectExtractedData, ProjectType, TargetPlatform, TestScenario } from './types';
import { GbpQuestionnaireData } from './types/gbpTypes';
import { Menu, Sparkles, ShieldCheck, Building2, FileQuestion, FolderKanban, Globe, LogOut, Flame, ArrowLeft, Home, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ExtendedActiveTab>('dashboard');
  const [tabHistory, setTabHistory] = useState<ExtendedActiveTab[]>(['dashboard']);

  // Seamless navigation with back history support
  const navigateToTab = (tab: ExtendedActiveTab) => {
    if (tab === 'new_project') {
      handleStartNewProject();
    } else {
      if (tab !== activeTab) {
        setTabHistory((prev) => [...prev, activeTab]);
        setActiveTab(tab);
      }
    }
  };

  const handleBack = () => {
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory((history) => history.slice(0, history.length - 1));
      setActiveTab(prev || 'dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [masterVersions, setMasterVersions] = useState(storageService.getMasterPromptVersions());
  const [activeMaster, setActiveMaster] = useState(storageService.getActiveMasterPrompt());
  const [pendingGbpQuestionnaire, setPendingGbpQuestionnaire] = useState<Partial<GbpQuestionnaireData> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<HealthStatus>({
    status: 'checking',
    hasKey: false,
    activeModel: 'gemini-3.8-flash',
    engine: 'Carregando...',
  });

  // Prefill state for new project (used when scenario is clicked)
  const [newProjectInitialValues, setNewProjectInitialValues] = useState<{
    name?: string;
    clientName?: string;
    projectType?: ProjectType;
    targetPlatform?: TargetPlatform;
    hostingTarget?: import('./types').HostingTarget;
    preferredFramework?: string;
    questionnaire?: string;
    additionalNotes?: string;
  } | undefined>(undefined);

  // Analysis result temporary state
  const [analysisData, setAnalysisData] = useState<{
    data: ProjectExtractedData;
    source: 'gemini' | 'heuristic';
  } | null>(null);

  // Authentication & System Lock State
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [systemHasAdmin, setSystemHasAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, description?: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load projects & check health and authentication on initial mount
  useEffect(() => {
    async function initSystem() {
      setAuthLoading(true);
      try {
        const status = await authService.checkSystemStatus();
        setSystemHasAdmin(status.hasAdmin);
        const loggedUser = authService.getCurrentUser();
        setCurrentAdmin(loggedUser);
      } catch (e) {
        console.error('Failed to initialize auth system', e);
      } finally {
        setAuthLoading(false);
      }
      refreshData();
      checkApiHealth().then((status) => {
        setAiStatus(status);
      });
    }
    initSystem();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setCurrentAdmin(null);
    showToast('Sessão Bloqueada', 'Você saiu da Área Administrativa.', 'info');
  };

  const refreshData = () => {
    const storedProjects = storageService.getProjects();
    const storedVersions = storageService.getMasterPromptVersions();
    const activeM = storageService.getActiveMasterPrompt();
    const activeId = storageService.getActiveProjectId();

    setProjects(storedProjects);
    setMasterVersions(storedVersions);
    setActiveMaster(activeM);
    setActiveProjectId(activeId);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Handle Analyzing Questionnaire (Transition from Tela B to Tela C)
  const handleAnalyzeQuestionnaire = async (formData: {
    name: string;
    clientName: string;
    projectType: ProjectType;
    targetPlatform: TargetPlatform;
    hostingTarget: import('./types').HostingTarget;
    preferredFramework: string;
    questionnaire: string;
    additionalNotes: string;
  }) => {
    setIsAnalyzing(true);
    try {
      const { data: extracted, source } = await analyzeQuestionnaire(
        formData.questionnaire,
        formData.name,
        formData.clientName,
        formData.projectType,
        formData.additionalNotes
      );

      // Save initial project
      const newProjId = `project_${Date.now()}`;
      const newProj: Project = {
        id: newProjId,
        name: formData.name,
        clientName: formData.clientName,
        projectType: formData.projectType,
        targetPlatform: formData.targetPlatform,
        hostingTarget: formData.hostingTarget,
        preferredFramework: formData.preferredFramework,
        rawQuestionnaire: formData.questionnaire,
        extractedData: extracted,
        status: 'draft',
        additionalNotes: formData.additionalNotes,
        masterPromptVersionId: activeMaster.id,
        masterPromptVersionLabel: activeMaster.version,
        finalPrompt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storageService.saveProject(newProj);
      setAnalysisData({ data: extracted, source });
      setActiveProjectId(newProj.id);
      refreshData();
      setActiveTab('analysis');

      showToast(
        'Análise concluída com sucesso!',
        source === 'gemini'
          ? 'Extração avançada realizada com Gemini 3.8 Flash.'
          : 'Extração realizada pelo Motor Heurístico nativo sem inventar dados.',
        'success'
      );
    } catch (err: any) {
      showToast('Erro ao analisar questionário', err.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Generating Prompt (Transition from Tela C to Tela E)
  const handleGeneratePrompt = (confirmedData: ProjectExtractedData) => {
    if (!activeProject) return;
    setIsGenerating(true);

    try {
      const { finalPrompt, qualityReport } = composeFinalPrompt(
        activeMaster.content,
        activeProject.name,
        activeProject.projectType,
        activeProject.targetPlatform,
        confirmedData,
        activeMaster.version
      );

      const updated: Project = {
        ...activeProject,
        extractedData: confirmedData,
        finalPrompt,
        qualityReport,
        status: 'generated',
        updatedAt: new Date().toISOString(),
      };

      storageService.saveProject(updated);
      refreshData();
      setActiveTab('prompt_result');

      showToast(
        'Prompt Mestre Gerado!',
        `Qualidade ${qualityReport.score}/100 • Pronto para uso no Claude, ChatGPT ou Cursor.`,
        'success'
      );
    } catch (err: any) {
      showToast('Erro ao gerar prompt', err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save prompt text modifications from Tela E
  const handleSavePromptText = (updatedText: string) => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      finalPrompt: updatedText,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveProject(updated);
    refreshData();
    showToast('Prompt atualizado', 'As alterações manuais no prompt foram salvas.', 'success');
  };

  // Open Project
  const handleOpenProject = (proj: Project) => {
    setActiveProjectId(proj.id);
    storageService.setActiveProjectId(proj.id);
    if (proj.status === 'generated' && proj.finalPrompt) {
      setActiveTab('prompt_result');
    } else {
      setActiveTab('analysis');
    }
  };

  // Duplicate Project
  const handleDuplicateProject = (id: string) => {
    const duplicated = storageService.duplicateProject(id);
    if (duplicated) {
      refreshData();
      setActiveProjectId(duplicated.id);
      showToast('Projeto duplicado', `Cópia criada: "${duplicated.name}"`, 'success');
    }
  };

  // Delete Project
  const handleDeleteProject = (id: string) => {
    storageService.deleteProject(id);
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
    refreshData();
    showToast('Projeto excluído', 'O projeto foi removido com sucesso.', 'info');
  };

  // Load Test Scenario
  const handleLoadScenario = (sc: TestScenario) => {
    setNewProjectInitialValues({
      name: sc.name,
      clientName: sc.name,
      projectType: sc.projectType,
      targetPlatform: sc.targetPlatform,
      hostingTarget: sc.hostingTarget,
      preferredFramework: sc.preferredFramework,
      questionnaire: sc.questionnaire,
      additionalNotes: sc.notes,
    });
    setActiveTab('new_project');
    showToast('Cenário carregado!', `Dados de "${sc.name}" aplicados no formulário.`, 'info');
  };

  // Start fresh project
  const handleStartNewProject = () => {
    setActiveProjectId(null);
    storageService.setActiveProjectId(null);
    setNewProjectInitialValues(undefined);
    setAnalysisData(null);
    setActiveTab('new_project');
  };

  // Handle Project Imported from JSON
  const handleProjectImported = (importedProject: Project) => {
    refreshData();
    handleOpenProject(importedProject);
  };

  // Title description per tab
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Painel Geral', badge: 'Visão Geral & Acesso Rápido' };
      case 'sales_closer':
        return { title: 'Fechador de Vendas & Objeções', badge: 'SEO 100 • Design Encantador • Contra-Ataque' };
      case 'site_auditor':
        return { title: 'Auditor de Sites pelo Prompt Mestre', badge: 'Master Prompt 7.0 & Otimização' };
      case 'questionnaires':
        return { title: 'Super Questionários por Nicho', badge: '33 Nichos • 1.048 Perguntas' };
      case 'gbp_pro':
        return { title: 'Google Business Profile Pro', badge: 'Auditoria 1-Clique & Dossiê 100/100' };
      case 'projects':
        return { title: 'Meus Projetos de Sites', badge: `${projects.length} Cadastrados` };
      case 'master_prompt':
        return { title: 'Prompt Mestre', badge: `Versão Ativa: ${activeMaster.version}` };
      case 'admin':
        return { title: 'Área Administrativa', badge: 'Acesso Restrito & Gestão' };
      case 'new_project':
        return { title: 'Novo Projeto de Site', badge: 'Formulário & Briefing' };
      case 'analysis':
        return { title: 'Interpretação e Análise', badge: activeProject?.name || 'Projeto' };
      case 'prompt_result':
        return { title: 'Prompt Estratégico Gerado', badge: activeProject?.name || 'Finalizado' };
      default:
        return { title: 'Master Site Prompt Studio', badge: 'PRO' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans w-full max-w-full min-w-0 overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modern Lateral Menu (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        projectCount={projects.length}
        aiStatus={aiStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Body Area Offset by Sidebar */}
      <div
        className={`flex-1 flex flex-col min-h-screen w-full max-w-full min-w-0 overflow-x-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Header Navbar with Rock-Solid Mobile Responsiveness */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between w-full max-w-full min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            {/* Botão dos Três Tracinhos do Menu (Sempre visível e destacado no celular/tablet < md) */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 border-2 border-cyan-500/60 text-cyan-400 hover:text-white shadow-lg shadow-cyan-950/60 flex-shrink-0 cursor-pointer active:scale-95 transition-all"
              title="Abrir Menu Lateral (Três Tracinhos)"
              aria-label="Abrir Menu Lateral"
            >
              <Menu className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
            </button>

            {/* Seta de Voltar Visível em TODAS as guias que forem abertas */}
            {activeTab !== 'dashboard' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex-shrink-0 group"
                title="Voltar para a página anterior"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden xs:inline">Voltar</span>
              </button>
            )}

            <div className="min-w-0 truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {headerInfo.title}
                </h1>
                <span className="hidden lg:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 text-cyan-300 flex-shrink-0">
                  {headerInfo.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions - Responsive: clean on mobile, rich on desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Quick Home Button when outside Dashboard */}
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => navigateToTab('dashboard')}
                className="px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Ir para a Página Inicial (Painel Geral)"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Início</span>
              </button>
            )}

            {/* Vendas & Objeções (Atalho Rápido) */}
            <button
              onClick={() => navigateToTab('sales_closer')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'sales_closer'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-rose-300 hover:bg-slate-800'
              }`}
              title="Fechador de Vendas & Objeções"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] sm:text-xs">Vendas</span>
            </button>

            {/* Auditor de Sites (visível a partir de sm: 640px) */}
            <button
              onClick={() => navigateToTab('site_auditor')}
              className={`hidden sm:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition-colors ${
                activeTab === 'site_auditor'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-cyan-300 hover:bg-slate-800'
              }`}
              title="Auditor de Sites pelo Prompt Mestre"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auditor</span>
            </button>

            {/* Questionários 33 Nichos (visível a partir de md: 768px) */}
            <button
              onClick={() => navigateToTab('questionnaires')}
              className={`hidden md:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition-colors ${
                activeTab === 'questionnaires'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-indigo-300 hover:bg-slate-800'
              }`}
              title="Super Questionários (33 Nichos)"
            >
              <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />
              <span>Questionários (33)</span>
            </button>

            {/* GBP Pro (visível a partir de lg: 1024px) */}
            <button
              onClick={() => navigateToTab('gbp_pro')}
              className={`hidden lg:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition-colors ${
                activeTab === 'gbp_pro'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-emerald-300 hover:bg-slate-800'
              }`}
              title="Google Business Profile Pro"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>GBP Pro</span>
            </button>

            {/* Admin (visível a partir de xl: 1280px) */}
            <button
              onClick={() => navigateToTab('admin')}
              className={`hidden xl:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition-colors ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-amber-300 hover:bg-slate-800'
              }`}
              title="Área Administrativa"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin</span>
            </button>

            {/* Settings Trigger Icon */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              title="Configurações & API Key"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800/40 text-slate-400 hover:text-rose-300 transition-colors items-center gap-1"
              title={`Bloquear Sistema (${currentAdmin?.email || 'Administrador'})`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Application Views Routing */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-x-hidden min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              activeMaster={activeMaster}
              activeProject={activeProject}
              setActiveTab={(tab) => {
                if (tab === 'new_project') handleStartNewProject();
                else navigateToTab(tab as ExtendedActiveTab);
              }}
              onOpenProject={handleOpenProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onLoadScenario={handleLoadScenario}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onImportProject={handleProjectImported}
              onShowToast={showToast}
            />
          )}

          {/* DEDICATED SUPER QUESTIONNAIRES VIEW */}
          {activeTab === 'questionnaires' && (
            <DedicatedQuestionnairesHub
              onNotify={showToast}
              onBack={handleBack}
              onGenerateDossierFromQuestionnaire={(data) => {
                setPendingGbpQuestionnaire(data);
                navigateToTab('gbp_pro');
                showToast(
                  'Questionário Mapeado!',
                  `Gerando Perfil Google Meu Negócio Padrão Ouro para ${data.businessName || 'sua empresa'}...`,
                  'success'
                );
              }}
            />
          )}

          {/* GBP PRO HUB (AUDIT BY LINK + DOSSIER CREATION) */}
          {activeTab === 'gbp_pro' && (
            <GbpProHub
              onNotify={showToast}
              onBack={handleBack}
              initialQuestionnaire={pendingGbpQuestionnaire}
              onClearInitialQuestionnaire={() => setPendingGbpQuestionnaire(null)}
            />
          )}

          {/* SALES CLOSER VIEW (SCRIPTS, OBJECTIONS, SEO 100 & GMN PITCH) */}
          {activeTab === 'sales_closer' && (
            <SalesCloserView onNotify={showToast} onBack={handleBack} />
          )}

          {/* ADMIN AREA VIEW (LOGIN, FIRST TIME REGISTRATION, PASSWORD RECOVERY) */}
          {activeTab === 'admin' && (
            <AdminAreaView
              onNotify={showToast}
              onBack={handleBack}
              onNavigateToProjects={() => navigateToTab('projects')}
              onNavigateToGbp={() => navigateToTab('gbp_pro')}
            />
          )}

          {/* SITE AUDITOR VIEW (AUDIT WEBSITES BY URL GROUNDED IN MASTER PROMPT 2.1) */}
          {activeTab === 'site_auditor' && (
            <SiteAuditorView
              activeMaster={activeMaster}
              onNotify={showToast}
              onBack={handleBack}
              onCreateProjectFromAudit={(info) => {
                setNewProjectInitialValues({
                  name: info.name,
                  clientName: info.clientName,
                  projectType: info.projectType,
                  targetPlatform: info.targetPlatform,
                  hostingTarget: 'hostinger_static',
                  preferredFramework: 'Astro + Tailwind CSS (Padrão Prompt Mestre)',
                  questionnaire: info.suggestedBriefing,
                  additionalNotes: `Auditoria de site gerada a partir da URL ${info.url}. Score inicial diagnosticado: ${info.overallScore}/100. Melhorias sugeridas prontas para implementação.`,
                });
                navigateToTab('new_project');
                showToast(
                  'Projeto Criado a partir da Auditoria!',
                  `Formulário preenchido com as recomendações de ${info.name}.`,
                  'success'
                );
              }}
            />
          )}

          {activeTab === 'new_project' && (
            <NewProjectView
              onAnalyze={handleAnalyzeQuestionnaire}
              isAnalyzing={isAnalyzing}
              onBack={handleBack}
              initialValues={newProjectInitialValues}
            />
          )}

          {activeTab === 'analysis' && activeProject && (
            <AnalysisView
              projectName={activeProject.name}
              projectType={activeProject.projectType}
              targetPlatform={activeProject.targetPlatform}
              initialData={analysisData?.data || activeProject.extractedData}
              source={analysisData?.source || 'heuristic'}
              onBack={() => {
                setNewProjectInitialValues({
                  name: activeProject.name,
                  clientName: activeProject.clientName,
                  projectType: activeProject.projectType,
                  targetPlatform: activeProject.targetPlatform,
                  hostingTarget: activeProject.hostingTarget,
                  preferredFramework: activeProject.preferredFramework,
                  questionnaire: activeProject.rawQuestionnaire,
                  additionalNotes: activeProject.additionalNotes,
                });
                navigateToTab('new_project');
              }}
              onGenerate={handleGeneratePrompt}
              isGenerating={isGenerating}
            />
          )}

          {activeTab === 'prompt_result' && activeProject && (
            <PromptResultView
              project={activeProject}
              onSavePrompt={handleSavePromptText}
              onRegenerate={() => {
                handleGeneratePrompt(activeProject.extractedData);
              }}
              onDuplicate={() => handleDuplicateProject(activeProject.id)}
              onNewProject={handleStartNewProject}
              onBackToAnalysis={() => {
                setAnalysisData({ data: activeProject.extractedData, source: 'heuristic' });
                navigateToTab('analysis');
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsListView
              projects={projects}
              onOpenProject={handleOpenProject}
              onDuplicateProject={handleDuplicateProject}
              onDeleteProject={handleDeleteProject}
              onNewProject={handleStartNewProject}
              onProjectImported={handleProjectImported}
              onShowToast={showToast}
              onBack={handleBack}
            />
          )}

          {activeTab === 'master_prompt' && (
            <MasterPromptManager
              versions={masterVersions}
              activeVersion={activeMaster}
              onVersionChange={refreshData}
              onShowToast={showToast}
              onBack={handleBack}
            />
          )}
        </main>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          aiStatus={aiStatus}
          onRefreshData={refreshData}
          onShowToast={showToast}
        />

        {/* Footer */}
        <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
          <p>
            Master Site Prompt Studio & Google Business Profile Pro • Banco de Dados Local com IndexedDB • Padrão Ouro de Qualidade
          </p>
        </footer>

        {/* Botão Flutuante Móvel (Três Tracinhos) para acesso com o polegar em qualquer rolagem */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed bottom-5 right-5 z-40 w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-2xl shadow-cyan-500/50 border border-cyan-300/40 flex items-center justify-center active:scale-95 transition-all cursor-pointer hover:shadow-cyan-400/60"
          aria-label="Abrir Menu Lateral"
          title="Abrir Menu Lateral (Três Tracinhos)"
        >
          <Menu className="w-6 h-6 text-white stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
