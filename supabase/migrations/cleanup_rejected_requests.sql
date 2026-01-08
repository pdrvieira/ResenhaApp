-- =====================================================
-- RESENHA APP - Limpeza de Solicitações Rejeitadas
-- Este script cria uma função e um cron job para deletar
-- solicitações rejeitadas com mais de 7 dias.
-- =====================================================

-- 1. Função para deletar solicitações rejeitadas antigas
CREATE OR REPLACE FUNCTION cleanup_rejected_requests()
RETURNS void AS $$
BEGIN
    DELETE FROM public.participation_requests
    WHERE status = 'rejected'
    AND updated_at < NOW() - INTERVAL '7 days';
    
    -- Log da execução
    RAISE NOTICE 'Limpeza de solicitações rejeitadas executada em %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Habilitar extensão pg_cron (necessário no Supabase Dashboard)
--    Vá em: Database -> Extensions -> Habilite pg_cron

-- 3. Agendar execução diária às 03:00 UTC
-- NOTA: Execute este comando depois de habilitar pg_cron
-- SELECT cron.schedule(
--     'cleanup-rejected-requests',
--     '0 3 * * *',  -- Todo dia às 03:00 UTC
--     $$SELECT cleanup_rejected_requests()$$
-- );

-- =====================================================
-- Para executar manualmente (teste):
-- SELECT cleanup_rejected_requests();
-- =====================================================
