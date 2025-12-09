import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

interface CreateEventStep1Props {
  onNext: (photoUri: string) => void;
  loading?: boolean;
}

export const CreateEventStep1: React.FC<CreateEventStep1Props> = ({ onNext, loading = false }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleTakePhoto = async () => {
    launchCamera(
      {
        mediaType: 'photo',
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setPhotoUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleChoosePhoto = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setPhotoUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleNext = () => {
    setError('');

    if (!photoUri) {
      setError('Foto é obrigatória');
      return;
    }

    onNext(photoUri);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Criar Evento
        </Text>

        <Text style={styles.subtitle}>
          Passo 1: Foto do Evento
        </Text>

        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={styles.photoPreview}
          />
        )}

        <Button
          mode="contained"
          onPress={handleTakePhoto}
          disabled={loading}
          style={styles.button}
        >
          Tirar Foto
        </Button>

        <Button
          mode="outlined"
          onPress={handleChoosePhoto}
          disabled={loading}
          style={styles.button}
        >
          Escolher da Galeria
        </Button>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading || !photoUri}
          style={styles.nextButton}
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
  photoPreview: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  nextButton: {
    marginTop: 20,
    marginBottom: 12,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
});
