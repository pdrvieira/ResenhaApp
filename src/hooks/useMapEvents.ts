import { useQuery } from '@tanstack/react-query';
import { supabase, Event } from '../services/supabase';

interface MapRegion {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

interface BoundingBox {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}

/**
 * Converte região do mapa em bounding box
 */
const regionToBoundingBox = (region: MapRegion): BoundingBox => {
    return {
        minLat: region.latitude - region.latitudeDelta / 2,
        maxLat: region.latitude + region.latitudeDelta / 2,
        minLng: region.longitude - region.longitudeDelta / 2,
        maxLng: region.longitude + region.longitudeDelta / 2,
    };
};

/**
 * Hook para buscar eventos dentro de uma região do mapa
 * Apenas eventos com coordenadas válidas são retornados
 */
export const useMapEvents = (region: MapRegion | null) => {
    const fetchEventsInRegion = async (): Promise<Event[]> => {
        if (!region) return [];

        const bbox = regionToBoundingBox(region);

        const { data, error } = await supabase
            .from('events')
            .select('*')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .gte('latitude', bbox.minLat)
            .lte('latitude', bbox.maxLat)
            .gte('longitude', bbox.minLng)
            .lte('longitude', bbox.maxLng)
            .is('deleted_at', null)
            .gte('event_at', new Date().toISOString()) // Apenas eventos futuros
            .order('event_at', { ascending: true })
            .limit(50); // Limite para performance

        if (error) {
            console.error('Error fetching map events:', error);
            throw error;
        }

        return data || [];
    };

    const query = useQuery({
        queryKey: ['map_events', region?.latitude, region?.longitude, region?.latitudeDelta],
        queryFn: fetchEventsInRegion,
        enabled: !!region,
        staleTime: 30000, // Cache por 30 segundos
    });

    return {
        events: query.data || [],
        loading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
