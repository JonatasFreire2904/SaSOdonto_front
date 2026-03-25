import { FormEvent, useState } from "react";
import { atendimentoService } from "@/api/atendimentoService";
import type { Atendimento } from "@/api/atendimentoService";
import { useProfessionals } from "@/hooks/queries/useProfessionals";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (atendimento: Atendimento) => void;
  patientId: string;
  patientName: string;
  clinicId: string;
}

const CreateAppointmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  patientName,
  clinicId,
}: CreateAppointmentModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: professionals = [] } = useProfessionals(clinicId);
  const activeProfessionals = professionals.filter((p) => p.clinicId === clinicId);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const procedure = String(form.get("procedure")).trim();
    const scheduledAt = String(form.get("scheduledAt")).trim();
    const priceStr = String(form.get("price")).trim();
    const professionalId = String(form.get("professionalId")).trim();
    const tooth = String(form.get("tooth")).trim() || undefined;
    const description = String(form.get("description")).trim() || undefined;

    if (!procedure || !scheduledAt) {
      setError("Procedimento e data/hora são obrigatórios.");
      return;
    }

    if (!professionalId) {
      setError("Selecione um profissional responsável.");
      return;
    }

    const price = priceStr ? parseFloat(priceStr) : 0;
    if (isNaN(price) || price < 0) {
      setError("Valor inválido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await atendimentoService.create(clinicId, {
        procedure,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        price,
        professionalId,
        tooth,
        patientId,
      });
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) setError("Profissional inválido para atendimentos.");
      else if (status === 403) setError("Profissional não pertence a esta clínica.");
      else if (status === 404) setError("Paciente ou profissional não encontrado.");
      else setError("Erro ao criar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">calendar_add_on</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nova Consulta
              </h3>
              <p className="text-sm text-slate-500">{patientName}</p>
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

          {/* Procedimento */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-procedure">
              Procedimento *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">medical_services</span>
              </div>
              <input
                id="appt-procedure"
                name="procedure"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="Ex: Limpeza, Restauração, Canal..."
              />
            </div>
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-date">
              Data e Hora *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">schedule</span>
              </div>
              <input
                id="appt-date"
                name="scheduledAt"
                type="datetime-local"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Profissional e Dente lado-a-lado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-professional">
                Profissional *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
                </div>
                <select
                  id="appt-professional"
                  name="professionalId"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all appearance-none"
                >
                  <option value="">Selecionar...</option>
                  {activeProfessionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.userName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-tooth">
                Dente
              </label>
              <input
                id="appt-tooth"
                name="tooth"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="Ex: 18, 36..."
              />
            </div>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-price">
              Valor (R$)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">payments</span>
              </div>
              <input
                id="appt-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-desc">
              Descrição
            </label>
            <textarea
              id="appt-desc"
              name="description"
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
              placeholder="Observações sobre o atendimento..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Agendando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">check</span>
                  Agendar Consulta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
