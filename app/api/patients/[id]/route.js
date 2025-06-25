import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { NextResponse } from 'next/server';

// Get a specific patient by ID
export async function GET(request, { params }) {
  const id = params.id;
  
  try {
    const patientRepository = RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT);
    const patient = await patientRepository.getById(id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error(`API Error fetching patient ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// Update a patient
export async function PUT(request, { params }) {
  const id = params.id;
  
  try {
    const data = await request.json();
    const patientRepository = RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT);
    
    // Check if patient exists
    const existingPatient = await patientRepository.getById(id);
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Update patient
    const updatedPatient = await patientRepository.update(id, data);
    return NextResponse.json(updatedPatient);
  } catch (error) {
    console.error(`API Error updating patient ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// Delete a patient
export async function DELETE(request, { params }) {
  const id = params.id;
  
  try {
    const patientRepository = RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT);
    
    // Check if patient exists
    const existingPatient = await patientRepository.getById(id);
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Delete patient
    await patientRepository.delete(id);
    return NextResponse.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error(`API Error deleting patient ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
