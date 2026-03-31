interface BottomActionBarProps {
  selectedDate: string;
  selectedTime: string | null;
  onAdvance: () => void;
  onClear: () => void;
}

/**
 * Barra inferior de ação para agendamento
 * Exibe resumo da seleção e botão para avançar
 */
const BottomActionBar = ({
  selectedDate,
  selectedTime,
  onAdvance,
  onClear,
}: BottomActionBarProps) => {
  if (!selectedTime) return null;

  const date = new Date(selectedDate + "T00:00:00");
  const formattedDate = `${date.getDate()} ${date.toLocaleDateString("pt-BR", { month: "short" })}, ${date.getFullYear()}`;

  const startHour = parseInt(selectedTime.split(":")[0], 10);
  const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`;

  return (
    <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl px-6 py-4 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Data Selecionada
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {formattedDate}
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Janela de Tempo
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {selectedTime} — {endTime}
            </p>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Status
            </span>
            <p className="text-sm font-semibold text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Em Seleção
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={onAdvance}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/25"
          >
            Avançar para Detalhes
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;
