import { usePendingTreatments } from "@/hooks/queries/usePendingTreatments";
import { formatToothNumber } from "@/api/treatmentPlanService";
import type { PendingTreatmentItem } from "@/api/treatmentPlanService";

interface TreatmentSelectProps {
  clinicId: string;
  patientId: string;
  value: string;
  onChange: (treatmentId: string, treatment: PendingTreatmentItem | null) => void;
  className?: string;
}

/**
 * Componente de seleção de tratamento pendente
 * Permite vincular um tratamento do plano ao agendamento
 */
const TreatmentSelect = ({
  clinicId,
  patientId,
  value,
  onChange,
  className = "",
}: TreatmentSelectProps) => {
  const { data, isLoading, isError } = usePendingTreatments(
    clinicId,
    patientId
  );

  // Garante que treatments é sempre um array
  const treatments = Array.isArray(data) ? data : [];

  const handleChange = (treatmentId: string) => {
    const selected = treatments.find((t) => t.id === treatmentId) ?? null;
    onChange(treatmentId, selected);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-400 ${className}`}>
        <div className="size-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        Carregando tratamentos...
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-sm text-rose-600 dark:text-rose-400 ${className}`}>
        Erro ao carregar tratamentos
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none cursor-pointer ${className}`}
      >
        <option value="">Selecionar tratamento do plano...</option>
        {treatments.length === 0 ? (
          <option value="" disabled>
            Nenhum tratamento pendente
          </option>
        ) : (
          treatments.map((treatment) => (
            <option key={treatment.id} value={treatment.id}>
              {treatment.procedureName} - {formatToothNumber(treatment.toothNumber)}
              {treatment.status === "InProgress" ? " (Em andamento)" : ""}
            </option>
          ))
        )}
      </select>

      {treatments.length === 0 && (
        <p className="text-xs text-slate-500 italic">
          Este paciente não possui tratamentos pendentes no plano.
        </p>
      )}
    </div>
  );
};

export default TreatmentSelect;
