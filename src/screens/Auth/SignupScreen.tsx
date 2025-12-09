import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, Alert } from 'react-native';
import { TextInput, Button, Text, Snackbar, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp, loading } = useAuth();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim(); // Ensure password is also trimmed of accidental spaces

    if (!trimmedEmail || !trimmedPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Por favor, insira um email válido');
      return;
    }

    if (trimmedPassword !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const { error: signUpError, session } = await signUp(trimmedEmail, trimmedPassword);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    // Se não houver erro e não houver sessão, significa que o email de confirmação foi enviado
    if (!session) {
      Alert.alert(
        'Verifique seu email',
        'Enviamos um link de confirmação para o seu email. Por favor, confirme para continuar.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
    // Se houver sessão, o AuthContext atualiza o estado e o RootNavigator redireciona automaticamente
  };

  const hasPasswordError = () => {
    return password.length > 0 && password.length < 6;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="labelLarge" style={styles.stepIndicator}>Passo 1 de 2</Text>
          <Text variant="headlineMedium" style={styles.title}>
            Crie sua conta
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Insira seus dados para começar a usar o Resenha!
          </Text>
        </View>

        <View style={styles.formContent}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
            mode="outlined"
          />

          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            editable={!loading}
            mode="outlined"
            error={hasPasswordError()}
          />
          <HelperText type="info" visible={true} padding="none" style={styles.helperText}>
            Mínimo de 6 caracteres
          </HelperText>

          <TextInput
            label="Confirmar Senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            editable={!loading}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={{ height: 48 }}
          >
            Continuar
          </Button>

          <Text style={styles.legalText}>
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </Text>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            style={styles.loginButton}
          >
            Já tenho conta
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
    backgroundColor: '#fff', // Keep header background consistent
  },
  stepIndicator: {
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  formContent: {
    padding: 20,
    paddingTop: 10,
    justifyContent: 'flex-start',
    flex: 1,
  },
  input: {
    marginBottom: 4, // Reduced margin because helper text takes space or is controlled separately
    backgroundColor: '#fff',
  },
  helperText: {
    marginBottom: 12,
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
  },
  loginButton: {
    marginTop: 8,
  },
  legalText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  snackbar: {
    backgroundColor: '#d32f2f',
    zIndex: 1000,
    elevation: 1000,
  },
});
