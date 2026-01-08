import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { EventMode } from '../../services/supabase';

interface CreateEventModeScreenProps {
    onSelectMode: (mode: EventMode) => void;
}

export const CreateEventModeScreen: React.FC<CreateEventModeScreenProps> = ({ onSelectMode }) => {
    const theme = useTheme();

    const renderOption = (
        mode: EventMode,
        title: string,
        description: string,
        emoji: string,
        color: string
    ) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onSelectMode(mode)}
            style={styles.optionContainer}
        >
            <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 6 }]}>
                <Card.Content style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                        <Text style={styles.emoji}>{emoji}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text variant="titleMedium" style={styles.title}>{title}</Text>
                        <Text variant="bodyMedium" style={styles.description}>{description}</Text>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={styles.headerTitle}>
                    Criar Evento
                </Text>
                <Text style={styles.headerSubtitle}>
                    Que tipo de evento você quer criar hoje?
                </Text>
            </View>

            <View style={styles.optionsList}>
                {renderOption(
                    'resenha',
                    'Resenha',
                    'Festas, encontros, churrascos e rolês de boa. O foco é curtir e socializar.',
                    '🎉',
                    '#6200ee' // Roxo Resenha
                )}

                {renderOption(
                    'networking',
                    'Networking',
                    'Troca de ideias, negócios e conexões profissionais. O foco é crescer.',
                    '🤝',
                    '#007AFF' // Azul Networking
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        flexGrow: 1,
    },
    header: {
        marginBottom: 32,
    },
    headerTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        color: '#666',
        fontSize: 16,
    },
    optionsList: {
        gap: 16,
    },
    optionContainer: {
        marginBottom: 16,
    },
    card: {
        elevation: 2,
        backgroundColor: '#fff',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    emoji: {
        fontSize: 28,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        color: '#555',
        lineHeight: 20,
    },
});
