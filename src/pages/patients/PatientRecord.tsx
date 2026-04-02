import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { clinicStorage } from "@/infrastructure/storage/clinicStorage";
import api from "@/api/axiosConfig";
import PatientHeader from "./components/PatientHeader";
import Odontogram from "./components/Odontogram";
import ProceduresTable from "./components/ProceduresTable";
import MedicalAlerts from "./components/MedicalAlerts";
import PatientMedia from "./components/PatientMedia";
import NextVisitCard from "./components/NextVisitCard";
import AnamneseForm from "./components/AnamneseForm";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
import ToothDetailModal from "./components/ToothDetailModal";
import TreatmentPlanOdontogram from "./components/TreatmentPlanOdontogram";
import type { Atendimento } from "./components/ProceduresTable";
import type { ProntuarioEntry } from "./components/MedicalAlerts";
import type { ToothData } from "./components/Odontogram";
import type { MediaItem } from "./components/PatientMedia";
import type { AnamneseSnapshot } from "./components/MedicalAlerts";

interface Patient {
  id: string;
  name?: string;        // Novo formato do backend
  fullName?: string;    // Formato legado - mantido para compatibilidade
  cpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

type TabKey = "prontuario" | "plano" | "historico" | "anamnese" | "arquivos" | "anotacoes";

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: "prontuario", label: "Prontuário", icon: "grid_view" },
  { key: "plano", label: "Plano de Tratamento", icon: "assignment" },
  { key: "historico", label: "Histórico", icon: "history" },
  { key: "anamnese", label: "Anamnese", icon: "checklist" },
  { key: "arquivos", label: "Arquivos e Raio-X", icon: "photo_library" },
  { key: "anotacoes", label: "Anotações", icon: "edit_note" },
];

