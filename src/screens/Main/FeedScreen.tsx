import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip } from 'react-native-paper';
import { useEvents } from '../../hooks/useEvents';
import { useLocation } from '../../hooks/useLocation';
import { LoadingScreen } from '../../components/LoadingScreen';
import { getFormattedDistance } from '../../utils/geo';
import { Event } from '../../services/supabase';

export const FeedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { events, eventsLoading, eventsError, eventsQuery } = useEvents();
  const { location } = useLocation();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchText.toLowerCase()) ||
    event.description.toLowerCase().includes(searchText.toLowerCase()) ||
    event.city.toLowerCase().includes(searchText.toLowerCase())
  );

  // Ordenar por distância se tiver localização
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!location) return 0;

    const distA = a.latitude && a.longitude
      ? Math.sqrt((a.latitude - location.latitude) ** 2 + (a.longitude - location.longitude) ** 2)
      : Infinity;
    const distB = b.latitude && b.longitude
      ? Math.sqrt((b.latitude - location.latitude) ** 2 + (b.longitude - location.longitude) ** 2)
      : Infinity;

    return distA - distB;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await eventsQuery.refetch();
    setRefreshing(false);
  };

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };

  if (eventsLoading) {
    return <LoadingScreen message="Carregando eventos..." />;
  }

  if (eventsError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Erro ao carregar eventos</Text>
      </View>
    );
  }

  const renderEventCard = ({ item }: { item: Event }) => {
    const eventDate = new Date(item.event_at);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Calcular distância
    const distance = getFormattedDistance(
      location?.latitude ?? null,
      location?.longitude ?? null,
      item.latitude,
      item.longitude
    );

    // Label de entrada
    const getEntryLabel = () => {
      if (item.entry_type === 'free') return 'Gratuito';
      if (item.entry_type === 'paid') return `R$ ${item.entry_price?.toFixed(2).replace('.', ',')}`;
      if (item.entry_type === 'bring') return 'Traga algo';
      return '';
    };

    return (
      <TouchableOpacity onPress={() => handleEventPress(item.id)}>
        <Card style={styles.eventCard}>
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={styles.eventImage} />
          )}
          <Card.Content>
            <Text variant="titleMedium" style={styles.eventTitle}>
              {item.title}
            </Text>

            <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
              {item.description}
            </Text>

            <View style={styles.eventInfo}>
              <Text variant="bodySmall">📅 {formattedDate}</Text>
              {distance && (
                <Text variant="bodySmall" style={styles.distance}>📍 {distance}</Text>
              )}
            </View>

            <View style={styles.tagsRow}>
              <Chip compact style={styles.tag}>
                {getEntryLabel()}
              </Chip>
              {item.audience === 'adults_only' && (
                <Chip compact style={styles.tagAdult}>🔞 +18</Chip>
              )}
              {item.max_participants && (
                <Chip compact style={styles.tag}>
                  👥 {item.max_participants} vagas
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar eventos..."
        onChangeText={setSearchText}
        value={searchText}
        style={styles.searchBar}
      />

      {sortedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>Nenhum evento encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={sortedEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
  searchBar: {
    margin: 12,
  },
  listContent: {
    padding: 12,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  eventTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  distance: {
    color: '#6200ee',
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    height: 28,
    backgroundColor: '#f0f0f0',
  },
  tagAdult: {
    height: 28,
    backgroundColor: '#ffebee',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 20,
  },
});
