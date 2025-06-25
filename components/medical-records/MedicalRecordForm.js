'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes } from 'react-icons/fa';
import { RepositoryFactory } from '@/lib/repositories/repository-factory';

export default function MedicalRecordForm({ patientId, record = null, onSave, onCancel }) {
  // Initialize form state with record data or defaults
  const [formData, setFormData] = useState({
    disease_name: '',
    illness_start: '',
    illness_end: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Populate form with record data when editing
  useEffect(() => {
    if (record) {
      setFormData({
        disease_name: record.disease_name || '',
        illness_start: record.illness_start ? record.illness_start.split('T')[0] : '',
        illness_end: record.illness_end ? record.illness_end.split('T')[0] : ''
      });
    }
  }, [record]);
  
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
    
    if (!formData.disease_name.trim()) {
      newErrors.disease_name = 'Disease name is required';
    }
    
    if (!formData.illness_start) {
      newErrors.illness_start = 'Start date is required';
    }
    
    if (formData.illness_end && new Date(formData.illness_end) < new Date(formData.illness_start)) {
      newErrors.illness_end = 'End date cannot be before start date';
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
      const medicalRecordRepository = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.MEDICAL_RECORD
      );
      
      const medicalRecordData = {
        ...formData,
        patient_id: patientId,
        // Only include illness_end if it's not empty
        ...(formData.illness_end ? {} : { illness_end: null })
      };
      
      let savedRecord;
      
      if (record) {
        // Update existing record
        savedRecord = await medicalRecordRepository.update(record.id, medicalRecordData);
      } else {
        // Create new record
        savedRecord = await medicalRecordRepository.create(medicalRecordData);
      }
      
      setLoading(false);
      onSave(savedRecord);
    } catch (error) {
      console.error('Error saving medical record:', error);
      setErrors({ 
        submit: 'Failed to save medical record. Please try again.' 
      });
      setLoading(false);
    }
  };
  
  return (
    <div className="clay-card p-6">
      <h2 className="text-xl font-bold mb-4">
        {record ? 'Edit Medical Record' : 'Add New Medical Record'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Disease Name */}
        <div>
          <label htmlFor="disease_name" className="block text-sm font-medium mb-1">
            Disease Name*
          </label>
          <input
            id="disease_name"
            name="disease_name"
            type="text"
            className={`w-full p-2 border rounded-md ${errors.disease_name ? 'border-error' : 'border-gray-300'}`}
            value={formData.disease_name}
            onChange={handleChange}
            placeholder="e.g. Influenza, Type A"
          />
          {errors.disease_name && (
            <p className="mt-1 text-sm text-error">{errors.disease_name}</p>
          )}
        </div>
        
        {/* Start Date */}
        <div>
          <label htmlFor="illness_start" className="block text-sm font-medium mb-1">
            Start Date*
          </label>
          <input
            id="illness_start"
            name="illness_start"
            type="date"
            className={`w-full p-2 border rounded-md ${errors.illness_start ? 'border-error' : 'border-gray-300'}`}
            value={formData.illness_start}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.illness_start && (
            <p className="mt-1 text-sm text-error">{errors.illness_start}</p>
          )}
        </div>
        
        {/* End Date (Optional) */}
        <div>
          <label htmlFor="illness_end" className="block text-sm font-medium mb-1">
            End Date <span className="text-gray-500 text-xs">(Leave blank if ongoing)</span>
          </label>
          <input
            id="illness_end"
            name="illness_end"
            type="date"
            className={`w-full p-2 border rounded-md ${errors.illness_end ? 'border-error' : 'border-gray-300'}`}
            value={formData.illness_end}
            onChange={handleChange}
            min={formData.illness_start}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.illness_end && (
            <p className="mt-1 text-sm text-error">{errors.illness_end}</p>
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
            <FaSave className="mr-1" /> {loading ? 'Saving...' : 'Save Record'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
