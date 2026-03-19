// ============================================================
// NEXO Intelligence Admin — API Module v2.0
// Fixes: campo tipo SETOR/TERCEIRO, classificacao Básico,
// + contratos, logo upload, export
// ============================================================

window.NEXO = window.NEXO || {};

window.NEXO.api = (() => {

    const sb = () => NEXO.supabase;

    async function _getRedeFilter() {
        const user = await NEXO.auth.getUser();
        if (!user) return null;
        if (NEXO.auth.isSuperAdmin(user)) return null;
        return NEXO.auth.getIdRede(user);
    }

    // ── REDES ────────────────────────────────────────────────

    async function getRedes() {
        const { data, error } = await sb().from('redes').select('*').order('nome');
        if (error) throw error;
        return data || [];
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
        return data || [];
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

    // Logo upload
    async function uploadLogo(file, lojaId) {
        const ext = file.name.split('.').pop();
        const path = `logos/${lojaId}.${ext}`;
        const { error: upErr } = await sb().storage.from('fotos').upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = sb().storage.from('fotos').getPublicUrl(path);
        return data.publicUrl;
    }

    // ── PESSOAS ──────────────────────────────────────────────

    async function getPessoas(lojaId = null) {
        let query = sb().from('pessoas').select('*, lojas(nome, id_rede)').order('nome');
        if (lojaId) query = query.eq('loja_id', lojaId);

        const redeFilter = await _getRedeFilter();
        if (redeFilter && !lojaId) {
            query = sb().from('pessoas')
                .select('*, lojas!inner(nome, id_rede)')
                .eq('lojas.id_rede', redeFilter)
                .order('nome');
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
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
        return data || [];
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

    // ── LOJA_PRODUTOS ────────────────────────────────────────

    async function getVinculos(lojaId) {
        const { data, error } = await sb().from('loja_produtos')
            .select('*, produtos(proteina, corte_pai, classificacao)')
            .eq('loja_id', lojaId);
        if (error) throw error;
        return data || [];
    }

    async function setVinculos(lojaId, produtoIds) {
        const { error: delError } = await sb().from('loja_produtos').delete().eq('loja_id', lojaId);
        if (delError) throw delError;
        if (produtoIds.length === 0) return [];
        const rows = produtoIds.map(pid => ({ loja_id: lojaId, produto_id: pid }));
        const { data, error } = await sb().from('loja_produtos').insert(rows).select();
        if (error) throw error;
        return data;
    }

    // ── PERGUNTAS ────────────────────────────────────────────

    async function getPerguntas() {
        const { data, error } = await sb().from('perguntas').select('*').order('etapa, id');
        if (error) throw error;
        return data || [];
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
        return data || [];
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
        return data || [];
    }

    async function updateConformidade(id, payload) {
        const { data, error } = await sb().from('conformidade_temp').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    // ── CONTRATOS ────────────────────────────────────────────

    async function getContratos() {
        const redeFilter = await _getRedeFilter();
        let query = sb().from('contratos').select('*, redes(nome)').order('created_at', { ascending: false });
        if (redeFilter) query = query.eq('id_rede', redeFilter);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async function createContrato(payload) {
        const { data, error } = await sb().from('contratos').insert(payload).select().single();
        if (error) throw error;
        return data;
    }

    async function updateContrato(id, payload) {
        const { data, error } = await sb().from('contratos').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    async function deleteContrato(id) {
        const { error } = await sb().from('contratos').delete().eq('id', id);
        if (error) throw error;
    }

    // ── STATS ────────────────────────────────────────────────

    async function getStats() {
        const redeFilter = await _getRedeFilter();
        let lojasQ = sb().from('lojas').select('id', { count: 'exact', head: true });
        if (redeFilter) lojasQ = lojasQ.eq('id_rede', redeFilter);

        const [redesRes, lojasRes, pessoasRes, produtosRes, contratosRes] = await Promise.all([
            sb().from('redes').select('id', { count: 'exact', head: true }),
            lojasQ,
            sb().from('pessoas').select('id', { count: 'exact', head: true }),
            sb().from('produtos').select('id', { count: 'exact', head: true }),
            sb().from('contratos').select('id, valor_mensal, status').eq('status', 'ativo')
        ]);

        const mrr = (contratosRes.data || []).reduce((sum, c) => sum + (parseFloat(c.valor_mensal) || 0), 0);

        return {
            redes: redesRes.count || 0,
            lojas: lojasRes.count || 0,
            pessoas: pessoasRes.count || 0,
            produtos: produtosRes.count || 0,
            mrr: mrr,
            contratosAtivos: (contratosRes.data || []).length
        };
    }

    // ── Edge Function: Create User ───────────────────────────

    async function createAdminUser(email, senha, metadata) {
        const { data: { session } } = await sb().auth.getSession();
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ email, password: senha, user_metadata: metadata })
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || 'Erro ao criar usuário');
        return result;
    }

    // ── EXPORT HELPER ────────────────────────────────────────

    function exportToCSV(data, filename) {
        if (!data.length) return;
        const keys = Object.keys(data[0]);
        const csv = [
            keys.join(';'),
            ...data.map(row => keys.map(k => {
                let val = row[k];
                if (val === null || val === undefined) return '';
                if (typeof val === 'object') val = JSON.stringify(val);
                return String(val).replace(/;/g, ',').replace(/\n/g, ' ');
            }).join(';'))
        ].join('\n');

        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        getRedes, getRede, createRede, updateRede, deleteRede,
        getLojas, getLoja, createLoja, updateLoja, deleteLoja, uploadLogo,
        getPessoas, createPessoa, updatePessoa, deletePessoa,
        getProdutos, createProduto, updateProduto, deleteProduto,
        getVinculos, setVinculos,
        getPerguntas, updatePergunta,
        getMotivos, createMotivo, updateMotivo, deleteMotivo,
        getConformidade, updateConformidade,
        getContratos, createContrato, updateContrato, deleteContrato,
        getStats, createAdminUser, exportToCSV
    };

})();
