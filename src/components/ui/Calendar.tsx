import { useMemo } from "react";

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  highlightedDates?: string[];
  className?: string;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

/**
 * Componente de calendário visual interativo
 * 
 * Características:
 * - Navegação entre meses
 * - Destaque do dia selecionado
 * - Destaque de dias com eventos
 * - Desabilita datas passadas por padrão
 */
const Calendar = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  highlightedDates = [],
  className = "",
}: CalendarProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Parse selected date para navegação
  const [displayYear, displayMonth] = useMemo(() => {
    const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return [d.getFullYear(), d.getMonth()];
  }, [selectedDate]);

  // Set de datas destacadas para lookup rápido
  const highlightedSet = useMemo(() => new Set(highlightedDates), [highlightedDates]);

  // Gera dias do mês
  const calendarDays = useMemo(() => {
    const firstDay = new Date(displayYear, displayMonth, 1);
    const lastDay = new Date(displayYear, displayMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isHighlighted: boolean;
      isDisabled: boolean;
    }> = [];

    // Dias do mês anterior para preencher a primeira semana
    const prevMonth = new Date(displayYear, displayMonth, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(displayYear, displayMonth - 1, day);
      const dateStr = date.toISOString().split("T")[0];
      
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        isHighlighted: highlightedSet.has(dateStr),
        isDisabled: true, // Sempre desabilitar dias do mês anterior
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(displayYear, displayMonth, day);
      const dateStr = date.toISOString().split("T")[0];
      
      const isPast = date < today;
      const isBeforeMin = minDate ? dateStr < minDate : false;
      const isAfterMax = maxDate ? dateStr > maxDate : false;

      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        isHighlighted: highlightedSet.has(dateStr),
        isDisabled: isPast || isBeforeMin || isAfterMax,
      });
    }

    // Dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(displayYear, displayMonth + 1, day);
      const dateStr = date.toISOString().split("T")[0];
      
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDate,
        isHighlighted: highlightedSet.has(dateStr),
        isDisabled: true, // Sempre desabilitar dias do próximo mês
      });
    }

    return days;
  }, [displayYear, displayMonth, selectedDate, todayStr, highlightedSet, minDate, maxDate]);

  // Navegação de mês
  const goToPrevMonth = () => {
    const newDate = new Date(displayYear, displayMonth - 1, 1);
    onDateSelect(newDate.toISOString().split("T")[0]);
  };

  const goToNextMonth = () => {
    const newDate = new Date(displayYear, displayMonth + 1, 1);
    onDateSelect(newDate.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    onDateSelect(todayStr);
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Mês anterior"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
            chevron_left
          </span>
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {MONTHS[displayMonth]} {displayYear}
          </h3>
          <button
            type="button"
            onClick={goToToday}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
          >
            Hoje
          </button>
        </div>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Próximo mês"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
            chevron_right
          </span>
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const baseClasses = "relative w-full aspect-square flex items-center justify-center text-sm rounded-lg transition-all";
          
          let stateClasses = "";
          
          if (dayInfo.isDisabled) {
            stateClasses = "text-slate-300 dark:text-slate-600 cursor-not-allowed";
          } else if (dayInfo.isSelected) {
            stateClasses = "bg-primary text-white font-semibold shadow-md";
          } else if (dayInfo.isToday) {
            stateClasses = "bg-primary/10 text-primary font-semibold hover:bg-primary/20 cursor-pointer";
          } else if (dayInfo.isCurrentMonth) {
            stateClasses = "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer";
          } else {
            stateClasses = "text-slate-300 dark:text-slate-600";
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => !dayInfo.isDisabled && onDateSelect(dayInfo.date)}
              disabled={dayInfo.isDisabled}
              className={`${baseClasses} ${stateClasses}`}
              aria-label={`${dayInfo.day} de ${MONTHS[displayMonth]}`}
              aria-selected={dayInfo.isSelected}
            >
              {dayInfo.day}
              
              {/* Indicador de eventos/agendamentos */}
              {dayInfo.isHighlighted && !dayInfo.isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
