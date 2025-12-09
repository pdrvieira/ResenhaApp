import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface CreateEventStep4Props {
  onFinish: (maxParticipants?: number) => void;
  loading?: boolean;
}

export const CreateEventStep4: React.FC<CreateEventStep4Props> = ({ onFinish, loading = false }) => {
  const [maxParticipants, setMaxParticipants] = useState('');

  const handleFinish = () => {
    const max = maxParticipants ? parseInt(maxParticipants, 10) : undefined;
    onFinish(max);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Criar Evento
        </Text>

        <Text style={styles.subtitle}>
          Passo 4: Limite de Participantes
        </Text>

        <Text style={styles.description}>
          Defina um limite máximo de participantes (opcional)
        </Text>

        <TextInput
          label="Limite de Participantes"
          value={maxParticipants}
          onChangeText={setMaxParticipants}
          keyboardType="number-pad"
          placeholder="Ex: 50"
          style={styles.input}
          editable={!loading}
        />

        <Button
          mode="contained"
          onPress={handleFinish}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Criar Evento
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
  description: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 12,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
  },
});
