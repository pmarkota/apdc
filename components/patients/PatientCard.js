'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { FaEdit, FaTrash, FaFileMedical } from 'react-icons/fa';

// Helper function to format dates safely
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Not specified' : date.toLocaleDateString();
};

export default function PatientCard({ patient }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="clay-card p-6 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        y: -10,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-primary mb-1">
            {patient.first_name} {patient.last_name}
          </h3>
          <div className="text-sm text-foreground opacity-80 mb-4">
            ID: {patient.personal_id}
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-xs uppercase text-gray-500">Birth Date</div>
              <div className="font-medium">{formatDate(patient.birth_date)}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500">Sex</div>
              <div className="font-medium">{patient.sex === 'M' ? 'Male' : 'Female'}</div>
            </div>
          </div>
          {patient.insurance_number && (
            <div className="mt-1">
              <div className="text-xs uppercase text-gray-500">Insurance #</div>
              <div className="font-medium">{patient.insurance_number}</div>
            </div>
          )}
        </div>
        
        {/* Patient photo or avatar */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{
            backgroundColor: 'var(--primary-light)',
            color: 'white',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {patient.first_name[0]}{patient.last_name[0]}
        </div>
      </div>
      
      {/* Actions */}
      <motion.div 
        className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/patients/${patient.id}`} className="text-sm text-primary font-medium">
          View Details
        </Link>
      </motion.div>
    </motion.div>
  );
}
