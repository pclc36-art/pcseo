import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Search, 
  FolderKanban, 
  Database, 
  Building2, 
  CheckCircle2, 
  HardDrive, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';
import { GbpQuestionnaireForm } from './GbpQuestionnaireForm';
import { GbpDossierView } from './GbpDossierView';
import { GbpAuditView } from './GbpAuditView';
import { GbpDatabaseModal } from './GbpDatabaseModal';
import { GbpDossier, GbpAuditReport, GbpQuestionnaireData } from '../../types/gbpTypes';
import { gbpDatabase } from '../../services/gbpDatabase';
import { generateGbpDossier } from '../../services/gbpEngine';

interface GbpProHubProps {
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  initialQuestionnaire?: Partial<GbpQuestionnaireData> | null;
  onClearInitialQuestionnaire?: () => void;
  onBack?: () => void;
}

export const GbpProHub: React.FC<GbpProHubProps> = ({
  onNotify,
  initialQuestionnaire,
  onClearInitialQuestionnaire,
  onBack,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'audit' | 'history'>('create');
  const [currentDossier, setCurrentDossier] = useState<GbpDossier | null>(null);
  const [savedDossiers, setSavedDossiers] = useState<GbpDossier[]>([]);
  const [savedAudits, setSavedAudits] = useState<GbpAuditReport[]>([]);
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbStats, setDbStats] = useState({
    isIndexedDBActive: true,
    clientsCount: 0,
    dossiersCount: 0,
    auditsCount: 0,
    estimatedStorageKB: 0,
  });

  // Load data & subscribe to database changes
  const loadData = async () => {
    const dossiers = await gbpDatabase.getDossiers();
    const audits = await gbpDatabase.getAudits();
    const stats = await gbpDatabase.getDatabaseStats();

    setSavedDossiers(dossiers);
    setSavedAudits(audits);
    setDbStats(stats);

    // If no current dossier is selected but we have saved dossiers, pre-select the latest one
    if (!currentDossier && dossiers.length > 0) {
      setCurrentDossier(dossiers[0]);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = gbpDatabase.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Handle Generate Dossier from questionnaire
  const handleGenerateDossier = async (questionnaire: GbpQuestionnaireData) => {
    setIsGeneratingDossier(true);
    onNotify('Gerando Dossiê Estratégico', 'Construindo as 13 etapas em conformidade com as diretrizes do Google...', 'info');

    try {
      const { dossier, source } = await generateGbpDossier(questionnaire);
      // Save permanently to IndexedDB
      await gbpDatabase.saveDossier(dossier);
      setCurrentDossier(dossier);
      setActiveSubTab('create');
      onNotify(
        'Dossiê Concluído com Sucesso!',
        `Todas as 13 etapas prontas com 4+ palavras-chave em alta no Google e salvos no banco.`,
        'success'
      );
    } catch (err: any) {
      onNotify('Erro ao Gerar Dossiê', err.message, 'error');
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  // Auto-generate if initialQuestionnaire was provided from questionnaires hub
  useEffect(() => {
    if (initialQuestionnaire && (initialQuestionnaire.businessName || initialQuestionnaire.primaryNiche)) {
      handleGenerateDossier(initialQuestionnaire as GbpQuestionnaireData);
      if (onClearInitialQuestionnaire) {
        onClearInitialQuestionnaire();
      }
    }
  }, [initialQuestionnaire]);

  const [dossierIdToDelete, setDossierIdToDelete] = useState<string | null>(null);

  const handleDeleteDossier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDossierIdToDelete(id);
  };

  // Save current active dossier explicitly
  const handleSaveCurrentDossier = async () => {
    if (!currentDossier) return;
    try {
      await gbpDatabase.saveDossier(currentDossier);
      await loadData();
      onNotify('Dossiê Salvo', `Perfil de ${currentDossier.businessName} salvo permanentemente no banco.`, 'success');
    } catch (err: any) {
      onNotify('Erro ao Salvar', err.message, 'error');
    }
  };

  // Delete current active dossier directly from view
  const handleDeleteCurrentDossier = () => {
    if (!currentDossier) return;
    setDossierIdToDelete(currentDossier.id);
  };

  const confirmDeleteDossier = async () => {
    if (!dossierIdToDelete) return;
    try {
      await gbpDatabase.deleteDossier(dossierIdToDelete);
      if (currentDossier?.id === dossierIdToDelete) {
        setCurrentDossier(null);
      }
      setDossierIdToDelete(null);
      await loadData();
      onNotify('Dossiê Excluído', 'Perfil removido do banco de dados.', 'info');
    } catch (err: any) {
      onNotify('Erro ao Apagar', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Top Bar with Module Branding & Database Indicator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-100" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
                Google Business Profile Pro
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 shrink-0">
                PRO MODULE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium break-words">
              Criação, auditoria, SEO local e otimização profissional do Perfil da Empresa no Google
            </p>
          </div>
        </div>

        {/* Database Status Button */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsDbModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 text-xs text-slate-300 transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
            <span className="font-semibold text-slate-200">Banco de Dados:</span>
            <span className="text-cyan-400 font-mono">
              {dbStats.dossiersCount} perfis | {dbStats.auditsCount} auditorias
            </span>
            <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors ml-1 shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Sub-Navigation (Tabs) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none w-full max-w-full">
        <button
          onClick={() => setActiveSubTab('create')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
            activeSubTab === 'create'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criador de Perfil (33 Nichos)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
            activeSubTab === 'audit'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Auditor de Link (100/100)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
            activeSubTab === 'history'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Dossiês Salvos ({savedDossiers.length})</span>
        </button>
      </div>

      {/* TAB 1: CRIADOR DE PERFIL DO ZERO */}
      {activeSubTab === 'create' && (
        <div className="space-y-6 w-full min-w-0">
          {currentDossier ? (
            <div className="space-y-4 w-full min-w-0">
              {/* Profile Management Header Bar: Criar Novo, Salvar, Apagar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-3.5 sm:p-4 rounded-2xl border border-slate-800 w-full min-w-0 shadow-lg">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Perfil em Visualização</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                    {currentDossier.businessName}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                  {/* CRIAR NOVO */}
                  <button
                    type="button"
                    onClick={() => setCurrentDossier(null)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
                    title="Iniciar criação de um novo perfil do zero ou colar outro questionário"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>+ Criar Novo Perfil</span>
                  </button>

                  {/* SALVAR */}
                  <button
                    type="button"
                    onClick={handleSaveCurrentDossier}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
                    title="Garantir salvamento no banco de dados local"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span>Salvar no Banco</span>
                  </button>

                  {/* APAGAR */}
                  <button
                    type="button"
                    onClick={handleDeleteCurrentDossier}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer flex-1 sm:flex-initial"
                    title="Excluir permanentemente este perfil do banco de dados"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span>Apagar Perfil Atual</span>
                  </button>
                </div>
              </div>

              <GbpDossierView
                dossier={currentDossier}
                onNotify={onNotify}
                onBackToForm={() => setCurrentDossier(null)}
                onCreateNew={() => setCurrentDossier(null)}
                onDeleteCurrent={() => {
                  setCurrentDossier(null);
                  loadData();
                }}
              />
            </div>
          ) : (
            <div className="space-y-4 w-full min-w-0">
              {savedDossiers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-300">
                    Você tem <strong>{savedDossiers.length} perfis salvos</strong> no banco de dados.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentDossier(savedDossiers[0])}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold cursor-pointer"
                    >
                      Abrir Último ({savedDossiers[0].businessName})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('history')}
                      className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>
              )}
              <GbpQuestionnaireForm
                onGenerateDossier={handleGenerateDossier}
                isGenerating={isGeneratingDossier}
                onNotify={onNotify}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDITOR INTELIGENTE */}
      {activeSubTab === 'audit' && (
        <GbpAuditView
          onNotify={onNotify}
          savedAudits={savedAudits}
          onAuditSelected={(a) => {}}
        />
      )}

      {/* TAB 3: HISTÓRICO & DOSSIÊS SALVOS */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" />
              Dossiês e Perfis Estruturados no Banco de Dados
            </h3>
            <button
              onClick={() => setIsDbModalOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Fazer Backup JSON</span>
            </button>
          </div>

          {savedDossiers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDossiers.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setCurrentDossier(d);
                    setActiveSubTab('create');
                  }}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      {d.categories.primaryCategory || 'Perfil'}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDossier(d.id, e)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-100 text-sm group-hover:text-cyan-400 transition-colors">
                      {d.businessName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {d.questionnaire.city} - {d.questionnaire.state || 'BR'}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-900 pt-2">
                    <span>Atualizado em: {new Date(d.updatedAt).toLocaleDateString('pt-BR')}</span>
                    <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Abrir <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Nenhum dossiê gerado ainda.</p>
              <button
                onClick={() => setActiveSubTab('create')}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                Criar Primeiro Perfil
              </button>
            </div>
          )}
        </div>
      )}

      {/* Database Modal */}
      <GbpDatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onDataChanged={loadData}
      />

      {/* MODAL: DELETE DOSSIER CONFIRMATION */}
      {dossierIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Excluir Dossiê?</h3>
            <p className="text-xs text-slate-300 text-center">
              Tem certeza de que deseja apagar permanentemente este dossiê do perfil do Google Meu Negócio?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDossierIdToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteDossier}
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
