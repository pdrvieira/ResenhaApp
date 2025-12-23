import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { Event } from '../services/supabase';
import { getFormattedDistance } from '../utils/geo';

interface EventPreviewCardProps {
    event: Event;
    userLocation: { latitude: number; longitude: number } | null;
    onViewDetails: () => void;
    onClose: () => void;
}

export const EventPreviewCard: React.FC<EventPreviewCardProps> = ({
    event,
    userLocation,
    onViewDetails,
    onClose,
}) => {
    const eventDate = new Date(event.event_at);
    const formattedDate = eventDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });

    // Calcular distância
    const distance = getFormattedDistance(
        userLocation?.latitude ?? null,
        userLocation?.longitude ?? null,
        event.latitude,
        event.longitude
    );

    // Formatar tipo de entrada
    const getEntryLabel = () => {
        if (event.entry_type === 'free') return '🆓 Gratuito';
        if (event.entry_type === 'paid') return `💰 R$ ${event.entry_price?.toFixed(2).replace('.', ',')}`;
        if (event.entry_type === 'bring') return '🎒 Traga algo';
        return null;
    };

    return (
        <Surface style={styles.container} elevation={4}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                {event.image_url && (
                    <Image source={{ uri: event.image_url }} style={styles.image} />
                )}

                <View style={styles.info}>
                    <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
                        {event.title}
                    </Text>

                    <Text variant="bodySmall" style={styles.date}>
                        📅 {formattedDate}
                    </Text>

                    {distance && (
                        <Text variant="bodySmall" style={styles.distance}>
                            📍 {distance} de você
                        </Text>
                    )}

                    <View style={styles.tagsRow}>
                        {getEntryLabel() && (
                            <Chip compact style={styles.tag} textStyle={styles.tagText}>
                                {getEntryLabel()}
                            </Chip>
                        )}
                        {event.audience === 'adults_only' && (
                            <Chip compact style={styles.tagAdult} textStyle={styles.tagText}>
                                🔞 +18
                            </Chip>
                        )}
                    </View>
                </View>
            </View>

            <Button
                mode="contained"
                onPress={onViewDetails}
                style={styles.button}
                compact
            >
                Ver Detalhes
            </Button>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        fontSize: 14,
        color: '#666',
    },
    content: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        color: '#666',
        marginBottom: 2,
    },
    distance: {
        color: '#6200ee',
        fontWeight: '500',
        marginBottom: 4,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    tag: {
        height: 24,
        backgroundColor: '#f0f0f0',
    },
    tagAdult: {
        height: 24,
        backgroundColor: '#ffebee',
    },
    tagText: {
        fontSize: 11,
    },
    button: {
        borderRadius: 8,
    },
});
