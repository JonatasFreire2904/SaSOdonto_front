import { useState } from "react";
import { useProfessionals } from "@/hooks/queries/useProfessionals";
import { clinicStorage } from "@/infrastructure/storage/clinicStorage";
import { useDeleteProfessional } from "@/hooks/mutations/useDeleteProfessional";
import { useUpdateProfessionalRole } from "@/hooks/mutations/useUpdateProfessionalRole";
import CreateProfessionalModal from "./components/CreateProfessionalModal";
import EditProfessionalModal from "./components/EditProfessionalModal";
import { formatRole, ROLE_OPTIONS } from "./utils";
import type { Professional, ProfessionalRole } from "@/api/professionalService";

const ProfessionalList = () => {
  const clinicId = clinicStorage.getClinicId();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [roleEditingId, setRoleEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole>("Dentista");

  const { data: professionals = [], isLoading, refetch } = useProfessionals(clinicId);
  const { deleteProfessional } = useDeleteProfessional(clinicId);
  const { updateRole } = useUpdateProfessionalRole(clinicId);

  const handleEditClick = (professional: Professional) => {
    setRoleEditingId(professional.id);
    setSelectedRole(professional.role as ProfessionalRole);
  };

  const handleConfirmRole = (id: string) => {
    updateRole({ id, role: selectedRole });
    setRoleEditingId(null);
  };

  const handleCancelEdit = () => {
    setRoleEditingId(null);
    setSelectedRole("Dentista");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Profissionais
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie os profissionais da clínica
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Novo Profissional
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">
            group_off
          </span>
          <p className="text-slate-500 font-medium">Nenhum profissional cadastrado</p>
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
                  E-mail
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Função
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((professional) => (
                <tr
                  key={professional.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg">person</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {professional.userName}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {professional.email}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {roleEditingId === professional.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as ProfessionalRole)}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      formatRole(professional.role)
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                    {new Date(professional.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {roleEditingId === professional.id ? (
                        <>
                          <button
                            onClick={() => handleConfirmRole(professional.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                            Confirmar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingProfessional(professional)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Editar
                          </button>
                          <button
                            onClick={() => handleEditClick(professional)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">badge</span>
                            Cargo
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deleteProfessional(professional.id)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {clinicId && (
        <CreateProfessionalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => refetch()}
          clinicId={clinicId}
        />
      )}

      {clinicId && editingProfessional && (
        <EditProfessionalModal
          isOpen={!!editingProfessional}
          onClose={() => setEditingProfessional(null)}
          onSuccess={() => refetch()}
          clinicId={clinicId}
          professional={editingProfessional}
        />
      )}
    </div>
  );
};

export default ProfessionalList;
