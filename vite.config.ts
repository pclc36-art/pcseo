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
import { runPageSpeedAnalysis } from './src/server/pageSpeedService.ts';
import { serverAuthStore } from './src/server/authStore.ts';

function parseRequestBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return resolve(JSON.parse(req.body));
      } catch {
        return resolve({});
      }
    }
    if (req.readableEnded) {
      return resolve({});
    }

    let data = '';
    const timeout = setTimeout(() => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    }, 3000);

    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      clearTimeout(timeout);
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      clearTimeout(timeout);
      resolve({});
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

        // ================= GOOGLE PAGESPEED INSIGHTS 9.5+ ENGINE =================
        if (pathname === '/api/pagespeed/analyze') {
          try {
            let targetUrl = '';
            let targetStrategy: 'mobile' | 'desktop' = 'mobile';

            if (req.method === 'GET') {
              const urlObj = new URL(rawUrl, 'http://localhost:3000');
              targetUrl = urlObj.searchParams.get('url') || '';
              targetStrategy = (urlObj.searchParams.get('strategy') === 'desktop' ? 'desktop' : 'mobile') as 'mobile' | 'desktop';
            } else if (req.method === 'POST') {
              const body = await parseRequestBody(req);
              targetUrl = body.url || '';
              targetStrategy = (body.strategy === 'desktop' ? 'desktop' : 'mobile') as 'mobile' | 'desktop';
            }

            if (!targetUrl) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'URL é obrigatória para análise de PageSpeed.' }));
            }

            const analysis = await runPageSpeedAnalysis(targetUrl, targetStrategy);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, data: analysis }));
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
          try {
            const status = await serverAuthStore.getAdminPublicStatus();
            res.statusCode = 200;
            return res.end(JSON.stringify(status));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ hasAdmin: false, error: err.message }));
          }
        }

        // Register the FIRST and ONLY administrator
        if (pathname === '/api/auth/register-master' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = await serverAuthStore.registerMasterAdmin(body);
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
            const result = await serverAuthStore.login(body.email, body.password);
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
            const result = await serverAuthStore.validateSession(body.token);
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
              await serverAuthStore.logout(body.token);
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true }));
          } catch {
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true }));
          }
        }

        // Change password while logged in
        if (pathname === '/api/auth/change-password' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = await serverAuthStore.changePassword(body.token, body.currentPassword, body.newPassword);
            res.statusCode = result.success ? 200 : 400;
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, message: err.message }));
          }
        }

        // Protected reset of system admin
        if (pathname === '/api/auth/reset-system-admin' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const result = await serverAuthStore.resetAdmin({
              token: body?.token,
              currentPassword: body?.currentPassword,
            });
            res.statusCode = result.unauthorized ? 401 : 200;
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

