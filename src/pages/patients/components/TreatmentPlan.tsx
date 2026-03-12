import { FormEvent, useState } from "react";
import { useTreatmentPlan } from "@/hooks/queries/useTreatmentPlan";
import { useCreatePlanItem } from "@/hooks/mutations/useCreatePlanItem";
import { useUpdatePlanItem } from "@/hooks/mutations/useUpdatePlanItem";
import { useDeletePlanItem } from "@/hooks/mutations/useDeletePlanItem";
import { useDeleteAllPlan } from "@/hooks/mutations/useDeleteAllPlan";

interface TreatmentPlanProps {
  clinicId: string;
  patientId: string;
}

const CATEGORIES = [
  "Restauração",
  "Ortodontia",
  "Cirurgia",
  "Endodontia",
  "Periodontia",
  "Prótese",
  "Implante",
  "Estética",
  "Prevenção",
  "Outro",
];

const TreatmentPlan = ({ clinicId, patientId }: TreatmentPlanProps) => {
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const { data: items = [], isLoading } = useTreatmentPlan(clinicId, patientId);
  const { create, isLoading: isCreating, error: createError, reset } = useCreatePlanItem(clinicId, patientId);
  const { update } = useUpdatePlanItem(clinicId, patientId);
  const { remove } = useDeletePlanItem(clinicId, patientId);
  const { removeAll, isLoading: isRemovingAll } = useDeleteAllPlan(clinicId, patientId);

  const completed = items.filter((i) => i.isCompleted).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name")).trim();
    const category = String(form.get("category")).trim();
    const date = String(form.get("date")).trim();

    if (!name || !date) return;

    create(
      { name, category: category || undefined, date: new Date(date).toISOString() },
      {
        onSuccess: () => {
          setShowForm(false);
          reset();
        },
      }
    );
  };

  const toggleComplete = (id: string, current: boolean) => {
    update({ planId: id, data: { isCompleted: !current } });
  };

  const handleDeleteAll = () => {
    removeAll(undefined, {
      onSuccess: () => setConfirmDeleteAll(false),
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Carregando plano de tratamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">assignment</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Plano de Tratamento
            </h3>
            <p className="text-sm text-slate-500">
              {total === 0
                ? "Nenhum procedimento planejado"
                : `${completed} de ${total} concluído${completed !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {total > 0 && (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="px-3 py-2 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
              Limpar Tudo
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(!showForm);
              reset();
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">
              {showForm ? "close" : "add"}
            </span>
            {showForm ? "Cancelar" : "Novo Item"}
          </button>
        </div>
      </div>

      {/* Barra de Progresso */}
      {total > 0 && (
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Progresso
            </span>
            <span className="text-xs font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Formulário de criação */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {createError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="plan-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nome do tratamento *
              </label>
              <input
                id="plan-name"
                name="name"
                type="text"
                required
                maxLength={200}
                placeholder="Ex: Restauração dente 36"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="plan-category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Categoria
              </label>
              <select
                id="plan-category"
                name="category"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white appearance-none"
              >
                <option value="">Selecione (opcional)</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="plan-date" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Data prevista *
              </label>
              <input
                id="plan-date"
                name="date"
                type="date"
                required
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
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
      )}

      {/* Lista de itens */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 && !showForm && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-2">assignment</span>
            <p className="font-bold">Nenhum plano de tratamento</p>
            <p className="text-sm mt-1">Clique em "Novo Item" para começar</p>
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 px-6 py-4 group transition-colors ${
              item.isCompleted ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleComplete(item.id, item.isCompleted)}
              className={`flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center transition-all ${
                item.isCompleted
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : "border-slate-300 dark:border-slate-600 hover:border-primary"
              }`}
            >
              {item.isCompleted && (
                <span className="material-symbols-outlined text-sm">check</span>
              )}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-sm ${
                  item.isCompleted
                    ? "text-slate-400 line-through"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {item.name}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {item.category && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                )}
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">calendar_today</span>
                  {new Date(item.date).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0 hidden sm:block">
              {item.isCompleted ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Concluído
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-500/10 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  Pendente
                </span>
              )}
            </div>

            {/* Ações */}
            <button
              onClick={() => remove(item.id)}
              className="flex-shrink-0 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        ))}
      </div>

      {/* Confirmação de deletar tudo */}
      {confirmDeleteAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteAll(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Limpar plano inteiro?
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Todos os {total} itens serão removidos permanentemente.
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setConfirmDeleteAll(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isRemovingAll}
                  className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRemovingAll ? (
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">delete_forever</span>
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlan;
