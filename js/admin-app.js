// ============================================================
// NEXO Intelligence Admin — App Init v2.1
// ============================================================

(async function() {

    var user = await NEXO.auth.requireAuth();
    if (!user) return;

    // Esconder loading, mostrar layout
    var authLoading = document.getElementById('auth-loading');
    if (authLoading) authLoading.style.display = 'none';

    var adminLayout = document.getElementById('admin-layout');
    if (adminLayout) adminLayout.style.display = 'flex';

    var isSuperAdmin = NEXO.auth.isSuperAdmin(user);
    var nome = NEXO.auth.getNome(user);
    var role = NEXO.auth.getRole(user);

    document.getElementById('user-name').textContent = nome;
    document.getElementById('user-role').textContent =
        role === 'super_admin' ? 'Super Admin' : 'Gestor de Rede';
    document.getElementById('user-avatar').textContent =
        nome.charAt(0).toUpperCase();

    if (isSuperAdmin) {
        document.querySelectorAll('.only-super').forEach(function(el) {
            el.style.display = '';
        });
    }

    var sidebar = document.getElementById('sidebar');
    var menuToggle = document.getElementById('menu-toggle');
    var sidebarClose = document.getElementById('sidebar-close');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-open');
        });
    }
    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
            sidebar.classList.remove('sidebar-open');
        });
    }

    document.getElementById('btn-logout').addEventListener('click', function() {
        if (confirm('Deseja sair do painel?')) {
            NEXO.auth.logout();
        }
    });

    var pageTitles = {
        dashboard:    'Dashboard',
        redes:        'Redes',
        lojas:        'Lojas',
        pessoas:      'Pessoas',
        produtos:     'Produtos',
        vinculos:     'Loja x Produtos',
        perguntas:    'Perguntas',
        motivos:      'Motivos',
        conformidade: 'Conformidade',
        contratos:    'Contratos',
        usuarios:     'Usuarios Admin'
    };

    NEXO.router.setContainer('#page-container');

    NEXO.router.register({
        dashboard:    { file: 'pages/dashboard.html',    init: function() { if(window.initDashboard) window.initDashboard(); } },
        redes:        { file: 'pages/redes.html',        init: function() { if(window.initRedes) window.initRedes(); } },
        lojas:        { file: 'pages/lojas.html',        init: function() { if(window.initLojas) window.initLojas(); } },
        pessoas:      { file: 'pages/pessoas.html',      init: function() { if(window.initPessoas) window.initPessoas(); } },
        produtos:     { file: 'pages/produtos.html',     init: function() { if(window.initProdutos) window.initProdutos(); } },
        vinculos:     { file: 'pages/vinculos.html',     init: function() { if(window.initVinculos) window.initVinculos(); } },
        perguntas:    { file: 'pages/perguntas.html',    init: function() { if(window.initPerguntas) window.initPerguntas(); } },
        motivos:      { file: 'pages/motivos.html',      init: function() { if(window.initMotivos) window.initMotivos(); } },
        conformidade: { file: 'pages/conformidade.html', init: function() { if(window.initConformidade) window.initConformidade(); } },
        contratos:    { file: 'pages/contratos.html',    init: function() { if(window.initContratos) window.initContratos(); } },
        usuarios:     { file: 'pages/usuarios.html',     init: function() { if(window.initUsuarios) window.initUsuarios(); } }
    });

    NEXO.router.setBeforeNavigate(async function(hash) {
        var route = hash.replace('#/', '').replace('#', '') || 'dashboard';
        if (!isSuperAdmin && ['redes', 'usuarios'].includes(route)) {
            NEXO.ui.toast('Acesso restrito.', 'warning');
            return false;
        }
        var titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = pageTitles[route] || 'NEXO';
        return true;
    });

    NEXO.router.init();

})();
