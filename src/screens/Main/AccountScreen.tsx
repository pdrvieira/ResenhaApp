import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Button, Card } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useUserStats } from '../../hooks/useUserStats';
import { LoadingScreen } from '../../components/LoadingScreen';

interface AccountScreenProps {
  navigation: any;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  const { user, loading } = useAuth();
  const { eventsCreatedCount, participationsCount, eventsCreatedLoading, participationsLoading } = useUserStats();

  if (loading) {
    return <LoadingScreen message="Carregando perfil..." />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Usuário não autenticado</Text>
      </View>
    );
  }

  // Avatar usa Avatar.Text como fallback (já implementado abaixo)

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        {user.avatar_url ? (
          <Avatar.Image size={100} source={{ uri: user.avatar_url }} />
        ) : (
          <Avatar.Text size={100} label={user.name?.charAt(0) || user.username?.charAt(0) || '?'} />
        )}
        <Text variant="headlineSmall" style={styles.name}>
          {user.name || 'Sem nome'}
        </Text>
        <Text variant="bodyMedium">@{user.username}</Text>
        {user.city && <Text variant="bodySmall">{user.city}</Text>}
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineSmall">
              {eventsCreatedLoading ? '...' : eventsCreatedCount}
            </Text>
            <Text variant="bodySmall">Eventos Criados</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineSmall">
              {participationsLoading ? '...' : participationsCount}
            </Text>
            <Text variant="bodySmall">Participações</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineSmall">0</Text>
            <Text variant="bodySmall">Amigos</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Settings')}
          style={styles.button}
        >
          Editar Perfil
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Settings')}
          style={styles.button}
        >
          Configurações
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    marginTop: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  statContent: {
    alignItems: 'center',
  },
  actionsContainer: {
    padding: 20,
  },
  button: {
    marginBottom: 12,
  },
});
