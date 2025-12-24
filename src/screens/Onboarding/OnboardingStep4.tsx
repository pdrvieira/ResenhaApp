import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Switch } from 'react-native-paper';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';

interface OnboardingStep4Props {
  onFinish: (preferences: { notificationsEnabled: boolean }) => void;
  loading?: boolean;
}

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ onFinish, loading = false }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { requestPermission } = useNotificationPermission();

  // Solicitar permissão do sistema quando ativar notificações
  const handleToggleNotifications = useCallback(async (value: boolean) => {
    setNotificationsEnabled(value);

    if (value) {
      // Se ativou, solicitar permissão do sistema
      await requestPermission();
    }
  }, [requestPermission]);

  const handleFinish = async () => {
    // Se notificações ativadas, garantir que temos permissão
    if (notificationsEnabled) {
      await requestPermission();
    }
    onFinish({ notificationsEnabled });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Preferências
        </Text>

        <Text style={styles.subtitle}>
          Customize sua experiência
        </Text>

        <View style={styles.preferenceItem}>
          <View style={styles.preferenceText}>
            <Text style={styles.preferenceTitle}>Receber notificações push</Text>
            <Text style={styles.preferenceDescription}>
              Saiba quando alguém quer participar dos seus eventos
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={loading}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleFinish}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Finalizar
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  preferenceText: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  preferenceDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  button: {
    marginTop: 20,
  },
});
