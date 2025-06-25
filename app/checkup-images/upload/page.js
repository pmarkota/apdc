'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '../../../components/checkup-images/ImageUpload';
import ImageGallery from '../../../components/checkup-images/ImageGallery';
import { RepositoryFactory } from '../../../lib/repositories/repository-factory';

/**
 * Page for uploading and managing images for a specific checkup
 */
export default function UploadCheckupImagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkupId = searchParams.get('checkupId');
  
  const [checkup, setCheckup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshGallery, setRefreshGallery] = useState(false);
  
  useEffect(() => {
    if (!checkupId) {
      setError('Checkup ID is required');
      setLoading(false);
      return;
    }
    
    loadCheckup();
  }, [checkupId]);
  
  const loadCheckup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const checkupRepo = RepositoryFactory.getRepository(
        RepositoryFactory.REPOSITORIES.CHECKUP
      );
      
      const checkupData = await checkupRepo.getById(checkupId);
      setCheckup(checkupData);
    } catch (error) {
      console.error('Error loading checkup:', error);
      setError('Failed to load checkup details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadSuccess = () => {
    // Toggle refresh trigger to reload the gallery
    setRefreshGallery(prev => !prev);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading checkup details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !checkupId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error || 'Missing checkup ID'}</p>
        </div>
        <div className="flex justify-start">
          <Link 
            href="/checkups"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Checkups
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upload Images</h1>
        <Link 
          href={`/checkups/${checkupId}`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Back to Checkup
        </Link>
      </div>
      
      {checkup && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium mb-2">Checkup Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Date:</p>
              <p className="font-medium">{new Date(checkup.checkup_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Procedure:</p>
              <p className="font-medium">{checkup.procedure_code}</p>
            </div>
            {checkup.description && (
              <div className="col-span-2">
                <p className="text-gray-600">Description:</p>
                <p className="font-medium">{checkup.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium mb-4">Upload New Images</h2>
        <ImageUpload 
          checkupId={checkupId}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Uploaded Images</h2>
        <ImageGallery 
          checkupId={checkupId}
          refreshTrigger={refreshGallery}
          onImageDeleted={handleUploadSuccess}
        />
      </div>
    </div>
  );
}
