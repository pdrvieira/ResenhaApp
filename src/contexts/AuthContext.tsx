import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, User } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translateSupabaseError } from '../utils/authErrors';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; session?: Session | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ... (ensureUserRecord and useEffect remain unchanged) ...

  /**
   * Garante que o usuário exista na tabela public.users.
   * Cria o registro se não existir e retorna o perfil completo.
   * Com timeout de segurança para evitar travamentos.
   * Nunca retorna null - sempre retorna um User válido ou fallback.
   */
  const ensureUserRecord = async (
    sessionUser: { id: string; email?: string | null } | null,
    emailFallback?: string
  ): Promise<User | null> => {
    // ... implementation logic ...
    if (!sessionUser?.id) {
      console.warn('⚠️ ensureUserRecord chamado sem sessionUser válido');
      return null;
    }

    const fallbackUser: User = {
      id: sessionUser.id,
      email: sessionUser.email || emailFallback || '',
      name: '',
      username: '',
      onboarding_complete: false,
      avatar_url: null as any,
      city: null as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Timeout de segurança: 3 segundos máximo
      const timeoutPromise = new Promise<User>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao garantir registro do usuário')), 3000);
      });

      const dbOperation = async (): Promise<User> => {
        // Tentar buscar o usuário
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('❌ Erro ao buscar usuário (ensureUserRecord):', fetchError);
          return fallbackUser; // fallback para não travar a UI
        }

        if (existingUser) {
          return existingUser;
        }

        // Não existe: criar
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: sessionUser.id,
            email: sessionUser.email || emailFallback || '',
            name: '',
            username: '',
            onboarding_complete: false,
          });

        if (insertError) {
          console.error('❌ Erro ao criar usuário (ensureUserRecord):', insertError);
          return fallbackUser;
        }

        const { data: newUser, error: fetchNewError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (fetchNewError) {
          console.error('❌ Erro ao buscar usuário recém-criado:', fetchNewError);
          return fallbackUser;
        }

        return newUser ?? fallbackUser;
      };

      return await Promise.race([dbOperation(), timeoutPromise]);
    } catch (error) {
      console.error('❌ Erro/Timeout em ensureUserRecord:', error);
      return fallbackUser; // Sempre retornar fallback em caso de erro
    }
  };

  // Carrega sessão salva no AsyncStorage e escuta mudanças
  useEffect(() => {
    let mounted = true;
    let initialLoadingComplete = false;

    // Timeout de segurança para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      if (mounted && !initialLoadingComplete) {
        console.warn('⚠️ Timeout na inicialização - forçando loading = false');
        setLoading(false);
        initialLoadingComplete = true;
      }
    }, 5000); // 5 segundos máximo

    const handleAuthState = async (session: Session | null, isInitial = false) => {
      if (!mounted) return;

      try {
        setSession(session ?? null);

        if (session?.user) {
          const profile = await ensureUserRecord(session.user);
          if (mounted) {
            // Sempre garantir que temos um usuário válido
            if (profile) {
              console.log(`✅ Usuário ${isInitial ? 'carregado' : 'atualizado'}:`, profile.email || profile.id);
              setUser(profile);
            } else {
              // Se ensureUserRecord retornar null, criar fallback
              console.warn('⚠️ ensureUserRecord retornou null, usando fallback');
              const fallbackUser: User = {
                id: session.user.id,
                email: session.user.email || '',
                name: '',
                username: '',
                onboarding_complete: false,
                avatar_url: null as any,
                city: null as any,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUser(fallbackUser);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
            if (!isInitial) {
              console.log('🚪 Usuário deslogado');
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao processar estado de autenticação:', error);
        // Em caso de erro, garantir que temos pelo menos os dados básicos da sessão
        if (mounted && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: '',
            username: '',
            onboarding_complete: false,
            avatar_url: null as any,
            city: null as any,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    };

    // Carrega sessão inicial
    const getInitialSession = async () => {
      try {
        console.log('🔐 Iniciando autenticação...');

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('❌ Erro ao pegar sessão inicial:', error);
          setLoading(false);
          initialLoadingComplete = true;
          clearTimeout(loadingTimeout);
          return;
        }

        console.log('✅ Sessão obtida:', session ? 'Usuário logado' : 'Sem sessão');

        await handleAuthState(session, true);

      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
      } finally {
        if (mounted) {
          console.log('✅ Autenticação inicializada, loading = false');
          setLoading(false);
          initialLoadingComplete = true;
          clearTimeout(loadingTimeout);
        }
      }
    };

    getInitialSession();

    // Escuta mudanças no estado de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.id);

      // Se ainda não terminou o carregamento inicial, aguardar
      if (!initialLoadingComplete) {
        return; // getInitialSession vai lidar com isso
      }

      // Para mudanças subsequentes, atualizar imediatamente
      await handleAuthState(session, false);

      // Garantir que loading está false após mudanças
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);

    try {
      console.log('📝 Criando conta para:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        console.log('🔸 Falha no cadastro (esperado):', error.message);
        return { error: translateSupabaseError(error.message) };
      }

      console.log('✅ Usuário criado no Auth:', data.user?.id);

      // Criar registro do usuário na tabela users
      if (data.user) {
        console.log('📝 Garantindo registro na tabela users...');
        const profile = await ensureUserRecord(data.user, email.trim());
        if (profile) {
          console.log('✅ Usuário pronto após signup:', profile.email);
          setUser(profile);
        }
      }

      setSession(data.session ?? null);

      return { error: null, session: data.session };
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Erro completo no signUp:', error);
      return { error: translateSupabaseError(error.message || 'Erro ao criar conta') };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    try {
      console.log('🔐 Tentando fazer login para:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        console.log('🔸 Falha no login (esperado):', error.message);
        return { error: translateSupabaseError(error.message) };
      }

      console.log('✅ Login bem-sucedido:', data.user?.id);

      setSession(data.session ?? null);

      // Buscar dados do usuário
      if (data.user) {
        const profile = await ensureUserRecord(data.user, email.trim());
        if (profile) {
          console.log('✅ Perfil do usuário carregado:', profile.email);
          setUser(profile);
        }
      }

      return { error: null };
    } catch (error: any) {
      setLoading(false);
      console.error('❌ Erro completo no login:', error);
      return { error: translateSupabaseError(error.message || 'Erro ao fazer login') };
    }
  };

  const signOut = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      setLoading(false);

      if (error) {
        console.error('❌ Erro ao deslogar:', error);
        throw error;
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('📝 Atualizando perfil:', { userId: user.id, updates });

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar perfil no banco:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Dados não retornados ao atualizar perfil');
      }

      console.log('✅ Perfil atualizado com sucesso:', data.email);

      // Atualizar estado do usuário
      setUser(data);

      return data;
    } catch (error: any) {
      console.error('❌ Erro completo em updateProfile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    onboardingComplete: user?.onboarding_complete || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
