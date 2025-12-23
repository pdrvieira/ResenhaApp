-- =====================================================
-- RESENHA APP - SQL Setup Completo
-- Execute este script no Supabase Dashboard -> SQL Editor
-- =====================================================

-- 1. HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA TABELA EVENTS
-- Todos podem ver eventos não deletados
DROP POLICY IF EXISTS "Eventos são visíveis para todos" ON public.events;
CREATE POLICY "Eventos são visíveis para todos" ON public.events
  FOR SELECT USING (deleted_at IS NULL);

-- Usuários autenticados podem criar eventos
DROP POLICY IF EXISTS "Usuários podem criar eventos" ON public.events;
CREATE POLICY "Usuários podem criar eventos" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Apenas o criador pode atualizar seu evento
DROP POLICY IF EXISTS "Criador pode atualizar evento" ON public.events;
CREATE POLICY "Criador pode atualizar evento" ON public.events
  FOR UPDATE USING (auth.uid() = creator_id);

-- Apenas o criador pode deletar (soft delete) seu evento
DROP POLICY IF EXISTS "Criador pode deletar evento" ON public.events;
CREATE POLICY "Criador pode deletar evento" ON public.events
  FOR DELETE USING (auth.uid() = creator_id);


-- 3. POLÍTICAS PARA TABELA EVENT_PARTICIPANTS
-- Todos podem ver participantes
DROP POLICY IF EXISTS "Participantes são visíveis para todos" ON public.event_participants;
CREATE POLICY "Participantes são visíveis para todos" ON public.event_participants
  FOR SELECT USING (true);

-- Usuários podem se adicionar como participantes (via aceite de solicitação)
DROP POLICY IF EXISTS "Sistema pode adicionar participantes" ON public.event_participants;
CREATE POLICY "Sistema pode adicionar participantes" ON public.event_participants
  FOR INSERT WITH CHECK (true);

-- Usuários podem sair de eventos
DROP POLICY IF EXISTS "Usuário pode sair de evento" ON public.event_participants;
CREATE POLICY "Usuário pode sair de evento" ON public.event_participants
  FOR DELETE USING (auth.uid() = user_id);


-- 4. POLÍTICAS PARA TABELA PARTICIPATION_REQUESTS
-- Usuários podem ver suas próprias solicitações ou as de eventos que criaram
DROP POLICY IF EXISTS "Ver solicitações" ON public.participation_requests;
CREATE POLICY "Ver solicitações" ON public.participation_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = participation_requests.event_id 
      AND events.creator_id = auth.uid()
    )
  );

-- Usuários autenticados podem criar solicitações
DROP POLICY IF EXISTS "Usuário pode solicitar participação" ON public.participation_requests;
CREATE POLICY "Usuário pode solicitar participação" ON public.participation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criador do evento pode atualizar status
DROP POLICY IF EXISTS "Criador pode responder solicitação" ON public.participation_requests;
CREATE POLICY "Criador pode responder solicitação" ON public.participation_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = participation_requests.event_id 
      AND events.creator_id = auth.uid()
    )
  );


-- 5. POLÍTICAS PARA TABELA USERS
-- Todos podem ver perfis públicos
DROP POLICY IF EXISTS "Perfis são visíveis para todos" ON public.users;
CREATE POLICY "Perfis são visíveis para todos" ON public.users
  FOR SELECT USING (true);

-- Usuário pode atualizar seu próprio perfil
DROP POLICY IF EXISTS "Usuário pode atualizar seu perfil" ON public.users;
CREATE POLICY "Usuário pode atualizar seu perfil" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Usuário pode inserir seu próprio perfil
DROP POLICY IF EXISTS "Usuário pode criar seu perfil" ON public.users;
CREATE POLICY "Usuário pode criar seu perfil" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);


-- 6. FUNÇÃO PARA LOGIN VIA USERNAME (já criada anteriormente)
CREATE OR REPLACE FUNCTION get_email_by_username(username_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_email text;
BEGIN
  SELECT au.email INTO found_email
  FROM auth.users au
  JOIN public.users pu ON pu.id = au.id
  WHERE lower(pu.username) = lower(username_input)
  LIMIT 1;
  
  RETURN found_email;
END;
$$;

GRANT EXECUTE ON FUNCTION get_email_by_username TO anon;
GRANT EXECUTE ON FUNCTION get_email_by_username TO authenticated;


-- 7. VERIFICAR ESTRUTURA DAS TABELAS
-- Caso alguma tabela não exista, criar (opcional)

-- events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  event_at TIMESTAMP WITH TIME ZONE NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  max_participants INTEGER,
  -- Novos campos de detalhes
  entry_type TEXT NOT NULL DEFAULT 'free' CHECK (entry_type IN ('free', 'paid', 'bring')),
  entry_price DECIMAL(10,2),
  bring_what TEXT,
  audience TEXT NOT NULL DEFAULT 'everyone' CHECK (audience IN ('everyone', 'adults_only', 'invite_only')),
  motivation TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar colunas se tabela já existe
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'free';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS entry_price DECIMAL(10,2);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS bring_what TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'everyone';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS motivation TEXT;

-- event_participants
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- participation_requests
CREATE TABLE IF NOT EXISTS public.participation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);


-- 8. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_events_creator_id ON public.events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_event_at ON public.events(event_at);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participation_requests_event_id ON public.participation_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_participation_requests_user_id ON public.participation_requests(user_id);


-- 9. TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_request', 'request_accepted', 'request_rejected')),
  payload JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);

-- RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário vê suas notificações" ON public.notifications;
CREATE POLICY "Usuário vê suas notificações" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Sistema pode criar notificações" ON public.notifications;
CREATE POLICY "Sistema pode criar notificações" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Usuário pode marcar como lida" ON public.notifications;
CREATE POLICY "Usuário pode marcar como lida" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);


-- =====================================================
-- SUCESSO! Execute este script completo no SQL Editor
-- =====================================================
