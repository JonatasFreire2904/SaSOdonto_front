import { FormEvent, useState } from "react";
import { useUpdateProfessional } from "@/hooks/mutations/useUpdateProfessional";
import { validatePassword } from "./CreateProfessionalModal";
import { ROLE_OPTIONS } from "../utils";
import type { Professional } from "@/api/professionalService";

interface EditProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clinicId: string;
  professional: Professional;
}

const EditProfessionalModal = ({
  isOpen,
  onClose,
  onSuccess,
  clinicId,
  professional,
}: EditProfessionalModalProps) => {
  const { update, isLoading, error, reset } = useUpdateProfessional(clinicId);
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
    const password = String(form.get("password")).trim();

    if (password) {
      const pwError = validatePassword(password);
      if (pwError) {
        setPasswordError(pwError);
        return;
      }
    }
    setPasswordError(null);

    const phone = String(form.get("phone")).trim();
    const role = String(form.get("role")) as any;

    update(
      {
        id: professional.id,
        data: {
          userName: String(form.get("userName")).trim(),
          email: String(form.get("email")).trim(),
          phone: phone || undefined,
          role: role || undefined,
          ...(password ? { password } : {}),
        },
      },
      {
        onSuccess: () => {
          onSuccess();
          handleClose();
        },
      }
    );
  };

  const inputCls = "block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">edit</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Editar Profissional</h3>
              <p className="text-sm text-slate-500">Atualize os dados do profissional</p>
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
            <label htmlFor="edit-userName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome de usuário *</label>
            <input id="edit-userName" name="userName" type="text" required defaultValue={professional.userName} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail *</label>
            <input id="edit-email" name="email" type="email" required defaultValue={professional.email} className={inputCls} />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Telefone</label>
            <input id="edit-phone" name="phone" type="tel" maxLength={20} defaultValue={professional.phone ?? ""} placeholder="(11) 99999-9999" className={inputCls} />
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-role" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Função</label>
            <select id="edit-role" name="role" defaultValue={professional.role} className={`${inputCls} appearance-none`}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="edit-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nova senha
              <span className="ml-1 text-xs font-normal text-slate-400">(deixe em branco para manter a atual)</span>
            </label>
            <input
              id="edit-password"
              name="password"
              type="password"
              placeholder="Somente se quiser alterar"
              onChange={() => setPasswordError(null)}
              className={`block w-full px-4 py-3 border rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 ${
                passwordError ? "border-rose-400 dark:border-rose-500" : "border-slate-200 dark:border-slate-700"
              }`}
            />
            {passwordError && <p className="text-xs text-rose-600 mt-1">{passwordError}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? (
                <><div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Salvando...</>
              ) : (
                <><span className="material-symbols-outlined text-lg">save</span>Salvar alterações</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfessionalModal;
