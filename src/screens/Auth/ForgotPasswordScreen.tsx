import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Keyboard } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth(); // Use context instead of direct import

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('Por favor, informe seu email');
      return;
    }

    setLoading(true);
    const { error: resetError } = await resetPassword(email);
    setLoading(false);

    if (resetError) {
      setError(resetError);
    } else {
      setSuccess(true);
      Alert.alert(
        'Email Enviado',
        'Verifique sua caixa de entrada para redefinir sua senha.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Recuperar Senha
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Não se preocupe! Digite seu email abaixo e enviaremos um link de recuperação.
          </Text>
        </View>

        <View style={styles.content}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading && !success}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading || success}
            style={styles.button}
            contentStyle={{ height: 48 }}
          >
            Enviar Email
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            style={styles.backButton}
          >
            Voltar ao Login
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
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    lineHeight: 20,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    flex: 1,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 16,
    borderRadius: 8,
  },
  backButton: {
    marginTop: 0,
  },
  snackbar: {
    backgroundColor: '#d32f2f',
    zIndex: 1000,
    elevation: 1000,
  },
});
