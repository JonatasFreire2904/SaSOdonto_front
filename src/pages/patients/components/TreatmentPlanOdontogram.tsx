import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlan, planKeys } from "@/hooks/queries/usePlan";
import { usePlanItems } from "@/hooks/queries/usePlanItems";
import { treatmentPlanService } from "@/api/treatmentPlanService";
import PlanningOdontogram from "./PlanningOdontogram";
import AddPlanItemModal from "./AddPlanItemModal";
import PlanItemsTable from "./PlanItemsTable";

interface TreatmentPlanOdontogramProps {
  clinicId: string;
  patientId: string;
}

const TreatmentPlanOdontogram = ({ clinicId, patientId }: TreatmentPlanOdontogramProps) => {
  const queryClient = useQueryClient();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const { data: plan, isLoading: isPlanLoading, isError: isPlanError, refetch: refetchPlan } = usePlan(clinicId, patientId);

  const { mutate: createPlan, isPending: isCreatingPlan } = useMutation({
    mutationFn: () => treatmentPlanService.createPlan(clinicId, patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys(clinicId, patientId) });
    },
  });

  const {
    data: items,
    isLoading: isItemsLoading,
    isError: isItemsError,
    refetch: refetchItems,
  } = usePlanItems(clinicId, patientId, plan?.id);

  if (isPlanLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="size-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
          <span className="text-sm">Carregando plano de tratamento...</span>
        </div>
      </div>
    );
  }

  if (isPlanError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <span className="material-symbols-outlined text-4xl text-rose-400">error</span>
          <p className="text-sm font-medium">Erro ao carregar o plano de tratamento.</p>
          <button
            onClick={() => refetchPlan()}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-slate-300">dentistry</span>
          <p className="text-slate-500 text-sm">Nenhum plano de tratamento encontrado.</p>
          <button
            onClick={() => createPlan()}
            disabled={isCreatingPlan}
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingPlan ? (
              <>
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">add</span>
                Criar plano
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PlanningOdontogram
        items={items ?? []}
        onToothClick={(n) => setSelectedTooth(n)}
      />

      {isItemsError && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            Erro ao carregar os procedimentos.
          </span>
          <button
            onClick={() => refetchItems()}
            className="font-bold underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isItemsLoading && (
        <PlanItemsTable
          items={items ?? []}
          clinicId={clinicId}
          patientId={patientId}
          planId={plan.id}
        />
      )}

      <AddPlanItemModal
        isOpen={selectedTooth !== null}
        toothNumber={selectedTooth}
        clinicId={clinicId}
        patientId={patientId}
        planId={plan.id}
        onClose={() => setSelectedTooth(null)}
      />
    </div>
  );
};

export default TreatmentPlanOdontogram;
