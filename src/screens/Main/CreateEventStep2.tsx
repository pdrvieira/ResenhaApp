import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText, ActivityIndicator, Chip, Checkbox } from 'react-native-paper';
import MapView, { Marker, Region } from 'react-native-maps';
import { geocodeAddress } from '../../services/geocoding';

interface Step2Data {
  city: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface CreateEventStep2Props {
  onNext: (data: Step2Data) => void;
  onBack: () => void;
  initialData?: Partial<Step2Data>;
}

// Validação de cidade brasileira (lista básica de padrões)
const validateCity = (city: string): string | null => {
  const trimmed = city.trim();

  if (!trimmed) return 'Cidade é obrigatória';
  if (trimmed.length < 3) return 'Nome da cidade muito curto';
  if (trimmed.length > 50) return 'Nome da cidade muito longo';
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed)) return 'Cidade deve conter apenas letras';

  return null;
};

// Validação de endereço
const validateAddress = (address: string): string | null => {
  const trimmed = address.trim();

  if (!trimmed) return 'Endereço é obrigatório';
  if (trimmed.length < 10) return 'Endereço muito curto (mín. 10 caracteres)';
  if (trimmed.length > 150) return 'Endereço muito longo';
  if (!/\d/.test(trimmed)) return 'Endereço deve conter um número';
  if (!/[a-zA-ZÀ-ÿ]/.test(trimmed)) return 'Endereço deve conter nome da rua';

  // Verifica se parece um endereço real (tem rua/av/praça + número)
  const addressPatterns = [
    /rua|avenida|av\.|praça|travessa|alameda|estrada|rodovia|largo/i,
    /\d+/,
  ];

  const hasStreetType = addressPatterns[0].test(trimmed);
  if (!hasStreetType) {
    return 'Use formato: Rua/Av. Nome, Número';
  }

  return null;
};

