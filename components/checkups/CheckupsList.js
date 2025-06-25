'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import Link from 'next/link';
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

export default function CheckupsList({ patientId, procedureFilter = '', onEdit, onDelete, procedureTypes }) {
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get procedure name by code
  const getProcedureName = (code) => {
    const procedure = procedureTypes.find(p => p.code === code);
    return procedure ? procedure.name : code;
  };

  useEffect(() => {
    const fetchCheckups = async () => {
      try {
        setLoading(true);
        const checkupRepository = RepositoryFactory.getRepository(
          RepositoryFactory.REPOSITORIES.CHECKUP
        );
        
        const data = await checkupRepository.getByPatientId(patientId);
        
        // Sort by date (newest first)
        data.sort((a, b) => new Date(b.checkup_date) - new Date(a.checkup_date));
        
        setCheckups(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching checkups:', err);
        setError('Failed to load checkups');
        setLoading(false);
      }
    };

    if (patientId) {
      fetchCheckups();
    }
  }, [patientId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (err) {
      return dateString;
    }
  };
  
  // Filter checkups by procedure code if filter is active
  const filteredCheckups = procedureFilter 
    ? checkups.filter(checkup => checkup.procedure_code === procedureFilter)
    : checkups;

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
            RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.CHECKUP)
              .getByPatientId(patientId)
              .then(data => {
                data.sort((a, b) => new Date(b.checkup_date) - new Date(a.checkup_date));
                setCheckups(data);
                setLoading(false);
              })
              .catch(err => {
                console.error('Error retrying fetch:', err);
                setError('Failed to load checkups');
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
      {filteredCheckups.length === 0 ? (
        <div className="clay-card p-6 text-center">
          <p className="text-gray-500">
            {procedureFilter 
              ? `No ${getProcedureName(procedureFilter)} checkups found for this patient` 
              : 'No checkups found for this patient'}
          </p>
        </div>
      ) : (
        <motion.div 
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredCheckups.map(checkup => (
            <motion.div 
              key={checkup.id} 
              className="clay-card p-4 hover:shadow-lg transition-shadow"
              variants={item}
            >
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg text-primary">{getProcedureName(checkup.procedure_code)}</h4>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {checkup.procedure_code}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(checkup.checkup_date)}
                  </p>
                  {checkup.notes && (
                    <p className="mt-2 text-sm text-gray-700">
                      {checkup.notes}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <Link
                      href={`/checkups/${checkup.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                    <span className="text-gray-400">•</span>
                    <Link
                      href={`/checkup-images/upload?checkupId=${checkup.id}`}
                      className="text-xs flex items-center gap-1 text-green-600 hover:underline"
                    >
                      <FaImage className="text-xs" /> Manage Images
                    </Link>
                  </div>
                </div>
                {(onEdit || onDelete) && (
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => onEdit(checkup)}
                        title="Edit checkup"
                      >
                        <FaEdit className="text-secondary" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => onDelete(checkup)}
                        title="Delete checkup"
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
