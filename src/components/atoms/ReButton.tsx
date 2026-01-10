import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'; // 'ghost' mapeia para 'text' no Paper

interface ReButtonProps {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    style?: ViewStyle;
    labelStyle?: TextStyle;
    fullWidth?: boolean;
}

export const ReButton: React.FC<ReButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    style,
    labelStyle,
    fullWidth = false,
}) => {
    // Mapear variantes internas para variantes do React Native Paper
    const getPaperMode = (): 'contained' | 'outlined' | 'text' | 'elevated' | 'contained-tonal' => {
        switch (variant) {
            case 'primary': return 'contained';
            case 'secondary': return 'contained-tonal'; // Ou algo custom
            case 'outline': return 'outlined';
            case 'ghost': return 'text';
            default: return 'contained';
        }
    };

    // Cores customizadas baseadas na variante
    const getButtonColor = () => {
        if (disabled) return undefined; // Deixa o Paper lidar com disable
        switch (variant) {
            case 'primary': return theme.custom.colors.primary;
            case 'secondary': return theme.custom.colors.secondary;
            case 'ghost': return 'transparent';
            default: return undefined;
        }
    };

    const getTextColor = () => {
        if (disabled) return undefined;
        switch (variant) {
            case 'primary': return '#FFFFFF';
            case 'secondary': return '#FFFFFF';
            case 'outline': return theme.custom.colors.primary;
            case 'ghost': return theme.custom.colors.primary;
            default: return undefined;
        }
    };

    return (
        <Button
            mode={getPaperMode()}
            onPress={onPress}
            loading={loading}
            disabled={disabled}
            icon={icon}
            buttonColor={getButtonColor()}
            textColor={getTextColor()}
            contentStyle={{ height: 48 }} // Altura padrão confortável
            style={[
                styles.button,
                fullWidth && styles.fullWidth,
                style
            ]}
            labelStyle={[styles.label, labelStyle]}
        >
            {label}
        </Button>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.custom.roundness.m, // 12px
        justifyContent: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    }
});
