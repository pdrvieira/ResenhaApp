/**
 * Hook para lidar com eventos de notificação (tap, dismiss, etc)
 * 
 * Configura listeners para navegação quando usuário toca em uma notificação
 */

import { useEffect, useRef } from 'react';
import { EventType } from '@notifee/react-native';
import { pushNotificationService } from '../services/pushNotifications';
import { useNavigation } from '@react-navigation/native';

interface UseNotificationEventsOptions {
    onNotificationTap?: (data: Record<string, string>) => void;
}

export function useNotificationEvents(options: UseNotificationEventsOptions = {}): void {
    const navigation = useNavigation<any>();
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        // Handler padrão: navegar para o evento
        const handleNavigation = (eventType: EventType, data?: Record<string, string>) => {
            if (eventType !== EventType.PRESS) return;
            if (!data) return;

            // Callback customizado
            if (optionsRef.current.onNotificationTap) {
                optionsRef.current.onNotificationTap(data);
                return;
            }

            // Navegação padrão baseada no tipo
            const eventId = data.eventId;
            if (eventId) {
                // Navegar para detalhes do evento
                navigation.navigate('Main', {
                    screen: 'Discover',
                    params: {
                        screen: 'EventDetails',
                        params: { eventId },
                    },
                });
            }
        };

        const unsubscribe = pushNotificationService.onNotificationEvent(handleNavigation);

        return () => {
            unsubscribe();
        };
    }, [navigation]);
}
