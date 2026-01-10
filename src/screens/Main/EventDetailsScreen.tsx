import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, StatusBar, Linking, Dimensions, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { theme } from '../../theme';
import { ReText } from '../../components/atoms/ReText';
import FastImage from 'react-native-fast-image';

// Componentes Animados
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

import { useEvents } from '../../hooks/useEvents';
import { useParticipation } from '../../hooks/useParticipation';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingScreen } from '../../components/LoadingScreen';

// Constantes de Layout
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 350;
const FOOTER_HEIGHT = 90;
const TABBAR_HEIGHT = 85;

interface EventDetailsScreenProps {
  navigation: any;
  route: any;
}

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ navigation, route }) => {
  const { eventId, initialData } = route.params;
  const insets = useSafeAreaInsets();

  // Hooks de Dados
  const { user } = useAuth();
  const { eventByIdQuery } = useEvents();
  const { eventParticipantsQuery, requestParticipationMutation } = useParticipation();

  const eventQuery = eventByIdQuery(eventId);
  const participantsQuery = eventParticipantsQuery(eventId);

  // OTIMIZAÇÃO: Usa dados do cache/preview enquanto carrega o full
  const event = eventQuery.data || initialData;
  const participants = participantsQuery.data || [];

  // Esconder TabBar ao entrar nesta tela
  useEffect(() => {
    const parent = navigation.getParent();
    if (parent) {
      parent.setOptions({ tabBarStyle: { display: 'none' } });
    }
    return () => {
      if (parent) {
        // Restaurar TabBar (com estilo original aproximado ou undefined pra resetar)
        parent.setOptions({
          tabBarStyle: {
            backgroundColor: theme.custom.colors.surface,
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 85,
            paddingTop: 12,
            paddingBottom: 25,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }
        });
      }
    };
  }, [navigation]);

  // Scroll Animation
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Estilos Animados
  const headerStyle = useAnimatedStyle(() => {
    // Se puxar para baixo (negativo), aumenta a altura para cobrir o buraco
    if (scrollY.value < 0) {
      return {
        height: HEADER_HEIGHT - scrollY.value, // Cresce o quanto puxou
        transform: [
          { translateY: 0 }, // Fica fixo no topo absoluto
          { scale: 1 + (scrollY.value * -1) / HEADER_HEIGHT } // Zoom sutil opcional
        ],
      };
    }

    // Se scrollar para cima (positivo), parallax normal
    return {
      height: HEADER_HEIGHT,
      transform: [
        {
          translateY: -scrollY.value * 0.5, // Parallax: sobe na metade da velocidade
        },
        { scale: 1 },
      ],
    };
  });

  const headerOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, HEADER_HEIGHT * 0.5], // Fade mais rápido
        [0, 0.8],
        Extrapolate.CLAMP
      ),
    };
  });

  // Lógica de Renderização Otimizada
  // Se não tiver nem dados de cache, nem initialData, aí sim mostra loading
  if (eventQuery.isLoading && !event) return <LoadingScreen message="Preparando detalhes..." />;
  if (!event) return <View style={styles.center}><ReText>Evento não encontrado.</ReText></View>;

  // Formatação de Data (com proteção para dados parciais)
  const eventDate = event.event_at ? new Date(event.event_at) : new Date();
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
  const time = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const fullDate = eventDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Ações
  const handleParticipation = () => {
    if (event.creator_id === user?.id) {
      navigation.navigate('ManageEvent', { eventId, eventTitle: event.title });
    } else {
      // Implementar lógica de solicitação (simplificada visualmente por enquanto)
      Alert.alert('Inscrição', 'Deseja confirmar sua presença?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => requestParticipationMutation.mutate(eventId) }
      ]);
    }
  };

  const isCreator = user?.id === event.creator_id;
  const isParticipant = participants.some((p: any) => p.user_id === user?.id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header Animado (Imagem) */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        <AnimatedFastImage
          source={{
            uri: event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable,
          }}
          style={[styles.headerImage, { backgroundColor: theme.custom.colors.textPrimary }]}
          resizeMode={FastImage.resizeMode.cover}
        />
        <Animated.View style={[styles.headerOverlay, headerOverlayStyle]} />
        <View style={styles.headerGradient} />
      </Animated.View>

      {/* Top Bar (Fixed) */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.iconButtonBlur}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButtonBlur}>
          <MaterialCommunityIcons name="share-variant" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo Scrollável */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 40, paddingBottom: FOOTER_HEIGHT + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyContainer}>
          {/* Header do Conteúdo */}
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              {/* Badges */}
              <View style={styles.badgesRow}>
                <View style={[styles.badge, styles.badgeCategory]}>
                  <ReText variant="labelLarge" color="primary" weight="700" size={10} style={{ letterSpacing: 0.5 }}>
                    {event.mode === 'networking' ? 'NETWORKING' : 'RESENHA'}
                  </ReText>
                </View>
                {isCreator && (
                  <View style={[styles.badge, styles.badgeCreator]}>
                    <ReText variant="labelLarge" color="textSecondary" size={10} weight="600">
                      ORGANIZADOR
                    </ReText>
                  </View>
                )}
              </View>

              <ReText variant="displaySmall" weight="800" style={styles.titleText}>
                {event.title}
              </ReText>
            </View>

            {/* Date Box */}
            <View style={styles.dateBox}>
              <ReText variant="labelLarge" color="primary" weight="700" size={11} style={{ marginBottom: -2 }}>
                {month}
              </ReText>
              <ReText variant="headlineMedium" color="textPrimary" weight="900" size={26} style={{ lineHeight: 30 }}>
                {day}
              </ReText>
            </View>
          </View>

          {/* Metadados Principais */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={22} color={theme.custom.colors.textSecondary} />
              </View>
              <View>
                <ReText variant="bodyMedium" weight="700" color="textPrimary">
                  {fullDate}
                </ReText>
                <ReText variant="bodySmall" color="textSecondary">
                  {time}h • Duração estimada de 4h
                </ReText>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="map-marker-outline" size={22} color={theme.custom.colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <ReText variant="bodyMedium" weight="700" color="textPrimary">
                  {event.address || 'Local a definir'}
                </ReText>
                <ReText variant="bodySmall" color="textSecondary">
                  {event.city || 'Cidade não informada'}
                </ReText>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Descrição */}
          <View style={styles.section}>
            <ReText variant="headlineMedium" weight="700" style={styles.sectionTitle}>
              Sobre o evento
            </ReText>
            <ReText variant="bodyMedium" color="textSecondary" style={{ lineHeight: 22 }}>
              {event.description || 'Sem descrição.'}
            </ReText>
          </View>

          <View style={styles.divider} />

          {/* Organizador */}
          <View style={styles.organizerRow}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              onPress={() => Alert.alert('Perfil Público', 'Em breve: Navegação para o perfil detalhado do organizador.')}
            >
              <Image
                source={{ uri: 'https://ui-avatars.com/api/?name=Pedro+Vieira&background=random' }}
                style={styles.organizerAvatar}
              />
              <View>
                <ReText variant="bodySmall" color="textSecondary">Organizado por</ReText>
                <ReText variant="bodyMedium" weight="700">Pedro Vieira</ReText>
                {/* Rating Placeholder */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFB800" />
                  <ReText variant="labelSmall" weight="700" style={{ marginLeft: 4 }}>4.9</ReText>
                  <ReText variant="labelSmall" color="textSecondary" style={{ marginLeft: 2 }}>(128 avaliações)</ReText>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.followButton}>
              <ReText variant="labelLarge" color="primary" weight="700">Seguir</ReText>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Mapa Estático */}
          {(event.latitude && event.longitude) ? (
            <View style={styles.section}>
              <ReText variant="headlineMedium" weight="700" style={styles.sectionTitle}>
                Localização
              </ReText>
              <View style={styles.mapContainer}>
                {/* Mapa Nativo (Apple/Google) Travado - Funciona como thumbnail interativo */}
                <MapView
                  style={styles.map}
                  pitchEnabled={false}
                  rotateEnabled={false}
                  zoomEnabled={false}
                  scrollEnabled={false}
                  initialRegion={{
                    latitude: Number(event.latitude),
                    longitude: Number(event.longitude),
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: Number(event.latitude),
                      longitude: Number(event.longitude)
                    }}
                    pinColor={theme.custom.colors.primary}
                  />
                </MapView>

                {/* Overlay invisível para capturar toque e abrir app nativo */}
                <TouchableOpacity
                  style={styles.mapOverlay}
                  activeOpacity={0.8}
                  onPress={() => {
                    const lat = event.latitude;
                    const lng = event.longitude;
                    const label = encodeURIComponent(event.title);
                    const url = Platform.select({
                      ios: `maps:?q=${label}&ll=${lat},${lng}`,
                      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`
                    });
                    Linking.openURL(url || '');
                  }}
                >
                  <View style={styles.openMapButton}>
                    <ReText variant="labelLarge" weight="700" color="surface">Abrir no Maps</ReText>
                    <MaterialCommunityIcons name="open-in-new" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                  </View>
                </TouchableOpacity>
              </View>
              <ReText variant="bodySmall" color="textSecondary" style={{ marginTop: 8, marginLeft: 4 }}>
                Toque no mapa para abrir a navegação.
              </ReText>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* Participantes */}
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ReText variant="headlineMedium" weight="700" style={styles.sectionTitle}>
                Participantes
              </ReText>
              {participants.length > 0 && (
                <ReText variant="bodyMedium" color="primary" weight="600">Ver todos</ReText>
              )}
            </View>

            {participants.length === 0 ? (
              <ReText variant="bodyMedium" color="textSecondary" style={{ fontStyle: 'italic' }}>Seja o primeiro a participar!</ReText>
            ) : (
              <View style={styles.participantsPreview}>
                {participants.slice(0, 5).map((p: any, index: number) => (
                  <Image
                    key={p.id}
                    source={{ uri: p.user?.avatar_url || `https://ui-avatars.com/api/?name=${p.user?.name || 'User'}` }}
                    style={[styles.participantAvatar, { marginLeft: index === 0 ? 0 : -12, zIndex: 10 - index }]}
                  />
                ))}
                {participants.length > 5 && (
                  <View style={[styles.participantMore, { marginLeft: -12, zIndex: 0 }]}>
                    <ReText variant="labelLarge" color="textSecondary" weight="700">+{participants.length - 5}</ReText>
                  </View>
                )}
              </View>
            )}
          </View>

        </View>
      </Animated.ScrollView>

      {/* Footer Fixo */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.priceContainer}>
          <ReText variant="bodySmall" color="textSecondary">Preço</ReText>
          <ReText variant="headlineMedium" weight="800" color="success">Grátis</ReText>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, isParticipant && styles.actionButtonOutline]}
          onPress={handleParticipation}
        >
          <ReText
            variant="bodyLarge"
            weight="700"
            color={isParticipant ? "primary" : "surface"}
          >
            {isCreator ? 'Gerenciar' : isParticipant ? 'Ingresso Garantido' : 'Quero Participar'}
          </ReText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.custom.colors.surface,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  // Header
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  iconButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  // Body
  bodyContainer: {
    backgroundColor: theme.custom.colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 800,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  titleText: {
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  badgesRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeCategory: {
    backgroundColor: `${theme.custom.colors.primary}15`,
  },
  badgeCreator: {
    backgroundColor: '#F3F4F6',
  },
  dateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.custom.colors.primary}10`,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 60,
  },
  // Metadata
  metaSection: {
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  // Organizer
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  followButton: {
    marginLeft: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: `${theme.custom.colors.primary}15`,
  },
  // Map
  mapContainer: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openMapButton: {
    backgroundColor: theme.custom.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Participants
  participantsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  participantMore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.custom.colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 1000,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  actionButton: {
    backgroundColor: theme.custom.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: theme.custom.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.custom.colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  }
});
