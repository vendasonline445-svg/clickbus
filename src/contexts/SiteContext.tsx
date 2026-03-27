import React, { createContext, useContext, useState, useCallback } from 'react';
import { ClonedSite, generateSlug, generateId, extractDomain } from '@/types/site';

interface SiteContextType {
  sites: ClonedSite[];
  addSite: (url: string, data?: Partial<ClonedSite>) => ClonedSite;
  updateSite: (id: string, data: Partial<ClonedSite>) => void;
  deleteSite: (id: string) => void;
  getSite: (id: string) => ClonedSite | undefined;
  getSiteBySlug: (slug: string) => ClonedSite | undefined;
}

const STORAGE_KEY = 'sc_sites_v1';

const loadSites = (): ClonedSite[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const SiteContext = createContext<SiteContextType>({} as SiteContextType);

export const useSites = () => useContext(SiteContext);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<ClonedSite[]>(loadSites);

  const persist = (s: ClonedSite[]) => {
    setSites(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  };

  const addSite = useCallback((url: string, data: Partial<ClonedSite> = {}): ClonedSite => {
    const domain = extractDomain(url);
    const site: ClonedSite = {
      id: generateId(),
      name: data.name || domain,
      sourceUrl: url,
      slug: generateSlug(data.name || domain),
      status: 'pending',
      html: data.html || '',
      metadata: data.metadata || { title: domain, description: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seenAt: new Date().toISOString(),
      ...data,
    };
    const updated = [...loadSites(), site];
    persist(updated);
    return site;
  }, []);

  const updateSite = useCallback((id: string, data: Partial<ClonedSite>) => {
    const current = loadSites();
    persist(current.map((s) => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s)));
  }, []);

  const deleteSite = useCallback((id: string) => {
    persist(loadSites().filter((s) => s.id !== id));
  }, []);

  const getSite = useCallback((id: string) => sites.find((s) => s.id === id), [sites]);
  const getSiteBySlug = useCallback((slug: string) => sites.find((s) => s.slug === slug), [sites]);

  return (
    <SiteContext.Provider value={{ sites, addSite, updateSite, deleteSite, getSite, getSiteBySlug }}>
      {children}
    </SiteContext.Provider>
  );
};
