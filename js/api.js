// ============================================================
// NEXO Intelligence Admin — API Module
// ============================================================
// Todas as queries ao Supabase centralizadas.
// Aplica filtro automático por id_rede para gestor_rede.
// Super Admin vê tudo.
// ============================================================

window.NEXO = window.NEXO || {};

window.NEXO.api = (() => {

    const sb = () => NEXO.supabase;

    // ── Helper: aplica filtro de rede se gestor ─────────────

    async function _getRedeFilter() {
        const user = await NEXO.auth.getUser();
        if (!user) return null;
        if (NEXO.auth.isSuperAdmin(user)) return null; // vê tudo
        return NEXO.auth.getIdRede(user); // filtra por rede
    }

    // ── REDES ────────────────────────────────────────────────

    async function getRedes() {
        const { data, error } = await sb().from('redes').select('*').order('nome');
        if (error) throw error;
        return data;
    }

    async function getRede(id) {
        const { data, error } = await sb().from('redes').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async function createRede(payload) {
        const { data, error } = await sb().from('redes').insert(payload).select().single();
        if (error) throw error;
        return data;
    }

    async function updateRede(id, payload) {
        const { data, error } = await sb().from('redes').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async function deleteRede(id) {
        const { error } = await sb().from('redes').delete().eq('id', id);
        if (error) throw error;
    }

    // ── LOJAS ────────────────────────────────────────────────

    async function getLojas() {
        const redeFilter = await _getRedeFilter();
        let query = sb().from('lojas').select('*, redes(nome)').order('nome');
        if (redeFilter) query = query.eq('id_rede', redeFilter);
        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async function getLoja(id) {
        const { data, error } = await sb().from('lojas').select('*, redes(nome)').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async function createLoja(payload) {
        const { data, error } = await sb().from('lojas').insert(payload).select().single();
        if (error) throw error;
        return data;
    }

    async function updateLoja(id, payload) {
        const { data, error } = await sb().from('lojas').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async function deleteLoja(id) {
        const { error } = await sb().from('lojas').delete().eq('id', id);
        if (error) throw error;
    }

    // ── PESSOAS ──────────────────────────────────────────────

    async function getPessoas(idLoja = null) {
        let query = sb().from('pessoas').select('*, lojas(nome, id_rede)').order('nome');
        if (idLoja) query = query.eq('id_loja', idLoja);

        // Filtro por rede para gestor
        const redeFilter = await _getRedeFilter();
        if (redeFilter && !idLoja) {
            // Precisa join — filtra via lojas.id_rede
            query = sb().from('pessoas')
                .select('*, lojas!inner(nome, id_rede)')
                .eq('lojas.id_rede', redeFilter)
                .order('nome');
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async function createPessoa(payload) {
        const { data, error } = await sb().from('pessoas').insert(payload).select().single();
        if (error) throw error;
        return data;
    }

    async function updatePessoa(id, payload) {
        const { data, error } = await sb().from('pessoas').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async function deletePessoa(id) {
        const { error } = await sb().from('pessoas').delete().eq('id', id);
        if (error) throw error;
    }

    // ── PRODUTOS ─────────────────────────────────────────────

    async function getProdutos() {
        const { data, error } = await sb().from('produtos').select('*').order('proteina, corte_pai');
        if (error) throw error;
        return data;
    }

    async function createProduto(payload) {
        const { data, error } = await sb().from('produtos').insert(payload).select().single();
        if (error) throw error;
        return data;
    }

    async function updateProduto(id, payload) {
        const { data, error } = await sb().from('produtos').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async function deleteProduto(id) {
        const { error } = await sb().from('produtos').delete().eq('id', id);
        if (error) throw error;
    }

    // ── LOJA_PRODUTOS (vínculos) ─────────────────────────────

    async function getVinculos(idLoja) {
        const { data, error } = await sb().from('loja_produtos')
            .select('*, produtos(proteina, corte_pai, classificacao)')
            .eq('id_loja', idLoja)
            .order('created_at');
        if (error) throw error;
        return data;
    }

    async function setVinculos(idLoja, produtoIds) {
        // Delete all → Insert new (abordagem upsert simples)
        const { error: delError } = await sb().from('loja_produtos').delete().eq('id_loja', idLoja);
        if (delError) throw delError;

        if (produtoIds.length === 0) return [];

        const rows = produtoIds.map(pid => ({ id_loja: idLoja, id_produto: pid }));
        const { data, error } = await sb().from('loja_produtos').insert(rows).select();
        if (error) throw error;
        return data;
    }

    // ── PERGUNTAS ────────────────────────────────────────────

    async function getPerguntas() {
        const { data, error } = await sb().from('perguntas').select('*').order('ordem');
        if (error) throw error;
        return data;
    }

    async function updatePergunta(id, payload) {
        const { data, error } = await sb().from('perguntas').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ── MOTIVOS ──────────────────────────────────────────────

    async function getMotivos() {
        const { data, error } = await sb().from('motivos').select('*').order('contexto, motivo');
        if (error) throw error;
        return data;
    }

    async function createMotivo(payload) {
        const { data, error } = await sb().from('motivos').insert(payload).select().single();
        if (error) throw error;
        return data;
    }

    async function updateMotivo(id, payload) {
        const { data, error } = await sb().from('motivos').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async function deleteMotivo(id) {
        const { error } = await sb().from('motivos').delete().eq('id', id);
        if (error) throw error;
    }

    // ── CONFORMIDADE ─────────────────────────────────────────

    async function getConformidade() {
        const { data, error } = await sb().from('conformidade_temp').select('*').order('ponto_medicao');
        if (error) throw error;
        return data;
    }

    async function updateConformidade(id, payload) {
        const { data, error } = await sb().from('conformidade_temp').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ── STATS (Dashboard) ────────────────────────────────────

    async function getStats() {
        const redeFilter = await _getRedeFilter();

        // Conta redes, lojas, pessoas, produtos
        let lojasQuery = sb().from('lojas').select('id', { count: 'exact', head: true });
        let pessoasQuery = sb().from('pessoas').select('id', { count: 'exact', head: true });

        if (redeFilter) {
            lojasQuery = lojasQuery.eq('id_rede', redeFilter);
            // Pessoas filtradas por rede requer join
        }

        const [redesRes, lojasRes, pessoasRes, produtosRes] = await Promise.all([
            sb().from('redes').select('id', { count: 'exact', head: true }),
            lojasQuery,
            pessoasQuery,
            sb().from('produtos').select('id', { count: 'exact', head: true })
        ]);

        return {
            redes: redesRes.count || 0,
            lojas: lojasRes.count || 0,
            pessoas: pessoasRes.count || 0,
            produtos: produtosRes.count || 0
        };
    }

    // ── Edge Function: Create User ───────────────────────────

    async function createAdminUser(email, senha, metadata) {
        const { data: { session } } = await sb().auth.getSession();

        const resp = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ email, password: senha, user_metadata: metadata })
        });

        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || 'Erro ao criar usuário');
        return result;
    }

    // ── Public API ───────────────────────────────────────────

    return {
        getRedes, getRede, createRede, updateRede, deleteRede,
        getLojas, getLoja, createLoja, updateLoja, deleteLoja,
        getPessoas, createPessoa, updatePessoa, deletePessoa,
        getProdutos, createProduto, updateProduto, deleteProduto,
        getVinculos, setVinculos,
        getPerguntas, updatePergunta,
        getMotivos, createMotivo, updateMotivo, deleteMotivo,
        getConformidade, updateConformidade,
        getStats,
        createAdminUser
    };

})();
