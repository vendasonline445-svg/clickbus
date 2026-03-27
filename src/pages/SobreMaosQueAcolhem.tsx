import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import DonationNotifications from '@/components/DonationNotifications';
import { toast } from '@/hooks/use-toast';

const PIX_KEY = 'doe@maosqueacolhem.org';

const SobreMaosQueAcolhem = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY);
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
            <a href="/funil/maos-que-acolhem/sobre" style={{ color: 'hsl(var(--maos-brand))' }}>Sobre</a>
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

      <section className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
        <div className="overflow-hidden rounded-[2rem]">
          <img
            src="/images/maos/criancas.png"
            alt="Crianças atendidas pela Mãos Que Acolhem"
            className="h-auto w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 md:px-6">
        <p className="text-center text-sm font-bold uppercase tracking-[0.25em]" style={{ color: 'hsl(var(--maos-success-dark))' }}>
          Desde 2016 levando cuidado, fé e esperança
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-center font-heading text-3xl font-bold leading-tight md:text-5xl">
          Quem somos – ONG Esperança Do Bem
        </h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6 text-lg leading-relaxed" style={{ color: 'hsl(var(--maos-text) / 0.86)' }}>
            <p>
              A <strong style={{ color: 'hsl(var(--maos-text))' }}>ONG Esperança Do Bem</strong> nasceu em 2016 com um propósito claro: estar ao lado de crianças e famílias que enfrentam diagnósticos de <strong style={{ color: 'hsl(var(--maos-text))' }}>câncer</strong> e outras <strong style={{ color: 'hsl(var(--maos-text))' }}>doenças infantis graves</strong>.
            </p>
            <p>
              Quando a doença chega, ela não atinge apenas o corpo — ela abala a estrutura emocional, espiritual e financeira de toda a família. É nesse momento que entramos com <strong style={{ color: 'hsl(var(--maos-text))' }}>apoio prático e humano</strong>.
            </p>
            <p>
              Trabalhamos com amor, fé em Deus e responsabilidade, conectando quem deseja ajudar a quem realmente precisa.
            </p>
          </div>

          <div
            className="rounded-[1.75rem] border p-7"
            style={{
              backgroundColor: 'hsl(var(--maos-surface))',
              borderColor: 'hsl(var(--maos-border))',
            }}
          >
            <h2 className="text-2xl font-bold">Nosso propósito em 3 palavras</h2>
            <div className="mt-5 space-y-3 text-base leading-relaxed" style={{ color: 'hsl(var(--maos-text) / 0.86)' }}>
              <p><strong>Cuidado:</strong> olhar atento para cada criança e história.</p>
              <p><strong>Esperança:</strong> lembrar às famílias que não estão sozinhas.</p>
              <p><strong>Transparência:</strong> cada doação é tratada com respeito e zelo.</p>
            </div>
            <p className="mt-5 text-sm italic" style={{ color: 'hsl(var(--maos-muted))' }}>
              *Toda ajuda recebida é direcionada a causas reais, com documentação e acompanhamento.
            </p>
          </div>
        </div>
      </section>

      <section
        className="py-2"
        style={{ backgroundColor: 'hsl(var(--maos-text))' }}
      >
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <img
            src="/images/maos/hospital.png"
            alt="Visita ao hospital"
            className="h-auto w-full rounded-[2rem] object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <h2 className="text-center font-heading text-3xl font-bold md:text-5xl">
          Como atuamos no tratamento de câncer e doenças infantis
        </h2>

        <div className="mt-10 space-y-6">
          {[
            {
              title: 'Apoio ao tratamento',
              desc: 'Muitas crianças precisam viajar para ter acesso ao tratamento adequado. Nós ajudamos com:',
              items: ['Exames, consultas e medicamentos emergenciais', 'Hospedagem próxima ao hospital', 'Fraldas, materiais e itens especiais'],
            },
            {
              title: 'Cuidado com a família',
              desc: 'Quando a mãe precisa deixar o trabalho, o impacto financeiro é enorme. Por isso, oferecemos:',
              items: ['Cestas básicas e auxílio alimentação', 'Ajuda emergencial para contas essenciais', 'Acolhimento emocional e espiritual'],
            },
            {
              title: 'Histórias reais',
              desc: 'Apresentamos cada campanha com detalhamento humano para que o doador tenha confiança de que a causa é real e a necessidade é urgente.',
              items: [],
            },
          ].map((block) => (
            <div
              key={block.title}
              className="rounded-[1.75rem] border p-7"
              style={{
                backgroundColor: 'hsl(var(--maos-surface))',
                borderColor: 'hsl(var(--maos-border))',
              }}
            >
              <h3 className="text-xl font-bold md:text-2xl">{block.title}</h3>
              <p className="mt-3 text-base leading-relaxed md:text-lg" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>{block.desc}</p>
              {block.items.length > 0 && (
                <ul className="mt-4 space-y-2 text-base" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
                  {block.items.map((item) => (
                    <li key={item}>&bull; {item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>


      <section
        className="py-16"
        style={{ backgroundColor: 'hsl(var(--maos-soft))' }}
      >
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <h2 className="text-center font-heading text-3xl font-bold md:text-5xl">
            Transparência e responsabilidade com cada doação
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div
              className="rounded-[1.75rem] border p-7"
              style={{ backgroundColor: 'hsl(var(--maos-surface))', borderColor: 'hsl(var(--maos-border))' }}
            >
              <h3 className="text-xl font-bold md:text-2xl">Como cuidamos dos recursos que recebemos</h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
                Por trás de cada doação existe um coração generoso confiando em nosso trabalho. Por isso, tratamos cada valor como algo sagrado. Nossa gestão envolve:
              </p>
              <ul className="mt-4 space-y-2 text-base" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
                <li>&bull; Análise e priorização das demandas mais urgentes</li>
                <li>&bull; Acompanhamento das famílias beneficiadas</li>
                <li>&bull; Organização interna dos comprovantes e relatórios</li>
              </ul>
            </div>

            <div
              className="rounded-[1.75rem] border p-7"
              style={{ backgroundColor: 'hsl(var(--maos-surface))', borderColor: 'hsl(var(--maos-border))' }}
            >
              <h3 className="text-xl font-bold md:text-2xl">Compromisso com quem doa e com quem recebe</h3>
              <p className="mt-3 text-base leading-relaxed" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
                Sempre que possível, compartilhamos <strong style={{ textDecoration: 'underline' }}>atualizações das campanhas</strong>, fotos, relatos das famílias e resultados alcançados. Assim, você consegue ver o impacto real da sua contribuição.
              </p>
              <p className="mt-3 text-base leading-relaxed" style={{ color: 'hsl(var(--maos-text) / 0.82)' }}>
                Nossa equipe e voluntários seguem princípios de ética, respeito e empatia, honrando a dignidade de cada criança e de cada família atendida.
              </p>
              <p className="mt-3 text-base font-bold" style={{ color: 'hsl(var(--maos-brand))' }}>
                Transparência não é um diferencial: é a base de tudo o que fazemos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16"
        style={{ backgroundColor: 'hsl(var(--maos-brand))' }}
      >
        <div className="mx-auto max-w-3xl px-4 text-center text-white md:px-6">
          <h2 className="font-heading text-3xl font-bold md:text-5xl">
            Quer caminhar com a Esperança Do Bem?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed opacity-90">
            Você pode se tornar parte dessa corrente de amor apoiando uma campanha ativa, fazendo uma doação via Pix ou divulgando nosso trabalho.
          </p>
          <p className="mt-4 text-lg leading-relaxed opacity-90">
            Quando você ajuda, Deus usa a sua vida para aliviar a dor de uma família inteira.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/funil/maos-que-acolhem#explore"
              className="rounded-xl border-2 border-white px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              Ver campanhas ativas
            </a>
            <a
              href="#pix"
              className="rounded-xl border-2 border-white px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              Doar pela Chave Pix
            </a>
          </div>
        </div>
      </section>

      <footer
        className="border-t py-10"
        style={{
          borderColor: 'hsl(var(--maos-border))',
          backgroundColor: 'hsl(var(--maos-text))',
          color: 'hsl(var(--maos-surface))',
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center md:px-6">
          <hr className="w-full max-w-md border-t" style={{ borderColor: 'hsl(var(--maos-surface) / 0.15)' }} />
          <p className="text-sm opacity-70">&copy; 2025 Projeto Mãos Que Acolhem</p>
          <p className="text-sm opacity-70">Todos os direitos reservados.</p>
        </div>
      </footer>

      <DonationNotifications />
    </div>
  );
};

export default SobreMaosQueAcolhem;
