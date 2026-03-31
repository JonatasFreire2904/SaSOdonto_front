import type { DashboardSummary } from "@/api/atendimentoService";

interface SummaryCardsProps {
  summary: DashboardSummary | undefined;
  isLoading: boolean;
  activeFilter: string | null;
  onFilterClick: (status: string | null) => void;
}

interface CardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  onClick: () => void;
  isLoading: boolean;
}

const Card = ({ label, value, icon, color, bgColor, isActive, onClick, isLoading }: CardProps) => (
  <button
    onClick={onClick}
    className={`
      flex-1 min-w-[140px] p-4 rounded-xl border-2 transition-all
      ${isActive 
        ? `${bgColor} border-current ${color} shadow-lg scale-[1.02]` 
        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      }
    `}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : bgColor}`}>
        <span className={`material-symbols-outlined text-xl ${isActive ? "text-current" : color}`}>
          {icon}
        </span>
      </div>
      <div className="text-left">
        <p className={`text-2xl font-bold ${isActive ? "text-current" : "text-slate-900 dark:text-white"}`}>
          {isLoading ? "—" : value}
        </p>
        <p className={`text-xs font-medium ${isActive ? "text-current opacity-80" : "text-slate-500"}`}>
          {label}
        </p>
      </div>
    </div>
  </button>
);

const SummaryCards = ({ summary, isLoading, activeFilter, onFilterClick }: SummaryCardsProps) => {
  const cards = [
    {
      key: null,
      label: "Total",
      value: summary?.total ?? 0,
      icon: "calendar_month",
      color: "text-slate-700",
      bgColor: "bg-slate-100",
    },
    {
      key: "Scheduled",
      label: "Agendados",
      value: summary?.scheduled ?? 0,
      icon: "schedule",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "InProgress",
      label: "Em Andamento",
      value: summary?.inProgress ?? 0,
      icon: "pending",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      key: "Completed",
      label: "Concluídos",
      value: summary?.completed ?? 0,
      icon: "check_circle",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      key: "Cancelled",
      label: "Cancelados",
      value: summary?.cancelled ?? 0,
      icon: "cancel",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {cards.map((card) => (
        <Card
          key={card.key ?? "total"}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
          bgColor={card.bgColor}
          isActive={activeFilter === card.key}
          onClick={() => onFilterClick(card.key)}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
