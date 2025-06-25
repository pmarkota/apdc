'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import PrescriptionsList from '@/components/prescriptions/PrescriptionsList';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';

// Animation variants for staggered list items
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PrescriptionsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentPrescription, setCurrentPrescription] = useState(null);
  
  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientRepository = RepositoryFactory.getRepository(
          RepositoryFactory.REPOSITORIES.PATIENT
        );
        
        const data = await patientRepository.getAll();
        setPatients(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  // Filter patients by search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           patient.personal_id.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };
  
  // Modal handlers
  const handleAddPrescription = () => {
    setModalMode('add');
    setCurrentPrescription(null);
    setShowModal(true);
  };
  
  const handleEditPrescription = (prescription) => {
    setModalMode('edit');
    setCurrentPrescription(prescription);
    setShowModal(true);
  };
  
  const handleDeletePrescription = async (prescription) => {
    if (!window.confirm(`Are you sure you want to delete this prescription for ${prescription.medicine_name}?`)) {
      return;
    }
    
    try {
      const prescriptionRepository = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.PRESCRIPTION
      );
      
      await prescriptionRepository.delete(prescription.id);
      
      // Force re-render of the PrescriptionsList component
      const tempPatient = selectedPatient;
      setSelectedPatient(null);
      setTimeout(() => setSelectedPatient(tempPatient), 10);
    } catch (err) {
      console.error('Error deleting prescription:', err);
      alert('Failed to delete prescription. Please try again.');
    }
  };
  
  const handleSavePrescription = async (formData) => {
    console.log('[PrescriptionsPage] handleSavePrescription called with data:', formData);
    try {
      console.log('[PrescriptionsPage] Getting prescription repository');
      const prescriptionRepo = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.PRESCRIPTION
      );
      console.log('[PrescriptionsPage] Repository:', prescriptionRepo);
      
      if (modalMode === 'edit' && currentPrescription) {
        console.log('[PrescriptionsPage] Updating existing prescription:', currentPrescription.id);
        // Update existing prescription
        const result = await prescriptionRepo.update(currentPrescription.id, formData);
        console.log('[PrescriptionsPage] Update result:', result);
      } else {
        console.log('[PrescriptionsPage] Creating new prescription');
        // Create new prescription
        const result = await prescriptionRepo.create(formData);
        console.log('[PrescriptionsPage] Create result:', result);
      }
      
      console.log('[PrescriptionsPage] Saving completed, closing modal');
      // Close the modal after successful save
      setShowModal(false);
      
      console.log('[PrescriptionsPage] Refreshing prescriptions list');
      // Force re-render of the PrescriptionsList component
      const tempPatient = selectedPatient;
      setSelectedPatient(null);
      setTimeout(() => setSelectedPatient(tempPatient), 10);
      
      console.log('[PrescriptionsPage] Prescription saved successfully!');
    } catch (error) {
      console.error('[PrescriptionsPage] Error saving prescription:', error);
      throw new Error('Failed to save prescription. Please try again.');
    }
  };
  
  const handleCancelModal = () => {
    setShowModal(false);
  };
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <h1 className="text-3xl font-bold text-foreground">Prescriptions</h1>
        
        <motion.div 
          className="clay-card !p-0 overflow-hidden flex"
          whileHover={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search patients..." 
              className="block w-full py-3 pl-10 pr-3 bg-transparent border-none focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-primary-light text-white hover:bg-primary transition-colors">
            <FaFilter />
          </button>
        </motion.div>
      </motion.div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="clay-card p-6 animate-pulse">
              <div className="space-y-3 w-2/3">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="clay-card p-6 bg-error/10 text-error text-center">
          <p>{error}</p>
          <button 
            className="mt-4 clay-button"
            onClick={() => {
              setLoading(true);
              setError(null);
              // Retry loading patients
              RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT).getAll()
                .then(data => {
                  setPatients(data);
                  setLoading(false);
                })
                .catch(err => {
                  console.error('Error retrying patients fetch:', err);
                  setError('Failed to load patients. Please try again later.');
                  setLoading(false);
                });
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient List */}
          <motion.div 
            className="md:col-span-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-3">Select a Patient</h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto clay-card p-4">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <motion.div 
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedPatient?.id === patient.id 
                        ? 'bg-primary/10 border-l-4 border-primary' 
                        : 'hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-medium">{patient.first_name} {patient.last_name}</h3>
                    <p className="text-xs text-gray-500">ID: {patient.personal_id}</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  <p>No patients found</p>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Prescriptions */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {selectedPatient ? (
              <div className="clay-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedPatient.first_name} {selectedPatient.last_name}'s Prescriptions
                  </h2>
                  <motion.button 
                    className="clay-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddPrescription}
                  >
                    <FaPlus className="mr-1" /> Add Prescription
                  </motion.button>
                </div>
                
                <PrescriptionsList 
                  patientId={selectedPatient.id}
                  showAddButton={false}
                  onEditClick={handleEditPrescription}
                  onDeleteClick={handleDeletePrescription}
                />
              </div>
            ) : (
              <div className="clay-card p-10 text-center">
                <h3 className="text-lg font-medium text-gray-500">
                  Select a patient to view their prescriptions
                </h3>
              </div>
            )}
          </motion.div>
        </div>
      )}
      
      {/* Modal for Add/Edit Prescription */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl mx-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-lg shadow-xl overflow-hidden"
            >
              <PrescriptionForm 
                initialData={modalMode === 'edit' ? currentPrescription : null}
                patientId={selectedPatient?.id}
                checkupId={null} // Will be selected from the form
                onSubmit={handleSavePrescription}
                onCancel={handleCancelModal}
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
