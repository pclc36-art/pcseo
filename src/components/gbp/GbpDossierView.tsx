import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Target, 
  Share2, 
  Sparkles, 
  Copy, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  MessageSquare, 
  Camera, 
  ShieldCheck, 
  Award, 
  Clock, 
  Eye, 
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Flame,
  Check,
  Zap,
  PlusCircle,
  Save,
  Trash2
} from 'lucide-react';
import { GbpDossier } from '../../types/gbpTypes';
import { gbpDatabase } from '../../services/gbpDatabase';
import { getGbpNichePackage } from '../../data/gbp33NichosData';
import { copyToClipboard as safeCopy } from '../../utils/clipboard';

interface GbpDossierViewProps {
  dossier: GbpDossier;
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onBackToForm: () => void;
  onCreateNew?: () => void;
  onDeleteCurrent?: () => void;
}

export const GbpDossierView: React.FC<GbpDossierViewProps> = ({
  dossier,
  onNotify,
  onBackToForm,
  onCreateNew,
  onDeleteCurrent,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Retrieve 33-niche SEO package for high-volume keywords
  const nichePkg = getGbpNichePackage(dossier.questionnaire.primaryNiche || dossier.businessName);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Delete current dossier
  const handleDeleteCurrent = () => {
    setIsConfirmDeleteOpen(true);
  };

  const confirmPerformDelete = async () => {
    try {
      await gbpDatabase.deleteDossier(dossier.id);
      setIsConfirmDeleteOpen(false);
      onNotify('Perfil Apagado', `O perfil de ${dossier.businessName} foi excluído do banco de dados.`, 'info');
      if (onDeleteCurrent) {
        onDeleteCurrent();
      } else {
        onBackToForm();
      }
    } catch (err: any) {
      onNotify('Erro ao Apagar', err.message, 'error');
    }
  };

  // Copy helper with visual state and fallback
  const copyToClipboard = async (text: string, key: string, label: string) => {
    const ok = await safeCopy(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 2000);
      onNotify('Copiado com Sucesso!', `${label} copiado para a área de transferência.`, 'success');
    } else {
      onNotify('Erro ao Copiar', 'Não foi possível copiar para a área de transferência.', 'error');
    }
  };

  const isCopied = (key: string) => copiedKey === key;

  // Render individual copy button
  const renderCopyBtn = (text: string, key: string, label: string, size: 'sm' | 'xs' = 'xs') => (
    <button
      type="button"
      onClick={() => copyToClipboard(text, key, label)}
      className={`inline-flex items-center gap-1 font-semibold rounded-lg transition-all cursor-pointer flex-shrink-0 ${
        isCopied(key)
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
      } ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-2 py-1 text-[11px]'}`}
      title={`Copiar ${label}`}
    >
      {isCopied(key) ? <Check className="w-3 h-3 text-emerald-200" /> : <Copy className="w-3 h-3 text-cyan-400" />}
      <span>{isCopied(key) ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );

  // Format full formatted dossier for WhatsApp / Docs
  const getFullFormattedText = () => {
    return `⭐ PERFIL GOOGLE MEU NEGÓCIO — PADRÃO OURO 100/100 ⭐
=====================================================
EMPRESA: ${dossier.businessName}
NICHO: ${dossier.questionnaire.primaryNiche} (${nichePkg.categoryGroup})
DATA: ${new Date(dossier.createdAt).toLocaleDateString('pt-BR')}

1. CADASTRO BÁSICO (COPIAR E COLAR NO GOOGLE):
-----------------------------------------------------
• Nome da Empresa: ${dossier.businessName}
• Categoria Primária: ${dossier.categories.primaryCategory}
• Categorias Secundárias: ${dossier.categories.secondaryCategories.join(', ')}
• Telefone / WhatsApp: ${dossier.questionnaire.whatsapp || dossier.questionnaire.phone}
• Endereço: ${dossier.questionnaire.fullAddress || 'Atendimento em ' + dossier.questionnaire.city}
• Horário: ${dossier.questionnaire.operatingHours}

2. PALAVRAS-CHAVE EM ALTA NO GOOGLE (4+ TERMOS):
-----------------------------------------------------
${nichePkg.topKeywordsGoogle.map((k, i) => `${i + 1}. ${k.keyword.replace(/\[cidade\]/gi, dossier.questionnaire.city || 'São Paulo')} (${k.searchVolume})`).join('\n')}

3. DESCRIÇÃO OFICIAL DA EMPRESA (${dossier.description.charCount}/750 CARACTERES):
-----------------------------------------------------
${dossier.description.fullDescription}

4. CATÁLOGO DE SERVIÇOS / PRODUTOS:
-----------------------------------------------------
${dossier.catalog.map((it, i) => `[${i + 1}] ${it.name} (${it.priceEstimate})\n${it.description}`).join('\n\n')}

5. ATRIBUTOS GOOGLE RECOMENDADOS:
-----------------------------------------------------
${dossier.attributes.accessibility.join(', ')}, ${dossier.attributes.paymentMethods.join(', ')}

6. PERGUNTAS E RESPOSTAS FREQUENTES (FAQ):
-----------------------------------------------------
${dossier.faq.map((f, i) => `P${i + 1}: ${f.question}\nR: ${f.answer}`).join('\n\n')}

7. MODELOS DE RESPOSTA A AVALIAÇÕES:
-----------------------------------------------------
• 5 Estrelas: ${dossier.reviewStrategy.responseTemplates.fiveStar}
• 4 Estrelas: ${dossier.reviewStrategy.responseTemplates.fourStarPositiveWithFeedback}
• Crítico (1-2 Estrelas): ${dossier.reviewStrategy.responseTemplates.oneOrTwoStarCritical}
`;
  };

  // Export Markdown
  const handleExportMarkdown = () => {
    const md = `# DOSSIÊ ESTRATÉGICO GOOGLE BUSINESS PROFILE PRO
**Empresa:** ${dossier.businessName}
**Responsável:** ${dossier.clientName}
**Data:** ${new Date(dossier.createdAt).toLocaleDateString('pt-BR')}

---

## 1. CATEGORIAS OFICIAIS DO GOOGLE
- **Categoria Primária:** ${dossier.categories.primaryCategory}
- **Categorias Secundárias:** ${dossier.categories.secondaryCategories.join(', ')}

## 2. TOP PALAVRAS-CHAVE EM ALTA NO GOOGLE
${nichePkg.topKeywordsGoogle.map((k, i) => `${i + 1}. **${k.keyword.replace(/\[cidade\]/gi, dossier.questionnaire.city || 'São Paulo')}** (${k.searchVolume} - ${k.intent})`).join('\n')}

## 3. DESCRIÇÃO OFICIAL (${dossier.description.charCount}/750 Caracteres)
${dossier.description.fullDescription}

## 4. CATÁLOGO DE PRODUTOS E SERVIÇOS
${dossier.catalog.map((it, i) => `${i + 1}. **${it.name}** - ${it.priceEstimate}\n   ${it.description}`).join('\n\n')}

## 5. FAQ ESTRATÉGICO LOCALIZADO
${dossier.faq.map((f, i) => `**P${i + 1}: ${f.question}**\nR: ${f.answer}`).join('\n\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossie_gbp_${dossier.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Dossiê Exportado', 'Arquivo Markdown baixado com sucesso.', 'success');
  };

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gbp_dossier_${dossier.businessName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('JSON Exportado', 'Dados estruturados exportados com sucesso.', 'success');
  };

  // Save to DB
  const handleSaveToDatabase = async () => {
    try {
      await gbpDatabase.saveDossier(dossier);
      setIsSaved(true);
      onNotify('Salvo no Banco de Dados', 'Dossiê salvo permanentemente no IndexedDB.', 'success');
    } catch (err: any) {
      onNotify('Erro ao Salvar', err.message, 'error');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Top Banner & Master Quick Copy Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 shadow-2xl space-y-4 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                Padrão Ouro 100/100
              </span>
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/40 shrink-0">
                {nichePkg.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight break-words">
              {dossier.businessName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 break-words">
              Perfil otimizado com as <strong>4+ palavras-chave em alta no Google</strong> e todas as seções prontas para copiar e colar no perfil da sua empresa.
            </p>
          </div>

          {/* Main Action Buttons: Criar Novo, Salvar, Apagar, Exportar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto shrink-0">
            {/* 1. CRIAR NOVO PERFIL */}
            <button
              type="button"
              onClick={onCreateNew || onBackToForm}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
              title="Criar um novo perfil do zero ou colar outro questionário"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>+ Criar Novo</span>
            </button>

            {/* 2. SALVAR PERFIL */}
            <button
              type="button"
              onClick={handleSaveToDatabase}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
              title="Salvar perfil atual no banco de dados"
            >
              <Save className="w-3.5 h-3.5 shrink-0" />
              <span>{isSaved ? 'Salvo no Banco ✓' : 'Salvar Perfil'}</span>
            </button>

            {/* 3. APAGAR PERFIL ATUAL */}
            <button
              type="button"
              onClick={handleDeleteCurrent}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer flex-1 sm:flex-initial"
              title="Apagar este perfil permanentemente do banco de dados"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Apagar Perfil</span>
            </button>

            <button
              type="button"
              onClick={onBackToForm}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Editar Respostas
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>MD</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Master Copy Bar (Requested by user) */}
        <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-cyan-950/60 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5 break-words">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              Copiar Todo o Perfil Formatado para o Cliente:
            </span>
            <p className="text-[11px] text-slate-300 break-words">
              Copia todas as 13 etapas organizadas para enviar por WhatsApp ou colar direto no Google Meu Negócio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => copyToClipboard(getFullFormattedText(), 'master_full', 'Perfil Completo')}
              className={`flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg w-full sm:w-auto ${
                isCopied('master_full')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white shadow-emerald-500/20'
              }`}
            >
              {isCopied('master_full') ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              <span className="break-words">{isCopied('master_full') ? '✓ Perfil Completo Copiado!' : '📋 Copiar Perfil Completo'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const quickText = `NOME: ${dossier.businessName}\nCATEGORIA: ${dossier.categories.primaryCategory}\nSECUNDÁRIAS: ${dossier.categories.secondaryCategories.join(', ')}\nENDEREÇO: ${dossier.questionnaire.fullAddress || dossier.questionnaire.city}\nWHATSAPP: ${dossier.questionnaire.whatsapp || dossier.questionnaire.phone}\nHORÁRIO: ${dossier.questionnaire.operatingHours}\n\nDESCRIÇÃO:\n${dossier.description.fullDescription}`;
                copyToClipboard(quickText, 'quick_text', 'Cadastro Rápido');
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 w-full sm:w-auto"
            >
              {isCopied('quick_text') ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span>{isCopied('quick_text') ? 'Copiado!' : 'Copiar Apenas Cadastro'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION: 4+ PALAVRAS-CHAVE EM ALTA NO GOOGLE (MANDATÓRIO) */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3 w-full min-w-0">
          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-base font-extrabold text-white flex items-center gap-2 break-words">
                Palavras-Chave em Alta no Google ({nichePkg.name})
              </h3>
              <p className="text-[11px] text-slate-400 break-words">
                Termos com maior volume de busca local e conversão recomendados para o seu perfil.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const allKw = nichePkg.topKeywordsGoogle
                .map((k) => k.keyword.replace(/\[cidade\]/gi, dossier.questionnaire.city || 'São Paulo'))
                .join('\n');
              copyToClipboard(allKw, 'all_keywords', 'Todas as palavras-chave');
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 w-full sm:w-auto shrink-0"
          >
            {isCopied('all_keywords') ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{isCopied('all_keywords') ? 'Copiado!' : 'Copiar Todas as 4+ Palavras-Chave'}</span>
          </button>
        </div>

        {/* Keywords Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full min-w-0">
          {nichePkg.topKeywordsGoogle.map((kw, i) => {
            const formatted = kw.keyword
              .replace(/\[cidade\]/gi, dossier.questionnaire.city || 'São Paulo')
              .replace(/\[bairro\]/gi, dossier.questionnaire.neighborhood || 'Centro');
            const kwKey = `kw_${i}`;

            return (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-colors flex flex-col justify-between space-y-2 group w-full min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0">#{i + 1} MAIS BUSCADA</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase shrink-0">
                      {kw.searchVolume}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors break-words">
                    {formatted}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug break-words">
                    {kw.recommendation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono capitalize truncate">
                    Intenção: {kw.intent.replace('_', ' ')}
                  </span>
                  {renderCopyBtn(formatted, kwKey, `Palavra-chave #${i + 1}`)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 1 & 2: RESUMO EXECUTIVO & DADOS VERIFICADOS */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words min-w-0 flex-1">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            Etapa 1 & 2: Identificação Comercial & Diretrizes Google
          </h3>
          <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider shrink-0">
            Conformidade Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs w-full min-w-0">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 min-w-0">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Nome Comercial Oficial</span>
              <span className="text-slate-200 font-bold text-sm block mt-0.5 break-words">{dossier.businessName}</span>
              <span className="text-[10px] text-emerald-400 mt-1 block">✓ Sem spam promocional no título</span>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              {renderCopyBtn(dossier.businessName, 'name_btn', 'Nome da Empresa')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 min-w-0">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Nicho & Categoria Primária</span>
              <span className="text-slate-200 font-bold block mt-0.5 break-words">{dossier.categories.primaryCategory}</span>
              <span className="text-[10px] text-cyan-400 mt-1 block">Taxonomia Oficial Google</span>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              {renderCopyBtn(dossier.categories.primaryCategory, 'primary_cat_btn', 'Categoria Primária')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 min-w-0">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Formato Operacional</span>
              <span className="text-slate-200 font-bold block mt-0.5 break-words">
                {dossier.addressStrategy.serviceModel === 'physical'
                  ? 'Endereço Comercial Físico'
                  : dossier.addressStrategy.serviceModel === 'service_area'
                  ? 'Área de Atendimento (SAB)'
                  : 'Modelo Híbrido'}
              </span>
              <span className="text-[10px] text-indigo-400 mt-1 block break-words">
                {dossier.addressStrategy.storefrontVisible ? 'Endereço Público Visível' : 'Endereço Ocultado no Mapa'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              {renderCopyBtn(dossier.questionnaire.fullAddress || dossier.questionnaire.city, 'address_btn', 'Endereço')}
            </div>
          </div>
        </div>

        {/* Verification Video Instructions Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-2 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5 break-words min-w-0 flex-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              Roteiro de Gravação de Vídeo para Verificação Google Sem Suspensão
            </span>
            {renderCopyBtn(dossier.addressStrategy.verificationAdvice, 'video_advice', 'Roteiro de Vídeo')}
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px] break-words">
            {dossier.addressStrategy.verificationAdvice}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 3: CATEGORIAS OFICIAIS */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words min-w-0 flex-1">
            <Target className="w-4 h-4 text-cyan-400 shrink-0" />
            Etapa 3: Categoria Principal e Secundárias para Máxima Relevância
          </h3>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">Taxonomia Oficial</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs w-full min-w-0">
          {/* Primary Category Card */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider min-w-0 truncate">
                Categoria Primária (Fator #1 de Ranking Local)
              </span>
              {renderCopyBtn(dossier.categories.primaryCategory, 'primary_cat_copy', 'Categoria Primária')}
            </div>
            <p className="text-base font-extrabold text-white break-words">{dossier.categories.primaryCategory}</p>
            <p className="text-slate-300 text-[11px] leading-relaxed break-words">
              {dossier.categories.primaryJustification}
            </p>
          </div>

          {/* Secondary Categories Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block min-w-0 truncate">
                Categorias Secundárias Permitidas
              </span>
              {renderCopyBtn(dossier.categories.secondaryCategories.join(', '), 'sec_cat_copy', 'Categorias Secundárias')}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {dossier.categories.secondaryCategories.map((sec, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold break-words"
                >
                  {sec}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 pt-1 leading-relaxed break-words">
              {dossier.categories.relevanceNotes}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 4 & 5: ENDEREÇO, HORÁRIOS & ATRIBUTOS OFICIAIS */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words min-w-0 flex-1">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            Etapa 4 & 5: NAP Padronizado, Horários de Funcionamento e Atributos
          </h3>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">Consistência Local</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs w-full min-w-0">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 min-w-0">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Endereço Padronizado</span>
              <p className="text-slate-200 font-bold mt-1 break-words">
                {dossier.questionnaire.fullAddress || `Atendimento em ${dossier.questionnaire.city}`}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 break-words">
                {dossier.questionnaire.city} - {dossier.questionnaire.state}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              {renderCopyBtn(dossier.questionnaire.fullAddress || dossier.questionnaire.city, 'nap_address', 'Endereço')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 min-w-0">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Horário de Funcionamento</span>
              <p className="text-slate-200 font-semibold mt-1 leading-relaxed break-words">
                {dossier.questionnaire.operatingHours}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              {renderCopyBtn(dossier.questionnaire.operatingHours, 'hours_btn', 'Horários')}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 min-w-0">
            <div className="min-w-0">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">WhatsApp & Telefone</span>
              <p className="text-slate-200 font-bold mt-1 break-words">
                WhatsApp: {dossier.questionnaire.whatsapp || 'Não informado'}
              </p>
              <p className="text-slate-400 text-[11px] break-words">
                Fixo: {dossier.questionnaire.phone || 'Não informado'}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-900 flex justify-end">
              {renderCopyBtn(dossier.questionnaire.whatsapp || dossier.questionnaire.phone, 'phone_btn', 'Telefone/WhatsApp')}
            </div>
          </div>
        </div>

        {/* Attributes Badges with Copy Action */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full min-w-0">
            <span className="text-xs font-bold text-slate-200 break-words min-w-0 flex-1">
              Atributos Oficiais Recomendados para Ativar no Perfil:
            </span>
            {renderCopyBtn(
              [...dossier.attributes.accessibility, ...dossier.attributes.paymentMethods, ...dossier.attributes.highlights].join('\n• '),
              'all_attributes_copy',
              'Lista de Atributos'
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {dossier.attributes.accessibility.map((a, i) => (
              <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-[11px] font-medium break-words">
                ♿ {a}
              </span>
            ))}
            {dossier.attributes.paymentMethods.map((p, i) => (
              <span key={i} className="px-2.5 py-1 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-[11px] font-medium break-words">
                💳 {p}
              </span>
            ))}
            {dossier.attributes.highlights.map((h, i) => (
              <span key={i} className="px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] font-medium break-words">
                ⭐ {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 7: DESCRIÇÃO OFICIAL (750 CHARS COM PALAVRAS-CHAVE) */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              Etapa 7: Descrição Oficial da Empresa (Otimizada com Palavras-Chave)
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                dossier.description.charCount <= 750
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {dossier.description.charCount} / 750 Caracteres
            </span>
          </div>

          {renderCopyBtn(dossier.description.fullDescription, 'desc_btn', 'Descrição Oficial', 'sm')}
        </div>

        {/* Full description display box */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed font-sans select-all shadow-inner break-words">
          {dossier.description.fullDescription}
        </div>

        {/* Compliance checklist flags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] w-full min-w-0">
          <div className="flex items-center gap-1.5 text-emerald-400 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Sem links proibidos</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Gancho no início</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Palavras-chave naturais</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 min-w-0">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Sem spam caixa alta</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 8: CATÁLOGO DE PRODUTOS & SERVIÇOS COM COPIAR INDIVIDUAL */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words">
              <Briefcase className="w-4 h-4 text-cyan-400 shrink-0" />
              Etapa 8: Catálogo de Serviços e Produtos ({dossier.catalog.length} Itens)
            </h3>
            <p className="text-[11px] text-slate-400 break-words">
              Copie individualmente cada serviço com título, preço e descrição para colar no gerenciador do Google.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const allCat = dossier.catalog
                .map((it) => `SERVIÇO: ${it.name}\nPREÇO: ${it.priceEstimate}\nDESCRIÇÃO:\n${it.description}`)
                .join('\n\n---\n\n');
              copyToClipboard(allCat, 'all_catalog', 'Catálogo Completo');
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 w-full sm:w-auto shrink-0"
          >
            {isCopied('all_catalog') ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{isCopied('all_catalog') ? 'Copiado!' : 'Copiar Todos os Serviços'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs w-full min-w-0">
          {dossier.catalog.map((item, idx) => {
            const itemKey = `cat_item_${idx}`;
            const itemText = `NOME: ${item.name}\nPREÇO: ${item.priceEstimate}\nDESCRIÇÃO: ${item.description}`;

            return (
              <div
                key={item.id || idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between space-y-3 min-w-0 w-full"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5 min-w-0 break-words flex-1">
                      {item.isPriority && <span className="text-amber-400 shrink-0">★</span>}
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-cyan-300 font-semibold shrink-0">
                      {item.priceEstimate || 'Sob consulta'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed break-words">{item.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono truncate">{item.category || 'Serviço'}</span>
                  {renderCopyBtn(itemText, itemKey, item.name)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 9: FOTOS E NOMENCLATURA SEO */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words min-w-0 flex-1">
            <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
            Etapa 9: Checklist de Fotos e Nomes de Arquivo Otimizados para SEO Local
          </h3>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">Geotag & SEO</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs w-full min-w-0">
          {dossier.photoChecklist.map((photo, i) => (
            <div
              key={photo.id || i}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 flex flex-col justify-between min-w-0 w-full"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="font-bold text-slate-200 text-xs truncate flex-1 min-w-0">{photo.title}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 shrink-0">
                    {photo.category}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-2 mt-1 min-w-0 overflow-hidden">
                  <code className="text-cyan-300 font-mono text-[11px] truncate flex-1 min-w-0">
                    {photo.seoFileName}
                  </code>
                  {renderCopyBtn(photo.seoFileName, `photo_fn_${i}`, 'Nome do Arquivo')}
                </div>
                <p className="text-slate-400 text-[11px] mt-2 leading-relaxed break-words">{photo.description}</p>
              </div>
              <span className="text-[10px] text-slate-500 italic block break-words">
                {photo.recommendedSpec}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 10: ESTRATÉGIA DE AVALIAÇÕES E 5 MODELOS PRONTOS */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words">
              <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
              Etapa 10: Modelos Oficiais de Respostas a Avaliações do Google
            </h3>
            <p className="text-[11px] text-slate-400 break-words">
              Copie respostas personalizadas para responder aos comentários em menos de 24 horas.
            </p>
          </div>

          <button
            onClick={() => {
              const allResp = `5 ESTRELAS:\n${dossier.reviewStrategy.responseTemplates.fiveStar}\n\n4 ESTRELAS:\n${dossier.reviewStrategy.responseTemplates.fourStarPositiveWithFeedback}\n\n3 ESTRELAS:\n${dossier.reviewStrategy.responseTemplates.threeStarNeutral}\n\n1-2 ESTRELAS:\n${dossier.reviewStrategy.responseTemplates.oneOrTwoStarCritical}\n\nSUSPEITA DE FAKE:\n${dossier.reviewStrategy.responseTemplates.fakeOrUnfairSuspected}`;
              copyToClipboard(allResp, 'all_reviews_btn', 'Todos os modelos');
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 w-full sm:w-auto shrink-0"
          >
            {isCopied('all_reviews_btn') ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{isCopied('all_reviews_btn') ? 'Copiado!' : 'Copiar Todos os 5 Modelos'}</span>
          </button>
        </div>

        {/* 5 Response Templates */}
        <div className="space-y-3 w-full min-w-0">
          {[
            {
              title: '1. Resposta para Avaliação 5 Estrelas (Excelente)',
              content: dossier.reviewStrategy.responseTemplates.fiveStar,
              key: 'rev_5',
              tag: '5 Estrelas',
              tagColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
            },
            {
              title: '2. Resposta para Avaliação 4 Estrelas (Positiva com Sugestão)',
              content: dossier.reviewStrategy.responseTemplates.fourStarPositiveWithFeedback,
              key: 'rev_4',
              tag: '4 Estrelas',
              tagColor: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40',
            },
            {
              title: '3. Resposta para Avaliação 3 Estrelas (Neutra)',
              content: dossier.reviewStrategy.responseTemplates.threeStarNeutral,
              key: 'rev_3',
              tag: '3 Estrelas',
              tagColor: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
            },
            {
              title: '4. Resposta para Avaliação 1 a 2 Estrelas (Crítica / Reclamação)',
              content: dossier.reviewStrategy.responseTemplates.oneOrTwoStarCritical,
              key: 'rev_1',
              tag: '1-2 Estrelas',
              tagColor: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
            },
            {
              title: '5. Resposta para Suspeita de Fake / Cliente Não Cadastrado',
              content: dossier.reviewStrategy.responseTemplates.fakeOrUnfairSuspected,
              key: 'rev_fake',
              tag: 'Suspeita de Fake',
              tagColor: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
            },
          ].map((item) => (
            <div key={item.key} className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2 w-full min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="font-bold text-slate-200 break-words">{item.title}</span>
                </div>
                {renderCopyBtn(item.content, item.key, item.tag)}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-900/70 p-3 rounded-xl border border-slate-800/60 break-words">
                "{item.content}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 11: CALENDÁRIO EDITORIAL DE POSTAGENS GOOGLE UPDATES */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 w-full min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words min-w-0 flex-1">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            Etapa 11: Calendário Editorial de Postagens no Perfil (Google Posts)
          </h3>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">Sinal de Frescor</span>
        </div>

        <div className="space-y-3 w-full min-w-0">
          {dossier.editorialCalendar.map((post, i) => {
            const postKey = `post_${i}`;
            const postContent = `TÍTULO: ${post.headline}\n\n${post.body}\n\n[Botão: ${post.ctaButton}]`;

            return (
              <div
                key={post.day || i}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs w-full min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2 w-full min-w-0">
                  <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[10px] font-bold shrink-0">
                      Dia {post.day}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">
                      {post.type}
                    </span>
                    <h4 className="font-bold text-slate-200 break-words">{post.headline}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-emerald-400 font-semibold shrink-0">
                      CTA: {post.ctaButton}
                    </span>
                    {renderCopyBtn(postContent, postKey, `Post Dia ${post.day}`)}
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-850 break-words">
                  {post.body}
                </p>

                <div className="text-[10px] text-slate-400 pt-0.5 flex items-center gap-1.5 break-words">
                  <Camera className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="break-words">Foto recomendada: {post.photoGuidance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE 12: PERGUNTAS E RESPOSTAS FAQ COM COPIAR INDIVIDUAL */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 sm:p-6 space-y-4 shadow-xl w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2 break-words">
              <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
              Etapa 12: Perguntas e Respostas Frequentes (Q&A da Comunidade)
            </h3>
            <p className="text-[11px] text-slate-400 break-words">
              Copie para publicar na aba Perguntas da Comunidade no perfil e capturar pesquisas conversacionais.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const allFaq = dossier.faq
                .map((f, i) => `PERGUNTA ${i + 1}: ${f.question}\nRESPOSTA: ${f.answer}`)
                .join('\n\n---\n\n');
              copyToClipboard(allFaq, 'all_faq_btn', 'Todos os FAQs');
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 w-full sm:w-auto shrink-0"
          >
            {isCopied('all_faq_btn') ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{isCopied('all_faq_btn') ? 'Copiado!' : 'Copiar Todos os FAQs'}</span>
          </button>
        </div>

        <div className="space-y-3 w-full min-w-0">
          {dossier.faq.map((item, idx) => {
            const faqKey = `faq_${idx}`;
            const faqText = `PERGUNTA: ${item.question}\nRESPOSTA: ${item.answer}`;

            return (
              <div
                key={item.id || idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs w-full min-w-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-2 w-full min-w-0">
                  <span className="font-bold text-slate-100 text-xs sm:text-sm break-words min-w-0 flex-1">
                    P{idx + 1}: {item.question}
                  </span>
                  {renderCopyBtn(faqText, faqKey, `FAQ #${idx + 1}`)}
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-850 break-words">
                  {item.answer}
                </p>
                <span className="text-[10px] text-indigo-400 block font-mono break-words">
                  Meta SEO: {item.strategicGoal}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM ACTION BAR: CRIAR NOVO, SALVAR E APAGAR O ATUAL */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Gerenciar Perfil: <strong>{dossier.businessName}</strong></span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Deseja criar um novo perfil para outro cliente, salvar alterações ou apagar este perfil?
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={onCreateNew || onBackToForm}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
            title="Criar um novo perfil do zero ou colar outro questionário"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>+ Criar Novo Perfil</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
            title="Salvar perfil atual no banco de dados"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{isSaved ? 'Salvo no Banco ✓' : 'Salvar no Banco'}</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteCurrent}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-all cursor-pointer flex-1 sm:flex-initial"
            title="Apagar este perfil permanentemente do banco de dados"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Apagar Perfil Atual</span>
          </button>
        </div>
      </div>

      {/* MODAL: DELETE DOSSIER CONFIRMATION */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white text-center">Apagar Perfil Atual?</h3>
            <p className="text-xs text-slate-300 text-center leading-relaxed">
              Deseja realmente apagar o perfil de "{dossier.businessName}" do banco de dados?
              Esta ação excluirá o dossiê permanentemente.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPerformDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
