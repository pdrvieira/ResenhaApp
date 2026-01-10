import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../theme';

// Atomic Components
import { ReScreen } from '../../components/atoms/ReScreen';
import { ReText } from '../../components/atoms/ReText';
import { ReInput } from '../../components/atoms/ReInput';
import { ReButton } from '../../components/atoms/ReButton';

export const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  const handleSignup = async () => {
    Keyboard.dismiss();
    setError('');

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

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

    setLoading(true);
    const { error: signUpError, session } = await signUp(trimmedEmail, trimmedPassword);
    setLoading(false);

    if (signUpError) {
      // Tradução amigável de erros comuns do Supabase
      if (signUpError.includes('already registered')) {
        setError('Este email já está cadastrado.');
      } else {
        setError(signUpError);
      }
      return;
    }

    if (!session) {
      Alert.alert(
        'Verifique seu email',
        'Enviamos um link de confirmação para o seu email. Por favor, confirme para continuar.',
        [{ text: 'ENTENDI', onPress: () => navigation.navigate('Login') }]
      );
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <ReScreen scrollable contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={styles.header}>
        <ReText variant="displaySmall" weight="700" style={styles.emojiTitle}>
          🚀
        </ReText>
        <ReText variant="displaySmall" weight="bold" color="textPrimary" style={styles.title}>
          Crie sua conta
        </ReText>
        <ReText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Entre para fazer parte dos melhores <ReText variant="bodyLarge" color="primary" weight="bold">Círculos</ReText>.
        </ReText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <ReInput
          label="Seu melhor email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
          leftIcon="email-outline"
        />

        <View style={styles.spacer} />

        <ReInput
          label="Senha (min. 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          disabled={loading}
          leftIcon="lock-outline"
        />

        <View style={styles.spacer} />

        <ReInput
          label="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          disabled={loading}
          leftIcon="lock-check-outline"
          error={confirmPassword && password !== confirmPassword ? "As senhas não coincidem" : undefined}
        />

        {/* Actions */}
        <View style={styles.actions}>
          <ReText variant="bodyMedium" color="textSecondary" align="center" style={styles.legalText}>
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </ReText>

          <ReButton
            label="CRIAR CONTA"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.mainButton}
          />

          <View style={styles.footer}>
            <ReText variant="bodyMedium" color="textSecondary">
              Já tem conta?{' '}
            </ReText>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <ReText variant="bodyMedium" color="primary" weight="bold">
                Entre aqui
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
    padding: theme.custom.spacing.l,
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
    maxWidth: '90%',
  },
  form: {
    marginBottom: theme.custom.spacing.l,
  },
  spacer: {
    height: theme.custom.spacing.m, // 16px
  },
  actions: {
    marginTop: theme.custom.spacing.xl,
  },
  mainButton: {
    marginBottom: theme.custom.spacing.l,
    shadowColor: theme.custom.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  legalText: {
    fontSize: 12,
    marginBottom: theme.custom.spacing.l,
    paddingHorizontal: theme.custom.spacing.s,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
