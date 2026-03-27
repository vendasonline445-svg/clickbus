import { useState, useCallback } from "react";
import { Copy, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEMO_PIX_CODE = "00020101021226790014br.gov.bcb.pix2557brcode.sample.com/pix/v2/abc123-def456";

const steps = [
  "Abra o app do seu banco",
  'Na seção PIX, selecione "Pix Copia e Cola"',
  "Cole o código copiado",
  "Confirme o pagamento",
];

const CheckoutPixPage2 = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(DEMO_PIX_CODE).then(() => {
      setCopied(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => toast.error("Erro ao copiar"));
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] flex flex-col" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* ── Top bar ── */}
      <div className="bg-[hsl(220,14%,96%)] px-4 py-4 lg:px-8">
        <button className="flex items-center gap-1.5 text-sm text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,20%)]">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      {/* ── Content card ── */}
      <div className="flex-1 w-full max-w-[1100px] mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[hsl(220,14%,91%)] p-6 lg:p-10">

          <h1 className="text-2xl lg:text-3xl font-bold text-[hsl(142,55%,38%)] text-center mb-8">
            Finalize seu pagamento
          </h1>

          {/* Desktop: 2 columns — left: code+instructions, right: QR */}
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-8">

            {/* ── Mobile only: QR Code on top ── */}
            <div className="flex flex-col items-center lg:hidden">
              <QRCodeSVG value={DEMO_PIX_CODE} size={220} level="M" />
              <p className="text-sm text-[hsl(220,10%,50%)] text-center mt-3">
                Escaneie o código QR com a câmera do seu celular
              </p>
              <p className="text-base font-bold text-[hsl(142,55%,42%)] mt-4">Ou</p>
            </div>

            {/* ── Left: Code + Instructions ── */}
            <div className="space-y-6">
              {/* Código PIX */}
              <div>
                <h3 className="text-base font-bold text-[hsl(142,55%,38%)] mb-2">Código PIX</h3>
                <div className="border border-[hsl(220,14%,88%)] rounded-xl px-4 py-3 overflow-hidden">
                  <p className="text-sm text-[hsl(220,10%,30%)] truncate font-mono">{DEMO_PIX_CODE}</p>
                </div>
                <Button
                  onClick={handleCopy}
                  className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-[hsl(142,55%,42%)] hover:bg-[hsl(142,55%,36%)] text-white"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Código copiado!" : "Copiar código PIX"}
                </Button>
              </div>

              {/* Instruções */}
              <div>
                <h3 className="text-base font-bold text-[hsl(142,55%,38%)] mb-4">Instruções</h3>
                <div className="space-y-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="flex items-center justify-center h-7 w-7 rounded-md bg-[hsl(142,55%,42%)] text-white text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[hsl(220,10%,25%)] pt-1 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aguardando */}
              <div className="border-2 border-[hsl(142,55%,50%)] rounded-xl p-4">
                <p className="text-sm font-bold text-[hsl(142,55%,38%)]">Aguardando pagamento</p>
                <p className="text-sm text-[hsl(220,10%,45%)] mt-1">
                  Após o pagamento, aguarde alguns segundos para a confirmação.
                </p>
              </div>

              {/* Já fiz o pagamento */}
              <Button className="w-full h-12 text-sm font-bold rounded-xl bg-[hsl(230,65%,52%)] hover:bg-[hsl(230,65%,45%)] text-white">
                Já fiz o pagamento
              </Button>
            </div>

            {/* ── Desktop only: QR Code on right ── */}
            <div className="hidden lg:flex flex-col items-center pt-6">
              <QRCodeSVG value={DEMO_PIX_CODE} size={220} level="M" />
              <p className="text-sm text-[hsl(220,10%,50%)] text-center mt-3">
                Escaneie o código QR com a câmera do seu celular
              </p>
              <p className="text-base font-bold text-[hsl(142,55%,42%)] mt-4">Ou</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPixPage2;
