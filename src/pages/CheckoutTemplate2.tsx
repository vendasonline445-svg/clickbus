import { useState, useCallback } from "react";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const maskCPF = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 14);
  if (d.length > 11) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
  if (d.length > 9) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  if (d.length > 6) return d.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (d.length > 3) return d.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  return d;
};

const CheckoutTemplate2 = () => {
  const [form, setForm] = useState({ name: "", cpf: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const product = { name: "Regularizar Entrega", price: 23.51 };

  const updateField = useCallback((field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome obrigatório";
    if (form.cpf.replace(/\D/g, "").length < 11) e.cpf = "CPF/CNPJ inválido";
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
    `mt-1.5 h-12 rounded-xl border-[hsl(220,14%,88%)] bg-white text-sm placeholder:text-[hsl(220,10%,72%)] focus-visible:ring-1 focus-visible:ring-[hsl(220,14%,70%)] ${errors[field] ? "border-red-400" : ""}`;

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Hero banner with logo placeholder ── */}
      <div className="w-full max-w-[1100px] mx-auto px-4 pt-5">
        <div className="bg-[hsl(220,10%,92%)] rounded-2xl flex items-center justify-center py-10 lg:py-16">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 lg:h-20 lg:w-20 rounded-lg bg-[hsl(18,85%,55%)] flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="h-10 w-10 lg:h-12 lg:w-12 text-white" fill="currentColor">
                <circle cx="14" cy="12" r="5" />
                <circle cx="26" cy="12" r="5" />
                <circle cx="20" cy="22" r="5" />
                <path d="M12 28L20 34L28 28" strokeWidth="3" stroke="currentColor" fill="none" />
              </svg>
            </div>
            <span className="text-3xl lg:text-5xl font-bold text-[hsl(220,25%,18%)] tracking-tight">logo shop</span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-4 py-5 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

        {/* ── Left column ── */}
        <div className="space-y-4 order-2 lg:order-1">

          {/* Mobile: Product summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-[hsl(220,14%,91%)] p-5 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(220,10%,92%)] flex items-center justify-center shrink-0 overflow-hidden">
                <span className="text-xs font-bold text-[hsl(220,10%,50%)]">LOGO</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[hsl(220,25%,18%)]">{product.name}</p>
              </div>
            </div>
            <div className="border-t border-[hsl(220,14%,91%)] mt-4 pt-3 flex justify-between items-baseline">
              <span className="text-sm text-[hsl(220,10%,40%)]">Valor</span>
              <span className="text-lg font-bold text-[hsl(220,25%,18%)]">R$ {product.price.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {/* Identificação */}
          <div className="bg-white rounded-2xl shadow-sm border border-[hsl(220,14%,91%)] p-5 lg:p-6">
            <h2 className="text-base font-bold text-[hsl(220,35%,25%)] mb-5">Identificação</h2>
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
              <div>
                <Label className="text-sm font-semibold text-[hsl(220,15%,22%)]">Nome completo</Label>
                <Input
                  placeholder="Digite seu nome completo"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={inputClass("name")}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label className="text-sm font-semibold text-[hsl(220,15%,22%)]">CPF/CNPJ</Label>
                <Input
                  placeholder="Digite seu CPF ou CNPJ"
                  value={form.cpf}
                  onChange={(e) => updateField("cpf", maskCPF(e.target.value))}
                  className={inputClass("cpf")}
                />
                {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-white rounded-2xl shadow-sm border border-[hsl(220,14%,91%)] p-5 lg:p-6">
            <h2 className="text-base font-bold text-[hsl(220,35%,25%)] mb-4">Pagamento</h2>

            {/* PIX button */}
            <button className="flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-[hsl(152,50%,60%)] bg-[hsl(152,50%,96%)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M11.3 7.1L10 5.8L8.7 7.1L7.1 5.5L5.5 7.1L7.1 8.7L5.8 10L7.1 11.3L5.5 12.9L7.1 14.5L8.7 12.9L10 14.2L11.3 12.9L12.9 14.5L14.5 12.9L12.9 11.3L14.2 10L12.9 8.7L14.5 7.1L12.9 5.5L11.3 7.1Z" fill="hsl(170,60%,40%)"/>
              </svg>
              <span className="text-sm font-bold text-[hsl(170,60%,35%)]">PIX</span>
            </button>

            {/* Info */}
            <div className="mt-5 border border-[hsl(220,14%,91%)] rounded-xl p-4">
              <p className="text-sm text-[hsl(220,10%,45%)] leading-relaxed">
                Ao selecionar o Pix, você será encaminhado para um ambiente seguro para finalizar seu pagamento.
              </p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 mt-5 text-sm font-bold uppercase tracking-wider rounded-xl bg-[hsl(35,85%,58%)] hover:bg-[hsl(35,85%,50%)] text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </span>
              ) : "FINALIZAR PAGAMENTO"}
            </Button>
          </div>
        </div>

        {/* ── Right column (desktop) ── */}
        <div className="order-1 lg:order-2 hidden lg:flex lg:flex-col lg:gap-4">
          {/* Product card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[hsl(220,14%,91%)] p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(220,10%,92%)] flex items-center justify-center shrink-0 overflow-hidden">
                <span className="text-xs font-bold text-[hsl(220,10%,50%)]">LOGO</span>
              </div>
              <p className="text-sm font-bold text-[hsl(220,25%,18%)]">{product.name}</p>
            </div>
            <div className="border-t border-[hsl(220,14%,91%)] mt-4 pt-3 flex justify-between items-baseline">
              <span className="text-sm text-[hsl(220,10%,40%)]">Valor</span>
              <span className="text-lg font-bold text-[hsl(220,25%,18%)]">R$ {product.price.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {/* Secure badge */}
          <div className="flex items-center justify-center gap-2 bg-white rounded-full shadow-sm border border-[hsl(220,14%,91%)] px-5 py-2.5 w-fit mx-auto">
            <ShieldCheck className="h-5 w-5 text-[hsl(142,60%,42%)]" />
            <span className="text-sm font-medium text-[hsl(220,15%,25%)]">Ambiente seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutTemplate2;
