import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert, FlatList, Share } from 'react-native';
import { Text, Card, Button, Divider, Avatar, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Event } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useEventInvite } from '../../hooks/useEventInvite';

interface ManageEventScreenProps {
    navigation: any;
    route: any;
}

interface ParticipationRequest {
    id: string;
    user_id: string;
    status: string;
    created_at: string;
    user?: {
        id: string;
        name: string;
        username: string;
        avatar_url?: string;
    };
}

interface Participant {
    id: string;
    user_id: string;
    user?: {
        id: string;
        name: string;
        username: string;
        avatar_url?: string;
    };
}

export const ManageEventScreen: React.FC<ManageEventScreenProps> = ({ navigation, route }) => {
    const { eventId, eventTitle } = route.params;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [sharingInvite, setSharingInvite] = useState(false);
    const { getOrCreateInvite, generateShareLink, loading: inviteLoading } = useEventInvite();

    // Query: Dados do evento
    const eventQuery = useQuery({
        queryKey: ['event', eventId],
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

    // Query: Participantes confirmados
    const participantsQuery = useQuery({
        queryKey: ['event_participants', eventId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('event_participants')
                .select('*, user:users(*)')
                .eq('event_id', eventId);
            if (error) throw error;
            return data as Participant[];
        },
    });

    // Query: Solicitações pendentes
    const requestsQuery = useQuery({
        queryKey: ['participation_requests', eventId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('participation_requests')
                .select('*, user:users(*)')
                .eq('event_id', eventId)
                .eq('status', 'pending')
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data as ParticipationRequest[];
        },
    });

    // Mutation: Aceitar solicitação
    const acceptMutation = useMutation({
        mutationFn: async (requestId: string) => {
            const request = requestsQuery.data?.find(r => r.id === requestId);
            if (!request) throw new Error('Solicitação não encontrada');

            // Atualizar status da solicitação
            const { error: updateError } = await supabase
                .from('participation_requests')
                .update({ status: 'accepted' })
                .eq('id', requestId);
            if (updateError) throw updateError;

            // Adicionar como participante
            const { error: insertError } = await supabase
                .from('event_participants')
                .insert({ event_id: eventId, user_id: request.user_id });
            if (insertError) throw insertError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participation_requests', eventId] });
            queryClient.invalidateQueries({ queryKey: ['event_participants', eventId] });
        },
        onError: (error: any) => {
            Alert.alert('Erro', error.message || 'Não foi possível aceitar a solicitação');
        },
    });

    // Mutation: Rejeitar solicitação
    const rejectMutation = useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await supabase
                .from('participation_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participation_requests', eventId] });
        },
        onError: (error: any) => {
            Alert.alert('Erro', error.message || 'Não foi possível rejeitar a solicitação');
        },
    });

    // Mutation: Cancelar evento
    const cancelEventMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('events')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', eventId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my_events_created'] });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            Alert.alert('Evento Cancelado', 'O evento foi cancelado com sucesso.');
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert('Erro', error.message || 'Não foi possível cancelar o evento');
        },
    });

    // Refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            eventQuery.refetch(),
            participantsQuery.refetch(),
            requestsQuery.refetch(),
        ]);
        setRefreshing(false);
    };

    // Confirmar cancelamento
    const handleCancelEvent = () => {
        Alert.alert(
            'Cancelar Evento',
            'Tem certeza que deseja cancelar este evento? Esta ação não pode ser desfeita.',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim, Cancelar',
                    style: 'destructive',
                    onPress: () => cancelEventMutation.mutate(),
                },
            ]
        );
    };

    // Confirmar aceitação
    const handleAccept = (requestId: string, userName: string) => {
        Alert.alert(
            'Aceitar Participante',
            `Aceitar ${userName} no evento?`,
            [
                { text: 'Não', style: 'cancel' },
                { text: 'Aceitar', onPress: () => acceptMutation.mutate(requestId) },
            ]
        );
    };

    // Confirmar rejeição
    const handleReject = (requestId: string, userName: string) => {
        Alert.alert(
            'Recusar Participante',
            `Recusar ${userName}?`,
            [
                { text: 'Não', style: 'cancel' },
                { text: 'Recusar', style: 'destructive', onPress: () => rejectMutation.mutate(requestId) },
            ]
        );
    };

    // Editar evento
    const handleEditEvent = () => {
        navigation.navigate('EditEvent', { eventId });
    };

    // Loading
    if (eventQuery.isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const event = eventQuery.data;
    const participants = participantsQuery.data || [];
    const requests = requestsQuery.data || [];

    if (!event) {
        return (
            <View style={styles.errorContainer}>
                <Text>Evento não encontrado</Text>
            </View>
        );
    }

    const eventDate = new Date(event.event_at);
    const isPast = eventDate < new Date();
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    const spotsText = event.max_participants
        ? `${participants.length}/${event.max_participants} vagas`
        : `${participants.length} participantes`;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
            {/* Banner de evento encerrado */}
            {isPast && (
                <Card style={styles.endedCard}>
                    <Card.Content>
                        <Text style={styles.endedTitle}>⏰ Evento Encerrado</Text>
                        <Text style={styles.endedText}>
                            Este evento já aconteceu. Você pode visualizar os detalhes, mas não é possível editá-lo.
                        </Text>
                    </Card.Content>
                </Card>
            )}

            {/* Resumo do Evento */}
            <Card style={[styles.summaryCard, isPast && styles.summaryCardPast]}>
                <Card.Content>
                    <Text variant="titleLarge" style={styles.eventTitle}>
                        {event.title}
                    </Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>📅</Text>
                        <Text style={styles.infoValue}>{formattedDate}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>📍</Text>
                        <Text style={styles.infoValue}>{event.address}, {event.city}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>👥</Text>
                        <Text style={styles.infoValue}>{spotsText}</Text>
                    </View>

                    {!isPast && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>⏳</Text>
                            <Text style={styles.infoValue}>{requests.length} solicitação(ões) pendente(s)</Text>
                        </View>
                    )}

                    <View style={styles.tagsRow}>
                        <Chip compact style={styles.chip}>
                            {event.entry_type === 'free' && '🆓 Gratuito'}
                            {event.entry_type === 'paid' && `💰 R$ ${event.entry_price?.toFixed(2).replace('.', ',')}`}
                            {event.entry_type === 'bring' && '🎒 Traga algo'}
                        </Chip>
                        <Chip compact style={styles.chip}>
                            {event.audience === 'everyone' && '👥 Aberto'}
                            {event.audience === 'adults_only' && '🔞 +18'}
                            {event.audience === 'invite_only' && '🔒 Convite'}
                        </Chip>
                        {isPast && (
                            <Chip compact style={styles.chipEnded}>Encerrado</Chip>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {/* Ações - só mostra se evento não passou */}
            {!isPast && (
                <View style={styles.actionsRow}>
                    <Button
                        mode="outlined"
                        icon="pencil"
                        onPress={handleEditEvent}
                        style={styles.actionButton}
                    >
                        Editar
                    </Button>
                    <Button
                        mode="outlined"
                        icon="cancel"
                        onPress={handleCancelEvent}
                        style={styles.actionButton}
                        textColor="#d32f2f"
                        loading={cancelEventMutation.isPending}
                    >
                        Cancelar Evento
                    </Button>
                </View>
            )}

            {/* Compartilhar convite - só para eventos privados */}
            {!isPast && event.audience === 'invite_only' && (
                <Card style={styles.inviteCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.inviteTitle}>🔗 Convite Privado</Text>
                        <Text style={styles.inviteDescription}>
                            Este é um evento privado. Compartilhe o link de convite para permitir que outros participem.
                        </Text>
                        <Button
                            mode="contained"
                            icon="share-variant"
                            onPress={async () => {
                                setSharingInvite(true);
                                try {
                                    const invite = await getOrCreateInvite(eventId);
                                    if (invite) {
                                        const link = generateShareLink(invite.invite_code);
                                        await Share.share({
                                            message: `🎉 Você foi convidado para ${event.title}!\n\nUse o código ${invite.invite_code} ou clique no link:\n${link}`,
                                            title: `Convite: ${event.title}`,
                                        });
                                    }
                                } catch (error) {
                                    Alert.alert('Erro', 'Não foi possível gerar o convite');
                                } finally {
                                    setSharingInvite(false);
                                }
                            }}
                            loading={sharingInvite || inviteLoading}
                            style={styles.shareButton}
                        >
                            Compartilhar Convite
                        </Button>
                    </Card.Content>
                </Card>
            )}

            <Divider style={styles.divider} />

            {/* Participantes Confirmados */}
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    👥 Participantes ({participants.length})
                </Text>

                {participants.length === 0 ? (
                    <Text style={styles.emptyText}>Nenhum participante ainda</Text>
                ) : (
                    participants.map((participant) => (
                        <Card key={participant.id} style={styles.userCard}>
                            <Card.Content style={styles.userCardContent}>
                                {participant.user?.avatar_url ? (
                                    <Avatar.Image size={40} source={{ uri: participant.user.avatar_url }} />
                                ) : (
                                    <Avatar.Text size={40} label={participant.user?.name?.charAt(0) || '?'} />
                                )}
                                <View style={styles.userInfo}>
                                    <Text variant="bodyMedium">{participant.user?.name || 'Usuário'}</Text>
                                    <Text variant="bodySmall" style={styles.username}>
                                        @{participant.user?.username || 'username'}
                                    </Text>
                                </View>
                                <Chip compact style={styles.chipConfirmed}>Confirmado</Chip>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </View>

            <Divider style={styles.divider} />

            {/* Solicitações Pendentes */}
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    ⏳ Solicitações Pendentes ({requests.length})
                </Text>

                {requests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>Nenhuma solicitação pendente</Text>
                        <Text style={styles.emptySubtitle}>
                            Quando alguém solicitar participação, aparecerá aqui.
                        </Text>
                    </View>
                ) : (
                    requests.map((request) => (
                        <Card key={request.id} style={styles.requestCard}>
                            <Card.Content style={styles.userCardContent}>
                                {request.user?.avatar_url ? (
                                    <Avatar.Image size={40} source={{ uri: request.user.avatar_url }} />
                                ) : (
                                    <Avatar.Text size={40} label={request.user?.name?.charAt(0) || '?'} />
                                )}
                                <View style={styles.userInfo}>
                                    <Text variant="bodyMedium">{request.user?.name || 'Usuário'}</Text>
                                    <Text variant="bodySmall" style={styles.username}>
                                        @{request.user?.username || 'username'}
                                    </Text>
                                </View>
                                <View style={styles.requestActions}>
                                    <IconButton
                                        icon="check"
                                        mode="contained"
                                        containerColor="#4caf50"
                                        iconColor="#fff"
                                        size={20}
                                        onPress={() => handleAccept(request.id, request.user?.name || 'Usuário')}
                                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                                    />
                                    <IconButton
                                        icon="close"
                                        mode="contained"
                                        containerColor="#f44336"
                                        iconColor="#fff"
                                        size={20}
                                        onPress={() => handleReject(request.id, request.user?.name || 'Usuário')}
                                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                                    />
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </View>

            <View style={styles.bottomPadding} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        margin: 16,
        marginBottom: 8,
    },
    eventTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 16,
        marginRight: 8,
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    chip: {
        backgroundColor: '#f0f0f0',
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
    },
    divider: {
        marginVertical: 16,
        marginHorizontal: 16,
    },
    section: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    userCard: {
        marginBottom: 8,
    },
    requestCard: {
        marginBottom: 8,
        backgroundColor: '#fff8e1',
    },
    userCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        color: '#666',
    },
    chipConfirmed: {
        backgroundColor: '#e8f5e9',
    },
    requestActions: {
        flexDirection: 'row',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    emptyText: {
        color: '#666',
        fontStyle: 'italic',
    },
    bottomPadding: {
        height: 40,
    },
    endedCard: {
        backgroundColor: '#f5f5f5',
        margin: 16,
        marginBottom: 0,
        borderLeftWidth: 4,
        borderLeftColor: '#9e9e9e',
    },
    endedTitle: {
        fontWeight: 'bold',
        color: '#616161',
        marginBottom: 4,
    },
    endedText: {
        color: '#757575',
        fontSize: 14,
    },
    summaryCardPast: {
        opacity: 0.7,
    },
    chipEnded: {
        backgroundColor: '#e0e0e0',
    },
    inviteCard: {
        margin: 16,
        marginTop: 8,
        backgroundColor: '#f3e5f5',
        borderLeftWidth: 4,
        borderLeftColor: '#9c27b0',
    },
    inviteTitle: {
        fontWeight: 'bold',
        color: '#7b1fa2',
        marginBottom: 8,
    },
    inviteDescription: {
        color: '#6a1b9a',
        fontSize: 14,
        marginBottom: 12,
    },
    shareButton: {
        backgroundColor: '#9c27b0',
    },
});
