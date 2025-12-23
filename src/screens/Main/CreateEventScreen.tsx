import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useEvents } from '../../hooks/useEvents';
import { LoadingScreen } from '../../components/LoadingScreen';
import { CreateEventStep1 } from './CreateEventStep1';
import { CreateEventStep2 } from './CreateEventStep2';
import { CreateEventStep3 } from './CreateEventStep3';
import { CreateEventStep4 } from './CreateEventStep4';

interface CreateEventScreenProps {
  navigation: any;
}

interface EventFormData {
  photoUri: string;
  title: string;
  description: string;
  eventDate: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
}

const INITIAL_DATA: EventFormData = {
  photoUri: '',
  title: '',
  description: '',
  eventDate: '',
  city: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  maxParticipants: undefined,
};

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createEvent } = useEvents();
  const [eventData, setEventData] = useState<EventFormData>(INITIAL_DATA);

  const handleStep1 = (photoUri: string) => {
    setEventData((prev) => ({ ...prev, photoUri }));
    setStep(2);
  };

  const handleStep2 = (data: { title: string; description: string }) => {
    setEventData((prev) => ({
      ...prev,
      title: data.title,
      description: data.description,
    }));
    setStep(3);
  };

  const handleStep3 = (data: {
    eventDate: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }) => {
    setEventData((prev) => ({
      ...prev,
      eventDate: data.eventDate,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    }));
    setStep(4);
  };

  const handleStep4 = async (maxParticipants?: number) => {
    try {
      setLoading(true);

      // TODO: Upload de imagem para Supabase Storage
      const imageUrl = eventData.photoUri;

      await new Promise<void>((resolve, reject) => {
        createEvent(
          {
            title: eventData.title,
            description: eventData.description,
            image_url: imageUrl,
            event_at: eventData.eventDate,
            city: eventData.city,
            address: eventData.address,
            latitude: eventData.latitude,
            longitude: eventData.longitude,
            max_participants: maxParticipants,
          },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });

      Alert.alert(
        'Evento Criado!',
        eventData.latitude
          ? 'Seu evento foi criado e aparecerá no mapa.'
          : 'Seu evento foi criado. (Endereço não localizado no mapa)',
        [
          {
            text: 'Ver no Mapa',
            onPress: () => {
              setStep(1);
              setEventData(INITIAL_DATA);
              navigation.navigate('Map');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      Alert.alert('Erro', 'Não foi possível criar o evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Criando evento..." />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && <CreateEventStep1 onNext={handleStep1} loading={loading} />}
      {step === 2 && <CreateEventStep2 onNext={handleStep2} loading={loading} />}
      {step === 3 && <CreateEventStep3 onNext={handleStep3} loading={loading} />}
      {step === 4 && <CreateEventStep4 onFinish={handleStep4} loading={loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
