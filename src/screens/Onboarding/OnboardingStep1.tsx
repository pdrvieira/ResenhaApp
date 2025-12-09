import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface OnboardingStep1Props {
  onNext: (data: { name: string; username: string }) => void;
  loading?: boolean;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ onNext, loading = false }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!username.trim()) {
      setError('Username é obrigatório');
      return;
    }

    if (username.length < 3) {
      setError('Username deve ter pelo menos 3 caracteres');
      return;
    }

    onNext({ name: name.trim(), username: username.trim() });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Vamos começar!
        </Text>

        <Text style={styles.subtitle}>
          Qual é o seu nome?
        </Text>

        <TextInput
          label="Nome Completo"
          value={name}
          onChangeText={setName}
          placeholder="Ex: João Silva"
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.subtitle}>
          Escolha um username único
        </Text>

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Ex: joaosilva"
          autoCapitalize="none"
          style={styles.input}
          editable={!loading}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Próximo
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
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    marginBottom: 24,
  },
  button: {
    marginTop: 20,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
});
