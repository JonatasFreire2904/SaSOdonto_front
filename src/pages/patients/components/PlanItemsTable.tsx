import { useState } from "react";
import { PlanItem } from "@/api/treatmentPlanService";
import { useCompletePlanItem } from "@/hooks/mutations/useCompletePlanItem";
import { useCancelPlanItem } from "@/hooks/mutations/useCancelPlanItem";
import { usePlanFinancialSummary } from "@/hooks/queries/usePlanFinancialSummary";
import PaymentModal from "./PaymentModal";

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
  onOpenPayment: (item: PlanItem) => void;
}

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  planned: {
    label: "Planejado",
    className: "bg-blue-100 text-blue-700",
  },
  Planned: {
    label: "Planejado",
    className: "bg-blue-100 text-blue-700",
  },
  inProgress: {
    label: "Em andamento",
    className: "bg-yellow-100 text-yellow-700",
  },
  InProgress: {
    label: "Em andamento",
    className: "bg-yellow-100 text-yellow-700",
  },
  completed: {
    label: "Concluido",
    className: "bg-emerald-100 text-emerald-700",
  },
  Completed: {
    label: "Concluido",
    className: "bg-emerald-100 text-emerald-700",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-slate-100 text-slate-500",
  },
  Cancelled: {
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
    : "-";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const getItemPrice = (item: PlanItem) =>
  typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0;

const getItemPaid = (item: PlanItem) => {
  if (typeof item.paidAmount === "number" && Number.isFinite(item.paidAmount)) {
    return item.paidAmount;
  }

  return 0;
};

const getItemRemaining = (item: PlanItem) => {
  if (typeof item.balanceAmount === "number" && Number.isFinite(item.balanceAmount)) {
    return item.balanceAmount;
  }
  return 0;
};

const getFinancialBadge = (item: PlanItem) => {
  if (item.paymentStatus === "Paid") {
    return {
      label: "Pago",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  if (item.paymentStatus === "PartiallyPaid") {
    return {
      label: "Parcial",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Pendente",
    className: "bg-rose-100 text-rose-700",
  };
};

const PlanItemRow = ({ item, clinicId, patientId, planId, onOpenPayment }: PlanItemRowProps) => {
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

  const isCancelled = item.status === "cancelled" || item.status === "Cancelled";
  const isCompleted = item.status === "completed" || item.status === "Completed";
  const remaining = getItemRemaining(item);

  const { label, className } =
    statusBadgeMap[item.status] ?? { label: String(item.status || "Desconhecido"), className: "bg-slate-100 text-slate-600" };
  const paymentBadge = getFinancialBadge(item);

  const rowError = completeError || cancelError;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 font-medium">{item.toothNumber}</td>
      <td className="px-6 py-4 font-bold text-primary">{item.procedureName}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${className}`}>
          {label}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-500">{item.notes ?? "-"}</td>
      <td className="px-6 py-4 text-slate-600 font-medium">{formatCompletedAt(item.completedAt)}</td>
      <td className="px-6 py-4 text-slate-700 font-semibold">{formatCurrency(getItemPrice(item))}</td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className={`inline-flex w-fit px-2 py-1 rounded-full text-[11px] font-bold ${paymentBadge.className}`}>
            {paymentBadge.label}
          </span>
          <span className="text-slate-700 font-semibold">{formatCurrency(getItemPaid(item))}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-slate-700 font-semibold">{formatCurrency(remaining)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              completeItem(
                {
                  itemId: item.id,
                  data: {
                    completionComment: item.completionComment ?? null,
                    completedAt: new Date(`${completedAt}T12:00:00`).toISOString(),
                  },
                },
                {
                  onSuccess: () => {
                    if (remaining > 0) {
                      const shouldRegisterPayment = window.confirm(
                        "Procedimento concluido. Deseja registrar pagamento agora?"
                      );
                      if (shouldRegisterPayment) {
                        onOpenPayment(item);
                      }
                    }
                  },
                }
              )
            }
            disabled={isCompleted || isCancelled || isCompletePending || isCancelPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCompletePending ? <Spinner /> : null}
            Concluir
          </button>
          <button
            onClick={() => onOpenPayment(item)}
            disabled={isCancelled || remaining <= 0 || isCompletePending || isCancelPending}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined text-sm">payments</span>
            Registrar pagamento
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
              Data de conclusao
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
  );
};

const PlanItemsTable = ({ items, clinicId, patientId, planId }: PlanItemsTableProps) => {
  const [paymentItem, setPaymentItem] = useState<PlanItem | null>(null);
  const {
    data: financialSummary,
    isLoading: isFinancialSummaryLoading,
  } = usePlanFinancialSummary(clinicId, patientId, planId);

  const totalTreatment = financialSummary?.totalTreatment ?? 0;
  const totalPaid = financialSummary?.totalPaid ?? 0;
  const totalCompleted = financialSummary?.totalCompleted ?? 0;
  const remainingBalance = financialSummary?.remainingBalance ?? 0;

  const formatSummaryValue = (value: number) =>
    isFinancialSummaryLoading ? "..." : formatCurrency(value);

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
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Pago</th>
              <th className="px-6 py-4">Saldo</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 text-sm">
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
                  onOpenPayment={setPaymentItem}
                />
              ))
            )}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={9} className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Total do tratamento</p>
                      <p className="text-base font-extrabold text-slate-800">{formatSummaryValue(totalTreatment)}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Total concluido</p>
                      <p className="text-base font-extrabold text-emerald-700">{formatSummaryValue(totalCompleted)}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Total pago</p>
                      <p className="text-base font-extrabold text-blue-700">{formatSummaryValue(totalPaid)}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Saldo pendente</p>
                      <p className="text-base font-extrabold text-amber-700">{formatSummaryValue(remainingBalance)}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <PaymentModal
        isOpen={paymentItem !== null}
        item={paymentItem}
        clinicId={clinicId}
        patientId={patientId}
        planId={planId}
        onClose={() => setPaymentItem(null)}
      />
    </div>
  );
};

export default PlanItemsTable;
