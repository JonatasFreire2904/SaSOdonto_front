interface DailySummaryProps {
  scheduledCount: number;
  availableCount: number;
  isLoading: boolean;
}

/**
 * Card de resumo diário
 * Mostra contagem de agendamentos e horários disponíveis
 */
const DailySummary = ({ scheduledCount, availableCount, isLoading }: DailySummaryProps) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
      Resumo do Dia
    </h4>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Agendados</span>
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          {isLoading ? "—" : scheduledCount}
        </span>
      </div>
      <div className="h-px bg-slate-100 dark:bg-slate-700" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Disponíveis</span>
        </div>
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          {isLoading ? "—" : availableCount}
        </span>
      </div>
    </div>
  </div>
);

export default DailySummary;
