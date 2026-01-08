import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useEvents } from '../../hooks/useEvents';
import { LoadingScreen } from '../../components/LoadingScreen';
import { CreateEventStep1 } from './CreateEventStep1';
import { CreateEventStep2 } from './CreateEventStep2';
import { CreateEventStep3 } from './CreateEventStep3';
import { BringWhatType } from '../../services/supabase';

interface CreateEventScreenProps {
  navigation: any;
}

type Audience = 'everyone' | 'adults_only' | 'invite_only';

interface EventFormData {
  // Step 1
  title: string;
  description: string;
  eventDate: Date;
  // Step 2
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  // Step 3
  audience: Audience;
  motivation?: string;
  bringWhat: BringWhatType;
  photoUri?: string;
  maxParticipants?: number;
}

const INITIAL_DATA: Partial<EventFormData> = {};

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { createEvent } = useEvents();
  const [formData, setFormData] = useState<Partial<EventFormData>>(INITIAL_DATA);

  // Step 1: Informações básicas
  const handleStep1Complete = (data: { title: string; description: string; eventDate: Date }) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title,
      description: data.description,
      eventDate: data.eventDate,
    }));
    setStep(2);
  };

  // Step 2: Localização
  const handleStep2Complete = (data: { city: string; address: string; latitude: number; longitude: number }) => {
    setFormData((prev) => ({
      ...prev,
      city: data.city,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    }));
    setStep(3);
  };

  // Step 3: Finalização
  const handleStep3Complete = async (data: {
    audience: Audience;
    motivation?: string;
    bringWhat: BringWhatType;
    photoUri?: string;
    maxParticipants?: number;
  }) => {
    const finalData = { ...formData, ...data };

    try {
      setLoading(true);

      await new Promise<void>((resolve, reject) => {
        createEvent(
          {
            title: finalData.title!,
            description: finalData.description!,
            image_url: finalData.photoUri,
            event_at: finalData.eventDate!.toISOString(),
            city: finalData.city!,
            address: finalData.address!,
            latitude: finalData.latitude,
            longitude: finalData.longitude,
            max_participants: finalData.maxParticipants,
            bring_what: finalData.bringWhat !== 'nothing' ? finalData.bringWhat : undefined,
            audience: finalData.audience,
            motivation: finalData.motivation,
          },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });

      Alert.alert(
        '🎉 Evento Criado!',
        'Seu evento foi criado com sucesso e já está visível no mapa.',
        [
          {
            text: 'Ver no Mapa',
            onPress: () => {
              resetForm();
              navigation.navigate('Discover');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível criar o evento. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData(INITIAL_DATA);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (loading) {
    return <LoadingScreen message="Criando seu evento..." />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && (
        <CreateEventStep1
          onNext={handleStep1Complete}
          initialData={{
            title: formData.title,
            description: formData.description,
            eventDate: formData.eventDate,
          }}
        />
      )}

      {step === 2 && (
        <CreateEventStep2
          onNext={handleStep2Complete}
          onBack={handleBack}
          initialData={{
            city: formData.city,
            address: formData.address,
            latitude: formData.latitude,
            longitude: formData.longitude,
          }}
        />
      )}

      {step === 3 && formData.title && formData.eventDate && formData.city && formData.address && (
        <CreateEventStep3
          onFinish={handleStep3Complete}
          onBack={handleBack}
          eventSummary={{
            title: formData.title,
            description: formData.description!,
            eventDate: formData.eventDate,
            city: formData.city,
            address: formData.address,
          }}
          loading={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
