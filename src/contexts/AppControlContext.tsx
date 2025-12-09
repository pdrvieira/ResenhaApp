import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppControlContextType {
  isFirstLaunch: boolean;
  loading: boolean;
  completeWalkthrough: () => Promise<void>;
}

const AppControlContext = createContext<AppControlContextType | undefined>(undefined);

const KEY_HAS_LAUNCHED = '@resenha_has_launched';

export const AppControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem(KEY_HAS_LAUNCHED);
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar first launch:', error);
      // Em caso de erro, assume que não é first launch para não travar o user
      setIsFirstLaunch(false);
    } finally {
      setLoading(false);
    }
  };

  const completeWalkthrough = async () => {
    try {
      await AsyncStorage.setItem(KEY_HAS_LAUNCHED, 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('❌ Erro ao salvar status de walkthrough:', error);
    }
  };

  return (
    <AppControlContext.Provider value={{ isFirstLaunch, loading, completeWalkthrough }}>
      {children}
    </AppControlContext.Provider>
  );
};

export const useAppControl = () => {
  const context = useContext(AppControlContext);
  if (context === undefined) {
    throw new Error('useAppControl deve ser usado dentro de AppControlProvider');
  }
  return context;
};
