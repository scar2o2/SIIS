const { createClient } = require('@supabase/supabase-js')

const { supabaseServiceRoleKey, supabaseUrl } = require('./config')

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function verifySupabaseConnection() {
  const { error } = await supabase.storage.listBuckets()
  if (error) {
    throw new Error(`Supabase connection failed: ${error.message}`)
  }
}

module.exports = {
  supabase,
  verifySupabaseConnection,
}