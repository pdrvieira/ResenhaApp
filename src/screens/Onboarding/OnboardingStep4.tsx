import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotificationPermission } from '../../hooks/useNotificationPermission';
import { theme } from '../../theme';

// Atomic Components
import { ReScreen } from '../../components/atoms/ReScreen';
import { ReText } from '../../components/atoms/ReText';
import { ReButton } from '../../components/atoms/ReButton';

interface OnboardingStep4Props {
  onFinish: (preferences: { notificationsEnabled: boolean }) => void;
  onBack: () => void;
  loading?: boolean;
}

export const OnboardingStep4: React.FC<OnboardingStep4Props> = ({ onFinish, onBack, loading = false }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { requestPermission } = useNotificationPermission();

  const handleToggleNotifications = useCallback(async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      await requestPermission();
    }
  }, [requestPermission]);

  const handleFinish = async () => {
    if (notificationsEnabled) {
      await requestPermission();
    }
    onFinish({ notificationsEnabled });
  };

  return (
    <ReScreen scrollable contentContainerStyle={styles.scrollContent}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={theme.custom.colors.textPrimary} />
        </TouchableOpacity>

        <ReText variant="labelLarge" color="primary" style={styles.stepIndicator}>
          Passo 3 de 3
        </ReText>
        <ReText variant="displaySmall" weight="bold" style={styles.title}>
          Fique por dentro!
        </ReText>
        <ReText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Ative as notificações para não perder convites e atualizações importantes.
        </ReText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconArea}>
            <Icon
              name={notificationsEnabled ? "bell-ring" : "bell-off"}
              size={32}
              color={notificationsEnabled ? theme.custom.colors.primary : theme.custom.colors.textSecondary}
            />
          </View>
          <View style={styles.textArea}>
            <ReText variant="labelLarge" weight="bold">Notificações Push</ReText>
            <ReText variant="bodyMedium" color="textSecondary">
              Saiba quando alguém quer participar dos seus eventos.
            </ReText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={loading}
            trackColor={{ false: '#e0e0e0', true: theme.custom.colors.primary }}
            thumbColor={'#fff'}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ReButton
            label="FINALIZAR E ENTRAR"
            onPress={handleFinish}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.mainButton}
          />
        </View>
      </View>
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
    maxWidth: '90%',
  },
  content: {
    marginBottom: theme.custom.spacing.l,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.custom.colors.surface,
    padding: theme.custom.spacing.m,
    borderRadius: theme.custom.roundness.m,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconArea: {
    marginRight: theme.custom.spacing.m,
  },
  textArea: {
    flex: 1,
    marginRight: theme.custom.spacing.s,
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
});
