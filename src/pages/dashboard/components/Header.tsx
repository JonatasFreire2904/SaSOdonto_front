import type { DashboardPeriod } from "../types";
import PeriodFilter from "./PeriodFilter";

interface HeaderProps {
  userName?: string;
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
}

const Header = ({ userName, period, onPeriodChange }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-8 py-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Painel Operacional
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão diária da clínica para decisões rápidas, {userName || "Doutor(a)"}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PeriodFilter value={period} onChange={onPeriodChange} />
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">add</span>
            Novo Agendamento
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
