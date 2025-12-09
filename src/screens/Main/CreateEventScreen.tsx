import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useEvents } from '../../hooks/useEvents';
import { LoadingScreen } from '../../components/LoadingScreen';
import { CreateEventStep1 } from './CreateEventStep1';
import { CreateEventStep2 } from './CreateEventStep2';
import { CreateEventStep3 } from './CreateEventStep3';
import { CreateEventStep4 } from './CreateEventStep4';

interface CreateEventScreenProps {
  navigation: any;
}

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createEvent } = useEvents();
  const [eventData, setEventData] = useState({
    photoUri: '',
    title: '',
    description: '',
    eventDate: '',
    city: '',
    address: '',
    maxParticipants: undefined as number | undefined,
  });

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

  const handleStep3 = (data: { eventDate: string; city: string; address: string }) => {
    setEventData((prev) => ({
      ...prev,
      eventDate: data.eventDate,
      city: data.city,
      address: data.address,
    }));
    setStep(4);
  };

  const handleStep4 = async (maxParticipants?: number) => {
    try {
      setLoading(true);

      // TODO: Upload de imagem para Supabase Storage
      // Por enquanto, usar URL da imagem local
      const imageUrl = eventData.photoUri;

      createEvent({
        title: eventData.title,
        description: eventData.description,
        image_url: imageUrl,
        event_at: eventData.eventDate,
        city: eventData.city,
        address: eventData.address,
        max_participants: maxParticipants,
      });

      // Voltar para o feed
      navigation.navigate('Feed');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
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
