interface ClinicCardProps {
  name: string;
  location: string;
  imageUrl: string;
  status: "active" | "inactive";
  teamCount: number;
  onClick: () => void;
}

const statusMap = {
  active: { label: "Ativa", color: "bg-green-500" },
  inactive: { label: "Inativa", color: "bg-slate-400" },
};

const ClinicCard = ({
  name,
  location,
  imageUrl,
  status,
  teamCount,
  onClick,
}: ClinicCardProps) => {
  const { label, color } = statusMap[status];

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300"
    >
      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative">
        {imageUrl ? (
          <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={`Imagem da clínica ${name}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <span className="material-symbols-outlined text-6xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              dentistry
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span
            className={`px-2 py-1 ${color} text-white text-[10px] font-bold rounded uppercase tracking-wider`}
          >
            {label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="flex items-center mt-1 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-sm mr-1">location_on</span>
          <span className="text-sm">{location}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            <div className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">group</span>
            </div>
            {teamCount > 0 && (
              <div className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                +{teamCount}
              </div>
            )}
          </div>
          <span className="text-primary font-semibold text-sm">Gerenciar →</span>
        </div>
      </div>
    </button>
  );
};

export default ClinicCard;
