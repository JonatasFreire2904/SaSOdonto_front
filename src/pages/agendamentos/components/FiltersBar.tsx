import type { PeriodType } from "@/hooks/queries/useDashboardAppointments";

interface FiltersBarProps {
  period: PeriodType;
  onPeriodChange: (period: PeriodType) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  customDateRange: { start: string; end: string } | null;
  onCustomDateChange: (range: { start: string; end: string } | null) => void;
}

const FiltersBar = ({
  period,
  onPeriodChange,
  searchTerm,
  onSearchChange,
  customDateRange,
  onCustomDateChange,
}: FiltersBarProps) => {
  const handlePeriodClick = (newPeriod: PeriodType) => {
    if (newPeriod !== "custom") {
      onCustomDateChange(null);
    }
    onPeriodChange(newPeriod);
  };

  const handleDateChange = (field: "start" | "end", value: string) => {
    const current = customDateRange || { start: "", end: "" };
    const updated = { ...current, [field]: value };
    onCustomDateChange(updated);
    if (updated.start && updated.end) {
      onPeriodChange("custom");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Period buttons */}
      <div className="flex items-center gap-2">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => handlePeriodClick("today")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === "today"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => handlePeriodClick("week")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === "week"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => handlePeriodClick("custom")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              period === "custom"
                ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Personalizado
          </button>
        </div>

        {/* Custom date inputs */}
        {period === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customDateRange?.start || ""}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 outline-none"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={customDateRange?.end || ""}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar paciente..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default FiltersBar;
