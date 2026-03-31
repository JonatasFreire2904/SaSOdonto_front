import { useState } from "react";
import { useDashboardAppointments } from "@/hooks/queries/useDashboardAppointments";
import SummaryCards from "./components/SummaryCards";
import AppointmentList from "./components/AppointmentList";
import Calendar from "@/components/ui/Calendar";
import NewAppointmentModal from "./components/NewAppointmentModal";
import { useNavigate } from "react-router-dom";

/**
 * Página de dashboard de agendamentos
 * Usa o endpoint /api/dashboard/agendamentos que obtém clinicId do JWT
 */
const AgendamentosPage = () => {
  const navigate = useNavigate();
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  
  const {
    summary,
    groupedAppointments,
    isLoading,
    isError,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    confirm,
    cancel,
    complete,
    isConfirming,
    isCancelling,
    isCompleting,
    refetch,
  } = useDashboardAppointments();

  const handleViewPatient = (patientId: string) => {
    navigate(`/dashboard/pacientes/${patientId}`);
  };

  // Quando seleciona uma data no calendário, atualiza o filtro
  const handleDateSelect = (date: string) => {
    setSelectedCalendarDate(date);
    // Muda para modo custom com a data selecionada
    setCustomDateRange({ start: date, end: date });
    setPeriod("custom");
  };

  // Callback quando cria um novo agendamento
  const handleAppointmentCreated = () => {
    setShowNewAppointmentModal(false);
    refetch();
  };

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
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Agendamentos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie as consultas da clínica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar"
          >
            <span className={`material-symbols-outlined ${isLoading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>
          <button
            onClick={() => setShowNewAppointmentModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        summary={summary}
        isLoading={isLoading}
        activeFilter={statusFilter}
        onFilterClick={setStatusFilter}
      />

      {/* Main Content: Calendar + Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <Calendar
            selectedDate={selectedCalendarDate}
            onDateSelect={handleDateSelect}
          />
          
          {/* Quick Filters */}
          <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Filtro Rápido
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setPeriod("today");
                  setSelectedCalendarDate(new Date().toISOString().split("T")[0]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === "today"
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => setPeriod("week")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  period === "week"
                    ? "bg-primary text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                Esta Semana
              </button>
            </div>
            
            {/* Search */}
            <div className="mt-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <AppointmentList
            groupedAppointments={groupedAppointments}
            isLoading={isLoading}
            onConfirm={confirm}
            onCancel={cancel}
            onComplete={complete}
            onViewPatient={handleViewPatient}
            isConfirming={isConfirming}
            isCancelling={isCancelling}
            isCompleting={isCompleting}
          />
        </div>
      </div>

      {/* New Appointment Modal */}
      <NewAppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSuccess={handleAppointmentCreated}
        initialDate={selectedCalendarDate}
      />
    </div>
  );
};

export default AgendamentosPage;
