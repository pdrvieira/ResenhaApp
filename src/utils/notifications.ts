import { supabase } from '../services/supabase';
import { NotificationType } from '../contexts/NotificationContext';

interface SendNotificationParams {
    recipientId: string;
    type: NotificationType;
    eventId?: string;
    payload?: Record<string, any>;
}

/**
 * Envia uma notificação para um usuário específico
 * Salva no banco de dados (será sincronizado via Realtime)
 */
export async function sendNotification({
    recipientId,
    type,
    eventId,
    payload = {},
}: SendNotificationParams): Promise<boolean> {
    try {
        const { error } = await supabase.from('notifications').insert({
            recipient_id: recipientId,
            type,
            event_id: eventId || null,
            payload,
        });

        if (error) {
            console.error('Error sending notification:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Error sending notification:', err);
        return false;
    }
}

/**
 * Envia notificação para múltiplos usuários
 */
export async function sendNotificationToMany(
    recipientIds: string[],
    type: NotificationType,
    eventId?: string,
    payload?: Record<string, any>
): Promise<number> {
    if (recipientIds.length === 0) return 0;

    try {
        const notifications = recipientIds.map(recipientId => ({
            recipient_id: recipientId,
            type,
            event_id: eventId || null,
            payload: payload || {},
        }));

        const { error, data } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();

        if (error) {
            console.error('Error sending notifications:', error);
            return 0;
        }

        return data?.length || 0;
    } catch (err) {
        console.error('Error sending notifications:', err);
        return 0;
    }
}

// ============================================
// Funções específicas para cada cenário
// ============================================

/**
 * Notifica o criador que alguém solicitou participação
 */
export async function notifyNewRequest(
    creatorId: string,
    eventId: string,
    eventTitle: string,
    requesterName: string,
    requesterId: string
): Promise<boolean> {
    return sendNotification({
        recipientId: creatorId,
        type: 'new_request',
        eventId,
        payload: {
            event_title: eventTitle,
            user_name: requesterName,
            user_id: requesterId,
            message: `${requesterName} quer participar do seu evento "${eventTitle}"`,
        },
    });
}

/**
 * Notifica o solicitante que foi aceito
 */
export async function notifyRequestAccepted(
    requesterId: string,
    eventId: string,
    eventTitle: string,
    creatorName: string
): Promise<boolean> {
    return sendNotification({
        recipientId: requesterId,
        type: 'request_accepted',
        eventId,
        payload: {
            event_title: eventTitle,
            user_name: creatorName,
            message: `Você foi aceito no evento "${eventTitle}"! 🎉`,
        },
    });
}

/**
 * Notifica o solicitante que foi rejeitado
 */
export async function notifyRequestRejected(
    requesterId: string,
    eventId: string,
    eventTitle: string
): Promise<boolean> {
    return sendNotification({
        recipientId: requesterId,
        type: 'request_rejected',
        eventId,
        payload: {
            event_title: eventTitle,
            message: `Sua solicitação para "${eventTitle}" não foi aceita`,
        },
    });
}

/**
 * Notifica todos participantes que o evento foi cancelado
 */
export async function notifyEventCancelled(
    participantIds: string[],
    eventId: string,
    eventTitle: string,
    creatorName: string
): Promise<number> {
    return sendNotificationToMany(
        participantIds,
        'event_cancelled',
        eventId,
        {
            event_title: eventTitle,
            user_name: creatorName,
            message: `O evento "${eventTitle}" foi cancelado 😔`,
        }
    );
}
