import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Tentar ler .env
try {
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env')));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.log('Arquivo .env não encontrado ou erro ao ler.');
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''; // Idealmente Service Role Key para bypassar RLS

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Credenciais do Supabase não encontradas.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clearDatabase() {
    console.log('🗑️  Iniciando limpeza de eventos...');

    // 1. Deletar notificações
    const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack para deletar tudo (neq UUID zerado)

    if (notifError) console.error('Erro ao limpar notificações:', notifError.message);
    else console.log('✅ Notificações limpas');

    // 2. Deletar solicitações
    const { error: reqError } = await supabase
        .from('participation_requests')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (reqError) console.error('Erro ao limpar solicitações:', reqError.message);
    else console.log('✅ Solicitações limpas');

    // 3. Deletar participantes
    // A tabela event_participants tem chave composta, delete all é chato via API se tiver RLS restritivo.
    // Vamos tentar deletar eventos, e o CASCADE do banco deve cuidar do resto se configurado.
    // Se não tiver cascade, vai dar erro.

    // Como não tenho certeza do CASCADE, vou tentar limpar tabela participants primeiro
    // Mas via API sem Service Role Key, RLS vai bloquear deletar dados de outros.
    // SE ESTIVER RODANDO COM ANON KEY, SÓ VAI DELETAR MEUS DADOS.

    console.log('⚠️  Atenção: Rodando com Anon Key. RLS pode impedir limpeza total se não for o dono.');

    const { error: eventError } = await supabase
        .from('events')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (eventError) {
        console.error('Erro ao limpar eventos:', eventError.message);
    } else {
        console.log('✅ Eventos limpos');
    }

    console.log('🏁 Processo finalizado.');
}

clearDatabase();
