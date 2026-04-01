import { useMemo } from "react";
import type { DashboardAppointment, AtendimentoStatus } from "@/api/atendimentoService";

interface DailyTimelineProps {
  appointments: DashboardAppointment[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onViewPatient: (patientId: string) => void;
  isLoading: boolean;
  isActionPending: boolean;
  dayOfWeek: string;
  selectedDate: string;
  showProfessionalName?: boolean;
  /** Quantidade de profissionais ativos — quando > 0, permite slots híbridos (agendamento + disponível) */
  professionalCount?: number;
}

interface TimelineEntry {
  hour: number;
  timeLabel: string;
  type: "appointment" | "available" | "lunch" | "hybrid";
  appointments: DashboardAppointment[];
}

export const START_HOUR = 8;
export const END_HOUR = 20;
export const LUNCH_HOUR = 12;
export const WORKING_END_HOUR = 18;

/** Slots de trabalho disponíveis: (08-12) + (13-18) = 9 */
export const WORKING_SLOTS_COUNT = (LUNCH_HOUR - START_HOUR) + (WORKING_END_HOUR - LUNCH_HOUR - 1);

const statusConfig: Record<AtendimentoStatus, { label: string; dotColor: string; bgColor: string; borderColor: string; textColor: string }> = {
  Scheduled: {
    label: "Agendado",
    dotColor: "bg-blue-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-700 dark:text-emerald-300",
  },
  InProgress: {
    label: "Em Andamento",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-700 dark:text-amber-300",
  },
  Completed: {
    label: "Concluído",
    dotColor: "bg-emerald-500",
    bgColor: "bg-slate-50 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    textColor: "text-slate-500",
  },
  Cancelled: {
    label: "Cancelado",
    dotColor: "bg-rose-500",
    bgColor: "bg-rose-50/50 dark:bg-rose-950/20",
    borderColor: "border-rose-200 dark:border-rose-800",
    textColor: "text-rose-400",
  },
};

const formatTime = (date: Date): string => {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const formatEndTimeFromAppointment = (scheduledAt: string, durationMinutes: number): string => {
  const end = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60_000);
  return formatTime(end);
};

const formatDurationLabel = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
};

/** Extrai a hora local de um scheduledAt ISO string */
const parseLocalHour = (scheduledAt: string): number =>
  new Date(scheduledAt).getHours();

/**
 * Timeline diária de agendamentos
 * Exibe horários de 08:00 a 20:00 com agendamentos, horários livres e intervalo de almoço
 */
