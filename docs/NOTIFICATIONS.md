# 🔔 Sistema de Notificações In-App - Documentação

## Visão Geral

O sistema de notificações do Resenha App gerencia alertas in-app e badges para manter os usuários informados sobre atividades relacionadas aos seus eventos.

---

## 📊 Hierarquia de Badges

```
┌─────────────────────────────────────────────────────────────────┐
│  Tab Bar: "Meus Eventos"                                        │
│  Badge = totalPendingRequestsForMyEvents + badges.participo +   │
│          badges.solicitacoes                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sub-tab "Criados" (eventos que criei)                          │
│  ├─ Tab Badge = COUNT de participation_requests pendentes       │
│  │              (ação necessária: aprovar/rejeitar)             │
│  │                                                              │
│  └─ Card Badge = COUNT pendentes DESTE evento específico        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sub-tab "Participo" (eventos que fui aceito)                   │
│  ├─ Tab Badge = notifications não lidas                         │
│  │              (event_updated, event_cancelled)                │
│  │                                                              │
│  └─ Card = Indicador roxo se há notificação não lida            │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sub-tab "Solicitações" (minhas solicitações enviadas)          │
│  ├─ Tab Badge = notifications não lidas                         │
│  │              (request_accepted, request_rejected)            │
│  │                                                              │
│  └─ Card = Status visual + indicador "novo" se não lida         │
│            (🟡 Aguardando / ✅ Aceito / ❌ Não aceito)           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Sub-tab "Histórico" (eventos passados)                         │
│  └─ Sem badges                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔔 Tipos de Notificação

| Tipo | Descrição | Destinatário | Categoria |
|------|-----------|--------------|-----------|
| `new_request` | Alguém pediu para participar | Criador do evento | `criados` |
| `request_accepted` | Solicitação aceita | Solicitante | `solicitacoes` |
| `request_rejected` | Solicitação rejeitada | Solicitante | `solicitacoes` |
| `event_updated` | Evento foi alterado | Participantes | `participo` |
| `event_cancelled` | Evento foi cancelado | Participantes | `participo` |

---

## 🔄 Quando Notificações são Marcadas como Lidas

| Ação do Usuário | Tipos Marcados | Local |
|-----------------|----------------|-------|
| Abrir ManageEventScreen | `new_request` | ManageEventScreen.tsx |
| Visualizar evento (não criador) | `event_updated`, `event_cancelled` | EventDetailsScreen.tsx |
| Clicar em card de solicitação | `request_accepted`, `request_rejected` | MyEventsScreen.tsx |

---

## 🗑️ Limpeza Automática

Solicitações **rejeitadas** com mais de **7 dias** são:
1. Filtradas na UI (MyEventsScreen)
2. Deletadas do banco via cron job (cleanup_rejected_requests.sql)

---

## 📁 Arquivos do Sistema

### Core
- `src/contexts/NotificationContext.tsx` - Estado global e lógica de badges
- `src/services/pushNotifications.ts` - Serviço de push notifications (Notifee)

### Telas
- `src/screens/Main/MyEventsScreen.tsx` - Lista de eventos com tabs e badges
- `src/screens/Main/ManageEventScreen.tsx` - Gerenciamento de solicitações
- `src/screens/Main/EventDetailsScreen.tsx` - Detalhes do evento

### Navegação
- `src/navigation/MainNavigator.tsx` - Tab bar com badge

### Utilidades
- `src/utils/notifications.ts` - Funções para criar notificações

### Banco de Dados
- `supabase_setup.sql` - Schema da tabela `notifications`
- `supabase/migrations/cleanup_rejected_requests.sql` - Limpeza automática

---

## 📐 Interface NotificationBadges

```typescript
interface NotificationBadges {
    total: number;              // Total de não lidas
    myEvents: number;           // Tab Bar (soma)
    criados: number;            // new_request não lidas
    participo: number;          // event_updated, event_cancelled não lidas
    solicitacoes: number;       // request_accepted, request_rejected não lidas
    byEventId: Record<string, number>; // Por evento específico
}
```

---

## 🛠️ API do NotificationContext

```typescript
interface NotificationContextType {
    // Estado
    notifications: AppNotification[];
    unreadNotifications: AppNotification[];
    badges: NotificationBadges;
    loading: boolean;
    error: string | null;

    // Ações
    refetch: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markEventAsRead: (eventId: string) => Promise<void>;
    markTypeAsReadForEvent: (eventId: string, types: NotificationType[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    getEventBadge: (eventId: string) => number;
    getUnreadByType: (types: NotificationType[]) => AppNotification[];
}
```

---

## ✅ Checklist de Implementação

- [x] NotificationContext com categorias corretas
- [x] MyEventsScreen com tabs e badges consistentes
- [x] Tab "Solicitações" mostra todas as solicitações (pending/accepted/rejected)
- [x] Solicitações rejeitadas com >7 dias são filtradas
- [x] ManageEventScreen marca new_request como lidas
- [x] EventDetailsScreen marca event_updated/cancelled como lidas
- [x] Cards de solicitação marcam respostas como lidas ao clicar
- [x] Script SQL para limpeza automática de rejeitados
