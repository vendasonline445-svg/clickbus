import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowUpDown, ArrowLeftRight, Calendar, Users, Tag, Star, Shield, Award, MessageCircle, ThumbsUp, Phone, Menu, Navigation, ChevronDown, ChevronUp, Facebook, Youtube, Instagram, Crown, Percent, ClipboardList, CircleHelp, Compass, User, X, ChevronRight } from "lucide-react";
import CityAutocomplete from "@/components/CityAutocomplete";
import DualCalendarPicker from "@/components/DualCalendarPicker";
import { Button } from "@/components/ui/button";
import BusLoadingOverlay from "@/components/BusLoadingOverlay";
import clickbusLogo from "@/assets/clickbus-logo.webp";
import ticketLeft from "@/assets/ticket-left.png";
import ticketRight from "@/assets/ticket-right.png";
import cadasturLogo from "@/assets/cadastur-logo.png";
import bannerPascoa from "@/assets/clickbus-banner-pascoa.png";
import clickOfertaBadge from "@/assets/click-oferta-badge.png";
import imgRio from "@/assets/clickbus-rio.jpg";
import imgSP from "@/assets/clickbus-sp.jpg";
import imgBH from "@/assets/clickbus-bh.jpg";
import imgCuritiba from "@/assets/clickbus-curitiba.jpg";

const bestPriceRoutes = [
  { img: imgCuritiba, to: "Curitiba, PR", price: "89", cents: "90" },
  { img: imgRio, to: "Rio de Janeiro, RJ", price: "69", cents: "90" },
  { img: imgBH, to: "Belo Horizonte, MG", price: "109", cents: "90" },
  { img: imgSP, to: "Ilha Comprida, SP", price: "64", cents: "90" },
];

const popularRoutes = [
  { img: imgRio, to: "Rio de Janeiro, RJ", price: "74", cents: "90" },
  { img: imgBH, to: "Belo Horizonte, MG", price: "119", cents: "90" },
  { img: imgCuritiba, to: "Curitiba, PR", price: "94", cents: "90" },
  { img: imgSP, to: "São Paulo, SP", price: "62", cents: "90" },
];

const testimonials = [
  { name: "Maria S.", city: "São Paulo, SP", text: "Super rápido e fácil de comprar. Melhor preço que encontrei para ir pro Rio. Já comprei 5 vezes e nunca tive problema!" },
  { name: "Carlos A.", city: "Belo Horizonte, MG", text: "Atendimento excelente pelo WhatsApp, me ajudaram na hora. Passagem confirmada em minutos. Recomendo demais!" },
  { name: "Juliana R.", city: "Curitiba, PR", text: "Preços imbatíveis e pagamento fácil pelo PIX. A confirmação é instantânea. Viajo sempre pela ClickBus!" },
];

const features = [
  { icon: Shield, title: "Compra 100% Segura", desc: "Seus dados protegidos com criptografia de ponta a ponta" },
  { icon: Award, title: "Empresa Premiada", desc: "Reconhecida pelo Reclame Aqui como empresa de excelência" },
  { icon: MessageCircle, title: "Suporte Humanizado", desc: "Atendimento via WhatsApp para tirar todas suas dúvidas" },
  { icon: ThumbsUp, title: "Satisfação Garantida", desc: "Mais de 98% dos clientes recomendam nossos serviços" },
];

const stats = [
  { value: "2M+", label: "Passagens vendidas" },
  { value: "4.8", label: "Avaliação dos clientes" },
  { value: "200+", label: "Empresas parceiras" },
  { value: "4.800", label: "Destinos no Brasil" },
];

