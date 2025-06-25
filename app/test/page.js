'use client';

import { useState, useEffect } from 'react';
import { RepositoryFactory } from '../../lib/repositories/repository-factory';

export default function TestPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');

  useEffect(() => {
    async function fetchPatients() {
      setLoading(true);
      try {
        const patientRepository = RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT);
        const patientsData = await patientRepository.getAll();
        setPatients(patientsData);
        setConnectionStatus('Connection successful! Supabase is properly configured.');
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setError(err.message);
        setConnectionStatus(`Connection failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className={`p-4 mb-6 rounded-md ${connectionStatus.includes('successful') ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="text-lg font-semibold">Connection Status:</h2>
        <p className={`${connectionStatus.includes('successful') ? 'text-green-700' : 'text-red-700'}`}>
          {connectionStatus}
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 rounded-md">
          <h2 className="text-lg font-semibold">Error:</h2>
          <p className="text-red-700">{error}</p>
          <div className="mt-4">
            <p className="font-medium">Possible solutions:</p>
            <ul className="list-disc ml-6">
              <li>Verify your Supabase URL and anon key in .env.local</li>
              <li>Check your internet connection</li>
              <li>Confirm that your Supabase project is active</li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Patients from Database:</h2>
        {loading ? (
          <p>Loading patients data...</p>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th className="py-2 px-4 border-b">Personal ID</th>
                  <th className="py-2 px-4 border-b">First Name</th>
                  <th className="py-2 px-4 border-b">Last Name</th>
                  <th className="py-2 px-4 border-b">Birth Date</th>
                  <th className="py-2 px-4 border-b">Sex</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id}>
                    <td className="py-2 px-4 border-b">{patient.id}</td>
                    <td className="py-2 px-4 border-b">{patient.personal_id}</td>
                    <td className="py-2 px-4 border-b">{patient.first_name}</td>
                    <td className="py-2 px-4 border-b">{patient.last_name}</td>
                    <td className="py-2 px-4 border-b">{patient.birth_date}</td>
                    <td className="py-2 px-4 border-b">{patient.sex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No patients found in the database.</p>
        )}
      </div>
    </div>
  );
}
