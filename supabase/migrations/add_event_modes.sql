-- Migration: Adicionar suporte a Modos de Evento e Metadados

-- 1. Criar tipo ENUM para modos de evento
DO $$ BEGIN
    CREATE TYPE event_mode AS ENUM ('resenha', 'networking');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar colunas na tabela events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS mode event_mode NOT NULL DEFAULT 'resenha',
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 3. Atualizar eventos antigos (garantia, embora o default já resolva)
UPDATE events SET mode = 'resenha' WHERE mode IS NULL;

-- 4. Criar índice para performance de filtro por modo
CREATE INDEX IF NOT EXISTS idx_events_mode ON events(mode);

-- 5. Criar índice GIN para busca eficiente em tags (arrays)
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING GIN (tags);

-- 6. Comentários para documentação
COMMENT ON COLUMN events.mode IS 'Define o comportamento e exibição do evento (Resenha vs Networking)';
COMMENT ON COLUMN events.tags IS 'Array de tags para categorização rápida (#festa, #tech)';
COMMENT ON COLUMN events.metadata IS 'Campos específicos de cada modo em formato JSONB (vibe, area, profile, etc)';
