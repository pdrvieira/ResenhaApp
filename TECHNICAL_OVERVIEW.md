# Documentação Técnica - ResenhaApp

Esta documentação fornece uma visão técnica detalhada do projeto **Resenha Social Circle**, baseada na análise do código fonte e estrutura do projeto.

## 1. Visão Geral do Sistema

O **ResenhaApp** é uma aplicação móvel desenvolvida em **React Native** (CLI) focada em eventos sociais. A arquitetura segue o modelo **Backend-First** utilizando o **Supabase** como plataforma de Backend-as-a-Service (BaaS).

### Tecnologias Principais

-   **Frontend**: React Native 0.82.1
-   **Linguagem**: TypeScript
-   **Backend / Banco de Dados**: Supabase (PostgreSQL)
-   **Gerenciamento de Estado**: Zustand + React Context (Auth)
-   **Cache & Data Fetching**: React Query (@tanstack/react-query)
-   **Navegação**: React Navigation (Stack)
-   **UI Library**: React Native Paper

## 2. Arquitetura e Estrutura de Pastas

A estrutura do projeto segue padrões comuns de React Native, organizada por responsabilidades dentro de `src/`:

```
src/
├── components/     # Componentes de UI reutilizáveis (ex: LoadingScreen)
├── screens/        # Telas da aplicação, divididas por fluxo (Auth, Main, Onboarding)
├── navigation/     # Configuradores de navegação (Root, Auth, Main, Onboarding)
├── services/       # Integrações externas (principalmente supabase.ts)
├── contexts/       # Contextos globais (AuthContext.tsx)
├── hooks/          # Custom hooks (lógica de negócios/dados)
├── types/          # Definições de tipos TypeScript globais
└── utils/          # Funções utilitárias
```

## 3. Fluxo de Autenticação e Navegação

O controle de acesso é centralizado no `AuthContext` e orchestrado pelo `RootNavigator`.

### AuthContext (`src/contexts/AuthContext.tsx`)
-   Gerencia a sessão do Supabase (`session`) e o perfil do usuário (`user`).
-   **Logic Chave (`ensureUserRecord`)**: Ao autenticar, o sistema verifica se existe um registro correspondente na tabela `public.users`. Se não existir, ele cria automaticamente. Isso garante sincronia entre o `auth.users` (interno do Supabase) e a tabela de dados da aplicação.
-   Mantém o estado `onboardingComplete` baseado no perfil do usuário.

### RootNavigator (`src/navigation/RootNavigator.tsx`)
O navegador raiz decide qual stack mostrar baseando-se em duas flags booleanas:
1.  `!isAuthenticated` -> **AuthNavigator** (Login/Signup)
2.  `!onboardingComplete` -> **OnboardingNavigator** (Preenchimento de perfil inicial)
3.  Else -> **MainNavigator** (App principal)

## 4. Integração com Backend (Supabase)

A configuração está em `src/services/supabase.ts`.
-   Utiliza `AsyncStorage` para persistência de sessão.
-   Define interfaces TypeScript que espelham o esquema do banco de dados (`User`, `Event`, `ParticipationRequest`, `Chat`, etc.).
-   Tenta ler variáveis de ambiente de `@env`, mas possui fallback para valores hardcoded (útil para dev, mas requer atenção para prod).

## 5. Modelo de Dados (Schema Simplificado)

Baseado nas definições de tipo e documentação interna:

-   **users**: Perfis de usuário (nome, username, avatar, cidade).
-   **events**: Eventos criados pelos usuários.
-   **event_participants**: Relação N:N entre usuários e eventos.
-   **chats / messages**: Sistema de mensageria.
-   **notifications**: Notificações in-app.

## 6. Pontos de Atenção para Desenvolvimento

1.  **Environment Variables**: O projeto usa `react-native-dotenv` ou similar (visto a importação de `@env`). Certifique-se de ter o arquivo `.env` configurado corretamente para não depender dos fallbacks hardcoded em `supabase.ts`.
2.  **Row Level Security (RLS)**: O projeto depende fortemente de RLS no Supabase para segurança. O frontend assume que as queries retornarão apenas dados permitidos.
3.  **Fluxo de Onboarding**: Para testar o app completo, novos usuários devem passar pelo fluxo de onboarding, que seta `onboarding_complete = true` no banco.
