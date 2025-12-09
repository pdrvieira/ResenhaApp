import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Switch } from 'react-native-paper';

interface OnboardingStep4Props {
  onFinish: (preferences: { notificationsEnabled: boolean }) => void;
  loading?: boolean;
}

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ onFinish, loading = false }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleFinish = () => {
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
          <Text>Receber notificações push</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
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
  button: {
    marginTop: 20,
  },
});
