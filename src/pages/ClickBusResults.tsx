import { useState, useMemo } from "react";
import { useSearchParams, useNavigate, createSearchParams } from "react-router-dom";
import { MapPin, Calendar, ArrowLeftRight, Clock, ChevronRight, ChevronDown, Navigation, Mail, Smartphone } from "lucide-react";
import BusLoadingOverlay from "@/components/BusLoadingOverlay";
import CityAutocomplete from "@/components/CityAutocomplete";
import BusSeatSelector from "@/components/BusSeatSelector";
import { Button } from "@/components/ui/button";
import clickbusLogo from "@/assets/clickbus-logo.webp";
import clickOfertaBadge from "@/assets/click-oferta-badge.png";
import logoItapemirim from "@/assets/logo-itapemirim.png";
import logoGontijo from "@/assets/logo-gontijo.png";
import logoAguiaBranca from "@/assets/logo-aguiabranca.png";
import logoRealMaia from "@/assets/logo-realmaia.png";
import logoCatarinense from "@/assets/logo-catarinense.png";
import logoGuanabara from "@/assets/logo-guanabara.png";
import logo1001 from "@/assets/logo-1001.png";
import logoSateliteNorte from "@/assets/logo-satelitenorte.png";
import logoCometa from "@/assets/logo-cometa.png";
import logoViacaoGarcia from "@/assets/logo-viacaogarcia.png";
import logoEucatur from "@/assets/logo-eucatur.png";
import logoAndorinha from "@/assets/logo-andorinha.png";
import logoProgresso from "@/assets/logo-progresso.png";
import logoOuroePrata from "@/assets/logo-ouroeprata.png";
import logoNovoHorizonte from "@/assets/logo-novohorizonte.png";
import logoCatedral from "@/assets/logo-catedral.png";
import logoPrincesaDosCampos from "@/assets/logo-princesadoscampos.png";
import logoMotta from "@/assets/logo-motta.png";
import logoGuerinoSeiscentos from "@/assets/logo-guerinoseiscentos.png";
import logoPenha from "@/assets/logo-penha.png";
import logoUtil from "@/assets/logo-util.png";
import logoPlanalto from "@/assets/logo-planalto.png";
import logoExpressoSaoLuiz from "@/assets/logo-expressosaoluiz.png";
import iconSeat from "@/assets/icon-seat.png";
import iconExecutivo from "@/assets/icon-executivo.png";
import iconLeito from "@/assets/icon-leito.png";
import iconCama from "@/assets/icon-cama.png";

const COMPANIES: Record<string, { logo: string; name: string }> = {
  itapemirim: { logo: logoItapemirim, name: "Viaje com Itapemirim" },
  gontijo: { logo: logoGontijo, name: "Viaje com Gontijo" },
  aguiabranca: { logo: logoAguiaBranca, name: "Viaje com Águia Branca" },
  realmaia: { logo: logoRealMaia, name: "Viaje com Real Maia" },
  catarinense: { logo: logoCatarinense, name: "Viaje com Catarinense" },
  guanabara: { logo: logoGuanabara, name: "Viaje com Guanabara" },
  "1001": { logo: logo1001, name: "Viaje com 1001" },
  satelitenorte: { logo: logoSateliteNorte, name: "Viaje com Satélite Norte" },
  cometa: { logo: logoCometa, name: "Viaje com Cometa" },
  viacaogarcia: { logo: logoViacaoGarcia, name: "Viaje com Viação Garcia" },
  eucatur: { logo: logoEucatur, name: "Viaje com Eucatur" },
  andorinha: { logo: logoAndorinha, name: "Viaje com Andorinha" },
  progresso: { logo: logoProgresso, name: "Viaje com Progresso" },
  ouroeprata: { logo: logoOuroePrata, name: "Viaje com Ouro e Prata" },
  novohorizonte: { logo: logoNovoHorizonte, name: "Viaje com Novo Horizonte" },
  catedral: { logo: logoCatedral, name: "Viaje com Catedral" },
  princesadoscampos: { logo: logoPrincesaDosCampos, name: "Viaje com Princesa dos Campos" },
  motta: { logo: logoMotta, name: "Viaje com Motta" },
  guerinoseiscentos: { logo: logoGuerinoSeiscentos, name: "Viaje com Guerino Seiscentos" },
  penha: { logo: logoPenha, name: "Viaje com Penha" },
  util: { logo: logoUtil, name: "Viaje com UTIL" },
  planalto: { logo: logoPlanalto, name: "Viaje com Planalto" },
  expressosaoluiz: { logo: logoExpressoSaoLuiz, name: "Viaje com Expresso São Luiz" },
};

