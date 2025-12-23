import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Button, Text, TextInput, Card, Divider, RadioButton, HelperText } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type EntryType = 'free' | 'paid' | 'bring';
type Audience = 'everyone' | 'adults_only' | 'invite_only';

interface Step3Data {
  entryType: EntryType;
  entryPrice?: number;
  bringWhat?: string;
  audience: Audience;
  motivation?: string;
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
  const [entryType, setEntryType] = useState<EntryType>('free');
  const [entryPrice, setEntryPrice] = useState('');

  // Formatar preço no formato brasileiro (123,45)
  const formatPrice = (value: string): string => {
    // Remove tudo que não é número
    let numbers = value.replace(/\D/g, '');

    if (numbers === '') return '';

    // Limita a 7 dígitos (99999,99 = R$ 99.999,99)
    if (numbers.length > 7) numbers = numbers.slice(0, 7);

    // Converte para centavos e formata
    const cents = parseInt(numbers, 10);
    const reais = (cents / 100).toFixed(2);

    // Formata para padrão brasileiro
    return reais.replace('.', ',');
  };
  const [bringWhat, setBringWhat] = useState('');
  const [audience, setAudience] = useState<Audience>('everyone');
  const [motivation, setMotivation] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [maxParticipants, setMaxParticipants] = useState('');

  // Erros
  const [errors, setErrors] = useState<{
    entryPrice?: string;
    bringWhat?: string;
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

    // Validar preço se for pago
    if (entryType === 'paid') {
      if (!entryPrice.trim() || entryPrice === '0,00') {
        newErrors.entryPrice = 'Informe o valor do ingresso';
      } else {
        const price = parseFloat(entryPrice.replace(',', '.'));
        if (isNaN(price) || price <= 0) {
          newErrors.entryPrice = 'Valor deve ser maior que R$ 0,00';
        } else if (price < 1) {
          newErrors.entryPrice = 'Valor mínimo: R$ 1,00';
        } else if (price > 10000) {
          newErrors.entryPrice = 'Valor máximo: R$ 10.000,00';
        }
      }
    }

    // Validar o que trazer
    if (entryType === 'bring') {
      if (!bringWhat.trim()) {
        newErrors.bringWhat = 'Informe o que os participantes devem trazer';
      } else if (bringWhat.trim().length < 3) {
        newErrors.bringWhat = 'Seja mais específico';
      }
    }

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
              entryType,
              entryPrice: entryType === 'paid' ? parseFloat(entryPrice.replace(',', '.')) : undefined,
              bringWhat: entryType === 'bring' ? bringWhat.trim() : undefined,
              audience,
              motivation: motivation.trim() || undefined,
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

      {/* Tipo de Entrada */}
      <Text style={styles.sectionTitle}>💰 Tipo de Entrada *</Text>
      <Card style={styles.optionCard}>
        <RadioButton.Group onValueChange={(v) => setEntryType(v as EntryType)} value={entryType}>
          <RadioButton.Item label="Gratuito" value="free" />
          <RadioButton.Item label="Pago (com valor definido)" value="paid" />
          <RadioButton.Item label="Traga algo (bebida, comida, etc)" value="bring" />
        </RadioButton.Group>
      </Card>

      {/* Valor se pago */}
      {entryType === 'paid' && (
        <View style={styles.conditionalField}>
          <TextInput
            label="Valor do ingresso *"
            value={entryPrice}
            onChangeText={(t) => {
              const formatted = formatPrice(t);
              setEntryPrice(formatted);
              if (errors.entryPrice) setErrors({ ...errors, entryPrice: undefined });
            }}
            placeholder="0,00"
            keyboardType="number-pad"
            mode="outlined"
            error={!!errors.entryPrice}
            left={<TextInput.Affix text="R$" />}
            maxLength={9} // 99.999,99
          />
          <HelperText type={errors.entryPrice ? 'error' : 'info'} visible>
            {errors.entryPrice || 'Valor entre R$ 1,00 e R$ 10.000,00'}
          </HelperText>
        </View>
      )}

      {/* O que trazer */}
      {entryType === 'bring' && (
        <View style={styles.conditionalField}>
          <TextInput
            label="O que trazer? *"
            value={bringWhat}
            onChangeText={(t) => {
              setBringWhat(t);
              if (errors.bringWhat) setErrors({ ...errors, bringWhat: undefined });
            }}
            placeholder="Ex: 1 garrafa de bebida ou petiscos"
            mode="outlined"
            error={!!errors.bringWhat}
            maxLength={100}
          />
          <HelperText type="error" visible={!!errors.bringWhat}>
            {errors.bringWhat}
          </HelperText>
        </View>
      )}

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
  conditionalField: {
    marginTop: 8,
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
