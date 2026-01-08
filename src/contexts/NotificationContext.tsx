import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { pushNotificationService } from '../services/pushNotifications';

// Tipos de notificação
export type NotificationType =
    | 'new_request'       // Criador: alguém pediu para participar
    | 'request_accepted'  // Usuário: sua solicitação foi aceita
    | 'request_rejected'  // Usuário: sua solicitação foi rejeitada
    | 'event_updated'     // Participante: evento foi alterado
    | 'event_cancelled';  // Participante: evento foi cancelado

export interface AppNotification {
    id: string;
    recipient_id: string;
    type: NotificationType;
    event_id: string | null;
    payload: {
        event_title?: string;
        user_name?: string;
        user_id?: string;
        changes?: Array<{
            field: string;
            field_label: string;
            old_value: string;
            new_value: string;
        }>;
        [key: string]: any;
    };
    read_at: string | null;
    created_at: string;
}

/**
 * Estrutura de badges para notificações
 * 
 * HIERARQUIA:
 * - myEvents: Badge no Tab Bar (soma de todas as categorias)
 * - criados: Notificações new_request (para criadores)
 * - participo: Notificações event_updated, event_cancelled (para participantes)
 * - solicitacoes: Notificações request_accepted, request_rejected (respostas às minhas solicitações)
 * - byEventId: Contagem de notificações não lidas por evento específico
 */
export interface NotificationBadges {
    total: number;              // Total de não lidas
    myEvents: number;           // Tab Meus Eventos (soma)
    criados: number;            // Sub-tab Criados - notificações de new_request
    participo: number;          // Sub-tab Participo - notificações de alterações
    solicitacoes: number;       // Sub-tab Solicitações - respostas às minhas solicitações
    byEventId: Record<string, number>; // Por evento específico
}

interface NotificationContextType {
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

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

/**
 * Categoriza notificação por sub-tab
 * 
 * LÓGICA:
 * - 'criados': Notificações para CRIADORES de eventos (alguém quer participar)
 * - 'participo': Notificações para PARTICIPANTES (evento mudou)
 * - 'solicitacoes': Notificações para SOLICITANTES (resposta ao meu pedido)
 */
function categorizeNotification(type: NotificationType): 'criados' | 'participo' | 'solicitacoes' | 'other' {
    switch (type) {
        case 'new_request':
            return 'criados';       // Para criadores: alguém quer entrar no meu evento

        case 'event_updated':
        case 'event_cancelled':
            return 'participo';     // Para participantes: evento que participo mudou

        case 'request_accepted':
        case 'request_rejected':
            return 'solicitacoes';  // Para solicitantes: resposta ao meu pedido

        default:
            return 'other';
    }
}

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const appState = useRef(AppState.currentState);

    // Inicializar serviço de push notifications
    useEffect(() => {
        pushNotificationService.initialize();
    }, []);

    // Buscar notificações do usuário
    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100); // Últimas 100 notificações

            if (fetchError) throw fetchError;

            setNotifications(data || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Buscar ao autenticar
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [isAuthenticated, user?.id, fetchNotifications]);

    // Realtime subscription
    useEffect(() => {
        if (!user?.id) return;

        console.log('🔔 Configurando Realtime para user:', user.id);

        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`,
                },
                async (payload) => {
                    console.log('🔔 New notification received:', payload.new);
                    const newNotification = payload.new as AppNotification;
                    setNotifications(prev => [newNotification, ...prev]);

                    // Disparar push notification (apenas se app em background)
                    console.log('🔔 App state:', appState.current);
                    if (appState.current !== 'active') {
                        console.log('🔔 Displaying push notification...');
                        await pushNotificationService.displayNotification(
                            newNotification.type,
                            newNotification.payload
                        );
                    } else {
                        console.log('🔔 App is active, skipping push');
                    }
                }
            )
            .subscribe((status) => {
                console.log('🔔 Realtime subscription status:', status);
            });

        // Listener para mudança de estado do app
        const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
            console.log('🔔 App state changed:', nextState);
            appState.current = nextState;
        });

        return () => {
            console.log('🔔 Cleaning up Realtime subscription');
            supabase.removeChannel(channel);
            subscription.remove();
        };
    }, [user?.id]);

    // Notificações não lidas
    const unreadNotifications = useMemo(() =>
        notifications.filter(n => !n.read_at),
        [notifications]);

    // Calcular badges
    const badges = useMemo((): NotificationBadges => {
        const unread = unreadNotifications;

        const byEventId: Record<string, number> = {};
        let criados = 0;
        let participo = 0;
        let solicitacoes = 0;

        for (const notification of unread) {
            // Contar por evento
            if (notification.event_id) {
                byEventId[notification.event_id] = (byEventId[notification.event_id] || 0) + 1;
            }

            // Contar por categoria
            const category = categorizeNotification(notification.type);
            switch (category) {
                case 'criados':
                    criados++;
                    break;
                case 'participo':
                    participo++;
                    break;
                case 'solicitacoes':
                    solicitacoes++;
                    break;
            }
        }

        return {
            total: unread.length,
            myEvents: criados + participo + solicitacoes,
            criados,
            participo,
            solicitacoes,
            byEventId,
        };
    }, [unreadNotifications]);

    // Marcar uma notificação como lida
    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (updateError) throw updateError;

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (err: any) {
            console.error('Error marking notification as read:', err);
        }
    }, []);

    // Marcar todas notificações de um evento como lidas
    const markEventAsRead = useCallback(async (eventId: string) => {
        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('event_id', eventId)
                .eq('recipient_id', user?.id)
                .is('read_at', null);

            if (updateError) throw updateError;

            setNotifications(prev =>
                prev.map(n =>
                    n.event_id === eventId && !n.read_at
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (err: any) {
            console.error('Error marking event notifications as read:', err);
        }
    }, [user?.id]);

    // Marcar notificações de tipos específicos para um evento como lidas
    const markTypeAsReadForEvent = useCallback(async (eventId: string, types: NotificationType[]) => {
        if (!user?.id) return;

        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('event_id', eventId)
                .eq('recipient_id', user.id)
                .in('type', types)
                .is('read_at', null);

            if (updateError) throw updateError;

            setNotifications(prev =>
                prev.map(n =>
                    n.event_id === eventId && types.includes(n.type) && !n.read_at
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                )
            );
        } catch (err: any) {
            console.error('Error marking type notifications as read:', err);
        }
    }, [user?.id]);

    // Marcar todas como lidas
    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;

        try {
            const { error: updateError } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('recipient_id', user.id)
                .is('read_at', null);

            if (updateError) throw updateError;

            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
        } catch (err: any) {
            console.error('Error marking all notifications as read:', err);
        }
    }, [user?.id]);

    // Helper para pegar badge de evento específico
    const getEventBadge = useCallback((eventId: string): number => {
        return badges.byEventId[eventId] || 0;
    }, [badges.byEventId]);

    // Helper para pegar notificações não lidas de tipos específicos
    const getUnreadByType = useCallback((types: NotificationType[]): AppNotification[] => {
        return unreadNotifications.filter(n => types.includes(n.type));
    }, [unreadNotifications]);

    const value: NotificationContextType = {
        notifications,
        unreadNotifications,
        badges,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markEventAsRead,
        markTypeAsReadForEvent,
        markAllAsRead,
        getEventBadge,
        getUnreadByType,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
