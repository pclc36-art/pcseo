import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  checkServerHealth, 
  analyzeWithGemini, 
  auditSiteWithGemini,
  scrapeSiteHtmlPreview,
  analyzeGbpQuestionnaireWithGemini,
  generateGbpDossierWithGemini,
  auditGbpProfileWithGemini,
  generatePitchWithGemini,
  solveObjectionWithGemini,
} from './src/server/api';
import { serverAuthStore } from './src/server/authStore';
import { runPageSpeedAnalysis } from './src/server/pageSpeedService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = checkServerHealth();
  res.json(health);
});

// Questionnaire analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { questionnaire, projectName, clientName, projectType, additionalNotes } = req.body;
    const geminiResult = await analyzeWithGemini(
      questionnaire,
      projectName,
      clientName,
      projectType,
      additionalNotes
    );

    if (geminiResult) {
      return res.json({ success: true, data: geminiResult, source: 'gemini' });
    } else {
      return res.json({ success: false, source: 'heuristic', message: 'API key not configured or fallback required' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GBP Endpoints
app.post('/api/gbp/analyze-questionnaire', async (req, res) => {
  try {
    const { rawText } = req.body;
    const result = await analyzeGbpQuestionnaireWithGemini(rawText || '');
    if (result) {
      return res.json({ success: true, data: result, source: 'gemini' });
    }
    return res.json({ success: false, source: 'heuristic', message: 'Fallback to heuristic generator' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gbp/generate-dossier', async (req, res) => {
  try {
    const { questionnaire } = req.body;
    const result = await generateGbpDossierWithGemini(questionnaire);
    if (result) {
      return res.json({ success: true, data: result, source: 'gemini' });
    }
    return res.json({ success: false, source: 'heuristic', message: 'Fallback to heuristic generator' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/gbp/audit-profile', async (req, res) => {
  try {
    const { auditRequest } = req.body;
    const result = await auditGbpProfileWithGemini(auditRequest);
    if (result) {
      return res.json({ success: true, data: result, source: 'gemini' });
    }
    return res.json({ success: false, source: 'heuristic', message: 'Fallback to heuristic auditor' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Website Link Audit based on Master Site Engine 10.0
app.post('/api/audit-site', async (req, res) => {
  try {
    const { url, niche, targetObjective } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL do site é obrigatória.' });
    }

    // Always extract real client images and business info first, even if Gemini key is absent
    const scrapedData = await scrapeSiteHtmlPreview(url);
    const geminiReport = await auditSiteWithGemini({ url, niche, targetObjective }, scrapedData);
    if (geminiReport) {
      return res.json({ success: true, report: geminiReport, scrapedData, source: 'gemini' });
    } else {
      return res.json({
        success: false,
        scrapedData,
        source: 'heuristic',
        message: 'Fallback to client heuristic engine with live scraped data',
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Google PageSpeed Insights & Performance 9.5+ Live Engine
app.get('/api/pagespeed/analyze', async (req, res) => {
  try {
    const rawUrl = (req.query.url as string) || '';
    const strategy = ((req.query.strategy as string) === 'desktop' ? 'desktop' : 'mobile') as 'mobile' | 'desktop';
    if (!rawUrl) {
      return res.status(400).json({ success: false, error: 'URL é obrigatória para análise de PageSpeed.' });
    }
    const result = await runPageSpeedAnalysis(rawUrl, strategy);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/pagespeed/analyze', async (req, res) => {
  try {
    const { url, strategy } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL é obrigatória para análise de PageSpeed.' });
    }
    const strat = (strategy === 'desktop' ? 'desktop' : 'mobile') as 'mobile' | 'desktop';
    const result = await runPageSpeedAnalysis(url, strat);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Sales Closer & Objection Solver Endpoints
app.post('/api/sales/generate-pitch', async (req, res) => {
  try {
    const result = await generatePitchWithGemini(req.body);
    if (result) {
      return res.json({ success: true, data: result, source: 'gemini' });
    }
    return res.json({ success: false, source: 'heuristic', message: 'Fallback to heuristic generator' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sales/solve-objection', async (req, res) => {
  try {
    const result = await solveObjectionWithGemini(req.body);
    if (result) {
      return res.json({ success: true, data: result, source: 'gemini' });
    }
    return res.json({ success: false, source: 'heuristic', message: 'Fallback to heuristic solver' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ================= AUTHENTICATION & MASTER ADMIN ENDPOINTS =================
// Status: is admin registered?
app.get('/api/auth/status', async (req, res) => {
  try {
    const status = await serverAuthStore.getAdminPublicStatus();
    return res.json(status);
  } catch (err: any) {
    return res.status(500).json({ hasAdmin: false, error: err.message });
  }
});

// Register the FIRST and ONLY administrator
app.post('/api/auth/register-master', async (req, res) => {
  try {
    const result = await serverAuthStore.registerMasterAdmin(req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Login as master administrator
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await serverAuthStore.login(email, password);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify active session token
app.post('/api/auth/verify-session', async (req, res) => {
  try {
    const { token } = req.body;
    const result = await serverAuthStore.validateSession(token);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ valid: false, message: err.message });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      await serverAuthStore.logout(token);
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});

// Change password while logged in
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;
    const result = await serverAuthStore.changePassword(token, currentPassword, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Protected reset of system admin (requires active session + password)
app.post('/api/auth/reset-system-admin', async (req, res) => {
  try {
    const { token, currentPassword } = req.body || {};
    const result = await serverAuthStore.resetAdmin({ token, currentPassword });
    return res.status(result.unauthorized ? 401 : 200).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Serve static frontend files from dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(200).send('Master Site Prompt Studio Server is running. Frontend build files are generating...');
  });
}

app.listen(port, () => {
  console.log(`Master Site Prompt Studio server listening on port ${port}`);
});

