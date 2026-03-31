import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import { atendimentoService, TimeSlot, AvailabilityResponse } from "@/api/atendimentoService";

interface UseAppointmentAvailabilityOptions {
  professionalId?: string;
  initialDate?: string;
}

/**
 * Hook para gerenciar disponibilidade de agendamentos
 * 
 * Responsabilidades:
 * - Gerenciar data selecionada
 * - Buscar slots disponíveis
 * - Gerenciar horário selecionado
 * - Fornecer helpers para validação
 */
export const useAppointmentAvailability = (options: UseAppointmentAvailabilityOptions = {}) => {
  const today = new Date().toISOString().split("T")[0];
  
  const [selectedDate, setSelectedDate] = useState<string>(options.initialDate || today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [professionalId, setProfessionalId] = useState<string | undefined>(options.professionalId);

  // Query para buscar disponibilidade
  const availabilityQuery = useQuery<AvailabilityResponse>({
    queryKey: ["appointment-availability", selectedDate, professionalId],
    queryFn: () => atendimentoService.getAvailability({
      date: selectedDate,
      professionalId: professionalId!,
    }),
    enabled: !!selectedDate && !!professionalId,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
  });

  // Slots separados por período
  const groupedSlots = useMemo(() => {
    const slots = availabilityQuery.data?.slots || [];
    
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.time.split(":")[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    });

    return { morning, afternoon };
  }, [availabilityQuery.data?.slots]);

  // Contagem de slots
  const slotStats = useMemo(() => {
    const slots = availabilityQuery.data?.slots || [];
    const available = slots.filter((s) => s.available).length;
    const occupied = slots.filter((s) => !s.available).length;
    return { available, occupied, total: slots.length };
  }, [availabilityQuery.data?.slots]);

  // Validar se horário está disponível
  const isTimeAvailable = useCallback(
    (time: string): boolean => {
      const slots = availabilityQuery.data?.slots || [];
      const slot = slots.find((s) => s.time === time);
      return slot?.available ?? false;
    },
    [availabilityQuery.data?.slots]
  );

  // Handler para mudança de data
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  }, []);

  // Handler para mudança de profissional
  const handleProfessionalChange = useCallback((id: string) => {
    setProfessionalId(id);
    setSelectedTime(null); // Reset time when professional changes
  }, []);

  // Handler para seleção de horário
  const handleTimeSelect = useCallback(
    (time: string) => {
      if (isTimeAvailable(time)) {
        setSelectedTime(time);
      }
    },
    [isTimeAvailable]
  );

  // Combina data e hora em ISO string
  const scheduledAt = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    return new Date(`${selectedDate}T${selectedTime}`).toISOString();
  }, [selectedDate, selectedTime]);

  // Verifica se seleção está completa e válida
  const isSelectionValid = useMemo(() => {
    return !!selectedDate && !!selectedTime && !!professionalId && isTimeAvailable(selectedTime);
  }, [selectedDate, selectedTime, professionalId, isTimeAvailable]);

  return {
    // State
    selectedDate,
    selectedTime,
    professionalId,
    scheduledAt,
    
    // Handlers
    setSelectedDate: handleDateChange,
    setSelectedTime: handleTimeSelect,
    setProfessionalId: handleProfessionalChange,
    
    // Data
    slots: availabilityQuery.data?.slots || [],
    groupedSlots,
    slotStats,
    
    // Query state
    isLoading: availabilityQuery.isLoading,
    isError: availabilityQuery.isError,
    error: availabilityQuery.error,
    refetch: availabilityQuery.refetch,
    
    // Validation
    isTimeAvailable,
    isSelectionValid,
  };
};

export type UseAppointmentAvailabilityReturn = ReturnType<typeof useAppointmentAvailability>;
