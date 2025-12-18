export interface WebApp {
  id: string;
  url: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  iconUrl: string;
  createdAt: number;
}

export interface GeneratedAppData {
  name: string;
  tagline: string;
  description: string;
  category: string;
}