// State abbreviation to region mapping
const STATE_REGION: Record<string, string> = {
  SP: "sudeste", RJ: "sudeste", MG: "sudeste", ES: "sudeste",
  RS: "sul", SC: "sul", PR: "sul",
  DF: "centro-oeste", GO: "centro-oeste", MS: "centro-oeste", MT: "centro-oeste",
  BA: "nordeste", SE: "nordeste", AL: "nordeste", PE: "nordeste",
  PB: "nordeste", RN: "nordeste", CE: "nordeste", PI: "nordeste", MA: "nordeste",
  PA: "norte", AM: "norte", AP: "norte", RR: "norte", AC: "norte", RO: "norte", TO: "norte",
};

// Refined axis definitions with 23 companies
type AxisDef = { regions: string[][]; companies: string[] };

const AXES: AxisDef[] = [
  // 1. Sudeste Focado (RJ, SP, MG, ES)
  { regions: [["sudeste", "sudeste"]], companies: ["1001", "cometa", "aguiabranca", "util"] },
  // 2. Sudeste x Nordeste
  { regions: [["sudeste", "nordeste"]], companies: ["gontijo", "itapemirim", "aguiabranca", "guanabara", "novohorizonte", "catedral", "penha"] },
  // 3. Sul x Sudeste
  { regions: [["sul", "sudeste"]], companies: ["catarinense", "viacaogarcia", "cometa", "itapemirim", "princesadoscampos", "penha", "planalto"] },
  // 4. Sudeste x Centro-Oeste / Sul x Centro-Oeste
  { regions: [["centro-oeste", "sudeste"], ["centro-oeste", "sul"]], companies: ["andorinha", "motta", "guanabara", "catedral", "guerinoseiscentos"] },
  // 5. Cruzamento Longo (Sul até Norte/Centro-Oeste distante)
  { regions: [["sul", "norte"]], companies: ["ouroeprata", "eucatur", "expressosaoluiz"] },
  // 6. Norte x Centro-Oeste x Nordeste ("Brasil Profundo")
  { regions: [["norte", "centro-oeste"], ["norte", "nordeste"], ["norte", "norte"]], companies: ["realmaia", "satelitenorte", "eucatur", "expressosaoluiz"] },
  // 7. Nordeste interno
  { regions: [["nordeste", "nordeste"]], companies: ["guanabara", "progresso"] },
  // 8. Sul interno
  { regions: [["sul", "sul"]], companies: ["catarinense", "viacaogarcia", "planalto", "princesadoscampos", "penha"] },
  // 9. Centro-Oeste interno
  { regions: [["centro-oeste", "centro-oeste"]], companies: ["guanabara", "catedral", "andorinha", "motta"] },
  // 10. Centro-Oeste x Nordeste
  { regions: [["centro-oeste", "nordeste"]], companies: ["guanabara", "realmaia", "gontijo", "catedral"] },
  // 11. Sudeste x Norte (longa distância)
  { regions: [["sudeste", "norte"]], companies: ["ouroeprata", "eucatur", "expressosaoluiz", "realmaia"] },
  // 12. Sul x Nordeste (longa distância)
  { regions: [["sul", "nordeste"]], companies: ["itapemirim", "penha", "ouroeprata", "expressosaoluiz"] },
];

