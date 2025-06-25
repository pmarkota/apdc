import { RepositoryFactory } from '@/lib/repositories/repository-factory';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const id = searchParams.get('id');
  
  try {
    const checkupRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.CHECKUP
    );
    
    // Get by ID
    if (id) {
      const checkup = await checkupRepository.getById(id);
      if (!checkup) {
        return NextResponse.json(
          { error: 'Checkup not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(checkup);
    }
    
    // Get by patient ID
    if (patientId) {
      const checkups = await checkupRepository.getByPatientId(patientId);
      return NextResponse.json(checkups);
    }
    
    // Get all
    const checkups = await checkupRepository.getAll();
    return NextResponse.json(checkups);
  } catch (error) {
    console.error('API Error fetching checkups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checkups' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.patient_id || !data.procedure_code || !data.checkup_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const checkupRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.CHECKUP
    );
    
    const newCheckup = await checkupRepository.create(data);
    
    return NextResponse.json(newCheckup, { status: 201 });
  } catch (error) {
    console.error('API Error creating checkup:', error);
    return NextResponse.json(
      { error: 'Failed to create checkup' },
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
        { error: 'Checkup ID is required' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.procedure_code || !data.checkup_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const checkupRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.CHECKUP
    );
    
    // Check if checkup exists
    const existingCheckup = await checkupRepository.getById(id);
    if (!existingCheckup) {
      return NextResponse.json(
        { error: 'Checkup not found' },
        { status: 404 }
      );
    }
    
    const updatedCheckup = await checkupRepository.update(id, data);
    
    return NextResponse.json(updatedCheckup);
  } catch (error) {
    console.error('API Error updating checkup:', error);
    return NextResponse.json(
      { error: 'Failed to update checkup' },
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
        { error: 'Checkup ID is required' },
        { status: 400 }
      );
    }
    
    const checkupRepository = RepositoryFactory.getRepository(
      RepositoryFactory.REPOSITORIES.CHECKUP
    );
    
    // Check if checkup exists
    const existingCheckup = await checkupRepository.getById(id);
    if (!existingCheckup) {
      return NextResponse.json(
        { error: 'Checkup not found' },
        { status: 404 }
      );
    }
    
    await checkupRepository.delete(id);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('API Error deleting checkup:', error);
    return NextResponse.json(
      { error: 'Failed to delete checkup' },
      { status: 500 }
    );
  }
}
