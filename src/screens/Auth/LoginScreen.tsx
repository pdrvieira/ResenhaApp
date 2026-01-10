import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar, Checkbox } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';

// Atomic Components
import { ReScreen } from '../../components/atoms/ReScreen';
import { ReText } from '../../components/atoms/ReText';
import { ReInput } from '../../components/atoms/ReInput';
import { ReButton } from '../../components/atoms/ReButton';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn } = useAuth();

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
    <ReScreen scrollable contentContainerStyle={styles.scrollContent}>

      {/* Header Section */}
      <View style={styles.header}>
        <ReText variant="displaySmall" weight="700" style={styles.emojiTitle}>
          👋
        </ReText>
        <ReText variant="displaySmall" weight="bold" color="textPrimary" style={styles.title}>
          Bem-vindo de volta!
        </ReText>
        <ReText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Entre para continuar a <ReText variant="bodyLarge" color="primary" weight="bold">Resenha</ReText>.
        </ReText>
      </View>

      {/* Form Section */}
      <View style={styles.form}>
        <ReInput
          label="Email ou Usuário"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          disabled={loading}
          leftIcon="account-outline"
        />

        <View style={styles.spacer} />

        <ReInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          disabled={loading}
          leftIcon="lock-outline"
        />

        {/* Remember Me & Forgot Password */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <Checkbox.Android
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              color={theme.custom.colors.primary}
              uncheckedColor={theme.custom.colors.textSecondary}
            />
            <ReText variant="bodyMedium" color="textSecondary">Lembrar de mim</ReText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <ReText variant="bodyMedium" color="primary" weight="600">
              Esqueci a senha
            </ReText>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ReButton
            label="ENTRAR"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.mainButton}
          />

          <View style={styles.footer}>
            <ReText variant="bodyMedium" color="textSecondary">
              Ainda não tem conta?{' '}
            </ReText>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <ReText variant="bodyMedium" color="primary" weight="bold">
                Cadastre-se
              </ReText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={{ backgroundColor: theme.custom.colors.error }}
      >
        {error}
      </Snackbar>
    </ReScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: theme.custom.spacing.l, // 24px
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    marginBottom: theme.custom.spacing.xl,
    alignItems: 'flex-start',
  },
  emojiTitle: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    marginBottom: theme.custom.spacing.s,
  },
  subtitle: {
    maxWidth: '80%',
  },
  form: {
    marginBottom: theme.custom.spacing.l,
  },
  spacer: {
    height: theme.custom.spacing.m,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.custom.spacing.s,
    marginBottom: theme.custom.spacing.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8, // Ajuste visual do checkbox nativo
  },
  actions: {
    marginTop: theme.custom.spacing.s,
  },
  mainButton: {
    marginBottom: theme.custom.spacing.l,
    shadowColor: theme.custom.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
