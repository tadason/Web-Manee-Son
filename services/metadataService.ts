import type { GeneratedAppData } from '../components/apptada/types';

const SNAPSHOT_LIMIT = 8000;

function inferCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.match(/health|wellness|medic|clinic|fit|mind/)) return 'Health';
  if (t.match(/shop|store|ecommerce|commerce/)) return 'E-commerce';
  if (t.match(/dev|developer|api|code|tool/)) return 'Developer Tools';
  if (t.match(/project|task|productivity|calendar|todo/)) return 'Productivity';
  if (t.match(/social|community|chat|message/)) return 'Social';
  if (t.match(/finance|bank|wallet|payment|pay/)) return 'Finance';
  return 'General';
}

async function fetchPageSnapshot(url: string): Promise<string | null> {
  const timeoutMs = 4000;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const res = await fetch(url, { method: 'GET', signal: controller?.signal });
    if (!res.ok) return null;
    const text = await res.text();
    return text.replace(/\s+/g, ' ').slice(0, SNAPSHOT_LIMIT);
  } catch (err) {
    console.error('Failed to fetch page snapshot', err);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function scrapeFromHtml(html: string, url: string): GeneratedAppData {
  let title = '';
  let description = '';

  try {
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      title =
        doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        doc.querySelector('title')?.textContent ||
        '';
      description =
        doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
        doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        '';
    }
  } catch (err) {
    console.error('DOMParser failed, fallback to regex scraping', err);
  }

  if (!title) {
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = m?.[1]?.trim() || '';
  }

  if (!description) {
    const m = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    description = m?.[1]?.trim() || '';
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  const name = title || host || 'Web Application';
  const desc = description || `เว็บแอปพลิเคชัน: ${host} กำลังพัฒนา`;
  const category = inferCategory(`${title} ${description}`);

  return {
    name,
    tagline: desc.slice(0, 90),
    description: desc,
    category,
  };
}

export const analyzeWebAppUrl = async (url: string): Promise<GeneratedAppData> => {
  try {
    const pageHtml = await fetchPageSnapshot(url);
    if (pageHtml) {
      return scrapeFromHtml(pageHtml, url);
    }

    return {
      name: new URL(url).host || 'Web Application',
      tagline: 'เว็บแอปพลิเคชัน',
      description: 'รายละเอียดกำลังจัดทำ',
      category: 'General',
    };
  } catch (error) {
    console.error('Error analyzing URL:', error);
    return {
      name: 'Web Application',
      tagline: 'แอปพลิเคชันเว็บ',
      description: 'ไม่สามารถระบุรายละเอียดได้ชัดเจน อาจเป็นระบบภายในหรืออยู่ระหว่างการพัฒนา',
      category: 'General',
    };
  }
};

export const generateAppIcon = async (name: string, description: string): Promise<string> => {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name || description || 'App')}`;
};
