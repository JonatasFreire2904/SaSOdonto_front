import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ClinicCard from "@/components/ui/ClinicCard";
import CreateClinicModal from "@/components/ui/CreateClinicModal";
import { clinicService } from "@/infrastructure/http/clinicService";
import { extractErrorMessage } from "@/infrastructure/adapters/responseAdapter";
import type { Clinic } from "@/domain/types";

const ClinicSelection = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    clinicService
      .list()
      .then(setClinics)
      .catch((err) => console.error("Erro ao buscar clínicas:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSelectClinic = async (clinicId: string) => {
    try {
      await clinicService.select(clinicId);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao selecionar clínica:", error);
    }
  };

  const handleCreateClinic = async (data: { name: string; location: string; imageUrl?: string }) => {
    setCreateError(null);
    setIsCreating(true);
    try {
      const created = await clinicService.create(data);
      setClinics((prev) => [...prev, created]);
      setIsModalOpen(false);
    } catch (error) {
      setCreateError(extractErrorMessage(error, "Erro ao criar clínica. Tente novamente."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">dentistry</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight">
                SmileCare
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">medical_services</span>
            <span className="text-sm font-semibold tracking-wide">Clínica</span>
          </span>
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed">
            <span className="material-symbols-outlined">payments</span>
            <span className="text-sm font-semibold tracking-wide">Financeiro</span>
          </span>
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed">
            <span className="material-symbols-outlined">groups</span>
            <span className="text-sm font-semibold tracking-wide">RH</span>
          </span>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{user?.userName || "Usuário"}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-500 transition-colors"
              title="Sair"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          <header className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Suas Clínicas
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              Selecione uma clínica para gerenciar ou crie uma nova unidade para expandir sua rede.
            </p>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-500">Carregando clínicas...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <ClinicCard
                  key={clinic.id}
                  name={clinic.name}
                  location={clinic.location}
                  imageUrl={clinic.imageUrl}
                  status={clinic.status}
                  teamCount={clinic.teamCount}
                  onClick={() => handleSelectClinic(clinic.id)}
                />
              ))}

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all duration-300 group min-h-[320px]"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">add</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Criar Nova Clínica
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center mt-2 text-sm max-w-[200px]">
                  Adicione uma nova unidade ao seu sistema de gestão.
                </p>
                <div className="mt-6 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                  Começar Agora
                </div>
              </button>
            </div>
          )}

          <div className="mt-16 p-6 bg-primary/5 rounded-xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">help</span>
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white font-bold">
                  Precisa de ajuda com a configuração?
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Nossa equipe de suporte está pronta para auxiliar na migração de seus dados.
                </p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
              Falar com Suporte
            </button>
          </div>
        </div>
      </main>

      <CreateClinicModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCreateError(null);
        }}
        onSubmit={handleCreateClinic}
        onSuccess={() => {}}
        isSubmitting={isCreating}
        error={createError}
      />
    </div>
  );
};

export default ClinicSelection;
