import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';

/**
 * Prescriptions list component that displays prescriptions for a checkup or patient
 * @param {Object} props - Component props
 * @param {string} props.checkupId - Checkup ID to filter prescriptions by (optional)
 * @param {string} props.patientId - Patient ID to filter prescriptions by (optional)
 * @param {boolean} props.showAddButton - Whether to show the add button (default: true)
 * @param {Function} props.onAddClick - Function called when add button is clicked
 * @param {Function} props.onEditClick - Function called when edit button is clicked
 * @param {Function} props.onDeleteClick - Function called when delete button is clicked
 */
export default function PrescriptionsList({ 
  checkupId, 
  patientId, 
  showAddButton = true, 
  onAddClick,
  onEditClick,
  onDeleteClick 
}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [checkupDetails, setCheckupDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Animation variants for list items
  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };
  
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        
        if (checkupId) {
          queryParams.append('checkupId', checkupId);
        } else if (patientId) {
          queryParams.append('patientId', patientId);
        }
        
        const response = await fetch(`/api/prescriptions?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch prescriptions');
        }
        
        const data = await response.json();
        setPrescriptions(data);
        
        // If we have prescriptions with checkup_ids, fetch their details
        const uniqueCheckupIds = [...new Set(data.filter(p => p.checkup_id).map(p => p.checkup_id))];
        if (uniqueCheckupIds.length > 0) {
          fetchCheckupDetails(uniqueCheckupIds);
        }
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
        setError('Failed to load prescriptions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCheckupDetails = async (checkupIds) => {
      try {
        const checkupRepo = RepositoryFactory.getRepository(
          RepositoryFactory.REPOSITORIES.CHECKUP
        );
        
        const checkupDetailsMap = {};
        
        for (const id of checkupIds) {
          try {
            const checkup = await checkupRepo.getById(id);
            checkupDetailsMap[id] = checkup;
          } catch (err) {
            console.error(`Error fetching checkup ${id}:`, err);
          }
        }
        
        setCheckupDetails(checkupDetailsMap);
      } catch (err) {
        console.error('Error fetching checkup details:', err);
      }
    };
    
    fetchPrescriptions();
  }, [checkupId, patientId]);
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 p-4 rounded-lg h-16"></div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }
  
  return (
    <div>
      {prescriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No prescriptions found</p>
          {showAddButton && onAddClick && (
            <button
              onClick={onAddClick}
              className="mt-4 clay-button"
            >
              Add First Prescription
            </button>
          )}
        </div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {prescriptions.map((prescription) => (
            <motion.div
              key={prescription.id}
              variants={itemVariants}
              className="clay-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-lg">{prescription.medicine_name}</h4>
                  <p className="text-sm text-gray-600 font-medium">Dosage: {prescription.dosage}</p>
                  <p className="text-sm text-gray-700 mt-2">{prescription.instructions || "No specific instructions"}</p>
                  
                  {prescription.checkup_id && checkupDetails[prescription.checkup_id] && (
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <FaClock className="mr-1" />
                      <span>From checkup on {new Date(checkupDetails[prescription.checkup_id].checkup_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {onEditClick && (
                    <button
                      onClick={() => onEditClick(prescription)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      aria-label="Edit prescription"
                    >
                      <FaEdit />
                    </button>
                  )}
                  {onDeleteClick && (
                    <button
                      onClick={() => onDeleteClick(prescription)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Delete prescription"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
