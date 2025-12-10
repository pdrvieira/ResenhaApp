import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Keyboard, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Snackbar, Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn } = useAuth(); // Removed context loading

  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('saved_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (e) {
        console.log('Failed to load email', e);
      }
    };
    loadSavedEmail();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Por favor, preencha seu login e senha');
      return;
    }

    setLoading(true);
    const { error } = await signIn(trimmedEmail, password);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      // Save or clear email based on rememberMe
      try {
        if (rememberMe) {
          await AsyncStorage.setItem('saved_email', trimmedEmail);
        } else {
          await AsyncStorage.removeItem('saved_email');
        }
      } catch (e) {
        console.log('Failed to save email', e);
      }
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
            label="Email ou Usuário"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            editable={!loading}
            mode="outlined"
          />

          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            editable={!loading}
            mode="outlined"
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <View style={styles.rememberRow}>
            <View style={styles.checkboxContainer}>
              <Checkbox.Android
                status={rememberMe ? 'checked' : 'unchecked'}
                onPress={() => setRememberMe(!rememberMe)}
                color="#6200ee"
              />
              <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                <Text variant="bodyMedium">Lembrar de mim</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text variant="bodyMedium" style={styles.forgotLink}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

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
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8, // Compensate for Checkbox default padding
  },
  forgotLink: {
    color: '#6200ee',
    fontWeight: '600',
  },
  button: {
    marginTop: 0,
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
