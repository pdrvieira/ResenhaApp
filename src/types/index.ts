// Tipos para navegação
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  CreateEvent: undefined;
  Messages: undefined;
  Account: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  Step4: undefined;
};

// Tipos de dados
export interface EventCard {
  id: string;
  title: string;
  image_url?: string;
  event_at: string;
  city: string;
  participantCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  city?: string;
  eventsCreated: number;
  participations: number;
  rating: number;
}

// Tipos de erro
export interface ApiError {
  message: string;
  code?: string;
}
