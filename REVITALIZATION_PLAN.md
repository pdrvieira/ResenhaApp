# 🚀 Plano de Revitalização UI/UX - ResenhaApp

> Este documento define o roteiro técnico e estratégico para transformar o ResenhaApp em uma experiência social premium, moderna e fluida, utilizando React Native CLI, TypeScript e as melhores práticas de Engenharia de Software.

**Última Atualização:** 08/01/2026  
**Versão:** 2.0

---

## 📋 Índice

1. [Diretrizes de Design & Identidade](#-1-diretrizes-de-design--identidade-minimal-clean)
2. [Arquitetura Técnica & Componentização](#-2-arquitetura-técnica--componentização)
3. [Fases de Implementação](#-3-fases-de-implementação)
4. [Fase 3: A Experiência "Discover" (Detalhamento Completo)](#-fase-3-a-experiência-discover-detalhamento-completo)
5. [Visão das Demais Telas](#-4-visão-das-demais-telas)
6. [Metodologia de Trabalho](#-5-metodologia-de-trabalho)
7. [Roadmap & Próximos Passos](#-6-roadmap--próximos-passos)

---

## 🎨 1. Diretrizes de Design & Identidade (Minimal Clean)

Adotaremos uma estética **"Minimal Clean"** focada em clareza, espaço em branco e tipografia forte, com toques de cor vibrante para ações principais (Social-First).

### 1.1 Paleta de Cores

| Token           | Cor               | Hex       | Uso Principal                              |
| :-------------- | :---------------- | :-------- | :----------------------------------------- |
| **Primary**     | Laranja Vibrante  | `#FF7A21` | Botões, CTAs, Highlights, Ícones Ativos    |
| **PrimaryDark** | Laranja Profundo  | `#D96A1D` | Estados de hover/press, Bordas focadas     |
| **Background**  | Areia Suave       | `#FFF4EB` | Fundo principal (quente e acolhedor)       |
| **Surface**     | Branco Puro       | `#FFFFFF` | Cards, Modais, Inputs, Bottom Sheets       |
| **TextPrimary** | Grafite Escuro    | `#2C2C2E` | Títulos, Textos principais                 |
| **TextSecondary**| Grafite Médio    | `#3A3A3C` | Legendas, Metadata, Placeholders           |
| **Error**       | Vermelho Soft     | `#BA1A1A` | Mensagens de erro, feedback negativo       |
| **Success**     | Verde Ativo       | `#2E7D32` | Confirmações, Status positivo              |
| **Overlay**     | Preto 40%         | `rgba(0,0,0,0.4)` | Escurecimento de fundo em modais   |

### 1.2 Tipografia

Utilizaremos a família de fontes do sistema (San Francisco no iOS, Roboto no Android) com pesos bem definidos para hierarquia.

| Variante    | Peso       | Tamanho   | Uso                        |
| :---------- | :--------- | :-------- | :------------------------- |
| **Display** | Bold (700) | 28-32px   | Títulos principais         |
| **Headline**| SemiBold   | 20-24px   | Subtítulos, Headers        |
| **Body**    | Regular    | 14-16px   | Texto corrido              |
| **Caption** | Regular    | 11-12px   | Detalhes, Timestamps       |
| **Button**  | SemiBold   | 14-16px   | Labels de botões           |

### 1.3 Espaçamento & Layout

- **Grid Base:** Múltiplos de `4px` ou `8px`.
- **Margens Laterais:** `20px` ou `24px` (confortável para polegares).
- **Bordas Arredondadas (Radius):**
  - Cards/Modais: `16px` - `24px`
  - Botões: `12px` (moderno) ou `9999px` (pill)
  - Inputs: `12px`
  - Bottom Sheets: `24px` (top corners only)

### 1.4 Efeitos Visuais

- **Glassmorphism:** Transparência com blur para headers flutuantes.
  - `backgroundColor: 'rgba(255, 255, 255, 0.85)'`
  - `backdropFilter: 'blur(10px)'` (via `@react-native-community/blur` ou fallback opaco).
- **Sombras (Elevation):**
  - Leve (Cards): `shadowOpacity: 0.08`, `shadowRadius: 8`
  - Média (Modais): `shadowOpacity: 0.15`, `shadowRadius: 16`
  - Forte (FAB): `shadowOpacity: 0.25`, `shadowRadius: 12`

---

## 🏗 2. Arquitetura Técnica & Componentização

Seguiremos o **Atomic Design** estrito para garantir reuso e consistência.

### 2.1 Estrutura de Pastas

```
src/
  ├── components/
  │   ├── atoms/          # Unidades mínimas: ReText, ReButton, ReInput, ReIcon
  │   ├── molecules/      # Combinações: EventCard, UserAvatarChip, FilterPill
  │   ├── organisms/      # Seções completas: EventList, FloatingHeader, BottomSheet
  │   └── templates/      # Layouts base: ReScreen (SafeArea + KeyboardAvoiding)
  ├── screens/
  │   ├── Auth/           # Welcome, Login, Signup, ForgotPassword
  │   ├── Onboarding/     # Steps 1-3, Screen Orquestrador
  │   └── Main/           # Discover, MyEvents, Create, Messages, Profile
  ├── navigation/
  │   ├── RootNavigator.tsx
  │   ├── AuthNavigator.tsx
  │   └── MainNavigator.tsx  # Tab Navigator com Stacks aninhados
  ├── hooks/              # useLocation, useMapEvents, useAuth, useBottomSheet
  ├── contexts/           # AuthContext, NotificationContext
  ├── services/           # Supabase client, API helpers
  ├── theme/
  │   ├── colors.ts
  │   ├── spacing.ts
  │   ├── typography.ts
  │   └── index.ts        # Tema unificado (react-native-paper compatible)
  └── store/              # Zustand: useUIStore, useEventStore
```

### 2.2 Bibliotecas Core

| Categoria      | Biblioteca                          | Propósito                                  |
| :------------- | :---------------------------------- | :----------------------------------------- |
| **UI Base**    | `react-native-paper`                | Componentes MD3, Snackbars, FABs           |
| **Ícones**     | `react-native-vector-icons`         | MaterialCommunityIcons                     |
| **Navegação**  | `@react-navigation/native-stack`    | Stack + Bottom Tabs                        |
| **Animações**  | `react-native-reanimated`           | Layout animations, shared transitions      |
| **Gestos**     | `react-native-gesture-handler`      | Bottom Sheet, Swipe interactions           |
| **Mapas**      | `react-native-maps`                 | MapView com Markers customizados           |
| **Storage**    | `@supabase/supabase-js`             | Auth, Database, Storage                    |
| **State**      | `zustand`                           | Global state leve e performático           |

### 2.3 Padrões de Código

- **Nomenclatura:** PascalCase para componentes, camelCase para hooks/funções.
- **Componentes Atômicos:** Prefixo `Re` (ReText, ReButton, ReInput).
- **Testes:** Jest + React Native Testing Library. Mínimo de 1 teste por componente/screen.
- **Lint:** ESLint com configuração `@react-native/eslint-config`.

---

## 📅 3. Fases de Implementação

Cada fase segue o ciclo: **Design → Code → Review → Test → Approve → Next**.

### ✅ Fase 1: Fundação (Design System) — CONCLUÍDA

| Item                     | Status | Arquivo/Componente          |
| :----------------------- | :----: | :-------------------------- |
| Configurar Tema          |   ✅   | `src/theme/index.ts`        |
| Criar `ReText`           |   ✅   | `atoms/ReText.tsx`          |
| Criar `ReButton`         |   ✅   | `atoms/ReButton.tsx`        |
| Criar `ReInput`          |   ✅   | `atoms/ReInput.tsx`         |
| Criar `ReScreen`         |   ✅   | `atoms/ReScreen.tsx`        |
| Criar `ReIcon`           |   ✅   | `atoms/ReIcon.tsx`          |

### ✅ Fase 2: Fluxo de Entrada (Auth & Onboarding) — CONCLUÍDA (08/01/2026)

| Item                          | Status | Notas                                           |
| :---------------------------- | :----: | :---------------------------------------------- |
| WelcomeScreen (Carrossel)     |   ✅   | 3 slides introdutórios                          |
| LoginScreen                   |   ✅   | Integração Supabase, validação inline           |
| SignupScreen                  |   ✅   | Criação de conta + redirecionamento             |
| OnboardingStep1 (Nome/User)   |   ✅   | Auto-capitalize Title Case, sanitização         |
| OnboardingStep2 (Foto)        |   ✅   | Image Picker, preview, skip opcional            |
| OnboardingStep3 (Notificações)|   ✅   | Toggle + solicitação de permissão               |
| Navegação Back/Exit           |   ✅   | Alert de confirmação no primeiro passo          |
| Snackbar Styling              |   ✅   | Posicionamento centralizado e flutuante         |
| Remoção Step Cidade           |   ✅   | GPS será usado na Home (redução de atrito)      |

### 🚧 Fase 3: Main Flow & Home (Discover Experience) — EM ANDAMENTO

Detalhamento completo na seção abaixo.

### 📋 Fase 4: Fluxo de Criação de Evento (Futuro)

- Wizard de 3 passos com preview.
- Integração com seletor de local (MapView inline).
- Upload de capa do evento.

### 📋 Fase 5: Social & Real-Time (Futuro)

- Chat 1:1.
- Presença de amigos no mapa.
- Notificações push em tempo real.

---

## 🗺 Fase 3: A Experiência "Discover" (Detalhamento Completo)

### Filosofia de Design

A tela principal ("Descobrir") não é uma página estática, mas **camadas vivas sobrepostas**. O objetivo é combinar o poder do **contexto geográfico** (Mapa) com a **curadoria de conteúdo** (Lista), eliminando a necessidade de escolher entre um ou outro.

**Referências de UX:**
- **Mapa:** Snap Map (Zenly), Uber, Google Maps.
- **Lista/Cards:** Airbnb, Instagram Explore, Eventbrite.
- **Efeitos Visuais:** Apple Maps (iOS 15+), macOS Control Center (Glassmorphism).

---

### Camada 0 (Z-Index: 0): O Mapa Vivo 🗺️

O mapa é a tela de fundo imersiva, ocupando 100% do viewport.

#### Comportamentos:
| Interação               | Resultado                                                                 |
| :---------------------- | :------------------------------------------------------------------------ |
| **Pan/Zoom**            | Navegar livremente. Ao mover, mantém os markers visíveis.                 |
| **Tap em Marker**       | Abre `EventPreviewModal` (60% da tela), NÃO navega para nova screen.      |
| **Tap em área vazia**   | Fecha qualquer modal/sheet aberto, retorna ao estado base.                |
| **Long Press**          | (Futuro) Adicionar evento rápido naquele local.                           |

#### Markers Customizados (Futuro - Fase 5):
- **Eventos:** Ícone categoria (emoji ou SVG) + Pill com título curto.
- **Amigos:** Avatar circular pequeno com borda de status (online/ocupado).
- **Heatmap:** Gradiente de cores indicando densidade de eventos/pessoas.

#### Componente Técnico:
```typescript
// src/components/organisms/MapLayer.tsx
interface MapLayerProps {
  events: Event[];
  userLocation: Coordinates | null;
  onMarkerPress: (event: Event) => void;
  onRegionChange: (region: Region) => void;
}
```

**Dependências:** `react-native-maps`, `react-native-maps-super-cluster` (para clustering de markers).

---

### Camada 1 (Z-Index: 10): Header Flutuante 🌫️

Um header translúcido fixo no topo da tela, sempre visível sobre o mapa.

#### Composição:
1. **Search Bar:** Input arredondado, ícone de lupa, placeholder "Buscar eventos ou locais...".
2. **Filter Pills (Carrossel Horizontal):**
   - "Hoje", "Amanhã", "Este Fim de Semana"
   - "Bares", "Shows", "Esportes", "Festas", "Networking"
   - Cada pill é um `Chip` togglable.

#### Estilos:
```typescript
const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, // Safe area
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 244, 235, 0.92)', // Background + opacity
    // backdropFilter não existe nativamente, usar BlurView ou fallback
  },
  searchBar: {
    backgroundColor: theme.custom.colors.surface,
    borderRadius: theme.custom.roundness.l,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadowPresets.light,
  },
  pillsContainer: {
    marginTop: 12,
  },
});
```

#### Componente Técnico:
```typescript
// src/components/organisms/FloatingHeader.tsx
interface FloatingHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onSearchSubmit: () => void;
}
```

---

### Camada 2 (Z-Index: 20): Bottom Sheet Interativo 📋

Um painel deslizante ancorado na parte inferior, acima da TabBar.

#### Estados:

| Estado       | Altura       | Conteúdo                                                              |
| :----------- | :----------- | :-------------------------------------------------------------------- |
| **Collapsed**| ~25% da tela | Handle bar + Título "Eventos Próximos" + Carrossel horizontal (2 cards)|
| **Half**     | ~50% da tela | Lista vertical parcial (3-4 cards visíveis)                           |
| **Expanded** | ~85% da tela | Lista vertical completa (scroll infinito), mapa escurece (overlay)    |

#### Animação de Transição:
- Usar `react-native-reanimated` com `useSharedValue` para posição Y.
- Snap points: `['25%', '50%', '85%']`.
- Ao expandir para 85%, aplicar `Animated.View` de overlay escuro sobre o mapa (fade in).

#### Componente Técnico:
```typescript
// src/components/organisms/InteractiveBottomSheet.tsx
interface InteractiveBottomSheetProps {
  events: Event[];
  isLoading: boolean;
  onEventPress: (event: Event) => void;
  onRefresh: () => void;
  snapPoints?: string[]; // Default: ['25%', '50%', '85%']
}
```

**Dependências:** `@gorhom/bottom-sheet` ou implementação custom com `react-native-reanimated` + `react-native-gesture-handler`.

---

### Modal de Preview de Evento (Z-Index: 30)

Ao tocar em um marker ou card, abre-se um modal parcial (não full-screen) para manter o contexto do mapa.

#### Layout:
```
┌─────────────────────────────────────┐
│  [Imagem de Capa - 40% altura]      │
│  ─────────────────────────────────  │
│  Título do Evento                   │
│  📍 Localização • 📅 Data/Hora      │
│  ─────────────────────────────────  │
│  Breve descrição (2 linhas max)...  │
│  ─────────────────────────────────  │
│  [👤 12 confirmados] [❤️ Favoritar] │
│  ─────────────────────────────────  │
│  [ CONFIRMAR PRESENÇA - CTA Full ]  │
└─────────────────────────────────────┘
```

#### Comportamento:
- **Swipe Down:** Fecha o modal.
- **Tap "Confirmar Presença":** Chama API + feedback (confetti? checkmark animado?).
- **Tap "Ver Mais" (se houver):** Navega para `EventDetailsScreen` (full page).

---

## Observações Técnicas & Dívida Técnica
*   **Sistema de Avaliação (Rating):** O `EventDetailsScreen` possui um placeholder visual para avaliação do organizador (estrelas). O backend e a lógica real de cálculo de rating precisam ser implementados futuramente.
*   **Perfil Público:** A navegação para o perfil do organizador está mockada. Necessário criar tela `PublicProfileScreen` e rota correspondente.

### Navegação & Interações Especiais

#### O Botão Central (+) — "Big Bang" 💥

O botão de criação de evento é diferenciado visualmente e funcionalmente.

**Visual:**
- Maior que os outros ícones da TabBar.
- Cor de fundo `Primary` (#FF7A21).
- Ícone `plus` branco.
- Borda circular com sombra proeminente.
- Leve elevação (-8px do baseline da TabBar para "flutuar").

**Animação ao Tap:**
1. Escala para 1.2x (pop).
2. Rotação sutil de 90° (cruz vira X?).
3. Abre modal de criação (não navega para stack screen).

**Modal de Criação Rápida:**
- Foco em velocidade: Título → Foto → Local (seletor rápido) → Data/Hora → Publicar.
- Estilo de "Story" (Instagram) ou "Compose Tweet".

---

## 🎟️ 4. Visão das Demais Telas

### 4.1 Meus Eventos (Ticket Wallet)

**Referência:** Apple Wallet, Eventbrite, Dice.

**Conceito:** Cada evento confirmado é exibido como um "ingresso digital" colecionável.

**Layout do Card:**
```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │   NOME DO EVENTO (GRANDE)    │  │
│  │   📅 Sábado, 12 Jan • 22:00  │  │
│  │   📍 Bar do Zé - Centro      │  │
│  ├───────────────────────────────┤  │
│  │        [QR CODE GRANDE]      │  │
│  │   ────────────────────────   │  │
│  │   Ticket #12345 • Pedro V.   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Interações:**
- Tap no card: Expande para tela cheia com detalhes e QR em destaque (para scan).
- Swipe horizontal: Navegar entre ingressos (se múltiplos).

---

### 4.2 Chat (Mensagens)

**Referência:** Instagram Direct, WhatsApp, iMessage.

**Princípios:**
- Limpo e focado no conteúdo.
- Fundo: `Surface` (#FFFFFF).
- Bolhas: Cantos arredondados (12px), cor do remetente vs. cor neutra do destinatário.
- Timestamps: Discretos, agrupados por dia.
- Status de leitura: Checkmarks sutis.

**Lista de Conversas:**
- Avatar circular + Nome + Preview da última mensagem + Timestamp.
- Badge de não lidas.

---

### 4.3 Perfil (Identidade)

**Referência:** Bento Grids (tendência de design), Spotify Wrapped, Apple Music Replay.

**Conceito:** Não uma lista linear chata, mas blocos modulares (Grid 2x2 ou 2x3) mostrando a "identidade de rolês" do usuário.

**Blocos Sugeridos:**
1. **Header:** Avatar grande + Nome + @username + Bio curta.
2. **Estatísticas:** "23 Rolês em 2025", "5 Eventos Criados", "120 Amigos".
3. **Fotos Recentes:** Mosaico das últimas 4 fotos de eventos.
4. **Medalhas/Badges:** "Anfitrião Iniciante", "Frequentador Assíduo", etc.
5. **Eventos Favoritos:** Top 3 eventos que mais curtiu.

**Ações:**
- Botão "Editar Perfil" (canto superior direito).
- Engrenagem para Settings.

---

## 🧠 5. Metodologia de Trabalho

### Abordagem: "Just-in-Time Design System"

| Princípio                          | Descrição                                                                  |
| :--------------------------------- | :------------------------------------------------------------------------- |
| **Não criar 100% antes de usar**   | Evita over-engineering e componentes órfãos.                               |
| **Não criar sem padrão**           | Evita dívida técnica e inconsistência visual.                              |
| **Criar base mínima → Expandir**   | Fase 1 criou os átomos essenciais; fases seguintes criam conforme demanda. |
| **Refatorar para reusar**          | Todo componente novo é candidato a virar átomo/molécula.                   |

### Ciclo por Feature

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Avaliar  │ ──▶ │Implementar│ ──▶ │ Validar  │ ──▶ │  Testar  │ ──▶ │ Aprovar  │
│ (Design) │     │  (Code)  │     │   (UI)   │     │  (Jest)  │     │  (User)  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                                          │
                                                                          ▼
                                                                   Próxima Feature
```

### Testes Obrigatórios

| Tipo              | Ferramenta                        | Cobertura Mínima               |
| :---------------- | :-------------------------------- | :----------------------------- |
| **Unitários**     | Jest                              | Funções utilitárias, hooks     |
| **Componentes**   | React Native Testing Library      | Átomos e Moléculas             |
| **Integração**    | Jest + Mocks                      | Navigators, Context Providers  |
| **E2E (Futuro)**  | Detox ou Maestro                  | Fluxos críticos (Login, Criar) |

---

## 📍 6. Roadmap & Próximos Passos

### Fase 3 — Tarefas Detalhadas

| #  | Tarefa                                           | Prioridade | Dependência | Status |
| :- | :----------------------------------------------- | :--------: | :---------- | :----: |
| 1  | Refatorar `MapScreen` → `DiscoverScreen`         |    Alta    | —           |   🔲   |
| 2  | Implementar `FloatingHeader` (Search + Pills)    |    Alta    | #1          |   🔲   |
| 3  | Implementar `InteractiveBottomSheet`             |    Alta    | #1          |   🔲   |
| 4  | Criar `EventCard` (Horizontal e Vertical)        |    Alta    | #3          |   🔲   |
| 5  | Implementar `EventPreviewModal` (60% screen)     |    Média   | #1          |   🔲   |
| 6  | Estilizar Markers customizados no Mapa           |    Média   | #1          |   🔲   |
| 7  | Adicionar Overlay escuro ao expandir sheet       |    Baixa   | #3          |   🔲   |
| 8  | Polir animação do botão (+) na TabBar            |    Baixa   | —           |   🔲   |
| 9  | Testes: `DiscoverScreen.test.tsx`                |    Alta    | #1, #2, #3  |   🔲   |
| 10 | Testes: `FloatingHeader.test.tsx`                |    Média   | #2          |   🔲   |

---

## 🚀 7. Progressão da Fase 3 (Sprints)

A Fase 3 será executada em **Sprints incrementais**. Cada Sprint segue o fluxo obrigatório:

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ AVALIAR  │ ──▶ │ IMPLEMENTAR │ ──▶ │ VALIDAR  │ ──▶ │  TESTAR  │ ──▶ │ APROVAR  │
│ (Design) │     │   (Code)    │     │   (UI)   │     │  (Jest)  │     │  (User)  │
└──────────┘     └─────────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

### ✅ Sprint 3.1: Estrutura Base da DiscoverScreen — CONCLUÍDO (08/01/2026)

**Objetivo:** Criar o esqueleto da tela principal com camadas absolutas.

| Etapa       | Descrição                                                                 | Entregável                                | Status |
| :---------- | :------------------------------------------------------------------------ | :---------------------------------------- | :----: |
| **Avaliar** | Analisar `MapScreen` atual, identificar o que preservar/descartar.        | Lista de componentes a manter/refatorar.  |   ✅   |
| **Implementar** | Criar `DiscoverScreen.tsx` com `MapView` ocupando 100% + containers vazios para Header e Sheet. | Arquivo `DiscoverScreen.tsx` funcional. |   ✅   |
| **Validar** | Verificar visualmente que o mapa carrega e ocupa toda a tela.             | `npx tsc --noEmit` sem erros.             |   ✅   |
| **Testar**  | Criar `__tests__/DiscoverScreen.test.tsx` (renderiza sem crash).          | 2 testes passando (`npm test`).           |   ✅   |
| **Aprovar** | Usuário confirma que a base está ok.                                      | ✅ Aprovado pelo usuário.                  |   ✅   |

**Arquivos Criados/Modificados:**
- ✅ `src/screens/Main/DiscoverScreen.tsx` (novo)
- ✅ `src/screens/Main/index.ts` (exportação adicionada)
- ✅ `src/navigation/MainNavigator.tsx` (referência atualizada)
- ✅ `__tests__/DiscoverScreen.test.tsx` (novo)

**Critérios de Aceite:**
- [x] MapView renderiza em 100% da tela (atrás da StatusBar).
- [x] Containers vazios para Header e BottomSheet estão posicionados.
- [x] Teste básico passa (2/2 testes).

---

### ✅ Sprint 3.2: FloatingHeader (Busca + Filtros) — CONCLUÍDO (08/01/2026)

**Objetivo:** Criar o header flutuante com SearchBar e FilterPills.

| Etapa       | Descrição                                                                 | Entregável                                | Status |
| :---------- | :------------------------------------------------------------------------ | :---------------------------------------- | :----: |
| **Avaliar** | Definir props do componente, listar filtros iniciais (mockados).          | Interface TypeScript definida.            |   ✅   |
| **Implementar** | Criar `FloatingHeader.tsx` com SearchBar funcional e ScrollView horizontal de Pills + Botão "Filtros". | Componente estilizado e funcional. |   ✅   |
| **Validar** | Verificar que o header flutua sobre o mapa, responsivo em diferentes telas. | `npx tsc --noEmit` sem erros.             |   ✅   |
| **Testar**  | Criar `__tests__/FloatingHeader.test.tsx` (renderiza, props funcionam).   | 3 testes passando.                        |   ✅   |
| **Aprovar** | Usuário confirma visual e interação.                                      | ✅ Aprovado pelo usuário.                  |   ✅   |

**Arquivos Criados/Modificados:**
- ✅ `src/components/organisms/FloatingHeader.tsx` (novo)
- ✅ `src/components/molecules/FilterPill.tsx` (novo)
- ✅ `src/screens/Main/DiscoverScreen.tsx` (integrado)
- ✅ `__tests__/FloatingHeader.test.tsx` (novo)

**Critérios de Aceite:**
- [x] Header tem fundo branco elegante (fallback opaco).
- [x] SearchBar aceita input.
- [x] Pills são clicáveis e mudam estado visual (ativo/inativo).
- [x] Botão "Filtros" no final com contador de filtros ativos.
- [x] Testes passam (3/3).

**Nota:** Modal de Filtros Avançados marcado como Sprint futuro (placeholder Alert implementado).

---

### ✅ Sprint 3.3: InteractiveBottomSheet (Lista Deslizante) — CONCLUÍDO (08/01/2026)

**Objetivo:** Implementar o painel inferior deslizante com snap points.

| Etapa       | Descrição                                                                 | Entregável                                | Status |
| :---------- | :------------------------------------------------------------------------ | :---------------------------------------- | :----: |
| **Avaliar** | Escolher biblioteca (`@gorhom/bottom-sheet`). Definir snap points.        | Decisão técnica documentada.              |   ✅   |
| **Implementar** | Criar `InteractiveBottomSheet.tsx` com handle, snap points e lista mockada. | Componente funcional.                    |   ✅   |
| **Validar** | Testar gesto de arrastar nos 3 estados (20%, 50%, 85%).                   | Animação suave funcionando.               |   ✅   |
| **Testar**  | Criar `__tests__/InteractiveBottomSheet.test.tsx`.                        | 3 testes passando.                        |   ✅   |
| **Aprovar** | Usuário confirma que a física de arrasto está natural.                    | ✅ Aprovado pelo usuário.                  |   ✅   |

**Arquivos Criados/Modificados:**
- ✅ `src/components/organisms/InteractiveBottomSheet.tsx` (novo)
- ✅ `src/screens/Main/DiscoverScreen.tsx` (integrado)
- ✅ `package.json` (adicionado `@gorhom/bottom-sheet`, `react-native-gesture-handler`)
- ✅ `babel.config.js` (adicionado plugin `react-native-reanimated/plugin`)
- ✅ `__tests__/InteractiveBottomSheet.test.tsx` (novo)

**Critérios de Aceite:**
- [x] 3 snap points funcionais: 20%, 50%, 85% da tela.
- [x] Handle bar visível e indicativa.
- [x] `enableDynamicSizing={false}` para evitar snap points extras automáticos.
- [x] Testes passam (3/3).

**Nota:** Overlay de escurecimento do mapa quando expandido marcado como melhoria futura.

---

### ✅ Sprint 3.4: EventCard (Átomo Reutilizável) — CONCLUÍDO (10/01/2026)

**Objetivo:** Criar o card de evento em duas variações (Horizontal para Lista, Vertical para Carrossel futuro).

| Etapa       | Descrição                                                                 | Entregável                                | Status |
| :---------- | :------------------------------------------------------------------------ | :---------------------------------------- | :----: |
| **Avaliar** | Definir informações exibidas (Título, Local, Data, Imagem, Categoria).    | Props interface definida.                 |   ✅   |
| **Implementar** | Criar `EventCard.tsx` com prop `variant: 'horizontal' | 'vertical'`.     | Componente estilizado.                    |   ✅   |
| **Validar** | Verificar variante horizontal no BottomSheet.                             | Funcionando em produção.                  |   ✅   |
| **Testar**  | Criar `__tests__/EventCard.test.tsx`.                                     | 6 testes passando.                        |   ✅   |
| **Aprovar** | Usuário confirma visual e interação.                                      | ✅ Aprovado pelo usuário.                  |   ✅   |

**Arquivos Criados/Modificados:**
- ✅ `src/components/molecules/EventCard.tsx` (novo)
- ✅ `src/components/organisms/InteractiveBottomSheet.tsx` (integrado EventCard + recolhe ao tocar)
- ✅ `__tests__/EventCard.test.tsx` (novo - 6 testes)

**Critérios de Aceite:**
- [x] Card Horizontal: Imagem à esquerda, texto à direita, compacto.
- [x] Card Vertical: Imagem no topo, texto abaixo (disponível para uso futuro).
- [x] Toca no card → Recolhe BottomSheet + foca evento no mapa.
- [x] Suporta: título, local, data, imagem, categoria, contagem de participantes.
- [x] Testes passam (6/6).

---

- [ ] Botão "Confirmar Presença" dispara callback.
- [ ] Teste passa.

---

### Sprint 3.6: Integração & Polimento

**Objetivo:** Conectar todos os componentes, adicionar interações finais e polir animações.

| Etapa       | Descrição                                                                 | Entregável                                |
| :---------- | :------------------------------------------------------------------------ | :---------------------------------------- |
| **Avaliar** | Revisar fluxo completo: Mapa -> Tap Marker -> Modal -> Fechar -> Sheet.   | Checklist de interações.                  |
| **Implementar** | Conectar dados reais (ou mock realista). Adicionar overlay ao expandir sheet. Polir botão (+). | Fluxo completo funcional.        |
| **Validar** | Percorrer todo o fluxo manualmente em dispositivos iOS e Android.         | Vídeo demonstrativo.                      |
| **Testar**  | Rodar todos os testes (`npm test`). Garantir 0 falhas.                    | Relatório de testes.                      |
| **Aprovar** | Usuário aprova a Fase 3 como um todo.                                     | ✅ Fase 3 Concluída.                       |

**Arquivos Afetados:**
- Todos os anteriores (ajustes finais).
- `REVITALIZATION_PLAN.md` (marcar Fase 3 como ✅).

**Critérios de Aceite:**
- [ ] Fluxo Discover completo e sem bugs visuais.
- [ ] Todos os testes passando.
- [ ] Performance aceitável (sem jank em animações).
- [ ] Aprovação do usuário.

---

## 📝 Observações Técnicas (Escalabilidade)

### Cenário Atual (Janeiro 2026)
- **Volume esperado inicial**: 1-50 eventos por viewport
- **Comportamento atual**: Lista scrollável no BottomSheet funciona bem até ~50 eventos

### Estratégias de Escala (Implementar quando necessário)

| Prioridade | Estratégia | Gatilho para Implementar |
|:-----------|:-----------|:-------------------------|
| **Alta** | Query por viewport (lat/lng bounds) no backend | >100 eventos no banco |
| **Alta** | Paginação infinita na lista (onEndReached) | >50 eventos visíveis |
| **Média** | Clustering de markers no mapa | >30 markers visíveis simultaneamente |
| **Média** | Cache com React Query / SWR | Lentidão em re-fetches |
| **Baixa** | Virtualização avançada (FlashList) | >500 eventos na lista |

### Recursos Técnicos
- `BottomSheetFlatList`: Já possui virtualização nativa
- `react-native-map-clustering` ou `supercluster`: Para clustering de markers
- PostGIS no Supabase: Para queries geoespaciais eficientes

---

## 📌 Legenda de Status

| Símbolo | Significado       |
| :-----: | :---------------- |
|   🔲    | Não iniciado      |
|   🔄    | Em andamento      |
|   ✅    | Concluído         |
|   ⚠️    | Bloqueado/Problema|

---

## 🗓️ Histórico de Atualizações

| Data       | Versão | Alteração                                                      |
| :--------- | :----- | :------------------------------------------------------------- |
| 08/01/2026 | 1.0    | Criação inicial do documento.                                  |
| 08/01/2026 | 2.0    | Detalhamento completo da Fase 3 (Discover Experience).         |
| 08/01/2026 | 2.1    | Adição de Sprints de Progressão com fluxo Avaliar→Aprovar.     |

---

*Documento vivo — ResenhaApp v2.1*
