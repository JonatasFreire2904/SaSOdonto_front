import type { DashboardAppointment } from "../types";
import { formatTime, getAppointmentTimingType, getStatusLabel } from "../utils";

interface DailyAppointmentsProps {
  appointments: DashboardAppointment[];
  now: Date;
}

const statusClassMap = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const timingStyles = {
  overdue: "border-l-4 border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/20",
  upcoming: "border-l-4 border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/20",
  regular: "",
};

const timingLabel = {
  overdue: "Atrasado",
  upcoming: "Próximo",
  regular: "",
};

const DailyAppointments = ({ appointments, now }: DailyAppointmentsProps) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border-2 border-primary/20 dark:border-primary/30 shadow-md shadow-primary/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-primary/[0.08] dark:bg-primary/15 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">schedule</span>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-50">
            Agendamentos do Dia
          </h3>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-primary border border-primary/20 dark:bg-slate-900 dark:text-slate-100">
          Principal
        </span>
      </div>

      {appointments.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">Sem atendimentos para o período.</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {appointments.map((appointment) => {
            const timingType = getAppointmentTimingType(appointment, now);
            const timingText = timingLabel[timingType];

            return (
              <article
                key={appointment.id}
                className={`px-5 py-4 flex items-center justify-between gap-3 ${timingStyles[timingType]}`}
              >
                <div className="flex items-start gap-4">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[52px]">
                    {formatTime(appointment.dateTime)}
                  </p>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {appointment.patientName}
                    </p>
                    <p className="text-xs text-slate-500">{appointment.procedure}</p>
                    {timingText ? (
                      <p className="text-[11px] font-semibold text-slate-500 mt-1">{timingText}</p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusClassMap[appointment.status]}`}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DailyAppointments;
