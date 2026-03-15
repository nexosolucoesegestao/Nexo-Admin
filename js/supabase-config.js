// NEXO Intelligence Admin — Supabase Configuration

const SUPABASE_URL = 'https://kkjfqltpykkuwshtfhow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_x-ADwvaQzwBqIRSZuLKsuw_NWPS_qwC';

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
