-- ============================================================
-- NEXO Intelligence — Migração: Admin Panel + Auth Real
-- ============================================================
-- Execute este SQL no SQL Editor do Supabase.
-- ATENÇÃO: Executar bloco por bloco, validando cada um.
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. TABELA: redes (NOVA)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.redes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT,
    contato TEXT,
    telefone TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index para busca
CREATE INDEX IF NOT EXISTS idx_redes_nome ON public.redes (nome);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_redes_updated_at
    BEFORE UPDATE ON public.redes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ══════════════════════════════════════════════════════════════
-- 2. ALTERAR TABELA: lojas — adicionar coluna id_rede
-- ══════════════════════════════════════════════════════════════

-- Adiciona a FK para redes (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lojas' AND column_name = 'id_rede'
    ) THEN
        ALTER TABLE public.lojas ADD COLUMN id_rede UUID REFERENCES public.redes(id) ON DELETE SET NULL;
        CREATE INDEX idx_lojas_id_rede ON public.lojas (id_rede);
    END IF;
END $$;


-- ══════════════════════════════════════════════════════════════
-- 3. RLS POLICIES — Auth Real
-- ══════════════════════════════════════════════════════════════
-- Estratégia:
-- - super_admin: ALL em tudo
-- - gestor_rede: SELECT/INSERT/UPDATE em dados da sua rede
-- - encarregado: SELECT/INSERT em dados da sua loja (OPS)
-- - anon: NADA (remove acesso anônimo)
-- ══════════════════════════════════════════════════════════════

-- Helper function para extrair role do JWT
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
    SELECT coalesce(
        (auth.jwt() -> 'user_metadata' ->> 'role'),
        'anon'
    );
$$ LANGUAGE sql STABLE;

-- Helper function para extrair id_rede do JWT
CREATE OR REPLACE FUNCTION auth.user_rede()
RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'user_metadata' ->> 'id_rede')::UUID;
$$ LANGUAGE sql STABLE;

-- Helper function para extrair id_loja do JWT
CREATE OR REPLACE FUNCTION auth.user_loja()
RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'user_metadata' ->> 'id_loja')::UUID;
$$ LANGUAGE sql STABLE;


-- ── REDES ──

ALTER TABLE public.redes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (se houver)
DROP POLICY IF EXISTS "redes_super_admin_all" ON public.redes;
DROP POLICY IF EXISTS "redes_gestor_read_own" ON public.redes;

CREATE POLICY "redes_super_admin_all"
    ON public.redes FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');

CREATE POLICY "redes_gestor_read_own"
    ON public.redes FOR SELECT
    USING (auth.user_role() = 'gestor_rede' AND id = auth.user_rede());


-- ── LOJAS ──

-- Drop old anon policies
DROP POLICY IF EXISTS "lojas_select" ON public.lojas;
DROP POLICY IF EXISTS "lojas_insert" ON public.lojas;
DROP POLICY IF EXISTS "lojas_update" ON public.lojas;
DROP POLICY IF EXISTS "Permitir leitura para anon" ON public.lojas;

CREATE POLICY "lojas_super_admin_all"
    ON public.lojas FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');

CREATE POLICY "lojas_gestor_own_rede"
    ON public.lojas FOR ALL
    USING (auth.user_role() = 'gestor_rede' AND id_rede = auth.user_rede())
    WITH CHECK (auth.user_role() = 'gestor_rede' AND id_rede = auth.user_rede());

CREATE POLICY "lojas_encarregado_own"
    ON public.lojas FOR SELECT
    USING (auth.user_role() = 'encarregado' AND id = auth.user_loja());


-- ── PESSOAS ──

DROP POLICY IF EXISTS "pessoas_select" ON public.pessoas;
DROP POLICY IF EXISTS "pessoas_insert" ON public.pessoas;
DROP POLICY IF EXISTS "Permitir leitura para anon" ON public.pessoas;

CREATE POLICY "pessoas_super_admin_all"
    ON public.pessoas FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');

CREATE POLICY "pessoas_gestor_own_rede"
    ON public.pessoas FOR ALL
    USING (
        auth.user_role() = 'gestor_rede'
        AND id_loja IN (SELECT id FROM public.lojas WHERE id_rede = auth.user_rede())
    )
    WITH CHECK (
        auth.user_role() = 'gestor_rede'
        AND id_loja IN (SELECT id FROM public.lojas WHERE id_rede = auth.user_rede())
    );

CREATE POLICY "pessoas_encarregado_own_loja"
    ON public.pessoas FOR SELECT
    USING (auth.user_role() = 'encarregado' AND id_loja = auth.user_loja());


-- ── PRODUTOS (global — todos leem, super edita) ──

DROP POLICY IF EXISTS "produtos_select" ON public.produtos;
DROP POLICY IF EXISTS "Permitir leitura para anon" ON public.produtos;

CREATE POLICY "produtos_read_all"
    ON public.produtos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "produtos_super_admin_write"
    ON public.produtos FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');


-- ── PERGUNTAS (global read, super edit) ──

DROP POLICY IF EXISTS "Permitir leitura para anon" ON public.perguntas;

CREATE POLICY "perguntas_read_all"
    ON public.perguntas FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "perguntas_super_admin_write"
    ON public.perguntas FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');


-- ── MOTIVOS (global read, super edit) ──

DROP POLICY IF EXISTS "Permitir leitura para anon" ON public.motivos;

CREATE POLICY "motivos_read_all"
    ON public.motivos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "motivos_super_admin_write"
    ON public.motivos FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');


-- ── CONFORMIDADE_TEMP (global read, super edit) ──

CREATE POLICY "conformidade_read_all"
    ON public.conformidade_temp FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "conformidade_super_admin_write"
    ON public.conformidade_temp FOR ALL
    USING (auth.user_role() = 'super_admin')
    WITH CHECK (auth.user_role() = 'super_admin');


-- ══════════════════════════════════════════════════════════════
-- 4. DADOS INICIAIS
-- ══════════════════════════════════════════════════════════════

-- Rede de teste (para associar à loja LJ-001 existente)
INSERT INTO public.redes (id, nome, contato)
VALUES ('00000000-0000-0000-0000-000000000001', 'Rede Teste NEXO', 'Admin NEXO')
ON CONFLICT (id) DO NOTHING;

-- Associa a loja existente à rede teste (se existir)
UPDATE public.lojas
SET id_rede = '00000000-0000-0000-0000-000000000001'
WHERE id_rede IS NULL;


-- ══════════════════════════════════════════════════════════════
-- 5. CRIAR PRIMEIRO SUPER ADMIN
-- ══════════════════════════════════════════════════════════════
-- IMPORTANTE: Execute este passo MANUALMENTE no Supabase Dashboard:
--
-- 1. Vá em Authentication > Users > Add User
-- 2. Email: seu-email@nexo.com.br
-- 3. Senha: (defina uma forte)
-- 4. Marque "Auto Confirm User"
-- 5. Após criar, clique no usuário e edite o Raw User Metadata:
--    {
--      "role": "super_admin",
--      "nome": "Admin NEXO"
--    }
--
-- Isso cria o primeiro super admin que pode criar todos os demais
-- via Edge Function.
-- ══════════════════════════════════════════════════════════════
