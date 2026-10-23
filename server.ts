/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import { answerPurchasingQuestion, extractReceiptFromImage } from './server/ai.ts';
import { Receipt } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function bootstrapServer() {
  const app = express();

  // Allow up to 25MB payload for high-resolution receipt images
  app.use(express.json({ limit: '25mb' }));

  // --- API ROUTES ---

  // 1. Business Profile & Consent
  app.get('/api/business/active', (_req: Request, res: Response) => {
    try {
      const business = db.getBusiness();
      res.json({ success: true, data: business });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/business/consent', (req: Request, res: Response) => {
    try {
      const { enabled } = req.body;
      const updated = db.updateBusinessConsent(Boolean(enabled));
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Receipts & Ledger CRUD
  app.get('/api/receipts', (_req: Request, res: Response) => {
    try {
      const receipts = db.getReceipts();
      res.json({ success: true, data: receipts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/receipts/:id', (req: Request, res: Response) => {
    try {
      const receipt = db.getReceipt(req.params.id);
      if (!receipt) {
        return res.status(404).json({ success: false, error: 'Receipt not found' });
      }
      res.json({ success: true, data: receipt });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/receipts', (req: Request, res: Response) => {
    try {
      const draft: Receipt = req.body;
      if (!draft.merchantName || !draft.transactionDate || !draft.totalMinor) {
        return res.status(400).json({ success: false, error: 'Merchant, date, and total are required' });
      }
      const created = db.createReceipt(draft);
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/receipts/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateReceipt(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Receipt not found' });
      }
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/receipts/:id', (req: Request, res: Response) => {
    try {
      const deleted = db.deleteReceipt(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Receipt not found' });
      }
      res.json({ success: true, message: 'Receipt deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Scan & OCR Extraction
  app.post('/api/scan/extract', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'Missing imageBase64 in request' });
      }

      const extracted = await extractReceiptFromImage(imageBase64, mimeType);
      res.json({ success: true, data: extracted });
    } catch (err: any) {
      console.error('Scan extraction error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Benchmarks & Opportunities
  app.get('/api/benchmarks', (_req: Request, res: Response) => {
    try {
      const benchmarks = db.getBenchmarks();
      res.json({ success: true, data: benchmarks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/opportunities', (_req: Request, res: Response) => {
    try {
      const opportunities = db.getSavingsOpportunities();
      res.json({ success: true, data: opportunities });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Grounded AI Purchasing Assistant (supports global and page-specific queries)
  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    try {
      const { message, language, pageContext } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid prompt message is required' });
      }

      const lang = language === 'hi' ? 'hi' : 'en';
      const answer = await answerPurchasingQuestion(message, lang, pageContext);
      res.json({ success: true, data: answer });
    } catch (err: any) {
      console.error('Assistant error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Reset Demo DB
  app.post('/api/db/reset', (_req: Request, res: Response) => {
    try {
      db.resetToDemo();
      res.json({ success: true, message: 'Database reset to demo state' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- VITE & STATIC SERVING ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`[Pricewise] Server listening on http://0.0.0.0:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Fatal server bootstrap error:', err);
  process.exit(1);
});
