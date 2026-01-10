import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

interface ReIconProps {
    name: string;
    size?: number | 's' | 'm' | 'l' | 'xl';
    color?: string | 'primary' | 'secondary' | 'error' | 'success' | 'surface';
    style?: any;
}

const mapSize = (size: ReIconProps['size']): number => {
    if (typeof size === 'number') return size;
    switch (size) {
        case 's': return 16;
        case 'm': return 24;
        case 'l': return 32;
        case 'xl': return 48;
        default: return 24;
    }
};

const mapColor = (color: ReIconProps['color']): string => {
    if (!color) return theme.custom.colors.textPrimary;
    switch (color) {
        case 'primary': return theme.custom.colors.primary;
        case 'secondary': return theme.custom.colors.textSecondary;
        case 'error': return theme.custom.colors.error;
        case 'success': return theme.custom.colors.success;
        case 'surface': return theme.custom.colors.surface;
        default: return color;
    }
};

export const ReIcon: React.FC<ReIconProps> = ({ name, size = 'm', color, style }) => {
    return (
        <Icon
            name={name}
            size={mapSize(size)}
            color={mapColor(color)}
            style={style}
        />
    );
};
