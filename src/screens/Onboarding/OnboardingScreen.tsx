import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { OnboardingStep1 } from './OnboardingStep1';
import { OnboardingStep2 } from './OnboardingStep2';
// Step 3 (Cidade) removido. A localização será pega via GPS na Home.
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
    // city removido
    notificationsEnabled: true,
  });
  const { updateProfile, user, onboardingComplete, signOut } = useAuth();

  // Monitora quando o onboarding é concluído
  useEffect(() => {
    if (onboardingComplete && user) {
      console.log('✅ Onboarding completo detectado, RootNavigator deve navegar automaticamente');
    }
  }, [onboardingComplete, user]);

  const handleBack = () => {
    if (step === 1) {
      Alert.alert(
        'Sair',
        'Deseja sair da criação de conta?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: () => signOut() },
        ]
      );
    } else {
      setStep((prev) => prev - 1);
    }
  };

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
    // Pula direto para o passo final (que era o 4, agora visualmente será o 3)
    setStep(4);
    setError(null);
  };

  // handleStep3 removido

  const uploadPhoto = async (uri: string, userId: string): Promise<string | null> => {
    try {
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/avatar_${Date.now()}.${ext}`;

      // Workaround for React Native + Supabase Storage upload
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
        return null;
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

      if (!onboardingData.name.trim()) throw new Error('Nome é obrigatório');
      if (!onboardingData.username.trim()) throw new Error('Username é obrigatório');
      if (!user) throw new Error('Usuário não autenticado');

      console.log('✅ Finalizando onboarding...');

      let avatarUrl = null;
      if (onboardingData.photoUri) {
        console.log('📸 Iniciando upload da foto...');
        avatarUrl = await uploadPhoto(onboardingData.photoUri, user.id);
      }

      // Atualizar perfil
      await updateProfile({
        name: onboardingData.name.trim(),
        username: onboardingData.username.trim(),
        notifications_enabled: preferences.notificationsEnabled,
        onboarding_complete: true,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      });

      console.log('✅ Onboarding concluído!');

    } catch (error: any) {
      console.error('❌ Erro ao finalizar onboarding:', error);
      const errorMessage = error?.message || 'Erro ao finalizar onboarding.';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Finalizando..." />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && (
        <OnboardingStep1
          onNext={handleStep1}
          onBack={handleBack}
          loading={loading}
        />
      )}
      {step === 2 && (
        <OnboardingStep2
          onNext={handleStep2}
          onSkip={() => setStep(4)} // Pula para o step 4 (Notificações)
          onBack={handleBack}
          loading={loading}
        />
      )}
      {/* Step 3 Removido */}
      {step === 4 && (
        <OnboardingStep4
          onFinish={handleStep4}
          onBack={() => setStep(2)} // Volta para o Step 2 (Foto)
          loading={loading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