function extractState(location: string): string {
  // Expects "City, UF" format
  const parts = location.split(",");
  if (parts.length >= 2) return parts[parts.length - 1].trim().toUpperCase();
  return "SP";
}

// Intrastate company mapping
const INTRASTATE_COMPANIES: Record<string, string[]> = {
  SP: ["cometa", "guerinoseiscentos", "1001", "andorinha"],
  MG: ["gontijo", "util", "cometa"],
  RJ: ["1001", "util"],
  PR: ["viacaogarcia", "princesadoscampos"],
  SC: ["catarinense"],
  RS: ["planalto", "ouroeprata"],
  BA: ["novohorizonte"],
  CE: ["guanabara"],
  PI: ["guanabara"],
  MA: ["guanabara"],
  RN: ["guanabara"],
  PE: ["progresso"],
  PB: ["progresso"],
  AL: ["progresso"],
  SE: ["progresso"],
  MS: ["andorinha", "motta"],
  MT: ["andorinha", "expressosaoluiz"],
  GO: ["expressosaoluiz", "motta"],
  DF: ["guanabara", "catedral"],
  PA: ["realmaia", "eucatur", "satelitenorte"],
  TO: ["realmaia", "eucatur", "satelitenorte"],
  RO: ["eucatur", "realmaia"],
  AM: ["eucatur", "satelitenorte"],
};

function getCompaniesForRoute(origem: string, destino: string): string[] {
  const stateA = extractState(origem);
  const stateB = extractState(destino);

  // Intrastate: same state → use specific mapping
  if (stateA === stateB && INTRASTATE_COMPANIES[stateA]) {
    return INTRASTATE_COMPANIES[stateA];
  }

  const regionA = STATE_REGION[stateA] || "sudeste";
  const regionB = STATE_REGION[stateB] || "sudeste";

  for (const axis of AXES) {
    for (const pair of axis.regions) {
      if (
        (pair[0] === regionA && pair[1] === regionB) ||
        (pair[0] === regionB && pair[1] === regionA)
      ) {
        return axis.companies;
      }
    }
  }
  // Fallback
  return ["itapemirim", "gontijo", "cometa"];
}

interface Trip {
  company: string;
  departure: string;
  arrival: string;
  duration: string;
  originStation: string;
  destStation: string;
  type: string;
  originalPrice: string;
  price: string;
  cents: string;
  hasClickOferta: boolean;
}

// --- Distance tier logic ---
type DistanceTier = "curta" | "media" | "longa" | "extrema";

