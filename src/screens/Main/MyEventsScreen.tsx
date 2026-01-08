import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, ActivityIndicator, Button, Badge, IconButton } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { supabase, Event } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

type TabKey = 'created' | 'participating' | 'requests' | 'history';

// Status de solicitação para exibição
type RequestStatus = 'pending' | 'accepted' | 'rejected';

interface ParticipationRequest {
    id: string;
    event_id: string;
    user_id: string;
    status: RequestStatus;
    created_at: string;
    updated_at: string;
    event: Event;
}

interface MyEventsScreenProps {
    navigation: any;
}

export const MyEventsScreen: React.FC<MyEventsScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const {
        badges,
        getEventBadge,
        markEventAsRead,
        markAsRead,
        getUnreadByType,
        unreadNotifications
    } = useNotifications();
    const [activeTab, setActiveTab] = useState<TabKey>('created');
    const [refreshing, setRefreshing] = useState(false);

    // ============================================
    // QUERIES
    // ============================================

    // Query: Eventos que criei (apenas futuros)
    const createdEventsQuery = useQuery({
        queryKey: ['my_events_created', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .gte('event_at', new Date().toISOString())
                .is('deleted_at', null)
                .order('event_at', { ascending: true });
            if (error) throw error;
            return data as Event[];
        },
        enabled: !!user?.id,
    });

    // Query: Solicitações pendentes para eventos que criei (para badges nos cards)
    const pendingRequestsByEventQuery = useQuery({
        queryKey: ['pending_requests_by_event', user?.id],
        queryFn: async () => {
            if (!user?.id) return {};

            // Primeiro buscar os IDs dos eventos que criei
            const { data: myEvents, error: eventsError } = await supabase
                .from('events')
                .select('id')
                .eq('creator_id', user.id)
                .gte('event_at', new Date().toISOString())
                .is('deleted_at', null);

            if (eventsError) throw eventsError;

            const eventIds = myEvents?.map(e => e.id) || [];
            if (eventIds.length === 0) return {};

            const { data, error } = await supabase
                .from('participation_requests')
                .select('event_id')
                .in('event_id', eventIds)
                .eq('status', 'pending');

            if (error) throw error;

            const counts: Record<string, number> = {};
            for (const req of data || []) {
                counts[req.event_id] = (counts[req.event_id] || 0) + 1;
            }

            console.log('📊 Pending requests by event:', counts);
            return counts;
        },
        enabled: !!user?.id,
    });

    // Query: Eventos que participo (apenas futuros)
    const participatingEventsQuery = useQuery({
        queryKey: ['my_events_participating', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('event_participants')
                .select('event:events(*)')
                .eq('user_id', user.id)
                .gte('events.event_at', new Date().toISOString());
            if (error) throw error;
            return (data?.map((d: any) => d.event).filter(Boolean) || []) as Event[];
        },
        enabled: !!user?.id,
    });

    // Query: TODAS as minhas solicitações (pending, accepted, rejected)
    // Exclui rejeitadas com mais de 7 dias
    const myRequestsQuery = useQuery({
        queryKey: ['my_requests_all', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('participation_requests')
                .select('*, event:events(*)')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Filtrar: manter pending, accepted, e rejected apenas se < 7 dias
            return (data || []).filter((req: ParticipationRequest) => {
                if (req.status === 'rejected') {
                    const updatedAt = new Date(req.updated_at);
                    return updatedAt > sevenDaysAgo;
                }
                return true;
            }) as ParticipationRequest[];
        },
        enabled: !!user?.id,
    });

    // Query: Histórico (eventos passados)
    const historyEventsQuery = useQuery({
        queryKey: ['my_events_history', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data: created } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .lt('event_at', new Date().toISOString())
                .is('deleted_at', null);

            const { data: participated } = await supabase
                .from('event_participants')
                .select('event:events(*)')
                .eq('user_id', user.id)
                .lt('events.event_at', new Date().toISOString());

            const allEvents = [
                ...(created || []),
                ...(participated?.map((d: any) => d.event).filter(Boolean) || []),
            ];

            const uniqueEvents = allEvents.reduce((acc: Event[], curr) => {
                if (!acc.find(e => e.id === curr.id)) acc.push(curr);
                return acc;
            }, []);

            return uniqueEvents.sort((a, b) =>
                new Date(b.event_at).getTime() - new Date(a.event_at).getTime()
            );
        },
        enabled: !!user?.id,
    });

    // ============================================
    // CALCULATED VALUES
    // ============================================

    // Total de solicitações pendentes para meus eventos (para badge do tab Criados)
    const totalPendingRequestsForMyEvents = useMemo(() => {
        const counts = pendingRequestsByEventQuery.data || {};
        return Object.values(counts).reduce((sum, count) => sum + count, 0);
    }, [pendingRequestsByEventQuery.data]);

    // Notificações não lidas para cada solicitação minha
    const getRequestNotification = useCallback((requestEventId: string) => {
        return unreadNotifications.find(
            n => n.event_id === requestEventId &&
                (n.type === 'request_accepted' || n.type === 'request_rejected')
        );
    }, [unreadNotifications]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            createdEventsQuery.refetch(),
            participatingEventsQuery.refetch(),
            myRequestsQuery.refetch(),
            historyEventsQuery.refetch(),
            pendingRequestsByEventQuery.refetch(),
        ]);
        setRefreshing(false);
    }, []);

    const getActiveData = (): any[] => {
        switch (activeTab) {
            case 'created':
                return createdEventsQuery.data || [];
            case 'participating':
                return participatingEventsQuery.data || [];
            case 'requests':
                return myRequestsQuery.data || [];
            case 'history':
                return historyEventsQuery.data || [];
            default:
                return [];
        }
    };

    const isLoading =
        createdEventsQuery.isLoading ||
        participatingEventsQuery.isLoading ||
        myRequestsQuery.isLoading ||
        historyEventsQuery.isLoading;

    // Navegar para detalhes do evento
    const handleEventPress = (eventId: string) => {
        markEventAsRead(eventId);
        navigation.navigate('EventDetails', { eventId });
    };

    // Handler para quando o usuário vê uma solicitação com resposta
    const handleRequestPress = (request: ParticipationRequest) => {
        // Marcar notificação como lida se existir
        const notification = getRequestNotification(request.event_id);
        if (notification) {
            markAsRead(notification.id);
        }
        // Navegar para detalhes do evento
        navigation.navigate('EventDetails', { eventId: request.event_id });
    };

    // ============================================
    // RENDER HELPERS
    // ============================================

    const getStatusConfig = (status: RequestStatus) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Aguardando',
                    icon: 'clock-outline',
                    color: '#f57c00',
                    bgColor: '#fff3e0',
                };
            case 'accepted':
                return {
                    label: 'Aceito',
                    icon: 'check-circle',
                    color: '#388e3c',
                    bgColor: '#e8f5e9',
                };
            case 'rejected':
                return {
                    label: 'Não aceito',
                    icon: 'close-circle',
                    color: '#d32f2f',
                    bgColor: '#ffebee',
                };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        // Para tab "requests", item é ParticipationRequest
        if (activeTab === 'requests') {
            return renderRequestItem(item as ParticipationRequest);
        }

        // Para outras tabs, item é Event
        return renderEventItem(item as Event);
    };

    const renderEventItem = (event: Event) => {
        if (!event) return null;

        const eventDate = new Date(event.event_at);
        const now = new Date();
        const isPast = eventDate < now;
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });

        const getEventStatus = () => {
            if (isPast) return { label: 'Encerrado', bgColor: '#f5f5f5' };
            const hoursUntil = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursUntil <= 24) return { label: 'Hoje/Amanhã', bgColor: '#fff3e0' };
            return null;
        };

        const status = getEventStatus();
        const pendingCount = activeTab === 'created'
            ? (pendingRequestsByEventQuery.data?.[event.id] || 0)
            : 0;

        // Verificar se há notificações não lidas para este evento (tab Participo)
        const hasUnreadNotif = activeTab === 'participating' && getEventBadge(event.id) > 0;

        return (
            <Card
                style={[styles.eventCard, isPast && styles.eventCardPast]}
                onPress={() => handleEventPress(event.id)}
            >
                <Card.Content>
                    <View style={styles.cardHeader}>
                        {/* Badge de solicitações pendentes (tab Criados) */}
                        {pendingCount > 0 && (
                            <View style={styles.eventBadge}>
                                <Badge size={20} style={styles.badgeNumber}>{pendingCount}</Badge>
                            </View>
                        )}

                        {/* Indicador de notificação não lida (tab Participo) */}
                        {hasUnreadNotif && (
                            <View style={styles.newIndicator} />
                        )}

                        <Text
                            variant="titleMedium"
                            style={[styles.eventTitle, (pendingCount > 0 || hasUnreadNotif) && { marginLeft: 12 }]}
                            numberOfLines={1}
                        >
                            {event.title}
                        </Text>

                        {activeTab === 'created' && (
                            <Chip compact style={styles.chipCreator}>Criador</Chip>
                        )}
                        {activeTab === 'participating' && status && (
                            <Chip compact style={{ backgroundColor: status.bgColor }}>
                                {status.label}
                            </Chip>
                        )}
                        {activeTab === 'history' && (
                            <Chip compact style={styles.chipEnded}>Encerrado</Chip>
                        )}
                    </View>

                    <Text variant="bodySmall" style={styles.eventInfo}>
                        📅 {formattedDate}
                    </Text>
                    <Text variant="bodySmall" style={styles.eventInfo}>
                        📍 {event.city}
                    </Text>

                    {activeTab === 'history' && (
                        <Button
                            mode="text"
                            compact
                            style={styles.manageButton}
                            icon="eye"
                            onPress={() => handleEventPress(event.id)}
                        >
                            Ver Detalhes
                        </Button>
                    )}
                </Card.Content>
            </Card>
        );
    };

    const renderRequestItem = (request: ParticipationRequest) => {
        const event = request.event;
        if (!event) return null;

        const statusConfig = getStatusConfig(request.status);
        const notification = getRequestNotification(request.event_id);
        const isNew = !!notification;

        const eventDate = new Date(event.event_at);
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <Card
                style={[styles.eventCard, isNew && styles.cardNew]}
                onPress={() => handleRequestPress(request)}
            >
                <Card.Content>
                    <View style={styles.cardHeader}>
                        {/* Indicador de "novo" */}
                        {isNew && (
                            <View style={styles.newIndicator} />
                        )}

                        <Text
                            variant="titleMedium"
                            style={[styles.eventTitle, isNew && { marginLeft: 12 }]}
                            numberOfLines={1}
                        >
                            {event.title}
                        </Text>

                        <Chip
                            compact
                            icon={statusConfig.icon}
                            style={{ backgroundColor: statusConfig.bgColor }}
                            textStyle={{ color: statusConfig.color }}
                        >
                            {statusConfig.label}
                        </Chip>
                    </View>

                    <Text variant="bodySmall" style={styles.eventInfo}>
                        📅 {formattedDate}
                    </Text>
                    <Text variant="bodySmall" style={styles.eventInfo}>
                        📍 {event.city}
                    </Text>

                    {/* Mensagem adicional para rejeitados */}
                    {request.status === 'rejected' && (
                        <Text variant="bodySmall" style={styles.rejectedInfo}>
                            Esta solicitação será removida em breve
                        </Text>
                    )}
                </Card.Content>
            </Card>
        );
    };

    // ============================================
    // TAB LABELS
    // ============================================

    const counts = {
        created: createdEventsQuery.data?.length || 0,
        participating: participatingEventsQuery.data?.length || 0,
        requests: myRequestsQuery.data?.length || 0,
        history: historyEventsQuery.data?.length || 0,
    };

    // Badge counts para tabs
    const tabBadges = {
        created: totalPendingRequestsForMyEvents,  // Solicitações pendentes para revisar
        participating: badges.participo,            // Notificações de alterações
        requests: badges.solicitacoes,              // Respostas às minhas solicitações
    };

    const getTabLabel = (tab: TabKey, baseLabel: string, count: number, badgeCount: number) => {
        if (badgeCount > 0) {
            return `🔴 ${baseLabel} (${count})`;
        }
        return `${baseLabel} (${count})`;
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <View style={styles.container}>
            {/* Segmented Tabs */}
            <View style={styles.tabsContainer}>
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as TabKey)}
                    buttons={[
                        {
                            value: 'created',
                            label: getTabLabel('created', 'Criados', counts.created, tabBadges.created),
                        },
                        {
                            value: 'participating',
                            label: getTabLabel('participating', 'Participo', counts.participating, tabBadges.participating),
                        },
                    ]}
                    style={styles.segmented}
                />
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as TabKey)}
                    buttons={[
                        {
                            value: 'requests',
                            label: getTabLabel('requests', 'Solicitações', counts.requests, tabBadges.requests),
                        },
                        { value: 'history', label: 'Histórico' },
                    ]}
                    style={styles.segmented}
                />
            </View>

            {/* Loading */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            {/* Lista */}
            {!isLoading && (
                <FlatList
                    data={getActiveData()}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'created' && 'Você ainda não criou nenhum evento'}
                                {activeTab === 'participating' && 'Você não está participando de nenhum evento'}
                                {activeTab === 'requests' && 'Nenhuma solicitação enviada'}
                                {activeTab === 'history' && 'Nenhum evento no histórico'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    tabsContainer: {
        padding: 12,
        gap: 8,
        backgroundColor: '#fff',
    },
    segmented: {
        marginBottom: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 12,
    },
    eventCard: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    eventCardPast: {
        opacity: 0.6,
    },
    cardNew: {
        borderLeftWidth: 3,
        borderLeftColor: '#6200ee',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTitle: {
        fontWeight: 'bold',
        flex: 1,
    },
    chipCreator: {
        backgroundColor: '#e3f2fd',
        marginLeft: 8,
    },
    chipEnded: {
        backgroundColor: '#f5f5f5',
        marginLeft: 8,
    },
    eventInfo: {
        color: '#666',
        marginBottom: 2,
    },
    rejectedInfo: {
        color: '#d32f2f',
        fontStyle: 'italic',
        marginTop: 8,
    },
    manageButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#666',
        textAlign: 'center',
    },
    eventBadge: {
        position: 'absolute',
        top: -8,
        left: -8,
        zIndex: 1,
    },
    badgeNumber: {
        backgroundColor: '#f44336',
        color: '#fff',
    },
    newIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6200ee',
        marginRight: 4,
    },
});
