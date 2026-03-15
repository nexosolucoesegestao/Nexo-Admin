// ============================================================
// NEXO Intelligence Admin — Router
// ============================================================
// SPA router baseado em hash (#/rota).
// Carrega páginas HTML no container principal.
// Gerencia active state na sidebar.
// ============================================================

window.NEXO = window.NEXO || {};

window.NEXO.router = (() => {

    let _routes = {};
    let _container = null;
    let _currentRoute = null;
    let _onBeforeNavigate = null;

    // ── Registro de rotas ───────────────────────────────────

    function register(routes) {
        _routes = routes;
    }

    function setContainer(el) {
        _container = typeof el === 'string' ? document.querySelector(el) : el;
    }

    function setBeforeNavigate(fn) {
        _onBeforeNavigate = fn;
    }

    // ── Navegação ───────────────────────────────────────────

    async function navigate(hash) {
        if (_onBeforeNavigate) {
            const canProceed = await _onBeforeNavigate(hash);
            if (!canProceed) return;
        }

        const route = hash.replace('#/', '').replace('#', '') || 'dashboard';
        const config = _routes[route];

        if (!config) {
            console.warn(`[Router] Rota não encontrada: ${route}`);
            navigate('#/dashboard');
            return;
        }

        // Atualiza hash sem disparar hashchange de novo
        if (window.location.hash !== `#/${route}`) {
            history.pushState(null, '', `#/${route}`);
        }

        _currentRoute = route;

        // Carrega o HTML da página
        try {
            const resp = await fetch(config.file);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const html = await resp.text();
            _container.innerHTML = html;

            // Executa o init da página se existir
            if (config.init && typeof config.init === 'function') {
                await config.init();
            }

            // Atualiza active na sidebar
            _updateSidebarActive(route);

            // Scroll to top
            _container.scrollTop = 0;

        } catch (err) {
            console.error(`[Router] Erro ao carregar ${route}:`, err);
            _container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    <p>Erro ao carregar a página.</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">${err.message}</p>
                </div>
            `;
        }
    }

    function _updateSidebarActive(route) {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === route) {
                link.classList.add('active');
            }
        });
    }

    function getCurrentRoute() {
        return _currentRoute;
    }

    // ── Init ────────────────────────────────────────────────

    function init() {
        // Escuta mudanças de hash
        window.addEventListener('hashchange', () => {
            navigate(window.location.hash);
        });

        // Navega para a rota inicial
        const initialHash = window.location.hash || '#/dashboard';
        navigate(initialHash);
    }

    return {
        register,
        setContainer,
        setBeforeNavigate,
        navigate,
        getCurrentRoute,
        init
    };

})();
