export interface ProntuarioEntry {
  id: string;
  type: "appointment" | "observation" | "exam" | "prescription" | "allergy" | "chronicCondition";
  title: string;
  description: string;
  appointmentId: string | null;
  createdAt: string;
}

interface MedicalAlertsProps {
  entries: ProntuarioEntry[];
  onAddEntry: () => void;
}

const MedicalAlerts = ({ entries, onAddEntry }: MedicalAlertsProps) => {
  const allergies = entries.filter((e) => e.type === "allergy");
  const conditions = entries.filter((e) => e.type === "chronicCondition");
  const observations = entries.filter((e) => e.type === "observation");
  const hasContent = allergies.length > 0 || conditions.length > 0 || observations.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">medical_information</span>
          Alertas Médicos
        </h3>
        <button
          onClick={onAddEntry}
          className="flex items-center gap-1 text-primary text-sm font-bold hover:underline"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Adicionar
        </button>
      </div>

      {!hasContent && (
        <p className="text-sm text-slate-400 text-center py-4">
          Nenhum alerta registrado
        </p>
      )}

      {allergies.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
            Alergias
          </p>
          <div className="space-y-2">
            {allergies.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">warning</span>
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">{a.title}</p>
                  {a.description && (
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">{a.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {conditions.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">
            Condições Crônicas
          </p>
          <div className="space-y-2">
            {conditions.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
              >
                <span className="material-symbols-outlined text-orange-500 text-lg mt-0.5">warning</span>
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{c.title}</p>
                  {c.description && (
                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-0.5">{c.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {observations.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Observações Clínicas
          </p>
          {observations.map((o) => (
            <div
              key={o.id}
              className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic mb-2"
            >
              <p className="font-semibold text-xs text-primary/70 mb-1 not-italic">{o.title}</p>
              <p>"{o.description}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalAlerts;
