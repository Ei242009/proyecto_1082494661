import { NextResponse } from 'next/server';
import { readAppConfig } from '@/lib/dataService';

export async function GET(): Promise<NextResponse> {
  try {
    const appConfig = await readAppConfig();
    return NextResponse.json(appConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error reading app config';
    return NextResponse.json(
      { error: 'Failed to read app config', details: message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
