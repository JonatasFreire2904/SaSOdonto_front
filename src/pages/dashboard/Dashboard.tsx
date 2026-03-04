import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
              Painel Geral
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Bem-vindo de volta, {user?.userName || "Doutor"}!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-lg">add</span>
              Novo Agendamento
            </button>
          </div>
        </div>
      </header>

      {/* Cards de métricas */}
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon="group"
            label="Total de Pacientes"
            value="1.248"
            trend="+12%"
            trendUp
          />
          <MetricCard
            icon="calendar_month"
            label="Agendamentos Hoje"
            value="18"
            trend="3 confirmados"
            trendUp
          />
          <MetricCard
            icon="payments"
            label="Faturamento Mensal"
            value="R$ 42.580"
            trend="+8% vs mês anterior"
            trendUp
          />
          <MetricCard
            icon="pending_actions"
            label="Pendências"
            value="7"
            trend="2 urgentes"
            trendUp={false}
          />
        </div>

        {/* Próximos agendamentos */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">
                schedule
              </span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Próximos Agendamentos
              </h3>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">
              Ver todos
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <AppointmentRow
              time="09:00"
              patient="Maria Silva"
              procedure="Limpeza"
              status="confirmed"
            />
            <AppointmentRow
              time="10:30"
              patient="João Santos"
              procedure="Extração"
              status="confirmed"
            />
            <AppointmentRow
              time="14:00"
              patient="Ana Costa"
              procedure="Consulta"
              status="pending"
            />
            <AppointmentRow
              time="15:30"
              patient="Gabriel Augusto"
              procedure="Ortodontia"
              status="confirmed"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs">history</span>
            Última atualização: agora
          </div>
          <div>Sistema v2.4.0</div>
        </footer>
      </div>
    </>
  );
};

// --- Componentes auxiliares ---

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

const MetricCard = ({ icon, label, value, trend, trendUp }: MetricCardProps) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span
        className={`text-xs font-bold px-2 py-1 rounded-full ${
          trendUp
            ? "bg-emerald-50 text-emerald-600"
            : "bg-orange-50 text-orange-600"
        }`}
      >
        {trend}
      </span>
    </div>
    <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">{value}</p>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
      {label}
    </p>
  </div>
);

interface AppointmentRowProps {
  time: string;
  patient: string;
  procedure: string;
  status: "confirmed" | "pending";
}

const AppointmentRow = ({ time, patient, procedure, status }: AppointmentRowProps) => (
  <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="text-center min-w-[50px]">
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{time}</p>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{patient}</p>
        <p className="text-xs text-slate-500">{procedure}</p>
      </div>
    </div>
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
        status === "confirmed"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status === "confirmed" ? "Confirmado" : "Pendente"}
    </span>
  </div>
);

export default Dashboard;
