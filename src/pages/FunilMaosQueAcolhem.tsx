import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { maosCampaigns } from '@/data/maosCampanhas';
import DonationNotifications from '@/components/DonationNotifications';
import { toast } from '@/hooks/use-toast';

const categories = [
  'Todas as Categorias',
  'Saúde',
  'Educação',
  'Emergência',
  'Comunidade',
  'Animais',
  'Meio Ambiente',
  "ONG's",
  'Negócios',
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const FunilMaosQueAcolhem = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('Todas as Categorias');

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return maosCampaigns.filter((campaign) => {
      const matchesCategory =
        selectedCategory === 'Todas as Categorias' || campaign.category === selectedCategory;

      const matchesQuery =
        !normalizedQuery ||
        campaign.title.toLowerCase().includes(normalizedQuery) ||
        campaign.excerpt.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div
      id="top"
      className="min-h-screen"
      style={{
        backgroundColor: 'hsl(var(--maos-page))',
        color: 'hsl(var(--maos-text))',
      }}
    >
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'hsl(var(--maos-surface))',
          borderColor: 'hsl(var(--maos-border))',
        }}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-6">
          <a href="/funil/maos-que-acolhem#top" className="shrink-0" aria-label="Ir para o início do site">
            <img src="/images/maos/logo.png" alt="Logo Mãos Que Acolhem" className="h-14 w-auto" />
          </a>

          <nav className="hidden items-center gap-8 text-base font-semibold lg:flex" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
            <a href="/funil/maos-que-acolhem#top" className="transition-opacity hover:opacity-100">Início</a>
            <a href="/funil/maos-que-acolhem/sobre" className="transition-opacity hover:opacity-100">Sobre</a>
            <a href="/funil/maos-que-acolhem#explore" className="transition-opacity hover:opacity-100">Explorar Vaquinhas</a>
          </nav>

          <button
            type="button"
            onClick={() => toast({ variant: 'destructive', title: 'Você precisa entrar na sua conta para criar uma campanha.' })}
            className="rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 md:text-base"
            style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
          >
            Criar Campanha
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-12 md:px-6 md:pt-16">
        <section id="explore" className="space-y-8">
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">Explorar Campanhas</h1>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-6 -translate-y-1/2" style={{ color: 'hsl(var(--maos-muted))' }} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar campanhas..."
              className="h-16 w-full rounded-2xl border bg-transparent pl-14 pr-4 text-lg outline-none md:text-xl"
              style={{
                borderColor: 'hsl(var(--maos-border))',
                backgroundColor: 'hsl(var(--maos-surface))',
                color: 'hsl(var(--maos-text))',
              }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const isActive = category === selectedCategory;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full px-5 py-3 text-sm font-bold transition-opacity hover:opacity-90 md:text-base"
                  style={{
                    backgroundColor: isActive ? 'hsl(var(--maos-brand))' : 'hsl(var(--maos-chip))',
                    color: isActive ? 'hsl(var(--maos-brand-foreground))' : 'hsl(var(--maos-text) / 0.82)',
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const progress = Math.min(Math.round((campaign.raised / campaign.goal) * 100), 100);

              return (
                <a
                  key={campaign.slug}
                  href={`/funil/maos-que-acolhem/campanha/${campaign.slug}`}
                  className="overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
                  style={{
                    backgroundColor: 'hsl(var(--maos-surface))',
                    borderColor: 'hsl(var(--maos-border))',
                  }}
                >
                  <div className="aspect-[16/9] overflow-hidden" style={{ backgroundColor: 'hsl(var(--maos-chip))' }}>
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-4 p-6">
                    <span
                      className="inline-flex rounded-full px-4 py-2 text-xs font-bold md:text-sm"
                      style={{
                        backgroundColor: 'hsl(var(--maos-brand))',
                        color: 'hsl(var(--maos-brand-foreground))',
                      }}
                    >
                      {campaign.category}
                    </span>

                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold leading-tight line-clamp-3">{campaign.title}</h2>
                      <p className="text-base leading-relaxed line-clamp-2 md:text-lg" style={{ color: 'hsl(var(--maos-muted))' }}>
                        {campaign.excerpt}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: 'hsl(var(--maos-chip))' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${progress}%`, backgroundColor: 'hsl(var(--maos-brand))' }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-base">
                        <div>
                          <p className="font-bold">{formatCurrency(campaign.raised)}</p>
                          <p style={{ color: 'hsl(var(--maos-muted))' }}>arrecadados</p>
                        </div>
                        <div>
                          <p style={{ color: 'hsl(var(--maos-muted))' }}>{progress}% de {formatCurrency(campaign.goal)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 text-base" style={{ borderColor: 'hsl(var(--maos-border))', color: 'hsl(var(--maos-muted))' }}>
                      {campaign.daysLeft} dias restantes
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section
          id="criar-campanha"
          className="mt-16 rounded-[2rem] border px-6 py-10 md:px-10"
          style={{
            backgroundColor: 'hsl(var(--maos-soft))',
            borderColor: 'hsl(var(--maos-border))',
          }}
        >
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'hsl(var(--maos-brand))' }}>
              Mãos Que Acolhem
            </p>
            <h2 className="font-heading text-3xl font-bold md:text-5xl">Quer publicar uma campanha dentro do nosso site?</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'hsl(var(--maos-muted))' }}>
              Organizamos páginas internas no mesmo layout das campanhas para ninguém sair da sua estrutura.
            </p>
            <a
              href="/funil/maos-que-acolhem/sobre#pix"
              className="inline-flex rounded-xl px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
            >
              Falar com a Mãos Que Acolhem
            </a>
          </div>
        </section>
      </main>

      <footer
        className="border-t py-10"
        style={{
          borderColor: 'hsl(var(--maos-border))',
          backgroundColor: 'hsl(var(--maos-surface))',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center md:px-6">
          <img src="/images/maos/logo.png" alt="Logo Mãos Que Acolhem" className="h-16 w-auto" />
          <p className="text-base" style={{ color: 'hsl(var(--maos-muted))' }}>© 2026 Mãos Que Acolhem. Todos os direitos reservados.</p>
        </div>
      </footer>
      <DonationNotifications />
    </div>
  );
};

export default FunilMaosQueAcolhem;
