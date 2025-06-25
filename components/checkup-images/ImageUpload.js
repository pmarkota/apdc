import { useState, useRef } from 'react';
import { RepositoryFactory } from '../../lib/repositories/repository-factory';

/**
 * Image Upload Component
 * Provides drag-and-drop and file selection functionality for uploading images
 * @param {Object} props
 * @param {string} props.checkupId - ID of the checkup to associate images with
 * @param {Function} props.onUploadSuccess - Callback function after successful upload
 */
const ImageUpload = ({ checkupId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = async (files) => {
    try {
      setError(null);
      setIsUploading(true);
      
      // Convert FileList to array
      const fileArray = Array.from(files);
      
      // Validate file types (only images are allowed)
      const validFiles = fileArray.filter(file => {
        const isValid = file.type.startsWith('image/');
        if (!isValid) {
          setError(`File ${file.name} is not an image`);
        }
        return isValid;
      });
      
      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }
      
      // Upload each file
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setProgress(Math.round((i / validFiles.length) * 100));
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload file using API endpoint
        const response = await fetch(`/api/checkup-images/upload?checkupId=${checkupId}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload image');
        }
      }
      
      // All files uploaded successfully
      setProgress(100);
      setIsUploading(false);
      
      // Call the callback to refresh images list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      setError(error.message || 'Failed to upload images');
      setIsUploading(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div 
        className={`border-2 border-dashed p-8 text-center rounded-lg cursor-pointer transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInput} 
          accept="image/*"
          multiple
          className="hidden" 
        />
        
        <div className="space-y-2">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <div className="text-sm text-gray-600">
            <label className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition">
              Upload images
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
      
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-center mt-1 text-gray-500">
            Uploading... {progress}%
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
