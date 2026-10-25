import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Phone,
  Mail,
  Palette,
  ShieldAlert,
  Briefcase,
  Users,
  Target,
  FileCheck,
  Star,
  Settings2,
  ExternalLink,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { ImageAsset, ImageCategory, ProjectExtractedData, ProjectType, TargetPlatform } from '../types';
import { processAndCompressImage } from '../services/imageService';
import { copyToClipboard } from '../utils/clipboard';

interface AnalysisViewProps {
  projectName: string;
  projectType: ProjectType;
  targetPlatform: TargetPlatform;
  initialData: ProjectExtractedData;
  source: 'gemini' | 'heuristic';
  onBack: () => void;
  onGenerate: (confirmedData: ProjectExtractedData) => void;
  isGenerating: boolean;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  projectName,
  projectType,
  targetPlatform,
  initialData,
  source,
  onBack,
  onGenerate,
  isGenerating,
}) => {
  const [data, setData] = useState<ProjectExtractedData>(initialData);

  const [copiedPromptIdx, setCopiedPromptIdx] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Helper to update fields
  const updateField = <K extends keyof ProjectExtractedData>(key: K, value: ProjectExtractedData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  // Helper to update array fields via multiline textarea
  const updateArrayField = (key: 'services' | 'businessGoals' | 'differentials' | 'audiencePainPoints' | 'benefitsAndTransformation' | 'socialLinks' | 'references' | 'mandatoryContent', rawText: string) => {
    const arr = rawText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setData((prev) => ({ ...prev, [key]: arr.length > 0 ? arr : ['Não informado'] }));
  };

  // Image Upload & Canvas Compression handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);

    try {
      const newAssets: ImageAsset[] = [...(data.imageAssets || [])];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { dataUrl, width, height, sizeFormatted } = await processAndCompressImage(file);
        
        // Auto-categorize based on filename
        let category: ImageCategory = 'other';
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes('logo')) category = 'logo';
        else if (nameLower.includes('hero') || nameLower.includes('banner')) category = 'hero';
        else if (nameLower.includes('equipe') || nameLower.includes('team') || nameLower.includes('perfil') || nameLower.includes('foto')) category = 'team';
        else if (nameLower.includes('clinica') || nameLower.includes('consultorio') || nameLower.includes('sala') || nameLower.includes('espaco')) category = 'facility';
        else if (nameLower.includes('servico') || nameLower.includes('procedimento')) category = 'services';
        else if (nameLower.includes('depoimento') || nameLower.includes('caso') || nameLower.includes('antes')) category = 'testimonials';

        newAssets.push({
          id: `img_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`,
          name: file.name,
          category,
          dataUrl,
          altText: `${data.companyName} — ${category === 'logo' ? 'Logotipo Oficial Vetorial' : file.name.replace(/\.[^/.]+$/, '')}`,
          sectionTarget: category === 'logo' ? 'Header & Footer' : category === 'hero' ? 'Hero Principal' : 'Vitrine de Conteúdo',
          isRealClientPhoto: true,
          dimensions: `${width}x${height}px`,
          fileSizeFormatted: sizeFormatted,
        });
      }
      setData((prev) => ({ ...prev, imageAssets: newAssets }));
    } catch (err) {
      console.warn('Erro ao processar imagem:', err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeImageAsset = (id: string) => {
    setData((prev) => ({
      ...prev,
      imageAssets: (prev.imageAssets || []).filter((a) => a.id !== id),
    }));
  };

  const updateImageAsset = (id: string, updates: Partial<ImageAsset>) => {
    setData((prev) => ({
      ...prev,
      imageAssets: (prev.imageAssets || []).map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  };

  const copyPromptText = async (text: string, idx: number) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedPromptIdx(idx);
      setTimeout(() => setCopiedPromptIdx(null), 2500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Voltar ao formulário"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Análise e Validação do Questionário
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400 ml-7">
            Projeto: <span className="text-slate-200 font-semibold">{projectName}</span> •
            Formato: <span className="text-cyan-400 uppercase font-mono">{projectType}</span> •
            Processado via <span className="text-slate-200">{source === 'gemini' ? 'Gemini 3.8 Flash' : 'Motor Heurístico'}</span>
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onGenerate(data)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-600/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sintetizando Prompt...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar Prompt Premium Personalizado</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Warnings & Diagnostic Alerts (Informações Ausentes & Contradições) */}
      {(data.missingFields.length > 0 || data.contradictions.length > 0) && (
        <div className="space-y-3">
          {/* Missing Fields Notice */}
          {data.missingFields.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Informações Ausentes Detectadas no Briefing ({data.missingFields.length})</span>
              </div>
              <p className="text-slate-300 mb-2">
                O questionário não informou os dados abaixo. Você pode preenchê-los agora nos campos abaixo ou continuar;
                o prompt final registrará as pendências sem inventar fatos falsos:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.missingFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-amber-900/40 border border-amber-700/50 text-amber-200 text-[11px] font-medium"
                  >
                    • {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contradictions Alert */}
          {data.contradictions.length > 0 && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Possíveis Contradições ou Conflitos no Questionário</span>
              </div>
              <ul className="space-y-1 text-slate-300 mt-1 list-disc list-inside">
                {data.contradictions.map((c, idx) => (
                  <li key={idx} className="text-rose-200">
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Categorized Fields (All 20 Categories from Section 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category 1: Dados do Cliente e Marca */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>Dados do Cliente & Segmento</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Nome da Empresa / Marca</label>
              <input
                type="text"
                value={data.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Nicho e Segmento Principal</label>
              <input
                type="text"
                value={data.niche}
                onChange={(e) => updateField('niche', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">Região de Atendimento</label>
              <input
                type="text"
                value={data.serviceRegion}
                onChange={(e) => updateField('serviceRegion', e.target.value)}
                placeholder="Ex: Rio de Janeiro - Barra da Tijuca ou Nacional"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Category 2: Endereço & Localização Presencial (Regra Condicional) */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Localização Física & Google Maps</span>
            </h3>
            {/* Toggle hasPhysicalLocation */}
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <span className="text-slate-400">Atendimento Presencial?</span>
              <input
                type="checkbox"
                checked={data.hasPhysicalLocation}
                onChange={(e) => updateField('hasPhysicalLocation', e.target.checked)}
                className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Endereço Físico Completo
              </label>
              <textarea
                rows={3}
                value={data.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="Av. das Américas, 4200 - Barra da Tijuca, RJ..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
              {data.hasPhysicalLocation ? (
                <span className="text-emerald-300">
                  ✓ Regra Ativa: Será incluído componente de mapa do Google Maps e dados de LocalBusiness.
                </span>
              ) : (
                <span className="text-cyan-300">
                  ✓ Regra Ativa: Operação 100% digital/remota. Nenhum mapa falso ou endereço fictício será criado.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Category 3: Contatos Oficiais (WhatsApp, Telefone, Email, Redes) */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Phone className="w-4 h-4 text-indigo-400" />
            <span>Canais de Contato & Redes Sociais</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-400 block mb-1">WhatsApp Oficial</label>
                <input
                  type="text"
                  value={data.whatsapp}
                  onChange={(e) => {
                    updateField('whatsapp', e.target.value);
                    updateField('hasWhatsApp', Boolean(e.target.value && e.target.value !== 'Não informado'));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Telefone Fixo</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">E-mail Corporativo</label>
              <input
                type="text"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Redes Sociais e Links (um por linha)
              </label>
              <textarea
                rows={2}
                value={data.socialLinks.join('\n')}
                onChange={(e) => updateArrayField('socialLinks', e.target.value)}
                placeholder="Instagram: @dracamiladental&#10;LinkedIn: ..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Category 4: Serviços Oferecidos */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Serviços / Produtos Principais (um por linha)</span>
          </h3>

          <textarea
            rows={5}
            value={data.services.join('\n')}
            onChange={(e) => updateArrayField('services', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 text-xs leading-relaxed"
          />
          <p className="text-[11px] text-slate-500">
            Cada linha será formatada como um módulo ou cartão individual na vitrine de serviços.
          </p>
        </div>

        {/* Category 5: Público-Alvo e Dores */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Público-Alvo & Dores Mapeadas</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Perfil do Cliente Ideal</label>
              <textarea
                rows={2}
                value={data.targetAudience}
                onChange={(e) => updateField('targetAudience', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Dores, Medos e Objeções (um por linha)
              </label>
              <textarea
                rows={3}
                value={data.audiencePainPoints.join('\n')}
                onChange={(e) => updateArrayField('audiencePainPoints', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Category 6: Objetivos, Diferenciais & Benefícios */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Diferenciais Concretos & Benefícios</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Diferenciais Competitivos Reais (um por linha)
              </label>
              <textarea
                rows={3}
                value={data.differentials.join('\n')}
                onChange={(e) => updateArrayField('differentials', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Objetivos Comerciais do Site (um por linha)
              </label>
              <textarea
                rows={2}
                value={data.businessGoals.join('\n')}
                onChange={(e) => updateArrayField('businessGoals', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Category 7: Identidade Visual & Referências */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>Identidade Visual & Estilo</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">Paleta de Cores e Tons</label>
              <input
                type="text"
                value={data.visualIdentity.primaryColors}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    visualIdentity: { ...prev.visualIdentity, primaryColors: e.target.value },
                    preferencesEsthetic: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="logoCheck"
                checked={data.visualIdentity.logoAvailable}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    visualIdentity: { ...prev.visualIdentity, logoAvailable: e.target.checked },
                  }))
                }
                className="rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="logoCheck" className="text-slate-300 font-medium">
                Logotipo vetorizado/alta definição já disponível
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Referências / Inspirações Visuais
              </label>
              <textarea
                rows={2}
                value={data.references.join('\n')}
                onChange={(e) => updateArrayField('references', e.target.value)}
                placeholder="Ex: Linear.app, Stripe, ou estilo spa acolhedor"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Category 8: Provas Sociais & Requisitos Obrigatórios */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Provas Sociais Reais & Registros Oficiais</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Depoimentos e Avaliações Verificadas
              </label>
              <textarea
                rows={2}
                value={data.socialProof.testimonials.join('\n')}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    socialProof: {
                      ...prev.socialProof,
                      hasRealProof: e.target.value.trim().length > 5,
                      testimonials: [e.target.value],
                    },
                  }))
                }
                placeholder="Ex: 450 sorrisos transformados, nota 4.9 no Google com 120 avaliações"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                * Regra de Ouro: Proibido inventar depoimentos fictícios. Se vazio, a seção será marcada como pendente de coleta.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-400 block mb-1">
                Conteúdos Obrigatórios / Regulatórios (CRM, CRO, OAB, CNPJ)
              </label>
              <textarea
                rows={2}
                value={data.mandatoryContent.join('\n')}
                onChange={(e) => updateArrayField('mandatoryContent', e.target.value)}
                placeholder="Ex: Camila Ramos — CRO-RJ 45.892 / EPAO 9821"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Category 8b: Direção Fotográfica, Galeria de Assets Reais & Prompts de IA */}
        <div className="p-5 rounded-xl border border-indigo-500/30 bg-slate-900/60 md:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Direção Fotográfica, Galeria de Assets & Processamento de Imagens
                </h3>
                <p className="text-[11px] text-slate-400">
                  Gerencie fotos reais do cliente com compressão no navegador e prompts fotográficos anti-slop sob medida para Midjourney / FLUX.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingImage ? 'Otimizando...' : 'Adicionar Fotos Reais'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Real Assets Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assets e Fotos Reais do Cliente ({(data.imageAssets || []).length})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Otimizados no cliente (WebP/Canvas)
              </span>
            </div>

            {(data.imageAssets || []).length === 0 ? (
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 transition-colors cursor-pointer text-center group">
                <Camera className="w-8 h-8 text-slate-600 group-hover:text-indigo-400 transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-300">
                  Nenhuma imagem carregada ainda
                </span>
                <span className="text-[11px] text-slate-500 max-w-md mt-0.5">
                  Clique aqui ou use o botão acima para enviar o logotipo, fotos do fundador, espaço físico ou procedimentos. Imagens reais são priorizadas automaticamente no prompt final.
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(data.imageAssets || []).map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      {asset.dataUrl ? (
                        <img
                          src={asset.dataUrl}
                          alt={asset.altText}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-900"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-white truncate text-[11px]">
                            {asset.name}
                          </span>
                          <button
                            onClick={() => removeImageAsset(asset.id)}
                            title="Remover imagem"
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-0.5">
                          {asset.dimensions && <span>{asset.dimensions}</span>}
                          {asset.fileSizeFormatted && <span>• {asset.fileSizeFormatted}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <label className="text-slate-400 text-[10px] block">Categoria & Seção:</label>
                        <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                          <select
                            value={asset.category}
                            onChange={(e) =>
                              updateImageAsset(asset.id, {
                                category: e.target.value as ImageCategory,
                              })
                            }
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-200"
                          >
                            <option value="logo">Logotipo</option>
                            <option value="hero">Hero Principal</option>
                            <option value="team">Equipe / Perfil</option>
                            <option value="facility">Espaço Físico</option>
                            <option value="services">Serviços</option>
                            <option value="testimonials">Depoimentos / Casos</option>
                            <option value="product">Produto</option>
                            <option value="other">Outro</option>
                          </select>

                          <input
                            type="text"
                            value={asset.sectionTarget}
                            onChange={(e) => updateImageAsset(asset.id, { sectionTarget: e.target.value })}
                            placeholder="Alvo (ex: Hero)"
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 text-[10px] block">Alt Text Semântico (SEO & Acessibilidade):</label>
                        <input
                          type="text"
                          value={asset.altText}
                          onChange={(e) => updateImageAsset(asset.id, { altText: e.target.value })}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-200 mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Photographic Direction Prompts (Anti-Slop) */}
          {data.photographicDirection && (
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prompts Fotográficos de IA Especializados (Anti-Banco de Imagem Genérico)</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Utilize estes prompts caso o cliente não tenha fotos reais de alguma dobra.
                  </p>
                </div>
              </div>

              {/* Recommended Prompts List */}
              <div className="space-y-2">
                {data.photographicDirection.recommendedPrompts.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-950/70 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-200">{p.section}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                          {p.aspectRatio}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {p.suggestedModel}
                        </span>
                      </div>

                      <button
                        onClick={() => copyPromptText(p.promptText, idx)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        {copiedPromptIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copiar Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/50 select-all">
                      {p.promptText}
                    </p>
                  </div>
                ))}
              </div>

              {/* Prohibited Elements Disclaimer */}
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[11px] text-slate-300">
                <span className="text-rose-400 font-semibold block mb-0.5">
                  Regras Absolutas de Direção Fotográfica:
                </span>
                <span className="text-slate-400">
                  {data.photographicDirection.prohibitedElements.join(' • ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Category 9: Arquitetura Tecnológica & Hospedagem (Astro-First & Hostinger) */}
        <div className="p-5 rounded-xl border border-cyan-500/30 bg-slate-900/60 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Arquitetura Tecnológica & Hospedagem (Módulo Astro-First)</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
              Obrigatório
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Framework Preferencial
              </label>
              <input
                type="text"
                value={data.preferredFramework || 'Astro (Astro-First)'}
                onChange={(e) => updateField('preferredFramework', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Astro compila para HTML puro sem JavaScript no navegador por padrão (zero-JS), com ilhas interativas opcionais.
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Ambiente de Hospedagem
              </label>
              <select
                value={data.hostingTarget || 'hostinger_static'}
                onChange={(e) => updateField('hostingTarget', e.target.value as import('../types').HostingTarget)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-500"
              >
                <option value="hostinger_static">Hostinger (Hospedagem Compartilhada / Arquivos Estáticos em public_html)</option>
                <option value="hostinger_vps">Hostinger (Cloud / VPS / Node.js)</option>
                <option value="vercel_netlify">Vercel / Netlify</option>
                <option value="cloudflare_pages">Cloudflare Pages</option>
                <option value="other_static">Servidor Próprio / Outra Hospedagem Estática</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Para Hostinger compartilhada, o prompt gerará comandos de build estático ('npm run build') para publicação direta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 p-4 rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar e editar questionário</span>
        </button>

        <button
          onClick={() => onGenerate(data)}
          disabled={isGenerating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sintetizando Prompt...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Gerar Prompt Premium Personalizado</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
