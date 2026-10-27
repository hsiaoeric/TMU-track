import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { 
  summarizeWithGemini, 
  processLineWebhook, 
  setChannelAccessToken, 
  getChannelAccessToken,
  testBotConnection
} from './src/server/apiHandler';

function tmuApiPlugin(): Plugin {
  return {
    name: 'tmu-line-bot-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body
        let bodyText = '';
        req.on('data', (chunk) => {
          bodyText += chunk;
        });

        req.on('end', async () => {
          let body: any = {};
          if (bodyText) {
            try {
              body = JSON.parse(bodyText);
            } catch {
              // ignore
            }
          }

          res.setHeader('Content-Type', 'application/json');

          if (req.url === '/api/health') {
            res.statusCode = 200;
            return res.end(JSON.stringify({ status: 'ok', service: 'TMU LINE Bot Hub' }));
          }

          if (req.url === '/api/line/test-connection') {
            const result = await testBotConnection();
            res.statusCode = 200;
            return res.end(JSON.stringify(result));
          }

          if (req.url === '/api/line/config') {
            if (req.method === 'POST') {
              if (body.channelAccessToken !== undefined) {
                setChannelAccessToken(body.channelAccessToken);
              }
              res.statusCode = 200;
              return res.end(JSON.stringify({ 
                success: true, 
                hasToken: Boolean(getChannelAccessToken()),
                tokenSnippet: getChannelAccessToken() ? `${getChannelAccessToken().slice(0, 8)}...` : '' 
              }));
            }
            res.statusCode = 200;
            return res.end(JSON.stringify({ 
              hasToken: Boolean(getChannelAccessToken()),
              tokenSnippet: getChannelAccessToken() ? `${getChannelAccessToken().slice(0, 8)}...` : ''
            }));
          }

          if (req.url === '/api/ai/summarize' && req.method === 'POST') {
            try {
              const result = await summarizeWithGemini(body as any);
              res.statusCode = 200;
              return res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message || 'Gemini error' }));
            }
          }

          if (req.url === '/api/line/webhook' && req.method === 'POST') {
            try {
              const outcome = await processLineWebhook(body);
              res.statusCode = 200;
              return res.end(JSON.stringify(outcome));
            } catch (err: any) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: err.message || 'Webhook error' }));
            }
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), tmuApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});


