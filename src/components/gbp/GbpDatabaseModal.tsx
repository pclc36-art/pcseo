import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, CheckCircle2, AlertTriangle, RefreshCw, X, Shield, HardDrive } from 'lucide-react';
import { gbpDatabase } from '../../services/gbpDatabase';

interface GbpDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export const GbpDatabaseModal: React.FC<GbpDatabaseModalProps> = ({ isOpen, onClose, onDataChanged }) => {
  const [stats, setStats] = useState({
    isIndexedDBActive: true,
    clientsCount: 0,
    dossiersCount: 0,
    auditsCount: 0,
    estimatedStorageKB: 0,
  });
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' | 'idle' }>({
    message: '',
    type: 'idle',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    const s = await gbpDatabase.getDatabaseStats();
    setStats(s);
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const dump = await gbpDatabase.exportFullDatabase();
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_gbp_studio_db_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setImportStatus({ message: 'Backup do banco de dados exportado com sucesso!', type: 'success' });
    } catch (err: any) {
      setImportStatus({ message: `Erro ao exportar: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImportStatus({ message: 'Processando arquivo de backup...', type: 'idle' });

    try {
      const text = await file.text();
      const dump = JSON.parse(text);
      const res = await gbpDatabase.importFullDatabase(dump);
      await loadStats();
      onDataChanged();
      setImportStatus({
        message: `Importação concluída: ${res.clients} clientes, ${res.dossiers} dossiês e ${res.audits} auditorias restaurados.`,
        type: 'success',
      });
    } catch (err: any) {
      setImportStatus({ message: `Falha na restauração: ${err.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Banco de Dados Persistente
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  IndexedDB Ativo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Armazenamento relacional estruturado no navegador com contingência offline e exportação JSON.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Storage Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block font-medium">Clientes</span>
              <span className="text-2xl font-bold text-slate-100 mt-1 block">{stats.clientsCount}</span>
              <span className="text-[10px] text-slate-500">Cadastrados</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block font-medium">Dossiês GBP</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1 block">{stats.dossiersCount}</span>
              <span className="text-[10px] text-slate-500">Perfis completos</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block font-medium">Auditorias</span>
              <span className="text-2xl font-bold text-indigo-400 mt-1 block">{stats.auditsCount}</span>
              <span className="text-[10px] text-slate-500">Relatórios 0-100</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs text-slate-400 block font-medium">Uso Estimado</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">{stats.estimatedStorageKB} KB</span>
              <span className="text-[10px] text-slate-500">IndexedDB local</span>
            </div>
          </div>

          {/* Database Capabilities Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              Por que esta é a arquitetura de banco de dados ideal?
            </div>
            <p className="text-slate-400 leading-relaxed">
              O sistema utiliza <strong>IndexedDB transacional nativo</strong>, permitindo armazenar centenas de dossiês detalhados, fotos comprimidas e relatórios de auditoria sem travar o navegador ou depender de login externo no iframe. Você tem soberania total dos dados através de backups estruturados em JSON.
            </p>
          </div>

          {/* Backup & Restore Operations */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              Operações de Backup e Restauração
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Button */}
              <button
                onClick={handleExportJSON}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Backup Completo (JSON)</span>
              </button>

              {/* Import Button */}
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Restaurar de Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {/* Status Alert */}
          {importStatus.message && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : importStatus.type === 'error'
                  ? 'bg-red-950/40 border-red-800/60 text-red-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : importStatus.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
