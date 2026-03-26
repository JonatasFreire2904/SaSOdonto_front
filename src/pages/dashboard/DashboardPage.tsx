import { useAuth } from "@/context/AuthContext";
import Header from "./components/Header";
import OccupancyCard from "./components/OccupancyCard";
import DailyAppointments from "./components/DailyAppointments";
import BirthdayList from "./components/BirthdayList";
import LabDeliveries from "./components/LabDeliveries";
import PendingAlerts from "./components/PendingAlerts";
import AppointmentsMiniChart from "./components/AppointmentsMiniChart";
import { useDashboardData } from "./hooks/useDashboardData";

const DashboardPage = () => {
  const { user } = useAuth();
  const {
    period,
    setPeriod,
    now,
    appointments,
    birthdays,
    labDeliveries,
    pendingAlerts,
    occupancy,
    chartSeries,
  } = useDashboardData();

  return (
    <>
      <Header userName={user?.userName} period={period} onPeriodChange={setPeriod} />

      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <DailyAppointments appointments={appointments} now={now} />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <OccupancyCard occupancy={occupancy} />
            <BirthdayList birthdays={birthdays} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <AppointmentsMiniChart data={chartSeries} />
          </div>
          <div className="lg:col-span-4">
            <LabDeliveries deliveries={labDeliveries} />
          </div>
          <div className="lg:col-span-4">
            <PendingAlerts alerts={pendingAlerts} />
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
