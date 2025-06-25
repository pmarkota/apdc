import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MIGRATIONS } from '@/lib/utils/migration-client';

// Initialize Supabase client with anon key for regular operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize Supabase admin client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * API endpoint that lists all available migrations
 * Combines hardcoded migrations and those created dynamically in the database
 * 
 * GET /api/migrations/available
 */
export async function GET() {
  try {
    // Fetch migrations from the database
    let dbMigrations = [];
    
    // Try to fetch from migrations table, but don't fail if it doesn't exist yet
    const { data, error } = await supabaseAdmin
      .from('migrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      // Log the error but continue with empty migrations
      console.error('Failed to fetch migrations:', error);
      // If the table doesn't exist, we'll just proceed with hardcoded migrations
      if (error.code !== '42P01') { // 42P01 is the PostgreSQL error code for 'relation does not exist'
        return NextResponse.json(
          { error: 'Failed to fetch migrations' },
          { status: 500 }
        );
      }
    } else {
      dbMigrations = data;
    }
    
    // Get hardcoded migrations
    const hardcodedMigrations = Object.values(MIGRATIONS).map(name => ({ name }));
    
    // Get history of applied migrations to determine status
    const { data: history, error: historyError } = await supabase
      .from('migration_history')
      .select('*')
      .order('applied_at', { ascending: false });
    
    if (historyError) {
      console.error('Failed to fetch migration history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch migration history' },
        { status: 500 }
      );
    }
    
    // Combine all migrations and add status
    const allMigrations = [];
    
    // Process hardcoded migrations first
    hardcodedMigrations.forEach(hm => {
      const dbMigration = dbMigrations?.find(m => m.name === hm.name);
      
      // Skip if this hardcoded migration is also in the database
      if (dbMigration) return;
      
      const migrationHistory = history?.filter(h => h.name === hm.name) || [];
      const lastOperation = migrationHistory.length > 0 ? migrationHistory[0] : null;
      
      allMigrations.push({
        name: hm.name,
        description: 'Hardcoded migration',
        type: 'hardcoded',
        status: getStatus(lastOperation),
        history: migrationHistory
      });
    });
    
    // Then add database migrations
    dbMigrations?.forEach(dbm => {
      const migrationHistory = history?.filter(h => h.name === dbm.name) || [];
      const lastOperation = migrationHistory.length > 0 ? migrationHistory[0] : null;
      
      allMigrations.push({
        ...dbm,
        type: 'database',
        status: getStatus(lastOperation),
        history: migrationHistory
      });
    });
    
    return NextResponse.json(allMigrations);
  } catch (error) {
    console.error('Available migrations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Determine the status of a migration based on its history
 * 
 * @param {Object|null} lastOperation - The last operation performed on this migration
 * @returns {string} - Status: 'applied', 'rolled_back', or 'not_applied'
 */
function getStatus(lastOperation) {
  if (!lastOperation) return 'not_applied';
  
  // If the last operation was successful
  if (lastOperation.status === 'success') {
    return lastOperation.operation === 'apply' ? 'applied' : 'rolled_back';
  }
  
  // If the last operation failed, look at the previous successful operation
  // (This is simplified - in a real app you'd need more complex logic here)
  return 'not_applied';
}