const PatientRecord = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>("prontuario");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [alertas, setAlertas] = useState<ProntuarioEntry[]>([]);
  const [upperTeeth, setUpperTeeth] = useState<ToothData[]>([]);
  const [lowerTeeth, setLowerTeeth] = useState<ToothData[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [anamnese, setAnamnese] = useState<AnamneseSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showToothModal, setShowToothModal] = useState(false);
  const [selectedTooth, setSelectedTooth] = useState<ToothData | null>(null);

  const clinicId = clinicStorage.getClinicId();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const base = `/clinicas/${clinicId}`;
        const [patientRes, atendimentosRes, alertasRes, odontoRes, mediaRes, anamneseRes] =
          await Promise.all([
            api.get(`${base}/pacientes/${id}`),
            api.get(`${base}/atendimentos`),
            api.get(`${base}/pacientes/${id}/prontuario`),
            api.get(`${base}/pacientes/${id}/odontograma`),
            api.get(`${base}/pacientes/${id}/midias`),
            api.get(`${base}/pacientes/${id}/anamnese`).catch(() => ({ data: null })),
          ]);

        setPatient(patientRes.data);
        // Filtrar atendimentos pelo paciente (GET /atendimentos retorna todos da clínica)
        const allAtendimentos = atendimentosRes.data;
        setAtendimentos(
          Array.isArray(allAtendimentos)
            ? allAtendimentos.filter((a: Atendimento) => a.patientId === id)
            : []
        );
        setAlertas(alertasRes.data);
        setUpperTeeth(odontoRes.data.upperTeeth);
        setLowerTeeth(odontoRes.data.lowerTeeth);
        setMedia(mediaRes.data);
        if (anamneseRes.data && anamneseRes.data.id) setAnamnese(anamneseRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados do paciente:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && clinicId) fetchPatientData();
  }, [id, clinicId]);

  // Derivar alertas
  const allergies = alertas.filter(e => e.type === "allergy").map(e => e.title);
  const risks = alertas.filter(e => e.type === "chronicCondition").map(e => e.title);

  // Derivar próxima visita do próximo atendimento agendado
  const nextScheduled = atendimentos
    .filter(a => a.status === "Scheduled" && new Date(a.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const nextVisit = nextScheduled
    ? {
        date: new Date(nextScheduled.scheduledAt).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        time: new Date(nextScheduled.scheduledAt).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        description: nextScheduled.procedure,
      }
    : null;

  const handlePrint = () => window.print();

  const handleNewAppointment = () => {
    setShowAppointmentModal(true);
  };

  const handleAddProntuario = () => {
    // TODO: abrir modal para adicionar entrada ao prontuário (POST /clinicas/{clinicId}/pacientes/{id}/prontuario)
  };

  const handleToothClick = (tooth: ToothData) => {
    setSelectedTooth(tooth);
    setShowToothModal(true);
  };

  const handleToothProcedureSuccess = () => {
    // Recarregar odontograma após salvar procedimento
    if (clinicId && id) {
      api.get(`/clinicas/${clinicId}/pacientes/${id}/odontograma`).then((res) => {
        setUpperTeeth(res.data.upperTeeth);
        setLowerTeeth(res.data.lowerTeeth);
      });
    }
  };

  const handleUploadMedia = () => {
    // TODO: abrir file picker e fazer upload (POST /clinicas/{clinicId}/pacientes/{id}/midias)
  };

  const handleReschedule = () => {
    // TODO: abrir modal de reagendamento
  };

  const handleRemindPatient = () => {
    // TODO: enviar lembrete ao paciente
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Carregando prontuário...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">person_off</span>
          <p className="text-lg font-bold text-slate-500">Paciente não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header fixo com busca */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Pacientes</h2>
            <span className="text-slate-300">/</span>
            <h2 className="text-lg font-bold text-primary">{patient.fullName}</h2>
          </div>
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
              search
            </span>
            {/* chamar rota buscarPacientes (GET /pacientes?search=) */}
            <input
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/50"
              placeholder="Buscar pacientes..."
              type="text"
            />
          </div>
        </div>
      </header>

      <div className="p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
        {/* Info do paciente */}
        <PatientHeader
          patient={patient}
          allergies={allergies}
          risks={risks}
          onPrint={handlePrint}
          onNewAppointment={handleNewAppointment}
        />

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 border-b-2 font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da tab Prontuário */}
        {activeTab === "prontuario" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coluna principal */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Odontogram
                upperTeeth={upperTeeth}
                lowerTeeth={lowerTeeth}
                onToothClick={handleToothClick}
              />
              <ProceduresTable
                atendimentos={atendimentos}
                totalCount={atendimentos.length}
                onViewAll={() => setActiveTab("historico")}
              />
            </div>

            {/* Sidebar direita */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <MedicalAlerts
                entries={alertas}
                anamnese={anamnese}
                onAddEntry={handleAddProntuario}
              />
              <PatientMedia
                items={media}
                totalCount={media.length}
                onUpload={handleUploadMedia}
                onViewAll={() => setActiveTab("arquivos")}
              />
              {nextVisit && (
                <NextVisitCard
                  date={nextVisit.date}
                  time={nextVisit.time}
                  description={nextVisit.description}
                  onReschedule={handleReschedule}
                  onRemindPatient={handleRemindPatient}
                />
              )}
            </div>
          </div>
        )}

        {/* Placeholder para outras tabs */}
        {activeTab === "historico" && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl">history</span>
              <p className="mt-2 font-bold">Histórico completo — em breve</p>
            </div>
          </div>
        )}

        {activeTab === "anamnese" && clinicId && id && (
          <AnamneseForm
            clinicId={clinicId}
            patientId={id}
            onSave={(savedData) => setAnamnese(savedData)}
          />
        )}

        {activeTab === "arquivos" && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl">photo_library</span>
              <p className="mt-2 font-bold">Arquivos e Raio-X — em breve</p>
            </div>
          </div>
        )}

        {activeTab === "anotacoes" && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl">edit_note</span>
              <p className="mt-2 font-bold">Anotações — em breve</p>
            </div>
          </div>
        )}

        {activeTab === "plano" && clinicId && id && (
          <TreatmentPlanOdontogram clinicId={clinicId} patientId={id} />
        )}

        {/* Footer */}
        <footer className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-widest pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">lock</span>
            Conexão Segura LGPD/HIPAA
          </div>
          <div>Sistema v2.4.0</div>
        </footer>
      </div>

      {/* Modal Nova Consulta */}
      {clinicId && (
        <CreateAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          onSuccess={(newAtendimento) => {
            setAtendimentos((prev) => [newAtendimento, ...prev]);
          }}
          patientId={id!}
          patientName={patient.name ?? patient.fullName ?? ""}
          clinicId={clinicId}
        />
      )}

      {/* Modal Detalhe do Dente */}
      {clinicId && (
        <ToothDetailModal
          isOpen={showToothModal}
          onClose={() => setShowToothModal(false)}
          onSuccess={handleToothProcedureSuccess}
          tooth={selectedTooth}
          clinicId={clinicId}
          patientId={id!}
        />
      )}
    </>
  );
};

export default PatientRecord;
