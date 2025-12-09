import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
import { OnboardingStep3 } from './OnboardingStep3';
import { OnboardingStep4 } from './OnboardingStep4';
import { LoadingScreen } from '../../components/LoadingScreen';

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    username: '',
    photoUri: null as string | null,
    city: '',
    notificationsEnabled: true,
  });
  const { updateProfile, user, onboardingComplete } = useAuth();

  // Monitora quando o onboarding é concluído para garantir que o RootNavigator navegue
  useEffect(() => {
    if (onboardingComplete && user) {
      console.log('✅ Onboarding completo detectado, RootNavigator deve navegar automaticamente');
    }
  }, [onboardingComplete, user]);

  const handleStep1 = (data: { name: string; username: string }) => {
    setOnboardingData((prev) => ({
      ...prev,
      name: data.name,
      username: data.username,
    }));
    setStep(2);
    setError(null);
  };

  const handleStep2 = (photoUri?: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      photoUri: photoUri || null,
    }));
    setStep(3);
    setError(null);
  };

  const handleStep3 = (city: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      city,
    }));
    setStep(4);
    setError(null);
  };

  const handleStep4 = async (preferences: { notificationsEnabled: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      // Validações básicas
      if (!onboardingData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!onboardingData.username.trim()) {
        throw new Error('Username é obrigatório');
      }
      if (!onboardingData.city.trim()) {
        throw new Error('Cidade é obrigatória');
      }

      console.log('✅ Finalizando onboarding com dados:', {
        name: onboardingData.name,
        username: onboardingData.username,
        city: onboardingData.city,
      });

      // Atualizar perfil do usuário
      await updateProfile({
        name: onboardingData.name.trim(),
        username: onboardingData.username.trim(),
        city: onboardingData.city.trim(),
        onboarding_complete: true,
      });

      console.log('✅ Onboarding concluído com sucesso!');
      
      // TODO: Upload de foto se fornecida
      // TODO: Salvar preferências de notificação

      // Marcar onboarding como completo localmente
      setOnboardingData((prev) => ({
        ...prev,
        notificationsEnabled: preferences.notificationsEnabled,
      }));

      // O RootNavigator deve detectar a mudança automaticamente e navegar
      // Mas garantimos que o estado foi atualizado
      
    } catch (error: any) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      const errorMessage = error?.message || 'Erro ao finalizar onboarding. Tente novamente.';
      setError(errorMessage);
      Alert.alert(
        'Erro',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Finalizando..." />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && <OnboardingStep1 onNext={handleStep1} loading={loading} />}
      {step === 2 && <OnboardingStep2 onNext={handleStep2} onSkip={() => setStep(3)} loading={loading} />}
      {step === 3 && <OnboardingStep3 onNext={handleStep3} loading={loading} />}
      {step === 4 && <OnboardingStep4 onFinish={handleStep4} loading={loading} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
