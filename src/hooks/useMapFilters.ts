import { useState, useMemo, useCallback } from 'react';
import { Event } from '../services/supabase';
import { MapFilters, DEFAULT_FILTERS, countActiveFilters } from '../types/mapFilters';
import { calculateDistanceKm } from '../utils/geo';

interface UseMapFiltersProps {
    events: Event[];
    userLocation: { latitude: number; longitude: number } | null;
}

interface UseMapFiltersReturn {
    filters: MapFilters;
    setFilters: React.Dispatch<React.SetStateAction<MapFilters>>;
    updateFilter: <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => void;
    resetFilters: () => void;
    filteredEvents: Event[];
    activeFiltersCount: number;
    hasActiveFilters: boolean;
}

export const useMapFilters = ({ events, userLocation }: UseMapFiltersProps): UseMapFiltersReturn => {
    const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);

    // Atualizar um filtro específico
    const updateFilter = useCallback(<K extends keyof MapFilters>(key: K, value: MapFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Resetar todos os filtros
    const resetFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
    }, []);

    // Filtrar eventos baseado nos filtros ativos
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Filtro de busca por texto
            if (filters.searchText.trim()) {
                const search = filters.searchText.toLowerCase();
                const matchesSearch =
                    event.title.toLowerCase().includes(search) ||
                    event.description.toLowerCase().includes(search) ||
                    event.city.toLowerCase().includes(search) ||
                    event.address.toLowerCase().includes(search);
                if (!matchesSearch) return false;
            }

            // Filtro de raio (distância)
            if (filters.radius !== null && userLocation && event.latitude && event.longitude) {
                const distance = calculateDistanceKm(
                    userLocation.latitude,
                    userLocation.longitude,
                    event.latitude,
                    event.longitude
                );
                if (distance > filters.radius) return false;
            }

            // Filtro de público
            if (filters.audience !== 'all') {
                if (event.audience !== filters.audience) return false;
            }

            // Filtro de data
            if (filters.dateRange !== 'all') {
                const eventDate = new Date(event.event_at);
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const endOfWeek = new Date(today);
                endOfWeek.setDate(endOfWeek.getDate() + 7);
                const endOfMonth = new Date(today);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);

                switch (filters.dateRange) {
                    case 'today':
                        if (eventDate < today || eventDate >= tomorrow) return false;
                        break;
                    case 'tomorrow':
                        const dayAfterTomorrow = new Date(tomorrow);
                        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
                        if (eventDate < tomorrow || eventDate >= dayAfterTomorrow) return false;
                        break;
                    case 'week':
                        if (eventDate < today || eventDate >= endOfWeek) return false;
                        break;
                    case 'month':
                        if (eventDate < today || eventDate >= endOfMonth) return false;
                        break;
                }
            }

            return true;
        });
    }, [events, filters, userLocation]);

    const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);
    const hasActiveFilters = activeFiltersCount > 0;

    return {
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        filteredEvents,
        activeFiltersCount,
        hasActiveFilters,
    };
};
