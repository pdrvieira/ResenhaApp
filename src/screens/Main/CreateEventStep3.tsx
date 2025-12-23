import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { geocodeAddress } from '../../services/geocoding';

interface CreateEventStep3Props {
  onNext: (data: {
    eventDate: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  loading?: boolean;
}

export const CreateEventStep3: React.FC<CreateEventStep3Props> = ({ onNext, loading = false }) => {
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleNext = async () => {
    setError('');

    if (!city.trim()) {
      setError('Cidade é obrigatória');
      return;
    }

    if (!address.trim()) {
      setError('Endereço é obrigatório');
      return;
    }

    // Geocoding do endereço
    setGeocoding(true);
    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const result = await geocodeAddress(address.trim(), city.trim());
      if (result) {
        latitude = result.latitude;
        longitude = result.longitude;
        console.log('📍 Geocoding success:', result);
      } else {
        console.warn('⚠️ Geocoding returned no results');
        // Continua sem coordenadas - evento não aparecerá no mapa
      }
    } catch (err) {
      console.warn('⚠️ Geocoding failed:', err);
      // Continua sem coordenadas
    } finally {
      setGeocoding(false);
    }

    onNext({
      eventDate: eventDate.toISOString(),
      city: city.trim(),
      address: address.trim(),
      latitude,
      longitude,
    });
  };

  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isLoading = loading || geocoding;

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
          disabled={isLoading}
        >
          📅 {formattedDate}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={eventDate}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TextInput
          label="Cidade"
          value={city}
          onChangeText={setCity}
          placeholder="Ex: Belo Horizonte"
          style={styles.input}
          editable={!isLoading}
          mode="outlined"
        />

        <TextInput
          label="Endereço"
          value={address}
          onChangeText={setAddress}
          placeholder="Ex: Rua das Flores, 123"
          style={styles.input}
          editable={!isLoading}
          mode="outlined"
        />

        <HelperText type="info" visible style={styles.helperText}>
          O endereço será usado para localizar o evento no mapa
        </HelperText>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleNext}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          {geocoding ? 'Localizando...' : 'Próximo'}
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
    color: '#666',
  },
  dateButton: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
});
