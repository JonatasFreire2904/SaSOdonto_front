import type { DashboardPeriod } from "../types";

interface PeriodFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}

const options: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mês" },
];

const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
        Período
      </span>
      <select
        aria-label="Filtro de período"
        value={value}
        onChange={(event) => onChange(event.target.value as DashboardPeriod)}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodFilter;
