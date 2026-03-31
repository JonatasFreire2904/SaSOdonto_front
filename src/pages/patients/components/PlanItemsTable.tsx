import { useState } from "react";
import { PlanItem } from "@/api/treatmentPlanService";
import { useCompletePlanItem } from "@/hooks/mutations/useCompletePlanItem";
import { useCancelPlanItem } from "@/hooks/mutations/useCancelPlanItem";

interface PlanItemsTableProps {
  items: PlanItem[];
  clinicId: string;
  patientId: string;
  planId: string;
}

interface PlanItemRowProps {
  item: PlanItem;
  clinicId: string;
  patientId: string;
  planId: string;
}

const statusBadgeMap: Record<PlanItem["status"], { label: string; className: string }> = {
  planned: {
    label: "Planejado",
    className: "bg-blue-100 text-blue-700",
  },
  inProgress: {
    label: "Em andamento",
    className: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    label: "Concluído",
    className: "bg-emerald-100 text-emerald-700",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-slate-100 text-slate-500",
  },
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 inline-block"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

const formatDateForInput = (value: string) => value.split("T")[0];

const formatCompletedAt = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const PlanItemRow = ({ item, clinicId, patientId, planId }: PlanItemRowProps) => {
  const { completeItem, isPending: isCompletePending, error: completeError } = useCompletePlanItem({
    clinicId,
    patientId,
    planId,
  });
  const [completedAt, setCompletedAt] = useState(
    item.completedAt ? formatDateForInput(item.completedAt) : formatDateForInput(new Date().toISOString())
  );

  const { cancelItem, isPending: isCancelPending, error: cancelError } = useCancelPlanItem({
    clinicId,
    patientId,
    planId,
  });

  const isCancelled = item.status === "cancelled";
  const isCompleted = item.status === "completed";

  const { label, className } = statusBadgeMap[item.status];

  const rowError = completeError || cancelError;

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 font-medium">{item.toothNumber}</td>
        <td className="px-6 py-4 font-bold text-primary">{item.procedureName}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${className}`}>
            {label}
          </span>
        </td>
        <td className="px-6 py-4 text-slate-500">{item.notes ?? "—"}</td>
        <td className="px-6 py-4 text-slate-600 font-medium">{formatCompletedAt(item.completedAt)}</td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                completeItem({
                  itemId: item.id,
                  data: {
                    completionComment: item.completionComment ?? null,
                    completedAt: new Date(`${completedAt}T12:00:00`).toISOString(),
                  },
                })
              }
              disabled={isCompleted || isCancelled || isCompletePending || isCancelPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCompletePending ? <Spinner /> : null}
              Concluir
            </button>
            <button
              onClick={() => cancelItem(item.id)}
              disabled={isCancelled || isCompletePending || isCancelPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelPending ? <Spinner /> : null}
              Cancelar
            </button>
          </div>
          {!isCompleted && (
            <div className="mt-2">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Data de conclusão
              </label>
              <input
                type="date"
                value={completedAt}
                onChange={(event) => setCompletedAt(event.target.value)}
                className="mt-1 block w-full max-w-[180px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          )}
          {rowError && (
            <p className="mt-1 text-xs text-red-600">
              {(rowError as Error).message ?? "Ocorreu um erro. Tente novamente."}
            </p>
          )}
        </td>
      </tr>
    </>
  );
};

const PlanItemsTable = ({ items, clinicId, patientId, planId }: PlanItemsTableProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-4">Dente</th>
              <th className="px-6 py-4">Procedimento</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Observações</th>
              <th className="px-6 py-4">Concluído em</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                  Nenhum procedimento planejado
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <PlanItemRow
                  key={item.id}
                  item={item}
                  clinicId={clinicId}
                  patientId={patientId}
                  planId={planId}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanItemsTable;
