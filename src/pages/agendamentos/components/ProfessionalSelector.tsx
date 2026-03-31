interface Professional {
  id: string;
  userName: string;
}

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedId: string | undefined;
  onChange: (id: string) => void;
  isLoading?: boolean;
}

/**
 * Seletor de profissional em dropdown
 * Responsabilidade: Renderização do seletor de profissional
 */
const ProfessionalSelector = ({
  professionals,
  selectedId,
  onChange,
  isLoading = false,
}: ProfessionalSelectorProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-48 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div>
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          Profissional
        </span>
        <div className="relative">
          <select
            value={selectedId || ""}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none cursor-pointer min-w-[200px]"
          >
            <option value="">Todos os Profissionais</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.userName}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
            expand_more
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSelector;
