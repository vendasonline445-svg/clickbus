import { useState, useRef, useEffect } from "react";
import { Building2, Crosshair } from "lucide-react";
import { CIDADES_BR } from "@/data/cidadesBrasil";

const CIDADES_DESTAQUE = [
  "Rio de Janeiro, RJ - TODOS",
  "São Paulo, SP - TODOS",
  "Belo Horizonte, MG - TODOS",
  "Florianópolis, SC",
  "Salvador, BA",
  "Curitiba, PR",
];

function normalize(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

interface CityAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  label: string;
}

export default function CityAutocomplete({ value, onChange, placeholder, icon, label }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isSearching = query.length >= 1;
  const filtered = isSearching
    ? CIDADES_BR.filter(c => normalize(c).includes(normalize(query))).slice(0, 8)
    : [];

  const handleSelect = (city: string) => {
    onChange(city);
    setQuery(city);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full pointer-events-auto">
      <label className="flex min-w-0 items-center gap-2 text-sm font-medium text-clickbus-muted">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </label>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="mt-2 w-full bg-transparent text-xl font-semibold text-clickbus-ink outline-none placeholder:font-medium placeholder:text-muted-foreground"
      />
      {open && (
        <div className="absolute inset-x-0 top-full z-[80] mt-4 min-w-[280px] overflow-y-auto rounded-[1.5rem] border border-clickbus-line bg-white shadow-2xl max-h-72 pointer-events-auto">
          {/* "Usar minha localização" */}
          <button
            type="button"
            className="flex w-full items-center justify-between border-b border-clickbus-line px-5 py-4 text-left text-sm font-semibold text-clickbus-brand transition-colors hover:bg-clickbus-soft"
            onClick={() => {
              // Simula geolocalização
              handleSelect("São Paulo, SP");
            }}
          >
            <span>Usar minha localização</span>
            <Crosshair className="w-4 h-4 text-clickbus-brand" />
          </button>

          {isSearching ? (
            // Resultados da pesquisa
            filtered.length > 0 ? (
              filtered.map(city => {
                const parts = city.split(", ");
                const cityName = parts[0];
                const state = parts.length > 1 ? parts.slice(1).join(", ") : "";
                return (
                  <button
                    key={city}
                    type="button"
                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-clickbus-ink transition-colors hover:bg-clickbus-soft"
                    onClick={() => handleSelect(city)}
                  >
                    <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span><span className="font-bold">{cityName}</span>{state ? <span className="font-normal text-clickbus-muted">, {state}</span> : null}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-4 text-sm text-clickbus-muted">Nenhuma cidade encontrada</div>
            )
          ) : (
            // Cidades em destaque (pré-seleção)
            CIDADES_DESTAQUE.map(city => {
              const parts = city.split(", ");
              const cityName = parts[0];
              const state = parts.length > 1 ? parts.slice(1).join(", ") : "";
              return (
                <button
                  key={city}
                  type="button"
                    className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm text-clickbus-ink transition-colors hover:bg-clickbus-soft"
                  onClick={() => handleSelect(city)}
                >
                    <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span><span className="font-bold">{cityName}</span>{state ? <span className="font-normal text-clickbus-muted">, {state}</span> : null}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
