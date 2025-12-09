import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase, ParticipationRequest } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useParticipation = () => {
  const { user } = useAuth();

  // Buscar solicitações de participação para um evento
  const fetchParticipationRequests = async (eventId: string) => {
    const { data, error } = await supabase
      .from('participation_requests')
      .select(`
        *,
        user:user_id(id, name, username, avatar_url)
      `)
      .eq('event_id', eventId)
      .eq('status', 'pending');

    if (error) throw error;
    return data || [];
  };

  const participationRequestsQuery = (eventId: string) =>
    useQuery({
      queryKey: ['participation_requests', eventId],
      queryFn: () => fetchParticipationRequests(eventId),
    });

  // Buscar participantes de um evento
  const fetchEventParticipants = async (eventId: string) => {
    const { data, error } = await supabase
      .from('event_participants')
      .select(`
        *,
        user:user_id(id, name, username, avatar_url)
      `)
      .eq('event_id', eventId);

    if (error) throw error;
    return data || [];
  };

  const eventParticipantsQuery = (eventId: string) =>
    useQuery({
      queryKey: ['event_participants', eventId],
      queryFn: () => fetchEventParticipants(eventId),
    });

  // Verificar se usuário já participou
  const checkUserParticipation = async (eventId: string, userId: string) => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  };

  // Solicitar participação
  const requestParticipationMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('participation_requests')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Aceitar solicitação
  const acceptRequestMutation = useMutation({
    mutationFn: async ({ requestId, eventId, userId }: { requestId: string; eventId: string; userId: string }) => {
      // Atualizar status da solicitação
      const { error: updateError } = await supabase
        .from('participation_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Adicionar participante
      const { error: insertError } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      if (insertError) throw insertError;
    },
  });

  // Rejeitar solicitação
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('participation_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
    },
  });

  // Sair de um evento
  const leaveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });

  return {
    participationRequestsQuery,
    eventParticipantsQuery,
    checkUserParticipation,
    requestParticipation: requestParticipationMutation.mutate,
    requestParticipationLoading: requestParticipationMutation.isPending,
    acceptRequest: acceptRequestMutation.mutate,
    acceptRequestLoading: acceptRequestMutation.isPending,
    rejectRequest: rejectRequestMutation.mutate,
    rejectRequestLoading: rejectRequestMutation.isPending,
    leaveEvent: leaveEventMutation.mutate,
    leaveEventLoading: leaveEventMutation.isPending,
  };
};
