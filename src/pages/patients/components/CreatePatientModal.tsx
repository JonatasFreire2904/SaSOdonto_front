import { FormEvent, useState } from "react";
import { useCreatePatient } from "@/hooks/mutations/useCreatePatient";
import { formatCpf, normalizeCpf } from "@/utils/cpf";
import { formatPhone, normalizePhone } from "@/utils/phone";

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clinicId: string;
}

const CreatePatientModal = ({
  isOpen,
  onClose,
  onSuccess,
  clinicId,
}: CreatePatientModalProps) => {
  const { create, isLoading, error, reset } = useCreatePatient(clinicId);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const handleClose = () => {
    reset();
    setCpf("");
    setPhone("");
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    create(
      {
        fullName: String(form.get("fullName")).trim(),
        cpf: normalizeCpf(cpf) || undefined,
        birthDate: new Date(String(form.get("birthDate"))).toISOString(),
        gender: String(form.get("gender")),
        phone: normalizePhone(phone) || undefined,
        email: String(form.get("email")).trim() || undefined,
        address: String(form.get("address")).trim() || undefined,
        notes: String(form.get("notes")).trim() || undefined,
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Novo Paciente</h3>
              <p className="text-sm text-slate-500">Preencha os dados do paciente</p>
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
            <label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nome completo *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Ex: João da Silva"
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="cpf" className="text-sm font-semibold text-slate-700 dark:text-slate-300">CPF</label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                maxLength={14}
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                placeholder="000.000.000-00"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="birthDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Data de nascimento *
              </label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                required
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="gender" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sexo *</label>
            <select
              id="gender"
              name="gender"
              required
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white appearance-none"
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Telefone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={15}
                value={phone}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                placeholder="(00) 00000-0000"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="paciente@email.com"
                className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="address" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Endereço</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Rua, número, bairro, cidade..."
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Observações</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Observações adicionais..."
              className="block w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
            />
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
                  Cadastrar Paciente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePatientModal;
