-- FRESH START: Limpar todos os eventos e dados relacionados

-- Desabilitar triggers temporariamente se necessário (opcional, mas CASCADE no truncate é mais seguro)

BEGIN;

-- Limpar notificações relacionadas a eventos (opcional, se quiser zerar tudo de notificação tire o WHERE)
-- DELETE FROM notifications; -- Se quiser limpar tudo
DELETE FROM notifications WHERE type IN ('new_request', 'request_accepted', 'request_rejected', 'event_updated', 'event_cancelled');

-- Limpar solicitações e participantes (se não tiver CASCADE na FK, precisa deletar antes)
DELETE FROM participation_requests;
DELETE FROM event_participants;

-- Limpar eventos
DELETE FROM events;

COMMIT;
