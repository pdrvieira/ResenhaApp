import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useUserStats = () => {
    const { user } = useAuth();

    // Buscar contagem de eventos criados pelo usuário
    const eventsCreatedQuery = useQuery({
        queryKey: ['user_events_created', user?.id],
        queryFn: async () => {
            if (!user) return 0;

            const { count, error } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true })
                .eq('creator_id', user.id)
                .is('deleted_at', null);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!user,
    });

    // Buscar contagem de participações
    const participationsQuery = useQuery({
        queryKey: ['user_participations', user?.id],
        queryFn: async () => {
            if (!user) return 0;

            const { count, error } = await supabase
                .from('event_participants')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (error) throw error;
            return count || 0;
        },
        enabled: !!user,
    });

    // Buscar eventos criados pelo usuário (lista)
    const myEventsQuery = useQuery({
        queryKey: ['my_events', user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .is('deleted_at', null)
                .order('event_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
    });

    return {
        eventsCreatedCount: eventsCreatedQuery.data ?? 0,
        eventsCreatedLoading: eventsCreatedQuery.isLoading,
        participationsCount: participationsQuery.data ?? 0,
        participationsLoading: participationsQuery.isLoading,
        myEvents: myEventsQuery.data ?? [],
        myEventsLoading: myEventsQuery.isLoading,
        refetchStats: () => {
            eventsCreatedQuery.refetch();
            participationsQuery.refetch();
            myEventsQuery.refetch();
        },
    };
};
