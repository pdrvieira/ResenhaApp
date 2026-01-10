import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

// Atomic Components
import { ReScreen } from '../../components/atoms/ReScreen';
import { ReText } from '../../components/atoms/ReText';
import { ReButton } from '../../components/atoms/ReButton';

interface OnboardingStep2Props {
  onNext: (photoUri?: string) => void;
  onSkip: () => void;
  onBack: () => void;
  loading?: boolean;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ onNext, onSkip, onBack, loading = false }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      return;
    }
    if (response.assets && response.assets[0]?.uri) {
      setPhotoUri(response.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.7,
      },
      handleResponse
    );
  };

  const handleChoosePhoto = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.7,
      },
      handleResponse
    );
  };

  const handleNext = () => {
    onNext(photoUri || undefined);
  };

  return (
    <ReScreen scrollable contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>

        <ReText variant="labelLarge" color="primary" style={styles.stepIndicator}>
          Passo 2 de 3
        </ReText>
        <ReText variant="displaySmall" weight="bold" style={styles.title}>
          Mostre seu rosto!
        </ReText>
        <ReText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Adicione uma foto para que seus amigos te reconheçam.
        </ReText>
      </View>

      {/* Photo Area */}
      <View style={styles.photoContainer}>
        {photoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity style={styles.editBadge} onPress={handleChoosePhoto}>
              <Icon name="pencil" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.placeholderContainer} onPress={handleChoosePhoto}>
            <Icon name="camera-plus" size={48} color={theme.custom.colors.textSecondary} />
            <ReText variant="bodyMedium" color="textSecondary" style={{ marginTop: 8 }}>
              Toque para adicionar
            </ReText>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!photoUri && (
          <>
            <ReButton
              label="TIRAR FOTO"
              variant="outline"
              onPress={handleTakePhoto}
              disabled={loading}
              fullWidth
              style={styles.actionButton}
              icon="camera"
            />
            <ReButton
              label="ESCOLHER DA GALERIA"
              variant="outline"
              onPress={handleChoosePhoto}
              disabled={loading}
              fullWidth
              style={styles.actionButton}
              icon="image"
            />
          </>
        )}

        {photoUri && (
          <ReButton
            label="CONTINUAR"
            onPress={handleNext}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.mainButton}
          />
        )}

        {!photoUri && (
          <ReButton
            label="Pular por enquanto"
            variant="ghost"
            onPress={onSkip}
            disabled={loading}
            fullWidth
            style={styles.skipButton}
          />
        )}
      </View>
    </ReScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.custom.spacing.l,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    marginBottom: theme.custom.spacing.xl,
  },
  backButton: {
    marginBottom: theme.custom.spacing.m,
    marginLeft: -theme.custom.spacing.xs,
    padding: theme.custom.spacing.xs,
  },
  stepIndicator: {
    marginBottom: theme.custom.spacing.s,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: theme.custom.spacing.xs,
  },
  subtitle: {
    maxWidth: '85%',
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.custom.spacing.xl,
  },
  previewContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: theme.custom.colors.surface,
    shadowColor: theme.custom.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.custom.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  placeholderContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.custom.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.custom.colors.background, // leve contraste
    borderStyle: 'dashed',
  },
  actions: {
    marginTop: theme.custom.spacing.l,
    gap: theme.custom.spacing.s,
  },
  actionButton: {
    marginBottom: theme.custom.spacing.xs,
  },
  mainButton: {
    marginBottom: theme.custom.spacing.l,
    shadowColor: theme.custom.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButton: {
    marginTop: theme.custom.spacing.s,
  },
});
