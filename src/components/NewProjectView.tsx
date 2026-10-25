import React, { useState } from 'react';
import {
  FileCode2,
  Upload,
  Sparkles,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Building2,
  Wand2,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { HostingTarget, ProjectType, TargetPlatform, TestScenario } from '../types';
import { TEST_SCENARIOS } from '../data/testScenarios';

interface NewProjectViewProps {
  onAnalyze: (formData: {
    name: string;
    clientName: string;
    projectType: ProjectType;
    targetPlatform: TargetPlatform;
    hostingTarget: HostingTarget;
    preferredFramework: string;
    questionnaire: string;
    additionalNotes: string;
  }) => void;
  isAnalyzing: boolean;
  onBack?: () => void;
  initialValues?: {
    name?: string;
    clientName?: string;
    projectType?: ProjectType;
    targetPlatform?: TargetPlatform;
    hostingTarget?: HostingTarget;
    preferredFramework?: string;
    questionnaire?: string;
    additionalNotes?: string;
  };
}

export const NewProjectView: React.FC<NewProjectViewProps> = ({
  onAnalyze,
  isAnalyzing,
  onBack,
  initialValues,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [clientName, setClientName] = useState(initialValues?.clientName || '');
  const [projectType, setProjectType] = useState<ProjectType>(initialValues?.projectType || 'landing_page');
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>(initialValues?.targetPlatform || 'ai_site_builder');
  const [hostingTarget, setHostingTarget] = useState<HostingTarget>(initialValues?.hostingTarget || 'hostinger_static');
  const [preferredFramework, setPreferredFramework] = useState(initialValues?.preferredFramework || 'Astro (Astro-First)');
  const [questionnaire, setQuestionnaire] = useState(initialValues?.questionnaire || '');
  const [additionalNotes, setAdditionalNotes] = useState(initialValues?.additionalNotes || '');
  const [errorMsg, setErrorMsg] = useState('');

  const projectTypes: { value: ProjectType; label: string; desc: string }[] = [
    { value: 'landing_page', label: 'Landing page', desc: 'Foco exclusivo em conversão direta de uma oferta única' },
    { value: 'institutional', label: 'Site institucional', desc: 'Apresentação corporativa multipágina com história e setores' },
    { value: 'professional', label: 'Site profissional', desc: 'Para profissionais liberais (advogados, consultores, peritos)' },
    { value: 'service_page', label: 'Página de serviço', desc: 'Página individual detalhada dedicada a um único serviço de alto valor' },
    { value: 'clinic', label: 'Site para clínica', desc: 'Odontologia, medicina, estética com foco em acolhimento e agendamento' },
    { value: 'local_business', label: 'Site para empresa local', desc: 'Foco em raio geográfico, endereço, WhatsApp e rota' },
    { value: 'ecommerce', label: 'E-commerce', desc: 'Catálogo de produtos físicos ou digitais com checkout' },
    { value: 'portfolio', label: 'Portfólio', desc: 'Arquitetura, design, fotografia com foco visual' },
    { value: 'other', label: 'Outro', desc: 'Estrutura personalizada' },
  ];

  const targetPlatforms: { value: TargetPlatform; label: string }[] = [
    { value: 'ai_site_builder', label: 'Ferramenta de criação de sites com IA (Claude, v0, Bolt, Lovable)' },
    { value: 'code_generator', label: 'Gerador de código (Cursor, Windsurf, Copilot, GitHub)' },
    { value: 'visual_builder', label: 'Construtor visual (Webflow, WordPress, Framer)' },
    { value: 'other', label: 'Outra ferramenta' },
    { value: 'unspecified', label: 'Não definido' },
  ];

  const hostingOptions: { value: HostingTarget; label: string; desc: string }[] = [
    {
      value: 'hostinger_static',
      label: 'Hostinger (Hospedagem Compartilhada / Arquivos Estáticos — Recomendado)',
      desc: 'Build estático (dist/) para pasta public_html sem requerer Node.js contínuo',
    },
    {
      value: 'hostinger_vps',
      label: 'Hostinger (Cloud / VPS / Node.js)',
      desc: 'Para projetos com SSR, APIs dinâmicas ou backend em container',
    },
    {
      value: 'vercel_netlify',
      label: 'Vercel / Netlify',
      desc: 'Deploy automatizado via Git com edge caching',
    },
    {
      value: 'cloudflare_pages',
      label: 'Cloudflare Pages',
      desc: 'Distribuição global ultrarrápida de arquivos estáticos',
    },
    {
      value: 'other_static',
      label: 'Servidor Próprio / Outra Hospedagem Estática',
      desc: 'Apache, Nginx ou qualquer servidor web tradicional',
    },
  ];

  // Load a test scenario
  const handleLoadScenario = (sc: TestScenario) => {
    setName(sc.name);
    setProjectType(sc.projectType);
    setTargetPlatform(sc.targetPlatform);
    if (sc.hostingTarget) setHostingTarget(sc.hostingTarget);
    if (sc.preferredFramework) setPreferredFramework(sc.preferredFramework);
    setQuestionnaire(sc.questionnaire);
    setAdditionalNotes(sc.notes);
    setErrorMsg('');
  };

  // File upload handler (TXT, MD, DOCX text, JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setQuestionnaire(content);
        if (!name) {
          const autoName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' ');
          setName(`Projeto ${autoName}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome do projeto é obrigatório.');
      return;
    }
    if (!questionnaire.trim()) {
      setErrorMsg('Por favor, cole o questionário respondido pelo cliente.');
      return;
    }
    setErrorMsg('');
    onAnalyze({
      name: name.trim(),
      clientName: clientName.trim(),
      projectType,
      targetPlatform,
      hostingTarget,
      preferredFramework,
      questionnaire: questionnaire.trim(),
      additionalNotes: additionalNotes.trim(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
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
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <FileCode2 className="w-6 h-6 text-cyan-400" />
          <span>Novo Projeto de Site / Landing Page</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Preencha os dados básicos e cole o questionário do cliente. O sistema identificará
          automaticamente as informações, dados ausentes e regras aplicáveis.
        </p>
      </div>

      {/* Test Scenarios Presets Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Testar com briefing oficial:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEST_SCENARIOS.map((sc, i) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleLoadScenario(sc)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all cursor-pointer"
              >
                Cenário {i + 1} ({sc.projectType === 'landing_page' ? 'Local' : sc.projectType === 'service_page' ? 'Remoto' : 'Lacunas'})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Basic Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Project Name (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Nome do Projeto <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Landing Page Dra. Camila Ramos"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Client Name (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Nome do Cliente / Empresa</span>
              <span className="text-[10px] text-slate-500 font-normal">Opcional (se ausente)</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Dra. Camila Ramos Odontologia"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* Project Type & Target Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Project Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Tipo de Projeto</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white transition-colors"
            >
              {projectTypes.map((pt) => (
                <option key={pt.value} value={pt.value}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Platform */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Ferramenta de Destino</label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value as TargetPlatform)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white transition-colors"
            >
              {targetPlatforms.map((tp) => (
                <option key={tp.value} value={tp.value}>
                  {tp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Architecture & Hosting Grid (Astro-First Module) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-cyan-500/20 bg-slate-900/40">
          {/* Hosting Target */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Ambiente de Hospedagem</span>
              <span className="text-[10px] text-cyan-400 font-mono">Hostinger Ready</span>
            </label>
            <select
              value={hostingTarget}
              onChange={(e) => setHostingTarget(e.target.value as HostingTarget)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white transition-colors"
            >
              {hostingOptions.map((ho) => (
                <option key={ho.value} value={ho.value}>
                  {ho.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              {hostingOptions.find((h) => h.value === hostingTarget)?.desc}
            </p>
          </div>

          {/* Preferred Framework (Astro-First) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Framework Arquitetural</span>
              <span className="text-[10px] text-emerald-400 font-mono">Astro-First</span>
            </label>
            <input
              type="text"
              value={preferredFramework}
              onChange={(e) => setPreferredFramework(e.target.value)}
              placeholder="Astro (Astro-First)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white transition-colors"
            />
            <p className="text-[11px] text-slate-500">
              Padrão obrigatório: Astro com zero-JS e SSG para velocidade máxima, SEO e deploy estático.
            </p>
          </div>
        </div>

        {/* Questionnaire Textarea with File Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              Questionário Respondido pelo Cliente <span className="text-cyan-400">*</span>
            </label>

            {/* Upload File Input */}
            <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors border border-slate-700">
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar arquivo (TXT, MD)</span>
              <input
                type="file"
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            required
            rows={12}
            value={questionnaire}
            onChange={(e) => setQuestionnaire(e.target.value)}
            placeholder="Cole aqui o questionário completo do cliente tal como foi recebido por WhatsApp, e-mail, formulário ou documento. Exemplo:

1. Nome da empresa: ...
2. Serviços oferecidos: ...
3. Público-alvo: ...
4. WhatsApp e Endereço: ..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono text-slate-200 placeholder-slate-600 transition-colors leading-relaxed"
          />
          <p className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Suporta perguntas numeradas, respostas em tópicos, conversas de WhatsApp e formatos mistos.
            </span>
            <span>{questionnaire.length.toLocaleString()} caracteres</span>
          </p>
        </div>

        {/* Additional Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Observações Adicionais do Projeto</span>
            <span className="text-[10px] text-slate-500 font-normal">Opcional</span>
          </label>
          <textarea
            rows={3}
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Instruções específicas para este cliente (ex: dar foco no scanner 3D, evitar cor preta no fundo, destacar que o atendimento é exclusivamente com hora marcada)..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 transition-colors"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="submit"
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-600/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analisando questionário com IA...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Analisar Questionário</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
