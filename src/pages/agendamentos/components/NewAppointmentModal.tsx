import { FormEvent, useState, useEffect, useMemo } from "react";
import { atendimentoService } from "@/api/atendimentoService";
import { useProfessionals } from "@/hooks/queries/useProfessionals";
import { useAppointmentAvailability } from "@/hooks/queries/useAppointmentAvailability";
import { usePatients, useDebounce } from "@/hooks/queries/usePatients";
import type { Patient } from "@/api/patientService";
import { getClinicId } from "@/utils/clinic";
import Calendar from "@/components/ui/Calendar";
import TimeSlotSelector from "@/components/ui/TimeSlotSelector";

interface PreSelectedSchedule {
  date: string;
  time: string;
  professionalId: string;
}

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  preSelectedSchedule?: PreSelectedSchedule | null;
}

type ModalStep = "patient" | "schedule" | "details";

/**
 * Modal de novo agendamento para a página de Agendamentos
 * Fluxo: Selecionar Paciente → Selecionar Data/Hora → Detalhes
 * Quando preSelectedSchedule é fornecido, pula o step "schedule"
 */
const NewAppointmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  preSelectedSchedule,
}: NewAppointmentModalProps) => {
  const hasPreSelected = !!preSelectedSchedule;
  const [step, setStep] = useState<ModalStep>("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Patient selection
  const [patientSearch, setPatientSearch] = useState("");
  const debouncedSearch = useDebounce(patientSearch, 300);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  
  // Appointment details
  const [procedure, setProcedure] = useState("");
  const [tooth, setTooth] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Get clinicId from shared util
  const clinicId = useMemo(getClinicId, []);

  // usePatients(clinicId, search, page, pageSize, status, enabled)
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(
    clinicId,
    debouncedSearch,
    1,
    10,
    "Active",
    isOpen && step === "patient"
  );
  const patients = patientsData?.data || [];

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
    setSelectedTimeForce,
    setProfessionalId,
    slots,
    isLoading: isSlotsLoading,
    isSelectionValid,
  } = useAppointmentAvailability({
    initialDate: initialDate || new Date().toISOString().split("T")[0],
  });

  // Seleciona primeiro profissional disponível ao carregar
  useEffect(() => {
    if (activeProfessionals.length > 0 && !professionalId) {
      setProfessionalId(activeProfessionals[0].id);
    }
  }, [activeProfessionals, professionalId, setProfessionalId]);

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setStep("patient");
      setPatientSearch("");
      setSelectedPatientId(null);
      setSelectedPatientName("");
      setProcedure("");
      setTooth("");
      setPrice("");
      setDescription("");
      setDurationMinutes(60);
      setError(null);
    }
  }, [isOpen]);

  // Inicializar com dados pré-selecionados
  useEffect(() => {
    if (isOpen && preSelectedSchedule) {
      setProfessionalId(preSelectedSchedule.professionalId);
      setSelectedDate(preSelectedSchedule.date);
      setSelectedTimeForce(preSelectedSchedule.time);
    }
  }, [isOpen, preSelectedSchedule, setProfessionalId, setSelectedDate, setSelectedTimeForce]);

  if (!isOpen) return null;

  const handlePatientSelect = (patient: { id: string; name: string }) => {
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setStep(hasPreSelected ? "details" : "schedule");
  };

  const handleContinueToDetails = () => {
    if (!isSelectionValid) {
      setError("Selecione uma data, horário e profissional.");
      return;
    }
    setError(null);
    setStep("details");
  };

  const handleBack = () => {
    if (step === "schedule") {
      setStep("patient");
    } else if (step === "details") {
      setStep(hasPreSelected ? "patient" : "schedule");
    }
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!procedure.trim()) {
      setError("Procedimento é obrigatório.");
      return;
    }

    const effectiveScheduledAt = preSelectedSchedule
      ? new Date(`${preSelectedSchedule.date}T${preSelectedSchedule.time}`).toISOString()
      : scheduledAt;
    const effectiveProfessionalId = preSelectedSchedule?.professionalId || professionalId;

    if (!effectiveScheduledAt || !effectiveProfessionalId || !selectedPatientId) {
      setError("Data, horário, profissional e paciente são obrigatórios.");
      return;
    }

    const priceValue = price ? parseFloat(price) : 0;
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Valor inválido.");
      return;
    }

    setIsSubmitting(true);
    try {
      await atendimentoService.create(clinicId, {
        procedure: procedure.trim(),
        description: description.trim() || undefined,
        scheduledAt: effectiveScheduledAt,
        price: priceValue,
        professionalId: effectiveProfessionalId,
        tooth: tooth.trim() || undefined,
        patientId: selectedPatientId,
        durationMinutes,
      });
      onSuccess();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400) setError("Dados inválidos.");
      else if (status === 403) setError("Sem permissão para esta operação.");
      else if (status === 404) setError("Paciente ou profissional não encontrado.");
      else if (status === 409) setError("Horário já está ocupado. Escolha outro horário.");
      else setError("Erro ao criar agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProfessionalName = activeProfessionals.find(p => p.id === professionalId)?.userName;

  const effectiveProfessionalName = preSelectedSchedule
    ? activeProfessionals.find(p => p.id === preSelectedSchedule.professionalId)?.userName
    : selectedProfessionalName;

  const visibleSteps: ModalStep[] = hasPreSelected
    ? ["patient", "details"]
    : ["patient", "schedule", "details"];

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
                Novo Agendamento
              </h3>
              <p className="text-sm text-slate-500">
                {selectedPatientName || "Selecione um paciente"}
              </p>
            </div>
          </div>
          
          {/* Steps indicator */}
          <div className="flex items-center gap-2">
            {visibleSteps.map((s, i) => {
              const stepIndex = visibleSteps.indexOf(step as typeof visibleSteps[number]);
              const isCompleted = i < stepIndex;
              const isCurrent = s === step;
              
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? "bg-emerald-500 text-white" :
                    isCurrent ? "bg-primary text-white" :
                    "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-lg">check</span>
                    ) : i + 1}
                  </div>
                  {i < visibleSteps.length - 1 && <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-700" />}
                </div>
              );
            })}
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

          {step === "patient" && (
            /* Step 1: Patient Selection */
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Buscar Paciente
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Digite o nome ou CPF do paciente..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Patient List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {isLoadingPatients ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {patientSearch ? "Nenhum paciente encontrado" : "Digite para buscar pacientes"}
                  </div>
                ) : (
                  patients.map((patient: Patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect({ id: patient.id, name: patient.name })}
                      className="w-full flex items-center gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {patient.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {patient.cpf || patient.email || "Sem informações adicionais"}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400">
                        chevron_right
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {step === "schedule" && (
            /* Step 2: Calendar and Time Selection */
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
                        })} às {selectedTime} • {effectiveProfessionalName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "details" && (
            /* Step 3: Appointment Details */
            <form id="appointment-form" onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Summary */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {selectedPatientName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedPatientName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date((preSelectedSchedule?.date || selectedDate) + "T00:00:00").toLocaleDateString("pt-BR", { 
                      weekday: "short", 
                      day: "numeric", 
                      month: "short" 
                    })} às {preSelectedSchedule?.time || selectedTime} • {effectiveProfessionalName}
                  </p>
                </div>
              </div>

              {/* Duração da consulta */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Duração da Consulta
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 30, label: "30 min" },
                    { value: 45, label: "45 min" },
                    { value: 60, label: "1 hora" },
                    { value: 90, label: "1h 30min" },
                    { value: 120, label: "2 horas" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDurationMinutes(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                        durationMinutes === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Procedimento e Dente */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="new-procedure">
                    Procedimento *
                  </label>
                  <input
                    id="new-procedure"
                    required
                    value={procedure}
                    onChange={(e) => setProcedure(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    placeholder="Ex: Profilaxia, Restauração..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="new-tooth">
                    Dente
                  </label>
                  <input
                    id="new-tooth"
                    value={tooth}
                    onChange={(e) => setTooth(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    placeholder="Ex: 18, 36..."
                  />
                </div>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="new-price">
                  Valor (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-slate-400 text-xl">payments</span>
                  </div>
                  <input
                    id="new-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="new-desc">
                  Observações
                </label>
                <textarea
                  id="new-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none"
                  placeholder="Observações sobre o atendimento..."
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex gap-3">
            {step === "patient" ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
            ) : step === "schedule" ? (
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
                  type="button"
                  onClick={handleContinueToDetails}
                  disabled={!isSelectionValid}
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

export default NewAppointmentModal;
