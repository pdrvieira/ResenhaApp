import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

// Configuração de fontes (ajuste conforme necessário se for usar Custom Fonts)
const fontConfig = {
    displayLarge: {
        fontFamily: 'System',
        fontSize: 32,
        fontWeight: '700' as const,
        letterSpacing: 0,
        lineHeight: 40,
    },
    displayMedium: {
        fontFamily: 'System',
        fontSize: 28,
        fontWeight: '700' as const,
        letterSpacing: 0,
        lineHeight: 36,
    },
    displaySmall: {
        fontFamily: 'System',
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: 0,
        lineHeight: 32,
    },
    headlineMedium: {
        fontFamily: 'System',
        fontSize: 20,
        fontWeight: '600' as const,
        letterSpacing: 0.15,
        lineHeight: 28,
    },
    bodyLarge: {
        fontFamily: 'System',
        fontSize: 16,
        fontWeight: '400' as const,
        letterSpacing: 0.15,
        lineHeight: 24,
    },
    bodyMedium: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '400' as const,
        letterSpacing: 0.25,
        lineHeight: 20,
    },
    labelLarge: {
        fontFamily: 'System',
        fontSize: 14,
        fontWeight: '600' as const,
        letterSpacing: 0.1,
        lineHeight: 20,
    },
};

export const theme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: colors.primary,
        onPrimary: '#FFFFFF',
        primaryContainer: colors.primary, // Usando primary como container tb por enquanto
        onPrimaryContainer: '#FFFFFF',

        secondary: colors.secondary,
        onSecondary: '#FFFFFF',
        secondaryContainer: '#E8DEF8',
        onSecondaryContainer: '#1D192B',

        background: colors.background,
        onBackground: colors.textPrimary,

        surface: colors.surface,
        onSurface: colors.textPrimary,

        error: colors.error,
        onError: '#FFFFFF',

        outline: colors.border,
    },
    fonts: configureFonts({ config: fontConfig }),
    // Custom properties
    custom: {
        colors,
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
            xxl: 48,
        },
        roundness: {
            s: 8,
            m: 12,
            l: 20,
            xl: 32,
        }
    }
};

export type AppTheme = typeof theme;
