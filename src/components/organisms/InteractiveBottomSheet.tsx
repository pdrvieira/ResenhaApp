import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Pressable,
    Dimensions,
} from 'react-native';
import BottomSheet, {
    BottomSheetView,
    BottomSheetFlatList,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';
import { ReText } from '../atoms/ReText';
import { EventCard } from '../molecules/EventCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop';

// Tipo para eventos
export interface EventItem {
    id: string;
    title: string;
    location?: string;
    date?: string;
    eventDate?: string | Date; // Para Date Box
    imageUrl?: string;
    category?: string;
    attendeesCount?: number;
    description?: string;
}

interface InteractiveBottomSheetProps {
    events: EventItem[];
    selectedEvent: EventItem | null;
    isLoading?: boolean;
    onEventPress?: (event: EventItem) => void;
    onEventClose?: () => void;
    onParticipate?: (event: EventItem) => void;
    onViewDetails?: (event: EventItem) => void;
    onIndexChange?: (index: number) => void;
    onRefresh?: () => void;
    resetSignal?: number;
    children?: React.ReactNode;
}

// Componente de botão com feedback visual
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressableButton: React.FC<{
    onPress: () => void;
    style: any;
    children: React.ReactNode;
}> = ({ onPress, style, children }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => { scale.value = withSpring(0.96); }}
            onPressOut={() => { scale.value = withSpring(1); }}
            style={[style, animatedStyle]}
        >
            {children}
        </AnimatedPressable>
    );
};

