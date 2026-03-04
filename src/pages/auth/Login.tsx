import { FormEvent, useState } from "react";
import AuthLayout from "@/components/layout/AuthLayout";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const Login = () => {
  const [isLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Autenticação será implementada depois
    console.log("Login submit");
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold tracking-tight mb-2">
        Bem-vindo de volta
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Insira suas credenciais para acessar o painel clínico.
      </p>

      <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-xl shadow-primary/5 border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="••••••••"
            required
            rightAction={
              <a
                className="text-xs font-bold text-primary hover:underline"
                href="#"
              >
                Esqueci minha senha
              </a>
            }
          />

          <div className="flex items-center">
            <input
              className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary/30 cursor-pointer"
              id="remember"
              name="remember"
              type="checkbox"
            />
            <label
              className="ml-2 block text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              htmlFor="remember"
            >
              Lembrar de mim
            </label>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar no Portal"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Novo no DentalCloud?{" "}
            <a className="text-primary font-bold hover:underline" href="#">
              Registre sua clínica
            </a>
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">
            <span className="material-symbols-outlined text-slate-400 text-lg">
              shield_with_heart
            </span>
            <span className="text-xs font-medium text-slate-500">
              Conformidade e Segurança de Dados
            </span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;