import {
  SupabasePatientRepository,
  SupabaseMedicalRecordRepository,
  SupabaseCheckupRepository,
  SupabasePrescriptionRepository,
  SupabaseCheckupImageRepository
} from './supabase-repositories';

/**
 * Repository Factory for creating repository instances
 * Implements the Factory Pattern to abstract repository creation
 */
export class RepositoryFactory {
  /**
   * Repository types enum
   */
  static REPOSITORIES = {
    PATIENT: 'patient',
    MEDICAL_RECORD: 'medical_record',
    CHECKUP: 'checkup',
    PRESCRIPTION: 'prescription',
    CHECKUP_IMAGE: 'checkup_image'
  };

  /**
   * Get repository instance by type
   * @param {string} type - Repository type from REPOSITORIES enum
   * @returns {Object} - Repository instance
   */
  static getRepository(type) {
    switch (type) {
      case this.REPOSITORIES.PATIENT:
        return new SupabasePatientRepository();
      case this.REPOSITORIES.MEDICAL_RECORD:
        return new SupabaseMedicalRecordRepository();
      case this.REPOSITORIES.CHECKUP:
        return new SupabaseCheckupRepository();
      case this.REPOSITORIES.PRESCRIPTION:
        return new SupabasePrescriptionRepository();
      case this.REPOSITORIES.CHECKUP_IMAGE:
        return new SupabaseCheckupImageRepository();
      default:
        throw new Error(`Repository type not supported: ${type}`);
    }
  }
}
