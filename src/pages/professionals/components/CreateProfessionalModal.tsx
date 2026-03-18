import { FormEvent, useState } from "react";
import { useCreateProfessional } from "@/hooks/mutations/useCreateProfessional";

interface CreateProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clinicId: string;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "A senha deve conter ao menos uma letra maiúscula.";
  if (!/[a-z]/.test(password)) return "A senha deve conter ao menos uma letra minúscula.";
  if (!/[0-9]/.test(password)) return "A senha deve conter ao menos um número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "A senha deve conter ao menos um caractere especial.";
  return null;
}

const CreateProfessionalModal = ({
  isOpen,
  onClose,
  onSuccess,
  clinicId,
}: CreateProfessionalModalProps) => {
  const { create, isLoading, error, reset } = useCreateProfessional(clinicId);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleClose = () => {
    reset();
    setPasswordError(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));

    const pwError = validatePassword(password);
    if (pwError) {
      setPasswordError(pwError);
      return;
    }
    setPasswordError(null);

    create(
      {
        userName: String(form.get("userName")).trim(),
        email: String(form.get("email")).trim(),
        password,
        role: String(form.get("role")),
        clinicId,
      },
      {
        onSuccess: () => {
          onSuccess();
          handleClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Profissional</h3>
              <p className="text-sm text-slate-500">Preencha os dados do profissional</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="userName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nome de usuário *
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              required
              placeholder="Ex: joaosilva"
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              E-mail *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="profissional@email.com"
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Senha *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Mínimo 8 caracteres"
              onChange={() => setPasswordError(null)}
              className={`block w-full px-4 py-3 border rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${
                passwordError
                  ? "border-rose-400 dark:border-rose-500"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            />
            {passwordError && (
              <p className="text-xs text-rose-600 mt-1">{passwordError}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Função *
            </label>
            <select
              id="role"
              name="role"
              required
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white appearance-none"
            >
              <option value="">Selecione</option>
              <option value="dentista">Dentista</option>
              <option value="rh">RH</option>
              <option value="auxiliar">Auxiliar</option>
              <option value="gestor">Gestor</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Cadastrar Profissional
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfessionalModal;
