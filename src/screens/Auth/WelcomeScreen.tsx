import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList, Animated, Image } from 'react-native';
import { theme } from '../../theme';
import { ReScreen } from '../../components/atoms/ReScreen';
import { ReText } from '../../components/atoms/ReText';
import { ReButton } from '../../components/atoms/ReButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        icon: 'account-group',
        title: 'Círculos Reais',
        description: 'Reúna seus amigos e viva momentos autênticos e descontraídos. Aproveite o rolê para conhecer gente nova!',
    },
    {
        id: '2',
        icon: 'glass-cocktail',
        title: 'Momentos de Verdade',
        description: 'Do happy hour ao churrasco de domingo. Cada momento conta.',
    },
    {
        id: '3',
        icon: 'calendar-check',
        title: 'Sem Enrolação',
        description: 'Organize, convide, confirme e divirta-se. Simples, rápido e social.',
    },
];

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
        return (
            <View style={styles.slide}>
                <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={80} color={theme.custom.colors.primary} />
                </View>
                <ReText variant="displaySmall" align="center" style={styles.title}>
                    {item.title}
                </ReText>
                <ReText variant="bodyLarge" align="center" color="textSecondary" style={styles.description}>
                    {item.description}
                </ReText>
            </View>
        );
    };

    const Paginator = () => {
        return (
            <View style={styles.paginatorContainer}>
                {SLIDES.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 20, 10],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={i.toString()}
                            style={[
                                styles.dot,
                                { width: dotWidth, opacity },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <ReScreen backgroundColor={theme.custom.colors.background} safeArea>
            <View style={styles.container}>

                {/* Carousel */}
                <View style={styles.carouselContainer}>
                    <FlatList
                        data={SLIDES}
                        renderItem={renderItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        pagingEnabled
                        bounces={false}
                        keyExtractor={(item) => item.id}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: false }
                        )}
                        scrollEventThrottle={32}
                    />
                </View>

                <Paginator />

                {/* Footer Actions */}
                <View style={styles.footer}>
                    <ReButton
                        label="CRIAR CONTA"
                        onPress={() => navigation.navigate('Signup')}
                        fullWidth
                        style={styles.primaryButton}
                    />
                    <ReButton
                        label="JÁ TENHO CONTA"
                        variant="ghost"
                        onPress={() => navigation.navigate('Login')}
                        fullWidth
                    />
                </View>

            </View>
        </ReScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    carouselContainer: {
        flex: 0.75, // Ocupa 75% da tela
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#fff', // Círculo branco de fundo
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: theme.custom.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    title: {
        marginBottom: 16,
        fontWeight: '800',
        color: theme.custom.colors.textPrimary,
    },
    description: {
        lineHeight: 24,
        maxWidth: '90%',
    },
    paginatorContainer: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.custom.colors.primary,
        marginHorizontal: 8,
    },
    footer: {
        flex: 0.25,
        paddingHorizontal: 24,
        justifyContent: 'center',
        gap: 12,
    },
    primaryButton: {
        marginBottom: 0,
    }
});
