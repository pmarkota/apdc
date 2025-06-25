'use client';

import { useState, useEffect } from 'react';
import { 
  applyMigration, 
  rollbackMigration, 
  listMigrations, 
  listAvailableMigrations,
  createMigration,
  MIGRATIONS 
} from '@/lib/utils/migration-client';
import { FaPlay, FaUndo, FaCheckCircle, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

export default function MigrationsPage() {
  // Migration listing state
  const [migrations, setMigrations] = useState([]);
  const [availableMigrations, setAvailableMigrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // Migration creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMigration, setNewMigration] = useState({
    name: '',
    description: '',
    forwardSql: '',
    rollbackSql: ''
  });
  
  const loadData = async () => {
    try {
      setLoading(true);
      // Load both migration history and available migrations
      const [historyData, availableData] = await Promise.all([
        listMigrations(),
        listAvailableMigrations()
      ]);
      
      setMigrations(historyData);
      setAvailableMigrations(availableData);
      setError(null);
    } catch (err) {
      console.error('Error loading migrations data:', err);
      setError('Failed to load migrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleApply = async (name) => {
    try {
      setActionInProgress(true);
      setActionResult(null);
      
      const result = await applyMigration(name);
      setActionResult({
        success: true,
        message: result.message
      });
      
      // Refresh the list
      await loadData();
    } catch (err) {
      setActionResult({
        success: false,
        message: err.message
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  const handleRollback = async (name) => {
    if (!confirm('Are you sure you want to roll back this migration? This may cause data loss.')) {
      return;
    }
    
    try {
      setActionInProgress(true);
      setActionResult(null);
      
      const result = await rollbackMigration(name);
      setActionResult({
        success: true,
        message: result.message
      });
      
      // Refresh the list
      await loadData();
    } catch (err) {
      setActionResult({
        success: false,
        message: err.message
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleCreateMigration = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newMigration.name || !newMigration.description || 
        !newMigration.forwardSql || !newMigration.rollbackSql) {
      setActionResult({
        success: false,
        message: 'All fields are required'
      });
      return;
    }
    
    try {
      setActionInProgress(true);
      setActionResult(null);
      
      const result = await createMigration(newMigration);
      setActionResult({
        success: true,
        message: result.message
      });
      
      // Reset form and hide it
      setNewMigration({
        name: '',
        description: '',
        forwardSql: '',
        rollbackSql: ''
      });
      setShowCreateForm(false);
      
      // Refresh the list
      await loadData();
    } catch (err) {
      setActionResult({
        success: false,
        message: err.message
      });
    } finally {
      setActionInProgress(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMigration(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Get the status of each migration
  const getMigrationStatus = (name) => {
    const migration = availableMigrations.find(m => m.name === name);
    return migration ? migration.status : 'not_applied';
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="text-primary hover:text-primary-dark transition-colors">
          &larr; Back to Admin
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Database Migrations</h1>
      
      {actionResult && (
        <div 
          className={`p-4 mb-6 rounded-lg ${
            actionResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {actionResult.success ? (
            <div className="flex items-center">
              <FaCheckCircle className="mr-2" />
              {actionResult.message}
            </div>
          ) : (
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {actionResult.message}
            </div>
          )}
        </div>
      )}
      
      {/* Create Migration Button */}
      <div className="mb-6">
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? (
            <>
              <FaTimes className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <FaPlus className="mr-2" />
              Create New Migration
            </>
          )}
        </button>
      </div>
      
      {/* Create Migration Form */}
      {showCreateForm && (
        <div className="clay-card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Migration</h2>
          <form onSubmit={handleCreateMigration}>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Migration Name (snake_case)
                </label>
                <input
                  type="text"
                  name="name"
                  value={newMigration.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="add_column_example"
                  pattern="^[a-z0-9_]+$"
                  title="Use snake_case (lowercase with underscores)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use snake_case (lowercase with underscores)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newMigration.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add example column to example table"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forward SQL (Apply)
                </label>
                <textarea
                  name="forwardSql"
                  value={newMigration.forwardSql}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="ALTER TABLE example ADD COLUMN example_column VARCHAR(50) NULL;"
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rollback SQL (Revert)
                </label>
                <textarea
                  name="rollbackSql"
                  value={newMigration.rollbackSql}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="ALTER TABLE example DROP COLUMN example_column;"
                  rows={4}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={actionInProgress}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionInProgress ? 'Creating...' : 'Create Migration'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="clay-card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Migrations</h2>
        
        {loading ? (
          <div className="py-4 text-center text-gray-500">Loading migrations...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : availableMigrations.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No migrations available. Create one using the form above.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Migration</th>
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Hardcoded Insurance Number migration */}
              <tr className="border-b">
                <td className="py-3">
                  <div className="font-medium">Add Insurance Number</div>
                  <div className="text-sm text-gray-500">{MIGRATIONS.ADD_INSURANCE_NUMBER}</div>
                </td>
                <td className="py-3">
                  <div className="text-sm">Adds insurance number field to patients table</div>
                </td>
                <td className="py-3">
                  {getMigrationStatus(MIGRATIONS.ADD_INSURANCE_NUMBER) === 'applied' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Applied
                    </span>
                  ) : getMigrationStatus(MIGRATIONS.ADD_INSURANCE_NUMBER) === 'rolled_back' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Rolled Back
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Not Applied
                    </span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    className="inline-flex items-center px-3 py-1 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    onClick={() => handleApply(MIGRATIONS.ADD_INSURANCE_NUMBER)}
                    disabled={actionInProgress || getMigrationStatus(MIGRATIONS.ADD_INSURANCE_NUMBER) === 'applied'}
                  >
                    <FaPlay className="mr-1" size={10} />
                    Apply
                  </button>
                  <button
                    className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    onClick={() => handleRollback(MIGRATIONS.ADD_INSURANCE_NUMBER)}
                    disabled={actionInProgress || getMigrationStatus(MIGRATIONS.ADD_INSURANCE_NUMBER) !== 'applied'}
                  >
                    <FaUndo className="mr-1" size={10} />
                    Rollback
                  </button>
                </td>
              </tr>
              
              {/* User-created migrations */}
              {availableMigrations
                .filter(migration => migration.name !== MIGRATIONS.ADD_INSURANCE_NUMBER && migration.type === 'database')
                .map((migration, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      <div className="font-medium">{migration.description}</div>
                      <div className="text-sm text-gray-500">{migration.name}</div>
                    </td>
                    <td className="py-3">
                      <div className="text-sm">{migration.description}</div>
                      <div className="text-xs text-gray-500">Created: {new Date(migration.created_at).toLocaleString()}</div>
                    </td>
                    <td className="py-3">
                      {migration.status === 'applied' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Applied
                        </span>
                      ) : migration.status === 'rolled_back' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Rolled Back
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Not Applied
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="inline-flex items-center px-3 py-1 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        onClick={() => handleApply(migration.name)}
                        disabled={actionInProgress || migration.status === 'applied'}
                      >
                        <FaPlay className="mr-1" size={10} />
                        Apply
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        onClick={() => handleRollback(migration.name)}
                        disabled={actionInProgress || migration.status !== 'applied'}
                      >
                        <FaUndo className="mr-1" size={10} />
                        Rollback
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="clay-card p-6">
        <h2 className="text-xl font-semibold mb-4">Migration History</h2>
        
        {loading ? (
          <div className="py-4 text-center text-gray-500">Loading migration history...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : migrations.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No migrations have been applied yet.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Migration</th>
                <th className="py-2 text-left">Operation</th>
                <th className="py-2 text-left">Applied At</th>
                <th className="py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {migrations.map((migration, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{migration.name}</td>
                  <td className="py-3">
                    <span className={`capitalize ${migration.operation === 'apply' ? 'text-green-600' : 'text-red-600'}`}>
                      {migration.operation}
                    </span>
                  </td>
                  <td className="py-3">{new Date(migration.applied_at).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`${migration.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {migration.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
