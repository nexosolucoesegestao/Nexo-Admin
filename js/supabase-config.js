// NEXO Intelligence Admin — Supabase Configuration

const SUPABASE_URL = 'https://kkjfqltpykkuwshtfhow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MvdXO8-wxp4VbAfB2kHmQw_mM_K2nYn';

window.NEXO = window.NEXO || {};

if (!window.NEXO.supabase) {
    window.NEXO.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
}
