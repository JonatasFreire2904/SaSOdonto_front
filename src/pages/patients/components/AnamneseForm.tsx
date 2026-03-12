import { useState, useEffect } from "react";
import api from "@/api/axiosConfig";

export interface CustomField {
  id?: string;
  question: string;
  answer: string;
}

export interface AnamneseData {
  id?: string;
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
  previousSurgeries: string;
  familyHistory: string;
  observations: string;
  customFields: CustomField[];
}

const defaultAnamnese: AnamneseData = {
  hasDiabetes: false,
  hasHypertension: false,
  hasHeartDisease: false,
  hasBleedingDisorder: false,
  hasHepatis: false,
  hasHiv: false,
  hasAsthma: false,
  hasSeizures: false,
  isSmoker: false,
  isAlcoholUser: false,
  usesDrugs: false,
  isPregnant: false,
  isBreastfeeding: false,
  allergies: "",
  medications: "",
  previousSurgeries: "",
  familyHistory: "",
  observations: "",
  customFields: [],
};

const booleanFields: { key: keyof AnamneseData; label: string; icon: string }[] = [
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

const textFields: { key: keyof AnamneseData; label: string; placeholder: string }[] = [
  { key: "allergies", label: "Alergias", placeholder: "Ex: Penicilina, Dipirona..." },
  { key: "medications", label: "Medicamentos em uso", placeholder: "Ex: Losartana 50mg..." },
  { key: "previousSurgeries", label: "Cirurgias anteriores", placeholder: "Ex: Apendicectomia 2018..." },
  { key: "familyHistory", label: "Histórico familiar", placeholder: "Ex: Pai diabético..." },
  { key: "observations", label: "Observações gerais", placeholder: "Informações adicionais..." },
];

interface AnamneseFormProps {
  clinicId: string;
  patientId: string;
  onSave?: (data: AnamneseData) => void;
}

const AnamneseForm = ({ clinicId, patientId, onSave }: AnamneseFormProps) => {
  const [data, setData] = useState<AnamneseData>(defaultAnamnese);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get(`/clinicas/${clinicId}/pacientes/${patientId}/anamnese`)
      .then((res) => {
        if (res.data && res.data.id) setData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clinicId, patientId]);

  const handleToggle = (key: keyof AnamneseData) => {
    setData((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleTextChange = (key: keyof AnamneseData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleAddCustomField = () => {
    setData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { question: "", answer: "" }],
    }));
    setSaved(false);
  };

  const handleCustomFieldChange = (index: number, field: "question" | "answer", value: string) => {
    setData((prev) => {
      const updated = [...prev.customFields];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, customFields: updated };
    });
    setSaved(false);
  };

  const handleRemoveCustomField = (index: number) => {
    setData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...body } = data;
      // Enviar customFields sem o id (backend faz replace completo)
      const payload = {
        ...body,
        customFields: body.customFields.map(({ question, answer }) => ({ question, answer })),
      };
      await api.post(`/clinicas/${clinicId}/pacientes/${patientId}/anamnese`, payload);
      setSaved(true);
      onSave?.(data);
    } catch {
      alert("Erro ao salvar anamnese.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Condições de saúde */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">vital_signs</span>
          Condições de Saúde
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {booleanFields.map(({ key, label, icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleToggle(key)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                data[key]
                  ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{icon}</span>
              <span className="text-sm font-semibold flex-1">{label}</span>
              <span
                className={`material-symbols-outlined text-lg ${
                  data[key] ? "text-red-500" : "text-slate-300"
                }`}
              >
                {data[key] ? "check_circle" : "circle"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Campos de texto */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">description</span>
          Informações Complementares
        </h3>
        <div className="space-y-5">
          {textFields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                {label}
              </label>
              <textarea
                value={(data[key] as string) || ""}
                onChange={(e) => handleTextChange(key, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Campos Personalizados */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">quiz</span>
            Perguntas Personalizadas
          </h3>
          <button
            type="button"
            onClick={handleAddCustomField}
            className="flex items-center gap-1 text-primary text-sm font-bold hover:underline"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Adicionar
          </button>
        </div>

        {data.customFields.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">
            Nenhuma pergunta personalizada. Clique em "Adicionar" para criar.
          </p>
        )}

        <div className="space-y-4">
          {data.customFields.map((cf, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Pergunta {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(index)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
              <input
                value={cf.question}
                onChange={(e) => handleCustomFieldChange(index, "question", e.target.value)}
                placeholder="Ex: Tem medo de dentista?"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <textarea
                value={cf.answer}
                onChange={(e) => handleCustomFieldChange(index, "answer", e.target.value)}
                placeholder="Resposta do paciente..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botão salvar */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">
            {saving ? "hourglass_empty" : "save"}
          </span>
          {saving ? "Salvando..." : "Salvar Anamnese"}
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Salvo com sucesso
          </span>
        )}
      </div>
    </div>
  );
};

export default AnamneseForm;
