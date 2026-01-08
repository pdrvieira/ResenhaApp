import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList, Alert } from 'react-native';
import { Text, Button, Card, Avatar, Chip } from 'react-native-paper';
import { useEvents } from '../../hooks/useEvents';
import { useParticipation } from '../../hooks/useParticipation';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { LoadingScreen } from '../../components/LoadingScreen';
import { supabase } from '../../services/supabase';
import { notifyNewRequest } from '../../utils/notifications';

interface EventDetailsScreenProps {
  navigation: any;
  route: any;
}

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ navigation, route }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const { eventByIdQuery } = useEvents();
  const { eventParticipantsQuery, requestParticipationMutation } = useParticipation();
  const { markTypeAsReadForEvent } = useNotifications();

  const [userParticipating, setUserParticipating] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const eventQuery = eventByIdQuery(eventId);
  const participantsQuery = eventParticipantsQuery(eventId);

  const event = eventQuery.data;
  const participants = participantsQuery.data || [];

  const isCreator = user?.id === event?.creator_id;

  // Marcar notificações de alteração de evento como lidas quando participante visualiza
  useEffect(() => {
    if (eventId && user?.id && !isCreator) {
      // Se não é criador, marcar notificações de alterações como lidas
      markTypeAsReadForEvent(eventId, ['event_updated', 'event_cancelled']);
    }
  }, [eventId, user?.id, isCreator, markTypeAsReadForEvent]);

  // Verificar status de participação do usuário
  useEffect(() => {
    const checkParticipationStatus = async () => {
      if (!event || !user) return;

      // Verifica se é o criador
      if (event.creator_id === user.id) {
        setUserParticipating(true);
        return;
      }

      // Verifica se já é participante
      const isParticipant = participants.some((p: any) => p.user_id === user.id);
      if (isParticipant) {
        setUserParticipating(true);
        return;
      }

      // Verifica se tem solicitação pendente
      const { data: request } = await supabase
        .from('participation_requests')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (request) {
        setRequestStatus(request.status);
        setHasPendingRequest(request.status === 'pending');
      }
    };

    checkParticipationStatus();
  }, [event, participants, user, eventId]);

  // Buscar quantidade de solicitações pendentes (para o criador)
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!isCreator) return;

      const { count } = await supabase
        .from('participation_requests')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'pending');

      setPendingRequestsCount(count || 0);
    };

    fetchPendingRequests();
  }, [isCreator, eventId]);

  const handleRequestParticipation = async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        requestParticipationMutation.mutate(eventId, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });

      setHasPendingRequest(true);
      setRequestStatus('pending');

      // Enviar notificação para o criador
      if (event && user) {
        await notifyNewRequest(
          event.creator_id,
          eventId,
          event.title,
          user.name || user.username || 'Alguém',
          user.id
        );
      }

      Alert.alert('Solicitação Enviada!', 'O organizador do evento irá analisar sua solicitação.');
    } catch (error: any) {
      console.error('Erro ao solicitar:', error);
      Alert.alert('Erro', error.message || 'Não foi possível enviar a solicitação.');
    }
  };

  if (eventQuery.isLoading) {
    return <LoadingScreen message="Carregando evento..." />;
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Evento não encontrado</Text>
      </View>
    );
  }

  const eventDate = new Date(event.event_at);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderParticipant = ({ item }: { item: any }) => (
    <Card style={styles.participantCard}>
      <Card.Content style={styles.participantContent}>
        {item.user?.avatar_url ? (
          <Avatar.Image size={40} source={{ uri: item.user.avatar_url }} />
        ) : (
          <Avatar.Text size={40} label={item.user?.name?.charAt(0) || '?'} />
        )}
        <View style={styles.participantInfo}>
          <Text variant="bodyMedium">{item.user?.name || 'Usuário'}</Text>
          <Text variant="bodySmall">@{item.user?.username || 'username'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderParticipationButton = () => {
    // Verificar se evento já passou
    const isPast = event && new Date(event.event_at) < new Date();

    if (isCreator) {
      // Se evento passou, mostrar apenas chip informativo
      if (isPast) {
        return (
          <Chip icon="check-circle" style={styles.chip}>
            Evento encerrado
          </Chip>
        );
      }

      return (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('ManageEvent', { eventId, eventTitle: event.title })}
          style={styles.button}
          icon="account-group"
        >
          Gerenciar Solicitações {pendingRequestsCount > 0 ? `(${pendingRequestsCount})` : ''}
        </Button>
      );
    }

    if (userParticipating) {
      return (
        <Chip icon="check" style={styles.chip}>
          {isPast ? 'Você participou' : 'Você está participando'}
        </Chip>
      );
    }

    if (requestStatus === 'pending') {
      return (
        <Chip icon="clock-outline" style={styles.chipPending}>
          Solicitação pendente
        </Chip>
      );
    }

    if (requestStatus === 'rejected') {
      return (
        <Chip icon="close" style={styles.chipRejected}>
          Solicitação recusada
        </Chip>
      );
    }

    // Se evento passou, não permitir novas solicitações
    if (isPast) {
      return (
        <Chip icon="calendar-remove" style={styles.chipRejected}>
          Evento encerrado
        </Chip>
      );
    }

    return (
      <Button
        mode="contained"
        onPress={handleRequestParticipation}
        loading={requestParticipationMutation.isPending}
        disabled={requestParticipationMutation.isPending}
        style={styles.button}
      >
        Solicitar Participação
      </Button>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {event.image_url && (
        <Image source={{ uri: event.image_url }} style={styles.eventImage} />
      )}

      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {event.title}
        </Text>

        <Text variant="bodyMedium" style={styles.description}>
          {event.description}
        </Text>

        <View style={styles.infoSection}>
          <Text variant="bodySmall">📅 {formattedDate}</Text>
          <Text variant="bodySmall">📍 {event.address}, {event.city}</Text>
          {event.max_participants && (
            <Text variant="bodySmall">👥 Até {event.max_participants} vagas</Text>
          )}
        </View>

        {/* Detalhes do Evento */}
        <View style={styles.detailsSection}>
          {/* Tipo de entrada */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>💰 Entrada:</Text>
            <Text style={styles.detailValue}>
              {event.entry_type === 'free' && 'Gratuito'}
              {event.entry_type === 'paid' && `R$ ${event.entry_price?.toFixed(2).replace('.', ',')}`}
              {event.entry_type === 'bring' && 'Traga algo'}
            </Text>
          </View>

          {/* O que trazer */}
          {event.entry_type === 'bring' && event.bring_what && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🎒 Trazer:</Text>
              <Text style={styles.detailValue}>{event.bring_what}</Text>
            </View>
          )}

          {/* Público */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👤 Público:</Text>
            <Text style={styles.detailValue}>
              {event.audience === 'everyone' && 'Aberto a todos'}
              {event.audience === 'adults_only' && '🔞 Apenas +18'}
              {event.audience === 'invite_only' && '🔒 Somente convidados'}
            </Text>
          </View>

          {/* Motivação */}
          {event.motivation && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>💭 Motivação:</Text>
              <Text style={styles.detailValue}>{event.motivation}</Text>
            </View>
          )}
        </View>

        {renderParticipationButton()}

        <Text variant="titleSmall" style={styles.sectionTitle}>
          Participantes ({participants.length})
        </Text>

        {participants.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum participante ainda</Text>
        ) : (
          <FlatList
            data={participants}
            renderItem={renderParticipant}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailsSection: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  button: {
    marginBottom: 20,
  },
  chip: {
    marginBottom: 20,
    backgroundColor: '#e8f5e9',
  },
  chipPending: {
    marginBottom: 20,
    backgroundColor: '#fff3e0',
  },
  chipRejected: {
    marginBottom: 20,
    backgroundColor: '#ffebee',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  participantCard: {
    marginBottom: 8,
  },
  participantContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantInfo: {
    marginLeft: 12,
    flex: 1,
  },
});
