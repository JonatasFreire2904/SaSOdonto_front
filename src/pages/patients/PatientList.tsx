import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients } from "@/hooks/queries/usePatients";
import CreatePatientModal from "./components/CreatePatientModal";
import type { Patient } from "@/api/patientService";

const PatientList = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const clinicId = localStorage.getItem("selectedClinicId") || "";

  // Debounce de 400ms para busca no servidor
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: patients = [], isLoading: loading, refetch } = usePatients(
    clinicId,
    debouncedSearch || undefined
  );

  const filtered = patients;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Pacientes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os pacientes da clínica
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Novo Paciente
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
            group_off
          </span>
          <p className="text-slate-500 font-medium">
            {search ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => navigate(`/dashboard/pacientes/${patient.id}`)}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-slate-500">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {patient.phone}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {patient.cpf || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="material-symbols-outlined text-slate-400">
                      chevron_right
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {clinicId && (
        <CreatePatientModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => refetch()}
          clinicId={clinicId}
        />
      )}
    </div>
  );
};

export default PatientList;
