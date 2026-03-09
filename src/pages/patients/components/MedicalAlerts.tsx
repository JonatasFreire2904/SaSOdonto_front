export interface ProntuarioEntry {
  id: string;
  type: "appointment" | "observation" | "exam" | "prescription" | "allergy" | "chronicCondition";
  title: string;
  description: string;
  appointmentId: string | null;
  createdAt: string;
}

export interface AnamneseCustomField {
  id?: string;
  question: string;
  answer: string;
}

export interface AnamneseSnapshot {
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasHeartDisease: boolean;
  hasBleedingDisorder: boolean;
  hasHepatis: boolean;
  hasHiv: boolean;
  hasAsthma: boolean;
  hasSeizures: boolean;
  isSmoker: boolean;
  isAlcoholUser: boolean;
  usesDrugs: boolean;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  allergies: string;
  medications: string;
  observations: string;
  customFields?: AnamneseCustomField[];
}

const conditionLabels: { key: keyof AnamneseSnapshot; label: string; icon: string }[] = [
  { key: "hasDiabetes", label: "Diabetes", icon: "bloodtype" },
  { key: "hasHypertension", label: "Hipertensão", icon: "monitor_heart" },
  { key: "hasHeartDisease", label: "Doença Cardíaca", icon: "cardiology" },
  { key: "hasBleedingDisorder", label: "Distúrbio de Sangramento", icon: "water_drop" },
  { key: "hasHepatis", label: "Hepatite", icon: "gastroenterology" },
  { key: "hasHiv", label: "HIV", icon: "coronavirus" },
  { key: "hasAsthma", label: "Asma", icon: "pulmonology" },
  { key: "hasSeizures", label: "Convulsões", icon: "neurology" },
  { key: "isSmoker", label: "Fumante", icon: "smoking_rooms" },
  { key: "isAlcoholUser", label: "Uso de Álcool", icon: "local_bar" },
  { key: "usesDrugs", label: "Uso de Drogas", icon: "medication" },
  { key: "isPregnant", label: "Gestante", icon: "pregnant_woman" },
  { key: "isBreastfeeding", label: "Amamentando", icon: "breastfeeding" },
];

interface MedicalAlertsProps {
  entries: ProntuarioEntry[];
  anamnese: AnamneseSnapshot | null;
  onAddEntry: () => void;
}

const MedicalAlerts = ({ entries, anamnese, onAddEntry }: MedicalAlertsProps) => {
  const allergies = entries.filter((e) => e.type === "allergy");
  const conditions = entries.filter((e) => e.type === "chronicCondition");
  const observations = entries.filter((e) => e.type === "observation");

  // Condições ativas da anamnese
  const activeConditions = anamnese
    ? conditionLabels.filter(({ key }) => anamnese[key] === true)
    : [];
  const anamneseAllergies = anamnese?.allergies?.trim() || "";
  const anamneseMedications = anamnese?.medications?.trim() || "";
  const anamneseObservations = anamnese?.observations?.trim() || "";
  const customFields = anamnese?.customFields?.filter((cf) => cf.question.trim() || cf.answer.trim()) || [];

  const hasContent =
    allergies.length > 0 ||
    conditions.length > 0 ||
    observations.length > 0 ||
    activeConditions.length > 0 ||
    !!anamneseAllergies ||
    !!anamneseMedications ||
    !!anamneseObservations ||
    customFields.length > 0;

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

      {/* Dados da Anamnese */}
      {activeConditions.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
            Condições (Anamnese)
          </p>
          <div className="flex flex-wrap gap-2">
            {activeConditions.map(({ key, label, icon }) => (
              <span
                key={key}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
              >
                <span className="material-symbols-outlined text-sm">{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {anamneseAllergies && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
            Alergias (Anamnese)
          </p>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">warning</span>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{anamneseAllergies}</p>
          </div>
        </div>
      )}

      {anamneseMedications && (
        <div className="mb-4">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
            Medicamentos em uso
          </p>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">medication</span>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">{anamneseMedications}</p>
          </div>
        </div>
      )}

      {anamneseObservations && (
        <div className="mt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Observações (Anamnese)
          </p>
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic">
            <p>"{anamneseObservations}"</p>
          </div>
        </div>
      )}

      {customFields.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-2">
            Perguntas Personalizadas
          </p>
          <div className="space-y-2">
            {customFields.map((cf, i) => (
              <div
                key={cf.id || i}
                className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
              >
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400">{cf.question}</p>
                {cf.answer.trim() && (
                  <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">{cf.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalAlerts;
