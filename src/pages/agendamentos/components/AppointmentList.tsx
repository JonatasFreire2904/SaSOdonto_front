import { useMemo } from "react";
import type { DashboardAppointment, AtendimentoStatus } from "@/api/atendimentoService";

interface AppointmentListProps {
  groupedAppointments: {
    morning: DashboardAppointment[];
    afternoon: DashboardAppointment[];
  };
  isLoading: boolean;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onViewPatient: (patientId: string) => void;
  isConfirming: boolean;
  isCancelling: boolean;
  isCompleting: boolean;
}

const statusConfig: Record<AtendimentoStatus, { label: string; color: string; bgColor: string }> = {
  Scheduled: { label: "Agendado", color: "text-blue-700", bgColor: "bg-blue-100" },
  InProgress: { label: "Em Andamento", color: "text-amber-700", bgColor: "bg-amber-100" },
  Completed: { label: "Concluído", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  Cancelled: { label: "Cancelado", color: "text-rose-700", bgColor: "bg-rose-100" },
};

const formatTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isOverdue = (scheduledAt: string, status: AtendimentoStatus) => {
  if (status === "Completed" || status === "Cancelled") return false;
  return new Date(scheduledAt) < new Date();
};

const isUpcoming = (scheduledAt: string, status: AtendimentoStatus) => {
  if (status === "Completed" || status === "Cancelled") return false;
  const diff = new Date(scheduledAt).getTime() - Date.now();
  const minutes = diff / (1000 * 60);
  return minutes > 0 && minutes <= 30;
};

interface AppointmentRowProps {
  appointment: DashboardAppointment;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onViewPatient: (patientId: string) => void;
  isActionPending: boolean;
}

const AppointmentRow = ({
  appointment,
  onConfirm,
  onCancel,
  onComplete,
  onViewPatient,
  isActionPending,
}: AppointmentRowProps) => {
  const status = statusConfig[appointment.status] || statusConfig.Scheduled;
  const overdue = isOverdue(appointment.scheduledAt, appointment.status);
  const upcoming = isUpcoming(appointment.scheduledAt, appointment.status);

  const rowClass = useMemo(() => {
    if (overdue) return "border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/20";
    if (upcoming) return "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20";
    return "";
  }, [overdue, upcoming]);

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${rowClass}`}
    >
      {/* Time */}
      <div className="w-16 shrink-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {formatTime(appointment.scheduledAt)}
        </p>
        {overdue && (
          <span className="text-[10px] font-semibold text-rose-600 uppercase">Atrasado</span>
        )}
        {upcoming && (
          <span className="text-[10px] font-semibold text-amber-600 uppercase">Próximo</span>
        )}
      </div>

      {/* Patient & Procedure */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {appointment.patientName}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {appointment.procedure}
          {appointment.tooth && ` • Dente ${appointment.tooth}`}
        </p>
      </div>

      {/* Professional */}
      <div className="hidden md:block w-32 shrink-0">
        <p className="text-xs text-slate-500 truncate">
          {appointment.professionalName || "—"}
        </p>
      </div>

      {/* Status */}
      <div className="w-28 shrink-0">
        <span
          className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${status.bgColor} ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {appointment.status === "Scheduled" && (
          <>
            <button
              onClick={() => onConfirm(appointment.id)}
              disabled={isActionPending}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
              title="Confirmar"
            >
              <span className="material-symbols-outlined text-lg">check</span>
            </button>
            <button
              onClick={() => onComplete(appointment.id)}
              disabled={isActionPending}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
              title="Concluir"
            >
              <span className="material-symbols-outlined text-lg">task_alt</span>
            </button>
            <button
              onClick={() => onCancel(appointment.id)}
              disabled={isActionPending}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
              title="Cancelar"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </>
        )}
        {appointment.status === "InProgress" && (
          <button
            onClick={() => onComplete(appointment.id)}
            disabled={isActionPending}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
            title="Concluir"
          >
            <span className="material-symbols-outlined text-lg">task_alt</span>
          </button>
        )}
        <button
          onClick={() => onViewPatient(appointment.patientId)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Ver paciente"
        >
          <span className="material-symbols-outlined text-lg">person</span>
        </button>
      </div>
    </div>
  );
};

interface PeriodSectionProps {
  title: string;
  icon: string;
  appointments: DashboardAppointment[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onViewPatient: (patientId: string) => void;
  isActionPending: boolean;
}

const PeriodSection = ({
  title,
  icon,
  appointments,
  onConfirm,
  onCancel,
  onComplete,
  onViewPatient,
  isActionPending,
}: PeriodSectionProps) => {
  if (appointments.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-t-lg">
        <span className="material-symbols-outlined text-slate-500 text-lg">{icon}</span>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          {title}
        </h4>
        <span className="ml-auto text-xs font-medium text-slate-500">
          {appointments.length} consulta{appointments.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
        {appointments.map((apt) => (
          <AppointmentRow
            key={apt.id}
            appointment={apt}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onComplete={onComplete}
            onViewPatient={onViewPatient}
            isActionPending={isActionPending}
          />
        ))}
      </div>
    </div>
  );
};

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="space-y-6">
    {[1, 2].map((section) => (
      <div key={section}>
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-t-lg animate-pulse" />
        <div className="bg-white dark:bg-slate-900 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-700">
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
              <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Empty state
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
      <span className="material-symbols-outlined text-4xl text-slate-400">event_available</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
      Nenhum agendamento encontrado
    </h3>
    <p className="text-sm text-slate-500 max-w-sm">
      Não há consultas para o período selecionado. Tente ajustar os filtros ou agendar uma nova consulta.
    </p>
  </div>
);

const AppointmentList = ({
  groupedAppointments,
  isLoading,
  onConfirm,
  onCancel,
  onComplete,
  onViewPatient,
  isConfirming,
  isCancelling,
  isCompleting,
}: AppointmentListProps) => {
  const isActionPending = isConfirming || isCancelling || isCompleting;
  const hasAppointments = groupedAppointments.morning.length > 0 || groupedAppointments.afternoon.length > 0;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasAppointments) {
    return <EmptyState />;
  }

  return (
    <div>
      <PeriodSection
        title="Manhã"
        icon="wb_sunny"
        appointments={groupedAppointments.morning}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onComplete={onComplete}
        onViewPatient={onViewPatient}
        isActionPending={isActionPending}
      />
      <PeriodSection
        title="Tarde"
        icon="wb_twilight"
        appointments={groupedAppointments.afternoon}
        onConfirm={onConfirm}
        onCancel={onCancel}
        onComplete={onComplete}
        onViewPatient={onViewPatient}
        isActionPending={isActionPending}
      />
    </div>
  );
};

export default AppointmentList;
