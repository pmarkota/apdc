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
 * API endpoint that handles database migrations
 * 
 * POST /api/migrations
 * Body: 
 * - For applying/rolling back: { name: string, operation: 'apply' | 'rollback' }
 * - For creation: { operation: 'create', name: string, description: string, forwardSql: string, rollbackSql: string }
 * 
 * This endpoint should be secured in a production environment
 * Ideally with an admin token or other secure authorization mechanism
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { operation } = body;

    // Handle migration creation
    if (operation === 'create') {
      return handleCreateMigration(body);
    }
    
    // Handle apply/rollback operations
    const { name } = body;

    if (!name || !operation) {
      return NextResponse.json(
        { error: 'Missing required parameters: name and operation' }, 
        { status: 400 }
      );
    }

    if (operation !== 'apply' && operation !== 'rollback') {
      return NextResponse.json(
        { error: 'Operation must be either "apply", "rollback", or "create"' }, 
        { status: 400 }
      );
    }

    // Get the appropriate SQL for this migration
    let sql = '';
    
    // First, try to load from the migrations table
    const { data: migrationData, error: fetchError } = await supabase
      .from('migrations')
      .select('forward_sql, rollback_sql')
      .eq('name', name)
      .single();
    
    if (migrationData) {
      // If found in the table, use that SQL
      sql = operation === 'apply' ? migrationData.forward_sql : migrationData.rollback_sql;
    } else {
      // Fall back to hardcoded migrations if not found in the table
      switch (name) {
        case 'add_insurance_number':
          sql = operation === 'apply'
            ? 'ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(50) NULL;'
            : 'ALTER TABLE patients DROP COLUMN IF EXISTS insurance_number;';
          break;
          
        default:
          return NextResponse.json(
            { error: `Unknown migration: ${name}` }, 
            { status: 404 }
          );
      }
    }

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    // If there was an error, return it
    if (error) {
      console.error(`Migration ${operation} failed:`, error);
      
      // Record failed migration attempt
      await supabase
        .from('migration_history')
        .insert({
          name,
          operation,
          applied_at: new Date().toISOString(),
          status: 'failed',
          details: error.message
        });
      
      return NextResponse.json(
        { error: `Failed to ${operation} migration: ${error.message}` }, 
        { status: 500 }
      );
    }
    
    // Record successful migration
    await supabase
      .from('migration_history')
      .insert({
        name,
        operation,
        applied_at: new Date().toISOString(),
        status: 'success',
        details: `Successfully ${operation === 'apply' ? 'applied' : 'rolled back'} migration`
      });

    return NextResponse.json({
      message: `Successfully ${operation === 'apply' ? 'applied' : 'rolled back'} migration '${name}'`
    });
  } catch (error) {
    console.error('Migration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * Handles creation of a new migration
 * 
 * @param {Object} params Migration parameters
 * @param {string} params.name Name of the migration (snake_case)
 * @param {string} params.description Human-readable description of the migration
 * @param {string} params.forwardSql SQL to apply the migration
 * @param {string} params.rollbackSql SQL to roll back the migration
 * @returns {Response} JSON response
 */
async function handleCreateMigration({ name, description, forwardSql, rollbackSql }) {
  // Validate inputs
  if (!name || !description || !forwardSql || !rollbackSql) {
    return NextResponse.json(
      { error: 'Missing required parameters: name, description, forwardSql, rollbackSql' }, 
      { status: 400 }
    );
  }
  
  // Check if the migration already exists
  const { data, error: checkError } = await supabaseAdmin
    .from('migrations')
    .select('id')
    .eq('name', name)
    .single();
  
  if (data) {
    return NextResponse.json(
      { error: `Migration with name '${name}' already exists` },
      { status: 409 }
    );
  }
  
  try {
    // Insert the new migration into the migrations table
    const { data, error } = await supabaseAdmin
      .from('migrations')
      .insert({
        name,
        description,
        forward_sql: forwardSql,
        rollback_sql: rollbackSql,
        created_at: new Date().toISOString(),
        created_by: null // We could set this if we had user authentication
      });
    
    if (error) {
      console.error('Failed to create migration:', error);
      return NextResponse.json(
        { error: `Failed to create migration: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: `Successfully created migration '${name}'`,
      name
    });
  } catch (error) {
    console.error('Migration creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
