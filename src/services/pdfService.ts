import { jsPDF } from 'jspdf';
import { Project } from '../types';

export function exportProjectAndPromptPdf(project: Project): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const primaryColor = [15, 23, 42]; // Slate 900
  const accentColor = [14, 165, 233]; // Cyan 500
  const mutedColor = [100, 116, 139]; // Slate 500
  const textColor = [30, 41, 59]; // Slate 800

  // Helper for page break
  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 15) {
      doc.addPage();
      cursorY = margin;
      drawRunningHeader();
    }
  };

  const drawRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(
      `Master Site Prompt Studio • Projeto: ${project.name} • Prompt Mestre 7.0 World-Class`,
      margin,
      10
    );
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // ==================== COVER / HEADER BANNER ====================
  // Top Header Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 38, 3, 3, 'F');

  // Badge
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin + 5, cursorY + 5, 68, 5.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('MASTER SITE PROMPT 7.0 • WORLD-CLASS', margin + 7, cursorY + 9);

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(project.name.toUpperCase(), margin + 5, cursorY + 20);

  // Subtitle / Meta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);
  doc.text(
    `Cliente: ${project.extractedData?.companyName || project.clientName || 'Oficial'} • Tipo: ${project.projectType} • Data: ${new Date().toLocaleDateString('pt-BR')}`,
    margin + 5,
    cursorY + 27
  );

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Framework: ${project.preferredFramework || 'Astro-First'} • Hospedagem: ${project.hostingTarget || 'Hostinger'} • Versão: ${project.masterPromptVersionLabel || 'v7.0'}`,
    margin + 5,
    cursorY + 33
  );

  cursorY += 44;

  // ==================== QUALITY AUDIT EXECUTIVE SUMMARY ====================
  const report = project.qualityReport;
  if (report) {
    checkPageBreak(35);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, cursorY, contentWidth, 28, 2, 2, 'FD');

    // Score box
    const scoreColor = report.score >= 80 ? [16, 185, 129] : [245, 158, 11];
    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.roundedRect(margin + 4, cursorY + 4, 20, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`${report.score}`, margin + 8, cursorY + 15);
    doc.setFontSize(7);
    doc.text('SCORE', margin + 9, cursorY + 20);

    // Score description
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Relatório Executivo de Conformidade & CRO 7.0', margin + 28, cursorY + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(
      `Total de Itens Auditados: ${report.totalChecks} • Confirmados: ${report.confirmedCount} • Pendências Declaradas: ${report.pendingCount}`,
      margin + 28,
      cursorY + 16
    );
    doc.text(
      'Padrão Ouro: Anti-Alucinação Ativo, Diretiva Astro-First, Schema.org LocalBusiness e Mobile-First WCAG 2.2 AA.',
      margin + 28,
      cursorY + 22
    );

    cursorY += 34;
  }

  // ==================== BRIEFING INTELLIGENCE DOSSIER ====================
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. DADOS CONFIRMADOS DO BRIEFING & ESTRATÉGIA COMERCIAL', margin, cursorY);
  cursorY += 2;
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, cursorY, margin + 80, cursorY);
  cursorY += 6;

  const data = project.extractedData;
  const items = [
    { label: 'Segmento / Nicho', value: data?.niche || 'Geral' },
    { label: 'Público-Alvo', value: data?.targetAudience || 'Não informado' },
    {
      label: 'Atendimento & Local',
      value: data?.hasPhysicalLocation ? `Presencial em ${data.address}` : '100% Digital / Remoto (Sem mapa falso)',
    },
    {
      label: 'WhatsApp Oficial',
      value: data?.hasWhatsApp ? `${data.whatsapp} (Link de conversão automatizado)` : 'Não informado (Sem invenção)',
    },
    {
      label: 'Serviços Principais',
      value: (data?.services || []).slice(0, 5).join('; ') || 'Conforme briefing',
    },
    {
      label: 'Diferenciais Competitivos',
      value: (data?.differentials || []).join('; ') || 'Qualidade e atendimento exclusivo',
    },
  ];

  items.forEach((item) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(`• ${item.label}:`, margin, cursorY);

    const labelWidth = doc.getTextWidth(`• ${item.label}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);

    const splitVal = doc.splitTextToSize(item.value, contentWidth - labelWidth);
    doc.text(splitVal, margin + labelWidth, cursorY);
    cursorY += splitVal.length * 4 + 1.5;
  });

  cursorY += 5;

  // ==================== FULL MASTER PROMPT CONTENT ====================
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('2. PROMPT ESTRATÉGICO INTEGRAL (PRONTO PARA CLAUDE / CHATGPT / CURSOR)', margin, cursorY);
  cursorY += 2;
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, cursorY, margin + 110, cursorY);
  cursorY += 6;

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  const promptLines = project.finalPrompt.split('\n');

  for (let i = 0; i < promptLines.length; i++) {
    const rawLine = promptLines[i];

    // Check if line is a major separator
    if (rawLine.startsWith('===') || rawLine.startsWith('---')) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(rawLine.slice(0, 85), margin, cursorY);
      cursorY += 4;
      doc.setFont('courier', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      continue;
    }

    if (!rawLine.trim()) {
      cursorY += 2.5;
      checkPageBreak(4);
      continue;
    }

    const wrappedLines = doc.splitTextToSize(rawLine, contentWidth);
    checkPageBreak(wrappedLines.length * 3.4);

    for (const subLine of wrappedLines) {
      doc.text(subLine, margin, cursorY);
      cursorY += 3.4;
    }
  }

  // ==================== FOOTER WITH PAGE NUMBERS ====================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text(
      `Master Site Prompt Studio • Master Prompt 7.0 World-Class Engine`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Página ${p} de ${totalPages}`,
      pageWidth - margin - 22,
      pageHeight - 8
    );
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
  }

  // Download PDF
  const safeFilename = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_prompt_mestre_7_0.pdf`;
  doc.save(safeFilename);
}
