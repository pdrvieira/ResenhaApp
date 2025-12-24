import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator } from 'react-native-paper';
import { useEventInvite } from '../../hooks/useEventInvite';

interface InviteScreenProps {
    navigation: any;
    route: any;
}

export const InviteScreen: React.FC<InviteScreenProps> = ({ navigation, route }) => {
    const inviteCodeParam = route.params?.inviteCode || '';
    const [inviteCode, setInviteCode] = useState(inviteCodeParam);
    const [validating, setValidating] = useState(false);
    const { validateInvite, useInvite, loading, error } = useEventInvite();

    // Se veio com código, valida automaticamente
    useEffect(() => {
        if (inviteCodeParam) {
            handleValidate();
        }
    }, [inviteCodeParam]);

    const handleValidate = async () => {
        if (!inviteCode.trim()) {
            Alert.alert('Erro', 'Digite o código do convite');
            return;
        }

        setValidating(true);
        try {
            const result = await validateInvite(inviteCode.trim());

            if (result.valid && result.event) {
                // Registrar uso do convite
                const used = await useInvite(inviteCode.trim());

                if (used) {
                    // Navegar para detalhes do evento
                    navigation.replace('EventDetails', {
                        eventId: result.event.id,
                        fromInvite: true
                    });
                } else {
                    Alert.alert('Erro', 'Não foi possível usar o convite');
                }
            } else {
                Alert.alert('Convite inválido', result.error || 'Código de convite inválido');
            }
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao validar convite');
        } finally {
            setValidating(false);
        }
    };

    const formatCode = (text: string) => {
        // Remove caracteres especiais e converte para maiúscula
        return text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineMedium" style={styles.title}>
                            🎟️ Convite para Evento
                        </Text>

                        <Text style={styles.description}>
                            Digite o código de convite que você recebeu para acessar o evento privado.
                        </Text>

                        <TextInput
                            mode="outlined"
                            label="Código do Convite"
                            value={inviteCode}
                            onChangeText={(text) => setInviteCode(formatCode(text))}
                            placeholder="Ex: ABC12DEF"
                            autoCapitalize="characters"
                            maxLength={8}
                            style={styles.input}
                            outlineColor="#9c27b0"
                            activeOutlineColor="#7b1fa2"
                        />

                        <Button
                            mode="contained"
                            onPress={handleValidate}
                            loading={validating || loading}
                            disabled={validating || loading || inviteCode.length < 8}
                            style={styles.button}
                            buttonColor="#9c27b0"
                        >
                            Acessar Evento
                        </Button>

                        <Button
                            mode="text"
                            onPress={() => navigation.goBack()}
                            style={styles.cancelButton}
                        >
                            Cancelar
                        </Button>
                    </Card.Content>
                </Card>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    card: {
        borderRadius: 16,
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    description: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 24,
        fontSize: 14,
        lineHeight: 20,
    },
    input: {
        marginBottom: 16,
        fontSize: 20,
        textAlign: 'center',
        letterSpacing: 4,
    },
    button: {
        marginTop: 8,
        paddingVertical: 6,
    },
    cancelButton: {
        marginTop: 12,
    },
});
