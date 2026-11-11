import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Globe,
  Building2,
  Gauge,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  FilePlus2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Project } from '../../types';
import { GbpDossier } from '../../types/gbpTypes';
import { SiteAuditReport } from '../../types/siteAuditTypes';
import { storageService } from '../../services/storageService';
import { gbpDatabase } from '../../services/gbpDatabase';
import { ExtendedActiveTab } from '../Sidebar';

interface ConsolidatedMetricsDashboardProps {
  projects: Project[];
  onNavigateTab: (tab: ExtendedActiveTab) => void;
  onOpenProject?: (project: Project) => void;
}

export const ConsolidatedMetricsDashboard: React.FC<ConsolidatedMetricsDashboardProps> = ({
  projects,
  onNavigateTab,
  onOpenProject,
}) => {
  // PageSpeed metrics from saved audits
  const [pageSpeedMetrics, setPageSpeedMetrics] = useState(() => storageService.getPageSpeedMetrics());
  const [savedAudits, setSavedAudits] = useState<SiteAuditReport[]>(() => storageService.getSavedSiteAudits());

  // GBP dossiers from local database
  const [dossiers, setDossiers] = useState<GbpDossier[]>([]);
  const [isLoadingGbp, setIsLoadingGbp] = useState(true);

  // Load dossiers & subscribe to updates
  useEffect(() => {
    let isMounted = true;

    async function loadDossiersData() {
      try {
        setIsLoadingGbp(true);
        const list = await gbpDatabase.getDossiers();
        if (isMounted) {
          setDossiers(list);
        }
      } catch (err) {
        console.error('Erro ao carregar dossiês no dashboard:', err);
      } finally {
        if (isMounted) setIsLoadingGbp(false);
      }
    }

    loadDossiersData();

    // Subscribe to gbp database changes
    const unsubscribe = gbpDatabase.subscribe(() => {
      loadDossiersData();
    });

    // Also listen to storage events to refresh site audits
    const handleStorageChange = () => {
      setPageSpeedMetrics(storageService.getPageSpeedMetrics());
      setSavedAudits(storageService.getSavedSiteAudits());
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Refresh manually
  const handleRefresh = async () => {
    setPageSpeedMetrics(storageService.getPageSpeedMetrics());
    setSavedAudits(storageService.getSavedSiteAudits());
    const list = await gbpDatabase.getDossiers();
    setDossiers(list);
  };

  // 1. Projects Statistics
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'completed' || p.status === 'generated').length;
  const analyzedProjects = projects.filter((p) => p.status === 'analyzed').length;
  const draftProjects = projects.filter((p) => p.status === 'draft').length;

  // Project types breakdown
  const projectTypeCounts: Record<string, number> = {};
  projects.forEach((p) => {
    const type = p.projectType || 'Outro';
    projectTypeCounts[type] = (projectTypeCounts[type] || 0) + 1;
  });

  // 2. GBP Dossiers Statistics
  const totalDossiers = dossiers.length;
  const verifiedDossiers = dossiers.filter((d) => d.status === 'verified').length;
  const completedDossiers = dossiers.filter((d) => d.status === 'completed').length;
  const draftDossiers = dossiers.filter((d) => d.status === 'draft' || !d.status).length;
  const gbpCompletionRate = totalDossiers > 0
    ? Math.round(((verifiedDossiers + completedDossiers) / totalDossiers) * 100)
    : 0;

  // 3. PageSpeed Score calculation & status
  const hasAudits = pageSpeedMetrics.totalAudits > 0;
  const avgScore = pageSpeedMetrics.averageScoreDecimal;
  const isAvgOptimal = pageSpeedMetrics.isAverageAbove95;

  return (
    <div className="space-y-6">
      {/* Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Dashboard de Métricas Consolidado</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  Visão Geral
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoramento integrado de projetos criados, média de velocidade PageSpeed e status dos dossiês Google Maps.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Atualizar métricas em tempo real"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Top 3 Core Consolidated Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ================= PILLAR 1: TOTAL DE PROJETOS ================= */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <span>Total de Projetos</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Astro + Tailwind
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {totalProjects}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {totalProjects === 1 ? 'projeto ativo' : 'projetos ativos'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>

            {/* Status Breakdown Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Distribuição de Status:</span>
                <span className="text-emerald-400 font-semibold">
                  {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% Prontos
                </span>
              </div>

              {/* Multi-segment progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${completedProjects} Concluídos`}
                />
                <div
                  style={{ width: `${totalProjects > 0 ? (analyzedProjects / totalProjects) * 100 : 0}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`${analyzedProjects} Em Análise`}
                />
                <div
                  style={{ width: `${totalProjects > 0 ? (draftProjects / totalProjects) * 100 : 0}%` }}
                  className="bg-slate-600 h-full transition-all duration-500"
                  title={`${draftProjects} Rascunhos`}
                />
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/40 py-1.5 px-1">
                  <span className="text-emerald-400 font-bold text-xs block">{completedProjects}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Prontos</span>
                </div>
                <div className="rounded-lg bg-amber-950/30 border border-amber-900/40 py-1.5 px-1">
                  <span className="text-amber-400 font-bold text-xs block">{analyzedProjects}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Em Análise</span>
                </div>
                <div className="rounded-lg bg-slate-800/50 border border-slate-700/40 py-1.5 px-1">
                  <span className="text-slate-300 font-bold text-xs block">{draftProjects}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Rascunhos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Gerenciar Projetos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('new_project')}
              className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Novo</span>
            </button>
          </div>
        </div>

        {/* ================= PILLAR 2: MÉDIA PONTUAÇÃO PAGESPEED ================= */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-lg flex flex-col justify-between transition-all ${
          !hasAudits
            ? 'border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950'
            : isAvgOptimal
            ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950'
            : 'border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gauge className={`w-4 h-4 ${!hasAudits ? 'text-slate-400' : isAvgOptimal ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>Média PageSpeed Insights</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Meta: &ge; 9.5
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                {hasAudits ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-extrabold tracking-tight ${isAvgOptimal ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {avgScore.toFixed(1)}
                    </span>
                    <span className="text-slate-400 text-sm font-semibold">/ 10</span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({pageSpeedMetrics.averageScore100}/100)
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-extrabold text-slate-500 tracking-tight">
                      — / 10
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Nenhum site auditado ainda
                    </span>
                  </div>
                )}
              </div>

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                !hasAudits
                  ? 'bg-slate-800 text-slate-400'
                  : isAvgOptimal
                  ? 'bg-emerald-950/70 border border-emerald-800/50 text-emerald-400'
                  : 'bg-amber-950/70 border border-amber-800/50 text-amber-400'
              }`}>
                <Gauge className="w-5 h-5" />
              </div>
            </div>

            {/* Performance Status Badge & Details */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              {hasAudits ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                      isAvgOptimal ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {isAvgOptimal ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Padrão Ouro (&ge; 9.5 Atingido)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Abaixo da Meta (&lt; 9.5)</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">
                      {pageSpeedMetrics.above95Count} de {pageSpeedMetrics.totalAudits} aprovados
                    </span>
                  </div>

                  {/* Core Web Vitals Micro Indicators */}
                  <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/40 py-1.5 px-1">
                      <span className="text-slate-200 font-bold text-xs block">
                        {pageSpeedMetrics.averageLcpSec !== null ? `${pageSpeedMetrics.averageLcpSec}s` : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block leading-tight">LCP Médio</span>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/40 py-1.5 px-1">
                      <span className="text-slate-200 font-bold text-xs block">
                        {pageSpeedMetrics.averageCls !== null ? pageSpeedMetrics.averageCls : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block leading-tight">CLS Médio</span>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/40 py-1.5 px-1">
                      <span className="text-slate-200 font-bold text-xs block">
                        {pageSpeedMetrics.averageTtfbMs !== null ? `${pageSpeedMetrics.averageTtfbMs}ms` : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 block leading-tight">TTFB Médio</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">
                  <p>Audite sites para monitorar LCP, CLS e pontuação PageSpeed &gt; 9.5.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('site_auditor')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{hasAudits ? 'Auditor de Sites' : 'Auditar Primeiro Site'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('media_optimizer' as any)}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Otimizar imagens e vídeos para PageSpeed 100"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Otimizar Mídia</span>
            </button>
          </div>
        </div>

        {/* ================= PILLAR 3: STATUS DOS DOSSIÊS GBP ================= */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <span>Status dos Dossiês GBP</span>
              </span>
              <span className="text-[11px] font-semibold text-indigo-300">
                13 Etapas Maps
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {totalDossiers}
                </span>
                <span className="text-xs text-slate-400 ml-2">
                  {totalDossiers === 1 ? 'perfil cadastrado' : 'perfis cadastrados'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            {/* Status Breakdown Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Taxa de Conclusão:</span>
                <span className="text-indigo-400 font-semibold">{gbpCompletionRate}% Concluídos</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${totalDossiers > 0 ? (verifiedDossiers / totalDossiers) * 100 : 0}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`${verifiedDossiers} Verificados`}
                />
                <div
                  style={{ width: `${totalDossiers > 0 ? (completedDossiers / totalDossiers) * 100 : 0}%` }}
                  className="bg-indigo-500 h-full transition-all duration-500"
                  title={`${completedDossiers} Concluídos`}
                />
                <div
                  style={{ width: `${totalDossiers > 0 ? (draftDossiers / totalDossiers) * 100 : 0}%` }}
                  className="bg-slate-600 h-full transition-all duration-500"
                  title={`${draftDossiers} Rascunhos`}
                />
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-center">
                <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/40 py-1.5 px-1">
                  <span className="text-emerald-400 font-bold text-xs block">{verifiedDossiers}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Verificados</span>
                </div>
                <div className="rounded-lg bg-indigo-950/30 border border-indigo-900/40 py-1.5 px-1">
                  <span className="text-indigo-400 font-bold text-xs block">{completedDossiers}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">13 Etapas</span>
                </div>
                <div className="rounded-lg bg-slate-800/50 border border-slate-700/40 py-1.5 px-1">
                  <span className="text-slate-300 font-bold text-xs block">{draftDossiers}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">Rascunhos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('gbp_pro')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Acessar GBP Pro</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('questionnaires')}
              className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>33 Questionários</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Operations Row: Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Últimos Sites Auditados & Score PageSpeed */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Últimos Sites Auditados</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {savedAudits.length}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('site_auditor')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {savedAudits.length === 0 ? (
            <div className="py-6 text-center space-y-2 border border-dashed border-slate-800/80 rounded-xl">
              <Gauge className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Nenhum site auditado ainda no estúdio.</p>
              <button
                onClick={() => onNavigateTab('site_auditor')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-medium transition-all cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Auditar Site por Link Agora</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {savedAudits.slice(0, 4).map((audit) => {
                const decScore = audit.pageSpeedData?.scoreDecimal ?? Number((audit.overallScore / 10).toFixed(1));
                const isApproved = decScore >= 9.5;
                return (
                  <div
                    key={audit.id}
                    onClick={() => onNavigateTab('site_auditor')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs group-hover:text-cyan-300 transition-colors">
                          {audit.domain}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(audit.analyzedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {audit.primaryNicheDetected || 'Serviços Especializados'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className={`text-xs font-bold ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {decScore.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-500">/ 10</span>
                        </div>
                        <span className={`text-[10px] block ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isApproved ? '≥ 9.5 Aprovado' : '< 9.5 Alerta'}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Últimos Dossiês GBP Criados */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3.5 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Últimos Dossiês GBP Criados</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {totalDossiers}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('gbp_pro')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {isLoadingGbp ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Carregando perfis do banco de dados...
            </div>
          ) : dossiers.length === 0 ? (
            <div className="py-6 text-center space-y-2 border border-dashed border-slate-800/80 rounded-xl">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Nenhum dossiê de GBP criado ainda.</p>
              <button
                onClick={() => onNavigateTab('gbp_pro')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-medium transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Criar Dossiê GBP 13 Etapas</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {dossiers.slice(0, 4).map((dossier) => {
                const isVerified = dossier.status === 'verified';
                const isCompleted = dossier.status === 'completed';
                return (
                  <div
                    key={dossier.id}
                    onClick={() => onNavigateTab('gbp_pro')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs group-hover:text-indigo-300 transition-colors">
                          {dossier.businessName || 'Empresa sem nome'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(dossier.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {dossier.questionnaire?.primaryNiche || dossier.categories?.primaryCategory || 'Nicho Geral'} • {dossier.questionnaire?.city || 'Local'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] font-semibold ${
                        isVerified
                          ? 'text-emerald-400'
                          : isCompleted
                          ? 'text-indigo-400'
                          : 'text-slate-400'
                      }`}>
                        {isVerified
                          ? 'Verificado'
                          : isCompleted
                          ? '13 Etapas Prontas'
                          : 'Rascunho'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
