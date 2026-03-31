import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardAppointments } from "@/hooks/queries/useDashboardAppointments";
import { useProfessionals } from "@/hooks/queries/useProfessionals";
import { getClinicId } from "@/utils/clinic";
import Calendar from "@/components/ui/Calendar";
import NewAppointmentModal from "./components/NewAppointmentModal";
import DailyTimeline, { WORKING_SLOTS_COUNT } from "./components/DailyTimeline";
import DailySummary from "./components/DailySummary";
import ProfessionalSelector from "./components/ProfessionalSelector";
import BottomActionBar from "./components/BottomActionBar";

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const formatDisplayDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  const day = date.getDate();
  const month = capitalize(date.toLocaleDateString("pt-BR", { month: "long" }));
  const year = date.getFullYear();
  return `${day} de ${month}, ${year}`;
};

const getDayOfWeek = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return capitalize(date.toLocaleDateString("pt-BR", { weekday: "long" }));
};

/**
 * Página de Agenda Diária
 * Planejamento clínico estruturado com timeline visual
 */
const AgendamentosPage = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // ─── Estado local ───
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalPreSelected, setModalPreSelected] = useState<{
    date: string;
    time: string;
    professionalId: string;
  } | null>(null);

  // ─── Dados ───
  const clinicId = useMemo(getClinicId, []);
  const { data: professionals = [], isLoading: isLoadingProfessionals } = useProfessionals(clinicId);

  const activeProfessionals = useMemo(
    () => professionals.filter((p) => p.clinicId === clinicId),
    [professionals, clinicId]
  );

  const {
    appointments,
    isLoading,
    isError,
    setPeriod,
    setCustomDateRange,
    setProfessionalFilter,
    confirm,
    cancel,
    complete,
    isConfirming,
    isCancelling,
    isCompleting,
    refetch,
  } = useDashboardAppointments();

  // ─── Sincronizar filtros do hook com estado local ───
  useEffect(() => {
    setCustomDateRange({ start: selectedDate, end: selectedDate });
    setPeriod("custom");
  }, [selectedDate, setCustomDateRange, setPeriod]);

  useEffect(() => {
    setProfessionalFilter(selectedProfessionalId || null);
  }, [selectedProfessionalId, setProfessionalFilter]);

  // ─── Cálculos derivados ───
  const isAllProfessionals = !selectedProfessionalId;
  const dayOfWeek = useMemo(() => getDayOfWeek(selectedDate), [selectedDate]);
  const formattedDate = useMemo(() => formatDisplayDate(selectedDate), [selectedDate]);

  const activeAppointments = useMemo(
    () => appointments.filter((a) => a.status !== "Cancelled"),
    [appointments]
  );

  const scheduledCount = activeAppointments.length;
  const availableCount = isAllProfessionals
    ? Math.max(0, WORKING_SLOTS_COUNT * activeProfessionals.length - scheduledCount)
    : Math.max(0, WORKING_SLOTS_COUNT - scheduledCount);

  // ─── Handlers ───
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  }, []);

  const handleProfessionalChange = useCallback((id: string) => {
    setSelectedProfessionalId(id);
    setSelectedTimeSlot(null);
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTimeSlot((prev) => (prev === time ? null : time));
  }, []);

  const handleAdvanceToDetails = useCallback(() => {
    if (!selectedTimeSlot) return;
    if (selectedProfessionalId) {
      // Profissional específico selecionado → pula step de schedule
      setModalPreSelected({
        date: selectedDate,
        time: selectedTimeSlot,
        professionalId: selectedProfessionalId,
      });
    } else {
      // "Todos" → abre modal sem preSelectedSchedule para selecionar profissional no modal
      setModalPreSelected(null);
    }
    setShowModal(true);
  }, [selectedDate, selectedTimeSlot, selectedProfessionalId]);

  const handleNewAppointment = useCallback(() => {
    setModalPreSelected(null);
    setShowModal(true);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setShowModal(false);
    setModalPreSelected(null);
    setSelectedTimeSlot(null);
    refetch();
  }, [refetch]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setModalPreSelected(null);
  }, []);

  const handleViewPatient = useCallback(
    (patientId: string) => navigate(`/dashboard/pacientes/${patientId}`),
    [navigate]
  );

  const handleClearSelection = useCallback(() => setSelectedTimeSlot(null), []);

  // ─── Erro ───
  if (isError) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Erro ao carregar dados
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Não foi possível carregar os agendamentos. Tente novamente.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 lg:p-8 max-w-7xl mx-auto space-y-6 ${selectedTimeSlot ? "pb-28" : ""}`}>
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Agenda Diária
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Planejamento clínico estruturado para hoje.
            </p>
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

          <ProfessionalSelector
            professionals={activeProfessionals}
            selectedId={selectedProfessionalId}
            onChange={handleProfessionalChange}
            isLoading={isLoadingProfessionals}
          />

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="material-symbols-outlined text-lg text-slate-400">calendar_today</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <span className={`material-symbols-outlined ${isLoading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>
          <button
            type="button"
            onClick={handleNewAppointment}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: Calendar + Summary */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
          <DailySummary
            scheduledCount={scheduledCount}
            availableCount={availableCount}
            isLoading={isLoading}
          />
        </div>

        {/* Timeline */}
        <div className="lg:col-span-8 xl:col-span-9">
          <DailyTimeline
            appointments={activeAppointments}
            selectedTime={selectedTimeSlot}
            onTimeSelect={handleTimeSelect}
            onConfirm={confirm}
            onCancel={cancel}
            onComplete={complete}
            onViewPatient={handleViewPatient}
            isLoading={isLoading}
            isActionPending={isConfirming || isCancelling || isCompleting}
            dayOfWeek={dayOfWeek}
            selectedDate={selectedDate}
            showProfessionalName={isAllProfessionals}
            professionalCount={isAllProfessionals ? activeProfessionals.length : 1}
          />
        </div>
      </div>

      {/* ─── Bottom Action Bar ─── */}
      <BottomActionBar
        selectedDate={selectedDate}
        selectedTime={selectedTimeSlot}
        onAdvance={handleAdvanceToDetails}
        onClear={handleClearSelection}
      />

      {/* ─── Modal ─── */}
      <NewAppointmentModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialDate={selectedDate}
        preSelectedSchedule={modalPreSelected}
      />
    </div>
  );
};

export default AgendamentosPage;
