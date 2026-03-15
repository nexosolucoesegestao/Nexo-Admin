// ============================================================
// NEXO Intelligence Admin — Supabase Configuration
// ============================================================
// Este arquivo centraliza a conexão com o Supabase.
// Em produção, as keys vêm do projeto Supabase (São Paulo).
// Para desenvolvimento, usar os valores abaixo.
// ============================================================

const SUPABASE_URL = 'https://kkjfqltpykkuwshtfhow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_x-ADwvaQzwBqIRSZuLKsuw_NWPS_qwC';

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
