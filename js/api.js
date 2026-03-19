// ============================================================
// NEXO Intelligence Admin — API Module v2.1
// Fix: SETOR/TERCEIRO, Básico, export XLSX, contratos, logo
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

    // ── REDES ──
    async function getRedes() { const { data, error } = await sb().from('redes').select('*').order('nome'); if (error) throw error; return data || []; }
    async function getRede(id) { const { data, error } = await sb().from('redes').select('*').eq('id', id).single(); if (error) throw error; return data; }
    async function createRede(p) { const { data, error } = await sb().from('redes').insert(p).select().single(); if (error) throw error; return data; }
    async function updateRede(id, p) { const { data, error } = await sb().from('redes').update(p).eq('id', id).select().single(); if (error) throw error; return data; }
    async function deleteRede(id) { const { error } = await sb().from('redes').delete().eq('id', id); if (error) throw error; }

    // ── LOJAS ──
    async function getLojas() {
        const rf = await _getRedeFilter();
        let q = sb().from('lojas').select('*, redes(nome)').order('nome');
        if (rf) q = q.eq('id_rede', rf);
        const { data, error } = await q; if (error) throw error; return data || [];
    }
    async function getLoja(id) { const { data, error } = await sb().from('lojas').select('*, redes(nome)').eq('id', id).single(); if (error) throw error; return data; }
    async function createLoja(p) { const { data, error } = await sb().from('lojas').insert(p).select().single(); if (error) throw error; return data; }
    async function updateLoja(id, p) { const { data, error } = await sb().from('lojas').update(p).eq('id', id).select().single(); if (error) throw error; return data; }
    async function deleteLoja(id) { const { error } = await sb().from('lojas').delete().eq('id', id); if (error) throw error; }
    async function uploadLogo(file, lojaId) {
        const ext = file.name.split('.').pop();
        const path = `logos/${lojaId}.${ext}`;
        const { error: upErr } = await sb().storage.from('fotos').upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = sb().storage.from('fotos').getPublicUrl(path);
        return data.publicUrl;
    }

    // ── PESSOAS ──
    async function getPessoas(lojaId = null) {
        let q = sb().from('pessoas').select('*, lojas(nome, id_rede)').order('nome');
        if (lojaId) q = q.eq('loja_id', lojaId);
        const rf = await _getRedeFilter();
        if (rf && !lojaId) { q = sb().from('pessoas').select('*, lojas!inner(nome, id_rede)').eq('lojas.id_rede', rf).order('nome'); }
        const { data, error } = await q; if (error) throw error; return data || [];
    }
    async function createPessoa(p) { const { data, error } = await sb().from('pessoas').insert(p).select().single(); if (error) throw error; return data; }
    async function updatePessoa(id, p) { const { data, error } = await sb().from('pessoas').update(p).eq('id', id).select().single(); if (error) throw error; return data; }
    async function deletePessoa(id) { const { error } = await sb().from('pessoas').delete().eq('id', id); if (error) throw error; }

    // ── PRODUTOS ──
    async function getProdutos() { const { data, error } = await sb().from('produtos').select('*').order('proteina, corte_pai'); if (error) throw error; return data || []; }
    async function createProduto(p) { const { data, error } = await sb().from('produtos').insert(p).select().single(); if (error) throw error; return data; }
    async function updateProduto(id, p) { const { data, error } = await sb().from('produtos').update(p).eq('id', id).select().single(); if (error) throw error; return data; }
    async function deleteProduto(id) { const { error } = await sb().from('produtos').delete().eq('id', id); if (error) throw error; }

    // ── LOJA_PRODUTOS ──
    async function getVinculos(lojaId) {
        const { data, error } = await sb().from('loja_produtos').select('*, produtos(proteina, corte_pai, classificacao)').eq('loja_id', lojaId);
        if (error) throw error; return data || [];
    }
    async function setVinculos(lojaId, produtoIds) {
        const { error: de } = await sb().from('loja_produtos').delete().eq('loja_id', lojaId);
        if (de) throw de;
        if (!produtoIds.length) return [];
        const rows = produtoIds.map(pid => ({ loja_id: lojaId, produto_id: pid }));
        const { data, error } = await sb().from('loja_produtos').insert(rows).select();
        if (error) throw error; return data;
    }

    // ── PERGUNTAS ──
    async function getPerguntas() { const { data, error } = await sb().from('perguntas').select('*').order('etapa, id'); if (error) throw error; return data || []; }
    async function updatePergunta(id, p) { const { data, error } = await sb().from('perguntas').update(p).eq('id', id).select().single(); if (error) throw error; return data; }

    // ── MOTIVOS ──
    async function getMotivos() { const { data, error } = await sb().from('motivos').select('*').order('contexto, motivo'); if (error) throw error; return data || []; }
    async function createMotivo(p) { const { data, error } = await sb().from('motivos').insert(p).select().single(); if (error) throw error; return data; }
    async function updateMotivo(id, p) { const { data, error } = await sb().from('motivos').update(p).eq('id', id).select().single(); if (error) throw error; return data; }
    async function deleteMotivo(id) { const { error } = await sb().from('motivos').delete().eq('id', id); if (error) throw error; }

    // ── CONFORMIDADE ──
    async function getConformidade() { const { data, error } = await sb().from('conformidade_temp').select('*').order('ponto_medicao'); if (error) throw error; return data || []; }
    async function updateConformidade(id, p) { const { data, error } = await sb().from('conformidade_temp').update(p).eq('id', id).select().single(); if (error) throw error; return data; }

    // ── CONTRATOS ──
    async function getContratos() {
        const rf = await _getRedeFilter();
        let q = sb().from('contratos').select('*, redes(nome)').order('created_at', { ascending: false });
        if (rf) q = q.eq('id_rede', rf);
        const { data, error } = await q; if (error) throw error; return data || [];
    }
    async function createContrato(p) { const { data, error } = await sb().from('contratos').insert(p).select().single(); if (error) throw error; return data; }
    async function updateContrato(id, p) { const { data, error } = await sb().from('contratos').update(p).eq('id', id).select().single(); if (error) throw error; return data; }
    async function deleteContrato(id) { const { error } = await sb().from('contratos').delete().eq('id', id); if (error) throw error; }

    // ── STATS ──
    async function getStats() {
        const rf = await _getRedeFilter();
        let lq = sb().from('lojas').select('id', { count: 'exact', head: true });
        if (rf) lq = lq.eq('id_rede', rf);
        const [rr, lr, pr, pdr, cr] = await Promise.all([
            sb().from('redes').select('id', { count: 'exact', head: true }),
            lq,
            sb().from('pessoas').select('id', { count: 'exact', head: true }),
            sb().from('produtos').select('id', { count: 'exact', head: true }),
            sb().from('contratos').select('id, valor_mensal, status').eq('status', 'ativo')
        ]);
        const mrr = (cr.data || []).reduce((s, c) => s + (parseFloat(c.valor_mensal) || 0), 0);
        return { redes: rr.count || 0, lojas: lr.count || 0, pessoas: pr.count || 0, produtos: pdr.count || 0, mrr, contratosAtivos: (cr.data || []).length };
    }

    // ── Create User (Edge Function) ──
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

    // ── EXPORT XLSX (SheetJS) ──
    function exportToXLSX(data, filename) {
        if (!data.length) { NEXO.ui.toast('Nenhum dado para exportar.', 'warning'); return; }
        if (typeof XLSX === 'undefined') { NEXO.ui.toast('Biblioteca de exportação não carregada.', 'error'); return; }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Dados');
        // Auto-width
        const colWidths = Object.keys(data[0]).map(k => {
            const maxLen = Math.max(k.length, ...data.map(r => String(r[k] || '').length));
            return { wch: Math.min(maxLen + 2, 40) };
        });
        ws['!cols'] = colWidths;
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
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
        getStats, createAdminUser, exportToXLSX
    };
})();
