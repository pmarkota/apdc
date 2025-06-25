import { supabase } from '../supabase';
import {
  BaseRepository,
  PatientRepository,
  MedicalRecordRepository,
  CheckupRepository,
  PrescriptionRepository,
  CheckupImageRepository
} from './repository-interfaces';

/**
 * Supabase implementation of Patient Repository
 */
export class SupabasePatientRepository extends PatientRepository {
  constructor() {
    super();
    this.tableName = 'patients';
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: newPatient, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newPatient;
  }

  async update(id, data) {
    const { data: updatedPatient, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedPatient;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async searchByName(name) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
    
    if (error) throw error;
    return data;
  }
}

/**
 * Supabase implementation of Medical Record Repository
 */
export class SupabaseMedicalRecordRepository extends MedicalRecordRepository {
  constructor() {
    super();
    this.tableName = 'medical_records';
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: newRecord, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newRecord;
  }

  async update(id, data) {
    const { data: updatedRecord, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedRecord;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByPatientId(patientId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('patient_id', patientId);
    
    if (error) throw error;
    return data;
  }
}

/**
 * Supabase implementation of Checkup Repository
 */
export class SupabaseCheckupRepository extends CheckupRepository {
  constructor() {
    super();
    this.tableName = 'checkups';
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: newCheckup, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newCheckup;
  }

  async update(id, data) {
    const { data: updatedCheckup, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedCheckup;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByPatientId(patientId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('patient_id', patientId);
    
    if (error) throw error;
    return data;
  }

  async getWithPrescriptions(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(`
        *,
        prescriptions (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Supabase implementation of Prescription Repository
 */
export class SupabasePrescriptionRepository extends PrescriptionRepository {
  constructor() {
    super();
    this.tableName = 'prescriptions';
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data) {
    console.log('[SupabasePrescriptionRepository] create method called with data:', data);
    console.log('[SupabasePrescriptionRepository] Attempting to insert into table:', this.tableName);
    
    try {
      const { data: newPrescription, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error('[SupabasePrescriptionRepository] Error during insert:', error);
        throw error;
      }
      
      console.log('[SupabasePrescriptionRepository] Insert successful, returned data:', newPrescription);
      return newPrescription;
    } catch (err) {
      console.error('[SupabasePrescriptionRepository] Exception during create:', err);
      throw err;
    }
  }

  async update(id, data) {
    const { data: updatedPrescription, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedPrescription;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByCheckupId(checkupId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('checkup_id', checkupId);
    
    if (error) throw error;
    return data;
  }
  
  async getByPatientId(patientId) {
    // First, get all checkups for the patient
    const { data: checkups, error: checkupsError } = await supabase
      .from('checkups')
      .select('id')
      .eq('patient_id', patientId);
    
    if (checkupsError) throw checkupsError;
    
    if (!checkups || checkups.length === 0) {
      // If no checkups found, return empty array
      return [];
    }
    
    // Extract checkup IDs
    const checkupIds = checkups.map(checkup => checkup.id);
    
    // Get prescriptions for these checkups
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .in('checkup_id', checkupIds);
    
    if (error) throw error;
    return data;
  }
}

/**
 * Supabase implementation of Checkup Image Repository
 */
export class SupabaseCheckupImageRepository extends CheckupImageRepository {
  constructor() {
    super();
    this.tableName = 'checkup_images';
    this.bucketName = 'checkup-images';
  }

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: newImage, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return newImage;
  }

  async update(id, data) {
    const { data: updatedImage, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return updatedImage;
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getByCheckupId(checkupId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('checkup_id', checkupId);
    
    if (error) throw error;
    return data;
  }

  async uploadImage(checkupId, file) {
    // Generate a unique file name
    const fileName = `${checkupId}_${Date.now()}_${file.name}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.bucketName)
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);
    
    // Create a record in the checkup_images table
    const imageData = {
      checkup_id: checkupId,
      file_url: publicUrl,
    };
    
    const { data: imageRecord, error } = await supabase
      .from(this.tableName)
      .insert(imageData)
      .select()
      .single();
    
    if (error) throw error;
    return imageRecord;
  }
}
