import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useMapEvents } from '../../hooks/useMapEvents';
import { EventPreviewCard } from '../../components/EventPreviewCard';
import { Event } from '../../services/supabase';

interface MapScreenProps {
    navigation: any;
}

const INITIAL_DELTA = {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
    const mapRef = useRef<MapView>(null);
    const { location, loading: locationLoading, refreshLocation } = useLocation();

    const [region, setRegion] = useState<Region | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const { events, loading: eventsLoading } = useMapEvents(region);

    // Quando região muda (debounced pelo onRegionChangeComplete)
    const handleRegionChange = useCallback((newRegion: Region) => {
        setRegion(newRegion);
        // Fechar card ao mover mapa
        if (selectedEvent) {
            setSelectedEvent(null);
        }
    }, [selectedEvent]);

    // Centralizar no usuário
    const handleCenterOnUser = useCallback(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                ...location,
                ...INITIAL_DELTA,
            }, 500);
        }
        refreshLocation();
    }, [location, refreshLocation]);

    // Clique no marcador
    const handleMarkerPress = useCallback((event: Event) => {
        setSelectedEvent(event);

        // Centralizar no evento
        if (mapRef.current && event.latitude && event.longitude) {
            mapRef.current.animateToRegion({
                latitude: event.latitude,
                longitude: event.longitude,
                ...INITIAL_DELTA,
            }, 300);
        }
    }, []);

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
    if (locationLoading && !location) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Obtendo localização...</Text>
            </View>
        );
    }

    const initialRegion = location ? {
        ...location,
        ...INITIAL_DELTA,
    } : {
        latitude: -15.7801,
        longitude: -47.9292,
        ...INITIAL_DELTA,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
                onRegionChangeComplete={handleRegionChange}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass
                rotateEnabled={false}
            >
                {events.map((event) => (
                    event.latitude && event.longitude && (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.latitude,
                                longitude: event.longitude,
                            }}
                            title={event.title}
                            onPress={() => handleMarkerPress(event)}
                        />
                    )
                ))}
            </MapView>

            {/* Botão centralizar */}
            <TouchableOpacity
                style={styles.centerButton}
                onPress={handleCenterOnUser}
                activeOpacity={0.8}
            >
                <Text style={styles.centerButtonText}>📍</Text>
            </TouchableOpacity>

            {/* Indicador de carregamento de eventos */}
            {eventsLoading && (
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#6200ee" />
                </View>
            )}

            {/* Contador de eventos */}
            <View style={styles.eventCounter}>
                <Text style={styles.eventCounterText}>
                    {events.length} evento{events.length !== 1 ? 's' : ''} na área
                </Text>
            </View>

            {/* Preview Card */}
            {selectedEvent && (
                <EventPreviewCard
                    event={selectedEvent}
                    userLocation={location}
                    onViewDetails={handleViewDetails}
                    onClose={handleClosePreview}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    centerButton: {
        position: 'absolute',
        bottom: 140,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    centerButtonText: {
        fontSize: 24,
    },
    loadingIndicator: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    eventCounter: {
        position: 'absolute',
        top: 16,
        alignSelf: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    eventCounterText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
});
