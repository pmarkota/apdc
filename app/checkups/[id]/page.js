'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RepositoryFactory } from '../../../lib/repositories/repository-factory';
import ImageGallery from '../../../components/checkup-images/ImageGallery';

/**
 * Checkup details page that shows complete information about a checkup
 * including associated images and prescriptions
 */
export default function CheckupDetailsPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [checkup, setCheckup] = useState(null);
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (id) {
      loadCheckupData();
    }
  }, [id, loadCheckupData]);
  
  const loadCheckupData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const checkupRepo = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.CHECKUP
      );
      
      // Get checkup with prescriptions
      const checkupData = await checkupRepo.getWithPrescriptions(id);
      setCheckup(checkupData);
      setPrescriptions(checkupData.prescriptions || []);
      
      // Get patient details
      if (checkupData.patient_id) {
        const patientRepo = RepositoryFactory.getRepository(
          RepositoryFactory.REPOSITORIES.PATIENT
        );
        
        const patientData = await patientRepo.getById(checkupData.patient_id);
        setPatient(patientData);
      }
    } catch (error) {
      console.error('Error loading checkup:', error);
      setError('Failed to load checkup details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteCheckup = async () => {
    if (!confirm('Are you sure you want to delete this checkup?')) {
      return;
    }
    
    try {
      const checkupRepo = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.CHECKUP
      );
      
      await checkupRepo.delete(id);
      router.push('/checkups');
    } catch (error) {
      console.error('Error deleting checkup:', error);
      alert('Failed to delete checkup');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading checkup details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !checkup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error || 'Checkup not found'}</p>
        </div>
        <div className="flex justify-start">
          <Link 
            href="/checkups"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Checkups
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Checkup Details</h1>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/checkups"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Back to Checkups
          </Link>
          <Link 
            href={`/checkups/edit?id=${id}`}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteCheckup}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Checkup Information */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Checkup Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Date:</p>
            <p className="font-medium">{new Date(checkup.checkup_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Procedure:</p>
            <p className="font-medium">{checkup.procedure_code}</p>
          </div>
          {patient && (
            <div>
              <p className="text-gray-600">Patient:</p>
              <p className="font-medium">
                <Link href={`/patients/${patient.id}`} className="text-blue-500 hover:underline">
                  {patient.first_name} {patient.last_name}
                </Link>
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-600">ID:</p>
            <p className="font-medium text-sm">{checkup.id}</p>
          </div>
          {checkup.description && (
            <div className="col-span-2">
              <p className="text-gray-600">Description:</p>
              <p className="font-medium">{checkup.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Images Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Medical Images</h2>
          <Link 
            href={`/checkup-images/upload?checkupId=${id}`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Upload Images
          </Link>
        </div>
        <ImageGallery checkupId={id} />
      </div>
      
    </div>
  );
}
