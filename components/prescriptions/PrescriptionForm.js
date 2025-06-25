import { useState, useEffect } from 'react';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';

/**
 * Prescription form component for creating and editing prescriptions
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial prescription data for editing (optional)
 * @param {string} props.checkupId - Checkup ID to associate the prescription with
 * @param {string} props.patientId - Patient ID to fetch associated checkups
 * @param {Function} props.onSubmit - Function called when form is submitted
 * @param {Function} props.onCancel - Function called when form is cancelled
 */
export default function PrescriptionForm({ initialData, checkupId, patientId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '',
    instructions: '',
    checkup_id: checkupId || ''
  });
  
  const [checkups, setCheckups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form with initial data if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        medicine_name: initialData.medicine_name || '',
        dosage: initialData.dosage || '',
        instructions: initialData.instructions || '',
        checkup_id: initialData.checkup_id || checkupId || ''
      });
    } else if (checkupId) {
      setFormData(prev => ({ ...prev, checkup_id: checkupId }));
    }
    
    // Fetch checkups if we have a patientId
    if (patientId) {
      fetchCheckups(patientId);
    }
  }, [initialData, checkupId, patientId]);
  
  // Fetch checkups for a patient
  const fetchCheckups = async (pid) => {
    try {
      setLoading(true);
      const checkupRepository = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.CHECKUP
      );
      
      const data = await checkupRepository.getByPatientId(pid);
      setCheckups(data || []);
    } catch (err) {
      console.error('Error fetching checkups:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[PrescriptionForm] Form submission started');
    console.log('[PrescriptionForm] Form data:', formData);
    setIsSubmitting(true);
    setError(null);
    
    // Basic form validation - only medicine name and dosage are required
    if (!formData.medicine_name || !formData.dosage) {
      console.log('[PrescriptionForm] Validation failed: missing required fields');
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Make a copy of the form data to submit
      const dataToSubmit = {...formData};
      
      // If checkup_id is empty string, set it to null to prevent validation errors
      if (!dataToSubmit.checkup_id) {
        console.log('[PrescriptionForm] Empty checkup_id set to null');
        dataToSubmit.checkup_id = null;
      }
      
      console.log('[PrescriptionForm] Calling onSubmit with data:', dataToSubmit);
      await onSubmit(dataToSubmit);
      console.log('[PrescriptionForm] Form submission successful');
    } catch (err) {
      console.error('[PrescriptionForm] Error submitting prescription:', err);
      setError(err.message || 'An error occurred saving the prescription.');
    }
    
    setIsSubmitting(false);
    console.log('[PrescriptionForm] Form submission process completed');
  };
  
  return (
    <div className="bg-white shadow-md rounded p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Edit Prescription' : 'New Prescription'}
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="medicine_name">
            Medicine Name *
          </label>
          <input
            id="medicine_name"
            name="medicine_name"
            type="text"
            value={formData.medicine_name}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter medicine name"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dosage">
            Dosage *
          </label>
          <input
            id="dosage"
            name="dosage"
            type="text"
            value={formData.dosage}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 1 tablet twice daily"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="instructions">
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Additional instructions for the patient"
            rows="3"
          />
        </div>
        
        {/* Checkup selection dropdown - only show if we have patientId */}
        {patientId && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="checkup_id">
              Associated Checkup (Optional)
            </label>
            {loading ? (
              <div className="py-2">Loading checkups...</div>
            ) : checkups.length > 0 ? (
              <select
                id="checkup_id"
                name="checkup_id"
                value={formData.checkup_id || ''}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Select a checkup (optional) --</option>
                {checkups.map((checkup) => (
                  <option key={checkup.id} value={checkup.id}>
                    {new Date(checkup.checkup_date).toLocaleDateString()} - {checkup.notes?.substring(0, 30) || checkup.procedure_code || 'Checkup'}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-gray-500 italic">No checkups available for this patient</div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Prescription' : 'Add Prescription')}
          </button>
        </div>
      </form>
    </div>
  );
}