export const CreateEventStep2: React.FC<CreateEventStep2Props> = ({ onNext, onBack, initialData }) => {
  const [city, setCity] = useState(initialData?.city || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ city?: string; address?: string }>({});
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [geocodeAttempted, setGeocodeAttempted] = useState(false);

  // Região do mapa
  const mapRegion: Region | undefined = latitude && longitude ? {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : undefined;

  // Reset confirmação quando endereço muda
  useEffect(() => {
    setLocationConfirmed(false);
    setGeocodeAttempted(false);
  }, [city, address]);

  // Geocoding manual (não automático para evitar requests desnecessários)
  const performGeocoding = async () => {
    // Validar antes de geocodar
    const cityError = validateCity(city);
    const addressError = validateAddress(address);

    if (cityError || addressError) {
      setErrors({ city: cityError || undefined, address: addressError || undefined });
      return;
    }

    setGeocoding(true);
    setGeocodeError(null);
    setGeocodeAttempted(true);

    try {
      const result = await geocodeAddress(address.trim(), city.trim(), 'Brazil');

      if (result) {
        // Validar se o resultado faz sentido (está no Brasil)
        if (result.latitude < -33.75 || result.latitude > 5.27 ||
          result.longitude < -73.99 || result.longitude > -34.79) {
          setGeocodeError('Localização fora do Brasil. Verifique o endereço.');
          setLatitude(null);
          setLongitude(null);
        } else {
          setLatitude(result.latitude);
          setLongitude(result.longitude);
          setGeocodeError(null);
        }
      } else {
        setLatitude(null);
        setLongitude(null);
        setGeocodeError('Endereço não encontrado. Verifique e tente novamente.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodeError('Erro ao buscar localização. Tente novamente.');
      setLatitude(null);
      setLongitude(null);
    } finally {
      setGeocoding(false);
    }
  };

  // Permite ajustar localização tocando no mapa
  const handleMapPress = (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;

    // Validar se está no Brasil
    if (lat < -33.75 || lat > 5.27 || lng < -73.99 || lng > -34.79) {
      Alert.alert('Localização Inválida', 'Selecione um local dentro do Brasil.');
      return;
    }

    setLatitude(lat);
    setLongitude(lng);
    setLocationConfirmed(false);
  };

  const handleNext = () => {
    // Validações finais
    const cityError = validateCity(city);
    const addressError = validateAddress(address);

    if (cityError || addressError) {
      setErrors({ city: cityError || undefined, address: addressError || undefined });
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert(
        'Localização Necessária',
        'Clique em "Buscar no Mapa" para localizar o endereço.',
      );
      return;
    }

    if (!locationConfirmed) {
      Alert.alert(
        'Confirme a Localização',
        'Verifique se o pin está no local correto e marque a caixa de confirmação.',
      );
      return;
    }

    onNext({
      city: city.trim(),
      address: address.trim(),
      latitude,
      longitude,
    });
  };

  const handleCityChange = (text: string) => {
    setCity(text);
    if (errors.city) {
      const error = validateCity(text);
      setErrors({ ...errors, city: error || undefined });
    }
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);
    if (errors.address) {
      const error = validateAddress(text);
      setErrors({ ...errors, address: error || undefined });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Criar Evento
          </Text>
          <Text style={styles.stepIndicator}>Passo 2 de 3</Text>
          <Text style={styles.subtitle}>
            Onde será o evento?
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Cidade *"
            value={city}
            onChangeText={handleCityChange}
            placeholder="Ex: Lagoa Santa"
            style={styles.input}
            mode="outlined"
            error={!!errors.city}
            maxLength={50}
          />
          <HelperText type="error" visible={!!errors.city}>
            {errors.city}
          </HelperText>

          <TextInput
            label="Endereço completo *"
            value={address}
            onChangeText={handleAddressChange}
            placeholder="Rua das Flores, 123, Centro"
            style={styles.input}
            mode="outlined"
            error={!!errors.address}
            maxLength={150}
          />
          <HelperText type={errors.address ? 'error' : 'info'} visible>
            {errors.address || 'Formato: Rua/Av. Nome, Número, Bairro'}
          </HelperText>

          {/* Botão de busca */}
          <Button
            mode="contained-tonal"
            onPress={performGeocoding}
            loading={geocoding}
            disabled={geocoding || !city.trim() || !address.trim()}
            icon="map-search"
            style={styles.searchButton}
          >
            Buscar no Mapa
          </Button>

          {/* Status do geocoding */}
          <View style={styles.geocodeStatus}>
            {geocoding && (
              <View style={styles.geocodingRow}>
                <ActivityIndicator size="small" />
                <Text style={styles.geocodingText}>Localizando endereço...</Text>
              </View>
            )}

            {!geocoding && latitude && longitude && (
              <Chip icon="check" style={styles.successChip}>
                Localização encontrada
              </Chip>
            )}

            {!geocoding && geocodeAttempted && geocodeError && (
              <Chip icon="alert" style={styles.errorChip}>
                {geocodeError}
              </Chip>
            )}
          </View>

          {/* Preview do mapa */}
          {(latitude && longitude) ? (
            <>
              <Text style={styles.sectionLabel}>
                Confirme a localização no mapa
              </Text>

              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={mapRegion}
                  onPress={handleMapPress}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  <Marker
                    coordinate={{ latitude, longitude }}
                    draggable
                    onDragEnd={(e) => {
                      const coord = e.nativeEvent.coordinate;
                      if (coord.latitude < -33.75 || coord.latitude > 5.27 ||
                        coord.longitude < -73.99 || coord.longitude > -34.79) {
                        Alert.alert('Localização Inválida', 'O local deve estar no Brasil.');
                        return;
                      }
                      setLatitude(coord.latitude);
                      setLongitude(coord.longitude);
                      setLocationConfirmed(false);
                    }}
                  />
                </MapView>
              </View>

              <HelperText type="info" visible>
                Arraste o pin vermelho se necessário
              </HelperText>

              {/* Confirmação obrigatória */}
              <View style={styles.confirmRow}>
                <Checkbox.Android
                  status={locationConfirmed ? 'checked' : 'unchecked'}
                  onPress={() => setLocationConfirmed(!locationConfirmed)}
                />
                <Text
                  style={styles.confirmText}
                  onPress={() => setLocationConfirmed(!locationConfirmed)}
                >
                  Confirmo que o pin está no local correto
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                Preencha cidade e endereço e clique em "Buscar no Mapa"
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={onBack}
            style={styles.backButton}
          >
            Voltar
          </Button>

          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            disabled={geocoding || !locationConfirmed}
          >
            Próximo
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120, // Espaço para TabBar
  },
  header: {
    marginBottom: 24,
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
  form: {
    flex: 1,
  },
  input: {
    marginBottom: 0,
  },
  searchButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  geocodeStatus: {
    marginBottom: 8,
  },
  geocodingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  geocodingText: {
    color: '#666',
  },
  successChip: {
    backgroundColor: '#e8f5e9',
    alignSelf: 'flex-start',
  },
  errorChip: {
    backgroundColor: '#ffebee',
    alignSelf: 'flex-start',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  mapPlaceholderText: {
    color: '#666',
    textAlign: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 4,
    paddingRight: 12,
  },
  confirmText: {
    flex: 1,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20, // Espaço extra
  },
  backButton: {
    flex: 1,
    borderRadius: 8,
  },
  nextButton: {
    flex: 2,
    borderRadius: 8,
  },
});
