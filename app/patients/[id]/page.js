'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaTrash, FaFileMedical, FaPills, FaCalendarCheck, FaPlus } from 'react-icons/fa';

// Import medical records components
import MedicalRecordsList from '@/components/medical-records/MedicalRecordsList';
import MedicalRecordForm from '@/components/medical-records/MedicalRecordForm';
import MedicalHistoryTimeline from '@/components/medical-records/MedicalHistoryTimeline';

export default function PatientDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
  
  // States for medical records modal
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentRecord, setCurrentRecord] = useState(null);
  
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        // Fetch patient details
        const patientResponse = await fetch(`/api/patients/${id}`);
        if (!patientResponse.ok) {
          throw new Error(`Failed to fetch patient: ${patientResponse.status}`);
        }
        const patientData = await patientResponse.json();
        setPatient(patientData);
        
        // Fetch patient's medical records
        const recordsResponse = await fetch(`/api/medical-records?patientId=${id}`);
        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          setMedicalRecords(recordsData);
        }
        
        // Fetch patient's checkups
        const checkupsResponse = await fetch(`/api/checkups?patientId=${id}`);
        if (checkupsResponse.ok) {
          const checkupsData = await checkupsResponse.json();
          setCheckups(checkupsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [id]);
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/patients/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          router.push('/patients');
        } else {
          const errorData = await response.json();
          setError(`Failed to delete: ${errorData.error}`);
        }
      } catch (err) {
        setError(`Delete failed: ${err.message}`);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="p-8">
        <div className="clay-card p-8 mb-8">
          <div className="animate-pulse flex flex-col">
            <div className="h-8 bg-primary/20 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-primary/20 rounded w-full mb-4"></div>
            <div className="h-4 bg-primary/20 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-primary/20 rounded w-1/2"></div>
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
          <Link href="/patients" className="mt-4 inline-block text-primary hover:underline">
            Back to patients
          </Link>
        </div>
      </div>
    );
  }
  
  if (!patient) {
    return (
      <div className="p-8">
        <div className="clay-card p-8">
          <h1 className="text-2xl font-bold mb-4">Patient not found</h1>
          <Link href="/patients" className="text-primary hover:underline">
            Back to patients
          </Link>
        </div>
      </div>
    );
  }
  
  const getAgeFromDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    if (isNaN(birthDate.getTime())) {
      return 'N/A';
    }
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Not specified' : date.toLocaleDateString();
  };
  
  const extractTimeFromDatetime = (datetimeString) => {
    if (!datetimeString) return 'Not specified';
    const date = new Date(datetimeString);
    if (isNaN(date.getTime())) return 'Not specified';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="p-6">
      {/* Back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/patients" className="flex items-center text-primary hover:text-primary-dark transition-colors">
          <FaArrowLeft className="mr-2" />
          Back to Patients
        </Link>
        
        <div className="flex space-x-2">
          <Link
            href={`/patients/${id}/edit`}
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            <FaEdit className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <FaTrash className="mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Patient details card */}
      <motion.div 
        className="clay-card p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          {patient.first_name} {patient.last_name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Personal ID:</span>
                <p className="font-medium">{patient.personal_id}</p>
              </div>
              <div>
                <span className="text-gray-500">Date of Birth:</span>
                <p className="font-medium">{formatDate(patient.birth_date)} (Age: {getAgeFromDateOfBirth(patient.birth_date)})</p>
              </div>
              <div>
                <span className="text-gray-500">Sex:</span>
                <p className="font-medium">{patient.sex === 'M' ? 'Male' : 'Female'}</p>
              </div>
              <div>
                <span className="text-gray-500">Insurance Number:</span>
                <p className="font-medium">{patient.insurance_number || 'Not specified'}</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="clay-card p-4">
                <FaFileMedical className="text-primary mx-auto mb-2 text-xl" />
                <span className="block text-gray-500 text-sm">Medical Records</span>
                <p className="font-bold text-lg">{medicalRecords.length}</p>
              </div>
              <div className="clay-card p-4">
                <FaCalendarCheck className="text-primary mx-auto mb-2 text-xl" />
                <span className="block text-gray-500 text-sm">Checkups</span>
                <p className="font-bold text-lg">{checkups.length}</p>
              </div>
              <div className="clay-card p-4">
                <FaPills className="text-primary mx-auto mb-2 text-xl" />
                <span className="block text-gray-500 text-sm">Prescriptions</span>
                <p className="font-bold text-lg">0</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medical-records'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('medical-records')}
          >
            Medical Records
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'checkups'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('checkups')}
          >
            Checkups
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'details' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="clay-card p-6"
        >
          <h2 className="text-xl font-bold mb-4">Patient Details</h2>
          <p className="text-gray-700">Additional patient details will be displayed here.</p>
        </motion.div>
      )}
      
      {activeTab === 'medical-records' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="clay-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Medical Records</h2>
              <motion.button
                className="flex items-center bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setModalMode('add');
                  setCurrentRecord(null);
                  setShowMedicalRecordModal(true);
                }}
              >
                <FaPlus className="mr-2" /> Add Record
              </motion.button>
            </div>
            
            <MedicalRecordsList
              key={`medical-list-${refreshTrigger}`}
              patientId={id}
              // No edit or delete buttons on patient details page
            />
          </div>
          
          <div className="clay-card p-6">
            <h2 className="text-xl font-bold mb-6">Medical History Timeline</h2>
            <MedicalHistoryTimeline key={`timeline-${refreshTrigger}`} patientId={id} />
          </div>
          
          {/* Modal for Add/Edit Medical Record */}
          {showMedicalRecordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="w-full max-w-2xl mx-4">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="bg-white rounded-lg shadow-xl overflow-hidden"
                >
                  <MedicalRecordForm
                    patientId={id}
                    record={modalMode === 'edit' ? currentRecord : null}
                    onSave={async (savedRecord) => {
                      setShowMedicalRecordModal(false);
                      
                      // Update the UI with the new/edited record
                      if (modalMode === 'add') {
                        setMedicalRecords([...medicalRecords, savedRecord]);
                      } else {
                        setMedicalRecords(
                          medicalRecords.map(r => r.id === savedRecord.id ? savedRecord : r)
                        );
                      }
                      
                      // Trigger refresh for all child components
                      triggerRefresh();
                    }}
                    onCancel={() => setShowMedicalRecordModal(false)}
                  />
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      )}
      
      {activeTab === 'checkups' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="clay-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Checkups</h2>
            <Link 
              href={`/patients/${id}/checkups/new`} 
              className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors"
            >
              Schedule Checkup
            </Link>
          </div>
          
          {checkups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No checkups found for this patient.</p>
          ) : (
            <ul className="divide-y">
              {checkups.map((checkup) => (
                <li key={checkup.id} className="py-4">
                  <h3 className="font-medium">{checkup.procedure_type}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Date: {formatDate(checkup.checkup_date)}</span>
                    <span className="ml-4">Time: {extractTimeFromDatetime(checkup.checkup_date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}
