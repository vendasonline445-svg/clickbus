import { useState, useCallback } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 9) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (d.length > 3) return d.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  return d;
};

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length > 6) return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  if (d.length > 2) return d.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  return d;
};

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const LogoIcon = () => (
  <div className="h-14 w-14 lg:h-24 lg:w-24 rounded-full bg-[hsl(170,35%,38%)] flex items-center justify-center shadow-md">
    <svg viewBox="0 0 40 40" className="h-8 w-8 lg:h-12 lg:w-12 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <rect x="8" y="16" width="24" height="18" rx="1" />
      <line x1="12" y1="16" x2="12" y2="34" />
      <line x1="20" y1="16" x2="20" y2="34" />
      <line x1="28" y1="16" x2="28" y2="34" />
      <path d="M6 16L20 6L34 16" />
    </svg>
  </div>
);

const CheckoutTemplate = () => {
  const [form, setForm] = useState({ email: "", phone: "", name: "", cpf: "" });
  const [noEmail, setNoEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(true);

  const product = { name: "Imposto", subtitle: "Aguardando Pagamento", qty: 1, price: 87.24 };

  const updateField = useCallback((field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!noEmail && !isValidEmail(form.email)) e.email = "E-mail inválido";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Telefone inválido";
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (form.cpf.replace(/\D/g, "").length < 11) e.cpf = "CPF inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    toast.success("Redirecionando para pagamento PIX...");
  };

  const inputClass = (field: string) =>
    `mt-1.5 h-12 rounded-lg border-[hsl(220,14%,85%)] bg-white text-sm placeholder:text-[hsl(220,10%,72%)] focus-visible:ring-1 focus-visible:ring-[hsl(220,14%,70%)] ${errors[field] ? "border-red-400" : ""}`;

  /* ── Cart card (reused mobile + desktop) ── */
  const CartCard = ({ collapsible = false }: { collapsible?: boolean }) => (
    <div className="bg-white rounded-xl shadow-sm border border-[hsl(220,14%,91%)] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[hsl(220,25%,18%)]">Seu carrinho</h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[hsl(200,65%,50%)] text-white text-xs font-bold">
            {product.qty}
          </span>
          {collapsible && (
            <button onClick={() => setCartOpen(!cartOpen)} className="text-[hsl(220,10%,40%)]">
              {cartOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
      {(!collapsible || cartOpen) && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-lg bg-[hsl(220,55%,48%)] flex items-center justify-center shrink-0">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[hsl(220,25%,18%)]">{product.name}</p>
              <p className="text-xs text-[hsl(220,10%,55%)]">{product.subtitle}</p>
            </div>
            <span className="text-sm text-[hsl(220,10%,50%)]">{product.qty} un.</span>
          </div>
          <div className="border-t border-dashed border-[hsl(220,14%,88%)] pt-3 space-y-2">
            <div className="flex justify-between text-sm text-[hsl(220,10%,45%)]">
              <span>Subtotal</span>
              <span>R$ {product.price.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-semibold text-[hsl(220,25%,18%)]">Total</span>
              <span className="text-lg font-bold text-[hsl(220,25%,18%)]">R$ {product.price.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── Header — Logo + Badge ── */}
      <div className="bg-white px-4 py-4 lg:px-8 lg:py-6 flex items-center justify-between">
        <LogoIcon />
        <div className="flex items-center gap-2 lg:hidden">
          <ShieldCheck className="h-6 w-6 text-[hsl(142,60%,38%)]" strokeWidth={2.5} />
          <div className="leading-tight">
            <p className="text-[10px] font-extrabold text-[hsl(142,60%,32%)] uppercase tracking-wider">Pagamento</p>
            <p className="text-[10px] font-extrabold text-[hsl(142,60%,32%)] uppercase tracking-wider">100% Seguro</p>
          </div>
        </div>
      </div>

      {/* ── Alert banner ── */}
      <div className="bg-[hsl(215,30%,28%)] text-white text-center px-5 py-4">
        <p className="text-[13px] leading-relaxed max-w-3xl mx-auto">
          Atenção: Caso o pagamento não seja efetuado agora multas serão aplicadas em seu cpf.
          Garanta seu recebimento imediato—pague agora e tenha o valor em sua conta em até 3 minutos.
          Após o Pagamento, volte nesta pagina para darmos continuidade no resgate.
        </p>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* ── Left column ── */}
        <div className="space-y-4 order-2 lg:order-1">
          {/* Mobile cart */}
          <div className="lg:hidden">
            <CartCard collapsible />
          </div>

          {/* Identificação */}
          <div className="bg-white rounded-xl shadow-sm border border-[hsl(220,14%,91%)] p-5">
            <h2 className="text-[15px] font-bold text-[hsl(220,25%,18%)] mb-5">Identificação</h2>
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
              <div>
                <Label className="text-sm font-semibold text-[hsl(220,15%,22%)]">E-mail</Label>
                <Input placeholder="email@email.com" value={form.email} disabled={noEmail} onChange={(e) => updateField("email", e.target.value)} className={inputClass("email")} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox id="no-email" checked={noEmail} onCheckedChange={(c) => { setNoEmail(!!c); if (c) updateField("email", ""); }} className="h-4 w-4 rounded border-[hsl(220,14%,80%)] data-[state=checked]:bg-[hsl(200,65%,50%)]" />
                  <label htmlFor="no-email" className="text-sm text-[hsl(220,10%,55%)] cursor-pointer">Não tenho e-mail</label>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-[hsl(220,15%,22%)]">Telefone</Label>
                <Input placeholder="(99) 99999-9999" value={form.phone} onChange={(e) => updateField("phone", maskPhone(e.target.value))} className={inputClass("phone")} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[hsl(220,15%,22%)]">Nome completo</Label>
                <Input placeholder="Nome e Sobrenome" value={form.name} onChange={(e) => updateField("name", e.target.value)} className={inputClass("name")} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[hsl(220,15%,22%)]">CPF</Label>
                <Input placeholder="123.456.789-12" value={form.cpf} onChange={(e) => updateField("cpf", maskCPF(e.target.value))} className={inputClass("cpf")} />
                {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-white rounded-xl shadow-sm border border-[hsl(220,14%,91%)] p-5">
            <h2 className="text-[15px] font-bold text-[hsl(220,25%,18%)] mb-4">Pagamento</h2>
            <button className="flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-[hsl(170,55%,45%)] bg-[hsl(170,50%,97%)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M11.3 7.1L10 5.8L8.7 7.1L7.1 5.5L5.5 7.1L7.1 8.7L5.8 10L7.1 11.3L5.5 12.9L7.1 14.5L8.7 12.9L10 14.2L11.3 12.9L12.9 14.5L14.5 12.9L12.9 11.3L14.2 10L12.9 8.7L14.5 7.1L12.9 5.5L11.3 7.1Z" fill="hsl(170,60%,40%)"/>
              </svg>
              <span className="text-sm font-bold text-[hsl(170,60%,35%)]">Pix</span>
            </button>
            <div className="mt-4 bg-[hsl(220,14%,97%)] border border-[hsl(220,14%,91%)] rounded-lg p-4">
              <p className="text-[13px] text-[hsl(220,10%,45%)] leading-relaxed">
                Ao selecionar o Pix, você será encaminhado para um ambiente seguro para finalizar seu pagamento.
              </p>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 mt-4 text-sm font-bold bg-[hsl(142,60%,42%)] hover:bg-[hsl(142,60%,36%)] text-white rounded-lg">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </span>
              ) : "Finalizar pagamento"}
            </Button>
          </div>

          {/* Mobile badge */}
          <div className="flex items-center justify-center gap-2 py-3 lg:hidden">
            <ShieldCheck className="h-4 w-4 text-[hsl(142,60%,42%)]" />
            <span className="text-xs font-medium text-[hsl(220,10%,50%)]">Ambiente seguro</span>
          </div>
        </div>

        {/* ── Right column (desktop only) ── */}
        <div className="hidden lg:flex lg:flex-col lg:gap-4 order-2">
          <CartCard />
          <div className="flex items-center justify-center gap-2 bg-white rounded-full shadow-sm border border-[hsl(220,14%,91%)] px-5 py-2.5 w-fit mx-auto">
            <ShieldCheck className="h-5 w-5 text-[hsl(142,60%,42%)]" />
            <span className="text-sm font-medium text-[hsl(220,15%,25%)]">Ambiente seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTemplate;
