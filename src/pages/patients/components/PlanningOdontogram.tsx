import { PlanItem } from "@/api/treatmentPlanService";

export type ToothDisplayStatus = "normal" | "planned" | "inProgress" | "completed" | "cancelled";

export function deriveToothStatus(toothNumber: number, items: PlanItem[]): ToothDisplayStatus {
  const toothItems = items.filter((i) => i.toothNumber === toothNumber);
  if (toothItems.length === 0) return "normal";
  const statuses = toothItems.map((i) => i.status);
  if (statuses.includes("completed")) return "completed";
  if (statuses.includes("inProgress")) return "inProgress";
  if (statuses.includes("planned")) return "planned";
  return "normal";
}

const STATUS_CLASSES: Record<ToothDisplayStatus, string> = {
  normal: "border-slate-200 bg-white text-slate-400",
  planned: "border-blue-400 bg-blue-50 text-blue-600",
  inProgress: "border-yellow-400 bg-yellow-50 text-yellow-600",
  completed: "border-emerald-400 bg-emerald-50 text-emerald-600",
  cancelled: "border-slate-300 bg-slate-100 text-slate-400 opacity-60",
};

const LEGEND_LABELS: { status: ToothDisplayStatus; label: string }[] = [
  { status: "normal", label: "Normal" },
  { status: "planned", label: "Planejado" },
  { status: "inProgress", label: "Em andamento" },
  { status: "completed", label: "Concluído" },
  { status: "cancelled", label: "Cancelado" },
];

// FDI layout: upper right → upper left, lower right → lower left
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

interface PlanningOdontogramProps {
  items: PlanItem[];
  onToothClick: (toothNumber: number) => void;
}

function ToothButton({
  toothNumber,
  status,
  count,
  onClick,
}: {
  toothNumber: number;
  status: ToothDisplayStatus;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-9 h-9 rounded border-2 text-[11px] font-bold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${STATUS_CLASSES[status]}`}
      aria-label={`Dente ${toothNumber}${count > 0 ? ` - ${count} procedimento${count > 1 ? 's' : ''}` : ''}`}
      title={count > 0 ? `${count} procedimento${count > 1 ? 's' : ''} planejado${count > 1 ? 's' : ''}` : undefined}
    >
      {toothNumber}
      {count > 1 && (
        <div className={`absolute -top-1.5 -right-1.5 size-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg ${
          count === 1 ? "bg-blue-500" : "bg-orange-500"
        }`}>
          {count}
        </div>
      )}
    </button>
  );
}

const PlanningOdontogram = ({ items, onToothClick }: PlanningOdontogramProps) => {
  // Calcular contagem de procedimentos por dente
  const toothCounts: Record<number, number> = {};
  items.forEach(item => {
    if (item.status !== "cancelled") {
      toothCounts[item.toothNumber] = (toothCounts[item.toothNumber] || 0) + 1;
    }
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-base font-bold text-slate-700 mb-4">Odontograma de Planejamento</h3>

      <div className="flex flex-col gap-3">
        {/* Upper arch */}
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Arco Superior (Maxilar)
        </p>
        <div className="flex justify-center gap-1">
          {UPPER_RIGHT.map((n) => (
            <ToothButton
              key={n}
              toothNumber={n}
              status={deriveToothStatus(n, items)}
              count={toothCounts[n] || 0}
              onClick={() => onToothClick(n)}
            />
          ))}
          <div className="w-px bg-slate-200 mx-1" />
          {UPPER_LEFT.map((n) => (
            <ToothButton
              key={n}
              toothNumber={n}
              status={deriveToothStatus(n, items)}
              count={toothCounts[n] || 0}
              onClick={() => onToothClick(n)}
            />
          ))}
        </div>

        <div className="h-px bg-slate-100 w-full my-1" />

        {/* Lower arch */}
        <div className="flex justify-center gap-1">
          {LOWER_RIGHT.map((n) => (
            <ToothButton
              key={n}
              toothNumber={n}
              status={deriveToothStatus(n, items)}
              count={toothCounts[n] || 0}
              onClick={() => onToothClick(n)}
            />
          ))}
          <div className="w-px bg-slate-200 mx-1" />
          {LOWER_LEFT.map((n) => (
            <ToothButton
              key={n}
              toothNumber={n}
              status={deriveToothStatus(n, items)}
              count={toothCounts[n] || 0}
              onClick={() => onToothClick(n)}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Arco Inferior (Mandibular)
        </p>
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {LEGEND_LABELS.map(({ status, label }) => (
          <span
            key={status}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${STATUS_CLASSES[status]}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PlanningOdontogram;
