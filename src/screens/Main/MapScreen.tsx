import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useMapEvents } from '../../hooks/useMapEvents';
import { useMapFilters } from '../../hooks/useMapFilters';
import { EventPreviewCard } from '../../components/EventPreviewCard';
import { FilterBottomSheet } from '../../components/FilterBottomSheet';
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
    const [showFilters, setShowFilters] = useState(false);

    const { events, loading: eventsLoading } = useMapEvents(region);

    // Hook de filtros
    const {
        filters,
        updateFilter,
        resetFilters,
        filteredEvents,
        activeFiltersCount,
        hasActiveFilters,
    } = useMapFilters({ events, userLocation: location });

    // Quando região muda
    const handleRegionChange = useCallback((newRegion: Region) => {
        setRegion(newRegion);
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
                {/* Renderiza apenas eventos filtrados */}
                {filteredEvents.map((event) => (
                    event.latitude && event.longitude && (
                        <Marker
                            key={event.id}
                            coordinate={{
                                latitude: event.latitude,
                                longitude: event.longitude,
                            }}
                            title={event.title}
                            onPress={() => handleMarkerPress(event)}
                            pinColor={event.mode === 'networking' ? '#007AFF' : '#FF6D00'}
                            zIndex={selectedEvent?.id === event.id ? 10 : 1}
                        />
                    )
                ))}
            </MapView>

            {/* Header: Contador + Filtro */}
            <View style={styles.header}>
                <View style={styles.eventCounter}>
                    <Text style={styles.eventCounterText}>
                        {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
                        {hasActiveFilters && ` (filtrado de ${events.length})`}
                    </Text>
                </View>
            </View>

            {/* Botão de Filtros */}
            <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
                activeOpacity={0.8}
            >
                <Text style={styles.filterButtonText}>⚙️</Text>
                {hasActiveFilters && (
                    <Badge style={styles.filterBadge} size={18}>
                        {activeFiltersCount}
                    </Badge>
                )}
            </TouchableOpacity>

            {/* Botão centralizar */}
            <TouchableOpacity
                style={styles.centerButton}
                onPress={handleCenterOnUser}
                activeOpacity={0.8}
            >
                <Text style={styles.centerButtonText}>📍</Text>
            </TouchableOpacity>

            {/* Indicador de carregamento */}
            {eventsLoading && (
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="small" color="#6200ee" />
                </View>
            )}

            {/* Preview Card */}
            {selectedEvent && (
                <EventPreviewCard
                    event={selectedEvent}
                    userLocation={location}
                    onViewDetails={handleViewDetails}
                    onClose={handleClosePreview}
                />
            )}

            {/* Bottom Sheet de Filtros */}
            <FilterBottomSheet
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onUpdateFilter={updateFilter}
                onReset={resetFilters}
                activeCount={activeFiltersCount}
            />
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
    header: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    eventCounter: {
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
    filterButton: {
        position: 'absolute',
        top: 60,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    filterButtonText: {
        fontSize: 22,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#ff5252',
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
        top: 120,
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
});
