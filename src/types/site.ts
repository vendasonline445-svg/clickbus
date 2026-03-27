export interface SiteMetadata {
  title: string;
  description: string;
  favicon?: string;
  ogImage?: string;
  language?: string;
}

export interface ClonedSite {
  id: string;
  name: string;
  sourceUrl: string;
  slug: string;
  status: 'pending' | 'cloned' | 'editing' | 'exported';
  html: string;
  screenshot?: string;
  metadata: SiteMetadata;
  createdAt: string;
  updatedAt: string;
  customCss?: string;
  notes?: string;
  // Offer-specific fields
  wasScaling?: boolean;
  seenAt?: string;
  clonedAt?: string;
  niche?: string;
  platform?: string;
  tags?: string[];
  screenshots?: string[]; // base64 data URLs
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}