const DailyTimeline = ({
  appointments,
  selectedTime,
  onTimeSelect,
  onConfirm,
  onCancel,
  onComplete,
  onViewPatient,
  isLoading,
  isActionPending,
  dayOfWeek,
  selectedDate,
  showProfessionalName = false,
  professionalCount = 1,
}: DailyTimelineProps) => {
  const entries = useMemo((): TimelineEntry[] => {
    // Map appointments by hour
    const appointmentsByHour = new Map<number, DashboardAppointment[]>();
    appointments
      .filter((apt) => apt.status !== "Cancelled")
      .forEach((apt) => {
        const hour = parseLocalHour(apt.scheduledAt);
        const existing = appointmentsByHour.get(hour) || [];
        existing.push(apt);
        appointmentsByHour.set(hour, existing);
      });

    const result: TimelineEntry[] = [];

    for (let h = START_HOUR; h <= END_HOUR; h++) {
      const timeLabel = `${h.toString().padStart(2, "0")}:00`;

      if (h === LUNCH_HOUR) {
        result.push({ hour: h, timeLabel, type: "lunch", appointments: [] });
        continue;
      }

      const hourAppointments = appointmentsByHour.get(h) || [];

      if (hourAppointments.length > 0) {
        // Se há menos agendamentos do que profissionais, o slot é híbrido (mostra agendamentos + disponível)
        const isHybrid = professionalCount > 1 && hourAppointments.length < professionalCount;
        result.push({
          hour: h,
          timeLabel,
          type: isHybrid ? "hybrid" : "appointment",
          appointments: hourAppointments,
        });
      } else {
        result.push({ hour: h, timeLabel, type: "available", appointments: [] });
      }
    }

    return result;
  }, [appointments, professionalCount]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="h-6 w-48 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-14 h-5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse shrink-0" />
              <div className="flex-1 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Agenda de {dayOfWeek}
        </h3>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500">Consulta</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-slate-500">Procedimento</span>
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-y-auto max-h-[calc(100vh-340px)] px-2">
        {entries.map((entry) => (
          <div key={entry.hour} className="flex">
            {/* Time label */}
            <div className="w-16 shrink-0 py-3 pr-3 text-right">
              <span
                className={`text-sm font-semibold ${
                  entry.type === "lunch"
                    ? "text-amber-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {entry.timeLabel}
              </span>
              {entry.type === "lunch" && (
                <span className="block text-[10px] font-bold text-amber-500 uppercase">
                  Almoço
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 border-t border-slate-100 dark:border-slate-700/50 py-3 pr-4 min-h-[72px]">
              {entry.type === "lunch" && <LunchIndicator />}

              {entry.type === "appointment" &&
                entry.appointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    hour={entry.hour}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    onComplete={onComplete}
                    onViewPatient={onViewPatient}
                    isActionPending={isActionPending}
                    showProfessionalName={showProfessionalName}
                  />
                ))}

              {entry.type === "hybrid" && (
                <div className="space-y-2">
                  {entry.appointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      hour={entry.hour}
                      onConfirm={onConfirm}
                      onCancel={onCancel}
                      onComplete={onComplete}
                      onViewPatient={onViewPatient}
                      isActionPending={isActionPending}
                      showProfessionalName={showProfessionalName}
                    />
                  ))}
                  <AvailableSlot
                    timeLabel={entry.timeLabel}
                    isSelected={selectedTime === entry.timeLabel}
                    hour={entry.hour}
                    onSelect={onTimeSelect}
                    remainingSlots={professionalCount - entry.appointments.length}
                  />
                </div>
              )}

              {entry.type === "available" && (
                <AvailableSlot
                  timeLabel={entry.timeLabel}
                  isSelected={selectedTime === entry.timeLabel}
                  hour={entry.hour}
                  onSelect={onTimeSelect}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────── */

const LunchIndicator = () => (
  <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 border-dashed rounded-xl">
    <span className="material-symbols-outlined text-amber-500 text-lg">restaurant</span>
    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
      Intervalo de Almoço
    </span>
  </div>
);

interface AppointmentCardProps {
  appointment: DashboardAppointment;
  hour: number;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onViewPatient: (patientId: string) => void;
  isActionPending: boolean;
  showProfessionalName?: boolean;
}

const AppointmentCard = ({
  appointment,
  hour,
  onConfirm,
  onCancel,
  onComplete,
  onViewPatient,
  isActionPending,
  showProfessionalName = false,
}: AppointmentCardProps) => {
  const config = statusConfig[appointment.status] || statusConfig.Scheduled;
  const isFirstAppointment = appointment.procedure.startsWith("Primeira Consulta - ");
  const procedureLabel = isFirstAppointment
    ? appointment.procedure.replace("Primeira Consulta - ", "")
    : appointment.procedure;
  const endTime = formatEndTimeFromAppointment(appointment.scheduledAt, appointment.durationMinutes);
  const timeStr = `${hour.toString().padStart(2, "0")}:00`;
  const durationLabel = formatDurationLabel(appointment.durationMinutes);

  return (
    <div
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border ${config.bgColor} ${config.borderColor} transition-all hover:shadow-sm`}
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {appointment.patientName}
          </h4>
          <span className={`w-2 h-2 rounded-full shrink-0 ${config.dotColor}`} />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isFirstAppointment && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200">
              Primeira vez
            </span>
          )}
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${config.textColor} bg-white/60 dark:bg-black/10`}
          >
            {procedureLabel}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {timeStr} - {endTime} ({durationLabel})
          {appointment.tooth && ` • Dente ${appointment.tooth}`}
          {showProfessionalName && appointment.professionalName && (
            <> • <span className="font-semibold text-primary">{appointment.professionalName}</span></>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        {appointment.status === "Scheduled" && (
          <>
            <button
              type="button"
              onClick={() => onConfirm(appointment.id)}
              disabled={isActionPending}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
              title="Confirmar"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
            </button>
            <button
              type="button"
              onClick={() => onComplete(appointment.id)}
              disabled={isActionPending}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
              title="Concluir"
            >
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </button>
            <button
              type="button"
              onClick={() => onCancel(appointment.id)}
              disabled={isActionPending}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
              title="Cancelar"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </>
        )}
        {appointment.status === "InProgress" && (
          <button
            type="button"
            onClick={() => onComplete(appointment.id)}
            disabled={isActionPending}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
            title="Concluir"
          >
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onViewPatient(appointment.patientId)}
          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Ver paciente"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
        </button>
      </div>
    </div>
  );
};

interface AvailableSlotProps {
  timeLabel: string;
  isSelected: boolean;
  hour: number;
  onSelect: (time: string) => void;
  remainingSlots?: number;
}

const AvailableSlot = ({ timeLabel, isSelected, hour, onSelect, remainingSlots }: AvailableSlotProps) => {
  if (isSelected) {
    return (
      <button
        type="button"
        onClick={() => onSelect(timeLabel)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl shadow-md transition-all"
      >
        <span className="material-symbols-outlined text-lg">check_circle</span>
        <span className="font-bold text-sm">Selecionado</span>
        <span className="text-xs opacity-80 ml-1">
          {timeLabel} - {`${(hour + 1).toString().padStart(2, "0")}:00`}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(timeLabel)}
      className="w-full flex items-center justify-center py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-400 dark:text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer group"
    >
      <span className="material-symbols-outlined text-lg mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        add_circle_outline
      </span>
      {remainingSlots != null
        ? `${remainingSlots} vaga${remainingSlots > 1 ? "s" : ""} disponível${remainingSlots > 1 ? "is" : ""}`
        : "Horário Livre"}
    </button>
  );
};

export default DailyTimeline;
