import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const id = searchParams.get('id');
  
  try {
    const medicalRecordRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.MEDICAL_RECORD
    );
    
    let medicalRecords;
    
    // If id is provided, get a specific medical record
    if (id) {
      medicalRecords = await medicalRecordRepository.getById(id);
      return NextResponse.json(medicalRecords);
    }
    
    // If patientId is provided, get medical records for that patient
    if (patientId) {
      medicalRecords = await medicalRecordRepository.getByPatientId(patientId);
    } else {
      medicalRecords = await medicalRecordRepository.getAll();
    }
    
    return NextResponse.json(medicalRecords);
  } catch (error) {
    console.error('API Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.disease_name || !data.illness_start || !data.patient_id) {
      return NextResponse.json(
        { error: 'Missing required fields: disease_name, illness_start, patient_id' },
        { status: 400 }
      );
    }
    
    const medicalRecordRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.MEDICAL_RECORD
    );
    
    const newRecord = await medicalRecordRepository.create(data);
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('API Error creating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing record ID' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.disease_name || !data.illness_start) {
      return NextResponse.json(
        { error: 'Missing required fields: disease_name, illness_start' },
        { status: 400 }
      );
    }
    
    const medicalRecordRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.MEDICAL_RECORD
    );
    
    const updatedRecord = await medicalRecordRepository.update(id, data);
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('API Error updating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing record ID' },
        { status: 400 }
      );
    }
    
    const medicalRecordRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.MEDICAL_RECORD
    );
    
    await medicalRecordRepository.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error deleting medical record:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical record' },
      { status: 500 }
    );
  }
}
