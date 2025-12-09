import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Variáveis de ambiente devem estar no arquivo .env na raiz do projeto ResenhaApp
// Usando valores hardcoded como fallback caso @env não funcione
let SUPABASE_URL = 'https://pqgdwjgrzlmfqsinybht.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZ2R3amdyemxtZnFzaW55Ymh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMzQ3MDMsImV4cCI6MjA2NjgxMDcwM30.AL4ehtFbiItjAr_g5Oj-B5Vr_HFEjc6RlfP0-lx6p0Y';

// Tentar carregar do @env se disponível
try {
  const env = require('@env');
  if (env.REACT_NATIVE_SUPABASE_URL) {
    SUPABASE_URL = env.REACT_NATIVE_SUPABASE_URL;
  }
  if (env.REACT_NATIVE_SUPABASE_ANON_KEY) {
    SUPABASE_ANON_KEY = env.REACT_NATIVE_SUPABASE_ANON_KEY;
  }
} catch (e) {
  // @env não disponível, usar valores hardcoded
  console.log('Usando valores hardcoded do Supabase (variáveis de ambiente não disponíveis)');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // RN não usa URL de callback
  },
});

// Teste de inicialização
console.log('🔧 Supabase inicializado:', {
  url: SUPABASE_URL.substring(0, 30) + '...',
  hasKey: !!SUPABASE_ANON_KEY,
});

// Tipos de dados do Supabase
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar_url?: string;
  city?: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  image_url?: string;
  event_at: string;
  city: string;
  address: string;
  max_participants?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface ParticipationRequest {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: 'new_request' | 'request_accepted' | 'request_rejected';
  payload: Record<string, any>;
  read_at?: string;
  created_at: string;
}

export interface Rating {
  id: string;
  rater_id: string;
  target_id: string;
  event_id?: string;
  stars: number;
  created_at: string;
}
