import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // You'll need this key

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
  const migrationFiles = [
    '20250830000001_initial_schema.sql',
    '20250830000002_rls_policies.sql',
    '20250830000003_seed_data.sql'
  ]

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`)
    
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    
    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      try {
        await supabase.rpc('exec_sql', { sql: statement })
        console.log('✅ Statement executed successfully')
      } catch (error) {
        console.error('❌ Error executing statement:', error)
        console.error('Statement:', statement.substring(0, 100) + '...')
      }
    }
  }
}

runMigrations().catch(console.error)