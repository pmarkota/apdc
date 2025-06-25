/**
 * A client utility for managing database migrations
 * This provides a frontend interface to the migrations API
 */

/**
 * Apply a named migration
 * 
 * @param {string} name - The name of the migration to apply
 * @returns {Promise<Object>} - Result of the migration operation
 */
export async function applyMigration(name) {
  try {
    const response = await fetch('/api/migrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        operation: 'apply'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to apply migration');
    }
    
    return data;
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  }
}

/**
 * Roll back a named migration
 * 
 * @param {string} name - The name of the migration to roll back
 * @returns {Promise<Object>} - Result of the migration operation
 */
export async function rollbackMigration(name) {
  try {
    const response = await fetch('/api/migrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        operation: 'rollback'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to roll back migration');
    }
    
    return data;
  } catch (error) {
    console.error('Error rolling back migration:', error);
    throw error;
  }
}

/**
 * List all migrations that have been applied
 * 
 * @returns {Promise<Array>} - List of migrations and their status
 */
export async function listMigrations() {
  try {
    const response = await fetch('/api/migrations/history');
    
    if (!response.ok) {
      throw new Error('Failed to fetch migration history');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching migrations:', error);
    throw error;
  }
}

/**
 * Create a new migration
 * 
 * @param {Object} migration - Migration details
 * @param {string} migration.name - Name of the migration (snake_case)
 * @param {string} migration.description - Description of what the migration does
 * @param {string} migration.forwardSql - SQL to apply the migration
 * @param {string} migration.rollbackSql - SQL to roll back the migration
 * @returns {Promise<Object>} - Result of the creation operation
 */
export async function createMigration({ name, description, forwardSql, rollbackSql }) {
  try {
    const response = await fetch('/api/migrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'create',
        name,
        description,
        forwardSql,
        rollbackSql
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create migration');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating migration:', error);
    throw error;
  }
}

/**
 * List all available migrations (both from code and database)
 * 
 * @returns {Promise<Array>} - List of all migrations
 */
export async function listAvailableMigrations() {
  try {
    const response = await fetch('/api/migrations/available');
    
    if (!response.ok) {
      throw new Error('Failed to fetch available migrations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching available migrations:', error);
    throw error;
  }
}

// Migration definitions - add new migrations here
export const MIGRATIONS = {
  ADD_INSURANCE_NUMBER: 'add_insurance_number',
  // Add more migrations as they are created
};
