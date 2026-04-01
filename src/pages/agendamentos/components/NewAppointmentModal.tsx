import { FormEvent, useState, useEffect, useMemo } from "react";
import { atendimentoService, ALLOWED_DURATIONS } from "@/api/atendimentoService";
import { patientService } from "@/api/patientService";
import { useProfessionals } from "@/hooks/queries/useProfessionals";
import { useAppointmentAvailability } from "@/hooks/queries/useAppointmentAvailability";
import { usePatients, useDebounce } from "@/hooks/queries/usePatients";
import type { Patient } from "@/api/patientService";
import { getClinicId } from "@/utils/clinic";
import Calendar from "@/components/ui/Calendar";
import TimeSlotSelector from "@/components/ui/TimeSlotSelector";
import TimeRangeSelector from "@/components/ui/TimeRangeSelector";

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
  const hasPatientSearchInput = patientSearch.trim().length > 0;
  const hasDebouncedPatientSearch = debouncedSearch.trim().length > 0;
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  const [isFirstAppointment, setIsFirstAppointment] = useState(false);
  const [firstAppointmentName, setFirstAppointmentName] = useState("");
  const [firstAppointmentBirthDate, setFirstAppointmentBirthDate] = useState("");
  
  // Appointment details
  const [procedure, setProcedure] = useState("");
  const [tooth, setTooth] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Time range for first appointments
  const [rangeStartTime, setRangeStartTime] = useState<string | null>(null);
  const [rangeEndTime, setRangeEndTime] = useState<string | null>(null);

  // Get clinicId from shared util
  const clinicId = useMemo(getClinicId, []);

  // usePatients(clinicId, search, page, pageSize, status, enabled)
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(
    clinicId,
    debouncedSearch,
    1,
    10,
    "Active",
    isOpen && step === "patient" && hasDebouncedPatientSearch
  );
  const patients = hasDebouncedPatientSearch ? (patientsData?.data || []) : [];

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
    canFitDuration,
    isSelectionValidForDuration,
  } = useAppointmentAvailability({
    clinicId,
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
      setIsFirstAppointment(false);
      setFirstAppointmentName("");
      setFirstAppointmentBirthDate("");
      setProcedure("");
      setTooth("");
      setPrice("");
      setDescription("");
      setDurationMinutes(60);
      setRangeStartTime(null);
      setRangeEndTime(null);
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
    setIsFirstAppointment(false);
    setSelectedPatientId(patient.id);
    setSelectedPatientName(patient.name);
    setStep(hasPreSelected ? "details" : "schedule");
  };

  const handleFirstAppointmentContinue = () => {
    const name = firstAppointmentName.trim();

    if (!name) {
      setError("Informe o nome para primeiro atendimento.");
      return;
    }

    if (!firstAppointmentBirthDate) {
      setError("Para abrir ficha, informe data de nascimento.");
      return;
    }

    setError(null);
    setSelectedPatientId(null);
    setSelectedPatientName(name);

    if (hasPreSelected) {
      void submitAppointment();
      return;
    }

    setStep("schedule");
  };

  const handleContinueToDetails = () => {
    if (isFirstAppointment) {
      if (!rangeStartTime || !rangeEndTime || !professionalId || !selectedDate) {
        setError("Selecione data, horário inicial, horário final e profissional.");
        return;
      }
    } else {
      if (!isSelectionValidForDuration(durationMinutes)) {
        setError("Selecione uma data, horário e profissional.");
        return;
      }

      if (selectedTime && !canFitDuration(selectedTime, durationMinutes)) {
        setError("Este horário não comporta a duração escolhida. Selecione outro horário.");
        return;
      }
    }
    setError(null);
    setStep("details");
  };

  const handleSubmitFirstAppointmentFromSchedule = () => {
    if (!rangeStartTime || !rangeEndTime || !professionalId || !selectedDate) {
      setError("Selecione data, horário inicial, horário final e profissional.");
      return;
    }

    void submitAppointment();
  };

  const handleBack = () => {
    if (step === "schedule") {
      setStep("patient");
    } else if (step === "details") {
      setStep(hasPreSelected ? "patient" : "schedule");
    }
    setError(null);
  };

  const submitAppointment = async () => {
    setError(null);

    const slotTimeToValidate = preSelectedSchedule?.time || (isFirstAppointment ? rangeStartTime : selectedTime);
    const finalDuration = isFirstAppointment && rangeStartTime && rangeEndTime
      ? calculateDurationFromRange(rangeStartTime, rangeEndTime)
      : durationMinutes;

    if (isSlotsLoading) {
      setError("Aguarde carregar a disponibilidade para confirmar.");
      return;
    }

    if (slotTimeToValidate && !isFirstAppointment && !canFitDuration(slotTimeToValidate, durationMinutes)) {
      setError("Este horário não comporta a duração escolhida. Selecione outro horário.");
      return;
    }

    if (!isFirstAppointment && !procedure.trim()) {
      setError("Procedimento é obrigatório.");
      return;
    }

    const effectiveScheduledAt = preSelectedSchedule
      ? new Date(`${preSelectedSchedule.date}T${preSelectedSchedule.time}`).toISOString()
      : isFirstAppointment && rangeStartTime
        ? new Date(`${selectedDate}T${rangeStartTime}`).toISOString()
        : scheduledAt;
    const effectiveProfessionalId = preSelectedSchedule?.professionalId || professionalId;
    let effectivePatientId = selectedPatientId;

    if (isFirstAppointment && !effectivePatientId) {
      try {
        const createdPatient = await patientService.create(clinicId, {
          fullName: firstAppointmentName.trim(),
          birthDate: firstAppointmentBirthDate,
          gender: "other",
          notes: "Paciente criado via fluxo de primeiro atendimento.",
        });
        effectivePatientId = createdPatient.id;
      } catch {
        setError("Nao foi possivel abrir a ficha para primeiro atendimento.");
        return;
      }
    }

    if (!effectiveScheduledAt || !effectiveProfessionalId || !effectivePatientId) {
      setError("Data, horário, profissional e paciente são obrigatórios.");
      return;
    }

    const priceValue = price ? parseFloat(price) : 0;
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Valor inválido.");
      return;
    }

    if (!ALLOWED_DURATIONS.includes(finalDuration)) {
      setError("Duração inválida. Valores permitidos: 15, 30, 45, 60, 90, 120 minutos.");
      return;
    }

    setIsSubmitting(true);
    try {
      const procedureWithMarker = isFirstAppointment
        ? "Primeira Consulta"
        : procedure.trim();

      await atendimentoService.create(clinicId, {
        procedure: procedureWithMarker,
        description: description.trim() || undefined,
        scheduledAt: effectiveScheduledAt,
        price: priceValue,
        professionalId: effectiveProfessionalId,
        tooth: tooth.trim() || undefined,
        patientId: effectivePatientId,
        durationMinutes: finalDuration,
      });
      onSuccess();
    } catch (err: unknown) {
      const errorPayload = (err as { response?: { status?: number; data?: { code?: string; message?: string } } })?.response;
      const status = errorPayload?.status;
      const code = errorPayload?.data?.code;

      if (status === 409 || code === "APPOINTMENT_CONFLICT") {
        setError("Horário já está ocupado. Escolha outro horário.");
      } else if (code === "INVALID_DURATION") {
        setError("Duração inválida. Valores permitidos: 15, 30, 45, 60, 90, 120 minutos.");
      } else if (status === 403) {
        setError("Sem permissão para esta operação.");
      } else if (status === 404) {
        setError("Paciente ou profissional não encontrado.");
      } else {
        setError(errorPayload?.data?.message || "Erro ao criar agendamento.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitAppointment();
  };

  const selectedProfessionalName = activeProfessionals.find(p => p.id === professionalId)?.userName;

  const effectiveProfessionalName = preSelectedSchedule
    ? activeProfessionals.find(p => p.id === preSelectedSchedule.professionalId)?.userName
    : selectedProfessionalName;

  // Calcula duração a partir do range de tempo selecionado
  const calculateDurationFromRange = (start: string, end: string): number => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  // Quando usar range, calcula duração e usa o horário inicial como selectedTime
  const effectiveStartTime = isFirstAppointment && rangeStartTime ? rangeStartTime : selectedTime;
  const effectiveDuration = isFirstAppointment && rangeStartTime && rangeEndTime
    ? calculateDurationFromRange(rangeStartTime, rangeEndTime)
    : durationMinutes;

  const visibleSteps: ModalStep[] = hasPreSelected
    ? ["patient", "details"]
    : ["patient", "schedule", "details"];

  const durationValidationTime = preSelectedSchedule?.time || selectedTime;
  const hasDurationConflict = !!durationValidationTime && !canFitDuration(durationValidationTime, durationMinutes);

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
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-500">
                  {selectedPatientName || "Selecione um paciente"}
                </p>
                {isFirstAppointment && selectedPatientName && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
                    Primeiro atendimento
                  </span>
                )}
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-lg bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsFirstAppointment(false);
                    setDurationMinutes(60);
                    setError(null);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    !isFirstAppointment
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  Paciente cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFirstAppointment(true);
                    setDurationMinutes(15);
                    setError(null);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    isFirstAppointment
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  Primeiro atendimento
                </button>
              </div>

              {!isFirstAppointment ? (
                <>
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
                    {!hasPatientSearchInput ? (
                      <div className="text-center py-8 text-slate-500">
                        Digite para buscar pacientes
                      </div>
                    ) : isLoadingPatients || !hasDebouncedPatientSearch ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        Nenhum paciente encontrado
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
                </>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs font-semibold text-slate-600">
                    Agende para pessoa nova e abra a ficha de forma rapida.
                  </p>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="first-attendance-name">
                      Nome completo *
                    </label>
                    <input
                      id="first-attendance-name"
                      value={firstAppointmentName}
                      onChange={(e) => setFirstAppointmentName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Nome da pessoa"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="first-attendance-birthDate">
                      Data nascimento *
                    </label>
                    <input
                      id="first-attendance-birthDate"
                      type="date"
                      max={new Date().toISOString().split("T")[0]}
                      value={firstAppointmentBirthDate}
                      onChange={(e) => setFirstAppointmentBirthDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              )}
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
                    {isFirstAppointment ? "Selecione início e fim do atendimento" : "Selecione o horário"}
                  </label>
                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-y-auto max-h-[360px]">
                    {isFirstAppointment ? (
                      <TimeRangeSelector
                        slots={slots}
                        startTime={rangeStartTime}
                        endTime={rangeEndTime}
                        onStartTimeSelect={setRangeStartTime}
                        onEndTimeSelect={setRangeEndTime}
                        isLoading={isSlotsLoading}
                      />
                    ) : (
                      <TimeSlotSelector
                        slots={slots}
                        selectedTime={selectedTime}
                        onTimeSelect={setSelectedTime}
                        isLoading={isSlotsLoading}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Selection Summary */}
              {isFirstAppointment ? (
                rangeStartTime && rangeEndTime && professionalId && (
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
                          })} de {rangeStartTime} a {rangeEndTime} • {effectiveProfessionalName}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                selectedDate && selectedTime && professionalId && (
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
                )
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
                  {isFirstAppointment && (
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
                      Primeiro atendimento
                    </span>
                  )}
                  <p className="text-sm text-slate-500">
                    {new Date((preSelectedSchedule?.date || selectedDate) + "T00:00:00").toLocaleDateString("pt-BR", { 
                      weekday: "short", 
                      day: "numeric", 
                      month: "short" 
                    })} {isFirstAppointment && rangeStartTime && rangeEndTime ? `de ${rangeStartTime} a ${rangeEndTime}` : `às ${preSelectedSchedule?.time || selectedTime}`} • {effectiveProfessionalName}
                  </p>
                </div>
              </div>

              {/* Duração da consulta */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Duração da Consulta
                </label>
                {isFirstAppointment ? (
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {rangeStartTime && rangeEndTime
                        ? `${calculateDurationFromRange(rangeStartTime, rangeEndTime)} minutos`
                        : "Selecione início e fim para calcular"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 15, label: "15 min" },
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
                )}
                {hasDurationConflict && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">warning</span>
                    O horário selecionado não comporta a duração escolhida. Selecione outro horário ou reduza a duração.
                  </div>
                )}
              </div>

              {/* Procedimento e Dente */}
              {isFirstAppointment ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm font-semibold text-amber-700">
                    Procedimento inicial definido como Primeiro atendimento.
                  </p>
                  <p className="text-xs text-amber-700/80 mt-1">
                    Caso queira registrar um procedimento especifico, use o fluxo normal de agendamento.
                  </p>
                </div>
              ) : (
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
              )}

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
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                {isFirstAppointment && (
                  <button
                    type="button"
                    onClick={handleFirstAppointmentContinue}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        Continuar com primeiro atendimento
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </>
                    )}
                  </button>
                )}
              </>
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
                  onClick={isFirstAppointment ? handleSubmitFirstAppointmentFromSchedule : handleContinueToDetails}
                  disabled={
                    isSubmitting ||
                    !isSelectionValidForDuration(durationMinutes) ||
                    isSlotsLoading
                  }
                  className="flex-1 py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Agendando...
                    </>
                  ) : isFirstAppointment ? (
                    <>
                      Confirmar Primeiro Atendimento
                      <span className="material-symbols-outlined text-lg">check</span>
                    </>
                  ) : (
                    <>
                      Continuar
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </>
                  )}
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
