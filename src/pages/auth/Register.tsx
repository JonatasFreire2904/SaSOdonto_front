import { FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useRegister } from "@/hooks/useRegister";

const Register = () => {
  const { register, isLoading, isSuccess, error } = useRegister();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    register({
      userName: String(form.get("userName")),
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        Crie sua conta
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Registre sua clínica para começar a usar o DentalCloud.
      </p>

      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-xl shadow-primary/5 border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Conta criada com sucesso! Redirecionando para login...
            </div>
          )}

          <InputField
            id="userName"
            name="userName"
            type="text"
            label="Nome completo"
            icon="person"
            placeholder="Dr. João Silva"
            required
          />

          <InputField
            id="email"
            name="email"
            type="email"
            label="E-mail"
            icon="mail"
            placeholder="dentista@clinica.com.br"
            required
          />

          <InputField
            id="password"
            name="password"
            type="password"
            label="Senha"
            icon="lock"
            placeholder="Mínimo 3 caracteres"
            required
            minLength={3}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Criar Conta"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Já tem uma conta?{" "}
            <Link className="text-primary font-bold hover:underline" to="/login">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;
