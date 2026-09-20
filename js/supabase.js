// ============================================================
// CETA - MATERIAL ACADÉMICO
// CONEXIÓN A SUPABASE
// ============================================================


// ------------------------------------------------------------
// IMPORTANTE
//
// Coloca aquí EXACTAMENTE la misma URL y ANON KEY
// que utilizas en Material de Gabinete.
//
// NO colocar service_role.
// ------------------------------------------------------------

const SUPABASE_URL = "https://cystgztmeyinsvmkkbji.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_4n5HfbFA8otKAg_X3ic8ig_VZzCqgH1";


// ------------------------------------------------------------
// CREAR CLIENTE
// ------------------------------------------------------------

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
