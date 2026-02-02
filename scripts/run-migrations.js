#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcGdsdGxkcmVncGR4YXphZnRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk0Nzk3NywiZXhwIjoyMDg1NTIzOTc3fQ.JyXkPg_8M_T3zIQtW32rLU8nI5lsctCCnjh-1n9Zw-M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('Starting migrations...\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      // Split SQL by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.error(`Error in ${file}:`, error.message);
          // Continue with next statement
        }
      }
      console.log(`✓ Completed: ${file}\n`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error.message);
    }
  }

  console.log('Migrations completed!');
}

runMigrations().catch(console.error);
