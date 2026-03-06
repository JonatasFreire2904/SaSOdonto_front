import { FormEvent, useState } from "react";

interface CreateClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clinic: { id: string; name: string; location: string; imageUrl: string; status: string; teamCount: number }) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (data: { name: string; location: string; imageUrl?: string }) => void;
}

const CreateClinicModal = ({
  isOpen,
  onClose,
  isSubmitting,
  error,
  onSubmit,
}: CreateClinicModalProps) => {
  const [imagePreview, setImagePreview] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    onSubmit({
      name: String(form.get("name")),
      location: String(form.get("location")),
      imageUrl: String(form.get("imageUrl") || ""),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">add_business</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Nova Clínica
              </h3>
              <p className="text-sm text-slate-500">
                Preencha os dados para cadastrar sua clínica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Nome da clínica */}
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              htmlFor="clinic-name"
            >
              Nome da Clínica
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">
                  medical_services
                </span>
              </div>
              <input
                id="clinic-name"
                name="name"
                type="text"
                required
                placeholder="Ex: Clínica Sorriso Perfeito"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              htmlFor="clinic-location"
            >
              Endereço
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">
                  location_on
                </span>
              </div>
              <input
                id="clinic-location"
                name="location"
                type="text"
                required
                placeholder="Ex: Rua das Flores, 123 - Centro, SP"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* URL da imagem (opcional) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                htmlFor="clinic-image"
              >
                Imagem da Clínica
              </label>
              <span className="text-xs text-slate-400">Opcional</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">
                  image
                </span>
              </div>
              <input
                id="clinic-image"
                name="imageUrl"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                onChange={(e) => setImagePreview(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            {imagePreview && (
              <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Criar Clínica
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClinicModal;
