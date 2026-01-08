/**
 * @format
 * Testes para o Sistema de Notificações
 */

import { NotificationType } from '../src/contexts/NotificationContext';

// Função de categorização extraída para teste
function categorizeNotification(type: NotificationType): 'criados' | 'participo' | 'solicitacoes' | 'other' {
    switch (type) {
        case 'new_request':
            return 'criados';

        case 'event_updated':
        case 'event_cancelled':
            return 'participo';

        case 'request_accepted':
        case 'request_rejected':
            return 'solicitacoes';

        default:
            return 'other';
    }
}

// Função para calcular badges extraída para teste
interface MockNotification {
    id: string;
    type: NotificationType;
    event_id: string | null;
    read_at: string | null;
}

function calculateBadges(notifications: MockNotification[]) {
    const unread = notifications.filter(n => !n.read_at);

    const byEventId: Record<string, number> = {};
    let criados = 0;
    let participo = 0;
    let solicitacoes = 0;

    for (const notification of unread) {
        if (notification.event_id) {
            byEventId[notification.event_id] = (byEventId[notification.event_id] || 0) + 1;
        }

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
}

describe('Notification Categorization', () => {
    test('new_request should be categorized as criados', () => {
        expect(categorizeNotification('new_request')).toBe('criados');
    });

    test('event_updated should be categorized as participo', () => {
        expect(categorizeNotification('event_updated')).toBe('participo');
    });

    test('event_cancelled should be categorized as participo', () => {
        expect(categorizeNotification('event_cancelled')).toBe('participo');
    });

    test('request_accepted should be categorized as solicitacoes', () => {
        expect(categorizeNotification('request_accepted')).toBe('solicitacoes');
    });

    test('request_rejected should be categorized as solicitacoes', () => {
        expect(categorizeNotification('request_rejected')).toBe('solicitacoes');
    });
});

describe('Badge Calculation', () => {
    test('should calculate total unread correctly', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'new_request', event_id: 'e1', read_at: null },
            { id: '2', type: 'new_request', event_id: 'e1', read_at: null },
            { id: '3', type: 'new_request', event_id: 'e2', read_at: '2025-01-01' }, // lida
        ];

        const badges = calculateBadges(notifications);
        expect(badges.total).toBe(2);
    });

    test('should calculate criados badge correctly', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'new_request', event_id: 'e1', read_at: null },
            { id: '2', type: 'new_request', event_id: 'e1', read_at: null },
            { id: '3', type: 'event_updated', event_id: 'e2', read_at: null },
        ];

        const badges = calculateBadges(notifications);
        expect(badges.criados).toBe(2);
    });

    test('should calculate participo badge correctly', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'event_updated', event_id: 'e1', read_at: null },
            { id: '2', type: 'event_cancelled', event_id: 'e2', read_at: null },
            { id: '3', type: 'new_request', event_id: 'e3', read_at: null },
        ];

        const badges = calculateBadges(notifications);
        expect(badges.participo).toBe(2);
    });

    test('should calculate solicitacoes badge correctly', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'request_accepted', event_id: 'e1', read_at: null },
            { id: '2', type: 'request_rejected', event_id: 'e2', read_at: null },
            { id: '3', type: 'new_request', event_id: 'e3', read_at: null },
        ];

        const badges = calculateBadges(notifications);
        expect(badges.solicitacoes).toBe(2);
    });

    test('should calculate myEvents as sum of all categories', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'new_request', event_id: 'e1', read_at: null },
            { id: '2', type: 'event_updated', event_id: 'e2', read_at: null },
            { id: '3', type: 'request_accepted', event_id: 'e3', read_at: null },
        ];

        const badges = calculateBadges(notifications);
        expect(badges.myEvents).toBe(3);
        expect(badges.myEvents).toBe(badges.criados + badges.participo + badges.solicitacoes);
    });

    test('should calculate byEventId correctly', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'new_request', event_id: 'event-123', read_at: null },
            { id: '2', type: 'new_request', event_id: 'event-123', read_at: null },
            { id: '3', type: 'event_updated', event_id: 'event-456', read_at: null },
        ];

        const badges = calculateBadges(notifications);
        expect(badges.byEventId['event-123']).toBe(2);
        expect(badges.byEventId['event-456']).toBe(1);
    });

    test('should return empty badges when all notifications are read', () => {
        const notifications: MockNotification[] = [
            { id: '1', type: 'new_request', event_id: 'e1', read_at: '2025-01-01' },
            { id: '2', type: 'event_updated', event_id: 'e2', read_at: '2025-01-01' },
        ];

        const badges = calculateBadges(notifications);
        expect(badges.total).toBe(0);
        expect(badges.myEvents).toBe(0);
        expect(badges.criados).toBe(0);
        expect(badges.participo).toBe(0);
        expect(badges.solicitacoes).toBe(0);
    });

    test('should return empty badges when no notifications', () => {
        const badges = calculateBadges([]);
        expect(badges.total).toBe(0);
        expect(badges.myEvents).toBe(0);
    });
});

describe('Request Filtering (7 days rule)', () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    interface MockRequest {
        id: string;
        status: 'pending' | 'accepted' | 'rejected';
        updated_at: string;
    }

    function filterRequests(requests: MockRequest[]): MockRequest[] {
        return requests.filter(req => {
            if (req.status === 'rejected') {
                const updatedAt = new Date(req.updated_at);
                return updatedAt > sevenDaysAgo;
            }
            return true;
        });
    }

    test('should keep pending requests regardless of age', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 30); // 30 dias atrás

        const requests: MockRequest[] = [
            { id: '1', status: 'pending', updated_at: oldDate.toISOString() },
        ];

        const filtered = filterRequests(requests);
        expect(filtered.length).toBe(1);
    });

    test('should keep accepted requests regardless of age', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 30);

        const requests: MockRequest[] = [
            { id: '1', status: 'accepted', updated_at: oldDate.toISOString() },
        ];

        const filtered = filterRequests(requests);
        expect(filtered.length).toBe(1);
    });

    test('should keep recent rejected requests (< 7 days)', () => {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 3); // 3 dias atrás

        const requests: MockRequest[] = [
            { id: '1', status: 'rejected', updated_at: recentDate.toISOString() },
        ];

        const filtered = filterRequests(requests);
        expect(filtered.length).toBe(1);
    });

    test('should remove old rejected requests (> 7 days)', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10); // 10 dias atrás

        const requests: MockRequest[] = [
            { id: '1', status: 'rejected', updated_at: oldDate.toISOString() },
        ];

        const filtered = filterRequests(requests);
        expect(filtered.length).toBe(0);
    });

    test('should filter mixed requests correctly', () => {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 3);

        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 10);

        const requests: MockRequest[] = [
            { id: '1', status: 'pending', updated_at: oldDate.toISOString() },
            { id: '2', status: 'accepted', updated_at: oldDate.toISOString() },
            { id: '3', status: 'rejected', updated_at: recentDate.toISOString() },
            { id: '4', status: 'rejected', updated_at: oldDate.toISOString() },
        ];

        const filtered = filterRequests(requests);
        expect(filtered.length).toBe(3); // pending, accepted, recent rejected
        expect(filtered.find(r => r.id === '4')).toBeUndefined(); // old rejected removed
    });
});
