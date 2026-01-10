import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

interface ReScreenProps {
    children: ReactNode;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    scrollable?: boolean;
    safeArea?: boolean; // Se true, adiciona padding top/bottom automático
    backgroundColor?: string;
    keyboardAvoiding?: boolean;
}

export const ReScreen: React.FC<ReScreenProps> = ({
    children,
    style,
    contentContainerStyle,
    scrollable = false,
    safeArea = true,
    backgroundColor = theme.custom.colors.background,
    keyboardAvoiding = true,
}) => {
    const insets = useSafeAreaInsets();

    const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor: backgroundColor,
        paddingTop: safeArea ? insets.top : 0,
        paddingBottom: safeArea ? insets.bottom : 0,
        // Padding horizontal padrão pode ser aplicado aqui ou na tela
    };

    const Wrapper = keyboardAvoiding ? KeyboardAvoidingView : View;

    return (
        <Wrapper
            style={[styles.flex, { backgroundColor }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar
                barStyle="dark-content"
                backgroundColor={backgroundColor}
                translucent
            />

            {scrollable ? (
                <ScrollView
                    style={[containerStyle, style]}
                    contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[containerStyle, style]}>
                    {children}
                </View>
            )}
        </Wrapper>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    }
});
