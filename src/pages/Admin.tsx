import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Sun, Moon, LogOut, Plus, Trash2, Globe, Clock, Eye, Copy,
  TrendingUp, Tag, Search, Monitor,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSites } from '@/contexts/SiteContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AddOfferModal from '@/components/AddOfferModal';

const MAOS_PROJETO = {
  name: 'Mãos Que Acolhem (Projeto Completo)',
  sourceUrl: '/funil/maos-que-acolhem',
  niche: 'ONG',
  tags: ['principal', 'múltiplas páginas'],
  platform: 'Mãos Que Acolhem',
};

const Admin = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { sites, deleteSite, addSite, updateSite } = useSites();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const existingMaos = sites.find(
      (s) => s.name === MAOS_PROJETO.name || s.sourceUrl === 'https://ongmaosqueacolhem.com/' || s.sourceUrl === MAOS_PROJETO.sourceUrl,
    );

    const now = new Date().toISOString();
    const maosPatch = {
      name: MAOS_PROJETO.name,
      sourceUrl: MAOS_PROJETO.sourceUrl,
      niche: MAOS_PROJETO.niche,
      tags: MAOS_PROJETO.tags,
      platform: MAOS_PROJETO.platform,
      status: 'cloned' as const,
      seenAt: existingMaos?.seenAt || now,
      clonedAt: existingMaos?.clonedAt || now,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Mãos Que Acolhem</title><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:0}</style></head><body><iframe src="/funil/maos-que-acolhem"></iframe></body></html>`,
      notes: 'Projeto principal. Preview em /funil/maos-que-acolhem',
    };

    if (existingMaos) {
      if (existingMaos.sourceUrl !== MAOS_PROJETO.sourceUrl || existingMaos.html !== maosPatch.html) {
        updateSite(existingMaos.id, maosPatch);
      }
      return;
    }

    addSite(MAOS_PROJETO.sourceUrl, maosPatch);
  }, [sites, addSite, updateSite]);

  const handleDelete = (id: string, name: string) => {
    deleteSite(id);
    toast({ title: 'Oferta excluída', description: `"${name}" foi removida.` });
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendente', className: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30' },
    cloned: { label: 'Clonada', className: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
    editing: { label: 'Editando', className: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
    exported: { label: 'Exportada', className: 'bg-green-500/15 text-green-600 border-green-500/30' },
  };

  const filtered = sites.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sourceUrl.toLowerCase().includes(search.toLowerCase()) ||
    s.niche?.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Flame className="text-primary-foreground" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Offer<span className="text-primary">Vault</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Minhas Ofertas</h1>
            <p className="text-muted-foreground text-sm mt-1">{sites.length} oferta{sites.length !== 1 ? 's' : ''} cadastrada{sites.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="gradient-primary text-primary-foreground" onClick={() => setShowAdd(true)}>
              <Plus size={16} className="mr-2" /> Nova Oferta
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, URL, nicho ou tag..."
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Globe className="text-muted-foreground" size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {sites.length === 0 ? 'Nenhuma oferta cadastrada' : 'Nenhum resultado'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {sites.length === 0
                ? 'Cadastre a URL de uma oferta do concorrente para começar.'
                : 'Tente buscar com outros termos.'}
            </p>
            {sites.length === 0 && (
              <Button className="gradient-primary text-primary-foreground" onClick={() => setShowAdd(true)}>
                <Plus size={16} className="mr-2" /> Cadastrar Primeira Oferta
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((site, i) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border bg-card overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/offer/${site.id}`)}
                >
                  {/* Screenshot preview or placeholder */}
                  <div className="h-36 bg-muted relative overflow-hidden">
                    {site.screenshot ? (
                      <img src={site.screenshot} alt={site.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Globe className="text-muted-foreground" size={40} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="secondary" className={statusConfig[site.status]?.className || statusConfig.pending.className}>
                        {statusConfig[site.status]?.label || 'Pendente'}
                      </Badge>
                      {site.wasScaling && (
                        <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          <TrendingUp size={10} className="mr-0.5" /> Escalando
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold truncate mb-1">{site.name}</h3>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mb-2">
                      <Globe size={12} /> {site.sourceUrl}
                    </p>

                    {/* Tags */}
                    {site.tags && site.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {site.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {site.tags.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            +{site.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                      <div className="rounded-lg bg-secondary p-2">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><Clock size={12} /></div>
                        <p className="text-xs font-semibold">{site.seenAt ? new Date(site.seenAt).toLocaleDateString('pt-BR') : '—'}</p>
                        <p className="text-[10px] text-muted-foreground">Visto em</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-2">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5"><Tag size={12} /></div>
                        <p className="text-xs font-semibold">{site.niche || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">Nicho</p>
                      </div>
                    </div>

                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Button size="sm" className="flex-1" onClick={() => navigate(`/offer/${site.id}?tab=preview`)}>
                        <Monitor size={14} className="mr-1" /> Preview
                      </Button>
                      <Button size="sm" className="flex-1" variant="outline" onClick={() => navigate(`/offer/${site.id}`)}>
                        <Eye size={14} className="mr-1" /> Editar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        navigator.clipboard.writeText(site.sourceUrl);
                        toast({ title: 'URL copiada!' });
                      }}><Copy size={14} /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(site.id, site.name)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AddOfferModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
};

export default Admin;
