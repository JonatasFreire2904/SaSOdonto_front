import { TimeSlot } from "@/api/atendimentoService";
import { useMemo } from "react";

interface TimeRangeSelectorProps {
  slots: TimeSlot[];
  startTime: string | null;
  endTime: string | null;
  onStartTimeSelect: (time: string) => void;
  onEndTimeSelect: (time: string) => void;
  isLoading?: boolean;
  showPeriodLabels?: boolean;
}

interface GroupedSlots {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
}

/**
 * Seletor de range de horário (início + fim)
 * Útil para visualizar periodo completo do atendimento
 */
const TimeRangeSelector = ({
  slots,
  startTime,
  endTime,
  onStartTimeSelect,
  onEndTimeSelect,
  isLoading = false,
  showPeriodLabels = true,
}: TimeRangeSelectorProps) => {
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

  // Calcula quais horários estão dentro do range selecionado
  const selectedRange = useMemo(() => {
    if (!startTime || !endTime) return [];
    const start = parseInt(startTime.replace(":", ""), 10);
    const end = parseInt(endTime.replace(":", ""), 10);
    if (start >= end) return [];
    return slots
      .filter((s) => {
        const time = parseInt(s.time.replace(":", ""), 10);
        return time >= start && time < end;
      })
      .map((s) => s.time);
  }, [startTime, endTime, slots]);

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      <div className="flex flex-col items-center justify-center py-8 text-center">
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
            const isStart = slot.time === startTime;
            const isEnd = slot.time === endTime;
            const isInRange = selectedRange.includes(slot.time);
            const isAvailable = slot.available;

            let buttonClasses =
              "flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-all border-2 ";

            if (isStart || isEnd) {
              buttonClasses +=
                "bg-primary text-white border-primary shadow-md scale-105";
            } else if (isInRange) {
              buttonClasses +=
                "bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30";
            } else if (isAvailable) {
              buttonClasses +=
                "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-primary hover:text-primary cursor-pointer";
            } else {
              buttonClasses +=
                "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border-transparent cursor-not-allowed line-through opacity-50";
            }

            return (
              <button
                key={slot.time}
                type="button"
                onClick={() => {
                  if (!isAvailable) return;
                  if (!startTime) {
                    onStartTimeSelect(slot.time);
                  } else if (!endTime) {
                    const start = parseInt(startTime.replace(":", ""), 10);
                    const current = parseInt(slot.time.replace(":", ""), 10);
                    if (current > start) {
                      onEndTimeSelect(slot.time);
                    } else {
                      onStartTimeSelect(slot.time);
                      onEndTimeSelect("");
                    }
                  } else {
                    onStartTimeSelect(slot.time);
                    onEndTimeSelect("");
                  }
                }}
                disabled={!isAvailable}
                className={buttonClasses}
                title={
                  isStart
                    ? "Horário de início"
                    : isEnd
                      ? "Horário de fim"
                      : isAvailable
                        ? "Clique para definir"
                        : "Indisponível"
                }
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
    <div className="space-y-4">
      {/* Header com resumo */}
      <div className="space-y-2">
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

        {startTime && endTime && (
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium text-primary">
              Período selecionado: {startTime} - {endTime}
            </p>
            <p className="text-xs text-primary/70 mt-1">
              Clique em um horário para alterar início ou fim
            </p>
          </div>
        )}

        {startTime && !endTime && (
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-700">
              Início: {startTime}
            </p>
            <p className="text-xs text-amber-700/70 mt-1">
              Clique em um horário posterior para definir fim
            </p>
          </div>
        )}
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
          <span className="material-symbols-outlined text-amber-500">
            warning
          </span>
          <span className="text-sm text-amber-700 dark:text-amber-300">
            Todos os horários deste dia estão ocupados. Tente outra data.
          </span>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
