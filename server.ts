import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { checkServerHealth, analyzeWithGemini, auditSiteWithGemini } from './src/server/api';

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

// Website Link Audit based on Master Prompt 2.1
app.post('/api/audit-site', async (req, res) => {
  try {
    const { url, niche, targetObjective } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL do site é obrigatória.' });
    }

    const geminiReport = await auditSiteWithGemini({ url, niche, targetObjective });
    if (geminiReport) {
      return res.json({ success: true, report: geminiReport, source: 'gemini' });
    } else {
      return res.json({ success: false, source: 'heuristic', message: 'Fallback to client heuristic engine' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

import { serverAuthStore } from './src/server/authStore';

// ================= AUTHENTICATION & MASTER ADMIN ENDPOINTS =================
// Status: is admin registered?
app.get('/api/auth/status', (req, res) => {
  const hasAdmin = serverAuthStore.hasAdmin();
  const adminInfo = serverAuthStore.getAdminSafe();
  return res.json({
    hasAdmin,
    adminEmail: adminInfo?.email || null,
    adminName: adminInfo?.name || null,
    createdAt: adminInfo?.createdAt || null,
  });
});

// Register the FIRST and ONLY administrator
app.post('/api/auth/register-master', (req, res) => {
  try {
    const result = serverAuthStore.registerMasterAdmin(req.body);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Login as master administrator
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = serverAuthStore.login(email, password);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Verify active session token
app.post('/api/auth/verify-session', (req, res) => {
  try {
    const { token } = req.body;
    const result = serverAuthStore.validateSession(token);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ valid: false, message: err.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const { token } = req.body;
    if (token) {
      serverAuthStore.logout(token);
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: true });
  }
});

// Request password recovery
app.post('/api/auth/recovery/request', (req, res) => {
  try {
    const { email } = req.body;
    const result = serverAuthStore.requestPasswordRecovery(email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Reset password with recovery token
app.post('/api/auth/recovery/reset', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = serverAuthStore.resetPasswordWithToken(token, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Change password while logged in
app.post('/api/auth/change-password', (req, res) => {
  try {
    const { token, currentPassword, newPassword } = req.body;
    const result = serverAuthStore.changePassword(token, currentPassword, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Emergency / User-requested reset of system admin
app.post('/api/auth/reset-system-admin', (req, res) => {
  try {
    const result = serverAuthStore.resetAdmin();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Serve static frontend files from dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Master Site Prompt Studio server listening on port ${port}`);
});
