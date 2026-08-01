import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length > 0) acc[key.trim()] = rest.join('=').trim().replace(/['"]/g, '')
  return acc
}, {})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: 'ALTER TABLE public.task ADD COLUMN IF NOT EXISTS completion_reply TEXT;' })
  if (error) console.error('Migration failed:', error)
  else console.log('Migration successful:', data)
}
run()
