import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API endpoint that returns migration history
 * 
 * GET /api/migrations/history
 * Returns a list of all migrations that have been applied
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('migration_history')
      .select('*')
      .order('applied_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch migration history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch migration history' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Migration history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
