import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface SidebarItemProps {
  to: string;
  icon: string;
  label: string;
}

const SidebarItem = ({ to, icon, label }: SidebarItemProps) => (
  <NavLink
    to={to}
    end={to === "/dashboard"}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <span
          className={`material-symbols-outlined ${isActive ? "text-primary" : ""}`}
          style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
        <span className={`text-sm ${isActive ? "font-bold" : "font-semibold"}`}>
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary rounded-lg p-2 text-white flex items-center justify-center">
            <span className="material-symbols-outlined">dentistry</span>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-slate-50 font-bold text-lg leading-tight">
              SmileCare
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
              Gestão Odontológica
            </p>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem to="/dashboard" icon="dashboard" label="Painel Geral" />
          <SidebarItem to="/dashboard/pacientes" icon="group" label="Pacientes" />
          <SidebarItem to="/dashboard/agendamentos" icon="calendar_month" label="Agendamentos" />
          <SidebarItem to="/dashboard/financeiro" icon="payments" label="Financeiro" />

          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Administrativo
          </div>

          <SidebarItem to="/dashboard/profissionais" icon="badge" label="Profissionais" />
          <SidebarItem to="/dashboard/configuracoes" icon="settings" label="Configurações" />
        </nav>

        {/* Perfil do usuário */}
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

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
