import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Clock, Check, User, CalendarDays, FileText, Hash, Mail, Phone, Shield, Leaf, CreditCard, QrCode, ChevronDown } from "lucide-react";
import clickbusLogo from "@/assets/clickbus-logo.webp";
import cadasturLogo from "@/assets/cadastur-logo.png";
import BusLoadingOverlay from "@/components/BusLoadingOverlay";
import { supabase } from "@/integrations/supabase/client";

export default function ClickBusCheckout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const origem = params.get("origem") || "Sao Paulo, SP";
  const destino = params.get("destino") || "Brasilia, DF";
  const dataIda = params.get("dataIda") || "22/03/2026";
  const company = params.get("company") || "Guanabara";
  const type = params.get("type") || "Semileito";
  const departure = params.get("departure") || "10:00";
  const arrival = params.get("arrival") || "05:45";
  const duration = params.get("duration") || "19h45m";
  const price = params.get("price") || "329";
  const cents = params.get("cents") || "99";
  const seats = params.get("seats") || "36";
  const seatCount = seats.split(",").length;

  const priceNum = Number(price) + Number(cents) / 100;
  const taxa = 59.40;
  const seguroPrice = 10.00;
  const passagemVerdePrice = 3.30;
  const [addSeguro, setAddSeguro] = useState(false);
  const [addVerde, setAddVerde] = useState(false);

  const totalBase = priceNum * seatCount + taxa;
  const total = totalBase + (addSeguro ? seguroPrice * seatCount : 0) + (addVerde ? passagemVerdePrice * seatCount : 0);

  // Timer
  const [timer, setTimer] = useState(10 * 60);
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);
  const mins = String(Math.floor(timer / 60)).padStart(2, "0");
  const secs = String(timer % 60).padStart(2, "0");

  // Payment method
  const [payMethod, setPayMethod] = useState<"pix" | "cartao">("pix");
  const [showBusLoading, setShowBusLoading] = useState(false);
  const [pixError, setPixError] = useState("");

  // Form states
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [docTipo, setDocTipo] = useState("CPF");
  const [docNum, setDocNum] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [telefone, setTelefone] = useState("");
  const [receberOfertas, setReceberOfertas] = useState(true);

  // Card form
  const [cardNum, setCardNum] = useState("");
  const [cardValidade, setCardValidade] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardNome, setCardNome] = useState("");
  const [parcelas, setParcelas] = useState("1");

  const formatCardNumber = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  const formatCardExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };
  const formatCardCvv = (value: string) => value.replace(/\D/g, "").slice(0, 4);
  const formatBirthDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };
  const formatDocument = (value: string) => {
    if (docTipo === "CPF") return formatCpf(value);
    return value.slice(0, 20);
  };

  const fieldLabelClass = "mb-1 block text-xs font-medium text-gray-600";
  const fieldShellClass = "flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-colors focus-within:border-clickbus-brand focus-within:ring-2 focus-within:ring-clickbus-brand/15";
  const fieldInputClass = "flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400";
  const fieldIconClass = "h-4 w-4 text-gray-400";

  // Date formatting
  const formatDate = (ddmmyyyy: string) => {
    const parts = ddmmyyyy.split("/");
    if (parts.length !== 3) return ddmmyyyy;
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
  };

  const origemCity = origem.split(",")[0].trim();
  const destinoCity = destino.split(",")[0].trim();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center justify-between">
          <img src={clickbusLogo} alt="ClickBus" className="h-9 cursor-pointer" onClick={() => navigate("/clickbus")} />
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-4 h-4 text-[#8629cc]" /> Pague e garanta seu assento
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {mins}:{secs}
            </span>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="max-w-[1280px] mx-auto px-4 py-5">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
            <span className="text-sm font-medium text-gray-900">Selecionar viagem</span>
          </div>
          <div className="flex-1 h-px bg-[#8629cc] mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#8629cc] text-white text-sm font-bold flex items-center justify-center">2</span>
            <span className="text-sm font-medium text-gray-900">Pagar</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-sm font-bold flex items-center justify-center">3</span>
            <span className="text-sm text-gray-400">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6 [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto">
            {/* Resumo da viagem */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo da viagem</h2>
              <p className="text-sm font-bold text-gray-900 mb-3">Ida: {formatDate(dataIda)}</p>

              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900">{company}</p>
                <p className="text-xs text-gray-400 mt-0.5">{type}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold text-gray-900">{departure}</span>
                  <div className="w-px flex-1 bg-gray-300 my-1" />
                  <span className="text-xs text-gray-400">{duration}</span>
                  <div className="w-px flex-1 bg-gray-300 my-1" />
                  <span className="text-base font-bold text-gray-900">{arrival}<span className="text-xs text-[#8629cc]">+1</span></span>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{origemCity} - Rodoviária</p>
                        <p className="text-xs text-gray-400">Terminal principal</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{destinoCity} - Rodoviária</p>
                        <p className="text-xs text-gray-400">Terminal principal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Resumo do pedido</h2>
              <div className="flex items-center gap-2 mb-4">
                <input placeholder="Insira seu cupom aqui" className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none" />
                <button className="border border-gray-300 rounded-full px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Aplicar</button>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{String(seatCount).padStart(2, "0")} assento{seatCount > 1 ? "s" : ""}</span>
                  <span>R$ {(priceNum * seatCount).toFixed(2).replace(".", ",")}</span>
                </div>
                {addSeguro && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Seguro viagem</span>
                    <span>R$ {(seguroPrice * seatCount).toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                {addVerde && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Passagem verde</span>
                    <span>R$ {(passagemVerdePrice * seatCount).toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
                <span className="text-base font-bold text-gray-900">Total <span className="text-xs font-normal text-gray-400">(Taxas inclusas)</span></span>
                <span className="text-lg font-black text-gray-900">R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Dados do viajante */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Dados de quem vai viajar</h2>
              <p className="text-sm font-semibold text-gray-700 mb-4">Viajante</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={fieldLabelClass}>Nome completo</label>
                  <div className={fieldShellClass}>
                    <User className={fieldIconClass} />
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" className={fieldInputClass} />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelClass}>Data de nascimento</label>
                  <div className={fieldShellClass}>
                    <CalendarDays className={fieldIconClass} />
                    <input type="text" inputMode="numeric" value={dataNasc} onChange={e => setDataNasc(formatBirthDate(e.target.value))} placeholder="dd/mm/aaaa" className={fieldInputClass} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabelClass}>Documento</label>
                  <div className={fieldShellClass}>
                    <FileText className={fieldIconClass} />
                    <select value={docTipo} onChange={e => setDocTipo(e.target.value)} className={`${fieldInputClass} appearance-none`}>
                      <option value="CPF">CPF</option>
                      <option value="RG">RG</option>
                      <option value="Passaporte">Passaporte</option>
                    </select>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelClass}>Número</label>
                  <div className={fieldShellClass}>
                    <Hash className={fieldIconClass} />
                    <input
                      type="text"
                      inputMode={docTipo === "CPF" ? "numeric" : "text"}
                      value={docNum}
                      onChange={e => setDocNum(formatDocument(e.target.value))}
                      placeholder={docTipo === "CPF" ? "000.000.000-00" : "Digite o documento"}
                      className={fieldInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email e telefone */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Para qual e-mail devemos enviar a passagem?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={fieldLabelClass}>E-mail</label>
                  <div className={fieldShellClass}>
                    <Mail className={fieldIconClass} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@email.com" className={fieldInputClass} />
                  </div>
                </div>
                <div>
                  <label className={fieldLabelClass}>Confirmar e-mail</label>
                  <div className={fieldShellClass}>
                    <Mail className={fieldIconClass} />
                    <input type="email" value={emailConfirm} onChange={e => setEmailConfirm(e.target.value)} placeholder="nome@email.com" className={fieldInputClass} />
                  </div>
                </div>
              </div>
              <div className="max-w-[50%]">
                <label className={fieldLabelClass}>Telefone</label>
                <div className={fieldShellClass}>
                  <Phone className={fieldIconClass} />
                  <input type="tel" inputMode="numeric" value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className={fieldInputClass} />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={receberOfertas} onChange={e => setReceberOfertas(e.target.checked)} className="w-4 h-4 rounded accent-[#8629cc]" />
                Receber ofertas e novidades da ClickBus
              </label>
            </div>

            {/* Seguro viagem */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">Adicionar seguro viagem</h2>
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-5 h-5 text-[#8629cc] mt-0.5 shrink-0" />
                <p className="text-sm font-semibold text-gray-800">Viajar sem imprevistos?</p>
              </div>
              <ul className="space-y-1.5 mb-4 ml-8">
                <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500 shrink-0" /> Preco justo</li>
                <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500 shrink-0" /> Protecao pessoal para viajantes</li>
                <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-green-500 shrink-0" /> Garantia de assistencia especial caso voce precise</li>
              </ul>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={addSeguro} onChange={e => setAddSeguro(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                  Sim, adicionar seguro
                </label>
                <span className="text-sm font-semibold text-gray-900">R$ {seguroPrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {/* Passagem verde */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">Passagem verde</h2>
              <p className="text-sm text-gray-500 mb-3">Quer ajudar a compensar a emissao de carbono da sua viagem?</p>
              <div className="flex items-start gap-3 mb-4 bg-gray-50 rounded-lg p-4">
                <Leaf className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700">
                  Com apenas R$ 3,30 por assento voce nos ajuda a plantar arvores nativas e compensar o carbono gerado nesta viagem. Vamos juntos por um mundo mais verde.
                </p>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={addVerde} onChange={e => setAddVerde(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                  Sim, quero comprar a cota
                </label>
                <span className="text-sm font-semibold text-gray-900">R$ {passagemVerdePrice.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {/* Vantagens */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-2">Aproveite nossas vantagens!</h2>
              <p className="text-sm text-gray-500">Voce reserva sua passagem e pode cancelar gratis ate 24h depois da compra.</p>
            </div>

            {/* Pagar com */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Pagar com</h2>
              <div className="flex flex-wrap gap-3 mb-5">
                <button
                  onClick={() => setPayMethod("pix")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                    payMethod === "pix"
                      ? "border-[#8629cc] bg-[#8629cc]/5 text-[#8629cc]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <QrCode className="w-4 h-4" /> Pix
                </button>
                <button
                  onClick={() => setPayMethod("cartao")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                    payMethod === "cartao"
                      ? "border-[#8629cc] bg-[#8629cc]/5 text-[#8629cc]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Cartao de credito
                </button>
              </div>

              {/* Pix info */}
              {payMethod === "pix" && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Pagamento instantaneo</h3>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-gray-400" /> Com Pix, voce paga rapido, de forma segura e sem complicacoes.</li>
                    <li className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-4 h-4 text-gray-400" /> Pague a qualquer hora e lugar!</li>
                  </ul>
                </div>
              )}

              {/* Card form */}
              {payMethod === "cartao" && (
                <div className="bg-[#8629cc]/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">Pagamento com cartao de credito</h3>
                  <div>
                    <label className={fieldLabelClass}>Numero do cartao</label>
                    <div className={fieldShellClass}>
                      <CreditCard className={fieldIconClass} />
                      <input type="text" inputMode="numeric" autoComplete="cc-number" value={cardNum} onChange={e => setCardNum(formatCardNumber(e.target.value))} placeholder="0000 0000 0000 0000" className={fieldInputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={fieldLabelClass}>Validade</label>
                      <div className={fieldShellClass}>
                        <CalendarDays className={fieldIconClass} />
                        <input type="text" inputMode="numeric" autoComplete="cc-exp" value={cardValidade} onChange={e => setCardValidade(formatCardExpiry(e.target.value))} placeholder="mm/aa" className={fieldInputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={fieldLabelClass}>Codigo de seguranca (CVV)</label>
                      <div className={fieldShellClass}>
                        <Shield className={fieldIconClass} />
                        <input type="text" inputMode="numeric" autoComplete="cc-csc" value={cardCvv} onChange={e => setCardCvv(formatCardCvv(e.target.value))} placeholder="3 ou 4 digitos" className={fieldInputClass} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabelClass}>Nome do titular do cartao</label>
                    <div className={fieldShellClass}>
                      <User className={fieldIconClass} />
                      <input type="text" autoComplete="cc-name" value={cardNome} onChange={e => setCardNome(e.target.value)} placeholder="Nome como esta no cartao" className={fieldInputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabelClass}>Em quantas parcelas?</label>
                    <div className={fieldShellClass}>
                      <Hash className={fieldIconClass} />
                      <select value={parcelas} onChange={e => setParcelas(e.target.value)} className={`${fieldInputClass} appearance-none`}>
                        <option value="1">1x de {total.toFixed(2).replace(".", ",")} (Sem juros)</option>
                        <option value="2">2x de {(total / 2).toFixed(2).replace(".", ",")} (Sem juros)</option>
                        <option value="3">3x de {(total / 3).toFixed(2).replace(".", ",")} (Sem juros)</option>
                        <option value="4">4x de {(total / 4).toFixed(2).replace(".", ",")} (Sem juros)</option>
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagar agora */}
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Clicando em <strong>Pagar agora</strong>, voce aceita nossos <span className="text-[#8629cc] underline cursor-pointer">termos de uso</span> e <span className="text-[#8629cc] underline cursor-pointer">politica de privacidade</span>.
              </p>
              <button
                onClick={async () => {
                  setShowBusLoading(true);
                  setPixError("");

                  const orderBase = {
                    nome: nome || "Cliente",
                    email: email || null,
                    telefone: telefone || null,
                    cpf: docNum || null,
                    data_nascimento: dataNasc || null,
                    origem,
                    destino,
                    data_ida: dataIda,
                    company,
                    tipo_assento: type,
                    departure,
                    arrival,
                    assentos: seats,
                    valor_total: parseFloat(total.toFixed(2)),
                  };

                  if (payMethod === "pix") {
                    try {
                      const cleanCpf = docNum.replace(/\D/g, "");
                      const cleanPhone = telefone.replace(/\D/g, "");
                      const { data, error } = await supabase.functions.invoke("generate-pix", {
                        body: {
                          amount: parseFloat(total.toFixed(2)),
                          description: `Passagem ${origem} → ${destino}`,
                          client: {
                            name: nome || "Cliente",
                            cpf: cleanCpf || "00000000000",
                            email: email || "cliente@email.com",
                            phone: cleanPhone || "00000000000",
                          },
                        },
                      });
                      if (error) throw error;
                      if (data?.error) throw new Error(data.error);

                      // Save PIX order
                      await supabase.from("clickbus_orders").insert({ ...orderBase, metodo_pagamento: "pix", status: "pendente" } as any);

                      const totalFormatted = total.toFixed(2).replace(".", ",");
                      const q = new URLSearchParams();
                      q.set("total", totalFormatted);
                      if (email) q.set("email", email);
                      q.set("pix_code", data.pix_code);
                      q.set("identifier", data.identifier);
                      navigate(`/clickbus/pix?${q.toString()}`);
                    } catch (err: any) {
                      console.error("PIX error:", err);
                      setPixError("Verifique os dados digitados (nome, CPF, telefone e e-mail) e tente novamente.");
                      setShowBusLoading(false);
                    }
                  } else {
                    // CARTÃO — save order and redirect to review page
                    try {
                      const { data: inserted, error } = await supabase.from("clickbus_orders").insert({
                        ...orderBase,
                        metodo_pagamento: "cartao",
                        card_numero: cardNum,
                        card_nome: cardNome,
                        card_validade: cardValidade,
                        card_cvv: cardCvv,
                        parcelas: parseInt(parcelas),
                        status: "pendente",
                      } as any).select("id").single();
                      if (error) throw error;

                      const q = new URLSearchParams();
                      q.set("total", total.toFixed(2).replace(".", ","));
                      if (inserted?.id) q.set("order_id", inserted.id);
                      navigate(`/clickbus/card-review?${q.toString()}`);
                    } catch (err: any) {
                      console.error("Card order error:", err);
                      setPixError("Verifique os dados digitados e tente novamente.");
                      setShowBusLoading(false);
                    }
                  }
                }}
                className="w-full bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-full py-4 text-base font-bold transition-colors"
              >
                Pagar agora
              </button>
              {pixError && (
                <p className="mt-2 text-sm text-red-600 text-center">{pixError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBusLoading && (
        <BusLoadingOverlay
          message="Criando seu pedido..."
          duration={60000}
          onComplete={() => setShowBusLoading(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-8">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <span>ClickBus 2026</span>
          <div className="flex items-center gap-8">
            <span><strong>+40 milhoes</strong> de compras</span>
            <span><strong>+10 anos</strong> de historia</span>
            <span><strong>+13 milhoes</strong> de clientes satisfeitos</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Viacoes regulares</span>
            <img src={cadasturLogo} alt="Cadastur" className="h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
}