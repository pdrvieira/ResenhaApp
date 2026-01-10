-- 🚨 PERIGO: ESTE SCRIPT APAGA TODOS OS DADOS DO PROJETO 🚨

-- 1. Limpar TODAS as tabelas públicas (respeitando as Foreign Keys via CASCADE)
TRUNCATE TABLE 
  public.notifications,
  public.participation_requests,
  public.event_participants,
  public.friendships,
  public.events,
  public.users
RESTART IDENTITY CASCADE;

-- 2. Limpar Usuários da Autenticação (auth.users)
DELETE FROM auth.users;

-- 3. (Opcional) Limpar Storage se necessário
-- DELETE FROM storage.objects WHERE bucket_id = 'event-images';
-- DELETE FROM storage.objects WHERE bucket_id = 'avatars';
