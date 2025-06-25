import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Image Gallery Component
 * Displays a grid of images associated with a checkup and allows deletion
 * @param {Object} props
 * @param {string} props.checkupId - ID of the checkup
 * @param {boolean} props.refreshTrigger - Boolean value to trigger refresh
 * @param {Function} props.onImageDeleted - Callback function after image deletion
 */
const ImageGallery = ({ checkupId, refreshTrigger, onImageDeleted }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load images when the component mounts or refreshTrigger changes
  useEffect(() => {
    if (checkupId) {
      loadImages();
    }
  }, [checkupId, refreshTrigger, loadImages]);
  
  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/checkup-images/${checkupId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load images');
      }
      
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };
  
  const handleDeleteImage = async (image) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/checkup-images/${image.id}?filePath=${encodeURIComponent(image.file_url)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      
      // Remove the image from the local state
      setImages(images.filter(img => img.id !== image.id));
      
      // Close modal if the deleted image is currently being viewed
      if (selectedImage && selectedImage.id === image.id) {
        setIsModalOpen(false);
      }
      
      // Call the callback function if provided
      if (onImageDeleted) {
        onImageDeleted();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  if (loading) {
    return <div className="py-8 text-center">Loading images...</div>;
  }
  
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={loadImages}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No images have been uploaded for this checkup.
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative group border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="aspect-w-1 aspect-h-1 w-full">
              {/* Image thumbnail */}
              <div className="h-48 w-full relative cursor-pointer" onClick={() => handleImageClick(image)}>
                <Image 
                  src={image.file_url} 
                  alt={`Checkup Image ${image.id}`}
                  className="object-cover h-full w-full"
                  width={500}
                  height={384}
                  layout="responsive"
                />
              </div>
            </div>
            
            {/* Image actions overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageClick(image)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="View Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteImage(image)}
                  className="p-2 bg-white rounded-full hover:bg-red-100"
                  title="Delete Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Upload date */}
            <div className="p-2 text-xs text-gray-500">
              {new Date(image.uploaded_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Image preview modal */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full w-full mx-4">
            <button 
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <Image 
              src={selectedImage.file_url} 
              alt="Full size medical image"
              className="max-h-[80vh] mx-auto"
              width={1024}
              height={768}
              layout="responsive"
              objectFit="contain"
            />
            
            <div className="mt-4 flex justify-between items-center">
              <p className="text-white text-sm">
                Uploaded on {new Date(selectedImage.uploaded_at).toLocaleString()}
              </p>
              <button
                onClick={() => handleDeleteImage(selectedImage)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
