import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { Event } from '../services/supabase';

interface EventPreviewCardProps {
    event: Event;
    onViewDetails: () => void;
    onClose: () => void;
}

export const EventPreviewCard: React.FC<EventPreviewCardProps> = ({
    event,
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

                    <Text variant="bodySmall" numberOfLines={1} style={styles.location}>
                        📍 {event.address}, {event.city}
                    </Text>

                    {event.max_participants && (
                        <Text variant="bodySmall" style={styles.participants}>
                            👥 Até {event.max_participants} pessoas
                        </Text>
                    )}
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
    location: {
        color: '#666',
        marginBottom: 2,
    },
    participants: {
        color: '#666',
    },
    button: {
        borderRadius: 8,
    },
});
