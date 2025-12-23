import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, ActivityIndicator, Avatar, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { supabase, Event } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

type TabKey = 'created' | 'participating' | 'pending' | 'history';

interface MyEventsScreenProps {
    navigation: any;
}

export const MyEventsScreen: React.FC<MyEventsScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>('created');
    const [refreshing, setRefreshing] = useState(false);

    // Query: Eventos que criei
    const createdEventsQuery = useQuery({
        queryKey: ['my_events_created', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .is('deleted_at', null)
                .order('event_at', { ascending: true });
            if (error) throw error;
            return data as Event[];
        },
        enabled: !!user?.id,
    });

    // Query: Eventos que participo
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

    // Query: Solicitações pendentes
    const pendingRequestsQuery = useQuery({
        queryKey: ['my_events_pending', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('participation_requests')
                .select('*, event:events(*)')
                .eq('user_id', user.id)
                .eq('status', 'pending');
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.id,
    });

    // Query: Histórico (eventos passados)
    const historyEventsQuery = useQuery({
        queryKey: ['my_events_history', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            // Eventos que criei (passados)
            const { data: created } = await supabase
                .from('events')
                .select('*')
                .eq('creator_id', user.id)
                .lt('event_at', new Date().toISOString())
                .is('deleted_at', null);

            // Eventos que participei (passados)
            const { data: participated } = await supabase
                .from('event_participants')
                .select('event:events(*)')
                .eq('user_id', user.id)
                .lt('events.event_at', new Date().toISOString());

            const allEvents = [
                ...(created || []),
                ...(participated?.map((d: any) => d.event).filter(Boolean) || []),
            ];

            // Remove duplicatas
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

    // Refresh
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            createdEventsQuery.refetch(),
            participatingEventsQuery.refetch(),
            pendingRequestsQuery.refetch(),
            historyEventsQuery.refetch(),
        ]);
        setRefreshing(false);
    }, []);

    // Dados ativos baseado na tab
    const getActiveData = (): any[] => {
        switch (activeTab) {
            case 'created':
                return createdEventsQuery.data || [];
            case 'participating':
                return participatingEventsQuery.data || [];
            case 'pending':
                return pendingRequestsQuery.data || [];
            case 'history':
                return historyEventsQuery.data || [];
            default:
                return [];
        }
    };

    const isLoading =
        createdEventsQuery.isLoading ||
        participatingEventsQuery.isLoading ||
        pendingRequestsQuery.isLoading ||
        historyEventsQuery.isLoading;

    // Navegar para detalhes do evento
    const handleEventPress = (eventId: string) => {
        navigation.navigate('EventDetails', { eventId });
    };

    // Render item baseado na tab
    const renderItem = ({ item }: { item: any }) => {
        const event: Event = activeTab === 'pending' ? item.event : item;
        if (!event) return null;

        const eventDate = new Date(event.event_at);
        const isPast = eventDate < new Date();
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <Card
                style={[styles.eventCard, isPast && styles.eventCardPast]}
                onPress={() => handleEventPress(event.id)}
            >
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Text variant="titleMedium" style={styles.eventTitle} numberOfLines={1}>
                            {event.title}
                        </Text>
                        {activeTab === 'created' && (
                            <Chip compact style={styles.chipCreator}>Criador</Chip>
                        )}
                        {activeTab === 'pending' && (
                            <Chip compact style={styles.chipPending}>Pendente</Chip>
                        )}
                    </View>

                    <Text variant="bodySmall" style={styles.eventInfo}>
                        📅 {formattedDate}
                    </Text>
                    <Text variant="bodySmall" style={styles.eventInfo}>
                        📍 {event.city}
                    </Text>

                    {activeTab === 'created' && (
                        <Button
                            mode="outlined"
                            compact
                            style={styles.manageButton}
                            onPress={() => navigation.navigate('ManageRequests', {
                                eventId: event.id,
                                eventTitle: event.title
                            })}
                        >
                            Gerenciar
                        </Button>
                    )}
                </Card.Content>
            </Card>
        );
    };

    // Contadores para badges
    const counts = {
        created: createdEventsQuery.data?.length || 0,
        participating: participatingEventsQuery.data?.length || 0,
        pending: pendingRequestsQuery.data?.length || 0,
        history: historyEventsQuery.data?.length || 0,
    };

    return (
        <View style={styles.container}>
            {/* Segmented Tabs */}
            <View style={styles.tabsContainer}>
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as TabKey)}
                    buttons={[
                        { value: 'created', label: `Criados (${counts.created})` },
                        { value: 'participating', label: `Participo (${counts.participating})` },
                    ]}
                    style={styles.segmented}
                />
                <SegmentedButtons
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as TabKey)}
                    buttons={[
                        { value: 'pending', label: `Pendentes (${counts.pending})` },
                        { value: 'history', label: `Histórico` },
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
                                {activeTab === 'pending' && 'Nenhuma solicitação pendente'}
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
    },
    eventCardPast: {
        opacity: 0.6,
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
    chipPending: {
        backgroundColor: '#fff3e0',
        marginLeft: 8,
    },
    eventInfo: {
        color: '#666',
        marginBottom: 2,
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
});
