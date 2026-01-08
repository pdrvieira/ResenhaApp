/**
 * Tipos e constantes para filtros do mapa
 */

export type AudienceFilter = 'all' | 'everyone' | 'adults_only' | 'invite_only';
export type DateRangeFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'month';
export type RadiusFilter = null | 5 | 10 | 25 | 50;
export type ModeFilter = 'all' | 'resenha' | 'networking';

export interface MapFilters {
    mode: ModeFilter;
    radius: RadiusFilter;
    audience: AudienceFilter;
    dateRange: DateRangeFilter;
    searchText: string;
    tags: string[];
}

export const DEFAULT_FILTERS: MapFilters = {
    mode: 'all',
    radius: null,
    audience: 'all',
    dateRange: 'all',
    searchText: '',
    tags: [],
};

// Labels para exibição
export const FILTER_LABELS = {
    radius: {
        null: 'Qualquer distância',
        5: 'Até 5 km',
        10: 'Até 10 km',
        25: 'Até 25 km',
        50: 'Até 50 km',
    },
    mode: {
        all: 'Todos',
        resenha: '🎉 Resenha',
        networking: '🤝 Networking',
    },
    audience: {
        all: 'Todos',
        everyone: 'Aberto',
        adults_only: '+18',
        invite_only: 'Convite',
    },
    dateRange: {
        all: 'Qualquer data',
        today: 'Hoje',
        tomorrow: 'Amanhã',
        week: 'Esta semana',
        month: 'Este mês',
    },
} as const;

// Contagem de filtros ativos
export const countActiveFilters = (filters: MapFilters): number => {
    let count = 0;
    // Verifica se mode existe e é diferente de 'all'
    if (filters.mode && filters.mode !== 'all') count++;
    if (filters.radius !== null) count++;
    if (filters.audience !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.searchText.trim() !== '') count++;
    if (filters.tags && filters.tags.length > 0) count++;
    return count;
};
