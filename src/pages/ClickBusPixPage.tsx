import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Copy, Info, Crown, Percent, ClipboardList, CircleHelp, Compass, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import clickbusLogo from "@/assets/clickbus-logo.webp";
import cadasturLogo from "@/assets/cadastur-logo.png";

function generateOrderCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ClickBusPixPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const total = params.get("total") || "416,14";
  const email = params.get("email") || "";
  const pixCodeParam = params.get("pix_code") || "";
  const identifierParam = params.get("identifier") || "";

  const [orderCode] = useState(() => generateOrderCode());
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(30 * 60);

  const pixCode = pixCodeParam || "PIX_CODE_INDISPONIVEL";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const deadline = new Date(Date.now() + timer * 1000);
  const deadlineStr = `${String(deadline.getDate()).padStart(2, "0")}/${String(deadline.getMonth() + 1).padStart(2, "0")}/${deadline.getFullYear()} às ${String(deadline.getHours()).padStart(2, "0")}:${String(deadline.getMinutes()).padStart(2, "0")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans" style={{ colorScheme: "light" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <img
            src={clickbusLogo}
            alt="ClickBus"
            className="h-8 md:h-10 cursor-pointer"
            onClick={() => navigate("/clickbus")}
          />
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900">
              <Crown className="w-4 h-4" /> Clube ClickBus
              <span className="text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full font-bold ml-0.5">Novo!</span>
            </a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><Percent className="w-4 h-4" /> Ofertas</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><ClipboardList className="w-4 h-4" /> Pedidos</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><CircleHelp className="w-4 h-4" /> Ajuda</a>
            <a href="#" className="flex items-center gap-1.5 hover:text-gray-900"><Compass className="w-4 h-4" /> Explorar</a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1100px] mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 md:gap-8">
          {/* Left — Payment card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            {/* Title + spinner */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-bold text-gray-900">Aguardando o seu pagamento</h1>
              <Loader2 className="w-6 h-6 text-[#8629cc] animate-spin" />
            </div>

            {/* Deadline */}
            <p className="text-sm text-gray-500 text-center mb-1">Você tem que pagar até</p>
            <p className="text-sm font-bold text-gray-900 text-center mb-6">{deadlineStr}</p>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white border border-gray-100 rounded-xl">
                <QRCodeSVG value={pixCode} size={180} level="M" />
              </div>
            </div>

            {/* Copy button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-full px-6 py-3 text-sm font-bold transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copiado!" : "Copiar código Pix"}
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <p className="text-sm text-gray-500">
                Favorecido: <strong className="text-gray-900">R TORRES SERVIÇOS RODOVIÁRIOS LTDA</strong>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Valor total: <strong className="text-gray-900">R$ {total}</strong>
              </p>
            </div>

            {/* Warning box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Pague para garantir a sua viagem</p>
                <p className="text-sm text-gray-600">
                  Assim que a sua compra for confirmada, você vai receber um e-mail com todos os detalhes da sua viagem
                  {email && <> em <strong className="text-gray-900">{email}</strong></>}.
                </p>
              </div>
            </div>
          </div>

          {/* Right — Order info + instructions */}
          <div className="flex flex-col gap-6">
            {/* Order code */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Código do pedido:</p>
              <p className="text-2xl font-black text-gray-900 tracking-wide">{orderCode}</p>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-base font-bold text-gray-900 mb-5">Como pagar usando Pix?</h2>
              <div className="space-y-4">
                {[
                  "Copie o código Pix",
                  "Abra o aplicativo ou site do seu banco",
                  "Procure a opção de pagar QR Code ou pagar com Pix",
                  "Cole o código no campo indicado, ou, se for pagar de outro dispositivo, aponte a câmera para o QR Code",
                  "Agora é só conferir os dados e confirmar",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Logo + support */}
            <div className="col-span-2 md:col-span-1">
              <img src={clickbusLogo} alt="ClickBus" className="h-10 mb-4" />
              <p className="text-sm text-gray-500 mb-1">Central de atendimento</p>
              <p className="text-sm text-gray-700 mb-3">Todos os dias 07h às 22h.</p>
              <button className="text-sm border border-gray-300 rounded-full px-4 py-2 text-gray-700 hover:border-gray-400 transition-colors">
                Acessar atendimento
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-3">ClickBus</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Sobre a ClickBus</a></li>
                <li><a href="#" className="hover:text-gray-900">Imprensa</a></li>
                <li><a href="#" className="hover:text-gray-900">Baixar o aplicativo</a></li>
                <li><a href="#" className="hover:text-gray-900">Trabalhe na ClickBus</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog Tô de Passagem</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-3">Links úteis</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Destinos</a></li>
                <li><a href="#" className="hover:text-gray-900">Rodoviárias</a></li>
                <li><a href="#" className="hover:text-gray-900">Viações</a></li>
                <li><a href="#" className="hover:text-gray-900">Passagens promocionais</a></li>
                <li><a href="#" className="hover:text-gray-900">Cupons de desconto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-3">Guias de Viagem</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Guia de destino São Paulo</a></li>
                <li><a href="#" className="hover:text-gray-900">Guia de destino Rio de Janeiro</a></li>
                <li><a href="#" className="hover:text-gray-900">Guia de destino Belo Horizonte</a></li>
                <li><a href="#" className="hover:text-gray-900">Guia de destino Salvador</a></li>
                <li><a href="#" className="hover:text-gray-900">Guia de destino Recife</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-3">Informações</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Dúvidas frequentes</a></li>
                <li><a href="#" className="hover:text-gray-900">Regulamento de ofertas</a></li>
                <li><a href="#" className="hover:text-gray-900">Destinos internacionais</a></li>
                <li><a href="#" className="hover:text-gray-900">Canal de transparência</a></li>
                <li><a href="#" className="hover:text-gray-900">ClickBus é confiável?</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>© ClickBus 2026</span>
              <a href="#" className="hover:text-gray-700">Política de Privacidade</a>
              <a href="#" className="hover:text-gray-700">Política de Cookies</a>
              <a href="#" className="hover:text-gray-700">Termos de Uso</a>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">Compra 100% Segura</span>
              <img src={cadasturLogo} alt="Cadastur" className="h-5" />
            </div>
            <p className="text-sm italic text-gray-400">Viajar muda a gente.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}