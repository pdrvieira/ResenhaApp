/**
 * Regras de edição de eventos
 * Baseado em práticas de mercado (Eventbrite, Sympla, Meetup)
 */

import { Event } from '../services/supabase';

export interface EditValidationResult {
    allowed: boolean;
    reason?: string;
}

export interface EditableFieldsResult {
    title: EditValidationResult;
    description: EditValidationResult;
    image_url: EditValidationResult;
    event_at: EditValidationResult;
    address: EditValidationResult;
    city: EditValidationResult;
    audience: EditValidationResult;
    motivation: EditValidationResult;
    bring_what: EditValidationResult;
    max_participants: EditValidationResult;
}

// Labels amigáveis para os campos
export const FIELD_LABELS: Record<string, string> = {
    title: 'Título',
    description: 'Descrição',
    image_url: 'Foto',
    event_at: 'Data/Hora',
    address: 'Endereço',
    city: 'Cidade',
    audience: 'Público',
    motivation: 'Motivação',
    bring_what: 'O que levar',
    max_participants: 'Limite de participantes',
};

/**
 * Calcula horas até o evento
 */
export const getHoursUntilEvent = (eventAt: string): number => {
    const eventDate = new Date(eventAt);
    const now = new Date();
    return (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
};

/**
 * Verifica quais campos podem ser editados
 */
export const getEditableFields = (
    event: Event,
    participantsCount: number
): EditableFieldsResult => {
    const hoursUntil = getHoursUntilEvent(event.event_at);
    const hasParticipants = participantsCount > 0;
    const MIN_HOURS_FOR_DATE_CHANGE = 24;
    const MIN_HOURS_FOR_LOCATION_CHANGE = 24;

    return {
        // ✅ Sempre editável
        title: { allowed: true },
        description: { allowed: true },
        image_url: { allowed: true },
        motivation: { allowed: true },
        bring_what: { allowed: true },

        // ⚠️ Data/Hora: só se > 24h antes
        event_at: hoursUntil > MIN_HOURS_FOR_DATE_CHANGE
            ? { allowed: true }
            : { allowed: false, reason: `Não é possível alterar a data faltando menos de ${MIN_HOURS_FOR_DATE_CHANGE}h para o evento` },

        // ⚠️ Local: só se > 24h antes
        address: hoursUntil > MIN_HOURS_FOR_LOCATION_CHANGE
            ? { allowed: true }
            : { allowed: false, reason: `Não é possível alterar o local faltando menos de ${MIN_HOURS_FOR_LOCATION_CHANGE}h para o evento` },

        city: hoursUntil > MIN_HOURS_FOR_LOCATION_CHANGE
            ? { allowed: true }
            : { allowed: false, reason: `Não é possível alterar a cidade faltando menos de ${MIN_HOURS_FOR_LOCATION_CHANGE}h para o evento` },

        // ⚠️ Público: não pode relaxar restrições após confirmações
        audience: hasParticipants
            ? { allowed: false, reason: 'Não é possível alterar as restrições de público após ter participantes' }
            : { allowed: true },

        // ⚠️ Max participantes: não pode reduzir abaixo dos confirmados
        max_participants: { allowed: true }, // Validação dinâmica no momento de salvar
    };
};

/**
 * Valida se o novo valor de max_participants é válido
 */
export const validateMaxParticipants = (
    newValue: number | undefined,
    currentParticipants: number
): EditValidationResult => {
    if (newValue === undefined) {
        return { allowed: true }; // Sem limite
    }

    if (newValue < currentParticipants) {
        return {
            allowed: false,
            reason: `Não é possível definir limite menor que ${currentParticipants} (participantes atuais)`,
        };
    }

    return { allowed: true };
};

/**
 * Detecta quais campos foram alterados
 */
export const getChangedFields = (
    original: Event,
    updated: Partial<Event>
): { field: string; oldValue: any; newValue: any }[] => {
    const changes: { field: string; oldValue: any; newValue: any }[] = [];

    const fieldsToCheck: (keyof Event)[] = [
        'title', 'description', 'image_url', 'event_at', 'address', 'city',
        'audience', 'motivation', 'bring_what', 'max_participants', 'latitude', 'longitude'
    ];

    for (const field of fieldsToCheck) {
        const oldVal = original[field];
        const newVal = updated[field];

        if (newVal !== undefined && String(oldVal) !== String(newVal)) {
            changes.push({ field, oldValue: oldVal, newValue: newVal });
        }
    }

    return changes;
};

/**
 * Formata o valor para exibição na notificação
 */
export const formatFieldValue = (field: string, value: any): string => {
    if (value === null || value === undefined) return 'Não definido';

    switch (field) {
        case 'event_at':
            return new Date(value).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        case 'audience': {
            const audienceLabels: Record<string, string> = {
                everyone: 'Todos',
                adults_only: '+18',
                invite_only: 'Somente convidados'
            };
            return audienceLabels[value as string] || String(value);
        }
        case 'max_participants':
            return value ? `${value} vagas` : 'Sem limite';
        default:
            return String(value);
    }
};