function getDistanceTier(origem: string, destino: string): DistanceTier {
  const stateA = extractState(origem);
  const stateB = extractState(destino);
  const regionA = STATE_REGION[stateA] || "sudeste";
  const regionB = STATE_REGION[stateB] || "sudeste";
  const cityA = origem.split(",")[0].trim().toLowerCase();
  const cityB = destino.split(",")[0].trim().toLowerCase();

  // Same city
  if (cityA === cityB && stateA === stateB) return "curta";

  // Intrastate
  if (stateA === stateB) {
    const largeStates = new Set(["MG", "BA", "MT", "PA", "AM", "GO", "SP"]);
    return largeStates.has(stateA) ? "media" : "curta";
  }

  // Neighboring states (media ~300-700km): SP↔PR, SP↔RJ, SP↔MG, RJ↔MG, RJ↔ES, PR↔SC, SC↔RS, MG↔ES, MG↔GO, MG↔RJ, GO↔DF, GO↔MT, GO↔MS, MS↔PR, MS↔SP
  const neighborPairs = new Set([
    "SP:RJ", "SP:MG", "SP:PR", "SP:MS",
    "RJ:MG", "RJ:ES",
    "MG:ES", "MG:GO", "MG:BA",
    "PR:SC", "PR:MS",
    "SC:RS",
    "GO:DF", "GO:MT", "GO:MS", "GO:TO",
    "MS:MT",
    "DF:GO", "DF:MG",
  ]);
  const pairKey = `${stateA}:${stateB}`;
  const pairKeyRev = `${stateB}:${stateA}`;
  if (neighborPairs.has(pairKey) || neighborPairs.has(pairKeyRev)) return "media";

  // Same region but not neighbors = longa (ex: ES↔SP, RS↔PR already handled)
  if (regionA === regionB) return "media";

  // Adjacent regions = longa (ex: SP↔BA, SP↔GO already handled above as neighbor)
  const adjacentRegions = new Set([
    "sudeste:sul", "sul:sudeste",
    "sudeste:centro-oeste", "centro-oeste:sudeste",
    "sudeste:nordeste", "nordeste:sudeste",
    "centro-oeste:norte", "norte:centro-oeste",
    "centro-oeste:nordeste", "nordeste:centro-oeste",
    "sul:centro-oeste", "centro-oeste:sul",
  ]);
  if (adjacentRegions.has(`${regionA}:${regionB}`)) return "longa";

  // Cross-country = extrema (ex: RS↔BA, SP↔PA, Sul↔Norte)
  return "extrema";
}

// No more separate refineTier — logic is unified above
function refineTier(tier: DistanceTier, origem: string, destino: string): DistanceTier {
  // Keep extrema override for truly distant pairs
  const stateA = extractState(origem);
  const stateB = extractState(destino);
  const regionA = STATE_REGION[stateA] || "sudeste";
  const regionB = STATE_REGION[stateB] || "sudeste";
  const extremePairs = new Set([
    "sul:nordeste", "nordeste:sul",
    "sul:norte", "norte:sul",
    "sudeste:norte", "norte:sudeste",
  ]);
  if (extremePairs.has(`${regionA}:${regionB}`)) return "extrema";
  return tier;
}

const TIER_CONFIG: Record<DistanceTier, {
  durationRange: [number, number]; // hours
  priceRange: [number, number]; // base convencional
}> = {
  curta:   { durationRange: [1, 5],   priceRange: [40, 80] },
  media:   { durationRange: [6, 10],  priceRange: [90, 150] },
  longa:   { durationRange: [11, 18], priceRange: [160, 250] },
  extrema: { durationRange: [24, 48], priceRange: [260, 350] },
};

const SEAT_MULTIPLIER: Record<string, number> = {
  "Convencional": 1.0,
  "Executivo": 1.25,
  "Semi-Leito": 1.50,
  "Leito": 2.0,
  "Cama": 2.5,
};

const SEAT_TYPES_SHORT = ["Convencional", "Executivo", "Semi-Leito"];
const SEAT_TYPES_LONG = ["Convencional", "Semi-Leito", "Leito", "Cama"];
const SEAT_TYPES_MEDIUM = ["Convencional", "Executivo", "Semi-Leito", "Leito"];

