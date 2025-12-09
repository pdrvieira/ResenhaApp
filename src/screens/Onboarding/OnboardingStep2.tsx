import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

interface OnboardingStep2Props {
  onNext: (photoUri?: string) => void;
  onSkip: () => void;
  loading?: boolean;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ onNext, onSkip, loading = false }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
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
    onNext(photoUri || undefined);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Foto de Perfil
        </Text>

        <Text style={styles.subtitle}>
          Escolha uma foto para seu perfil (opcional)
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

        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
          style={styles.nextButton}
        >
          Próximo
        </Button>

        <Button
          mode="text"
          onPress={onSkip}
          disabled={loading}
        >
          Pular
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
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  nextButton: {
    marginTop: 20,
    marginBottom: 12,
  },
});
