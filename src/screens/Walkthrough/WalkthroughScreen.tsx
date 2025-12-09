import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useAppControl } from '../../contexts/AppControlContext';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'Bem-vindo ao Resenha!',
        description: 'O aplicativo definitivo para organizar seus eventos e círculos sociais.',
        icon: '🎉',
    },
    {
        id: 2,
        title: 'Crie Eventos',
        description: 'Marque aquele futebol, churrasco ou festa com facilidade e convide seus amigos.',
        icon: '📅',
    },
    {
        id: 3,
        title: 'Conecte-se',
        description: 'Converse com seus amigos, confirme presença e não perca nenhuma atualização.',
        icon: '💬',
    },
];

export const WalkthroughScreen: React.FC = () => {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const { completeWalkthrough } = useAppControl();
    const theme = useTheme();

    const handleNext = () => {
        if (currentSlideIndex < SLIDES.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        } else {
            completeWalkthrough();
        }
    };

    const handleSkip = () => {
        completeWalkthrough();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.slideContainer}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{SLIDES[currentSlideIndex].icon}</Text>
                </View>
                <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                    {SLIDES[currentSlideIndex].title}
                </Text>
                <Text variant="bodyLarge" style={styles.description}>
                    {SLIDES[currentSlideIndex].description}
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentSlideIndex
                                    ? { backgroundColor: theme.colors.primary, width: 24 }
                                    : { backgroundColor: theme.colors.secondaryContainer },
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    {currentSlideIndex < SLIDES.length - 1 ? (
                        <>
                            <Button mode="text" onPress={handleSkip}>
                                Pular
                            </Button>
                            <Button mode="contained" onPress={handleNext}>
                                Próximo
                            </Button>
                        </>
                    ) : (
                        <Button mode="contained" onPress={handleNext} style={styles.fullButton}>
                            Começar!
                        </Button>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    slideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 48,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        opacity: 0.7,
        paddingHorizontal: 16,
    },
    footer: {
        paddingBottom: 24,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    paginationDot: {
        height: 8,
        width: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fullButton: {
        width: '100%',
    },
});
