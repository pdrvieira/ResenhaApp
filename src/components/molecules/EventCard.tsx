import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ViewStyle,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { ReText } from '../atoms/ReText';

interface EventCardProps {
    variant: 'horizontal' | 'vertical';
    title: string;
    location: string;
    date: string;
    eventDate?: Date | string; // Para o Date Box
    imageUrl?: string;
    category?: string;
    attendeesCount?: number;
    onPress?: () => void;
    style?: ViewStyle;
}

// Placeholder image quando não há imagem do evento
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop';

export const EventCard: React.FC<EventCardProps> = ({
    variant,
    title,
    location,
    date,
    eventDate,
    imageUrl,
    category,
    attendeesCount,
    onPress,
    style,
}) => {
    const isHorizontal = variant === 'horizontal';

    // Formata dia e mês para o Date Box (apenas horizontal)
    const dateObj = eventDate ? new Date(eventDate) : null;
    const day = dateObj ? dateObj.getDate() : '';
    const month = dateObj ? dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '') : '';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isHorizontal ? styles.containerHorizontal : styles.containerVertical,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            {/* Imagem */}
            <View style={isHorizontal ? styles.imageContainerHorizontal : styles.imageContainerVertical}>
                <FastImage
                    source={{ uri: imageUrl || PLACEHOLDER_IMAGE }}
                    style={isHorizontal ? styles.imageHorizontal : styles.imageVertical}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {/* Badge de categoria - Glass Style */}
                {category && (
                    <View style={styles.categoryBadge}>
                        <ReText variant="bodyMedium" color="surface" weight="800" style={styles.categoryText}>
                            {category.toUpperCase()}
                        </ReText>
                    </View>
                )}
            </View>

            {/* Conteúdo */}
            <View style={isHorizontal ? styles.contentHorizontal : styles.contentVertical}>
                <View style={styles.mainInfo}>
                    {/* Título */}
                    <ReText
                        variant="bodyLarge"
                        weight="800"
                        numberOfLines={isHorizontal ? 1 : 2}
                        style={styles.title}
                        color="textPrimary"
                    >
                        {title}
                    </ReText>

                    {/* Localização Simplificada */}
                    <View style={styles.infoRow}>
                        <ReText
                            variant="bodyMedium"
                            color="textSecondary"
                            numberOfLines={1}
                            style={styles.locationText}
                        >
                            {location}
                        </ReText>
                    </View>

                    {/* Participantes ou Horário (se não tiver Date Box) */}
                    {attendeesCount !== undefined && attendeesCount > 0 ? (
                        <View style={styles.attendeesRow}>
                            <View style={styles.attendeesDot} />
                            <ReText variant="bodyMedium" size={12} color="primary" weight="600">
                                {attendeesCount} pessoa{attendeesCount !== 1 ? 's' : ''}
                            </ReText>
                        </View>
                    ) : (
                        <ReText variant="bodyMedium" size={12} color="textSecondary" style={{ marginTop: 4 }}>
                            {date.split(',')[0]} • {date.split('às')[1] || date.split(',')[2] || ''}
                        </ReText>
                    )}
                </View>

                {/* Date Box (Apenas Horizontal) */}
                {isHorizontal && dateObj && (
                    <View style={styles.dateBox}>
                        <ReText variant="labelLarge" size={10} weight="700" color="primary" style={styles.dateMonth}>
                            {month}
                        </ReText>
                        <ReText variant="headlineMedium" size={20} weight="900" color="textPrimary" style={styles.dateDay}>
                            {day}
                        </ReText>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Container base
    container: {
        backgroundColor: theme.custom.colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
    },

    // Variante Horizontal (Moderna, Flat, Clean)
    containerHorizontal: {
        flexDirection: 'row',
        height: 90, // Altura compacta
        marginBottom: 8,
        backgroundColor: 'transparent', // Remove fundo branco card-like para parecer lista
    },
    imageContainerHorizontal: {
        width: 90,
        height: 90,
        borderRadius: 16,
        overflow: 'hidden',
    },
    imageHorizontal: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    contentHorizontal: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 16,
        paddingRight: 4,
        alignItems: 'center',
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    dateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${theme.custom.colors.primary}10`, // Tint leve
        borderRadius: 12,
        width: 50,
        height: 56,
        marginLeft: 8,
    },
    dateMonth: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: -2,
    },
    dateDay: {
        fontSize: 20,
        lineHeight: 24,
    },

    // Variante Vertical (Card Clássico)
    containerVertical: {
        width: 200,
        marginRight: 16,
        backgroundColor: theme.custom.colors.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    imageContainerVertical: {
        width: '100%',
        height: 140,
    },
    imageVertical: {
        width: '100%',
        height: '100%',
    },
    contentVertical: {
        padding: 12,
    },

    // Badges & Elementos
    categoryBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(0,0,0,0.5)', // Degradê sutil em baixo seria ideal, mas sólido ok
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 9,
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 16,
        marginBottom: 2,
        letterSpacing: -0.5,
    },
    locationText: {
        fontSize: 13,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    attendeesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    attendeesDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.custom.colors.primary,
        marginRight: 6,
    },
});
