import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface OnboardingStep3Props {
  onNext: (city: string) => void;
  loading?: boolean;
}

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onNext, loading = false }) => {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');

    if (!city.trim()) {
      setError('Cidade é obrigatória');
      return;
    }

    onNext(city.trim());
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Onde você mora?
        </Text>

        <Text style={styles.subtitle}>
          Isso nos ajuda a encontrar eventos perto de você
        </Text>

        <TextInput
          label="Cidade"
          value={city}
          onChangeText={setCity}
          placeholder="Ex: São Paulo"
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
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
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