// Seeded random from string
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, "0")}min`;
}

function addHoursToTime(dep: string, hours: number): string {
  const [hh, mm] = dep.split(":").map(Number);
  const totalMin = hh * 60 + mm + Math.round(hours * 60);
  const arrH = Math.floor(totalMin / 60) % 24;
  const arrM = totalMin % 60;
  return `${arrH.toString().padStart(2, "0")}:${arrM.toString().padStart(2, "0")}`;
}

function generateTrips(origem: string, destino: string): Trip[] {
  const routeCompanies = getCompaniesForRoute(origem, destino);
  const rawTier = getDistanceTier(origem, destino);
  const tier = refineTier(rawTier, origem, destino);
  const config = TIER_CONFIG[tier];

  const rand = seededRandom(`${origem}-${destino}`);
  const randRange = (min: number, max: number) => min + rand() * (max - min);

  // Generate base duration for this route (consistent)
  const baseDuration = randRange(config.durationRange[0], config.durationRange[1]);
  // Generate base price for this route
  const basePrice = Math.round(randRange(config.priceRange[0], config.priceRange[1]));

  // Determine seat types available based on tier
  const seatTypes = tier === "curta" ? SEAT_TYPES_SHORT
    : tier === "extrema" || tier === "longa" ? SEAT_TYPES_LONG
    : SEAT_TYPES_MEDIUM;

  // Generate departure times based on tier
  const departures: string[] = [];
  const tripCount = tier === "curta" ? 10 : tier === "media" ? 8 : 6;

  if (tier === "curta" || tier === "media") {
    // Spread through the day
    const startHour = 5;
    const gap = 17 / tripCount;
    for (let i = 0; i < tripCount; i++) {
      const h = Math.floor(startHour + gap * i + rand() * (gap * 0.5));
      const m = Math.floor(rand() * 4) * 15;
      departures.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  } else {
    // Long/extreme: 80% noturno
    const nightCount = Math.ceil(tripCount * 0.8);
    const dayCount = tripCount - nightCount;
    // Day departures
    for (let i = 0; i < dayCount; i++) {
      const h = 8 + Math.floor(rand() * 8);
      const m = Math.floor(rand() * 4) * 15;
      departures.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
    // Night departures
    const nightHours = [18, 19, 20, 21, 22, 23];
    for (let i = 0; i < nightCount; i++) {
      const h = nightHours[i % nightHours.length] + Math.floor(rand() * 2);
      const m = Math.floor(rand() * 4) * 15;
      departures.push(`${Math.min(23, h).toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    }
  }
  departures.sort();

  const origemCity = origem.split(",")[0];
  const destinoCity = destino.split(",")[0];
  const trips: Trip[] = [];

  departures.forEach((dep, i) => {
    const companyKey = routeCompanies[i % routeCompanies.length];
    const seatType = seatTypes[i % seatTypes.length];
    const multiplier = SEAT_MULTIPLIER[seatType];

    // Slight price variation per trip (+/- 10%)
    const priceVariation = 1 + (rand() - 0.5) * 0.2;
    const finalPrice = Math.min(899, Math.round(basePrice * multiplier * priceVariation));

    // Direto vs Parador: ~40% chance of being "Parador" (+10% to +25% more time)
    const isParador = rand() < 0.4;
    const paradorFactor = isParador ? 1.10 + rand() * 0.15 : 1.0;
    // Small natural variation (+/- 5%)
    const naturalVariation = 1 + (rand() - 0.5) * 0.10;
    const tripDuration = baseDuration * paradorFactor * naturalVariation;
    const arrival = addHoursToTime(dep, tripDuration);

    // Markup: +15% to +25%
    const markupFactor = 1.15 + rand() * 0.10;
    const originalPrice = Math.round(finalPrice * markupFactor);

    trips.push({
      company: companyKey,
      departure: dep,
      arrival,
      duration: formatDuration(tripDuration),
      originStation: `${origemCity} - Rodoviária`,
      destStation: `${destinoCity} - Rodoviária`,
      type: seatType,
      originalPrice: `R$ ${originalPrice},90`,
      price: `${finalPrice}`,
      cents: "90",
      hasClickOferta: i % 3 !== 2,
    });
  });

  return trips;
}

