import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { Truck } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromHeader(request.headers.get('authorization'));
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trucks = db.prepare('SELECT * FROM trucks WHERE status = ?').all('active') as Truck[];

    return NextResponse.json({
      trucks,
      count: trucks.length,
    });
  } catch (error) {
    console.error('Get trucks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
