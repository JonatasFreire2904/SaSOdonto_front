import { TimeSlot } from "@/api/atendimentoService";

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  isLoading?: boolean;
  showPeriodLabels?: boolean;
  className?: string;
}

interface GroupedSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
}

/**
 * Componente de seleção visual de horários
 * 
 * Características:
 * - Grid de horários organizados por período (manhã/tarde)
 * - Visual claro de disponível/ocupado
 * - Destaque do horário selecionado
 * - Loading skeleton
 */
const TimeSlotSelector = ({
  slots,
  selectedTime,
  onTimeSelect,
  isLoading = false,
  showPeriodLabels = true,
  className = "",
}: TimeSlotSelectorProps) => {
  // Agrupa slots por período
  const groupedSlots: GroupedSlots = slots.reduce(
    (acc, slot) => {
      const hour = parseInt(slot.time.split(":")[0], 10);
      if (hour < 12) {
        acc.morning.push(slot);
      } else {
        acc.afternoon.push(slot);
      }
      return acc;
    },
    { morning: [], afternoon: [] } as GroupedSlots
  );

  const availableCount = slots.filter((s) => s.available).length;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="material-symbols-outlined animate-spin text-lg">sync</span>
          Carregando horários...
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">
          event_busy
        </span>
        <p className="text-slate-500 dark:text-slate-400">
          Selecione uma data e profissional para ver os horários disponíveis
        </p>
      </div>
    );
  }

  const renderSlotGrid = (slotList: TimeSlot[], period: string) => {
    if (slotList.length === 0) return null;

    return (
      <div className="space-y-2">
        {showPeriodLabels && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400">
              {period === "morning" ? "wb_sunny" : "wb_twilight"}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {period === "morning" ? "Manhã" : "Tarde"}
            </span>
          </div>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {slotList.map((slot) => {
            const isSelected = slot.time === selectedTime;
            const isAvailable = slot.available;

            let buttonClasses = "flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-all border-2 ";

            if (isSelected) {
              buttonClasses += "bg-primary text-white border-primary shadow-md scale-105";
            } else if (isAvailable) {
              buttonClasses += "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-primary hover:text-primary cursor-pointer";
            } else {
              buttonClasses += "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-transparent cursor-not-allowed line-through";
            }

            return (
              <button
                key={slot.time}
                type="button"
                onClick={() => isAvailable && onTimeSelect(slot.time)}
                disabled={!isAvailable}
                className={buttonClasses}
                aria-label={`${slot.time} - ${isAvailable ? "Disponível" : "Ocupado"}`}
                aria-selected={isSelected}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com resumo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            {availableCount} disponíveis
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
            {slots.length - availableCount} ocupados
          </span>
        </div>
      </div>

      {/* Slots da manhã */}
      {renderSlotGrid(groupedSlots.morning, "morning")}

      {/* Divider */}
      {groupedSlots.morning.length > 0 && groupedSlots.afternoon.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700" />
      )}

      {/* Slots da tarde */}
      {renderSlotGrid(groupedSlots.afternoon, "afternoon")}

      {/* Mensagem se todos ocupados */}
      {availableCount === 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <span className="material-symbols-outlined text-amber-500">warning</span>
          <span className="text-sm text-amber-700 dark:text-amber-300">
            Todos os horários deste dia estão ocupados. Tente outra data.
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
