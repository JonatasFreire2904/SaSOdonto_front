import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";
import { AxiosError } from "axios";

export const useRegister = () => {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      navigate("/login");
    },
  });

  const getError = (): string | null => {
    if (!mutation.error) return null;
    const err = mutation.error as AxiosError<{ message?: string }>;
    if (err.response?.status === 409) return "Este e-mail já está cadastrado.";
    if (err.response?.status === 400) return "Preencha todos os campos corretamente.";
    return "Erro ao cadastrar. Tente novamente.";
  };

  return {
    register: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: getError(),
  };
};
