/**
 * Base repository interface
 * Defines the common operations to be implemented by all repositories
 */
export class BaseRepository {
  /**
   * Get all records
   * @returns {Promise<Array>}
   */
  async getAll() {
    throw new Error('Method not implemented');
  }

  /**
   * Get record by id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Create a new record
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('Method not implemented');
  }

  /**
   * Update a record
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a record
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}

/**
 * Patient repository interface
 * Extends base repository with patient-specific operations
 */
export class PatientRepository extends BaseRepository {
  /**
   * Search patients by name
   * @param {string} name
   * @returns {Promise<Array>}
   */
  async searchByName(name) {
    throw new Error('Method not implemented');
  }
}

/**
 * Medical record repository interface
 * Extends base repository with medical record-specific operations
 */
export class MedicalRecordRepository extends BaseRepository {
  /**
   * Get medical records by patient id
   * @param {string} patientId
   * @returns {Promise<Array>}
   */
  async getByPatientId(patientId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Checkup repository interface
 * Extends base repository with checkup-specific operations
 */
export class CheckupRepository extends BaseRepository {
  /**
   * Get checkups by patient id
   * @param {string} patientId
   * @returns {Promise<Array>}
   */
  async getByPatientId(patientId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get checkups with prescriptions by id
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getWithPrescriptions(id) {
    throw new Error('Method not implemented');
  }
}

/**
 * Prescription repository interface
 * Extends base repository with prescription-specific operations
 */
export class PrescriptionRepository extends BaseRepository {
  /**
   * Get prescriptions by checkup id
   * @param {string} checkupId
   * @returns {Promise<Array>}
   */
  async getByCheckupId(checkupId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get prescriptions by patient id
   * @param {string} patientId
   * @returns {Promise<Array>}
   */
  async getByPatientId(patientId) {
    throw new Error('Method not implemented');
  }
}

/**
 * Checkup image repository interface
 * Extends base repository with checkup image-specific operations
 */
export class CheckupImageRepository extends BaseRepository {
  /**
   * Get images by checkup id
   * @param {string} checkupId
   * @returns {Promise<Array>}
   */
  async getByCheckupId(checkupId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Upload a new image
   * @param {string} checkupId
   * @param {File} file
   * @returns {Promise<Object>}
   */
  async uploadImage(checkupId, file) {
    throw new Error('Method not implemented');
  }
}
