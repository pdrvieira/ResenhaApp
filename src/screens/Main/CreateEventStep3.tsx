import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Text, TextInput, Card, Divider, RadioButton, HelperText, Chip, SegmentedButtons, Modal, Portal, Surface } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { BRING_WHAT_OPTIONS, BringWhatType, EventMode, EventMetadata } from '../../services/supabase';
import {
  RESENHA_VIBES, RESENHA_LOCATIONS, RESENHA_TAGS,
  NETWORKING_AREAS, NETWORKING_PROFILES, NETWORKING_FORMATS, NETWORKING_TAGS
} from '../../constants/eventOptions';

type Audience = 'everyone' | 'adults_only' | 'invite_only';

interface Step3Data {
  audience: Audience;
  motivation?: string;
  bringWhat: BringWhatType;
  photoUri?: string;
  maxParticipants?: number;
  tags?: string[];
  metadata?: EventMetadata;
}

interface EventSummary {
  title: string;
  description: string;
  eventDate: Date;
  city: string;
  address: string;
}

interface CreateEventStep3Props {
  mode: EventMode; // Novo prop
  onFinish: (data: Step3Data) => void;
  onBack: () => void;
  eventSummary: EventSummary;
  loading?: boolean;
}

export const CreateEventStep3: React.FC<CreateEventStep3Props> = ({
  mode,
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Novos estados específicos
  const [tags, setTags] = useState<string[]>([]);
  // Resenha
  const [resenhaVibe, setResenhaVibe] = useState('chill');
  const [resenhaLocation, setResenhaLocation] = useState('home');
  // Networking
  const [networkingArea, setNetworkingArea] = useState('tech');
  const [networkingProfile, setNetworkingProfile] = useState('mixed');
  const [networkingFormat, setNetworkingFormat] = useState('open');

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

  // Revisar antes de finalizar
  const handleReview = () => {
    if (!validate()) return;
    setShowConfirmModal(true);
  };

  // Confirmar criação
  const handleConfirmCreation = () => {
    setShowConfirmModal(false);
    onFinish({
      audience,
      motivation: motivation.trim() || undefined,
      bringWhat,
      photoUri: photoUri || undefined,
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
      tags,
      metadata: mode === 'resenha' ? {
        vibe: resenhaVibe as any,
      } : {
        theme: motivation,
        area: networkingArea as any,
        profile: networkingProfile as any,
        format: networkingFormat as any,
      }
    });
  };

  const formattedDate = eventSummary.eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
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

        {/* Motivação / Agenda */}
        <Text style={styles.sectionTitle}>
          {mode === 'resenha' ? '💭 Motivação do Evento (opcional)' : '📅 Agenda / Objetivo (opcional)'}
        </Text>
        <TextInput
          value={motivation}
          onChangeText={setMotivation}
          placeholder={mode === 'resenha' ? "Ex: Celebrar o aniversário do João" : "Ex: Discutir tendências de mercado e happy hour"}
          mode="outlined"
          maxLength={200}
          style={styles.input}
        />
        <HelperText type="info" visible>
          {mode === 'resenha' ? 'Ajuda os participantes a entenderem o propósito' : 'Descreva brevemente a pauta ou objetivo do encontro'}
        </HelperText>

        {/* --- CAMPOS ESPECÍFICOS DE RESENHA --- */}
        {mode === 'resenha' && (
          <>
            <Text style={styles.sectionTitle}>🔥 Vibe da Resenha</Text>
            <SegmentedButtons
              value={resenhaVibe}
              onValueChange={setResenhaVibe}
              buttons={RESENHA_VIBES}
              style={styles.segmentedButton}
            />

            <Text style={styles.sectionTitle}>🏠 Tipo de Local</Text>
            <SegmentedButtons
              value={resenhaLocation}
              onValueChange={setResenhaLocation}
              buttons={RESENHA_LOCATIONS}
              style={styles.segmentedButton}
            />

            <Text style={styles.sectionTitle}>🏷️ Tags (selecione até 3)</Text>
            <View style={styles.tagsContainer}>
              {RESENHA_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  selected={tags.includes(tag)}
                  onPress={() => {
                    if (tags.includes(tag)) {
                      setTags(tags.filter(t => t !== tag));
                    } else if (tags.length < 3) {
                      setTags([...tags, tag]);
                    }
                  }}
                  style={styles.tagChip}
                  showSelectedCheck
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </>
        )}

        {/* --- CAMPOS ESPECÍFICOS DE NETWORKING --- */}
        {mode === 'networking' && (
          <>
            <Text style={styles.sectionTitle}>💼 Área Principal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {NETWORKING_AREAS.map((item) => (
                <Chip
                  key={item.value}
                  selected={networkingArea === item.value}
                  onPress={() => setNetworkingArea(item.value)}
                  style={styles.scrollChip}
                  showSelectedCheck
                  icon={item.icon}
                >
                  {item.label}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>🎯 Perfil Esperado</Text>
            <SegmentedButtons
              value={networkingProfile}
              onValueChange={setNetworkingProfile}
              buttons={NETWORKING_PROFILES}
              style={styles.segmentedButton}
            />

            <Text style={styles.sectionTitle}>🗣️ Formato</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {NETWORKING_FORMATS.map((item) => (
                <Chip
                  key={item.value}
                  selected={networkingFormat === item.value}
                  onPress={() => setNetworkingFormat(item.value)}
                  style={styles.scrollChip}
                  showSelectedCheck
                >
                  {item.label}
                </Chip>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>🏷️ Tags (selecione até 3)</Text>
            <View style={styles.tagsContainer}>
              {NETWORKING_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  selected={tags.includes(tag)}
                  onPress={() => {
                    if (tags.includes(tag)) {
                      setTags(tags.filter(t => t !== tag));
                    } else if (tags.length < 3) {
                      setTags([...tags, tag]);
                    }
                  }}
                  style={styles.tagChip}
                  showSelectedCheck
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </>
        )}

        {/* O que levar - Apenas para RESENHA */}
        {mode === 'resenha' && (
          <>
            <Text style={styles.sectionTitle}>🍾 O que levar?</Text>
            <Card style={styles.optionCard}>
              <RadioButton.Group onValueChange={(v) => setBringWhat(v as BringWhatType)} value={bringWhat}>
                {Object.entries(BRING_WHAT_OPTIONS).map(([key, value]) => (
                  <RadioButton.Item key={key} label={value.label} value={key} />
                ))}
              </RadioButton.Group>
            </Card>
          </>
        )}

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
            onPress={handleReview}
            loading={loading}
            disabled={loading}
            icon="check"
            style={styles.createButton}
          >
            Criar Evento
          </Button>
        </View>
      </ScrollView>

      {/* Modal de Confirmação */}
      <Portal>
        <Modal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="headlineSmall" style={styles.modalTitle}>Revisar Evento</Text>
              <Text variant="bodySmall" style={styles.modalSubtitle}>Tudo pronto para lançar?</Text>
            </View>

            <Divider style={styles.modalDivider} />

            <View style={styles.modalRow}>
              <Text style={styles.label}>Evento:</Text>
              <Text style={styles.valueBold}>{eventSummary.title}</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.label}>Modo:</Text>
              <Chip
                compact
                style={{ backgroundColor: mode === 'networking' ? '#e3f2fd' : '#fff3e0', alignSelf: 'flex-start' }}
                textStyle={{ color: mode === 'networking' ? '#1565c0' : '#e65100', fontWeight: 'bold', fontSize: 12 }}
              >
                {mode === 'networking' ? 'Networking' : 'Resenha'}
              </Chip>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.label}>Quando:</Text>
              <Text style={styles.value}>{formattedDate}</Text>
            </View>

            <View style={styles.modalRow}>
              <Text style={styles.label}>Onde:</Text>
              <Text style={styles.value}>{eventSummary.address}</Text>
            </View>

            {mode === 'resenha' ? (
              <View style={styles.modalRow}>
                <Text style={styles.label}>Vibe:</Text>
                <Text style={styles.value}>{RESENHA_VIBES.find(v => v.value === resenhaVibe)?.label}</Text>
              </View>
            ) : (
              <View style={styles.modalRow}>
                <Text style={styles.label}>Área:</Text>
                <Text style={styles.value}>{NETWORKING_AREAS.find(v => v.value === networkingArea)?.label}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={() => setShowConfirmModal(false)} style={styles.modalButton}>
                Voltar
              </Button>
              <Button mode="contained" onPress={handleConfirmCreation} style={styles.modalButton} contentStyle={{ backgroundColor: '#6200ee' }}>
                Confirmar e Criar 🚀
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </>
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
  segmentedButton: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagChip: {
    marginBottom: 4,
  },
  horizontalScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scrollChip: {
    marginRight: 8,
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
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    color: '#666',
  },
  modalDivider: {
    marginBottom: 16,
  },
  modalRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  valueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
    borderRadius: 8,
  },
});
