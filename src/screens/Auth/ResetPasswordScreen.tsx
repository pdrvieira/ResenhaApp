import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export const ResetPasswordScreen: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { updateProfile, setIsPasswordReset, signOut } = useAuth(); // We just need access to supabase client really
    const { supabase } = require('../../services/supabase');

    const handleUpdatePassword = async () => {
        // ... existing logic ...
        setError('');

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            Alert.alert(
                'Sucesso',
                'Sua senha foi atualizada! Por favor, faça login com a nova senha.',
                [{
                    text: 'OK', onPress: async () => {
                        await signOut();
                        setIsPasswordReset(false);
                    }
                }]
            );

        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.title}>Nova Senha</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        Defina sua nova senha.
                    </Text>
                </View>

                <View style={styles.content}>
                    <TextInput
                        label="Nova Senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        mode="outlined"
                        style={styles.input}
                        right={
                            <TextInput.Icon
                                icon={showPassword ? "eye-off" : "eye"}
                                onPress={() => setShowPassword(!showPassword)}
                            />
                        }
                    />

                    <TextInput
                        label="Confirmar Senha"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        mode="outlined"
                        style={styles.input}
                        right={
                            <TextInput.Icon
                                icon={showConfirmPassword ? "eye-off" : "eye"}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                        }
                    />

                    <Button
                        mode="contained"
                        onPress={handleUpdatePassword}
                        loading={loading}
                        style={styles.button}
                        contentStyle={{ height: 48 }}
                    >
                        Atualizar Senha
                    </Button>
                </View>
            </ScrollView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                duration={3000}
                style={styles.snackbar}
            >
                <Text style={{ color: '#fff' }}>{error}</Text>
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#666',
    },
    content: {
        padding: 20,
        paddingTop: 10,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
    },
    snackbar: {
        backgroundColor: '#d32f2f',
    }
});
