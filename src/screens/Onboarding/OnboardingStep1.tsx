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

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      setError('Nome é obrigatório');
      return;
    }

    if (!trimmedUsername) {
      setError('Username é obrigatório');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username deve ter pelo menos 3 caracteres');
      return;
    }

    // Regex: Letters, numbers, underscores, dots. No spaces.
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      setError('Username deve conter apenas letras, números, ponto ou underline.');
      return;
    }

    onNext({ name: trimmedName, username: trimmedUsername });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={styles.stepIndicator}>Passo 1 de 4</Text>
        <Text variant="headlineMedium" style={styles.title}>Vamos começar!</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Como você quer ser chamado no Resenha?</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          label="Nome Completo"
          value={name}
          onChangeText={setName}
          placeholder="Ex: João Silva"
          style={styles.input}
          editable={!loading}
          mode="outlined"
        />

        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Ex: joaosilva"
          autoCapitalize="none"
          style={styles.input}
          editable={!loading}
          mode="outlined"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={{ height: 48 }}
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
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
    paddingTop: 0,
    flex: 1,
  },
  stepIndicator: {
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 24,
    borderRadius: 8,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
