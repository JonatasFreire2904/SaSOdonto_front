interface NextVisitCardProps {
  date: string;
  time: string;
  description: string;
  onReschedule: () => void;
  onRemindPatient: () => void;
}

const NextVisitCard = ({
  date,
  time,
  description,
  onReschedule,
  onRemindPatient,
}: NextVisitCardProps) => {
  return (
    <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
      <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-1">
        Próxima Visita
      </p>
      <h4 className="text-slate-900 dark:text-white font-bold text-lg">{date}</h4>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
        {time} • {description}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onReschedule}
          className="flex-1 bg-white dark:bg-slate-900 py-2 rounded-lg text-primary text-xs font-bold border border-primary/20 hover:bg-primary/5 transition-all"
        >
          Reagendar
        </button>
        <button
          onClick={onRemindPatient}
          className="flex-1 bg-primary py-2 rounded-lg text-white text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
        >
          Lembrar Paciente
        </button>
      </div>
    </div>
  );
};

export default NextVisitCard;
