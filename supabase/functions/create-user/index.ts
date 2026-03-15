// ============================================================
// NEXO — Edge Function: create-user
// ============================================================
// Cria usuários (admin e operacionais) com a service_role key.
// Só pode ser chamada por super_admin autenticado.
//
// DEPLOY:
// supabase functions deploy create-user --project-ref SEU_REF
//
// BODY esperado:
// {
//   "email": "usuario@email.com",
//   "password": "senhaSegura123",
//   "user_metadata": {
//     "role": "super_admin" | "gestor_rede" | "encarregado",
//     "id_rede": "uuid-da-rede" | null,
//     "id_loja": "uuid-da-loja" | null,
//     "nome": "Nome Completo"
//   }
// }
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Método não permitido' }), {
            status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        // ── Verifica autenticação do chamador ──
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Token não fornecido' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !caller) {
            return new Response(JSON.stringify({ error: 'Não autenticado' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Só super_admin pode criar usuários
        if (caller.user_metadata?.role !== 'super_admin') {
            return new Response(JSON.stringify({ error: 'Permissão negada. Apenas Super Admin.' }), {
                status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // ── Parseia body ──
        const { email, password, user_metadata } = await req.json();

        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const validRoles = ['super_admin', 'gestor_rede', 'encarregado'];
        if (!user_metadata?.role || !validRoles.includes(user_metadata.role)) {
            return new Response(JSON.stringify({ error: `Role inválido. Use: ${validRoles.join(', ')}` }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // ── Cria o usuário com service_role key ──
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: {
                role: user_metadata.role,
                id_rede: user_metadata.id_rede || null,
                id_loja: user_metadata.id_loja || null,
                nome: user_metadata.nome || email.split('@')[0]
            }
        });

        if (createError) {
            let msg = createError.message;
            if (msg.includes('already been registered')) msg = 'Este email já está cadastrado.';
            return new Response(JSON.stringify({ error: msg }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            user: {
                id: newUser.user.id,
                email: newUser.user.email,
                role: newUser.user.user_metadata?.role,
                nome: newUser.user.user_metadata?.nome
            }
        }), {
            status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Erro interno: ' + err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
