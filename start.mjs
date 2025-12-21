/**
 * Web-Manee-Son Backend Server
 * Compiled TypeScript for Cloud Run deployment
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

const extractMetaTags = (html) => {
  const tags = [];
  const metaRegex = /<meta\s+[^>]*>/gi;
  const attrRegex = /(\w+)=["']([^"']*)["']/gi;
  let match;

  while ((match = metaRegex.exec(html))) {
    const tag = match[0];
    const attrs = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(tag))) {
      attrs[attrMatch[1].toLowerCase()] = attrMatch[2];
    }
    tags.push(attrs);
  }

  return tags;
};

const pickMetaContent = (tags, keys) => {
  for (const key of keys) {
    const found = tags.find(
      (tag) =>
        (tag.property && tag.property.toLowerCase() === key) ||
        (tag.name && tag.name.toLowerCase() === key)
    );
    if (found && found.content) return found.content.trim();
  }
  return '';
};

// API Routes - dummy route that will be replaced by real handler
app.post('/api/describe-app', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      return;
    }

    // For now, return mock response
    // In production, integrate real Gemini API
    res.status(200).json({
      description: `Analysis of ${url}`,
      tags: ['web', 'app'],
      category: 'Utility'
    });
  } catch (error) {
    console.error('❌ Error in describeApp:', error);
    res.status(500).json({
      error: 'Failed to describe app',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/og-metadata', async (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ManeeSonBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      res.status(200).json({
        title: parsedUrl.hostname,
        description: '',
        image: '',
        siteName: parsedUrl.hostname,
      });
      return;
    }

    const html = await response.text();
    const tags = extractMetaTags(html);
    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const titleTag = titleTagMatch ? titleTagMatch[1].trim() : '';

    const title = pickMetaContent(tags, ['og:title', 'twitter:title']) || titleTag || parsedUrl.hostname;
    const description =
      pickMetaContent(tags, ['og:description', 'twitter:description', 'description']) || '';
    const image = pickMetaContent(tags, ['og:image', 'twitter:image']) || '';
    const siteName = pickMetaContent(tags, ['og:site_name']) || parsedUrl.hostname;

    res.status(200).json({
      title,
      description,
      image,
      siteName,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    res.status(200).json({
      title: parsedUrl.hostname,
      description: '',
      image: '',
      siteName: parsedUrl.hostname,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files (React frontend from dist/)
const distPath = path.join(__dirname, 'dist');
console.log(`📂 Looking for static files in: ${distPath}`);

// Check if dist exists
import { statSync } from 'fs';
try {
  statSync(distPath);
  console.log(`✅ dist/ folder found`);
} catch (err) {
  console.warn(`⚠️ dist/ folder not found at ${distPath}, creating fallback...`);
}

app.use(express.static(distPath, { index: 'index.html' }));

// SPA fallback - serve index.html for all unmatched routes
app.get(/^\/?(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
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