export const InteractiveBottomSheet: React.FC<InteractiveBottomSheetProps> = ({
    events,
    selectedEvent,
    isLoading = false,
    onEventPress,
    onEventClose,
    onParticipate,
    onViewDetails,
    onIndexChange,
    onRefresh,
    resetSignal,
    children,
}) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Snap points FIXOS: 20% (recolhido), 50% (médio/preview), 80% (expandido)
    const snapPoints = useMemo(() => ['20%', '50%', '80%'], []);

    // Quando seleciona um evento, abre para mostrar preview em 80% (índice 2)
    // Delay de 250ms para sincronizar com animação do mapa (450ms)
    useEffect(() => {
        if (selectedEvent) {
            const timer = setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(2); // 2 = 80%
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [selectedEvent]);

    // Reage ao sinal de reset forçado (Fresh Start)
    useEffect(() => {
        if (resetSignal && resetSignal > 0) {
            bottomSheetRef.current?.snapToIndex(0);
        }
    }, [resetSignal]);

    // Callback quando o sheet muda de posição
    const handleSheetChanges = useCallback((index: number) => {
        setCurrentIndex(index);

        // Notifica o pai sobre mudança de índice
        onIndexChange?.(index);

        // P1 FIX: Preview só existe em 80% (índice 2)
        // Se arrastar abaixo de 80%, fecha o preview automaticamente
        if (selectedEvent && index < 2) {
            onEventClose?.();
            // Volta para 20% se estava tentando ir para 50%
            if (index === 1) {
                bottomSheetRef.current?.snapToIndex(0);
            }
        }
    }, [selectedEvent, onEventClose, onIndexChange]);

    // Fecha o preview
    const handleClosePreview = useCallback(() => {
        bottomSheetRef.current?.snapToIndex(0);
    }, []);

    // Handler para quando um evento é pressionado
    const handleEventPress = useCallback((item: EventItem) => {
        onEventPress?.(item);
    }, [onEventPress]);

    // Renderiza cada item da lista
    const renderEventItem = useCallback(
        ({ item }: { item: EventItem }) => (
            <EventCard
                variant="horizontal"
                title={item.title}
                location={item.location || 'Local não informado'}
                date={item.date || 'Data não informada'}
                eventDate={item.eventDate}
                imageUrl={item.imageUrl}
                category={item.category}
                attendeesCount={item.attendeesCount}
                onPress={() => handleEventPress(item)}
                style={styles.eventCard}
            />
        ),
        [handleEventPress]
    );

    const keyExtractor = useCallback((item: EventItem) => item.id, []);

    // ========== CONTEÚDO: LISTA ==========
    const renderListContent = () => (
        <>
            <View style={styles.header}>
                <ReText variant="labelLarge" weight="bold">
                    Eventos Próximos
                </ReText>
                <ReText variant="bodyMedium" color="textSecondary">
                    {isLoading ? 'Carregando...' : `${events.length} evento${events.length !== 1 ? 's' : ''}`}
                </ReText>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.custom.colors.primary} />
                </View>
            ) : events.length > 0 ? (
                <BottomSheetFlatList
                    data={events}
                    keyExtractor={keyExtractor}
                    renderItem={renderEventItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon
                        name="calendar-search"
                        size={48}
                        color={theme.custom.colors.textSecondary}
                        style={styles.emptyIcon}
                    />
                    <ReText variant="bodyMedium" color="textSecondary" align="center" style={styles.emptyText}>
                        Nenhum evento encontrado por aqui.{'\n'}Que tal criar um?
                    </ReText>
                </View>
            )}
        </>
    );

    // ========== CONTEÚDO: PREVIEW ==========
    const renderEventPreview = () => {
        const eventDate = selectedEvent?.eventDate;
        const dateObj = eventDate ? new Date(eventDate) : null;
        const day = dateObj ? dateObj.getDate() : '';
        const month = dateObj ? dateObj.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '') : '';
        const time = dateObj ? dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

        return (
            <View style={styles.previewContainer}>
                {/* Botão de fechar */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClosePreview}
                    activeOpacity={0.7}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="close" size={24} color={theme.custom.colors.textPrimary} />
                </TouchableOpacity>

                {/* Imagem */}
                <View style={styles.previewImageContainer}>
                    <FastImage
                        source={{ uri: selectedEvent?.imageUrl || PLACEHOLDER_IMAGE }}
                        style={styles.previewImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />

                    {selectedEvent?.category && (
                        <View style={styles.categoryBadge}>
                            <ReText variant="bodyMedium" size={10} color="surface" weight="800" style={{ letterSpacing: 0.5 }}>
                                {selectedEvent.category.toUpperCase()}
                            </ReText>
                        </View>
                    )}
                </View>

                {/* Informações */}
                <View style={styles.previewContent}>
                    {/* Header: Título + DateBox */}
                    <View style={styles.previewHeaderRow}>
                        <ReText variant="headlineMedium" weight="800" style={[styles.previewTitle, { flex: 1, marginBottom: 0 }]}>
                            {selectedEvent?.title}
                        </ReText>

                        {/* Date Box */}
                        {dateObj && (
                            <View style={styles.previewDateBox}>
                                <ReText variant="labelLarge" size={10} weight="700" color="primary" style={{ textTransform: 'uppercase', marginBottom: -2 }}>
                                    {month}
                                </ReText>
                                <ReText variant="headlineMedium" size={24} weight="900" color="textPrimary" style={{ lineHeight: 26 }}>
                                    {day}
                                </ReText>
                            </View>
                        )}
                    </View>

                    {/* Metadados Clean */}
                    <View style={styles.metaContainer}>
                        {/* Local */}
                        <View style={styles.previewInfoRow}>
                            <View style={styles.iconContainer}>
                                <Icon name="map-marker-outline" size={18} color={theme.custom.colors.textSecondary} />
                            </View>
                            <ReText variant="bodyMedium" style={styles.previewInfoText} color="textSecondary">
                                {selectedEvent?.location || 'Local não informado'}
                            </ReText>
                        </View>

                        {/* Horário (Data já está no box) */}
                        <View style={styles.previewInfoRow}>
                            <View style={styles.iconContainer}>
                                <Icon name="clock-time-four-outline" size={18} color={theme.custom.colors.textSecondary} />
                            </View>
                            <ReText variant="bodyMedium" style={styles.previewInfoText} color="textSecondary">
                                {time ? `${selectedEvent?.date?.split(',')[0]} às ${time}` : (selectedEvent?.date || 'Data a definir')}
                            </ReText>
                        </View>

                        {/* Participantes */}
                        {selectedEvent?.attendeesCount !== undefined && selectedEvent.attendeesCount > 0 && (
                            <View style={styles.previewInfoRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="account-group-outline" size={18} color={theme.custom.colors.primary} />
                                </View>
                                <ReText variant="bodyMedium" weight="700" color="primary">
                                    {selectedEvent.attendeesCount} pessoas vão
                                </ReText>
                            </View>
                        )}
                    </View>

                    {/* Descrição - sempre visível se disponível */}
                    {selectedEvent?.description && (
                        <View style={styles.descriptionContainer}>
                            <ReText variant="bodyMedium" color="textSecondary">
                                {selectedEvent.description}
                            </ReText>
                        </View>
                    )}

                    {/* Botões de ação */}
                    <View style={styles.actionButtons}>
                        <PressableButton
                            style={styles.primaryButton}
                            onPress={() => selectedEvent && onParticipate?.(selectedEvent)}
                        >
                            <Icon name="check-circle" size={22} color="#fff" />
                            <ReText variant="bodyMedium" color="surface" weight="bold" style={styles.buttonText}>
                                Quero Participar
                            </ReText>
                        </PressableButton>

                        <PressableButton
                            style={styles.secondaryButton}
                            onPress={() => selectedEvent && onViewDetails?.(selectedEvent)}
                        >
                            <ReText variant="bodyMedium" color="primary" weight="700">
                                Ver detalhes
                            </ReText>
                            <Icon name="chevron-right" size={20} color={theme.custom.colors.primary} />
                        </PressableButton>
                    </View>

                    {/* Dica */}
                    {currentIndex === 1 && (
                        <View style={styles.hintContainer}>
                            <Icon name="chevron-up" size={16} color={theme.custom.colors.textSecondary} />
                            <ReText variant="bodyMedium" color="textSecondary" style={styles.hintText}>
                                Arraste para ver mais
                            </ReText>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.background}
            style={styles.container}
            containerStyle={styles.sheetContainer}
            enableDynamicSizing={false}
            enablePanDownToClose={false}
            animateOnMount={true}
            // Animações suaves (padrão iOS/Material)
            animationConfigs={{
                duration: 350,
                dampingRatio: 0.85,
            }}
        >
            <BottomSheetView style={styles.contentContainer}>
                {/* Renderiza LISTA ou PREVIEW baseado no selectedEvent */}
                {selectedEvent ? renderEventPreview() : renderListContent()}
                {children}
            </BottomSheetView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    sheetContainer: {
        zIndex: 999,
        elevation: 999,
    },
    container: {
        zIndex: 999,
    },
    background: {
        backgroundColor: theme.custom.colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
    },
    handleIndicator: {
        backgroundColor: theme.custom.colors.textSecondary,
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.4,
    },
    contentContainer: {
        flex: 1,
    },
    // Lista
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        marginBottom: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    eventCard: {
        marginBottom: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: {
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 12,
    },
    // Preview
    previewScrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 16,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    previewImageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 12,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    previewContent: {
        padding: 20,
    },
    previewTitle: {
        marginBottom: 16,
        lineHeight: 28,
    },
    previewInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    previewContainer: {
        flex: 1,
        // paddingBottom: 20, // Opcional
    },
    previewHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    previewDateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${theme.custom.colors.primary}10`,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginLeft: 16,
        minWidth: 50,
    },
    metaContainer: {
        marginBottom: 16,
    },
    iconContainer: {
        // Ícone "Clean" sem fundo bolinha
        width: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    previewInfoText: {
        flex: 1,
    },
    descriptionContainer: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    actionButtons: {
        marginTop: 24,
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.custom.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 10,
        shadowColor: theme.custom.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${theme.custom.colors.primary}10`,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 6,
    },
    buttonText: {
        marginLeft: 4,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        opacity: 0.6,
    },
    hintText: {
        marginLeft: 4,
        fontSize: 12,
    },
});
