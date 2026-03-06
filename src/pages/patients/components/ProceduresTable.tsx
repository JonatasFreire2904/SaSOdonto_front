export interface Atendimento {
  id: string;
  procedure: string;
  description: string | null;
  notes: string | null;
  scheduledAt: string;
  completedAt: string | null;
  status: "scheduled" | "completed" | "cancelled";
  price: number;
  dentistName: string | null;
  tooth: string | null;
  patientId: string;
  patientName: string;
  createdAt: string;
}

interface ProceduresTableProps {
  atendimentos: Atendimento[];
  totalCount: number;
  onViewAll: () => void;
}

const statusMap: Record<Atendimento["status"], { label: string; className: string }> = {
  scheduled: { label: "Agendado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Concluído", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Cancelado", className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
};

const ProceduresTable = ({ atendimentos, totalCount, onViewAll }: ProceduresTableProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold">Atendimentos Recentes</h3>
        <button
          onClick={onViewAll}
          className="text-primary text-sm font-bold hover:underline"
        >
          Ver todo o histórico
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Procedimento</th>
              <th className="px-6 py-4">Dente</th>
              <th className="px-6 py-4">Dentista</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
            {atendimentos.map((item) => {
              const { label, className } = statusMap[item.status];
              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium">
                    {new Date(item.scheduledAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{item.procedure}</td>
                  <td className="px-6 py-4 font-medium">{item.tooth || "—"}</td>
                  <td className="px-6 py-4">
                    {item.dentistName ? (
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs">person</span>
                        </div>
                        <span>{item.dentistName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${className}`}>
                      {label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalCount > atendimentos.length && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 text-center">
          <p className="text-xs text-slate-500 font-medium italic">
            Exibindo os últimos {atendimentos.length} atendimentos. Total de {totalCount} registrados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProceduresTable;
