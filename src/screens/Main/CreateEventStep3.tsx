import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CreateEventStep3Props {
  onNext: (data: { eventDate: string; city: string; address: string }) => void;
  loading?: boolean;
}

export const CreateEventStep3: React.FC<CreateEventStep3Props> = ({ onNext, loading = false }) => {
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleNext = () => {
    setError('');

    if (!city.trim()) {
      setError('Cidade é obrigatória');
      return;
    }

    if (!address.trim()) {
      setError('Endereço é obrigatório');
      return;
    }

    onNext({
      eventDate: eventDate.toISOString(),
      city: city.trim(),
      address: address.trim(),
    });
  };

  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Criar Evento
        </Text>

        <Text style={styles.subtitle}>
          Passo 3: Data e Localização
        </Text>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          📅 {formattedDate}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <TextInput
          label="Cidade"
          value={city}
          onChangeText={setCity}
          placeholder="Ex: São Paulo"
          style={styles.input}
          editable={!loading}
        />

        <TextInput
          label="Endereço"
          value={address}
          onChangeText={setAddress}
          placeholder="Ex: Rua das Flores, 123"
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
  dateButton: {
    marginBottom: 16,
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
