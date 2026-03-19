// NEXO Intelligence Admin — Router (v1.1 — executa scripts)

window.NEXO = window.NEXO || {};

window.NEXO.router = (() => {

    let _routes = {};
    let _container = null;
    let _currentRoute = null;
    let _onBeforeNavigate = null;

    function register(routes) { _routes = routes; }

    function setContainer(el) {
        _container = typeof el === 'string' ? document.querySelector(el) : el;
    }

    function setBeforeNavigate(fn) { _onBeforeNavigate = fn; }

    async function navigate(hash) {
        if (_onBeforeNavigate) {
            const canProceed = await _onBeforeNavigate(hash);
            if (!canProceed) return;
        }

        const route = hash.replace('#/', '').replace('#', '') || 'dashboard';
        const config = _routes[route];

        if (!config) {
            navigate('#/dashboard');
            return;
        }

        if (window.location.hash !== `#/${route}`) {
            history.pushState(null, '', `#/${route}`);
        }

        _currentRoute = route;

        try {
            const resp = await fetch(config.file);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const html = await resp.text();

            // Separa HTML e scripts
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Extrai scripts antes de inserir
            const scripts = temp.querySelectorAll('script');
            const scriptContents = [];
            scripts.forEach(s => {
                scriptContents.push(s.textContent);
                s.remove();
            });

            // Insere o HTML sem scripts
            _container.innerHTML = temp.innerHTML;

            // Executa os scripts manualmente
            for (const code of scriptContents) {
                try {
                    const fn = new Function(code);
                    fn();
                } catch (e) {
                    console.error('[Router] Erro ao executar script da página:', e);
                }
            }

            // Executa o init da página se existir
            if (config.init && typeof config.init === 'function') {
                await config.init();
            }

            // Atualiza active na sidebar
            document.querySelectorAll('.sidebar-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.route === route) link.classList.add('active');
            });

            _container.scrollTop = 0;

        } catch (err) {
            console.error(`[Router] Erro ao carregar ${route}:`, err);
            _container.innerHTML = `
                <div style="padding:2rem;text-align:center;color:var(--text-secondary);">
                    <p>Erro ao carregar a página.</p>
                    <p style="font-size:0.85rem;margin-top:0.5rem;">${err.message}</p>
                </div>
            `;
        }
    }

    function getCurrentRoute() { return _currentRoute; }

    function init() {
        window.addEventListener('hashchange', () => {
            navigate(window.location.hash);
        });
        const initialHash = window.location.hash || '#/dashboard';
        navigate(initialHash);
    }

    return { register, setContainer, setBeforeNavigate, navigate, getCurrentRoute, init };

})();
