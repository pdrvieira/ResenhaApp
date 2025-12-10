import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useAppControl } from '../contexts/AppControlContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { AuthNavigator } from './AuthNavigator';
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';
import { WalkthroughNavigator } from './WalkthroughNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, onboardingComplete, loading: authLoading, user, isPasswordReset } = useAuth();
  const { isFirstLaunch, loading: appLoading } = useAppControl();

  const loading = authLoading || appLoading;

  // Log para debug
  React.useEffect(() => {
    console.log('🔍 RootNavigator - Estado atualizado:', {
      isAuthenticated,
      onboardingComplete,
      loading,
      isFirstLaunch,
      isPasswordReset,
      userId: user?.id,
    });
  }, [isAuthenticated, onboardingComplete, loading, user, isFirstLaunch, isPasswordReset]);

  if (loading) {
    return <LoadingScreen message="Inicializando..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isPasswordReset ? (
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      ) : isFirstLaunch ? (
        <Stack.Screen name="Walkthrough" component={WalkthroughNavigator} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};
