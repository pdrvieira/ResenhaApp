import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, Event } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useEvents = () => {
  const { user } = useAuth();

  // Buscar todos os eventos
  const fetchEvents = async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .is('deleted_at', null)
      .order('event_at', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  // Buscar evento por ID
  const fetchEventById = async (eventId: string): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  };

  const eventByIdQuery = (eventId: string) =>
    useQuery({
      queryKey: ['event', eventId],
      queryFn: () => fetchEventById(eventId),
    });

  // Criar evento
  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id' | 'creator_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      eventsQuery.refetch();
    },
  });

  // Atualizar evento
  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: Partial<Event> }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      eventsQuery.refetch();
    },
  });

  // Deletar evento (soft delete)
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      eventsQuery.refetch();
    },
  });

  return {
    events: eventsQuery.data || [],
    eventsLoading: eventsQuery.isLoading,
    eventsError: eventsQuery.error,
    eventsQuery, // Expor query completa para refetch
    eventByIdQuery,
    createEvent: createEventMutation.mutate,
    createEventLoading: createEventMutation.isPending,
    updateEvent: updateEventMutation.mutate,
    updateEventLoading: updateEventMutation.isPending,
    deleteEvent: deleteEventMutation.mutate,
    deleteEventLoading: deleteEventMutation.isPending,
  };
};
