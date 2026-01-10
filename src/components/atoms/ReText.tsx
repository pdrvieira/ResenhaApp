import React from 'react';
import { Text, TextProps } from 'react-native-paper'; // Usar o Text do Paper para Typography
import { StyleSheet, TextStyle } from 'react-native';
import { theme } from '../../theme';

type Variant =
    | 'displayLarge' | 'displayMedium' | 'displaySmall'
    | 'headlineMedium'
    | 'bodyLarge' | 'bodyMedium' | 'bodySmall'
    | 'labelLarge' | 'labelSmall';

interface ReTextProps extends TextProps<unknown> {
    variant?: Variant;
    color?: string;
    align?: TextStyle['textAlign'];
    weight?: TextStyle['fontWeight']; // Override manual se precisar
    size?: number; // Override manual de tamanho
    children: React.ReactNode;
}

export const ReText: React.FC<ReTextProps> = ({
    variant = 'bodyMedium',
    color,
    align,
    weight,
    size,
    style,
    children,
    ...rest
}) => {
    // Resolver cor: se for uma chave do theme.custom.colors, usa ela, senão usa a string direta ou default textPrimary
    const resolvedColor = (color && (theme.custom.colors as any)[color])
        ? (theme.custom.colors as any)[color]
        : color || theme.custom.colors.textPrimary;

    const textStyle: TextStyle = {
        color: resolvedColor,
        textAlign: align,
        ...(weight ? { fontWeight: weight } : {}),
        ...(size ? { fontSize: size } : {}),
    };

    return (
        <Text
            variant={variant}
            style={[textStyle, style]}
            {...rest}
        >
            {children}
        </Text>
    );
};
