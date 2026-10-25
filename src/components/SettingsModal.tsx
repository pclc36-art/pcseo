import React, { useState } from 'react';
import {
  SlidersHorizontal,
  X,
  HardDrive,
  Download,
  Upload,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Info,
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiStatus: { hasKey: boolean; activeModel: string; engine: string };
  onRefreshData: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiStatus,
  onRefreshData,
  onShowToast,
}) => {
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const stats = storageService.getStorageStats();

  // Handle Export Backup JSON
  const handleExportBackup = () => {
    const jsonStr = storageService.exportFullBackup();
    const filename = `master_site_prompt_studio_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Backup exportado!', `Arquivo ${filename} salvo.`, 'success');
  };

  // Handle Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = storageService.importFullBackup(content);
        if (result.success) {
          onRefreshData();
          onShowToast(
            'Backup restaurado com sucesso!',
            `${result.projectsImported} projeto(s) e ${result.versionsImported} versão(ões) do prompt mestre importados.`,
            'success'
          );
        } else {
          onShowToast('Falha na importação', result.error || 'Arquivo inválido', 'error');
        }
      }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Configurações & Persistência</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Storage Details */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Armazenamento Local Persistente</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Seus projetos e versões do Master Prompt 2.0 ficam salvos com segurança no armazenamento local
              deste navegador. Para transferir dados entre computadores ou navegadores diferentes, utilize o
              recurso de backup em JSON abaixo:
            </p>

            <div className="grid grid-cols-3 gap-2.5 pt-1 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Projetos</span>
                <span className="text-base font-bold text-cyan-400">{stats.projectCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Versões Mestre</span>
                <span className="text-base font-bold text-cyan-400">{stats.versionCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="block text-slate-400 text-[10px]">Tamanho Estimado</span>
                <span className="text-base font-bold text-emerald-400">{stats.formattedSize}</span>
              </div>
            </div>
          </div>

          {/* Backup & Restore Tools */}
          <div className="space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Cópia de Segurança (Backup & Restauração)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{importing ? 'Importando...' : 'Restaurar Backup (JSON)'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  disabled={importing}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* AI Engine Status */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Status do Motor de Inteligência Artificial</span>
            </h3>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Modelo configurado:</span>
              <span className="font-mono text-cyan-300 font-semibold">{aiStatus.activeModel}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Serviço de Extração:</span>
              <span className="font-medium text-slate-200">{aiStatus.engine}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Chave GEMINI_API_KEY:</span>
              <span className={aiStatus.hasKey ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {aiStatus.hasKey ? 'Configurada no Servidor' : 'Não detectada (usando Motor Heurístico)'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              * O sistema possui arquitetura dual inteligente: se a chave Gemini estiver configurada no servidor,
              ele utiliza IA avançada; se não estiver, o motor heurístico nativo processa briefings instantaneamente
              sem falhas ou bloqueios.
            </p>
          </div>

          {/* Cloud Sync & Firebase Status */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Sincronização em Nuvem & Firebase</span>
            </h3>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-slate-400">Modo de Persistência Atual:</span>
              <span className="text-emerald-400 font-semibold font-mono">Nativo / LocalStorage + Backups JSON</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Firebase Firestore:</span>
              <span className="text-slate-300 font-medium">Desconectado (Configuração Recusada pelo Usuário)</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1 leading-relaxed">
              O estúdio opera de maneira autônoma com salvamento instantâneo no navegador e exportação/importação manual em JSON estruturado, sem dependência de serviços externos.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
