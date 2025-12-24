import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

// Gera código alfanumérico único de 8 caracteres
function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem I, O, 0, 1 para evitar confusão
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export interface EventInvite {
    id: string;
    event_id: string;
    invite_code: string;
    created_by: string;
    max_uses: number | null;
    uses_count: number;
    expires_at: string | null;
    created_at: string;
}

export interface InviteValidationResult {
    valid: boolean;
    event?: {
        id: string;
        title: string;
        event_at: string;
        audience: string;
        creator_id: string;
    };
    error?: string;
}

export function useEventInvite() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Criar novo convite para um evento
    const createInvite = useCallback(async (
        eventId: string,
        options?: {
            maxUses?: number;
            expiresInDays?: number;
        }
    ): Promise<EventInvite | null> => {
        if (!user) {
            setError('Usuário não autenticado');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Verificar se o usuário é o criador do evento
            const { data: event, error: eventError } = await supabase
                .from('events')
                .select('id, creator_id')
                .eq('id', eventId)
                .single();

            if (eventError || !event) {
                throw new Error('Evento não encontrado');
            }

            if (event.creator_id !== user.id) {
                throw new Error('Apenas o criador pode gerar convites');
            }

            // Gerar código único
            let inviteCode = generateInviteCode();
            let attempts = 0;

            // Verificar se código já existe (improvável mas possível)
            while (attempts < 5) {
                const { data: existing } = await supabase
                    .from('event_invites')
                    .select('id')
                    .eq('invite_code', inviteCode)
                    .single();

                if (!existing) break;
                inviteCode = generateInviteCode();
                attempts++;
            }

            // Calcular expiração
            let expiresAt: string | null = null;
            if (options?.expiresInDays) {
                const date = new Date();
                date.setDate(date.getDate() + options.expiresInDays);
                expiresAt = date.toISOString();
            }

            // Criar convite
            const { data: invite, error: insertError } = await supabase
                .from('event_invites')
                .insert({
                    event_id: eventId,
                    invite_code: inviteCode,
                    created_by: user.id,
                    max_uses: options?.maxUses || null,
                    expires_at: expiresAt,
                })
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            return invite;
        } catch (err: any) {
            setError(err.message || 'Erro ao criar convite');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Validar código de convite
    const validateInvite = useCallback(async (
        inviteCode: string
    ): Promise<InviteValidationResult> => {
        setLoading(true);
        setError(null);

        try {
            // Buscar convite pelo código
            const { data: invite, error: inviteError } = await supabase
                .from('event_invites')
                .select(`
          id,
          event_id,
          invite_code,
          max_uses,
          uses_count,
          expires_at,
          events (
            id,
            title,
            event_at,
            audience,
            creator_id
          )
        `)
                .eq('invite_code', inviteCode.toUpperCase())
                .single();

            if (inviteError || !invite) {
                return { valid: false, error: 'Convite não encontrado' };
            }

            // Verificar expiração
            if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
                return { valid: false, error: 'Convite expirado' };
            }

            // Verificar limite de uso
            if (invite.max_uses && invite.uses_count >= invite.max_uses) {
                return { valid: false, error: 'Convite esgotado' };
            }

            // Verificar se evento já passou
            const eventData = invite.events as any;
            if (new Date(eventData.event_at) < new Date()) {
                return { valid: false, error: 'Este evento já aconteceu' };
            }

            return {
                valid: true,
                event: {
                    id: eventData.id,
                    title: eventData.title,
                    event_at: eventData.event_at,
                    audience: eventData.audience,
                    creator_id: eventData.creator_id,
                },
            };
        } catch (err: any) {
            setError(err.message);
            return { valid: false, error: 'Erro ao validar convite' };
        } finally {
            setLoading(false);
        }
    }, []);

    // Usar convite (registrar uso)
    const useInvite = useCallback(async (inviteCode: string): Promise<boolean> => {
        if (!user) {
            setError('Usuário não autenticado');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            // Primeiro validar
            const validation = await validateInvite(inviteCode);
            if (!validation.valid) {
                setError(validation.error || 'Convite inválido');
                return false;
            }

            // Buscar o invite_id
            const { data: invite } = await supabase
                .from('event_invites')
                .select('id')
                .eq('invite_code', inviteCode.toUpperCase())
                .single();

            if (!invite) {
                setError('Convite não encontrado');
                return false;
            }

            // Registrar uso
            const { error: useError } = await supabase
                .from('event_invite_uses')
                .insert({
                    invite_id: invite.id,
                    user_id: user.id,
                });

            if (useError) {
                // Pode ser duplicado (usuário já usou)
                if (useError.code === '23505') {
                    // Unique violation - já usou, mas tudo bem
                    return true;
                }
                throw useError;
            }

            // Incrementar contador de usos
            await supabase.rpc('increment_invite_uses', { invite_id: invite.id });

            return true;
        } catch (err: any) {
            setError(err.message || 'Erro ao usar convite');
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, validateInvite]);

    // Listar convites de um evento (para o criador)
    const getEventInvites = useCallback(async (eventId: string): Promise<EventInvite[]> => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('event_invites')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            return data || [];
        } catch (err: any) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Gerar link de compartilhamento
    const generateShareLink = useCallback((inviteCode: string): string => {
        // Deep link format: resenha://invite/{code}
        // ou URL universal: https://resenhaapp.com/invite/{code}
        return `resenha://invite/${inviteCode}`;
    }, []);

    // Buscar convite existente válido OU criar novo
    const getOrCreateInvite = useCallback(async (
        eventId: string,
        options?: {
            maxUses?: number;
            expiresInDays?: number;
        }
    ): Promise<EventInvite | null> => {
        if (!user) {
            setError('Usuário não autenticado');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Primeiro, buscar convite existente válido
            const { data: existingInvites } = await supabase
                .from('event_invites')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (existingInvites && existingInvites.length > 0) {
                // Verificar se algum ainda é válido
                const now = new Date();
                const validInvite = existingInvites.find(invite => {
                    // Não expirado
                    if (invite.expires_at && new Date(invite.expires_at) < now) {
                        return false;
                    }
                    // Não esgotado
                    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
                        return false;
                    }
                    return true;
                });

                if (validInvite) {
                    return validInvite;
                }
            }

            // Nenhum convite válido encontrado, criar novo
            return await createInvite(eventId, options);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar/criar convite');
            return null;
        } finally {
            setLoading(false);
        }
    }, [user, createInvite]);

    return {
        loading,
        error,
        createInvite,
        getOrCreateInvite,
        validateInvite,
        useInvite,
        getEventInvites,
        generateShareLink,
    };
}
