import { ArrowLeft, Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getMaosCampaignBySlug } from '@/data/maosCampanhas';
import NotFound from './NotFound';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const buildMockPixCode = (slug: string, amount: number) => {
  const amountDigits = Math.round(amount * 100)
    .toString()
    .padStart(10, '0');

  return `00020101021226930014br.gov.bcb.pix2560pix.maosqueacolhem.mock/${slug}/doacao52040000530398654${amountDigits}5802BR5918MAOS QUE ACOLHEM6009SAO PAULO62140510DOACAOFIXA6304ABCD`;
};

const isFilledCell = (index: number, code: string) => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const inTopLeft = row < 3 && col < 3;
  const inTopRight = row < 3 && col > 5;
  const inBottomLeft = row > 5 && col < 3;

  if (inTopLeft || inTopRight || inBottomLeft) return true;

  const charCode = code.charCodeAt(index % code.length);
  return (charCode + row + col) % 2 === 0;
};

const FinalizacaoMaosQueAcolhem = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaign = getMaosCampaignBySlug(slug);
  const [copied, setCopied] = useState(false);

  const amount = Number(searchParams.get('amount') || '50');
  const donor = searchParams.get('donor') || '';
  const anonymous = searchParams.get('anonymous') === 'true';

  const pixCode = useMemo(() => {
    if (!campaign) return '';
    return buildMockPixCode(campaign.slug, amount);
  }, [campaign, amount]);

  const donorLabel = anonymous ? 'Doação anônima' : donor || 'Doador identificado na confirmação';

  if (!campaign) return <NotFound />;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'hsl(var(--maos-page))',
        color: 'hsl(var(--maos-text))',
      }}
    >
      <header
        className="border-b"
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
            onClick={() => navigate(`/funil/maos-que-acolhem/campanha/${campaign.slug}`)}
            className="rounded-xl px-5 py-3 text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'hsl(var(--maos-chip))',
              color: 'hsl(var(--maos-text))',
            }}
          >
            Voltar
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-6 lg:grid-cols-[minmax(0,0.92fr)_420px] lg:items-start">
        <section className="space-y-6">
          <button
            type="button"
            onClick={() => navigate(`/funil/maos-que-acolhem/campanha/${campaign.slug}`)}
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: 'hsl(var(--maos-muted))' }}
          >
            <ArrowLeft className="size-4" />
            Voltar para a campanha
          </button>

          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.24em]" style={{ color: 'hsl(var(--maos-brand))' }}>
              Finalização da doação
            </p>
            <h1 className="font-heading text-3xl font-bold md:text-5xl">Quase lá!</h1>
            <p className="max-w-2xl text-lg leading-relaxed md:text-2xl" style={{ color: 'hsl(var(--maos-text) / 0.86)' }}>
              Sua doação de <span style={{ color: 'hsl(var(--maos-brand))' }} className="font-bold">{formatCurrency(amount)}</span> será confirmada após a transferência PIX.
            </p>
          </div>

          <div
            className="rounded-[2rem] border p-6 md:p-8"
            style={{
              backgroundColor: 'hsl(var(--maos-surface))',
              borderColor: 'hsl(var(--maos-border))',
            }}
          >
            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
              <div className="mx-auto w-full max-w-[220px] rounded-[1.75rem] border p-4" style={{ borderColor: 'hsl(var(--maos-border))', backgroundColor: 'hsl(var(--maos-page))' }}>
                <div className="grid grid-cols-9 gap-1">
                  {Array.from({ length: 81 }).map((_, index) => (
                    <span
                      key={index}
                      className="aspect-square rounded-[2px]"
                      style={{
                        backgroundColor: isFilledCell(index, pixCode) ? 'hsl(var(--maos-text))' : 'hsl(var(--maos-page))',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-base font-bold md:text-lg"><span style={{ color: 'hsl(var(--maos-brand))' }}>1.</span> Copie o código abaixo:</p>
                  <div
                    className="mt-3 rounded-2xl border px-4 py-4 text-sm leading-relaxed md:text-base"
                    style={{
                      borderColor: 'hsl(var(--maos-border))',
                      backgroundColor: 'hsl(var(--maos-page))',
                      color: 'hsl(var(--maos-muted))',
                      wordBreak: 'break-all',
                    }}
                  >
                    {pixCode}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 md:text-xl"
                  style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
                >
                  {copied ? <Check className="mr-2 size-5" /> : <Copy className="mr-2 size-5" />}
                  {copied ? 'CÓDIGO COPIADO' : 'COPIAR CÓDIGO PIX'}
                </button>

                <div className="space-y-3 border-t pt-5 text-base leading-relaxed md:text-lg" style={{ borderColor: 'hsl(var(--maos-border))', color: 'hsl(var(--maos-text) / 0.84)' }}>
                  <p><span style={{ color: 'hsl(var(--maos-brand))' }} className="font-bold">2.</span> Abra o aplicativo ou site do seu banco.</p>
                  <p><span style={{ color: 'hsl(var(--maos-brand))' }} className="font-bold">3.</span> Entre na área PIX e escolha a opção <strong>PIX Copia e Cola</strong>.</p>
                  <p><span style={{ color: 'hsl(var(--maos-brand))' }} className="font-bold">4.</span> Cole o código, confirme o valor e conclua a doação.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <div
            className="space-y-6 rounded-[1.75rem] border p-6"
            style={{
              backgroundColor: 'hsl(var(--maos-surface))',
              borderColor: 'hsl(var(--maos-border))',
            }}
          >
            <img src={campaign.image} alt={campaign.title} className="h-52 w-full rounded-[1.25rem] object-cover" />

            <div className="space-y-3">
              <h2 className="font-heading text-2xl font-bold leading-tight md:text-3xl">{campaign.title}</h2>
              <p className="text-base leading-relaxed" style={{ color: 'hsl(var(--maos-muted))' }}>{campaign.excerpt}</p>
            </div>

            <div className="grid gap-4 rounded-[1.5rem] p-5" style={{ backgroundColor: 'hsl(var(--maos-soft))' }}>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--maos-muted))' }}>Valor da doação</p>
                <p className="mt-2 text-3xl font-bold">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--maos-muted))' }}>Identificação</p>
                <p className="mt-2 text-lg font-semibold">{donorLabel}</p>
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: 'hsl(var(--maos-muted))' }}>Ambiente</p>
                <p className="mt-2 text-base font-medium">Código fictício para integração futura do gateway</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default FinalizacaoMaosQueAcolhem;
