'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes } from 'react-icons/fa';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';

export default function CheckupForm({ patientId, checkup = null, procedureTypes, onSave, onCancel }) {
  // Initialize form state with checkup data or defaults
  const [formData, setFormData] = useState({
    procedure_code: procedureTypes[0]?.code || '',
    checkup_date: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Populate form with checkup data when editing
  useEffect(() => {
    if (checkup) {
      setFormData({
        procedure_code: checkup.procedure_code || procedureTypes[0]?.code || '',
        checkup_date: checkup.checkup_date ? new Date(checkup.checkup_date).toISOString().slice(0, 16) : '',
        notes: checkup.notes || ''
      });
    } else {
      // Set current datetime as default for new checkups
      setFormData(prev => ({
        ...prev,
        checkup_date: new Date().toISOString().slice(0, 16)
      }));
    }
  }, [checkup, procedureTypes]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors for this field when user changes it
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.procedure_code) {
      newErrors.procedure_code = 'Procedure type is required';
    }
    
    if (!formData.checkup_date) {
      newErrors.checkup_date = 'Date and time is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const checkupRepository = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.CHECKUP
      );
      
      const checkupData = {
        ...formData,
        patient_id: patientId
      };
      
      let savedCheckup;
      
      if (checkup) {
        // Update existing checkup
        savedCheckup = await checkupRepository.update(checkup.id, checkupData);
      } else {
        // Create new checkup
        savedCheckup = await checkupRepository.create(checkupData);
      }
      
      setLoading(false);
      onSave(savedCheckup);
    } catch (error) {
      console.error('Error saving checkup:', error);
      setErrors({ 
        submit: 'Failed to save checkup. Please try again.' 
      });
      setLoading(false);
    }
  };
  
  return (
    <div className="clay-card p-6">
      <h2 className="text-xl font-bold mb-4">
        {checkup ? 'Edit Checkup' : 'Add New Checkup'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Procedure Type */}
        <div>
          <label htmlFor="procedure_code" className="block text-sm font-medium mb-1">
            Procedure Type*
          </label>
          <select
            id="procedure_code"
            name="procedure_code"
            className={`w-full p-2 border rounded-md ${errors.procedure_code ? 'border-error' : 'border-gray-300'}`}
            value={formData.procedure_code}
            onChange={handleChange}
          >
            {procedureTypes.map(type => (
              <option key={type.code} value={type.code}>{type.name}</option>
            ))}
          </select>
          {errors.procedure_code && (
            <p className="mt-1 text-sm text-error">{errors.procedure_code}</p>
          )}
        </div>
        
        {/* Checkup Date & Time */}
        <div>
          <label htmlFor="checkup_date" className="block text-sm font-medium mb-1">
            Date & Time*
          </label>
          <input
            id="checkup_date"
            name="checkup_date"
            type="datetime-local"
            className={`w-full p-2 border rounded-md ${errors.checkup_date ? 'border-error' : 'border-gray-300'}`}
            value={formData.checkup_date}
            onChange={handleChange}
            max={new Date().toISOString().slice(0, 16)}
          />
          {errors.checkup_date && (
            <p className="mt-1 text-sm text-error">{errors.checkup_date}</p>
          )}
        </div>
        
        {/* Notes (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-1">
            Notes <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="4"
            className={`w-full p-2 border rounded-md ${errors.notes ? 'border-error' : 'border-gray-300'}`}
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Add any relevant notes or observations about this checkup"
          ></textarea>
          {errors.notes && (
            <p className="mt-1 text-sm text-error">{errors.notes}</p>
          )}
        </div>
        
        {/* Error message */}
        {errors.submit && (
          <div className="bg-error/10 text-error p-3 rounded-md">
            {errors.submit}
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-2">
          <motion.button
            type="button"
            className="clay-button !bg-gray-100 text-gray-800 border border-gray-300"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            <FaTimes className="mr-1" /> Cancel
          </motion.button>
          
          <motion.button
            type="submit"
            className="clay-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            <FaSave className="mr-1" /> {loading ? 'Saving...' : 'Save Checkup'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
