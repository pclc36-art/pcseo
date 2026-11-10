import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Sparkles,
  Download,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ExternalLink,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  SlidersHorizontal,
  ArrowLeft,
  FileCheck,
  Info,
  Layers,
  Monitor,
  Smartphone,
  Eye,
  Film
} from 'lucide-react';
import {
  compressImageToWebP,
  CompressedImageResult,
  formatBytes,
  generatePictureHtml,
  extractVideoMetadata,
  VideoMetadata,
  generateLazyVideoFacade
} from '../../services/mediaOptimizerService';
import { copyToClipboard } from '../../utils/clipboard';

interface MediaOptimizerViewProps {
  onNotify: (title: string, desc?: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onBack?: () => void;
}

export const MediaOptimizerView: React.FC<MediaOptimizerViewProps> = ({ onNotify, onBack }) => {
  const [activeTab, setActiveTab] = useState<'images' | 'videos' | 'rules'>('images');

  // ==========================================
  // IMAGE OPTIMIZER STATE
  // ==========================================
  const [imageResults, setImageResults] = useState<CompressedImageResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<CompressedImageResult | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [presetType, setPresetType] = useState<'desktop_hero' | 'mobile_featured' | 'thumbnail' | 'custom'>('desktop_hero');
  const [customQuality, setCustomQuality] = useState<number>(82);
  const [customMaxWidth, setCustomMaxWidth] = useState<number>(1920);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // VIDEO OPTIMIZER STATE
  // ==========================================
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);
  const [videoPurpose, setVideoPurpose] = useState<'background_loop' | 'long_demo'>('background_loop');
  const [embedProvider, setEmbedProvider] = useState<'youtube' | 'vimeo'>('youtube');
  const [embedVideoId, setEmbedVideoId] = useState('dQw4w9WgXcQ');
  const [copiedVideoCode, setCopiedVideoCode] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Apply Preset Configuration
  const getPresetConfig = (preset: 'desktop_hero' | 'mobile_featured' | 'thumbnail' | 'custom') => {
    switch (preset) {
      case 'desktop_hero':
        return { maxWidth: 1920, quality: 0.80, targetType: 'background' as const };
      case 'mobile_featured':
        return { maxWidth: 800, quality: 0.82, targetType: 'featured' as const };
      case 'thumbnail':
        return { maxWidth: 500, quality: 0.85, targetType: 'thumbnail' as const };
      case 'custom':
        return { maxWidth: customMaxWidth, quality: customQuality / 100, targetType: 'custom' as const };
    }
  };

