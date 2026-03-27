import { useState, useEffect, useCallback } from "react";
import { Copy, ChevronUp, ChevronDown, FileText, Lock, CheckCircle, QrCode, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEMO_PIX_CODE = "00020101021226940014br.gov.bcb.pix2572qrcode.sample.com/pix/v2/abc123-def456-ghi789";

const LogoIcon = () => (
  <div className="h-12 w-12 rounded-full bg-[hsl(170,35%,38%)] flex items-center justify-center shadow-md">
    <svg viewBox="0 0 40 40" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <rect x="8" y="16" width="24" height="18" rx="1" />
      <line x1="12" y1="16" x2="12" y2="34" />
      <line x1="20" y1="16" x2="20" y2="34" />
      <line x1="28" y1="16" x2="28" y2="34" />
      <path d="M6 16L20 6L34 16" />
    </svg>
  </div>
);

const CheckoutPixPage = () => {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 min
  const [copied, setCopied] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const price = 87.24;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(DEMO_PIX_CODE).then(() => {
      setCopied(true);
      toast.success("Código copiado com sucesso!");
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      toast.error("Erro ao copiar");
    });
  }, []);

  const InstructionStep = ({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-3">
      <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-sm text-[hsl(220,10%,40%)] leading-relaxed pt-2">{children}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── Header with logo ── */}
      <div className="bg-white px-4 py-4 lg:px-8">
        <LogoIcon />
      </div>

      {/* ── Green divider ── */}
      <div className="h-1 bg-[hsl(152,55%,52%)]" />

      {/* ── Title ── */}
      <div className="text-center px-4 py-6 lg:py-8">
        <h1 className="text-xl lg:text-2xl font-bold text-[hsl(220,25%,18%)] leading-snug">
          Falta pouco! Para finalizar a compra,
          <br className="hidden lg:block" />{" "}
          <span className="lg:hidden">efetue o pagamento com PIX!</span>
          <span className="hidden lg:inline">escaneie o QR Code abaixo.</span>
        </h1>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-4 pb-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ── Left: PIX card ── */}
        <div className="bg-white rounded-xl border border-[hsl(220,14%,91%)] shadow-sm overflow-hidden">
          {/* Timer */}
          <div className="text-center py-4 border-b border-[hsl(220,14%,91%)]">
            <span className="text-sm text-[hsl(220,10%,45%)]">O código expira em: </span>
            <span className="text-base font-bold text-[hsl(0,70%,45%)]">{minutes}:{seconds}</span>
          </div>

          {/* QR Code (desktop) */}
          <div className="hidden lg:flex flex-col items-center py-8 border-b border-[hsl(220,14%,91%)]">
            <QRCodeSVG value={DEMO_PIX_CODE} size={220} level="M" />
          </div>

          {/* PIX Copia e Cola */}
          <div className="p-5 space-y-4">
            <p className="text-sm text-center text-[hsl(220,10%,35%)]">
              <span className="lg:hidden">Copie a chave abaixo e utilize a opção </span>
              <span className="hidden lg:inline">Se preferir, pague com a opção </span>
              <strong>PIX Copia e Cola:</strong>
            </p>

            <div className="border border-[hsl(220,14%,88%)] rounded-lg px-4 py-3">
              <p className="text-sm text-[hsl(220,10%,45%)] truncate font-mono">{DEMO_PIX_CODE}</p>
            </div>

            <Button
              onClick={handleCopy}
              className={`w-full h-12 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                copied
                  ? "bg-[hsl(220,20%,35%)] text-white"
                  : "bg-[hsl(152,55%,52%)] hover:bg-[hsl(152,55%,46%)] text-white"
              }`}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Código copiado com sucesso!" : "COPIAR CÓDIGO"}
            </Button>
          </div>

          {/* Value (mobile only) */}
          <div className="text-center py-3 border-t border-[hsl(220,14%,91%)] lg:hidden">
            <span className="text-sm text-[hsl(220,10%,40%)]">Valor a ser pago: </span>
            <span className="text-base font-bold text-[hsl(0,70%,45%)]">R$ {price.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          {/* Detalhes da compra */}
          <div className="bg-white rounded-xl border border-[hsl(220,14%,91%)] shadow-sm">
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="text-[15px] font-bold text-[hsl(220,25%,18%)]">Detalhes da compra:</h3>
              {detailsOpen ? <ChevronUp className="h-5 w-5 text-[hsl(220,10%,50%)]" /> : <ChevronDown className="h-5 w-5 text-[hsl(220,10%,50%)]" />}
            </button>
            {/* Desktop always shows value */}
            <div className={`px-4 pb-4 ${detailsOpen ? "" : "hidden lg:block"}`}>
              <div className="border-t border-[hsl(220,14%,91%)] pt-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-[hsl(220,10%,40%)]">Valor total:</span>
                  <span className="text-lg font-bold text-[hsl(0,70%,45%)]">R$ {price.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="mt-3 h-12 w-12 rounded-lg bg-[hsl(220,55%,48%)] flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Instruções para pagamento */}
          <div className="bg-white rounded-xl border border-[hsl(220,14%,91%)] shadow-sm">
            <button
              onClick={() => setInstructionsOpen(!instructionsOpen)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <h3 className="text-[15px] font-bold text-[hsl(220,25%,18%)]">Instruções para pagamento</h3>
              {instructionsOpen ? <ChevronUp className="h-5 w-5 text-[hsl(220,10%,50%)]" /> : <ChevronDown className="h-5 w-5 text-[hsl(220,10%,50%)]" />}
            </button>
            {instructionsOpen && (
              <div className="px-4 pb-5 space-y-4 border-t border-[hsl(220,14%,91%)] pt-4">
                <InstructionStep icon={Smartphone} color="bg-[hsl(152,45%,48%)]">
                  <span className="lg:hidden">Após copiar o código, abra seu aplicativo de pagamento onde você utiliza o Pix.</span>
                  <span className="hidden lg:inline">Abra o app do seu banco e entre no ambiente Pix</span>
                </InstructionStep>
                <InstructionStep icon={QrCode} color="bg-[hsl(152,45%,48%)]">
                  <span className="lg:hidden">Escolha a opção <strong>PIX Copia e Cola</strong> e insira o código copiado.</span>
                  <span className="hidden lg:inline">Escolha <strong>Pagar com QR Code</strong> e aponte a câmera para o código ao lado.</span>
                </InstructionStep>
                <InstructionStep icon={CheckCircle} color="bg-[hsl(152,45%,48%)]">
                  Confirme as informações e finalize sua compra.
                </InstructionStep>
              </div>
            )}
          </div>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-4 py-3">
            <div className="flex items-center gap-1.5">
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <path d="M11.3 7.1L10 5.8L8.7 7.1L7.1 5.5L5.5 7.1L7.1 8.7L5.8 10L7.1 11.3L5.5 12.9L7.1 14.5L8.7 12.9L10 14.2L11.3 12.9L12.9 14.5L14.5 12.9L12.9 11.3L14.2 10L12.9 8.7L14.5 7.1L12.9 5.5L11.3 7.1Z" fill="hsl(170,60%,40%)"/>
              </svg>
              <span className="text-sm font-bold text-[hsl(220,10%,40%)]">pix</span>
            </div>
            <div className="w-px h-5 bg-[hsl(220,14%,85%)]" />
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[hsl(220,10%,50%)]" />
              <div className="leading-tight">
                <p className="text-[10px] font-bold text-[hsl(220,10%,40%)]">Ambiente</p>
                <p className="text-[10px] font-bold text-[hsl(220,10%,40%)]">seguro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPixPage;