function RouteCard({ route, showBadge = true }: { route: typeof bestPriceRoutes[0]; showBadge?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img src={route.img} alt={route.to} className="w-full h-52 object-cover" />
        {showBadge && (
          <img src={clickOfertaBadge} alt="Click Oferta" className="absolute top-3 left-3 h-7 shadow rounded" />
        )}
      </div>
      <div className="p-4 pb-5">
        {/* Origin */}
        <div className="flex items-center gap-2.5 text-sm text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-[#7c3aed] bg-white shrink-0" />
          São Paulo, SP
        </div>
        {/* Vertical line connector */}
        <div className="ml-[4.5px] w-px h-3 bg-[#7c3aed] my-0.5" />
        {/* Destination */}
        <div className="flex items-center gap-2.5 text-base font-bold text-gray-900">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shrink-0" />
          {route.to}
        </div>
        <p className="text-xs text-gray-400 mt-3">A partir de</p>
        <p className="text-4xl font-black text-gray-900 leading-none mt-1">
          {route.price}<span className="text-lg align-top">,{route.cents}</span>
        </p>
      </div>
    </div>
  );
}

export default function ClickBusPage() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"ida" | "idaVolta">("ida");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [passageiros, setPassageiros] = useState(1);
  const [showCookies, setShowCookies] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBusLoading, setShowBusLoading] = useState(false);

  const swap = () => {
    const tmp = origem;
    setOrigem(destino);
    setDestino(tmp);
  };

  const handleChangeIda = (value: string) => {
    setDataIda(value);
  };

  const handleChangeVolta = (value: string) => {
    setDataVolta(value);
    if (value) setTripType("idaVolta");
  };

  const formatDateForUrl = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleBuscar = () => {
    setShowBusLoading(true);
  };

  const doNavigate = () => {
    const params = new URLSearchParams();
    if (origem) params.set("origem", origem);
    if (destino) params.set("destino", destino);
    if (dataIda) params.set("dataIda", formatDateForUrl(dataIda));
    if (dataVolta) params.set("dataVolta", formatDateForUrl(dataVolta));
    navigate(`/clickbus/resultados?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans" style={{ colorScheme: 'light' }}>
      {showBusLoading && (
        <BusLoadingOverlay
          message="Buscando passagens"
          duration={2000}
          onComplete={doNavigate}
        />
      )}
      {/* Barra Mês do Consumidor */}
      <div className="bg-clickbus-brand text-white text-center text-sm font-semibold py-2 px-4">
        🎉 Mês do Consumidor — Passagens com até <span className="underline decoration-2 underline-offset-2">40% OFF</span>! Aproveite os melhores preços do ano.
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <img src={clickbusLogo} alt="ClickBus" className="h-8 md:h-10" />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900">
              <Crown className="w-4 h-4" /> Clube ClickBus
              <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-bold ml-0.5">Novo!</span>
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><Percent className="w-4 h-4" /> Ofertas</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><ClipboardList className="w-4 h-4" /> Pedidos</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><CircleHelp className="w-4 h-4" /> Ajuda</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><Compass className="w-4 h-4" /> Explorar <ChevronDown className="w-3.5 h-3.5" /></a>
            <button className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-800">
              <User className="w-4 h-4" /> Entrar <span className="text-gray-400">|</span> <span className="text-gray-300 text-xs">ativar cashback</span>
            </button>
          </nav>

          {/* Mobile nav */}
          <div className="flex lg:hidden items-center gap-3">
            <button className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-2 text-xs font-medium">
              <User className="w-3.5 h-3.5" /> Entrar <span className="text-gray-400">|</span> <span className="text-gray-400 text-[10px]">ativar cashback</span>
            </button>
            <button className="text-gray-700" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                {/* Close button */}
                <div className="flex justify-end p-4">
                  <button onClick={() => setMobileMenuOpen(false)} className="text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="px-6 pb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Olá, viajante</h2>

                  {/* Login card */}
                  <div className="border border-gray-200 rounded-xl p-5 mb-6">
                    <p className="text-sm text-gray-600 mb-4">Entre com sua conta para começar</p>
                    <button className="w-full bg-[#7c3aed] text-white rounded-full py-3 text-base font-bold mb-3">
                      Entrar na conta
                    </button>
                    <p className="text-sm text-gray-500 text-center">
                      Ainda não tem uma conta? <span className="text-[#7c3aed] font-medium">Criar conta</span>
                    </p>
                  </div>

                  {/* Menu items group 1 */}
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 mb-4">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-[#7c3aed]" />
                        <span className="font-medium text-gray-900">Clube ClickBus</span>
                        <span className="text-[10px] bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">Novo!</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-5 h-5 text-[#7c3aed]" />
                        <span className="font-medium text-gray-900">Pedidos</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CircleHelp className="w-5 h-5 text-[#7c3aed]" />
                        <span className="font-medium text-gray-900">Ajuda</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Menu items group 2 */}
                  <div className="border border-gray-200 rounded-xl divide-y divide-gray-200">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-[#7c3aed]" />
                        <span className="font-medium text-gray-900">Ofertas</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Compass className="w-5 h-5 text-[#7c3aed]" />
                        <span className="font-medium text-gray-900">Explorar</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-clickbus-brand">
        <div className="mx-auto w-full max-w-[1440px]">
          <img
            src={bannerPascoa}
            alt="Promoção de Páscoa - 5% OFF com cupom GANHEI5"
            className="h-[148px] w-full object-cover object-center md:h-[240px]"
          />
        </div>
      </section>

      {/* Search Card */}
      <div className="relative z-10 mx-auto mb-16 max-w-[1440px] px-4 -mt-6 md:-mt-16">
        <div className="mx-auto max-w-[1380px] rounded-[2.1rem] border border-white/70 bg-white p-5 shadow-[0_24px_80px_hsl(224_31%_16%_/_0.14)] md:p-8">
          {/* Desktop layout */}
          <div className="hidden md:block">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-5">
              <h2 className="whitespace-nowrap text-[2rem] font-black leading-none text-clickbus-ink">Compre sua passagem de ônibus</h2>
              <div className="flex items-center gap-8 pr-2 text-[15px] text-clickbus-muted">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked={tripType === "ida"} onChange={() => setTripType("ida")} className="h-5 w-5 accent-clickbus-brand" />
                  <span className="font-medium text-clickbus-muted">Somente Ida</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" checked={tripType === "idaVolta"} onChange={() => setTripType("idaVolta")} className="h-5 w-5 accent-clickbus-brand" />
                  <span className="font-medium text-clickbus-muted">Ida e Volta</span>
                </label>
              </div>
            </div>

            <div className="overflow-visible rounded-[2rem] border border-clickbus-line bg-white">
              <div className="grid min-h-[132px] grid-cols-[minmax(0,1.18fr)_72px_minmax(0,1.18fr)_320px_210px] items-stretch rounded-[2rem]">
                <div className="flex min-w-0 items-center border-r border-clickbus-line px-8 py-5">
                  <CityAutocomplete value={origem} onChange={setOrigem} placeholder="De onde você vai sair?" icon={<MapPin className="w-4 h-4 text-clickbus-brand" />} label="Selecione de onde você vai sair" />
                </div>

                <div className="flex items-center justify-center border-r border-clickbus-line bg-white px-2">
                  <button
                    onClick={swap}
                    className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-clickbus-brand text-white shadow-lg transition-colors hover:bg-clickbus-brand-strong"
                    aria-label="Inverter origem e destino"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex min-w-0 items-center border-r border-clickbus-line px-8 py-5">
                  <CityAutocomplete value={destino} onChange={setDestino} placeholder="Para onde você vai?" icon={<Navigation className="w-4 h-4 text-clickbus-brand" />} label="Selecione para onde você vai" />
                </div>

                <div className="flex items-stretch border-r border-clickbus-line">
                  <DualCalendarPicker valueIda={dataIda} valueVolta={dataVolta} onChangeIda={handleChangeIda} onChangeVolta={handleChangeVolta} hasReturn={tripType === "idaVolta"} />
                </div>

                <div className="p-3">
                  <Button onClick={handleBuscar} className="h-full min-h-[108px] w-full rounded-[1.6rem] bg-clickbus-brand text-xl font-bold text-primary-foreground shadow-lg transition-all hover:bg-clickbus-brand-strong hover:shadow-xl">
                    Buscar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden">
            <h2 className="mb-5 text-center text-base font-bold text-gray-900">Compre sua passagem de ônibus</h2>
            <div className="relative mb-4 rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 p-4">
                <CityAutocomplete value={origem} onChange={setOrigem} placeholder="De onde você vai sair?" icon={<MapPin className="w-3 h-3 text-clickbus-brand" />} label="Origem" />
              </div>
              <div className="p-4">
                <CityAutocomplete value={destino} onChange={setDestino} placeholder="Para onde você vai?" icon={<Navigation className="w-3 h-3 text-clickbus-brand" />} label="Destino" />
              </div>
              <button onClick={swap} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-clickbus-brand text-primary-foreground shadow-md">
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={tripType === "ida"} onChange={() => setTripType("ida")} className="h-4 w-4 accent-clickbus-brand" />
                Somente Ida
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={tripType === "idaVolta"} onChange={() => setTripType("idaVolta")} className="h-4 w-4 accent-clickbus-brand" />
                Ida e Volta
              </label>
            </div>

            <div className="mb-4 overflow-visible rounded-xl border border-gray-200 bg-white">
              <DualCalendarPicker valueIda={dataIda} valueVolta={dataVolta} onChangeIda={handleChangeIda} onChangeVolta={handleChangeVolta} hasReturn={tripType === "idaVolta"} />
            </div>

            <Button onClick={handleBuscar} className="h-12 w-full rounded-xl bg-clickbus-brand text-base font-bold text-primary-foreground hover:bg-clickbus-brand-strong">
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Best Prices */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Passagens de ônibus em oferta</h2>
          <button className="border border-[#7c3aed] text-[#7c3aed] text-sm font-medium rounded-full px-4 py-1.5 hover:bg-[#7c3aed]/5 whitespace-nowrap">Acessar mais</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestPriceRoutes.map((r, i) => <RouteCard key={i} route={r} />)}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">* Os valores exibidos são referência a partir de São Paulo, SP e podem variar de acordo com a sua localização, data e disponibilidade.</p>
      </section>

      {/* Popular Destinations */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Passagens de Ônibus para Destinos Populares</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoutes.map((r, i) => <RouteCard key={i} route={r} showBadge={false} />)}
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">* Valores de referência saindo de São Paulo, SP. Preços sujeitos a alteração conforme origem, data e disponibilidade.</p>
      </section>

      {/* Promotional Banners */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ClickBônus */}
          <div className="bg-[#7c3aed] rounded-2xl p-8 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between">
            <div>
              <div className="bg-white text-gray-900 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 text-sm font-bold mb-6">
                ClickBônus
              </div>
              <h3 className="text-3xl font-black leading-tight mb-4">Comprou,<br/>embarcou,<br/>ganhou!</h3>
              <p className="text-sm font-semibold opacity-90">Passagens ClickBus valem descontos exclusivos de grandes marcas</p>
            </div>
            <p className="text-xs opacity-60 mt-6">Confira as cidades participantes no link da bio no Instagram: @ClickBus</p>
            <div className="absolute right-0 bottom-0 w-32 h-48 bg-white/10 rounded-tl-[80px]" />
          </div>

          {/* Prêmio Reclame Aqui */}
          <div className="bg-[#7c3aed] rounded-2xl p-8 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between border-2 border-white/20">
            <div className="flex justify-end mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black leading-tight mb-3">Atendimento Tetracampeão no Prêmio Reclame Aqui 2025!</h3>
              <p className="text-sm opacity-90">A ClickBus é o app pra comprar passagem de ônibus que cuida da sua viagem!</p>
            </div>
          </div>

          {/* Cashback */}
          <div className="bg-[#7c3aed] rounded-2xl p-8 text-white relative overflow-hidden min-h-[320px] flex flex-col justify-between">
            <h3 className="text-2xl font-black leading-tight italic">Seu dinheiro<br/>de volta<br/>viajando<br/>de ônibus!</h3>
            <div className="flex items-center gap-3 mt-6">
              <div className="w-14 h-14 border-2 border-gray-900 rounded-full flex items-center justify-center bg-transparent">
                <span className="text-gray-900 text-2xl font-black">$</span>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 leading-tight">Cashback</p>
                <p className="text-2xl font-black text-gray-900 leading-tight">ClickBus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clube ClickBus Banner */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <div className="relative bg-[#3b1578] rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between px-8 py-8 md:py-6">
          {/* Ticket left */}
          <img src={ticketLeft} alt="" className="hidden md:block absolute top-2 left-4 w-20 opacity-80 -rotate-12" />
          {/* Left text */}
          <div className="text-white text-center md:text-left z-10 md:pl-20 mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <Crown className="w-6 h-6" />
              <span className="font-bold text-lg">clube <span className="text-purple-300">clickbus</span></span>
            </div>
            <p className="text-sm text-gray-200">O benefício certo para<br />quem viaja muuuito</p>
          </div>
          {/* Right CTA */}
          <div className="bg-white rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center gap-4 z-10">
            <p className="text-gray-800 font-semibold text-sm md:text-base text-center sm:text-left">Cupons especiais, desconto maior em<br className="hidden sm:block" /> passagens ClickOferta e muito mais</p>
            <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full px-6 whitespace-nowrap">Conhecer Clube</Button>
          </div>
          {/* Ticket right */}
          <img src={ticketRight} alt="" className="hidden md:block absolute bottom-2 right-4 w-20 opacity-80 rotate-12" />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12 mb-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl md:text-4xl font-bold text-[#7c3aed]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-4 mb-16">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">O Que Nossos Clientes Dizem</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-gray-600 italic mb-4">"{t.text}"</p>
              <p className="font-semibold text-sm text-gray-900">{t.name}</p>
              <p className="text-xs text-gray-500">{t.city}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why ClickBus */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Por Que Escolher a ClickBus?</h2>
          <p className="text-sm text-gray-500 mb-10">Somos referência em venda de passagens de ônibus online no Brasil.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <f.icon className="w-10 h-10 text-[#7c3aed] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-bold text-sm text-gray-900 mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top section: Logo + columns */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-10">
            {/* Logo + Atendimento */}
            <div className="col-span-2 md:col-span-1">
              <img src={clickbusLogo} alt="ClickBus" className="h-12 mb-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Central de atendimento</h4>
              <p className="text-xs text-gray-500 mb-3">Todos os dias 07h às 22h.</p>
              <button className="border border-gray-300 rounded-full px-4 py-1.5 text-xs text-gray-700 hover:border-[#7c3aed]">Acessar atendimento</button>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">ClickBus</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><a href="#" className="hover:text-[#7c3aed]">Sobre a ClickBus</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Imprensa</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Baixar o aplicativo</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Trabalhe na ClickBus</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Blog Tô de Passagem</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Ação social: BusTransforma</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Junte-se a nós</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Links úteis</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><a href="#" className="hover:text-[#7c3aed]">Destinos</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Rodoviárias</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Viações</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Passagens promocionais</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Cupons de desconto</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Como organizar uma viagem</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Guias de Viagem</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><a href="#" className="hover:text-[#7c3aed]">Guia de destino São Paulo</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Guia de destino Rio de Janeiro</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Guia de destino Belo Horizonte</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Guia de destino Salvador</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Guia de destino Recife</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Guia de destino Fortaleza</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Informações</h4>
              <ul className="space-y-2 text-xs text-gray-600">
                <li><a href="#" className="hover:text-[#7c3aed]">Dúvidas frequentes</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Regulamento de ofertas</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Regulamento promoção R$0,11</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Destinos internacionais</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">Canal de transparência</a></li>
                <li><a href="#" className="hover:text-[#7c3aed]">ClickBus é confiável?</a></li>
              </ul>
            </div>
          </div>

          {/* Middle section: Apps, socials, payment, cadastur */}
          <div className="border-t border-gray-200 pt-6 pb-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white text-[10px] rounded-lg px-3 py-2 flex items-center gap-1.5 font-medium">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12L3.84 21.85C3.34 21.61 3 21.09 3 20.5ZM16.81 15.12L6.05 21.34L14.54 12.85L16.81 15.12ZM20.16 10.81C20.5 11.08 20.75 11.5 20.75 12C20.75 12.5 20.5 12.92 20.16 13.19L17.89 14.5L15.39 12L17.89 9.5L20.16 10.81ZM6.05 2.66L16.81 8.88L14.54 11.15L6.05 2.66Z"/></svg> Google Play
              </div>
              <div className="bg-gray-900 text-white text-[10px] rounded-lg px-3 py-2 flex items-center gap-1.5 font-medium">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.81 11.78 5.72 12.57 5.72C13.36 5.72 14.85 4.62 16.42 4.81C17.09 4.84 18.89 5.09 20.02 6.76C19.93 6.82 17.77 8.04 17.8 10.59C17.83 13.65 20.52 14.63 20.55 14.64C20.52 14.73 20.12 16.12 19.15 17.55C18.35 18.72 17.52 19.88 16.27 19.9L18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/></svg> App Store
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Facebook className="w-5 h-5 hover:text-[#7c3aed] cursor-pointer" />
              <Youtube className="w-5 h-5 hover:text-[#7c3aed] cursor-pointer" />
              <svg className="w-5 h-5 hover:text-[#7c3aed] cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              <Instagram className="w-5 h-5 hover:text-[#7c3aed] cursor-pointer" />
              <svg className="w-5 h-5 hover:text-[#7c3aed] cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              <svg className="w-5 h-5 hover:text-[#7c3aed] cursor-pointer" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.82 7.87h-1.928c-.716 0-.855.352-.855.855v1.118h2.783l-.357 2.855h-2.426V19.5H12.18v-6.802H9.737V9.843h2.444V8.283c0-2.426 1.481-3.747 3.644-3.747 1.036 0 1.927.077 2.186.112v2.222z"/></svg>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
              <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px]">VISA</span>
              <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px]">AMEX</span>
              <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px]">elo</span>
              <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px]">Diners</span>
              <span className="border border-gray-300 rounded px-1.5 py-0.5 text-[10px]">Hipercard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">Compra 100% Segura</span>
              <img src={cadasturLogo} alt="Cadastur" className="h-6" />
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-200 pt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>© ClickBus 2026</span>
              <a href="#" className="hover:text-[#7c3aed]">Política de Privacidade</a>
              <a href="#" className="hover:text-[#7c3aed]">Política de Cookies</a>
              <a href="#" className="hover:text-[#7c3aed]">Termos de Uso</a>
            </div>
            <p className="text-sm text-gray-500 italic">Viajar muda a gente.</p>
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      {showCookies && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-6 md:hidden">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Podemos coletar cookies?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Coletamos cookies para apresentar ofertas e condições personalizadas para você. Se clicar em aceitar, você concorda com isso. Você pode ler a{" "}
              <a href="#" className="text-gray-900 underline">Política de cookies</a> ou acessar nossa{" "}
              <a href="#" className="text-gray-900 underline">Política de privacidade</a>
            </p>
            <div className="flex items-center gap-4 justify-center">
              <button onClick={() => setShowCookies(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900 px-6 py-2.5">
                Não aceitar
              </button>
              <button onClick={() => setShowCookies(false)} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full px-8 py-2.5 text-sm font-bold">
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}