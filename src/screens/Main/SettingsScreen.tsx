import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../../components/LoadingScreen';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { user, loading, updateProfile, signOut } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [city, setCity] = useState(user?.city || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingLoading, setSavingLoading] = useState(false);

  if (loading) {
    return <LoadingScreen message="Carregando configurações..." />;
  }

  const handleSaveProfile = async () => {
    try {
      setSavingLoading(true);
      await updateProfile({
        name,
        username,
        city,
      });
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setSavingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Perfil
        </Text>

        <TextInput
          label="Nome"
          value={name}
          onChangeText={setName}
          editable={editMode && !savingLoading}
          style={styles.input}
        />

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          editable={editMode && !savingLoading}
          style={styles.input}
        />

        <TextInput
          label="Cidade"
          value={city}
          onChangeText={setCity}
          editable={editMode && !savingLoading}
          style={styles.input}
        />

        {editMode ? (
          <>
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              loading={savingLoading}
              disabled={savingLoading}
              style={styles.button}
            >
              Salvar
            </Button>
            <Button
              mode="outlined"
              onPress={() => setEditMode(false)}
              disabled={savingLoading}
              style={styles.button}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Button
            mode="outlined"
            onPress={() => setEditMode(true)}
            style={styles.button}
          >
            Editar Perfil
          </Button>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Notificações
        </Text>

        <View style={styles.preferenceItem}>
          <Text>Notificações Push</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Conta
        </Text>

        <Text variant="bodySmall" style={styles.email}>
          Email: {user?.email}
        </Text>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Sair
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
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  email: {
    marginBottom: 16,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#d32f2f',
  },
});
