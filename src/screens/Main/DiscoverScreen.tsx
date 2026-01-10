import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocation } from '../../hooks/useLocation';
import { useMapEvents } from '../../hooks/useMapEvents';
import { useMapFilters } from '../../hooks/useMapFilters';
import { FloatingHeader } from '../../components/organisms/FloatingHeader';
import { InteractiveBottomSheet } from '../../components/organisms/InteractiveBottomSheet';
import { Event } from '../../services/supabase';
import { theme } from '../../theme';

// Atomic Components
import { ReText } from '../../components/atoms/ReText';

interface DiscoverScreenProps {
    navigation: any;
}

const INITIAL_DELTA = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const DiscoverScreen: React.FC<DiscoverScreenProps & { route: any }> = ({ navigation, route }) => {
    const mapRef = useRef<MapView>(null);
    const selectionTimerRef = useRef<NodeJS.Timeout | null>(null); // P4: Debounce
    const { location, loading: locationLoading, refreshLocation } = useLocation();

    const [region, setRegion] = useState<Region | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [sheetIndex, setSheetIndex] = useState(0); // 0=20%, 1=50%, 2=80%

    // Estados para o FloatingHeader
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const { events, loading: eventsLoading } = useMapEvents(region);

    // Hook de filtros (preservado)
    const {
        filteredEvents,
        hasActiveFilters,
    } = useMapFilters({ events, userLocation: location });

    // Toggle de filtro
    const handleFilterToggle = useCallback((filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId)
                ? prev.filter((id) => id !== filterId)
                : [...prev, filterId]
        );
    }, []);

    // Quando região muda (apenas atualiza a região, não afeta o preview)
    const handleRegionChange = useCallback((newRegion: Region) => {
        setRegion(newRegion);
    }, []);

    // Centralizar no usuário
    const handleCenterOnUser = useCallback(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                ...location,
                ...INITIAL_DELTA,
            }, 500);
        }
    }, [location, refreshLocation]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (selectionTimerRef.current) {
                clearTimeout(selectionTimerRef.current);
            }
        };
    }, []);



    // Clique no marcador - anima mapa e abre preview
    const handleMarkerPress = useCallback((event: Event) => {
        // P4: Cancela timer anterior se existir (previne race conditions)
        if (selectionTimerRef.current) {
            clearTimeout(selectionTimerRef.current);
        }

        // P2: Se já tem outro evento selecionado, aguardar um pouco para transição suave
        const delay = selectedEvent ? 100 : 0;

        selectionTimerRef.current = setTimeout(() => {
            setSelectedEvent(event);

            if (mapRef.current && event.latitude && event.longitude) {
                mapRef.current.animateToRegion({
                    latitude: event.latitude,
                    longitude: event.longitude,
                    ...INITIAL_DELTA,
                }, 450); // Animação suave (padrão Apple Maps)
            }
        }, delay);
    }, [selectedEvent]);

    // Ver detalhes do evento
    const handleViewDetails = useCallback(() => {
        if (selectedEvent) {
            navigation.navigate('EventDetails', { eventId: selectedEvent.id });
        }
    }, [selectedEvent, navigation]);

    // Fechar preview
    const handleClosePreview = useCallback(() => {
        setSelectedEvent(null);
    }, []);

    // Loading inicial
    // Efeito para "Fresh Start" ao clicar na Tab Descobrir novamente
    useEffect(() => {
        if (route.params?.resetAction) {
            handleClosePreview();
        }
    }, [route.params?.resetAction, handleClosePreview]);

    if (locationLoading && !location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.custom.colors.primary} />
                <ReText variant="bodyMedium" color="textSecondary" style={styles.loadingText}>
                    Obtendo localização...
                </ReText>
            </View>
        );
    }

    const initialRegion = location
        ? { ...location, ...INITIAL_DELTA }
        : { latitude: -15.7801, longitude: -47.9292, ...INITIAL_DELTA };

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Camada 0: Mapa Vivo (Fundo) */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                onRegionChangeComplete={handleRegionChange}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                rotateEnabled={false}
            >
                {filteredEvents.map((event) =>
                    event.latitude && event.longitude ? (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.latitude,
                                longitude: event.longitude,
                            }}
                            title={event.title}
                            onPress={() => handleMarkerPress(event)}
                            pinColor={event.mode === 'networking' ? '#007AFF' : theme.custom.colors.primary}
                            zIndex={selectedEvent?.id === event.id ? 10 : 1}
                        />
                    ) : null
                )}
            </MapView>

            {/* Camada 1: Header Flutuante */}
            <FloatingHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
            />

            {/* Botão Centralizar Localização - sempre visível, coberto naturalmente pelo BottomSheet */}
            <TouchableOpacity
                style={styles.centerButton}
                onPress={handleCenterOnUser}
                activeOpacity={0.8}
            >
                <Icon name="crosshairs-gps" size={24} color={theme.custom.colors.primary} />
            </TouchableOpacity>

            {/* Indicador de Carregamento */}
            {eventsLoading && (
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color={theme.custom.colors.primary} />
                </View>
            )}

            {/* Camada 2: Bottom Sheet Interativo - renderizado por ÚLTIMO para ficar por cima de tudo */}
            <InteractiveBottomSheet
                events={filteredEvents.map(e => ({
                    id: e.id,
                    title: e.title,
                    location: e.address,
                    date: e.event_at ? new Date(e.event_at).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) : undefined,
                    imageUrl: e.image_url,
                    category: e.mode === 'networking' ? 'Networking' : 'Resenha',
                    description: e.description,
                    eventDate: e.event_at, // Passa timestamp original para Date Box
                }))}
                selectedEvent={selectedEvent ? {
                    id: selectedEvent.id,
                    title: selectedEvent.title,
                    location: selectedEvent.address,
                    date: selectedEvent.event_at ? new Date(selectedEvent.event_at).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) : undefined,
                    imageUrl: selectedEvent.image_url,
                    category: selectedEvent.mode === 'networking' ? 'Networking' : 'Resenha',
                    description: selectedEvent.description,
                    eventDate: selectedEvent.event_at, // Adicionando a data crua aqui também!
                } : null}
                isLoading={eventsLoading}
                onEventPress={(event) => {
                    const fullEvent = filteredEvents.find(e => e.id === event.id);
                    if (fullEvent) handleMarkerPress(fullEvent);
                }}
                onEventClose={handleClosePreview}
                onIndexChange={setSheetIndex}
                onParticipate={(event) => {
                    // TODO: Implementar lógica de participação
                    console.log('Participar:', event.id);
                }}
                onViewDetails={(event) => {
                    // Passa os dados já prontos para renderização instantânea
                    navigation.navigate('EventDetails', {
                        eventId: event.id,
                        initialData: {
                            ...selectedEvent, // Dados crus do evento (Event type)
                            // Garantir que campos cruciais para o render inicial estejam aqui
                            title: event.title,
                            image_url: event.imageUrl,
                            event_at: event.eventDate,
                            address: event.location
                        }
                    });
                }}
                resetSignal={route.params?.resetAction}
            />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.custom.colors.background,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.custom.colors.background,
    },
    loadingText: {
        marginTop: 12,
    },

    // Botões Flutuantes
    centerButton: {
        position: 'absolute',
        bottom: 220,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.custom.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 3,
        zIndex: 1, // Baixo para ficar abaixo do BottomSheet
    },
    loadingIndicator: {
        position: 'absolute',
        top: 130,
        alignSelf: 'center',
        backgroundColor: theme.custom.colors.surface,
        padding: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 5,
    },
});
