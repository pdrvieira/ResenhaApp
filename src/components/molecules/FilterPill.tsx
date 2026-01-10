import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { ReText } from '../atoms/ReText';

interface FilterPillProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
    style?: ViewStyle;
}

export const FilterPill: React.FC<FilterPillProps> = ({
    label,
    isActive,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.pill,
                isActive && styles.pillActive,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <ReText
                variant="bodyMedium"
                color={isActive ? 'surface' : 'textPrimary'}
                weight={isActive ? '600' : '400'}
            >
                {label}
            </ReText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.custom.colors.surface,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pillActive: {
        backgroundColor: theme.custom.colors.primary,
        borderColor: theme.custom.colors.primary,
    },
});
