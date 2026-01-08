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
  notifications_enabled?: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Modos de Evento
export type EventMode = 'resenha' | 'networking';

// Configurações Específicas (Metadata)
export interface ResenhaMetadata {
  vibe?: 'chill' | 'party' | 'bar' | 'heavy'; // bem de boa, animado, festa mesmo...
}

export interface NetworkingMetadata {
  theme?: string; // Tema principal
  area?: 'tech' | 'marketing' | 'business' | 'creative' | 'general' | 'other';
  profile?: 'beginner' | 'mid' | 'senior' | 'mixed';
  format?: 'chat' | 'round_table' | 'presentation' | 'open';
}

export type EventMetadata = ResenhaMetadata | NetworkingMetadata;

// Tags (Sistema unificado, filtrado no front)
export const EVENT_TAGS = {
  // Resenha Tags
  '#aniversario': { label: '#Aniversário', mode: 'resenha' },
  '#churrasco': { label: '#Churrasco', mode: 'resenha' },
  '#festa': { label: '#Festa', mode: 'resenha' },
  '#bar': { label: '#Bar', mode: 'resenha' },
  '#show': { label: '#Show', mode: 'resenha' },
  '#resenhaaberta': { label: '#ResenhaAberta', mode: 'resenha' },
  '#after': { label: '#After', mode: 'resenha' },

  // Networking Tags
  '#networking': { label: '#Networking', mode: 'networking' },
  '#tech': { label: '#Tech', mode: 'networking' },
  '#startups': { label: '#Startups', mode: 'networking' },
  '#design': { label: '#Design', mode: 'networking' },
  '#marketing': { label: '#Marketing', mode: 'networking' },
  '#empreendedorismo': { label: '#Empreendedorismo', mode: 'networking' },
} as const;

export type EventTag = keyof typeof EVENT_TAGS;

export interface Event {
  id: string;
  creator_id: string;
  mode: EventMode; // NOT NULL, default 'resenha'
  title: string;
  description: string;
  image_url?: string;
  event_at: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  max_participants?: number;
  bring_what?: 'nothing' | 'drinks' | 'food' | 'dessert' | 'ice' | 'anything'; // Relevante para Resenha
  audience: 'everyone' | 'adults_only' | 'invite_only';
  motivation?: string;
  tags?: EventTag[]; // Array de tags
  metadata?: EventMetadata; // Campos flexíveis específicos do modo

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// Labels para bring_what
export const BRING_WHAT_OPTIONS = {
  nothing: { label: '🆓 Nada', shortLabel: 'Nada' },
  drinks: { label: '🍺 Bebidas', shortLabel: 'Bebidas' },
  food: { label: '🍕 Comida/Petiscos', shortLabel: 'Comida' },
  dessert: { label: '🍰 Sobremesa', shortLabel: 'Sobremesa' },
  ice: { label: '🧊 Gelo', shortLabel: 'Gelo' },
  anything: { label: '🎁 Algo para compartilhar', shortLabel: 'Algo' },
} as const;

export type BringWhatType = keyof typeof BRING_WHAT_OPTIONS;

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
  type: 'new_request' | 'request_accepted' | 'request_rejected' | 'event_updated' | 'event_cancelled';
  event_id?: string;
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
