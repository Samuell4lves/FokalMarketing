const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function getSupabaseClient() {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase nao configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY.");
  }

  const key = supabaseServiceRoleKey || supabaseAnonKey;

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

module.exports = {
  getSupabaseClient,
  hasSupabaseEnv,
};
