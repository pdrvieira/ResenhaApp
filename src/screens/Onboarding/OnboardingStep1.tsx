import React, { useState } from 'react';
import { View, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import { Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../../theme';

// Atomic Components
import { ReScreen } from '../../components/atoms/ReScreen';
import { ReText } from '../../components/atoms/ReText';
import { ReInput } from '../../components/atoms/ReInput';
import { ReButton } from '../../components/atoms/ReButton';

interface OnboardingStep1Props {
  onNext: (data: { name: string; username: string }) => void;
  onBack: () => void;
  loading?: boolean;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ onNext, onBack, loading = false }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (text: string) => {
    // 1. Sanitização: Apenas letras e espaços
    let sanitized = text.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');

    // 2. Limite: Máximo 50 caracteres
    if (sanitized.length > 50) return;

    // 3. UX: Impede múltiplos espaços seguidos
    sanitized = sanitized.replace(/\s{2,}/g, ' ');

    // 4. Force Title Case Rígido (Pedro Vieira)
    // Converte tudo para minúsculo primeiro, depois capitaliza a primeira letra de cada palavra
    sanitized = sanitized
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, m => m.toUpperCase());

    setName(sanitized);
    if (error) setError('');
  };

  const handleUsernameChange = (text: string) => {
    // 1. Sanitização: Alphanumeric, _ e .
    // 2. Limite: Máximo 30 caracteres
    const sanitized = text.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();

    if (sanitized.length > 30) return;

    setUsername(sanitized);
    if (error) setError('');
  };

  const handleNext = () => {
    Keyboard.dismiss();
    setError('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    // Validações de Nome
    if (!trimmedName) {
      setError('Como podemos te chamar? O nome é obrigatório.');
      return;
    }

    if (trimmedName.length < 4) {
      setError('O nome parece muito curto.');
      return;
    }

    if (trimmedName.split(' ').length < 2) {
      setError('Por favor, digite seu Nome e Sobrenome.');
      return;
    }

    // Validações de Username
    if (!trimmedUsername) {
      setError('Escolha um @username único.');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('O username deve ter pelo menos 3 caracteres.');
      return;
    }

    if (trimmedUsername.startsWith('.') || trimmedUsername.endsWith('.')) {
      setError('O username não pode começar ou terminar com ponto.');
      return;
    }

    if (trimmedUsername.includes('..') || trimmedUsername.includes('__')) {
      setError('Evite pontos ou underlines seguidos.');
      return;
    }

    onNext({ name: trimmedName, username: trimmedUsername });
  };

  return (
    <ReScreen scrollable contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>

        <ReText variant="labelLarge" color="primary" style={styles.stepIndicator}>
          Passo 1 de 3
        </ReText>
        <ReText variant="displaySmall" weight="bold" style={styles.title}>
          Quem é você?
        </ReText>
        <ReText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Diga como prefere ser chamado no Resenha.
        </ReText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <ReInput
          label="Nome Completo (ou apelido)"
          value={name}
          onChangeText={handleNameChange}
          placeholder="Ex: João da Silva"
          disabled={loading}
          leftIcon="account-outline"
          autoCapitalize="words"
        />

        <View style={styles.spacer} />

        <ReInput
          label="@username"
          value={username}
          onChangeText={handleUsernameChange}
          placeholder="Ex: joaosilva"
          autoCapitalize="none"
          disabled={loading}
          leftIcon="at"
          error={error.includes('username') ? error : undefined}
        />

        {/* Actions */}
        <View style={styles.actions}>
          <ReButton
            label="CONTINUAR"
            onPress={handleNext}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.mainButton}
          />
        </View>
      </View>

      <Snackbar
        visible={!!error && !error.includes('username')}
        onDismiss={() => setError('')}
        duration={3000}
        style={{
          backgroundColor: theme.custom.colors.error,
          borderRadius: theme.custom.roundness.m,
          marginBottom: 20,
        }}
        wrapperStyle={styles.snackbarWrapper}
      >
        <ReText variant="labelLarge" style={{ color: '#fff', textAlign: 'center' }}>
          {error}
        </ReText>
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
  },
  backButton: {
    marginBottom: theme.custom.spacing.m,
    marginLeft: -theme.custom.spacing.xs,
    padding: theme.custom.spacing.xs,
  },
  stepIndicator: {
    marginBottom: theme.custom.spacing.s,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: theme.custom.spacing.xs,
  },
  subtitle: {
    maxWidth: '85%',
  },
  form: {
    marginBottom: theme.custom.spacing.l,
  },
  spacer: {
    height: theme.custom.spacing.m,
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
  snackbarWrapper: {
    alignSelf: 'center',
    width: '90%',
    bottom: 40,
  }
});
