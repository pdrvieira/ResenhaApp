import { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

interface Location {
    latitude: number;
    longitude: number;
}

interface UseLocationReturn {
    location: Location | null;
    loading: boolean;
    error: string | null;
    refreshLocation: () => void;
}

// Localização padrão (centro do Brasil) caso não tenha permissão
const DEFAULT_LOCATION: Location = {
    latitude: -15.7801,
    longitude: -47.9292, // Brasília
};

export const useLocation = (): UseLocationReturn => {
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const requestPermission = async (): Promise<boolean> => {
        if (Platform.OS === 'ios') {
            // iOS pede permissão automaticamente
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Permissão de Localização',
                    message: 'O app precisa acessar sua localização para mostrar eventos próximos.',
                    buttonNeutral: 'Perguntar Depois',
                    buttonNegative: 'Cancelar',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn('Permission error:', err);
            return false;
        }
    };

    const getCurrentLocation = async () => {
        setLoading(true);
        setError(null);

        const hasPermission = await requestPermission();

        if (!hasPermission) {
            setError('Permissão de localização negada');
            setLocation(DEFAULT_LOCATION);
            setLoading(false);
            return;
        }

        Geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                console.warn('Geolocation error:', err);
                setError('Não foi possível obter localização');
                setLocation(DEFAULT_LOCATION);
                setLoading(false);
            },
            {
                enableHighAccuracy: false, // Mais rápido
                timeout: 10000,
                maximumAge: 60000, // Cache de 1 minuto
            }
        );
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    return {
        location,
        loading,
        error,
        refreshLocation: getCurrentLocation,
    };
};
