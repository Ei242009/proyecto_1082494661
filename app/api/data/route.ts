import { NextResponse } from 'next/server';
import { readHomeData } from '@/lib/dataService';

export async function GET(): Promise<NextResponse> {
  try {
    const homeData = await readHomeData();
    return NextResponse.json(homeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error reading home data';
    return NextResponse.json(
      { error: 'Failed to read home data', details: message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
