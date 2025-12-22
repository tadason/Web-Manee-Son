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

const extractMetaTags = (html: string) => {
  const tags: Record<string, string>[] = [];
  const metaRegex = /<meta\s+[^>]*>/gi;
  const attrRegex = /(\w+)=["']([^"']*)["']/gi;
  let match;

  while ((match = metaRegex.exec(html))) {
    const tag = match[0];
    const attrs: Record<string, string> = {};
    let attrMatch;
    while ((attrMatch = attrRegex.exec(tag))) {
      attrs[attrMatch[1].toLowerCase()] = attrMatch[2];
    }
    tags.push(attrs);
  }

  return tags;
};

const pickMetaContent = (tags: Record<string, string>[], keys: string[]) => {
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

app.get('/api/og-metadata', async (req: Request, res: Response) => {
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
  console.log(`✅ API: GET /api/og-metadata`);
  console.log(`✅ Health: GET /health`);
  console.log(`✅ Frontend: served from dist/`);
  console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
