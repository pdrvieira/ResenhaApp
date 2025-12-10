import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(); // Removed context loading

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Por favor, preencha email e senha');
      return;
    }

    setLoading(true);
    const { error } = await signIn(trimmedEmail, password);
    setLoading(false);

    if (error) {
      setError(error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Bem-vindo de volta!
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Entre para continuar a resenha.
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
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={{ height: 48 }}
          >
            Entrar
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
            style={styles.textButton}
          >
            Ainda não tem conta? Cadastre-se
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
            style={styles.textButton}
          >
            Esqueci minha senha
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
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  formContent: {
    padding: 20,
    paddingTop: 0,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 8,
  },
  textButton: {
    marginBottom: 8,
  },
  snackbar: {
    backgroundColor: '#d32f2f',
    zIndex: 1000,
    elevation: 1000,
  },
});
