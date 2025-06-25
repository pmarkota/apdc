import { NextResponse } from 'next/server';
import { RepositoryFactory } from '../../../../lib/repositories/repository-factory';
import { supabase } from '../../../../lib/supabase';

/**
 * API route for getting images associated with a checkup
 * @param {Object} request - Next.js request object
 * @param {Object} params - Route parameters containing checkup ID
 * @returns {Object} JSON response with images
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Checkup ID is required' }, 
        { status: 400 }
      );
    }
    
    // Get checkup images from the repository
    const checkupImageRepo = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.CHECKUP_IMAGE
    );
    
    const images = await checkupImageRepo.getByCheckupId(id);
    
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching checkup images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' }, 
      { status: 500 }
    );
  }
}

/**
 * API route for deleting a checkup image
 * @param {Object} request - Next.js request object
 * @param {Object} params - Route parameters containing image ID
 * @returns {Object} JSON response indicating success/failure
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' }, 
        { status: 400 }
      );
    }
    
    // First get the image to get the file path before deleting it
    const checkupImageRepo = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.CHECKUP_IMAGE
    );
    
    if (filePath) {
      // Extract the filename from the URL
      const filePathParts = filePath.split('/');
      const fileName = filePathParts[filePathParts.length - 1];
      const checkupId = filePathParts[filePathParts.length - 2];
      const storagePath = `${checkupId}/${fileName}`;
      
      // Delete the file from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('checkup-images')
        .remove([storagePath]);
      
      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with deletion from database even if storage deletion fails
      }
    }
    
    // Delete the image record from the database
    await checkupImageRepo.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checkup image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' }, 
      { status: 500 }
    );
  }
}
