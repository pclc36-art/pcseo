// Service to generate a standalone, responsive, interactive HTML questionnaire
// Clients can open this file on any phone or desktop, fill out their responses,
// and send directly to WhatsApp 86 99498-8349 (5586994988349) or export back to the platform.
// Strictly formatted WITHOUT asterisks (*), WITHOUT hand pointers (👉), and WITHOUT helper prefixes.

import { QuestionnaireTemplate } from '../data/questionnaires';

export const TARGET_WHATSAPP_NUMBER = '5586994988349';
export const TARGET_WHATSAPP_DISPLAY = '(86) 99498-8349';

export function generateClientQuestionnaireHtml(template: QuestionnaireTemplate): string {
  const serializedTemplate = JSON.stringify({
    id: template.id,
    title: template.title,
    subtitle: template.subtitle,
    categoryTitle: template.categoryTitle,
    sampleBusinessName: template.sampleBusinessName,
    questions: template.questions.map((q) => ({
      id: q.id,
      number: q.number,
      section: q.section,
      question: q.question,
      helperText: q.helperText,
    })),
  });

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Questionário Estratégico — ${escapeHtml(template.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --card-border: #1e293b;
      --primary: #06b6d4;
      --primary-hover: #0891b2;
      --accent: #6366f1;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --whatsapp: #25d366;
      --whatsapp-hover: #20ba5a;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text-main);
      line-height: 1.6;
      padding: 24px 16px 120px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      width: 100%;
      max-width: 780px;
    }
    header {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85));
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 32px 28px;
      margin-bottom: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }
    header::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 6px 12px;
      border-radius: 9999px;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      color: #38bdf8;
      margin-bottom: 14px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .client-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.6);
      border-radius: 16px;
      padding: 20px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
    @media (max-width: 600px) {
      .client-card {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 12px;
      font-weight: 600;
      color: #cbd5e1;
    }
    input[type="text"], input[type="tel"] {
      background: #020617;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 10px 14px;
      color: #f8fafc;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      transition: all 0.2s;
    }
    input[type="text"]:focus, input[type="tel"]:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
    }
    .progress-bar-container {
      background: #020617;
      border: 1px solid #334155;
      border-radius: 9999px;
      height: 10px;
      overflow: hidden;
      margin-top: 24px;
      position: relative;
    }
    .progress-bar-fill {
      background: linear-gradient(90deg, #06b6d4, #6366f1);
      height: 100%;
      width: 0%;
      transition: width 0.3s ease;
    }
    .progress-text {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 6px;
      font-weight: 600;
    }

    /* Sections */
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 36px 0 16px;
      padding-left: 8px;
      border-left: 3px solid var(--primary);
    }
    .question-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 22px 20px;
      margin-bottom: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .question-card:focus-within {
      border-color: rgba(6, 182, 212, 0.5);
      box-shadow: 0 8px 24px rgba(6, 182, 212, 0.08);
    }
    .q-header {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .q-num {
      background: rgba(6, 182, 212, 0.15);
      color: #38bdf8;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 8px;
      border: 1px solid rgba(6, 182, 212, 0.3);
      font-family: 'JetBrains Mono', monospace;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .q-text {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.4;
    }
    .q-hint {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 12px;
      margin-left: 36px;
      line-height: 1.45;
    }
    textarea {
      width: 100%;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 12px 14px;
      color: #f8fafc;
      font-size: 14px;
      font-family: inherit;
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
      outline: none;
      transition: all 0.2s;
    }
    textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2);
    }

    /* Fixed Bottom Action Dock */
    .action-dock {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border-top: 1px solid #334155;
      padding: 14px 20px;
      display: flex;
      justify-content: center;
      z-index: 100;
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.5);
    }
    .dock-content {
      width: 100%;
      max-width: 780px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      justify-content: space-between;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn-whatsapp {
      background: var(--whatsapp);
      color: #052e16;
      flex: 2;
      min-width: 260px;
      font-size: 14px;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
    }
    .btn-whatsapp:hover {
      background: var(--whatsapp-hover);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      flex: 1;
      min-width: 140px;
    }
    .btn-secondary:hover {
      background: #334155;
      color: #ffffff;
    }

    /* Success / Toast Notification */
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #065f46;
      color: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      display: none;
      z-index: 200;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="toast" id="toastMsg">Mensagem copiada com sucesso!</div>

  <div class="container">
    <header>
      <div class="badge">Questionário Oficial • Resposta Estratégica</div>
      <h1>${escapeHtml(template.title)}</h1>
      <p class="subtitle">${escapeHtml(template.subtitle)} — Responda com suas informações para montarmos o projeto completo do seu site e perfil no Google.</p>

      <div class="client-card">
        <div class="form-group">
          <label>Seu Nome Completo:</label>
          <input type="text" id="clientName" placeholder="Ex: Roberto Alves" />
        </div>
        <div class="form-group">
          <label>Nome da Empresa ou Clínica:</label>
          <input type="text" id="businessName" placeholder="Ex: ${escapeHtml(template.sampleBusinessName)}" />
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-fill" id="progressBar"></div>
      </div>
      <div class="progress-text">
        <span id="progressCount">0 de ${template.questions.length} respondidas</span>
        <span id="progressPercent">0% concluído</span>
      </div>
    </header>

    <main id="questionsContainer"></main>
  </div>

  <div class="action-dock">
    <div class="dock-content">
      <button class="btn btn-whatsapp" id="btnSendWhatsapp" type="button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 0 1-5.82 2.41h-.01c-1.49 0-2.96-.4-4.24-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.216 8.216 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.25-8.24zm4.52 11.66c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.74 2.65 4.21 3.72.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.59.2-1.09.14-1.18-.05-.09-.22-.16-.47-.28z"/>
        </svg>
        Enviar Respondido p/ WhatsApp
      </button>

      <button class="btn btn-secondary" id="btnCopyClean" type="button">
        Copiar Respostas
      </button>

      <button class="btn btn-secondary" id="btnDownloadJson" type="button">
        Baixar Arquivo
      </button>
    </div>
  </div>

  <script>
    const templateData = ${serializedTemplate};
    const targetWhatsApp = "${TARGET_WHATSAPP_NUMBER}";
    const answers = {};

    function showToast(msg) {
      const toast = document.getElementById('toastMsg');
      toast.textContent = msg;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }

    // Render questions grouped by section
    const container = document.getElementById('questionsContainer');
    const sections = {};
    templateData.questions.forEach(q => {
      if (!sections[q.section]) {
        sections[q.section] = [];
      }
      sections[q.section].push(q);
    });

    Object.entries(sections).forEach(([secName, list]) => {
      const secHeader = document.createElement('div');
      secHeader.className = 'section-title';
      secHeader.textContent = secName;
      container.appendChild(secHeader);

      list.forEach(q => {
        const card = document.createElement('div');
        card.className = 'question-card';

        const qHeader = document.createElement('div');
        qHeader.className = 'q-header';
        qHeader.innerHTML = '<span class="q-num">' + q.number + '</span><span class="q-text">' + escapeHtml(q.question) + '</span>';
        card.appendChild(qHeader);

        if (q.helperText) {
          const hint = document.createElement('div');
          hint.className = 'q-hint';
          hint.textContent = q.helperText;
          card.appendChild(hint);
        }

        const ta = document.createElement('textarea');
        ta.placeholder = 'Digite sua resposta aqui...';
        ta.dataset.qid = q.id;
        ta.addEventListener('input', (e) => {
          answers[q.id] = e.target.value;
          updateProgress();
        });
        card.appendChild(ta);

        container.appendChild(card);
      });
    });

    function updateProgress() {
      const total = templateData.questions.length;
      const answered = Object.values(answers).filter(val => val && val.trim().length > 0).length;
      const pct = Math.round((answered / total) * 100);
      document.getElementById('progressBar').style.width = pct + '%';
      document.getElementById('progressCount').textContent = answered + ' de ' + total + ' respondidas';
      document.getElementById('progressPercent').textContent = pct + '% concluído';
    }

    // STRICT CLEAN TEXT FORMATTER (No asterisks, no hands, strictly question and answer)
    function buildCleanTextOutput() {
      const client = document.getElementById('clientName').value.trim() || 'Não informado';
      const business = document.getElementById('businessName').value.trim() || templateData.sampleBusinessName || 'Não informado';

      let out = 'QUESTIONÁRIO ESTRATÉGICO: ' + templateData.title.toUpperCase() + '\\n';
      out += 'Cliente: ' + client + '\\n';
      out += 'Empresa: ' + business + '\\n';
      out += 'Total de Perguntas: ' + templateData.questions.length + '\\n\\n';

      templateData.questions.forEach(q => {
        out += q.number + '. ' + q.question + '\\n';
        const ans = (answers[q.id] || '').trim();
        if (ans) {
          out += ans + '\\n\\n';
        } else {
          out += '[Não respondido]' + '\\n\\n';
        }
      });

      return out;
    }

    // Send to WhatsApp Button
    document.getElementById('btnSendWhatsapp').addEventListener('click', () => {
      const text = buildCleanTextOutput();
      const encoded = encodeURIComponent(text);
      const url = 'https://api.whatsapp.com/send?phone=' + targetWhatsApp + '&text=' + encoded;
      
      // If text is super long (exceeds ~2000 chars), copy to clipboard first to ensure no URL truncation
      if (text.length > 1800) {
        copyTextToClipboard(text);
        showToast('Texto copiado! Abrindo WhatsApp...');
      }
      window.open(url, '_blank');
    });

    // Copy Clean Button
    document.getElementById('btnCopyClean').addEventListener('click', () => {
      const text = buildCleanTextOutput();
      copyTextToClipboard(text);
      showToast('Respostas copiadas sem asteriscos ou formatações!');
    });

    // Download JSON Button (compatible with Platform Import)
    document.getElementById('btnDownloadJson').addEventListener('click', () => {
      const client = document.getElementById('clientName').value.trim() || 'Cliente';
      const business = document.getElementById('businessName').value.trim() || templateData.sampleBusinessName;
      const payload = {
        templateId: templateData.id,
        templateTitle: templateData.title,
        clientName: client,
        businessName: business,
        submittedAt: new Date().toISOString(),
        answers: answers,
        cleanText: buildCleanTextOutput()
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'questionario_respondido_' + templateData.id + '.json';
      a.click();
      showToast('Arquivo baixado! Envie para o administrador.');
    });

    function copyTextToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    }

    function fallbackCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
