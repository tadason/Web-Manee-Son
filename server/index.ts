import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { describeApp } from './routes/api/describe-app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/describe-app', describeApp);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files (React frontend from dist/)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA fallback - serve index.html for all unmatched routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('🔴 Server error:', err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ API: POST /api/describe-app`);
  console.log(`✅ Health: GET /health`);
  console.log(`✅ Frontend: served from dist/`);
  console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
