import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Parse JSON request bodies
app.use(express.json());

// API Serverless Routes
app.all('/api/health', (req, res) => {
  return healthHandler(req, res);
});

app.all('/api/carparkavailability', (req, res) => {
  return carparkAvailabilityHandler(req, res);
});

async function startServer() {
  if (!isProd) {
    // Mount Vite dev server middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SG ParkSense Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[LTA API Status] LTA_ACCOUNT_KEY configured: ${Boolean(process.env.LTA_ACCOUNT_KEY)}`);
  });
}

startServer().catch((err) => {
  console.error('[SG ParkSense Server] Startup error:', err);
  process.exit(1);
});
