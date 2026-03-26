import type { LabDelivery } from "../types";

interface LabDeliveriesProps {
  deliveries: LabDelivery[];
}

const deliveryStyles = {
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700",
} as const;

const deliveryLabel = {
  in_transit: "A caminho",
  delivered: "Entregue",
} as const;

const LabDeliveries = ({ deliveries }: LabDeliveriesProps) => {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
      <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">Laboratório • Entregas</h3>

      {deliveries.length === 0 ? (
        <p className="text-sm text-slate-500">Sem entregas neste período.</p>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => (
            <article key={delivery.id} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {delivery.patientName}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${deliveryStyles[delivery.status]}`}
                >
                  {deliveryLabel[delivery.status]}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{delivery.pieceType}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default LabDeliveries;
