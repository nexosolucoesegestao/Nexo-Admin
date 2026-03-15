// ============================================================
// NEXO Intelligence Admin — Supabase Configuration
// ============================================================
// Este arquivo centraliza a conexão com o Supabase.
// Em produção, as keys vêm do projeto Supabase (São Paulo).
// Para desenvolvimento, usar os valores abaixo.
// ============================================================

const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY';

// Inicializa o client Supabase com persistência de sessão
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Expõe globalmente
window.NEXO = window.NEXO || {};
window.NEXO.supabase = supabase;
