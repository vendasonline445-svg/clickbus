import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, XCircle } from "lucide-react";
import clickbusLogo from "@/assets/clickbus-logo.webp";
import cadasturLogo from "@/assets/cadastur-logo.png";

export default function ClickBusCardReview() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const total = params.get("total") || "0,00";
  const orderId = params.get("order_id") || "";

  const [timer, setTimer] = useState(15 * 60);
  const cancelled = timer <= 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col" style={{ colorScheme: "light" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center">
          <img src={clickbusLogo} alt="ClickBus" className="h-9 cursor-pointer" onClick={() => navigate("/clickbus")} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg max-w-md w-full p-8 text-center space-y-6">
          {cancelled ? (
            <>
              <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Compra Cancelada</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  O tempo limite para confirmação do pagamento de <strong>R$ {total}</strong> expirou e a compra foi cancelada automaticamente.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left space-y-2">
                <p className="text-sm text-red-700 leading-relaxed">
                  Nenhum valor foi cobrado no seu cartão. Caso deseje, você pode realizar uma nova compra.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento em Análise</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Seu pagamento de <strong>R$ {total}</strong> está sendo analisado pela nossa equipe de segurança.
                </p>
              </div>

              {/* Timer */}
              <div className="bg-gray-100 rounded-xl py-3 px-4">
                <p className="text-xs text-gray-500 mb-1">Tempo restante para confirmação</p>
                <p className="text-3xl font-mono font-bold text-gray-900">{mins}:{secs}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="text-sm font-semibold text-amber-800">Verificação de segurança</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Para sua proteção, todas as compras com cartão de crédito passam por uma análise antifraude. 
                  Você receberá a confirmação por e-mail em até <strong>15 minutos</strong>. Caso o prazo expire, a compra será cancelada automaticamente.
                </p>
              </div>
            </>
          )}

          {orderId && (
            <p className="text-xs text-gray-400">
              Pedido: <span className="font-mono">{orderId.slice(0, 8)}</span>
            </p>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate("/clickbus")}
              className="w-full bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-full py-3 text-sm font-bold transition-colors"
            >
              {cancelled ? "Fazer nova compra" : "Voltar ao início"}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-auto">
        <div className="max-w-[1280px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-3">Sobre</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-gray-900">Sobre a ClickBus</a></li>
                <li><a href="#" className="hover:text-gray-900">Central de Ajuda</a></li>
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
