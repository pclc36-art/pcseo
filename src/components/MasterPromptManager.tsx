import React, { useState } from 'react';
import {
  Layers,
  Save,
  RotateCcw,
  History,
  FileCheck2,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Check,
  Copy,
  Download,
  Upload,
  PlusCircle,
  Trash2,
  ShieldCheck,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { MasterPromptVersion } from '../types';
import { storageService } from '../services/storageService';
import { copyToClipboard } from '../utils/clipboard';

interface MasterPromptManagerProps {
  versions: MasterPromptVersion[];
  activeVersion: MasterPromptVersion;
  onVersionChange: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onBack?: () => void;
}

export const MasterPromptManager: React.FC<MasterPromptManagerProps> = ({
  versions,
  activeVersion,
  onVersionChange,
  onShowToast,
  onBack,
}) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(activeVersion.id);
  const [content, setContent] = useState<string>(activeVersion.content);
  const [title, setTitle] = useState<string>(activeVersion.title);
  const [description, setDescription] = useState<string>(activeVersion.description);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [showNewVersionModal, setShowNewVersionModal] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState(`v2.${versions.length}`);
  const [newVersionTitle, setNewVersionTitle] = useState('Revisão personalizada do Master Prompt 2.0');
  const [newVersionDesc, setNewVersionDesc] = useState('Ajustes específicos de diretrizes');
  const [searchTerm, setSearchTerm] = useState('');

  const currentDisplayVersion = versions.find((v) => v.id === selectedVersionId) || activeVersion;

  // Change selected version
  const handleSelectVersion = (id: string) => {
    const target = versions.find((v) => v.id === id);
    if (target) {
      setSelectedVersionId(id);
      setContent(target.content);
      setTitle(target.title);
      setDescription(target.description);
      setIsEditingMetadata(false);
    }
  };

  // Set as Active Version for the studio
  const handleSetActive = (id: string) => {
    storageService.setActiveMasterPrompt(id);
    onVersionChange();
    onShowToast('Prompt Mestre Ativado!', `A versão ${currentDisplayVersion.version} agora é a padrão para novos projetos.`, 'success');
  };

  // Save changes to current version
  const handleSaveCurrent = () => {
    storageService.updateMasterPromptVersion(selectedVersionId, {
      title,
      description,
      content,
    });
    onVersionChange();
    onShowToast('Alterações salvas!', `A versão ${currentDisplayVersion.version} foi atualizada no storage persistente.`, 'success');
  };

  // Create New Version
  const handleCreateNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const created = storageService.saveMasterPromptVersion({
      version: newVersionLabel.trim() || `v2.${versions.length}`,
      title: newVersionTitle.trim() || 'Nova versão',
      description: newVersionDesc.trim() || 'Sem descrição',
      content,
    });
    setShowNewVersionModal(false);
    setSelectedVersionId(created.id);
    onVersionChange();
    onShowToast('Nova Versão Criada!', `Versão ${created.version} registrada e salva com sucesso.`, 'success');
  };

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPromptContent = async () => {
    const ok = await copyToClipboard(content);
    if (ok) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      onShowToast('Prompt Mestre Copiado!', 'Texto integral copiado para a área de transferência.', 'success');
    } else {
      onShowToast('Erro ao Copiar', 'Não foi possível copiar o texto.', 'error');
    }
  };

  // Restore Default Master Prompt 7.0
  const confirmResetToOfficialDefault = () => {
    const restored = storageService.resetToDefaultMasterPrompt();
    setSelectedVersionId(restored.id);
    setContent(restored.content);
    setTitle(restored.title);
    setDescription(restored.description);
    setIsRestoreModalOpen(false);
    onVersionChange();
    onShowToast('Padrão 7.0 Restaurado!', 'O Master Site Prompt 7.0 oficial (56 Diretrizes) foi restaurado.', 'info');
  };

  // Export Version as TXT
  const handleExportTxt = () => {
    const filename = `master_prompt_${currentDisplayVersion.version.replace('.', '_')}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Download concluído', `Arquivo ${filename} baixado.`, 'info');
  };

  // Search inside prompt content
  const matchesSearch = searchTerm ? content.toLowerCase().includes(searchTerm.toLowerCase()) : false;

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
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Gerenciamento do Prompt Mestre 7.0 (World-Class Engine)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            56 Diretrizes Inegociáveis de Direção de Arte, Astro-First, Motion 60fps, SEO/GEO e CRO de Alta Conversão.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRestoreModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="Restaurar o texto oficial do Master Prompt 7.0 (56 Diretrizes)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restaurar Padrão 7.0</span>
          </button>

          <button
            onClick={() => setShowNewVersionModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Nova Versão</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor & Right Version History */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Area (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Version Control Header */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {currentDisplayVersion.version}
                </span>
                <h3 className="text-sm font-bold text-white">{currentDisplayVersion.title}</h3>
                {activeVersion.id === currentDisplayVersion.id && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    Versão Ativa no Studio
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Última atualização: {new Date(currentDisplayVersion.updatedAt).toLocaleString('pt-BR')} • {content.length.toLocaleString()} caracteres
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeVersion.id !== currentDisplayVersion.id && (
                <button
                  onClick={() => handleSetActive(currentDisplayVersion.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  Tornar Ativa
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyPromptContent}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                title="Copiar texto completo do Prompt Mestre"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt ? 'Copiado!' : 'Copiar'}</span>
              </button>
              <button
                onClick={handleExportTxt}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Baixar como TXT"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveCurrent}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Versão</span>
              </button>
            </div>
          </div>

          {/* Search bar inside prompt */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar termos no Master Prompt (ex: SEO, WhatsApp, WCAG, Maps, 100 pontos)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {searchTerm && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-cyan-400">
                {matchesSearch ? 'Termo localizado' : 'Não encontrado'}
              </span>
            )}
          </div>

          {/* Textarea for full prompt editing */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <textarea
              rows={26}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-5 bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y selection:bg-cyan-900"
            />
          </div>
        </div>

        {/* Right Sidebar: Version History (1 col) */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Histórico de Versões</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug">
              Todas as versões salvas no armazenamento permanente. Você pode restaurar qualquer uma a qualquer momento.
            </p>

            <div className="space-y-2 pt-1">
              {versions.map((v) => {
                const isSelected = v.id === selectedVersionId;
                const isActive = v.id === activeVersion.id;

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVersion(v.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500/60 bg-cyan-950/30'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-slate-200">{v.version}</span>
                      {isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          ATIVA
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-200 text-xs truncate">{v.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{v.description}</p>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {new Date(v.updatedAt).toLocaleDateString('pt-BR')} • {v.characterCount.toLocaleString()} chars
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create New Version */}
      {showNewVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateNewVersion}
            className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Criar Nova Versão do Master Prompt</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O conteúdo atual do editor será salvo como uma nova versão no histórico persistente, preservando a versão anterior.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Identificador de Versão</label>
                <input
                  type="text"
                  required
                  value={newVersionLabel}
                  onChange={(e) => setNewVersionLabel(e.target.value)}
                  placeholder="Ex: v2.1, v2.2-custom"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Título da Versão</label>
                <input
                  type="text"
                  required
                  value={newVersionTitle}
                  onChange={(e) => setNewVersionTitle(e.target.value)}
                  placeholder="Ex: Padrão Clínica & Saúde Especializada"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Notas de Versão / Descrição</label>
                <textarea
                  rows={2}
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  placeholder="O que mudou nesta revisão..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewVersionModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
              >
                Salvar Versão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: RESTORE DEFAULT CONFIRMATION */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Restaurar Padrão 7.0?</h3>
            <p className="text-xs text-slate-300 text-center leading-relaxed">
              Deseja restaurar a versão oficial completa do <strong>MASTER SITE PROMPT 7.0</strong> (56 Diretrizes Inegociáveis)?
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRestoreModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmResetToOfficialDefault}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
