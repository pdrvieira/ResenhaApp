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

export interface NotificationBadges {
    total: number;           // Total de não lidas
    myEvents: number;        // Tab Meus Eventos
    criados: number;         // Sub-tab Criados (new_request)
    participo: number;       // Sub-tab Participo (request_accepted, event_updated)
    pendentes: number;       // Sub-tab Pendentes (request_rejected)
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
    markAllAsRead: () => Promise<void>;
    getEventBadge: (eventId: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

// Categoriza notificação por sub-tab
function categorizeNotification(type: NotificationType): 'criados' | 'participo' | 'pendentes' | 'other' {
    switch (type) {
        case 'new_request':
            return 'criados';   // Notificações para criadores
        case 'request_accepted':
        case 'event_updated':
        case 'event_cancelled':
            return 'participo'; // Notificações para participantes
        case 'request_rejected':
            return 'pendentes'; // Rejeições das minhas solicitações
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
        let pendentes = 0;

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
                case 'pendentes':
                    pendentes++;
                    break;
            }
        }

        return {
            total: unread.length,
            myEvents: criados + participo + pendentes,
            criados,
            participo,
            pendentes,
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

    const value: NotificationContextType = {
        notifications,
        unreadNotifications,
        badges,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markEventAsRead,
        markAllAsRead,
        getEventBadge,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
