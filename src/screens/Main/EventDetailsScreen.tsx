import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, FlatList } from 'react-native';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { useEvents } from '../../hooks/useEvents';
import { useParticipation } from '../../hooks/useParticipation';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../../components/LoadingScreen';

interface EventDetailsScreenProps {
  navigation: any;
  route: any;
}

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ navigation, route }) => {
  const { eventId } = route.params;
  const { user } = useAuth();
  const { eventByIdQuery } = useEvents();
  const { eventParticipantsQuery, requestParticipationMutation, acceptRequestMutation, rejectRequestMutation } = useParticipation();
  const [userParticipating, setUserParticipating] = useState(false);

  const eventQuery = eventByIdQuery(eventId);
  const participantsQuery = eventParticipantsQuery(eventId);

  const event = eventQuery.data;
  const participants = participantsQuery.data || [];

  useEffect(() => {
    if (event && user) {
      setUserParticipating(event.creator_id === user.id || participants.some((p: any) => p.user_id === user.id));
    }
  }, [event, participants, user]);

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

  const isCreator = user?.id === event.creator_id;

  const handleRequestParticipation = () => {
    requestParticipationMutation.mutate(eventId);
  };

  const renderParticipant = ({ item }: { item: any }) => (
    <Card style={styles.participantCard}>
      <Card.Content style={styles.participantContent}>
        <Avatar.Image size={40} source={{ uri: item.user?.avatar_url }} />
        <View style={styles.participantInfo}>
          <Text variant="bodyMedium">{item.user?.name}</Text>
          <Text variant="bodySmall">@{item.user?.username}</Text>
        </View>
      </Card.Content>
    </Card>
  );

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
            <Text variant="bodySmall">👥 Até {event.max_participants} participantes</Text>
          )}
        </View>

        {!isCreator && !userParticipating && (
          <Button
            mode="contained"
            onPress={handleRequestParticipation}
            loading={requestParticipationMutation.isPending}
            disabled={requestParticipationMutation.isPending}
            style={styles.button}
          >
            Solicitar Participação
          </Button>
        )}

        {userParticipating && (
          <Button
            mode="outlined"
            disabled
            style={styles.button}
          >
            ✓ Você está participando
          </Button>
        )}

        <Text variant="titleSmall" style={styles.sectionTitle}>
          Participantes ({participants.length})
        </Text>

        {participants.length === 0 ? (
          <Text>Nenhum participante ainda</Text>
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
    marginBottom: 16,
  },
  button: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
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
