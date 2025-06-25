'use client';

import { supabase } from '@/lib/supabase';

/**
 * Helper function to check RLS policies and set appropriate ones
 */
export async function checkAndEnableRlsPublicAccess() {
  // Check storage bucket policies
  try {
    console.log('Checking storage bucket policies...');
    
    // Create a policy for the checkup-images bucket that allows all operations
    const { error: bucketPolicyError } = await supabase.storage.from('checkup-images').createBucketIfNotExists({
      public: false, // Keep the bucket non-public (we'll use signed URLs)
    });
    
    if (bucketPolicyError) {
      console.error('Error checking bucket:', bucketPolicyError);
    }
    
    // Enable public access to checkup_images table for inserts
    const { error: dbPolicyError } = await supabase.rpc('create_checkup_images_policy', {});
    
    if (dbPolicyError) {
      console.error('Error setting table policy:', dbPolicyError);
      return {
        success: false, 
        message: 'Failed to set RLS policies. Please contact administrator.',
        error: dbPolicyError
      };
    }
    
    return { 
      success: true, 
      message: 'RLS policies checked and updated successfully' 
    };
  } catch (error) {
    console.error('Error in checkAndEnableRlsPublicAccess:', error);
    return { 
      success: false, 
      message: 'Error checking RLS policies',
      error
    };
  }
}
