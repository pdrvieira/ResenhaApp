import React, { useState } from 'react';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';
import { ReText } from './ReText';

interface ReInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    error?: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    disabled?: boolean;
    style?: ViewStyle;
    rightIcon?: string;
    onRightIconPress?: () => void;
    leftIcon?: string;
}

export const ReInput: React.FC<ReInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error,
    keyboardType = 'default',
    autoCapitalize = 'none',
    disabled = false,
    style,
    rightIcon,
    onRightIconPress,
    leftIcon
}) => {
    const [internalSecure, setInternalSecure] = useState(secureTextEntry);

    // Se secureTextEntry foi passado, controla o olho mágico.
    // Se não foi, usa o rightIcon customizado
    const handleRightIcon = () => {
        if (secureTextEntry) {
            return (
                <PaperTextInput.Icon
                    icon={internalSecure ? "eye" : "eye-off"}
                    onPress={() => setInternalSecure(!internalSecure)}
                    color={theme.custom.colors.textSecondary}
                />
            );
        }
        if (rightIcon) {
            return (
                <PaperTextInput.Icon
                    icon={rightIcon}
                    onPress={onRightIconPress}
                    color={theme.custom.colors.textSecondary}
                />
            );
        }
        return null;
    };

    return (
        <React.Fragment>
            <PaperTextInput
                label={label}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                secureTextEntry={internalSecure}
                error={!!error}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                editable={!disabled}
                mode="outlined"
                style={[styles.input, style]}
                outlineStyle={styles.outline}
                textColor={theme.custom.colors.textPrimary}
                placeholderTextColor={theme.custom.colors.textSecondary}
                activeOutlineColor={theme.custom.colors.primary}
                outlineColor={theme.custom.colors.border}
                contentStyle={styles.content}
                right={handleRightIcon()}
                left={leftIcon ? <PaperTextInput.Icon icon={leftIcon} color={theme.custom.colors.textSecondary} /> : null}
            />
            {error && (
                <ReText variant="bodyMedium" color="error" style={styles.errorText}>
                    {error}
                </ReText>
            )}
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: theme.custom.colors.surface,
        marginBottom: 4,
    },
    outline: {
        borderRadius: theme.custom.roundness.m,
    },
    content: {
        // paddingVertical: 4
    },
    errorText: {
        marginLeft: 4,
        marginBottom: 8,
        fontSize: 12,
    },
});
