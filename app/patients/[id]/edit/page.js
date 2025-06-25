'use client';

import { useEffect, useState } from 'react';
import PatientForm from '@/components/patients/PatientForm';

export default function EditPatientPage({ params }) {
  const { id } = params;
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch patient: ${response.status}`);
        }
        
        const data = await response.json();
        setPatient(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchPatient();
  }, [id]);
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="clay-card p-8">
          <div className="animate-pulse flex flex-col">
            <div className="h-8 bg-primary/20 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-primary/20 rounded w-full mb-4"></div>
            <div className="h-4 bg-primary/20 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="clay-card p-8 bg-red-100 border-red-300">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  return <PatientForm initialValues={patient} isEdit={true} />;
}
