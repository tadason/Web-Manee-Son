export interface WebApp {
  id: string;
  url: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  iconUrl: string;
  createdAt: number;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  screenshotUrl?: string;
}
