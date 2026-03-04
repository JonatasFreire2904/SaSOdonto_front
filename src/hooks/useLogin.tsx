import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/authService";
import { useAuth } from "@/context/AuthContext";

export const useLogin = () => {
  const { setUser } = useAuth();

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data);
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
  };
};