import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ClinicSelection from "@/pages/clinic/ClinicSelection";
import Dashboard from "@/pages/dashboard/Dashboard";
import PatientRecord from "@/pages/patients/PatientRecord";
import PatientList from "@/pages/patients/PatientList";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import ProfessionalList from "@/pages/professionals/ProfessionalList";
import ComingSoon from "@/pages/ComingSoon";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* Seleção de clínica (primeira tela após login) */}
          <Route path="/clinicas" element={<ClinicSelection />} />

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/pacientes" element={<PatientList />} />
            <Route path="/dashboard/pacientes/:id" element={<PatientRecord />} />
            <Route path="/dashboard/profissionais" element={<ProfessionalList />} />
            <Route path="/dashboard/agendamentos" element={<ComingSoon label="Agendamentos" />} />
            <Route path="/dashboard/financeiro" element={<ComingSoon label="Financeiro" />} />
            <Route path="/dashboard/configuracoes" element={<ComingSoon label="Configurações" />} />
            {/* Futuras rotas protegidas aqui */}
          </Route>
        </Route>

        {/* Redirect padrão */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;