function getDateTabs(baseDate: string) {
  // Generate 5 days around the selected date
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  
  // Parse dd/mm/yyyy or use today
  let center = new Date();
  if (baseDate) {
    const parts = baseDate.split("/");
    if (parts.length === 3) {
      center = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
  }

  const tabs = [];
  for (let offset = -2; offset <= 2; offset++) {
    const d = new Date(center);
    d.setDate(d.getDate() + offset);
    tabs.push({
      label: `${days[d.getDay()]}. ${d.getDate()} ${months[d.getMonth()]}`,
      date: d,
      isSelected: offset === 0,
    });
  }
  return tabs;
}

function parsePriceValue(trip: Trip) {
  return Number(`${trip.price}.${trip.cents}`);
}

function parseDurationMinutes(duration: string) {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function parseDepartureMinutes(departure: string) {
  const [hours, minutes] = departure.split(":").map(Number);
  return hours * 60 + minutes;
}

function TripCard({ trip, departureDate }: { trip: Trip; departureDate: string }) {
  const navigate = useNavigate();
  const company = COMPANIES[trip.company];
  const [expanded, setExpanded] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Company + Times */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-3">
            <img src={company.logo} alt={company.name} className="h-8 object-contain" />
          </div>
          <div className="text-right text-sm text-gray-400">
            {trip.duration} • <span className="text-[#8629cc] underline cursor-pointer">Ver itinerário</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-3">{company.name}</p>

        {/* Departure / Arrival rows */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-gray-900 w-16">{trip.departure}</span>
            <span className="text-sm text-gray-600">{trip.originStation}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-gray-900 w-16">{trip.arrival}</span>
            <span className="text-sm text-gray-600">{trip.destStation}</span>
          </div>
        </div>
      </div>

      {/* Ticket type + price bar */}
      <div className="border-t border-gray-100 flex items-stretch">
        <div className="flex-1 flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50/60 to-transparent border-r border-gray-100">
          <img src={trip.type === "Executivo" ? iconExecutivo : trip.type === "Leito" ? iconLeito : trip.type === "Cama" ? iconCama : iconSeat} alt="Assento" className="w-8 h-8 rounded-lg" />
          <span className="text-sm font-medium text-gray-800">{trip.type}</span>
          <img src={iconSeat} alt="Assento" className="w-6 h-6 rounded opacity-50" />
        </div>
        <div className="flex items-center gap-4 p-4 pr-0">
          {trip.hasClickOferta && (
            <img src={clickOfertaBadge} alt="Click Oferta" className="h-7" />
          )}
          <div className="text-right">
            <span className="text-xs text-gray-400 line-through block">{trip.originalPrice}</span>
            <span className="text-xl font-black text-gray-900">
              R$ {trip.price}<span className="text-xs">,{trip.cents}</span>
            </span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-12 h-full min-h-[60px] bg-[#8629cc] text-white flex items-center justify-center hover:bg-[#6b1fb3] rounded-r-xl ml-4 transition-colors"
          >
            {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Delivery info */}
      <div className="border-t border-gray-100 px-5 py-2.5 flex items-center gap-5 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Passagem por e-mail</span>
        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Passagem no celular</span>
      </div>

      {/* Seat selector (expanded) */}
      {expanded && (
        <BusSeatSelector
          tripType={trip.type}
          departureDate={departureDate}
          price={trip.price}
          onSelectSeats={setSelectedSeats}
          onContinue={() => {
            const sp = new URLSearchParams();
            sp.set("origem", trip.originStation);
            sp.set("destino", trip.destStation);
            sp.set("dataIda", departureDate);
            sp.set("company", company.name.replace("Viaje com ", ""));
            sp.set("type", trip.type);
            sp.set("departure", trip.departure);
            sp.set("arrival", trip.arrival);
            sp.set("duration", trip.duration);
            sp.set("price", trip.price);
            sp.set("cents", trip.cents);
            sp.set("seats", selectedSeats.join(","));
            navigate(`/clickbus/checkout?${sp.toString()}`);
          }}
        />
      )}
    </div>
  );
}

export default function ClickBusResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialOrigem = params.get("origem") || "Sorocaba, SP";
  const initialDestino = params.get("destino") || "São Paulo, SP";
  const initialDataIda = params.get("dataIda") || "23/03/2026";
  const initialDataVolta = params.get("dataVolta") || "";

  const [origem, setOrigem] = useState(initialOrigem);
  const [destino, setDestino] = useState(initialDestino);
  const [editDataIda, setEditDataIda] = useState(initialDataIda);
  const [editDataVolta, setEditDataVolta] = useState(initialDataVolta);
  const [showBusLoading, setShowBusLoading] = useState(false);

  const [filterHorario, setFilterHorario] = useState<string[]>([]);
  const [filterAssento, setFilterAssento] = useState<string[]>([]);
  const [ordenar, setOrdenar] = useState("horario");
  const [selectedDateIdx, setSelectedDateIdx] = useState(2);

  // Use initial params for trip generation (updates on re-search)
  const dataIda = initialDataIda;
  const dataVolta = initialDataVolta;

  const trips = useMemo(() => generateTrips(initialOrigem, initialDestino), [initialOrigem, initialDestino]);
  const sortedTrips = useMemo(() => {
    const nextTrips = [...trips];

    nextTrips.sort((a, b) => {
      if (ordenar === "preco") {
        return parsePriceValue(a) - parsePriceValue(b);
      }

      if (ordenar === "duracao") {
        return parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration);
      }

      return parseDepartureMinutes(a.departure) - parseDepartureMinutes(b.departure);
    });

    return nextTrips;
  }, [trips, ordenar]);
  const dateTabs = useMemo(() => getDateTabs(dataIda), [dataIda]);

  const horarios = [
    { id: "manha", label: "Manhã", sub: "(06h00 - 11h59)" },
    { id: "tarde", label: "Tarde", sub: "(12h00 - 17h59)" },
    { id: "noite", label: "Noite", sub: "(18h00 - 23h59)" },
    { id: "madrugada", label: "Madrugada", sub: "(00h00 - 05h59)" },
  ];

  const assentos = [
    { id: "convencional", label: "Convencional" },
    { id: "executivo", label: "Executivo" },
  ];

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const handleReSearch = () => {
    setShowBusLoading(true);
  };

  const doNavigate = () => {
    const p = new URLSearchParams();
    if (origem) p.set("origem", origem);
    if (destino) p.set("destino", destino);
    if (editDataIda) p.set("dataIda", editDataIda);
    if (editDataVolta) p.set("dataVolta", editDataVolta);
    navigate(`/clickbus/resultados?${p.toString()}`);
    // Force reload since we're on the same route
    navigate(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {showBusLoading && (
        <BusLoadingOverlay message="Buscando passagens" duration={2000} onComplete={doNavigate} />
      )}
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-4">
          <img src={clickbusLogo} alt="ClickBus" className="h-9 shrink-0 cursor-pointer" onClick={() => navigate("/clickbus")} />

          {/* Search pills */}
          <div className="hidden md:flex items-center gap-2 flex-1 overflow-visible">
            <div className="relative flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 min-w-[180px]">
              <Navigation className="w-3.5 h-3.5 text-[#8629cc] shrink-0" />
              <CityAutocomplete value={origem} onChange={setOrigem} placeholder="Origem" label="" icon={<Navigation className="w-0 h-0" />} />
            </div>
            <div className="relative flex items-center gap-1.5 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 min-w-[180px]">
              <MapPin className="w-3.5 h-3.5 text-[#8629cc] shrink-0" />
              <CityAutocomplete value={destino} onChange={setDestino} placeholder="Destino" label="" icon={<MapPin className="w-0 h-0" />} />
            </div>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-2 text-sm text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-[#8629cc] shrink-0" />
              <input
                type="text"
                value={editDataIda}
                onChange={e => setEditDataIda(e.target.value)}
                placeholder="dd/mm/aaaa"
                className="w-24 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-2 text-sm text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              <input
                type="text"
                value={editDataVolta}
                onChange={e => setEditDataVolta(e.target.value)}
                placeholder="Data volta"
                className="w-24 bg-transparent outline-none text-sm text-gray-400 placeholder:text-gray-400"
              />
            </div>
            <Button onClick={handleReSearch} className="bg-[#8629cc] hover:bg-[#6b1fb3] text-white rounded-full px-8 text-sm font-bold">
              Buscar
            </Button>
          </div>
        </div>
      </header>

      {/* Purple info bar */}
      <div className="bg-[#441466] text-white py-2.5">
        <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-3 text-sm">
          <span>Passagens de ônibus de <strong>{origem}</strong> para <strong>{destino}</strong></span>
          <button className="flex items-center gap-1 text-white/80 hover:text-white ml-2">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Inverter
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-4 py-3 text-sm text-gray-500 hidden md:block">
        <span className="text-[#8629cc] cursor-pointer hover:underline">Passagens de ônibus</span>
        <span className="mx-2 text-gray-300">&gt;</span>
        <span className="text-[#8629cc] cursor-pointer hover:underline">Rotas</span>
        <span className="mx-2 text-gray-300">&gt;</span>
        <span className="text-gray-600">Passagens de ônibus de {origem} para {destino}</span>
      </div>

      {/* Stepper */}
      <div className="max-w-[1280px] mx-auto px-4 py-4 hidden md:block">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#8629cc] text-white text-sm font-bold flex items-center justify-center">1</span>
            <span className="text-sm font-medium text-gray-900">Selecionar viagem</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-sm font-bold flex items-center justify-center">2</span>
            <span className="text-sm text-gray-400">Pagar</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-4" />
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-sm font-bold flex items-center justify-center">3</span>
            <span className="text-sm text-gray-400">Confirmar</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1280px] mx-auto px-4 pb-12 flex gap-6">
        {/* Sidebar filters - desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="border border-gray-200 rounded-xl bg-white p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-3 text-base">Hora da saída</h3>
            <div className="space-y-3 mb-6">
              {horarios.map(h => (
                <label key={h.id} className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterHorario.includes(h.id)}
                    onChange={() => toggleFilter(filterHorario, h.id, setFilterHorario)}
                    className="w-4 h-4 rounded border-gray-300 mt-0.5"
                  />
                  <div>
                    <span className="font-medium">{h.label}</span>
                    <br />
                    <span className="text-xs text-gray-400">{h.sub}</span>
                  </div>
                </label>
              ))}
            </div>

            <h3 className="font-bold text-gray-900 mb-3 text-base">Tipo de assento</h3>
            <div className="space-y-3 mb-6">
              {assentos.map(a => (
                <label key={a.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterAssento.includes(a.id)}
                    onChange={() => toggleFilter(filterAssento, a.id, setFilterAssento)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Date tabs */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {dateTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setSelectedDateIdx(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  i === selectedDateIdx
                    ? "bg-[#8629cc] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results count + sort bar */}
          <div className="bg-[#8629cc] rounded-lg px-4 py-2.5 flex items-center justify-between mb-5">
            <span className="text-white text-sm font-bold">{sortedTrips.length} resultados</span>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <span>Ordenar por:</span>
              <button
                onClick={() => setOrdenar("preco")}
                className={`px-2 py-0.5 rounded ${ordenar === "preco" ? "text-white font-bold" : "text-white/60 hover:text-white"}`}
              >
                Preço
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => setOrdenar("duracao")}
                className={`px-2 py-0.5 rounded ${ordenar === "duracao" ? "text-white font-bold" : "text-white/60 hover:text-white"}`}
              >
                Duração
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => setOrdenar("horario")}
                className={`px-2 py-0.5 rounded ${ordenar === "horario" ? "text-white font-bold" : "text-white/60 hover:text-white"}`}
              >
                Horário de saída ▾
              </button>
            </div>
          </div>

          {/* Trip cards */}
          <div className="space-y-4">
            {sortedTrips.map((trip, i) => (
              <TripCard key={`${trip.company}-${trip.departure}-${i}`} trip={trip} departureDate={dataIda} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
