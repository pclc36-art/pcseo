import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { 
  checkServerHealth, 
  analyzeWithGemini,
  analyzeGbpQuestionnaireWithGemini,
  generateGbpDossierWithGemini,
  auditGbpProfileWithGemini,
  auditSiteWithGemini,
  generatePitchWithGemini,
  solveObjectionWithGemini
} from './src/server/api.ts';
import { serverAuthStore } from './src/server/authStore.ts';

function parseRequestBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const pathname = rawUrl.split('?')[0];
        if (!pathname.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/health' && req.method === 'GET') {
          const health = checkServerHealth();
          res.statusCode = 200;
          return res.end(JSON.stringify(health));
        }

        if (pathname === '/api/analyze' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const { questionnaire, projectName, clientName, projectType, additionalNotes } = body;
            const geminiResult = await analyzeWithGemini(
              questionnaire,
              projectName,
              clientName,
              projectType,
              additionalNotes
            );

            if (geminiResult) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, data: geminiResult, source: 'gemini' }));
            } else {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'API key not configured or fallback required' }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        if (pathname === '/api/gbp/analyze-questionnaire' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const { rawText } = body;
            const result = await analyzeGbpQuestionnaireWithGemini(rawText || '');
            if (result) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, data: result, source: 'gemini' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'Fallback to heuristic generator' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        if (pathname === '/api/gbp/generate-dossier' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const { questionnaire } = body;
            const result = await generateGbpDossierWithGemini(questionnaire);
            if (result) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, data: result, source: 'gemini' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'Fallback to heuristic generator' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        if (pathname === '/api/gbp/audit-profile' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const { auditRequest } = body;
            const result = await auditGbpProfileWithGemini(auditRequest);
            if (result) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, data: result, source: 'gemini' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'Fallback to heuristic auditor' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // Site Auditor with Gemini
        if (pathname === '/api/audit-site' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const { url, niche, targetObjective } = body;
            const geminiResult = await auditSiteWithGemini({ url, niche, targetObjective });
            if (geminiResult) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, report: geminiResult, source: 'gemini' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'Fallback to heuristic auditor' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // ================= SALES CLOSER & OBJECTION SOLVER ENDPOINTS =================
        if (pathname === '/api/sales/generate-pitch' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = await generatePitchWithGemini(body);
            if (result) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, data: result, source: 'gemini' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'Fallback to heuristic generator' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        if (pathname === '/api/sales/solve-objection' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = await solveObjectionWithGemini(body);
            if (result) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, data: result, source: 'gemini' }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: false, source: 'heuristic', message: 'Fallback to heuristic solver' }));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // ================= AUTHENTICATION & MASTER ADMIN ENDPOINTS =================
        // Status: is admin registered?
        if (pathname === '/api/auth/status' && req.method === 'GET') {
          const hasAdmin = serverAuthStore.hasAdmin();
          const adminInfo = serverAuthStore.getAdminSafe();
          res.statusCode = 200;
          return res.end(JSON.stringify({
            hasAdmin,
            adminEmail: adminInfo?.email || null,
            adminName: adminInfo?.name || null,
            createdAt: adminInfo?.createdAt || null,
          }));
        }

        // Register the FIRST and ONLY administrator
        if (pathname === '/api/auth/register-master' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = serverAuthStore.registerMasterAdmin(body);
            res.statusCode = result.success ? 200 : 400;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // Login as master administrator
        if (pathname === '/api/auth/login' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = serverAuthStore.login(body.email, body.password);
            res.statusCode = result.success ? 200 : 401;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // Verify active session token
        if (pathname === '/api/auth/verify-session' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = serverAuthStore.validateSession(body.token);
            res.statusCode = 200;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ valid: false, message: err.message }));
          }
        }

        // Logout
        if (pathname === '/api/auth/logout' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            if (body.token) {
              serverAuthStore.logout(body.token);
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true }));
          } catch {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true }));
          }
        }

        // Request password recovery
        if (pathname === '/api/auth/recovery/request' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = serverAuthStore.requestPasswordRecovery(body.email);
            res.statusCode = result.success ? 200 : 400;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // Reset password with recovery token
        if (pathname === '/api/auth/recovery/reset' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = serverAuthStore.resetPasswordWithToken(body.token, body.newPassword);
            res.statusCode = result.success ? 200 : 400;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // Change password while logged in
        if (pathname === '/api/auth/change-password' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = serverAuthStore.changePassword(body.token, body.currentPassword, body.newPassword);
            res.statusCode = result.success ? 200 : 400;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // Emergency / User-requested reset of system admin
        if (pathname === '/api/auth/reset-system-admin' && req.method === 'POST') {
          try {
            const result = serverAuthStore.resetAdmin();
            res.statusCode = 200;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        return next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

