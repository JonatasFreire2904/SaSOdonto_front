import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatients, useDebounce } from "@/hooks/queries/usePatients";
import CreatePatientModal from "./components/CreatePatientModal";
import Pagination from "@/components/ui/Pagination";
import type { PatientStatus } from "@/api/patientService";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: PatientStatus; label: string }[] = [
  { value: "Active", label: "Ativos" },
  { value: "Inactive", label: "Inativos" },
  { value: "Suspended", label: "Suspensos" },
];

const PatientList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PatientStatus>("Active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const clinicId = localStorage.getItem("selectedClinicId") || "";

  const debouncedSearch = useDebounce(search, 500);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: PatientStatus) => {
    setStatus(value);
    setPage(1);
  };

  const hasSearch = debouncedSearch.trim().length > 0;

  const { data, isLoading, isFetching, refetch } = usePatients(
    clinicId,
    debouncedSearch,
    page,
    PAGE_SIZE,
    status,
    hasSearch
  );

  const patients = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.totalCount ?? 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Pacientes</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os pacientes da clínica</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Novo Paciente
        </button>
      </div>

      {/* Busca + Filtro de status */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {isFetching && !isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                status === opt.value
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      {!hasSearch ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
            search
          </span>
          <p className="text-slate-500 font-medium">Digite um nome para buscar pacientes</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
            group_off
          </span>
          <p className="text-slate-500 font-medium">
            {debouncedSearch ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
          </p>
        </div>
      ) : (
        <>
          <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-opacity ${isFetching ? "opacity-60" : "opacity-100"}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Nome</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">Contato</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">CPF</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
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
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{patient.fullName}</p>
                          <p className="text-xs text-slate-500">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{patient.phone}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{patient.cpf || "—"}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            isLoading={isFetching}
            onPageChange={setPage}
          />
        </>
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
