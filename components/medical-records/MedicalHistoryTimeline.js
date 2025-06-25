'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';

export default function MedicalHistoryTimeline({ patientId }) {
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
        
        // Sort by start date (most recent first)
        const sortedData = [...data].sort(
          (a, b) => new Date(b.illness_start) - new Date(a.illness_start)
        );
        
        setRecords(sortedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching medical records for timeline:', err);
        setError('Failed to load medical history timeline');
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

  if (loading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex animate-pulse">
            <div className="mr-4 w-4 h-4 bg-gray-200 rounded-full mt-1"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
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
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="clay-card p-4 mt-4 text-center text-gray-500">
        <p>No medical history available for this patient</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4">Medical History Timeline</h3>
      
      <div className="relative border-l-2 border-primary/30 pl-6 ml-2 space-y-6">
        {records.map((record, index) => (
          <motion.div 
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-9 mt-1.5 w-4 h-4 rounded-full bg-primary border-2 border-white shadow"></div>
            
            {/* Timeline content */}
            <div className="clay-card p-4 hover:shadow-lg transition-shadow">
              <h4 className="font-bold text-lg text-primary">{record.disease_name}</h4>
              <p className="text-sm text-gray-600">
                {formatDate(record.illness_start)} - {formatDate(record.illness_end)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
