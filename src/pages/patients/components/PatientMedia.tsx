export interface MediaItem {
  id: string;
  name: string;
  type: "image" | "pdf" | "document";
  url: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface PatientMediaProps {
  items: MediaItem[];
  totalCount: number;
  onUpload: () => void;
  onViewAll: () => void;
}

const PatientMedia = ({ items, totalCount, onUpload, onViewAll }: PatientMediaProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">gallery_thumbnail</span>
          Mídia do Paciente
        </h3>
        <button
          onClick={onUpload}
          className="flex items-center gap-1 text-slate-400 hover:text-primary transition-colors text-xs font-bold"
        >
          <span className="material-symbols-outlined text-lg">upload_file</span>
          Enviar Arquivo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            {item.type === "image" && item.thumbnailUrl ? (
              <>
                <img
                  alt={item.name}
                  className="size-full object-cover group-hover:scale-110 transition-transform"
                  src={item.thumbnailUrl}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">zoom_in</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 p-2">
                  <p className="text-[10px] text-white font-bold truncate uppercase">{item.name}</p>
                </div>
              </>
            ) : (
              <div className="size-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-1 group-hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {item.type === "pdf" ? "picture_as_pdf" : "description"}
                </span>
                <p className="text-[10px] font-bold text-slate-500 uppercase truncate px-2">
                  {item.name}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalCount > items.length && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
        >
          Ver Todos os Arquivos ({totalCount})
        </button>
      )}
    </div>
  );
};

export default PatientMedia;
