import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface Props {
  valueIda: string;
  valueVolta: string;
  onChangeIda: (v: string) => void;
  onChangeVolta: (v: string) => void;
  hasReturn?: boolean;
}

function MonthGrid({
  year, month, today, maxSelectableDate, selectedIda, selectedVolta, onSelect,
}: {
  year: number; month: number; today: Date;
  maxSelectableDate: Date;
  selectedIda: string; selectedVolta: string;
  onSelect: (d: Date) => void;
}) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);

  return (
    <div className="flex-1 min-w-0">
      <h3 className="mb-4 text-base font-bold text-clickbus-ink">{MESES[month]} {year}</h3>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="py-1 text-[10px] font-semibold text-clickbus-muted">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const date = new Date(year, month, day);
          const iso = toISO(date);
          const isToday = date.toDateString() === today.toDateString();
          const dayStart = startOfDay(date);
          const isUnavailable = dayStart < today || dayStart > maxSelectableDate;
          const isIda = iso === selectedIda;
          const isVolta = iso === selectedVolta;
          const isBetween = selectedIda && selectedVolta && iso > selectedIda && iso < selectedVolta;

          return (
            <button
              key={i}
              type="button"
              disabled={isUnavailable}
              onClick={() => onSelect(date)}
              className={`
                mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all
                ${isUnavailable ? "cursor-not-allowed text-muted-foreground/30" : "cursor-pointer font-medium text-clickbus-ink hover:bg-clickbus-soft hover:text-clickbus-ink"}
                ${isToday && !isIda && !isVolta ? "font-bold text-clickbus-brand ring-2 ring-clickbus-brand/15" : ""}
                ${isIda ? "bg-clickbus-brand text-primary-foreground font-bold" : ""}
                ${isVolta ? "bg-clickbus-brand text-primary-foreground font-bold" : ""}
                ${isBetween ? "bg-clickbus-soft" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DualCalendarPicker({
  valueIda,
  valueVolta,
  onChangeIda,
  onChangeVolta,
  hasReturn = true,
}: Props) {
  const today = startOfDay(new Date());
  const maxSelectableDate = startOfDay(new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()));
  const [baseMonth, setBaseMonth] = useState(today.getMonth());
  const [baseYear, setBaseYear] = useState(today.getFullYear());
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<"ida" | "volta">("ida");
  const ref = useRef<HTMLDivElement>(null);
  const minBaseMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxBaseMonth = new Date(maxSelectableDate.getFullYear(), maxSelectableDate.getMonth() - 1, 1);

  useEffect(() => {
    if (!open) return;

    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    const referenceDate = valueVolta || valueIda;
    if (!referenceDate) return;

    const [year, month] = referenceDate.split("-").map(Number);
    if (!year || !month) return;

    setBaseYear(year);
    setBaseMonth(month - 1);
  }, [valueIda, valueVolta]);

  const prevMonth = () => {
    if (baseMonth === 0) { setBaseMonth(11); setBaseYear(y => y - 1); }
    else setBaseMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (baseMonth === 11) { setBaseMonth(0); setBaseYear(y => y + 1); }
    else setBaseMonth(m => m + 1);
  };

  const canMovePrev = new Date(baseYear, baseMonth, 1) > minBaseMonth;
  const canMoveNext = new Date(baseYear, baseMonth, 1) < maxBaseMonth;

  const secondMonth = baseMonth === 11 ? 0 : baseMonth + 1;
  const secondYear = baseMonth === 11 ? baseYear + 1 : baseYear;

  const handleSelect = (d: Date) => {
    const iso = toISO(d);

    // Somente ida: seleciona e fecha
    if (!hasReturn) {
      onChangeIda(iso);
      onChangeVolta("");
      setOpen(false);
      return;
    }

    if (selecting === "ida") {
      onChangeIda(iso);
      if (valueVolta && iso >= valueVolta) onChangeVolta("");
      setSelecting("volta");
      return;
    }

    if (!valueIda || iso <= valueIda) {
      onChangeIda(iso);
      onChangeVolta("");
      setSelecting("volta");
    } else {
      onChangeVolta(iso);
      setSelecting("ida");
      setOpen(false);
    }
  };

  const clear = () => {
    onChangeIda("");
    onChangeVolta("");
    setSelecting("ida");
  };

  const openPicker = (field: "ida" | "volta") => {
    setSelecting(field);
    setOpen(true);
  };

  const formatDisplay = (iso: string) => {
    if (!iso) return "__/__/__";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div ref={ref} className="relative w-full pointer-events-auto">
      <div className="flex h-full w-full pointer-events-auto">
        <button
          type="button"
          onClick={() => openPicker("ida")}
          aria-expanded={open && selecting === "ida"}
          className={`flex-1 border-r border-clickbus-line px-5 py-4 text-left pointer-events-auto transition-colors md:px-6 ${selecting === "ida" && open ? "bg-clickbus-soft" : "bg-white"}`}
        >
          <span className="block pointer-events-none text-sm font-medium text-clickbus-muted">Ida</span>
          <span className={`mt-2 flex items-center gap-2 text-lg ${valueIda ? "font-bold text-clickbus-ink" : "font-medium text-muted-foreground"}`}>
            <Calendar className="w-4 h-4" /> {formatDisplay(valueIda)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => openPicker("volta")}
          aria-expanded={open && selecting === "volta"}
          className={`flex-1 px-5 py-4 text-left pointer-events-auto transition-colors md:px-6 ${selecting === "volta" && open ? "bg-clickbus-soft" : "bg-white"}`}
        >
          <span className="block pointer-events-none text-sm font-medium text-clickbus-muted">Volta</span>
          <span className={`mt-2 flex items-center gap-2 text-lg ${valueVolta ? "font-bold text-clickbus-ink" : "font-medium text-muted-foreground"}`}>
            <Calendar className="w-4 h-4" /> {hasReturn ? formatDisplay(valueVolta) : "Opcional"}
          </span>
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Fechar calendário"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />

          <div
            className="fixed inset-x-3 bottom-3 z-50 mt-3 max-h-[80vh] overflow-y-auto rounded-[1.75rem] border border-clickbus-line bg-white p-4 shadow-2xl pointer-events-auto md:absolute md:inset-x-auto md:bottom-auto md:left-1/2 md:top-full md:mt-3 md:max-h-none md:w-[min(95vw,720px)] md:-translate-x-1/2 md:overflow-visible md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
          <div className="mb-5 flex items-center justify-between">
            <button type="button" onClick={prevMonth} disabled={!canMovePrev} className={`flex h-10 w-10 items-center justify-center rounded-full border border-clickbus-line transition-colors ${canMovePrev ? "text-clickbus-muted hover:border-clickbus-brand hover:text-clickbus-brand" : "cursor-not-allowed text-muted-foreground/40"}`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1" />
            <button type="button" onClick={nextMonth} disabled={!canMoveNext} className={`flex h-10 w-10 items-center justify-center rounded-full border border-clickbus-line transition-colors ${canMoveNext ? "text-clickbus-muted hover:border-clickbus-brand hover:text-clickbus-brand" : "cursor-not-allowed text-muted-foreground/40"}`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-8 max-md:flex-col">
            <MonthGrid year={baseYear} month={baseMonth} today={today} maxSelectableDate={maxSelectableDate} selectedIda={valueIda} selectedVolta={valueVolta} onSelect={handleSelect} />
            <MonthGrid year={secondYear} month={secondMonth} today={today} maxSelectableDate={maxSelectableDate} selectedIda={valueIda} selectedVolta={valueVolta} onSelect={handleSelect} />
          </div>
          <button type="button" onClick={clear} className="mt-5 text-sm font-semibold text-clickbus-brand hover:underline">
            Limpar
          </button>
          </div>
        </>
      )}
    </div>
  );
}
