import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, Event } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    getEditableFields,
    getChangedFields,
    validateMaxParticipants,
    formatFieldValue,
    FIELD_LABELS,
} from '../utils/editValidation';

interface UseEditEventProps {
    eventId: string;
}

export const useEditEvent = ({ eventId }: UseEditEventProps) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Query: Dados do evento
    const eventQuery = useQuery({
        queryKey: ['event_edit', eventId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', eventId)
                .single();
            if (error) throw error;
            return data as Event;
        },
    });

    // Query: Contagem de participantes
    const participantsCountQuery = useQuery({
        queryKey: ['event_participants_count', eventId],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('event_participants')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', eventId);
            if (error) throw error;
            return count || 0;
        },
    });

    // Query: IDs dos participantes (para notificação)
    const participantsQuery = useQuery({
        queryKey: ['event_participants_ids', eventId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('event_participants')
                .select('user_id')
                .eq('event_id', eventId);
            if (error) throw error;
            return data?.map(p => p.user_id) || [];
        },
    });

    // Campos editáveis
    const editableFields = eventQuery.data && participantsCountQuery.data !== undefined
        ? getEditableFields(eventQuery.data, participantsCountQuery.data)
        : null;

    // Mutation: Salvar alterações
    const updateEventMutation = useMutation({
        mutationFn: async (updates: Partial<Event>) => {
            if (!eventQuery.data || !user) throw new Error('Dados não carregados');

            const originalEvent = eventQuery.data;
            const participantsCount = participantsCountQuery.data || 0;
            const participantIds = participantsQuery.data || [];

            // Validar max_participants
            if (updates.max_participants !== undefined) {
                const validation = validateMaxParticipants(updates.max_participants, participantsCount);
                if (!validation.allowed) {
                    throw new Error(validation.reason);
                }
            }

            // Detectar alterações
            const changes = getChangedFields(originalEvent, updates);

            if (changes.length === 0) {
                throw new Error('Nenhuma alteração detectada');
            }

            // Atualizar evento
            const { error: updateError } = await supabase
                .from('events')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', eventId);

            if (updateError) throw updateError;

            // Registrar alterações no log
            for (const change of changes) {
                await supabase.from('event_changes').insert({
                    event_id: eventId,
                    changed_by: user.id,
                    field_name: change.field,
                    old_value: String(change.oldValue ?? ''),
                    new_value: String(change.newValue ?? ''),
                });
            }

            // Notificar participantes (se houver)
            if (participantIds.length > 0) {
                const changesDescription = changes.map(c =>
                    `${FIELD_LABELS[c.field] || c.field}: ${formatFieldValue(c.field, c.oldValue)} → ${formatFieldValue(c.field, c.newValue)}`
                ).join('\n');

                for (const participantId of participantIds) {
                    await supabase.from('notifications').insert({
                        recipient_id: participantId,
                        type: 'event_updated',
                        event_id: eventId,
                        payload: {
                            event_title: originalEvent.title,
                            changes: changes.map(c => ({
                                field: c.field,
                                field_label: FIELD_LABELS[c.field] || c.field,
                                old_value: formatFieldValue(c.field, c.oldValue),
                                new_value: formatFieldValue(c.field, c.newValue),
                            })),
                            changed_by: user.id,
                        },
                    });
                }
            }

            return { changesCount: changes.length, notifiedCount: participantIds.length };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['event_edit', eventId] });
            queryClient.invalidateQueries({ queryKey: ['event', eventId] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['my_events_created'] });
        },
    });

    return {
        event: eventQuery.data,
        loading: eventQuery.isLoading || participantsCountQuery.isLoading,
        error: eventQuery.error || participantsCountQuery.error,
        participantsCount: participantsCountQuery.data || 0,
        editableFields,
        updateEvent: updateEventMutation.mutateAsync,
        isUpdating: updateEventMutation.isPending,
        updateError: updateEventMutation.error,
    };
};
