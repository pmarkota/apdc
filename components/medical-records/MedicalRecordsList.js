'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { format } from 'date-fns';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';

// Animation variants for list items
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function MedicalRecordsList({ patientId, onEdit, onDelete, onAdd }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        const medicalRecordRepository = RepositoryFactory.getRepository(
          RepositoryFactory.REPOSITORIES.MEDICAL_RECORD
        );
        
        const data = await medicalRecordRepository.getByPatientId(patientId);
        setRecords(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setError('Failed to load medical records');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchMedicalRecords();
    }
  }, [patientId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  // Calculate duration between start and end dates
  const calculateDuration = (startDate, endDate) => {
    if (!startDate) return '';
    if (!endDate) {
      return '(Ongoing)';
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (diffInMonths < 1) {
      const diffInDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return `(${diffInDays} days)`;
    } else if (diffInMonths < 12) {
      return `(${diffInMonths} months)`;
    } else {
      const years = Math.floor(diffInMonths / 12);
      const months = diffInMonths % 12;
      return `(${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''})`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="clay-card p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="clay-card p-4 mt-4 text-error">
        <p>{error}</p>
        <button 
          className="mt-2 clay-button"
          onClick={() => {
            setLoading(true);
            setError(null);
            RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.MEDICAL_RECORD)
              .getByPatientId(patientId)
              .then(data => {
                setRecords(data);
                setLoading(false);
              })
              .catch(err => {
                console.error('Error retrying fetch:', err);
                setError('Failed to load medical records');
                setLoading(false);
              });
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Medical Records</h3>
        {onAdd && (
          <motion.button 
            className="clay-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
          >
            <FaPlus className="mr-1" /> Add Record
          </motion.button>
        )}
      </div>
      
      {records.length === 0 ? (
        <div className="clay-card p-6 text-center">
          <p className="text-gray-500">No medical records found for this patient</p>
        </div>
      ) : (
        <motion.div 
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {records.map(record => (
            <motion.div 
              key={record.id} 
              className="clay-card p-4 hover:shadow-lg transition-shadow"
              variants={item}
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-bold text-lg text-primary">{record.disease_name}</h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(record.illness_start)} - {formatDate(record.illness_end)} {calculateDuration(record.illness_start, record.illness_end)}
                  </p>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => onEdit(record)}
                        title="Edit record"
                      >
                        <FaEdit className="text-secondary" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => onDelete(record)}
                        title="Delete record"
                      >
                        <FaTrash className="text-error" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
