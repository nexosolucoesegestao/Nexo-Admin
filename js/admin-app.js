// ============================================================
// NEXO Intelligence Admin — App Init v2.0
// ============================================================

(async () => {

    const user = await NEXO.auth.requireAuth();
    if (!user) return;

    const isSuperAdmin = NEXO.auth.isSuperAdmin(user);
    const nome = NEXO.auth.getNome(user);
    const role = NEXO.auth.getRole(user);

    document.getElementById('user-name').textContent = nome;
    document.getElementById('user-role').textContent =
        role === 'super_admin' ? 'Super Admin' : 'Gestor de Rede';
    document.getElementById('user-avatar').textContent =
        nome.charAt(0).toUpperCase();

    if (isSuperAdmin) {
        document.querySelectorAll('.only-super').forEach(el => {
            el.style.display = '';
        });
    }

    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const menuToggle = document.getElementById('menu-toggle');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-open');
        backdrop.classList.toggle('visible');
    });

    backdrop.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-open');
        backdrop.classList.remove('visible');
    });

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('sidebar-open');
                backdrop.classList.remove('visible');
            }
        });
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        NEXO.ui.confirm('Sair', 'Deseja sair do painel?', () => {
            NEXO.auth.logout();
        }, { confirmText: 'Sair', type: 'danger' });
    });

    const pageTitles = {
        dashboard: 'Dashboard',
        redes: 'Redes',
        lojas: 'Lojas',
        pessoas: 'Pessoas',
        produtos: 'Produtos',
        vinculos: 'Loja ↔ Produtos',
        perguntas: 'Perguntas',
        motivos: 'Motivos',
        conformidade: 'Conformidade',
        contratos: 'Contratos',
        usuarios: 'Usuários Admin'
    };

    NEXO.router.setContainer('#page-container');

    NEXO.router.register({
        dashboard:    { file: 'pages/dashboard.html',    init: () => window.initDashboard?.() },
        redes:        { file: 'pages/redes.html',        init: () => window.initRedes?.() },
        lojas:        { file: 'pages/lojas.html',        init: () => window.initLojas?.() },
        pessoas:      { file: 'pages/pessoas.html',      init: () => window.initPessoas?.() },
        produtos:     { file: 'pages/produtos.html',     init: () => window.initProdutos?.() },
        vinculos:     { file: 'pages/vinculos.html',     init: () => window.initVinculos?.() },
        perguntas:    { file: 'pages/perguntas.html',    init: () => window.initPerguntas?.() },
        motivos:      { file: 'pages/motivos.html',      init: () => window.initMotivos?.() },
        conformidade: { file: 'pages/conformidade.html', init: () => window.initConformidade?.() },
        contratos:    { file: 'pages/contratos.html',    init: () => window.initContratos?.() },
        usuarios:     { file: 'pages/usuarios.html',     init: () => window.initUsuarios?.() }
    });

    NEXO.router.setBeforeNavigate(async (hash) => {
        const route = hash.replace('#/', '').replace('#', '') || 'dashboard';
        if (!isSuperAdmin && ['redes', 'usuarios'].includes(route)) {
            NEXO.ui.toast('Acesso restrito.', 'warning');
            return false;
        }
        document.getElementById('page-title').textContent = pageTitles[route] || 'NEXO';
        return true;
    });

    NEXO.router.init();

})();
