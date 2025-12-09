import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

interface CreateEventStep2Props {
  onNext: (data: { title: string; description: string }) => void;
  loading?: boolean;
}

export const CreateEventStep2: React.FC<CreateEventStep2Props> = ({ onNext, loading = false }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!description.trim()) {
      setError('Descrição é obrigatória');
      return;
    }

    onNext({ title: title.trim(), description: description.trim() });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Criar Evento
        </Text>

        <Text style={styles.subtitle}>
          Passo 2: Informações Básicas
        </Text>

        <TextInput
          label="Título do Evento"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Festa de Aniversário"
          style={styles.input}
          editable={!loading}
        />

        <TextInput
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva seu evento..."
          multiline
          numberOfLines={4}
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
