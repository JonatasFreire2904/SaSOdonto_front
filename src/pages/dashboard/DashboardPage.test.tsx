import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardPage from "./DashboardPage";

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { userName: "Dra. Teste", email: "teste@smilecare.com" },
  }),
}));

describe("DashboardPage", () => {
  it("renderiza seções principais do dashboard", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Painel Operacional")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos do Dia")).toBeInTheDocument();
    expect(screen.getByText("Ocupação de Cadeiras")).toBeInTheDocument();
    expect(screen.getByText("Aniversariantes do Dia")).toBeInTheDocument();
    expect(screen.getByText("Laboratório • Entregas")).toBeInTheDocument();
    expect(screen.getByText("Pendências Importantes")).toBeInTheDocument();
  });

  it("altera o período global via filtro", async () => {
    const user = userEvent.setup();
    render(<DashboardPage />);

    const filter = screen.getByLabelText("Filtro de período");
    await user.selectOptions(filter, "week");

    expect((filter as HTMLSelectElement).value).toBe("week");
  });

  it("exibe status de agendamentos traduzidos", () => {
    render(<DashboardPage />);

    expect(screen.getAllByText("Confirmado").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pendente").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cancelado").length).toBeGreaterThan(0);
  });
});
