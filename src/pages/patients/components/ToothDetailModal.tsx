import { FormEvent, useState, useEffect, useMemo, useRef } from "react";
import type { ToothData } from "./Odontogram";
import { useProcedimentos, useAddToothProcedure, useUpdateToothStatus } from "@/hooks/useOdontogram";
import type { Procedimento } from "@/api/odontogramService";

interface ToothDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tooth: ToothData | null;
  clinicId: string;
  patientId: string;
}

const FACES = [
  { key: "V", label: "Vestibular" },
  { key: "L", label: "Lingual" },
  { key: "M", label: "Mesial" },
  { key: "D", label: "Distal" },
  { key: "O", label: "Oclusal / Incisal" },
] as const;

const ToothDetailModal = ({
  isOpen,
  onClose,
  onSuccess,
  tooth,
  clinicId,
  patientId,
}: ToothDetailModalProps) => {
  const [selectedFaces, setSelectedFaces] = useState<string[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedimento | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: procedimentos, isLoading: isLoadingProc } = useProcedimentos(clinicId);
  const { addProcedure, isLoading: isSubmitting, error, reset } = useAddToothProcedure(clinicId, patientId);
  const { updateStatus } = useUpdateToothStatus(clinicId, patientId);

  // Agrupar procedimentos por categoria
  const grouped = useMemo(() => {
    if (!procedimentos) return new Map<string, Procedimento[]>();
    const map = new Map<string, Procedimento[]>();
    for (const proc of procedimentos) {
      const cat = proc.category || "Outros";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(proc);
    }
    return map;
  }, [procedimentos]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFaces([]);
      setSelectedProcedure(null);
      setDropdownOpen(false);
      setExpandedCategories([]);
      reset();
    }
  }, [isOpen, tooth]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  if (!isOpen || !tooth) return null;

  const toggleFace = (face: string) => {
    setSelectedFaces((prev) =>
      prev.includes(face) ? prev.filter((f) => f !== face) : [...prev, face]
    );
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const ALL_FACE_KEYS = FACES.map((f) => f.key);

  // Detecta se o procedimento é cirurgia/exodontia para auto-selecionar todas as faces
  const isSurgeryProcedure = (proc: Procedimento) => {
    const name = proc.name.toLowerCase();
    const cat = (proc.category || "").toLowerCase();
    return (
      cat.includes("cirurgia") ||
      name.includes("exodontia") ||
      name.includes("extração")
    );
  };

  const selectProcedure = (proc: Procedimento) => {
    setSelectedProcedure(proc);
    setDropdownOpen(false);
    if (isSurgeryProcedure(proc)) {
      setSelectedFaces([...ALL_FACE_KEYS]);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const notes = String(form.get("notes") ?? "").trim();

    if (!selectedProcedure || selectedFaces.length === 0) return;

    const payload: { toothNumber: number; procedureId: string; faces: string; notes?: string } = {
      toothNumber: tooth.number,
      procedureId: selectedProcedure.id,
      faces: selectedFaces.join(","),
    };
    if (notes) payload.notes = notes;

    addProcedure(payload, {
      onSuccess: () => {
        // Se for cirurgia/exodontia, marca o dente como extraído
        if (isSurgeryProcedure(selectedProcedure)) {
          updateStatus({
            toothNumber: tooth.number,
            data: { status: "extracted", notes: notes || "Exodontia realizada" },
          });
        }
        onSuccess();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {tooth.number}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Dente {tooth.number}
              </h3>
              <p className="text-sm text-slate-500">
                Registrar procedimento realizado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Procedimento — Dropdown agrupado por categoria */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Procedimento
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">
                    medical_services
                  </span>
                </div>
                <span className={selectedProcedure ? "text-slate-900 dark:text-white text-sm" : "text-slate-400 text-sm"}>
                  {isLoadingProc
                    ? "Carregando..."
                    : selectedProcedure
                    ? selectedProcedure.name
                    : "Selecione o procedimento"}
                </span>
                <span className="material-symbols-outlined text-slate-400 text-sm ml-auto">
                  {dropdownOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown list */}
              {dropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {[...grouped.entries()].map(([category, procs]) => (
                    <div key={category}>
                      {/* Categoria header */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="flex items-center w-full px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary bg-slate-50 dark:bg-slate-800/50 hover:bg-primary/5 transition-colors sticky top-0"
                      >
                        <span className="material-symbols-outlined text-sm mr-2 transition-transform" style={{ transform: expandedCategories.includes(category) ? "rotate(90deg)" : "rotate(0deg)" }}>
                          chevron_right
                        </span>
                        {category}
                        <span className="ml-auto text-[10px] text-slate-400 font-normal normal-case tracking-normal">
                          {procs.length}
                        </span>
                      </button>

                      {/* Procedimentos da categoria */}
                      {expandedCategories.includes(category) &&
                        procs.map((proc) => (
                          <button
                            key={proc.id}
                            type="button"
                            onClick={() => selectProcedure(proc)}
                            className={`flex items-center w-full pl-10 pr-4 py-2.5 text-sm transition-colors ${
                              selectedProcedure?.id === proc.id
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {proc.name}
                            {selectedProcedure?.id === proc.id && (
                              <span className="material-symbols-outlined text-sm ml-auto text-primary">check</span>
                            )}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Faces */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Faces do Dente
            </label>
            <div className="flex flex-wrap gap-2">
              {FACES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleFace(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                    selectedFaces.includes(key)
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="text-base">{key}</span>
                  <span className="hidden sm:inline ml-1 text-xs font-normal opacity-70">
                    {label}
                  </span>
                </button>
              ))}
            </div>
            {selectedFaces.length === 0 && (
              <p className="text-xs text-slate-400">Selecione ao menos uma face</p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="notes"
              >
                Observações
              </label>
              <span className="text-xs text-slate-400">Opcional</span>
            </div>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Ex: Restauração em resina composta, cor A2..."
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedFaces.length === 0 || !selectedProcedure}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Salvar Procedimento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToothDetailModal;
