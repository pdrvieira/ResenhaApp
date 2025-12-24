/**
 * Push Notification Service
 * 
 * Serviço centralizado para gerenciar push notifications usando Notifee.
 * Responsabilidades:
 * - Criar e gerenciar canais de notificação
 * - Solicitar permissões
 * - Exibir notificações locais
 * - Mapear tipos de notificação para conteúdo visual
 */

import notifee, {
    AndroidImportance,
    AndroidStyle,
    AuthorizationStatus,
    EventType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { NotificationType } from '../contexts/NotificationContext';

// ============================================
// Constantes e Tipos
// ============================================

const CHANNEL_ID = 'resenha_default';
const CHANNEL_NAME = 'Resenha';
const CHANNEL_DESCRIPTION = 'Notificações do Resenha App';

interface PushNotificationContent {
    title: string;
    body: string;
    data?: Record<string, string>;
}

// ============================================
// Mapeamento de Tipos para Conteúdo
// ============================================

/**
 * Gera o conteúdo visual da notificação baseado no tipo e payload
 */
export function getNotificationContent(
    type: NotificationType,
    payload: Record<string, any>
): PushNotificationContent {
    const eventTitle = payload.event_title || 'um evento';
    const userName = payload.user_name || 'Alguém';
    const message = payload.message;

    switch (type) {
        case 'new_request':
            return {
                title: '👋 Nova solicitação',
                body: message || `${userName} quer participar de "${eventTitle}"`,
                data: { type, eventId: payload.event_id },
            };

        case 'request_accepted':
            return {
                title: '🎉 Você foi aceito!',
                body: message || `Sua participação em "${eventTitle}" foi confirmada`,
                data: { type, eventId: payload.event_id },
            };

        case 'request_rejected':
            return {
                title: '😔 Solicitação não aceita',
                body: message || `Sua solicitação para "${eventTitle}" não foi aceita`,
                data: { type, eventId: payload.event_id },
            };

        case 'event_updated':
            return {
                title: '📝 Evento atualizado',
                body: message || `"${eventTitle}" foi modificado. Confira as alterações.`,
                data: { type, eventId: payload.event_id },
            };

        case 'event_cancelled':
            return {
                title: '❌ Evento cancelado',
                body: message || `"${eventTitle}" foi cancelado`,
                data: { type, eventId: payload.event_id },
            };

        default:
            return {
                title: '🔔 Resenha',
                body: message || 'Você tem uma nova notificação',
                data: { type },
            };
    }
}

// ============================================
// Classe Principal do Serviço
// ============================================

class PushNotificationService {
    private isInitialized = false;
    private hasPermission = false;

    /**
     * Inicializa o serviço de notificações
     * Deve ser chamado uma vez na inicialização do app
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Criar canal (Android)
            if (Platform.OS === 'android') {
                await notifee.createChannel({
                    id: CHANNEL_ID,
                    name: CHANNEL_NAME,
                    description: CHANNEL_DESCRIPTION,
                    importance: AndroidImportance.HIGH,
                    vibration: true,
                    sound: 'default',
                });
            }

            // Verificar permissões atuais
            const settings = await notifee.getNotificationSettings();
            this.hasPermission = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

            this.isInitialized = true;
            console.log('🔔 PushNotificationService initialized');
        } catch (error) {
            console.error('Error initializing PushNotificationService:', error);
        }
    }

    /**
     * Solicita permissão para enviar notificações
     * Retorna true se permissão foi concedida
     */
    async requestPermission(): Promise<boolean> {
        try {
            const settings = await notifee.requestPermission();
            this.hasPermission = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;

            console.log('🔔 Permission status:', this.hasPermission ? 'granted' : 'denied');
            return this.hasPermission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Verifica se tem permissão para enviar notificações
     */
    async checkPermission(): Promise<boolean> {
        try {
            const settings = await notifee.getNotificationSettings();
            this.hasPermission = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
            return this.hasPermission;
        } catch (error) {
            return false;
        }
    }

    /**
     * Exibe uma notificação local
     */
    async displayNotification(
        type: NotificationType,
        payload: Record<string, any>
    ): Promise<string | null> {
        // Garantir inicialização
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Verificar permissão
        if (!this.hasPermission) {
            console.log('🔔 No permission to display notification');
            return null;
        }

        try {
            const content = getNotificationContent(type, payload);

            const notificationId = await notifee.displayNotification({
                title: content.title,
                body: content.body,
                data: content.data,
                android: {
                    channelId: CHANNEL_ID,
                    importance: AndroidImportance.HIGH,
                    pressAction: {
                        id: 'default',
                    },
                    style: content.body.length > 50 ? {
                        type: AndroidStyle.BIGTEXT,
                        text: content.body,
                    } : undefined,
                },
                ios: {
                    sound: 'default',
                    foregroundPresentationOptions: {
                        banner: true,
                        sound: true,
                        badge: true,
                    },
                },
            });

            console.log('🔔 Notification displayed:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('Error displaying notification:', error);
            return null;
        }
    }

    /**
     * Cancela uma notificação específica
     */
    async cancelNotification(notificationId: string): Promise<void> {
        try {
            await notifee.cancelNotification(notificationId);
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    }

    /**
     * Cancela todas as notificações
     */
    async cancelAllNotifications(): Promise<void> {
        try {
            await notifee.cancelAllNotifications();
        } catch (error) {
            console.error('Error canceling all notifications:', error);
        }
    }

    /**
     * Atualiza o badge do app (iOS)
     */
    async setBadgeCount(count: number): Promise<void> {
        try {
            await notifee.setBadgeCount(count);
        } catch (error) {
            console.error('Error setting badge count:', error);
        }
    }

    /**
     * Configura listener para eventos de notificação (tap, dismiss, etc)
     * Retorna função de cleanup
     */
    onNotificationEvent(
        callback: (eventType: EventType, notificationData?: Record<string, string>) => void
    ): () => void {
        return notifee.onForegroundEvent(({ type, detail }) => {
            callback(type, detail.notification?.data as Record<string, string>);
        });
    }
}

// Singleton export
export const pushNotificationService = new PushNotificationService();
