// ============================================================
// NEXO Intelligence Admin — Supabase Config
// Lê credenciais do window.__NEXO_ENV__ gerado pelo build.
// Nunca hardcode credenciais aqui.
// ============================================================

window.NEXO = window.NEXO || {};

(function () {
    var env = window.__NEXO_ENV__;

    if (!env || !env.SUPABASE_URL || !env.SUPABASE_KEY) {
        console.error('[NEXO Config] Credenciais não encontradas. Verifique o deploy no Vercel.');
        return;
    }

    if (!window.NEXO.supabase) {
        window.NEXO.supabase = window.supabase.createClient(
            env.SUPABASE_URL,
            env.SUPABASE_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        );
    }

    // Limpar credenciais do window após uso — impede acesso via console
    delete window.__NEXO_ENV__;
})();
