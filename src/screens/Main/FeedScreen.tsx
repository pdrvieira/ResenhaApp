import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar } from 'react-native-paper';
import { useEvents } from '../../hooks/useEvents';
import { LoadingScreen } from '../../components/LoadingScreen';

export const FeedScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { events, eventsLoading, eventsError } = useEvents();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchText.toLowerCase()) ||
    event.description.toLowerCase().includes(searchText.toLowerCase()) ||
    event.city.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Refetch events
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

  const renderEventCard = ({ item }: { item: any }) => {
    const eventDate = new Date(item.event_at);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return (
      <TouchableOpacity onPress={() => handleEventPress(item.id)}>
        <Card style={styles.eventCard}>
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.eventImage}
            />
          )}
          <Card.Content>
            <Text variant="titleMedium" style={styles.eventTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.eventInfo}>
              <Text variant="bodySmall">📅 {formattedDate}</Text>
              <Text variant="bodySmall">📍 {item.city}</Text>
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

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>Nenhum evento encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
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
    height: 200,
  },
  eventTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventInfo: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
