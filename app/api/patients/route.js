import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { NextResponse } from 'next/server';

// Get all patients
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  
  try {
    const patientRepository = RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT);
    
    let patients;
    if (search) {
      // If a search parameter is provided, use it to filter patients
      patients = await patientRepository.search(search);
    } else {
      patients = await patientRepository.getAll();
    }
    
    return NextResponse.json(patients);
  } catch (error) {
    console.error('API Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// Create a new patient
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.first_name || !data.last_name || !data.personal_id || !data.birth_date || !data.sex) {
      return NextResponse.json(
        { error: 'Missing required patient fields' },
        { status: 400 }
      );
    }
    
    const patientRepository = RepositoryFactory.getRepository(RepositoryFactory.REPOSITORIES.PATIENT);
    const newPatient = await patientRepository.create(data);
    
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error('API Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
