import { Clock3, Heart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMaosCampaignBySlug } from '@/data/maosCampanhas';
import DonationNotifications from '@/components/DonationNotifications';
import { toast } from '@/hooks/use-toast';
import NotFound from './NotFound';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const MaosCampanha = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const campaign = getMaosCampaignBySlug(slug);
  const [selectedValue, setSelectedValue] = useState(50);
  const [customValue, setCustomValue] = useState('50');
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState<'historia' | 'atualizacoes'>('historia');

  const finalValue = useMemo(() => {
    const parsed = Number(customValue.replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : selectedValue;
  }, [customValue, selectedValue]);

  if (!campaign) return <NotFound />;

  const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const hasUpdates = campaign.updates && campaign.updates.length > 0;

  const handlePresetClick = (value: number) => {
    setSelectedValue(value);
    setCustomValue(String(value));
  };

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          <a href="/funil/maos-que-acolhem#top" className="shrink-0" aria-label="Ir para o início do site">
            <img src="/images/maos/logo.png" alt="Logo Mãos Que Acolhem" className="h-10 w-auto md:h-14" />
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
            <a href="/funil/maos-que-acolhem#top" className="transition-opacity hover:opacity-100">Início</a>
            <a href="/funil/maos-que-acolhem/sobre" className="transition-opacity hover:opacity-100">Sobre</a>
            <a href="/funil/maos-que-acolhem#explore" className="transition-opacity hover:opacity-100">Explorar Vaquinhas</a>
          </nav>

          <button
            type="button"
            onClick={() => toast({ variant: 'destructive', title: 'Você precisa entrar na sua conta para criar uma campanha.' })}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90 md:px-5 md:py-3 md:text-sm"
            style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
          >
            Criar Campanha
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
        {/* Hero card */}
        <section
          className="overflow-hidden rounded-2xl border md:rounded-3xl"
          style={{
            backgroundColor: 'hsl(var(--maos-surface))',
            borderColor: 'hsl(var(--maos-border))',
          }}
        >
          <div className="aspect-[16/9] overflow-hidden md:aspect-[21/7]" style={{ backgroundColor: 'hsl(var(--maos-chip))' }}>
            <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
          </div>

          <div className="space-y-3 px-5 py-5 md:space-y-4 md:px-10 md:py-8">
            <h1 className="max-w-4xl font-heading text-xl font-bold leading-tight md:text-3xl">{campaign.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm" style={{ color: 'hsl(var(--maos-muted))' }}>
              <p className="inline-flex items-center gap-1.5">
                <Heart className="size-4" /> Vaquinha de{' '}
                <span className="font-bold" style={{ color: 'hsl(var(--maos-brand))' }}>{campaign.organization}</span>
              </p>
              <p className="inline-flex items-center gap-1.5"><Clock3 className="size-4" /> {campaign.createdAtLabel}</p>
            </div>

            {/* Quero Ajudar button - mobile prominent */}
            <a
              href="#doar"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 md:text-base"
              style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
            >
              Quero Ajudar 🙏
            </a>
          </div>
        </section>

        {/* Content + Sidebar */}
        <section
          className="mt-6 grid gap-6 rounded-[1.5rem] p-0 md:mt-10 md:gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start"
          style={{ backgroundColor: 'hsl(var(--maos-soft))' }}
        >
          <div className="space-y-6 md:space-y-8">
            {/* Tabs */}
            {hasUpdates && (
              <div className="flex gap-0 border-b" style={{ borderColor: 'hsl(var(--maos-border))' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('historia')}
                  className="relative px-5 py-3 text-sm font-semibold transition-colors md:text-base"
                  style={{ color: activeTab === 'historia' ? 'hsl(var(--maos-brand))' : 'hsl(var(--maos-muted))' }}
                >
                  História
                  {activeTab === 'historia' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'hsl(var(--maos-brand))' }} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('atualizacoes')}
                  className="relative px-5 py-3 text-sm font-semibold transition-colors md:text-base"
                  style={{ color: activeTab === 'atualizacoes' ? 'hsl(var(--maos-brand))' : 'hsl(var(--maos-muted))' }}
                >
                  Atualizações ({campaign.updates!.length})
                  {activeTab === 'atualizacoes' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'hsl(var(--maos-brand))' }} />
                  )}
                </button>
              </div>
            )}

            {/* História tab */}
            {activeTab === 'historia' && (
              <article
                className="overflow-hidden rounded-2xl border md:rounded-[1.75rem]"
                style={{
                  backgroundColor: 'hsl(var(--maos-surface))',
                  borderColor: 'hsl(var(--maos-border))',
                }}
              >
                <div className="border-b px-6 py-4 md:px-8 md:py-5" style={{ borderColor: 'hsl(var(--maos-border))' }}>
                  <p className="text-base font-bold md:text-lg" style={{ color: 'hsl(var(--maos-brand))' }}>História</p>
                </div>

                <div className="space-y-6 px-6 py-6 md:space-y-8 md:px-8 md:py-8">
                  {campaign.sections.map((section, index) => (
                    <div key={`${section.title}-${index}`} className="space-y-3 md:space-y-5">
                      <div className="flex items-start gap-3">
                        <span className="mt-1.5 h-7 w-3 shrink-0 rounded-full md:mt-2 md:h-9 md:w-4" style={{ backgroundColor: 'hsl(var(--maos-success))' }} />
                        <h2 className="text-base font-bold leading-tight md:text-xl">
                          {section.icon} {section.title}
                        </h2>
                      </div>

                      <div className="space-y-3 pl-6 text-sm leading-relaxed md:space-y-4 md:pl-8 md:text-base" style={{ color: 'hsl(var(--maos-text) / 0.86)' }}>
                        {section.content.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>

                      {section.cta ? (
                        <div className="pl-6 md:pl-8">
                          <a
                            href="#doar"
                            className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-bold text-white transition-opacity hover:opacity-90 md:px-5 md:py-3 md:text-base"
                            style={{ backgroundColor: index % 2 === 0 ? 'hsl(var(--maos-brand))' : 'hsl(var(--maos-success-dark))' }}
                          >
                            {section.cta}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* Atualizações tab */}
            {activeTab === 'atualizacoes' && hasUpdates && (
              <article
                className="overflow-hidden rounded-2xl border md:rounded-[1.75rem]"
                style={{
                  backgroundColor: 'hsl(var(--maos-surface))',
                  borderColor: 'hsl(var(--maos-border))',
                }}
              >
                <div className="space-y-0 divide-y" style={{ borderColor: 'hsl(var(--maos-border))' }}>
                  {campaign.updates!.map((update, i) => (
                    <div key={i} className="px-6 py-6 md:px-8 md:py-8">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'hsl(var(--maos-muted))' }}>
                        {update.date}
                      </p>
                      <p className="text-sm leading-relaxed md:text-base" style={{ color: 'hsl(var(--maos-text) / 0.9)' }}>
                        {update.content}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* CTA section */}
            <section
              className="space-y-4 rounded-2xl border px-6 py-8 md:space-y-6 md:rounded-[1.75rem] md:px-8 md:py-10"
              style={{
                backgroundColor: 'hsl(var(--maos-surface))',
                borderColor: 'hsl(var(--maos-border))',
              }}
            >
              <h2 className="text-center font-heading text-lg font-bold md:text-2xl">
                Doe o valor que sentir no coração ❤️
              </h2>

              <p
                className="mx-auto max-w-xl text-center text-xs leading-relaxed md:text-sm"
                style={{ color: 'hsl(var(--maos-text) / 0.82)' }}
              >
                Não existe valor pequeno quando ele vem de um gesto verdadeiro.
                Escolha quanto deseja doar ao lado e finalize via PIX — rápido, seguro e direto.
              </p>

              <div
                className="rounded-xl border px-4 py-3 text-xs md:rounded-[1.5rem] md:px-5 md:py-4 md:text-sm"
                style={{
                  borderColor: 'hsl(var(--maos-step-border))',
                  backgroundColor: 'hsl(var(--maos-step-bg))',
                  color: 'hsl(var(--maos-success-dark))',
                }}
              >
                <div className="space-y-2 md:space-y-3">
                  <p><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold md:mr-3 md:h-8 md:w-8" style={{ backgroundColor: 'hsl(var(--maos-badge))', color: 'hsl(var(--maos-success-dark))' }}>1</span>Escolha o valor que cabe no seu coração.</p>
                  <p><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold md:mr-3 md:h-8 md:w-8" style={{ backgroundColor: 'hsl(var(--maos-badge))', color: 'hsl(var(--maos-success-dark))' }}>2</span>Clique em <strong>Gerar PIX para doar</strong>.</p>
                  <p><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold md:mr-3 md:h-8 md:w-8" style={{ backgroundColor: 'hsl(var(--maos-badge))', color: 'hsl(var(--maos-success-dark))' }}>3</span>Copie o código e finalize no app do seu banco.</p>
                </div>
              </div>

              <a
                href="#doar"
                className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 md:px-5 md:py-3 md:text-base"
                style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
              >
                QUERO AJUDAR AGORA ❤️
              </a>
            </section>
          </div>

          {/* Sidebar */}
          <aside id="doar" className="lg:sticky lg:top-24">
            <div
              className="rounded-2xl border p-5 md:rounded-[1.75rem] md:p-7"
              style={{
                backgroundColor: 'hsl(var(--maos-surface))',
                borderColor: 'hsl(var(--maos-border))',
              }}
            >
              <h2 className="font-heading text-lg font-bold leading-tight md:text-2xl">{campaign.title}</h2>

              <div className="mt-4 space-y-2 md:mt-5 md:space-y-3">
                <div>
                  <p className="text-xl font-bold md:text-2xl">{formatCurrency(campaign.raised)}</p>
                  <p className="text-xs md:text-sm" style={{ color: 'hsl(var(--maos-muted))' }}>arrecadados de {formatCurrency(campaign.goal)}</p>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full md:h-3" style={{ backgroundColor: 'hsl(var(--maos-chip))' }}>
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: 'hsl(var(--maos-brand))' }} />
                </div>

                <p className="text-xs md:text-sm" style={{ color: 'hsl(var(--maos-muted))' }}>{progress.toFixed(2)}% Completo</p>
              </div>

              <div className="mt-5 space-y-3 md:mt-6 md:space-y-4">
                <div>
                  <p className="text-sm font-semibold md:text-base">Escolha o valor da sua contribuição:</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 md:mt-4 md:gap-3">
                    {campaign.suggestedValues.map((value) => {
                      const active = finalValue === value;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handlePresetClick(value)}
                          className={`rounded-xl px-3 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 md:rounded-2xl md:px-4 md:py-3 md:text-base ${value === 1000 ? 'col-span-2' : ''}`}
                          style={{
                            backgroundColor: active ? 'hsl(var(--maos-brand))' : 'hsl(var(--maos-chip))',
                            color: active ? 'hsl(var(--maos-brand-foreground))' : 'hsl(var(--maos-text))',
                          }}
                        >
                          {formatCurrency(value)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="text-sm font-semibold md:text-base">Valor personalizado</label>
                  <div
                    className="mt-1.5 rounded-xl border px-3 py-2.5 text-sm md:mt-2 md:rounded-2xl md:px-4 md:py-3 md:text-base"
                    style={{
                      borderColor: 'hsl(var(--maos-border))',
                      backgroundColor: 'hsl(var(--maos-page))',
                    }}
                  >
                    <input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      value={`R$ ${customValue}`}
                      onChange={(event) => setCustomValue(event.target.value.replace(/[^\d.,]/g, ''))}
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="donor-name" className="text-sm font-semibold md:text-base">Seu nome</label>
                  <input
                    id="donor-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Digite seu nome"
                    disabled={anonymous}
                    className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none placeholder:text-[hsl(var(--maos-muted))] disabled:opacity-50 md:mt-2 md:rounded-2xl md:px-4 md:py-3 md:text-base"
                    style={{
                      borderColor: 'hsl(var(--maos-border))',
                      backgroundColor: 'hsl(var(--maos-page))',
                    }}
                  />
                </div>

                <label className="flex items-center gap-2.5 text-xs font-medium md:gap-3 md:text-sm">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                    className="h-5 w-5 rounded md:h-6 md:w-6"
                    style={{ borderColor: 'hsl(var(--maos-border))' }}
                  />
                  Doar anonimamente
                </label>

                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({ amount: String(finalValue) });

                    if (name.trim()) params.set('donor', name.trim());
                    if (anonymous) params.set('anonymous', 'true');

                    navigate(`/funil/maos-que-acolhem/campanha/${campaign.slug}/finalizacao?${params.toString()}`);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 md:px-5 md:py-3 md:text-base"
                  style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
                >
                  Gerar PIX para doar
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <DonationNotifications />
    </div>
  );
};

export default MaosCampanha;
