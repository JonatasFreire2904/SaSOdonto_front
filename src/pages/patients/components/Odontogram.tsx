import { useState } from "react";

export interface ToothData {
  number: number;
  status: "normal" | "decay" | "done" | "pending" | "extracted";
  notes: string | null;
}

interface OdontogramProps {
  upperTeeth: ToothData[];
  lowerTeeth: ToothData[];
  onToothClick: (tooth: ToothData) => void;
}

const toothStatusClass = (status: ToothData["status"], isActive: boolean) => {
  const base = "tooth-item text-[10px] font-bold transition-all cursor-pointer";
  if (isActive) return `${base} border-primary bg-primary/10 text-primary shadow-[0_0_0_2px_rgba(25,115,240,0.2)]`;
  switch (status) {
    case "decay":
      return `${base} bg-red-500/10 border-red-500 text-red-600`;
    case "done":
      return `${base} bg-primary/5 border-primary/40 text-primary`;
    case "pending":
      return `${base} bg-yellow-500/10 border-yellow-500 text-yellow-600`;
    case "extracted":
      return `${base} bg-rose-500/10 border-rose-500 text-rose-500 line-through opacity-60`;
    default:
      return `${base} border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary hover:bg-primary/5`;
  }
};

const Odontogram = ({ upperTeeth, lowerTeeth, onToothClick }: OdontogramProps) => {
  const [activeTooth, setActiveTooth] = useState<number | null>(null);

  const handleClick = (tooth: ToothData) => {
    setActiveTooth(tooth.number);
    onToothClick(tooth);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">dentistry</span>
          Odontograma Interativo
        </h3>
        <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-primary" /> Concluído
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-yellow-500" /> Pendente
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-rose-500" /> Ausente
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Arco Superior (Maxilar)
        </p>
        <div className="tooth-grid">
          {upperTeeth.map((tooth) => (
            <div
              key={tooth.number}
              className={toothStatusClass(tooth.status, activeTooth === tooth.number)}
              onClick={() => handleClick(tooth)}
            >
              {tooth.number}
            </div>
          ))}
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-2" />

        <div className="tooth-grid">
          {lowerTeeth.map((tooth) => (
            <div
              key={tooth.number}
              className={toothStatusClass(tooth.status, activeTooth === tooth.number)}
              onClick={() => handleClick(tooth)}
            >
              {tooth.number}
            </div>
          ))}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
          Arco Inferior (Mandibular)
        </p>
      </div>
    </div>
  );
};

export default Odontogram;
