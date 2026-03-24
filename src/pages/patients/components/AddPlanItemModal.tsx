import { FormEvent, useState } from "react";
import { useCreatePlanItemNew } from "@/hooks/mutations/useCreatePlanItemNew";

interface AddPlanItemModalProps {
  isOpen: boolean;
  toothNumber: number | null;
  clinicId: string;
  patientId: string;
  planId: string;
  onClose: () => void;
}

const AddPlanItemModal = ({
  isOpen,
  toothNumber,
  clinicId,
  patientId,
  planId,
  onClose,
}: AddPlanItemModalProps) => {
  const [procedureName, setProcedureName] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { createItem, isPending, reset } = useCreatePlanItemNew({
    clinicId,
    patientId,
    planId,
  });

  const resetForm = () => {
    setProcedureName("");
    setNotes("");
    setValidationError(null);
    setMutationError(null);
    reset();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!procedureName.trim()) {
      setValidationError("Informe o nome do procedimento");
      return;
    }

    setValidationError(null);
    setMutationError(null);

    createItem(
      {
        toothNumber: toothNumber!,
        procedureName: procedureName.trim(),
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
        onError: () => {
          setMutationError("Erro ao adicionar procedimento. Tente novamente.");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">dentistry</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Adicionar Procedimento — Dente {toothNumber}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mutationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {mutationError}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="procedureName"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Procedimento *
            </label>
            <input
              id="procedureName"
              type="text"
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
              placeholder="Ex: Restauração, Extração..."
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {validationError && (
              <p className="text-sm text-rose-600 font-medium">{validationError}</p>
            )}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="notes"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Observações adicionais..."
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Adicionar ao Plano"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanItemModal;
