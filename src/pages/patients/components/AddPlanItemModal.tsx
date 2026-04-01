import { FormEvent, useState, useEffect } from "react";
import { useCreatePlanItemNew } from "@/hooks/mutations/useCreatePlanItemNew";

interface AddPlanItemModalProps {
  isOpen: boolean;
  toothNumber: number | null;
  clinicId: string;
  patientId: string;
  planId: string;
  onClose: () => void;
}

const COMMON_PROCEDURES = [
  { name: "Restauração", price: 200 },
  { name: "Canal", price: 800 },
  { name: "Extração", price: 150 },
  { name: "Profilaxia", price: 120 },
  { name: "Clareamento", price: 600 },
  { name: "Coroa", price: 1200 },
];

const AddPlanItemModal = ({
  isOpen,
  toothNumber: preselectedTooth,
  clinicId,
  patientId,
  planId,
  onClose,
}: AddPlanItemModalProps) => {
  const [isGeneral, setIsGeneral] = useState(preselectedTooth === null);
  const [toothNumber, setToothNumber] = useState(preselectedTooth?.toString() || "");
  const [procedureName, setProcedureName] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Sincroniza o estado quando o dente pré-selecionado muda (ex: ao abrir modal para outro dente)
  useEffect(() => {
    if (isOpen) {
      setToothNumber(preselectedTooth?.toString() || "");
      setIsGeneral(preselectedTooth === null);
    }
  }, [isOpen, preselectedTooth]);

  const { createItem, isPending, reset } = useCreatePlanItemNew({
    clinicId,
    patientId,
    planId,
  });

  const resetForm = () => {
    setProcedureName("");
    setPrice("");
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

  const handleQuickSelect = (procedure: typeof COMMON_PROCEDURES[0]) => {
    setProcedureName(procedure.name);
    setPrice(String(procedure.price));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!procedureName.trim()) {
      setValidationError("Informe o nome do procedimento");
      return;
    }

    const parsedPrice = price.trim() ? Number(price) : null;
    if (parsedPrice !== null && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      setValidationError("Informe um valor válido");
      return;
    }

    let finalToothNumber: number | null = null;
    if (!isGeneral) {
      const parsed = parseInt(toothNumber);
      if (isNaN(parsed) || parsed < 11 || parsed > 48) {
        setValidationError("Número do dente inválido (11-48)");
        return;
      }
      finalToothNumber = parsed;
    }

    setValidationError(null);
    setMutationError(null);

    createItem(
      {
        toothNumber: finalToothNumber ?? 0,  // 0 para procedimento geral
        procedureName: procedureName.trim(),
        price: parsedPrice,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Adicionar Procedimento
                </h3>
                <p className="text-sm text-slate-500">
                  {preselectedTooth ? `Dente ${preselectedTooth}` : "Novo item ao plano"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {mutationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {mutationError}
            </div>
          )}

          {/* Quick select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Procedimentos Comuns
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_PROCEDURES.map((proc) => (
                <button
                  key={proc.name}
                  type="button"
                  onClick={() => handleQuickSelect(proc)}
                  className="px-3 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  {proc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Geral/Localizado */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Localização
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsGeneral(false)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all ${
                  !isGeneral
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <span className="material-symbols-outlined text-lg block mb-1">dentistry</span>
                Dente Específico
              </button>
              <button
                type="button"
                onClick={() => setIsGeneral(true)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold text-sm transition-all ${
                  isGeneral
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <span className="material-symbols-outlined text-lg block mb-1">public</span>
                Procedimento Geral
              </button>
            </div>
          </div>

          {/* Número do dente (se não for geral) */}
          {!isGeneral && (
            <div className="space-y-2">
              <label htmlFor="toothNumber" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Número do Dente *
              </label>
              <input
                id="toothNumber"
                type="number"
                min="11"
                max="48"
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
                placeholder="Ex: 16, 36, 21..."
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-500">Numeração FDI: 11-48</p>
            </div>
          )}

          {/* Nome do procedimento */}
          <div className="space-y-2">
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
              placeholder="Ex: Restauração, Extração, Limpeza..."
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            {validationError && (
              <p className="text-sm text-rose-600 font-medium">{validationError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Valor (R$)
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 250.00"
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
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

          {/* Botões */}
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
                <>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Adicionar ao Plano
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanItemModal;
