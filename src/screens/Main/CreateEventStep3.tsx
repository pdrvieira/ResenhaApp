import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Button, Text, TextInput, Card, Divider, RadioButton, HelperText } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { BRING_WHAT_OPTIONS, BringWhatType } from '../../services/supabase';

type Audience = 'everyone' | 'adults_only' | 'invite_only';

interface Step3Data {
  audience: Audience;
  motivation?: string;
  bringWhat: BringWhatType;
  photoUri?: string;
  maxParticipants?: number;
}

interface EventSummary {
  title: string;
  description: string;
  eventDate: Date;
  city: string;
  address: string;
}

interface CreateEventStep3Props {
  onFinish: (data: Step3Data) => void;
  onBack: () => void;
  eventSummary: EventSummary;
  loading?: boolean;
}

export const CreateEventStep3: React.FC<CreateEventStep3Props> = ({
  onFinish,
  onBack,
  eventSummary,
  loading = false
}) => {
  // Estados principais
  const [audience, setAudience] = useState<Audience>('everyone');
  const [motivation, setMotivation] = useState('');
  const [bringWhat, setBringWhat] = useState<BringWhatType>('nothing');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [maxParticipants, setMaxParticipants] = useState('');

  // Erros
  const [errors, setErrors] = useState<{
    maxParticipants?: string;
  }>({});

  // Handlers de foto
  const handleTakePhoto = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, maxWidth: 1200, maxHeight: 1200 },
      (response) => {
        if (response.assets?.[0]?.uri) {
          setPhotoUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleChoosePhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: 1200, maxHeight: 1200, selectionLimit: 1 },
      (response) => {
        if (response.assets?.[0]?.uri) {
          setPhotoUri(response.assets[0].uri);
        }
      }
    );
  };

  // Validação
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // Validar limite de participantes
    if (maxParticipants.trim()) {
      const num = parseInt(maxParticipants, 10);
      if (isNaN(num) || num < 2) {
        newErrors.maxParticipants = 'Mínimo 2 participantes';
      } else if (num > 10000) {
        newErrors.maxParticipants = 'Máximo 10.000 participantes';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Finalizar
  const handleFinish = () => {
    if (!validate()) return;

    Alert.alert(
      'Confirmar Criação',
      `Deseja criar o evento "${eventSummary.title}"?`,
      [
        { text: 'Revisar', style: 'cancel' },
        {
          text: 'Criar Evento',
          onPress: () => {
            onFinish({
              audience,
              motivation: motivation.trim() || undefined,
              bringWhat,
              photoUri: photoUri || undefined,
              maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
            });
          }
        },
      ]
    );
  };

  const formattedDate = eventSummary.eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Criar Evento
        </Text>
        <Text style={styles.stepIndicator}>Passo 3 de 3</Text>
        <Text style={styles.subtitle}>
          Detalhes importantes
        </Text>
      </View>

      {/* Resumo */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.cardTitle}>📋 Resumo</Text>
          <Divider style={styles.divider} />
          <Text style={styles.summaryText}>📝 {eventSummary.title}</Text>
          <Text style={styles.summaryText}>📅 {formattedDate}</Text>
          <Text style={styles.summaryText}>📍 {eventSummary.address}, {eventSummary.city}</Text>
        </Card.Content>
      </Card>

      {/* Público */}
      <Text style={styles.sectionTitle}>👥 Quem pode participar? *</Text>
      <Card style={styles.optionCard}>
        <RadioButton.Group onValueChange={(v) => setAudience(v as Audience)} value={audience}>
          <RadioButton.Item label="Todos (aberto)" value="everyone" />
          <RadioButton.Item label="Apenas maiores de 18" value="adults_only" />
          <RadioButton.Item label="Somente convidados" value="invite_only" />
        </RadioButton.Group>
      </Card>

      {/* Motivação */}
      <Text style={styles.sectionTitle}>💭 Motivação do Evento (opcional)</Text>
      <TextInput
        value={motivation}
        onChangeText={setMotivation}
        placeholder="Ex: Celebrar o aniversário do João"
        mode="outlined"
        maxLength={200}
        style={styles.input}
      />
      <HelperText type="info" visible>
        Ajuda os participantes a entenderem o propósito
      </HelperText>

      {/* O que levar */}
      <Text style={styles.sectionTitle}>🍾 O que levar?</Text>
      <Card style={styles.optionCard}>
        <RadioButton.Group onValueChange={(v) => setBringWhat(v as BringWhatType)} value={bringWhat}>
          {Object.entries(BRING_WHAT_OPTIONS).map(([key, value]) => (
            <RadioButton.Item key={key} label={value.label} value={key} />
          ))}
        </RadioButton.Group>
      </Card>

      {/* Foto */}
      <Text style={styles.sectionTitle}>📷 Foto do Evento (opcional)</Text>
      {photoUri ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <Button mode="text" onPress={() => setPhotoUri(null)} icon="close">
            Remover
          </Button>
        </View>
      ) : (
        <View style={styles.photoButtons}>
          <Button mode="outlined" onPress={handleTakePhoto} icon="camera" style={styles.photoButton}>
            Câmera
          </Button>
          <Button mode="outlined" onPress={handleChoosePhoto} icon="image" style={styles.photoButton}>
            Galeria
          </Button>
        </View>
      )}

      {/* Limite */}
      <Text style={styles.sectionTitle}>🎫 Limite de Vagas (opcional)</Text>
      <TextInput
        value={maxParticipants}
        onChangeText={(t) => {
          setMaxParticipants(t.replace(/[^0-9]/g, ''));
          if (errors.maxParticipants) setErrors({ ...errors, maxParticipants: undefined });
        }}
        placeholder="Ex: 50"
        keyboardType="number-pad"
        mode="outlined"
        error={!!errors.maxParticipants}
        left={<TextInput.Icon icon="account-group" />}
      />
      <HelperText type={errors.maxParticipants ? 'error' : 'info'} visible>
        {errors.maxParticipants || 'Deixe em branco para não ter limite'}
      </HelperText>

      {/* Botões */}
      <View style={styles.footer}>
        <Button mode="outlined" onPress={onBack} disabled={loading} style={styles.backButton}>
          Voltar
        </Button>
        <Button
          mode="contained"
          onPress={handleFinish}
          loading={loading}
          disabled={loading}
          icon="check"
          style={styles.createButton}
        >
          Criar Evento
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepIndicator: {
    textAlign: 'center',
    color: '#6200ee',
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontSize: 16,
  },
  summaryCard: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  summaryText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  optionCard: {
    backgroundColor: '#fafafa',
  },
  input: {
    marginBottom: 0,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    borderRadius: 8,
  },
  createButton: {
    flex: 2,
    borderRadius: 8,
  },
});
