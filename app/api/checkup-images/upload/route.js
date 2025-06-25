import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { RepositoryFactory } from '../../../../lib/repositories/repository-factory';

// Create a Supabase client with admin privileges
// This bypasses RLS policies for this specific API route
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * API route for uploading images to a checkup
 * Handles multipart/form-data with image file and attaches it to the specified checkup
 */
export async function POST(request) {
  try {
    // Get the checkup ID from the query parameter
    const { searchParams } = new URL(request.url);
    const checkupId = searchParams.get('checkupId');
    
    if (!checkupId) {
      return NextResponse.json(
        { error: 'Checkup ID is required' }, 
        { status: 400 }
      );
    }
    
    // Parse the multipart form data to extract the file
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      );
    }
    
    // Validate file type (must be an image)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' }, 
        { status: 400 }
      );
    }
    
    // Get the file content as array buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Generate a unique filename with the original file extension
    const fileName = `${checkupId}/${Date.now()}_${file.name}`;
    
    // Upload the file to Supabase Storage using admin client to bypass RLS
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('checkup-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' }, 
        { status: 500 }
      );
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('checkup-images')
      .getPublicUrl(fileName);
    
    // Create a record directly in the checkup_images table using admin client
    const { data: imageRecord, error: dbError } = await supabaseAdmin
      .from('checkup_images')
      .insert({
        checkup_id: checkupId,
        file_url: publicUrl,
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (dbError) {
      console.error('Error creating image record:', dbError);
      return NextResponse.json(
        { error: 'Failed to save image metadata' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl
      },
      image: imageRecord
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Failed to process the file upload request', details: error.message }, 
      { status: 500 }
    );
  }
}
