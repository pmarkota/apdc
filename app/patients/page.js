'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSearch, FaFileExport, FaFilter } from 'react-icons/fa';
import PatientCard from '@/components/patients/PatientCard';
import Link from 'next/link';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { objectsToCsv, downloadCsv } from '@/lib/utils/csv-utils';

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

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setPatients(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
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
  
  // Handle CSV export
  const handleExportCSV = (patientsToExport) => {
    // Define CSV headers
    const headers = [
      { label: 'ID', key: 'id' },
      { label: 'Personal ID', key: 'personal_id' },
      { label: 'First Name', key: 'first_name' },
      { label: 'Last Name', key: 'last_name' },
      { label: 'Birth Date', key: 'birth_date' },
      { label: 'Sex', key: 'sex' },
      { label: 'Insurance Number', key: 'insurance_number' },
      { label: 'Created At', key: 'created_at' },
    ];
    
    // Generate CSV content
    const csvContent = objectsToCsv(patientsToExport, headers);
    
    // Download CSV file
    downloadCsv(csvContent, `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <h1 className="text-3xl font-bold text-foreground">Patients</h1>
        
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
        
        <div className="flex space-x-3">
          <Link href="/patients/new">
            <motion.button 
              className="clay-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="mr-2" />
              New Patient
            </motion.button>
          </Link>
          
          <motion.button
            className="clay-button !bg-secondary-light !text-foreground"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExportCSV(filteredPatients)}
          >
            <FaFileExport className="mr-2" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          className="clay-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm uppercase text-gray-500 mb-1">Total Patients</h3>
          <p className="text-3xl font-bold text-primary">{patients.length}</p>
        </motion.div>
        
        <motion.div 
          className="clay-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm uppercase text-gray-500 mb-1">Active Treatments</h3>
          <p className="text-3xl font-bold text-secondary">{Math.floor(patients.length * 0.6)}</p>
        </motion.div>
        
        <motion.div 
          className="clay-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm uppercase text-gray-500 mb-1">New This Month</h3>
          <p className="text-3xl font-bold text-accent">{Math.floor(patients.length * 0.2)}</p>
        </motion.div>
      </div>
      
      {loading ? (
        // Loading skeleton
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="clay-card p-6 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-3 w-2/3">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
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
              RepositoryFactory.get('patients').getAll()
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
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <PatientCard key={patient.id} patient={patient} />
            ))
          ) : (
            <div className="col-span-full clay-card p-10 text-center">
              <h3 className="text-xl font-medium mb-2">No patients found</h3>
              <p className="text-gray-500">Try adjusting your search or add a new patient</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
