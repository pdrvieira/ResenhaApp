# Resenha Social Circle - App React Native

## 📱 Visão Geral

**Resenha Social Circle** é uma aplicação mobile de rede social focada em eventos sociais ("resenhas"). O app permite que usuários descubram, criem e participem de eventos presenciais, conectando-se com outras pessoas através de um sistema de amizades e chat em tempo real.

**Versão:** MVP (Fase 1)

---

## 🏗️ Arquitetura

### Backend-First com Supabase

O projeto segue uma arquitetura **Backend-First**, onde a máxima lógica de negócio é delegada ao Supabase:

- **Supabase Auth**: Autenticação com email/senha, Google e Apple
- **PostgreSQL**: Banco de dados relacional com RLS (Row Level Security)
- **Edge Functions**: Lógica de negócio complexa (validações, notificações, processamento)
- **Realtime**: Chat e notificações em tempo real
- **Storage**: Upload de imagens com CDN global

### Frontend - React Native

O app React Native atua como cliente leve, responsável apenas por:

- **UI/UX**: Renderização de componentes
- **Navegação**: Stack + Tab Navigator
- **Estado Local**: Zustand para UI state, React Query para cache de dados
- **Integração**: Chamadas ao Supabase via SDK JavaScript

---

## 📁 Estrutura do Projeto

```
ResenhaSocialCircle/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── LoadingScreen.tsx
│   ├── screens/             # Telas da aplicação
│   │   ├── Auth/            # Telas de autenticação
│   │   ├── Onboarding/      # Fluxo de onboarding (4 steps)
│   │   └── Main/            # Telas principais (Feed, Chat, etc.)
│   ├── hooks/               # Hooks customizados
│   │   ├── useEvents.ts     # Lógica de eventos
│   │   ├── useParticipation.ts # Lógica de participação
│   │   └── useChat.ts       # Lógica de chat
│   ├── contexts/            # Context API
│   │   └── AuthContext.tsx  # Autenticação global
│   ├── navigation/          # Navegação
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── OnboardingNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── services/            # Serviços
│   │   └── supabase.ts      # Cliente Supabase
│   ├── types/               # Tipos TypeScript
│   │   └── index.ts
│   └── utils/               # Utilitários
├── App.tsx                  # Componente raiz
├── .env.example             # Variáveis de ambiente (template)
└── PROJECT_SETUP.md         # Este arquivo
```

---

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- React Native CLI
- Android Studio (para Android) ou Xcode (para iOS)

### 1. Clonar o Repositório

```bash
git clone <repo-url>
cd ResenhaSocialCircle
```

### 2. Instalar Dependências

```bash
npm install
# ou
yarn install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais do Supabase:

```
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Configurar Supabase

1. Criar um projeto em [supabase.com](https://supabase.com)
2. Executar as migrations SQL (ver seção "Database Setup")
3. Configurar RLS policies
4. Criar Edge Functions

### 5. Executar o App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

---

## 🗄️ Database Setup (Supabase)

### Tabelas MVP (Fase 1)

```sql
-- users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  city TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  event_at TIMESTAMP NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  max_participants INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- event_participants
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- participation_requests
CREATE TABLE participation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- chats
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id),
  user2_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('new_request', 'request_accepted', 'request_rejected')),
  payload JSONB,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID NOT NULL REFERENCES users(id),
  target_id UUID NOT NULL REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rater_id, target_id, event_id)
);
```

### Índices Recomendados

```sql
CREATE INDEX idx_events_event_at ON events(event_at);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
```

---

## 🔐 RLS Policies

Implementar Row Level Security para cada tabela. Exemplo para `events`:

```sql
-- Usuários podem ver eventos públicos
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (deleted_at IS NULL);

-- Apenas o criador pode atualizar seu evento
CREATE POLICY "Users can update their own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

-- Apenas o criador pode deletar seu evento
CREATE POLICY "Users can delete their own events" ON events
  FOR DELETE USING (auth.uid() = creator_id);
```

---

## 📱 Telas do MVP (Fase 1)

### 1. **Auth** (Autenticação)
- Login com email/senha
- Signup (criar conta)
- Recuperar senha

### 2. **Onboarding** (4 Steps)
- Step 1: Nome e Username
- Step 2: Foto de Perfil
- Step 3: Cidade
- Step 4: Preferências (notificações)

### 3. **Feed** (Descoberta de Eventos)
- Lista de eventos ordenada por data
- Busca por texto
- Pull to refresh
- Scroll infinito

### 4. **Criar Evento** (4 Steps)
- Step 1: Upload de foto
- Step 2: Título e descrição
- Step 3: Data e localização
- Step 4: Limite de participantes

### 5. **Detalhes do Evento**
- Informações completas
- Lista de participantes
- Botão "Solicitar Participação"
- Gerenciamento de solicitações (para criador)

### 6. **Chat 1-1**
- Lista de conversas
- Tela de chat com mensagens em tempo real
- Envio de mensagens

### 7. **Perfil**
- Avatar, nome, username
- Estatísticas (eventos criados, participações)
- Botão "Editar Perfil"

### 8. **Configurações**
- Editar perfil
- Preferências de notificação
- Logout

---

## 🔄 Fluxos Principais

### Fluxo de Autenticação
```
Login/Signup → Verificar onboarding → Onboarding (se necessário) → Feed
```

### Fluxo de Criação de Evento
```
Feed → Botão "Criar" → Step 1 (foto) → Step 2 (info) → Step 3 (data/local) → Step 4 (limite) → Criar → Feed
```

### Fluxo de Participação
```
Feed → Evento → "Solicitar Participação" → Notificação ao criador → Criador aceita/rejeita → Notificação ao usuário
```

---

## 🛠️ Desenvolvimento

### Adicionar Nova Tela

1. Criar arquivo em `src/screens/[Category]/NewScreen.tsx`
2. Exportar em `src/screens/[Category]/index.ts`
3. Adicionar rota no navegador apropriado

### Adicionar Novo Hook

1. Criar arquivo em `src/hooks/useNewFeature.ts`
2. Usar React Query para cache de dados
3. Integrar com Supabase

### Adicionar Novo Componente

1. Criar arquivo em `src/components/NewComponent.tsx`
2. Exportar em `src/components/index.ts` (se necessário)
3. Reutilizar em telas

---

## 📦 Dependências Principais

- **@react-navigation**: Navegação
- **@supabase/supabase-js**: Cliente Supabase
- **@tanstack/react-query**: Cache de dados
- **zustand**: State management
- **react-native-paper**: Componentes UI
- **react-native-reanimated**: Animações
- **@notifee/react-native**: Push notifications

---

## 🧪 Testes

```bash
npm run test
```

---

## 📋 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Supabase migrations executadas
- [ ] RLS policies ativas
- [ ] Edge Functions deployadas
- [ ] Storage buckets criados
- [ ] Testes passando
- [ ] Build Android/iOS gerado
- [ ] App enviado para stores

---

## 🔮 Próximas Fases

### Fase 2 (Core Features)
- Filtros avançados na busca
- Mapa interativo
- Calendário pessoal
- Sistema de amizades
- Notificações push

### Fase 3 (Enhanced)
- Grupos/comunidades
- Stories
- Analytics dashboard
- Gamificação

### Fase 4 (Premium)
- Eventos pagos
- Integrações externas
- Otimizações finais

---

## 📚 Recursos Úteis

- [React Native Docs](https://reactnative.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Native Paper Docs](https://callstack.github.io/react-native-paper)

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Versão:** 1.0.0  
**Data:** Dezembro 2024  
**Autor:** Manus Team