  // Process Images Batch (up to 20 like TinyPNG)
  const handleImageFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 20);

    if (validFiles.length === 0) {
      onNotify('Nenhuma Imagem Válida', 'Por favor, selecione arquivos PNG, JPG ou WEBP.', 'warning');
      return;
    }

    setIsProcessingImages(true);
    onNotify(
      'Otimizando Imagens para WebP',
      `Processando ${validFiles.length} imagem(ns) no navegador com padrão PageSpeed 100...`,
      'info'
    );

    const config = getPresetConfig(presetType);
    const newResults: CompressedImageResult[] = [];

    for (const file of validFiles) {
      try {
        const res = await compressImageToWebP(file, {
          maxWidth: config.maxWidth,
          quality: config.quality,
          targetType: config.targetType,
          format: 'image/webp',
        });
        newResults.push(res);
      } catch (err: any) {
        console.error('Erro ao comprimir imagem:', err);
      }
    }

    setImageResults((prev) => [...newResults, ...prev]);
    if (newResults.length > 0 && !selectedImage) {
      setSelectedImage(newResults[0]);
    }
    setIsProcessingImages(false);

    const totalSaved = newResults.reduce((acc, r) => acc + r.savingsBytes, 0);
    onNotify(
      'Otimização Concluída!',
      `${newResults.length} imagens convertidas para WebP. Economia total de ${formatBytes(totalSaved)}.`,
      'success'
    );
  };

  // Re-compress selected image with updated custom parameters
  const handleRecompressSelected = async () => {
    if (!selectedImage) return;
    try {
      setIsProcessingImages(true);
      const updated = await compressImageToWebP(selectedImage.originalFile, {
        maxWidth: customMaxWidth,
        quality: customQuality / 100,
        targetType: 'custom',
        format: 'image/webp',
      });
      setSelectedImage(updated);
      setImageResults((prev) => prev.map((item) => (item.id === selectedImage.id ? updated : item)));
      onNotify('Ajuste Aplicado', `Novo tamanho: ${formatBytes(updated.compressedSize)} (-${updated.savingsPercent}%)`, 'success');
    } catch (e: any) {
      onNotify('Erro', e.message, 'error');
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Download single image
  const handleDownload = (result: CompressedImageResult) => {
    const link = document.createElement('a');
    link.href = result.compressedDataUrl;
    const baseName = result.originalName.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}-otimizado.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify('Download Concluído', `${baseName}-otimizado.webp salvo com sucesso.`, 'success');
  };

  // Download all batch images
  const handleDownloadAll = () => {
    imageResults.forEach((res, idx) => {
      setTimeout(() => {
        handleDownload(res);
      }, idx * 250);
    });
  };

  // Copy responsive picture snippet
  const handleCopyPictureHtml = async (result: CompressedImageResult) => {
    const html = generatePictureHtml(result);
    const ok = await copyToClipboard(html);
    if (ok) {
      setCopiedCodeId(result.id);
      setTimeout(() => setCopiedCodeId(null), 2500);
      onNotify('Código Copiado!', 'Tag <picture> responsiva pronta para colar no seu site.', 'success');
    }
  };

  // Process Video File
  const handleVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      onNotify('Arquivo Inválido', 'Selecione um arquivo de vídeo (MP4, WebM, MOV, etc).', 'warning');
      return;
    }

    setVideoFile(file);
    setIsAnalyzingVideo(true);
    onNotify('Analisando Vídeo', 'Lendo resolução, taxa de quadros e duração do arquivo...', 'info');

    try {
      const meta = await extractVideoMetadata(file);
      setVideoMetadata(meta);
      onNotify('Vídeo Analisado!', `${meta.name} (${formatBytes(meta.size)}, ${meta.width}x${meta.height}, ${meta.duration}s)`, 'success');
    } catch (err: any) {
      onNotify('Erro ao Analisar Vídeo', err.message, 'error');
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Copy Lazy Facade Code for YouTube/Vimeo
  const handleCopyVideoFacade = async () => {
    const code = generateLazyVideoFacade(embedProvider, embedVideoId);
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopiedVideoCode(true);
      setTimeout(() => setCopiedVideoCode(false), 2500);
      onNotify('Código de Fachada Copiado!', 'Cole no seu HTML/React para manter PageSpeed 100.', 'success');
    }
  };

  const totalOriginalBytes = imageResults.reduce((acc, r) => acc + r.originalSize, 0);
  const totalCompressedBytes = imageResults.reduce((acc, r) => acc + r.compressedSize, 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const totalPercentSaved = totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
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

      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-cyan-950/50 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                PAGESPEED 100 ACCELERATOR
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                CLIENT-SIDE ULTRA-FAST
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Zap className="w-6 h-6 text-cyan-400" />
              Otimizador de Mídias para Sites & Landing Pages
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Receba imagens e vídeos brutos dos clientes e transforme-os nos formatos mais leves e modernos (<strong>WebP</strong> para imagens, <strong>MP4/WebM otimizado</strong> para vídeos). Garanta carregamento instantâneo no celular e desktop!
            </p>
          </div>

          {/* Quick Tool Links */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <a
              href="https://squoosh.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-cyan-500/60 text-xs text-slate-300 hover:text-white transition-all group"
              title="Squoosh (Google) - Conversor WebP/AVIF offline no navegador"
            >
              <span className="font-semibold text-cyan-300">Squoosh</span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
            </a>
            <a
              href="https://tinypng.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-emerald-500/60 text-xs text-slate-300 hover:text-white transition-all group"
              title="TinyPNG - Compressão em lote de até 20 fotos"
            >
              <span className="font-semibold text-emerald-300">TinyPNG</span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
            </a>
            <a
              href="https://handbrake.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 hover:border-indigo-500/60 text-xs text-slate-300 hover:text-white transition-all group"
              title="HandBrake - Compressor de vídeo de 50MB para 2MB"
            >
              <span className="font-semibold text-indigo-300">HandBrake</span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'images'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Otimizador de Imagens (WebP & Lote)</span>
          {imageResults.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-200 text-[10px]">
              {imageResults.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'videos'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Video className="w-4 h-4 text-indigo-300" />
          <span>Otimizador de Vídeos (HandBrake & Loop)</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Manual PageSpeed 100 (Metas & Ferramentas)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OTIMIZADOR DE IMAGENS (WEBP & LOTE)              */}
      {/* ======================================================== */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Dropzone & Presets Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  Predefinições Rápidas de Otimização
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ajuste automático de resolução e compressão para atingir as metas do PageSpeed.
                </p>
              </div>

              {/* Preset Selector */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPresetType('desktop_hero')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    presetType === 'desktop_hero'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Para imagem de fundo ou hero section (Meta: < 150 KB, max 1920px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop Fundo (Max 1920px &lt;150KB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresetType('mobile_featured')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    presetType === 'mobile_featured'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Para fotos de destaque e celulares (Meta: < 80 KB, max 800px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Foto Destaque / Celular (&lt;80KB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresetType('thumbnail')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    presetType === 'thumbnail'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title="Para cards, serviços e miniaturas (Meta: < 40 KB, max 500px)"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Card / Miniatura (&lt;40KB)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresetType('custom')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    presetType === 'custom'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customizado</span>
                </button>
              </div>
            </div>

            {/* Custom Controls (if Custom selected) */}
            {presetType === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Qualidade WebP:</span>
                    <span className="font-mono text-cyan-400 font-bold">{customQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="1"
                    value={customQuality}
                    onChange={(e) => setCustomQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">Recomendado: 75% a 85% para excelente relação nitidez/peso.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Largura Máxima:</span>
                    <span className="font-mono text-cyan-400 font-bold">{customMaxWidth}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1920, 1200, 800, 600, 400].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setCustomMaxWidth(w)}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold ${
                          customMaxWidth === w ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">Nunca suba imagens acima de 1920px para web.</p>
                </div>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) {
                  handleImageFiles(e.dataTransfer.files);
                }
              }}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-2xl p-8 sm:p-10 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950/90 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageFiles(e.target.files);
                  }
                }}
              />
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Arraste as imagens dos clientes aqui ou clique para selecionar
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                Suporta <strong>PNG, JPG, JPEG, WEBP e AVIF</strong>. Conversão automática e instantânea em lote (até 20 fotos por vez como no TinyPNG).
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Offline e Privado (Processado no seu navegador)
                </span>
                <span className="flex items-center gap-1 text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Converte direto para WebP
                </span>
              </div>
            </div>
          </div>

          {/* Results Summary Bar (if images processed) */}
          {imageResults.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/50 border border-emerald-500/40 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  -{totalPercentSaved}%
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {imageResults.length} imagens convertidas com sucesso
                  </h4>
                  <p className="text-xs text-emerald-300">
                    Peso original: <strong>{formatBytes(totalOriginalBytes)}</strong> ➔ Otimizado: <strong>{formatBytes(totalCompressedBytes)}</strong> (Economia de {formatBytes(totalSavedBytes)})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Todas ({imageResults.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageResults([]);
                    setSelectedImage(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer"
                  title="Limpar lista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Side-by-Side Squoosh Style Comparator for Selected Image */}
          {selectedImage && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">
                    Comparador em Tempo Real (Estilo Squoosh): {selectedImage.originalName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(selectedImage)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar WebP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyPictureHtml(selectedImage)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copiedCodeId === selectedImage.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar Tag &lt;picture&gt;</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Visual Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BEFORE (ORIGINAL) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Antes (Original do Cliente)
                    </span>
                    <span className="text-xs font-mono text-rose-400 font-bold">
                      {formatBytes(selectedImage.originalSize)}
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-xl bg-slate-900/60 overflow-hidden flex items-center justify-center border border-slate-800">
                    <img
                      src={selectedImage.originalDataUrl}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Dimensões: {selectedImage.originalWidth} x {selectedImage.originalHeight}px</span>
                    <span>Formato: {selectedImage.originalFile.type.replace('image/', '').toUpperCase()}</span>
                  </div>
                </div>

                {/* AFTER (OPTIMIZED WEBP) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Depois (WebP Otimizado)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        -{selectedImage.savingsPercent}%
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {formatBytes(selectedImage.compressedSize)}
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-xl bg-slate-900/60 overflow-hidden flex items-center justify-center border border-slate-800">
                    <img
                      src={selectedImage.compressedDataUrl}
                      alt="Otimizada"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                    <span>Dimensões: {selectedImage.compressedWidth} x {selectedImage.compressedHeight}px</span>
                    <span className="text-emerald-400 font-bold">Economizou {formatBytes(selectedImage.savingsBytes)}</span>
                  </div>
                </div>
              </div>

              {/* Status Verdict */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5 text-xs">
                {selectedImage.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="text-slate-300">{selectedImage.statusMessage}</span>
              </div>
            </div>
          )}

          {/* Batch Images List */}
          {imageResults.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Fila de Imagens Processadas ({imageResults.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {imageResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImage(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedImage?.id === item.id
                        ? 'bg-cyan-950/30 border-cyan-500 shadow-md'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border border-slate-800">
                      <img src={item.compressedDataUrl} alt={item.originalName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{item.originalName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <span className="line-through text-slate-500">{formatBytes(item.originalSize)}</span>{' '}
                        ➔ <strong className="text-emerald-400">{formatBytes(item.compressedSize)}</strong>
                      </p>
                      <span className="text-[10px] font-bold text-cyan-400">-{item.savingsPercent}% economia</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors"
                      title="Baixar WebP"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: OTIMIZADOR DE VÍDEOS (HANDBRAKE & LOOP)          */}
      {/* ======================================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Video Purpose Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-indigo-400" />
                Qual o papel do vídeo na sua landing page?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Conforme as regras do PageSpeed, a estratégia muda radicalmente de acordo com a função do vídeo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setVideoPurpose('background_loop')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  videoPurpose === 'background_loop'
                    ? 'bg-gradient-to-br from-indigo-950/60 to-slate-950 border-indigo-500 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Vídeo de Fundo (Loop Curto 5-10s)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                    DIRETO NO SERVIDOR
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para o topo da página (Hero). <strong>Obrigatório:</strong> 5 a 10 segundos no máximo, sem áudio (mute), resolução 720p ou 1080p, peso menor que 3 MB.
                </p>
              </div>

              <div
                onClick={() => setVideoPurpose('long_demo')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  videoPurpose === 'long_demo'
                    ? 'bg-gradient-to-br from-indigo-950/60 to-slate-950 border-indigo-500 shadow-lg'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-400" />
                    Vídeo Longo (Demonstração / Depoimento)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800/40">
                    YOUTUBE / VIMEO LAZY
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para vídeos acima de 15 segundos. <strong>Regra Inegociável:</strong> Nunca hospede direto no servidor! Suba no YouTube/Vimeo e use carregamento sob demanda.
                </p>
              </div>
            </div>
          </div>

          {/* SUB-SECTION 1: BACKGROUND LOOP OPTIMIZATION & HANDBRAKE RECIPE */}
          {videoPurpose === 'background_loop' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* HandBrake Official Recipe Card */}
              <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
                      HB
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Configuração Recomendada no HandBrake</h4>
                      <p className="text-[11px] text-indigo-300">Reduz 50 MB para 2 MB a 5 MB sem perda visual</p>
                    </div>
                  </div>
                  <a
                    href="https://handbrake.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <span>Baixar HandBrake</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">1. Formato & Otimização Web:</span>
                    <p className="text-slate-300">Escolha o formato <strong>MP4</strong> e marque a caixa <strong className="text-cyan-300">"Web Optimized"</strong> (faz o vídeo começar a tocar antes do download total).</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">2. Resolução (Dimensions):</span>
                    <p className="text-slate-300">Defina para <strong>1080p (1920x1080)</strong> ou <strong>720p (1280x720)</strong> se for apenas textura ou fundo desfocado.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">3. Codec & Taxa de Qualidade (Video):</span>
                    <p className="text-slate-300">Codec de vídeo: <strong>H.264</strong> | Framerate: <strong>24 ou 30 fps</strong> | RF (Constant Quality): ajuste entre <strong className="text-emerald-300">24 e 28</strong>.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-white">4. Áudio (Audio Track):</span>
                    <p className="text-slate-300"><strong className="text-rose-400">Remova a faixa de áudio</strong> se for vídeo de fundo. O áudio consome até 40% do tamanho do arquivo desnecessariamente.</p>
                  </div>
                </div>

                {/* FreeConvert Alternative */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white">Prefere não instalar nada?</span>
                    <p className="text-[11px] text-slate-400">Use o FreeConvert no navegador para limitar o tamanho exato em MB.</p>
                  </div>
                  <a
                    href="https://www.freeconvert.com/video-compressor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold shrink-0"
                  >
                    <span>Abrir FreeConvert</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* In-Browser Video Tester / Inspector */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" />
                  Testador & Inspetor de Vídeo Local
                </h4>

                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/60 transition-all group"
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleVideoFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Film className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-white">Carregue o vídeo do cliente para inspecionar</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Verificamos resolução, peso e tempo de duração</p>
                </div>

                {videoMetadata && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-white truncate max-w-xs">{videoMetadata.name}</span>
                      <span className="font-mono text-cyan-400 font-bold">{formatBytes(videoMetadata.size)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                      <div>Resolução: <strong>{videoMetadata.width} x {videoMetadata.height}px</strong></div>
                      <div>Duração: <strong>{videoMetadata.duration} segundos</strong></div>
                      <div>Proporção: <strong>{videoMetadata.aspectRatio}</strong></div>
                      <div>Formato: <strong>{videoMetadata.mimeType}</strong></div>
                    </div>

                    {/* Verdict */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                      {videoMetadata.size > 5 * 1024 * 1024 ? (
                        <p className="text-amber-400 flex items-center gap-1.5 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Arquivo pesado ({formatBytes(videoMetadata.size)}). Passe pelo HandBrake com RF 26 para reduzir para menos de 3 MB.
                        </p>
                      ) : (
                        <p className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          Excelente! O arquivo está dentro do limite seguro para landing pages.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Snippet for Background Video in Landing Pages */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300">Código HTML Recomendado para Vídeo de Fundo:</span>
                  <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto">
{`<video
  autoplay
  muted
  loop
  playsinline
  preload="auto"
  poster="hero-poster.webp"
  class="w-full h-full object-cover"
>
  <source src="background-loop.mp4" type="video/mp4" />
</video>`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SUB-SECTION 2: LONG VIDEO LAZY FACADE (YOUTUBE / VIMEO) */}
          {videoPurpose === 'long_demo' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Gerador de Fachada Leve (YouTube / Vimeo Lazy Facade)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Iframes normais do YouTube adicionam mais de 1.2 MB de scripts e derrubam o PageSpeed para 40. A fachada carrega apenas a imagem estática e só injeta o player quando o usuário clica para assistir!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plataforma:</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEmbedProvider('youtube')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        embedProvider === 'youtube' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmbedProvider('vimeo')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        embedProvider === 'vimeo' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Vimeo
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ID ou Link do Vídeo:</label>
                  <input
                    type="text"
                    value={embedVideoId}
                    onChange={(e) => setEmbedVideoId(e.target.value)}
                    placeholder={embedProvider === 'youtube' ? 'Ex: dQw4w9WgXcQ ou link completo' : 'Ex: 123456789 ou link completo'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Code Preview & Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Código Pronto para Copiar (Nota 100 no PageSpeed):</span>
                  <button
                    type="button"
                    onClick={handleCopyVideoFacade}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    {copiedVideoCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVideoCode ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto max-h-60 scrollbar-thin">
                  {generateLazyVideoFacade(embedProvider, embedVideoId)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REGRAS DE OURO PAGESPEED 100                     */}
      {/* ======================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Guia Rápido de Alta Performance para Landing Pages & Sites
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Siga estas regras inegociáveis para garantir notas 95-100 no Google PageSpeed Insights em celulares e desktops.
              </p>
            </div>

            {/* The 4 Commandments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center text-[10px]">1</span>
                  Limites Rígidos de Resolução
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nunca suba imagens com largura maior que <strong>1920px</strong> para computadores ou <strong>800px</strong> para celulares. O celular não tem resolução suficiente para exibir imagens em 4K e gasta memória RAM e dados móveis do visitante.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center justify-center text-[10px]">2</span>
                  Metas de Peso Máximo por Imagem
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mantenha imagens de fundo abaixo de <strong className="text-white">150 KB</strong> e fotos de destaque abaixo de <strong className="text-white">80 KB</strong>. Converta sempre para <strong>WebP</strong> ou <strong>AVIF</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center justify-center text-[10px]">3</span>
                  Vídeos de Fundo em Loop Curto (5-10s)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Substitua vídeos longos hospedados no servidor por clipes curtos de <strong>5 a 10 segundos em loop</strong>. Remova a faixa de áudio e ative a flag <strong>"Web Optimized"</strong> no HandBrake.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center justify-center text-[10px]">4</span>
                  Carregamento sob Demanda (Lazy Facade)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Se o vídeo for um depoimento ou demonstração com áudio, hospede no <strong>YouTube ou Vimeo</strong> e carregue o player somente no clique do visitante.
                </p>
              </div>
            </div>

            {/* External Tools Summary Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-950 to-indigo-950/40 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Arsenal de Ferramentas Gratuitas Recomendadas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <a
                  href="https://squoosh.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all group block space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-cyan-300">Squoosh.app</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Do Google, 100% grátis e offline no navegador. Comparador visual lado a lado.</p>
                </a>

                <a
                  href="https://tinypng.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group block space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-emerald-300">TinyPNG.com</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Ideal para lote de até 20 fotos com compressão inteligente com transparência.</p>
                </a>

                <a
                  href="https://handbrake.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all group block space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-indigo-300">HandBrake.fr</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Software open-source para PC. Reduz 50 MB para 2 MB com codec H.264 e RF 24-28.</p>
                </a>

                <a
                  href="https://www.freeconvert.com/video-compressor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all group block space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-amber-300">FreeConvert.com</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400">Compressão de vídeo online no navegador definindo o tamanho final desejado em MB.</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
