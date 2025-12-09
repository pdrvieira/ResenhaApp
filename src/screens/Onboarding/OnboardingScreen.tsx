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

  const uploadPhoto = async (uri: string, userId: string): Promise<string | null> => {
    try {
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/avatar_${Date.now()}.${ext}`;

      // Workaround for React Native + Supabase Storage upload
      // Reads the file uri into a blob/buffer using fetch
      const result = await fetch(uri);
      const blob = await result.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: false,
        });

      if (error) {
        console.error('❌ Erro no upload da foto:', error);
        return null; // Falha silenciosa na foto, não bloqueia o fluxo
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('❌ Exceção no upload da foto:', error);
      return null;
    }
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

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ Finalizando onboarding com dados:', {
        name: onboardingData.name,
        username: onboardingData.username,
        city: onboardingData.city,
      });

      let avatarUrl = null;
      if (onboardingData.photoUri) {
        console.log('📸 Iniciando upload da foto...');
        avatarUrl = await uploadPhoto(onboardingData.photoUri, user.id);
      }

      // Atualizar perfil do usuário
      await updateProfile({
        name: onboardingData.name.trim(),
        username: onboardingData.username.trim(),
        city: onboardingData.city.trim(),
        notifications_enabled: preferences.notificationsEnabled,
        onboarding_complete: true,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      });

      console.log('✅ Onboarding concluído com sucesso!');

      // Marcar onboarding como completo localmente
      setOnboardingData((prev) => ({
        ...prev,
        notificationsEnabled: preferences.notificationsEnabled,
      }));

      // O RootNavigator deve detectar a mudança automaticamente e navegar

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
