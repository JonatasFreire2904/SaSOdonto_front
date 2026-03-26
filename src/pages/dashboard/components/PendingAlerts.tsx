import type { PendingAlert } from "../types";

interface PendingAlertsProps {
  alerts: PendingAlert[];
}

const alertStyles = {
  unconfirmed: "border-l-amber-500",
  approval: "border-l-sky-500",
  critical: "border-l-rose-500",
} as const;

const PendingAlerts = ({ alerts }: PendingAlertsProps) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Pendências Importantes</h3>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={`p-3 rounded-lg border border-slate-100 dark:border-slate-800 border-l-4 ${alertStyles[alert.type]}`}
          >
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{alert.title}</p>
            <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PendingAlerts;
