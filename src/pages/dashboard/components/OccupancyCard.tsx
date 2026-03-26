import type { OccupancyData } from "../types";
import { getOccupancyTone } from "../utils";

interface OccupancyCardProps {
  occupancy: OccupancyData;
}

const toneClassMap = {
  high: {
    text: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    progress: "bg-emerald-500",
  },
  medium: {
    text: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    progress: "bg-amber-500",
  },
  low: {
    text: "text-rose-600",
    badge: "bg-rose-50 text-rose-700",
    progress: "bg-rose-500",
  },
} as const;

const OccupancyCard = ({ occupancy }: OccupancyCardProps) => {
  const tone = getOccupancyTone(occupancy.occupancyRate);
  const styles = toneClassMap[tone];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-900 dark:text-slate-50">Ocupação de Cadeiras</h3>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
          {occupancy.occupancyRate}% ocupado
        </span>
      </div>

      <div className={`text-3xl font-extrabold ${styles.text} mb-2`}>
        {occupancy.occupancyRate}%
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-3 overflow-hidden">
        <div
          className={`h-2.5 rounded-full ${styles.progress}`}
          style={{ width: `${occupancy.occupancyRate}%` }}
        />
      </div>

      <p className="text-sm text-slate-500">
        {occupancy.filledSlots} horários preenchidos • {occupancy.freeSlots} livres
      </p>
    </section>
  );
};

export default OccupancyCard;
