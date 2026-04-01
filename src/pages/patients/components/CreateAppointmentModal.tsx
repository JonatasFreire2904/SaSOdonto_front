import { FormEvent, useState, useEffect, useMemo } from "react";
import { atendimentoService, ALLOWED_DURATIONS } from "@/api/atendimentoService";
import type { Atendimento } from "@/api/atendimentoService";
import { useProfessionals } from "@/hooks/queries/useProfessionals";
import { useAppointmentAvailability } from "@/hooks/queries/useAppointmentAvailability";
import TreatmentSelect from "./TreatmentSelect";
import type { PendingTreatmentItem } from "@/api/treatmentPlanService";
import { formatToothNumber } from "@/api/treatmentPlanService";
import Calendar from "@/components/ui/Calendar";
import TimeSlotSelector from "@/components/ui/TimeSlotSelector";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (atendimento: Atendimento) => void;
  patientId: string;
  patientName: string;
  clinicId: string;
}

type ModalStep = "schedule" | "details";

const CreateAppointmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  patientId,
  patientName,
  clinicId,
}: CreateAppointmentModalProps) => {
  const [step, setStep] = useState<ModalStep>("schedule");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState<PendingTreatmentItem | null>(null);
  const [manualProcedure, setManualProcedure] = useState("");
  const [manualTooth, setManualTooth] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const { data: professionals = [] } = useProfessionals(clinicId);
  const activeProfessionals = useMemo(
    () => professionals.filter((p) => p.clinicId === clinicId),
    [professionals, clinicId]
  );

  const {
    selectedDate,
    selectedTime,
    professionalId,
    scheduledAt,
    setSelectedDate,
    setSelectedTime,
    setProfessionalId,
    slots,
    isLoading: isSlotsLoading,
    isSelectionValid,
    canFitDuration,
    isSelectionValidForDuration,
  } = useAppointmentAvailability({ clinicId });

  const durationMinutes = 60;

  // Seleciona primeiro profissional disponível ao carregar
  useEffect(() => {
    if (activeProfessionals.length > 0 && !professionalId) {
      setProfessionalId(activeProfessionals[0].id);
    }
  }, [activeProfessionals, professionalId, setProfessionalId]);

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setStep("schedule");
      setSelectedTreatmentId("");
      setSelectedTreatment(null);
      setManualProcedure("");
      setManualTooth("");
      setPrice("");
      setDescription("");
      setError(null);
    }
  }, [isOpen]);

  const handleTreatmentChange = (treatmentId: string, treatment: PendingTreatmentItem | null) => {
    setSelectedTreatmentId(treatmentId);
    setSelectedTreatment(treatment);
    if (treatment) {
      setManualProcedure("");
      setManualTooth("");
      setPrice(
        typeof treatment.price === "number" && Number.isFinite(treatment.price)
          ? String(treatment.price)
          : ""
      );
    }
  };

  const handleContinue = () => {
    if (!isSelectionValidForDuration(durationMinutes)) {
      setError("Selecione uma data, horário e profissional.");
      return;
    }

    if (selectedTime && !canFitDuration(selectedTime, durationMinutes)) {
      setError("Este horário não comporta a duração escolhida. Selecione outro horário.");
      return;
    }

    setError(null);
    setStep("details");
  };

  const handleBack = () => {
    setStep("schedule");
    setError(null);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const procedure = selectedTreatment
      ? selectedTreatment.procedureName
      : manualProcedure.trim();
    
    const toothNum = selectedTreatment?.toothNumber;
    const tooth = selectedTreatment
      ? (toothNum === 0 || toothNum === undefined ? undefined : String(toothNum))
      : manualTooth.trim() || undefined;

    if (!procedure) {
      setError("Procedimento é obrigatório.");
      return;
    }

    if (!scheduledAt || !professionalId) {
      setError("Data, horário e profissional são obrigatórios.");
      return;
    }

    if (!ALLOWED_DURATIONS.includes(durationMinutes)) {
      setError("Duração inválida. Valores permitidos: 15, 30, 45, 60, 90, 120 minutos.");
      return;
    }

    if (selectedTime && !canFitDuration(selectedTime, durationMinutes)) {
      setError("Este horário não comporta a duração escolhida. Selecione outro horário.");
      return;
    }

    const priceValue = price ? parseFloat(price) : 0;
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Valor inválido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await atendimentoService.create(clinicId, {
        procedure,
        description: description.trim() || undefined,
        scheduledAt,
        price: priceValue,
        professionalId,
        tooth,
        patientId,
        treatmentItemId: selectedTreatmentId || undefined,
        durationMinutes,
      });
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const errorPayload = (err as { response?: { status?: number; data?: { code?: string; message?: string } } })?.response;
      const status = errorPayload?.status;
      const code = errorPayload?.data?.code;

      if (status === 409 || code === "APPOINTMENT_CONFLICT") {
        setError("Horário já está ocupado. Escolha outro horário.");
      } else if (code === "INVALID_DURATION") {
        setError("Duração inválida. Valores permitidos: 15, 30, 45, 60, 90, 120 minutos.");
      } else if (status === 403) {
        setError("Profissional não pertence a esta clínica.");
      } else if (status === 404) {
        setError("Paciente ou profissional não encontrado.");
      } else {
        setError(errorPayload?.data?.message || "Erro ao criar agendamento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProfessionalName = activeProfessionals.find(p => p.id === professionalId)?.userName;
  const hasDurationConflict = !!selectedTime && !canFitDuration(selectedTime, durationMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
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
          
          {/* Steps indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "schedule" ? "bg-primary text-white" : "bg-emerald-500 text-white"}`}>
                {step === "details" ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : "1"}
              </div>
              <span className={`text-sm font-medium ${step === "schedule" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                Agenda
              </span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "details" ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"}`}>
                2
              </div>
              <span className={`text-sm font-medium ${step === "details" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                Detalhes
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {step === "schedule" ? (
            /* Step 1: Calendar and Time Selection */
            <div className="p-6 space-y-6">
              {/* Professional Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Profissional
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeProfessionals.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfessionalId(p.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        professionalId === p.id
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-primary"
                      }`}
                    >
                      {p.userName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar and Time Slots side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Selecione a data
                  </label>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    minDate={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Time Slots */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                    Selecione o horário
                  </label>
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto max-h-[360px]">
                    <TimeSlotSelector
                      slots={slots}
                      selectedTime={selectedTime}
                      onTimeSelect={setSelectedTime}
                      isLoading={isSlotsLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Selection Summary */}
              {selectedDate && selectedTime && professionalId && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-2xl">event_available</span>
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Agendamento selecionado
                      </p>
                      <p className="text-sm text-emerald-700 dark:text-emerald-400">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { 
                          weekday: "long", 
                          day: "numeric", 
                          month: "long" 
                        })} às {selectedTime} • {selectedProfessionalName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && professionalId && hasDurationConflict && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">warning</span>
                  Este horário não comporta consulta de 60 minutos. Selecione outro horário.
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Appointment Details */
            <form id="appointment-form" onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Resumo do agendamento */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">event</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", { 
                      weekday: "short", 
                      day: "numeric", 
                      month: "short" 
                    })} às {selectedTime}
                  </p>
                  <p className="text-sm text-slate-500">
                    Com {selectedProfessionalName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="ml-auto text-primary hover:underline text-sm font-medium"
                >
                  Alterar
                </button>
              </div>

              {/* Vincular Tratamento do Plano */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">assignment</span>
                    Vincular ao Plano de Tratamento
                  </span>
                </label>
                <TreatmentSelect
                  clinicId={clinicId}
                  patientId={patientId}
                  value={selectedTreatmentId}
                  onChange={handleTreatmentChange}
                />
                {selectedTreatment && (
                  <div className="mt-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-lg mt-0.5">check_circle</span>
                      <div className="text-sm">
                        <p className="font-medium text-emerald-700 dark:text-emerald-400">
                          {selectedTreatment.procedureName}
                        </p>
                        <p className="text-emerald-600/80 dark:text-emerald-400/80">
                          {formatToothNumber(selectedTreatment.toothNumber ?? 0)}
                          {selectedTreatment.treatmentPlan?.name && ` • Plano: ${selectedTreatment.treatmentPlan.name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divisor */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  {selectedTreatment ? "Dados preenchidos do plano" : "ou digite manualmente"}
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Procedimento e Dente */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-procedure">
                    Procedimento *
                  </label>
                  <input
                    id="appt-procedure"
                    required={!selectedTreatment}
                    disabled={!!selectedTreatment}
                    value={selectedTreatment ? selectedTreatment.procedureName : manualProcedure}
                    onChange={(e) => setManualProcedure(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all ${selectedTreatment ? "opacity-60 cursor-not-allowed" : ""}`}
                    placeholder="Ex: Profilaxia, Restauração..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-tooth">
                    Dente
                  </label>
                  <input
                    id="appt-tooth"
                    disabled={!!selectedTreatment}
                    value={selectedTreatment 
                      ? ((selectedTreatment.toothNumber ?? 0) === 0 ? "Geral" : String(selectedTreatment.toothNumber)) 
                      : manualTooth}
                    onChange={(e) => setManualTooth(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all ${selectedTreatment ? "opacity-60 cursor-not-allowed" : ""}`}
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
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="appt-desc">
                  Observações
                </label>
                <textarea
                  id="appt-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Observações sobre o atendimento..."
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex gap-3">
            {step === "schedule" ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isSelectionValidForDuration(durationMinutes)}
                  className="flex-1 py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  Continuar
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Voltar
                </button>
                <button
                  type="submit"
                  form="appointment-form"
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
                      Confirmar Agendamento
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAppointmentModal;
