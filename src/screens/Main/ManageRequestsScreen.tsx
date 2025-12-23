import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Avatar, Button, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ManageRequestsScreenProps {
    navigation: any;
    route: any;
}

interface ParticipationRequest {
    id: string;
    event_id: string;
    user_id: string;
    status: string;
    created_at: string;
    user: {
        id: string;
        name: string;
        username: string;
        avatar_url: string | null;
    };
}

export const ManageRequestsScreen: React.FC<ManageRequestsScreenProps> = ({ navigation, route }) => {
    const { eventId, eventTitle } = route.params;
    const { user } = useAuth();

    const [requests, setRequests] = useState<ParticipationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('participation_requests')
                .select(`
          *,
          user:user_id(id, name, username, avatar_url)
        `)
                .eq('event_id', eventId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Erro ao buscar solicitações:', error);
            Alert.alert('Erro', 'Não foi possível carregar as solicitações.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [eventId]);

    const handleAccept = async (request: ParticipationRequest) => {
        try {
            setProcessingId(request.id);

            // Atualizar status da solicitação
            const { error: updateError } = await supabase
                .from('participation_requests')
                .update({ status: 'accepted', updated_at: new Date().toISOString() })
                .eq('id', request.id);

            if (updateError) throw updateError;

            // Adicionar aos participantes
            const { error: insertError } = await supabase
                .from('event_participants')
                .insert({
                    event_id: request.event_id,
                    user_id: request.user_id,
                });

            if (insertError) throw insertError;

            // Criar notificação para o usuário
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: request.user_id,
                    type: 'request_accepted',
                    payload: {
                        event_id: eventId,
                        event_title: eventTitle,
                        message: `Sua solicitação para "${eventTitle}" foi aceita!`,
                    },
                });

            Alert.alert('Sucesso', `${request.user.name} foi adicionado ao evento!`);
            fetchRequests(); // Recarregar lista
        } catch (error: any) {
            console.error('Erro ao aceitar:', error);
            Alert.alert('Erro', error.message || 'Não foi possível aceitar a solicitação.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (request: ParticipationRequest) => {
        try {
            setProcessingId(request.id);

            // Atualizar status da solicitação
            const { error } = await supabase
                .from('participation_requests')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', request.id);

            if (error) throw error;

            // Criar notificação para o usuário
            await supabase
                .from('notifications')
                .insert({
                    recipient_id: request.user_id,
                    type: 'request_rejected',
                    payload: {
                        event_id: eventId,
                        event_title: eventTitle,
                        message: `Sua solicitação para "${eventTitle}" foi recusada.`,
                    },
                });

            Alert.alert('Recusado', `A solicitação de ${request.user.name} foi recusada.`);
            fetchRequests(); // Recarregar lista
        } catch (error: any) {
            console.error('Erro ao recusar:', error);
            Alert.alert('Erro', error.message || 'Não foi possível recusar a solicitação.');
        } finally {
            setProcessingId(null);
        }
    };

    const renderRequest = ({ item }: { item: ParticipationRequest }) => {
        const isProcessing = processingId === item.id;
        const requestDate = new Date(item.created_at).toLocaleDateString('pt-BR');

        return (
            <Card style={styles.requestCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.userInfo}>
                        {item.user?.avatar_url ? (
                            <Avatar.Image size={50} source={{ uri: item.user.avatar_url }} />
                        ) : (
                            <Avatar.Text size={50} label={item.user?.name?.charAt(0) || '?'} />
                        )}
                        <View style={styles.userText}>
                            <Text variant="titleMedium">{item.user?.name || 'Usuário'}</Text>
                            <Text variant="bodySmall">@{item.user?.username}</Text>
                            <Text variant="bodySmall" style={styles.dateText}>Solicitado em {requestDate}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <Button
                            mode="contained"
                            onPress={() => handleAccept(item)}
                            disabled={isProcessing}
                            loading={isProcessing}
                            style={styles.acceptButton}
                            compact
                        >
                            Aceitar
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={() => handleReject(item)}
                            disabled={isProcessing}
                            style={styles.rejectButton}
                            compact
                        >
                            Recusar
                        </Button>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Carregando solicitações...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.header}>
                Solicitações para: {eventTitle}
            </Text>

            {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={styles.emptyText}>
                        Nenhuma solicitação pendente
                    </Text>
                    <Text variant="bodySmall" style={styles.emptySubtext}>
                        Quando alguém solicitar participação, aparecerá aqui.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequest}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    listContent: {
        padding: 12,
    },
    requestCard: {
        marginBottom: 12,
    },
    cardContent: {
        gap: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userText: {
        marginLeft: 12,
        flex: 1,
    },
    dateText: {
        color: '#888',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    acceptButton: {
        flex: 1,
    },
    rejectButton: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        color: '#666',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#999',
        textAlign: 'center',
    },
});
