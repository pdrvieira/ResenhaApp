/**
 * Hook para gerenciar permissões de push notification
 * 
 * Uso:
 * const { hasPermission, requestPermission, checkPermission } = useNotificationPermission();
 */

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '../services/pushNotifications';

interface UseNotificationPermissionReturn {
    hasPermission: boolean;
    isChecking: boolean;
    requestPermission: () => Promise<boolean>;
    checkPermission: () => Promise<boolean>;
}

export function useNotificationPermission(): UseNotificationPermissionReturn {
    const [hasPermission, setHasPermission] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Verificar permissão ao montar
    useEffect(() => {
        const check = async () => {
            setIsChecking(true);
            const result = await pushNotificationService.checkPermission();
            setHasPermission(result);
            setIsChecking(false);
        };
        check();
    }, []);

    // Solicitar permissão
    const requestPermission = useCallback(async (): Promise<boolean> => {
        const result = await pushNotificationService.requestPermission();
        setHasPermission(result);
        return result;
    }, []);

    // Verificar permissão
    const checkPermission = useCallback(async (): Promise<boolean> => {
        const result = await pushNotificationService.checkPermission();
        setHasPermission(result);
        return result;
    }, []);

    return {
        hasPermission,
        isChecking,
        requestPermission,
        checkPermission,
    };
}
