// ============================================================
// NEXO Intelligence Admin — Auth Module
// ============================================================
// Gerencia login/logout, proteção de rotas e verificação de roles.
// Roles possíveis: super_admin, gestor_rede
// Metadados do usuário: { role, id_rede, nome }
// ============================================================

window.NEXO = window.NEXO || {};

window.NEXO.auth = (() => {

    // ── Helpers ──────────────────────────────────────────────

    function _getBasePath() {
        // Detecta se está rodando no GitHub Pages (subpath) ou local
        const path = window.location.pathname;
        if (path.includes('/nexo-admin/')) {
            return '/nexo-admin';
        }
        return '';
    }

    function _redirect(page) {
        const base = _getBasePath();
        window.location.href = `${base}/${page}`;
    }

    // ── Session ─────────────────────────────────────────────

    async function getSession() {
        const { data: { session }, error } = await NEXO.supabase.auth.getSession();
        if (error) {
            console.error('[Auth] Erro ao obter sessão:', error.message);
            return null;
        }
        return session;
    }

    async function getUser() {
        const session = await getSession();
        if (!session) return null;
        return session.user;
    }

    function getUserMeta(user) {
        return user?.user_metadata || {};
    }

    function getRole(user) {
        return getUserMeta(user).role || null;
    }

    function getIdRede(user) {
        return getUserMeta(user).id_rede || null;
    }

    function getNome(user) {
        return getUserMeta(user).nome || user?.email || 'Usuário';
    }

    function isSuperAdmin(user) {
        return getRole(user) === 'super_admin';
    }

    function isGestorRede(user) {
        return getRole(user) === 'gestor_rede';
    }

    // ── Login ───────────────────────────────────────────────

    async function login(email, senha) {
        const { data, error } = await NEXO.supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: senha
        });

        if (error) {
            // Traduz erros comuns para PT-BR
            const msgs = {
                'Invalid login credentials': 'Email ou senha incorretos.',
                'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
                'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.'
            };
            throw new Error(msgs[error.message] || error.message);
        }

        const user = data.user;
        const role = getRole(user);

        // Verifica se o usuário tem role de admin
        if (!role || !['super_admin', 'gestor_rede'].includes(role)) {
            await logout();
            throw new Error('Acesso negado. Este painel é restrito a administradores.');
        }

        return { user, session: data.session };
    }

    // ── Logout ──────────────────────────────────────────────

    async function logout() {
        await NEXO.supabase.auth.signOut();
        _redirect('index.html');
    }

    // ── Route Guard ─────────────────────────────────────────
    // Chama no topo de cada página protegida.
    // Redireciona para login se não autenticado ou sem permissão.
    // Retorna o user se tudo ok.

    async function requireAuth(allowedRoles = ['super_admin', 'gestor_rede']) {
        const user = await getUser();

        if (!user) {
            _redirect('index.html');
            return null;
        }

        const role = getRole(user);

        if (!allowedRoles.includes(role)) {
            // Gestor tentando acessar página de super_admin
            _redirect('pages/dashboard.html');
            return null;
        }

        return user;
    }

    // ── Forgot Password ─────────────────────────────────────

    async function resetPassword(email) {
        const base = _getBasePath();
        const redirectUrl = `${window.location.origin}${base}/pages/nova-senha.html`;

        const { error } = await NEXO.supabase.auth.resetPasswordForEmail(
            email.trim().toLowerCase(),
            { redirectTo: redirectUrl }
        );

        if (error) {
            throw new Error('Erro ao enviar email de recuperação. Tente novamente.');
        }

        return true;
    }

    // ── Update Password (após reset) ────────────────────────

    async function updatePassword(novaSenha) {
        const { error } = await NEXO.supabase.auth.updateUser({
            password: novaSenha
        });

        if (error) {
            throw new Error('Erro ao atualizar senha. Tente novamente.');
        }

        return true;
    }

    // ── Auth State Listener ─────────────────────────────────

    function onAuthStateChange(callback) {
        return NEXO.supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }

    // ── Public API ──────────────────────────────────────────

    return {
        getSession,
        getUser,
        getUserMeta,
        getRole,
        getIdRede,
        getNome,
        isSuperAdmin,
        isGestorRede,
        login,
        logout,
        requireAuth,
        resetPassword,
        updatePassword,
        onAuthStateChange
    };

})();
