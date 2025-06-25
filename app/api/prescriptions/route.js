import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const checkupId = searchParams.get('checkupId');
  
  try {
    const prescriptionRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.PRESCRIPTION
    );
    
    let prescriptions;
    
    if (patientId) {
      prescriptions = await prescriptionRepository.getByPatientId(patientId);
    } else if (checkupId) {
      prescriptions = await prescriptionRepository.getByCheckupId(checkupId);
    } else {
      prescriptions = await prescriptionRepository.getAll();
    }
    
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('API Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}
